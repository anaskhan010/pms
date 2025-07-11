import FinancialTransaction from '../../models/financial/FinancialTransaction.js';
import PaymentSchedule from '../../models/financial/PaymentSchedule.js';
import TenantPaymentHistory from '../../models/financial/TenantPaymentHistory.js';
import db from '../../config/db.js';

/**
 * Financial Transaction Controller
 * Handles all financial transaction operations
 */

// @desc    Get all financial transactions
// @route   GET /api/financial/transactions
// @access  Private (Admin/Owner)
const getTransactions = async (req, res) => {
  try {
    const {
      tenantId,
      apartmentId,
      contractId,
      transactionType,
      status,
      paymentMethod,
      dateFrom,
      dateTo,
      buildingId,
      page = 1,
      limit = 10
    } = req.query;

    const filters = {
      tenantId,
      apartmentId,
      contractId,
      transactionType,
      status,
      paymentMethod,
      dateFrom,
      dateTo,
      buildingId,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    };

    // Add owner building filtering if user is owner
    if (req.ownerBuildings && req.ownerBuildings.length > 0) {
      filters.ownerBuildings = req.ownerBuildings;
    }

    const transactions = await FinancialTransaction.getAllTransactions(filters);

    // Get total count for pagination
    const totalTransactions = await FinancialTransaction.getAllTransactions({
      ...filters,
      limit: null,
      offset: null
    });

    res.status(200).json({
      success: true,
      count: transactions.length,
      total: totalTransactions.length,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(totalTransactions.length / parseInt(limit)),
        limit: parseInt(limit)
      },
      data: transactions
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transactions',
      message: error.message
    });
  }
};

