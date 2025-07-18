import roleModel from '../../models/role/Role.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ErrorResponse from '../../utils/errorResponse.js';

const getAllRoles = asyncHandler(async (req, res, next) => {
  // Use getManageableRoles to filter based on user's role
  const roles = await roleModel.getManageableRoles(req.user.userId, req.user.roleId);

  res.status(200).json({
    success: true,
    count: roles.length,
    data: roles
  });
});

const getRoleById = asyncHandler(async (req, res, next) => {
  const role = await roleModel.getRoleById(req.params.id);

  if (!role) {
    return next(new ErrorResponse(`Role not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: role
  });
});

const createRole = asyncHandler(async (req, res, next) => {
  const { roleName } = req.body;

  if (!roleName) {
    return next(new ErrorResponse('Role name is required', 400));
  }

  try {
    // Pass the user ID to track ownership for owner users
    const role = await roleModel.createRole(roleName, req.user.userId);

    res.status(201).json({
      success: true,
      data: role
    });
  } catch (error) {
    return next(new ErrorResponse(error.message, 400));
  }
});

const updateRole = asyncHandler(async (req, res, next) => {
  const { roleName } = req.body;

  if (!roleName) {
    return next(new ErrorResponse('Role name is required', 400));
  }

  // Check ownership for non-admin users
  if (req.user.roleId !== 1) {
    const isOwned = await roleModel.isRoleOwnedByUser(req.params.id, req.user.userId);
    if (!isOwned) {
      return next(new ErrorResponse('You can only update roles you created', 403));
    }
  }

  try {
    // For owner users, maintain the ownership prefix
    let finalRoleName = roleName;
    if (req.user.roleId === 2) {
      const existingRole = await roleModel.getRoleById(req.params.id);
      if (existingRole && existingRole.roleName.startsWith(`owner_${req.user.userId}_`)) {
        finalRoleName = `owner_${req.user.userId}_${roleName}`;
      }
    }

    const role = await roleModel.updateRole(req.params.id, finalRoleName);

    res.status(200).json({
      success: true,
      data: role
    });
  } catch (error) {
    return next(new ErrorResponse(error.message, 400));
  }
});

const deleteRole = asyncHandler(async (req, res, next) => {
  // Check ownership for non-admin users
  if (req.user.roleId !== 1) {
    const isOwned = await roleModel.isRoleOwnedByUser(req.params.id, req.user.userId);
    if (!isOwned) {
      return next(new ErrorResponse('You can only delete roles you created', 403));
    }
  }

  try {
    const success = await roleModel.deleteRole(req.params.id);

    if (!success) {
      return next(new ErrorResponse(`Role not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    return next(new ErrorResponse(error.message, 400));
  }
});

const getRoleStatistics = asyncHandler(async (req, res, next) => {
  const statistics = await roleModel.getRoleStatistics();

  res.status(200).json({
    success: true,
    data: statistics
  });
});

const getUsersByRole = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const offset = (page - 1) * limit;

  const role = await roleModel.getRoleById(req.params.id);
  if (!role) {
    return next(new ErrorResponse(`Role not found with id of ${req.params.id}`, 404));
  }

  const users = await roleModel.getUsersByRole(req.params.id, limit, offset);

  res.status(200).json({
    success: true,
    count: users.length,
    role: role.roleName,
    pagination: {
      page,
      limit
    },
    data: users
  });
});

const validateRole = asyncHandler(async (req, res, next) => {
  const isValid = await roleModel.validateRoleId(req.params.id);

  res.status(200).json({
    success: true,
    valid: isValid,
    data: {
      roleId: req.params.id,
      exists: isValid
    }
  });
});

export default {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getRoleStatistics,
  getUsersByRole,
  validateRole
};
