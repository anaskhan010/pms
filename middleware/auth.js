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

// Legacy role-based authorization (deprecated - use requirePermission instead)
export const authorize = (...roles) => {
  return (req, res, next) => {
    console.warn('⚠️  DEPRECATED: Using legacy role-based authorization. Please migrate to permission-based authorization.');

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

// Enhanced middleware to get buildings assigned to user based on permissions
export const getOwnerBuildings = asyncHandler(async (req, res, next) => {
  // Admin role (roleId = 1) has access to everything
  if (req.user.roleId === 1) {
    req.ownerBuildings = null; // null means no filtering
    return next();
  }

  // Check if user has permission to view all buildings (admin-level access)
  const hasViewAllPermission = await permissionModel.hasResourcePermission(req.user.userId, 'buildings', 'view');

  if (hasViewAllPermission) {
    // User can see all buildings
    req.ownerBuildings = null; // null means no filtering
    return next();
  }

  // Check if user has permission to view their own buildings
  const hasViewOwnPermission = await permissionModel.hasResourcePermission(req.user.userId, 'buildings', 'view_own');

  if (hasViewOwnPermission) {
    // Get buildings assigned to this user
    const query = 'SELECT buildingId FROM buildingAssigned WHERE userId = ?';
    const [rows] = await db.execute(query, [req.user.userId]);
    req.ownerBuildings = rows.map(row => row.buildingId);

    if (req.ownerBuildings.length === 0) {
      return next(new ErrorResponse('No buildings assigned to this user', 403));
    }

    return next();
  }

  // User has no building access permissions
  return next(new ErrorResponse('Access denied. No building permissions found.', 403));
});

// Enhanced middleware to get villas assigned to user based on permissions
export const getOwnerVillas = asyncHandler(async (req, res, next) => {
  // Check if user has permission to view all villas (admin-level access)
  const hasViewAllPermission = await permissionModel.hasResourcePermission(req.user.userId, 'villas', 'view');

  if (hasViewAllPermission) {
    // User can see all villas
    req.ownerVillas = null; // null means no filtering
    return next();
  }

  // Check if user has permission to view their own villas
  const hasViewOwnPermission = await permissionModel.hasResourcePermission(req.user.userId, 'villas', 'view_own');

  if (hasViewOwnPermission) {
    // Get villas assigned to this user
    const query = 'SELECT villaId FROM villasAssigned WHERE userId = ?';
    const [rows] = await db.execute(query, [req.user.userId]);
    req.ownerVillas = rows.map(row => row.villaId);

    if (req.ownerVillas.length === 0) {
      return next(new ErrorResponse('No villas assigned to this user', 403));
    }

    return next();
  }

  // User has no villa access permissions
  return next(new ErrorResponse('Access denied. No villa permissions found.', 403));
});

// Legacy role-based middleware (deprecated - use permission-based alternatives)
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

    // Admin role (roleId = 1) has access to everything
    if (req.user.roleId === 1) {
      return next();
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
      // Admin role (roleId = 1) has access to everything
      if (req.user.roleId === 1) {
        return next();
      }

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

// Enhanced middleware for tenant access with ownership validation
export const getTenantAccess = asyncHandler(async (req, res, next) => {
  // Admin role (roleId = 1) has access to everything
  if (req.user.roleId === 1) {
    req.tenantFilter = null; // null means no filtering
    return next();
  }

  // Check if user has permission to view all tenants
  const hasViewAllPermission = await permissionModel.hasResourcePermission(req.user.userId, 'tenants', 'view');

  if (hasViewAllPermission) {
    req.tenantFilter = null; // null means no filtering
    return next();
  }

  // Check if user has permission to view their own tenants
  const hasViewOwnPermission = await permissionModel.hasResourcePermission(req.user.userId, 'tenants', 'view_own');

  if (hasViewOwnPermission) {
    // Get buildings assigned to this user to filter tenants
    const buildingQuery = 'SELECT buildingId FROM buildingAssigned WHERE userId = ?';
    const [buildingRows] = await db.execute(buildingQuery, [req.user.userId]);
    const buildingIds = buildingRows.map(row => row.buildingId);

    if (buildingIds.length === 0) {
      return next(new ErrorResponse('No buildings assigned to this user', 403));
    }

    req.tenantFilter = { buildingIds };
    return next();
  }

  return next(new ErrorResponse('Access denied. No tenant permissions found.', 403));
});

// Enhanced middleware for transaction access with ownership validation
export const getTransactionAccess = asyncHandler(async (req, res, next) => {
  // Check if user has permission to view all transactions
  const hasViewAllPermission = await permissionModel.hasResourcePermission(req.user.userId, 'transactions', 'view');

  if (hasViewAllPermission) {
    req.transactionFilter = null; // null means no filtering
    return next();
  }

  // Check if user has permission to view their own transactions
  const hasViewOwnPermission = await permissionModel.hasResourcePermission(req.user.userId, 'transactions', 'view_own');

  if (hasViewOwnPermission) {
    // Get buildings assigned to this user to filter transactions
    const buildingQuery = 'SELECT buildingId FROM buildingAssigned WHERE userId = ?';
    const [buildingRows] = await db.execute(buildingQuery, [req.user.userId]);
    const buildingIds = buildingRows.map(row => row.buildingId);

    if (buildingIds.length === 0) {
      return next(new ErrorResponse('No buildings assigned to this user', 403));
    }

    req.transactionFilter = { buildingIds };
    return next();
  }

  return next(new ErrorResponse('Access denied. No transaction permissions found.', 403));
});

// Middleware to validate resource ownership for update/delete operations
export const validateResourceOwnership = (resourceType) => {
  return asyncHandler(async (req, res, next) => {
    const resourceId = req.params.id || req.params.resourceId;

    if (!resourceId) {
      return next(new ErrorResponse('Resource ID is required', 400));
    }

    // Check if user has general permission (admin-level)
    const hasGeneralPermission = await permissionModel.hasResourcePermission(
      req.user.userId,
      resourceType,
      'update'
    );

    if (hasGeneralPermission) {
      return next();
    }

    // Check if user has ownership-based permission
    const hasOwnPermission = await permissionModel.hasResourcePermission(
      req.user.userId,
      resourceType,
      'update_own'
    );

    if (!hasOwnPermission) {
      return next(new ErrorResponse('Access denied. Insufficient permissions.', 403));
    }

    // Validate ownership based on resource type
    let isOwner = false;

    switch (resourceType) {
      case 'buildings':
        const buildingQuery = 'SELECT COUNT(*) as count FROM buildingAssigned WHERE buildingId = ? AND userId = ?';
        const [buildingRows] = await db.execute(buildingQuery, [resourceId, req.user.userId]);
        isOwner = buildingRows[0].count > 0;
        break;

      case 'villas':
        const villaQuery = 'SELECT COUNT(*) as count FROM villasAssigned WHERE villaId = ? AND userId = ?';
        const [villaRows] = await db.execute(villaQuery, [resourceId, req.user.userId]);
        isOwner = villaRows[0].count > 0;
        break;

      case 'tenants':
        // Check if tenant is in user's assigned buildings
        const tenantQuery = `
          SELECT COUNT(*) as count
          FROM tenant t
          INNER JOIN apartment a ON t.apartmentId = a.apartmentId
          INNER JOIN buildingAssigned ba ON a.buildingId = ba.buildingId
          WHERE t.tenantId = ? AND ba.userId = ?
        `;
        const [tenantRows] = await db.execute(tenantQuery, [resourceId, req.user.userId]);
        isOwner = tenantRows[0].count > 0;
        break;

      default:
        return next(new ErrorResponse('Invalid resource type', 400));
    }

    if (!isOwner) {
      return next(new ErrorResponse('Access denied. You do not own this resource.', 403));
    }

    next();
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
        role: user.roleName,
        roleId: user.roleId
      }
    });
};


