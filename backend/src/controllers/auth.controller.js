const {
  registerSchema,
  loginSchema,
  profileUpdateSchema,
  changePasswordSchema
} = require('../validators/auth.validator');
const authService = require('../services/auth.service');
const { AppError } = require('../utils/error');
const { asyncHandler } = require('../utils/async');

exports.register = asyncHandler(async (req, res) => {
  console.log('Register endpoint hit');
  console.log('Request body:', req.body);

  // Validate request body
  const validatedData = registerSchema.parse(req.body);
  console.log('Validation passed:', validatedData);

  // Register user
  const result = await authService.register(validatedData);

  // Send response
  res.status(201).json({
    status: 'success',
    data: result,
  });
});

exports.login = asyncHandler(async (req, res) => {
  console.log('Login endpoint hit');
  console.log('Request body:', req.body);

  // Validate request body
  const validatedData = loginSchema.parse(req.body);
  console.log('Validation passed:', validatedData);

  // Login user
  const result = await authService.login(validatedData);

  // Send response
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

exports.getProfile = asyncHandler(async (req, res) => {
  console.log('Get profile endpoint hit');
  console.log('User ID:', req.user.id);

  // Get user profile
  const result = await authService.getProfile(req.user.id);

  // Send response
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  console.log('Update profile endpoint hit');
  console.log('User ID:', req.user.id);
  console.log('Request body:', req.body);

  // Validate request body
  const validatedData = profileUpdateSchema.parse(req.body);
  console.log('Validation passed:', validatedData);

  // Update user profile
  const result = await authService.updateProfile(req.user.id, validatedData);

  // Send response
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

exports.changePassword = asyncHandler(async (req, res) => {
  console.log('Change password endpoint hit');
  console.log('User ID:', req.user.id);
  console.log('Request body:', req.body);

  // Validate request body
  const validatedData = changePasswordSchema.parse(req.body);
  console.log('Validation passed:', validatedData);

  // Change user password
  const result = await authService.changePassword(req.user.id, validatedData);

  // Send response
  res.status(200).json({
    status: 'success',
    data: result,
  });
});
