const { v4: uuidv4 } = require('uuid');
const db = require('../../config/db');

class Property {
  constructor(propertyData) {
    this.property_id = propertyData.property_id;
    this.property_number = propertyData.property_number;
    this.address_line1 = propertyData.address_line1;
    this.address_line2 = propertyData.address_line2;
    this.city = propertyData.city;
    this.state_province = propertyData.state_province;
    this.postal_code = propertyData.postal_code;
    this.country = propertyData.country;
    this.plot_size_sqm = propertyData.plot_size_sqm;
    this.total_units = propertyData.total_units;
    this.description = propertyData.description;
    this.created_at = propertyData.created_at;
    this.updated_at = propertyData.updated_at;
  }

  // Create a new property
  static async create(propertyData) {
    const propertyId = uuidv4();
    
    const sql = `
      INSERT INTO Properties (
        property_id, property_number, address_line1, address_line2, city, 
        state_province, postal_code, country, plot_size_sqm, total_units, 
        description, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const values = [
      propertyId,
      propertyData.property_number,
      propertyData.address_line1,
      propertyData.address_line2 || null,
      propertyData.city,
      propertyData.state_province || null,
      propertyData.postal_code || null,
      propertyData.country,
      propertyData.plot_size_sqm || null,
      propertyData.total_units || null,
      propertyData.description || null
    ];

    await db.query(sql, values);
    return await Property.findById(propertyId);
  }

  // Find property by ID
  static async findById(id) {
    const sql = 'SELECT * FROM Properties WHERE property_id = ?';
    const [property] = await db.query(sql, [id]);
    return property ? new Property(property) : null;
  }

  // Get all properties with pagination
  static async findAll(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    let sql = 'SELECT * FROM Properties WHERE 1=1';
    let countSql = 'SELECT COUNT(*) as total FROM Properties WHERE 1=1';
    const values = [];

    // Apply filters
    if (filters.city) {
      sql += ' AND city LIKE ?';
      countSql += ' AND city LIKE ?';
      values.push(`%${filters.city}%`);
    }

    if (filters.country) {
      sql += ' AND country = ?';
      countSql += ' AND country = ?';
      values.push(filters.country);
    }

    if (filters.search) {
      sql += ' AND (property_number LIKE ? OR address_line1 LIKE ? OR city LIKE ?)';
      countSql += ' AND (property_number LIKE ? OR address_line1 LIKE ? OR city LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      values.push(searchTerm, searchTerm, searchTerm);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    values.push(limit, offset);

    const [totalResult] = await db.query(countSql, values.slice(0, -2));
    const properties = await db.query(sql, values);

    return {
      properties: properties.map(property => new Property(property)),
      total: totalResult.total,
      page,
      pages: Math.ceil(totalResult.total / limit)
    };
  }

  // Update property
  async update(updateData) {
    const allowedFields = [
      'property_number', 'address_line1', 'address_line2', 'city', 
      'state_province', 'postal_code', 'country', 'plot_size_sqm', 
      'total_units', 'description'
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
    values.push(this.property_id);

    const sql = `UPDATE Properties SET ${updates.join(', ')} WHERE property_id = ?`;
    await db.query(sql, values);

    return await Property.findById(this.property_id);
  }

  // Delete property
  async delete() {
    const sql = 'DELETE FROM Properties WHERE property_id = ?';
    await db.query(sql, [this.property_id]);
  }

  // Get units for this property
  async getUnits() {
    const sql = 'SELECT * FROM Units WHERE property_id = ? ORDER BY unit_number';
    const units = await db.query(sql, [this.property_id]);
    return units;
  }

  // Get property statistics
  async getStatistics() {
    const sql = `
      SELECT 
        COUNT(*) as total_units,
        SUM(CASE WHEN current_status = 'Occupied' THEN 1 ELSE 0 END) as occupied_units,
        SUM(CASE WHEN current_status = 'Vacant' THEN 1 ELSE 0 END) as vacant_units,
        SUM(CASE WHEN current_status = 'For Rent' THEN 1 ELSE 0 END) as for_rent_units,
        SUM(CASE WHEN current_status = 'For Sale' THEN 1 ELSE 0 END) as for_sale_units,
        SUM(CASE WHEN current_status = 'Maintenance' THEN 1 ELSE 0 END) as maintenance_units
      FROM Units 
      WHERE property_id = ?
    `;
    
    const [stats] = await db.query(sql, [this.property_id]);
    return stats;
  }
}

module.exports = Property;
