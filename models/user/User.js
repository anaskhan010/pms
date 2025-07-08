import db from '../../config/db.js';
import bcrypt from 'bcryptjs';
import roleModel from '../role/Role.js';

const createUser = async (firstName, lastName, email, hashedPassword, phoneNumber, address, gender, nationality, dateOfBirth, image, roleId) => {
  try {
    console.log('Creating user with email:', email);

    const roleExists = await roleModel.validateRoleId(roleId);
    if (!roleExists) {
      throw new Error('Invalid role ID provided');
    }

    const query = `INSERT INTO user (
          firstName, lastName, email, password, phoneNumber,
          address, gender, nationality, dateOfBirth, image
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      firstName,
      lastName,
      email,
      hashedPassword,
      phoneNumber,
      address,
      gender,
      nationality,
      dateOfBirth,
      image
    ];

    console.log('Executing user insert query...');
    const result = await db.execute(query, values);
    const userId = result[0].insertId;
    console.log('User created with ID:', userId);

    const userRoleQuery = `INSERT INTO userRole (userId, roleId) VALUES (?, ?)`;
    console.log('Assigning role to user...');
    await db.execute(userRoleQuery, [userId, roleId]);
    console.log('Role assigned successfully');

    return { userId, email };
  } catch (error) {
    console.error('Error in createUser:', error);
    throw error;
  }
};

// Version that accepts a connection for transactions
const createUserWithConnection = async (connection, firstName, lastName, email, hashedPassword, phoneNumber, address, gender, nationality, dateOfBirth, image, roleId) => {
  try {
    console.log('Creating user with email:', email);

    const roleExists = await roleModel.validateRoleId(roleId);
    if (!roleExists) {
      throw new Error('Invalid role ID provided');
    }

    const query = `INSERT INTO user (
          firstName, lastName, email, password, phoneNumber,
          address, gender, nationality, dateOfBirth, image
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      firstName,
      lastName,
      email,
      hashedPassword,
      phoneNumber,
      address,
      gender,
      nationality,
      dateOfBirth,
      image
    ];

    console.log('Executing user insert query...');
    const result = await connection.execute(query, values);
    const userId = result[0].insertId;
    console.log('User created with ID:', userId);

    const userRoleQuery = `INSERT INTO userRole (userId, roleId) VALUES (?, ?)`;
    console.log('Assigning role to user...');
    await connection.execute(userRoleQuery, [userId, roleId]);
    console.log('Role assigned successfully');

    return { userId, email };
  } catch (error) {
    console.error('Error in createUserWithConnection:', error);
    throw error;
  }
};

const getUserById = async (userId) => {
  const query = `
    SELECT u.*, r.roleName
    FROM user u
    LEFT JOIN userRole ur ON u.userId = ur.userId
    LEFT JOIN role r ON ur.roleId = r.roleId
    WHERE u.userId = ?
  `;

  const [rows] = await db.execute(query, [userId]);
  return rows[0] || null;
};

const getUserByEmail = async (email) => {
  try {
    console.log('Getting user by email:', email);
    const query = `
      SELECT u.*, r.roleName
      FROM user u
      LEFT JOIN userRole ur ON u.userId = ur.userId
      LEFT JOIN role r ON ur.roleId = r.roleId
      WHERE u.email = ?
    `;

    const [rows] = await db.execute(query, [email]);
    console.log('Query executed successfully, rows found:', rows.length);
    return rows[0] || null;
  } catch (error) {
    console.error('Error in getUserByEmail:', error);
    throw error;
  }
};

const updateUser = async (userId, updateData) => {
  const fields = [];
  const values = [];

  Object.keys(updateData).forEach(key => {
    if (updateData[key] !== undefined && key !== 'userId') {
      fields.push(`${key} = ?`);
      values.push(updateData[key]);
    }
  });

  if (fields.length === 0) {
    throw new Error('No fields to update');
  }

  values.push(userId);

  const query = `UPDATE user SET ${fields.join(', ')} WHERE userId = ?`;
  const result = await db.execute(query, values);

  return result[0].affectedRows > 0;
};

const deleteUser = async (userId) => {
  await db.execute('DELETE FROM userRole WHERE userId = ?', [userId]);

  const result = await db.execute('DELETE FROM user WHERE userId = ?', [userId]);

  return result[0].affectedRows > 0;
};

