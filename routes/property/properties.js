const express = require('express');
const {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  getPropertyUnits,
  getPropertyStatistics
} = require('../controllers/propertyController');

const { protect, authorize } = require('../middleware/auth');
const { 
  validateProperty, 
  validateId, 
  handleValidationErrors 
} = require('../middleware/validation');

const router = express.Router();

// All routes are protected
router.use(protect);

router
  .route('/')
  .get(getProperties)
  .post(authorize('admin', 'manager'), validateProperty, handleValidationErrors, createProperty);

router
  .route('/:id')
  .get(validateId, handleValidationErrors, getProperty)
  .put(authorize('admin', 'manager'), validateId, validateProperty, handleValidationErrors, updateProperty)
  .delete(authorize('admin'), validateId, handleValidationErrors, deleteProperty);

router
  .route('/:id/units')
  .get(validateId, handleValidationErrors, getPropertyUnits);

router
  .route('/:id/statistics')
  .get(validateId, handleValidationErrors, getPropertyStatistics);

module.exports = router;
