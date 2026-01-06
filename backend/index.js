const express = require("express");
require("./dbConnect/db");
require('dotenv').config();
const passport = require('./config/passport');

const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const chalk = require('chalk');
const figlet = require('figlet');
// Socket.IO setup
const http = require('http');
const socketIo = require('socket.io');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/order');
const addressRoutes = require('./routes/adress');
const chatbotRoutes = require('./routes/chatbotRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const restaurantDeliveryAddressRoutes = require('./routes/restaurantDeliveryAddressRoutes');
const tableReservationRoutes = require('./routes/tableReservations');
const reviewRoutes = require('./routes/reviewRoutes');
const couponRoutes = require('./routes/coupons');
const loyaltyPointRoutes = require('./routes/loyaltyPoints');
const deliveryRoutes = require('./routes/deliveryRoutes');
const referralRoutes = require('./routes/referralRoutes');
const extraItemsRoutes = require('./routes/extraItemsRoutes');
const liveChatRoutes = require('./routes/liveChatRoutes');
const supportRoutes = require('./routes/supportRoutes'); // Add this line
const adminUserRoutes = require('./routes/adminUserRoutes');

const { saveMessage } = require('./controllers/liveChatController');

const app = express();

// Configure CORS to allow multiple origins and the admin-key header
const corsOptions = {
  origin: ["http://localhost:3000", "http://localhost:3001"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "admin-key"] // Added admin-key to allowed headers
};

app.use(cors(corsOptions));

const port = 3005;

// Create HTTP server and Socket.IO instance
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST", "PATCH"],
    credentials: true
  }
});

// Initialize Passport
app.use(passport.initialize());

// Serve static files (for CMS UI and uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Parse application/json
app.use(express.json());

// Store active admin connections
const adminSockets = new Map();
const userSockets = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Register user
  socket.on('registerUser', (userId, userName) => {
    userSockets.set(userId, { socketId: socket.id, userName });
    console.log(`User ${userId} (${userName}) registered with socket ${socket.id}`);
  });

  // Register admin
  socket.on('registerAdmin', (adminId) => {
    adminSockets.set(adminId, socket.id);
    console.log(`Admin ${adminId} registered with socket ${socket.id}`);
  });

  // Handle user messages
  socket.on('userMessage', async (data) => {
    const { userId, message, userName } = data;

    // Save message to database
    const savedMessage = await saveMessage({
      userId,
      userName,
      message,
      sender: 'user'
    });

    console.log(`User ${userId} sent message: ${message}`);

    // Notify all admins about new message
    for (let [adminId, adminSocketId] of adminSockets) {
      io.to(adminSocketId).emit('newUserMessage', {
        userId,
        userName,
        message,
        timestamp: new Date(),
        messageId: savedMessage._id
      });
    }
  });

  // Handle admin messages
  socket.on('adminMessage', async (data) => {
    const { userId, message, adminName } = data;

    // Get user name from userSockets
    const userSocketInfo = userSockets.get(userId);
    const userName = userSocketInfo ? userSocketInfo.userName : 'Unknown User';

    // Save message to database
    const savedMessage = await saveMessage({
      userId,
      userName,
      message,
      sender: 'admin'
    });

    console.log(`Admin sent message to user ${userId}: ${message}`);

    // Send message to specific user
    const userSocketId = userSockets.get(userId);
    if (userSocketId) {
      io.to(userSocketId.socketId).emit('newAdminMessage', {
        adminName,
        message,
        timestamp: new Date(),
        messageId: savedMessage._id
      });
    }
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    const { userId, isTyping, sender } = data;

    if (sender === 'user') {
      // Notify admin that user is typing
      for (let [adminId, adminSocketId] of adminSockets) {
        io.to(adminSocketId).emit('userTyping', { userId, isTyping });
      }
    } else if (sender === 'admin') {
      // Notify user that admin is typing
      const userSocketId = userSockets.get(userId);
      if (userSocketId) {
        io.to(userSocketId.socketId).emit('adminTyping', { isTyping });
      }
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    // Remove from admin sockets
    for (let [adminId, adminSocketId] of adminSockets) {
      if (adminSocketId === socket.id) {
        adminSockets.delete(adminId);
        break;
      }
    }

    // Remove from user sockets
    for (let [userId, userSocketInfo] of userSockets) {
      if (userSocketInfo.socketId === socket.id) {
        userSockets.delete(userId);
        break;
      }
    }
  });
});

app.get('/', (req, res) => {
  res.send('Hello from Fyp Food Server');
});

app.get('/favicon.ico', (req, res) => res.status(204).end());

// API Routes
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/category', categoryRoutes);
app.use('/cart', cartRoutes);
app.use('/order', orderRoutes);
app.use('/address', addressRoutes);
app.use('/chatbot', chatbotRoutes);
app.use('/api', paymentRoutes);
app.use('/api/restaurant-delivery-addresses', restaurantDeliveryAddressRoutes);
app.use('/api/table-reservations', tableReservationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/loyalty', loyaltyPointRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/extra-items', extraItemsRoutes);
app.use('/api/live-chat', liveChatRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/analytics', require('./routes/analyticsRoutes')); // Add Analytics Route

// Start the server with enhanced console output
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});