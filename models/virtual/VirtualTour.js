import db from '../../config/db.js';

/**
 * Virtual Tour Model
 * Handles all database operations for virtual tours with role-based access control
 */

// Create a new virtual tour
const createVirtualTour = async (tourData) => {
  try {
    const {
      resourceType,
      resourceId,
      tourName,
      tourDescription,
      tourUrl,
      tourImages,
      createdBy
    } = tourData;

    const query = `
      INSERT INTO virtual_tours (resourceType, resourceId, tourName, tourDescription, tourUrl, tourImages, createdBy)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(query, [
      resourceType, resourceId, tourName, tourDescription, tourUrl, JSON.stringify(tourImages || []), createdBy
    ]);

    return {
      tourId: result.insertId,
      resourceType,
      resourceId,
      tourName,
      tourDescription,
      tourUrl,
      tourImages,
      createdBy
    };
  } catch (error) {
    console.error('Error creating virtual tour:', error);
    throw error;
  }
};

// Get virtual tour by ID
const getVirtualTourById = async (tourId) => {
  try {
    const query = `
      SELECT vt.*,
             u.firstName as creatorFirstName, u.lastName as creatorLastName,
             CASE
               WHEN vt.resourceType = 'building' THEN b.buildingName
               WHEN vt.resourceType = 'villa' THEN v.Name
               ELSE 'Unknown Property'
             END as propertyName
      FROM virtual_tours vt
      LEFT JOIN user u ON vt.createdBy = u.userId
      LEFT JOIN building b ON vt.resourceType = 'building' AND vt.resourceId = b.buildingId
      LEFT JOIN villas v ON vt.resourceType = 'villa' AND vt.resourceId = v.villasId
      WHERE vt.tourId = ? AND vt.isActive = 1
    `;

    const [rows] = await db.execute(query, [tourId]);
    if (rows[0] && rows[0].tourImages) {
      try {
        rows[0].tourImages = JSON.parse(rows[0].tourImages);
      } catch (e) {
        rows[0].tourImages = [];
      }
    }
    return rows[0] || null;
  } catch (error) {
    console.error('Error getting virtual tour by ID:', error);
    throw error;
  }
};

// Get all virtual tours with filtering and pagination
const getAllVirtualTours = async (page = 1, limit = 10, filters = {}) => {
  try {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE vt.isActive = 1';
    let queryParams = [];

    // Apply filters
    if (filters.property_type) {
      whereClause += ' AND vt.property_type = ?';
      queryParams.push(filters.property_type);
    }

    if (filters.property_id) {
      whereClause += ' AND vt.property_id = ?';
      queryParams.push(filters.property_id);
    }

    if (filters.created_by) {
      whereClause += ' AND vt.created_by = ?';
      queryParams.push(filters.created_by);
    }

    if (filters.search) {
      whereClause += ' AND (vt.title LIKE ? OR vt.description LIKE ?)';
      queryParams.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    // Role-based data filtering
    if (filters.assignedProperties && filters.assignedProperties.length > 0) {
      const propertyFilters = [];
      
      if (filters.assignedBuildings && filters.assignedBuildings.length > 0) {
        const buildingPlaceholders = filters.assignedBuildings.map(() => '?').join(',');
        propertyFilters.push(`(vt.property_type = 'building' AND vt.property_id IN (${buildingPlaceholders}))`);
        queryParams.push(...filters.assignedBuildings);
      }
      
      if (filters.assignedVillas && filters.assignedVillas.length > 0) {
        const villaPlaceholders = filters.assignedVillas.map(() => '?').join(',');
        propertyFilters.push(`(vt.property_type = 'villa' AND vt.property_id IN (${villaPlaceholders}))`);
        queryParams.push(...filters.assignedVillas);
      }
      
      if (propertyFilters.length > 0) {
        whereClause += ` AND (${propertyFilters.join(' OR ')})`;
      } else {
        // No properties assigned - return empty result
        return {
          tours: [],
          total: 0,
          page,
          pages: 0,
          limit
        };
      }
    }

    // Count total records
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM virtual_tours vt 
      ${whereClause}
    `;
    const [countResult] = await db.execute(countQuery, queryParams);
    const total = countResult[0].total;
    const pages = Math.ceil(total / limit);

    // Get tours with property information
    const dataQuery = `
      SELECT vt.*, 
             u.firstName as creatorFirstName, u.lastName as creatorLastName,
             CASE 
               WHEN vt.property_type = 'building' THEN b.buildingName
               WHEN vt.property_type = 'villa' THEN v.Name
               ELSE 'Unknown Property'
             END as propertyName,
             CASE 
               WHEN vt.property_type = 'building' THEN b.buildingAddress
               WHEN vt.property_type = 'villa' THEN v.Address
               ELSE 'Unknown Address'
             END as propertyAddress
      FROM virtual_tours vt
      LEFT JOIN user u ON vt.created_by = u.userId
      LEFT JOIN building b ON vt.property_type = 'building' AND vt.property_id = b.buildingId
      LEFT JOIN villas v ON vt.property_type = 'villa' AND vt.property_id = v.villasId
      ${whereClause}
      ORDER BY vt.createdAt DESC
      LIMIT ? OFFSET ?
    `;

    const [tours] = await db.execute(dataQuery, [...queryParams, limit, offset]);

    return {
      tours,
      total,
      page,
      pages,
      limit
    };
  } catch (error) {
    console.error('Error getting all virtual tours:', error);
    throw error;
  }
};

