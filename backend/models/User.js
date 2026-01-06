const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: {
        type: String,
        unique: true
    },
    password: String,
    verified: {
        type: Boolean,
        default: false
    },
    resetToken: String,
    resetTokenExpiry: Date,
    loyaltyPoints: {
        type: Number,
        default: 0
    },
    bonusPoints: {
        type: Number,
        default: 0
    },
    googleId: String, // Keep for backward compatibility
    firebaseUid: String, // Firebase user ID
    profilePicture: String,
    authProvider: {
        type: String,
        default: 'local'
    }, // 'local', 'google', 'firebase-google', 'firebase-email'
    role: {
        type: String,
        enum: ['user', 'admin', 'delivery_boy'],
        default: 'user'
    },
    // Referral related fields
    referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    referralCode: {
        type: String,
        default: null
    },
    // Delivery boy specific fields
    vehicleType: String, // bike, car, scooter
    licenseNumber: String,
    phoneNumber: String,
    isAvailable: {
        type: Boolean,
        default: true
    },
    currentLocation: {
        latitude: Number,
        longitude: Number
    }
}, {
    timestamps: true
});

const User = mongoose.models.User || mongoose.model('User', userSchema);


module.exports = User;