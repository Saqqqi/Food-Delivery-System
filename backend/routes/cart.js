const express = require('express');
const cartController = require('../controllers/cartController');
const router = express.Router();

// Add product to cart
router.post('/add-product-to-cart', cartController.addProductToCart);

// Get cart for a user
router.get('/get-cart/:userId', cartController.getCart);

// Remove product from cart
router.delete('/remove-product/:userId/:product_id', cartController.removeFromCart);

// Update product quantity in cart (increment/decrement)
router.put('/update-quantity/:userId/:product_id', cartController.updateCartQuantity);

// Apply coupon to cart
router.put('/apply-coupon/:userId', cartController.applyCoupon);

// Remove coupon from cart
router.delete('/remove-coupon/:userId', cartController.removeCoupon);

// Apply loyalty points to cart
router.put('/apply-loyalty-points/:userId', cartController.applyLoyaltyPoints);

// Remove loyalty points discount from cart
router.delete('/remove-loyalty-discount/:userId', cartController.removeLoyaltyDiscount);

// Clear cart for a user
router.delete('/clear-cart/:userId', cartController.clearCart);

module.exports = router;