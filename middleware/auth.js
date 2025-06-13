const jwt = require('jsonwebtoken');
const User = require('../models/user/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

// Protect routes - Check if user is authenticated
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Check for token in cookies
  else if (req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return next(new ErrorResponse('No user found with this token', 401));
    }

   

    req.user = user;
    next();
  } catch (error) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
});

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

// Check if user owns the resource or is admin
exports.checkOwnership = (resourceModel, resourceIdParam = 'id') => {
  return asyncHandler(async (req, res, next) => {
    const resourceId = req.params[resourceIdParam];
    
    // Admin can access everything
    if (req.user.role === 'admin' || req.user.role === 'super_admin') {
      return next();
    }

    // Get the resource
    const resource = await resourceModel.findById(resourceId);
    
    if (!resource) {
      return next(new ErrorResponse('Resource not found', 404));
    }

    // Check ownership based on user role
    let isOwner = false;
    
    switch (req.user.role) {
      case 'owner':
        isOwner = resource.owner_id === req.user.user_id;
        break;
      case 'tenant':
        isOwner = resource.tenant_id === req.user.user_id;
        break;
      case 'manager':
        // Managers can access resources in their assigned properties
        isOwner = await checkManagerAccess(req.user.user_id, resource);
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

// Helper function to check manager access
const checkManagerAccess = async (managerId, resource) => {
  // This would need to be implemented based on your business logic
  // For example, checking if manager is assigned to the property
  return true; // Placeholder
};
