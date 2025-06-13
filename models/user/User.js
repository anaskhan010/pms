
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const db = require('../../config/db');



const findByEmail = async (email) => {
  const sql = 'SELECT * FROM Users WHERE email = ?';
  const [rows] = await db.execute(sql, [email]);
  console.log('Email search result:', rows);
  console.log('Rows length:', rows.length);

  // Check if any rows were returned
  if (rows.length > 0) {
    const user = rows[0];
    // Attach methods to user object
    user.getSignedJwtToken = () => getSignedJwtToken(user.user_id);
    user.matchPassword = (enteredPassword) => matchPassword(enteredPassword, user.password);
    user.updateLastLogin = () => updateLastLogin(user.user_id);
    return user;
  }
  return null;
};

const findByUsername = async (username) => {
  const sql = 'SELECT * FROM Users WHERE username = ?';
  const [rows] = await db.execute(sql, [username]);
  console.log('Username search result:', rows);
  console.log('Rows length:', rows.length);

  // Check if any rows were returned
  if (rows.length > 0) {
    const user = rows[0];
    // Attach methods to user object
    user.getSignedJwtToken = () => getSignedJwtToken(user.user_id);
    user.matchPassword = (enteredPassword) => matchPassword(enteredPassword, user.password);
    user.updateLastLogin = () => updateLastLogin(user.user_id);
    return user;
  }
  return null;
};

// Generate JWT token for user
const getSignedJwtToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Compare password
const matchPassword = async (enteredPassword, hashedPassword) => {
  return await bcrypt.compare(enteredPassword, hashedPassword);
};

// Find user by ID
const findById = async (id) => {
  const sql = 'SELECT * FROM Users WHERE user_id = ?';
  const [rows] = await db.execute(sql, [id]);

  if (rows.length > 0) {
    const user = rows[0];
    // Attach methods to user object
    user.getSignedJwtToken = () => getSignedJwtToken(user.user_id);
    user.matchPassword = (enteredPassword) => matchPassword(enteredPassword, user.password);
    user.updateLastLogin = () => updateLastLogin(user.user_id);
    return user;
  }
  return null;
};

// Update last login
const updateLastLogin = async (userId) => {
  const sql = 'UPDATE Users SET last_login = NOW() WHERE user_id = ?';
  await db.execute(sql, [userId]);
};

// Create user with proper structure
const createUser = async (userData) => {
  const hashedPassword = await bcrypt.hash(userData.password, 12);

  const sql = `
    INSERT INTO Users (
       username, email, password, role
    ) VALUES (?, ?, ?, ?)
  `;

  const values = [
    userData.username,
    userData.email,
    hashedPassword,
    userData.role,
  
  ];

  const result = await db.execute(sql, values);
  
  // Fix: Access insertId from the first element of the result array
  const userId = result[0].insertId; 

 

  // Return user with getSignedJwtToken function attached
  const user = await findById(userId);
  
  if (user) {
    user.getSignedJwtToken = () => getSignedJwtToken(user.user_id);
    user.matchPassword = (enteredPassword) => matchPassword(enteredPassword, user.password);
    user.updateLastLogin = () => updateLastLogin(user.user_id);
  }

  return user; // Return the user object instead of result
};

module.exports = {
  
  createUser,
  findByEmail,
  findByUsername,
  findById,
  getSignedJwtToken,
  matchPassword,
  updateLastLogin
};

