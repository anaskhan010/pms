import userModel from '../../models/user/User.js';
import roleModel from '../../models/role/Role.js';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for user image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'public/uploads/users';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'image-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get all users with pagination
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    console.log('Fetching users with params:', { page, limit, offset });

    const users = await userModel.getAllUsers(limit, offset);
    const totalUsers = await userModel.getUsersCount();
    const totalPages = Math.ceil(totalUsers / limit);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.getUserById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user'
    });
  }
};

// Create new user
const createUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      address,
      gender,
      nationality,
      dateOfBirth,
      roleId
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !phoneNumber || !roleId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Check if email already exists
    const existingUser = await userModel.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }

    // Validate role
    const roleExists = await roleModel.validateRoleId(roleId);
    if (!roleExists) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role ID'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Handle image upload
    let imagePath = '';
    if (req.file) {
      imagePath = `/public/uploads/users/${req.file.filename}`;
    }

    // Create user
    const result = await userModel.createUser(
      firstName,
      lastName,
      email,
      hashedPassword,
      phoneNumber,
      address || '',
      gender || '',
      nationality || '',
      dateOfBirth || null,
      imagePath,
      roleId
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        userId: result.userId,
        email: result.email
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create user'
    });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      address,
      gender,
      nationality,
      dateOfBirth,
      roleId
    } = req.body;

    // Check if user exists
    const existingUser = await userModel.getUserById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if email is taken by another user
    if (email && email !== existingUser.email) {
      const emailTaken = await userModel.isEmailTaken(email, id);
      if (emailTaken) {
        return res.status(400).json({
          success: false,
          error: 'Email already exists'
        });
      }
    }

    // Validate role if provided
    if (roleId) {
      const roleExists = await roleModel.validateRoleId(roleId);
      if (!roleExists) {
        return res.status(400).json({
          success: false,
          error: 'Invalid role ID'
        });
      }
    }

    // Handle image upload
    let imagePath = existingUser.image;
    if (req.file) {
      // Delete old image if exists
      if (existingUser.image && fs.existsSync(existingUser.image.replace('/public', 'public'))) {
        fs.unlinkSync(existingUser.image.replace('/public', 'public'));
      }
      imagePath = `/public/uploads/users/${req.file.filename}`;
    }

    // Update user
    const success = await userModel.updateUser(id, {
      firstName: firstName || existingUser.firstName,
      lastName: lastName || existingUser.lastName,
      email: email || existingUser.email,
      phoneNumber: phoneNumber || existingUser.phoneNumber,
      address: address !== undefined ? address : existingUser.address,
      gender: gender !== undefined ? gender : existingUser.gender,
      nationality: nationality !== undefined ? nationality : existingUser.nationality,
      dateOfBirth: dateOfBirth !== undefined ? dateOfBirth : existingUser.dateOfBirth,
      image: imagePath
    });

    if (!success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update user'
      });
    }

    // Update role if provided
    if (roleId && roleId !== existingUser.roleId) {
      await userModel.updateUserRole(id, roleId);
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user'
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const existingUser = await userModel.getUserById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Delete user image if exists
    if (existingUser.image && fs.existsSync(existingUser.image.replace('/public', 'public'))) {
      fs.unlinkSync(existingUser.image.replace('/public', 'public'));
    }

    // Delete user
    const success = await userModel.deleteUser(id);
    if (!success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to delete user'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user'
    });
  }
};

// Get all roles for dropdown
const getAllRoles = async (req, res) => {
  try {
    const roles = await roleModel.getAllRoles();
    res.status(200).json({
      success: true,
      data: roles
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch roles'
    });
  }
};

export {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getAllRoles,
  upload
};