// @desc    Get single financial transaction
// @route   GET /api/financial/transactions/:id
// @access  Private (Admin/Owner)
const getTransaction = async (req, res) => {
  try {
    const transaction = await FinancialTransaction.getTransactionById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    // Check if owner has access to this transaction
    if (req.ownerBuildings && req.ownerBuildings.length > 0) {
      // For owners, check if the transaction's tenant is assigned to an apartment in their buildings
      if (transaction.tenantId) {
        const tenantAccessQuery = `
          SELECT COUNT(*) as count
          FROM ApartmentAssigned aa
          INNER JOIN apartment a ON aa.apartmentId = a.apartmentId
          INNER JOIN floor f ON a.floorId = f.floorId
          INNER JOIN building b ON f.buildingId = b.buildingId
          WHERE aa.tenantId = ? AND b.buildingId IN (${req.ownerBuildings.map(() => '?').join(',')})
        `;
        const [accessResult] = await db.execute(tenantAccessQuery, [transaction.tenantId, ...req.ownerBuildings]);

        if (accessResult[0].count === 0) {
          return res.status(403).json({
            success: false,
            error: 'Access denied. This transaction is not related to your assigned buildings.'
          });
        }
      } else {
        return res.status(403).json({
          success: false,
          error: 'Access denied. This transaction has no associated tenant.'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transaction',
      message: error.message
    });
  }
};

// @desc    Create new financial transaction
// @route   POST /api/financial/transactions
// @access  Private (Admin/Owner)
const createTransaction = async (req, res) => {
  try {
    const {
      tenantId,
      apartmentId,
      contractId,
      transactionType,
      amount,
      currency,
      paymentMethod,
      transactionDate,
      dueDate,
      status,
      description,
      referenceNumber,
      receiptPath,
      processingFee,
      lateFee,
      billingPeriodStart,
      billingPeriodEnd
    } = req.body;

    // For owners, validate that the tenant/apartment belongs to their assigned buildings
    if (req.ownerBuildings && req.ownerBuildings.length > 0) {
      if (tenantId) {
        // Validate tenant is in owner's buildings
        const tenantValidationQuery = `
          SELECT COUNT(*) as count
          FROM ApartmentAssigned aa
          INNER JOIN apartment a ON aa.apartmentId = a.apartmentId
          INNER JOIN floor f ON a.floorId = f.floorId
          INNER JOIN building b ON f.buildingId = b.buildingId
          WHERE aa.tenantId = ? AND b.buildingId IN (${req.ownerBuildings.map(() => '?').join(',')})
        `;
        const [tenantValidation] = await db.execute(tenantValidationQuery, [tenantId, ...req.ownerBuildings]);

        if (tenantValidation[0].count === 0) {
          return res.status(403).json({
            success: false,
            error: 'You can only create transactions for tenants in your assigned buildings'
          });
        }
      }

      if (apartmentId) {
        // Validate apartment is in owner's buildings
        const apartmentValidationQuery = `
          SELECT COUNT(*) as count
          FROM apartment a
          INNER JOIN floor f ON a.floorId = f.floorId
          INNER JOIN building b ON f.buildingId = b.buildingId
          WHERE a.apartmentId = ? AND b.buildingId IN (${req.ownerBuildings.map(() => '?').join(',')})
        `;
        const [apartmentValidation] = await db.execute(apartmentValidationQuery, [apartmentId, ...req.ownerBuildings]);

        if (apartmentValidation[0].count === 0) {
          return res.status(403).json({
            success: false,
            error: 'You can only create transactions for apartments in your assigned buildings'
          });
        }
      }
    }

    // If contractId is not provided but tenantId and apartmentId are, try to fetch it
    let finalContractId = contractId;
    if (!contractId && tenantId && apartmentId) {
      try {
        const contractQuery = `
          SELECT c.contractId
          FROM Contract c
          INNER JOIN ContractDetails cd ON c.contractId = cd.contractId
          WHERE c.tenantId = ? AND cd.apartmentId = ?
          LIMIT 1
        `;
        const [contractResult] = await db.execute(contractQuery, [tenantId, apartmentId]);
        if (contractResult.length > 0) {
          finalContractId = contractResult[0].contractId;
        }
      } catch (contractError) {
        console.warn('Could not fetch contract ID:', contractError.message);
      }
    }

    const transactionData = {
      tenantId: tenantId || null,
      apartmentId: apartmentId || null,
      contractId: finalContractId || null,
      transactionType: transactionType || 'Rent Payment',
      amount: parseFloat(amount || 0),
      currency: currency || 'AED',
      paymentMethod: paymentMethod || 'Bank Transfer',
      transactionDate: transactionDate || new Date().toISOString().split('T')[0],
      dueDate: dueDate || null,
      status: status || 'Pending',
      description: description || null,
      referenceNumber: referenceNumber || null,
      receiptPath: receiptPath || null,
      processingFee: parseFloat(processingFee || 0),
      lateFee: parseFloat(lateFee || 0),
      billingPeriodStart: billingPeriodStart || null,
      billingPeriodEnd: billingPeriodEnd || null,
      createdBy: req.user?.userId || null
    };

    const transaction = await FinancialTransaction.createTransaction(transactionData);

    res.status(201).json({
      success: true,
      data: transaction,
      message: 'Transaction created successfully'
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create transaction',
      message: error.message
    });
  }
};

// @desc    Update financial transaction
// @route   PUT /api/financial/transactions/:id
// @access  Private (Admin/Owner)
const updateTransaction = async (req, res) => {
  try {
    // First, get the existing transaction to validate ownership
    const existingTransaction = await FinancialTransaction.getTransactionById(req.params.id);

    if (!existingTransaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    // For owners, validate that they can access this transaction
    if (req.ownerBuildings && req.ownerBuildings.length > 0) {
      if (existingTransaction.tenantId) {
        const tenantAccessQuery = `
          SELECT COUNT(*) as count
          FROM ApartmentAssigned aa
          INNER JOIN apartment a ON aa.apartmentId = a.apartmentId
          INNER JOIN floor f ON a.floorId = f.floorId
          INNER JOIN building b ON f.buildingId = b.buildingId
          WHERE aa.tenantId = ? AND b.buildingId IN (${req.ownerBuildings.map(() => '?').join(',')})
        `;
        const [accessResult] = await db.execute(tenantAccessQuery, [existingTransaction.tenantId, ...req.ownerBuildings]);

        if (accessResult[0].count === 0) {
          return res.status(403).json({
            success: false,
            error: 'You can only update transactions for tenants in your assigned buildings'
          });
        }
      }
    }

    const transaction = await FinancialTransaction.updateTransaction(req.params.id, req.body);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    res.status(200).json({
      success: true,
      data: transaction,
      message: 'Transaction updated successfully'
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update transaction',
      message: error.message
    });
  }
};

// @desc    Delete financial transaction
// @route   DELETE /api/financial/transactions/:id
// @access  Private (Admin/Owner)
const deleteTransaction = async (req, res) => {
  try {
    const deleted = await FinancialTransaction.deleteTransaction(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete transaction',
      message: error.message
    });
  }
};

// @desc    Process rent payment
// @route   POST /api/financial/transactions/rent-payment
// @access  Private (Admin/Owner)
const processRentPayment = async (req, res) => {
  try {
    const {
      tenantId,
      apartmentId,
      contractId,
      amount,
      paymentMethod,
      paymentDate,
      billingPeriodStart,
      billingPeriodEnd,
      lateFee = 0,
      notes
    } = req.body;

    // For owners, validate that the tenant/apartment belongs to their assigned buildings
    if (req.ownerBuildings && req.ownerBuildings.length > 0) {
      if (tenantId) {
        // Validate tenant is in owner's buildings
        const tenantValidationQuery = `
          SELECT COUNT(*) as count
          FROM ApartmentAssigned aa
          INNER JOIN apartment a ON aa.apartmentId = a.apartmentId
          INNER JOIN floor f ON a.floorId = f.floorId
          INNER JOIN building b ON f.buildingId = b.buildingId
          WHERE aa.tenantId = ? AND b.buildingId IN (${req.ownerBuildings.map(() => '?').join(',')})
        `;
        const [tenantValidation] = await db.execute(tenantValidationQuery, [tenantId, ...req.ownerBuildings]);

        if (tenantValidation[0].count === 0) {
          return res.status(403).json({
            success: false,
            error: 'You can only process rent payments for tenants in your assigned buildings'
          });
        }
      }
    }

    // If contractId is not provided but tenantId and apartmentId are, try to fetch it
    let finalContractId = contractId;
    if (!contractId && tenantId && apartmentId) {
      try {
        const contractQuery = `
          SELECT c.contractId
          FROM Contract c
          INNER JOIN ContractDetails cd ON c.contractId = cd.contractId
          WHERE c.tenantId = ? AND cd.apartmentId = ?
          LIMIT 1
        `;
        const [contractResult] = await db.execute(contractQuery, [tenantId, apartmentId]);
        if (contractResult.length > 0) {
          finalContractId = contractResult[0].contractId;
        }
      } catch (contractError) {
        console.warn('Could not fetch contract ID:', contractError.message);
      }
    }

    // Calculate processing fee based on payment method
    let processingFee = 0;
    if (paymentMethod === 'Credit Card') {
      processingFee = amount * 0.029; // 2.9%
    } else if (paymentMethod === 'Bank Transfer') {
      processingFee = 5; // Flat fee
    }

    const transactionData = {
      tenantId: tenantId || null,
      apartmentId: apartmentId || null,
      contractId: finalContractId || null,
      transactionType: 'Rent Payment',
      amount: parseFloat(amount || 0) + parseFloat(lateFee || 0),
      paymentMethod: paymentMethod || 'Bank Transfer',
      transactionDate: paymentDate || new Date().toISOString().split('T')[0],
      status: 'Completed',
      description: notes || `Monthly rent payment for ${billingPeriodStart || 'current period'} to ${billingPeriodEnd || 'current period'}`,
      processingFee: processingFee || 0,
      lateFee: parseFloat(lateFee || 0),
      billingPeriodStart: billingPeriodStart || null,
      billingPeriodEnd: billingPeriodEnd || null,
      createdBy: req.user?.userId || null
    };

    const transaction = await FinancialTransaction.createTransaction(transactionData);

    res.status(201).json({
      success: true,
      data: transaction,
      message: 'Rent payment processed successfully'
    });
  } catch (error) {
    console.error('Error processing rent payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process rent payment',
      message: error.message
    });
  }
};

// @desc    Get transaction statistics
// @route   GET /api/financial/transactions/statistics
// @access  Private (Admin/Owner)
const getTransactionStatistics = async (req, res) => {
  try {
    const { year, month, tenantId, apartmentId } = req.query;

    const filters = { year, month, tenantId, apartmentId };

    // Add owner building filtering if user is owner
    if (req.ownerBuildings && req.ownerBuildings.length > 0) {
      filters.ownerBuildings = req.ownerBuildings;
    }

    // Get basic transaction statistics
    const allTransactions = await FinancialTransaction.getAllTransactions(filters);

    const statistics = {
      totalTransactions: allTransactions.length,
      totalAmount: allTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0),
      completedTransactions: allTransactions.filter(t => t.status === 'Completed').length,
      pendingTransactions: allTransactions.filter(t => t.status === 'Pending').length,
      failedTransactions: allTransactions.filter(t => t.status === 'Failed').length,
      totalProcessingFees: allTransactions.reduce((sum, t) => sum + parseFloat(t.processingFee || 0), 0),
      totalLateFees: allTransactions.reduce((sum, t) => sum + parseFloat(t.lateFee || 0), 0),
      transactionsByType: {},
      transactionsByMethod: {}
    };

    // Group by transaction type
    allTransactions.forEach(transaction => {
      const type = transaction.transactionType;
      if (!statistics.transactionsByType[type]) {
        statistics.transactionsByType[type] = { count: 0, amount: 0 };
      }
      statistics.transactionsByType[type].count++;
      statistics.transactionsByType[type].amount += parseFloat(transaction.amount);
    });

    // Group by payment method
    allTransactions.forEach(transaction => {
      const method = transaction.paymentMethod;
      if (!statistics.transactionsByMethod[method]) {
        statistics.transactionsByMethod[method] = { count: 0, amount: 0 };
      }
      statistics.transactionsByMethod[method].count++;
      statistics.transactionsByMethod[method].amount += parseFloat(transaction.amount);
    });

    res.status(200).json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('Error fetching transaction statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transaction statistics',
      message: error.message
    });
  }
};

