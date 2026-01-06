import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FiMail, FiMessageSquare, FiHelpCircle, FiStar, FiSend, FiMinimize2 } from 'react-icons/fi';
import { FaQuestionCircle, FaHeadset } from 'react-icons/fa';
import { io } from 'socket.io-client';
import axios from 'axios';
import './Support.css';

const Support = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [liveChatOpen, setLiveChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [adminTyping, setAdminTyping] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const languages = [
    { code: 'en', name: 'English', dir: 'ltr' },
    { code: 'ur', name: 'Urdu', dir: 'rtl' },
    { code: 'hi', name: 'Hindi', dir: 'ltr' },
    { code: 'ar', name: 'Arabic', dir: 'rtl' },
    { code: 'es', name: 'Spanish', dir: 'ltr' },
    { code: 'fr', name: 'French', dir: 'ltr' }
  ];

  // Mock current user - in a real app, this would come from AuthContext
  const currentUser = useMemo(() => ({
    _id: 'user123',
    name: 'John Doe',
    email: 'john.doe@example.com'
  }), []);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Initialize socket connection when component mounts
  useEffect(() => {
    console.log('Initializing socket connection for user:', currentUser);

    // Initialize socket connection
    socketRef.current = io('http://localhost:3005');

    // Register user with socket server
    socketRef.current.emit('registerUser', currentUser._id, currentUser.name);

    // Listen for new admin messages
    socketRef.current.on('newAdminMessage', (data) => {
      console.log('Received admin message:', data);
      setChatMessages(prev => [...prev, {
        id: data.messageId,
        sender: 'admin',
        text: data.message,
        timestamp: data.timestamp,
        name: data.adminName
      }]);
    });

    // Listen for typing indicators
    socketRef.current.on('adminTyping', (data) => {
      setAdminTyping(data.isTyping);
    });

  }, [currentUser]);

  // Scroll to bottom of chat
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setEmailSending(true);

    try {
      // Send email via backend API
      const emailData = {
        to: process.env.REACT_APP_SUPPORT_EMAIL || 'support@yourrestaurant.com',
        from: email,
        subject: `Support Request: ${subject}`,
        text: `Message from ${email}:

${message}

We will review your message and connect with you at ${email}.`
      };

      // Make API call to backend for sending email
      const response = await axios.post('http://localhost:3005/api/support/send-email', emailData);

      if (response.data.success) {
        // Show confirmation message
        setEmailSent(true);
        setTimeout(() => {
          setEmailSent(false);
          setEmailOpen(false);
          setEmail('');
          setSubject('');
          setMessage('');
        }, 3000);
      } else {
        throw new Error(response.data.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please try again.');
    } finally {
      setEmailSending(false);
    }
  };

  const handleLiveChatStart = () => {
    setChatOpen(false);
    setLiveChatOpen(true);
    // Load initial message
    setChatMessages([
      {
        id: 1,
        sender: 'admin',
        text: 'Hello! How can I help you today?',
        timestamp: new Date(),
        name: 'Support Agent'
      }
    ]);
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;

    // Add message to UI immediately
    const messageObj = {
      id: Date.now(),
      sender: 'user',
      text: newMessage,
      timestamp: new Date(),
      name: currentUser.name || 'You'
    };

    setChatMessages(prev => [...prev, messageObj]);
    setNewMessage('');

    // Send message via socket
    if (socketRef.current) {
      console.log('Sending user message:', {
        userId: currentUser._id,
        message: newMessage,
        userName: currentUser.name
      });
      socketRef.current.emit('userMessage', {
        userId: currentUser._id,
        message: newMessage,
        userName: currentUser.name,
        language: selectedLanguage
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
    if (!isTyping && socketRef.current) {
      setIsTyping(true);
      socketRef.current.emit('typing', {
        userId: currentUser._id,
        isTyping: true,
        sender: 'user'
      });
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (socketRef.current) {
        setIsTyping(false);
        socketRef.current.emit('typing', {
          userId: currentUser._id,
          isTyping: false,
          sender: 'user'
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

  const supportOptions = [
    {
      id: 'chat',
      icon: <FiMessageSquare size={24} />,
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      action: () => setChatOpen(true)
    },
    {
      id: 'email',
      icon: <FiMail size={24} />,
      title: 'Email Support',
      description: 'Send us an email and we\'ll respond within 24 hours',
      action: () => setEmailOpen(true)
    }
  ];



  const faqs = [
    {
      question: "How long does delivery take?",
      answer: "Delivery typically takes 30-45 minutes depending on your location and restaurant preparation time."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, debit cards, and digital wallets like PayPal and Apple Pay."
    },
    {
      question: "Can I track my order?",
      answer: "Yes, you can track your order in real-time through our app or website using the order tracking feature."
    },
    {
      question: "What if I have a food allergy?",
      answer: "Please specify any allergies in the order notes. Our restaurants will do their best to accommodate your needs."
    },
    {
      question: "How can I cancel my order?",
      answer: "You can cancel your order within 10 minutes of placing it through the 'My Orders' section in your account."
    }
  ];

  return (
    <div className="support-page">
      {/* Hero Banner with Search */}
      <div className="support-hero">
        <div className="container mx-auto px-4">
          <h1>How can we help?</h1>
          <p>Search our knowledge base or contact us below</p>

          <div className="hero-search-container">
            <FiHelpCircle className="search-icon" />
            <input
              type="text"
              className="hero-search-input"
              placeholder="Type your question (e.g., refund, delivery time)..."
            />
          </div>
        </div>
      </div>

      <div className="support-container">
        {/* Main Action Grid - Combined */}
        <div className="support-options-grid">
          {supportOptions.map((option) => (
            <div
              key={option.id}
              className="support-option-card"
              onClick={option.action}
            >
              <div className="support-option-icon">
                {option.icon}
              </div>
              <h3>{option.title}</h3>
              <p>{option.description}</p>
            </div>
          ))}

          {/* Add Feedback as a card in this grid */}
          <div
            className="support-option-card"
            onClick={() => setFeedbackOpen(true)}
          >
            <div className="support-option-icon">
              <FiStar size={24} />
            </div>
            <h3>Give Feedback</h3>
            <p>Share your experience to help us improve</p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="faq-section">
          <div className="faq-header">
            <h2>Frequently Asked Questions</h2>
            <p className="text-gray-500">Quick answers to common questions</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-item">
                <div className="faq-question">
                  <FaQuestionCircle />
                  {faq.question}
                </div>
                <div className="faq-answer">{faq.answer}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      {chatOpen && (
        <div className="support-modal">
          <div className="support-modal-content">
            <div className="support-modal-header">
              <h3>Live Chat Support</h3>
              <button
                className="support-modal-close"
                onClick={() => setChatOpen(false)}
              >
                &times;
              </button>
            </div>
            <div className="support-modal-body">
              <div className="chat-placeholder">
                <FaHeadset />
                <h4 className="text-xl font-bold mb-2">Chat with Support</h4>
                <p className="text-gray-500 mb-6">Our team is available 24/7 to help you with any issues.</p>
                <button
                  className="btn btn-primary"
                  onClick={handleLiveChatStart}
                >
                  Start Live Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Live Chat Modal */}
      {liveChatOpen && (
        <div className="support-modal">
          <div className="support-modal-content chat-modal">
            <div className="support-modal-header">
              <h3>Live Chat</h3>
              <div className="flex items-center gap-3">
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="language-select text-sm border rounded px-2 py-1 bg-gray-50 focus:outline-none"
                  style={{ color: '#333' }}
                >
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
                <button
                  className="support-modal-close"
                  onClick={() => setLiveChatOpen(false)}
                >
                  <FiMinimize2 />
                </button>
              </div>
            </div>
            <div className="chat-messages">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`chat-message ${msg.sender === 'user' ? 'user-message' : 'admin-message'}`}
                >
                  <div className="message-text">
                    {msg.text}
                  </div>
                  <div className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
              {adminTyping && (
                <div className="chat-message admin-message">
                  <div className="message-text typing-indicator">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="chat-input-container">
              <div className="chat-input-wrapper">
                <textarea
                  value={newMessage}
                  onChange={handleTyping}
                  onKeyPress={handleKeyPress}
                  placeholder={['ur', 'ar'].includes(selectedLanguage) ? "یہاں پیغام لکھیں..." : "Type a message..."}
                  className="form-control chat-input"
                  dir={['ur', 'ar'].includes(selectedLanguage) ? 'rtl' : 'ltr'}
                  rows="1"
                  style={{
                    borderRadius: '24px',
                    resize: 'none',
                    fontFamily: ['ur', 'ar'].includes(selectedLanguage) ? "'Noto Nastaliq Urdu', sans-serif" : 'inherit'
                  }}
                />
                <button
                  className="send-button"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                >
                  <FiSend size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {emailOpen && (
        <div className="support-modal">
          <div className="support-modal-content">
            <div className="support-modal-header">
              <h3>Email Support</h3>
              <button
                className="support-modal-close"
                onClick={() => setEmailOpen(false)}
              >
                &times;
              </button>
            </div>
            <div className="support-modal-body">
              {emailSent ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiMail size={32} />
                  </div>
                  <h4 className="text-xl font-bold mb-2">Message Sent!</h4>
                  <p className="text-gray-500">
                    We'll get back to you at <strong>{email}</strong> shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleEmailSubmit}>
                  <div className="form-group">
                    <label className="form-label">Your Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <input
                      type="text"
                      className="form-control"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="How can we help?"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Message</label>
                    <textarea
                      rows="4"
                      className="form-control"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Describe your issue..."
                      required
                    ></textarea>
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setEmailOpen(false)}
                      disabled={emailSending}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={emailSending}
                    >
                      {emailSending ? 'Sending...' : 'Send Message'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackOpen && (
        <div className="support-modal">
          <div className="support-modal-content">
            <div className="support-modal-header">
              <h3>Share Feedback</h3>
              <button
                className="support-modal-close"
                onClick={() => setFeedbackOpen(false)}
              >
                &times;
              </button>
            </div>
            <div className="support-modal-body">
              <div className="feedback-placeholder">
                <FiStar />
                <h4 className="text-xl font-bold mb-2">Rate Your Experience</h4>
                <p className="text-gray-500 mb-6">Your feedback helps us provide better service.</p>

                <div className="bg-gray-50 rounded-xl p-6 text-left">
                  <h5 className="font-bold mb-4 text-sm uppercase text-gray-400">Recent Reviews</h5>
                  <div className="space-y-4">
                    <div className="flex gap-4 items-start pb-4 border-b border-gray-100">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">JD</div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm">John Doe</span>
                          <div className="flex text-yellow-400 text-xs gap-0.5">
                            {[1, 2, 3, 4, 5].map(i => <FiStar key={i} fill="currentColor" />)}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">"Fast delivery and great food!"</p>
                      </div>
                    </div>
                    {/* Additional review placeholder */}
                    <div className="flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">SM</div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm">Sarah M.</span>
                          <div className="flex text-yellow-400 text-xs gap-0.5">
                            {[1, 2, 3, 4, 5].map(i => <FiStar key={i} fill="currentColor" />)}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">"Support helped me instantly."</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Support;