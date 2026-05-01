# Digital Banking System API

A comprehensive Node.js/Express-based digital banking system with authentication, account management, transactions, payments, and more.

## Features

✅ **User Management**
- User registration and login
- JWT-based authentication
- Password reset functionality
- Two-factor authentication
- KYC verification

✅ **Account Management**
- Multiple account types (Savings, Checking, Investment, Money Market)
- Account balance tracking
- Daily/monthly spending limits
- Account status management

✅ **Transactions**
- Internal transfers between accounts
- External bank transfers
- Transaction history and tracking
- Transaction reversal
- Transaction summaries

✅ **Payments**
- Payment creation and confirmation
- Scheduled payments
- Recurring payments
- Payment cancellation and refunds
- Payment history and summaries

✅ **Security**
- Password hashing with bcryptjs
- JWT token-based authentication
- Rate limiting on login attempts
- Account locking after failed attempts
- KYC/AML compliance features

## Project Structure

```
DIGITAL BANKING SYSTEM/
├── CONFIG/              # Configuration files
│   ├── constants.js    # Application constants
│   ├── database.js     # MongoDB connection
│   ├── jwt.js          # JWT utilities
│   └── cloudinary.js   # File upload service
├── MODEL/              # Database schemas
│   ├── users.js
│   ├── accounts.js
│   ├── transactions.js
│   ├── payments.js
│   ├── beneficiaries.js
│   ├── cards.js
│   ├── BVNs.js
│   ├── NINs.js
│   ├── fintechs.js
│   └── loans.js
├── CONTROLLER/         # Business logic
│   ├── authController.js
│   ├── userController.js
│   ├── transactionController.js
│   └── paymentController.js
├── ROUTES/             # API endpoints
│   ├── AuthRoutes.js
│   ├── userRoutes.js
│   ├── transactionRoutes.js
│   ├── paymentRoutes.js
│   └── beneficiaries.js
├── MIDDLEWARE/         # Custom middleware
│   ├── authMiddleware.js
│   └── validationMiddleware.js
├── VALIDATOR/          # Input validators
└── UTILITY/            # Helper functions
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd DIGITAL\ BANKING\ SYSTEM
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration values

5. Start the server:
```bash
npm start
# or for development with auto-reload
npm run dev
```

## API Endpoints

### Authentication Routes (`/api/auth`)

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+234811234567",
  "password": "SecurePassword123",
  "confirmPassword": "SecurePassword123",
  "dateOfBirth": "1990-01-15",
  "gender": "Male"
}

Response:
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {...},
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### Login User
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {...},
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

#### Request Password Reset
```
POST /api/auth/request-password-reset
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### Reset Password
```
POST /api/auth/reset-password
Content-Type: application/json

{
  "resetCode": "abc123",
  "newPassword": "NewPassword123",
  "confirmPassword": "NewPassword123"
}
```

#### Change Password (Authenticated)
```
POST /api/auth/change-password
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "currentPassword": "SecurePassword123",
  "newPassword": "NewPassword123",
  "confirmPassword": "NewPassword123"
}
```

### User Routes (`/api/users`) - Requires Authentication

#### Get User Profile
```
GET /api/users/profile
Authorization: Bearer <accessToken>
```

#### Update User Profile
```
PUT /api/users/profile
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Doe",
  "occupation": "Software Engineer",
  "employmentStatus": "employed"
}
```

#### Create Account
```
POST /api/users/accounts
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "accountType": "Savings",
  "accountName": "My Savings Account",
  "currency": "NGN"
}

Response:
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "_id": "...",
    "accountNumber": "1234567890",
    "accountType": "Savings",
    "balance": 0,
    "status": "active"
  }
}
```

#### Get User Accounts
```
GET /api/users/accounts
Authorization: Bearer <accessToken>
```

#### Get Account Details
```
GET /api/users/accounts/:accountId
Authorization: Bearer <accessToken>
```

#### Set Primary Account
```
PUT /api/users/accounts/:accountId/set-primary
Authorization: Bearer <accessToken>
```

### Transaction Routes (`/api/transactions`) - Requires Authentication

