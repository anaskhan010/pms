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
import { protect, adminOnly } from '../../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);
router.use(adminOnly);

// GET /api/users - Get all users with pagination
router.get('/', getAllUsers);

// GET /api/users/roles - Get all roles for dropdown
router.get('/roles', getAllRoles);

// GET /api/users/:id - Get user by ID
router.get('/:id', getUserById);

// POST /api/users - Create new user (with image upload)
router.post('/', upload.single('image'), createUser);

// PUT /api/users/:id - Update user (with image upload)
router.put('/:id', upload.single('image'), updateUser);

// DELETE /api/users/:id - Delete user
router.delete('/:id', deleteUser);

export default router;
