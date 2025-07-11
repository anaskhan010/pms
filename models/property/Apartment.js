import db from '../../config/db.js';

const createApartment = async (floorId, bedrooms, bathrooms, length, width, rentPrice, description = '') => {
  console.log('=== createApartment called with:', { floorId, bedrooms, bathrooms, length, width, rentPrice, description });

  const floorCheck = await db.execute('SELECT floorId FROM floor WHERE floorId = ?', [floorId]);
  if (floorCheck[0].length === 0) {
    throw new Error('Floor not found');
  }

  // Try with AUTO_INCREMENT first (if database is fixed)
  let query = `
    INSERT INTO apartment (floorId, bedrooms, bathrooms, length, width, rentPrice, status, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  let values = [
    floorId,
    bedrooms,
    bathrooms,
    length || 0,
    width || 0,
    rentPrice,
    'Vacant', // Default status
    description || 'No description provided'
  ];

  try {
    const result = await db.execute(query, values);

    return {
      apartmentId: result[0].insertId,
      floorId,
      bedrooms,
      bathrooms,
      length: length || 0,
      width: width || 0,
      rentPrice,
      status: 'Vacant',
      description: description || 'No description provided'
    };
  } catch (error) {
    // If AUTO_INCREMENT is not set, fall back to manual ID generation
    if (error.message.includes("doesn't have a default value")) {
      console.log('AUTO_INCREMENT not set, using manual ID generation');

      const [maxIdResult] = await db.execute('SELECT COALESCE(MAX(apartmentId), 0) + 1 as nextId FROM apartment');
      const nextApartmentId = maxIdResult[0].nextId;

      query = `
        INSERT INTO apartment (apartmentId, floorId, bedrooms, bathrooms, length, width, rentPrice, status, description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      values = [
        nextApartmentId,
        floorId,
        bedrooms,
        bathrooms,
        length || 0,
        width || 0,
        rentPrice,
        'Vacant',
        description || 'No description provided'
      ];

      await db.execute(query, values);

      return {
        apartmentId: nextApartmentId,
        floorId,
        bedrooms,
        bathrooms,
        length: length || 0,
        width: width || 0,
        rentPrice,
        status: 'Vacant',
        description: description || 'No description provided'
      };
    } else {
      throw error;
    }
  }
};

const getApartmentById = async (apartmentId) => {
  const query = `
    SELECT a.*, f.floorName, b.buildingName, b.buildingAddress,
           t.firstName as tenantFirstName,
           t.lastName as tenantLastName,
           t.email as tenantEmail,
           ten.tenantId
    FROM apartment a
    INNER JOIN floor f ON a.floorId = f.floorId
    INNER JOIN building b ON f.buildingId = b.buildingId
    LEFT JOIN ApartmentAssigned aa ON a.apartmentId = aa.apartmentId
    LEFT JOIN tenant ten ON aa.tenantId = ten.tenantId
    LEFT JOIN user t ON ten.userId = t.userId
    WHERE a.apartmentId = ?
  `;

  const [rows] = await db.execute(query, [apartmentId]);

  // Get amenities separately to avoid duplicate rows
  // Handle both old and new schema (listOfAmenities vs amenityName)
  let amenitiesQuery;
  try {
    // Try new schema first
    amenitiesQuery = `
      SELECT amenityName
      FROM apartmentAmenities
      WHERE apartmentId = ?
    `;
    const [amenities] = await db.execute(amenitiesQuery, [apartmentId]);

    if (rows[0]) {
      rows[0].amenities = amenities.map(amenity => amenity.amenityName);
    }
  } catch (error) {
    // Fallback to old schema if new schema fails
    try {
      amenitiesQuery = `
        SELECT listOfAmenities
        FROM apartmentAmenities
        WHERE apartmentId = ?
      `;
      const [amenities] = await db.execute(amenitiesQuery, [apartmentId]);

      if (rows[0]) {
        rows[0].amenities = amenities.map(amenity => amenity.listOfAmenities);
      }
    } catch (fallbackError) {
      // If both fail, just set empty amenities array
      if (rows[0]) {
        rows[0].amenities = [];
      }
    }
  }

  return rows[0] || null;
};

