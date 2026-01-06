const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  email: { type: String, required: true },
  items: [{
    productId: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true }
  }],
  deliveryAddress: {
    address: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  restaurantAddressId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RestaurantDeliveryAddress'
  },
  deliveryBoyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  instructions: { type: String },
  paymentMethod: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancellation_requested', 'cancelled', 'rejected'],
    default: 'pending' 
  },
  cancellationReason: {
    requestedReason: { type: String },
    adminResponse: { type: String },
    adminReason: { type: String }
  },
  loyaltyPoints: {
    pointsEarned: { type: Number, default: 0 },
    pointsApplied: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    status: { 
      type: String, 
      enum: ['pending', 'added', 'not_applicable'], 
      default: 'pending' 
    },
    details: { type: String }
  },
  orderDate: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);