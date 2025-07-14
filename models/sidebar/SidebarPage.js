import db from '../../config/db.js';

/**
 * SidebarPage Model - Handles dynamic sidebar page management
 */

// Get all active sidebar pages
const getAllPages = async () => {
  const query = `
    SELECT pageId, pageName, pageUrl, pageIcon, displayOrder, description
    FROM sidebar_pages 
    WHERE isActive = 1 
    ORDER BY displayOrder ASC
  `;
  const [rows] = await db.execute(query);
  return rows;
};

// Get sidebar pages for a specific user based on their role permissions
const getUserPages = async (userId) => {
  const query = `
    SELECT DISTINCT sp.pageId, sp.pageName, sp.pageUrl, sp.pageIcon, sp.displayOrder, sp.description
    FROM sidebar_pages sp
    INNER JOIN page_permissions pp ON sp.pageId = pp.pageId
    INNER JOIN role_page_permissions rpp ON pp.pageId = rpp.pageId AND pp.permissionType = rpp.permissionType
    INNER JOIN userRole ur ON rpp.roleId = ur.roleId
    WHERE ur.userId = ? 
    AND sp.isActive = 1 
    AND pp.permissionType = 'view'
    AND rpp.isGranted = 1
    ORDER BY sp.displayOrder ASC
  `;
  const [rows] = await db.execute(query, [userId]);
  return rows;
};

// Get all pages with their permissions for role management interface
const getPagesWithPermissions = async () => {
  try {
    // First get all pages
    const pagesQuery = `
      SELECT pageId, pageName, pageUrl, pageIcon, displayOrder, description
      FROM sidebar_pages
      WHERE isActive = 1
      ORDER BY displayOrder ASC
    `;
    const [pages] = await db.execute(pagesQuery);

    // Then get all permissions for these pages
    const permissionsQuery = `
      SELECT pageId, permissionType, permissionName, description
      FROM page_permissions pp
      WHERE pp.pageId IN (${pages.map(() => '?').join(',')})
      ORDER BY pp.pageId, pp.permissionType
    `;
    const [permissions] = await db.execute(permissionsQuery, pages.map(p => p.pageId));

    // Group permissions by pageId
    const permissionsByPage = permissions.reduce((acc, permission) => {
      if (!acc[permission.pageId]) {
        acc[permission.pageId] = [];
      }
      acc[permission.pageId].push({
        permissionType: permission.permissionType,
        permissionName: permission.permissionName,
        description: permission.description
      });
      return acc;
    }, {});

    // Combine pages with their permissions
    return pages.map(page => ({
      ...page,
      permissions: permissionsByPage[page.pageId] || []
    }));
  } catch (error) {
    console.error('Error in getPagesWithPermissions:', error);
    throw error;
  }
};

// Get role permissions for all pages
const getRolePagePermissions = async (roleId) => {
  const query = `
    SELECT 
      sp.pageId,
      sp.pageName,
      pp.permissionType,
      pp.permissionName,
      COALESCE(rpp.isGranted, 0) as isGranted
    FROM sidebar_pages sp
    INNER JOIN page_permissions pp ON sp.pageId = pp.pageId
    LEFT JOIN role_page_permissions rpp ON sp.pageId = rpp.pageId 
      AND pp.permissionType = rpp.permissionType 
      AND rpp.roleId = ?
    WHERE sp.isActive = 1
    ORDER BY sp.displayOrder ASC, pp.permissionType ASC
  `;
  const [rows] = await db.execute(query, [roleId]);
  return rows;
};

// Update role permissions for a specific page
const updateRolePagePermissions = async (roleId, pageId, permissions) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Delete existing permissions for this role and page
    await connection.execute(
      'DELETE FROM role_page_permissions WHERE roleId = ? AND pageId = ?',
      [roleId, pageId]
    );
    
    // Insert new permissions
    if (permissions && permissions.length > 0) {
      const insertQuery = `
        INSERT INTO role_page_permissions (roleId, pageId, permissionType, isGranted)
        VALUES (?, ?, ?, ?)
      `;
      
      for (const permission of permissions) {
        await connection.execute(insertQuery, [
          roleId,
          pageId,
          permission.permissionType,
          permission.isGranted ? 1 : 0
        ]);
      }
    }
    
    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Bulk update role permissions for multiple pages
const bulkUpdateRolePermissions = async (roleId, pagePermissions) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Delete all existing permissions for this role
    await connection.execute(
      'DELETE FROM role_page_permissions WHERE roleId = ?',
      [roleId]
    );
    
    // Insert new permissions
    const insertQuery = `
      INSERT INTO role_page_permissions (roleId, pageId, permissionType, isGranted)
      VALUES (?, ?, ?, ?)
    `;
    
    for (const pagePermission of pagePermissions) {
      for (const permission of pagePermission.permissions) {
        if (permission.isGranted) {
          await connection.execute(insertQuery, [
            roleId,
            pagePermission.pageId,
            permission.permissionType,
            1
          ]);
        }
      }
    }
    
    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Check if user has permission for a specific page and action
const hasPagePermission = async (userId, pageUrl, permissionType = 'view') => {
  const query = `
    SELECT COUNT(*) as hasPermission
    FROM sidebar_pages sp
    INNER JOIN page_permissions pp ON sp.pageId = pp.pageId
    INNER JOIN role_page_permissions rpp ON pp.pageId = rpp.pageId AND pp.permissionType = rpp.permissionType
    INNER JOIN userRole ur ON rpp.roleId = ur.roleId
    WHERE ur.userId = ? 
    AND sp.pageUrl = ?
    AND pp.permissionType = ?
    AND rpp.isGranted = 1
    AND sp.isActive = 1
  `;
  const [rows] = await db.execute(query, [userId, pageUrl, permissionType]);
  return rows[0].hasPermission > 0;
};

// Create new sidebar page
const createPage = async (pageName, pageUrl, pageIcon, displayOrder, description) => {
  const query = `
    INSERT INTO sidebar_pages (pageName, pageUrl, pageIcon, displayOrder, description)
    VALUES (?, ?, ?, ?, ?)
  `;
  const result = await db.execute(query, [pageName, pageUrl, pageIcon, displayOrder, description]);
  
  return {
    pageId: result[0].insertId,
    pageName,
    pageUrl,
    pageIcon,
    displayOrder,
    description
  };
};

// Update sidebar page
const updatePage = async (pageId, pageName, pageUrl, pageIcon, displayOrder, description) => {
  const query = `
    UPDATE sidebar_pages 
    SET pageName = ?, pageUrl = ?, pageIcon = ?, displayOrder = ?, description = ?
    WHERE pageId = ?
  `;
  const result = await db.execute(query, [pageName, pageUrl, pageIcon, displayOrder, description, pageId]);
  return result[0].affectedRows > 0;
};

// Delete sidebar page (soft delete)
const deletePage = async (pageId) => {
  const query = 'UPDATE sidebar_pages SET isActive = 0 WHERE pageId = ?';
  const result = await db.execute(query, [pageId]);
  return result[0].affectedRows > 0;
};

export default {
  getAllPages,
  getUserPages,
  getPagesWithPermissions,
  getRolePagePermissions,
  updateRolePagePermissions,
  bulkUpdateRolePermissions,
  hasPagePermission,
  createPage,
  updatePage,
  deletePage
};
