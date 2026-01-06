const AddressModel = require('../models/address');
const OrderModel = require('../models/orders');
const ProductModel = require('../models/products');
const Cart = require('../models/cart');
const nodemailer = require('nodemailer'); // Import nodemailer
require('dotenv').config();
const { validationResult } = require('express-validator');
const RestaurantDeliveryAddress = require('../models/RestaurantDeliveryAddress');
const mongoose = require('mongoose');
const { addLoyaltyPoints } = require('./loyaltyPointController');

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    console.log('Received order data:', req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      userId, 
      email,
      items, 
      deliveryAddress, 
      instructions, 
      paymentMethod, 
      totalAmount,
      status,
      appliedLoyaltyPoints,
      loyaltyPointsDiscount
    } = req.body;

    if (!userId || !email || !items?.length || !deliveryAddress || 
        !deliveryAddress.address || deliveryAddress.latitude == null || 
        deliveryAddress.longitude == null || !paymentMethod || !totalAmount) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId, email, items, deliveryAddress (with address, latitude, longitude), paymentMethod, and totalAmount are required' 
      });
    }

    for (const item of items) {
      if (!item.productId || !item.name || !item.quantity || !item.price) {
        return res.status(400).json({ 
          error: `Invalid item data: productId, name, quantity, and price are required for item ${item.name || 'unknown'}` 
        });
      }
      if (item.quantity < 1) {
        return res.status(400).json({ 
          error: `Invalid quantity for item ${item.name}: quantity must be at least 1` 
        });
      }
    }

    // Initialize loyalty points information
    const loyaltyPointsInfo = {
      pointsEarned: 0,
      pointsApplied: appliedLoyaltyPoints || 0,
      discountAmount: loyaltyPointsDiscount || 0,
      status: 'pending',
      details: ''
    };

    // Create new order
    const newOrder = new OrderModel({
      userId,
      email,
      items,
      deliveryAddress: {
        address: deliveryAddress.address,
        latitude: deliveryAddress.latitude,
        longitude: deliveryAddress.longitude
      },
      instructions,
      paymentMethod,
      totalAmount,
      status: status || 'pending',
      orderDate: new Date(),
      loyaltyPoints: loyaltyPointsInfo
    });

    const savedOrder = await newOrder.save();
    console.log('Order saved:', savedOrder);
    
    // If order is already marked as delivered, add loyalty points immediately
    if (savedOrder.status === 'delivered') {
      try {
        const pointsEarned = await addLoyaltyPoints(userId, totalAmount);
        if (pointsEarned > 0) {
          savedOrder.loyaltyPoints.pointsEarned = pointsEarned;
          savedOrder.loyaltyPoints.status = 'added';
          savedOrder.loyaltyPoints.details = `Earned ${pointsEarned} loyalty points for order total of Rs. ${totalAmount.toFixed(2)}`;
          await savedOrder.save();
        }
      } catch (error) {
        console.error('Error adding loyalty points:', error);
        // Don't fail the order creation if loyalty points can't be added
      }
    }

    res.status(201).json({
      order: savedOrder,
      message: savedOrder.loyaltyPoints.pointsApplied > 0 ? 
        `Order created successfully with a discount of Rs. ${savedOrder.loyaltyPoints.discountAmount.toFixed(2)} from ${savedOrder.loyaltyPoints.pointsApplied} loyalty points` : 
        'Order created successfully'
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: error.message || 'Failed to create order. Please try again.' });
  }
};




