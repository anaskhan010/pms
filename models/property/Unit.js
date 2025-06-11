const { v4: uuidv4 } = require('uuid');
const db = require('../../config/db');

class Unit {
  constructor(unitData) {
    this.unit_id = unitData.unit_id;
    this.property_id = unitData.property_id;
    this.unit_number = unitData.unit_number;
    this.unit_type = unitData.unit_type;
    this.num_bedrooms = unitData.num_bedrooms;
    this.num_bathrooms = unitData.num_bathrooms;
    this.area_sqm = unitData.area_sqm;
    this.current_status = unitData.current_status;
    this.is_merged = unitData.is_merged;
    this.merged_group_id = unitData.merged_group_id;
    this.description = unitData.description;
    this.created_at = unitData.created_at;
    this.updated_at = unitData.updated_at;
  }

  // Create a new unit
  static async create(unitData) {
    const unitId = uuidv4();
    
    const sql = `
      INSERT INTO Units (
        unit_id, property_id, unit_number, unit_type, num_bedrooms, 
        num_bathrooms, area_sqm, current_status, is_merged, 
        merged_group_id, description, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const values = [
      unitId,
      unitData.property_id,
      unitData.unit_number,
      unitData.unit_type,
      unitData.num_bedrooms || null,
      unitData.num_bathrooms || null,
      unitData.area_sqm || null,
      unitData.current_status || 'Vacant',
      unitData.is_merged || false,
      unitData.merged_group_id || null,
      unitData.description || null
    ];

    await db.query(sql, values);
    return await Unit.findById(unitId);
  }

  // Find unit by ID
  static async findById(id) {
    const sql = 'SELECT * FROM Units WHERE unit_id = ?';
    const [unit] = await db.query(sql, [id]);
    return unit ? new Unit(unit) : null;
  }

  // Get all units with pagination
  static async findAll(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    let sql = `
      SELECT u.*, p.property_number, p.address_line1, p.city 
      FROM Units u 
      LEFT JOIN Properties p ON u.property_id = p.property_id 
      WHERE 1=1
    `;
    let countSql = 'SELECT COUNT(*) as total FROM Units u WHERE 1=1';
    const values = [];

    // Apply filters
    if (filters.property_id) {
      sql += ' AND u.property_id = ?';
      countSql += ' AND property_id = ?';
      values.push(filters.property_id);
    }

    if (filters.unit_type) {
      sql += ' AND u.unit_type = ?';
      countSql += ' AND unit_type = ?';
      values.push(filters.unit_type);
    }

    if (filters.current_status) {
      sql += ' AND u.current_status = ?';
      countSql += ' AND current_status = ?';
      values.push(filters.current_status);
    }

    if (filters.search) {
      sql += ' AND (u.unit_number LIKE ? OR u.description LIKE ?)';
      countSql += ' AND (unit_number LIKE ? OR description LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      values.push(searchTerm, searchTerm);
    }

    sql += ' ORDER BY u.created_at DESC LIMIT ? OFFSET ?';
    values.push(limit, offset);

    const [totalResult] = await db.query(countSql, values.slice(0, -2));
    const units = await db.query(sql, values);

    return {
      units: units.map(unit => new Unit(unit)),
      total: totalResult.total,
      page,
      pages: Math.ceil(totalResult.total / limit)
    };
  }

  // Update unit
  async update(updateData) {
    const allowedFields = [
      'unit_number', 'unit_type', 'num_bedrooms', 'num_bathrooms', 
      'area_sqm', 'current_status', 'is_merged', 'merged_group_id', 'description'
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
    values.push(this.unit_id);

    const sql = `UPDATE Units SET ${updates.join(', ')} WHERE unit_id = ?`;
    await db.query(sql, values);

    return await Unit.findById(this.unit_id);
  }

  // Delete unit
  async delete() {
    const sql = 'DELETE FROM Units WHERE unit_id = ?';
    await db.query(sql, [this.unit_id]);
  }

  // Get property details
  async getProperty() {
    const sql = 'SELECT * FROM Properties WHERE property_id = ?';
    const [property] = await db.query(sql, [this.property_id]);
    return property;
  }

  // Get current contract
  async getCurrentContract() {
    const sql = `
      SELECT * FROM Contracts 
      WHERE unit_id = ? AND contract_status = 'Active' 
      ORDER BY created_at DESC LIMIT 1
    `;
    const [contract] = await db.query(sql, [this.unit_id]);
    return contract;
  }

  // Get current tenant
  async getCurrentTenant() {
    const sql = `
      SELECT t.* FROM Tenants t
      INNER JOIN Contracts c ON t.tenant_id = c.tenant_id
      WHERE c.unit_id = ? AND c.contract_status = 'Active'
      ORDER BY c.created_at DESC LIMIT 1
    `;
    const [tenant] = await db.query(sql, [this.unit_id]);
    return tenant;
  }

  // Get unit ownership
  async getOwnership() {
    const sql = `
      SELECT uo.*, o.name as owner_name, o.email as owner_email 
      FROM UnitOwnership uo
      INNER JOIN Owners o ON uo.owner_id = o.owner_id
      WHERE uo.unit_id = ? AND uo.is_current = true
      ORDER BY uo.ownership_start_date DESC
    `;
    const ownership = await db.query(sql, [this.unit_id]);
    return ownership;
  }

  // Get utility meters
  async getUtilityMeters() {
    const sql = `
      SELECT uum.*, u.utility_name 
      FROM UnitUtilityMeters uum
      INNER JOIN Utilities u ON uum.utility_type_id = u.utility_type_id
      WHERE uum.unit_id = ? AND uum.is_active = true
    `;
    const meters = await db.query(sql, [this.unit_id]);
    return meters;
  }

  // Get recent tickets
  async getRecentTickets(limit = 5) {
    const sql = `
      SELECT * FROM Tickets 
      WHERE unit_id = ? 
      ORDER BY opened_at DESC 
      LIMIT ?
    `;
    const tickets = await db.query(sql, [this.unit_id, limit]);
    return tickets;
  }
}

module.exports = Unit;
