const mongoose = require('mongoose');

const extraItemSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  category: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  image: { 
    type: String 
  },
  isAvailable: { 
    type: Boolean, 
    default: true 
  },
  restaurant: { 
    id: { 
      type: String, 
      required: true, 
      default: 'our' 
    },
    name: { 
      type: String, 
      required: true, 
      default: 'Our Restaurant' 
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ExtraItem', extraItemSchema);
