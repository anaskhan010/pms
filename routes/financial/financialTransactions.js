import express from 'express';
import {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  processRentPayment,
  getTransactionStatistics,
  getTenantPaymentHistory,
  getApartmentPaymentHistory
} from '../../controllers/financial/financialTransactionController.js';
import { protect, adminOnly, adminAndManager, adminAndOwner, getOwnerBuildings } from '../../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// Basic CRUD routes
router.route('/')
  .get(adminAndOwner, getOwnerBuildings, getTransactions)
  .post(adminAndOwner, getOwnerBuildings, createTransaction);

router.route('/:id')
  .get(adminAndOwner, getOwnerBuildings, getTransaction)
  .put(adminAndOwner, getOwnerBuildings, updateTransaction)
  .delete(adminOnly, deleteTransaction);

// Special routes
router.post('/rent-payment', adminAndOwner, getOwnerBuildings, processRentPayment);
router.get('/statistics', adminAndOwner, getOwnerBuildings, getTransactionStatistics);
router.get('/tenant/:tenantId/history', adminAndOwner, getOwnerBuildings, getTenantPaymentHistory);
router.get('/apartment/:apartmentId/history', adminAndOwner, getOwnerBuildings, getApartmentPaymentHistory);

export default router;