// @desc    Get tenant payment history
// @route   GET /api/financial/transactions/tenant/:tenantId/history
// @access  Private (Admin/Owner)
const getTenantPaymentHistory = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { year, apartmentId, limit = 12 } = req.query;

    // Check if owner has access to this tenant
    if (req.ownerBuildings && req.ownerBuildings.length > 0) {
      const tenantAccessQuery = `
        SELECT COUNT(*) as count
        FROM ApartmentAssigned aa
        INNER JOIN apartment a ON aa.apartmentId = a.apartmentId
        INNER JOIN floor f ON a.floorId = f.floorId
        INNER JOIN building b ON f.buildingId = b.buildingId
        WHERE aa.tenantId = ? AND b.buildingId IN (${req.ownerBuildings.map(() => '?').join(',')})
      `;
      const [accessResult] = await db.execute(tenantAccessQuery, [tenantId, ...req.ownerBuildings]);

      if (accessResult[0].count === 0) {
        return res.status(403).json({
          success: false,
          error: 'Access denied. This tenant is not assigned to your buildings.'
        });
      }
    }

    const filters = { year, apartmentId, limit: parseInt(limit) };
    const paymentHistory = await TenantPaymentHistory.getPaymentHistoryByTenant(tenantId, filters);
    const statistics = await TenantPaymentHistory.getTenantPaymentStatistics(tenantId, year);

    res.status(200).json({
      success: true,
      data: {
        paymentHistory,
        statistics
      }
    });
  } catch (error) {
    console.error('Error fetching tenant payment history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tenant payment history',
      message: error.message
    });
  }
};

