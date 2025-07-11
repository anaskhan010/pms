const express = require('express');
const {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  getPropertyUnits,
  getPropertyStatistics,
  getPropertiesByTenant,
  getOverallPropertyStatistics,
  bulkPropertyOperations,
  exportProperties,
  getOccupancyAnalytics
} = require('../../controllers/property/propertyController');

const { protect, authorize } = require('../../middleware/auth');
const {
  validateProperty,
  validateId,
  handleValidationErrors
} = require('../../middleware/validation');
const { propertyCache, cacheInvalidation } = require('../../middleware/cache');
const { validate, propertySchemas } = require('../../utils/validation');

const router = express.Router();

router.use(protect);

router
  .route('/statistics')
  .get(authorize('admin', 'manager'), getOverallPropertyStatistics);

router
  .route('/analytics/occupancy')
  .get(authorize('admin', 'manager'), getOccupancyAnalytics);

router
  .route('/bulk')
  .post(authorize('admin', 'manager'), bulkPropertyOperations);

router
  .route('/export')
  .get(authorize('admin', 'manager'), validate(propertySchemas.query, 'query'), exportProperties);

router
  .route('/create-property')
  .post(authorize('admin', 'manager'), validate(propertySchemas.create), cacheInvalidation(['property:']), createProperty);

router
  .route('/get-all-properties-by-tenant/:tenantId')
  .get(validateId, propertyCache(600), getPropertiesByTenant);



router.get("/get-all-properties",getProperties)
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
