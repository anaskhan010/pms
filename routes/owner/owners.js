const express = require('express');
const {
  getOwners,
  getOwner,
  createOwner,
  updateOwner,
  deleteOwner,
  getOwnerProperties,
  getOwnerUnits,
  getOwnerContracts,
  getOwnerFinancialSummary
} = require('../../controllers/owner/ownerController');

const { protect, authorize } = require('../../middleware/auth');
const { 
  validateId, 
  handleValidationErrors 
} = require('../../middleware/validation');

const router = express.Router();

// All routes are protected
router.use(protect);

router
  .route('/')
  .get(getOwners)
  .post(authorize('admin', 'manager'), createOwner);

router
  .route('/:id')
  .get(validateId, handleValidationErrors, getOwner)
  .put(authorize('admin', 'manager'), validateId, handleValidationErrors, updateOwner)
  .delete(authorize('admin'), validateId, handleValidationErrors, deleteOwner);

router
  .route('/:id/properties')
  .get(validateId, handleValidationErrors, getOwnerProperties);

router
  .route('/:id/units')
  .get(validateId, handleValidationErrors, getOwnerUnits);

router
  .route('/:id/contracts')
  .get(validateId, handleValidationErrors, getOwnerContracts);

router
  .route('/:id/financial-summary')
  .get(validateId, handleValidationErrors, getOwnerFinancialSummary);

module.exports = router;
