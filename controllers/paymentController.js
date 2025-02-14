const Razorpay = require("razorpay");
const crypto = require("crypto");
const Donation = require("../models/Donation");
const Member = require("../models/Member");
const Certification = require("../models/Certification");
const razorpay = require("../config/razorpay");
const { sequelize } = require("../models");

/**
 * Create an order for Donation, Membership, or Certification
 */
exports.createOrder = async (req, res) => {
    try {
        console.log("💾 FULL Incoming createOrder Request:", JSON.stringify(req.body, null, 2));

        const { amount, currency = "INR", type, metadata } = req.body;

        if (!amount || !type || !metadata || !metadata.firstName || !metadata.lastName || !metadata.email || !metadata.phone) {
            console.error("❌ Missing required fields:", JSON.stringify(req.body, null, 2));
            return res.status(400).json({ error: "Missing required fields in the request." });
        }

        // Simplify notes to avoid exceeding Razorpay's 15-field limit
        const notes = {
            type,
            firstName: metadata.firstName,
            lastName: metadata.lastName,
            email: metadata.email,
            phone: metadata.phone,
            dob: metadata.dob,
            gender: metadata.gender,
            nationality: metadata.nationality,
            membershipType: metadata.membershipType,
            address: metadata.address,
            paymentMethod: metadata.paymentMethod,
        };

        const options = {
            amount,
            currency,
            receipt: `receipt_${Date.now()}`,
            payment_capture: 1,
            notes, // Use simplified notes
        };

        console.log("🔹 Creating Razorpay order with options:", JSON.stringify(options, null, 2));

        const order = await razorpay.orders.create(options);
        console.log("✅ Razorpay Order Created:", JSON.stringify(order, null, 2));

        res.status(201).json({ success: true, order });
    } catch (error) {
        console.error("🔥 Razorpay Order Creation Error:", error);
        res.status(500).json({ error: "Failed to create order. Please try again." });
    }
};

/**
 * Verify the payment and save the record accordingly
 */
exports.verifyPayment = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        console.log("💾 FULL Incoming verifyPayment Request:", JSON.stringify(req.body, null, 2));

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            console.error("❌ Invalid payment details:", JSON.stringify(req.body, null, 2));
            return res.status(400).json({ error: "Invalid payment details" });
        }

        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        if (generatedSignature !== razorpay_signature) {
            console.error("❌ Payment verification failed: Signature mismatch");
            await transaction.rollback();
            return res.status(400).json({ error: "Payment verification failed" });
        }

        console.log("🔹 Fetching Razorpay order details...");
        const order = await razorpay.orders.fetch(razorpay_order_id);
        console.log("✅ Fetched Razorpay Order:", JSON.stringify(order, null, 2));

        if (!order) {
            console.error("❌ Order not found in Razorpay");
            await transaction.rollback();
            return res.status(400).json({ error: "Order not found" });
        }

        const paymentType = order.notes?.type;
        const metadata = order.notes || {};
        console.log("🛠 Processing Payment Type:", paymentType);
        console.log("📜 Metadata Received:", JSON.stringify(metadata, null, 2));

        let createdRecord;

        if (paymentType === "membership") {
            if (!metadata.firstName || !metadata.lastName || !metadata.dob || !metadata.gender || !metadata.nationality || !metadata.paymentMethod) {
                console.error("❌ Missing required membership details:", JSON.stringify(metadata, null, 2));
                await transaction.rollback();
                return res.status(400).json({ error: "Missing required member details" });
            }

            createdRecord = await Member.create({
                firstName: metadata.firstName,
                lastName: metadata.lastName,
                fullName: `${metadata.firstName} ${metadata.lastName}`,
                email: metadata.email,
                phone: metadata.phone,
                dob: metadata.dob,
                gender: metadata.gender,
                nationality: metadata.nationality,
                membershipType: metadata.membershipType,
                address: metadata.address,
                amountPaid: order.amount / 100,
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                paymentMethod: metadata.paymentMethod,
                status: "pending",
            }, { transaction });

        } else if (paymentType === "donation") {
            createdRecord = await Donation.create({
                donationType: metadata.donationType, // Added
                firstName: metadata.firstName,       // Added
                lastName: metadata.lastName,         // Added
                email: metadata.email,
                phone: metadata.phone,
                amount: order.amount / 100,
                message: metadata.message || null,
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                paymentMethod: metadata.paymentMethod, // Added
                status: "pending",
            }, { transaction });

        } else if (paymentType === "certification") {
            if (!metadata.certType || !metadata.certName || !metadata.paymentMethod) {
                console.error("❌ Missing required certification details:", JSON.stringify(metadata, null, 2));
                await transaction.rollback();
                return res.status(400).json({ error: "Missing required certification details" });
            }

            createdRecord = await Certification.create({
                certType: metadata.certType,
                certName: metadata.certName,
                amountPaid: order.amount / 100,
                firstName: metadata.firstName,
                lastName: metadata.lastName,
                email: metadata.email,
                phone: metadata.phone,
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                paymentMethod: metadata.paymentMethod,
                status: "pending",
            }, { transaction });

        } else {
            console.error("❌ Invalid Payment Type:", paymentType);
            await transaction.rollback();
            return res.status(400).json({ error: "Invalid payment type" });
        }

        await transaction.commit();
        console.log("✅ Payment Verified & Record Saved:", JSON.stringify(createdRecord, null, 2));
        res.status(200).json({ success: true, message: "Payment verified successfully!", createdRecord });

    } catch (error) {
        await transaction.rollback();
        console.error("🔥 Error in verifyPayment:", error);
        res.status(500).json({ error: "Failed to verify payment", details: error.message });
    }
};

/**
 * Razorpay Webhook Handler
 */
exports.razorpayWebhook = async (req, res) => {
    try {
        console.log("💾 FULL Incoming Webhook Request:", JSON.stringify(req.body, null, 2));

        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const receivedSignature = req.headers["x-razorpay-signature"];

        const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(JSON.stringify(req.body))
            .digest("hex");

        if (expectedSignature !== receivedSignature) {
            console.error("❌ Invalid webhook signature");
            return res.status(400).json({ error: "Invalid webhook signature" });
        }

        const { event, payload } = req.body;
        console.log("📢 Processing Webhook Event:", event);

        if (event === "payment.captured") {
            const orderId = payload.payment.entity.order_id;

            console.log("🔹 Fetching order details for webhook...");
            const order = await razorpay.orders.fetch(orderId);
            console.log("✅ Order fetched in webhook:", JSON.stringify(order, null, 2));

            const paymentType = order.notes?.type;

            if (paymentType === "membership") {
                await Member.update({ status: "approved" }, { where: { razorpayOrderId: orderId } });

            } else if (paymentType === "donation") {
                await Donation.update({ status: "approved" }, { where: { razorpayOrderId: orderId } });

            } else if (paymentType === "certification") {
                await Certification.update({ status: "approved" }, { where: { razorpayOrderId: orderId } });
            }

            console.log("✅ Payment status updated to approved.");
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("🔥 Webhook processing failed:", error);
        res.status(500).json({ error: "Webhook processing failed" });
    }
};