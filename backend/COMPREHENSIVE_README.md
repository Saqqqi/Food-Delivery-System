# Food Delivery System - Backend (Comprehensive Documentation)

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

## API Endpoints and Routes

### Authentication Routes (`/auth`)
These routes handle user registration, login, profile management, and password recovery.

**User Roles:**
- **Customer**: Regular users who can browse, order, and track deliveries
- **Admin**: Users with administrative privileges to manage products, orders, and users
- **Delivery Boy**: Users responsible for delivering orders

**Endpoints:**
| Method | Endpoint | Description | Access Level |
|--------|----------|-------------|--------------|
| POST | /auth/register | Register a new user | Public |
| GET | /auth/verify/:token | Verify email address | Public |
| POST | /auth/login | User login | Public |
| GET | /auth/me | Get user profile | Authenticated |
| PUT | /auth/me | Update user profile | Authenticated |
| DELETE | /auth/me | Delete user profile | Authenticated |
| POST | /auth/forgot-password | Request password reset | Public |
| GET | /auth/reset-password/:token | Get reset password form | Public |
| POST | /auth/reset-password/:token | Reset password | Public |
| POST | /auth/firebase-google | Firebase Google authentication | Public |
| POST | /auth/firebase-register | Firebase email/password registration | Public |
| POST | /auth/firebase-login | Firebase email/password login | Public |

**Authentication Flow:**
1. Users register with email/password or through Google/Firebase
2. Email verification is sent upon registration
3. Verified users can log in to receive a JWT token
4. JWT token is used for subsequent authenticated requests
5. Password reset functionality allows users to recover accounts

### Product Routes (`/products`)
Manage the food items available for ordering.

**Endpoints:**
| Method | Endpoint | Description | Access Level |
|--------|----------|-------------|--------------|
| POST | /products | Create a new product | Admin |
| GET | /products | Get all products | Public |
| GET | /products/:id | Get a specific product | Public |
| PUT | /products/:id | Update a product | Admin |
| DELETE | /products/:id | Delete a product | Admin |

**Data Flow:**
1. Admins can upload product images (max 80KB)
2. Products are stored with name, price, category, description, and stock status
3. Restaurant information is associated with each product
4. Users can browse all products or view specific items

### Category Routes (`/category`)
Manage food categories and subcategories.

**Endpoints:**
| Method | Endpoint | Description | Access Level |
|--------|----------|-------------|--------------|
| POST | /category | Create a new category | Admin |
| GET | /category | Get all categories | Public |
| GET | /category/:id | Get a specific category | Public |
| PUT | /category/:id | Update a category | Admin |
| DELETE | /category/:id | Delete a category | Admin |

### Cart Routes (`/cart`)
Handle shopping cart functionality for authenticated users.

**Endpoints:**
| Method | Endpoint | Description | Access Level |
|--------|----------|-------------|--------------|
| POST | /cart/add-product-to-cart | Add product to cart | Authenticated |
| GET | /cart/get-cart/:userId | Get user's cart | Authenticated |
| DELETE | /cart/remove-product/:userId/:product_id | Remove product from cart | Authenticated |
| PUT | /cart/update-quantity/:userId/:product_id | Update product quantity | Authenticated |
| PUT | /cart/apply-coupon/:userId | Apply coupon to cart | Authenticated |
| DELETE | /cart/remove-coupon/:userId | Remove coupon from cart | Authenticated |
| PUT | /cart/apply-loyalty-points/:userId | Apply loyalty points | Authenticated |
| DELETE | /cart/remove-loyalty-discount/:userId | Remove loyalty discount | Authenticated |
| DELETE | /cart/clear-cart/:userId | Clear entire cart | Authenticated |

**Data Flow:**
1. Users add products to their cart with specified quantities
2. Cart automatically calculates subtotals and totals
3. Coupons and loyalty points can be applied for discounts
4. Cart persists between sessions for authenticated users

### Order Routes (`/order`)
Manage the complete order lifecycle from creation to delivery.

