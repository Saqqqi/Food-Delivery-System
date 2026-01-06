const LiveChat = require('../models/LiveChat');
const User = require('../models/User');
const mongoose = require('mongoose');

// Get chat history for a specific user
const getUserChatHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Handle both string and ObjectId userId
        const query = mongoose.Types.ObjectId.isValid(userId) 
            ? { userId: new mongoose.Types.ObjectId(userId) }
            : { userId: userId };
            
        const messages = await LiveChat.find(query)
            .sort({ timestamp: 1 });
            
        res.json(messages);
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ error: 'Failed to fetch chat history' });
    }
};

// Get all users who have chatted (for admin dashboard)
const getChatUsers = async (req, res) => {
    try {
        // Get unique users who have sent messages
        const users = await LiveChat.aggregate([
            {
                $group: {
                    _id: "$userId",
                    userName: { $first: "$userName" },
                    lastMessage: { $last: "$message" },
                    lastMessageTime: { $last: "$timestamp" },
                    unreadCount: {
                        $sum: {
                            $cond: [{ $eq: ["$isRead", false] }, 1, 0]
                        }
                    }
                }
            },
            {
                $sort: { lastMessageTime: -1 }
            }
        ]);
        
        // Populate user details for valid ObjectIds
        const usersWithDetails = await Promise.all(users.map(async (user) => {
            try {
                // Check if userId is a valid ObjectId
                if (mongoose.Types.ObjectId.isValid(user._id)) {
                    const userDetails = await User.findById(user._id).select('name email');
                    if (userDetails) {
                        return {
                            ...user,
                            name: userDetails.name,
                            email: userDetails.email
                        };
                    }
                }
                // Return user with available data
                return {
                    ...user,
                    name: user.userName,
                    email: ''
                };
            } catch (err) {
                // If user not found, return with available data
                return {
                    ...user,
                    name: user.userName,
                    email: ''
                };
            }
        }));
        
        res.json(usersWithDetails);
    } catch (error) {
        console.error('Error fetching chat users:', error);
        res.status(500).json({ error: 'Failed to fetch chat users' });
    }
};

// Mark messages as read
const markMessagesAsRead = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Handle both string and ObjectId userId
        const query = mongoose.Types.ObjectId.isValid(userId) 
            ? { userId: new mongoose.Types.ObjectId(userId), isRead: false, sender: 'user' }
            : { userId: userId, isRead: false, sender: 'user' };
            
        await LiveChat.updateMany(
            query,
            { isRead: true }
        );
        
        res.json({ message: 'Messages marked as read' });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({ error: 'Failed to mark messages as read' });
    }
};

// Save a new message
const saveMessage = async (data) => {
    try {
        const { userId, userName, message, sender } = data;
        
        // Validate userId format
        let validUserId = userId;
        if (typeof userId !== 'string' && !mongoose.Types.ObjectId.isValid(userId)) {
            validUserId = userId.toString();
        }
        
        const newMessage = new LiveChat({
            userId: validUserId,
            userName,
            message,
            sender
        });
        
        await newMessage.save();
        console.log('Message saved successfully:', newMessage);
        return newMessage;
    } catch (error) {
        console.error('Error saving message:', error);
        return null;
    }
};

module.exports = {
    getUserChatHistory,
    getChatUsers,
    markMessagesAsRead,
    saveMessage
};