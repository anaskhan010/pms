import asyncHandler from '../../utils/asyncHandler.js';
import vendorModel from '../../models/vendor/Vendor.js';
import ErrorResponse from '../../utils/errorResponse.js';

/**
 * Vendor Controller
 * Handles all vendor operations with role-based access control
 */

// @desc    Create new vendor
// @route   POST /api/v1/vendors
// @access  Private (requires vendors.create permission)
const createVendor = asyncHandler(async (req, res, next) => {
  try {
    console.log(`🏢 Creating vendor by user ${req.user.userId}`);

    const vendorData = {
      ...req.body,
      createdBy: req.user.userId
    };

    const vendor = await vendorModel.createVendor(vendorData);

    console.log(`✅ Vendor created: ${vendor.vendorId}`);

    res.status(201).json({
      success: true,
      message: 'Vendor created successfully',
      data: vendor
    });
  } catch (error) {
    console.error('Error creating vendor:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

// @desc    Get all vendors
// @route   GET /api/v1/vendors
// @access  Private (requires vendors.view permission)
const getAllVendors = asyncHandler(async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filters = {
      serviceType: req.query.serviceType,
      search: req.query.search,
      minRating: req.query.minRating ? parseFloat(req.query.minRating) : null
    };

    console.log(`🏢 Getting vendors for user ${req.user.userId} (role: ${req.user.roleId})`);

    // Apply role-based data filtering
    if (req.dataFilter && !req.dataFilter.isAdmin) {
      // For owners, show only vendors they created
      if (req.dataFilter.isOwner) {
        filters.ownerFilter = true;
        filters.createdBy = req.user.userId;
      } else {
        // For staff roles, show vendors created by their creator
        filters.createdBy = req.user.createdBy || req.user.userId;
      }
    }

    const result = await vendorModel.getAllVendors(page, limit, filters);

    console.log(`✅ Retrieved ${result.vendors.length} vendors (total: ${result.total})`);

    res.status(200).json({
      success: true,
      count: result.vendors.length,
      total: result.total,
      pagination: {
        page: result.page,
        pages: result.pages,
        limit: result.limit
      },
      data: result.vendors
    });
  } catch (error) {
    console.error('Error getting vendors:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

// @desc    Get vendor by ID
// @route   GET /api/v1/vendors/:id
// @access  Private (requires vendors.view permission)
const getVendorById = asyncHandler(async (req, res, next) => {
  try {
    const vendorId = req.params.id;
    console.log(`🏢 Getting vendor ${vendorId} by user ${req.user.userId}`);

    const vendor = await vendorModel.getVendorById(vendorId);

    if (!vendor) {
      return next(new ErrorResponse('Vendor not found', 404));
    }

    // Role-based access control
    if (!req.dataFilter?.isAdmin && vendor.createdBy !== req.user.userId) {
      // Check if user has access to this vendor (staff can see vendors created by their creator)
      if (!req.dataFilter?.isOwner && vendor.createdBy !== req.user.createdBy) {
        return next(new ErrorResponse('Access denied to this vendor', 403));
      }
    }

    console.log(`✅ Retrieved vendor: ${vendor.vendorName}`);

    res.status(200).json({
      success: true,
      data: vendor
    });
  } catch (error) {
    console.error('Error getting vendor by ID:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

// @desc    Update vendor
// @route   PUT /api/v1/vendors/:id
// @access  Private (requires vendors.update permission)
const updateVendor = asyncHandler(async (req, res, next) => {
  try {
    const vendorId = req.params.id;
    console.log(`🏢 Updating vendor ${vendorId} by user ${req.user.userId}`);

    // Check if vendor exists and user has access
    const existingVendor = await vendorModel.getVendorById(vendorId);
    if (!existingVendor) {
      return next(new ErrorResponse('Vendor not found', 404));
    }

    // Role-based access control
    if (!req.dataFilter?.isAdmin && existingVendor.createdBy !== req.user.userId) {
      // Only owners can update vendors they created
      if (!req.dataFilter?.isOwner || existingVendor.createdBy !== req.user.userId) {
        return next(new ErrorResponse('Access denied to update this vendor', 403));
      }
    }

    const updatedVendor = await vendorModel.updateVendor(vendorId, req.body);

    console.log(`✅ Vendor updated: ${updatedVendor.vendorName}`);

    res.status(200).json({
      success: true,
      message: 'Vendor updated successfully',
      data: updatedVendor
    });
  } catch (error) {
    console.error('Error updating vendor:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

// @desc    Delete vendor
// @route   DELETE /api/v1/vendors/:id
// @access  Private (requires vendors.delete permission)
const deleteVendor = asyncHandler(async (req, res, next) => {
  try {
    const vendorId = req.params.id;
    console.log(`🏢 Deleting vendor ${vendorId} by user ${req.user.userId}`);

    // Check if vendor exists and user has access
    const existingVendor = await vendorModel.getVendorById(vendorId);
    if (!existingVendor) {
      return next(new ErrorResponse('Vendor not found', 404));
    }

    // Role-based access control
    if (!req.dataFilter?.isAdmin && existingVendor.createdBy !== req.user.userId) {
      return next(new ErrorResponse('Access denied to delete this vendor', 403));
    }

    await vendorModel.deleteVendor(vendorId);

    console.log(`✅ Vendor deleted: ${vendorId}`);

    res.status(200).json({
      success: true,
      message: 'Vendor deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

// @desc    Assign vendor to property
// @route   POST /api/v1/vendors/:id/assign
// @access  Private (requires vendors.assign permission)
const assignVendorToProperty = asyncHandler(async (req, res, next) => {
  try {
    const vendorId = req.params.id;
    console.log(`🏢 Assigning vendor ${vendorId} to property by user ${req.user.userId}`);

    // Check if vendor exists and user has access
    const existingVendor = await vendorModel.getVendorById(vendorId);
    if (!existingVendor) {
      return next(new ErrorResponse('Vendor not found', 404));
    }

    // Role-based access control for vendor
    if (!req.dataFilter?.isAdmin && existingVendor.createdBy !== req.user.userId) {
      if (!req.dataFilter?.isOwner || existingVendor.createdBy !== req.user.userId) {
        return next(new ErrorResponse('Access denied to assign this vendor', 403));
      }
    }

    // Check property access
    const { propertyType, propertyId } = req.body;
    if (!req.dataFilter?.isAdmin) {
      const hasPropertyAccess = checkPropertyAccess(propertyType, propertyId, req.dataFilter);
      if (!hasPropertyAccess) {
        return next(new ErrorResponse('Access denied to this property', 403));
      }
    }

    const assignmentData = {
      ...req.body,
      vendorId: parseInt(vendorId),
      assignedBy: req.user.userId
    };

    const assignment = await vendorModel.assignVendorToProperty(assignmentData);

    console.log(`✅ Vendor assigned to property: ${assignment.assignmentId}`);

    res.status(201).json({
      success: true,
      message: 'Vendor assigned to property successfully',
      data: assignment
    });
  } catch (error) {
    console.error('Error assigning vendor to property:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

// @desc    Get vendor assignments
// @route   GET /api/v1/vendors/:id/assignments
// @access  Private (requires vendors.view permission)
const getVendorAssignments = asyncHandler(async (req, res, next) => {
  try {
    const vendorId = req.params.id;
    console.log(`🏢 Getting assignments for vendor ${vendorId} by user ${req.user.userId}`);

    // Check if vendor exists and user has access
    const existingVendor = await vendorModel.getVendorById(vendorId);
    if (!existingVendor) {
      return next(new ErrorResponse('Vendor not found', 404));
    }

    // Role-based access control
    if (!req.dataFilter?.isAdmin && existingVendor.createdBy !== req.user.userId) {
      if (!req.dataFilter?.isOwner || existingVendor.createdBy !== req.user.userId) {
        return next(new ErrorResponse('Access denied to view this vendor\'s assignments', 403));
      }
    }

    const filters = {
      status: req.query.status,
      propertyType: req.query.propertyType
    };

    const assignments = await vendorModel.getVendorAssignments(vendorId, filters);

    console.log(`✅ Retrieved ${assignments.length} assignments for vendor ${vendorId}`);

    res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments
    });
  } catch (error) {
    console.error('Error getting vendor assignments:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

// @desc    Add vendor review
// @route   POST /api/v1/vendors/:id/reviews
// @access  Private (requires vendors.review permission)
const addVendorReview = asyncHandler(async (req, res, next) => {
  try {
    const vendorId = req.params.id;
    console.log(`🏢 Adding review for vendor ${vendorId} by user ${req.user.userId}`);

    // Check if vendor exists
    const existingVendor = await vendorModel.getVendorById(vendorId);
    if (!existingVendor) {
      return next(new ErrorResponse('Vendor not found', 404));
    }

    const reviewData = {
      ...req.body,
      vendorId: parseInt(vendorId),
      reviewerUserId: req.user.userId
    };

    const review = await vendorModel.addVendorReview(reviewData);

    console.log(`✅ Review added for vendor: ${review.reviewId}`);

    res.status(201).json({
      success: true,
      message: 'Vendor review added successfully',
      data: review
    });
  } catch (error) {
    console.error('Error adding vendor review:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

// @desc    Get vendor statistics
// @route   GET /api/v1/vendors/statistics
// @access  Private (requires vendors.view permission)
const getVendorStatistics = asyncHandler(async (req, res, next) => {
  try {
    console.log(`🏢 Getting vendor statistics for user ${req.user.userId}`);

    const filters = {};

    // Apply role-based filtering
    if (!req.dataFilter?.isAdmin) {
      if (req.dataFilter?.isOwner) {
        filters.createdBy = req.user.userId;
      } else {
        filters.createdBy = req.user.createdBy || req.user.userId;
      }
    }

    const stats = await vendorModel.getVendorStatistics(filters);

    console.log(`✅ Retrieved vendor statistics`);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting vendor statistics:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

// Helper function to check property access
const checkPropertyAccess = (propertyType, propertyId, dataFilter) => {
  if (!dataFilter) return false;
  
  if (propertyType === 'building' && dataFilter.assignedBuildings) {
    return dataFilter.assignedBuildings.includes(propertyId);
  }
  if (propertyType === 'villa' && dataFilter.assignedVillas) {
    return dataFilter.assignedVillas.includes(propertyId);
  }
  return false;
};

export {
  createVendor,
  getAllVendors,
  getVendorById,
  updateVendor,
  deleteVendor,
  assignVendorToProperty,
  getVendorAssignments,
  addVendorReview,
  getVendorStatistics
};