**Endpoints:**
| Method | Endpoint | Description | Access Level |
|--------|----------|-------------|--------------|
| POST | /order/create-order | Create a new order | Authenticated |
| POST | /order/send-email | Send order confirmation email | Authenticated |
| GET | /order/get-order/:order_id | Get specific order details | Authenticated |
| GET | /order/get-orders-list | Get all orders (admin) | Admin |
| DELETE | /order/:id | Delete an order | Admin |
| GET | /order/user/:userId | Get user's order history | Authenticated |
| PUT | /order/request-cancel/:orderId | Request order cancellation | Authenticated |
| PUT | /order/update-status/:orderId | Update order status | Admin |
| PUT | /order/handle-cancellation/:orderId | Handle cancellation request | Admin |

**Order Data Flow:**
1. Users create orders from their cart
2. Orders include delivery address, payment method, and special instructions
3. Order confirmation emails are sent to customers
4. Admins can update order status (pending → shipped → delivered)
5. Users can request order cancellations which require admin approval
6. Loyalty points are automatically calculated and awarded upon delivery

### Address Routes (`/address`)
Manage user delivery addresses.

**Endpoints:**
| Method | Endpoint | Description | Access Level |
|--------|----------|-------------|--------------|
| POST | /address | Create a new address | Authenticated |
| GET | /address | Get all addresses for user | Authenticated |
| GET | /address/:id | Get specific address | Authenticated |
| PUT | /address/:id | Update an address | Authenticated |
| DELETE | /address/:id | Delete an address | Authenticated |

### Chatbot Routes (`/chatbot`)
Handle AI-powered customer support interactions.

**Endpoints:**
| Method | Endpoint | Description | Access Level |
|--------|----------|-------------|--------------|
| POST | /chatbot/message | Send message to chatbot | Public |
| GET | /chatbot/history/:userId | Get chat history | Authenticated |

### Payment Routes (`/api`)
Process secure payments through Stripe.

**Endpoints:**
| Method | Endpoint | Description | Access Level |
|--------|----------|-------------|--------------|
| POST | /api/create-payment-intent | Create Stripe payment intent | Authenticated |

**Payment Flow:**
1. Frontend requests a payment intent from backend
2. Backend creates intent with Stripe using order amount
3. Frontend collects payment details using Stripe Elements
4. Payment is processed securely through Stripe

### Live Chat Routes (`/api/live-chat`)
Enable real-time communication between customers and support staff.

**Endpoints:**
| Method | Endpoint | Description | Access Level |
|--------|----------|-------------|--------------|
| GET | /api/live-chat/history/:userId | Get chat history | Authenticated/Admin |
| GET | /api/live-chat/users | Get all chat users | Admin |
| PUT | /api/live-chat/read/:userId | Mark messages as read | Admin |

**Real-time Chat Implementation:**
1. Socket.IO handles real-time messaging between clients and server
2. Users and admins connect through separate registration events
3. Messages are persisted in MongoDB with sender/receiver information
4. Typing indicators improve user experience
5. Admin dashboard shows all users who have chatted with unread message counts

### Loyalty Points Routes (`/loyalty`)
Manage customer loyalty program.

**Endpoints:**
| Method | Endpoint | Description | Access Level |
|--------|----------|-------------|--------------|
| GET | /loyalty/points/:userId | Get user's loyalty points | Authenticated |
| PUT | /loyalty/points/:userId | Update user's loyalty points | Admin |
| GET | /loyalty/rules | Get loyalty program rules | Public |
| PUT | /loyalty/rules | Update loyalty program rules | Admin |

**Loyalty Program:**
1. Points earned based on order totals
2. Minimum redemption thresholds
3. Configurable point-to-currency conversion rates
4. Points can be applied during checkout for discounts

### Coupon Routes (`/api/coupons`)
Manage promotional discount codes.

**Endpoints:**
| Method | Endpoint | Description | Access Level |
|--------|----------|-------------|--------------|
| POST | /api/coupons | Create a new coupon | Admin |
| GET | /api/coupons | Get all coupons | Admin |
| GET | /api/coupons/active | Get active coupons | Public |
| PUT | /api/coupons/:id | Update a coupon | Admin |
| DELETE | /api/coupons/:id | Delete a coupon | Admin |

### Delivery Routes (`/api/delivery`)
Manage delivery personnel and assignments.

