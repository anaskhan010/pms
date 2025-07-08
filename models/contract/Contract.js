const db = require('../../config/db');

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

const findContractById = async (id) => {
  const sql = 'SELECT * FROM Contracts WHERE contract_id = ?';
  const [contract] = await db.query(sql, [id]);
  return contract || null;
};

const findAllContracts = async (page = 1, limit = 10) => {
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

  sql += ' ORDER BY c.created_at DESC LIMIT ? OFFSET ?';
  values.push(limit, offset);

  const [totalResult] = await db.query(countSql, values.slice(0, -2));
  console.log(totalResult[0].total,"====constracts====")
  const contracts = await db.query(sql, values);

 

  return {
    contracts:contracts[0],
    total: totalResult[0].total,
    page,
    pages: Math.ceil(totalResult.total / limit)
  };
};

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

const deleteContract = async (contractId) => {
  const sql = 'DELETE FROM Contracts WHERE contract_id = ?';
  await db.query(sql, [contractId]);
  return { success: true, message: 'Contract deleted successfully' };
};

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

const getContractInvoices = async (contractId) => {
  const sql = `
    SELECT * FROM Invoices 
    WHERE contract_id = ? 
    ORDER BY invoice_date DESC
  `;
  const invoices = await db.query(sql, [contractId]);
  return invoices;
};

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

const isContractActive = (contract) => {
  return contract.contract_status === 'Active';
};

const isContractExpired = (contract) => {
  if (!contract.end_date) return false;
  return new Date(contract.end_date) < new Date();
};

const getContractRemainingDays = (contract) => {
  if (!contract.end_date) return null;
  const today = new Date();
  const endDate = new Date(contract.end_date);
  const diffTime = endDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

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