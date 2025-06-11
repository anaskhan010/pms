const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');

class User {
  constructor(userData) {
    this.user_id = userData.user_id;
    this.username = userData.username;
    this.email = userData.email;
    this.password = userData.password;
    this.role = userData.role;
    this.first_name = userData.first_name;
    this.last_name = userData.last_name;
    this.phone_number = userData.phone_number;
    this.is_active = userData.is_active;
    this.last_login = userData.last_login;
    this.created_at = userData.created_at;
    this.updated_at = userData.updated_at;
  }

  // Create a new user
  static async create(userData) {
    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    const sql = `
      INSERT INTO Users (
        user_id, username, email, password, role, first_name, last_name,
        phone_number, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const values = [
      userId,
      userData.username,
      userData.email,
      hashedPassword,
      userData.role,
      userData.first_name || null,
      userData.last_name || null,
      userData.phone_number || null,
      userData.is_active !== undefined ? userData.is_active : true
    ];

    await db.query(sql, values);
    return await User.findById(userId);
  }

  // Find user by ID
  static async findById(id) {
    const sql = 'SELECT * FROM Users WHERE user_id = ?';
    const [user] = await db.query(sql, [id]);
    return user ? new User(user) : null;
  }

  // Find user by email
  static async findByEmail(email) {
    const sql = 'SELECT * FROM Users WHERE email = ?';
    const [user] = await db.query(sql, [email]);
    return user ? new User(user) : null;
  }

  // Find user by username
  static async findByUsername(username) {
    const sql = 'SELECT * FROM Users WHERE username = ?';
    const [user] = await db.query(sql, [username]);
    return user ? new User(user) : null;
  }

  // Get all users with pagination
  static async findAll(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    let sql = 'SELECT * FROM Users WHERE 1=1';
    let countSql = 'SELECT COUNT(*) as total FROM Users WHERE 1=1';
    const values = [];

    // Apply filters
    if (filters.role) {
      sql += ' AND role = ?';
      countSql += ' AND role = ?';
      values.push(filters.role);
    }

    if (filters.is_active !== undefined) {
      sql += ' AND is_active = ?';
      countSql += ' AND is_active = ?';
      values.push(filters.is_active);
    }

    if (filters.search) {
      sql += ' AND (username LIKE ? OR email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)';
      countSql += ' AND (username LIKE ? OR email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      values.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    values.push(limit, offset);

    const [totalResult] = await db.query(countSql, values.slice(0, -2));
    const users = await db.query(sql, values);

    return {
      users: users.map(user => new User(user)),
      total: totalResult.total,
      page,
      pages: Math.ceil(totalResult.total / limit)
    };
  }

  // Update user
  async update(updateData) {
    const allowedFields = ['username', 'email', 'first_name', 'last_name', 'phone_number', 'is_active', 'role'];
    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    updates.push('updated_at = NOW()');
    values.push(this.user_id);

    const sql = `UPDATE Users SET ${updates.join(', ')} WHERE user_id = ?`;
    await db.query(sql, values);

    // Return updated user
    return await User.findById(this.user_id);
  }

  // Update password
  async updatePassword(newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const sql = 'UPDATE Users SET password = ?, updated_at = NOW() WHERE user_id = ?';
    await db.query(sql, [hashedPassword, this.user_id]);
  }

  // Update last login
  async updateLastLogin() {
    const sql = 'UPDATE Users SET last_login = NOW() WHERE user_id = ?';
    await db.query(sql, [this.user_id]);
  }

  // Delete user (soft delete by setting is_active to false)
  async delete() {
    const sql = 'UPDATE Users SET is_active = false, updated_at = NOW() WHERE user_id = ?';
    await db.query(sql, [this.user_id]);
  }

  // Hard delete user
  async hardDelete() {
    const sql = 'DELETE FROM Users WHERE user_id = ?';
    await db.query(sql, [this.user_id]);
  }

  // Compare password
  async matchPassword(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  }

  // Generate JWT token
  getSignedJwtToken() {
    return jwt.sign({ id: this.user_id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });
  }

  // Get user without password
  toJSON() {
    const user = { ...this };
    delete user.password;
    return user;
  }

  // Check if user has permission
  hasPermission(permission) {
    const rolePermissions = {
      super_admin: ['*'],
      admin: ['read', 'write', 'delete', 'manage_users'],
      manager: ['read', 'write', 'manage_tenants', 'manage_contracts'],
      owner: ['read', 'write_own', 'manage_own_properties'],
      tenant: ['read_own', 'create_tickets']
    };

    const userPermissions = rolePermissions[this.role] || [];
    return userPermissions.includes('*') || userPermissions.includes(permission);
  }
}

module.exports = User;
