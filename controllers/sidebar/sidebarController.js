import asyncHandler from '../../utils/asyncHandler.js';
import ErrorResponse from '../../utils/errorResponse.js';
import sidebarPageModel from '../../models/sidebar/SidebarPage.js';

// Get all sidebar pages (admin only)
const getAllPages = asyncHandler(async (req, res, next) => {
  try {
    const pages = await sidebarPageModel.getAllPages();

    res.status(200).json({
      success: true,
      count: pages.length,
      data: pages
    });
  } catch (error) {
    console.error('Error fetching all pages:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

// Get sidebar pages for current user based on permissions
const getMyPages = asyncHandler(async (req, res, next) => {
  try {
    let pages;
    
    // Admin users (roleId = 1) get all pages
    if (req.user.roleId === 1) {
      pages = await sidebarPageModel.getAllPages();
    } else {
      // Regular users get pages based on their permissions
      pages = await sidebarPageModel.getUserPages(req.user.userId);
    }

    res.status(200).json({
      success: true,
      count: pages.length,
      data: pages
    });
  } catch (error) {
    console.error('Error fetching user pages:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

// Get pages with permissions for role management interface
const getPagesWithPermissions = asyncHandler(async (req, res, next) => {
  try {
    const pages = await sidebarPageModel.getPagesWithPermissions();

    res.status(200).json({
      success: true,
      count: pages.length,
      data: pages
    });
  } catch (error) {
    console.error('Error fetching pages with permissions:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

// Get role permissions for all pages
const getRolePagePermissions = asyncHandler(async (req, res, next) => {
  try {
    const { roleId } = req.params;
    const permissions = await sidebarPageModel.getRolePagePermissions(roleId);

    // Group permissions by page
    const groupedPermissions = permissions.reduce((acc, permission) => {
      const pageKey = permission.pageId;
      if (!acc[pageKey]) {
        acc[pageKey] = {
          pageId: permission.pageId,
          pageName: permission.pageName,
          permissions: []
        };
      }
      acc[pageKey].permissions.push({
        permissionType: permission.permissionType,
        permissionName: permission.permissionName,
        isGranted: permission.isGranted === 1
      });
      return acc;
    }, {});

    const result = Object.values(groupedPermissions);

    res.status(200).json({
      success: true,
      count: result.length,
      data: result
    });
  } catch (error) {
    console.error('Error fetching role page permissions:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

// Update role permissions for multiple pages
const updateRolePermissions = asyncHandler(async (req, res, next) => {
  try {
    const { roleId } = req.params;
    const { pagePermissions } = req.body;

    if (!pagePermissions || !Array.isArray(pagePermissions)) {
      return next(new ErrorResponse('Page permissions array is required', 400));
    }

    await sidebarPageModel.bulkUpdateRolePermissions(roleId, pagePermissions);

    res.status(200).json({
      success: true,
      message: 'Role permissions updated successfully'
    });
  } catch (error) {
    console.error('Error updating role permissions:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

// Check if user has permission for a specific page
const checkPagePermission = asyncHandler(async (req, res, next) => {
  try {
    const { pageUrl, permissionType = 'view' } = req.query;
    
    if (!pageUrl) {
      return next(new ErrorResponse('Page URL is required', 400));
    }

    let hasPermission = false;
    
    // Admin users have all permissions
    if (req.user.roleId === 1) {
      hasPermission = true;
    } else {
      hasPermission = await sidebarPageModel.hasPagePermission(
        req.user.userId, 
        pageUrl, 
        permissionType
      );
    }

    res.status(200).json({
      success: true,
      data: {
        hasPermission,
        pageUrl,
        permissionType,
        userId: req.user.userId
      }
    });
  } catch (error) {
    console.error('Error checking page permission:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

// Create new sidebar page (admin only)
const createPage = asyncHandler(async (req, res, next) => {
  try {
    const { pageName, pageUrl, pageIcon, displayOrder, description } = req.body;

    if (!pageName || !pageUrl || !pageIcon) {
      return next(new ErrorResponse('Page name, URL, and icon are required', 400));
    }

    const page = await sidebarPageModel.createPage(
      pageName, 
      pageUrl, 
      pageIcon, 
      displayOrder || 0, 
      description
    );

    res.status(201).json({
      success: true,
      data: page,
      message: 'Sidebar page created successfully'
    });
  } catch (error) {
    console.error('Error creating sidebar page:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

// Update sidebar page (admin only)
const updatePage = asyncHandler(async (req, res, next) => {
  try {
    const { pageId } = req.params;
    const { pageName, pageUrl, pageIcon, displayOrder, description } = req.body;

    if (!pageName || !pageUrl || !pageIcon) {
      return next(new ErrorResponse('Page name, URL, and icon are required', 400));
    }

    const updated = await sidebarPageModel.updatePage(
      pageId,
      pageName,
      pageUrl,
      pageIcon,
      displayOrder || 0,
      description
    );

    if (!updated) {
      return next(new ErrorResponse('Sidebar page not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Sidebar page updated successfully'
    });
  } catch (error) {
    console.error('Error updating sidebar page:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

// Delete sidebar page (admin only)
const deletePage = asyncHandler(async (req, res, next) => {
  try {
    const { pageId } = req.params;

    const deleted = await sidebarPageModel.deletePage(pageId);

    if (!deleted) {
      return next(new ErrorResponse('Sidebar page not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Sidebar page deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting sidebar page:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

export default {
  getAllPages,
  getMyPages,
  getPagesWithPermissions,
  getRolePagePermissions,
  updateRolePermissions,
  checkPagePermission,
  createPage,
  updatePage,
  deletePage
};
