const express = require('express');
const {
  getUnits,
  getUnit,
  createUnit,
  updateUnit,
  deleteUnit,
  getUnitDetails,
  updateUnitStatus,
  getUnitByTenantId
} = require('../../controllers/property/unitController');

const { protect, authorize } = require('../../middleware/auth');
const { 
  validateUnit, 
  validateId, 
  handleValidationErrors 
} = require('../../middleware/validation');

const router = express.Router();

router.use(protect);

router
  .route('/create-unit')
  .post(authorize('admin', 'manager'), validateUnit, handleValidationErrors, createUnit);

router.get("/get-all-units",getUnits)

router.get("/get-unit-by-tenantId/:tenant_id",getUnitByTenantId)


router
  .route('/:id')
  .get(validateId, handleValidationErrors, getUnit)
  .put(authorize('admin', 'manager'), validateId, validateUnit, handleValidationErrors, updateUnit)
  .delete(authorize('admin'), validateId, handleValidationErrors, deleteUnit);

router
  .route('/:id/details')
  .get(validateId, handleValidationErrors, getUnitDetails);

router
  .route('/:id/status')
  .put(authorize('admin', 'manager'), validateId, handleValidationErrors, updateUnitStatus);

module.exports = router;
