import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import './LiveChat.css';

const LiveChat = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userTyping, setUserTyping] = useState(false);
  const [adminName, setAdminName] = useState('Admin');
  const [emailStatus, setEmailStatus] = useState(''); // For showing email status messages
  const [adminLanguage, setAdminLanguage] = useState('en');

  const languages = [
    { code: 'en', name: 'English', dir: 'ltr' },
    { code: 'ur', name: 'Urdu', dir: 'rtl' },
    { code: 'hi', name: 'Hindi', dir: 'ltr' },
    { code: 'ar', name: 'Arabic', dir: 'rtl' },
    { code: 'es', name: 'Spanish', dir: 'ltr' },
    { code: 'fr', name: 'French', dir: 'ltr' }
  ];

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const userMapRef = useRef(new Map()); // To keep track of users

  // Initialize socket connection
  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io('http://localhost:3005');

    // Register admin with socket server
    socketRef.current.emit('registerAdmin', 'admin123');

    // Listen for new user messages
    socketRef.current.on('newUserMessage', (data) => {
      console.log('Received user message:', data);

      // Add user to users list if not already present
      if (!userMapRef.current.has(data.userId)) {
        const newUser = {
          _id: data.userId,
          name: data.userName,
          email: `${data.userName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
          lastMessage: data.message,
          lastMessageTime: data.timestamp,
          unreadCount: selectedUser && selectedUser._id === data.userId ? 0 : 1
        };

        userMapRef.current.set(data.userId, newUser);
        setUsers(prev => [newUser, ...prev]);
      } else {
        // Update existing user
        setUsers(prev => prev.map(user => {
          if (user._id === data.userId) {
            return {
              ...user,
              lastMessage: data.message,
              lastMessageTime: data.timestamp,
              unreadCount: selectedUser && selectedUser._id === data.userId ? 0 : (user.unreadCount + 1)
            };
          }
          return user;
        }));
      }

      // If this message is from the currently selected user, add to chat
      if (selectedUser && selectedUser._id === data.userId) {
        setChatMessages(prev => [...prev, {
          id: data.messageId,
          sender: 'user',
          text: data.message,
          timestamp: data.timestamp,
          name: data.userName
        }]);
      }
    });

    // Listen for typing indicators
    socketRef.current.on('userTyping', (data) => {
      setUserTyping(data.isTyping);
    });

    // Clean up on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [selectedUser]);

  // Scroll to bottom of chat
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Select a user to chat with
  const handleSelectUser = (user) => {
    setSelectedUser(user);

    // In a real implementation, this would fetch chat history from API
    // For now, we'll just show a welcome message
    setChatMessages([
      {
        id: 1,
        sender: 'admin',
        text: `Hello ${user.name}! How can I help you today?`,
        timestamp: new Date(),
        name: adminName
      }
    ]);

    // Mark user messages as read
    setUsers(prev => prev.map(u =>
      u._id === user._id ? { ...u, unreadCount: 0 } : u
    ));

    // Clear any previous email status
    setEmailStatus('');
  };

  // Function to send email to user
  const handleSendEmail = async () => {
    if (!selectedUser) return;

    try {
      setEmailStatus('Sending email...');

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/support/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: selectedUser.email,
          from: process.env.REACT_APP_FROM_EMAIL || 'noreply@yourrestaurant.com',
          subject: 'Restaurant Support Response',
          text: `Hello ${selectedUser.name},

We've received your message and will review it. We'll connect with you soon.

Best regards,
Restaurant Team`
        })
      });

      const result = await response.json();

      if (result.success) {
        setEmailStatus('Email sent successfully!');
        // Add a message to the chat showing the email was sent
        const emailMsg = {
          id: Date.now(),
          sender: 'system',
          text: `📧 Email sent to ${selectedUser.email}`,
          timestamp: new Date(),
          name: 'System'
        };
        setChatMessages(prev => [...prev, emailMsg]);
      } else {
        setEmailStatus('Failed to send email. Please try again.');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      setEmailStatus('Error sending email. Please try again.');
    }

    // Clear the status message after 3 seconds
    setTimeout(() => {
      setEmailStatus('');
    }, 3000);
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === '' || !selectedUser) return;

    // Add message to UI immediately
    const messageObj = {
      id: Date.now(),
      sender: 'admin',
      text: newMessage,
      timestamp: new Date(),
      name: adminName
    };

    setChatMessages(prev => [...prev, messageObj]);
    setNewMessage('');

    // Send message via socket
    if (socketRef.current) {
      console.log('Sending admin message:', {
        userId: selectedUser._id,
        message: newMessage,
        adminName: adminName
      });
      socketRef.current.emit('adminMessage', {
        userId: selectedUser._id,
        message: newMessage,
        adminName: adminName
      });
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing indicator
    if (!isTyping && socketRef.current && selectedUser) {
      setIsTyping(true);
      socketRef.current.emit('typing', {
        userId: selectedUser._id,
        isTyping: true,
        sender: 'admin'
      });
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (socketRef.current && selectedUser) {
        setIsTyping(false);
        socketRef.current.emit('typing', {
          userId: selectedUser._id,
          isTyping: false,
          sender: 'admin'
        });
      }
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-resize textarea based on content
  const handleTextareaChange = (e) => {
    handleTyping(e);
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
  };

  return (
    <div className="live-chat-container">
      <div className="live-chat-header">
        <h2>Live Chat Support</h2>
      </div>

      <div className="live-chat-content">
        {/* Users List */}
        <div className="users-list">
          <div className="users-list-header">
            <h3>Customers</h3>
          </div>
          <div className="users-list-content">
            {users.length === 0 ? (
              <div className="placeholder-content" style={{ background: 'transparent', border: 'none' }}>
                <p style={{ color: '#a0aec0' }}>No customers connected yet</p>
              </div>
            ) : (
              users.map(user => (
                <div
                  key={user._id}
                  className={`user-item ${selectedUser && selectedUser._id === user._id ? 'active' : ''}`}
                  onClick={() => handleSelectUser(user)}
                >
                  <div className="user-avatar">
                    {user.name.charAt(0)}
                  </div>
                  <div className="user-info">
                    <div className="user-name">{user.name}</div>
                    <div className="user-last-message">{user.lastMessage}</div>
                  </div>
                  <div className="user-meta">
                    <div className="user-time">
                      {new Date(user.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {user.unreadCount > 0 && (
                      <div className="unread-badge">{user.unreadCount}</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="chat-area">
          {selectedUser ? (
            <>
              <div className="chat-header">
                <div className="chat-user-info">
                  <div className="chat-user-avatar">
                    {selectedUser.name.charAt(0)}
                  </div>
                  <div className="chat-user-details">
                    <div className="chat-user-name">{selectedUser.name}</div>
                    <div className="chat-user-email">
                      {selectedUser.email}
                      <button
                        className="send-email-btn"
                        onClick={handleSendEmail}
                        title="Send email to user"
                      >
                        📧 Send Email
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <select
                    value={adminLanguage}
                    onChange={(e) => setAdminLanguage(e.target.value)}
                    className="language-select px-2 py-1 rounded bg-gray-700 text-white border border-gray-600 text-sm focus:outline-none"
                  >
                    {languages.map(lang => (
                      <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                  </select>
                </div>
                {emailStatus && (
                  <div className={`email-status ${emailStatus.includes('success') ? 'success' : emailStatus.includes('Failed') || emailStatus.includes('Error') ? 'error' : ''}`}>
                    {emailStatus}
                  </div>
                )}
              </div>

              <div className="chat-messages">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`chat-message ${msg.sender === 'admin' ? 'admin-message' : msg.sender === 'system' ? 'system-message' : 'user-message'}`}
                  >
                    <div className="message-sender">
                      {msg.sender === 'admin' ? msg.name : msg.sender === 'system' ? msg.name : msg.name}
                    </div>
                    <div className="message-text">
                      {msg.text}
                    </div>
                    <div className="message-time">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
                {userTyping && (
                  <div className="chat-message user-message">
                    <div className="message-sender">{selectedUser.name}</div>
                    <div className="message-text typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="chat-input-container">
                <div className="chat-input-wrapper">
                  <textarea
                    value={newMessage}
                    onChange={handleTextareaChange}
                    onKeyPress={handleKeyPress}
                    placeholder={['ur', 'ar'].includes(adminLanguage) ? `...${selectedUser.name} پیغام بھیجیں` : `Message ${selectedUser.name}...`}
                    className="chat-input"
                    dir={['ur', 'ar'].includes(adminLanguage) ? 'rtl' : 'ltr'}
                    rows="1"
                    style={{
                      fontFamily: ['ur', 'ar'].includes(adminLanguage) ? "'Noto Nastaliq Urdu', sans-serif" : 'inherit'
                    }}
                  />
                  <button
                    className="send-button"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                  >
                    Send 🚀
                  </button>
                </div>
                {isTyping && (
                  <div className="admin-typing">You are typing...</div>
                )}
              </div>
            </>
          ) : (
            <div className="chat-placeholder">
              <div className="placeholder-content">
                <h3>Select a customer to start chatting</h3>
                <p>Choose a customer from the list to view and respond to their messages</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveChat;