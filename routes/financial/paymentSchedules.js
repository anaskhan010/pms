import express from 'express';
import {
  getPaymentSchedules,
  getPaymentSchedule,
  createPaymentSchedule,
  generateMonthlySchedule,
  generateDepositSchedule,
  updateScheduleStatus,
  getOverduePayments,
  getUpcomingPayments,
  getPaymentStatistics,
  deleteSchedulesByContract
} from '../../controllers/financial/paymentScheduleController.js';
import { protect, adminOnly, adminAndManager, adminAndOwner } from '../../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// Basic CRUD routes
router.route('/')
  .get(adminAndOwner, getPaymentSchedules)
  .post(adminAndOwner, createPaymentSchedule);

router.route('/:id')
  .get(adminAndOwner, getPaymentSchedule);

// Special routes
router.post('/generate-monthly', adminAndOwner, generateMonthlySchedule);
router.post('/generate-deposit', adminAndOwner, generateDepositSchedule);
router.put('/:id/status', adminAndOwner, updateScheduleStatus);
router.get('/overdue', adminAndOwner, getOverduePayments);
router.get('/upcoming', adminAndOwner, getUpcomingPayments);
router.get('/statistics', adminAndOwner, getPaymentStatistics);
router.delete('/contract/:contractId', adminOnly, deleteSchedulesByContract);

export default router;
