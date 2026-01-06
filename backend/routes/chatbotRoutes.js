const express = require('express');
const router = express.Router();
const { 
  handleChat, 
  getUserChatTabs, 
  getChatHistory, 
  createChatTab, 
  updateChatTabName, 
  deleteChatTab,
  clearChatHistory
} = require('../controllers/chatbotController');

// Chat message endpoint
router.post('/chat', handleChat);

// Chat history management endpoints
router.get('/tabs/:userId', getUserChatTabs);
router.get('/history/:userId/:tabId', getChatHistory);
router.post('/tabs', createChatTab);
router.put('/tabs/:userId/:tabId', updateChatTabName);
router.post('/clear/:userId/:tabId', clearChatHistory);  // New endpoint for clearing chat
router.delete('/tabs/:userId/:tabId', deleteChatTab);

module.exports = router;