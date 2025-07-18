import db from '../../config/db.js';

/**
 * Vendor Model
 * Handles all database operations for vendors with role-based access control
 */

// Create a new vendor
const createVendor = async (vendorData) => {
  try {
    const {
      vendorName,
      vendorType,
      contactPerson,
      phoneNumber,
      email,
      address,
      serviceDescription,
      createdBy
    } = vendorData;

    const query = `
      INSERT INTO vendors (
        vendorName, vendorType, contactPerson, phoneNumber, email, address, serviceDescription, createdBy
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(query, [
      vendorName, vendorType, contactPerson, phoneNumber, email, address, serviceDescription, createdBy
    ]);

    return {
      vendorId: result.insertId,
      vendorName,
      vendorType,
      contactPerson,
      phoneNumber,
      email,
      address,
      serviceDescription,
      createdBy
    };
  } catch (error) {
    console.error('Error creating vendor:', error);
    throw error;
  }
};

// Get vendor by ID
const getVendorById = async (vendorId) => {
  try {
    const query = `
      SELECT v.*,
             u.firstName as creatorFirstName, u.lastName as creatorLastName
      FROM vendors v
      LEFT JOIN user u ON v.createdBy = u.userId
      WHERE v.vendorId = ? AND v.isActive = 1
    `;

    const [rows] = await db.execute(query, [vendorId]);
    return rows[0] || null;
  } catch (error) {
    console.error('Error getting vendor by ID:', error);
    throw error;
  }
};

// Get all vendors with filtering and pagination
const getAllVendors = async (page = 1, limit = 10, filters = {}) => {
  try {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE v.isActive = 1';
    let queryParams = [];

    // Apply filters
    if (filters.serviceType) {
      whereClause += ' AND v.serviceType = ?';
      queryParams.push(filters.serviceType);
    }

    if (filters.createdBy) {
      whereClause += ' AND v.createdBy = ?';
      queryParams.push(filters.createdBy);
    }

    if (filters.search) {
      whereClause += ' AND (v.vendorName LIKE ? OR v.contactPerson LIKE ? OR v.description LIKE ?)';
      queryParams.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
    }

    if (filters.minRating) {
      whereClause += ' AND v.rating >= ?';
      queryParams.push(filters.minRating);
    }

    // Role-based data filtering for owners
    if (filters.ownerFilter && filters.createdBy) {
      whereClause += ' AND v.createdBy = ?';
      queryParams.push(filters.createdBy);
    }

    // Count total records
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM vendors v 
      ${whereClause}
    `;
    const [countResult] = await db.execute(countQuery, queryParams);
    const total = countResult[0].total;
    const pages = Math.ceil(total / limit);

    // Get vendors with additional information
    const dataQuery = `
      SELECT v.*, 
             u.firstName as creatorFirstName, u.lastName as creatorLastName,
             COUNT(va.assignmentId) as activeAssignments,
             AVG(vr.rating) as avgReviewRating,
             COUNT(vr.reviewId) as totalReviews
      FROM vendors v
      LEFT JOIN user u ON v.createdBy = u.userId
      LEFT JOIN vendor_assignments va ON v.vendorId = va.vendorId AND va.status = 'active'
      LEFT JOIN vendor_reviews vr ON v.vendorId = vr.vendorId
      ${whereClause}
      GROUP BY v.vendorId
      ORDER BY v.createdAt DESC
      LIMIT ? OFFSET ?
    `;

    const [vendors] = await db.execute(dataQuery, [...queryParams, limit, offset]);

    return {
      vendors,
      total,
      page,
      pages,
      limit
    };
  } catch (error) {
    console.error('Error getting all vendors:', error);
    throw error;
  }
};

