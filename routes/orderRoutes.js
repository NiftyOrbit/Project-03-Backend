const express = require('express');
const { checkout, getAllOrders, trackProgress, updateOrderStatus, trackOrders, deleteOrder } = require('../controllers/orderController');  // Import the checkout controller

const router = express.Router();

// POST route for checkout
router.post('/checkout', checkout);
router.get('/orders', getAllOrders);
router.get('/orderByEmail', trackOrders);
router.get('/orders/tracking', trackProgress );
router.put('/update', updateOrderStatus);
router.delete('/orders', deleteOrder);



module.exports = router;
