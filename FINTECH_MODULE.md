# Fintech Module Documentation

## Overview

The Fintech module enables third-party fintech partners to onboard their own banks into the Digital Banking System and create user accounts with automatic funding and identity verification.

## Features

- **Fintech Authentication**: Secure login with email and password
- **Bank Onboarding**: Create and manage multiple banks under a fintech entity
- **Complete CRUD Operations**: Create, Read, Update, Delete operations for banks
- **Bank Activation/Suspension**: Manage bank status
- **User Account Creation**: Create accounts with automatic 15,000 NGN funding
- **KYC Verification**: Mandatory NIN or BVN validation before account creation
- **Bank Statistics**: Track account statistics and transaction volumes

## Authentication

### Fintech Login

**Endpoint**: `POST /api/fintech/login`

**Access**: Public

**Request Body**:
```json
{
  "email": "fintech@example.com",
  "password": "securePassword123"
}
```

**Response (Success - 200)**:
```json
{
  "success": true,
  "message": "Login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "fintech": {
    "_id": "64a2b3c4d5e6f7g8h9i0j1k2",
    "email": "fintech@example.com",
    "name": "TechBank Fintech",
    "status": "active"
  }
}
```

**Response (Error - 401)**:
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

## Bank Management

### 1. Onboard New Bank

**Endpoint**: `POST /api/fintech/banks/onboard`

**Access**: Protected (Fintech User)

**Request Body**:
```json
{
  "bankName": "TechBank Nigeria",
  "bankCode": "TECH",
  "bankType": "commercial",
  "email": "contact@techbank.com",
  "phone": "+234801234567",
  "registrationNumber": "RC/2023/001",
  "headOffice": "Lagos, Nigeria",
  "requireNINVerification": true,
  "requireBVNVerification": false
}
```

**Response (Success - 201)**:
```json
{
  "success": true,
  "message": "Bank onboarded successfully",
  "bank": {
    "_id": "64a2b3c4d5e6f7g8h9i0j1k2",
    "bankName": "TechBank Nigeria",
    "bankCode": "TECH",
    "fintechId": "user_id",
    "status": "active",
    "verificationStatus": "verified",
    "totalAccounts": 0,
    "totalDeposits": 0,
    "defaultAccountFundingAmount": 15000
  }
}
```

**Validation Rules**:
- Bank name: Required, minimum 3 characters
- Bank code: Required, unique, 2-4 characters
- Bank type: Required, must be one of: commercial, microfinance, cooperative, development, merchant
- Email: Required, valid email format
- Phone: Required, valid phone format

### 2. Get All Banks

**Endpoint**: `GET /api/fintech/banks`

**Access**: Protected (Fintech User)

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Records per page (default: 10)
- `status` (optional): Filter by status (active, suspended, terminated)