// Send order confirmation email
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify connection configuration
transporter.verify((error) => {
  if (error) {
    console.error('Mail transporter verification failed:', error);
  } else {
    console.log('Mail transporter is ready to send emails');
  }
});
exports.sendOrderEmail = async (req, res) => {

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, orderId, items, totalAmount } = req.body;

    const itemsList = items.map(item => 
      `<tr>
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>Rs. ${item.price.toFixed(2)}</td>
        <td>Rs. ${(item.price * item.quantity).toFixed(2)}</td>
       </tr>`
    ).join('');

    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: email,
      subject: `Order Confirmation #${orderId}`,
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
        <h2 style="color: #FF6B6B; text-align: center;">Thank you for your order!</h2>
        <p>Your order <strong>#${orderId}</strong> has been received and is being prepared.</p>
        
        <h3 style="color: #333; border-bottom: 2px solid #FF6B6B; padding-bottom: 5px;">
          Order Summary
        </h3>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="padding: 10px; text-align: left;">Item</th>
              <th style="padding: 10px; text-align: center;">Qty</th>
              <th style="padding: 10px; text-align: right;">Price</th>
              <th style="padding: 10px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsList}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="text-align: right; padding: 10px; font-weight: bold;">Grand Total:</td>
              <td style="text-align: right; padding: 10px; font-weight: bold;">Rs. ${totalAmount.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
        
        <p style="margin-top: 30px; font-size: 14px; color: #666;">
          We'll notify you when your order is on its way. If you have any questions, 
          please contact us at <a href="mailto:${process.env.SUPPORT_EMAIL}">${process.env.SUPPORT_EMAIL}</a>.
        </p>
        
        <p style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
          © ${new Date().getFullYear()} Your Restaurant. All rights reserved.
        </p>
      </div>
      `,

      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'High'
      }
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent:', {
      messageId: info.messageId,
      to: email,
      timestamp: new Date().toISOString(),
      response: info.response
    });
    
    res.status(200).json({ 
      success: true,
      message: 'Email sent successfully',
      orderId: orderId
    });

  } catch (error) {
    console.error('Email sending failed:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      requestBody: req.body
    });
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to send email',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getOrder = async (req, res) => {
  const order_id = req.params.order_id;

  try {
    const order = await OrderModel.findOne({ _id: order_id })
      .populate({
        path: 'products.product_ID', 
        model: 'Product', 
        select: 'name price description'
      })
      .populate({
        path: 'address_id',
        model: 'Address',
        select: 'user_id house_no street city postcode instructions appartment_name floor building_name entry_code business_name hotel_name business'
      });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if address_id was populated successfully
    if (!order.address_id) {
      console.warn(`Order ${order_id} has no associated address`);
      order.deliveryAddress = {
        house_no: 'Unknown',
        street: 'Unknown',
        city: 'Unknown',
        postcode: 'Unknown'
      };
    } else {
      // Map address_id fields to deliveryAddress
      order.deliveryAddress = {
        house_no: order.address_id.house_no || 'Unknown',
        street: order.address_id.street || 'Unknown',
        city: order.address_id.city || 'Unknown',
        postcode: order.address_id.postcode || 'Unknown',
        instructions: order.address_id.instructions || 'None',
        appartment_name: order.address_id.appartment_name || '',
        floor: order.address_id.floor || '',
        building_name: order.address_id.building_name || '',
        entry_code: order.address_id.entry_code || '',
        business_name: order.address_id.business_name || '',
        hotel_name: order.address_id.hotel_name || '',
        business: order.address_id.business || ''
      };
    }

    // Get loyalty points information if available
    if (!order.loyaltyPoints) {
      order.loyaltyPoints = {
        pointsEarned: 0,
        pointsApplied: 0,
        discountAmount: 0,
        status: 'not_applicable',
        details: 'No loyalty points information available'
      };
    }

    // Get user's total loyalty points if userId is available
    let userLoyaltyPoints = null;
    let loyaltyRules = null;
    
    if (order.userId) {
      try {
        const user = await require('../models/User').findById(order.userId).select('loyaltyPoints');
        if (user) {
          userLoyaltyPoints = user.loyaltyPoints;
        }
        
        loyaltyRules = await require('../models/loyaltyPoints').findOne();
      } catch (error) {
        console.error('Error fetching user loyalty points:', error);
      }
    }

    res.status(200).json({
      order,
      userLoyaltyPoints,
      loyaltyRules: loyaltyRules ? {
        redemptionRate: loyaltyRules.redemptionRate,
        minPointsToRedeem: loyaltyRules.minPointsToRedeem,
        isActive: loyaltyRules.isActive
      } : null
    });
  } catch (err) {
    console.error(`Error fetching order ${order_id}:`, err.message);
    res.status(500).json({ error: err.message });
  }
};

// Get all orders
exports.getOrdersList = async (req, res) => {
  try {
    const adminKey = req.headers['admin-key'];
    if (!adminKey || adminKey !== 'food123') {
      return res.status(403).json({ error: 'Admin access required. Invalid or missing admin key.' });
    }

    const orders = await OrderModel.find()
      .populate('restaurantAddressId')
      .populate('deliveryBoyId', 'name vehicleType phoneNumber');
    if (!orders || orders.length === 0) {
      return res.status(404).json({ error: 'No orders found' });
    }

    const restaurantAddresses = await RestaurantDeliveryAddress.find();
    const formattedAddresses = restaurantAddresses.map(address => ({
      id: address._id,
      name: address.restaurantName,
      address: address.address,
      latitude: address.latitude,
      longitude: address.longitude
    }));

    const processedOrders = orders.map(order => {
      let items = order.items || [];
      if (items.length === 0 && order.products && order.products.length > 0) {
        items = order.products.map(product => ({
          productId: product.product_ID,
          name: `Product ${product.product_ID.slice(-4)}`,
          quantity: product.quantity,
          price: product.price || 0
        }));
      }

      if (items.length === 0) {
        items = [{
          productId: "unknown",
          name: "Unknown Product",
          quantity: 1,
          price: 0
        }];
      }

      let totalAmount = order.totalAmount || 0;
      if (!totalAmount) {
        totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      }

      const deliveryAddress = order.deliveryAddress || {
        house_no: order.address?.house_no || 'Unknown',
        street: order.address?.street || 'Unknown',
        city: order.address?.city || 'Unknown',
        postcode: order.address?.postcode || 'Unknown'
      };

      const restaurantAddress = order.restaurantAddressId ? {
        address: order.restaurantAddressId.address,
        latitude: order.restaurantAddressId.latitude,
        longitude: order.restaurantAddressId.longitude
      } : null;

      return {
        _id: order._id,
        userId: order.userId || order.user_id || 'Unknown',
        email: order.email || 'Unknown',
        items,
        deliveryAddress,
        restaurantAddress,
        instructions: order.instructions || 'None',
        paymentMethod: order.paymentMethod || 'Unknown',
        totalAmount,
        status: order.status || 'pending',
        cancellationReason: order.cancellationReason || {
          requestedReason: null,
          adminResponse: null,
          adminReason: null
        },
        loyaltyPoints: order.loyaltyPoints || {
          pointsEarned: 0,
          pointsApplied: 0,
          discountAmount: 0,
          status: 'not_applicable',
          details: 'No loyalty points information available'
        },
        orderDate: order.orderDate || new Date(),
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        __v: order.__v
      };
    });

    res.status(200).json({
      orders: processedOrders,
      restaurantAddresses: formattedAddresses
    });
  } catch (err) {
    console.error('Error fetching orders or restaurant addresses:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.handleCancellationRequest = async (req, res) => {
  const { orderId } = req.params;
  const { adminResponse, adminReason } = req.body;

  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    if (!['approved', 'rejected'].includes(adminResponse)) {
      return res.status(400).json({ error: 'Invalid admin response. Allowed values: approved, rejected' });
    }

    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== 'cancellation_requested') {
      return res.status(400).json({ error: 'Order does not have a pending cancellation request' });
    }

    order.cancellationReason.adminResponse = adminResponse;
    order.cancellationReason.adminReason = adminReason || '';
    order.status = adminResponse === 'approved' ? 'cancelled' : 'pending';
    order.cancellationReason.processedAt = new Date();

    const updatedOrder = await order.save();

    res.status(200).json({
      message: 'Cancellation request processed successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error processing cancellation request:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update order status (admin-only)
exports.updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status, restaurantAddressId, deliveryBoyId } = req.body;

  try {
    if (!['pending', 'shipped', 'delivered'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Allowed values: pending, shipped, delivered' });
    }

    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (status === 'shipped') {
      if (!restaurantAddressId) {
        return res.status(400).json({ error: 'Restaurant address ID is required for shipped status' });
      }
      const addressExists = await RestaurantDeliveryAddress.findById(restaurantAddressId);
      if (!addressExists) {
        return res.status(400).json({ error: 'Invalid restaurant address ID' });
      }
      order.restaurantAddressId = restaurantAddressId;
      
      // If deliveryBoyId is provided, assign the delivery boy
      if (deliveryBoyId) {
        const deliveryBoy = await require('../models/User').findById(deliveryBoyId);
        if (!deliveryBoy || deliveryBoy.role !== 'delivery_boy') {
          return res.status(400).json({ error: 'Invalid delivery boy ID' });
        }
        order.deliveryBoyId = deliveryBoyId;
      }
    }

    // Handle loyalty points when order is delivered
    if (status === 'delivered' && order.status !== 'delivered') {
      try {
        // Calculate and add loyalty points
        const pointsEarned = await addLoyaltyPoints(order.userId, order.totalAmount);
        
        if (pointsEarned > 0) {
          // Update loyalty points information in the order
          order.loyaltyPoints = {
            ...order.loyaltyPoints || {},
            pointsEarned: pointsEarned,
            status: 'added',
            details: `Earned ${pointsEarned} loyalty points for order total of Rs. ${order.totalAmount.toFixed(2)}`
          };
          
          console.log(`Added ${pointsEarned} loyalty points to user ${order.userId} for order ${orderId}`);
        } else {
          order.loyaltyPoints = {
            ...order.loyaltyPoints || {},
            status: 'not_applicable',
            details: 'Order did not qualify for loyalty points'
          };
        }
      } catch (error) {
        console.error('Error processing loyalty points:', error);
        // Don't fail the status update if loyalty points processing fails
        order.loyaltyPoints = {
          ...order.loyaltyPoints || {},
          status: 'pending',
          details: 'Failed to process loyalty points: ' + error.message
        };
      }
    }

    order.status = status;
    const updatedOrder = await order.save();
    res.status(200).json({ 
      message: 'Order status updated successfully', 
      order: updatedOrder,
      loyaltyPointsInfo: order.loyaltyPoints || null
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: error.message });
  }
};


// Get orders for a specific user
exports.getUserOrders = async (req, res) => {
  const userId = req.params.userId;
  const status = req.query.status; 

  try {
   
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    const query = { userId };
    if (status) {
      query.status = status; 
    }

    const orders = await OrderModel.find(query)
      .populate('restaurantAddressId', 'address latitude longitude restaurantName')
      .lean(); 

    if (!orders || orders.length === 0) {
      return res.status(404).json({ error: 'No orders found for this user' });
    }

    // Get user's total loyalty points
    const user = await require('../models/User').findById(userId).select('loyaltyPoints');
    const loyaltyRules = await require('../models/loyaltyPoints').findOne();

    // Process orders to include loyalty points information
    const processedOrders = orders.map(order => {
      return {
        ...order,
        loyaltyPoints: order.loyaltyPoints || {
          pointsEarned: 0,
          pointsApplied: 0,
          discountAmount: 0,
          status: 'not_applicable',
          details: 'No loyalty points information available'
        }
      };
    });

    console.log('Fetched orders:', {
      userId,
      ordersCount: processedOrders.length,
      sampleOrder: processedOrders[0],
      timestamp: new Date().toISOString()
    });

    res.status(200).json({
      orders: processedOrders,
      userLoyaltyPoints: user ? user.loyaltyPoints : 0,
      loyaltyRules: loyaltyRules ? {
        redemptionRate: loyaltyRules.redemptionRate,
        minPointsToRedeem: loyaltyRules.minPointsToRedeem,
        isActive: loyaltyRules.isActive
      } : null
    });
  } catch (err) {
    console.error('Error fetching user orders:', {
      errorDetails: err.message,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({ error: err.message || 'Failed to fetch orders' });
  }
};

// Updated cancelOrder controller
exports.cancelOrder = async (req, res) => {
  console.log('Received cancel order request:', req.body);
  const orderId = req.params.orderId;
  const { reason } = req.body;

  try {
    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const jwtUserId = req.user._id || req.user.id || req.user.userId;
    if (!jwtUserId) {
      return res.status(401).json({ error: 'Invalid user token' });
    }
    if (order.userId !== jwtUserId) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ error: 'Only pending or confirmed orders can be cancelled' });
    }

    order.status = 'cancellation_requested';
    order.cancellationReason = {
      requestedReason: reason,
      adminResponse: 'pending'
    };
    
    const updatedOrder = await order.save();
    

    
    res.status(200).json({ 
      message: 'Cancellation request submitted. Waiting for admin approval.', 
      order: updatedOrder 
    });
  } catch (error) {
    console.error('Error requesting order cancellation:', error);
    res.status(500).json({ error: error.message });
  }
};




// Delete an order
exports.deleteOrder = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedOrder = await OrderModel.findByIdAndDelete(id);

    if (!deletedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
module.exports = {
  createOrder: exports.createOrder,
  sendOrderEmail: exports.sendOrderEmail,
  getOrder: exports.getOrder,
  getOrdersList: exports.getOrdersList,
  deleteOrder: exports.deleteOrder,
  getUserOrders: exports.getUserOrders,
  cancelOrder: exports.cancelOrder,
  updateOrderStatus: exports.updateOrderStatus, // ✅ Add this line
    handleCancellationRequest: exports.handleCancellationRequest, // ✅ Add this line
};
