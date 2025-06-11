const Property = require('../../models/property/Property');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all properties
// @route   GET /api/v1/properties
// @access  Private
exports.getProperties = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  
  const filters = {
    city: req.query.city,
    country: req.query.country,
    search: req.query.search
  };

  const result = await Property.findAll(page, limit, filters);

  res.status(200).json({
    success: true,
    count: result.properties.length,
    pagination: {
      page: result.page,
      pages: result.pages,
      total: result.total
    },
    data: result.properties
  });
});

// @desc    Get single property
// @route   GET /api/v1/properties/:id
// @access  Private
exports.getProperty = asyncHandler(async (req, res, next) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    return next(new ErrorResponse(`Property not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: property
  });
});

// @desc    Create new property
// @route   POST /api/v1/properties
// @access  Private (Admin/Manager)
exports.createProperty = asyncHandler(async (req, res, next) => {
  const property = await Property.create(req.body);

  res.status(201).json({
    success: true,
    data: property
  });
});

// @desc    Update property
// @route   PUT /api/v1/properties/:id
// @access  Private (Admin/Manager)
exports.updateProperty = asyncHandler(async (req, res, next) => {
  let property = await Property.findById(req.params.id);

  if (!property) {
    return next(new ErrorResponse(`Property not found with id of ${req.params.id}`, 404));
  }

  property = await property.update(req.body);

  res.status(200).json({
    success: true,
    data: property
  });
});

// @desc    Delete property
// @route   DELETE /api/v1/properties/:id
// @access  Private (Admin only)
exports.deleteProperty = asyncHandler(async (req, res, next) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    return next(new ErrorResponse(`Property not found with id of ${req.params.id}`, 404));
  }

  await property.delete();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get property units
// @route   GET /api/v1/properties/:id/units
// @access  Private
exports.getPropertyUnits = asyncHandler(async (req, res, next) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    return next(new ErrorResponse(`Property not found with id of ${req.params.id}`, 404));
  }

  const units = await property.getUnits();

  res.status(200).json({
    success: true,
    count: units.length,
    data: units
  });
});

// @desc    Get property statistics
// @route   GET /api/v1/properties/:id/statistics
// @access  Private
exports.getPropertyStatistics = asyncHandler(async (req, res, next) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    return next(new ErrorResponse(`Property not found with id of ${req.params.id}`, 404));
  }

  const statistics = await property.getStatistics();

  res.status(200).json({
    success: true,
    data: {
      property: property,
      statistics: statistics
    }
  });
});
