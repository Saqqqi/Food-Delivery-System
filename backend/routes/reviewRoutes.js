const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const reviewController = require('../controllers/reviewController');
const { authenticateToken, authenticateAdminOrKey } = require('../middleWares/auth');

// Get all reviews for admin dashboard
// GET /api/reviews/all
router.get('/all', authenticateAdminOrKey, reviewController.getAllReviews);

// Get public reviews (Smart Feed)
// GET /api/reviews/public
router.get('/public', reviewController.getPublicReviews);

// Create a new review
// POST /api/reviews
router.post(
    '/',
    check('productId', 'Product ID is required').not().isEmpty(),
    check('userId', 'User ID is required').not().isEmpty(),
    check('userName', 'User name is required').not().isEmpty(),
    check('rating', 'Rating is required').isInt({ min: 1, max: 5 }),
    check('comment', 'Comment is required').not().isEmpty(),
    authenticateToken,
    reviewController.createReview
);

// Get all reviews for a product
// GET /api/reviews/product/:productId
router.get('/product/:productId', reviewController.getProductReviews);

// Update a review
// PUT /api/reviews/:id
router.put(
    '/:id',
    check('rating', 'Rating must be between 1 and 5').optional().isInt({ min: 1, max: 5 }),
    check('comment', 'Comment is required').optional().not().isEmpty(),
    authenticateToken,
    reviewController.updateReview
);

// Delete a review
// DELETE /api/reviews/:id
router.delete('/:id', authenticateAdminOrKey, reviewController.deleteReview);

module.exports = router;