**Endpoints:**
| Method | Endpoint | Description | Access Level |
|--------|----------|-------------|--------------|
| GET | /api/delivery/boys | Get all delivery boys | Admin |
| PUT | /api/delivery/boys/:id/availability | Update delivery boy availability | Delivery Boy |
| PUT | /api/delivery/boys/:id/location | Update delivery boy location | Delivery Boy |

### Referral Routes (`/api/referrals`)
Handle user referral program.

**Endpoints:**
| Method | Endpoint | Description | Access Level |
|--------|----------|-------------|--------------|
| POST | /api/referrals/generate | Generate referral code | Authenticated |
| GET | /api/referrals/:code | Get referral details | Public |
| POST | /api/referrals/redeem | Redeem referral code | Authenticated |

### Extra Items Routes (`/api/extra-items`)
Manage additional items that can be added to orders.

**Endpoints:**
| Method | Endpoint | Description | Access Level |
|--------|----------|-------------|--------------|
| POST | /api/extra-items | Create extra item | Admin |
| GET | /api/extra-items | Get all extra items | Public |
| PUT | /api/extra-items/:id | Update extra item | Admin |
| DELETE | /api/extra-items/:id | Delete extra item | Admin |

### Restaurant Delivery Address Routes (`/api/restaurant-delivery-addresses`)
Manage restaurant locations for delivery.

**Endpoints:**
| Method | Endpoint | Description | Access Level |
|--------|----------|-------------|--------------|
| POST | /api/restaurant-delivery-addresses | Create restaurant address | Admin |
| GET | /api/restaurant-delivery-addresses | Get all restaurant addresses | Admin |
| PUT | /api/restaurant-delivery-addresses/:id | Update restaurant address | Admin |
| DELETE | /api/restaurant-delivery-addresses/:id | Delete restaurant address | Admin |

### Review Routes (`/api/reviews`)
Handle customer reviews and ratings.

**Endpoints:**
| Method | Endpoint | Description | Access Level |
|--------|----------|-------------|--------------|
| POST | /api/reviews | Create a review | Authenticated |
| GET | /api/reviews/product/:productId | Get reviews for product | Public |
| GET | /api/reviews/user/:userId | Get user's reviews | Authenticated |
| PUT | /api/reviews/:id | Update a review | Authenticated |
| DELETE | /api/reviews/:id | Delete a review | Authenticated/Admin |

### Table Reservation Routes (`/api/table-reservations`)
Manage restaurant table bookings.

**Endpoints:**
| Method | Endpoint | Description | Access Level |
|--------|----------|-------------|--------------|
| POST | /api/table-reservations | Create reservation | Authenticated |
| GET | /api/table-reservations/user/:userId | Get user's reservations | Authenticated |
| GET | /api/table-reservations | Get all reservations | Admin |
| PUT | /api/table-reservations/:id | Update reservation | Authenticated |
| DELETE | /api/table-reservations/:id | Cancel reservation | Authenticated |

### Support Routes (`/api/support`)
Handle customer support tickets.

**Endpoints:**
| Method | Endpoint | Description | Access Level |
|--------|----------|-------------|--------------|
| POST | /api/support/ticket | Create support ticket | Authenticated |
| GET | /api/support/tickets | Get all tickets | Admin |
| GET | /api/support/tickets/:id | Get specific ticket | Authenticated/Admin |
| PUT | /api/support/tickets/:id | Update ticket status | Admin |

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

## Authentication System

### JWT Token-Based Authentication
- Secure token generation with expiration
- Role-based access control (customer, admin, delivery_boy)
- Token validation on protected routes
- Automatic token refresh mechanisms

### Firebase Integration
- Google authentication through Firebase
- Email/password authentication via Firebase
- Secure token verification
- User data synchronization between Firebase and MongoDB

### Password Security
- BCrypt hashing for password storage
- Salt generation for enhanced security
- Password strength validation
- Secure password reset workflows

## Email System

### Nodemailer Configuration
- Gmail SMTP integration
- HTML email templates for professional appearance
- Automated email sending for:
  - Account verification
  - Password reset requests
  - Order confirmations
  - Support ticket updates

### Email Templates
- Responsive design for all devices
- Brand-consistent styling
- Dynamic content insertion
- Professional formatting

### Email Data Flow
1. System triggers email event (registration, order, etc.)
2. Email template is populated with dynamic data
3. Nodemailer sends email through Gmail SMTP
4. Delivery confirmation is logged
5. Errors are captured and logged for troubleshooting