**Response (Success - 200)**:
```json
{
  "success": true,
  "message": "Banks retrieved successfully",
  "data": [
    {
      "_id": "64a2b3c4d5e6f7g8h9i0j1k2",
      "bankName": "TechBank Nigeria",
      "bankCode": "TECH",
      "status": "active",
      "totalAccounts": 5,
      "totalDeposits": 75000
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

### 3. Get Bank Details

**Endpoint**: `GET /api/fintech/banks/:bankId`

**Access**: Protected (Fintech User)

**Response (Success - 200)**:
```json
{
  "success": true,
  "message": "Bank retrieved successfully",
  "bank": {
    "_id": "64a2b3c4d5e6f7g8h9i0j1k2",
    "bankName": "TechBank Nigeria",
    "bankCode": "TECH",
    "status": "active",
    "totalAccounts": 5,
    "activeAccountsCount": 4,
    "totalDeposits": 75000,
    "totalWithdrawals": 10000,
    "email": "contact@techbank.com",
    "phone": "+234801234567"
  }
}
```

### 4. Update Bank

**Endpoint**: `PUT /api/fintech/banks/:bankId`

**Access**: Protected (Fintech User)

**Request Body**:
```json
{
  "bankName": "TechBank Nigeria Ltd",
  "email": "newemail@techbank.com",
  "phone": "+234809876543"
}
```

**Response (Success - 200)**:
```json
{
  "success": true,
  "message": "Bank updated successfully",
  "bank": {
    "_id": "64a2b3c4d5e6f7g8h9i0j1k2",
    "bankName": "TechBank Nigeria Ltd",
    "email": "newemail@techbank.com"
  }
}
```

### 5. Delete Bank

**Endpoint**: `DELETE /api/fintech/banks/:bankId`

**Access**: Protected (Fintech User)

**Response (Success - 200)**:
```json
{
  "success": true,
  "message": "Bank deleted successfully"
}
```

### 6. Activate Bank

**Endpoint**: `POST /api/fintech/banks/:bankId/activate`

**Access**: Protected (Fintech User)

**Response (Success - 200)**:
```json
{
  "success": true,
  "message": "Bank activated successfully",
  "bank": {
    "_id": "64a2b3c4d5e6f7g8h9i0j1k2",
    "status": "active",
    "verificationStatus": "verified"
  }
}
```

### 7. Suspend Bank

**Endpoint**: `POST /api/fintech/banks/:bankId/suspend`

**Access**: Protected (Fintech User)

**Request Body**:
```json
{
  "reason": "Regulatory compliance review"
}
```

**Response (Success - 200)**:
```json
{
  "success": true,
  "message": "Bank suspended successfully",
  "bank": {
    "_id": "64a2b3c4d5e6f7g8h9i0j1k2",
    "status": "suspended",
    "suspensionReason": "Regulatory compliance review"
  }
}
```

## Account Management

### Create User Account with Auto-Funding

**Endpoint**: `POST /api/fintech/banks/:bankId/accounts/create`

**Access**: Protected (Fintech User)

**Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+234801234567",
  "nin": "12345678901",
  "accountType": "savings"
}
```

