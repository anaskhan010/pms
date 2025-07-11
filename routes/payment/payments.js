const express = require('express');
const {
  getPayments,
  getPayment,
  createPayment,
  updatePayment,
  deletePayment,
  getPaymentDetails,
  getTenantPaymentStats,
  getMonthlyPaymentSummary,
  processRefund
} = require('../../controllers/payment/paymentController');

const { protect, authorize } = require('../../middleware/auth');
const { 
  validatePayment,
  validateId, 
  handleValidationErrors 
} = require('../../middleware/validation');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getPayments)
  .post(authorize('admin', 'manager'), validatePayment, handleValidationErrors, createPayment);

router
  .route('/monthly-summary')
  .get(authorize('admin', 'manager'), getMonthlyPaymentSummary);

router
  .route('/tenant/:tenantId/stats')
  .get(validateId, handleValidationErrors, getTenantPaymentStats);

router
  .route('/:id')
  .get(validateId, handleValidationErrors, getPayment)
  .put(authorize('admin', 'manager'), validateId, validatePayment, handleValidationErrors, updatePayment)
  .delete(authorize('admin'), validateId, handleValidationErrors, deletePayment);

router
  .route('/:id/details')
  .get(validateId, handleValidationErrors, getPaymentDetails);

router
  .route('/:id/refund')
  .post(authorize('admin'), validateId, handleValidationErrors, processRefund);

module.exports = router;
