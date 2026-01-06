const Coupon = require('../models/coupon');
const Product = require('../models/products');

// Create a new coupon
exports.createCoupon = async (req, res) => {
  try {
    const {
      code,
      type,
      discount,
      isPercentage,
      minOrderAmount,
      applicableProducts,
      startDate,
      endDate,
      isActive,
      maxUses,
      description
    } = req.body;

    // Validate coupon code uniqueness
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({ error: 'Coupon code already exists' });
    }

    // Create new coupon
    const newCoupon = new Coupon({
      code: code.toUpperCase(),
      type,
      discount,
      isPercentage: isPercentage !== undefined ? isPercentage : true,
      minOrderAmount: type === 'price' ? minOrderAmount : 0,
      applicableProducts: type === 'product' ? applicableProducts : [],
      startDate: startDate || new Date(),
      endDate,
      isActive: isActive !== undefined ? isActive : true,
      maxUses,
      description
    });

    const savedCoupon = await newCoupon.save();
    res.status(201).json(savedCoupon);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all coupons
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().populate('applicableProducts');
    res.status(200).json(coupons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get coupon by ID
exports.getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id).populate('applicableProducts');
    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }
    res.status(200).json(coupon);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update coupon
exports.updateCoupon = async (req, res) => {
  try {
    const {
      code,
      type,
      discount,
      isPercentage,
      minOrderAmount,
      applicableProducts,
      startDate,
      endDate,
      isActive,
      maxUses,
      description
    } = req.body;

    // If code is being updated, check for uniqueness
    if (code) {
      const existingCoupon = await Coupon.findOne({ 
        code: code.toUpperCase(),
        _id: { $ne: req.params.id }
      });
      
      if (existingCoupon) {
        return res.status(400).json({ error: 'Coupon code already exists' });
      }
    }

    const updateData = {};
    if (code) updateData.code = code.toUpperCase();
    if (type) updateData.type = type;
    if (discount !== undefined) updateData.discount = discount;
    if (isPercentage !== undefined) updateData.isPercentage = isPercentage;
    if (type === 'price' && minOrderAmount !== undefined) updateData.minOrderAmount = minOrderAmount;
    if (type === 'product' && applicableProducts) updateData.applicableProducts = applicableProducts;
    if (startDate) updateData.startDate = startDate;
    if (endDate) updateData.endDate = endDate;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (maxUses !== undefined) updateData.maxUses = maxUses;
    if (description !== undefined) updateData.description = description;

    const updatedCoupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('applicableProducts');

    if (!updatedCoupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    res.status(200).json(updatedCoupon);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete coupon
exports.deleteCoupon = async (req, res) => {
  try {
    const deletedCoupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!deletedCoupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }
    res.status(200).json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all products for coupon selection
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({ inStock: true }, 'name price category');
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get available coupons for users
exports.getAvailableCoupons = async (req, res) => {
  try {
    const { orderAmount, products } = req.body;
    
    // Find all active coupons that are currently valid
    const availableCoupons = await Coupon.find({
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    }).populate('applicableProducts');
    
    // Filter coupons based on usage limits
    const validCoupons = availableCoupons.filter(coupon => {
      return coupon.maxUses === null || coupon.usedCount < coupon.maxUses;
    });
    
    // Further filter based on order amount and products if provided
    let eligibleCoupons = validCoupons;
    
    if (orderAmount && products && products.length > 0) {
      eligibleCoupons = validCoupons.filter(coupon => {
        // For price-based coupons, check minimum order amount
        if (coupon.type === 'price') {
          return orderAmount >= coupon.minOrderAmount;
        }
        
        // For product-based coupons, check if any products are eligible
        if (coupon.type === 'product' && coupon.applicableProducts.length > 0) {
          const applicableProductIds = coupon.applicableProducts.map(p => p._id.toString());
          return products.some(p => applicableProductIds.includes(p.productId));
        }
        
        return true;
      });
    }
    
    res.status(200).json({
      coupons: eligibleCoupons.map(coupon => ({
        _id: coupon._id,
        code: coupon.code,
        type: coupon.type,
        discount: coupon.discount,
        isPercentage: coupon.isPercentage,
        minOrderAmount: coupon.minOrderAmount,
        description: coupon.description
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Validate coupon
exports.validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount, products } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Coupon code is required' });
    }

    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(),
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    }).populate('applicableProducts');

    if (!coupon) {
      return res.status(404).json({ error: 'Invalid or expired coupon' });
    }

    // Check max uses
    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({ error: 'Coupon usage limit reached' });
    }

    // For price-based coupons
    if (coupon.type === 'price') {
      if (orderAmount < coupon.minOrderAmount) {
        return res.status(400).json({ 
          error: `Minimum order amount of Rs. ${coupon.minOrderAmount} required for this coupon` 
        });
      }
      
      const discountAmount = coupon.isPercentage 
        ? (orderAmount * coupon.discount / 100) 
        : coupon.discount;
      
      return res.status(200).json({
        valid: true,
        coupon,
        discountAmount,
        finalAmount: orderAmount - discountAmount
      });
    }
    
    // For product-based coupons
    if (coupon.type === 'product') {
      if (!products || !products.length) {
        return res.status(400).json({ error: 'Products are required for product-based coupons' });
      }
      
      // Check if any of the cart products are eligible for the coupon
      const applicableProductIds = coupon.applicableProducts.map(p => p._id.toString());
      const eligibleProducts = products.filter(p => applicableProductIds.includes(p.productId));
      
      if (eligibleProducts.length === 0) {
        return res.status(400).json({ 
          error: 'None of the products in your cart are eligible for this coupon' 
        });
      }
      
      // Calculate discount for eligible products
      let discountAmount = 0;
      eligibleProducts.forEach(product => {
        const productTotal = product.price * product.quantity;
        discountAmount += coupon.isPercentage 
          ? (productTotal * coupon.discount / 100) 
          : Math.min(coupon.discount, productTotal);
      });
      
      return res.status(200).json({
        valid: true,
        coupon,
        discountAmount,
        finalAmount: orderAmount - discountAmount,
        eligibleProducts
      });
    }
    
    res.status(400).json({ error: 'Invalid coupon type' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};