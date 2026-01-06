const express = require('express');
const router = express.Router();
const loyaltyPointController = require('../controllers/loyaltyPointController');
const protect = require('../middleWares/authMiddleware');
const { authenticateAdminOrKey } = require('../middleWares/auth');

// Admin routes - protected with admin authentication
router.post('/settings', authenticateAdminOrKey, loyaltyPointController.setLoyaltyRules);
router.get('/settings', authenticateAdminOrKey, loyaltyPointController.getLoyaltyRules);
router.get('/rules', loyaltyPointController.getLoyaltyRules);

// User routes - protected with user authentication
router.post('/redeem', protect, loyaltyPointController.redeemLoyaltyPoints);

// Get user's loyalty points - protected with user authentication
router.get('/user', protect, loyaltyPointController.getUserLoyaltyPoints);

// Get user's loyalty points by userId
router.get('/user-points/:userId', loyaltyPointController.getUserLoyaltyPointsById);

// Refund loyalty points to user
router.post('/refund-points/:userId', loyaltyPointController.refundPoints);

module.exports = router;