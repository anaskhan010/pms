import apartmentModel from '../../models/property/Apartment.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ErrorResponse from '../../utils/errorResponse.js';
import fs from 'fs';
import path from 'path';

const getApartmentById = asyncHandler(async (req, res, next) => {
  try {
    const apartment = await apartmentModel.getApartmentById(req.params.id);

    if (!apartment) {
      return next(new ErrorResponse(`Apartment not found with id of ${req.params.id}`, 404));
    }

    // Check if owner has access to this apartment's building
    if (req.ownerBuildings && apartment.buildingId && !req.ownerBuildings.includes(apartment.buildingId)) {
      return next(new ErrorResponse('Access denied to this apartment', 403));
    }

    // Get apartment images
    const images = await apartmentModel.getApartmentImages(req.params.id);
    apartment.images = images;

    res.status(200).json({
      success: true,
      data: apartment
    });
  } catch (error) {
    console.error('Error fetching apartment:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

const getAllApartments = asyncHandler(async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const filters = {
      buildingId: req.query.buildingId,
      floorId: req.query.floorId,
      status: req.query.status,
      bedrooms: req.query.bedrooms
    };

    // Add owner building filtering if user is owner
    if (req.ownerBuildings && req.ownerBuildings.length > 0) {
      filters.ownerBuildings = req.ownerBuildings;
    }

    const result = await apartmentModel.getAllApartments(page, limit, filters);

    res.status(200).json({
      success: true,
      count: result.apartments.length,
      total: result.total,
      pagination: {
        page: result.page,
        pages: result.pages,
        limit: result.limit
      },
      data: result.apartments
    });
  } catch (error) {
    console.error('Error fetching apartments:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

const createApartment = asyncHandler(async (req, res, next) => {
  try {
    const { floorId, bedrooms, bathrooms, length, width, rentPrice } = req.body;

    const apartment = await apartmentModel.createApartment(
      floorId, bedrooms, bathrooms, length, width, rentPrice
    );

    // Handle image upload if present
    if (req.files && req.files.length > 0) {
      const imagePromises = req.files.map(file => {
        const imageUrl = `/public/uploads/apartments/${file.filename}`;
        return apartmentModel.addApartmentImage(apartment.apartmentId, imageUrl);
      });
      await Promise.all(imagePromises);
    }

    res.status(201).json({
      success: true,
      data: apartment,
      message: 'Apartment created successfully'
    });
  } catch (error) {
    console.error('Error creating apartment:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

const updateApartment = asyncHandler(async (req, res, next) => {
  try {
    const apartment = await apartmentModel.updateApartment(req.params.id, req.body);

    // Handle new image uploads if present
    if (req.files && req.files.length > 0) {
      const imagePromises = req.files.map(file => {
        const imageUrl = `/public/uploads/apartments/${file.filename}`;
        return apartmentModel.addApartmentImage(req.params.id, imageUrl);
      });
      await Promise.all(imagePromises);
    }

    res.status(200).json({
      success: true,
      data: apartment,
      message: 'Apartment updated successfully'
    });
  } catch (error) {
    console.error('Error updating apartment:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

const deleteApartment = asyncHandler(async (req, res, next) => {
  try {
    // Get apartment images before deletion to clean up files
    const images = await apartmentModel.getApartmentImages(req.params.id);

    const success = await apartmentModel.deleteApartment(req.params.id);

    if (!success) {
      return next(new ErrorResponse(`Apartment not found with id of ${req.params.id}`, 404));
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
      data: {},
      message: 'Apartment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting apartment:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

const getApartmentStatistics = asyncHandler(async (req, res, next) => {
  try {
    const statistics = await apartmentModel.getApartmentStatistics();

    res.status(200).json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('Error fetching apartment statistics:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

const addApartmentImage = asyncHandler(async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ErrorResponse('No image file provided', 400));
    }

    const imageUrl = `/public/uploads/apartments/${req.file.filename}`;
    const image = await apartmentModel.addApartmentImage(req.params.id, imageUrl);

    res.status(201).json({
      success: true,
      data: image,
      message: 'Apartment image added successfully'
    });
  } catch (error) {
    console.error('Error adding apartment image:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

const deleteApartmentImage = asyncHandler(async (req, res, next) => {
  try {
    const image = await apartmentModel.getApartmentImageById(req.params.imageId);

    if (!image) {
      return next(new ErrorResponse('Image not found', 404));
    }

    const deleted = await apartmentModel.deleteApartmentImage(req.params.imageId);

    if (deleted) {
      // Clean up image file
      const filePath = path.join(process.cwd(), 'public', image.imageUrl.replace('/public/', ''));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Apartment image deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting apartment image:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

const getApartmentAmenities = asyncHandler(async (req, res, next) => {
  try {
    const amenities = await apartmentModel.getApartmentAmenities(req.params.id);

    res.status(200).json({
      success: true,
      data: amenities
    });
  } catch (error) {
    console.error('Error fetching apartment amenities:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

const updateApartmentAmenities = asyncHandler(async (req, res, next) => {
  try {
    const { amenities } = req.body;
    const updatedAmenities = await apartmentModel.updateApartmentAmenities(req.params.id, amenities);

    res.status(200).json({
      success: true,
      data: updatedAmenities,
      message: 'Apartment amenities updated successfully'
    });
  } catch (error) {
    console.error('Error updating apartment amenities:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

export default {
  getApartmentById,
  getAllApartments,
  createApartment,
  updateApartment,
  deleteApartment,
  getApartmentStatistics,
  addApartmentImage,
  deleteApartmentImage,
  getApartmentAmenities,
  updateApartmentAmenities
};
