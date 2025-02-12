const express = require('express');
const router = express.Router();
const { submitContactForm, getMessages } = require('../controllers/contactController');
const { protect, admin } = require('../middleware/auth');

// POST /api/contact - Submit contact form
router.post('/', submitContactForm);

// GET /api/contact - Get all messages (protected route for admins only)
router.get('/', protect, admin, getMessages);

module.exports = router;
