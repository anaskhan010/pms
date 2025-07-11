const Property = require('../../models/property/Property');
const ErrorResponse = require('../../utils/errorResponse');
const asyncHandler = require('../../utils/asyncHandler');
const logger = require('../../utils/logger');
const cache = require('../../utils/cache');
const { validateBulk } = require('../../utils/validation');
const { Parser } = require('json2csv');
const moment = require('moment');


exports.getProperties = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const sortBy = req.query.sortBy || 'created_at';
  const sortOrder = req.query.sortOrder || 'desc';

  const filters = {
    city: req.query.city,
    country: req.query.country,
    property_type: req.query.property_type,
    status: req.query.status,
    search: req.query.search,
    min_units: req.query.min_units,
    max_units: req.query.max_units,
    built_year_from: req.query.built_year_from,
    built_year_to: req.query.built_year_to
  };

  const cacheKey = cache.generatePropertyKey('list', {
    page,
    limit,
    sortBy,
    sortOrder,
    ...filters
  });

  const cachedResult = cache.get(cacheKey);
  if (cachedResult) {
    req.cacheStatus = 'hit';
    logger.debug('Properties list served from cache', {
      cacheKey,
      userId: req.user?.user_id
    });
    return res.status(200).json(cachedResult);
  }

  const result = await Property.findAll(page, limit, filters, sortBy, sortOrder);

  logger.logUserAction(req.user?.user_id, 'view_properties_list', {
    page,
    limit,
    filters,
    resultCount: result.properties.length
  });

  const response = {
    success: true,
    count: result.properties.length,
    pagination: {
      page: result.page,
      pages: result.pages,
      total: result.total,
      hasNext: result.page < result.pages,
      hasPrev: result.page > 1
    },
    data: result.properties,
    meta: {
      sortBy,
      sortOrder,
      filters: Object.keys(filters).reduce((acc, key) => {
        if (filters[key]) acc[key] = filters[key];
        return acc;
      }, {})
    }
  };

  cache.set(cacheKey, response, 600);
  req.cacheStatus = 'miss-stored';

  res.status(200).json(response);
});


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

exports.getPropertiesByTenant = asyncHandler(async (req, res, next) => {
  const tenantId = req.params.tenantId;
  console.log('tenantId=====', tenantId);

  const properties = await Property.findAllPropertiesByTenant(tenantId);

  res.status(200).json({
    success: true,
    count: properties.length,
    data: properties
  });
});


exports.createProperty = asyncHandler(async (req, res, next) => {
  const property = await Property.create(req.body);

  res.status(201).json({
    success: true,
    data: property
  });
});

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

exports.getOverallPropertyStatistics = asyncHandler(async (req, res, next) => {
  const cacheKey = 'property:overall-statistics';

  const cachedStats = cache.get(cacheKey, 'long');
  if (cachedStats) {
    req.cacheStatus = 'hit';
    return res.status(200).json(cachedStats);
  }

  const stats = await Property.getOverallStatistics();

  logger.logUserAction(req.user?.user_id, 'view_property_statistics');

  const response = {
    success: true,
    data: stats,
    generatedAt: new Date().toISOString()
  };

  cache.set(cacheKey, response, 900, 'long');
  req.cacheStatus = 'miss-stored';

  res.status(200).json(response);
});

exports.bulkPropertyOperations = asyncHandler(async (req, res, next) => {
  const { property_ids, operation, reason } = req.body;

  if (!property_ids || !Array.isArray(property_ids) || property_ids.length === 0) {
    return next(new ErrorResponse('Property IDs are required', 400));
  }

  if (property_ids.length > 50) {
    return next(new ErrorResponse('Maximum 50 properties can be processed at once', 400));
  }

  const validOperations = ['activate', 'deactivate', 'delete', 'export'];
  if (!validOperations.includes(operation)) {
    return next(new ErrorResponse('Invalid operation', 400));
  }

  let results = {
    success: [],
    failed: [],
    total: property_ids.length
  };

  try {
    switch (operation) {
      case 'activate':
      case 'deactivate':
        const status = operation === 'activate' ? 'active' : 'inactive';
        for (const propertyId of property_ids) {
          try {
            await Property.updateStatus(propertyId, status, reason);
            results.success.push(propertyId);
          } catch (error) {
            results.failed.push({ propertyId, error: error.message });
          }
        }
        break;

      case 'delete':
        for (const propertyId of property_ids) {
          try {
            const property = await Property.findById(propertyId);
            if (property) {
              await property.delete();
              results.success.push(propertyId);
            } else {
              results.failed.push({ propertyId, error: 'Property not found' });
            }
          } catch (error) {
            results.failed.push({ propertyId, error: error.message });
          }
        }
        break;

      case 'export':
        const properties = await Property.findByIds(property_ids);
        const csvData = await this.generatePropertyCSV(properties);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=properties-${Date.now()}.csv`);
        return res.status(200).send(csvData);
    }

    logger.logUserAction(req.user?.user_id, 'bulk_property_operation', {
      operation,
      propertyIds: property_ids,
      results,
      reason
    });

    cache.invalidatePattern('property:');

    res.status(200).json({
      success: true,
      message: `Bulk ${operation} operation completed`,
      data: results
    });

  } catch (error) {
    logger.error('Bulk property operation failed', {
      operation,
      propertyIds: property_ids,
      error: error.message,
      userId: req.user?.user_id
    });

    return next(new ErrorResponse(`Bulk operation failed: ${error.message}`, 500));
  }
});

exports.exportProperties = asyncHandler(async (req, res, next) => {
  const filters = {
    city: req.query.city,
    country: req.query.country,
    property_type: req.query.property_type,
    status: req.query.status,
    search: req.query.search,
    min_units: req.query.min_units,
    max_units: req.query.max_units,
    built_year_from: req.query.built_year_from,
    built_year_to: req.query.built_year_to
  };

  const properties = await Property.findAllForExport(filters);

  if (properties.length === 0) {
    return next(new ErrorResponse('No properties found for export', 404));
  }

  const csvData = await this.generatePropertyCSV(properties);

  logger.logUserAction(req.user?.user_id, 'export_properties', {
    filters,
    count: properties.length
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=properties-export-${moment().format('YYYY-MM-DD')}.csv`);
  res.status(200).send(csvData);
});

exports.getOccupancyAnalytics = asyncHandler(async (req, res, next) => {
  const cacheKey = 'property:occupancy-analytics';

  const cachedAnalytics = cache.get(cacheKey, 'short');
  if (cachedAnalytics) {
    req.cacheStatus = 'hit';
    return res.status(200).json(cachedAnalytics);
  }

  const analytics = await Property.getOccupancyAnalytics();

  logger.logUserAction(req.user?.user_id, 'view_occupancy_analytics');

  const response = {
    success: true,
    data: analytics,
    generatedAt: new Date().toISOString()
  };

  cache.set(cacheKey, response, 300, 'short');
  req.cacheStatus = 'miss-stored';

  res.status(200).json(response);
});

exports.generatePropertyCSV = async (properties) => {
  const fields = [
    'property_id',
    'property_number',
    'property_type',
    'address_line1',
    'address_line2',
    'city',
    'state_province',
    'postal_code',
    'country',
    'total_floors',
    'total_units',
    'built_year',
    'plot_size_sqm',
    'built_up_area_sqm',
    'parking_spaces',
    'status',
    'created_at',
    'updated_at'
  ];

  const parser = new Parser({ fields });
  return parser.parse(properties);
};
