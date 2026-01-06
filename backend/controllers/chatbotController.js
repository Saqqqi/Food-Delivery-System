require('dotenv').config();
const fetch = require('node-fetch'); // Only if you're using Node.js < 18
const ChatHistory = require('../models/chatHistory');
const mongoose = require('mongoose');

// Handle chat messages and store in history
const handleChat = async (req, res) => {
  const { message, userId, tabId, tabName } = req.body;
  console.log('Received request at /chatbot/chat:', message);
  console.log('Using ApiAIserg-osipchukV1 API endpoint');

  try {
    // Format data as URL-encoded form data
    const formData = new URLSearchParams();
    formData.append('message', message); // Add message to form data
    
    // Call the RapidAPI ApiAIserg-osipchukV1 endpoint
    const response = await fetch('https://apiaiserg-osipchukv1.p.rapidapi.com/addContext', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'x-rapidapi-host': 'ApiAIserg-osipchukV1.p.rapidapi.com',
        'x-rapidapi-key': process.env.RAPIDAPI_KEY || 'adb1dfb765msh0886fee387b445ep181a8bjsn9e2506d4654a', // Use your RapidAPI key from .env
      },
      body: formData.toString(), // Send as form-encoded data
    });

    const data = await response.json();
    console.log('RapidAPI raw response:', JSON.stringify(data, null, 2));
    console.log('Response status:', response.status);
    console.log('Response OK:', response.ok);

    // Check for errors in response body (even if status is 200)
    if (data.status === false || data.Error) {
      const errorMessage = data.Error || data.message || 'Something went wrong with the API';
      console.error('RapidAPI returned error in response body:', errorMessage);
      throw new Error(`API Error: ${errorMessage}`);
    }

    if (!response.ok) {
      if (response.status === 400) {
        throw new Error('Bad request: Check if the message format is correct.');
      } else if (response.status === 401) {
        throw new Error('Unauthorized: Invalid or missing API key.');
      } else if (response.status === 404) {
        throw new Error('Endpoint not found: Check the API endpoint.');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded: Too many requests.');
      } else if (response.status === 500) {
        throw new Error('Server error: Try again later.');
      } else {
        throw new Error(`RapidAPI error: ${data.message || response.statusText}`);
      }
    }

    // Extract the bot's reply (adjust based on actual API response structure)
    // Handle different response formats - OpenAI-style, result array, or direct fields
    let reply = null;
    
    // Check for answer field first (common in Q&A APIs)
    if (data.answer && typeof data.answer === 'string') {
      reply = data.answer;
    }
    // Check for OpenAI-style response (choices array)
    else if (data.choices && Array.isArray(data.choices) && data.choices.length > 0) {
      const choice = data.choices[0];
      reply = choice.message?.content || choice.text || choice.content || choice.message?.text || null;
    }
    // Check if result is an array
    else if (Array.isArray(data.result)) {
      if (data.result.length > 0) {
        // If array has elements, try to extract text from first element
        reply = typeof data.result[0] === 'string' 
          ? data.result[0] 
          : (data.result[0]?.text || data.result[0]?.message || data.result[0]?.content || String(data.result[0]));
      } else {
        // Empty array - check other fields
        console.warn('Result is an empty array, checking other response fields...');
        reply = data.answer || data.data || data.output || data.response || data.message || data.reply || data.text || data.content || null;
      }
    } 
    // Check if result is a string
    else if (data.result && typeof data.result === 'string') {
      reply = data.result;
    } 
    // Check if result is an object
    else if (data.result && typeof data.result === 'object') {
      reply = data.result.answer || data.result.text || data.result.message || data.result.content || data.result.response || String(data.result);
    }
    // Check for direct response fields
    else if (data.response) {
      reply = typeof data.response === 'string' ? data.response : (data.response.answer || data.response.text || data.response.content || String(data.response));
    }
    // Try other possible fields (prioritize answer for Q&A APIs)
    else {
      reply = data.answer || data.data || data.output || data.message || data.reply || data.text || data.content || null;
    }
    
    // Ensure reply is a string and not empty
    if (!reply || (typeof reply !== 'string') || reply.trim().length === 0) {
      console.error('No valid reply found in response.');
      console.error('Response structure:', Object.keys(data));
      console.error('Full response:', JSON.stringify(data, null, 2));
      throw new Error('The API did not return a valid response. The result was empty. Please check your API key and try again.');
    }
    
    // Convert to string to ensure it's not an array or object
    reply = String(reply).trim();
    
    console.log('RapidAPI reply extracted successfully:', reply.substring(0, 100) + '...');
    
    // Store the conversation in the database
    if (userId && tabId) {
      try {
        console.log('Attempting to save chat history with userId:', userId, 'and tabId:', tabId);
        // Handle both MongoDB ObjectIds and anonymous users
        const userObjectId = userId === 'anonymous' ? 'anonymous' :
          (mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : null);
        
        if (userObjectId) {
          console.log('Valid userObjectId:', userObjectId);
          // Find or create chat history for this user and tab
          let chatHistory = await ChatHistory.findOne({ 
            userId: userObjectId, 
            tabId: tabId 
          });
          
          console.log('Existing chat history found:', chatHistory ? 'Yes' : 'No');
          
          if (!chatHistory) {
            console.log('Creating new chat history with tabName:', tabName || 'New Chat');
            chatHistory = new ChatHistory({
              userId: userObjectId,
              tabId: tabId,
              tabName: tabName || 'New Chat',
              messages: []
            });
          }
          
          // Add user message
          chatHistory.messages.push({
            sender: 'user',
            text: message,
            timestamp: new Date()
          });
          console.log('Added user message to chat history');
          
          // Add bot response
          chatHistory.messages.push({
            sender: 'bot',
            text: reply,
            timestamp: new Date()
          });
          console.log('Added bot response to chat history');
          
          // Update the timestamp
          chatHistory.updatedAt = new Date();
          
          await chatHistory.save();
          console.log('Chat history saved successfully with', chatHistory.messages.length, 'messages');
        } else {
          console.error('Invalid userId format:', userId);
        }
      } catch (dbError) {
        console.error('Error saving chat history:', dbError);
        // Continue with the response even if saving history fails
      }
    } else {
      console.log('Missing userId or tabId, cannot save chat history. userId:', userId, 'tabId:', tabId);
    }
    
    res.json({ reply });
  } catch (error) {
    console.error('RapidAPI error:', error.message);
    res.status(500).json({ error: 'Error processing your request: ' + error.message });
  }
};

