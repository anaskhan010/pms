const express = require('express');
const {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  getPropertyUnits,
  getPropertyStatistics,
  getPropertiesByTenant
} = require('../../controllers/property/propertyController');

const { protect, authorize } = require('../../middleware/auth');
const { 
  validateProperty, 
  validateId, 
  handleValidationErrors 
} = require('../../middleware/validation');

const router = express.Router();

// All routes are protected
router.use(protect);

router
  .route('/create-property')
  .get(getProperties)
  .post(authorize('admin', 'manager'), validateProperty, handleValidationErrors, createProperty);

  // get all properties by tenant_id
  router
  .route('/get-all-properties-by-tenant/:tenantId')
  .get(validateId, getPropertiesByTenant);


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
