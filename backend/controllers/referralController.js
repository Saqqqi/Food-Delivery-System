// Get the referral code for the authenticated user
exports.getMyReferralCode = async (req, res) => {
    try {
        const userId = req.user.id;
        const User = require('../models/User');
        const user = await User.findById(userId);
        if (!user || !user.referralCode) {
            return res.status(404).json({ message: 'No referral code found for this user.' });
        }
        return res.json({ referralCode: user.referralCode });
    } catch (error) {
        console.error('Error fetching referral code:', error);
        return res.status(500).json({ message: 'Failed to fetch referral code.' });
    }
};
const User = require('../models/User');
const Referral = require('../models/Referral');
const crypto = require('crypto');

// Generate a unique referral code for a user
exports.generateReferralCode = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Check if user already has a referral code
        let user = await User.findById(userId);
        if (user.referralCode) {
            // Find existing referral
            const existingReferral = await Referral.findOne({ referrer: userId, referralCode: user.referralCode });
            if (existingReferral) {
                return res.status(200).json({
                    success: true,
                    referralCode: user.referralCode,
                    referralLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/register?ref=${user.referralCode}`
                });
            }
        }
        
        // Generate a new referral code
        const referralCode = crypto.randomBytes(6).toString('hex');
        
        // Save referral code to user
        user.referralCode = referralCode;
        await user.save();
        
        // Create a new referral entry
        const newReferral = new Referral({
            referrer: userId,
            referralCode: referralCode,
            referred: []
        });
        
        await newReferral.save();
        
        return res.status(201).json({
            success: true,
            referralCode: referralCode,
            referralLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/register?ref=${referralCode}`
        });
    } catch (error) {
        console.error('Error generating referral code:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to generate referral code',
            error: error.message
        });
    }
};

// Validate a referral code
exports.validateReferralCode = async (req, res) => {
    try {
        const { referralCode } = req.params;
        
        if (!referralCode) {
            return res.status(400).json({
                success: false,
                message: 'Referral code is required'
            });
        }
        
        // Find the referral
        const referral = await Referral.findOne({ referralCode }).populate('referrer', 'name email');
        
        if (!referral) {
            return res.status(404).json({
                success: false,
                message: 'Invalid referral code'
            });
        }
        
        return res.status(200).json({
            success: true,
            referrerName: referral.referrer.name,
            message: 'Valid referral code'
        });
    } catch (error) {
        console.error('Error validating referral code:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to validate referral code',
            error: error.message
        });
    }
};

// Get referral statistics for a user
exports.getReferralStats = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Find user's referral
        const referral = await Referral.findOne({ referrer: userId }).populate('referred', 'name email createdAt');
        
        if (!referral) {
            return res.status(200).json({
                success: true,
                referralCode: null,
                referralLink: null,
                referredUsers: [],
                totalReferred: 0
            });
        }
        
        return res.status(200).json({
            success: true,
            referralCode: referral.referralCode,
            referralLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/register?ref=${referral.referralCode}`,
            referredUsers: referral.referred,
            totalReferred: referral.referred.length
        });
    } catch (error) {
        console.error('Error getting referral stats:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get referral statistics',
            error: error.message
        });
    }
};