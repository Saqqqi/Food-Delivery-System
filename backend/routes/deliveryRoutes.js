const express = require("express");
const router = express.Router();
const {
  updateAvailability,
  getDeliveryBoyProfile,
  updateLocation,
  getAssignedOrders,
  getOrderHistory,
  acceptOrder,
  completeOrder,
  getDeliveryStats,
  getAvailableDeliveryBoys,
  assignOrderToDeliveryBoy,
  redeemPoints,
  getRedemptionProducts
} = require("../controllers/deliveryController");
const protect = require("../middleWares/authMiddleware");

// Delivery boy routes - all require authentication
router.put("/availability", protect, updateAvailability);
router.get("/profile", protect, getDeliveryBoyProfile);
router.put("/location", protect, updateLocation);
router.get("/orders", protect, getAssignedOrders);
router.get("/order-history", protect, getOrderHistory);
router.put("/orders/:orderId/accept", protect, acceptOrder);
router.put("/orders/:orderId/complete", protect, completeOrder);
router.get("/stats", protect, getDeliveryStats);
router.post("/redeem-points", protect, redeemPoints);
router.get("/redemption-products", protect, getRedemptionProducts);

// Admin routes for delivery management
router.get("/available", getAvailableDeliveryBoys);
router.post("/assign", assignOrderToDeliveryBoy);

module.exports = router;