import express from 'express';
import {
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
} from '../../controllers/contract/contractController.js';

import { protect, authorize } from '../../middleware/auth.js';
import {
  validateContract,
  validateId,
  handleValidationErrors
} from '../../middleware/validation.js';

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

export default router;
