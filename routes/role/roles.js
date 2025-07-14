import express from 'express';
import roleController from '../../controllers/role/roleController.js';
import { protect, requireResourcePermission, adminOnly } from '../../middleware/auth.js';
import { body, param, validationResult } from 'express-validator';
import ErrorResponse from '../../utils/errorResponse.js';

const router = express.Router();

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return next(new ErrorResponse(errorMessages.join(', '), 400));
  }
  next();
};

const validateRoleCreation = [
  body('roleName')
    .notEmpty()
    .withMessage('Role name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Role name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z_]+$/)
    .withMessage('Role name can only contain letters and underscores')
];

const validateRoleUpdate = [
  body('roleName')
    .notEmpty()
    .withMessage('Role name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Role name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z_]+$/)
    .withMessage('Role name can only contain letters and underscores')
];

const validateRoleId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Role ID must be a positive integer')
];

router.use(protect);

router.get('/statistics', requireResourcePermission('roles', 'view'), roleController.getRoleStatistics);

router.route('/')
  .get(requireResourcePermission('roles', 'view'), roleController.getAllRoles)
  .post(requireResourcePermission('roles', 'create'), validateRoleCreation, handleValidationErrors, roleController.createRole);

router.route('/:id')
  .get(requireResourcePermission('roles', 'view'), validateRoleId, handleValidationErrors, roleController.getRoleById)
  .put(requireResourcePermission('roles', 'update'), validateRoleId, validateRoleUpdate, handleValidationErrors, roleController.updateRole)
  .delete(requireResourcePermission('roles', 'delete'), validateRoleId, handleValidationErrors, roleController.deleteRole);

router.get('/:id/users', requireResourcePermission('roles', 'view'), validateRoleId, handleValidationErrors, roleController.getUsersByRole);
router.get('/:id/validate', validateRoleId, handleValidationErrors, roleController.validateRole);

export default router;