#### Get Transaction History
```
GET /api/transactions/history?page=1&limit=20&status=successful&type=transfer&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <accessToken>

Response:
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

#### Get Single Transaction
```
GET /api/transactions/:transactionId
Authorization: Bearer <accessToken>
```

#### Transfer Between Accounts
```
POST /api/transactions/transfer-account
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "fromAccountId": "...",
  "toAccountId": "...",
  "amount": 50000,
  "description": "Payment for services"
}

Response:
{
  "success": true,
  "message": "Transaction successful",
  "data": {
    "transactionId": "TXN1234567890",
    "status": "successful",
    "amount": 50000,
    "completedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Transfer to Bank
```
POST /api/transactions/transfer-bank
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "fromAccountId": "...",
  "recipientBank": "Zenith Bank",
  "recipientAccountNumber": "1234567890",
  "recipientName": "John Smith",
  "amount": 100000,
  "description": "Monthly allowance"
}
```

#### Reverse Transaction
```
POST /api/transactions/:transactionId/reverse
Authorization: Bearer <accessToken>
```

#### Get Transaction Summary
```
GET /api/transactions/summary/report?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <accessToken>
```

### Payment Routes (`/api/payments`) - Requires Authentication

#### Create Payment
```
POST /api/payments/create
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "payerAccountId": "...",
  "payeeId": "...",
  "amount": 50000,
  "description": "Monthly rent",
  "category": "bill",
  "paymentMethod": "account_transfer",
  "isScheduled": false
}

Response:
{
  "success": true,
  "message": "Payment successful",
  "data": {
    "paymentId": "PAY1234567890",
    "status": "completed",
    "amount": 50000
  }
}
```

#### Get Payment History
```
GET /api/payments/history?page=1&limit=20&status=completed&category=bill
Authorization: Bearer <accessToken>
```

#### Get Single Payment
```
GET /api/payments/:paymentId
Authorization: Bearer <accessToken>
```

#### Confirm Payment
```
POST /api/payments/:paymentId/confirm
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "otp": "123456"
}
```

#### Cancel Payment
```
POST /api/payments/:paymentId/cancel
Authorization: Bearer <accessToken>
```

#### Refund Payment
```
POST /api/payments/:paymentId/refund
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "reason": "Service not rendered"
}
```

#### Get Payment Summary
```
GET /api/payments/summary/report?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <accessToken>
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Error Handling

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Optional validation errors
}
```

## Database Models

### User
- Personal information (name, DOB, email, phone)
- Authentication credentials
- KYC/AML verification status
- Account references
- Security settings

### Account
- Account number and type
- Balance tracking
- Daily/monthly limits
- Account status
- Interest rates

### Transaction
- Complete transaction details
- Status tracking
- Fee and tax information
- Retry mechanism
- Verification support

### Payment
- Payment identification
- Payer/payee information
- Status tracking
- Fee structure
- Scheduled/recurring payments

### BVN/NIN
- Biometric Verification Number/National Identification Number
- KYC compliance
- Risk assessment
- Sanctions checking

### Card
- Virtual/physical card details
- Spending limits
- Status tracking
- Device binding

### Beneficiary
- Saved recipient information
- Account verification
- Transfer tracking
- Blocking functionality

### Loan
- Loan details and terms
- Payment schedule
- Outstanding balance
- Collateral information

### Fintech
- Partner integration details
- API configuration
- Commission structures
- Compliance tracking

## Security Features

✅ Password hashing with bcryptjs
✅ JWT-based authentication
✅ Rate limiting (5 attempts/15 min for login)
✅ Account locking after failed attempts
✅ Input validation and sanitization
✅ CORS protection
✅ XSS protection
✅ CSRF tokens (when applicable)
✅ Encryption for sensitive data
✅ Audit logging

## Environment Variables

See `.env.example` for required environment variables.

## Development

```bash
# Install dependencies
npm install

# Run with nodemon (auto-reload)
npm run dev

# Run tests (if available)
npm test

# Build for production
npm run build
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure all environment variables
3. Use a process manager (PM2, Forever, etc.)
4. Enable HTTPS
5. Set up MongoDB Atlas or similar service
6. Configure monitoring and logging
7. Set up backup strategies

## Contributing

Please submit pull requests or issues to the repository.

## License

ISC

## Support

For support, contact the development team or create an issue in the repository.
