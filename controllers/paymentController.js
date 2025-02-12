const Razorpay = require("razorpay");
const crypto = require("crypto");
const Donation = require("../models/Donation");
const Member = require("../models/Member");
const razorpay = require("../config/razorpay");
const logger = require("../utils/logger"); 
// const { sequelize } = require("../config/db"); 
const { sequelize } = require("../models"); 





exports.createOrder = async (req, res) => {
    try {
        const { amount, currency = "INR", type, metadata } = req.body;
        
        // Log the request body
        logger.info("Received order creation request", { amount, currency, type, metadata });

        if (!amount || !type || !['donation', 'membership'].includes(type)) {
            logger.error("Invalid request parameters for order creation");
            return res.status(400).json({ error: "Invalid request parameters" });
        }

        const options = {
            amount: Math.round(amount * 100),
            currency,
            receipt: `receipt_${Date.now()}`,
            payment_capture: 1,
            notes: { type, ...metadata }
        };

        const order = await razorpay.orders.create(options);
        logger.info("Order created successfully", { orderId: order.id });
        res.status(201).json({ success: true, order });
    } catch (error) {
        logger.error("Error creating Razorpay order", { error: error.message });
        res.status(500).json({ error: "Failed to create order" });
    }
};

exports.verifyPayment = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
      logger.info("Verifying payment", { razorpay_order_id, razorpay_payment_id });

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
          logger.error("Missing required payment fields");
          return res.status(400).json({ error: "Invalid payment details" });
      }

      const generatedSignature = crypto
          .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
          .update(`${razorpay_order_id}|${razorpay_payment_id}`)
          .digest("hex");

      if (generatedSignature !== razorpay_signature) {
          logger.error("Payment verification failed due to signature mismatch");
          await transaction.rollback();
          return res.status(400).json({ error: "Payment verification failed" });
      }

      const order = await razorpay.orders.fetch(razorpay_order_id);
      const paymentType = order.notes?.type || '';

      if (!paymentType) throw new Error("Invalid payment type received");

      let createdRecord;
      if (paymentType === 'donation') {
          createdRecord = await Donation.create({
              amount: order.amount / 100,
              paymentMethod: 'razorpay',
              ...order.notes?.metadata || {},
              razorpayOrderId: razorpay_order_id,
              razorpayPaymentId: razorpay_payment_id
          }, { transaction });
          logger.info("Donation record created successfully", { donationId: createdRecord.id });
      } else if (paymentType === 'membership') {
          const memberData = {
              ...order.notes?.metadata || {},
              paymentMethod: 'razorpay',
              status: 'approved',
              razorpayOrderId: razorpay_order_id,
              razorpayPaymentId: razorpay_payment_id
          };

          createdRecord = await Member.create(memberData, { transaction });
          logger.info("Membership record created successfully", { memberId: createdRecord.id });
      }

      await transaction.commit();
      res.status(200).json({ success: true, message: "Payment verified successfully!", createdRecord });
  } catch (error) {
      await transaction.rollback();
      logger.error("Payment verification error", { error: error.message });
      res.status(500).json({ error: "Failed to verify payment" });
  }
};


exports.razorpayWebhook = async (req, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const receivedSignature = req.headers["x-razorpay-signature"];
    
    const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(JSON.stringify(req.body))
        .digest("hex");

    if (expectedSignature !== receivedSignature) {
        logger.error("Invalid webhook signature");
        return res.status(400).json({ error: "Invalid webhook signature" });
    }

    const { event, payload } = req.body;
    logger.info("Received webhook event", { event });

    try {
        if (event === "payment.captured") {
            const paymentId = payload.payment.entity.id;
            const orderId = payload.payment.entity.order_id;
            
            await Member.update(
                { status: "approved", razorpayPaymentId: paymentId },
                { where: { razorpayOrderId: orderId } }
            );

            logger.info("Membership status updated to approved", { orderId, paymentId });
        }

        res.status(200).json({ success: true });
    } catch (error) {
        logger.error("Webhook processing failed", { error: error.message });
        res.status(500).json({ error: "Webhook processing failed" });
    }
};
