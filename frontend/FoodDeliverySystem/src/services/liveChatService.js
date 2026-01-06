import axios from 'axios';

const API_BASE_URL = 'http://localhost:3005/api/live-chat';

// Get chat history for a specific user
export const getUserChatHistory = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/history/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching chat history:', error);
    throw error;
  }
};

// Get all users who have chatted (for admin dashboard)
export const getChatUsers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users`);
    return response.data;
  } catch (error) {
    console.error('Error fetching chat users:', error);
    throw error;
  }
};

// Mark user messages as read
export const markMessagesAsRead = async (userId) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/read/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

export default {
  getUserChatHistory,
  getChatUsers,
  markMessagesAsRead
};