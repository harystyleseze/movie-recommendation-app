# Authentication API - User Profile Management

## Overview

The user profile management endpoints allow authenticated users to view, update their profile information, and change their password in the Movie Recommendation App. All endpoints require valid JWT authentication and follow secure practices for profile management.

## Endpoints Overview

| Endpoint | Method | Description | Authentication |
|----------|--------|-------------|----------------|
| `/api/v1/auth/profile` | GET | Get current user profile | Required |
| `/api/v1/auth/profile` | PUT | Update user profile | Required |
| `/api/v1/auth/change-password` | POST | Change user password | Required |

---

## 1. Get User Profile

### Endpoint Information

- **URL**: `/api/v1/auth/profile`
- **Method**: `GET`
- **Authentication**: Required (Bearer token)
- **Content-Type**: `application/json`

### Request Format

No request body required. Authentication via Authorization header:

```
Authorization: Bearer <jwt_token>
```

### Response Format

#### Success Response (200 OK)

```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "68da30785c4c06b8cf9a3db9",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "createdAt": "2025-09-29T07:08:40.609Z",
      "updatedAt": "2025-09-29T08:08:50.088Z"
    }
  }
}
```

### Request Examples

#### Using cURL

```bash
curl -X GET http://localhost:5001/api/v1/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Using JavaScript (Fetch API)

```javascript
const token = localStorage.getItem('authToken');

fetch('http://localhost:5001/api/v1/auth/profile', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
})
.then(response => response.json())
.then(data => console.log('Profile:', data.data.user));
```

---

## 2. Update User Profile

### Endpoint Information

- **URL**: `/api/v1/auth/profile`
- **Method**: `PUT`
- **Authentication**: Required (Bearer token)
- **Content-Type**: `application/json`

### Request Format

#### Request Body

```json
{
  "name": "string",
  "email": "string"
}
```

#### Field Validation Rules

| Field | Type | Required | Validation Rules |
|-------|------|----------|------------------|
| `name` | string | Yes | - Minimum 2 characters<br>- Maximum 50 characters<br>- Whitespace trimmed |
| `email` | string | Yes | - Valid email format<br>- Converted to lowercase<br>- Whitespace trimmed<br>- Must be unique |

### Response Format

#### Success Response (200 OK)

```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "68da30785c4c06b8cf9a3db9",
      "name": "Updated Name",
      "email": "updated.email@example.com",
      "createdAt": "2025-09-29T07:08:40.609Z",
      "updatedAt": "2025-09-29T08:08:50.088Z"
    }
  }
}
```

### Request Examples

#### Valid Profile Update

```bash
curl -X PUT http://localhost:5001/api/v1/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "name": "Updated Name",
    "email": "updated.email@example.com"
  }'
```

---

## 3. Change Password

### Endpoint Information

- **URL**: `/api/v1/auth/change-password`
- **Method**: `POST`
- **Authentication**: Required (Bearer token)
- **Content-Type**: `application/json`

### Request Format

#### Request Body

```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

#### Field Validation Rules

| Field | Type | Required | Validation Rules |
|-------|------|----------|------------------|
| `currentPassword` | string | Yes | - Minimum 1 character (any existing password) |
| `newPassword` | string | Yes | - Minimum 8 characters<br>- Must contain at least one uppercase letter<br>- Must contain at least one lowercase letter<br>- Must contain at least one number<br>- Must contain at least one special character (@$!%*?&) |

### Response Format

#### Success Response (200 OK)

```json
{
  "status": "success",
  "data": {
    "message": "Password updated successfully"
  }
}
```

### Request Examples

#### Valid Password Change

```bash
curl -X POST http://localhost:5001/api/v1/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "currentPassword": "CurrentPassword123@",
    "newPassword": "NewPassword456@"
  }'
```

---

## Error Responses

### Authentication Errors

#### Missing Token (401 Unauthorized)

```json
{
  "status": "fail",
  "error": {
    "statusCode": 401,
    "status": "fail",
    "isOperational": true
  },
  "message": "Not authenticated",
  "stack": "Error: Not authenticated..."
}
```

#### Invalid Token (401 Unauthorized)

```json
{
  "status": "fail",
  "error": {
    "statusCode": 401,
    "status": "fail",
    "isOperational": true
  },
  "message": "Invalid token",
  "stack": "Error: Invalid token..."
}
```

### Validation Errors

#### Invalid Profile Data (400 Bad Request)

```json
{
  "status": "fail",
  "error": {
    "statusCode": 400,
    "status": "fail",
    "isOperational": true
  },
  "message": "Name must be at least 2 characters",
  "stack": "Error: Validation error..."
}
```

#### Email Already Taken (409 Conflict)

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

