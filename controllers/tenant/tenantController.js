import tenantModel from '../../models/tenant/Tenant.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ErrorResponse from '../../utils/errorResponse.js';
import db from '../../config/db.js';

const createTenant = asyncHandler(async (req, res, next) => {
  const {
    firstName, lastName, email, password, phoneNumber, address,
    gender, nationality, dateOfBirth, registrationNumber,
    registrationExpiry, occupation, apartmentId, contractStartDate,
    contractEndDate, securityFee
  } = req.body;

  console.log('Creating tenant with data:', req.body);
  console.log('ApartmentId received:', apartmentId, 'Type:', typeof apartmentId);

  const existingTenant = await tenantModel.getTenantByEmail(email);
  if (existingTenant) {
    return next(new ErrorResponse('Tenant with this email already exists', 400));
  }

  // For owners, validate that the apartment belongs to their assigned buildings
  if (req.ownerBuildings && req.ownerBuildings.length > 0 && apartmentId) {
    const apartmentValidation = await tenantModel.validateApartmentForOwner(apartmentId, req.ownerBuildings);
    if (!apartmentValidation.isValid) {
      return next(new ErrorResponse('You can only create tenants for apartments in your assigned buildings', 403));
    }
  }

  let imagePath = '';
  let ejariPdfPath = '';

  if (req.files) {
    if (req.files.image) {
      imagePath = `/public/uploads/tenants/${req.files.image[0].filename}`;
    }
    if (req.files.ejariDocument) {
      ejariPdfPath = `/public/uploads/tenants/ejari/${req.files.ejariDocument[0].filename}`;
    }
  } else if (req.file) {
    imagePath = `/public/uploads/tenants/${req.file.filename}`;
  }

  try {
    const tenantData = {
      firstName, lastName, email, password: password || 'Tenant123!',
      phoneNumber, address, gender, nationality, dateOfBirth,
      image: imagePath, registrationNumber, registrationExpiry,
      occupation, ejariPdfPath, apartmentId, contractStartDate,
      contractEndDate, securityFee
    };

    const tenant = await tenantModel.createTenant(tenantData);

    res.status(201).json({
      success: true,
      data: tenant,
      message: 'Tenant created successfully with apartment assignment and contract'
    });
  } catch (error) {
    console.error('Error creating tenant:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

const getAllTenants = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;

  const filters = {
    nationality: req.query.nationality,
    occupation: req.query.occupation,
    search: req.query.search
  };

  // Add ownership-based tenant filtering
  if (req.tenantFilter) {
    if (req.tenantFilter.buildingIds) {
      filters.ownerBuildings = req.tenantFilter.buildingIds;
    }
    if (req.tenantFilter.tenantIds) {
      filters.tenantIds = req.tenantFilter.tenantIds;
    }
    console.log(`🔍 Filtering tenants for owner: ${req.tenantFilter.buildingIds?.length || 0} buildings, ${req.tenantFilter.tenantIds?.length || 0} direct tenants`);
  } else if (req.user && req.user.roleId === 1) {
    console.log(`👑 Admin user - showing all tenants`);
  }

  const result = await tenantModel.getAllTenants(page, limit, filters);

  res.status(200).json({
    success: true,
    count: result.tenants.length,
    total: result.total,
    pagination: {
      page: result.page,
      pages: result.pages,
      limit
    },
    data: result.tenants
  });
});

const getTenantById = asyncHandler(async (req, res, next) => {
  const tenant = await tenantModel.getTenantById(req.params.id);

  if (!tenant) {
    return next(new ErrorResponse(`Tenant not found with id of ${req.params.id}`, 404));
  }

  // Check ownership - user can only view tenants they have access to
  if (req.tenantFilter) {
    const hasAccess =
      (req.tenantFilter.tenantIds && req.tenantFilter.tenantIds.includes(parseInt(req.params.id))) ||
      (req.tenantFilter.buildingIds && tenant.buildingId && req.tenantFilter.buildingIds.includes(tenant.buildingId));

    if (!hasAccess) {
      return next(new ErrorResponse('Access denied. You can only view tenants you have access to.', 403));
    }
  } else if (req.user && req.user.roleId !== 1) {
    // Non-admin users without tenant filter should not access individual tenants
    return next(new ErrorResponse('Access denied. Insufficient permissions.', 403));
  }

  res.status(200).json({
    success: true,
    data: tenant
  });
});

const updateTenant = asyncHandler(async (req, res, next) => {
  const {
    firstName, lastName, email, phoneNumber, address, gender, nationality,
    dateOfBirth, registrationNumber, registrationExpiry, occupation,
    apartmentId, contractStartDate, contractEndDate, securityFee
  } = req.body;

  const fieldsToUpdate = {
    firstName, lastName, email, phoneNumber, address, gender, nationality,
    dateOfBirth, registrationNumber, registrationExpiry, occupation
  };

  if (req.file) {
    fieldsToUpdate.image = `/public/uploads/tenants/${req.file.filename}`;
  }

  // Include apartment assignment data
  const apartmentAssignmentData = {
    apartmentId: apartmentId || null,
    contractStartDate: contractStartDate || null,
    contractEndDate: contractEndDate || null,
    securityFee: securityFee || 0
  };

  console.log('Updating tenant with apartment data:', apartmentAssignmentData);

  try {
    const tenant = await tenantModel.updateTenant(req.params.id, fieldsToUpdate, apartmentAssignmentData);

    res.status(200).json({
      success: true,
      data: tenant,
      message: 'Tenant updated successfully'
    });
  } catch (error) {
    console.error('Error updating tenant:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

const deleteTenant = asyncHandler(async (req, res, next) => {
  try {
    const success = await tenantModel.deleteTenant(req.params.id);

    if (!success) {
      return next(new ErrorResponse(`Tenant not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    return next(new ErrorResponse(error.message, 400));
  }
});

const getTenantApartments = asyncHandler(async (req, res, next) => {
  // Check ownership first - user can only view apartments for tenants they have access to
  if (req.tenantFilter) {
    const hasAccess =
      (req.tenantFilter.tenantIds && req.tenantFilter.tenantIds.includes(parseInt(req.params.id)));

    if (!hasAccess) {
      return next(new ErrorResponse('Access denied. You can only view apartments for tenants you have access to.', 403));
    }
  } else if (req.user && req.user.roleId !== 1) {
    // Non-admin users without tenant filter should not access tenant apartments
    return next(new ErrorResponse('Access denied. Insufficient permissions.', 403));
  }

  const apartments = await tenantModel.getTenantApartments(req.params.id);

  res.status(200).json({
    success: true,
    count: apartments.length,
    data: apartments
  });
});

const assignApartment = asyncHandler(async (req, res, next) => {
  try {
    const { startDate, endDate, securityFee } = req.body;

    // Prepare contract data if provided
    const contractData = (startDate && endDate) ? {
      startDate,
      endDate,
      securityFee: securityFee || 0
    } : null;

    const result = await tenantModel.assignApartment(
      req.params.id,
      req.params.apartmentId,
      contractData
    );

    res.status(201).json({
      success: true,
      data: result,
      message: 'Apartment assigned successfully with contract created'
    });
  } catch (error) {
    return next(new ErrorResponse(error.message, 400));
  }
});

const removeApartmentAssignment = asyncHandler(async (req, res, next) => {
  try {
    const success = await tenantModel.removeApartmentAssignment(req.params.id, req.params.apartmentId);

    if (!success) {
      return next(new ErrorResponse('Assignment not found', 404));
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    return next(new ErrorResponse(error.message, 400));
  }
});

const getTenantStatistics = asyncHandler(async (req, res, next) => {
  const statistics = await tenantModel.getTenantStatistics();

  res.status(200).json({
    success: true,
    data: statistics
  });
});

const getTenantCount = asyncHandler(async (req, res, next) => {
  const count = await tenantModel.getTenantCount();

  res.status(200).json({
    success: true,
    data: { count }
  });
});

// Building and apartment management for tenant creation
const getAllBuildings = asyncHandler(async (req, res, next) => {
  const filters = {};

  // Add owner building filtering if user is owner
  if (req.ownerBuildings && req.ownerBuildings.length > 0) {
    filters.ownerBuildings = req.ownerBuildings;
  }

  const buildings = await tenantModel.getAllBuildings(filters);

  res.status(200).json({
    success: true,
    data: buildings
  });
});

const getFloorsByBuilding = asyncHandler(async (req, res, next) => {
  const buildingId = req.params.buildingId;

  // For owners, validate that the building belongs to them
  if (req.ownerBuildings && req.ownerBuildings.length > 0) {
    if (!req.ownerBuildings.includes(parseInt(buildingId))) {
      return next(new ErrorResponse('You can only access floors from your assigned buildings', 403));
    }
  }

  const floors = await tenantModel.getFloorsByBuilding(buildingId);

  res.status(200).json({
    success: true,
    data: floors
  });
});

const getApartmentsByFloor = asyncHandler(async (req, res, next) => {
  const floorId = req.params.floorId;

  // For owners, validate that the floor belongs to their assigned buildings
  if (req.ownerBuildings && req.ownerBuildings.length > 0) {
    const floorValidationQuery = `
      SELECT b.buildingId
      FROM floor f
      INNER JOIN building b ON f.buildingId = b.buildingId
      WHERE f.floorId = ?
    `;
    const [floorValidation] = await db.execute(floorValidationQuery, [floorId]);

    if (floorValidation.length === 0 || !req.ownerBuildings.includes(floorValidation[0].buildingId)) {
      return next(new ErrorResponse('You can only access apartments from floors in your assigned buildings', 403));
    }
  }

  const apartments = await tenantModel.getApartmentsByFloor(floorId);

  res.status(200).json({
    success: true,
    data: apartments
  });
});

const getAvailableApartments = asyncHandler(async (req, res, next) => {
  const apartments = await tenantModel.getAvailableApartments();

  res.status(200).json({
    success: true,
    data: apartments
  });
});

const getAvailableTenantsForAssignment = asyncHandler(async (req, res, next) => {
  try {
    // Get tenants who don't have current apartment assignments
    const tenants = await tenantModel.getAvailableTenantsForAssignment();

    res.status(200).json({
      success: true,
      data: tenants
    });
  } catch (error) {
    return next(new ErrorResponse(error.message, 400));
  }
});

const getApartmentAssignments = asyncHandler(async (req, res, next) => {
  try {
    // Get apartment assignments with owner filtering
    const filters = {};

    // Add owner building filtering if user is owner
    if (req.ownerBuildings && req.ownerBuildings.length > 0) {
      filters.ownerBuildings = req.ownerBuildings;
    }

    const assignments = await tenantModel.getApartmentAssignments(filters);

    res.status(200).json({
      success: true,
      data: assignments
    });
  } catch (error) {
    return next(new ErrorResponse(error.message, 400));
  }
});

const getTenantContracts = asyncHandler(async (req, res, next) => {
  try {
    const tenantId = req.params.id;

    // Check ownership first - user can only view contracts for tenants they have access to
    if (req.tenantFilter) {
      const hasAccess =
        (req.tenantFilter.tenantIds && req.tenantFilter.tenantIds.includes(parseInt(tenantId)));

      if (!hasAccess) {
        return next(new ErrorResponse('Access denied. You can only view contracts for tenants you have access to.', 403));
      }
    } else if (req.user && req.user.roleId !== 1) {
      // Non-admin users without tenant filter should not access tenant contracts
      return next(new ErrorResponse('Access denied. Insufficient permissions.', 403));
    }

    const contracts = await tenantModel.getTenantContracts(tenantId);

    res.status(200).json({
      success: true,
      count: contracts.length,
      data: contracts
    });
  } catch (error) {
    console.error('Error fetching tenant contracts:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});

export default {
  createTenant,
  getAllTenants,
  getTenantById,
  updateTenant,
  deleteTenant,
  getTenantApartments,
  assignApartment,
  removeApartmentAssignment,
  getTenantStatistics,
  getTenantCount,
  getAllBuildings,
  getFloorsByBuilding,
  getApartmentsByFloor,
  getAvailableApartments,
  getAvailableTenantsForAssignment,
  getApartmentAssignments,
  getTenantContracts
};