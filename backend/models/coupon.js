const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { 
    type: String, 
    required: true, 
    unique: true,
    uppercase: true,
    trim: true
  },
  type: { 
    type: String, 
    required: true,
    enum: ['price', 'product']
  },
  discount: { 
    type: Number, 
    required: true,
    min: 1
  },
  isPercentage: {
    type: Boolean,
    default: true
  },
  minOrderAmount: { 
    type: Number,
    default: 0,
    required: function() { return this.type === 'price'; }
  },
  applicableProducts: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product',
    required: function() { return this.type === 'product'; }
  }],
  startDate: { 
    type: Date, 
    default: Date.now 
  },
  endDate: { 
    type: Date, 
    required: true 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  maxUses: {
    type: Number,
    default: null
  },
  usedCount: {
    type: Number,
    default: 0
  },
  description: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);