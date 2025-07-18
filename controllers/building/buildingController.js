import buildingModel from '../../models/property/Building.js';
import User from '../../models/user/User.js';
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

    console.log(`🏢 getAllBuildings called by user ${req.user.userId} (role: ${req.user.roleId})`);

    // Apply ownership-based data filtering
    if (req.user && req.user.roleId === 1) {
      // Admin users see everything - no filtering
      console.log(`👑 Admin user - showing all buildings`);
    } else if (req.ownerBuildings !== undefined && req.ownerBuildings !== null) {
      filters.ownerBuildings = req.ownerBuildings;
      console.log(`🔍 Filtering buildings for owner: ${req.ownerBuildings.length} owned buildings`);
    }

    const result = await buildingModel.getAllBuildings(page, limit, filters);

    console.log(`✅ Retrieved ${result.buildings.length} buildings (total: ${result.total})`);

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
    const buildingId = parseInt(req.params.id);

    // Check if owner has access to this building (admin users bypass this check)
    if (req.user.roleId !== 1 && req.ownerBuildings && !req.ownerBuildings.includes(buildingId)) {
      return next(new ErrorResponse('Access denied to this building', 403));
    }

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

    const building = await buildingModel.createBuilding(buildingName, buildingAddress, new Date(), req.user.userId);

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
      parsedBuildingData.buildingAddress,
      new Date(),
      req.user.userId
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

      // Handle apartment amenities
      if (apartmentData.amenities && apartmentData.amenities.length > 0) {
        await apartmentModel.updateApartmentAmenities(apartment.apartmentId, apartmentData.amenities);
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

const updateComprehensiveBuilding = asyncHandler(async (req, res, next) => {
  try {
    const buildingId = req.params.id;
    const { buildingData, floorsData, apartmentsData } = req.body;

    // Parse JSON data if it comes as strings (from FormData)
    const parsedBuildingData = typeof buildingData === 'string' ? JSON.parse(buildingData) : buildingData;
    const parsedFloorsData = typeof floorsData === 'string' ? JSON.parse(floorsData) : floorsData || [];
    const parsedApartmentsData = typeof apartmentsData === 'string' ? JSON.parse(apartmentsData) : apartmentsData || [];

    // Step 1: Update the building
    const building = await buildingModel.updateBuilding(buildingId, {
      buildingName: parsedBuildingData.buildingName,
      buildingAddress: parsedBuildingData.buildingAddress
    });

    // Step 2: Handle building images
    const buildingImageFiles = req.files ? req.files.filter(file => file.fieldname === 'buildingImages') : [];
    if (buildingImageFiles.length > 0) {
      const buildingImagePromises = buildingImageFiles.map(file => {
        const imageUrl = `/public/uploads/buildings/${file.filename}`;
        return buildingModel.addBuildingImage(buildingId, imageUrl);
      });
      await Promise.all(buildingImagePromises);
    }

    // Step 3: Update floors (for now, we'll keep existing floors and add new ones)
    const floorModel = (await import('../../models/property/Floor.js')).default;
    const apartmentModel = (await import('../../models/property/Apartment.js')).default;

    const updatedFloors = [];
    for (const floorData of parsedFloorsData) {
      let floor;
      if (floorData.floorId) {
        // Update existing floor
        floor = await floorModel.updateFloor(floorData.floorId, {
          floorName: floorData.floorName
        });
      } else {
        // Create new floor
        floor = await floorModel.createFloor(buildingId, floorData.floorName);
      }
      updatedFloors.push(floor);
    }

    // Step 4: Update apartments
    const updatedApartments = [];
    for (const apartmentData of parsedApartmentsData) {
      let apartment;
      if (apartmentData.apartmentId) {
        // Update existing apartment
        apartment = await apartmentModel.updateApartment(apartmentData.apartmentId, {
          bedrooms: apartmentData.bedrooms,
          bathrooms: apartmentData.bathrooms,
          length: apartmentData.length,
          width: apartmentData.width,
          rentPrice: apartmentData.rentPrice,
          description: apartmentData.description
        });
      } else {
        // Create new apartment
        apartment = await apartmentModel.createApartment(
          apartmentData.floorId,
          apartmentData.bedrooms,
          apartmentData.bathrooms,
          apartmentData.length,
          apartmentData.width,
          apartmentData.rentPrice,
          apartmentData.description
        );
      }
      updatedApartments.push(apartment);

      // Handle apartment images
      const apartmentImageFiles = req.files ? req.files.filter(file => file.fieldname === `apartmentImages_${apartmentData.id}`) : [];
      if (apartmentImageFiles.length > 0) {
        const apartmentImagePromises = apartmentImageFiles.map(file => {
          const imageUrl = `/public/uploads/apartments/${file.filename}`;
          return apartmentModel.addApartmentImage(apartment.apartmentId, imageUrl);
        });
        await Promise.all(apartmentImagePromises);
      }

      // Handle apartment amenities
      if (apartmentData.amenities && apartmentData.amenities.length > 0) {
        await apartmentModel.updateApartmentAmenities(apartment.apartmentId, apartmentData.amenities);
      }
    }

    // Step 5: Return comprehensive response
    const response = {
      building: {
        ...building,
        images: await buildingModel.getBuildingImages(buildingId)
      },
      floors: updatedFloors,
      apartments: updatedApartments,
      summary: {
        buildingId: building.buildingId,
        buildingName: building.buildingName,
        totalFloors: updatedFloors.length,
        totalApartments: updatedApartments.length
      }
    };

    res.status(200).json({
      success: true,
      data: response,
      message: `Building "${building.buildingName}" updated successfully with ${updatedFloors.length} floors and ${updatedApartments.length} apartments`
    });

  } catch (error) {
    console.error('Error updating comprehensive building:', error);
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

// Building assignment controllers for super admin
const assignBuildingToOwner = asyncHandler(async (req, res, next) => {
  try {
    console.log('assignBuildingToOwner called with body:', req.body);
    const { buildingId, userId } = req.body;

    if (!buildingId || !userId) {
      console.log('Missing buildingId or userId');
      return next(new ErrorResponse('Building ID and User ID are required', 400));
    }

    // Verify building exists
    const building = await buildingModel.getBuildingById(buildingId);
    if (!building) {
      return next(new ErrorResponse('Building not found', 404));
    }

    // Verify user exists and has owner role
    const user = await User.getUserById(userId);
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    if (user.roleName !== 'owner') {
      return next(new ErrorResponse('User must have owner role to be assigned buildings', 400));
    }

    // Assign building to owner
    const assignmentId = await buildingModel.assignBuildingToUser(buildingId, userId);

    res.status(201).json({
      success: true,
      data: {
        assignmentId,
        buildingId,
        userId,
        buildingName: building.buildingName,
        ownerName: `${user.firstName} ${user.lastName}`
      },
      message: 'Building assigned to owner successfully'
    });
  } catch (error) {
    console.error('Error assigning building to owner:', error);
    if (error.message.includes('already assigned')) {
      return next(new ErrorResponse(error.message, 409));
    }
    return next(new ErrorResponse(error.message, 400));
  }
});

const removeBuildingFromOwner = asyncHandler(async (req, res, next) => {
  try {
    const { buildingId, userId } = req.body;

    if (!buildingId || !userId) {
      return next(new ErrorResponse('Building ID and User ID are required', 400));
    }

    const removed = await buildingModel.removeBuildingAssignment(buildingId, userId);

    if (!removed) {
      return next(new ErrorResponse('Building assignment not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Building assignment removed successfully'
    });
  } catch (error) {
    console.error('Error removing building assignment:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

const getBuildingAssignments = asyncHandler(async (req, res, next) => {
  try {
    const { id: buildingId } = req.params;

    const assignments = await buildingModel.getBuildingAssignments(buildingId);

    res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments
    });
  } catch (error) {
    console.error('Error fetching building assignments:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

const getUserAssignedBuildings = asyncHandler(async (req, res, next) => {
  try {
    const { id: userId } = req.params;

    const buildings = await buildingModel.getUserAssignedBuildings(userId);

    res.status(200).json({
      success: true,
      count: buildings.length,
      data: buildings
    });
  } catch (error) {
    console.error('Error fetching user assigned buildings:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

const getComprehensiveBuildingById = asyncHandler(async (req, res, next) => {
  try {
    const buildingId = parseInt(req.params.id);

    // Check if owner has access to this building (admin users bypass this check)
    if (req.user.roleId !== 1 && req.ownerBuildings && !req.ownerBuildings.includes(buildingId)) {
      return next(new ErrorResponse('Access denied to this building', 403));
    }

    // Get building details
    const building = await buildingModel.getBuildingById(req.params.id);
    if (!building) {
      return next(new ErrorResponse(`Building not found with id of ${req.params.id}`, 404));
    }

    // Get building images
    const buildingImages = await buildingModel.getBuildingImages(req.params.id);

    // Get floors with their details
    const floors = await buildingModel.getBuildingFloors(req.params.id);

    // Get apartments for each floor
    const apartmentModel = (await import('../../models/property/Apartment.js')).default;
    const apartments = [];

    for (const floor of floors) {
      const floorApartments = await apartmentModel.getApartmentsByFloorId(floor.floorId);

      // Get images and amenities for each apartment
      for (const apartment of floorApartments) {
        const apartmentImages = await apartmentModel.getApartmentImages(apartment.apartmentId);
        const apartmentAmenities = await apartmentModel.getApartmentAmenities(apartment.apartmentId);

        // Convert amenities objects to simple strings
        const amenitiesStrings = apartmentAmenities ? apartmentAmenities.map(amenity => amenity.amenityName || amenity) : [];

        apartments.push({
          ...apartment,
          floorId: floor.floorId,
          floorName: floor.floorName,
          apartmentImages: apartmentImages || [],
          amenities: amenitiesStrings
        });
      }
    }

    // Format response data for the edit modal
    const response = {
      // Building Info Tab
      buildingId: building.buildingId,
      buildingName: building.buildingName,
      buildingAddress: building.buildingAddress,
      buildingImages: buildingImages || [],

      // Floors Tab
      floors: floors.map(floor => ({
        id: floor.floorId,
        floorId: floor.floorId,
        floorName: floor.floorName
      })),

      // Apartments Tab
      apartments: apartments.map(apartment => ({
        id: apartment.apartmentId,
        apartmentId: apartment.apartmentId,
        apartmentName: apartment.apartmentName || `Apartment ${apartment.apartmentId}`,
        description: apartment.description || '',
        bedrooms: apartment.bedrooms || 1,
        bathrooms: apartment.bathrooms || 1,
        length: apartment.length || '',
        width: apartment.width || '',
        rentPrice: apartment.rentPrice || '',
        floorId: apartment.floorId,
        floorName: apartment.floorName,
        apartmentImages: apartment.apartmentImages,
        amenities: apartment.amenities
      }))
    };

    res.status(200).json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error fetching comprehensive building details:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

export default {
  getAllBuildings,
  getBuildingById,
  createBuilding,
  createComprehensiveBuilding,
  updateBuilding,
  updateComprehensiveBuilding,
  deleteBuilding,
  getBuildingFloors,
  getBuildingStatistics,
  addBuildingImage,
  deleteBuildingImage,
  assignBuildingToOwner,
  removeBuildingFromOwner,
  getBuildingAssignments,
  getUserAssignedBuildings,
  getComprehensiveBuildingById
};
