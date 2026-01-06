const LoyaltyPoint = require('../models/loyaltyPoints');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Admin can set loyalty point rules
exports.setLoyaltyRules = catchAsync(async (req, res, next) => {
    const { pointsPerAmount, orderAmountThreshold, redemptionRate, minPointsToRedeem, isActive, description } = req.body;

    let loyaltyRules = await LoyaltyPoint.findOne();

    if (!loyaltyRules) {
        loyaltyRules = await LoyaltyPoint.create({
            pointsPerAmount,
            orderAmountThreshold,
            redemptionRate,
            minPointsToRedeem,
            isActive,
            description
        });
    } else {
        loyaltyRules.pointsPerAmount = pointsPerAmount || loyaltyRules.pointsPerAmount;
        loyaltyRules.orderAmountThreshold = orderAmountThreshold || loyaltyRules.orderAmountThreshold;
        loyaltyRules.redemptionRate = redemptionRate || loyaltyRules.redemptionRate;
        loyaltyRules.minPointsToRedeem = minPointsToRedeem || loyaltyRules.minPointsToRedeem;
        loyaltyRules.isActive = isActive !== undefined ? isActive : loyaltyRules.isActive;
        loyaltyRules.description = description || loyaltyRules.description;
        await loyaltyRules.save();
    }

    res.status(200).json({
        status: 'success',
        data: {
            loyaltyRules
        }
    });
});

// Get loyalty point rules
exports.getLoyaltyRules = catchAsync(async (req, res, next) => {
    const loyaltyRules = await LoyaltyPoint.findOne();

    if (!loyaltyRules) {
        return next(new AppError('Loyalty point rules not set yet.', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            loyaltyRules
        }
    });
});

// Calculate and add loyalty points to user after an order
exports.addLoyaltyPoints = catchAsync(async (userId, orderTotal) => {
    const loyaltyRules = await LoyaltyPoint.findOne();

    if (!loyaltyRules || !loyaltyRules.isActive) {
        return; // Loyalty system is not active or rules not set
    }

    if (orderTotal >= loyaltyRules.orderAmountThreshold) {
        const pointsEarned = Math.floor((orderTotal / loyaltyRules.orderAmountThreshold) * loyaltyRules.pointsPerAmount);

        await User.findByIdAndUpdate(userId, { $inc: { loyaltyPoints: pointsEarned } });
        console.log(`Added ${pointsEarned} loyalty points to user ${userId}`);
        
        return pointsEarned;
    }
    
    return 0;
});

// Redeem loyalty points
exports.redeemLoyaltyPoints = catchAsync(async (req, res, next) => {
    const { pointsToRedeem } = req.body;
    const userId = req.user.id; // Assuming user is authenticated

    const user = await User.findById(userId);
    const loyaltyRules = await LoyaltyPoint.findOne();

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    if (!loyaltyRules || !loyaltyRules.isActive) {
        return next(new AppError('Loyalty point system is not active.', 400));
    }

    if (user.loyaltyPoints < pointsToRedeem) {
        return next(new AppError('Insufficient loyalty points.', 400));
    }

    if (pointsToRedeem < loyaltyRules.minPointsToRedeem) {
        return next(new AppError(`Minimum ${loyaltyRules.minPointsToRedeem} points required to redeem.`, 400));
    }

    const discountAmount = (pointsToRedeem * loyaltyRules.redemptionRate);

    user.loyaltyPoints -= pointsToRedeem;
    await user.save();

    res.status(200).json({
        status: 'success',
        message: 'Loyalty points redeemed successfully.',
        discountAmount,
        remainingPoints: user.loyaltyPoints
    });
});

// Get user's loyalty points
exports.getUserLoyaltyPoints = catchAsync(async (req, res, next) => {
    const userId = req.user.id; // Assuming user is authenticated

    const user = await User.findById(userId).select('loyaltyPoints');

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    const loyaltyRules = await LoyaltyPoint.findOne();

    res.status(200).json({
        status: 'success',
        data: {
            loyaltyPoints: user.loyaltyPoints,
            redemptionRate: loyaltyRules ? loyaltyRules.redemptionRate : 0,
            minPointsToRedeem: loyaltyRules ? loyaltyRules.minPointsToRedeem : 0,
            isActive: loyaltyRules ? loyaltyRules.isActive : false
        }
    });
});

// Get user's loyalty points by userId
exports.getUserLoyaltyPointsById = catchAsync(async (req, res, next) => {
    const { userId } = req.params;

    const user = await User.findById(userId).select('loyaltyPoints');

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    const loyaltyRules = await LoyaltyPoint.findOne();

    res.status(200).json({
        points: user.loyaltyPoints,
        redemptionRate: loyaltyRules ? loyaltyRules.redemptionRate : 0,
        minPointsToRedeem: loyaltyRules ? loyaltyRules.minPointsToRedeem : 0,
        isActive: loyaltyRules ? loyaltyRules.isActive : false
    });
});

// Refund loyalty points to user
exports.refundPoints = catchAsync(async (req, res, next) => {
    const { userId } = req.params;
    const { points } = req.body;

    if (!points || isNaN(points) || points <= 0) {
        return next(new AppError('Valid points amount is required', 400));
    }

    const user = await User.findById(userId);

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    user.loyaltyPoints += parseInt(points);
    await user.save();

    res.status(200).json({
        status: 'success',
        message: 'Points refunded successfully',
        currentPoints: user.loyaltyPoints
    });
});

// Award loyalty points for referrals
exports.awardReferralPoints = catchAsync(async (referrerId, newUserId) => {
    const REFERRAL_POINTS = 50; // Points awarded for successful referral
    
    // Award points to the referrer
    const referrer = await User.findById(referrerId);
    if (!referrer) {
        console.error(`Referrer user ${referrerId} not found`);
        return false;
    }
    
    referrer.loyaltyPoints += REFERRAL_POINTS;
    await referrer.save();
    console.log(`Added ${REFERRAL_POINTS} referral points to user ${referrerId}`);
    
    // Award points to the new user
    const newUser = await User.findById(newUserId);
    if (!newUser) {
        console.error(`New user ${newUserId} not found`);
        return false;
    }
    
    newUser.loyaltyPoints += REFERRAL_POINTS;
    await newUser.save();
    console.log(`Added ${REFERRAL_POINTS} welcome points to new user ${newUserId}`);
    
    return true;
});