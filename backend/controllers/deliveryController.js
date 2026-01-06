const User = require("../models/User");
const Order = require("../models/orders");
const Product = require("../models/products");
const RestaurantDeliveryAddress = require("../models/RestaurantDeliveryAddress"); // Add this import

// Update delivery boy availability status
exports.updateAvailability = async (req, res) => {
    try {
        const { isAvailable } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user || user.role !== 'delivery_boy') {
            return res.status(403).json({ message: "Access denied. Delivery boys only." });
        }

        await User.findByIdAndUpdate(userId, { isAvailable });

        res.json({ 
            message: "Availability updated successfully",
            isAvailable 
        });
    } catch (error) {
        console.error('Update availability error:', error);
        res.status(500).json({ message: "Failed to update availability" });
    }
};

// Get delivery boy profile
exports.getDeliveryBoyProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password");

        if (!user || user.role !== 'delivery_boy') {
            return res.status(403).json({ message: "Access denied. Delivery boys only." });
        }

        res.json(user);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: "Failed to get profile" });
    }
};

// Update delivery boy location
exports.updateLocation = async (req, res) => {
    try {
        const { latitude, longitude } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user || user.role !== 'delivery_boy') {
            return res.status(403).json({ message: "Access denied. Delivery boys only." });
        }

        await User.findByIdAndUpdate(userId, {
            currentLocation: { latitude, longitude }
        });

        res.json({ message: "Location updated successfully" });
    } catch (error) {
        console.error('Update location error:', error);
        res.status(500).json({ message: "Failed to update location" });
    }
};

// Get assigned orders for delivery boy
exports.getAssignedOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user || user.role !== 'delivery_boy') {
            return res.status(403).json({ message: "Access denied. Delivery boys only." });
        }

        // Find all orders assigned to this delivery boy with status 'shipped'
        // Populate both items.productId and restaurantAddressId
        const orders = await Order.find({
            deliveryBoyId: userId,
            status: 'shipped'
        })
        .populate('items.productId')
        .populate('restaurantAddressId'); // Add this populate

        // Format orders for frontend
        const formattedOrders = orders.map(order => {
            // Get restaurant address details if available
            let restaurantAddress = null;
            if (order.restaurantAddressId) {
                restaurantAddress = {
                    address: order.restaurantAddressId.address,
                    latitude: order.restaurantAddressId.latitude,
                    longitude: order.restaurantAddressId.longitude,
                    restaurantName: order.restaurantAddressId.restaurantName
                };
            }

            return {
                _id: order._id,
                email: order.email,
                items: order.items.map(item => ({
                    name: item.productId ? item.productId.name : 'Unknown Product',
                    quantity: item.quantity,
                    price: item.price
                })),
                deliveryAddress: order.deliveryAddress,
                restaurantAddress: restaurantAddress, // Add this field
                totalAmount: order.totalAmount,
                status: order.status,
                paymentMethod: order.paymentMethod,
                orderDate: order.orderDate,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt
            };
        });

        res.json(formattedOrders);
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ message: "Failed to get orders" });
    }
};

