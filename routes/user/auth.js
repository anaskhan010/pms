import express from 'express';
import authController from '../../controllers/user/authController.js';
import { protect, requireResourcePermission } from '../../middleware/auth.js';
import { uploadUserImage, handleUploadError } from '../../middleware/upload.js';
import {
  validateUserRegistration,
  validateUserLogin,
  handleValidationErrors
} from '../../middleware/validation.js';

const router = express.Router();

router.post('/register',
  uploadUserImage,
  handleUploadError,
  authController.register
);

router.post('/login',
  validateUserLogin,
  handleValidationErrors,
  authController.login
);

router.post('/forgotpassword', authController.forgotPassword);
router.put('/resetpassword/:resettoken', authController.resetPassword);

router.get('/logout', authController.logout);
router.get('/me', protect, authController.getMe);

router.put('/updatedetails',
  protect,
  uploadUserImage,
  handleUploadError,
  authController.updateDetails
);

router.put('/updatepassword', protect, authController.updatePassword);

router.route('/users')
  .get(protect, requireResourcePermission('users', 'view'), authController.getAllUsers)
  .post(protect, requireResourcePermission('users', 'create'), uploadUserImage, handleUploadError, authController.createUser);

router.route('/users/:id')
  .get(protect, requireResourcePermission('users', 'view'), authController.getUserById)
  .put(protect, requireResourcePermission('users', 'update'), uploadUserImage, handleUploadError, authController.updateUser)
  .delete(protect, requireResourcePermission('users', 'delete'), authController.deleteUser);

export default router;
