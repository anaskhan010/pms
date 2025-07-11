import floorModel from '../../models/property/Floor.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ErrorResponse from '../../utils/errorResponse.js';
import fs from 'fs';
import path from 'path';

const getFloorById = asyncHandler(async (req, res, next) => {
  try {
    const floor = await floorModel.getFloorById(req.params.id);

    if (!floor) {
      return next(new ErrorResponse(`Floor not found with id of ${req.params.id}`, 404));
    }

    // Get floor images
    const images = await floorModel.getFloorImages(req.params.id);
    floor.images = images;

    res.status(200).json({
      success: true,
      data: floor
    });
  } catch (error) {
    console.error('Error fetching floor:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

const getAllFloors = asyncHandler(async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const filters = {
      buildingId: req.query.buildingId,
      search: req.query.search
    };

    // Add owner building filtering if user is owner
    if (req.ownerBuildings && req.ownerBuildings.length > 0) {
      filters.ownerBuildings = req.ownerBuildings;
    }

    const result = await floorModel.getAllFloors(page, limit, filters);

    res.status(200).json({
      success: true,
      count: result.floors.length,
      total: result.total,
      pagination: {
        page: result.page,
        pages: result.pages,
        limit: limit
      },
      data: result.floors
    });
  } catch (error) {
    console.error('Error fetching floors:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

const createFloor = asyncHandler(async (req, res, next) => {
  try {
    const { buildingId, floorName } = req.body;

    const floor = await floorModel.createFloor(buildingId, floorName);

    // Handle image upload if present
    if (req.files && req.files.length > 0) {
      const imagePromises = req.files.map(file => {
        const imageUrl = `/public/uploads/floors/${file.filename}`;
        return floorModel.addFloorImage(floor.floorId, imageUrl);
      });
      await Promise.all(imagePromises);
    }

    res.status(201).json({
      success: true,
      data: floor,
      message: 'Floor created successfully'
    });
  } catch (error) {
    console.error('Error creating floor:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

const updateFloor = asyncHandler(async (req, res, next) => {
  try {
    const floor = await floorModel.updateFloor(req.params.id, req.body);

    // Handle new image uploads if present
    if (req.files && req.files.length > 0) {
      const imagePromises = req.files.map(file => {
        const imageUrl = `/public/uploads/floors/${file.filename}`;
        return floorModel.addFloorImage(req.params.id, imageUrl);
      });
      await Promise.all(imagePromises);
    }

    res.status(200).json({
      success: true,
      data: floor,
      message: 'Floor updated successfully'
    });
  } catch (error) {
    console.error('Error updating floor:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

const deleteFloor = asyncHandler(async (req, res, next) => {
  try {
    // Get floor images before deletion to clean up files
    const images = await floorModel.getFloorImages(req.params.id);
    
    const deleted = await floorModel.deleteFloor(req.params.id);

    if (!deleted) {
      return next(new ErrorResponse(`Floor not found with id of ${req.params.id}`, 404));
    }

    // Clean up image files
    images.forEach(image => {
      const filePath = path.join(process.cwd(), 'public', image.imageUrl.replace('/public/', ''));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    res.status(200).json({
      success: true,
      message: 'Floor deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting floor:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

const getFloorApartments = asyncHandler(async (req, res, next) => {
  try {
    const apartments = await floorModel.getFloorApartments(req.params.id);

    res.status(200).json({
      success: true,
      data: apartments
    });
  } catch (error) {
    console.error('Error fetching floor apartments:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

const getFloorStatistics = asyncHandler(async (req, res, next) => {
  try {
    const statistics = await floorModel.getFloorStatistics();

    res.status(200).json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('Error fetching floor statistics:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

const addFloorImage = asyncHandler(async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ErrorResponse('No image file provided', 400));
    }

    const imageUrl = `/public/uploads/floors/${req.file.filename}`;
    const image = await floorModel.addFloorImage(req.params.id, imageUrl);

    res.status(201).json({
      success: true,
      data: image,
      message: 'Floor image added successfully'
    });
  } catch (error) {
    console.error('Error adding floor image:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

const deleteFloorImage = asyncHandler(async (req, res, next) => {
  try {
    const image = await floorModel.getFloorImageById(req.params.imageId);
    
    if (!image) {
      return next(new ErrorResponse('Image not found', 404));
    }

    const deleted = await floorModel.deleteFloorImage(req.params.imageId);

    if (deleted) {
      // Clean up image file
      const filePath = path.join(process.cwd(), 'public', image.imageUrl.replace('/public/', ''));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Floor image deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting floor image:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

export default {
  getAllFloors,
  getFloorById,
  createFloor,
  updateFloor,
  deleteFloor,
  getFloorApartments,
  getFloorStatistics,
  addFloorImage,
  deleteFloorImage
};
