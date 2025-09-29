# Authentication API - User Login

## Overview

The user login endpoint allows existing users to authenticate and receive a JWT token for accessing protected resources in the Movie Recommendation App. This endpoint validates user credentials and returns user data along with an authentication token.

## Endpoint Information

- **URL**: `/api/v1/auth/login`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Authentication**: Not required

## Request Format

### Request Body

```json
{
  "email": "string",
  "password": "string"
}
```

### Field Validation Rules

| Field | Type | Required | Validation Rules |
|-------|------|----------|------------------|
| `email` | string | Yes | - Valid email format<br>- Converted to lowercase<br>- Whitespace trimmed |
| `password` | string | Yes | - Minimum 1 character (any existing password) |

## Response Format

### Success Response (200 OK)

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

#### Invalid Credentials (401 Unauthorized)

**Used for both non-existent email and wrong password (security best practice)**

```json
{
  "status": "fail",
  "error": {
    "statusCode": 401,
    "status": "fail",
    "isOperational": true
  },
  "message": "Invalid credentials",
  "stack": "Error: Invalid credentials..."
}
```

#### Validation Error (400 Bad Request)

```json
{
  "status": "fail",
  "error": {
    "statusCode": 400,
    "status": "fail",
    "isOperational": true
  },
  "message": "Validation error",
  "stack": "Error: Validation error..."
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

### Valid Login Request

```bash
curl -X POST http://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
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
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGRhMzA3ODVjNGMwNmI4Y2Y5YTNkYjkiLCJpYXQiOjE3NTkxMzE5MTAsImV4cCI6MTc1OTczNjcxMH0.r7O3Xcb_6ZfbBbDjF2nehCnxzAncWADlLbC-HQde35s"
  }
}
```

## Error Scenarios

### 1. Non-Existent Email

**Request:**
```bash
curl -X POST http://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@example.com",
    "password": "Password123@"
  }'
```

**Response (401):**
```json
{
  "status": "fail",
  "message": "Invalid credentials"
}
```

### 2. Wrong Password

**Request:**
```bash
curl -X POST http://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "WrongPassword123@"
  }'
```

**Response (401):**
```json
{
  "status": "fail",
  "message": "Invalid credentials"
}
```

### 3. Invalid Email Format

**Request:**
```bash
curl -X POST http://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "Password123@"
  }'
```

**Response (400):**
```json
{
  "status": "fail",
  "message": "Invalid email address"
}
```

### 4. Missing Password

**Request:**
```bash
curl -X POST http://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com"
  }'
```

**Response (400):**
```json
{
  "status": "fail",
  "message": "Password is required"
}
```

### 5. Missing Email

**Request:**
```bash
curl -X POST http://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "password": "Password123@"
  }'
```

**Response (400):**
```json
{
  "status": "fail",
  "message": "Invalid email address"
}
```

### 6. Empty Request Body

**Request:**
```bash
curl -X POST http://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Response (400):**
```json
{
  "status": "fail",
  "message": "Invalid email address"
}
```

## Implementation Details

### Architecture Components

The login endpoint follows the same architectural pattern as registration:

1. **Route Handler** (`src/routes/auth.routes.js:13`):
   - Defines the POST `/login` route
   - Applies logging middleware
   - Routes to auth controller

2. **Controller** (`src/controllers/auth.controller.js:24-40`):
   - Validates request body using Zod loginSchema
   - Calls auth service for user authentication
   - Returns structured response with HTTP 200

3. **Validation** (`src/validators/auth.validator.js:19-22`):
   - Zod schema for login request validation
   - Email format validation with normalization
   - Password requirement validation

4. **Service Layer** (`src/services/auth.service.js:34-65`):
   - Business logic for user authentication
   - Finds user by email
   - Validates password using bcrypt comparison
   - Generates JWT tokens using existing method

5. **Database Model** (`src/models/user.model.js:44-47`):
   - Uses existing `comparePassword` method
   - Bcrypt password comparison
   - Secure password validation

6. **Error Handling** (`src/utils/error.js`, `src/utils/async.js`):
   - Same error handling infrastructure
   - Consistent error response formatting
   - Proper HTTP status codes

### Security Features

1. **Password Security**:
   - Uses bcrypt comparison via user model method
   - Constant-time comparison prevents timing attacks
   - No password storage or logging

2. **Credential Validation**:
   - Both non-existent users and wrong passwords return same error
   - Prevents email enumeration attacks
   - 401 status code for authentication failures

3. **Input Validation**:
   - Email format validation and normalization
   - Password requirement validation
   - Prevents injection attacks through validation

4. **JWT Token**:
   - Same 7-day expiration as registration
   - Signed with JWT_SECRET environment variable
   - Contains user ID for session management

5. **Rate Limiting Ready**:
   - Architecture supports adding rate limiting middleware
   - Login attempts can be monitored and limited

### Business Logic Flow

```javascript
// Login flow in AuthService.login()
1. Extract email and password from validated data
2. Find user by email in database
3. If user not found → throw "Invalid credentials" (401)
4. Compare provided password with stored hash
5. If password invalid → throw "Invalid credentials" (401)
6. Generate JWT token with user ID
7. Return user data and token (same format as registration)
```

### Environment Configuration

Uses the same environment variables as registration:

```env
PORT=5001
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/movie-recommendation-dev
JWT_SECRET=your_jwt_secret_key
```

### Database Operations

- **Read Operation**: `User.findOne({ email })`
- **Password Comparison**: `user.comparePassword(password)`
- **No Write Operations**: Login only reads and validates