## Real-time Communication

### Socket.IO Implementation
- Bidirectional communication between clients and server
- Event-driven architecture for instant updates
- Scalable connection handling
- Room-based messaging for user/admin separation

### Live Chat Features
- Persistent message storage in MongoDB
- Real-time message delivery
- Typing indicators for better UX
- Unread message tracking
- User presence detection

### Order Tracking
- Real-time status updates
- Delivery personnel location sharing
- Push notifications for status changes
- Estimated delivery time calculations

## Payment Processing

### Stripe Integration
- Secure payment intent creation
- Client-side payment collection with Stripe Elements
- Webhook handling for payment events
- Refund processing capabilities

### Payment Security
- PCI compliance through Stripe
- Tokenized payment data
- Secure transmission of financial information
- Fraud detection and prevention

## Database Schema

### User Model
- Personal information (name, email)
- Authentication details (password hash, provider)
- Role management (customer, admin, delivery)
- Loyalty points tracking
- Referral information
- Delivery personnel specific fields (vehicle, license, availability)

### Order Model
- User reference
- Product items with quantities
- Delivery address with geolocation
- Payment information
- Status tracking with history
- Loyalty points earned/applied
- Cancellation request handling

### Product Model
- Product details (name, description, price)
- Category association
- Images with file paths
- Availability status
- Restaurant information

### Cart Model
- User reference
- Product items with quantities
- Subtotal and final total calculations
- Coupon and loyalty discount tracking
- Temporary storage between sessions

### Live Chat Model
- User identification
- Message content and metadata
- Sender/receiver tracking
- Timestamp and read status

## Security Considerations

1. **Authentication**: JWT tokens with expiration
2. **Authorization**: Role-based access control
3. **Data Protection**: Password hashing with BCrypt
4. **Input Validation**: Request validation using express-validator
5. **Environment Variables**: Sensitive data stored securely
6. **CORS Policy**: Controlled cross-origin access
7. **File Upload Security**: Size limits and type validation
8. **API Rate Limiting**: Protection against abuse
9. **Error Handling**: Secure error messages without exposing internals

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

This project is proprietary and intended for educational purposes as part of a Final Year Project.# Food Delivery System - Backend (Comprehensive Documentation)

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

## API Endpoints and Routes

### Authentication Routes (`/auth`)
These routes handle user registration, login, profile management, and password recovery.

**User Roles:**
- **Customer**: Regular users who can browse, order, and track deliveries
- **Admin**: Users with administrative privileges to manage products, orders, and users
- **Delivery Boy**: Users responsible for delivering orders

**Endpoints:**
| Method | Endpoint | Description | Access Level |
|--------|----------|-------------|--------------|
| POST | /auth/register | Register a new user | Public |
| GET | /auth/verify/:token | Verify email address | Public |
| POST | /auth/login | User login | Public |
| GET | /auth/me | Get user profile | Authenticated |
| PUT | /auth/me | Update user profile | Authenticated |
| DELETE | /auth/me | Delete user profile | Authenticated |
| POST | /auth/forgot-password | Request password reset | Public |
| GET | /auth/reset-password/:token | Get reset password form | Public |
| POST | /auth/reset-password/:token | Reset password | Public |
| POST | /auth/firebase-google | Firebase Google authentication | Public |
| POST | /auth/firebase-register | Firebase email/password registration | Public |
| POST | /auth/firebase-login | Firebase email/password login | Public |

**Authentication Flow:**
1. Users register with email/password or through Google/Firebase
2. Email verification is sent upon registration
3. Verified users can log in to receive a JWT token
4. JWT token is used for subsequent authenticated requests
5. Password reset functionality allows users to recover accounts

### Product Routes (`/products`)
Manage the food items available for ordering.

**Endpoints:**
| Method | Endpoint | Description | Access Level |
|--------|----------|-------------|--------------|
| POST | /products | Create a new product | Admin |
| GET | /products | Get all products | Public |
| GET | /products/:id | Get a specific product | Public |
| PUT | /products/:id | Update a product | Admin |
| DELETE | /products/:id | Delete a product | Admin |

**Data Flow:**
1. Admins can upload product images (max 80KB)
2. Products are stored with name, price, category, description, and stock status
3. Restaurant information is associated with each product
4. Users can browse all products or view specific items

