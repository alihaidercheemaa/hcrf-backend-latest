// Assuming savePreOrder and getPreOrderData are defined in your controller file
const PreOrder = require('../models/PreOrder');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail'); // Email utility

// Save pre-order data
exports.savePreOrder = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authorization token is required.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { userId, email, isAdmin, isMember } = decoded;

    if (!userId || !email) {
      return res.status(400).json({ error: 'User ID and email are required to save pre-order.' });
    }

    const preOrder = await PreOrder.create({
      userId,
      email,
      isAdmin,
      isMember,
      createdAt: Date.now(),
    });

    const subject = 'Pre-order Confirmation';
    const text = 'Thank you for your pre-order. We will reach out to you soon.';
    await sendEmail(email, subject, text);

    res.status(201).json({
      message: 'Pre-order recorded successfully. We will contact you soon.',
      data: preOrder,
    });
  } catch (error) {
    console.error('Error saving pre-order:', error);
    res.status(500).json({ error: 'Something went wrong, please try again later.' });
  }
};

// Fetch all pre-order data
exports.getPreOrderData = async (req, res) => {
  try {
    const preOrders = await PreOrder.findAll();

    if (preOrders.length > 0) {
      res.status(200).json(preOrders);
    } else {
      res.status(404).json({ message: 'No pre-orders found.' });
    }
  } catch (error) {
    console.error('Error fetching pre-order data:', error);
    res.status(500).json({ message: 'Error fetching pre-order data' });
  }
};
