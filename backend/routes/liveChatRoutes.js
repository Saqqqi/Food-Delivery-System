const express = require('express');
const router = express.Router();
const {
    getUserChatHistory,
    getChatUsers,
    markMessagesAsRead
} = require('../controllers/liveChatController');

// Get chat history for a specific user
router.get('/history/:userId', getUserChatHistory);

// Get all users who have chatted (for admin)
router.get('/users', getChatUsers);

// Mark user messages as read
router.put('/read/:userId', markMessagesAsRead);

module.exports = router;