### Password Change Errors

#### Wrong Current Password (401 Unauthorized)

```json
{
  "status": "fail",
  "error": {
    "statusCode": 401,
    "status": "fail",
    "isOperational": true
  },
  "message": "Current password is incorrect",
  "stack": "Error: Current password is incorrect..."
}
```

#### User Not Found (404 Not Found)

```json
{
  "status": "fail",
  "error": {
    "statusCode": 404,
    "status": "fail",
    "isOperational": true
  },
  "message": "User not found",
  "stack": "Error: User not found..."
}
```

---

## Error Scenarios & Testing

### 1. Get Profile Without Authentication

**Request:**
```bash
curl -X GET http://localhost:5001/api/v1/auth/profile \
  -H "Content-Type: application/json"
```

**Response (401):**
```json
{
  "status": "fail",
  "message": "Not authenticated"
}
```

### 2. Update Profile with Invalid Name

**Request:**
```bash
curl -X PUT http://localhost:5001/api/v1/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer valid_token" \
  -d '{"name": "A", "email": "valid@example.com"}'
```

**Response (400):**
```json
{
  "status": "fail",
  "message": "Name must be at least 2 characters"
}
```

### 3. Update Profile with Duplicate Email

**Request:**
```bash
curl -X PUT http://localhost:5001/api/v1/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer valid_token" \
  -d '{"name": "Valid Name", "email": "existing@example.com"}'
```

**Response (409):**
```json
{
  "status": "fail",
  "message": "Email already registered"
}
```

### 4. Change Password with Wrong Current Password

**Request:**
```bash
curl -X POST http://localhost:5001/api/v1/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer valid_token" \
  -d '{"currentPassword": "WrongPassword", "newPassword": "NewPassword123@"}'
```

**Response (401):**
```json
{
  "status": "fail",
  "message": "Current password is incorrect"
}
```

### 5. Change Password with Weak New Password

**Request:**
```bash
curl -X POST http://localhost:5001/api/v1/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer valid_token" \
  -d '{"currentPassword": "CurrentPassword123@", "newPassword": "weak"}'
```

**Response (400):**
```json
{
  "status": "fail",
  "message": "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
}
```

---

## Implementation Details

### Architecture Components

1. **Authentication Middleware** (`src/middleware/auth.middleware.js:6-31`):
   - Validates JWT token from Authorization header
   - Checks if user still exists in database
   - Sets `req.user` object for controllers

2. **Validation Schemas** (`src/validators/auth.validator.js:24-42`):
   - `profileUpdateSchema` for name and email validation
   - `changePasswordSchema` for password change validation

3. **Service Layer** (`src/services/auth.service.js:67-159`):
   - `getProfile()` - Retrieves user profile without password
   - `updateProfile()` - Updates name/email with uniqueness check
   - `changePassword()` - Validates current password and updates

4. **Controller Layer** (`src/controllers/auth.controller.js:47-97`):
   - `getProfile` - GET controller using `req.user.id`
   - `updateProfile` - PUT controller with validation
   - `changePassword` - POST controller with validation

5. **Protected Routes** (`src/routes/auth.routes.js:24-26`):
   - All routes use `protect` middleware
   - GET `/profile` - Get user profile
   - PUT `/profile` - Update user profile
   - POST `/change-password` - Change password

### Security Features

1. **Authentication Required**:
   - All endpoints require valid JWT token
   - Token validation includes user existence check
   - Uses Bearer token authentication

2. **Authorization**:
   - Users can only access/modify their own profile
   - User ID extracted from JWT token, not request params
   - No privilege escalation possible

3. **Input Validation**:
   - Comprehensive validation for all input fields
   - Email uniqueness enforcement
   - Strong password requirements for password changes

4. **Password Security**:
   - Current password verification required for changes
   - New password must meet complexity requirements
   - Password hashing handled by Mongoose middleware

5. **Data Privacy**:
   - Password field excluded from all responses
   - Only necessary user data returned
   - Timestamps included for audit purposes

### Business Logic

#### Profile Update Flow
```javascript
1. Authenticate user via JWT token
2. Validate request body (name, email)
3. Check if email is being changed
4. If email changed, verify uniqueness
5. Update user document with new data
6. Return updated profile without password
```

#### Password Change Flow
```javascript
1. Authenticate user via JWT token
2. Validate request body (currentPassword, newPassword)
3. Find user by ID from token
4. Verify current password matches
5. Update password (triggers hashing middleware)
6. Return success message
```

### Database Operations

- **Read Operations**: User profile retrieval, email uniqueness check
- **Update Operations**: Profile updates, password changes
- **Transactions**: Not required (single document updates)
- **Indexing**: Email field should have unique index

