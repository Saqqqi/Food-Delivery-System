const express = require('express');
const authMiddleware = require('../middleWares/auth');
const orderController = require('../controllers/orderController');
const router = express.Router();

// Create a new order
router.post('/create-order', orderController.createOrder);

// Send order confirmation email
router.post('/send-email', orderController.sendOrderEmail);

// Get a specific order by ID
router.get('/get-order/:order_id', orderController.getOrder);

// Get all orders (admin-only)
router.get('/get-orders-list', orderController.getOrdersList);

// Delete an order
router.delete('/:id', orderController.deleteOrder);

// Get orders for a specific user
router.get('/user/:userId', authMiddleware.authenticateToken, orderController.getUserOrders);

router.put('/request-cancel/:orderId',
    authMiddleware.authenticateToken, orderController.cancelOrder);

router.put('/update-status/:orderId', orderController.updateOrderStatus);
// Admin-only route to view cancellation requests
router.put('/handle-cancellation/:orderId', authMiddleware.authenticateAdminOrKey, orderController.handleCancellationRequest);
module.exports = router;