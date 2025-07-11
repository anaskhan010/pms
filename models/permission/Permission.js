import db from '../../config/db.js';

/**
 * Permission Model - Handles dynamic permission management
 */

// Get all permissions
const getAllPermissions = async () => {
  const query = `
    SELECT p.*, 
           COUNT(rp.roleId) as assignedRoles
    FROM permissions p
    LEFT JOIN role_permissions rp ON p.permissionId = rp.permissionId
    GROUP BY p.permissionId
    ORDER BY p.resource, p.action
  `;
  const [rows] = await db.execute(query);
  return rows;
};

// Get permissions by role
const getPermissionsByRole = async (roleId) => {
  const query = `
    SELECT p.*
    FROM permissions p
    INNER JOIN role_permissions rp ON p.permissionId = rp.permissionId
    WHERE rp.roleId = ?
    ORDER BY p.resource, p.action
  `;
  const [rows] = await db.execute(query, [roleId]);
  return rows;
};

// Get user permissions (with role information)
const getUserPermissions = async (userId) => {
  const query = `
    SELECT DISTINCT p.permissionId, p.permissionName, p.resource, p.action, p.description
    FROM permissions p
    INNER JOIN role_permissions rp ON p.permissionId = rp.permissionId
    INNER JOIN userRole ur ON rp.roleId = ur.roleId
    WHERE ur.userId = ?
    ORDER BY p.resource, p.action
  `;
  const [rows] = await db.execute(query, [userId]);
  return rows;
};

// Check if user has specific permission
const hasPermission = async (userId, permissionName) => {
  const query = `
    SELECT COUNT(*) as hasPermission
    FROM permissions p
    INNER JOIN role_permissions rp ON p.permissionId = rp.permissionId
    INNER JOIN userRole ur ON rp.roleId = ur.roleId
    WHERE ur.userId = ? AND p.permissionName = ?
  `;
  const [rows] = await db.execute(query, [userId, permissionName]);
  return rows[0].hasPermission > 0;
};

// Check if user has permission for resource and action
const hasResourcePermission = async (userId, resource, action) => {
  const query = `
    SELECT COUNT(*) as hasPermission
    FROM permissions p
    INNER JOIN role_permissions rp ON p.permissionId = rp.permissionId
    INNER JOIN userRole ur ON rp.roleId = ur.roleId
    WHERE ur.userId = ? AND p.resource = ? AND p.action = ?
  `;
  const [rows] = await db.execute(query, [userId, resource, action]);
  return rows[0].hasPermission > 0;
};

// Create new permission
const createPermission = async (permissionName, resource, action, description = null) => {
  const query = `
    INSERT INTO permissions (permissionName, resource, action, description)
    VALUES (?, ?, ?, ?)
  `;
  const result = await db.execute(query, [permissionName, resource, action, description]);
  
  return {
    permissionId: result[0].insertId,
    permissionName,
    resource,
    action,
    description
  };
};

// Update permission
const updatePermission = async (permissionId, permissionName, resource, action, description = null) => {
  const query = `
    UPDATE permissions 
    SET permissionName = ?, resource = ?, action = ?, description = ?
    WHERE permissionId = ?
  `;
  const result = await db.execute(query, [permissionName, resource, action, description, permissionId]);
  
  if (result[0].affectedRows === 0) {
    throw new Error('Permission not found');
  }
  
  return await getPermissionById(permissionId);
};

// Delete permission
const deletePermission = async (permissionId) => {
  // First delete role_permissions associations
  await db.execute('DELETE FROM role_permissions WHERE permissionId = ?', [permissionId]);
  
  // Then delete the permission
  const query = 'DELETE FROM permissions WHERE permissionId = ?';
  const result = await db.execute(query, [permissionId]);
  
  return result[0].affectedRows > 0;
};

// Get permission by ID
const getPermissionById = async (permissionId) => {
  const query = 'SELECT * FROM permissions WHERE permissionId = ?';
  const [rows] = await db.execute(query, [permissionId]);
  return rows[0] || null;
};

// Assign permission to role
const assignPermissionToRole = async (roleId, permissionId) => {
  const query = `
    INSERT IGNORE INTO role_permissions (roleId, permissionId)
    VALUES (?, ?)
  `;
  const result = await db.execute(query, [roleId, permissionId]);
  return result[0].affectedRows > 0;
};

// Remove permission from role
const removePermissionFromRole = async (roleId, permissionId) => {
  const query = 'DELETE FROM role_permissions WHERE roleId = ? AND permissionId = ?';
  const result = await db.execute(query, [roleId, permissionId]);
  return result[0].affectedRows > 0;
};

// Get roles that have a specific permission
const getRolesByPermission = async (permissionId) => {
  const query = `
    SELECT r.*
    FROM role r
    INNER JOIN role_permissions rp ON r.roleId = rp.roleId
    WHERE rp.permissionId = ?
    ORDER BY r.roleName
  `;
  const [rows] = await db.execute(query, [permissionId]);
  return rows;
};

// Bulk assign permissions to role
const bulkAssignPermissionsToRole = async (roleId, permissionIds) => {
  if (!permissionIds || permissionIds.length === 0) {
    return false;
  }

  const values = permissionIds.map(permissionId => [roleId, permissionId]);
  const placeholders = values.map(() => '(?, ?)').join(', ');
  const flatValues = values.flat();

  const query = `
    INSERT IGNORE INTO role_permissions (roleId, permissionId)
    VALUES ${placeholders}
  `;
  
  const result = await db.execute(query, flatValues);
  return result[0].affectedRows > 0;
};

// Remove all permissions from role
const removeAllPermissionsFromRole = async (roleId) => {
  const query = 'DELETE FROM role_permissions WHERE roleId = ?';
  const result = await db.execute(query, [roleId]);
  return result[0].affectedRows;
};

// Get permissions grouped by resource
const getPermissionsGroupedByResource = async () => {
  const query = `
    SELECT resource, 
           JSON_ARRAYAGG(
             JSON_OBJECT(
               'permissionId', permissionId,
               'permissionName', permissionName,
               'action', action,
               'description', description
             )
           ) as permissions
    FROM permissions
    GROUP BY resource
    ORDER BY resource
  `;
  const [rows] = await db.execute(query);
  return rows.map(row => ({
    resource: row.resource,
    permissions: JSON.parse(row.permissions)
  }));
};

export default {
  getAllPermissions,
  getPermissionsByRole,
  getUserPermissions,
  hasPermission,
  hasResourcePermission,
  createPermission,
  updatePermission,
  deletePermission,
  getPermissionById,
  assignPermissionToRole,
  removePermissionFromRole,
  getRolesByPermission,
  bulkAssignPermissionsToRole,
  removeAllPermissionsFromRole,
  getPermissionsGroupedByResource
};
