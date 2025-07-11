import villaModel from '../../models/property/Villa.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ErrorResponse from '../../utils/errorResponse.js';
import db from '../../config/db.js';
import fs from 'fs';
import path from 'path';

const getAllVillas = asyncHandler(async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const filters = {
      search: req.query.search
    };

    let result;

    // Check if this is ownership-based access (set by smartAuthorize middleware)
    if (req.isOwnershipAccess) {
      // User has view_own permission, show only assigned villas
      const assignedVillas = await villaModel.getUserAssignedVillas(req.user.userId);
      result = {
        villas: assignedVillas,
        total: assignedVillas.length,
        page: 1,
        pages: 1
      };
    } else {
      // User has general view permission, show all villas
      result = await villaModel.getAllVillas(page, limit, filters);
    }

    // Get images and features for each villa
    const villasWithDetails = await Promise.all(
      result.villas.map(async (villa) => {
        const images = await villaModel.getVillaImages(villa.villasId);
        const features = await villaModel.getVillaFeatures(villa.villasId);
        return {
          ...villa,
          images,
          features: features.map(f => f.features)
        };
      })
    );

    res.status(200).json({
      success: true,
      count: villasWithDetails.length,
      total: result.total,
      pagination: {
        page: result.page,
        pages: result.pages,
        limit: limit
      },
      data: villasWithDetails
    });
  } catch (error) {
    console.error('Error fetching villas:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

const getVillaById = asyncHandler(async (req, res, next) => {
  try {
    const villa = await villaModel.getVillaById(req.params.id);

    if (!villa) {
      return next(new ErrorResponse(`Villa not found with id of ${req.params.id}`, 404));
    }

    // If this is ownership-based access, verify the user owns this villa
    if (req.isOwnershipAccess) {
      const userVillas = await villaModel.getUserAssignedVillas(req.user.userId);
      const isOwner = userVillas.some(userVilla => userVilla.villasId == req.params.id);

      if (!isOwner) {
        return next(new ErrorResponse('Access denied. You can only view your assigned villas.', 403));
      }
    }

    // Get villa images and features
    const images = await villaModel.getVillaImages(req.params.id);
    const features = await villaModel.getVillaFeatures(req.params.id);

    villa.images = images;
    villa.features = features.map(f => f.features);

    res.status(200).json({
      success: true,
      data: villa
    });
  } catch (error) {
    console.error('Error fetching villa:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

const createVilla = asyncHandler(async (req, res, next) => {
  try {
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
      status,
      features
    } = req.body;

    // Parse features if it's a string
    let parsedFeatures = [];
    if (features) {
      parsedFeatures = typeof features === 'string' ? JSON.parse(features) : features;
    }

    const villaData = {
      Name,
      Address,
      bedrooms: parseInt(bedrooms),
      bathrooms: parseInt(bathrooms),
      length: parseInt(length),
      width: parseInt(width),
      price: parseInt(price),
      description,
      yearOfCreation,
      status: status || 'Available'
    };

    const villa = await villaModel.createVilla(villaData);

    // Handle image uploads if present
    if (req.files && req.files.length > 0) {
      const imagePromises = req.files.map(file => {
        const imageUrl = `/public/uploads/villas/${file.filename}`;
        return villaModel.addVillaImage(villa.villasId, imageUrl);
      });
      await Promise.all(imagePromises);
    }

    // Handle features if present
    if (parsedFeatures && parsedFeatures.length > 0) {
      const featurePromises = parsedFeatures.map(feature => 
        villaModel.addVillaFeature(villa.villasId, feature)
      );
      await Promise.all(featurePromises);
    }

    res.status(201).json({
      success: true,
      data: villa,
      message: 'Villa created successfully'
    });
  } catch (error) {
    console.error('Error creating villa:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

const updateVilla = asyncHandler(async (req, res, next) => {
  try {
    // If this is ownership-based access, verify the user owns this villa
    if (req.isOwnershipAccess) {
      const userVillas = await villaModel.getUserAssignedVillas(req.user.userId);
      const isOwner = userVillas.some(villa => villa.villasId == req.params.id);

      if (!isOwner) {
        return next(new ErrorResponse('Access denied. You can only update your assigned villas.', 403));
      }
    }

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
      status,
      features
    } = req.body;

    // Parse features if it's a string
    let parsedFeatures = [];
    if (features) {
      parsedFeatures = typeof features === 'string' ? JSON.parse(features) : features;
    }

    const updateData = {
      Name,
      Address,
      bedrooms: bedrooms ? parseInt(bedrooms) : undefined,
      bathrooms: bathrooms ? parseInt(bathrooms) : undefined,
      length: length ? parseInt(length) : undefined,
      width: width ? parseInt(width) : undefined,
      price: price ? parseInt(price) : undefined,
      description,
      yearOfCreation,
      status
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );

    const villa = await villaModel.updateVilla(req.params.id, updateData);

    // Handle new image uploads if present
    if (req.files && req.files.length > 0) {
      const imagePromises = req.files.map(file => {
        const imageUrl = `/public/uploads/villas/${file.filename}`;
        return villaModel.addVillaImage(villa.villasId, imageUrl);
      });
      await Promise.all(imagePromises);
    }

    // Update features if provided
    if (parsedFeatures && parsedFeatures.length > 0) {
      // Get existing features
      const existingFeatures = await villaModel.getVillaFeatures(req.params.id);
      
      // Delete existing features
      const deletePromises = existingFeatures.map(feature => 
        villaModel.deleteVillaFeature(feature.featureId)
      );
      await Promise.all(deletePromises);

      // Add new features
      const featurePromises = parsedFeatures.map(feature => 
        villaModel.addVillaFeature(villa.villasId, feature)
      );
      await Promise.all(featurePromises);
    }

    res.status(200).json({
      success: true,
      data: villa,
      message: 'Villa updated successfully'
    });
  } catch (error) {
    console.error('Error updating villa:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

const deleteVilla = asyncHandler(async (req, res, next) => {
  try {
    const villa = await villaModel.getVillaById(req.params.id);
    
    if (!villa) {
      return next(new ErrorResponse(`Villa not found with id of ${req.params.id}`, 404));
    }

    // Get villa images to delete files
    const images = await villaModel.getVillaImages(req.params.id);
    
    // Delete image files from filesystem
    images.forEach(image => {
      const imagePath = path.join(process.cwd(), image.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    });

    const deleted = await villaModel.deleteVilla(req.params.id);
    
    if (!deleted) {
      return next(new ErrorResponse('Failed to delete villa', 400));
    }

    res.status(200).json({
      success: true,
      message: 'Villa deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting villa:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

const getVillaImages = asyncHandler(async (req, res, next) => {
  try {
    const images = await villaModel.getVillaImages(req.params.id);

    res.status(200).json({
      success: true,
      data: images
    });
  } catch (error) {
    console.error('Error fetching villa images:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

const addVillaImage = asyncHandler(async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ErrorResponse('Please upload an image', 400));
    }

    const imageUrl = `/public/uploads/villas/${req.file.filename}`;
    const image = await villaModel.addVillaImage(req.params.id, imageUrl);

    res.status(201).json({
      success: true,
      data: image,
      message: 'Villa image added successfully'
    });
  } catch (error) {
    console.error('Error adding villa image:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

const deleteVillaImage = asyncHandler(async (req, res, next) => {
  try {
    // Get image details first
    const query = 'SELECT * FROM villaImages WHERE imageId = ?';
    const [rows] = await db.execute(query, [req.params.imageId]);
    
    if (rows.length === 0) {
      return next(new ErrorResponse('Image not found', 404));
    }

    const image = rows[0];
    
    // Delete file from filesystem
    const imagePath = path.join(process.cwd(), image.imageUrl);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    const deleted = await villaModel.deleteVillaImage(req.params.imageId);
    
    if (!deleted) {
      return next(new ErrorResponse('Failed to delete image', 400));
    }

    res.status(200).json({
      success: true,
      message: 'Villa image deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting villa image:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

const getVillaStatistics = asyncHandler(async (req, res, next) => {
  try {
    const stats = await villaModel.getVillaStatistics();

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching villa statistics:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

// Villa Assignment Functions
const assignVillaToOwner = asyncHandler(async (req, res, next) => {
  try {
    const { villaId, userId } = req.body;

    if (!villaId || !userId) {
      return next(new ErrorResponse('Villa ID and User ID are required', 400));
    }

    // Check if villa exists
    const villa = await villaModel.getVillaById(villaId);
    if (!villa) {
      return next(new ErrorResponse(`Villa not found with id of ${villaId}`, 404));
    }

    // Check if villa is already assigned
    const existingAssignments = await villaModel.getVillaAssignments(villaId);
    if (existingAssignments.length > 0) {
      return next(new ErrorResponse('Villa is already assigned to an owner', 400));
    }

    const assignment = await villaModel.assignVillaToUser(villaId, userId);

    res.status(201).json({
      success: true,
      data: assignment,
      message: 'Villa assigned to owner successfully'
    });
  } catch (error) {
    console.error('Error assigning villa to owner:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

const removeVillaFromOwner = asyncHandler(async (req, res, next) => {
  try {
    const { villaId, userId } = req.body;

    if (!villaId || !userId) {
      return next(new ErrorResponse('Villa ID and User ID are required', 400));
    }

    const success = await villaModel.removeVillaFromUser(villaId, userId);

    if (!success) {
      return next(new ErrorResponse('Villa assignment not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Villa removed from owner successfully'
    });
  } catch (error) {
    console.error('Error removing villa from owner:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

const getVillaAssignments = asyncHandler(async (req, res, next) => {
  try {
    const assignments = await villaModel.getVillaAssignments(req.params.id);

    res.status(200).json({
      success: true,
      data: assignments
    });
  } catch (error) {
    console.error('Error fetching villa assignments:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

const getUserAssignedVillas = asyncHandler(async (req, res, next) => {
  try {
    const villas = await villaModel.getUserAssignedVillas(req.params.id);

    // Get images and features for each villa
    const villasWithDetails = await Promise.all(
      villas.map(async (villa) => {
        const images = await villaModel.getVillaImages(villa.villasId);
        const features = await villaModel.getVillaFeatures(villa.villasId);
        return {
          ...villa,
          images,
          features: features.map(f => f.features)
        };
      })
    );

    res.status(200).json({
      success: true,
      data: villasWithDetails
    });
  } catch (error) {
    console.error('Error fetching user assigned villas:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

export default {
  getAllVillas,
  getVillaById,
  createVilla,
  updateVilla,
  deleteVilla,
  getVillaImages,
  addVillaImage,
  deleteVillaImage,
  getVillaStatistics,
  assignVillaToOwner,
  removeVillaFromOwner,
  getVillaAssignments,
  getUserAssignedVillas
};
