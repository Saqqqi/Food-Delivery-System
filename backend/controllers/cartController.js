const Cart = require("../models/cart");
require('dotenv').config();
const Product = require("../models/products");
const mongoose = require('mongoose');

async function addProductToCart(req, res) {
    try {
        const { userId, product_id, quantity } = req.body;

        const product = await Product.findById(product_id);
        if (!product) {
            return res.status(404).json({ success: false, error: "Product not found" });
        }

        const basePrice = product.price;
        if (!basePrice || basePrice <= 0) {
            return res.status(400).json({ success: false, message: "Invalid product price" });
        }

        const totalPrice = parseFloat((basePrice * quantity).toFixed(2));

        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = new Cart({
                userId,
                products: [
                    {
                        product_ID: product_id,
                        quantity,
                        total: totalPrice
                    }
                ],
                sub_total: totalPrice
            });
        } else {
            const existingProductIndex = cart.products.findIndex(p => p.product_ID.toString() === product_id);

            if (existingProductIndex !== -1) {
                const existingProduct = cart.products[existingProductIndex];
                existingProduct.quantity += quantity;
                existingProduct.total = parseFloat((existingProduct.quantity * basePrice).toFixed(2));
            } else {
                cart.products.push({
                    product_ID: product_id,
                    quantity,
                    total: totalPrice
                });
            }

            cart.sub_total = cart.products.reduce((acc, p) => acc + p.total, 0);
            cart.sub_total = parseFloat(cart.sub_total.toFixed(2));
        }

        await cart.save();
        return res.status(200).json({ success: true, data: cart });

    } catch (err) {
        console.error("Error:", err.message);
        return res.status(500).json({ success: false, error: err.message });
    }
}


async function getCart(req, res) {
    try {
        const { userId } = req.params;

        const cart = await Cart.findOne({ userId }).populate({
            path: 'products.product_ID',
            model: 'Product',
            select: 'name shortDescription category price'
        });

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found for the specified userId' });
        }

        res.status(200).json(cart);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function removeFromCart(req, res) {
    console.log("removeFromCart");
    const { userId, product_id } = req.params;

    try {
        console.log("Received userId:", userId, "product_id:", product_id);

        // Validate product ID format
        if (!mongoose.Types.ObjectId.isValid(product_id)) {
            return res.status(400).json({ error: 'Invalid product ID format' });
        }

        // Check if product exists
        const product = await Product.findById(product_id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Find user's cart
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        // Find product in cart
        const productIndex = cart.products.findIndex(item => 
            item.product_ID && item.product_ID.toString() === product_id
        );
        
        if (productIndex === -1) {
            return res.status(404).json({ error: 'Product not found in cart' });
        }

        // Remove product from cart
        const removedTotal = cart.products[productIndex].total;
        cart.products.splice(productIndex, 1);
        cart.sub_total = Math.max(0, cart.sub_total - removedTotal);
        cart.sub_total = parseFloat(cart.sub_total.toFixed(2));

        // Save updated cart
        const updatedCart = await cart.save();

        // Populate product data before sending response
        const populatedCart = await Cart.findById(updatedCart._id)
            .populate({
                path: 'products.product_ID',
                model: 'Product',
                select: 'name price image' // Include fields you need
            })
            .lean();

        if (!populatedCart) {
            return res.status(404).json({ error: 'Cart not found after update' });
        }

        res.status(200).json({
            success: true,
            cart: populatedCart
        });

    } catch (err) {
        console.error("Error in removeFromCart:", err.message);
        res.status(500).json({ 
            success: false,
            error: err.message 
        });
    }
}

async function updateCartQuantity(req, res) {
    console.log("updateCartQuantity");
    const { userId, product_id } = req.params;
    const { quantity } = req.body;

    try {
        console.log("Received userId:", userId, "product_id:", product_id, "quantity:", quantity);

        // Validate inputs
        if (!userId || !product_id || !quantity) {
            return res.status(400).json({ success: false, error: "userId, product_id, and quantity are required" });
        }

        // Validate product_id format
        if (!mongoose.Types.ObjectId.isValid(product_id)) {
            return res.status(400).json({ success: false, error: "Invalid product_id format" });
        }

        // Validate quantity
        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({ success: false, error: "Quantity must be a positive integer" });
        }

        // Check if product exists
        const product = await Product.findById(product_id);
        if (!product) {
            return res.status(404).json({ success: false, error: "Product not found" });
        }

        // Validate product price
        const basePrice = product.price;
        if (!basePrice || basePrice <= 0) {
            return res.status(400).json({ success: false, error: "Invalid product price" });
        }

        // Find user's cart
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ success: false, error: "Cart not found" });
        }

        // Find product in cart
        const productIndex = cart.products.findIndex(item => 
            item.product_ID && item.product_ID.toString() === product_id
        );
        
        if (productIndex === -1) {
            return res.status(404).json({ success: false, error: "Product not found in cart" });
        }

        // Update cart item
        cart.products[productIndex].quantity = quantity;
        cart.products[productIndex].total = parseFloat((basePrice * quantity).toFixed(2));

        // Recalculate subtotal
        cart.sub_total = cart.products.reduce((acc, p) => acc + p.total, 0);
        cart.sub_total = parseFloat(cart.sub_total.toFixed(2));

        // Save updated cart
        const updatedCart = await cart.save();

        // Populate product data before sending response
        const populatedCart = await Cart.findById(updatedCart._id)
            .populate({
                path: 'products.product_ID',
                model: 'Product',
                select: 'name price image category'
            })
            .lean();

        if (!populatedCart) {
            return res.status(404).json({ success: false, error: "Cart not found after update" });
        }

        res.status(200).json({
            success: true,
            cart: populatedCart
        });

    } catch (err) {
        console.error("Error in updateCartQuantity:", err.message);
        res.status(500).json({ 
            success: false,
            error: "Internal server error"
        });
    }
}
async function clearCart (req, res) {
  try {
    const { userId } = req.params;
    console.log('Clearing cart for user:', userId);

    const result = await Cart.deleteOne({ userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Cart not found for user' });
    }

    console.log('Cart cleared for user:', userId);
    res.status(200).json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ error: error.message });
  }
};
// Add these new functions to your existing cartController.js file

