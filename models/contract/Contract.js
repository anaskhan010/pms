const { v4: uuidv4 } = require('uuid');
const db = require('../../config/db');

class Contract {
  constructor(contractData) {
    this.contract_id = contractData.contract_id;
    this.unit_id = contractData.unit_id;
    this.tenant_id = contractData.tenant_id;
    this.owner_id = contractData.owner_id;
    this.contract_type = contractData.contract_type;
    this.start_date = contractData.start_date;
    this.end_date = contractData.end_date;
    this.duration_years = contractData.duration_years;
    this.monthly_rent_amount = contractData.monthly_rent_amount;
    this.currency = contractData.currency;
    this.payment_frequency = contractData.payment_frequency;
    this.grace_period_days = contractData.grace_period_days;
    this.default_payment_day_of_month = contractData.default_payment_day_of_month;
    this.contract_status = contractData.contract_status;
    this.signed_date = contractData.signed_date;
    this.document_link = contractData.document_link;
    this.created_at = contractData.created_at;
    this.updated_at = contractData.updated_at;
  }

  // Create a new contract
  static async create(contractData) {
    const contractId = uuidv4();
    
    const sql = `
      INSERT INTO Contracts (
        contract_id, unit_id, tenant_id, owner_id, contract_type, start_date,
        end_date, duration_years, monthly_rent_amount, currency, payment_frequency,
        grace_period_days, default_payment_day_of_month, contract_status,
        signed_date, document_link, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const values = [
      contractId,
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

    await db.query(sql, values);
    return await Contract.findById(contractId);
  }

  // Find contract by ID
  static async findById(id) {
    const sql = 'SELECT * FROM Contracts WHERE contract_id = ?';
    const [contract] = await db.query(sql, [id]);
    return contract ? new Contract(contract) : null;
  }

  // Get all contracts with pagination
  static async findAll(page = 1, limit = 10, filters = {}) {
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
      contracts: contracts.map(contract => new Contract(contract)),
      total: totalResult.total,
      page,
      pages: Math.ceil(totalResult.total / limit)
    };
  }

  // Update contract
  async update(updateData) {
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
    values.push(this.contract_id);

    const sql = `UPDATE Contracts SET ${updates.join(', ')} WHERE contract_id = ?`;
    await db.query(sql, values);

    return await Contract.findById(this.contract_id);
  }

  // Delete contract
  async delete() {
    const sql = 'DELETE FROM Contracts WHERE contract_id = ?';
    await db.query(sql, [this.contract_id]);
  }

  // Get contract details with related data
  async getDetails() {
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
    
    const [details] = await db.query(sql, [this.contract_id]);
    return details;
  }

  // Get contract invoices
  async getInvoices() {
    const sql = `
      SELECT * FROM Invoices 
      WHERE contract_id = ? 
      ORDER BY invoice_date DESC
    `;
    const invoices = await db.query(sql, [this.contract_id]);
    return invoices;
  }

  // Get contract payments
  async getPayments() {
    const sql = `
      SELECT p.*, i.invoice_number 
      FROM Payments p
      LEFT JOIN Invoices i ON p.invoice_id = i.invoice_id
      WHERE p.contract_id = ? 
      ORDER BY p.recorded_at DESC
    `;
    const payments = await db.query(sql, [this.contract_id]);
    return payments;
  }

  // Check if contract is active
  isActive() {
    return this.contract_status === 'Active';
  }

  // Check if contract is expired
  isExpired() {
    if (!this.end_date) return false;
    return new Date(this.end_date) < new Date();
  }

  // Get remaining days
  getRemainingDays() {
    if (!this.end_date) return null;
    const today = new Date();
    const endDate = new Date(this.end_date);
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
}

module.exports = Contract;
