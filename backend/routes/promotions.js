const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionsController');

// Create a promotion
router.post('/creatpromotions', promotionController.createPromotion);

// Get all promotions
router.get('/getpromotions', promotionController.getAllPromotions);

// Get a promotion by ID
router.get('/getpromotions/:promotionId', promotionController.getPromotionById);

// Update a promotion
router.put('/updatepromotions/:promotionId', promotionController.updatePromotion);

// Delete a promotion
router.delete('/deletepromotions/:promotionId', promotionController.deletePromotion);

module.exports = router;
