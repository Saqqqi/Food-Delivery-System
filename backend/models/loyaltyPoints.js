const mongoose = require('mongoose');

const loyaltyPointsSettingsSchema = new mongoose.Schema({
  pointsPerAmount: {
    type: Number,
    required: true,
    default: 1, // Default 1 point per specified amount
    min: 0
  },
  orderAmountThreshold: {
    type: Number,
    required: true,
    default: 100, // Default Rs. 100 per point
    min: 1
  },
  redemptionRate: {
    type: Number,
    required: true,
    default: 0.1, // Default 0.1 Rs. per point (10 points = Rs. 1)
    min: 0.01
  },
  minPointsToRedeem: {
    type: Number,
    required: true,
    default: 100, // Minimum points needed to redeem
    min: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    default: 'Loyalty points program'
  }
}, { timestamps: true });

module.exports = mongoose.model('LoyaltyPointsSettings', loyaltyPointsSettingsSchema);