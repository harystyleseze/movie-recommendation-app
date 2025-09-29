# Authentication API - User Registration

## Overview

The user registration endpoint allows new users to create an account in the Movie Recommendation App. This endpoint handles user validation, password hashing, and JWT token generation.

## Endpoint Information

- **URL**: `/api/v1/auth/register`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Authentication**: Not required

## Request Format

### Request Body

```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

### Field Validation Rules

| Field | Type | Required | Validation Rules |
|-------|------|----------|------------------|
| `name` | string | Yes | - Minimum 2 characters<br>- Maximum 50 characters<br>- Whitespace trimmed |
| `email` | string | Yes | - Valid email format<br>- Converted to lowercase<br>- Whitespace trimmed<br>- Must be unique |
| `password` | string | Yes | - Minimum 8 characters<br>- Must contain at least one uppercase letter<br>- Must contain at least one lowercase letter<br>- Must contain at least one number<br>- Must contain at least one special character (@$!%*?&) |

## Response Format

### Success Response (201 Created)

```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "68da30785c4c06b8cf9a3db9",
      "name": "John Doe",
      "email": "john.doe@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Error Responses

#### Validation Error (400 Bad Request)

```json
{
  "status": "fail",
  "error": {
    "statusCode": 400,
    "status": "fail",
    "isOperational": true
  },
  "message": "Validation error message",
  "stack": "Error: Validation error..."
}
```

#### Duplicate Email (409 Conflict)

```json
{
  "status": "fail",
  "error": {
    "statusCode": 409,
    "status": "fail",
    "isOperational": true
  },
  "message": "Email already registered",
  "stack": "Error: Email already registered..."
}
```

#### Server Error (500 Internal Server Error)

```json
{
  "status": "error",
  "message": "Something went wrong"
}
```

## Request Examples

### Valid Registration Request

```bash
curl -X POST http://localhost:5001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "SecurePassword123@"
  }'
```

### Response:
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "68da30785c4c06b8cf9a3db9",
      "name": "John Doe",
      "email": "john.doe@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGRhMzA3ODVjNGMwNmI4Y2Y5YTNkYjkiLCJpYXQiOjE3NTkxMjk3MjAsImV4cCI6MTc1OTczNDUyMH0.gMQFuQki-HzB9UH0KYS0Yq3eYIiUdnH1QC7Dg8PoPWE"
  }
}
```

## Error Scenarios

### 1. Invalid Name (Too Short)

**Request:**
```bash
curl -X POST http://localhost:5001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "A",
    "email": "valid@example.com",
    "password": "ValidPassword123@"
  }'
```

**Response (400):**
```json
{
  "status": "fail",
  "message": "Name must be at least 2 characters"
}
```

### 2. Invalid Email Format

**Request:**
```bash
curl -X POST http://localhost:5001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "invalid-email",
    "password": "ValidPassword123@"
  }'
```

**Response (400):**
```json
{
  "status": "fail",
  "message": "Invalid email address"
}
```

### 3. Weak Password

**Request:**
```bash
curl -X POST http://localhost:5001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "weak"
  }'
```

**Response (400):**
```json
{
  "status": "fail",
  "message": "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
}
```

### 4. Duplicate Email

**Request:**
```bash
curl -X POST http://localhost:5001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "existing@example.com",
    "password": "ValidPassword123@"
  }'
```

**Response (409):**
```json
{
  "status": "fail",
  "message": "Email already registered"
}
```

### 5. Missing Fields

**Request:**
```bash
curl -X POST http://localhost:5001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe"
  }'
```

**Response (400):**
```json
{
  "status": "fail",
  "message": "Required"
}
```

## Implementation Details

### Architecture Components

The registration endpoint involves the following components:

1. **Route Handler** (`src/routes/auth.routes.js`):
   - Defines the POST `/register` route
   - Applies logging middleware
   - Routes to auth controller

2. **Controller** (`src/controllers/auth.controller.js`):
   - Validates request body using Zod schema
   - Calls auth service for user registration
   - Returns structured response

3. **Validation** (`src/validators/auth.validator.js`):
   - Zod schema for request validation
   - Enforces password complexity rules
   - Email format validation

4. **Service Layer** (`src/services/auth.service.js`):
   - Business logic for user registration
   - Checks for existing users
   - Generates JWT tokens

5. **Database Model** (`src/models/user.model.js`):
   - Mongoose schema for user data
   - Password hashing middleware
   - Password comparison methods

6. **Error Handling** (`src/utils/error.js`, `src/utils/async.js`):
   - Custom error classes
   - Async error handling wrapper
   - Zod validation error processing

### Security Features

1. **Password Hashing**:
   - Uses bcryptjs with salt rounds of 12
   - Passwords are hashed before database storage
   - Original passwords are never stored

2. **JWT Token**:
   - 7-day expiration time
   - Signed with JWT_SECRET environment variable
   - Contains user ID for session management

3. **Input Validation**:
   - Comprehensive Zod schema validation
   - Email uniqueness enforcement
   - Password strength requirements

4. **CORS Protection**:
   - Whitelisted origins configuration
   - Credentials support enabled

### Environment Configuration

Required environment variables:

```env
PORT=5001
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/movie-recommendation-dev
JWT_SECRET=your_jwt_secret_key
```

### Database Schema

```javascript
{
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Available Authentication Endpoints

| Endpoint | Method | Description | Status |
|----------|--------|-------------|---------|
| `/api/v1/auth/register` | POST | User registration | ✅ Implemented |
| `/api/v1/auth/login` | POST | User login | ❌ Not implemented |
| `/api/v1/auth/profile` | GET | Get user profile | ❌ Not implemented |
| `/api/v1/auth/profile` | PUT | Update user profile | ❌ Not implemented |
| `/api/v1/auth/change-password` | POST | Change password | ❌ Not implemented |

## Testing with Different Tools

### Using cURL

```bash
# Valid registration
curl -X POST http://localhost:5001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Password123@"}' \
  -w "\n%{http_code}\n"
```

### Using Postman

1. **Method**: POST
2. **URL**: `http://localhost:5001/api/v1/auth/register`
3. **Headers**:
   - `Content-Type: application/json`
4. **Body** (raw JSON):
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "Password123@"
}
```

### Using HTTPie

```bash
http POST localhost:5001/api/v1/auth/register \
  name="Test User" \
  email="test@example.com" \
  password="Password123@"
```

### Using JavaScript (Fetch API)

```javascript
fetch('http://localhost:5001/api/v1/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Test User',
    email: 'test@example.com',
    password: 'Password123@'
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

## Notes

- The endpoint is configured to work with whitelisted CORS origins
- Password requirements are enforced at validation level
- JWT tokens have a 7-day expiration period
- User emails are automatically converted to lowercase
- The server runs on port 5001 (changed from 5000 due to macOS AirPlay conflict)
- All responses include appropriate HTTP status codes
- Error responses include stack traces in development mode

## Next Steps

To complete the authentication system:

1. Implement login endpoint (`/api/v1/auth/login`)
2. Add user profile endpoints
3. Implement password reset functionality
4. Add refresh token mechanism
5. Create frontend authentication components