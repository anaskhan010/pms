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
import { protect, requireResourcePermission } from '../../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// GET /api/users - Get all users with pagination
router.get('/', requireResourcePermission('users', 'view'), getAllUsers);

// GET /api/users/roles - Get all roles for dropdown
router.get('/roles', requireResourcePermission('users', 'view'), getAllRoles);

// GET /api/users/:id - Get user by ID
router.get('/:id', requireResourcePermission('users', 'view'), getUserById);

// POST /api/users - Create new user (with image upload)
router.post('/', requireResourcePermission('users', 'create'), upload.single('image'), createUser);

// PUT /api/users/:id - Update user (with image upload)
router.put('/:id', upload.single('image'), updateUser);

// DELETE /api/users/:id - Delete user
router.delete('/:id', deleteUser);

export default router;