## Security Considerations

### Authentication Security

1. **Credential Validation**:
   - Same error message for non-existent users and wrong passwords
   - Prevents user enumeration attacks
   - Uses HTTP 401 for all credential failures

2. **Password Handling**:
   - Passwords never stored or logged
   - Uses secure bcrypt comparison
   - Constant-time comparison prevents timing attacks

3. **Token Management**:
   - JWT tokens have reasonable expiration (7 days)
   - Tokens signed with secure secret
   - Client responsible for secure token storage

### Recommended Enhancements

1. **Rate Limiting**:
   ```javascript
   // Add to routes/auth.routes.js
   const rateLimit = require('express-rate-limit');

   const loginLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 5, // Limit each IP to 5 requests per windowMs
     message: "Too many login attempts, please try again later"
   });

   router.post("/login", loginLimiter, login);
   ```

2. **Account Lockout**:
   - Track failed login attempts in user model
   - Temporarily lock accounts after multiple failures
   - Send notification emails for suspicious activity

3. **Refresh Tokens**:
   - Implement refresh token mechanism
   - Shorter JWT expiration with refresh capability
   - Better security for long-term sessions

## Testing with Different Tools

### Using cURL

```bash
# Valid login
curl -X POST http://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123@"}' \
  -w "\n%{http_code}\n"
```

### Using Postman

1. **Method**: POST
2. **URL**: `http://localhost:5001/api/v1/auth/login`
3. **Headers**:
   - `Content-Type: application/json`
4. **Body** (raw JSON):
```json
{
  "email": "test@example.com",
  "password": "Password123@"
}
```

### Using HTTPie

```bash
http POST localhost:5001/api/v1/auth/login \
  email="test@example.com" \
  password="Password123@"
```

### Using JavaScript (Fetch API)

```javascript
fetch('http://localhost:5001/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'Password123@'
  })
})
.then(response => response.json())
.then(data => {
  if (data.status === 'success') {
    // Store token for authenticated requests
    localStorage.setItem('authToken', data.data.token);
    console.log('Login successful:', data.data.user);
  } else {
    console.error('Login failed:', data.message);
  }
});
```

## Integration with Frontend

### Token Storage

```javascript
// Store token after successful login
const loginResponse = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const data = await loginResponse.json();

if (data.status === 'success') {
  // Store token securely
  localStorage.setItem('authToken', data.data.token);
  // Or use httpOnly cookies for better security
  document.cookie = `authToken=${data.data.token}; HttpOnly; Secure; SameSite=Strict`;
}
```

### Using Token for Authenticated Requests

```javascript
// Add token to subsequent requests
const token = localStorage.getItem('authToken');

fetch('/api/v1/protected-endpoint', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(response => {
  if (response.status === 401) {
    // Token expired or invalid, redirect to login
    window.location.href = '/login';
  }
  return response.json();
});
```

## Available Authentication Endpoints

| Endpoint | Method | Description | Status |
|----------|--------|-------------|---------|
| `/api/v1/auth/register` | POST | User registration | ✅ Implemented |
| `/api/v1/auth/login` | POST | User login | ✅ Implemented |
| `/api/v1/auth/profile` | GET | Get user profile | ❌ Not implemented |
| `/api/v1/auth/profile` | PUT | Update user profile | ❌ Not implemented |
| `/api/v1/auth/change-password` | POST | Change password | ❌ Not implemented |
| `/api/v1/auth/logout` | POST | User logout | ❌ Not implemented |
| `/api/v1/auth/refresh` | POST | Refresh token | ❌ Not implemented |

## Performance Considerations

### Database Performance

- **Index on Email**: Ensure email field has database index for fast lookups
  ```javascript
  // In user model or database migration
  userSchema.index({ email: 1 });
  ```

- **Connection Pooling**: MongoDB driver handles connection pooling automatically

### Response Time Optimization

- **Bcrypt Performance**: Current salt rounds (12) provide good security/performance balance
- **JWT Generation**: Minimal overhead for token generation
- **Database Query**: Single indexed query for user lookup

## Error Monitoring

### Recommended Logging

```javascript
// Enhanced logging in auth.service.js
async login(loginData) {
  const { email } = loginData;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`Login attempt with non-existent email: ${email}`);
      throw new AppError("Invalid credentials", 401);
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      console.log(`Failed login attempt for user: ${email}`);
      throw new AppError("Invalid credentials", 401);
    }

    console.log(`Successful login for user: ${email}`);
    // ... rest of login logic
  } catch (error) {
    console.error(`Login error for ${email}:`, error.message);
    throw error;
  }
}
```

## Notes

- Login endpoint maintains same response structure as registration for consistency
- Security follows best practices with constant-time operations and generic error messages
- JWT tokens are stateless and don't require server-side session storage
- Email addresses are normalized (lowercase, trimmed) for consistent lookups
- Password validation in login only checks for presence, not complexity
- All database operations are properly awaited with error handling
- The endpoint integrates seamlessly with existing authentication middleware

## Next Steps

To complete a full authentication system:

1. **Profile Management**: Implement user profile CRUD operations
2. **Password Reset**: Add forgot/reset password functionality
3. **Token Refresh**: Implement refresh token mechanism
4. **Logout**: Add token invalidation (if using server-side token management)
5. **Social Login**: Add OAuth integration for Google/Facebook login
6. **Multi-Factor Authentication**: Add 2FA support
7. **Session Management**: Implement concurrent session limits
8. **Audit Logging**: Add comprehensive authentication event logging