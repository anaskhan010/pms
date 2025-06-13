
const db = require('../../config/db');

// Create a new unit
const createUnit = async (unitData) => {
  
  
  const sql = `
    INSERT INTO Units (
      property_id, unit_number, unit_type, num_bedrooms, 
      num_bathrooms, area_sqm, current_status, is_merged, 
      merged_group_id, description
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const values = [
    
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

  const result = await db.query(sql, values);
  const unitId = result[0].insertId
  return await findUnitById(unitId);
};

// Find unit by ID
const findUnitById = async (id) => {
  const sql = 'SELECT * FROM Units WHERE unit_id = ?';
  const [unit] = await db.query(sql, [id]);
  return unit || null;
};

// Get all units with pagination
const findAllUnits = async (page = 1, limit = 10, filters = {}) => {
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

  const result = units[0]

  return {
    result,
    total: totalResult.total,
    page,
    pages: Math.ceil(totalResult.total / limit)
  };
};

// Update unit
const updateUnit = async (unitId, updateData) => {
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
  values.push(unitId);

  const sql = `UPDATE Units SET ${updates.join(', ')} WHERE unit_id = ?`;
  await db.query(sql, values);

  return await findUnitById(unitId);
};

// Delete unit
const deleteUnit = async (unitId) => {
  const sql = 'DELETE FROM Units WHERE unit_id = ?';
  await db.query(sql, [unitId]);
  return { success: true, message: 'Unit deleted successfully' };
};

// Get property details
const getUnitProperty = async (propertyId) => {
  const sql = 'SELECT * FROM Properties WHERE property_id = ?';
  const [property] = await db.query(sql, [propertyId]);
  return property;
};

// Get current contract
const getCurrentContract = async (unitId) => {
  const sql = `
    SELECT * FROM Contracts 
    WHERE unit_id = ? AND contract_status = 'Active' 
    ORDER BY created_at DESC LIMIT 1
  `;
  const [contract] = await db.query(sql, [unitId]);
  return contract;
};

// Get current tenant
const getCurrentTenant = async (unitId) => {
  const sql = `
    SELECT t.* FROM Tenants t
    INNER JOIN Contracts c ON t.tenant_id = c.tenant_id
    WHERE c.unit_id = ? AND c.contract_status = 'Active'
    ORDER BY c.created_at DESC LIMIT 1
  `;
  const [tenant] = await db.query(sql, [unitId]);
  return tenant;
};

// Get unit ownership
const getUnitOwnership = async (unitId) => {
  const sql = `
    SELECT uo.*, o.name as owner_name, o.email as owner_email 
    FROM UnitOwnership uo
    INNER JOIN Owners o ON uo.owner_id = o.owner_id
    WHERE uo.unit_id = ? AND uo.is_current = true
    ORDER BY uo.ownership_start_date DESC
  `;
  const ownership = await db.query(sql, [unitId]);
  return ownership;
};

// Get utility meters
const getUtilityMeters = async (unitId) => {
  const sql = `
    SELECT uum.*, u.utility_name 
    FROM UnitUtilityMeters uum
    INNER JOIN Utilities u ON uum.utility_type_id = u.utility_type_id
    WHERE uum.unit_id = ? AND uum.is_active = true
  `;
  const meters = await db.query(sql, [unitId]);
  return meters;
};

// Get recent tickets
const getRecentTickets = async (unitId, limit = 5) => {
  const sql = `
    SELECT * FROM Tickets 
    WHERE unit_id = ? 
    ORDER BY opened_at DESC 
    LIMIT ?
  `;
  const tickets = await db.query(sql, [unitId, limit]);
  return tickets;
};

// Export all functions
module.exports = {
  createUnit,
  findUnitById,
  findAllUnits,
  updateUnit,
  deleteUnit,
  getUnitProperty,
  getCurrentContract,
  getCurrentTenant,
  getUnitOwnership,
  getUtilityMeters,
  getRecentTickets
};