import express from 'express';
import sidebarController from '../../controllers/sidebar/sidebarController.js';
import { protect, requirePermission } from '../../middleware/auth.js';
import { validateId, validateRoleId, validatePageId, handleValidationErrors } from '../../middleware/validation.js';

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// Get all sidebar pages (admin only)
router.get('/getAllPages',
  requirePermission('permissions.view'),
  sidebarController.getAllPages
);

// Get current user's sidebar pages based on permissions (no special permission required)
router.get('/getMyPages',
  sidebarController.getMyPages
);

// Get pages with permissions for role management interface (admin only)
router.get('/getPagesWithPermissions',
  requirePermission('permissions.view'),
  sidebarController.getPagesWithPermissions
);

// Get role permissions for all pages (admin only)
router.get('/getRolePagePermissions/:roleId',
  requirePermission('permissions.view'),
  validateRoleId,
  handleValidationErrors,
  sidebarController.getRolePagePermissions
);

// Update role permissions for multiple pages (admin only)
router.put('/updateRolePermissions/:roleId',
  requirePermission('permissions.assign'),
  validateRoleId,
  handleValidationErrors,
  sidebarController.updateRolePermissions
);

// Check if user has permission for a specific page (no special permission required)
router.get('/checkPagePermission',
  sidebarController.checkPagePermission
);

// Create new sidebar page (admin only)
router.post('/createPage',
  requirePermission('permissions.create'),
  sidebarController.createPage
);

// Update sidebar page (admin only)
router.put('/updatePage/:pageId',
  requirePermission('permissions.update'),
  validatePageId,
  handleValidationErrors,
  sidebarController.updatePage
);

// Delete sidebar page (admin only)
router.delete('/deletePage/:pageId',
  requirePermission('permissions.delete'),
  validatePageId,
  handleValidationErrors,
  sidebarController.deletePage
);

export default router;
