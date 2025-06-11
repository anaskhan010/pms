const { v4: uuidv4 } = require('uuid');
const db = require('../../config/db');

class Owner {
  constructor(ownerData) {
    this.owner_id = ownerData.owner_id;
    this.owner_type = ownerData.owner_type;
    this.name = ownerData.name;
    this.contact_person = ownerData.contact_person;
    this.email = ownerData.email;
    this.phone_number = ownerData.phone_number;
    this.address = ownerData.address;
    this.id_document_info = ownerData.id_document_info;
    this.created_at = ownerData.created_at;
    this.updated_at = ownerData.updated_at;
  }

  // Create a new owner
  static async create(ownerData) {
    const ownerId = uuidv4();
    
    const sql = `
      INSERT INTO Owners (
        owner_id, owner_type, name, contact_person, email, phone_number,
        address, id_document_info, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const values = [
      ownerId,
      ownerData.owner_type,
      ownerData.name,
      ownerData.contact_person || null,
      ownerData.email || null,
      ownerData.phone_number || null,
      ownerData.address || null,
      ownerData.id_document_info || null
    ];

    await db.query(sql, values);
    return await Owner.findById(ownerId);
  }

  // Find owner by ID
  static async findById(id) {
    const sql = 'SELECT * FROM Owners WHERE owner_id = ?';
    const [owner] = await db.query(sql, [id]);
    return owner ? new Owner(owner) : null;
  }

  // Find owner by email
  static async findByEmail(email) {
    const sql = 'SELECT * FROM Owners WHERE email = ?';
    const [owner] = await db.query(sql, [email]);
    return owner ? new Owner(owner) : null;
  }

  // Get all owners with pagination
  static async findAll(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    let sql = 'SELECT * FROM Owners WHERE 1=1';
    let countSql = 'SELECT COUNT(*) as total FROM Owners WHERE 1=1';
    const values = [];

    // Apply filters
    if (filters.owner_type) {
      sql += ' AND owner_type = ?';
      countSql += ' AND owner_type = ?';
      values.push(filters.owner_type);
    }

    if (filters.search) {
      sql += ' AND (name LIKE ? OR email LIKE ? OR phone_number LIKE ?)';
      countSql += ' AND (name LIKE ? OR email LIKE ? OR phone_number LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      values.push(searchTerm, searchTerm, searchTerm);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    values.push(limit, offset);

    const [totalResult] = await db.query(countSql, values.slice(0, -2));
    const owners = await db.query(sql, values);

    return {
      owners: owners.map(owner => new Owner(owner)),
      total: totalResult.total,
      page,
      pages: Math.ceil(totalResult.total / limit)
    };
  }

  // Update owner
  async update(updateData) {
    const allowedFields = [
      'owner_type', 'name', 'contact_person', 'email', 'phone_number',
      'address', 'id_document_info'
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
    values.push(this.owner_id);

    const sql = `UPDATE Owners SET ${updates.join(', ')} WHERE owner_id = ?`;
    await db.query(sql, values);

    return await Owner.findById(this.owner_id);
  }

  // Delete owner
  async delete() {
    const sql = 'DELETE FROM Owners WHERE owner_id = ?';
    await db.query(sql, [this.owner_id]);
  }

  // Get owner's properties through unit ownership
  async getProperties() {
    const sql = `
      SELECT DISTINCT p.*, COUNT(uo.unit_id) as owned_units
      FROM Properties p
      INNER JOIN Units u ON p.property_id = u.property_id
      INNER JOIN UnitOwnership uo ON u.unit_id = uo.unit_id
      WHERE uo.owner_id = ? AND uo.is_current = true
      GROUP BY p.property_id
      ORDER BY p.created_at DESC
    `;
    const properties = await db.query(sql, [this.owner_id]);
    return properties;
  }

  // Get owner's units
  async getUnits() {
    const sql = `
      SELECT u.*, p.property_number, p.address_line1, uo.ownership_type
      FROM Units u
      INNER JOIN Properties p ON u.property_id = p.property_id
      INNER JOIN UnitOwnership uo ON u.unit_id = uo.unit_id
      WHERE uo.owner_id = ? AND uo.is_current = true
      ORDER BY p.property_number, u.unit_number
    `;
    const units = await db.query(sql, [this.owner_id]);
    return units;
  }

  // Get owner's contracts
  async getContracts() {
    const sql = `
      SELECT c.*, u.unit_number, p.property_number, t.first_name, t.last_name
      FROM Contracts c
      INNER JOIN Units u ON c.unit_id = u.unit_id
      INNER JOIN Properties p ON u.property_id = p.property_id
      INNER JOIN Tenants t ON c.tenant_id = t.tenant_id
      WHERE c.owner_id = ?
      ORDER BY c.created_at DESC
    `;
    const contracts = await db.query(sql, [this.owner_id]);
    return contracts;
  }

  // Get owner's financial summary
  async getFinancialSummary() {
    const sql = `
      SELECT 
        COUNT(DISTINCT c.contract_id) as total_contracts,
        COUNT(DISTINCT CASE WHEN c.contract_status = 'Active' THEN c.contract_id END) as active_contracts,
        SUM(CASE WHEN c.contract_status = 'Active' THEN c.monthly_rent_amount ELSE 0 END) as monthly_income,
        COUNT(DISTINCT i.invoice_id) as total_invoices,
        SUM(CASE WHEN i.invoice_status = 'Paid' THEN i.total_amount ELSE 0 END) as total_received,
        SUM(CASE WHEN i.invoice_status IN ('Generated', 'Sent', 'Overdue') THEN i.amount_due ELSE 0 END) as outstanding_amount
      FROM Contracts c
      LEFT JOIN Invoices i ON c.contract_id = i.contract_id
      WHERE c.owner_id = ?
    `;
    
    const [summary] = await db.query(sql, [this.owner_id]);
    return summary;
  }
}

module.exports = Owner;
