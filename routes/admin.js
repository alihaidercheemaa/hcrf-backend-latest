const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth'); 

// Define routes with middleware
router.get('/users', protect, admin, adminController.getAllUsers);
router.put('/users/:userId/promote', protect, admin, adminController.promoteToAdmin);

module.exports = router;
