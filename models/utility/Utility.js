const { v4: uuidv4 } = require('uuid');
const db = require('../../config/db');

class Utility {
  constructor(utilityData) {
    this.utility_type_id = utilityData.utility_type_id;
    this.utility_name = utilityData.utility_name;
    this.description = utilityData.description;
    this.is_metered = utilityData.is_metered;
    this.base_charge = utilityData.base_charge;
    this.created_at = utilityData.created_at;
    this.updated_at = utilityData.updated_at;
  }

  static async create(utilityData) {
    const utilityId = uuidv4();
    
    const sql = `
      INSERT INTO Utilities (
        utility_type_id, utility_name, description, is_metered, base_charge,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const values = [
      utilityId,
      utilityData.utility_name,
      utilityData.description || null,
      utilityData.is_metered || false,
      utilityData.base_charge || 0
    ];

    await db.query(sql, values);
    return await Utility.findById(utilityId);
  }

  static async findById(id) {
    const sql = 'SELECT * FROM Utilities WHERE utility_type_id = ?';
    const [utility] = await db.query(sql, [id]);
    return utility ? new Utility(utility) : null;
  }

  static async findByName(name) {
    const sql = 'SELECT * FROM Utilities WHERE utility_name = ?';
    const [utility] = await db.query(sql, [name]);
    return utility ? new Utility(utility) : null;
  }

  static async findAll(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    let sql = 'SELECT * FROM Utilities WHERE 1=1';
    let countSql = 'SELECT COUNT(*) as total FROM Utilities WHERE 1=1';
    const values = [];

    if (filters.is_metered !== undefined) {
      sql += ' AND is_metered = ?';
      countSql += ' AND is_metered = ?';
      values.push(filters.is_metered);
    }

    if (filters.search) {
      sql += ' AND (utility_name LIKE ? OR description LIKE ?)';
      countSql += ' AND (utility_name LIKE ? OR description LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      values.push(searchTerm, searchTerm);
    }

    sql += ' ORDER BY utility_name LIMIT ? OFFSET ?';
    values.push(limit, offset);

    const [totalResult] = await db.query(countSql, values.slice(0, -2));
    const utilities = await db.query(sql, values);

    return {
      utilities: utilities.map(utility => new Utility(utility)),
      total: totalResult.total,
      page,
      pages: Math.ceil(totalResult.total / limit)
    };
  }

  async update(updateData) {
    const allowedFields = ['utility_name', 'description', 'is_metered', 'base_charge'];
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
    values.push(this.utility_type_id);

    const sql = `UPDATE Utilities SET ${updates.join(', ')} WHERE utility_type_id = ?`;
    await db.query(sql, values);

    return await Utility.findById(this.utility_type_id);
  }

  async delete() {
    const sql = 'DELETE FROM Utilities WHERE utility_type_id = ?';
    await db.query(sql, [this.utility_type_id]);
  }

  async getMeters() {
    const sql = `
      SELECT uum.*, u.unit_number, p.property_number, p.address_line1
      FROM UnitUtilityMeters uum
      INNER JOIN Units u ON uum.unit_id = u.unit_id
      INNER JOIN Properties p ON u.property_id = p.property_id
      WHERE uum.utility_type_id = ? AND uum.is_active = true
      ORDER BY p.property_number, u.unit_number
    `;
    const meters = await db.query(sql, [this.utility_type_id]);
    return meters;
  }

  async getBills(filters = {}) {
    let sql = `
      SELECT ub.*, u.unit_number, p.property_number, t.first_name, t.last_name
      FROM UtilityBills ub
      INNER JOIN Units u ON ub.unit_id = u.unit_id
      INNER JOIN Properties p ON u.property_id = p.property_id
      LEFT JOIN Tenants t ON ub.tenant_id = t.tenant_id
      WHERE ub.utility_type_id = ?
    `;
    const values = [this.utility_type_id];

    if (filters.bill_status) {
      sql += ' AND ub.bill_status = ?';
      values.push(filters.bill_status);
    }

    if (filters.date_from) {
      sql += ' AND ub.bill_date >= ?';
      values.push(filters.date_from);
    }

    if (filters.date_to) {
      sql += ' AND ub.bill_date <= ?';
      values.push(filters.date_to);
    }

    sql += ' ORDER BY ub.bill_date DESC';

    const bills = await db.query(sql, values);
    return bills;
  }

  async getConsumptionStats(year = null) {
    const currentYear = year || new Date().getFullYear();
    
    const sql = `
      SELECT 
        COUNT(*) as total_bills,
        SUM(consumption) as total_consumption,
        AVG(consumption) as average_consumption,
        SUM(amount) as total_amount,
        AVG(amount) as average_amount,
        MIN(consumption) as min_consumption,
        MAX(consumption) as max_consumption
      FROM UtilityBills 
      WHERE utility_type_id = ? AND YEAR(bill_date) = ?
    `;
    
    const [stats] = await db.query(sql, [this.utility_type_id, currentYear]);
    return stats;
  }

  async getMonthlyConsumption(year = null) {
    const currentYear = year || new Date().getFullYear();
    
    const sql = `
      SELECT 
        MONTH(bill_date) as month,
        MONTHNAME(bill_date) as month_name,
        COUNT(*) as bill_count,
        SUM(consumption) as total_consumption,
        SUM(amount) as total_amount,
        AVG(consumption) as avg_consumption
      FROM UtilityBills 
      WHERE utility_type_id = ? AND YEAR(bill_date) = ?
      GROUP BY MONTH(bill_date), MONTHNAME(bill_date)
      ORDER BY MONTH(bill_date)
    `;
    
    const trend = await db.query(sql, [this.utility_type_id, currentYear]);
    return trend;
  }
}

module.exports = Utility;