// Get all chat tabs for a user
const getUserChatTabs = async (req, res) => {
  const { userId } = req.params;
  
  try {
    // Handle both MongoDB ObjectIds and anonymous users
    const userObjectId = userId === 'anonymous' ? 'anonymous' :
      (mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : null);
    
    if (!userObjectId) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }
    
    // Find all chat histories for this user
    const chatHistories = await ChatHistory.find({ userId: userObjectId })
      .select('tabId tabName updatedAt')
      .sort({ updatedAt: -1 });
    
    res.json(chatHistories);
  } catch (error) {
    console.error('Error fetching chat tabs:', error);
    res.status(500).json({ error: 'Error fetching chat tabs: ' + error.message });
  }
};

// Get chat history for a specific tab
const getChatHistory = async (req, res) => {
  const { userId, tabId } = req.params;
  
  try {
    // Handle both MongoDB ObjectIds and anonymous users
    const userObjectId = userId === 'anonymous' ? 'anonymous' :
      (mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : null);
    
    if (!userObjectId) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }
    
    // Find chat history for this user and tab
    const chatHistory = await ChatHistory.findOne({ 
      userId: userObjectId, 
      tabId: tabId 
    });
    
    if (!chatHistory) {
      return res.status(404).json({ error: 'Chat history not found' });
    }
    
    res.json(chatHistory);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Error fetching chat history: ' + error.message });
  }
};

