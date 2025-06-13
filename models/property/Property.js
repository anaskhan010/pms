
const db = require('../../config/db');

// Create a new property
const create = async (propertyData) => {
  

  const sql = `
    INSERT INTO Properties (
     property_number, address_line1, address_line2, city,
      state_province, postal_code, country, plot_size_sqm, total_units,
      description
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
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

  const result = await db.query(sql, values);

  const propertyId = result[0].insertId;
  const property = await findById(propertyId);

  // Attach methods to property object
  if (property) {
    property.update = (updateData) => update(property.property_id, updateData);
    property.delete = () => deleteProperty(property.property_id);
    property.getUnits = () => getUnits(property.property_id);
    property.getStatistics = () => getStatistics(property.property_id);
  }

  return property;
};

// Get all properties by tenant_id
const findAllPropertiesByTenant = async (tenantId) => {
  const sql = `
    SELECT p.*
    FROM Properties p
    JOIN Tenants AS c ON p.tenant_id = c.tenant_id
    WHERE c.tenant_id = ?
    ORDER BY p.created_at DESC;
  `;

  const [properties] = await db.query(sql, [tenantId]);

  return properties.map(property => {
    // Attach methods to each property object
    property.update = (updateData) => update(property.property_id, updateData);
    property.delete = () => deleteProperty(property.property_id);
    property.getUnits = () => getUnits(property.property_id);
    property.getStatistics = () => getStatistics(property.property_id);
    return property;
  });
};

// Find property by ID
const findById = async (id) => {
  const sql = 'SELECT * FROM Properties WHERE property_id = ?';
  const [rows] = await db.query(sql, [id]);

  if (rows.length > 0) {
    const property = rows[0];
    // Attach methods to property object
    property.update = (updateData) => update(property.property_id, updateData);
    property.delete = () => deleteProperty(property.property_id);
    property.getUnits = () => getUnits(property.property_id);
    property.getStatistics = () => getStatistics(property.property_id);
    return property;
  }
  return null;
};

// Get all properties with pagination
const findAll = async (page = 1, limit = 10, filters = {}) => {
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
  const [properties] = await db.query(sql, values);

  return {
    properties: properties.map(property => {
      // Attach methods to each property object
      property.update = (updateData) => update(property.property_id, updateData);
      property.delete = () => deleteProperty(property.property_id);
      property.getUnits = () => getUnits(property.property_id);
      property.getStatistics = () => getStatistics(property.property_id);
      return property;
    }),
    total: totalResult.total,
    page,
    pages: Math.ceil(totalResult.total / limit)
  };
};

// Update property
const update = async (propertyId, updateData) => {
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
  values.push(propertyId);

  const sql = `UPDATE Properties SET ${updates.join(', ')} WHERE property_id = ?`;
  await db.query(sql, values);

  return await findById(propertyId);
};

// Delete property
const deleteProperty = async (propertyId) => {
  const sql = 'DELETE FROM Properties WHERE property_id = ?';
  await db.query(sql, [propertyId]);
};

// Get units for this property
const getUnits = async (propertyId) => {
  const sql = 'SELECT * FROM Units WHERE property_id = ? ORDER BY unit_number';
  const [units] = await db.query(sql, [propertyId]);
  return units;
};

// Get property statistics
const getStatistics = async (propertyId) => {
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

  const [rows] = await db.query(sql, [propertyId]);
  return rows[0];
};

module.exports = {
  create,
  findAllPropertiesByTenant,
  findById,
  findAll,
  update,
  deleteProperty,
  getUnits,
  getStatistics
};
