const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const transporter = require("../config/nodemailer");
const crypto = require("crypto");
const {
    auth: firebaseAuth
} = require("../config/firebase");

exports.register = async (req, res) => {
    const {
        name,
        email,
        password,
        role,
        vehicleType,
        licenseNumber,
        phoneNumber,
        referralCode
    } = req.body;
    try {
        const existing = await User.findOne({
            email
        });
        if (existing) return res.status(400).json({
            message: "Email already exists"
        });

        const hashed = await bcrypt.hash(password, 10);
        const userData = {
            name,
            email,
            password: hashed,
            role: role || 'user'
        };

        // Add delivery boy specific fields if role is delivery_boy
        if (role === 'delivery_boy') {
            userData.vehicleType = vehicleType;
            userData.licenseNumber = licenseNumber;
            userData.phoneNumber = phoneNumber;
        }

        // Handle referral code if provided
        if (referralCode) {
            // Find the referral in the database
            const Referral = require('../models/Referral');
            const referral = await Referral.findOne({ referralCode });
            
            if (referral) {
                // Set the referredBy field to the referrer's ID
                userData.referredBy = referral.referrer;
                
                // Find the referrer user
                const referrer = await User.findById(referral.referrer);
                
                if (referrer) {
                    // Add 50 loyalty points to the referrer
                    referrer.loyaltyPoints += 50;
                    await referrer.save();
                    
                    // Update the referral document to add this user to the referred array
                    // We'll do this after creating the user
                }
            }
        }

        const user = await User.create(userData);

        // If this user was referred, update the referral document
        if (referralCode) {
            const Referral = require('../models/Referral');
            const referral = await Referral.findOne({ referralCode });
            if (referral) {
                referral.referred.push(user._id);
                referral.pointsAwarded = true;
                await referral.save();
            }
        }

        // Send verification email
        const token = jwt.sign({
            id: user._id
        }, process.env.JWT_SECRET, {
            expiresIn: '1d'
        });
        const url = `${process.env.BASE_URL}/auth/verify/${token}`;

        await transporter.sendMail({
            to: email,
            subject: 'Verify Email',
            html: `<h2>Click to verify: <a href="${url}">Verify</a></h2>`
        });

        res.status(201).json({
            message: "User registered. Check your email to verify."
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
        await User.findByIdAndUpdate(decoded.id, {
            verified: true
        });
        res.send("Email verified successfully");
    } catch {
        res.send("Invalid or expired token");
    }
};

exports.login = async (req, res) => {
    const {
        email,
        password
    } = req.body;
    try {
        const user = await User.findOne({
            email
        });
        if (!user) return res.status(400).json({
            message: "Invalid credentials"
        });

        // If user registered with Firebase, suggest using Firebase login
        if ((user.authProvider === 'firebase-google' || user.authProvider === 'firebase-email') && !user.password) {
            return res.status(400).json({
                message: "This email is registered with Firebase. Please use Firebase authentication.",
                authProvider: 'firebase'
            });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({
            message: "Invalid credentials"
        });

        if (!user.verified) return res.status(403).json({
            message: "Please verify your email"
        });

        const token = jwt.sign({
            id: user._id
        }, process.env.JWT_SECRET);
        res.json({
            token,
            user: {
                name: user.name,
                email: user.email,
                profilePicture: user.profilePicture,
                loyaltyPoints: user.loyaltyPoints,
                role: user.role,
                vehicleType: user.vehicleType,
                licenseNumber: user.licenseNumber,
                phoneNumber: user.phoneNumber,
                isAvailable: user.isAvailable
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            message: "Login failed"
        });
    }
};

exports.getProfile = async (req, res) => {
    console.log('getProfile: req.user:', req.user);
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
        console.log('getProfile: No user found for id', req.user.id);
        return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
};

exports.updateProfile = async (req, res) => {
    const updated = await User.findByIdAndUpdate(req.user.id, req.body, {
        new: true
    });
    res.json(updated);
};

exports.deleteProfile = async (req, res) => {
    await User.findByIdAndDelete(req.user.id);
    res.json({
        message: "User deleted"
    });
};

exports.forgotPassword = async (req, res) => {
    const {
        email
    } = req.body;
    const user = await User.findOne({
        email
    });
    if (!user) return res.status(400).json({
        message: "Email not found"
    });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000;
    await user.save();

    // Use FRONTEND_URL for the reset link to ensure it goes to the React app
    const resetLink = `${process.env.FRONTEND_URL}/foodiefly/auth/reset-password/${token}`;
    await transporter.sendMail({
        to: email,
        subject: 'Reset Password',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
        <p style="color: #555; font-size: 16px;">You requested to reset your password. Please click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #ffc107; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #777; font-size: 14px;">If you didn't request this password reset, you can safely ignore this email.</p>
        <p style="color: #777; font-size: 14px;">This link will expire in 1 hour.</p>
      </div>
    `
    });

    res.json({
        message: "Reset email sent"
    });
};

exports.getResetPasswordForm = async (req, res) => {
    const {
        token
    } = req.params;

    try {
        // Check if token exists and is valid
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: {
                $gt: Date.now()
            }
        });

        if (!user) {
            // If token is invalid, redirect to frontend with error
            return res.redirect(`${process.env.FRONTEND_URL}?error=invalid_token`);
        }

        // If token is valid, redirect to the frontend reset password page
        res.redirect(`${process.env.FRONTEND_URL}/auth/reset-password/${token}`);
    } catch (error) {
        console.error('Error in getResetPasswordForm:', error);
        res.redirect(`${process.env.FRONTEND_URL}?error=server_error`);
    }
};

exports.resetPassword = async (req, res) => {
    const {
        token
    } = req.params;
    const {
        newPassword
    } = req.body;
    const user = await User.findOne({
        resetToken: token,
        resetTokenExpiry: {
            $gt: Date.now()
        }
    });
    if (!user) return res.status(400).json({
        message: "Token invalid or expired"
    });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({
        message: "Password reset successfully"
    });
};

// Authentication middleware
exports.protect = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    console.log('protect middleware: Authorization header:', req.headers.authorization);
    if (!token) {
        console.log('protect middleware: No token found');
        return res.status(401).json({
            message: "Unauthorized"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('protect middleware: Decoded JWT:', decoded);
        req.user = decoded;
        next();
    } catch (error) {
        console.log('protect middleware: Invalid token', error);
        return res.status(401).json({
            message: "Invalid token"
        });
    }
};

// Authorization middleware
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: "Forbidden: You do not have permission to perform this action"
            });
        }

        next();
    };
};

// Legacy Google OAuth functions - kept for backward compatibility but deprecated
// These will be removed in future versions as we migrate to Firebase
exports.googleCallback = (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}?error=deprecated_auth_method`);
};

exports.googleSuccess = (req, res) => {
    res.status(410).json({
        message: "This authentication method is deprecated. Please use Firebase authentication."
    });
};

// Firebase Google authentication
exports.firebaseGoogleAuth = async (req, res) => {
    try {
        if (!firebaseAuth) {
            return res.status(503).json({
                message: "Firebase authentication is not configured. Please set up Firebase credentials.",
                code: "FIREBASE_NOT_CONFIGURED"
            });
        }

        const {
            idToken,
            userData
        } = req.body;

        // Verify Firebase ID token
        const decodedToken = await firebaseAuth.verifyIdToken(idToken);

        if (!decodedToken) {
            return res.status(401).json({
                message: "Invalid Firebase token"
            });
        }

        // Check if user exists in MongoDB
        let user = await User.findOne({
            email: userData.email
        });

        if (user) {
            // Update existing user with Firebase info
            user.firebaseUid = userData.uid;
            user.authProvider = 'firebase-google';
            user.verified = userData.emailVerified;
            if (!user.profilePicture && userData.profilePicture) {
                user.profilePicture = userData.profilePicture;
            }
            await user.save();
        } else {
            // Create new user
            user = await User.create({
                name: userData.name,
                email: userData.email,
                firebaseUid: userData.uid,
                profilePicture: userData.profilePicture,
                authProvider: 'firebase-google',
                verified: userData.emailVerified
            });
        }

        // Generate JWT token for backend authentication
        const token = jwt.sign({
            id: user._id
        }, process.env.JWT_SECRET);

        res.json({
            token,
            user: {
                name: user.name,
                email: user.email,
                profilePicture: user.profilePicture,
                loyaltyPoints: user.loyaltyPoints
            }
        });
    } catch (error) {
        console.error('Firebase Google auth error:', error);
        res.status(500).json({
            message: "Authentication failed"
        });
    }
};

// Firebase email/password registration
exports.firebaseRegister = async (req, res) => {
    try {
        if (!firebaseAuth) {
            return res.status(503).json({ 
                message: "Firebase authentication is not configured. Please set up Firebase credentials.",
                code: "FIREBASE_NOT_CONFIGURED"
            });
        }

        const { idToken, userData, role, vehicleType, licenseNumber, phoneNumber } = req.body;
        
        console.log('Registration request received:', { 
            email: userData.email, 
            role, 
            vehicleType, 
            hasLicenseNumber: !!licenseNumber,
            hasPhoneNumber: !!phoneNumber 
        });

        // Verify Firebase ID token
        let decodedToken;
        try {
            decodedToken = await firebaseAuth.verifyIdToken(idToken);
            console.log('Firebase token verified successfully');
        } catch (tokenError) {
            console.error('Firebase token verification failed:', tokenError);
            return res.status(401).json({
                message: "Invalid Firebase token"
            });
        }

        if (!decodedToken) {
            return res.status(401).json({
                message: "Invalid Firebase token"
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            email: userData.email
        });
        if (existingUser) {
            console.log('User already exists with email:', userData.email);
            return res.status(400).json({
                message: "Email already exists"
            });
        }

        // Create new user in MongoDB
        const newUserData = {
            name: userData.name,
            email: userData.email,
            firebaseUid: userData.uid,
            authProvider: 'firebase-email',
            verified: userData.emailVerified,
            role: role || 'user'
        };

        // Add delivery boy specific fields if role is delivery_boy
        if (role === 'delivery_boy') {
            console.log('Adding delivery boy specific fields');
            newUserData.vehicleType = vehicleType;
            newUserData.licenseNumber = licenseNumber;
            newUserData.phoneNumber = phoneNumber;
        }

        console.log('Creating new user with data:', newUserData);
        const user = await User.create(newUserData);
        console.log('User created successfully with ID:', user._id);

        res.status(201).json({
            message: "User registered successfully",
            user: {
                name: user.name,
                email: user.email,
                role: user.role,
                loyaltyPoints: user.loyaltyPoints
            }
        });
    } catch (error) {
        console.error('Firebase registration error:', error);
        res.status(500).json({
            message: "Registration failed: " + error.message
        });
    }
};

// Firebase email/password login
exports.firebaseLogin = async (req, res) => {
    try {
        if (!firebaseAuth) {
            return res.status(503).json({
                message: "Firebase authentication is not configured. Please set up Firebase credentials.",
                code: "FIREBASE_NOT_CONFIGURED"
            });
        }

        const {
            idToken,
            email
        } = req.body;

        console.log('Login request received for email:', email);

        // Verify Firebase ID token
        let decodedToken;
        try {
            decodedToken = await firebaseAuth.verifyIdToken(idToken);
            console.log('Firebase token verified successfully');
        } catch (tokenError) {
            console.error('Firebase token verification failed:', tokenError);
            return res.status(401).json({
                message: "Invalid Firebase token"
            });
        }

        if (!decodedToken) {
            return res.status(401).json({
                message: "Invalid Firebase token"
            });
        }

        // Find user in MongoDB
        const user = await User.findOne({
            email
        });
        if (!user) {
            console.log('User not found with email:', email);
            return res.status(400).json({
                message: "User not found"
            });
        }

        console.log('User found:', { id: user._id, role: user.role });

        // Update Firebase UID if not set
        if (!user.firebaseUid) {
            user.firebaseUid = decodedToken.uid;
            user.authProvider = 'firebase-email';
            await user.save();
            console.log('Updated user with Firebase UID');
        }

        // Generate JWT token for backend authentication
        const token = jwt.sign({
            id: user._id,
            role: user.role
        }, process.env.JWT_SECRET);

        res.json({
            token,
            user: {
                name: user.name,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture,
                loyaltyPoints: user.loyaltyPoints,
                // Include delivery boy specific fields if applicable
                ...(user.role === 'delivery_boy' && {
                    vehicleType: user.vehicleType,
                    licenseNumber: user.licenseNumber,
                    phoneNumber: user.phoneNumber
                })
            }
        });
    } catch (error) {
        console.error('Firebase login error:', error);
        res.status(500).json({
            message: "Login failed: " + error.message
        });
    }
};