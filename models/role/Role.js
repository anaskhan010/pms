import db from '../../config/db.js';

const createRole = async (roleName, createdByUserId = null) => {
  const existingRole = await getRoleByName(roleName);
  if (existingRole) {
    throw new Error('Role with this name already exists');
  }

  // If created by an owner user, prefix the role name with owner identifier
  let finalRoleName = roleName;
  if (createdByUserId) {
    // Check if the user is an owner (roleId = 2)
    const userRoleQuery = 'SELECT roleId FROM userRole WHERE userId = ?';
    const [userRoles] = await db.execute(userRoleQuery, [createdByUserId]);

    if (userRoles.some(ur => ur.roleId === 2)) {
      // Owner user - prefix the role name
      finalRoleName = `owner_${createdByUserId}_${roleName}`;
    }
  }

  const query = 'INSERT INTO role (roleName) VALUES (?)';
  const result = await db.execute(query, [finalRoleName]);

  return {
    roleId: result[0].insertId,
    roleName: finalRoleName
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

// Get roles that an owner can assign (HIERARCHICAL)
const getRolesForOwner = async (ownerId) => {
  try {
    console.log(`getRolesForOwner: Getting roles for owner ${ownerId}`);

    // Owner can assign staff roles (3-6) + custom roles they created
    const query = `
      SELECT roleId, roleName
      FROM role
      WHERE (roleId BETWEEN 3 AND 6)
         OR (roleName LIKE ?)
      ORDER BY roleId
    `;

    const [rows] = await db.execute(query, [`owner_${ownerId}_%`]);

    console.log(`getRolesForOwner: Found ${rows.length} assignable roles for owner ${ownerId}`);

    return rows;
  } catch (error) {
    console.error('Error in getRolesForOwner:', error);
    throw error;
  }
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

// Check if a role belongs to a specific owner
const isRoleOwnedByUser = async (roleId, userId) => {
  const role = await getRoleById(roleId);
  if (!role) return false;

  // Check if role name follows owner pattern
  const ownerPattern = `owner_${userId}_`;
  return role.roleName.startsWith(ownerPattern);
};

// Get roles created by a specific owner
const getRolesByOwner = async (ownerId) => {
  const query = `
    SELECT roleId, roleName
    FROM role
    WHERE roleName LIKE ?
    ORDER BY roleName ASC
  `;

  const [rows] = await db.execute(query, [`owner_${ownerId}_%`]);
  return rows;
};

// Get all roles that a user can manage (admin gets all, owner gets their own + assignable roles)
const getManageableRoles = async (userId, userRoleId) => {
  if (userRoleId === 1) {
    // Admin can manage all roles
    return getAllRoles();
  } else if (userRoleId === 2) {
    // Owner can manage their own created roles + predefined assignable roles
    const ownRoles = await getRolesByOwner(userId);
    const assignableRoles = await getRolesForOwner(userId);

    // Combine and deduplicate
    const allRoles = [...ownRoles, ...assignableRoles];
    const uniqueRoles = allRoles.filter((role, index, self) =>
      index === self.findIndex(r => r.roleId === role.roleId)
    );

    return uniqueRoles;
  } else {
    // Other roles cannot manage roles
    return [];
  }
};

export default {
  createRole,
  getRoleById,
  getRoleByName,
  getAllRoles,
  getRolesForOwner,
  updateRole,
  deleteRole,
  validateRoleId,
  getRoleStatistics,
  getUsersByRole,
  isRoleOwnedByUser,
  getRolesByOwner,
  getManageableRoles
};
