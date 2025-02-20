const PreOrder = require('../models/PreOrder');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

// Email template function
const generatePreOrderEmail = (customerName, releaseDate) => {
  return `Pre-Order Confirmation – Hamadan Craft Revival Foundation E-Publication

Dear ${customerName},

Thank you for pre-ordering the digital copy of the Hamadan Craft Revival Foundation's E-Publication! 🎉

What to Expect:
✅ Delivery: Your digital copy will be sent via email upon release.
✅ Download Access: The downloadable link will be accessible only for your registered email and can be downloaded only once.
📅 Release Date: ${releaseDate}
📩 Support: If you encounter any issues, please reach us at info@hamdancraft.org.

We appreciate your support in preserving and promoting Kashmiri craftsmanship!`;
};

// Save pre-order data
exports.savePreOrder = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authorization token is required.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { userId, email, isAdmin, isMember, name } = decoded;

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

    // Send confirmation email
    const releaseDate = process.env.RELEASE_DATE || 'To be announced'; // You can set this in your environment variables
    const emailContent = generatePreOrderEmail(name || 'Valued Customer', releaseDate);
    const subject = 'Pre-Order Confirmation – Hamadan Craft Revival Foundation';
    
    await sendEmail(email, subject, emailContent);

    res.status(201).json({
      message: 'Pre-order recorded successfully. Confirmation email has been sent.',
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

module.exports = exports;