// Apply coupon to cart
async function applyCoupon(req, res) {
  try {
    const { userId } = req.params;
    const { couponCode, discountAmount, couponType, isPercentage } = req.body;

    if (!couponCode || discountAmount === undefined) {
      return res.status(400).json({ error: 'Coupon code and discount amount are required' });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    // Update cart with coupon information
    cart.coupon = {
      code: couponCode,
      discountAmount: discountAmount || 0,
      type: couponType || 'price',
      isPercentage: isPercentage || false
    };

    // Calculate final total after discount
    cart.final_total = Math.max(0, cart.sub_total - (discountAmount || 0));

    await cart.save();
    return res.status(200).json(cart);
  } catch (error) {
    console.error('Error applying coupon:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Remove coupon from cart
async function removeCoupon(req, res) {
  try {
    const { userId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    // Remove coupon information
    cart.coupon = {};
    cart.final_total = cart.sub_total;

    await cart.save();
    return res.status(200).json(cart);
  } catch (error) {
    console.error('Error removing coupon:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Apply loyalty points to cart
async function applyLoyaltyPoints(req, res) {
  try {
    const { userId } = req.params;
    const { pointsToRedeem } = req.body;

    if (!pointsToRedeem || pointsToRedeem <= 0) {
      return res.status(400).json({ error: 'Valid points amount is required' });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    // Get user to check available points
    const User = require('../models/User');
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get loyalty rules
    const LoyaltyPoint = require('../models/loyaltyPoints');
    const loyaltyRules = await LoyaltyPoint.findOne();
    if (!loyaltyRules || !loyaltyRules.isActive) {
      return res.status(400).json({ error: 'Loyalty point system is not active' });
    }

    // Check if user has enough points
    if (user.loyaltyPoints < pointsToRedeem) {
      return res.status(400).json({ 
        error: 'Insufficient loyalty points', 
        required: pointsToRedeem,
        available: user.loyaltyPoints 
      });
    }

    // Check minimum points requirement
    if (pointsToRedeem < loyaltyRules.minPointsToRedeem) {
      return res.status(400).json({ 
        error: `Minimum ${loyaltyRules.minPointsToRedeem} points required to redeem`,
        minRequired: loyaltyRules.minPointsToRedeem
      });
    }

    // Calculate discount amount
    const discountAmount = (pointsToRedeem * loyaltyRules.redemptionRate);

    // Remove any existing coupon
    cart.coupon = {};
    
    // Update cart with loyalty points information
    cart.loyaltyDiscount = {
      pointsRedeemed: pointsToRedeem,
      discountAmount: discountAmount
    };
    
    // Set discount type to loyalty
    cart.discountType = 'loyalty';

    // Calculate final total after discount
    cart.final_total = Math.max(0, cart.sub_total - discountAmount);

    await cart.save();
    return res.status(200).json({
      success: true,
      cart,
      pointsRedeemed: pointsToRedeem,
      discountAmount,
      remainingPoints: user.loyaltyPoints
    });
  } catch (error) {
    console.error('Error applying loyalty points:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Remove loyalty points discount from cart
async function removeLoyaltyDiscount(req, res) {
  try {
    const { userId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    // Remove loyalty discount information
    cart.loyaltyDiscount = {
      pointsRedeemed: 0,
      discountAmount: 0
    };
    cart.discountType = 'none';
    cart.final_total = cart.sub_total;

    await cart.save();
    return res.status(200).json({
      success: true,
      cart
    });
  } catch (error) {
    console.error('Error removing loyalty discount:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Export all functions
module.exports = {
    addProductToCart,
    getCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    applyCoupon,
    removeCoupon,
    applyLoyaltyPoints,
    removeLoyaltyDiscount
};