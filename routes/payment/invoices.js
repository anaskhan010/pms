const express = require('express');
const {
  getInvoices,
  getInvoice,
  getInvoiceByNumber,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  getInvoiceDetails,
  getInvoicePayments,
  markInvoiceAsPaid,
  generateRecurringInvoices,
  updateInvoiceStatus
} = require('../../controllers/payment/invoiceController');

const { protect, authorize } = require('../../middleware/auth');
const { 
  validateId, 
  handleValidationErrors 
} = require('../../middleware/validation');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getInvoices)
  .post(authorize('admin', 'manager'), createInvoice);

router
  .route('/number/:invoiceNumber')
  .get(getInvoiceByNumber);

router
  .route('/generate-recurring/:contractId')
  .post(authorize('admin', 'manager'), validateId, handleValidationErrors, generateRecurringInvoices);

router
  .route('/:id')
  .get(validateId, handleValidationErrors, getInvoice)
  .put(authorize('admin', 'manager'), validateId, handleValidationErrors, updateInvoice)
  .delete(authorize('admin'), validateId, handleValidationErrors, deleteInvoice);

router
  .route('/:id/details')
  .get(validateId, handleValidationErrors, getInvoiceDetails);

router
  .route('/:id/payments')
  .get(validateId, handleValidationErrors, getInvoicePayments);

router
  .route('/:id/mark-paid')
  .put(authorize('admin', 'manager'), validateId, handleValidationErrors, markInvoiceAsPaid);

router
  .route('/:id/status')
  .put(authorize('admin', 'manager'), validateId, handleValidationErrors, updateInvoiceStatus);

module.exports = router;