// Update virtual tour
const updateVirtualTour = async (tourId, updateData) => {
  try {
    const allowedFields = ['title', 'description', 'video_url', 'thumbnail_image', 'duration', 'isActive'];
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

    values.push(tourId);
    const query = `UPDATE virtual_tours SET ${updates.join(', ')}, updatedAt = CURRENT_TIMESTAMP WHERE tourId = ?`;
    const [result] = await db.execute(query, values);
    
    if (result.affectedRows === 0) {
      throw new Error('Virtual tour not found');
    }

    return await getVirtualTourById(tourId);
  } catch (error) {
    console.error('Error updating virtual tour:', error);
    throw error;
  }
};

// Delete virtual tour (soft delete)
const deleteVirtualTour = async (tourId) => {
  try {
    const query = 'UPDATE virtual_tours SET isActive = 0, updatedAt = CURRENT_TIMESTAMP WHERE tourId = ?';
    const [result] = await db.execute(query, [tourId]);
    
    if (result.affectedRows === 0) {
      throw new Error('Virtual tour not found');
    }

    return { success: true, message: 'Virtual tour deleted successfully' };
  } catch (error) {
    console.error('Error deleting virtual tour:', error);
    throw error;
  }
};

// Increment view count
const incrementViewCount = async (tourId) => {
  try {
    const query = 'UPDATE virtual_tours SET viewCount = viewCount + 1 WHERE tourId = ? AND isActive = 1';
    await db.execute(query, [tourId]);
  } catch (error) {
    console.error('Error incrementing view count:', error);
    throw error;
  }
};

// Get virtual tours by property
const getVirtualToursByProperty = async (propertyType, propertyId) => {
  try {
    const query = `
      SELECT vt.*, 
             u.firstName as creatorFirstName, u.lastName as creatorLastName
      FROM virtual_tours vt
      LEFT JOIN user u ON vt.created_by = u.userId
      WHERE vt.property_type = ? AND vt.property_id = ? AND vt.isActive = 1
      ORDER BY vt.createdAt DESC
    `;

    const [tours] = await db.execute(query, [propertyType, propertyId]);
    return tours;
  } catch (error) {
    console.error('Error getting virtual tours by property:', error);
    throw error;
  }
};

// Add virtual tour feature
const addVirtualTourFeature = async (tourId, featureData) => {
  try {
    const { featureName, description, timestamp } = featureData;
    
    const query = `
      INSERT INTO virtual_tour_features (tourId, featureName, description, timestamp)
      VALUES (?, ?, ?, ?)
    `;

    const [result] = await db.execute(query, [tourId, featureName, description, timestamp]);
    
    return {
      featureId: result.insertId,
      tourId,
      featureName,
      description,
      timestamp
    };
  } catch (error) {
    console.error('Error adding virtual tour feature:', error);
    throw error;
  }
};

// Get virtual tour features
const getVirtualTourFeatures = async (tourId) => {
  try {
    const query = `
      SELECT * FROM virtual_tour_features 
      WHERE tourId = ? 
      ORDER BY timestamp ASC
    `;

    const [features] = await db.execute(query, [tourId]);
    return features;
  } catch (error) {
    console.error('Error getting virtual tour features:', error);
    throw error;
  }
};

// Get virtual tour statistics
const getVirtualTourStatistics = async (filters = {}) => {
  try {
    let whereClause = 'WHERE vt.isActive = 1';
    let queryParams = [];

    if (filters.created_by) {
      whereClause += ' AND vt.created_by = ?';
      queryParams.push(filters.created_by);
    }

    const query = `
      SELECT 
        COUNT(*) as totalTours,
        SUM(vt.viewCount) as totalViews,
        AVG(vt.duration) as avgDuration,
        COUNT(CASE WHEN vt.property_type = 'building' THEN 1 END) as buildingTours,
        COUNT(CASE WHEN vt.property_type = 'villa' THEN 1 END) as villaTours,
        COUNT(CASE WHEN vt.createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as recentTours
      FROM virtual_tours vt
      ${whereClause}
    `;

    const [stats] = await db.execute(query, queryParams);
    return stats[0];
  } catch (error) {
    console.error('Error getting virtual tour statistics:', error);
    throw error;
  }
};

export default {
  createVirtualTour,
  getVirtualTourById,
  getAllVirtualTours,
  updateVirtualTour,
  deleteVirtualTour,
  incrementViewCount,
  getVirtualToursByProperty,
  addVirtualTourFeature,
  getVirtualTourFeatures,
  getVirtualTourStatistics
};