### Category Routes (`/category`)
Manage food categories and subcategories.

**Endpoints:**
| Method | Endpoint | Description | Access Level |
|--------|----------|-------------|--------------|
| POST | /category | Create a new category | Admin |
| GET | /category | Get all categories | Public |
| GET | /category/:id | Get a specific category | Public |
| PUT | /category/:id | Update a category | Admin |
| DELETE | /category/:id | Delete a category | Admin |

### Cart Routes (`/cart`)
Handle shopping cart functionality for authenticated users.

**Endpoints:**
| Method | Endpoint | Description | Access Level |
|--------|----------|-------------|--------------|
| POST | /cart/add-product-to-cart | Add product to cart | Authenticated |
| GET | /cart/get-cart/:userId | Get user's cart | Authenticated |
| DELETE | /cart/remove-product/:userId/:product_id | Remove product from cart | Authenticated |
| PUT | /cart/update-quantity/:userId/:product_id | Update product quantity | Authenticated |
| PUT | /cart/apply-coupon/:userId | Apply coupon to cart | Authenticated |
| DELETE | /cart/remove-coupon/:userId | Remove coupon from cart | Authenticated |
| PUT | /cart/apply-loyalty-points/:userId | Apply loyalty points | Authenticated |
| DELETE | /cart/remove-loyalty-discount/:userId | Remove loyalty discount | Authenticated |
| DELETE | /cart/clear-cart/:userId | Clear entire cart | Authenticated |

**Data Flow:**
1. Users add products to their cart with specified quantities
2. Cart automatically calculates subtotals and totals
3. Coupons and loyalty points can be applied for discounts
4. Cart persists between sessions for authenticated users

### Order Routes (`/order`)
Manage the complete order lifecycle from creation to delivery.

**Endpoints:**
| Method | Endpoint | Description | Access Level |
|--------|----------|-------------|--------------|
| POST | /order/create-order | Create a new order | Authenticated |
| POST | /order/send-email | Send order confirmation email | Authenticated |
| GET | /order/get-order/:order_id | Get specific order details | Authenticated |
| GET | /order/get-orders-list | Get all orders (admin) | Admin |
| DELETE | /order/:id | Delete an order | Admin |
| GET | /order/user/:userId | Get user's order history | Authenticated |
| PUT | /order/request-cancel/:orderId | Request order cancellation | Authenticated |
| PUT | /order/update-status/:orderId | Update order status | Admin |
| PUT | /order/handle-cancellation/:orderId | Handle cancellation request | Admin |

**Order Data Flow:**
1. Users create orders from their cart
2. Orders include delivery address, payment method, and special instructions
3. Order confirmation emails are sent to customers
4. Admins can update order status (pending → shipped → delivered)
5. Users can request order cancellations which require admin approval
6. Loyalty points are automatically calculated and awarded upon delivery

### Address Routes (`/address`)
Manage user delivery addresses.

**Endpoints:**
| Method | Endpoint | Description | Access Level |
|--------|----------|-------------|--------------|
| POST | /address | Create a new address | Authenticated |
| GET | /address | Get all addresses for user | Authenticated |
| GET | /address/:id | Get specific address | Authenticated |
| PUT | /address/:id | Update an address | Authenticated |
| DELETE | /address/:id | Delete an address | Authenticated |

### Chatbot Routes (`/chatbot`)
Handle AI-powered customer support interactions.

**Endpoints:**
| Method | Endpoint | Description | Access Level |
|--------|----------|-------------|--------------|
| POST | /chatbot/message | Send message to chatbot | Public |
| GET | /chatbot/history/:userId | Get chat history | Authenticated |

### Payment Routes (`/api`)
Process secure payments through Stripe.

**Endpoints:**
| Method | Endpoint | Description | Access Level |
|--------|----------|-------------|--------------|
| POST | /api/create-payment-intent | Create Stripe payment intent | Authenticated |

**Payment Flow:**
1. Frontend requests a payment intent from backend
2. Backend creates intent with Stripe using order amount
3. Frontend collects payment details using Stripe Elements
4. Payment is processed securely through Stripe

### Live Chat Routes (`/api/live-chat`)
Enable real-time communication between customers and support staff.

