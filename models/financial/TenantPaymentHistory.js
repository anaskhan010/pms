import db from '../../config/db.js';

/**
 * TenantPaymentHistory Model
 * Handles tenant payment history tracking and analytics
 */

const createPaymentHistory = async (historyData) => {
  const {
    tenantId,
    apartmentId,
    contractId,
    transactionId,
    paymentMonth,
    rentAmount,
    lateFee = 0.00,
    totalPaid,
    paymentDate,
    paymentMethod,
    status,
    notes
  } = historyData;

  const query = `
    INSERT INTO TenantPaymentHistory (
      tenantId, apartmentId, contractId, transactionId, paymentMonth,
      rentAmount, lateFee, totalPaid, paymentDate, paymentMethod, status, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    tenantId, apartmentId, contractId, transactionId, paymentMonth,
    rentAmount, lateFee, totalPaid, paymentDate, paymentMethod, status, notes
  ];

  const [result] = await db.execute(query, values);
  return await getPaymentHistoryById(result.insertId);
};

const getPaymentHistoryById = async (paymentHistoryId) => {
  const query = `
    SELECT 
      tph.*,
      CONCAT(u.firstName, ' ', u.lastName) as tenantName,
      u.email as tenantEmail,
      u.phoneNumber as tenantPhone,
      a.bedrooms, a.bathrooms, a.rentPrice,
      f.floorName,
      b.buildingName, b.buildingAddress,
      ft.referenceNumber,
      ft.receiptPath,
      DATE_FORMAT(tph.paymentMonth, '%Y-%m-%d') as formattedPaymentMonth,
      DATE_FORMAT(tph.paymentDate, '%Y-%m-%d') as formattedPaymentDate
    FROM TenantPaymentHistory tph
    LEFT JOIN tenant t ON tph.tenantId = t.tenantId
    LEFT JOIN user u ON t.userId = u.userId
    LEFT JOIN apartment a ON tph.apartmentId = a.apartmentId
    LEFT JOIN floor f ON a.floorId = f.floorId
    LEFT JOIN building b ON f.buildingId = b.buildingId
    LEFT JOIN FinancialTransactions ft ON tph.transactionId = ft.transactionId
    WHERE tph.paymentHistoryId = ?
  `;

  const [rows] = await db.execute(query, [paymentHistoryId]);
  return rows[0] || null;
};

const getPaymentHistoryByTenant = async (tenantId, filters = {}) => {
  let query = `
    SELECT 
      tph.*,
      a.bedrooms, a.bathrooms, a.rentPrice,
      f.floorName,
      b.buildingName, b.buildingAddress,
      ft.referenceNumber,
      ft.receiptPath,
      DATE_FORMAT(tph.paymentMonth, '%Y-%m-%d') as formattedPaymentMonth,
      DATE_FORMAT(tph.paymentDate, '%Y-%m-%d') as formattedPaymentDate,
      DATE_FORMAT(tph.paymentMonth, '%M %Y') as monthYearDisplay
    FROM TenantPaymentHistory tph
    LEFT JOIN apartment a ON tph.apartmentId = a.apartmentId
    LEFT JOIN floor f ON a.floorId = f.floorId
    LEFT JOIN building b ON f.buildingId = b.buildingId
    LEFT JOIN FinancialTransactions ft ON tph.transactionId = ft.transactionId
    WHERE tph.tenantId = ?
  `;

  const queryParams = [tenantId];

  if (filters.apartmentId) {
    query += ' AND tph.apartmentId = ?';
    queryParams.push(filters.apartmentId);
  }

  if (filters.contractId) {
    query += ' AND tph.contractId = ?';
    queryParams.push(filters.contractId);
  }

  if (filters.year) {
    query += ' AND YEAR(tph.paymentMonth) = ?';
    queryParams.push(filters.year);
  }

  if (filters.status) {
    query += ' AND tph.status = ?';
    queryParams.push(filters.status);
  }

  query += ' ORDER BY tph.paymentMonth DESC, tph.paymentDate DESC';

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

const getPaymentHistoryByApartment = async (apartmentId, filters = {}) => {
  let query = `
    SELECT 
      tph.*,
      CONCAT(u.firstName, ' ', u.lastName) as tenantName,
      u.email as tenantEmail,
      ft.referenceNumber,
      ft.receiptPath,
      DATE_FORMAT(tph.paymentMonth, '%Y-%m-%d') as formattedPaymentMonth,
      DATE_FORMAT(tph.paymentDate, '%Y-%m-%d') as formattedPaymentDate,
      DATE_FORMAT(tph.paymentMonth, '%M %Y') as monthYearDisplay
    FROM TenantPaymentHistory tph
    LEFT JOIN tenant t ON tph.tenantId = t.tenantId
    LEFT JOIN user u ON t.userId = u.userId
    LEFT JOIN FinancialTransactions ft ON tph.transactionId = ft.transactionId
    WHERE tph.apartmentId = ?
  `;

  const queryParams = [apartmentId];

  if (filters.tenantId) {
    query += ' AND tph.tenantId = ?';
    queryParams.push(filters.tenantId);
  }

  if (filters.year) {
    query += ' AND YEAR(tph.paymentMonth) = ?';
    queryParams.push(filters.year);
  }

  if (filters.status) {
    query += ' AND tph.status = ?';
    queryParams.push(filters.status);
  }

  query += ' ORDER BY tph.paymentMonth DESC, tph.paymentDate DESC';

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

const getTenantPaymentStatistics = async (tenantId, year = null) => {
  let query = `
    SELECT 
      COUNT(*) as totalPayments,
      SUM(totalPaid) as totalAmountPaid,
      SUM(rentAmount) as totalRentPaid,
      SUM(lateFee) as totalLateFees,
      AVG(totalPaid) as averagePayment,
      SUM(CASE WHEN status = 'On Time' THEN 1 ELSE 0 END) as onTimePayments,
      SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) as latePayments,
      SUM(CASE WHEN status = 'Partial' THEN 1 ELSE 0 END) as partialPayments,
      MIN(paymentDate) as firstPaymentDate,
      MAX(paymentDate) as lastPaymentDate
    FROM TenantPaymentHistory 
    WHERE tenantId = ?
  `;

  const queryParams = [tenantId];

  if (year) {
    query += ' AND YEAR(paymentMonth) = ?';
    queryParams.push(year);
  }

  const [rows] = await db.execute(query, queryParams);
  const stats = rows[0] || {};

  // Calculate payment reliability percentage
  if (stats.totalPayments > 0) {
    stats.paymentReliability = Math.round((stats.onTimePayments / stats.totalPayments) * 100);
  } else {
    stats.paymentReliability = 0;
  }

  return stats;
};

const getApartmentPaymentStatistics = async (apartmentId, year = null) => {
  let query = `
    SELECT 
      COUNT(*) as totalPayments,
      SUM(totalPaid) as totalAmountPaid,
      SUM(rentAmount) as totalRentPaid,
      SUM(lateFee) as totalLateFees,
      AVG(totalPaid) as averagePayment,
      SUM(CASE WHEN status = 'On Time' THEN 1 ELSE 0 END) as onTimePayments,
      SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) as latePayments,
      COUNT(DISTINCT tenantId) as uniqueTenants,
      MIN(paymentDate) as firstPaymentDate,
      MAX(paymentDate) as lastPaymentDate
    FROM TenantPaymentHistory 
    WHERE apartmentId = ?
  `;

  const queryParams = [apartmentId];

  if (year) {
    query += ' AND YEAR(paymentMonth) = ?';
    queryParams.push(year);
  }

  const [rows] = await db.execute(query, queryParams);
  return rows[0] || {};
};

const getMonthlyPaymentSummary = async (year, month = null) => {
  let query = `
    SELECT 
      YEAR(paymentMonth) as year,
      MONTH(paymentMonth) as month,
      MONTHNAME(paymentMonth) as monthName,
      COUNT(*) as totalPayments,
      SUM(totalPaid) as totalAmountPaid,
      SUM(rentAmount) as totalRentPaid,
      SUM(lateFee) as totalLateFees,
      SUM(CASE WHEN status = 'On Time' THEN 1 ELSE 0 END) as onTimePayments,
      SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) as latePayments,
      COUNT(DISTINCT tenantId) as uniqueTenants,
      COUNT(DISTINCT apartmentId) as uniqueApartments
    FROM TenantPaymentHistory 
    WHERE YEAR(paymentMonth) = ?
  `;

  const queryParams = [year];

  if (month) {
    query += ' AND MONTH(paymentMonth) = ?';
    queryParams.push(month);
  }

  query += ' GROUP BY YEAR(paymentMonth), MONTH(paymentMonth) ORDER BY paymentMonth DESC';

  const [rows] = await db.execute(query, queryParams);
  return rows;
};

const updatePaymentHistory = async (paymentHistoryId, updateData) => {
  const allowedFields = ['status', 'notes', 'lateFee', 'totalPaid'];
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

  values.push(paymentHistoryId);

  const query = `UPDATE TenantPaymentHistory SET ${updates.join(', ')} WHERE paymentHistoryId = ?`;
  const [result] = await db.execute(query, values);
  
  if (result.affectedRows > 0) {
    return await getPaymentHistoryById(paymentHistoryId);
  }
  
  return null;
};

const deletePaymentHistory = async (paymentHistoryId) => {
  const query = 'DELETE FROM TenantPaymentHistory WHERE paymentHistoryId = ?';
  const [result] = await db.execute(query, [paymentHistoryId]);
  return result.affectedRows > 0;
};

const getPaymentTrends = async (tenantId, months = 12) => {
  const query = `
    SELECT 
      DATE_FORMAT(paymentMonth, '%Y-%m') as monthYear,
      DATE_FORMAT(paymentMonth, '%M %Y') as monthYearDisplay,
      SUM(totalPaid) as totalPaid,
      SUM(rentAmount) as rentAmount,
      SUM(lateFee) as lateFee,
      COUNT(*) as paymentCount,
      AVG(CASE WHEN status = 'On Time' THEN 1 ELSE 0 END) as onTimeRate
    FROM TenantPaymentHistory 
    WHERE tenantId = ? 
      AND paymentMonth >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
    GROUP BY DATE_FORMAT(paymentMonth, '%Y-%m')
    ORDER BY paymentMonth DESC
  `;

  const [rows] = await db.execute(query, [tenantId, months]);
  return rows;
};

export default {
  createPaymentHistory,
  getPaymentHistoryById,
  getPaymentHistoryByTenant,
  getPaymentHistoryByApartment,
  getTenantPaymentStatistics,
  getApartmentPaymentStatistics,
  getMonthlyPaymentSummary,
  updatePaymentHistory,
  deletePaymentHistory,
  getPaymentTrends
};
