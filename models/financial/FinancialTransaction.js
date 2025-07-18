import db from '../../config/db.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * FinancialTransaction Model
 * Handles all financial transactions including rent payments, deposits, fees, etc.
 */

const createTransaction = async (transactionData) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const transactionId = uuidv4();
    const {
      tenantId,
      apartmentId,
      contractId,
      transactionType,
      amount,
      currency = 'AED',
      paymentMethod,
      transactionDate,
      dueDate,
      status = 'Pending',
      description,
      referenceNumber,
      receiptPath,
      processingFee = 0.00,
      lateFee = 0.00,
      billingPeriodStart,
      billingPeriodEnd,
      createdBy
    } = transactionData;

    // Generate reference number if not provided
    const finalReferenceNumber = referenceNumber || generateReferenceNumber();

    const transactionQuery = `
      INSERT INTO FinancialTransactions (
        transactionId, tenantId, apartmentId, contractId, transactionType,
        amount, currency, paymentMethod, transactionDate, dueDate, status,
        description, referenceNumber, receiptPath, processingFee, lateFee,
        billingPeriodStart, billingPeriodEnd, createdBy
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Ensure all values are properly handled (convert undefined to null)
    const cleanedData = {
      transactionId,
      tenantId: tenantId || null,
      apartmentId: apartmentId || null,
      contractId: contractId || null,
      transactionType: transactionType || 'Rent Payment',
      amount: amount || 0,
      currency: currency || 'AED',
      paymentMethod: paymentMethod || 'Bank Transfer',
      transactionDate: transactionDate || new Date().toISOString().split('T')[0],
      dueDate: dueDate || null,
      status: status || 'Pending',
      description: description || null,
      finalReferenceNumber,
      receiptPath: receiptPath || null,
      processingFee: processingFee || 0.00,
      lateFee: lateFee || 0.00,
      billingPeriodStart: billingPeriodStart || null,
      billingPeriodEnd: billingPeriodEnd || null,
      createdBy: createdBy || null
    };

    const transactionValues = [
      cleanedData.transactionId,
      cleanedData.tenantId,
      cleanedData.apartmentId,
      cleanedData.contractId,
      cleanedData.transactionType,
      cleanedData.amount,
      cleanedData.currency,
      cleanedData.paymentMethod,
      cleanedData.transactionDate,
      cleanedData.dueDate,
      cleanedData.status,
      cleanedData.description,
      cleanedData.finalReferenceNumber,
      cleanedData.receiptPath,
      cleanedData.processingFee,
      cleanedData.lateFee,
      cleanedData.billingPeriodStart,
      cleanedData.billingPeriodEnd,
      cleanedData.createdBy
    ];



    await connection.execute(transactionQuery, transactionValues);

    // If this is a rent payment and status is completed, create payment history record
    if (cleanedData.transactionType === 'Rent Payment' && cleanedData.status === 'Completed') {
      await createPaymentHistoryRecord(connection, {
        tenantId: cleanedData.tenantId,
        apartmentId: cleanedData.apartmentId,
        contractId: cleanedData.contractId, // Can be null now
        transactionId: cleanedData.transactionId,
        paymentMonth: cleanedData.billingPeriodStart || cleanedData.transactionDate,
        rentAmount: cleanedData.amount - cleanedData.lateFee,
        lateFee: cleanedData.lateFee,
        totalPaid: cleanedData.amount,
        paymentDate: cleanedData.transactionDate,
        paymentMethod: cleanedData.paymentMethod,
        status: cleanedData.lateFee > 0 ? 'Late' : 'On Time'
      });
    }

    await connection.commit();
    return await getTransactionById(transactionId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const getTransactionById = async (transactionId) => {
  const query = `
    SELECT 
      ft.*,
      t.userId,
      CONCAT(u.firstName, ' ', u.lastName) as tenantName,
      u.email as tenantEmail,
      u.phoneNumber as tenantPhone,
      a.bedrooms, a.bathrooms, a.rentPrice,
      f.floorName,
      b.buildingName, b.buildingAddress,
      c.SecurityFee,
      DATE_FORMAT(c.startDate, '%Y-%m-%d') as contractStartDate,
      DATE_FORMAT(c.endDate, '%Y-%m-%d') as contractEndDate,
      CONCAT(creator.firstName, ' ', creator.lastName) as createdByName
    FROM FinancialTransactions ft
    LEFT JOIN tenant t ON ft.tenantId = t.tenantId
    LEFT JOIN user u ON t.userId = u.userId
    LEFT JOIN apartment a ON ft.apartmentId = a.apartmentId
    LEFT JOIN floor f ON a.floorId = f.floorId
    LEFT JOIN building b ON f.buildingId = b.buildingId
    LEFT JOIN Contract c ON ft.contractId = c.contractId
    LEFT JOIN user creator ON ft.createdBy = creator.userId
    WHERE ft.transactionId = ?
  `;

  const [rows] = await db.execute(query, [transactionId]);
  return rows[0] || null;
};

const getAllTransactions = async (filters = {}) => {
  let query = `
    SELECT
      ft.*,
      CONCAT(u.firstName, ' ', u.lastName) as tenantName,
      u.email as tenantEmail,
      a.bedrooms, a.bathrooms, a.rentPrice,
      f.floorName,
      b.buildingName, b.buildingAddress,
      CONCAT(creator.firstName, ' ', creator.lastName) as createdByName
    FROM FinancialTransactions ft
    LEFT JOIN tenant t ON ft.tenantId = t.tenantId
    LEFT JOIN user u ON t.userId = u.userId
    LEFT JOIN apartment a ON ft.apartmentId = a.apartmentId
    LEFT JOIN floor f ON a.floorId = f.floorId
    LEFT JOIN building b ON f.buildingId = b.buildingId
    LEFT JOIN user creator ON ft.createdBy = creator.userId
    WHERE 1 = 1
  `;

  const queryParams = [];

  // Add ownership-based filtering for non-admin users
  if (filters.ownerBuildings !== undefined || filters.transactionIds !== undefined) {
    let ownershipConditions = [];

    // Filter by building ownership - show transactions for tenants in owner's buildings
    if (filters.ownerBuildings && filters.ownerBuildings.length > 0) {
      const placeholders = filters.ownerBuildings.map(() => '?').join(',');
      ownershipConditions.push(`ft.tenantId IN (
        SELECT DISTINCT aa.tenantId
        FROM ApartmentAssigned aa
        INNER JOIN apartment ap ON aa.apartmentId = ap.apartmentId
        INNER JOIN floor fl ON ap.floorId = fl.floorId
        INNER JOIN building bd ON fl.buildingId = bd.buildingId
        WHERE bd.buildingId IN (${placeholders})
      )`);
      queryParams.push(...filters.ownerBuildings);
    }

    // Filter by direct transaction ownership - show transactions created by owner
    if (filters.transactionIds && filters.transactionIds.length > 0) {
      const placeholders = filters.transactionIds.map(() => '?').join(',');
      ownershipConditions.push(`ft.transactionId IN (${placeholders})`);
      queryParams.push(...filters.transactionIds);
    }

    if (ownershipConditions.length > 0) {
      query += ` AND (${ownershipConditions.join(' OR ')})`;
    } else {
      // User has no buildings and no transactions - show nothing
      query += ` AND 1 = 0`;
    }
  }

  // Apply filters
  if (filters.tenantId) {
    query += ' AND ft.tenantId = ?';
    queryParams.push(filters.tenantId);
  }

  if (filters.apartmentId) {
    query += ' AND ft.apartmentId = ?';
    queryParams.push(filters.apartmentId);
  }

  if (filters.contractId) {
    query += ' AND ft.contractId = ?';
    queryParams.push(filters.contractId);
  }

  if (filters.transactionType) {
    query += ' AND ft.transactionType = ?';
    queryParams.push(filters.transactionType);
  }

  if (filters.status) {
    query += ' AND ft.status = ?';
    queryParams.push(filters.status);
  }

  if (filters.paymentMethod) {
    query += ' AND ft.paymentMethod = ?';
    queryParams.push(filters.paymentMethod);
  }

  if (filters.dateFrom) {
    query += ' AND ft.transactionDate >= ?';
    queryParams.push(filters.dateFrom);
  }

  if (filters.dateTo) {
    query += ' AND ft.transactionDate <= ?';
    queryParams.push(filters.dateTo);
  }

  if (filters.buildingId) {
    query += ' AND b.buildingId = ?';
    queryParams.push(filters.buildingId);
  }

  // Add ordering
  query += ' ORDER BY ft.transactionDate DESC, ft.createdAt DESC';

  // Add pagination if specified
  if (filters.limit && parseInt(filters.limit) > 0) {
    const offset = filters.offset || 0;
    const limitValue = parseInt(filters.limit);
    const offsetValue = parseInt(offset);

    // Use string concatenation for LIMIT/OFFSET to avoid MySQL prepared statement issues
    query += ` LIMIT ${limitValue} OFFSET ${offsetValue}`;
  }

  const [rows] = await db.execute(query, queryParams);
  return rows;
};

const updateTransaction = async (transactionId, updateData) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const allowedFields = [
      'status', 'description', 'receiptPath', 'processingFee', 
      'lateFee', 'referenceNumber', 'transactionDate'
    ];

    const updates = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        updates.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(transactionId);

    const updateQuery = `
      UPDATE FinancialTransactions 
      SET ${updates.join(', ')}, updatedAt = CURRENT_TIMESTAMP 
      WHERE transactionId = ?
    `;

    await connection.execute(updateQuery, values);

    // If status changed to Completed and it's a rent payment, update payment history
    if (updateData.status === 'Completed') {
      const transaction = await getTransactionById(transactionId);
      if (transaction && transaction.transactionType === 'Rent Payment') {
        await createPaymentHistoryRecord(connection, {
          tenantId: transaction.tenantId,
          apartmentId: transaction.apartmentId,
          contractId: transaction.contractId, // Can be null now
          transactionId: transaction.transactionId,
          paymentMonth: transaction.billingPeriodStart || transaction.transactionDate,
          rentAmount: transaction.amount - transaction.lateFee,
          lateFee: transaction.lateFee,
          totalPaid: transaction.amount,
          paymentDate: transaction.transactionDate,
          paymentMethod: transaction.paymentMethod,
          status: transaction.lateFee > 0 ? 'Late' : 'On Time'
        });
      }
    }

    await connection.commit();
    return await getTransactionById(transactionId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const deleteTransaction = async (transactionId) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // Delete related payment history records first
    await connection.execute(
      'DELETE FROM TenantPaymentHistory WHERE transactionId = ?',
      [transactionId]
    );

    // Delete the transaction
    const [result] = await connection.execute(
      'DELETE FROM FinancialTransactions WHERE transactionId = ?',
      [transactionId]
    );

    await connection.commit();
    return result.affectedRows > 0;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Helper function to create payment history record
const createPaymentHistoryRecord = async (connection, historyData) => {
  const historyQuery = `
    INSERT INTO TenantPaymentHistory (
      tenantId, apartmentId, contractId, transactionId, paymentMonth,
      rentAmount, lateFee, totalPaid, paymentDate, paymentMethod, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const historyValues = [
    historyData.tenantId || null,
    historyData.apartmentId || null,
    historyData.contractId || null,
    historyData.transactionId || null,
    historyData.paymentMonth || null,
    historyData.rentAmount || 0,
    historyData.lateFee || 0,
    historyData.totalPaid || 0,
    historyData.paymentDate || null,
    historyData.paymentMethod || null,
    historyData.status || 'On Time'
  ];

  await connection.execute(historyQuery, historyValues);
};

// Helper function to generate reference number
const generateReferenceNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().substr(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `TXN-${year}${month}${day}-${random}`;
};

export default {
  createTransaction,
  getTransactionById,
  getAllTransactions,
  updateTransaction,
  deleteTransaction,
  generateReferenceNumber
};
