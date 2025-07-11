import PaymentSchedule from '../../models/financial/PaymentSchedule.js';

/**
 * Payment Schedule Controller
 * Handles payment schedule operations
 */

// @desc    Get payment schedules
// @route   GET /api/financial/payment-schedules
// @access  Private (Admin/Owner)
const getPaymentSchedules = async (req, res) => {
  try {
    const { contractId, tenantId, apartmentId, status } = req.query;

    let schedules = [];

    if (contractId) {
      schedules = await PaymentSchedule.getSchedulesByContract(contractId);
    } else if (tenantId) {
      schedules = await PaymentSchedule.getSchedulesByTenant(tenantId);
    } else {
      // Get all schedules with filters
      const filters = { status };
      // Note: You might want to implement a getAllSchedules method in the model
      schedules = await PaymentSchedule.getSchedulesByTenant(null, filters);
    }

    res.status(200).json({
      success: true,
      count: schedules.length,
      data: schedules
    });
  } catch (error) {
    console.error('Error fetching payment schedules:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment schedules',
      message: error.message
    });
  }
};

// @desc    Get single payment schedule
// @route   GET /api/financial/payment-schedules/:id
// @access  Private (Admin/Owner)
const getPaymentSchedule = async (req, res) => {
  try {
    const schedule = await PaymentSchedule.getScheduleById(req.params.id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        error: 'Payment schedule not found'
      });
    }

    res.status(200).json({
      success: true,
      data: schedule
    });
  } catch (error) {
    console.error('Error fetching payment schedule:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment schedule',
      message: error.message
    });
  }
};

// @desc    Create payment schedule
// @route   POST /api/financial/payment-schedules
// @access  Private (Admin/Owner)
const createPaymentSchedule = async (req, res) => {
  try {
    const schedule = await PaymentSchedule.createPaymentSchedule(req.body);

    res.status(201).json({
      success: true,
      data: schedule,
      message: 'Payment schedule created successfully'
    });
  } catch (error) {
    console.error('Error creating payment schedule:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payment schedule',
      message: error.message
    });
  }
};

// @desc    Generate monthly rent schedule for contract
// @route   POST /api/financial/payment-schedules/generate-monthly
// @access  Private (Admin/Owner)
const generateMonthlySchedule = async (req, res) => {
  try {
    const {
      contractId,
      tenantId,
      apartmentId,
      startDate,
      endDate,
      rentAmount
    } = req.body;

    const contractData = {
      contractId,
      tenantId,
      apartmentId,
      startDate,
      endDate,
      rentAmount
    };

    const schedules = await PaymentSchedule.generateMonthlyRentSchedule(contractData);

    res.status(201).json({
      success: true,
      count: schedules.length,
      data: schedules,
      message: 'Monthly payment schedule generated successfully'
    });
  } catch (error) {
    console.error('Error generating monthly schedule:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate monthly schedule',
      message: error.message
    });
  }
};

// @desc    Generate security deposit schedule
// @route   POST /api/financial/payment-schedules/generate-deposit
// @access  Private (Admin/Owner)
const generateDepositSchedule = async (req, res) => {
  try {
    const {
      contractId,
      tenantId,
      apartmentId,
      startDate,
      securityFee
    } = req.body;

    const contractData = {
      contractId,
      tenantId,
      apartmentId,
      startDate,
      securityFee
    };

    const schedule = await PaymentSchedule.generateSecurityDepositSchedule(contractData);

    if (!schedule) {
      return res.status(400).json({
        success: false,
        error: 'No security deposit required or invalid amount'
      });
    }

    res.status(201).json({
      success: true,
      data: schedule,
      message: 'Security deposit schedule generated successfully'
    });
  } catch (error) {
    console.error('Error generating deposit schedule:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate deposit schedule',
      message: error.message
    });
  }
};

// @desc    Update payment schedule status
// @route   PUT /api/financial/payment-schedules/:id/status
// @access  Private (Admin/Owner)
const updateScheduleStatus = async (req, res) => {
  try {
    const { status, transactionId } = req.body;
    const scheduleId = req.params.id;

    const updated = await PaymentSchedule.updateScheduleStatus(scheduleId, status, transactionId);

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Payment schedule not found'
      });
    }

    const schedule = await PaymentSchedule.getScheduleById(scheduleId);

    res.status(200).json({
      success: true,
      data: schedule,
      message: 'Payment schedule status updated successfully'
    });
  } catch (error) {
    console.error('Error updating schedule status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update schedule status',
      message: error.message
    });
  }
};

// @desc    Get overdue payments
// @route   GET /api/financial/payment-schedules/overdue
// @access  Private (Admin/Owner)
const getOverduePayments = async (req, res) => {
  try {
    const overduePayments = await PaymentSchedule.getOverduePayments();

    if (!overduePayments || overduePayments.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
        message: 'No overdue payments found'
      });
    }

    res.status(200).json({
      success: true,
      count: overduePayments.length,
      data: overduePayments
    });
  } catch (error) {
    console.error('Error fetching overdue payments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch overdue payments',
      message: error.message
    });
  }
};

// @desc    Get upcoming payments
// @route   GET /api/financial/payment-schedules/upcoming
// @access  Private (Admin/Owner)
const getUpcomingPayments = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const upcomingPayments = await PaymentSchedule.getUpcomingPayments(parseInt(days));

    if (!upcomingPayments || upcomingPayments.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
        message: 'No upcoming payments found'
      });
    }

    res.status(200).json({
      success: true,
      count: upcomingPayments.length,
      data: upcomingPayments
    });
  } catch (error) {
    console.error('Error fetching upcoming payments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch upcoming payments',
      message: error.message
    });
  }
};

// @desc    Get payment statistics
// @route   GET /api/financial/payment-schedules/statistics
// @access  Private (Admin/Owner)
const getPaymentStatistics = async (req, res) => {
  try {
    const { tenantId, contractId, apartmentId } = req.query;
    const filters = { tenantId, contractId, apartmentId };

    const statistics = await PaymentSchedule.getPaymentStatistics(filters);

    if (!statistics || Object.keys(statistics).length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalScheduled: 0,
          totalPaid: 0,
          totalOverdue: 0,
          totalUpcoming: 0,
          totalAmountPaid: 0,
          totalAmountPending: 0
        },
        message: 'No payment schedule statistics available'
      });
    }

    res.status(200).json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('Error fetching payment statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment statistics',
      message: error.message
    });
  }
};

// @desc    Delete payment schedules by contract
// @route   DELETE /api/financial/payment-schedules/contract/:contractId
// @access  Private (Admin/Owner)
const deleteSchedulesByContract = async (req, res) => {
  try {
    const { contractId } = req.params;
    const deletedCount = await PaymentSchedule.deleteSchedulesByContract(contractId);

    res.status(200).json({
      success: true,
      message: `${deletedCount} payment schedules deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting payment schedules:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete payment schedules',
      message: error.message
    });
  }
};

export {
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
};
