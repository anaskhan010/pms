import db from '../../config/db.js';

const createVilla = async (villaData) => {
  const {
    Name,
    Address,
    bedrooms,
    bathrooms,
    length,
    width,
    price,
    description,
    yearOfCreation,
    status
  } = villaData;

  const query = `
    INSERT INTO villas (Name, Address, bedrooms, bathrooms, length, width, price, description, yearOfCreation, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [Name, Address, bedrooms, bathrooms, length, width, price, description, yearOfCreation, status];
  const result = await db.execute(query, values);

  return {
    villasId: result[0].insertId,
    Name,
    Address,
    bedrooms,
    bathrooms,
    length,
    width,
    price,
    description,
    yearOfCreation,
    status
  };
};

const getVillaById = async (villaId) => {
  const query = `
    SELECT v.*
    FROM villas v
    WHERE v.villasId = ?
  `;
  
  const [rows] = await db.execute(query, [villaId]);
  return rows[0] || null;
};

const getAllVillas = async (page = 1, limit = 25, filters = {}) => {
  try {
    // Calculate pagination - ensure values are integers
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 25;
    const offset = (pageNum - 1) * limitNum;

    // Build query parts
    let whereClause = '';
    let searchParams = [];

    if (filters.search) {
      whereClause = ' WHERE (v.Name LIKE ? OR v.Address LIKE ?)';
      searchParams = [`%${filters.search}%`, `%${filters.search}%`];
    }

    // Count total records first
    const countQuery = `SELECT COUNT(*) as total FROM villas v${whereClause}`;
    const [countResult] = await db.execute(countQuery, searchParams);
    const total = countResult[0].total;
    const pages = Math.ceil(total / limitNum);

    // Get villas with assignment information
    let dataQuery;

    if (filters.search) {
      dataQuery = `
        SELECT v.*,
               va.assignId, va.userId as assignedUserId, va.createdAt as assignedAt,
               u.firstName as assignedUserFirstName, u.lastName as assignedUserLastName, u.email as assignedUserEmail
        FROM villas v
        LEFT JOIN villasAssigned va ON v.villasId = va.villaId
        LEFT JOIN user u ON va.userId = u.userId
        WHERE (v.Name LIKE ? OR v.Address LIKE ?)
        ORDER BY v.villasId DESC
        LIMIT ${limitNum} OFFSET ${offset}
      `;
      const [rows] = await db.execute(dataQuery, searchParams);

      return {
        villas: rows,
        total,
        page: pageNum,
        pages
      };
    } else {
      dataQuery = `
        SELECT v.*,
               va.assignId, va.userId as assignedUserId, va.createdAt as assignedAt,
               u.firstName as assignedUserFirstName, u.lastName as assignedUserLastName, u.email as assignedUserEmail
        FROM villas v
        LEFT JOIN villasAssigned va ON v.villasId = va.villaId
        LEFT JOIN user u ON va.userId = u.userId
        ORDER BY v.villasId DESC
        LIMIT ${limitNum} OFFSET ${offset}
      `;
      const [rows] = await db.execute(dataQuery);

      return {
        villas: rows,
        total,
        page: pageNum,
        pages
      };
    }
  } catch (error) {
    console.error('Error in getAllVillas:', error);
    throw error;
  }
};

const updateVilla = async (villaId, updateData) => {
  const allowedFields = ['Name', 'Address', 'bedrooms', 'bathrooms', 'length', 'width', 'price', 'description', 'yearOfCreation', 'status'];
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

  values.push(villaId);
  const query = `UPDATE villas SET ${updates.join(', ')} WHERE villasId = ?`;
  const result = await db.execute(query, values);
  
  if (result[0].affectedRows === 0) {
    throw new Error('Villa not found');
  }

  return await getVillaById(villaId);
};

const deleteVilla = async (villaId) => {
  const query = 'DELETE FROM villas WHERE villasId = ?';
  const result = await db.execute(query, [villaId]);
  
  return result[0].affectedRows > 0;
};

// Villa Images
const addVillaImage = async (villaId, imageUrl) => {
  const query = 'INSERT INTO villaImages (villaId, imageUrl) VALUES (?, ?)';
  const result = await db.execute(query, [villaId, imageUrl]);
  
  return {
    imageId: result[0].insertId,
    villaId,
    imageUrl
  };
};

const getVillaImages = async (villaId) => {
  const query = 'SELECT * FROM villaImages WHERE villaId = ? ORDER BY imageId DESC';
  const [rows] = await db.execute(query, [villaId]);
  return rows;
};

const deleteVillaImage = async (imageId) => {
  const query = 'DELETE FROM villaImages WHERE imageId = ?';
  const result = await db.execute(query, [imageId]);
  
  return result[0].affectedRows > 0;
};

// Villa Features
const addVillaFeature = async (villaId, feature) => {
  const query = 'INSERT INTO villasFeature (villaId, features) VALUES (?, ?)';
  const result = await db.execute(query, [villaId, feature]);
  
  return {
    featureId: result[0].insertId,
    villaId,
    features: feature
  };
};

const getVillaFeatures = async (villaId) => {
  const query = 'SELECT * FROM villasFeature WHERE villaId = ?';
  const [rows] = await db.execute(query, [villaId]);
  return rows;
};

const deleteVillaFeature = async (featureId) => {
  const query = 'DELETE FROM villasFeature WHERE featureId = ?';
  const result = await db.execute(query, [featureId]);
  
  return result[0].affectedRows > 0;
};

// Villa Assignment
const assignVillaToUser = async (villaId, userId) => {
  const query = 'INSERT INTO villasAssigned (villaId, userId) VALUES (?, ?)';
  const result = await db.execute(query, [villaId, userId]);

  return {
    assignId: result[0].insertId,
    villaId,
    userId
  };
};

const removeVillaFromUser = async (villaId, userId) => {
  const query = 'DELETE FROM villasAssigned WHERE villaId = ? AND userId = ?';
  const result = await db.execute(query, [villaId, userId]);

  return result[0].affectedRows > 0;
};

const getVillaAssignments = async (villaId) => {
  const query = `
    SELECT va.*, u.firstName, u.lastName, u.email
    FROM villasAssigned va
    JOIN user u ON va.userId = u.userId
    WHERE va.villaId = ?
  `;
  const [rows] = await db.execute(query, [villaId]);
  return rows;
};

const getUserAssignedVillas = async (userId) => {
  const query = `
    SELECT v.*, va.createdAt as assignedAt
    FROM villas v
    JOIN villasAssigned va ON v.villasId = va.villaId
    WHERE va.userId = ?
    ORDER BY va.createdAt DESC
  `;
  const [rows] = await db.execute(query, [userId]);
  return rows;
};

// Villa Statistics
const getVillaStatistics = async () => {
  const queries = {
    total: 'SELECT COUNT(*) as count FROM villas',
    totalValue: 'SELECT SUM(price) as total FROM villas',
    avgPrice: 'SELECT AVG(price) as avg FROM villas',
    avgBedrooms: 'SELECT AVG(bedrooms) as avg FROM villas',
    avgBathrooms: 'SELECT AVG(bathrooms) as avg FROM villas'
  };

  const results = {};
  
  for (const [key, query] of Object.entries(queries)) {
    const [rows] = await db.execute(query);
    results[key] = rows[0].count || rows[0].total || rows[0].avg || 0;
  }

  return results;
};

export default {
  createVilla,
  getVillaById,
  getAllVillas,
  updateVilla,
  deleteVilla,
  addVillaImage,
  getVillaImages,
  deleteVillaImage,
  addVillaFeature,
  getVillaFeatures,
  deleteVillaFeature,
  assignVillaToUser,
  removeVillaFromUser,
  getVillaAssignments,
  getUserAssignedVillas,
  getVillaStatistics
};
