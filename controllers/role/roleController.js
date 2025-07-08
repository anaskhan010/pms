import roleModel from '../../models/role/Role.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ErrorResponse from '../../utils/errorResponse.js';

const getAllRoles = asyncHandler(async (req, res, next) => {
  const roles = await roleModel.getAllRoles();

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
    const role = await roleModel.createRole(roleName);

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

  try {
    const role = await roleModel.updateRole(req.params.id, roleName);

    res.status(200).json({
      success: true,
      data: role
    });
  } catch (error) {
    return next(new ErrorResponse(error.message, 400));
  }
});

const deleteRole = asyncHandler(async (req, res, next) => {
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
