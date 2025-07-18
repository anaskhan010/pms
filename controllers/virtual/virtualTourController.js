import asyncHandler from '../../utils/asyncHandler.js';
import virtualTourModel from '../../models/virtual/VirtualTour.js';
import ErrorResponse from '../../utils/errorResponse.js';

/**
 * Virtual Tour Controller
 * Handles all virtual tour operations with role-based access control
 */

// @desc    Create new virtual tour
// @route   POST /api/v1/virtual-tours
// @access  Private (requires virtual_tours.create permission)
const createVirtualTour = asyncHandler(async (req, res, next) => {
  try {
    console.log(`🎬 Creating virtual tour by user ${req.user.userId}`);

    const tourData = {
      ...req.body,
      created_by: req.user.userId
    };

    const tour = await virtualTourModel.createVirtualTour(tourData);

    console.log(`✅ Virtual tour created: ${tour.tourId}`);

    res.status(201).json({
      success: true,
      message: 'Virtual tour created successfully',
      data: tour
    });
  } catch (error) {
    console.error('Error creating virtual tour:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

// @desc    Get all virtual tours
// @route   GET /api/v1/virtual-tours
// @access  Private (requires virtual_tours.view permission)
const getAllVirtualTours = asyncHandler(async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filters = {
      property_type: req.query.property_type,
      property_id: req.query.property_id,
      search: req.query.search
    };

    console.log(`🎬 Getting virtual tours for user ${req.user.userId} (role: ${req.user.roleId})`);

    // Apply role-based data filtering
    if (req.dataFilter && !req.dataFilter.isAdmin) {
      // For owners, filter by assigned properties
      if (req.dataFilter.assignedBuildings || req.dataFilter.assignedVillas) {
        filters.assignedProperties = true;
        filters.assignedBuildings = req.dataFilter.assignedBuildings;
        filters.assignedVillas = req.dataFilter.assignedVillas;
      } else {
        // For staff roles, show tours they created
        filters.created_by = req.user.userId;
      }
    }

    const result = await virtualTourModel.getAllVirtualTours(page, limit, filters);

    console.log(`✅ Retrieved ${result.tours.length} virtual tours (total: ${result.total})`);

    res.status(200).json({
      success: true,
      count: result.tours.length,
      total: result.total,
      pagination: {
        page: result.page,
        pages: result.pages,
        limit: result.limit
      },
      data: result.tours
    });
  } catch (error) {
    console.error('Error getting virtual tours:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

// @desc    Get virtual tour by ID
// @route   GET /api/v1/virtual-tours/:id
// @access  Private (requires virtual_tours.view permission)
const getVirtualTourById = asyncHandler(async (req, res, next) => {
  try {
    const tourId = req.params.id;
    console.log(`🎬 Getting virtual tour ${tourId} by user ${req.user.userId}`);

    const tour = await virtualTourModel.getVirtualTourById(tourId);

    if (!tour) {
      return next(new ErrorResponse('Virtual tour not found', 404));
    }

    // Role-based access control
    if (!req.dataFilter.isAdmin && tour.created_by !== req.user.userId) {
      // Check if user has access to this property
      const hasAccess = checkPropertyAccess(tour, req.dataFilter);
      if (!hasAccess) {
        return next(new ErrorResponse('Access denied to this virtual tour', 403));
      }
    }

    // Increment view count
    await virtualTourModel.incrementViewCount(tourId);

    console.log(`✅ Retrieved virtual tour: ${tour.title}`);

    res.status(200).json({
      success: true,
      data: tour
    });
  } catch (error) {
    console.error('Error getting virtual tour by ID:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

// @desc    Update virtual tour
// @route   PUT /api/v1/virtual-tours/:id
// @access  Private (requires virtual_tours.update permission)
const updateVirtualTour = asyncHandler(async (req, res, next) => {
  try {
    const tourId = req.params.id;
    console.log(`🎬 Updating virtual tour ${tourId} by user ${req.user.userId}`);

    // Check if tour exists and user has access
    const existingTour = await virtualTourModel.getVirtualTourById(tourId);
    if (!existingTour) {
      return next(new ErrorResponse('Virtual tour not found', 404));
    }

    // Role-based access control
    if (!req.dataFilter.isAdmin && existingTour.created_by !== req.user.userId) {
      const hasAccess = checkPropertyAccess(existingTour, req.dataFilter);
      if (!hasAccess) {
        return next(new ErrorResponse('Access denied to update this virtual tour', 403));
      }
    }

    const updatedTour = await virtualTourModel.updateVirtualTour(tourId, req.body);

    console.log(`✅ Virtual tour updated: ${updatedTour.title}`);

    res.status(200).json({
      success: true,
      message: 'Virtual tour updated successfully',
      data: updatedTour
    });
  } catch (error) {
    console.error('Error updating virtual tour:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

// @desc    Delete virtual tour
// @route   DELETE /api/v1/virtual-tours/:id
// @access  Private (requires virtual_tours.delete permission)
const deleteVirtualTour = asyncHandler(async (req, res, next) => {
  try {
    const tourId = req.params.id;
    console.log(`🎬 Deleting virtual tour ${tourId} by user ${req.user.userId}`);

    // Check if tour exists and user has access
    const existingTour = await virtualTourModel.getVirtualTourById(tourId);
    if (!existingTour) {
      return next(new ErrorResponse('Virtual tour not found', 404));
    }

    // Role-based access control
    if (!req.dataFilter.isAdmin && existingTour.created_by !== req.user.userId) {
      const hasAccess = checkPropertyAccess(existingTour, req.dataFilter);
      if (!hasAccess) {
        return next(new ErrorResponse('Access denied to delete this virtual tour', 403));
      }
    }

    await virtualTourModel.deleteVirtualTour(tourId);

    console.log(`✅ Virtual tour deleted: ${tourId}`);

    res.status(200).json({
      success: true,
      message: 'Virtual tour deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting virtual tour:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

// @desc    Get virtual tours by property
// @route   GET /api/v1/virtual-tours/property/:type/:id
// @access  Private (requires virtual_tours.view permission)
const getVirtualToursByProperty = asyncHandler(async (req, res, next) => {
  try {
    const { type, id } = req.params;
    console.log(`🎬 Getting virtual tours for ${type} ${id} by user ${req.user.userId}`);

    // Role-based access control for property
    if (!req.dataFilter.isAdmin) {
      const hasPropertyAccess = checkPropertyAccessByTypeId(type, parseInt(id), req.dataFilter);
      if (!hasPropertyAccess) {
        return next(new ErrorResponse('Access denied to this property', 403));
      }
    }

    const tours = await virtualTourModel.getVirtualToursByProperty(type, parseInt(id));

    console.log(`✅ Retrieved ${tours.length} virtual tours for ${type} ${id}`);

    res.status(200).json({
      success: true,
      count: tours.length,
      data: tours
    });
  } catch (error) {
    console.error('Error getting virtual tours by property:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

// @desc    Add virtual tour feature
// @route   POST /api/v1/virtual-tours/:id/features
// @access  Private (requires virtual_tours.update permission)
const addVirtualTourFeature = asyncHandler(async (req, res, next) => {
  try {
    const tourId = req.params.id;
    console.log(`🎬 Adding feature to virtual tour ${tourId} by user ${req.user.userId}`);

    // Check if tour exists and user has access
    const existingTour = await virtualTourModel.getVirtualTourById(tourId);
    if (!existingTour) {
      return next(new ErrorResponse('Virtual tour not found', 404));
    }

    // Role-based access control
    if (!req.dataFilter.isAdmin && existingTour.created_by !== req.user.userId) {
      const hasAccess = checkPropertyAccess(existingTour, req.dataFilter);
      if (!hasAccess) {
        return next(new ErrorResponse('Access denied to modify this virtual tour', 403));
      }
    }

    const feature = await virtualTourModel.addVirtualTourFeature(tourId, req.body);

    console.log(`✅ Feature added to virtual tour: ${feature.featureName}`);

    res.status(201).json({
      success: true,
      message: 'Virtual tour feature added successfully',
      data: feature
    });
  } catch (error) {
    console.error('Error adding virtual tour feature:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

// @desc    Get virtual tour statistics
// @route   GET /api/v1/virtual-tours/statistics
// @access  Private (requires virtual_tours.view permission)
const getVirtualTourStatistics = asyncHandler(async (req, res, next) => {
  try {
    console.log(`🎬 Getting virtual tour statistics for user ${req.user.userId}`);

    const filters = {};

    // Apply role-based filtering
    if (!req.dataFilter.isAdmin) {
      filters.created_by = req.user.userId;
    }

    const stats = await virtualTourModel.getVirtualTourStatistics(filters);

    console.log(`✅ Retrieved virtual tour statistics`);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting virtual tour statistics:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

// Helper function to check property access
const checkPropertyAccess = (tour, dataFilter) => {
  if (tour.property_type === 'building' && dataFilter.assignedBuildings) {
    return dataFilter.assignedBuildings.includes(tour.property_id);
  }
  if (tour.property_type === 'villa' && dataFilter.assignedVillas) {
    return dataFilter.assignedVillas.includes(tour.property_id);
  }
  return false;
};

// Helper function to check property access by type and ID
const checkPropertyAccessByTypeId = (type, id, dataFilter) => {
  if (type === 'building' && dataFilter.assignedBuildings) {
    return dataFilter.assignedBuildings.includes(id);
  }
  if (type === 'villa' && dataFilter.assignedVillas) {
    return dataFilter.assignedVillas.includes(id);
  }
  return false;
};

export {
  createVirtualTour,
  getAllVirtualTours,
  getVirtualTourById,
  updateVirtualTour,
  deleteVirtualTour,
  getVirtualToursByProperty,
  addVirtualTourFeature,
  getVirtualTourStatistics
};
