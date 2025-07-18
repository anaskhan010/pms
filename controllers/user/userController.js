import userModel from '../../models/user/User.js';
import roleModel from '../../models/role/Role.js';
import db from '../../config/db.js';
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

// Get all users with pagination (HIERARCHICAL)
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const roleId = req.query.roleId ? parseInt(req.query.roleId) : null;

    console.log(`🔍 HIERARCHICAL getAllUsers called by user ${req.user.userId} (role: ${req.user.roleId})`);

    let users, totalUsers;

    if (req.user.roleId === 1) {
      // Admin can see all users
      console.log('Admin user - showing all users');
      if (roleId) {
        users = await userModel.getUsersByRoleId(roleId, limit, offset);
        totalUsers = await userModel.getUsersCountByRole(roleId);
      } else {
        users = await userModel.getAllUsers(limit, offset);
        totalUsers = await userModel.getUsersCount();
      }
    } else {
      // Owner/Manager user - showing only users created by them + themselves
      console.log(`Owner/Manager user - showing only users created by ${req.user.userId}`);
      users = await userModel.getUsersByCreator(req.user.userId, limit, offset, roleId);
      totalUsers = await userModel.getUsersCountByCreator(req.user.userId, roleId);
    }

    console.log(`✅ Retrieved ${users.length} users (total: ${totalUsers})`);

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

// Get user by ID (HIERARCHICAL)
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

    // Check hierarchical permissions for non-admin users
    if (req.user.roleId !== 1) {
      // Owner can only view users they created or themselves
      if (user.createdBy !== req.user.userId && user.userId !== req.user.userId) {
        return res.status(403).json({
          success: false,
          error: 'You can only view users you created or your own profile'
        });
      }
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

// Create new user (HIERARCHICAL)
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

    console.log(`🔧 User ${req.user.userId} (role: ${req.user.roleId}) attempting to create user with role ${roleId}`);

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

    // Check hierarchical permissions for role creation
    if (req.user.roleId !== 1) { // Not admin
      // Owner can only create staff roles (3, 4, 5, 6) + custom roles they created
      if (roleId === 1 || roleId === 2) {
        return res.status(403).json({
          success: false,
          error: 'You do not have permission to create admin or owner users'
        });
      }

      // Check if it's a custom role created by this owner
      if (roleId > 6) {
        const [customRole] = await db.execute(`
          SELECT roleId, roleName FROM role
          WHERE roleId = ? AND roleName LIKE ?
        `, [roleId, `owner_${req.user.userId}_%`]);

        if (customRole.length === 0) {
          return res.status(403).json({
            success: false,
            error: 'You can only assign roles you have created or standard staff roles'
          });
        }
      }
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Handle image upload
    let imagePath = '';
    if (req.file) {
      imagePath = `/public/uploads/users/${req.file.filename}`;
    }

    // Create user with createdBy tracking
    const result = await userModel.createUserWithCreator(
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
      roleId,
      req.user.userId // Track who created this user
    );

    console.log(`✅ User created successfully: ${result.userId} by ${req.user.userId}`);

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

// Update user (HIERARCHICAL)
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

    console.log(`🔧 User ${req.user.userId} attempting to update user ${id}`);

    // Check if user exists
    const existingUser = await userModel.getUserById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check hierarchical permissions
    if (req.user.roleId !== 1) { // Not admin
      // Owner can only update users they created or themselves
      if (existingUser.createdBy !== req.user.userId && existingUser.userId !== req.user.userId) {
        return res.status(403).json({
          success: false,
          error: 'You can only update users you created or your own profile'
        });
      }

      // Prevent owners from changing their own role or other users to admin/owner
      if (roleId) {
        // If updating role
        if ((existingUser.userId === req.user.userId && roleId !== req.user.roleId) ||
            (roleId === 1 || roleId === 2)) {
          return res.status(403).json({
            success: false,
            error: 'You cannot change your own role or set other users to admin/owner roles.'
          });
        }
      }
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

// Delete user (HIERARCHICAL)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🗑️ User ${req.user.userId} attempting to delete user ${id}`);

    // Check if user exists
    const existingUser = await userModel.getUserById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check hierarchical permissions
    if (req.user.roleId !== 1) { // Not admin
      // Owner can only delete users they created (not themselves)
      if (existingUser.createdBy !== req.user.userId) {
        return res.status(403).json({
          success: false,
          error: 'You can only delete users you created'
        });
      }

      // Prevent owners from deleting themselves
      if (existingUser.userId === req.user.userId) {
        return res.status(403).json({
          success: false,
          error: 'You cannot delete your own account'
        });
      }

      // Prevent owners from deleting admin or owner users
      if (existingUser.roleId === 1 || existingUser.roleId === 2) {
        return res.status(403).json({
          success: false,
          error: 'You cannot delete admin or owner users'
        });
      }
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

    console.log(`✅ User ${id} deleted successfully by ${req.user.userId}`);

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

// Get all roles for dropdown (HIERARCHICAL)
const getAllRoles = async (req, res) => {
  try {
    console.log(`🔍 getAllRoles called by user ${req.user.userId} (role: ${req.user.roleId})`);

    // Use the new getManageableRoles function
    const roles = await roleModel.getManageableRoles(req.user.userId, req.user.roleId);

    console.log(`✅ User can see ${roles.length} manageable roles`);

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
