import jwt from 'jsonwebtoken';
import User from '../models/user/User.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import db from '../config/db.js';
import permissionModel from '../models/permission/Permission.js';

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

// Middleware to get buildings assigned to owner
export const getOwnerBuildings = asyncHandler(async (req, res, next) => {
  if (req.user.roleName === 'admin' || req.user.roleName === 'super_admin') {
    // Admin can see all buildings
    req.ownerBuildings = null; // null means no filtering
    return next();
  }

  if (req.user.roleName === 'owner') {
    // Get buildings assigned to this owner
    const query = 'SELECT buildingId FROM buildingAssigned WHERE userId = ?';
    const [rows] = await db.execute(query, [req.user.userId]);
    req.ownerBuildings = rows.map(row => row.buildingId);

    if (req.ownerBuildings.length === 0) {
      return next(new ErrorResponse('No buildings assigned to this owner', 403));
    }
  }

  next();
});

export const adminOnly = authorize('admin');

export const adminAndManager = authorize('admin', 'manager');

export const adminAndOwner = authorize('admin', 'owner');

export const adminOwnerAndManager = authorize('admin', 'owner', 'manager');

// Dynamic permission-based authorization
export const requirePermission = (permissionName) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user || !req.user.userId) {
      return next(new ErrorResponse('User not authenticated', 401));
    }

    const hasPermission = await permissionModel.hasPermission(req.user.userId, permissionName);

    if (!hasPermission) {
      return next(
        new ErrorResponse(
          `Access denied. Required permission: ${permissionName}`,
          403
        )
      );
    }

    next();
  });
};

// Resource-action based authorization
export const requireResourcePermission = (resource, action) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user || !req.user.userId) {
      return next(new ErrorResponse('User not authenticated', 401));
    }

    const hasPermission = await permissionModel.hasResourcePermission(req.user.userId, resource, action);

    if (!hasPermission) {
      return next(
        new ErrorResponse(
          `Access denied. Required permission: ${resource}.${action}`,
          403
        )
      );
    }

    next();
  });
};

// Smart authorization that checks both general and ownership-based permissions
export const smartAuthorize = (resource, action) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user || !req.user.userId) {
      return next(new ErrorResponse('User not authenticated', 401));
    }

    try {
      // Check if user has general permission for this resource/action
      const hasGeneralPermission = await permissionModel.hasResourcePermission(req.user.userId, resource, action);

      if (hasGeneralPermission) {
        return next();
      }

      // Check if user has ownership-based permission (e.g., update_own)
      const hasOwnPermission = await permissionModel.hasResourcePermission(req.user.userId, resource, `${action}_own`);

      if (hasOwnPermission) {
        // Set a flag to indicate this is ownership-based access
        req.isOwnershipAccess = true;
        return next();
      }

      return next(
        new ErrorResponse(
          `Access denied. Required permission: ${resource}.${action} or ${resource}.${action}_own`,
          403
        )
      );
    } catch (error) {
      console.error('SmartAuthorize: Error checking permissions:', error);
      return next(new ErrorResponse('Error checking permissions', 500));
    }
  });
};

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
