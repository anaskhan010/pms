import express from 'express';
import roleController from '../../controllers/role/roleController.js';
import { protect, requireResourcePermission, smartAuthorize, adminOnly } from '../../middleware/auth.js';
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

router.get('/statistics', smartAuthorize('roles', 'view'), roleController.getRoleStatistics);

router.route('/')
  .get(smartAuthorize('roles', 'view'), roleController.getAllRoles)
  .post(smartAuthorize('roles', 'create'), validateRoleCreation, handleValidationErrors, roleController.createRole);

router.route('/:id')
  .get(smartAuthorize('roles', 'view'), validateRoleId, handleValidationErrors, roleController.getRoleById)
  .put(smartAuthorize('roles', 'update'), validateRoleId, validateRoleUpdate, handleValidationErrors, roleController.updateRole)
  .delete(smartAuthorize('roles', 'delete'), validateRoleId, handleValidationErrors, roleController.deleteRole);

router.get('/:id/users', smartAuthorize('roles', 'view'), validateRoleId, handleValidationErrors, roleController.getUsersByRole);
router.get('/:id/validate', validateRoleId, handleValidationErrors, roleController.validateRole);

export default router;
