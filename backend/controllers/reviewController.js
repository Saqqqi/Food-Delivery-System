const Review = require('../models/review');
const Product = require('../models/products');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const Sentiment = require('sentiment');
const sentiment = new Sentiment();


// Keywords for topic extraction
const topicKeywords = {
    'Food Quality': ['tasty', 'delicious', 'yummy', 'food', 'meal', 'dish', 'spicy', 'fresh', 'flavor', 'taste', 'bad taste', 'cold'],
    'Service': ['service', 'staff', 'waiter', 'polite', 'rude', 'manager', 'friendly', 'helpful'],
    'Delivery': ['delivery', 'rider', 'time', 'late', 'early', 'fast', 'slow', 'package', 'arrived'],
    'Ambiance': ['place', 'atmosphere', 'vibe', 'clean', 'dirty', 'music', 'environment']
};

const extractTopics = (text) => {
    const topics = new Set();
    const lowerText = text.toLowerCase();

    for (const [topic, keywords] of Object.entries(topicKeywords)) {
        if (keywords.some(keyword => lowerText.includes(keyword))) {
            topics.add(topic);
        }
    }
    return Array.from(topics);
};
exports.createReview = async (req, res) => {
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { productId, userId, userName, rating, comment } = req.body;

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if user has already reviewed this product
        const existingReview = await Review.findOne({ productId, userId });
        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this product' });
        }

        // Create new review
        const review = new Review({
            productId,
            userId,
            userName,
            rating,
            comment
        });

        await review.save();
        res.status(201).json({
            success: true,
            data: review,
            message: 'Review added successfully'
        });

    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Get all reviews for admin dashboard
exports.getAllReviews = async (req, res) => {
    try {
        // Get all reviews with populated product information
        const reviews = await Review.find()
            .populate('productId', 'name category price image')
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });

    } catch (error) {
        console.error('Error fetching all reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Get all reviews for a product
exports.getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Get reviews for the product
        const reviews = await Review.find({ productId }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });

    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Update a review
exports.updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;

        // Find review
        let review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check if user is the owner of the review
        if (review.userId.toString() !== req.body.userId) {
            return res.status(403).json({ message: 'You can only update your own reviews' });
        }

        // Update review
        review.rating = rating || review.rating;
        review.comment = comment || review.comment;

        await review.save();

        res.status(200).json({
            success: true,
            data: review,
            message: 'Review updated successfully'
        });

    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Delete a review
exports.deleteReview = async (req, res) => {
    try {
        const { id } = req.params;

        // Find review
        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check if user is the owner of the review or if it's an admin request
        if (req.body.userId !== 'admin' && review.userId.toString() !== req.body.userId) {
            return res.status(403).json({ message: 'You can only delete your own reviews' });
        }

        await Review.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Review deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Get public reviews with sentiment analysis
exports.getPublicReviews = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate('productId', 'name image')
            .populate('userId', 'name') // Assuming User model has 'name'
            .sort({ createdAt: -1 })
            .limit(100);

        const analyzedReviews = reviews.map(review => {
            const analysis = sentiment.analyze(review.comment);
            let sentimentLabel = 'Neutral';
            if (analysis.score > 1) sentimentLabel = 'Positive';
            if (analysis.score < -1) sentimentLabel = 'Critical';

            // Extract Topics
            const topics = extractTopics(review.comment);

            // Convert to plain object to attach new property
            const reviewObj = review.toObject();
            reviewObj.sentiment = sentimentLabel;
            reviewObj.sentimentScore = analysis.score;
            reviewObj.topics = topics; // Attach topics

            // Highlight snippets (simple implementation: find positive words)
            reviewObj.highlights = analysis.positive.slice(0, 3); // Top 3 positive words

            return reviewObj;
        });

        // Calculate stats
        const total = analyzedReviews.length;
        const positive = analyzedReviews.filter(r => r.sentiment === 'Positive').length;
        const critical = analyzedReviews.filter(r => r.sentiment === 'Critical').length;

        res.status(200).json({
            success: true,
            count: total,
            stats: {
                positivePercent: total > 0 ? Math.round((positive / total) * 100) : 0,
                criticalPercent: total > 0 ? Math.round((critical / total) * 100) : 0
            },
            data: analyzedReviews
        });

    } catch (error) {
        console.error('Error fetching public reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};