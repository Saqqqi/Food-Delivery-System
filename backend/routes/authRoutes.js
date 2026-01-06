const express = require("express");
const router = express.Router();
const {
  register, login, getProfile, updateProfile, deleteProfile,
  forgotPassword, resetPassword, verifyEmail, getResetPasswordForm,
  firebaseGoogleAuth, firebaseRegister, firebaseLogin
} = require("../controllers/authController");
const protect = require("../middleWares/authMiddleware");

router.post("/register", register);
router.get("/verify/:token", verifyEmail);
router.post("/login", login);
router.get("/me", protect, getProfile);
router.put("/me", protect, updateProfile);
router.delete("/me", protect, deleteProfile);
router.post("/forgot-password", forgotPassword);
router.get("/reset-password/:token", getResetPasswordForm);
router.post("/reset-password/:token", resetPassword);

// Firebase authentication routes
router.post("/firebase-google", firebaseGoogleAuth);
router.post("/firebase-register", firebaseRegister);
router.post("/firebase-login", firebaseLogin);

module.exports = router;
