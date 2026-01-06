# Food Delivery System - Backend

## Overview

This is the backend service for a comprehensive food delivery system built with Node.js, Express, and MongoDB. It provides RESTful APIs for user authentication, product management, order processing, real-time chat, loyalty programs, and more. The system supports multiple user roles including customers, administrators, and delivery personnel.

## Technologies Used

### Core Technologies
- **Node.js**: JavaScript runtime for building scalable server-side applications
- **Express.js**: Web application framework for Node.js, providing robust routing and middleware
- **MongoDB**: NoSQL database for flexible data storage
- **Mongoose**: ODM library for MongoDB, providing schema validation and modeling

### Authentication & Security
- **Firebase Admin SDK**: For secure authentication and user management
- **Passport.js**: Authentication middleware supporting multiple strategies
- **JWT (JSON Web Tokens)**: Token-based authentication for secure API access
- **BCrypt**: Password hashing for secure credential storage
- **CORS**: Cross-Origin Resource Sharing configuration for controlled access

### Payment Processing
- **Stripe**: Secure payment processing for orders

### Real-time Communication
- **Socket.IO**: Enables real-time bidirectional communication for live chat functionality

### Email Services
- **Nodemailer**: Email sending capabilities for notifications and password resets
- **Google OAuth2**: Integration with Gmail for email services

### Image Handling
- **Multer**: Middleware for handling multipart/form-data, primarily used for file uploads

### Validation & Error Handling
- **Express Validator**: Request validation middleware
- **Custom Error Classes**: Structured error handling throughout the application

### Utilities
- **Dotenv**: Environment variable management
- **Chalk & Figlet**: Enhanced console logging and startup messages

## Project Structure

```
backend/
├── config/              # Configuration files (Firebase, Passport, Nodemailer)
├── controllers/         # Request handlers for each feature
├── dbConnect/           # Database connection setup
├── middleWares/         # Custom middleware functions
├── models/              # Mongoose data models
├── repositories/        # Data access layer (repository pattern)
├── routes/              # API route definitions
├── services/            # Business logic layer
├── stripe/              # Stripe payment integration
├── uploads/             # Uploaded image files
├── utils/               # Utility functions and classes
├── index.js             # Application entry point
└── package.json         # Dependencies and scripts
```

## Key Features

1. **Multi-role User Management**:
   - Customer accounts with profile management
   - Admin panel for business operations
   - Delivery personnel accounts with availability tracking

2. **Product Catalog**:
   - Category and sub-category organization
   - Product listings with images and descriptions
   - Menu management for restaurants

3. **Shopping Cart & Order Processing**:
   - Cart persistence for logged-in users
   - Multi-step checkout process
   - Order tracking with status updates

4. **Real-time Communication**:
   - Live chat between customers and support staff
   - Typing indicators and message history

5. **Loyalty Program**:
   - Points earning system for purchases
   - Bonus points for referrals
   - Point redemption for discounts

6. **Referral System**:
   - Unique referral codes for users
   - Tracking of referred users and bonuses

7. **Table Reservation**:
   - Online table booking system
   - Reservation management

8. **Delivery Management**:
   - Delivery boy assignment
   - Location tracking
   - Delivery status updates

9. **Payment Processing**:
   - Secure Stripe integration
   - Multiple payment methods

10. **Reviews & Ratings**:
    - Customer feedback system
    - Product and service ratings

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | User registration |
| POST | /auth/login | User login |
| GET | /products | Get all products |
| GET | /category | Get all categories |
| POST | /cart/add | Add item to cart |
| POST | /order/create | Create new order |
| GET | /order/history | Get user order history |
| POST | /api/live-chat/message | Send chat message |
| GET | /loyalty/points | Get user loyalty points |

## Architecture Patterns

### MVC Pattern
The backend follows the Model-View-Controller architectural pattern:
- **Models**: Define data structures and database schemas
- **Controllers**: Handle HTTP requests and business logic
- **Routes**: Define API endpoints and map to controllers

### Repository Pattern
Used in the data access layer to abstract database operations and improve testability.

### Middleware Chain
Request processing flows through multiple middleware layers:
1. CORS configuration
2. Body parsing (JSON, URL-encoded)
3. Authentication middleware
4. Route-specific middleware
5. Controller functions

## Security Considerations

1. **Authentication**: JWT tokens with expiration
2. **Authorization**: Role-based access control
3. **Data Protection**: Password hashing with BCrypt
4. **Input Validation**: Request validation using express-validator
5. **Environment Variables**: Sensitive data stored securely
6. **CORS Policy**: Controlled cross-origin access

## Setup and Installation

### Prerequisites
- Node.js v14 or higher
- MongoDB database (local or cloud)
- Firebase account for authentication
- Stripe account for payment processing
- Gmail account for email services

### Installation Steps

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   JWT_SECRET=your_jwt_secret_key
   BASE_URL=http://localhost:3005
   STRIPE_SECRET_KEY=your_stripe_secret_key
   FIREBASE_*=(Firebase configuration values)
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. For production deployment:
   ```bash
   npm start
   ```

## Database Schema

### User Model
- Personal information (name, email)
- Authentication details (password hash, provider)
- Role management (customer, admin, delivery)
- Loyalty points tracking
- Referral information

### Order Model
- User reference
- Product items with quantities
- Delivery address
- Payment information
- Status tracking
- Loyalty points earned/applied

### Product Model
- Product details (name, description, price)
- Category association
- Images
- Availability status

## Real-time Features

### Live Chat Implementation
- Socket.IO connections for real-time messaging
- Separate namespaces for users and admins
- Message persistence in MongoDB
- Typing indicators for better UX

### Order Tracking
- Real-time status updates
- Delivery personnel location sharing
- Notification system for status changes

## Deployment

### Local Development
1. Ensure MongoDB is running locally or cloud connection is configured
2. Set up all environment variables
3. Run `npm run dev` for hot reloading

### Production Deployment
Recommended platforms:
- Vercel (configured with vercel.json)
- Heroku
- AWS Elastic Beanstalk
- DigitalOcean App Platform

Ensure environment variables are properly configured in the deployment environment.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is proprietary and intended for educational purposes as part of a Final Year Project.