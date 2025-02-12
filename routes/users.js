const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const userController = require('../controllers/userController');

// Routes that require authentication
router.get('/profile', protect, userController.getProfile); // Authenticated user profile
router.put('/:id', protect, userController.updateUserById); // Update user by ID (authenticated)
router.delete('/:id', protect, admin, userController.deleteUserById); // Admin can delete users

// Public routes
router.get('/', protect, admin, userController.getAllUsers); // Admin can get all users
router.get('/:id', protect, admin, userController.getUserById); // Admin can get user by ID

module.exports = router;