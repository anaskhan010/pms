import userModel from '../../models/user/User.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ErrorResponse from '../../utils/errorResponse.js';
import { sendTokenResponse } from '../../middleware/auth.js';
import bcrypt from 'bcryptjs';


const register = async (req, res, next) => {
  const { firstName, lastName, email, password, phoneNumber, address, gender, nationality, dateOfBirth, roleId } = req.body;

  console.log('Registering user:', {
    firstName, lastName, email, password, phoneNumber, address, gender, nationality, dateOfBirth, roleId
  });

  const existingUser = await userModel.getUserByEmail(email);
  if (existingUser) {
    return next(new ErrorResponse('User with this email already exists', 400));
  }

  let imagePath = null;
  if (req.file) {
    imagePath = `/public/uploads/users/${req.file.filename}`;
  }

  console.log('Image path:', imagePath);



    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

  try {
    const user = await userModel.createUser(
      firstName, lastName, email, hashedPassword, phoneNumber,
      address, gender, nationality, dateOfBirth, imagePath, roleId
    );

    const createdUser = await userModel.getUserById(user.userId);

    res.status(201).json({
      success: true,
      data: {
        userId: createdUser.userId,
        firstName: createdUser.firstName,
        lastName: createdUser.lastName,
        email: createdUser.email,
        role: createdUser.roleName
      }
    });
  } catch (error) {
    return next(new ErrorResponse(error.message, 400));
  }
};

const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  const user = await userModel.getUserByEmail(email);

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  const isMatch = await userModel.comparePassword(password, user.password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  sendTokenResponse(user, 200, res);
});

const logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

const getMe = asyncHandler(async (req, res, next) => {
  const user = await userModel.getUserById(req.user.userId);

  res.status(200).json({
    success: true,
    data: user
  });
});

const createUser = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, password, phoneNumber, address, gender, nationality, dateOfBirth, roleId } = req.body;

  const existingUser = await userModel.getUserByEmail(email);
  if (existingUser) {
    return next(new ErrorResponse('User with this email already exists', 400));
  }

  let imagePath = null;
  if (req.file) {
    imagePath = `/public/uploads/users/${req.file.filename}`;
  }

  try {
    const user = await userModel.createUser(
      firstName, lastName, email, password, phoneNumber,
      address, gender, nationality, dateOfBirth, imagePath, roleId
    );

    const createdUser = await userModel.getUserById(user.userId);

    res.status(201).json({
      success: true,
      data: createdUser
    });
  } catch (error) {
    return next(new ErrorResponse(error.message, 400));
  }
});

const getAllUsers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const offset = (page - 1) * limit;

  const users = await userModel.getAllUsers(limit, offset);
  const total = await userModel.getUsersCount();

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    pagination: {
      page,
      limit,
      pages: Math.ceil(total / limit)
    },
    data: users
  });
});

const getUserById = asyncHandler(async (req, res, next) => {
  const user = await userModel.getUserById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

const updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
    address: req.body.address,
    gender: req.body.gender,
    nationality: req.body.nationality,
    dateOfBirth: req.body.dateOfBirth
  };

  if (req.file) {
    fieldsToUpdate.image = `/public/uploads/users/${req.file.filename}`;
  }

  const success = await userModel.updateUser(req.user.userId, fieldsToUpdate);

  if (!success) {
    return next(new ErrorResponse('Failed to update user', 400));
  }

  const user = await userModel.getUserById(req.user.userId);

  res.status(200).json({
    success: true,
    data: user
  });
});

const updateUser = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
    address: req.body.address,
    gender: req.body.gender,
    nationality: req.body.nationality,
    dateOfBirth: req.body.dateOfBirth
  };

  if (req.file) {
    fieldsToUpdate.image = `/public/uploads/users/${req.file.filename}`;
  }

  const success = await userModel.updateUser(req.params.id, fieldsToUpdate);

  if (!success) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  if (req.body.roleId) {
    await userModel.updateUserRole(req.params.id, req.body.roleId);
  }

  const user = await userModel.getUserById(req.params.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

const updatePassword = asyncHandler(async (req, res, next) => {
  const user = await userModel.getUserById(req.user.userId);

  if (!(await userModel.comparePassword(req.body.currentPassword, user.password))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }

  const success = await userModel.updateUser(req.user.userId, {
    password: req.body.newPassword
  });

  if (!success) {
    return next(new ErrorResponse('Failed to update password', 400));
  }

  sendTokenResponse(user, 200, res);
});

const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await userModel.getUserById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  const success = await userModel.deleteUser(req.params.id);

  if (!success) {
    return next(new ErrorResponse('Failed to delete user', 400));
  }

  res.status(200).json({
    success: true,
    data: {}
  });
});

const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await userModel.getUserByEmail(req.body.email);

  if (!user) {
    return next(new ErrorResponse('There is no user with that email', 404));
  }

  res.status(200).json({
    success: true,
    data: 'Password reset email sent'
  });
});

const resetPassword = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    data: 'Password reset successful'
  });
});

export default {
  register,
  login,
  logout,
  getMe,
  createUser,
  getAllUsers,
  getUserById,
  updateDetails,
  updateUser,
  updatePassword,
  deleteUser,
  forgotPassword,
  resetPassword
};



