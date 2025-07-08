import db from '../../config/db.js';

const createBuilding = async (buildingName, buildingAddress, buildingCreatedDate = new Date()) => {
  const query = `
    INSERT INTO building (buildingName, buildingAddress, buildingCreatedDate) 
    VALUES (?, ?, ?)
  `;
  
  const values = [buildingName, buildingAddress, buildingCreatedDate];
  const result = await db.execute(query, values);
  
  return {
    buildingId: result[0].insertId,
    buildingName,
    buildingAddress,
    buildingCreatedDate
  };
};

const getBuildingById = async (buildingId) => {
  const query = `
    SELECT b.*, 
           COUNT(DISTINCT f.floorId) as totalFloors,
           COUNT(DISTINCT a.apartmentId) as totalApartments
    FROM building b
    LEFT JOIN floor f ON b.buildingId = f.buildingId
    LEFT JOIN apartment a ON f.floorId = a.floorId
    WHERE b.buildingId = ?
    GROUP BY b.buildingId
  `;
  
  const [rows] = await db.execute(query, [buildingId]);
  return rows[0] || null;
};

const getAllBuildings = async (page = 1, limit = 25, filters = {}) => {
  const offsetInt = (page - 1) * limit;
  const limitInt  = parseInt(limit, 10);

  let query = `
    SELECT 
      b.*,
      COUNT(DISTINCT f.floorId)      AS totalFloors,
      COUNT(DISTINCT a.apartmentId)  AS totalApartments
    FROM building b
    LEFT JOIN floor f      ON b.buildingId = f.buildingId
    LEFT JOIN apartment a  ON f.floorId    = a.floorId
    WHERE 1 = 1
  `;

  let countQuery = `
    SELECT COUNT(DISTINCT b.buildingId) AS total
    FROM building b
    WHERE 1 = 1
  `;

  const values      = [];
  const countValues = [];

  if (filters.buildingName) {
    query      += ' AND b.buildingName LIKE ?';
    countQuery += ' AND b.buildingName LIKE ?';
    values.push(`%${filters.buildingName}%`);
    countValues.push(`%${filters.buildingName}%`);
  }

  if (filters.buildingAddress) {
    query      += ' AND b.buildingAddress LIKE ?';
    countQuery += ' AND b.buildingAddress LIKE ?';
    values.push(`%${filters.buildingAddress}%`);
    countValues.push(`%${filters.buildingAddress}%`);
  }

  if (filters.createdFrom) {
    query      += ' AND b.buildingCreatedDate >= ?';
    countQuery += ' AND b.buildingCreatedDate >= ?';
    values.push(filters.createdFrom);
    countValues.push(filters.createdFrom);
  }

  if (filters.createdTo) {
    query      += ' AND b.buildingCreatedDate <= ?';
    countQuery += ' AND b.buildingCreatedDate <= ?';
    values.push(filters.createdTo);
    countValues.push(filters.createdTo);
  }

  // now group, order, and *directly inject* limit/offset
  query += `
    GROUP BY b.buildingId
    ORDER BY b.buildingCreatedDate DESC
    LIMIT ${limitInt}
    OFFSET ${offsetInt}
  `;

  // ---- execute ----------------------------------------------------------------

  const [totalResult] = await db.execute(countQuery, countValues);
  const [buildings]   = await db.execute(query, values);

  return {
    buildings,
    total: totalResult[0].total,
    page,
    limit: limitInt,
    pages: Math.ceil(totalResult[0].total / limitInt),
  };
};


const updateBuilding = async (buildingId, updateData) => {
  const allowedFields = ['buildingName', 'buildingAddress'];
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

  values.push(buildingId);
  const query = `UPDATE building SET ${updates.join(', ')} WHERE buildingId = ?`;
  const result = await db.execute(query, values);
  
  if (result[0].affectedRows === 0) {
    throw new Error('Building not found');
  }

  return await getBuildingById(buildingId);
};

const deleteBuilding = async (buildingId) => {
  const checkQuery = `
    SELECT COUNT(f.floorId) as floorCount 
    FROM floor f 
    WHERE f.buildingId = ?
  `;
  
  const [checkResult] = await db.execute(checkQuery, [buildingId]);
  
  if (checkResult[0].floorCount > 0) {
    throw new Error('Cannot delete building that contains floors');
  }

  const query = 'DELETE FROM building WHERE buildingId = ?';
  const result = await db.execute(query, [buildingId]);
  
  return result[0].affectedRows > 0;
};