const getAllApartments = async (page = 1, limit = 25, filters = {}) => {


  // Ensure page and limit are integers
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 25;
  const offset = (page - 1) * limit;

  // Validate that limit and offset are positive integers
  if (limit <= 0 || offset < 0) {
    throw new Error('Invalid pagination parameters');
  }

  let query = `
    SELECT a.*, f.floorName, b.buildingName, b.buildingAddress,
           t.firstName as tenantFirstName,
           t.lastName as tenantLastName
    FROM apartment a
    INNER JOIN floor f ON a.floorId = f.floorId
    INNER JOIN building b ON f.buildingId = b.buildingId
    LEFT JOIN ApartmentAssigned aa ON a.apartmentId = aa.apartmentId
    LEFT JOIN tenant ten ON aa.tenantId = ten.tenantId
    LEFT JOIN user t ON ten.userId = t.userId
    WHERE 1=1
  `;

  let countQuery = `
    SELECT COUNT(DISTINCT a.apartmentId) as total
    FROM apartment a
    INNER JOIN floor f ON a.floorId = f.floorId
    INNER JOIN building b ON f.buildingId = b.buildingId
    WHERE 1=1
  `;

  const values = [];
  const countValues = [];

  // Add owner building filtering
  if (filters.ownerBuildings && filters.ownerBuildings.length > 0) {
    const placeholders = filters.ownerBuildings.map(() => '?').join(',');
    query += ` AND b.buildingId IN (${placeholders})`;
    countQuery += ` AND b.buildingId IN (${placeholders})`;
    values.push(...filters.ownerBuildings);
    countValues.push(...filters.ownerBuildings);
  }

  if (filters.buildingId) {
    const buildingId = parseInt(filters.buildingId);
    if (!isNaN(buildingId)) {
      query += ' AND b.buildingId = ?';
      countQuery += ' AND b.buildingId = ?';
      values.push(buildingId);
      countValues.push(buildingId);
    }
  }

  if (filters.floorId) {
    const floorId = parseInt(filters.floorId);
    if (!isNaN(floorId)) {
      query += ' AND f.floorId = ?';
      countQuery += ' AND f.floorId = ?';
      values.push(floorId);
      countValues.push(floorId);
    }
  }

 

  if (filters.minBedrooms) {
    const minBedrooms = parseInt(filters.minBedrooms);
    if (!isNaN(minBedrooms)) {
      query += ' AND a.bedrooms >= ?';
      countQuery += ' AND a.bedrooms >= ?';
      values.push(minBedrooms);
      countValues.push(minBedrooms);
    }
  }

  if (filters.maxBedrooms) {
    const maxBedrooms = parseInt(filters.maxBedrooms);
    if (!isNaN(maxBedrooms)) {
      query += ' AND a.bedrooms <= ?';
      countQuery += ' AND a.bedrooms <= ?';
      values.push(maxBedrooms);
      countValues.push(maxBedrooms);
    }
  }

  if (filters.minRent) {
    const minRent = parseFloat(filters.minRent);
    if (!isNaN(minRent)) {
      query += ' AND a.rentPrice >= ?';
      countQuery += ' AND a.rentPrice >= ?';
      values.push(minRent);
      countValues.push(minRent);
    }
  }

  if (filters.maxRent) {
    const maxRent = parseFloat(filters.maxRent);
    if (!isNaN(maxRent)) {
      query += ' AND a.rentPrice <= ?';
      countQuery += ' AND a.rentPrice <= ?';
      values.push(maxRent);
      countValues.push(maxRent);
    }
  }

  // Ensure limit and offset are valid integers
  const finalLimit = Math.max(1, Math.min(parseInt(limit) || 25, 100)); // Cap at 100
  const finalOffset = Math.max(0, parseInt(offset) || 0);

  query += ` ORDER BY b.buildingName ASC, f.floorName ASC, a.apartmentId ASC LIMIT ${finalLimit} OFFSET ${finalOffset}`;

  try {
    const [totalResult] = await db.execute(countQuery, countValues);
    const [apartments] = await db.execute(query, values);

    return {
      apartments,
      total: totalResult[0].total,
      page,
      pages: Math.ceil(totalResult[0].total / limit),
      limit
    };
  } catch (error) {
    throw error;
  }
};

