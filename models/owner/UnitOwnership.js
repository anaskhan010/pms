const { v4: uuidv4 } = require('uuid');
const db = require('../../config/db');

class UnitOwnership {
  constructor(ownershipData) {
    this.unit_ownership_id = ownershipData.unit_ownership_id;
    this.unit_id = ownershipData.unit_id;
    this.owner_id = ownershipData.owner_id;
    this.ownership_type = ownershipData.ownership_type;
    this.ownership_start_date = ownershipData.ownership_start_date;
    this.ownership_end_date = ownershipData.ownership_end_date;
    this.loan_details = ownershipData.loan_details;
    this.contract_reference = ownershipData.contract_reference;
    this.is_current = ownershipData.is_current;
    this.created_at = ownershipData.created_at;
  }

  static async create(ownershipData) {
    const ownershipId = uuidv4();
    
    const sql = `
      INSERT INTO UnitOwnership (
        unit_ownership_id, unit_id, owner_id, ownership_type, ownership_start_date,
        ownership_end_date, loan_details, contract_reference, is_current, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    
    const values = [
      ownershipId,
      ownershipData.unit_id,
      ownershipData.owner_id,
      ownershipData.ownership_type,
      ownershipData.ownership_start_date,
      ownershipData.ownership_end_date || null,
      ownershipData.loan_details || null,
      ownershipData.contract_reference || null,
      ownershipData.is_current !== undefined ? ownershipData.is_current : true
    ];

    await db.query(sql, values);
    return await UnitOwnership.findById(ownershipId);
  }

  static async findById(id) {
    const sql = 'SELECT * FROM UnitOwnership WHERE unit_ownership_id = ?';
    const [ownership] = await db.query(sql, [id]);
    return ownership ? new UnitOwnership(ownership) : null;
  }

  static async findAll(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    let sql = `
      SELECT uo.*, u.unit_number, p.property_number, p.address_line1, o.name as owner_name
      FROM UnitOwnership uo
      INNER JOIN Units u ON uo.unit_id = u.unit_id
      INNER JOIN Properties p ON u.property_id = p.property_id
      INNER JOIN Owners o ON uo.owner_id = o.owner_id
      WHERE 1=1
    `;
    let countSql = 'SELECT COUNT(*) as total FROM UnitOwnership WHERE 1=1';
    const values = [];

    if (filters.unit_id) {
      sql += ' AND uo.unit_id = ?';
      countSql += ' AND unit_id = ?';
      values.push(filters.unit_id);
    }

    if (filters.owner_id) {
      sql += ' AND uo.owner_id = ?';
      countSql += ' AND owner_id = ?';
      values.push(filters.owner_id);
    }

    if (filters.ownership_type) {
      sql += ' AND uo.ownership_type = ?';
      countSql += ' AND ownership_type = ?';
      values.push(filters.ownership_type);
    }

    if (filters.is_current !== undefined) {
      sql += ' AND uo.is_current = ?';
      countSql += ' AND is_current = ?';
      values.push(filters.is_current);
    }

    sql += ' ORDER BY uo.created_at DESC LIMIT ? OFFSET ?';
    values.push(limit, offset);

    const [totalResult] = await db.query(countSql, values.slice(0, -2));
    const ownerships = await db.query(sql, values);

    return {
      ownerships: ownerships.map(ownership => new UnitOwnership(ownership)),
      total: totalResult.total,
      page,
      pages: Math.ceil(totalResult.total / limit)
    };
  }

  async update(updateData) {
    const allowedFields = [
      'ownership_type', 'ownership_start_date', 'ownership_end_date',
      'loan_details', 'contract_reference', 'is_current'
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

    values.push(this.unit_ownership_id);

    const sql = `UPDATE UnitOwnership SET ${updates.join(', ')} WHERE unit_ownership_id = ?`;
    await db.query(sql, values);

    return await UnitOwnership.findById(this.unit_ownership_id);
  }

  async delete() {
    const sql = 'DELETE FROM UnitOwnership WHERE unit_ownership_id = ?';
    await db.query(sql, [this.unit_ownership_id]);
  }

  async getDetails() {
    const sql = `
      SELECT 
        uo.*,
        u.unit_number, u.unit_type, u.area_sqm,
        p.property_number, p.address_line1, p.city,
        o.name as owner_name, o.owner_type, o.email as owner_email
      FROM UnitOwnership uo
      INNER JOIN Units u ON uo.unit_id = u.unit_id
      INNER JOIN Properties p ON u.property_id = p.property_id
      INNER JOIN Owners o ON uo.owner_id = o.owner_id
      WHERE uo.unit_ownership_id = ?
    `;
    
    const [details] = await db.query(sql, [this.unit_ownership_id]);
    return details;
  }

  static async transferOwnership(unitId, newOwnerId, transferData) {
    return await db.transaction(async (connection) => {
      await connection.execute(
        'UPDATE UnitOwnership SET is_current = false, ownership_end_date = ? WHERE unit_id = ? AND is_current = true',
        [transferData.transfer_date, unitId]
      );

      const newOwnershipId = uuidv4();
      await connection.execute(`
        INSERT INTO UnitOwnership (
          unit_ownership_id, unit_id, owner_id, ownership_type, ownership_start_date,
          loan_details, contract_reference, is_current, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, true, NOW())
      `, [
        newOwnershipId,
        unitId,
        newOwnerId,
        transferData.ownership_type || 'Primary',
        transferData.transfer_date,
        transferData.loan_details || null,
        transferData.contract_reference || null
      ]);

      return await UnitOwnership.findById(newOwnershipId);
    });
  }

  static async getUnitOwnershipHistory(unitId) {
    const sql = `
      SELECT uo.*, o.name as owner_name, o.owner_type
      FROM UnitOwnership uo
      INNER JOIN Owners o ON uo.owner_id = o.owner_id
      WHERE uo.unit_id = ?
      ORDER BY uo.ownership_start_date DESC
    `;
    const history = await db.query(sql, [unitId]);
    return history;
  }
}

module.exports = UnitOwnership;
