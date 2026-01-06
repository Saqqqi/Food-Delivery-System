const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    products: [
        {
            product_ID: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'products',
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            total: {
                type: Number,
                default: 0
            }
        }
    ],
    coupon: {
        code: { type: String },
        discountAmount: { type: Number, default: 0 },
        type: { type: String, enum: ['price', 'product'], default: 'price' },
        isPercentage: { type: Boolean, default: false }
    },
    loyaltyDiscount: {
        pointsRedeemed: { type: Number, default: 0 },
        discountAmount: { type: Number, default: 0 }
    },
    discountType: { 
        type: String, 
        enum: ['none', 'coupon', 'loyalty'], 
        default: 'none' 
    },
    sub_total: { type: Number, default: 0 },
    final_total: { type: Number, default: 0 }
});

const cartModel = mongoose.model('Cart', cartSchema);

module.exports = cartModel;
