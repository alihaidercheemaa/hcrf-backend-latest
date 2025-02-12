const express = require('express');
const {
  submitBadgeApplication,
  getAllBadgeApplications,
  getBadgeApplicationById,
  deleteBadgeApplication,
} = require('../controllers/badgeApplicationController');

const upload = require('../config/multerConfig'); // Multer for file uploads
const { protect, admin } = require('../middleware/auth'); // Middleware for protected routes
const router = express.Router();

// Public route for submitting badge applications
router.post('/submit', upload.array('uploadedFiles', 5), submitBadgeApplication);

// Admin-only routes for managing badge applications
router.get('/', protect, admin, getAllBadgeApplications);
router.get('/:badgeApplicationId', protect, admin, getBadgeApplicationById);

// Badge application approval and rejection

// Delete badge application
router.delete('/:badgeApplicationId', protect, admin, deleteBadgeApplication);

module.exports = router;
