import express from 'express';
import permissionController from '../../controllers/permission/permissionController.js';
import { protect, requirePermission } from '../../middleware/auth.js';
import { validateId, validateRoleId, validateUserId, validatePermissionId, handleValidationErrors } from '../../middleware/validation.js';

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// Get all permissions
router.get('/getAllPermissions', requirePermission('permissions.view'), permissionController.getAllPermissions);

// Get permissions grouped by resource
router.get('/getPermissionsGrouped', requirePermission('permissions.view'), permissionController.getPermissionsGrouped);

// Get permissions by role
router.get('/getPermissionsByRole/:roleId',
  requirePermission('permissions.view'),
  validateRoleId,
  handleValidationErrors,
  permissionController.getPermissionsByRole
);

// Get user permissions (admin only)
router.get('/getUserPermissions/:userId',
  requirePermission('permissions.view'),
  validateUserId,
  handleValidationErrors,
  permissionController.getUserPermissions
);

// Get current user's permissions (no special permission required)
router.get('/getMyPermissions',
  permissionController.getMyPermissions
);

// Create new permission
router.post('/createPermission',
  requirePermission('permissions.create'),
  permissionController.createPermission
);

// Update permission
router.put('/updatePermission/:permissionId',
  requirePermission('permissions.update'),
  validatePermissionId,
  handleValidationErrors,
  permissionController.updatePermission
);

// Delete permission
router.delete('/deletePermission/:permissionId',
  requirePermission('permissions.delete'),
  validatePermissionId,
  handleValidationErrors,
  permissionController.deletePermission
);

// Assign permissions to role
router.post('/assignPermissionsToRole/:roleId',
  requirePermission('permissions.assign'),
  validateRoleId,
  handleValidationErrors,
  permissionController.assignPermissionsToRole
);

// Get all roles with their permissions
router.get('/getRolesWithPermissions',
  requirePermission('permissions.view'),
  permissionController.getRolesWithPermissions
);

export default router;
