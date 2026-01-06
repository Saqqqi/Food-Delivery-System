# 🍔 FoodieFly - Premium Food Delivery System

![Project Badge](https://img.shields.io/badge/Status-Active-brightgreen) ![License](https://img.shields.io/badge/License-ISC-blue) ![Stack](https://img.shields.io/badge/Stack-MERN-yellow)

**FoodieFly** is a state-of-the-art, full-stack food delivery application built with the MERN stack (MongoDB, Express, React, Node.js). It offers a seamless experience for customers to order food, track deliveries in real-time, and reserve tables, while providing robust management tools for administrators and delivery personnel.

---

## 🚀 Key Features

### 👤 User Experience (Customer)
- **Secure Authentication**: Traditional Email/Password & Google OAuth (Firebase).
- **Product Discovery**: Advanced search, filtering by category, and detailed product views with 3D models.
- **Cart & Checkout**: Dynamic shopping cart, coupon application, and loyalty points redemption.
- **Secure Payments**: Integrated **Stripe** payment gateway for safe transactions.
- **Real-Time Tracking**: Track order status live from preparation to delivery.
- **Interactive Features**: 
  - 💬 Live Chat with Support.
  - ⭐ Product Reviews & Ratings.
  - 📅 Table Reservations.

### 🛠 Administrative Control (Admin)
- **Dashboard**: Comprehensive analytics and overview of business performance.
- **Management**: Full CRUD capabilities for Products, Categories, Orders, and Users.
- **Support**: Handle support tickets and live chat inquiries.
- **Marketing**: Create coupons and manage the loyalty points system.

### 🚚 Delivery Management
- **Delivery Personnel**: dedicated portal for delivery boys.
- **Availability**: Toggle online/offline status.
- **Order Assignment**: Receive and manage assigned delivery tasks.

---

## 🏗 Technology Stack

### **Frontend** (`/frontend`)
- **Framework**: [React.js](https://reactjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Bootstrap](https://getbootstrap.com/)
- **Animations**: Framer Motion
- **Maps**: Google Maps API & Leaflet
- **State Management**: React Hooks & Context
- **Real-Time**: Socket.IO Client

### **Backend** (`/backend`)
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (Mongoose ODM)
- **Auth**: JWT, Passport.js, Firebase Admin
- **Payments**: Stripe API
- **Real-Time**: Socket.IO
- **Email**: Nodemailer (Gmail SMTP)

---

## 📦 Installation & Setup

Follow these steps to set up the project locally.

### 1. Prerequisites
- **Node.js** (v14+)
- **npm** or **yarn**
- **MongoDB** (Local or Atlas URL)

### 2. Clone the Repository
```bash
git clone https://github.com/yourusername/foodiefly.git
cd foodiefly
```

### 3. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

**Configuration**:
Create a `.env` file in the `backend/` directory with the following credentials:
```env
# Server Configuration
PORT=3005
BASE_URL=http://localhost:3005
FRONTEND_URL=http://localhost:3000

# Database
MONGO_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret

# Stripe Payments
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Email Service (Nodemailer)
EMAIL_SERVICE=Gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="your_private_key"
FIREBASE_CLIENT_EMAIL=your_client_email
```

Start the Backend Server:
```bash
npm run dev
# Server will run on http://localhost:3005
```

### 4. Frontend Setup
Open a new terminal, navigate to the frontend directory, and install dependencies:
```bash
cd frontend/FoodDeliverySystem
npm install
```

**Configuration**:
Create a `.env` file in the `frontend/FoodDeliverySystem/` directory:
```env
REACT_APP_API_URL=http://localhost:3005
REACT_APP_STRIPE_PUBLIC_KEY=your_stripe_public_key
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

Start the Frontend Application:
```bash
npm start
# Application will open at http://localhost:3000
```

---

## 📡 API Documentation

The backend API is documented with key endpoints for:
- **Auth**: `/auth/login`, `/auth/register`
- **Products**: `/products`, `/category`
- **Orders**: `/order/create-order`, `/order/user/:id`
- **Payments**: `/api/create-payment-intent`
- **Chat**: `/api/live-chat`

For a Deep Dive into the backend architecture, please refer to:
[Backend Detailed Documentation](./backend/COMPREHENSIVE_README.md)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📜 License

Distributed under the ISC License. See `LICENSE` for more information.

---

<center>Built with ❤️ by React Developers</center>