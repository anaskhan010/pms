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
import {
  protect,
  requireResourcePermission,
  smartAuthorize,
  getTransactionAccess,
  validateResourceOwnership
} from '../../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// Basic CRUD routes
router.route('/')
  .get(smartAuthorize('transactions', 'view'), getTransactionAccess, getTransactions)
  .post(smartAuthorize('transactions', 'create'), getTransactionAccess, createTransaction);

router.route('/:id')
  .get(smartAuthorize('transactions', 'view'), getTransactionAccess, getTransaction)
  .put(smartAuthorize('transactions', 'update'), validateResourceOwnership('transactions'), updateTransaction)
  .delete(requireResourcePermission('transactions', 'delete'), deleteTransaction);

// Special routes
router.post('/rent-payment', smartAuthorize('transactions', 'create'), getTransactionAccess, processRentPayment);
router.get('/statistics', smartAuthorize('transactions', 'view'), getTransactionAccess, getTransactionStatistics);
router.get('/tenant/:tenantId/history', smartAuthorize('transactions', 'view'), getTransactionAccess, getTenantPaymentHistory);
router.get('/apartment/:apartmentId/history', smartAuthorize('transactions', 'view'), getTransactionAccess, getApartmentPaymentHistory);

export default router;
