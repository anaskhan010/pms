import asyncHandler from '../../utils/asyncHandler.js';
import ErrorResponse from '../../utils/errorResponse.js';
import permissionModel from '../../models/permission/Permission.js';
import roleModel from '../../models/role/Role.js';
import userModel from '../../models/user/User.js';

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

    // First check if the target user is admin
    const userRole = await userModel.getUserRole(userId);
    let permissions;

    if (userRole && userRole.roleId === 1) {
      // Admin users get all permissions automatically
      permissions = await permissionModel.getAllPermissions();
      // Transform to match the expected format for user permissions
      permissions = permissions.map(p => ({
        permissionId: p.permissionId,
        permissionName: p.permissionName,
        resource: p.resource,
        action: p.action,
        description: p.description
      }));
    } else {
      // Regular users get their assigned permissions
      permissions = await permissionModel.getUserPermissions(userId);
    }

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
    let permissions = [];
    let pagePermissions = [];

    // Admin users (roleId = 1) get all permissions automatically
    if (req.user.roleId === 1) {
      permissions = await permissionModel.getAllPermissions();
      // Transform to match the expected format for user permissions
      permissions = permissions.map(p => ({
        permissionId: p.permissionId,
        permissionName: p.permissionName,
        resource: p.resource,
        action: p.action,
        description: p.description
      }));

      // Admin gets all page permissions too
      const db = (await import('../../config/db.js')).default;
      const [allPagePerms] = await db.execute(`
        SELECT CONCAT(LOWER(REPLACE(sp.pageName, ' ', '_')), '.', pp.permissionType) as permissionName,
               LOWER(REPLACE(sp.pageName, ' ', '_')) as resource,
               pp.permissionType as action,
               pp.description
        FROM sidebar_pages sp
        INNER JOIN page_permissions pp ON sp.pageId = pp.pageId
        WHERE sp.isActive = 1
      `);

      pagePermissions = allPagePerms.map(p => ({
        permissionId: 0, // Page permissions don't have IDs in the same table
        permissionName: p.permissionName,
        resource: p.resource,
        action: p.action,
        description: p.description
      }));
    } else {
      // Regular users get their assigned permissions
      permissions = await permissionModel.getUserPermissions(req.user.userId);

      // Also get their page permissions
      const db = (await import('../../config/db.js')).default;
      const [userPagePerms] = await db.execute(`
        SELECT CONCAT(LOWER(REPLACE(sp.pageName, ' ', '_')), '.', pp.permissionType) as permissionName,
               LOWER(REPLACE(sp.pageName, ' ', '_')) as resource,
               pp.permissionType as action,
               pp.description
        FROM sidebar_pages sp
        INNER JOIN page_permissions pp ON sp.pageId = pp.pageId
        INNER JOIN role_page_permissions rpp ON pp.pageId = rpp.pageId AND pp.permissionType = rpp.permissionType
        INNER JOIN userRole ur ON rpp.roleId = ur.roleId
        WHERE ur.userId = ? AND rpp.isGranted = 1 AND sp.isActive = 1
      `, [req.user.userId]);

      pagePermissions = userPagePerms.map(p => ({
        permissionId: 0, // Page permissions don't have IDs in the same table
        permissionName: p.permissionName,
        resource: p.resource,
        action: p.action,
        description: p.description
      }));
    }

    // Combine resource permissions and page permissions
    const allPermissions = [...permissions, ...pagePermissions];

    res.status(200).json({
      success: true,
      data: allPermissions
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