const getBuildingFloors = async (buildingId) => {
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

const assignBuildingToUser = async (buildingId, userId) => {
  const existingQuery = 'SELECT * FROM buildingAssigned WHERE buildingId = ? AND userId = ?';
  const [existing] = await db.execute(existingQuery, [buildingId, userId]);
  
  if (existing.length > 0) {
    throw new Error('Building already assigned to this user');
  }

  const query = 'INSERT INTO buildingAssigned (buildingId, userId) VALUES (?, ?)';
  const result = await db.execute(query, [buildingId, userId]);
  
  return result[0].insertId;
};

const removeBuildingAssignment = async (buildingId, userId) => {
  const query = 'DELETE FROM buildingAssigned WHERE buildingId = ? AND userId = ?';
  const result = await db.execute(query, [buildingId, userId]);
  
  return result[0].affectedRows > 0;
};

const getBuildingAssignments = async (buildingId) => {
  const query = `
    SELECT ba.*, u.firstName, u.lastName, u.email, r.roleName
    FROM buildingAssigned ba
    INNER JOIN user u ON ba.userId = u.userId
    LEFT JOIN userRole ur ON u.userId = ur.userId
    LEFT JOIN role r ON ur.roleId = r.roleId
    WHERE ba.buildingId = ?
  `;
  
  const [rows] = await db.execute(query, [buildingId]);
  return rows;
};

const getBuildingCount = async () => {
  const query = 'SELECT COUNT(*) as count FROM building';
  const [rows] = await db.execute(query);
  return rows[0].count;
};

const getBuildingStatistics = async () => {
  const query = `
    SELECT 
      COUNT(DISTINCT b.buildingId) as totalBuildings,
      COUNT(DISTINCT f.floorId) as totalFloors,
      COUNT(DISTINCT a.apartmentId) as totalApartments,
      AVG(apartmentCounts.apartmentCount) as avgApartmentsPerBuilding
    FROM building b
    LEFT JOIN floor f ON b.buildingId = f.buildingId
    LEFT JOIN apartment a ON f.floorId = a.floorId
    LEFT JOIN (
      SELECT b2.buildingId, COUNT(a2.apartmentId) as apartmentCount
      FROM building b2
      LEFT JOIN floor f2 ON b2.buildingId = f2.buildingId
      LEFT JOIN apartment a2 ON f2.floorId = a2.floorId
      GROUP BY b2.buildingId
    ) apartmentCounts ON b.buildingId = apartmentCounts.buildingId
  `;
  
  const [rows] = await db.execute(query);
  return rows[0];
};

// Building Image Operations
const getBuildingImages = async (buildingId) => {
  const query = 'SELECT * FROM buildingImage WHERE buildingId = ? ORDER BY createdAt DESC';
  const [rows] = await db.execute(query, [buildingId]);
  return rows;
};

const getBuildingImageById = async (imageId) => {
  const query = 'SELECT * FROM buildingImage WHERE imageId = ?';
  const [rows] = await db.execute(query, [imageId]);
  return rows[0] || null;
};

const addBuildingImage = async (buildingId, imageUrl) => {
  const query = 'INSERT INTO buildingImage (buildingId, imageUrl) VALUES (?, ?)';
  const result = await db.execute(query, [buildingId, imageUrl]);

  return {
    imageId: result[0].insertId,
    buildingId,
    imageUrl
  };
};

const deleteBuildingImage = async (imageId) => {
  const query = 'DELETE FROM buildingImage WHERE imageId = ?';
  const result = await db.execute(query, [imageId]);
  return result[0].affectedRows > 0;
};

const updateBuildingImage = async (imageId, imageUrl) => {
  const query = 'UPDATE buildingImage SET imageUrl = ? WHERE imageId = ?';
  const result = await db.execute(query, [imageUrl, imageId]);
  return result[0].affectedRows > 0;
};

export default {
  createBuilding,
  getBuildingById,
  getAllBuildings,
  updateBuilding,
  deleteBuilding,
  getBuildingFloors,
  assignBuildingToUser,
  removeBuildingAssignment,
  getBuildingAssignments,
  getBuildingCount,
  getBuildingStatistics,
  getBuildingImages,
  getBuildingImageById,
  addBuildingImage,
  deleteBuildingImage,
  updateBuildingImage
};
