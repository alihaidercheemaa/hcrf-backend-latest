const express = require("express");
const { createOrder, verifyPayment } = require("../controllers/paymentController");
const router = express.Router();

router.post("/create-order", createOrder);
router.post("/verify", verifyPayment);
router.post("/webhook", require("../controllers/paymentController").razorpayWebhook);


module.exports = router;
