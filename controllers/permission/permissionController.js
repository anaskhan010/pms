import asyncHandler from '../../utils/asyncHandler.js';
import ErrorResponse from '../../utils/errorResponse.js';
import permissionModel from '../../models/permission/Permission.js';
import roleModel from '../../models/role/Role.js';

// Get all permissions
const getAllPermissions = asyncHandler(async (req, res, next) => {
  try {
    const permissions = await permissionModel.getAllPermissions();

    res.status(200).json({
      success: true,
      data: permissions
    });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

// Get permissions grouped by resource
const getPermissionsGrouped = asyncHandler(async (req, res, next) => {
  try {
    const groupedPermissions = await permissionModel.getPermissionsGroupedByResource();

    res.status(200).json({
      success: true,
      data: groupedPermissions
    });
  } catch (error) {
    console.error('Error fetching grouped permissions:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

// Get permissions by role
const getPermissionsByRole = asyncHandler(async (req, res, next) => {
  try {
    const { roleId } = req.params;
    const permissions = await permissionModel.getPermissionsByRole(roleId);

    res.status(200).json({
      success: true,
      data: permissions
    });
  } catch (error) {
    console.error('Error fetching permissions by role:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

// Get user permissions
const getUserPermissions = asyncHandler(async (req, res, next) => {
  try {
    const { userId } = req.params;
    const permissions = await permissionModel.getUserPermissions(userId);

    res.status(200).json({
      success: true,
      data: permissions
    });
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

// Get current user's permissions (no admin permission required)
const getMyPermissions = asyncHandler(async (req, res, next) => {
  try {
    const permissions = await permissionModel.getUserPermissions(req.user.userId);

    res.status(200).json({
      success: true,
      data: permissions
    });
  } catch (error) {
    console.error('Error fetching current user permissions:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

// Create new permission
const createPermission = asyncHandler(async (req, res, next) => {
  try {
    const { permissionName, resource, action, description } = req.body;

    if (!permissionName || !resource || !action) {
      return next(new ErrorResponse('Permission name, resource, and action are required', 400));
    }

    const permission = await permissionModel.createPermission(permissionName, resource, action, description);

    res.status(201).json({
      success: true,
      data: permission,
      message: 'Permission created successfully'
    });
  } catch (error) {
    console.error('Error creating permission:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

// Update permission
const updatePermission = asyncHandler(async (req, res, next) => {
  try {
    const { permissionId } = req.params;
    const { permissionName, resource, action, description } = req.body;

    if (!permissionName || !resource || !action) {
      return next(new ErrorResponse('Permission name, resource, and action are required', 400));
    }

    const permission = await permissionModel.updatePermission(permissionId, permissionName, resource, action, description);

    res.status(200).json({
      success: true,
      data: permission,
      message: 'Permission updated successfully'
    });
  } catch (error) {
    console.error('Error updating permission:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

// Delete permission
const deletePermission = asyncHandler(async (req, res, next) => {
  try {
    const { permissionId } = req.params;

    const success = await permissionModel.deletePermission(permissionId);

    if (!success) {
      return next(new ErrorResponse('Permission not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Permission deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting permission:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

// Assign permissions to role
const assignPermissionsToRole = asyncHandler(async (req, res, next) => {
  try {
    const { roleId } = req.params;
    const { permissionIds } = req.body;

    if (!permissionIds || !Array.isArray(permissionIds)) {
      return next(new ErrorResponse('Permission IDs array is required', 400));
    }

    // Remove all existing permissions for the role
    await permissionModel.removeAllPermissionsFromRole(roleId);

    // Assign new permissions
    if (permissionIds.length > 0) {
      await permissionModel.bulkAssignPermissionsToRole(roleId, permissionIds);
    }

    res.status(200).json({
      success: true,
      message: 'Permissions assigned to role successfully'
    });
  } catch (error) {
    console.error('Error assigning permissions to role:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

// Get all roles with their permissions
const getRolesWithPermissions = asyncHandler(async (req, res, next) => {
  try {
    const roles = await roleModel.getAllRoles();
    
    const rolesWithPermissions = await Promise.all(
      roles.map(async (role) => {
        const permissions = await permissionModel.getPermissionsByRole(role.roleId);
        return {
          ...role,
          permissions
        };
      })
    );

    res.status(200).json({
      success: true,
      data: rolesWithPermissions
    });
  } catch (error) {
    console.error('Error fetching roles with permissions:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

export default {
  getAllPermissions,
  getPermissionsGrouped,
  getPermissionsByRole,
  getUserPermissions,
  getMyPermissions,
  createPermission,
  updatePermission,
  deletePermission,
  assignPermissionsToRole,
  getRolesWithPermissions
};
