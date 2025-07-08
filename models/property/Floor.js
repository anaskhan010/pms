import db from '../../config/db.js';

const createFloor = async (buildingId, floorName) => {
  const buildingCheck = await db.execute('SELECT buildingId FROM building WHERE buildingId = ?', [buildingId]);
  if (buildingCheck[0].length === 0) {
    throw new Error('Building not found');
  }

  const existingFloor = await db.execute(
    'SELECT floorId FROM floor WHERE buildingId = ? AND floorName = ?',
    [buildingId, floorName]
  );
  
  if (existingFloor[0].length > 0) {
    throw new Error('Floor with this name already exists in this building');
  }

  const query = 'INSERT INTO floor (buildingId, floorName) VALUES (?, ?)';
  const result = await db.execute(query, [buildingId, floorName]);
  
  return {
    floorId: result[0].insertId,
    buildingId,
    floorName
  };
};

const getFloorById = async (floorId) => {
  const query = `
    SELECT f.*, b.buildingName, b.buildingAddress,
           COUNT(a.apartmentId) as totalApartments
    FROM floor f
    INNER JOIN building b ON f.buildingId = b.buildingId
    LEFT JOIN apartment a ON f.floorId = a.floorId
    WHERE f.floorId = ?
    GROUP BY f.floorId
  `;
  
  const [rows] = await db.execute(query, [floorId]);
  return rows[0] || null;
};

const getAllFloors = async (page = 1, limit = 25, filters = {}) => {
  const offset = (page - 1) * limit;
  
  let query = `
    SELECT f.*, b.buildingName, b.buildingAddress,
           COUNT(a.apartmentId) as totalApartments
    FROM floor f
    INNER JOIN building b ON f.buildingId = b.buildingId
    LEFT JOIN apartment a ON f.floorId = a.floorId
    WHERE 1=1
  `;
  
  let countQuery = `
    SELECT COUNT(DISTINCT f.floorId) as total 
    FROM floor f
    INNER JOIN building b ON f.buildingId = b.buildingId
    WHERE 1=1
  `;
  
  const values = [];
  const countValues = [];

  if (filters.buildingId) {
    query += ' AND f.buildingId = ?';
    countQuery += ' AND f.buildingId = ?';
    values.push(filters.buildingId);
    countValues.push(filters.buildingId);
  }

  if (filters.search) {
    const searchCondition = ' AND (f.floorName LIKE ? OR b.buildingName LIKE ?)';
    query += searchCondition;
    countQuery += searchCondition;
    const searchTerm = `%${filters.search}%`;
    values.push(searchTerm, searchTerm);
    countValues.push(searchTerm, searchTerm);
  }

  query += ' GROUP BY f.floorId ORDER BY b.buildingName ASC, f.floorName ASC LIMIT ? OFFSET ?';
  values.push(limit, offset);

  try {
    const [totalResult] = await db.execute(countQuery, countValues);
    const [floors] = await db.execute(query, values);

    return {
      floors,
      total: totalResult[0].total,
      page,
      pages: Math.ceil(totalResult[0].total / limit)
    };
  } catch (error) {
    throw error;
  }
};

const getFloorsByBuildingId = async (buildingId) => {
  const query = `
    SELECT f.*, 
           COUNT(a.apartmentId) as totalApartments
    FROM floor f
    LEFT JOIN apartment a ON f.floorId = a.floorId
    WHERE f.buildingId = ?
    GROUP BY f.floorId
    ORDER BY f.floorName ASC
  `;
  
  const [rows] = await db.execute(query, [buildingId]);
  return rows;
};

const updateFloor = async (floorId, updateData) => {
  const allowedFields = ['floorName'];
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

  if (updateData.floorName) {
    const floor = await getFloorById(floorId);
    if (!floor) {
      throw new Error('Floor not found');
    }

    const existingFloor = await db.execute(
      'SELECT floorId FROM floor WHERE buildingId = ? AND floorName = ? AND floorId != ?',
      [floor.buildingId, updateData.floorName, floorId]
    );
    
    if (existingFloor[0].length > 0) {
      throw new Error('Floor with this name already exists in this building');
    }
  }

  values.push(floorId);
  const query = `UPDATE floor SET ${updates.join(', ')} WHERE floorId = ?`;
  const result = await db.execute(query, values);
  
  if (result[0].affectedRows === 0) {
    throw new Error('Floor not found');
  }

  return await getFloorById(floorId);
};