**Endpoints:**
| Method | Endpoint | Description | Access Level |
|--------|----------|-------------|--------------|
| GET | /api/live-chat/history/:userId | Get chat history | Authenticated/Admin |
| GET | /api/live-chat/users | Get all chat users | Admin |
| PUT | /api/live-chat/read/:userId | Mark messages as read | Admin |

**Real-time Chat Implementation:**
1. Socket.IO handles real-time messaging between clients and server
2. Users and admins connect through separate registration events
3. Messages are persisted in MongoDB with sender/receiver information
4. Typing indicators improve user experience
5. Admin dashboard shows all users who have chatted with unread message counts

### Loyalty Points Routes (`/loyalty`)
Manage customer loyalty program.

**Endpoints:**
| Method | Endpoint | Description | Access Level |
|--------|----------|-------------|--------------|
| GET | /loyalty/points/:userId | Get user's loyalty points | Authenticated |
| PUT | /loyalty/points/:userId | Update user's loyalty points | Admin |
| GET | /loyalty/rules | Get loyalty program rules | Public |
| PUT | /loyalty/rules | Update loyalty program rules | Admin |

**Loyalty Program:**
1. Points earned based on order totals
2. Minimum redemption thresholds
3. Configurable point-to-currency conversion rates
4. Points can be applied during checkout for discounts

### Coupon Routes (`/api/coupons`)
Manage promotional discount codes.

**Endpoints:**
| Method | Endpoint | Description | Access Level |
|--------|----------|-------------|--------------|
| POST | /api/coupons | Create a new coupon | Admin |
| GET | /api/coupons | Get all coupons | Admin |
| GET | /api/coupons/active | Get active coupons | Public |
| PUT | /api/coupons/:id | Update a coupon | Admin |
| DELETE | /api/coupons/:id | Delete a coupon | Admin |

### Delivery Routes (`/api/delivery`)
Manage delivery personnel and assignments.

**Endpoints:**
| Method | Endpoint | Description | Access Level |
|--------|----------|-------------|--------------|
| GET | /api/delivery/boys | Get all delivery boys | Admin |
| PUT | /api/delivery/boys/:id/availability | Update delivery boy availability | Delivery Boy |
| PUT | /api/delivery/boys/:id/location | Update delivery boy location | Delivery Boy |

### Referral Routes (`/api/referrals`)
Handle user referral program.

**Endpoints:**
| Method | Endpoint | Description | Access Level |
|--------|----------|-------------|--------------|
| POST | /api/referrals/generate | Generate referral code | Authenticated |
| GET | /api/referrals/:code | Get referral details | Public |
| POST | /api/referrals/redeem | Redeem referral code | Authenticated |

### Extra Items Routes (`/api/extra-items`)
Manage additional items that can be added to orders.

**Endpoints:**
| Method | Endpoint | Description | Access Level |
|--------|----------|-------------|--------------|
| POST | /api/extra-items | Create extra item | Admin |
| GET | /api/extra-items | Get all extra items | Public |
| PUT | /api/extra-items/:id | Update extra item | Admin |
| DELETE | /api/extra-items/:id | Delete extra item | Admin |

### Restaurant Delivery Address Routes (`/api/restaurant-delivery-addresses`)
Manage restaurant locations for delivery.

**Endpoints:**
| Method | Endpoint | Description | Access Level |
|--------|----------|-------------|--------------|
| POST | /api/restaurant-delivery-addresses | Create restaurant address | Admin |
| GET | /api/restaurant-delivery-addresses | Get all restaurant addresses | Admin |
| PUT | /api/restaurant-delivery-addresses/:id | Update restaurant address | Admin |
| DELETE | /api/restaurant-delivery-addresses/:id | Delete restaurant address | Admin |

### Review Routes (`/api/reviews`)
Handle customer reviews and ratings.

**Endpoints:**
| Method | Endpoint | Description | Access Level |
|--------|----------|-------------|--------------|
| POST | /api/reviews | Create a review | Authenticated |
| GET | /api/reviews/product/:productId | Get reviews for product | Public |
| GET | /api/reviews/user/:userId | Get user's reviews | Authenticated |
| PUT | /api/reviews/:id | Update a review | Authenticated |
| DELETE | /api/reviews/:id | Delete a review | Authenticated/Admin |