// Create a new chat tab
const createChatTab = async (req, res) => {
  const { userId, tabName } = req.body;
  
  console.log('createChatTab called with userId:', userId, 'tabName:', tabName);
  
  try {
    // Handle both MongoDB ObjectIds and anonymous users
    const userObjectId = userId === 'anonymous' ? 'anonymous' :
      (mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : null);
    
    if (!userObjectId) {
      console.error('Invalid userId format in createChatTab:', userId);
      return res.status(400).json({ error: 'Invalid user ID format' });
    }
    
    console.log('Valid userObjectId in createChatTab:', userObjectId);
    
    // Generate a unique tabId
    const tabId = new mongoose.Types.ObjectId().toString();
    console.log('Generated new tabId:', tabId);
    
    // Create a new chat history with proper timestamp initialization
    const chatHistory = new ChatHistory({
      userId: userObjectId,
      tabId: tabId,
      tabName: tabName || 'New Chat',
      messages: [],
      updatedAt: new Date() // Explicitly set updatedAt to ensure it's not undefined
    });
    
    console.log('Saving new chat history with tabName:', chatHistory.tabName);
    await chatHistory.save();
    console.log('New chat tab created successfully with tabId:', tabId);
    
    res.status(201).json(chatHistory);
  } catch (error) {
    console.error('Error creating chat tab:', error);
    res.status(500).json({ error: 'Error creating chat tab: ' + error.message });
  }
};

// Update chat tab name
const updateChatTabName = async (req, res) => {
  const { userId, tabId } = req.params;
  const { tabName } = req.body;
  
  try {
    // Handle both MongoDB ObjectIds and anonymous users
    const userObjectId = userId === 'anonymous' ? 'anonymous' : 
      mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : undefined;
    
    if (!userObjectId) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }
    
    // Find and update chat history
    const chatHistory = await ChatHistory.findOneAndUpdate(
      { userId: userObjectId, tabId: tabId },
      { tabName: tabName },
      { new: true }
    );
    
    if (!chatHistory) {
      return res.status(404).json({ error: 'Chat history not found' });
    }
    
    res.json(chatHistory);
  } catch (error) {
    console.error('Error updating chat tab name:', error);
    res.status(500).json({ error: 'Error updating chat tab name: ' + error.message });
  }
};

// Clear chat history (without deleting the tab)
const clearChatHistory = async (req, res) => {
  const { userId, tabId } = req.params;
  
  try {
    // Handle both MongoDB ObjectIds and anonymous users
    const userObjectId = userId === 'anonymous' ? 'anonymous' :
      (mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : null);
    
    if (!userObjectId) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }
    
    // Find and update chat history to clear messages
    const chatHistory = await ChatHistory.findOneAndUpdate(
      { userId: userObjectId, tabId: tabId },
      { 
        messages: [],
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!chatHistory) {
      return res.status(404).json({ error: 'Chat history not found' });
    }
    
    res.json({ message: 'Chat history cleared successfully' });
  } catch (error) {
    console.error('Error clearing chat history:', error);
    res.status(500).json({ error: 'Error clearing chat history: ' + error.message });
  }
};

// Delete a chat tab
const deleteChatTab = async (req, res) => {
  const { userId, tabId } = req.params;
  
  try {
    // Convert string userId to ObjectId
    const userObjectId = mongoose.Types.ObjectId.isValid(userId) ? 
      new mongoose.Types.ObjectId(userId) : null;
    
    if (!userObjectId) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }
    
    // Find and delete chat history
    const result = await ChatHistory.findOneAndDelete({ 
      userId: userObjectId, 
      tabId: tabId 
    });
    
    if (!result) {
      return res.status(404).json({ error: 'Chat history not found' });
    }
    
    res.json({ message: 'Chat tab deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat tab:', error);
    res.status(500).json({ error: 'Error deleting chat tab: ' + error.message });
  }
};

module.exports = { 
  handleChat,
  getUserChatTabs,
  getChatHistory,
  createChatTab,
  updateChatTabName,
  deleteChatTab,
  clearChatHistory
};