const express = require('express');
const {
    createDonation,
    getDonations,
    getDonationDetails,
    deleteDonation,
} = require('../controllers/donationController');
const { protect, admin } = require('../middleware/auth'); // Middleware for protected routes
const router = express.Router();

// Public route to create a new donation
router.post('/', createDonation);

// Admin-only routes for managing donations
router.get('/all', protect, admin, getDonations); // Get all donations
router.get('/:donationId', protect, admin, getDonationDetails); // Get details of a specific donation
router.delete('/:donationId', protect, admin, deleteDonation); // Delete a donation

module.exports = router;
