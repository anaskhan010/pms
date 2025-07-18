import express from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getAllRoles,
  upload
} from '../../controllers/user/userController.js';
import { protect, requireResourcePermission, smartAuthorize, getUserAccess } from '../../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Apply user access filtering middleware for ownership-based isolation
router.use(getUserAccess);

// GET /api/users - Get all users with pagination (with data filtering)
router.get('/', smartAuthorize('users', 'view_own'), getAllUsers);

// GET /api/users/roles - Get all roles for dropdown (with data filtering)
router.get('/roles', smartAuthorize('users', 'view_own'), getAllRoles);

// GET /api/users/:id - Get user by ID (with data filtering)
router.get('/:id', smartAuthorize('users', 'view_own'), getUserById);

// POST /api/users - Create new user (with image upload and data filtering)
router.post('/', smartAuthorize('users', 'create'), upload.single('image'), createUser);

// PUT /api/users/:id - Update user (with image upload and data filtering)
router.put('/:id', smartAuthorize('users', 'update'), upload.single('image'), updateUser);

// DELETE /api/users/:id - Delete user (with data filtering)
router.delete('/:id', smartAuthorize('users', 'delete'), deleteUser);

export default router;
