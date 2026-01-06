const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Get all users (admin only) - secure version
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({})
            .select('name email role verified loyaltyPoints createdAt authProvider password resetToken resetTokenExpiry')
            .sort({ createdAt: -1 });
        
        res.json({
            message: "Users retrieved successfully",
            count: users.length,
            users: users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            message: "Failed to fetch users"
        });
    }
};

// Get user details by ID (admin only)
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password -resetToken -resetTokenExpiry');
        
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        
        res.json(user);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch user"
        });
    }
};

// Reset user password (admin only) - secure way to handle passwords
exports.resetUserPassword = async (req, res) => {
    try {
        const { userId, newPassword } = req.body;
        
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters long"
            });
        }
        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        const user = await User.findByIdAndUpdate(
            userId,
            { password: hashedPassword },
            { new: true }
        ).select('name email role');
        
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        
        res.json({
            message: "Password reset successfully",
            user: user
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to reset password"
        });
    }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        
        res.json({
            message: "User deleted successfully",
            deletedUser: {
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete user"
        });
    }
};

// Update user role (admin only)
// Add password to user (for users without password)
exports.addPassword = async (req, res) => {
    try {
        const { newPassword } = req.body;
        const userId = req.params.id; // Get userId from URL parameter
        
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters long"
            });
        }
        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        const user = await User.findByIdAndUpdate(
            userId,
            { 
                password: hashedPassword,
                authProvider: 'local' // Set to local auth when password is added
            },
            { new: true }
        ).select('name email role');
        
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        
        res.json({
            message: "Password added successfully",
            user: user
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to add password"
        });
    }
};

// Update user password (for users with existing password)
exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.params.id; // Get userId from URL parameter
        
        console.log('Update password request:', {
            userId,
            currentPassword: currentPassword ? 'provided' : 'not provided',
            newPassword: newPassword ? 'provided' : 'not provided',
            newPasswordLength: newPassword ? newPassword.length : 0
        });
        
        if (!newPassword || newPassword.length < 6) {
            console.log('Password validation failed:', { newPassword: newPassword || 'undefined', length: newPassword ? newPassword.length : 0 });
            return res.status(400).json({
                message: "New password must be at least 6 characters long"
            });
        }
        
        const user = await User.findById(userId);
        if (!user) {
            console.log('User not found:', userId);
            return res.status(404).json({
                message: "User not found"
            });
        }
        
        console.log('User found:', { id: user._id, hasPassword: !!user.password });
        
        // Verify current password if provided
        if (currentPassword && user.password) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                console.log('Current password verification failed');
                return res.status(400).json({
                    message: "Current password is incorrect"
                });
            }
        }
        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { password: hashedPassword },
            { new: true }
        ).select('name email role');
        
        res.json({
            message: "Password updated successfully",
            user: updatedUser
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update password"
        });
    }
};

// Verify password against hash
exports.verifyPassword = async (req, res) => {
    try {
        const { testPassword } = req.body;
        const userId = req.params.id; // Get userId from URL parameter
        
        if (!testPassword) {
            return res.status(400).json({
                message: "Test password is required"
            });
        }
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        
        if (!user.password) {
            return res.status(400).json({
                message: "User has no password to verify against"
            });
        }
        
        const isValid = await bcrypt.compare(testPassword, user.password);
        
        res.json({
            message: isValid ? "Password matches" : "Password does not match",
            isValid: isValid,
            hash: user.password,
            testPassword: testPassword
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to verify password"
        });
    }
};

// Update user role (admin only)
exports.updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        
        if (!['user', 'admin', 'delivery_boy'].includes(role)) {
            return res.status(400).json({
                message: "Invalid role"
            });
        }
        
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select('name email role');
        
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        
        res.json({
            message: "User role updated successfully",
            user: user
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update user role"
        });
    }
};