---

## Integration Examples

### React Profile Management Component

```jsx
import React, { useState, useEffect } from 'react';

const ProfileManagement = () => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: ''
  });

  // Get profile on component mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch('/api/v1/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setProfile(data.data.user);
        setFormData({
          name: data.data.user.name,
          email: data.data.user.email
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch('/api/v1/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.status === 'success') {
        setProfile(data.data.user);
        alert('Profile updated successfully!');
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch('/api/v1/auth/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(passwordData)
      });
      const data = await response.json();
      if (data.status === 'success') {
        alert('Password changed successfully!');
        setPasswordData({ currentPassword: '', newPassword: '' });
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error changing password:', error);
    }
  };

  return (
    <div className="profile-management">
      <h2>Profile Management</h2>

      {/* Profile Update Form */}
      <form onSubmit={updateProfile}>
        <h3>Update Profile</h3>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="Name"
          required
        />
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          placeholder="Email"
          required
        />
        <button type="submit">Update Profile</button>
      </form>

      {/* Password Change Form */}
      <form onSubmit={changePassword}>
        <h3>Change Password</h3>
        <input
          type="password"
          value={passwordData.currentPassword}
          onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
          placeholder="Current Password"
          required
        />
        <input
          type="password"
          value={passwordData.newPassword}
          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
          placeholder="New Password"
          required
        />
        <button type="submit">Change Password</button>
      </form>
    </div>
  );
};

export default ProfileManagement;
```

### Axios Service Example

```javascript
// profileService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api/v1';

// Create axios instance with interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const profileService = {
  // Get user profile
  getProfile: () => api.get('/auth/profile'),

  // Update user profile
  updateProfile: (profileData) => api.put('/auth/profile', profileData),

  // Change password
  changePassword: (passwordData) => api.post('/auth/change-password', passwordData)
};
```

---

## Testing & Quality Assurance

### Comprehensive Test Scenarios

1. **Authentication Tests**:
   - ✅ Valid token access
   - ✅ No token rejection
   - ✅ Invalid token rejection
   - ✅ Expired token handling

2. **Profile Retrieval Tests**:
   - ✅ Successful profile fetch
   - ✅ Profile data completeness
   - ✅ Password field exclusion
   - ✅ Timestamp inclusion

3. **Profile Update Tests**:
   - ✅ Valid name and email update
   - ✅ Name-only update
   - ✅ Email-only update
   - ✅ Duplicate email rejection
   - ✅ Invalid name validation
   - ✅ Invalid email validation

4. **Password Change Tests**:
   - ✅ Successful password change
   - ✅ Wrong current password rejection
   - ✅ Weak new password rejection
   - ✅ Password verification after change

### Performance Considerations

- **Database Queries**: Single queries per operation
- **Email Uniqueness**: Indexed field for fast lookup
- **Authentication**: Cached user lookup in middleware
- **Response Size**: Minimal data transfer (exclude password)

---

## Available Authentication Endpoints

| Endpoint | Method | Description | Status |
|----------|--------|-------------|---------|
| `/api/v1/auth/register` | POST | User registration | ✅ Implemented |
| `/api/v1/auth/login` | POST | User login | ✅ Implemented |
| `/api/v1/auth/profile` | GET | Get user profile | ✅ Implemented |
| `/api/v1/auth/profile` | PUT | Update user profile | ✅ Implemented |
| `/api/v1/auth/change-password` | POST | Change password | ✅ Implemented |
| `/api/v1/auth/logout` | POST | User logout | ❌ Not implemented |
| `/api/v1/auth/refresh` | POST | Refresh token | ❌ Not implemented |
| `/api/v1/auth/forgot-password` | POST | Forgot password | ❌ Not implemented |
| `/api/v1/auth/reset-password` | POST | Reset password | ❌ Not implemented |

---

## Notes

- All profile endpoints require valid authentication
- Users can only access their own profile data
- Email uniqueness is enforced across all users
- Password changes require current password verification
- Profile updates automatically update the `updatedAt` timestamp
- Strong password requirements are enforced for password changes
- All endpoints follow consistent error response formats
- JWT tokens are validated on every request
- User existence is verified with each authenticated request

## Next Steps

1. **Enhanced Security**: Implement rate limiting for password changes
2. **Audit Logging**: Add comprehensive audit logs for profile changes
3. **Email Verification**: Add email verification for email changes
4. **Profile Pictures**: Add profile picture upload functionality
5. **Account Deactivation**: Add user account deactivation endpoint
6. **Password History**: Prevent reuse of recent passwords
7. **Session Management**: Add concurrent session limits
8. **Two-Factor Authentication**: Add 2FA support for profile changes