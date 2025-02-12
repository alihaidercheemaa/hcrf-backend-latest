const express = require('express');
const { savePreOrder, getPreOrderData } = require('../controllers/preOrderController');
const { protect,admin, } = require('../middleware/auth'); 

const router = express.Router();

// POST endpoint to save pre-order
router.post('/save', protect, savePreOrder);

// GET endpoint to retrieve pre-order data for a user
router.get('/data', protect,admin, getPreOrderData);

module.exports = router;
