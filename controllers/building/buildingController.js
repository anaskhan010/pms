import buildingModel from '../../models/property/Building.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ErrorResponse from '../../utils/errorResponse.js';
import path from 'path';
import fs from 'fs';

const getAllBuildings = asyncHandler(async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const filters = {
      buildingName: req.query.buildingName,
      buildingAddress: req.query.buildingAddress
    };

    const result = await buildingModel.getAllBuildings(page, limit, filters);

    res.status(200).json({
      success: true,
      count: result.buildings.length,
      total: result.total,
      pagination: {
        page: result.page,
        pages: result.pages,
        limit: result.limit
      },
      data: result.buildings
    });
  } catch (error) {
    console.error('Error fetching buildings:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

const getBuildingById = asyncHandler(async (req, res, next) => {
  try {
    const building = await buildingModel.getBuildingById(req.params.id);

    if (!building) {
      return next(new ErrorResponse(`Building not found with id of ${req.params.id}`, 404));
    }

    // Get building images
    const images = await buildingModel.getBuildingImages(req.params.id);
    console.log(images,"-----images--------")
    building.images = images;

    res.status(200).json({
      success: true,
      data: building
    });
  } catch (error) {
    console.error('Error fetching building:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

const createBuilding = asyncHandler(async (req, res, next) => {
  try {
    const { buildingName, buildingAddress } = req.body;

    const building = await buildingModel.createBuilding(buildingName, buildingAddress);

    // Handle image upload if present
    if (req.files && req.files.length > 0) {
      const imagePromises = req.files.map(file => {
        const imageUrl = `/public/uploads/buildings/${file.filename}`;
        return buildingModel.addBuildingImage(building.buildingId, imageUrl);
      });
      await Promise.all(imagePromises);
    }

    res.status(201).json({
      success: true,
      data: building,
      message: 'Building created successfully'
    });
  } catch (error) {
    console.error('Error creating building:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

const createComprehensiveBuilding = asyncHandler(async (req, res, next) => {
  try {
    const { buildingData, floorsData, apartmentsData } = req.body;

    // Parse JSON data if it comes as strings (from FormData)
    const parsedBuildingData = typeof buildingData === 'string' ? JSON.parse(buildingData) : buildingData;
    const parsedFloorsData = typeof floorsData === 'string' ? JSON.parse(floorsData) : floorsData || [];
    const parsedApartmentsData = typeof apartmentsData === 'string' ? JSON.parse(apartmentsData) : apartmentsData || [];

    // Step 1: Create the building
    const building = await buildingModel.createBuilding(
      parsedBuildingData.buildingName,
      parsedBuildingData.buildingAddress
    );

    // Step 2: Handle building images
    const buildingImages = [];

    // Filter building images from req.files array (since we're using multer().any())
    const buildingImageFiles = req.files ? req.files.filter(file => file.fieldname === 'buildingImages') : [];

    if (buildingImageFiles.length > 0) {
      const buildingImagePromises = buildingImageFiles.map(file => {
        const imageUrl = `/public/uploads/buildings/${file.filename}`;
        buildingImages.push(imageUrl);
        return buildingModel.addBuildingImage(building.buildingId, imageUrl);
      });
      await Promise.all(buildingImagePromises);
    }

    // Step 3: Create floors (no images needed)
    const createdFloors = [];
    const floorIdMapping = {}; // Map temporary IDs to real IDs

    for (let i = 0; i < parsedFloorsData.length; i++) {
      const floorData = parsedFloorsData[i];

      // Import floor model
      const floorModel = (await import('../../models/property/Floor.js')).default;

      const floor = await floorModel.createFloor(building.buildingId, floorData.floorName);
      createdFloors.push(floor);
      floorIdMapping[floorData.id] = floor.floorId;
    }

    // Step 4: Create apartments and handle apartment images
    const createdApartments = [];

    for (let i = 0; i < parsedApartmentsData.length; i++) {
      const apartmentData = parsedApartmentsData[i];

      // Get the real floor ID from mapping
      const realFloorId = floorIdMapping[apartmentData.floorId];
      if (!realFloorId) {
        throw new Error(`Invalid floor reference for apartment: ${apartmentData.apartmentName}`);
      }

      // Import apartment model (force reload)
      const apartmentModel = (await import('../../models/property/Apartment.js?v=' + Date.now())).default;

      const apartment = await apartmentModel.createApartment(
        realFloorId,
        apartmentData.bedrooms,
        apartmentData.bathrooms,
        apartmentData.length || 0,
        apartmentData.width || 0,
        apartmentData.rentPrice,
        apartmentData.description || 'No description provided'
      );
      createdApartments.push(apartment);

      // Handle apartment images
      const apartmentImageFiles = req.files ? req.files.filter(file => file.fieldname === `apartmentImages_${apartmentData.id}`) : [];

      if (apartmentImageFiles.length > 0) {
        const apartmentImagePromises = apartmentImageFiles.map(file => {
          const imageUrl = `/public/uploads/apartments/${file.filename}`;
          return apartmentModel.addApartmentImage(apartment.apartmentId, imageUrl);
        });
        await Promise.all(apartmentImagePromises);
      }
    }

    // Step 5: Return comprehensive response
    const response = {
      building: {
        ...building,
        images: buildingImages
      },
      floors: createdFloors,
      apartments: createdApartments,
      summary: {
        buildingId: building.buildingId,
        buildingName: building.buildingName,
        totalFloors: createdFloors.length,
        totalApartments: createdApartments.length
      }
    };

    res.status(201).json({
      success: true,
      data: response,
      message: `Building "${building.buildingName}" created successfully with ${createdFloors.length} floors and ${createdApartments.length} apartments`
    });

  } catch (error) {
    console.error('Error creating comprehensive building:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

const updateBuilding = asyncHandler(async (req, res, next) => {
  try {
    const building = await buildingModel.updateBuilding(req.params.id, req.body);

    // Handle new image uploads if present
    if (req.files && req.files.length > 0) {
      const imagePromises = req.files.map(file => {
        const imageUrl = `/public/uploads/buildings/${file.filename}`;
        return buildingModel.addBuildingImage(req.params.id, imageUrl);
      });
      await Promise.all(imagePromises);
    }

    res.status(200).json({
      success: true,
      data: building,
      message: 'Building updated successfully'
    });
  } catch (error) {
    console.error('Error updating building:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

const deleteBuilding = asyncHandler(async (req, res, next) => {
  try {
    // Get building images before deletion to clean up files
    const images = await buildingModel.getBuildingImages(req.params.id);
    
    const deleted = await buildingModel.deleteBuilding(req.params.id);

    if (!deleted) {
      return next(new ErrorResponse(`Building not found with id of ${req.params.id}`, 404));
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
      message: 'Building deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting building:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

const getBuildingFloors = asyncHandler(async (req, res, next) => {
  try {
    const floors = await buildingModel.getBuildingFloors(req.params.id);

    res.status(200).json({
      success: true,
      data: floors
    });
  } catch (error) {
    console.error('Error fetching building floors:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

const getBuildingStatistics = asyncHandler(async (req, res, next) => {
  try {
    const statistics = await buildingModel.getBuildingStatistics();

    res.status(200).json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('Error fetching building statistics:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

const addBuildingImage = asyncHandler(async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ErrorResponse('No image file provided', 400));
    }

    const imageUrl = `/public/uploads/buildings/${req.file.filename}`;
    const image = await buildingModel.addBuildingImage(req.params.id, imageUrl);

    res.status(201).json({
      success: true,
      data: image,
      message: 'Building image added successfully'
    });
  } catch (error) {
    console.error('Error adding building image:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

const deleteBuildingImage = asyncHandler(async (req, res, next) => {
  try {
    const image = await buildingModel.getBuildingImageById(req.params.imageId);
    
    if (!image) {
      return next(new ErrorResponse('Image not found', 404));
    }

    const deleted = await buildingModel.deleteBuildingImage(req.params.imageId);

    if (deleted) {
      // Clean up image file
      const filePath = path.join(process.cwd(), 'public', image.imageUrl.replace('/public/', ''));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Building image deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting building image:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

export default {
  getAllBuildings,
  getBuildingById,
  createBuilding,
  createComprehensiveBuilding,
  updateBuilding,
  deleteBuilding,
  getBuildingFloors,
  getBuildingStatistics,
  addBuildingImage,
  deleteBuildingImage
};
