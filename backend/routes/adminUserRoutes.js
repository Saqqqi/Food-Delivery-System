const express = require("express");
const router = express.Router();
const {
    getAllUsers,
    getUserById,
    resetUserPassword,
    deleteUser,
    updateUserRole,
    addPassword,
    updatePassword,
    verifyPassword
} = require("../controllers/adminUserController");
const { authenticateAdminOrKey } = require("../middleWares/auth");

// All routes use admin authentication (either admin-key or JWT)
router.use(authenticateAdminOrKey);

// Get all users with basic info (no passwords)
router.get("/", getAllUsers);

// Get specific user by ID
router.get("/:id", getUserById);

// Add password to user (for users without password)
router.post("/:id/add-password", addPassword);

// Update user password (for users with existing password)
router.put("/:id/update-password", updatePassword);

// Verify password against hash
router.post("/:id/verify-password", verifyPassword);

// Reset user password (secure method)
router.post("/:id/reset-password", resetUserPassword);

// Delete user
router.delete("/:id", deleteUser);

// Update user role
router.put("/:id/role", updateUserRole);

module.exports = router;
