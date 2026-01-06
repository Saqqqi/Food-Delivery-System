const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { authenticateAdminOrKey } = require('../middleWares/auth');

// Create a coupon - Admin only
router.post('/', authenticateAdminOrKey, couponController.createCoupon);

// Get all coupons - Admin only
router.get('/', authenticateAdminOrKey, couponController.getAllCoupons);

// Get coupon by ID - Admin only
router.get('/:id', authenticateAdminOrKey, couponController.getCouponById);

// Update a coupon - Admin only
router.put('/:id', authenticateAdminOrKey, couponController.updateCoupon);

// Delete a coupon - Admin only
router.delete('/:id', authenticateAdminOrKey, couponController.deleteCoupon);

// Get all products for coupon selection - Admin only
router.get('/products/all', authenticateAdminOrKey, couponController.getAllProducts);

// Validate a coupon
router.post('/validate', couponController.validateCoupon);

// Get available coupons for users
router.post('/available', couponController.getAvailableCoupons);

module.exports = router;