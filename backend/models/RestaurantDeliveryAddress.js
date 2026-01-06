const mongoose = require('mongoose');

const restaurantDeliveryAddressSchema = new mongoose.Schema({
  address: { type: String, required: true }, // Single field for the full address
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  restaurantName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('RestaurantDeliveryAddress', restaurantDeliveryAddressSchema);