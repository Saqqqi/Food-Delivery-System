import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const TypingAnimation = () => {
  return (
    <div className="flex space-x-1">
      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce1"></div>
      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce2"></div>
      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce3"></div>
    </div>
  );
};

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState('');
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState(null);
  const [chatTabs, setChatTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);

  const { currentUser } = useAuth();

  const API_ENDPOINT = process.env.REACT_APP_API_URL || 'http://localhost:3005';
  const CHATBOT_API = `${API_ENDPOINT}/chatbot/chat`;
  const CHAT_TABS_API = `${API_ENDPOINT}/chatbot/tabs`;
  const CHAT_HISTORY_API = `${API_ENDPOINT}/chatbot/history`;
  const CREATE_TAB_API = `${API_ENDPOINT}/chatbot/tabs`;

  const predefinedQuestionsAndAnswers = {
    "What types of burgers do you offer?": "We offer Classic Beef Burger, Cheeseburger, and Veggie Burger. Which one would you like to try?",
    "What are the prices of your pizzas?": "Our pizzas start at $10 for a Margherita, $12 for a Pepperoni, and $15 for a Deluxe. Would you like to order one?",
    "Do you deliver to my area?": "We deliver within a 5-mile radius of Lahore, Punjab, Pakistan. Please provide your address, and I can check for you!",
    "What are the current promotions?": "Get 20% off on all pizzas this week! Also, free delivery on orders over $20. Ready to place an order?",
    "How can I place an order?": "You can place an order directly on our website by selecting your items and checking out, or call us at 123-456-7890. Need help with the menu?"
  };

  const predefinedQuestions = Object.keys(predefinedQuestionsAndAnswers);

  // Fetch chat tabs for the user
  // Fetch chat tabs for the user
  const fetchChatTabs = useCallback(async () => {
    try {
      const userId = currentUser?._id || currentUser?.uid || 'anonymous';
      console.log('Fetching chat tabs for userId:', userId);
      const response = await axios.get(`${CHAT_TABS_API}/${userId}`);
      console.log('Chat tabs fetched:', JSON.stringify(response.data, null, 2));
      setChatTabs(response.data);
      if (!activeTabId && response.data.length > 0) {
        const targetTab = response.data.find(tab => tab.tabId === 'anonymous-1756048150015') || response.data[0];
        console.log('Setting active tab to:', targetTab.tabId);
        setActiveTabId(targetTab.tabId);
      }
    } catch (error) {
      console.error('Error fetching chat tabs:', error);
      setError('Failed to fetch chat tabs');
    }
  }, [currentUser, CHAT_TABS_API, activeTabId]);

  // Fetch chat history for a specific tab
  // Fetch chat history for a specific tab
  const fetchChatHistory = useCallback(async (tabId) => {
    try {
      const userId = currentUser?._id || currentUser?.uid || 'anonymous';
      console.log('Fetching chat history for userId:', userId, 'tabId:', tabId);
      const response = await axios.get(`${CHAT_HISTORY_API}/${userId}/${tabId}`);
      console.log('Chat history fetched:', JSON.stringify(response.data.messages, null, 2));
      setMessages(response.data.messages || []);
      setInitialized(true);
      setError(null);
      return response.data.messages || [];
    } catch (error) {
      console.error('Error fetching chat history:', error);
      setError('Failed to fetch chat history');
      setInitialized(true);
      return [];
    }
  }, [currentUser, CHAT_HISTORY_API]);

  // Start a new chat tab
  const handleStartNewChat = async () => {
    try {
      const userId = currentUser?._id || currentUser?.uid || 'anonymous';
      // Use a consistent date format for the tab name
      const today = new Date();
      const formattedDate = today.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      const tabName = `Chat - ${formattedDate}`;
      console.log('Creating new chat tab for userId:', userId, 'with tabName:', tabName);
      const response = await axios.post(CREATE_TAB_API, { userId, tabName });
      const newTab = response.data;
      console.log('New chat tab created:', JSON.stringify(newTab, null, 2));
      setChatTabs((prev) => [newTab, ...prev]);
      setActiveTabId(newTab.tabId);
      setMessages([]);
      setInitialized(false);
      setError(null);
    } catch (error) {
      console.error('Error creating new chat tab:', error);
      setError('Failed to create new chat tab');
    }
  };

  // Handle chat tab selection
  const handleTabSelect = (tabId) => {
    console.log('Switching to tab:', tabId);
    setActiveTabId(tabId);
    setMessages([]);
    setInitialized(false);
    fetchChatHistory(tabId);
  };

  // Handle sending messages
  const handleSend = async () => {
    if (!input.trim() && !selectedQuestion) return;

    let userMessageText = input.trim() || selectedQuestion;
    // Add timestamp to user message
    const userMessage = {
      sender: 'user',
      text: userMessageText,
      timestamp: new Date().toISOString()
    };
    console.log('Sending user message:', JSON.stringify(userMessage, null, 2));
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setSelectedQuestion('');
    setIsBotTyping(true);

    try {
      const userId = currentUser?._id || currentUser?.uid || 'anonymous';
      const tabId = activeTabId || `${userId}-${Date.now()}`;
      const tabName = chatTabs.find((tab) => tab.tabId === activeTabId)?.tabName || `Chat - ${new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })}`;
      console.log('Sending to API: userId:', userId, 'tabId:', tabId, 'message:', userMessageText);

      if (userMessageText.toLowerCase() === 'hello') {
        console.log('Detected greeting, responding with welcome message');
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            sender: 'bot',
            text: "Hello! Welcome to FoodieFly. How can I help you today? You can ask me about our menu, prices, or delivery options.",
            timestamp: new Date().toISOString()
          }
        ]);
      } else if (predefinedQuestionsAndAnswers[userMessageText]) {
        console.log('Found predefined question, responding with:', predefinedQuestionsAndAnswers[userMessageText]);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            sender: 'bot',
            text: predefinedQuestionsAndAnswers[userMessageText],
            timestamp: new Date().toISOString()
          }
        ]);
      } else {
        console.log('Sending custom question to API');
        const response = await axios.post(CHATBOT_API, {
          message: userMessageText,
          userId,
          tabId,
          tabName
        });
        console.log('API response:', JSON.stringify(response.data.reply, null, 2));
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            sender: 'bot',
            text: response.data.reply,
            timestamp: new Date().toISOString()
          }
        ]);
        setError(null);
      }
    } catch (error) {
      console.error('Error fetching response from API:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          sender: 'bot',
          text: "Sorry, I'm not sure about that. Please ask about our burgers, pizzas, or store!",
          timestamp: new Date().toISOString()
        }
      ]);
      setError('Failed to connect to chatbot service');
    } finally {
      setIsBotTyping(false);
    }
  };

  // Render formatted text
  const renderFormattedText = (text) => {
    const lines = text.split('\n');
    return lines.map((line, index) => {
      const listMatch = line.match(/^(\d+)\.\s*(.*)$/);
      if (listMatch) {
        const [, number, content] = listMatch;
        return (
          <div key={index} className="ml-4">
            <span className="font-bold">{number}. </span>
            {content}
          </div>
        );
      }
      return <div key={index}>{line || <br />}</div>;
    });
  };

  // Clear chat history
  const handleClearChat = async () => {
    try {
      console.log('Clearing chat history for tabId:', activeTabId);
      const userId = currentUser?._id || currentUser?.uid || 'anonymous';

      // Instead of deleting the tab, we'll just clear the messages
      // Send a request to the backend to clear messages for this tab
      await axios.post(`${API_ENDPOINT}/chatbot/clear/${userId}/${activeTabId}`);

      // Clear messages in the frontend
      setMessages([]);
      setSelectedQuestion('');
      setInitialized(false);
      setError(null);
    } catch (error) {
      console.error('Error clearing chat history:', error);
      setError('Failed to clear chat history');
    }
  };

  // Fetch chat tabs when chat is opened
  useEffect(() => {
    if (isOpen) {
      console.log('Chatbot opened, fetching chat tabs');
      fetchChatTabs();
    }
  }, [isOpen, fetchChatTabs]);

  // Fetch chat history when activeTabId changes
  useEffect(() => {
    if (isOpen && activeTabId) {
      console.log('Active tab changed, fetching history for tabId:', activeTabId);
      fetchChatHistory(activeTabId);
    }
  }, [activeTabId, isOpen, fetchChatHistory]);

  // Display welcome message only for new tabs with no history
  // Display welcome message only for new tabs with no history
  useEffect(() => {
    if (isOpen && !initialized && activeTabId) {
      console.log('Checking if tab is new for tabId:', activeTabId);
      fetchChatHistory(activeTabId).then((history) => {
        console.log('History check complete for tabId:', activeTabId, 'History length:', history.length);
        if (history.length === 0) {
          console.log('No history found, showing welcome message for tabId:', activeTabId);
          setIsBotTyping(true);
          setTimeout(() => {
            setMessages([
              {
                sender: 'bot',
                text: "Welcome to FoodieFly Chat! How can I help you today? You can ask me about our menu, prices, or delivery options.",
                timestamp: new Date().toISOString() // Add timestamp to welcome message
              }
            ]);
            setIsBotTyping(false);
            setInitialized(true);
          }, 500);
        } else {
          console.log('History found, skipping welcome message for tabId:', activeTabId);
          setMessages(history); // Ensure messages are set from history
          setInitialized(true);
        }
      });
    }
  }, [isOpen, initialized, activeTabId, fetchChatHistory]);

  // Reset error when chat is closed
  useEffect(() => {
    if (!isOpen) {
      console.log('Chatbot closed, resetting state');
      setError(null);
      setMessages([]);
      setActiveTabId(null);
      setInitialized(false);
    }
  }, [isOpen]);

  // Handle question selection
  const handleQuestionSelect = (question) => {
    console.log('Selected predefined question:', question);
    setSelectedQuestion(question);
    setTimeout(() => {
      handleSend();
    }, 0);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {isOpen && (
        <div className="bg-gray-900 shadow-lg rounded-lg w-96 h-[400px] flex flex-col border border-gray-700">
          <div className="bg-yellow-500 p-3 font-bold text-black flex justify-between items-center rounded-t-lg">
            <span>FoodieFly ChatBot</span>
            <div>
              <button onClick={handleStartNewChat} className="text-black font-bold mr-2 hover:text-gray-800">
                New Chat
              </button>
              <button onClick={handleClearChat} className="text-black font-bold mr-2 hover:text-gray-800">
                Clear
              </button>
              <button onClick={() => setIsOpen(false)} className="text-black font-bold hover:text-gray-800">
                X
              </button>
            </div>
          </div>
          {/* Chat Tabs Dropdown */}
          <div className="p-2 border-b border-gray-700">
            <select
              value={activeTabId || ''}
              onChange={(e) => handleTabSelect(e.target.value)}
              className="w-full bg-gray-800 text-white border border-gray-600 rounded-md p-1 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">Select a chat...</option>
              {chatTabs.map((tab) => (
                <option key={tab.tabId} value={tab.tabId}>
                  {tab.tabName} (Last updated: {tab.updatedAt ? new Date(tab.updatedAt).toLocaleDateString() : 'Just now'})
                </option>
              ))}
            </select>
          </div>
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm max-h-[250px]">
            {error && <div className="text-red-500 text-center">{error}</div>}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-2 rounded-md ${msg.sender === 'user' ? 'bg-yellow-500 text-black ml-10 text-right' : 'bg-gray-700 text-white mr-10 text-left'
                  }`}
              >
                {msg.sender === 'bot' ? renderFormattedText(msg.text) : msg.text}
                <div className="text-xs text-gray-400 mt-1">
                  {msg.timestamp ? new Date(msg.timestamp).toLocaleString() : 'Just now'}
                </div>
              </div>
            ))}
            {isBotTyping && (
              <div className="p-2 rounded-md bg-gray-700 text-white mr-10 text-left">
                <TypingAnimation />
              </div>
            )}
          </div>
          {/* Input Area */}
          <div className="flex flex-col p-2 border-t border-gray-700">
            <select
              value={selectedQuestion}
              onChange={(e) => handleQuestionSelect(e.target.value)}
              className="w-full bg-gray-800 text-white border border-gray-600 rounded-md p-1 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">Select a question...</option>
              {predefinedQuestions.map((question, idx) => (
                <option key={idx} value={question}>
                  {question}
                </option>
              ))}
            </select>
            <div className="flex">
              <input
                type="text"
                className="flex-1 bg-gray-800 text-white border border-gray-600 rounded-l-md p-1 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message or select a question..."
              />
              <button
                onClick={handleSend}
                className="bg-yellow-500 px-4 rounded-r-md text-black text-sm hover:bg-yellow-600 transition duration-300"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-yellow-500 text-black font-bold py-2 px-4 rounded-full shadow-lg hover:bg-yellow-600 transition duration-300"
          style={{
            width: '64px',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            right: '20px',
            bottom: '20px',
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            fill="currentColor"
            className="bi bi-chat"
            viewBox="0 0 16 16"
          >
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
            <path d="M5 6a1 1 0 0 1 1-1h6a1 1 0 0 1 0 2H6a1 1 0 0 1-1-1zm0 3a1 1 0 0 1 1-1h6a1 1 0 0 1 0 2H6a1 1 0 0 1-1-1zm0 3a1 1 0 0 1 1-1h3a1 1 0 0 1 0 2H6a1 1 0 0 1-1-1z" />
          </svg>
        </button>
      )}
    </div>
  );
};

// Inline CSS for the typing animation
const styles = `
  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-5px);
    }
  }
  .animate-bounce1 {
    animation: bounce 0.6s infinite;
  }
  .animate-bounce2 {
    animation: bounce 0.6s infinite 0.2s;
  }
  .animate-bounce3 {
    animation: bounce 0.6s infinite 0.4s;
  }
`;

const styleSheet = document.createElement('style');
styleSheet.type = 'text/css';
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default ChatBot;