// Update vendor
const updateVendor = async (vendorId, updateData) => {
  try {
    const allowedFields = [
      'vendorName', 'contactPerson', 'email', 'phoneNumber', 'address', 
      'serviceType', 'description', 'rating', 'contractStartDate', 
      'contractEndDate', 'monthlyRate', 'emergencyContact', 'licenseNumber', 
      'insuranceDetails', 'isActive'
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

    values.push(vendorId);
    const query = `UPDATE vendors SET ${updates.join(', ')}, updatedAt = CURRENT_TIMESTAMP WHERE vendorId = ?`;
    const [result] = await db.execute(query, values);
    
    if (result.affectedRows === 0) {
      throw new Error('Vendor not found');
    }

    return await getVendorById(vendorId);
  } catch (error) {
    console.error('Error updating vendor:', error);
    throw error;
  }
};

// Delete vendor (soft delete)
const deleteVendor = async (vendorId) => {
  try {
    const query = 'UPDATE vendors SET isActive = 0, updatedAt = CURRENT_TIMESTAMP WHERE vendorId = ?';
    const [result] = await db.execute(query, [vendorId]);
    
    if (result.affectedRows === 0) {
      throw new Error('Vendor not found');
    }

    return { success: true, message: 'Vendor deleted successfully' };
  } catch (error) {
    console.error('Error deleting vendor:', error);
    throw error;
  }
};

// Assign vendor to property
const assignVendorToProperty = async (assignmentData) => {
  try {
    const {
      vendorId,
      propertyType,
      propertyId,
      assignedBy,
      startDate,
      endDate,
      notes
    } = assignmentData;

    const query = `
      INSERT INTO vendor_assignments (vendorId, propertyType, propertyId, assignedBy, startDate, endDate, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(query, [
      vendorId, propertyType, propertyId, assignedBy, startDate, endDate, notes
    ]);

    return {
      assignmentId: result.insertId,
      vendorId,
      propertyType,
      propertyId,
      assignedBy,
      startDate,
      endDate,
      notes,
      status: 'active'
    };
  } catch (error) {
    console.error('Error assigning vendor to property:', error);
    throw error;
  }
};

// Get vendor assignments
const getVendorAssignments = async (vendorId, filters = {}) => {
  try {
    let whereClause = 'WHERE va.vendorId = ?';
    let queryParams = [vendorId];

    if (filters.status) {
      whereClause += ' AND va.status = ?';
      queryParams.push(filters.status);
    }

    if (filters.propertyType) {
      whereClause += ' AND va.propertyType = ?';
      queryParams.push(filters.propertyType);
    }

    const query = `
      SELECT va.*, 
             v.vendorName,
             u.firstName as assignedByFirstName, u.lastName as assignedByLastName,
             CASE 
               WHEN va.propertyType = 'building' THEN b.buildingName
               WHEN va.propertyType = 'villa' THEN vl.Name
               ELSE 'Unknown Property'
             END as propertyName,
             CASE 
               WHEN va.propertyType = 'building' THEN b.buildingAddress
               WHEN va.propertyType = 'villa' THEN vl.Address
               ELSE 'Unknown Address'
             END as propertyAddress
      FROM vendor_assignments va
      LEFT JOIN vendors v ON va.vendorId = v.vendorId
      LEFT JOIN user u ON va.assignedBy = u.userId
      LEFT JOIN building b ON va.propertyType = 'building' AND va.propertyId = b.buildingId
      LEFT JOIN villas vl ON va.propertyType = 'villa' AND va.propertyId = vl.villasId
      ${whereClause}
      ORDER BY va.createdAt DESC
    `;

    const [assignments] = await db.execute(query, queryParams);
    return assignments;
  } catch (error) {
    console.error('Error getting vendor assignments:', error);
    throw error;
  }
};

// Add vendor review
const addVendorReview = async (reviewData) => {
  try {
    const {
      vendorId,
      assignmentId,
      reviewerUserId,
      rating,
      reviewText,
      serviceDate,
      isRecommended
    } = reviewData;

    const query = `
      INSERT INTO vendor_reviews (vendorId, assignmentId, reviewerUserId, rating, reviewText, serviceDate, isRecommended)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(query, [
      vendorId, assignmentId, reviewerUserId, rating, reviewText, serviceDate, isRecommended
    ]);

    // Update vendor's average rating
    await updateVendorRating(vendorId);

    return {
      reviewId: result.insertId,
      vendorId,
      assignmentId,
      reviewerUserId,
      rating,
      reviewText,
      serviceDate,
      isRecommended
    };
  } catch (error) {
    console.error('Error adding vendor review:', error);
    throw error;
  }
};

// Update vendor's average rating
const updateVendorRating = async (vendorId) => {
  try {
    const query = `
      UPDATE vendors 
      SET rating = (
        SELECT COALESCE(AVG(rating), 0) 
        FROM vendor_reviews 
        WHERE vendorId = ?
      )
      WHERE vendorId = ?
    `;

    await db.execute(query, [vendorId, vendorId]);
  } catch (error) {
    console.error('Error updating vendor rating:', error);
    throw error;
  }
};

// Get vendor reviews
const getVendorReviews = async (vendorId) => {
  try {
    const query = `
      SELECT vr.*, 
             u.firstName as reviewerFirstName, u.lastName as reviewerLastName,
             va.propertyType, va.propertyId
      FROM vendor_reviews vr
      LEFT JOIN user u ON vr.reviewerUserId = u.userId
      LEFT JOIN vendor_assignments va ON vr.assignmentId = va.assignmentId
      WHERE vr.vendorId = ?
      ORDER BY vr.createdAt DESC
    `;

    const [reviews] = await db.execute(query, [vendorId]);
    return reviews;
  } catch (error) {
    console.error('Error getting vendor reviews:', error);
    throw error;
  }
};

// Get vendor statistics
const getVendorStatistics = async (filters = {}) => {
  try {
    let whereClause = 'WHERE v.isActive = 1';
    let queryParams = [];

    if (filters.createdBy) {
      whereClause += ' AND v.createdBy = ?';
      queryParams.push(filters.createdBy);
    }

    const query = `
      SELECT 
        COUNT(*) as totalVendors,
        COUNT(CASE WHEN v.serviceType = 'maintenance' THEN 1 END) as maintenanceVendors,
        COUNT(CASE WHEN v.serviceType = 'cleaning' THEN 1 END) as cleaningVendors,
        COUNT(CASE WHEN v.serviceType = 'security' THEN 1 END) as securityVendors,
        AVG(v.rating) as avgRating,
        COUNT(CASE WHEN v.rating >= 4.0 THEN 1 END) as highRatedVendors,
        SUM(v.monthlyRate) as totalMonthlySpend,
        COUNT(CASE WHEN v.createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as recentVendors
      FROM vendors v
      ${whereClause}
    `;

    const [stats] = await db.execute(query, queryParams);
    return stats[0];
  } catch (error) {
    console.error('Error getting vendor statistics:', error);
    throw error;
  }
};

export default {
  createVendor,
  getVendorById,
  getAllVendors,
  updateVendor,
  deleteVendor,
  assignVendorToProperty,
  getVendorAssignments,
  addVendorReview,
  getVendorReviews,
  getVendorStatistics
};
