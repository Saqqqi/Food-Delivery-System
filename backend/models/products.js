const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  model3d: { type: String },
  inStock: { type: Boolean, default: true },
  restaurant: { 
    id: { type: String, required: true, default: 'our' },
    name: { type: String, required: true, default: 'Our Restaurant' }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