// @desc    Get apartment payment history
// @route   GET /api/financial/transactions/apartment/:apartmentId/history
// @access  Private (Admin/Owner)
const getApartmentPaymentHistory = async (req, res) => {
  try {
    const { apartmentId } = req.params;
    const { year, tenantId, limit = 12 } = req.query;

    // Check if owner has access to this apartment
    if (req.ownerBuildings && req.ownerBuildings.length > 0) {
      const apartmentAccessQuery = `
        SELECT COUNT(*) as count
        FROM apartment a
        INNER JOIN floor f ON a.floorId = f.floorId
        INNER JOIN building b ON f.buildingId = b.buildingId
        WHERE a.apartmentId = ? AND b.buildingId IN (${req.ownerBuildings.map(() => '?').join(',')})
      `;
      const [accessResult] = await db.execute(apartmentAccessQuery, [apartmentId, ...req.ownerBuildings]);

      if (accessResult[0].count === 0) {
        return res.status(403).json({
          success: false,
          error: 'Access denied. This apartment is not in your assigned buildings.'
        });
      }
    }

    const filters = { year, tenantId, limit: parseInt(limit) };
    const paymentHistory = await TenantPaymentHistory.getPaymentHistoryByApartment(apartmentId, filters);
    const statistics = await TenantPaymentHistory.getApartmentPaymentStatistics(apartmentId, year);

    res.status(200).json({
      success: true,
      data: {
        paymentHistory,
        statistics
      }
    });
  } catch (error) {
    console.error('Error fetching apartment payment history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch apartment payment history',
      message: error.message
    });
  }
};

export {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  processRentPayment,
  getTransactionStatistics,
  getTenantPaymentHistory,
  getApartmentPaymentHistory
};
