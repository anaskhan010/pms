const express = require('express');
const {
  getContracts,
  getContract,
  createContract,
  updateContract,
  deleteContract,
  getContractDetails,
  getContractInvoices,
  getContractPayments,
  updateContractStatus,
  renewContract
} = require('../../controllers/contract/contractController');

const { protect, authorize } = require('../../middleware/auth');
const { 
  validateContract,
  validateId, 
  handleValidationErrors 
} = require('../../middleware/validation');

const router = express.Router();

router.use(protect);

router
  .route('/create-contract')
  .post(authorize('admin', 'manager'), validateContract, handleValidationErrors, createContract);

router.get("/get-all-contracts",validateId,getContracts)

router
  .route('/:id')
  .get(validateId, handleValidationErrors, getContract)
  .put(authorize('admin', 'manager'), validateId, validateContract, handleValidationErrors, updateContract)
  .delete(authorize('admin'), validateId, handleValidationErrors, deleteContract);

router
  .route('/:id/details')
  .get(validateId, handleValidationErrors, getContractDetails);

router
  .route('/:id/invoices')
  .get(validateId, handleValidationErrors, getContractInvoices);

router
  .route('/:id/payments')
  .get(validateId, handleValidationErrors, getContractPayments);

router
  .route('/:id/status')
  .put(authorize('admin', 'manager'), validateId, handleValidationErrors, updateContractStatus);

router
  .route('/:id/renew')
  .post(authorize('admin', 'manager'), validateId, handleValidationErrors, renewContract);

module.exports = router;
