const User = require('../../models/user/User');
const ErrorResponse = require('../../utils/errorResponse');
const asyncHandler = require('../../utils/asyncHandler');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { username, email, password, role, first_name, last_name, phone_number } = req.body;

  // Check if user already exists
  const existingUserByEmail = await User.findByEmail(email);
  if (existingUserByEmail) {
    return next(new ErrorResponse('User with this email already exists', 400));
  }

  const existingUserByUsername = await User.findByUsername(username);
  if (existingUserByUsername) {
    return next(new ErrorResponse('Username already taken', 400));
  }

  // Create user
  const user = await User.createUser({
    username,
    email,
    password,
    role,
    first_name,
    last_name,
    phone_number
  });

  sendTokenResponse(user, 201, res);
});


exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findByEmail(email);

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if user is active
  if (!user.is_active) {
    return next(new ErrorResponse('Account is deactivated', 401));
  }

  // Check password
  const isMatch = await User.matchPassword(password, user.password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Update last login
  // await User.updateLastLogin(user.user_id);

  // Add methods to user object for token generation
  user.getSignedJwtToken = () => User.getSignedJwtToken(user.user_id);

  sendTokenResponse(user, 200, res);
});


exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: 'User logged out successfully'
  });
});


exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.user_id);

  // Remove password from user object
  const { password, ...userWithoutPassword } = user;

  res.status(200).json({
    success: true,
    data: userWithoutPassword
  });
});

// @desc    Update user details
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    username: req.body.username,
    email: req.body.email,
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    phone_number: req.body.phone_number
  };

  // Check if email is being changed and if it's already taken
  if (req.body.email && req.body.email !== req.user.email) {
    const existingUser = await User.findByEmail(req.body.email);
    if (existingUser) {
      return next(new ErrorResponse('Email already in use', 400));
    }
  }

  // Check if username is being changed and if it's already taken
  if (req.body.username && req.body.username !== req.user.username) {
    const existingUser = await User.findByUsername(req.body.username);
    if (existingUser) {
      return next(new ErrorResponse('Username already taken', 400));
    }
  }

  const user = await req.user.update(fieldsToUpdate);

  res.status(200).json({
    success: true,
    data: user.toJSON()
  });
});

// @desc    Update password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new ErrorResponse('Please provide current and new password', 400));
  }

  // Check current password
  const isMatch = await req.user.matchPassword(currentPassword);

  if (!isMatch) {
    return next(new ErrorResponse('Current password is incorrect', 401));
  }

  // Update password
  await req.user.updatePassword(newPassword);

  sendTokenResponse(req.user, 200, res);
});

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findByEmail(email);

  if (!user) {
    return next(new ErrorResponse('There is no user with that email', 404));
  }

  // For now, just return success (implement email sending later)
  res.status(200).json({
    success: true,
    data: 'Password reset email sent (feature to be implemented)'
  });
});

// @desc    Reset password
// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // This would be implemented with a reset token system
  res.status(200).json({
    success: true,
    data: 'Password reset feature to be implemented'
  });
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  // Remove password from user object
  const { password, ...userWithoutPassword } = user;

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
    data: userWithoutPassword
  });
};
