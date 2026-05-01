# Digital Banking System - Quick Start Guide

This guide will help you get up and running with the Digital Banking System API.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory (copy from `.env.example`):

```bash
cp .env.example .env
```

Update the `.env` file with your values:
```
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/digital-banking-db
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
```

### 3. Start the Server
```bash
npm start
```

The API will be available at `http://localhost:3000`

## Usage Examples

### Step 1: Register a New User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+234811234567",
    "password": "SecurePassword123",
    "confirmPassword": "SecurePassword123",
    "dateOfBirth": "1990-01-15",
    "gender": "Male"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+234811234567"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Step 2: Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123"
  }'
```

Save the `accessToken` from the response. You'll use it for authenticated requests.

### Step 3: Create an Account

```bash
curl -X POST http://localhost:3000/api/users/accounts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "accountType": "Savings",
    "accountName": "My Savings Account",
    "currency": "NGN"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "accountNumber": "1234567890",
    "accountType": "Savings",
    "balance": 0,
    "status": "active"
  }
}
```

### Step 4: Get User Accounts

```bash
curl -X GET http://localhost:3000/api/users/accounts \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Step 5: Transfer Between Accounts

First, create another account for the transfer:

```bash
curl -X POST http://localhost:3000/api/users/accounts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "accountType": "Checking",
    "accountName": "My Checking Account",
    "currency": "NGN"
  }'
```

Then transfer:

```bash
curl -X POST http://localhost:3000/api/transactions/transfer-account \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "fromAccountId": "507f1f77bcf86cd799439012",
    "toAccountId": "507f1f77bcf86cd799439013",
    "amount": 50000,
    "description": "Monthly savings transfer"
  }'
```

### Step 6: View Transaction History

```bash
curl -X GET "http://localhost:3000/api/transactions/history?page=1&limit=20&status=successful" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Step 7: Create a Payment

```bash
curl -X POST http://localhost:3000/api/payments/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "payerAccountId": "507f1f77bcf86cd799439012",
    "amount": 25000,
    "description": "Internet bill payment",
    "category": "bill",
    "paymentMethod": "account_transfer"
  }'
```

### Step 8: View Payment History

```bash
curl -X GET "http://localhost:3000/api/payments/history?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Step 9: Add Beneficiary

```bash
curl -X POST http://localhost:3000/api/beneficiaries/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "beneficiaryName": "Jane Smith",
    "phone": "+234812345678",
    "accountNumber": "0123456789",
    "bankCode": "058",
    "bankName": "GTBank"
  }'
```

### Step 10: Apply for Loan

First, ensure you have an account to link the loan to:

```bash
curl -X POST http://localhost:3000/api/loans/apply \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "loanType": "personal",
    "loanAmount": 500000,
    "loanTerm": 12,
    "interestRate": 12,
    "purpose": "Personal development",
    "accountId": "507f1f77bcf86cd799439012"
  }'
```

## API Response Format

All responses follow a standard format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* specific data */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Optional validation errors
}
```

## HTTP Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Authentication

Always include the access token in the Authorization header for protected routes:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Rate Limiting

- Login endpoint: 5 attempts per 15 minutes
- General API: 100 requests per 15 minutes

## Key Features

### Account Management
- Create multiple accounts
- Set primary account
- View account details
- Track balances

### Transactions
- Transfer between own accounts
- Transfer to external banks
- View transaction history
- Reverse transactions
- Generate transaction summaries

### Payments
- Create one-time payments
- Schedule future payments
- Set up recurring payments
- Cancel pending payments
- Process refunds
- Track payment history

### Beneficiaries
- Save frequently used accounts
- Mark favorites
- Block accounts
- Delete saved beneficiaries

### Cards
- Create virtual/physical cards
- Block cards
- Report lost cards
- Set spending limits

### Loans
- Apply for loans
- View loan details
- Track loan balance
- Make loan payments
- View payment history

## Common Issues

### "Invalid or expired token"
- Token has expired. Login again to get a new token.
- Use the refresh token to get a new access token.

### "Insufficient funds"
- Account balance is less than the transaction amount.
- Check account balance before transacting.

### "Account not found"
- Account ID is invalid or doesn't belong to the user.
- Verify the account ID.

### "User already exists"
- Email or phone number is already registered.
- Use a different email/phone or login if you already have an account.

## Testing with Postman

1. Import the API into Postman
2. Set up environment variables:
   - `BASE_URL`: http://localhost:3000
   - `ACCESS_TOKEN`: (obtained from login)
3. Use the collection to test endpoints

## Need Help?

- Check the README.md for detailed endpoint documentation
- Review the .env.example for required environment variables
- Check logs for error details
- Ensure MongoDB connection is working

## Next Steps

1. Integrate with frontend application
2. Set up payment gateway integration
3. Configure email notifications
4. Set up monitoring and logging
5. Deploy to production