// Get completed orders history for delivery boy
exports.getOrderHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user || user.role !== 'delivery_boy') {
            return res.status(403).json({ message: "Access denied. Delivery boys only." });
        }

        // Find all completed orders assigned to this delivery boy
        // Populate both items.productId and restaurantAddressId
        const orders = await Order.find({
            deliveryBoyId: userId,
            status: 'delivered'
        })
        .populate('items.productId')
        .populate('restaurantAddressId')
        .sort({ updatedAt: -1 }); // Sort by most recent first

        // Format orders for frontend
        const formattedOrders = orders.map(order => {
            // Get restaurant address details if available
            let restaurantAddress = null;
            if (order.restaurantAddressId) {
                restaurantAddress = {
                    address: order.restaurantAddressId.address,
                    latitude: order.restaurantAddressId.latitude,
                    longitude: order.restaurantAddressId.longitude,
                    restaurantName: order.restaurantAddressId.restaurantName
                };
            }

            // Calculate delivery time
            const orderDate = new Date(order.orderDate);
            const deliveredDate = new Date(order.updatedAt);
            const deliveryTimeMs = deliveredDate - orderDate;
            const deliveryTimeHours = Math.floor(deliveryTimeMs / (1000 * 60 * 60));
            const deliveryTimeMinutes = Math.floor((deliveryTimeMs % (1000 * 60 * 60)) / (1000 * 60));

            return {
                _id: order._id,
                email: order.email,
                items: order.items.map(item => ({
                    name: item.productId ? item.productId.name : 'Unknown Product',
                    quantity: item.quantity,
                    price: item.price
                })),
                deliveryAddress: order.deliveryAddress,
                restaurantAddress: restaurantAddress,
                totalAmount: order.totalAmount,
                status: order.status,
                paymentMethod: order.paymentMethod,
                orderDate: order.orderDate,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt,
                deliveredAt: order.updatedAt, // Since status was changed to delivered
                deliveryTime: {
                    hours: deliveryTimeHours,
                    minutes: deliveryTimeMinutes,
                    totalMs: deliveryTimeMs
                }
            };
        });

        res.json(formattedOrders);
    } catch (error) {
        console.error('Get order history error:', error);
        res.status(500).json({ message: "Failed to get order history" });
    }
};

// Accept an order
exports.acceptOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user || user.role !== 'delivery_boy') {
            return res.status(403).json({ message: "Access denied. Delivery boys only." });
        }

        // Mock implementation - replace with actual Order model update
        res.json({ 
            message: "Order accepted successfully",
            orderId: orderId
        });
    } catch (error) {
        console.error('Accept order error:', error);
        res.status(500).json({ message: "Failed to accept order" });
    }
};

// Complete an order
exports.completeOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user || user.role !== 'delivery_boy') {
            return res.status(403).json({ message: "Access denied. Delivery boys only." });
        }

        // Find the order and verify it belongs to this delivery boy
        const order = await Order.findById(orderId);
        
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        
        if (order.deliveryBoyId.toString() !== userId) {
            return res.status(403).json({ message: "This order is not assigned to you" });
        }
        
        if (order.status !== 'shipped') {
            return res.status(400).json({ message: "Only shipped orders can be marked as delivered" });
        }
        
        // Update order status to delivered
        order.status = 'delivered';
        await order.save();
        
        // Add 50 bonus points to delivery boy
        user.bonusPoints = (user.bonusPoints || 0) + 50;
        user.isAvailable = true; // Make delivery boy available again
        await user.save();
        
        res.json({ 
            message: "Order completed successfully",
            orderId: orderId,
            bonusPoints: user.bonusPoints,
            bonusPointsAdded: 50
        });
    } catch (error) {
        console.error('Complete order error:', error);
        res.status(500).json({ message: "Failed to complete order" });
    }
};

// Redeem points for a product
exports.redeemPoints = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.user.id;

        // Validate user is a delivery boy
        const user = await User.findById(userId);
        if (!user || user.role !== 'delivery_boy') {
            return res.status(403).json({ message: "Access denied. Delivery boys only." });
        }

        // Check if user has enough points
        const POINTS_REQUIRED = 150;
        if (user.bonusPoints < POINTS_REQUIRED) {
            return res.status(400).json({ 
                message: `Not enough points. You need ${POINTS_REQUIRED} points to redeem an item.`,
                currentPoints: user.bonusPoints
            });
        }

        // Verify product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Deduct points from user
        user.bonusPoints -= POINTS_REQUIRED;
        await user.save();

        // Return updated points
        res.json({
            message: "Points redeemed successfully",
            product: {
                name: product.name,
                id: product._id
            },
            pointsUsed: POINTS_REQUIRED,
            remainingPoints: user.bonusPoints
        });
    } catch (error) {
        console.error('Redeem points error:', error);
        res.status(500).json({ message: "Failed to redeem points" });
    }
};

