const express = require('express');
const {
  getTenants,
  getTenant,
  createTenant,
  updateTenant,
  deleteTenant,
  getTenantContracts,
  getTenantActiveContracts,
  getTenantPayments,
  getTenantTickets
} = require('../../controllers/tenant/tenantController');

const { protect, authorize } = require('../../middleware/auth');
const { 
  validateTenant,
  validateId, 
  handleValidationErrors 
} = require('../../middleware/validation');

const router = express.Router();

// All routes are protected
router.use(protect);

router
  .route('/')
  .get(getTenants)
  .post(authorize('admin', 'manager'), validateTenant, handleValidationErrors, createTenant);

router
  .route('/:id')
  .get(validateId, handleValidationErrors, getTenant)
  .put(authorize('admin', 'manager'), validateId, validateTenant, handleValidationErrors, updateTenant)
  .delete(authorize('admin'), validateId, handleValidationErrors, deleteTenant);

router
  .route('/:id/contracts')
  .get(validateId, handleValidationErrors, getTenantContracts);

router
  .route('/:id/active-contracts')
  .get(validateId, handleValidationErrors, getTenantActiveContracts);

router
  .route('/:id/payments')
  .get(validateId, handleValidationErrors, getTenantPayments);

router
  .route('/:id/tickets')
  .get(validateId, handleValidationErrors, getTenantTickets);

module.exports = router;