### Table Reservation Routes (`/api/table-reservations`)
Manage restaurant table bookings.

**Endpoints:**
| Method | Endpoint | Description | Access Level |
|--------|----------|-------------|--------------|
| POST | /api/table-reservations | Create reservation | Authenticated |
| GET | /api/table-reservations/user/:userId | Get user's reservations | Authenticated |
| GET | /api/table-reservations | Get all reservations | Admin |
| PUT | /api/table-reservations/:id | Update reservation | Authenticated |
| DELETE | /api/table-reservations/:id | Cancel reservation | Authenticated |

### Support Routes (`/api/support`)
Handle customer support tickets.

**Endpoints:**
| Method | Endpoint | Description | Access Level |
|--------|----------|-------------|--------------|
| POST | /api/support/ticket | Create support ticket | Authenticated |
| GET | /api/support/tickets | Get all tickets | Admin |
| GET | /api/support/tickets/:id | Get specific ticket | Authenticated/Admin |
| PUT | /api/support/tickets/:id | Update ticket status | Admin |

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

## Authentication System

### JWT Token-Based Authentication
- Secure token generation with expiration
- Role-based access control (customer, admin, delivery_boy)
- Token validation on protected routes
- Automatic token refresh mechanisms

### Firebase Integration
- Google authentication through Firebase
- Email/password authentication via Firebase
- Secure token verification
- User data synchronization between Firebase and MongoDB

### Password Security
- BCrypt hashing for password storage
- Salt generation for enhanced security
- Password strength validation
- Secure password reset workflows

## Email System

### Nodemailer Configuration
- Gmail SMTP integration
- HTML email templates for professional appearance
- Automated email sending for:
  - Account verification
  - Password reset requests
  - Order confirmations
  - Support ticket updates

### Email Templates
- Responsive design for all devices
- Brand-consistent styling
- Dynamic content insertion
- Professional formatting

### Email Data Flow
1. System triggers email event (registration, order, etc.)
2. Email template is populated with dynamic data
3. Nodemailer sends email through Gmail SMTP
4. Delivery confirmation is logged
5. Errors are captured and logged for troubleshooting

## Real-time Communication

### Socket.IO Implementation
- Bidirectional communication between clients and server
- Event-driven architecture for instant updates
- Scalable connection handling
- Room-based messaging for user/admin separation

### Live Chat Features
- Persistent message storage in MongoDB
- Real-time message delivery
- Typing indicators for better UX
- Unread message tracking
- User presence detection

### Order Tracking
- Real-time status updates
- Delivery personnel location sharing
- Push notifications for status changes
- Estimated delivery time calculations

## Payment Processing

### Stripe Integration
- Secure payment intent creation
- Client-side payment collection with Stripe Elements
- Webhook handling for payment events
- Refund processing capabilities

### Payment Security
- PCI compliance through Stripe
- Tokenized payment data
- Secure transmission of financial information
- Fraud detection and prevention

## Database Schema

### User Model
- Personal information (name, email)
- Authentication details (password hash, provider)
- Role management (customer, admin, delivery)
- Loyalty points tracking
- Referral information
- Delivery personnel specific fields (vehicle, license, availability)

### Order Model
- User reference
- Product items with quantities
- Delivery address with geolocation
- Payment information
- Status tracking with history
- Loyalty points earned/applied
- Cancellation request handling

### Product Model
- Product details (name, description, price)
- Category association
- Images with file paths
- Availability status
- Restaurant information

### Cart Model
- User reference
- Product items with quantities
- Subtotal and final total calculations
- Coupon and loyalty discount tracking
- Temporary storage between sessions

### Live Chat Model
- User identification
- Message content and metadata
- Sender/receiver tracking
- Timestamp and read status

## Security Considerations

1. **Authentication**: JWT tokens with expiration
2. **Authorization**: Role-based access control
3. **Data Protection**: Password hashing with BCrypt
4. **Input Validation**: Request validation using express-validator
5. **Environment Variables**: Sensitive data stored securely
6. **CORS Policy**: Controlled cross-origin access
7. **File Upload Security**: Size limits and type validation
8. **API Rate Limiting**: Protection against abuse
9. **Error Handling**: Secure error messages without exposing internals

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