// Get all products for redemption
exports.getRedemptionProducts = async (req, res) => {
    try {
        const userId = req.user.id;

        // Validate user is a delivery boy
        const user = await User.findById(userId);
        if (!user || user.role !== 'delivery_boy') {
            return res.status(403).json({ message: "Access denied. Delivery boys only." });
        }

        // Get products
        const products = await Product.find({ inStock: true }).limit(12);
        
        res.json(products);
    } catch (error) {
        console.error('Get redemption products error:', error);
        res.status(500).json({ message: "Failed to get products" });
    }
};

// Get delivery statistics
exports.getDeliveryStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user || user.role !== 'delivery_boy') {
            return res.status(403).json({ message: "Access denied. Delivery boys only." });
        }

        // Get all completed orders for this delivery boy
        const completedOrders = await Order.find({
            deliveryBoyId: userId,
            status: 'delivered'
        });

        // Get pending orders (assigned but not delivered)
        const pendingOrders = await Order.find({
            deliveryBoyId: userId,
            status: 'shipped'
        });

        // Calculate today's deliveries
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayDeliveries = completedOrders.filter(order => {
            const orderDate = new Date(order.updatedAt);
            return orderDate >= today;
        }).length;

        // Calculate total earnings (if your system tracks this)
        const totalEarnings = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);

        // Prepare stats object
        const stats = {
            todayDeliveries,
            pendingOrders: pendingOrders.length,
            completedOrders: completedOrders.length,
            totalEarnings,
            bonusPoints: user.bonusPoints || 0
        };

        res.json(stats);
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ message: "Failed to get statistics" });
    }
};

// Get all available delivery boys
exports.getAvailableDeliveryBoys = async (req, res) => {
    try {
        // Check for admin key for security
        const adminKey = req.headers['admin-key'];
        if (!adminKey || adminKey !== 'food123') {
            return res.status(403).json({ error: 'Admin access required. Invalid or missing admin key.' });
        }

        // Find all delivery boys who are available
        const deliveryBoys = await User.find({
            role: 'delivery_boy',
            isAvailable: true
        }).select('_id name phoneNumber vehicleType currentLocation');

        if (!deliveryBoys || deliveryBoys.length === 0) {
            return res.status(404).json({ message: "No available delivery boys found" });
        }

        res.json(deliveryBoys);
    } catch (error) {
        console.error('Get available delivery boys error:', error);
        res.status(500).json({ message: "Failed to get available delivery boys" });
    }
};

// Assign order to delivery boy
exports.assignOrderToDeliveryBoy = async (req, res) => {
    try {
        const { orderId, deliveryBoyId } = req.body;
        
        // Check for admin key for security
        const adminKey = req.headers['admin-key'];
        if (!adminKey || adminKey !== 'food123') {
            return res.status(403).json({ error: 'Admin access required. Invalid or missing admin key.' });
        }

        // Validate inputs
        if (!orderId || !deliveryBoyId) {
            return res.status(400).json({ message: "Order ID and delivery boy ID are required" });
        }

        // Check if order exists
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Check if delivery boy exists and is available
        const deliveryBoy = await User.findById(deliveryBoyId);
        if (!deliveryBoy || deliveryBoy.role !== 'delivery_boy') {
            return res.status(404).json({ message: "Delivery boy not found" });
        }

        if (!deliveryBoy.isAvailable) {
            return res.status(400).json({ message: "Delivery boy is not available" });
        }

        // Update order with delivery boy ID
        order.deliveryBoyId = deliveryBoyId;
        await order.save();

        res.json({ 
            message: "Order assigned to delivery boy successfully",
            order: {
                _id: order._id,
                status: order.status,
                deliveryBoyId: order.deliveryBoyId
            }
        });
    } catch (error) {
        console.error('Assign order error:', error);
        res.status(500).json({ message: "Failed to assign order to delivery boy" });
    }
};