const deleteFloor = async (floorId) => {
  const checkQuery = 'SELECT COUNT(apartmentId) as apartmentCount FROM apartment WHERE floorId = ?';
  const [checkResult] = await db.execute(checkQuery, [floorId]);
  
  if (checkResult[0].apartmentCount > 0) {
    throw new Error('Cannot delete floor that contains apartments');
  }

  const query = 'DELETE FROM floor WHERE floorId = ?';
  const result = await db.execute(query, [floorId]);
  
  return result[0].affectedRows > 0;
};

const getFloorApartments = async (floorId) => {
  const query = `
    SELECT a.*, 
           CASE WHEN aa.tenantId IS NOT NULL THEN 'Occupied' ELSE 'Available' END as status,
           t.firstName as tenantFirstName,
           t.lastName as tenantLastName,
           t.email as tenantEmail
    FROM apartment a
    LEFT JOIN ApartmentAssigned aa ON a.apartmentId = aa.apartmentId
    LEFT JOIN tenant ten ON aa.tenantId = ten.tenantId
    LEFT JOIN user t ON ten.userId = t.userId
    WHERE a.floorId = ?
    ORDER BY a.apartmentId ASC
  `;
  
  const [rows] = await db.execute(query, [floorId]);
  return rows;
};

const getFloorCount = async () => {
  const query = 'SELECT COUNT(*) as count FROM floor';
  const [rows] = await db.execute(query);
  return rows[0].count;
};

const getFloorStatistics = async () => {
  const query = `
    SELECT
      COUNT(DISTINCT f.floorId) as totalFloors,
      COUNT(DISTINCT a.apartmentId) as totalApartments,
      AVG(apartmentCounts.apartmentCount) as avgApartmentsPerFloor,
      COUNT(DISTINCT f.buildingId) as buildingsWithFloors
    FROM floor f
    LEFT JOIN apartment a ON f.floorId = a.floorId
    LEFT JOIN (
      SELECT f2.floorId, COUNT(a2.apartmentId) as apartmentCount
      FROM floor f2
      LEFT JOIN apartment a2 ON f2.floorId = a2.floorId
      GROUP BY f2.floorId
    ) apartmentCounts ON f.floorId = apartmentCounts.floorId
  `;

  const [rows] = await db.execute(query);
  return rows[0];
};

// Floor Image Operations
const getFloorImages = async (floorId) => {
  const query = 'SELECT * FROM floorImages WHERE floorId = ? ORDER BY createdAt DESC';
  const [rows] = await db.execute(query, [floorId]);
  return rows;
};

const getFloorImageById = async (imageId) => {
  const query = 'SELECT * FROM floorImages WHERE imageId = ?';
  const [rows] = await db.execute(query, [imageId]);
  return rows[0] || null;
};

const addFloorImage = async (floorId, imageUrl) => {
  const query = 'INSERT INTO floorImages (floorId, imageUrl) VALUES (?, ?)';
  const result = await db.execute(query, [floorId, imageUrl]);

  return {
    imageId: result[0].insertId,
    floorId,
    imageUrl
  };
};

const deleteFloorImage = async (imageId) => {
  const query = 'DELETE FROM floorImages WHERE imageId = ?';
  const result = await db.execute(query, [imageId]);
  return result[0].affectedRows > 0;
};

const updateFloorImage = async (imageId, imageUrl) => {
  const query = 'UPDATE floorImages SET imageUrl = ? WHERE imageId = ?';
  const result = await db.execute(query, [imageUrl, imageId]);
  return result[0].affectedRows > 0;
};

export default {
  createFloor,
  getFloorById,
  getAllFloors,
  getFloorsByBuildingId,
  updateFloor,
  deleteFloor,
  getFloorApartments,
  getFloorCount,
  getFloorStatistics,
  getFloorImages,
  getFloorImageById,
  addFloorImage,
  deleteFloorImage,
  updateFloorImage
};