const getApartmentsByFloorId = async (floorId) => {
  const query = `
    SELECT a.*,
           
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

const updateApartment = async (apartmentId, updateData) => {
  const allowedFields = ['bedrooms', 'bathrooms', 'length', 'width', 'rentPrice'];
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

  values.push(apartmentId);
  const query = `UPDATE apartment SET ${updates.join(', ')} WHERE apartmentId = ?`;
  const result = await db.execute(query, values);
  
  if (result[0].affectedRows === 0) {
    throw new Error('Apartment not found');
  }

  return await getApartmentById(apartmentId);
};

const deleteApartment = async (apartmentId) => {
  const checkQuery = 'SELECT COUNT(*) as assignmentCount FROM ApartmentAssigned WHERE apartmentId = ?';
  const [checkResult] = await db.execute(checkQuery, [apartmentId]);
  
  if (checkResult[0].assignmentCount > 0) {
    throw new Error('Cannot delete apartment that is assigned to tenants');
  }

  const query = 'DELETE FROM apartment WHERE apartmentId = ?';
  const result = await db.execute(query, [apartmentId]);
  
  return result[0].affectedRows > 0;
};

const getAvailableApartments = async (filters = {}) => {
  let query = `
    SELECT a.*, f.floorName, b.buildingName, b.buildingAddress
    FROM apartment a
    INNER JOIN floor f ON a.floorId = f.floorId
    INNER JOIN building b ON f.buildingId = b.buildingId
    LEFT JOIN ApartmentAssigned aa ON a.apartmentId = aa.apartmentId
    WHERE aa.tenantId IS NULL
  `;
  
  const values = [];

  if (filters.buildingId) {
    query += ' AND b.buildingId = ?';
    values.push(filters.buildingId);
  }

  if (filters.minBedrooms) {
    query += ' AND a.bedrooms >= ?';
    values.push(filters.minBedrooms);
  }

  if (filters.maxRent) {
    query += ' AND a.rentPrice <= ?';
    values.push(filters.maxRent);
  }

  query += ' ORDER BY b.buildingName ASC, f.floorName ASC, a.apartmentId ASC';

  const [rows] = await db.execute(query, values);
  return rows;
};

const getApartmentCount = async () => {
  const query = 'SELECT COUNT(*) as count FROM apartment';
  const [rows] = await db.execute(query);
  return rows[0].count;
};

const getApartmentStatistics = async () => {
  const query = `
    SELECT 
      COUNT(a.apartmentId) as totalApartments,
      COUNT(aa.apartmentId) as occupiedApartments,
      COUNT(a.apartmentId) - COUNT(aa.apartmentId) as availableApartments,
      AVG(a.rentPrice) as averageRent,
      MIN(a.rentPrice) as minRent,
      MAX(a.rentPrice) as maxRent,
      AVG(a.bedrooms) as averageBedrooms,
      SUM(a.rentPrice) as totalPotentialRent,
      SUM(CASE WHEN aa.apartmentId IS NOT NULL THEN a.rentPrice ELSE 0 END) as totalCurrentRent
    FROM apartment a
    LEFT JOIN ApartmentAssigned aa ON a.apartmentId = aa.apartmentId
  `;
  
  const [rows] = await db.execute(query);
  return rows[0];
};

// Apartment Image Operations
const getApartmentImages = async (apartmentId) => {
  const query = 'SELECT * FROM apartmentImages WHERE apartmentId = ? ORDER BY createdAt DESC';
  const [rows] = await db.execute(query, [apartmentId]);
  return rows;
};

const getApartmentImageById = async (imageId) => {
  const query = 'SELECT * FROM apartmentImages WHERE imageId = ?';
  const [rows] = await db.execute(query, [imageId]);
  return rows[0] || null;
};

const addApartmentImage = async (apartmentId, imageUrl) => {
  try {
    // Try with varchar imageUrl first (if database is fixed)
    const query = 'INSERT INTO apartmentImages (apartmentId, imageUrl) VALUES (?, ?)';
    const result = await db.execute(query, [apartmentId, imageUrl]);

    return {
      imageId: result[0].insertId,
      apartmentId,
      imageUrl
    };
  } catch (error) {
    // If imageUrl column is still int, we need to handle it differently
    if (error.message.includes('Incorrect integer value')) {
      console.log('Warning: apartmentImages.imageUrl column is int type, skipping image insertion');
      console.log('Please run the database fix script to change imageUrl to varchar(500)');

      // Return a mock response to prevent breaking the apartment creation
      return {
        imageId: null,
        apartmentId,
        imageUrl: 'Image not saved - database schema needs fixing'
      };
    } else {
      throw error;
    }
  }
};

const deleteApartmentImage = async (imageId) => {
  const query = 'DELETE FROM apartmentImages WHERE imageId = ?';
  const result = await db.execute(query, [imageId]);
  return result[0].affectedRows > 0;
};

// Apartment Amenities Operations
const getApartmentAmenities = async (apartmentId) => {
  const query = 'SELECT * FROM apartmentAmenities WHERE apartmentId = ?';
  const [rows] = await db.execute(query, [apartmentId]);
  return rows;
};

const addApartmentAmenity = async (apartmentId, amenityName) => {
  const query = 'INSERT INTO apartmentAmenities (apartmentId, amenityName) VALUES (?, ?)';
  const result = await db.execute(query, [apartmentId, amenityName]);

  return {
    amenitiesId: result[0].insertId,
    apartmentId,
    amenityName
  };
};

const deleteApartmentAmenity = async (amenitiesId) => {
  const query = 'DELETE FROM apartmentAmenities WHERE amenitiesId = ?';
  const result = await db.execute(query, [amenitiesId]);
  return result[0].affectedRows > 0;
};

const updateApartmentAmenities = async (apartmentId, amenities) => {
  // First delete existing amenities
  await db.execute('DELETE FROM apartmentAmenities WHERE apartmentId = ?', [apartmentId]);

  // Then add new amenities
  if (amenities && amenities.length > 0) {
    const promises = amenities.map(amenity => addApartmentAmenity(apartmentId, amenity));
    await Promise.all(promises);
  }

  return await getApartmentAmenities(apartmentId);
};

export default {
  createApartment,
  getApartmentById,
  getAllApartments,
  getApartmentsByFloorId,
  updateApartment,
  deleteApartment,
  getAvailableApartments,
  getApartmentCount,
  getApartmentStatistics,
  getApartmentImages,
  getApartmentImageById,
  addApartmentImage,
  deleteApartmentImage,
  getApartmentAmenities,
  addApartmentAmenity,
  deleteApartmentAmenity,
  updateApartmentAmenities
};
