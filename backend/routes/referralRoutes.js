const express = require('express');
const router = express.Router();
const referralController = require('../controllers/referralController');
const protect = require('../middleWares/authMiddleware');

// Generate a referral code for the authenticated user
router.post('/generate', protect, referralController.generateReferralCode);

// Get the referral code for the authenticated user
router.get('/my-code', protect, referralController.getMyReferralCode);

// Validate a referral code
router.get('/validate/:referralCode', referralController.validateReferralCode);

// Get referral statistics for the authenticated user
router.get('/stats', protect, referralController.getReferralStats);

module.exports = router;