Or with BVN instead:
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "phone": "+234809876543",
  "bvn": "98765432109",
  "accountType": "current"
}
```

**Response (Success - 201)**:
```json
{
  "success": true,
  "message": "Account created successfully with auto-funding",
  "account": {
    "_id": "account_id",
    "accountNumber": "TECH2024123456",
    "accountType": "savings",
    "balance": 15000,
    "currency": "NGN",
    "status": "active",
    "user": {
      "_id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    },
    "verificationDetails": {
      "identityType": "NIN",
      "identityNumber": "12345678901",
      "verificationStatus": "verified",
      "verifiedAt": "2024-01-15T10:30:00Z"
    },
    "fundingDetails": {
      "amount": 15000,
      "currency": "NGN",
      "fundedAt": "2024-01-15T10:30:00Z",
      "reference": "AUTO-FUND-2024-001"
    }
  }
}
```

**Validation Rules**:
- First name: Required, minimum 2 characters
- Last name: Required, minimum 2 characters
- Email: Required, valid email format
- Phone: Required, valid phone format
- NIN: Optional but exactly 11 digits if provided
- BVN: Optional but exactly 11 digits if provided
- At least one of NIN or BVN must be provided
- Account type: Required (checking, savings, investment, loan)

**Business Logic**:
1. Validates that bank exists and belongs to authenticated fintech
2. Checks identity verification requirements based on bank configuration
3. Verifies NIN/BVN format (11 digits each)
4. Checks for duplicate verified identities
5. Creates user if new or retrieves existing user
6. Creates/updates NIN or BVN record with 'verified' status
7. Creates account with auto-funding amount (default 15,000 NGN)
8. Updates bank statistics
9. Returns complete account details with verification confirmation

### Account Funding Details

- **Default Amount**: 15,000 NGN
- **Automatic**: Funded immediately upon account creation
- **Currency**: NGN (Nigerian Naira)
- **Reference Format**: AUTO-FUND-BANK_CODE-TIMESTAMP

## Bank Statistics

### Get Bank Statistics

**Endpoint**: `GET /api/fintech/banks/:bankId/statistics`

**Access**: Protected (Fintech User)

**Response (Success - 200)**:
```json
{
  "success": true,
  "message": "Statistics retrieved successfully",
  "statistics": {
    "totalAccounts": 15,
    "activeAccounts": 14,
    "suspendedAccounts": 1,
    "totalDeposits": 225000,
    "totalWithdrawals": 50000,
    "netDeposits": 175000,
    "averageAccountBalance": 15000,
    "status": "active"
  }
}
```

## Identity Verification Routes

### Validate NIN

**Endpoint**: `POST /api/nin/validate`

**Access**: Public

**Request Body**:
```json
{
  "nin": "12345678901",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (Success - 201)**:
```json
{
  "success": true,
  "message": "NIN validated successfully",
  "nin": {
    "_id": "nin_id",
    "nin": "12345678901",
    "verificationStatus": "verified",
    "verifiedAt": "2024-01-15T10:30:00Z"
  }
}
```

### Validate BVN

**Endpoint**: `POST /api/bvn/validate`

**Access**: Public

**Request Body**:
```json
{
  "bvn": "98765432109",
  "firstName": "Jane",
  "lastName": "Smith"
}
```

**Response (Success - 201)**:
```json
{
  "success": true,
  "message": "BVN validated successfully",
  "bvn": {
    "_id": "bvn_id",
    "bvn": "98765432109",
    "verificationStatus": "verified",
    "verifiedAt": "2024-01-15T10:30:00Z"
  }
}
```

### Get Verification Status

**Endpoint**: `GET /api/nin/:userId/verification-status`

**Access**: Protected

**Response (Success - 200)**:
```json
{
  "success": true,
  "message": "Verification status retrieved",
  "verification": {
    "ninVerified": true,
    "bvnVerified": false,
    "nin": {
      "status": "verified",
      "verifiedAt": "2024-01-15T10:30:00Z"
    },
    "bvn": {
      "status": "pending",
      "verifiedAt": null
    }
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "bankCode",
      "message": "Bank code must be 2-4 characters"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "No token provided or invalid token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Not authorized to perform this action"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Bank not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Bank code already exists"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Usage Examples

### Example 1: Complete Fintech Onboarding Flow

```bash
# 1. Fintech Login
curl -X POST http://localhost:3000/api/fintech/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "fintech@example.com",
    "password": "securePassword123"
  }'

# Response contains accessToken and refreshToken

# 2. Onboard New Bank
curl -X POST http://localhost:3000/api/fintech/banks/onboard \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{
    "bankName": "TechBank Nigeria",
    "bankCode": "TECH",
    "bankType": "commercial",
    "email": "contact@techbank.com",
    "phone": "+234801234567",
    "requireNINVerification": true,
    "requireBVNVerification": false
  }'

# 3. Create User Account with Auto-Funding
curl -X POST http://localhost:3000/api/fintech/banks/<bankId>/accounts/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+234801234567",
    "nin": "12345678901",
    "accountType": "savings"
  }'

# 4. Get Bank Statistics
curl -X GET http://localhost:3000/api/fintech/banks/<bankId>/statistics \
  -H "Authorization: Bearer <accessToken>"
```

### Example 2: Access Fintech Login Page

Open your browser and navigate to:
```
http://localhost:3000/fintech-login
```

This provides a user-friendly interface for fintech partners to authenticate.

## Security Considerations

1. **JWT Authentication**: All protected endpoints require valid JWT tokens
2. **Rate Limiting**: 5 failed login attempts per 15 minutes triggers account lock
3. **Password Hashing**: All passwords are hashed using bcryptjs (10 salt rounds)
4. **Identity Verification**: Mandatory NIN or BVN validation before account creation
5. **KYC Compliance**: Automatic KYC verification upon account creation
6. **Soft Deletes**: Banks are not permanently deleted, status is marked as 'terminated'

## Configuration

The fintech module uses the following defaults:

- **Default Account Funding**: 15,000 NGN
- **Token Expiry**: 
  - Access Token: 1 day
  - Refresh Token: 7 days
- **Rate Limits**:
  - Login attempts: 5 per 15 minutes
  - General API calls: 100 per 15 minutes
- **Identity Validation**: Both NIN and BVN formats are 11 digits

## Webhooks (Future Implementation)

Planned webhook events for fintech partners:
- `bank.created`
- `bank.activated`
- `bank.suspended`
- `account.created`
- `account.funded`
- `account.suspended`
- `transaction.completed`
