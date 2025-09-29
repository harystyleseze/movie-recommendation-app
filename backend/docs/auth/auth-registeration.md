I'll help you implement a robust user authentication system. Let's break this down into multiple components following best practices.

1. First, let's create the User model:

```javascript
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
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
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
```

2. Create validation schemas using Zod:

```javascript
app / backend / src / validators / auth.validator.js;
const { z } = require("zod");

const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters")
    .trim(),
  email: z.string().email("Invalid email address").trim().toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
});

module.exports = {
  registerSchema,
};
```

3. Create authentication service:

```javascript
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { AppError } = require("../utils/error");

class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} - Registered user data and token
   */
  async register(userData) {
    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new AppError("Email already registered", 409);
    }

    // Create new user
    const user = await User.create(userData);

    // Generate token
    const token = this.generateToken(user._id);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    };
  }

  /**
   * Generate JWT token
   * @param {string} userId - User ID
   * @returns {string} - JWT token
   */
  generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
  }
}

module.exports = new AuthService();
```

4. Create error utility:

```javascript
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const handleError = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  // Production error response
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // Programming or unknown errors
  console.error("ERROR 💥", err);
  return res.status(500).json({
    status: "error",
    message: "Something went wrong",
  });
};

module.exports = {
  AppError,
  handleError,
};
```

5. Create authentication controller:

```javascript
const { registerSchema } = require("../validators/auth.validator");
const authService = require("../services/auth.service");
const { AppError } = require("../utils/error");
const { asyncHandler } = require("../utils/async");

exports.register = asyncHandler(async (req, res) => {
  // Validate request body
  const validatedData = registerSchema.parse(req.body);

  // Register user
  const result = await authService.register(validatedData);

  // Send response
  res.status(201).json({
    status: "success",
    data: result,
  });
});
```

6. Create async handler utility:

```javascript
const { ZodError } = require("zod");
const { AppError } = require("./error");

exports.asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    if (err instanceof ZodError) {
      return next(new AppError(err.errors[0].message, 400));
    }
    next(err);
  });
};
```

7. Create authentication routes:

```javascript
const express = require("express");
const { register } = require("../controllers/auth.controller");

const router = express.Router();

router.post("/register", register);

module.exports = router;
```

8. Update the main app.js to include auth routes and error handling:

```javascript
// ...existing code...

const authRoutes = require("./routes/auth.routes");
const { handleError } = require("./utils/error");

// =======================
// Routes
// =======================

/**
 * Authentication routes
 * Mounted at /api/v1/auth
 */
app.use("/api/v1/auth", authRoutes);

// ...existing route comments...

// =======================
// Global Error Handling
// =======================

app.use(handleError);

module.exports = app;
```

9. Add authentication middleware for protected routes:

```javascript
const jwt = require("jsonwebtoken");
const { AppError } = require("../utils/error");
const User = require("../models/user.model");
const { asyncHandler } = require("../utils/async");

exports.protect = asyncHandler(async (req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    throw new AppError("Not authenticated", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      throw new AppError("User no longer exists", 401);
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    throw new AppError("Invalid token", 401);
  }
});
```

This implementation includes:

- Secure password hashing with bcryptjs
- JWT token generation and verification
- Input validation with Zod
- Error handling middleware
- Async handler utility
- Service layer for business logic
- Protected route middleware
- MongoDB User model with pre-save hooks
- Proper separation of concerns

To use this, you'll need to install additional dependencies:

```bash
npm install bcryptjs jsonwebtoken zod
```

You can then register a user by making a POST request to:

```
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123@"
}
```

The system will:

1. Validate the input
2. Check for existing users
3. Hash the password
4. Create the user
5. Generate a JWT token
6. Return the user data and token

For protected routes, add the auth middleware:

```javascript
router.get("/protected-route", protect, (req, res) => {
  // Access authenticated user with req.user
});
```

Similar code found with 2 license types
