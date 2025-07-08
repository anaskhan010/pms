import db from '../../config/db.js';

const createRole = async (roleName) => {
  const existingRole = await getRoleByName(roleName);
  if (existingRole) {
    throw new Error('Role with this name already exists');
  }

  const query = 'INSERT INTO role (roleName) VALUES (?)';
  const result = await db.execute(query, [roleName]);
  
  return {
    roleId: result[0].insertId,
    roleName
  };
};

const getRoleById = async (roleId) => {
  const query = 'SELECT * FROM role WHERE roleId = ?';
  const [rows] = await db.execute(query, [roleId]);
  return rows[0] || null;
};

const getRoleByName = async (roleName) => {
  const query = 'SELECT * FROM role WHERE roleName = ?';
  const [rows] = await db.execute(query, [roleName]);
  return rows[0] || null;
};

const getAllRoles = async () => {
  const query = 'SELECT * FROM role ORDER BY roleName ASC';
  const [rows] = await db.execute(query);
  return rows;
};

const updateRole = async (roleId, roleName) => {
  const existingRole = await getRoleById(roleId);
  if (!existingRole) {
    throw new Error('Role not found');
  }

  const nameExists = await db.execute(
    'SELECT roleId FROM role WHERE roleName = ? AND roleId != ?',
    [roleName, roleId]
  );
  
  if (nameExists[0].length > 0) {
    throw new Error('Role with this name already exists');
  }

  const query = 'UPDATE role SET roleName = ? WHERE roleId = ?';
  const result = await db.execute(query, [roleName, roleId]);
  
  if (result[0].affectedRows === 0) {
    throw new Error('Role not found');
  }

  return await getRoleById(roleId);
};

const deleteRole = async (roleId) => {
  const usersWithRole = await db.execute(
    'SELECT COUNT(*) as count FROM userRole WHERE roleId = ?',
    [roleId]
  );

  if (usersWithRole[0][0].count > 0) {
    throw new Error('Cannot delete role that is assigned to users');
  }

  const query = 'DELETE FROM role WHERE roleId = ?';
  const result = await db.execute(query, [roleId]);
  
  return result[0].affectedRows > 0;
};

const validateRoleId = async (roleId) => {
  const role = await getRoleById(roleId);
  return role !== null;
};

const getRoleStatistics = async () => {
  const query = `
    SELECT 
      r.roleId,
      r.roleName,
      COUNT(ur.userId) as userCount
    FROM role r
    LEFT JOIN userRole ur ON r.roleId = ur.roleId
    GROUP BY r.roleId, r.roleName
    ORDER BY userCount DESC, r.roleName ASC
  `;
  
  const [rows] = await db.execute(query);
  return rows;
};

const getUsersByRole = async (roleId, limit = 50, offset = 0) => {
  const query = `
    SELECT u.userId, u.firstName, u.lastName, u.email, u.created_at
    FROM user u
    INNER JOIN userRole ur ON u.userId = ur.userId
    WHERE ur.roleId = ?
    ORDER BY u.created_at DESC
    LIMIT ? OFFSET ?
  `;
  
  const [rows] = await db.execute(query, [roleId, limit, offset]);
  return rows;
};

export default {
  createRole,
  getRoleById,
  getRoleByName,
  getAllRoles,
  updateRole,
  deleteRole,
  validateRoleId,
  getRoleStatistics,
  getUsersByRole
};
