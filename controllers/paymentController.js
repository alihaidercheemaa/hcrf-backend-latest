const Razorpay = require("razorpay");
const crypto = require("crypto");
const Donation = require("../models/Donation");
const Certification = require("../models/Certification");
const Member = require("../models/Member"); // Added Membership model
const razorpay = require("../config/razorpay");
const { sequelize } = require("../models");

/**
 * Create an order for Donation, Certification, or Membership
 */
exports.createOrder = async (req, res) => {
    try {
        console.log("💾 FULL Incoming createOrder Request:", JSON.stringify(req.body, null, 2));

        const { amount, currency = "INR", type, metadata } = req.body;

        if (!amount || !type || !metadata) {
            console.error("❌ Missing required fields:", JSON.stringify(req.body, null, 2));
            return res.status(400).json({ error: "Missing required fields in the request." });
        }

        // Validate metadata based on payment type
        if (type === "donation" && (!metadata.firstName || !metadata.lastName || !metadata.email || !metadata.phone)) {
            return res.status(400).json({ error: "Missing required donation fields." });
        } else if (type === "certification" && (!metadata.firstName || !metadata.lastName || !metadata.email || !metadata.phone || !metadata.certType || !metadata.certName)) {
            return res.status(400).json({ error: "Missing required certification fields." });
        } else if (type === "membership" && (!metadata.fullName || !metadata.dob || !metadata.gender || !metadata.email || !metadata.phone || !metadata.nationality)) {
            return res.status(400).json({ error: "Missing required membership fields." });
        }

        // Construct notes based on payment type
        const notes = {
            type,
            paymentMethod: metadata.paymentMethod,
        };

        // Add type-specific fields to notes
        if (type === "donation") {
            Object.assign(notes, {
                firstName: metadata.firstName,
                lastName: metadata.lastName,
                email: metadata.email,
                phone: metadata.phone,
                donationType: metadata.donationType,
                streetAddress: metadata.streetAddress,
                city: metadata.city,
                state: metadata.state,
                zip: metadata.zip,
                country: metadata.country,
                tools: metadata.tools ? JSON.stringify(metadata.tools) : "" // Store tools as string
            });
            
        } else if (type === "certification") {
            Object.assign(notes, {
                firstName: metadata.firstName,
                lastName: metadata.lastName,
                email: metadata.email,
                phone: metadata.phone,
                certType: metadata.certType,
                certName: metadata.certName,
            });
        } else if (type === "membership") {
            Object.assign(notes, {
                fullName: metadata.fullName,
                dob: metadata.dob,
                gender: metadata.gender,
                email: metadata.email,
                phone: metadata.phone,
                country: metadata.country,
                nationality: metadata.nationality,
                state: metadata.state,
                city: metadata.city,
                postalCode: metadata.postalCode,
                streetAddress: metadata.streetAddress,
                membershipType: metadata.membershipType,
            });
        }

        const options = {
            amount,
            currency,
            receipt: `receipt_${Date.now()}`,
            payment_capture: 1,
            notes,
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

        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature,
            donationDetails, // For donation-specific details
            membershipDetails // For membership-specific details
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            console.error("❌ Invalid payment details");
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

        switch(paymentType) {
            case "donation":
                createdRecord = await Donation.create({
                    amount: order.amount / 100,
                    customAmount: donationDetails?.customAmount || null,
                    donationType: metadata.donationType,
                    firstName: metadata.firstName,
                    lastName: metadata.lastName,
                    email: metadata.email,
                    phone: metadata.phone,
                    streetAddress: metadata.streetAddress,
                    city: metadata.city,
                    state: metadata.state,
                    zip: metadata.zip,
                    country: metadata.country,
                    tools: metadata.tools || "", // Ensure tools is a string
                    paymentMethod: metadata.paymentMethod,
                    razorpayOrderId: razorpay_order_id,
                    razorpayPaymentId: razorpay_payment_id,
                    status: "pending"
                }, { transaction });
                break;

            case "certification":
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
                    status: "pending"
                }, { transaction });
                break;

            case "membership":
                createdRecord = await Member.create({
                    membershipType: metadata.membershipType,
                    amount: order.amount / 100,
                    fullName: metadata.fullName,
                    dob: metadata.dob,
                    gender: metadata.gender,
                    email: metadata.email,
                    phone: metadata.phone,
                    country: metadata.country,
                    nationality: metadata.nationality,
                    state: metadata.state,
                    city: metadata.city,
                    postalCode: metadata.postalCode,
                    streetAddress: metadata.streetAddress,
                    razorpayOrderId: razorpay_order_id,
                    razorpayPaymentId: razorpay_payment_id,
                    paymentMethod: metadata.paymentMethod,
                    status: "pending"
                }, { transaction });
                break;

            default:
                console.error("❌ Invalid Payment Type:", paymentType);
                await transaction.rollback();
                return res.status(400).json({ error: "Invalid payment type" });
        }

        await transaction.commit();
        console.log("✅ Payment Verified & Record Saved:", JSON.stringify(createdRecord, null, 2));
        res.status(200).json({ 
            success: true, 
            message: "Payment verified successfully!", 
            record: createdRecord 
        });

    } catch (error) {
        await transaction.rollback();
        console.error("🔥 Error in verifyPayment:", error);
        res.status(500).json({ 
            error: "Failed to verify payment", 
            details: error.message 
        });
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
            
            // Update status based on payment type
            switch(paymentType) {
                case "donation":
                    await Donation.update(
                        { status: "approved" }, 
                        { where: { razorpayOrderId: orderId } }
                    );
                    break;
                case "certification":
                    await Certification.update(
                        { status: "approved" }, 
                        { where: { razorpayOrderId: orderId } }
                    );
                    break;
                case "membership":
                    await Member.update(
                        { status: "approved" }, 
                        { where: { razorpayOrderId: orderId } }
                    );
                    break;
                default:
                    console.error("❌ Invalid payment type in webhook:", paymentType);
            }

            console.log("✅ Payment status updated to approved");
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("🔥 Webhook processing failed:", error);
        res.status(500).json({ error: "Webhook processing failed" });
    }
};