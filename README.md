# 🚀 Uraan Server - Ticket Booking Backend API

A robust and scalable backend server for the Uraan ticket booking platform built with Node.js, Express, MongoDB, and Firebase.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Server](#running-the-server)
- [API Endpoints](#api-endpoints)
- [Database Models](#database-models)
- [Scripts](#scripts)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Error Handling](#error-handling)

## ✨ Features

- 🔐 **Authentication & Authorization**: Firebase Admin SDK integration with JWT tokens
- 🎫 **Ticket Management**: CRUD operations for bus, train, launch, and plane tickets
- 📅 **Booking System**: Complete booking flow with seat selection and date management
- 💳 **Payment Integration**: Stripe payment processing with secure transactions
- 👥 **Role-Based Access**: Admin, Vendor, and User roles with different permissions
- 📊 **Transaction Tracking**: Comprehensive payment and booking history
- 🔄 **Real-time Updates**: Automatic seat availability and booking status management
- ⚡ **Optimized Performance**: Indexed MongoDB queries and efficient data retrieval

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Firebase Admin SDK
- **Payment**: Stripe
- **Security**: JWT, CORS, dotenv
- **Development**: Nodemon for hot reload

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas account)
- **Firebase Project** with Admin SDK credentials
- **Stripe Account** for payment processing

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd assignment11server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your actual credentials (see [Environment Variables](#environment-variables))

4. **Initialize Firebase Admin SDK**
   - Go to Firebase Console → Project Settings → Service Accounts
   - Generate a new private key (JSON file)
   - Save the JSON file as `firebase-service-account.json` in the project root
   - Or set individual Firebase credentials in `.env` file

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/uraan?retryWrites=true&w=majority

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----\n"

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173

# Vercel (for deployment)
VERCEL_URL=your-app.vercel.app
```

### Important Notes:
- **MONGODB_URI**: Get from MongoDB Atlas or use local MongoDB
- **Firebase Credentials**: From Firebase Console → Service Accounts
- **Stripe Keys**: From Stripe Dashboard → Developers → API Keys
- **JWT_SECRET**: Generate a strong random string

## 🏃 Running the Server

### Development Mode (with hot reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000` by default.

## 📡 API Endpoints

### Authentication & Users
```
POST   /api/users/create          - Create new user
POST   /api/users/jwt              - Generate JWT token
POST   /api/users/generate-token   - Generate token for existing user
GET    /api/users/:email           - Get user by email
GET    /api/users                  - Get all users (Admin only)
PATCH  /api/users/:id              - Update user
DELETE /api/users/:id              - Delete user (Admin only)
```

### Tickets
```
GET    /api/tickets                - Get all tickets (with filters)
GET    /api/tickets/advertised     - Get advertised tickets
GET    /api/tickets/:id            - Get single ticket
POST   /api/tickets                - Create ticket (Vendor/Admin)
PUT    /api/tickets/:id            - Update ticket (Vendor/Admin)
DELETE /api/tickets/:id            - Delete ticket (Vendor/Admin)
```

### Bookings
```
GET    /api/bookings               - Get user bookings
GET    /api/bookings/all           - Get all bookings (Admin)
GET    /api/bookings/:id           - Get single booking
POST   /api/bookings               - Create booking
PUT    /api/bookings/:id           - Update booking
DELETE /api/bookings/:id           - Cancel booking
```

### Payments
```
POST   /api/payments/create-intent - Create Stripe payment intent
POST   /api/payments/confirm       - Confirm payment and update records
GET    /api/payments/:id           - Get payment details
```

### Transactions
```
GET    /api/transactions           - Get user transactions
GET    /api/transactions/all       - Get all transactions (Admin)
GET    /api/transactions/:id       - Get single transaction
```

## 🗄️ Database Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  photoURL: String,
  firebaseUid: String,
  role: ['user', 'vendor', 'admin'],
  createdAt: Date,
  updatedAt: Date
}
```

### Ticket Model
```javascript
{
  title: String,
  from: String,
  to: String,
  transportType: ['bus', 'train', 'launch', 'plane'],
  busName: String,
  departureTime: String,
  arrivalTime: String,
  pricePerUnit: Number,
  quantity: Number,
  perks: [String],
  imageUrl: String,
  isAdvertised: Boolean,
  vendorId: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### Booking Model
```javascript
{
  userId: ObjectId (ref: User),
  ticketId: ObjectId (ref: Ticket),
  quantity: Number,
  totalPrice: Number,
  travelDate: Date,
  seatNumbers: [String],
  status: ['pending', 'confirmed', 'cancelled'],
  paymentStatus: ['pending', 'paid', 'failed'],
  createdAt: Date,
  updatedAt: Date
}
```

### Transaction Model
```javascript
{
  userId: ObjectId (ref: User),
  bookingId: ObjectId (ref: Booking),
  amount: Number,
  currency: String,
  paymentMethod: String,
  stripePaymentIntentId: String,
  status: ['pending', 'completed', 'failed'],
  createdAt: Date,
  updatedAt: Date
}
```

## 📜 Scripts

### Create Admin User
```bash
npm run create-admin
```
Creates an admin user in the database. Modify `scripts/createAdmin.js` to set admin credentials.

### Other Available Scripts
- **Check Bookings**: `node scripts/checkBookings.js`
- **Check Users**: `node scripts/checkUsers.js`
- **Create Sample Data**: `node scripts/createSampleData.js`
- **Test Vendor API**: `node scripts/testVendorAPI.js`

## 🚀 Deployment

### Vercel Deployment

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Set Environment Variables**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add all variables from `.env` file

4. **Configure vercel.json**
   The project includes a `vercel.json` configuration file for serverless deployment.

For detailed deployment instructions, see [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)

### Other Platforms
- **Heroku**: Use Procfile with `web: node index.js`
- **AWS EC2/EB**: Traditional Node.js deployment
- **Railway**: Connect GitHub and deploy automatically
- **Render**: Similar to Heroku, supports Node.js

## 📁 Project Structure

```
assignment11server/
├── config/
│   ├── db.js              # MongoDB connection
│   ├── firebase.js        # Firebase Admin initialization
│   └── stripe.js          # Stripe configuration
├── controllers/
│   ├── bookingController.js
│   ├── paymentController.js
│   ├── ticketController.js
│   ├── transactionController.js
│   └── userController.js
├── middleware/
│   ├── auth.js            # JWT authentication
│   └── errorHandler.js    # Global error handling
├── models/
│   ├── Booking.js
│   ├── Ticket.js
│   ├── Transaction.js
│   └── User.js
├── routes/
│   ├── bookingRoutes.js
│   ├── paymentRoutes.js
│   ├── ticketRoutes.js
│   ├── transactionRoutes.js
│   └── userRoutes.js
├── scripts/
│   ├── checkBookings.js
│   ├── createAdmin.js
│   └── createSampleData.js
├── utils/
│   └── bookingUtils.js    # Helper functions
├── .env.example           # Environment variables template
├── .gitignore
├── index.js               # Application entry point
├── package.json
├── vercel.json            # Vercel configuration
└── README.md
```

## 🛡️ Error Handling

The API uses centralized error handling with the following structure:

### Error Response Format
```json
{
  "message": "Error description",
  "error": "Detailed error information",
  "stack": "Stack trace (development only)"
}
```

### HTTP Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

## 🔒 Security Features

- ✅ CORS configuration for specific origins
- ✅ JWT token-based authentication
- ✅ Firebase Admin SDK for secure user management
- ✅ Environment variables for sensitive data
- ✅ Input validation and sanitization
- ✅ Secure payment processing with Stripe
- ✅ Role-based access control

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Uraan Development Team**

## 📞 Support

For issues, questions, or contributions, please open an issue in the repository or contact the development team.

---

**Built with ❤️ using MERN Stack**
