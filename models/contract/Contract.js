const db = require('../../config/db');

// Create a new contract
const createContract = async (contractData) => {
 
  
  const sql = `
    INSERT INTO Contracts (
      unit_id, tenant_id, owner_id, contract_type, start_date,
      end_date, duration_years, monthly_rent_amount, currency, payment_frequency,
      grace_period_days, default_payment_day_of_month, contract_status,
      signed_date, document_link
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const values = [
    contractData.unit_id,
    contractData.tenant_id,
    contractData.owner_id,
    contractData.contract_type,
    contractData.start_date,
    contractData.end_date,
    contractData.duration_years || null,
    contractData.monthly_rent_amount,
    contractData.currency,
    contractData.payment_frequency,
    contractData.grace_period_days || 0,
    contractData.default_payment_day_of_month || 1,
    contractData.contract_status || 'Pending',
    contractData.signed_date || null,
    contractData.document_link || null
  ];

  const result = await db.query(sql, values);
  const contractId = result[0].insertId
  return await findContractById(contractId);
};

// Find contract by ID
const findContractById = async (id) => {
  const sql = 'SELECT * FROM Contracts WHERE contract_id = ?';
  const [contract] = await db.query(sql, [id]);
  return contract || null;
};

// Get all contracts with pagination
const findAllContracts = async (page = 1, limit = 10, filters = {}) => {
  const offset = (page - 1) * limit;
  let sql = `
    SELECT c.*, t.first_name, t.last_name, u.unit_number, p.property_number, p.address_line1
    FROM Contracts c
    INNER JOIN Tenants t ON c.tenant_id = t.tenant_id
    INNER JOIN Units u ON c.unit_id = u.unit_id
    INNER JOIN Properties p ON u.property_id = p.property_id
    WHERE 1=1
  `;
  let countSql = 'SELECT COUNT(*) as total FROM Contracts WHERE 1=1';
  const values = [];

  // Apply filters
  if (filters.contract_status) {
    sql += ' AND c.contract_status = ?';
    countSql += ' AND contract_status = ?';
    values.push(filters.contract_status);
  }

  if (filters.contract_type) {
    sql += ' AND c.contract_type = ?';
    countSql += ' AND contract_type = ?';
    values.push(filters.contract_type);
  }

  if (filters.unit_id) {
    sql += ' AND c.unit_id = ?';
    countSql += ' AND unit_id = ?';
    values.push(filters.unit_id);
  }

  if (filters.tenant_id) {
    sql += ' AND c.tenant_id = ?';
    countSql += ' AND tenant_id = ?';
    values.push(filters.tenant_id);
  }

  sql += ' ORDER BY c.created_at DESC LIMIT ? OFFSET ?';
  values.push(limit, offset);

  const [totalResult] = await db.query(countSql, values.slice(0, -2));
  const contracts = await db.query(sql, values);

  return {
    contracts,
    total: totalResult.total,
    page,
    pages: Math.ceil(totalResult.total / limit)
  };
};

// Update contract
const updateContract = async (contractId, updateData) => {
  const allowedFields = [
    'contract_type', 'start_date', 'end_date', 'duration_years',
    'monthly_rent_amount', 'currency', 'payment_frequency',
    'grace_period_days', 'default_payment_day_of_month',
    'contract_status', 'signed_date', 'document_link'
  ];
  const updates = [];
  const values = [];

  for (const [key, value] of Object.entries(updateData)) {
    if (allowedFields.includes(key) && value !== undefined) {
      updates.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (updates.length === 0) {
    throw new Error('No valid fields to update');
  }

  updates.push('updated_at = NOW()');
  values.push(contractId);

  const sql = `UPDATE Contracts SET ${updates.join(', ')} WHERE contract_id = ?`;
  await db.query(sql, values);

  return await findContractById(contractId);
};

// Delete contract
const deleteContract = async (contractId) => {
  const sql = 'DELETE FROM Contracts WHERE contract_id = ?';
  await db.query(sql, [contractId]);
  return { success: true, message: 'Contract deleted successfully' };
};

// Get contract details with related data
const getContractDetails = async (contractId) => {
  const sql = `
    SELECT 
      c.*,
      t.first_name, t.last_name, t.email as tenant_email, t.phone_number as tenant_phone,
      u.unit_number, u.unit_type, u.area_sqm,
      p.property_number, p.address_line1, p.city, p.country,
      o.name as owner_name, o.email as owner_email
    FROM Contracts c
    INNER JOIN Tenants t ON c.tenant_id = t.tenant_id
    INNER JOIN Units u ON c.unit_id = u.unit_id
    INNER JOIN Properties p ON u.property_id = p.property_id
    INNER JOIN Owners o ON c.owner_id = o.owner_id
    WHERE c.contract_id = ?
  `;
  
  const [details] = await db.query(sql, [contractId]);
  return details;
};

// Get contract invoices
const getContractInvoices = async (contractId) => {
  const sql = `
    SELECT * FROM Invoices 
    WHERE contract_id = ? 
    ORDER BY invoice_date DESC
  `;
  const invoices = await db.query(sql, [contractId]);
  return invoices;
};

// Get contract payments
const getContractPayments = async (contractId) => {
  const sql = `
    SELECT p.*, i.invoice_number 
    FROM Payments p
    LEFT JOIN Invoices i ON p.invoice_id = i.invoice_id
    WHERE p.contract_id = ? 
    ORDER BY p.recorded_at DESC
  `;
  const payments = await db.query(sql, [contractId]);
  return payments;
};

// Check if contract is active
const isContractActive = (contract) => {
  return contract.contract_status === 'Active';
};

// Check if contract is expired
const isContractExpired = (contract) => {
  if (!contract.end_date) return false;
  return new Date(contract.end_date) < new Date();
};

// Get remaining days
const getContractRemainingDays = (contract) => {
  if (!contract.end_date) return null;
  const today = new Date();
  const endDate = new Date(contract.end_date);
  const diffTime = endDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Export all functions
module.exports = {
  createContract,
  findContractById,
  findAllContracts,
  updateContract,
  deleteContract,
  getContractDetails,
  getContractInvoices,
  getContractPayments,
  isContractActive,
  isContractExpired,
  getContractRemainingDays
};