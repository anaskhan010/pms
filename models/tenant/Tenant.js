const { v4: uuidv4 } = require('uuid');
const db = require('../../config/db');

class Tenant {
  constructor(tenantData) {
    this.tenant_id = tenantData.tenant_id;
    this.first_name = tenantData.first_name;
    this.last_name = tenantData.last_name;
    this.email = tenantData.email;
    this.phone_number = tenantData.phone_number;
    this.nationality = tenantData.nationality;
    this.id_document_type = tenantData.id_document_type;
    this.id_document_number = tenantData.id_document_number;
    this.date_of_birth = tenantData.date_of_birth;
    this.emergency_contact_name = tenantData.emergency_contact_name;
    this.emergency_contact_phone = tenantData.emergency_contact_phone;
    this.notes = tenantData.notes;
    this.created_at = tenantData.created_at;
    this.updated_at = tenantData.updated_at;
  }

  // Create a new tenant
  static async create(tenantData) {
    const tenantId = uuidv4();
    
    const sql = `
      INSERT INTO Tenants (
        tenant_id, first_name, last_name, email, phone_number, nationality,
        id_document_type, id_document_number, date_of_birth, emergency_contact_name,
        emergency_contact_phone, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const values = [
      tenantId,
      tenantData.first_name,
      tenantData.last_name,
      tenantData.email,
      tenantData.phone_number || null,
      tenantData.nationality || null,
      tenantData.id_document_type,
      tenantData.id_document_number,
      tenantData.date_of_birth || null,
      tenantData.emergency_contact_name || null,
      tenantData.emergency_contact_phone || null,
      tenantData.notes || null
    ];

    await db.query(sql, values);
    return await Tenant.findById(tenantId);
  }

  // Find tenant by ID
  static async findById(id) {
    const sql = 'SELECT * FROM Tenants WHERE tenant_id = ?';
    const [tenant] = await db.query(sql, [id]);
    return tenant ? new Tenant(tenant) : null;
  }

  // Find tenant by email
  static async findByEmail(email) {
    const sql = 'SELECT * FROM Tenants WHERE email = ?';
    const [tenant] = await db.query(sql, [email]);
    return tenant ? new Tenant(tenant) : null;
  }

  // Get all tenants with pagination
  static async findAll(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    let sql = 'SELECT * FROM Tenants WHERE 1=1';
    let countSql = 'SELECT COUNT(*) as total FROM Tenants WHERE 1=1';
    const values = [];

    // Apply filters
    if (filters.nationality) {
      sql += ' AND nationality = ?';
      countSql += ' AND nationality = ?';
      values.push(filters.nationality);
    }

    if (filters.search) {
      sql += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone_number LIKE ?)';
      countSql += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone_number LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      values.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    values.push(limit, offset);

    const [totalResult] = await db.query(countSql, values.slice(0, -2));
    const tenants = await db.query(sql, values);

    return {
      tenants: tenants.map(tenant => new Tenant(tenant)),
      total: totalResult.total,
      page,
      pages: Math.ceil(totalResult.total / limit)
    };
  }

  // Update tenant
  async update(updateData) {
    const allowedFields = [
      'first_name', 'last_name', 'email', 'phone_number', 'nationality',
      'id_document_type', 'id_document_number', 'date_of_birth',
      'emergency_contact_name', 'emergency_contact_phone', 'notes'
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
    values.push(this.tenant_id);

    const sql = `UPDATE Tenants SET ${updates.join(', ')} WHERE tenant_id = ?`;
    await db.query(sql, values);

    return await Tenant.findById(this.tenant_id);
  }

  // Delete tenant
  async delete() {
    const sql = 'DELETE FROM Tenants WHERE tenant_id = ?';
    await db.query(sql, [this.tenant_id]);
  }

  // Get tenant's contracts
  async getContracts() {
    const sql = `
      SELECT c.*, u.unit_number, p.property_number, p.address_line1 
      FROM Contracts c
      INNER JOIN Units u ON c.unit_id = u.unit_id
      INNER JOIN Properties p ON u.property_id = p.property_id
      WHERE c.tenant_id = ?
      ORDER BY c.created_at DESC
    `;
    const contracts = await db.query(sql, [this.tenant_id]);
    return contracts;
  }

  // Get active contracts
  async getActiveContracts() {
    const sql = `
      SELECT c.*, u.unit_number, p.property_number, p.address_line1 
      FROM Contracts c
      INNER JOIN Units u ON c.unit_id = u.unit_id
      INNER JOIN Properties p ON u.property_id = p.property_id
      WHERE c.tenant_id = ? AND c.contract_status = 'Active'
      ORDER BY c.created_at DESC
    `;
    const contracts = await db.query(sql, [this.tenant_id]);
    return contracts;
  }

  // Get tenant's payments
  async getPayments(limit = 10) {
    const sql = `
      SELECT p.*, i.invoice_number, c.unit_id, u.unit_number
      FROM Payments p
      LEFT JOIN Invoices i ON p.invoice_id = i.invoice_id
      LEFT JOIN Contracts c ON p.contract_id = c.contract_id
      LEFT JOIN Units u ON c.unit_id = u.unit_id
      WHERE p.tenant_id = ?
      ORDER BY p.recorded_at DESC
      LIMIT ?
    `;
    const payments = await db.query(sql, [this.tenant_id, limit]);
    return payments;
  }

  // Get tenant's tickets
  async getTickets(limit = 10) {
    const sql = `
      SELECT t.*, u.unit_number, p.property_number
      FROM Tickets t
      INNER JOIN Units u ON t.unit_id = u.unit_id
      INNER JOIN Properties p ON u.property_id = p.property_id
      WHERE t.tenant_id = ?
      ORDER BY t.opened_at DESC
      LIMIT ?
    `;
    const tickets = await db.query(sql, [this.tenant_id, limit]);
    return tickets;
  }

  // Get full name
  get fullName() {
    return `${this.first_name} ${this.last_name}`.trim();
  }
}

module.exports = Tenant;