const getAllUsers = async (limit = 50, offset = 0) => {
  const query = `
    SELECT u.userId, u.firstName, u.lastName, u.email, u.phoneNumber,
           u.address, u.gender, u.nationality, u.dateOfBirth, u.image,
           u.created_at, r.roleName
    FROM user u
    LEFT JOIN userRole ur ON u.userId = ur.userId
    LEFT JOIN role r ON ur.roleId = r.roleId
    ORDER BY u.created_at DESC
    LIMIT ? OFFSET ?
  `;

  const [rows] = await db.execute(query, [limit, offset]);
  return rows;
};

const getUsersCount = async () => {
  const query = 'SELECT COUNT(*) as count FROM user';
  const [rows] = await db.execute(query);
  return rows[0].count;
};

const updateUserRole = async (userId, roleId) => {
  const roleExists = await roleModel.validateRoleId(roleId);
  if (!roleExists) {
    throw new Error('Invalid role ID provided');
  }

  const checkQuery = 'SELECT userRoleId FROM userRole WHERE userId = ?';
  const [existing] = await db.execute(checkQuery, [userId]);

  if (existing.length > 0) {
    const updateQuery = 'UPDATE userRole SET roleId = ? WHERE userId = ?';
    await db.execute(updateQuery, [roleId, userId]);
  } else {
    const insertQuery = 'INSERT INTO userRole (userId, roleId) VALUES (?, ?)';
    await db.execute(insertQuery, [userId, roleId]);
  }

  return true;
};

const comparePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

const getUsersByRole = async (roleName, limit = 50, offset = 0) => {
  const query = `
    SELECT u.userId, u.firstName, u.lastName, u.email, u.phoneNumber,
           u.address, u.gender, u.nationality, u.dateOfBirth, u.image,
           u.created_at, r.roleName
    FROM user u
    INNER JOIN userRole ur ON u.userId = ur.userId
    INNER JOIN role r ON ur.roleId = r.roleId
    WHERE r.roleName = ?
    ORDER BY u.created_at DESC
    LIMIT ? OFFSET ?
  `;

  const [rows] = await db.execute(query, [roleName, limit, offset]);
  return rows;
};

const searchUsers = async (searchTerm, limit = 50, offset = 0) => {
  const query = `
    SELECT u.userId, u.firstName, u.lastName, u.email, u.phoneNumber,
           u.address, u.gender, u.nationality, u.dateOfBirth, u.image,
           u.created_at, r.roleName
    FROM user u
    LEFT JOIN userRole ur ON u.userId = ur.userId
    LEFT JOIN role r ON ur.roleId = r.roleId
    WHERE u.firstName LIKE ? OR u.lastName LIKE ? OR u.email LIKE ?
    ORDER BY u.created_at DESC
    LIMIT ? OFFSET ?
  `;

  const searchPattern = `%${searchTerm}%`;
  const [rows] = await db.execute(query, [searchPattern, searchPattern, searchPattern, limit, offset]);
  return rows;
};

const getUserRole = async (userId) => {
  const query = `
    SELECT r.roleId, r.roleName
    FROM role r
    INNER JOIN userRole ur ON r.roleId = ur.roleId
    WHERE ur.userId = ?
  `;

  const [rows] = await db.execute(query, [userId]);
  return rows[0] || null;
};

const isEmailTaken = async (email, excludeUserId = null) => {
  let query = 'SELECT userId FROM user WHERE email = ?';
  let params = [email];

  if (excludeUserId) {
    query += ' AND userId != ?';
    params.push(excludeUserId);
  }

  const [rows] = await db.execute(query, params);
  return rows.length > 0;
};

const updateUserPassword = async (userId, newPassword) => {
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

  const query = 'UPDATE user SET password = ? WHERE userId = ?';
  const result = await db.execute(query, [hashedPassword, userId]);

  return result[0].affectedRows > 0;
};

export default {
  createUser,
  createUserWithConnection,
  getUserById,
  getUserByEmail,
  updateUser,
  deleteUser,
  getAllUsers,
  getUsersCount,
  updateUserRole,
  comparePassword,
  getUsersByRole,
  searchUsers,
  getUserRole,
  isEmailTaken,
  updateUserPassword
};






















