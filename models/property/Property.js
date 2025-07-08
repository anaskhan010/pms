
const db = require('../../config/db');
const logger = require('../../utils/logger');

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

  if (property) {
    property.update = (updateData) => update(property.property_id, updateData);
    property.delete = () => deleteProperty(property.property_id);
    property.getUnits = () => getUnits(property.property_id);
    property.getStatistics = () => getStatistics(property.property_id);
  }

  return property;
};

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
    property.update = (updateData) => update(property.property_id, updateData);
    property.delete = () => deleteProperty(property.property_id);
    property.getUnits = () => getUnits(property.property_id);
    property.getStatistics = () => getStatistics(property.property_id);
    return property;
  });
};

const findById = async (id) => {
  const sql = 'SELECT * FROM Properties WHERE property_id = ?';
  const [rows] = await db.query(sql, [id]);

  if (rows.length > 0) {
    const property = rows[0];
    property.update = (updateData) => update(property.property_id, updateData);
    property.delete = () => deleteProperty(property.property_id);
    property.getUnits = () => getUnits(property.property_id);
    property.getStatistics = () => getStatistics(property.property_id);
    return property;
  }
  return null;
};

const findAll = async (page = 1, limit = 10, filters = {}, sortBy = 'created_at', sortOrder = 'desc') => {
  const startTime = Date.now();
  const offset = (page - 1) * limit;

  let sql = 'SELECT * FROM Properties WHERE 1=1';
  let countSql = 'SELECT COUNT(*) as total FROM Properties WHERE 1=1';
  const values = [];
  const countValues = [];

  if (filters.city) {
    sql += ' AND city LIKE ?';
    countSql += ' AND city LIKE ?';
    values.push(`%${filters.city}%`);
    countValues.push(`%${filters.city}%`);
  }

  if (filters.country) {
    sql += ' AND country = ?';
    countSql += ' AND country = ?';
    values.push(filters.country);
    countValues.push(filters.country);
  }

  if (filters.property_type) {
    sql += ' AND property_type = ?';
    countSql += ' AND property_type = ?';
    values.push(filters.property_type);
    countValues.push(filters.property_type);
  }

  if (filters.status) {
    sql += ' AND status = ?';
    countSql += ' AND status = ?';
    values.push(filters.status);
    countValues.push(filters.status);
  }

  if (filters.min_units) {
    sql += ' AND total_units >= ?';
    countSql += ' AND total_units >= ?';
    values.push(parseInt(filters.min_units));
    countValues.push(parseInt(filters.min_units));
  }

  if (filters.max_units) {
    sql += ' AND total_units <= ?';
    countSql += ' AND total_units <= ?';
    values.push(parseInt(filters.max_units));
    countValues.push(parseInt(filters.max_units));
  }

  if (filters.built_year_from) {
    sql += ' AND built_year >= ?';
    countSql += ' AND built_year >= ?';
    values.push(parseInt(filters.built_year_from));
    countValues.push(parseInt(filters.built_year_from));
  }

  if (filters.built_year_to) {
    sql += ' AND built_year <= ?';
    countSql += ' AND built_year <= ?';
    values.push(parseInt(filters.built_year_to));
    countValues.push(parseInt(filters.built_year_to));
  }

  if (filters.search) {
    const searchCondition = ' AND (property_number LIKE ? OR address_line1 LIKE ? OR city LIKE ? OR description LIKE ?)';
    sql += searchCondition;
    countSql += searchCondition;
    const searchTerm = `%${filters.search}%`;
    values.push(searchTerm, searchTerm, searchTerm, searchTerm);
    countValues.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  const validSortFields = ['property_id', 'property_number', 'city', 'country', 'total_units', 'built_year', 'created_at', 'updated_at'];
  const validSortOrders = ['asc', 'desc'];

  if (validSortFields.includes(sortBy) && validSortOrders.includes(sortOrder.toLowerCase())) {
    sql += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
  } else {
    sql += ' ORDER BY created_at DESC';
  }

  sql += ' LIMIT ? OFFSET ?';
  values.push(limit, offset);

  try {
    const [totalResult] = await db.query(countSql, countValues);
    const [properties] = await db.query(sql, values);

    const executionTime = Date.now() - startTime;
    logger.logDatabaseQuery(sql, values, executionTime);

    return {
      properties: properties.map(property => {
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
  } catch (error) {
    logger.error('Database query failed in findAll', {
      error: error.message,
      sql,
      values
    });
    throw error;
  }
};

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

const deleteProperty = async (propertyId) => {
  const sql = 'DELETE FROM Properties WHERE property_id = ?';
  await db.query(sql, [propertyId]);
};

const getUnits = async (propertyId) => {
  const sql = 'SELECT * FROM Units WHERE property_id = ? ORDER BY unit_number';
  const [units] = await db.query(sql, [propertyId]);
  return units;
};

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

const getOverallStatistics = async () => {
  const startTime = Date.now();

  try {
    const sql = `
      SELECT
        COUNT(*) as total_properties,
        
        COUNT(CASE WHEN property_type = 'apartment' THEN 1 END) as apartments,
        COUNT(CASE WHEN property_type = 'villa' THEN 1 END) as villas,
        COUNT(CASE WHEN property_type = 'office' THEN 1 END) as offices,
        COUNT(CASE WHEN property_type = 'retail' THEN 1 END) as retail,
        SUM(total_units) as total_units,
        AVG(total_units) as avg_units_per_property,
        SUM(plot_size_sqm) as total_plot_size,
        AVG(plot_size_sqm) as avg_plot_size,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_this_month
      FROM Properties
    `;

    const [stats] = await db.query(sql);

    const citySQL = `
      SELECT city, COUNT(*) as count
      FROM Properties
      WHERE city IS NOT NULL
      GROUP BY city
      ORDER BY count DESC
      LIMIT 10
    `;
    const [cityStats] = await db.query(citySQL);

    const typeSQL = `
      SELECT
        property_type,
        COUNT(*) as count,
        SUM(total_units) as total_units
      FROM Properties
      WHERE property_type IS NOT NULL
      GROUP BY property_type
      ORDER BY count DESC
    `;
    const [typeStats] = await db.query(typeSQL);

    const executionTime = Date.now() - startTime;
    logger.logDatabaseQuery('getOverallStatistics', [], executionTime);

    return {
      overview: stats[0],
      city_distribution: cityStats,
      type_distribution: typeStats
    };
  } catch (error) {
    logger.error('Database query failed in getOverallStatistics', {
      error: error.message
    });
    throw error;
  }
};

const findByIds = async (propertyIds) => {
  if (!propertyIds || propertyIds.length === 0) {
    return [];
  }

  const placeholders = propertyIds.map(() => '?').join(',');
  const sql = `SELECT * FROM Properties WHERE property_id IN (${placeholders})`;

  try {
    const [properties] = await db.query(sql, propertyIds);
    return properties;
  } catch (error) {
    logger.error('Database query failed in findByIds', {
      error: error.message,
      propertyIds
    });
    throw error;
  }
};

const findAllForExport = async (filters = {}) => {
  let sql = 'SELECT * FROM Properties WHERE 1=1';
  const values = [];

  if (filters.city) {
    sql += ' AND city LIKE ?';
    values.push(`%${filters.city}%`);
  }

  if (filters.country) {
    sql += ' AND country = ?';
    values.push(filters.country);
  }

  if (filters.property_type) {
    sql += ' AND property_type = ?';
    values.push(filters.property_type);
  }

  if (filters.status) {
    sql += ' AND status = ?';
    values.push(filters.status);
  }

  if (filters.min_units) {
    sql += ' AND total_units >= ?';
    values.push(parseInt(filters.min_units));
  }

  if (filters.max_units) {
    sql += ' AND total_units <= ?';
    values.push(parseInt(filters.max_units));
  }

  if (filters.built_year_from) {
    sql += ' AND built_year >= ?';
    values.push(parseInt(filters.built_year_from));
  }

  if (filters.built_year_to) {
    sql += ' AND built_year <= ?';
    values.push(parseInt(filters.built_year_to));
  }

  if (filters.search) {
    sql += ' AND (property_number LIKE ? OR address_line1 LIKE ? OR city LIKE ? OR description LIKE ?)';
    const searchTerm = `%${filters.search}%`;
    values.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  sql += ' ORDER BY created_at DESC';

  try {
    const [properties] = await db.query(sql, values);
    return properties;
  } catch (error) {
    logger.error('Database query failed in findAllForExport', {
      error: error.message,
      filters
    });
    throw error;
  }
};

const updateStatus = async (propertyId, status, reason = null) => {
  const sql = `
    UPDATE Properties
    SET status = ?, updated_at = NOW()
    WHERE property_id = ?
  `;

  try {
    const [result] = await db.query(sql, [status, propertyId]);

    if (result.affectedRows === 0) {
      throw new Error('Property not found');
    }

    logger.info('Property status updated', {
      propertyId,
      status,
      reason
    });

    return await findById(propertyId);
  } catch (error) {
    logger.error('Failed to update property status', {
      error: error.message,
      propertyId,
      status
    });
    throw error;
  }
};

const getOccupancyAnalytics = async () => {
  const startTime = Date.now();

  try {
    const sql = `
      SELECT
        p.property_id,
        p.property_number,
        p.total_units,
        COUNT(u.unit_id) as occupied_units,
        (COUNT(u.unit_id) / p.total_units * 100) as occupancy_rate,
        p.city,
        p.property_type
      FROM Properties p
      LEFT JOIN Units u ON p.property_id = u.property_id AND u.status = 'occupied'
      WHERE p.total_units > 0
      GROUP BY p.property_id, p.property_number, p.total_units, p.city, p.property_type
      ORDER BY occupancy_rate DESC
    `;

    const [analytics] = await db.query(sql);

    const executionTime = Date.now() - startTime;
    logger.logDatabaseQuery('getOccupancyAnalytics', [], executionTime);

    return analytics;
  } catch (error) {
    logger.error('Database query failed in getOccupancyAnalytics', {
      error: error.message
    });
    throw error;
  }
};

module.exports = {
  create,
  findAllPropertiesByTenant,
  findById,
  findAll,
  update,
  deleteProperty,
  getUnits,
  getStatistics,
  getOverallStatistics,
  findByIds,
  findAllForExport,
  updateStatus,
  getOccupancyAnalytics
};
