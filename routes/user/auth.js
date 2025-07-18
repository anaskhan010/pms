import express from 'express';
import authController from '../../controllers/user/authController.js';
import { protect, requireResourcePermission, smartAuthorize } from '../../middleware/auth.js';
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
  .get(protect, smartAuthorize('users', 'view'), authController.getAllUsers)
  .post(protect, smartAuthorize('users', 'create'), uploadUserImage, handleUploadError, authController.createUser);

router.route('/users/:id')
  .get(protect, smartAuthorize('users', 'view'), authController.getUserById)
  .put(protect, smartAuthorize('users', 'update'), uploadUserImage, handleUploadError, authController.updateUser)
  .delete(protect, smartAuthorize('users', 'delete'), authController.deleteUser);

export default router;
