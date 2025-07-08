import jwt from 'jsonwebtoken';
import User from '../models/user/User.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.getUserById(decoded.userId);

    if (!user) {
      return next(new ErrorResponse('No user found with this token', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
});

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roleName) {
      return next(new ErrorResponse('User role not found', 403));
    }

    if (!roles.includes(req.user.roleName)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.roleName} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

export const checkOwnership = (resourceModel, resourceIdParam = 'id') => {
  return asyncHandler(async (req, res, next) => {
    const resourceId = req.params[resourceIdParam];

    if (req.user.roleName === 'admin' || req.user.roleName === 'super_admin') {
      return next();
    }

    const resource = await resourceModel.findById(resourceId);

    if (!resource) {
      return next(new ErrorResponse('Resource not found', 404));
    }

    let isOwner = false;

    switch (req.user.roleName) {
      case 'owner':
        isOwner = resource.ownerId === req.user.userId;
        break;
      case 'tenant':
        isOwner = resource.tenantId === req.user.userId;
        break;
      case 'manager':
        isOwner = await checkManagerAccess(req.user.userId, resource);
        break;
      default:
        isOwner = false;
    }

    if (!isOwner) {
      return next(new ErrorResponse('Not authorized to access this resource', 403));
    }

    next();
  });
};

const checkManagerAccess = async (managerId, resource) => {
  return true;
};

export const adminOnly = authorize('admin');

export const adminAndManager = authorize('admin', 'manager');

export const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

export const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user.userId);

  const options = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      data: {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.roleName
      }
    });
};
