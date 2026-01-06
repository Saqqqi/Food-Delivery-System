const Order = require('../models/orders');
const Product = require('../models/products');

exports.getAnalytics = async (req, res) => {
    try {
        // 1. Calculate Total Revenue & Total Orders
        // We only consider 'delivered' orders for actual revenue, 
        // or you might want all non-cancelled ones depending on business logic. 
        // Let's assume 'delivered' for realized revenue.
        const revenueStats = await Order.aggregate([
            { $match: { status: { $ne: 'cancelled' } } }, // Filter out cancelled
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalAmount" },
                    totalOrders: { $sum: 1 },
                    avgOrderValue: { $avg: "$totalAmount" }
                }
            }
        ]);

        const stats = revenueStats.length > 0 ? revenueStats[0] : { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 };

        // 2. Get Top Selling Items
        const topItems = await Order.aggregate([
            { $match: { status: { $ne: 'cancelled' } } },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.productId",
                    name: { $first: "$items.name" },
                    totalSold: { $sum: "$items.quantity" },
                    revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
                }
            },
            { $sort: { totalSold: -1 } }, // Sort by quantity sold descending
            { $limit: 10 } // Top 10 items
        ]);

        // 3. User Trends (Simple: New users today/week - simplified for now as just total Users count)
        // You'd need User model for this. Let's skip detailed user trends for this specific controller 
        // unless requested, but we can return data if needed.

        res.status(200).json({
            success: true,
            data: {
                revenue: stats.totalRevenue,
                orders: stats.totalOrders,
                averageOrderValue: Math.round(stats.avgOrderValue),
                topProducts: topItems
            }
        });

    } catch (error) {
        console.error("Analytics Error:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};
