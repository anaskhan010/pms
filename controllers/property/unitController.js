const Unit = require('../../models/property/Unit');
const Property = require('../../models/property/Property');
const ErrorResponse = require('../../utils/errorResponse');
const asyncHandler = require('../../utils/asyncHandler');

exports.getUnits = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  
  const filters = {
    property_id: req.query.property_id,
    unit_type: req.query.unit_type,
    current_status: req.query.current_status,
    search: req.query.search
  };

  const result = await Unit.findAllUnits(page, limit, filters);

  res.status(200).json({
    success: true,
    count: result.length,
   
    data: result
  });
});

exports.getUnit = asyncHandler(async (req, res, next) => {
  const unit = await Unit.findUnitById(req.params.id);

  if (!unit) {
    return next(new ErrorResponse(`Unit not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: unit
  });
});

exports.createUnit = asyncHandler(async (req, res, next) => {
  const property = await Property.findById(req.body.property_id);
  if (!property) {
    return next(new ErrorResponse(`Property not found with id of ${req.body.property_id}`, 404));
  }

  const unit = await Unit.createUnit(req.body);

  res.status(201).json({
    success: true,
    data: unit
  });
});

exports.updateUnit = asyncHandler(async (req, res, next) => {
  let unit = await Unit.findUnitById(req.params.id);

  if (!unit) {
    return next(new ErrorResponse(`Unit not found with id of ${req.params.id}`, 404));
  }

  unit = await unit.update(req.body);

  res.status(200).json({
    success: true,
    data: unit
  });
});

exports.deleteUnit = asyncHandler(async (req, res, next) => {
  const unit = await Unit.findUnitById(req.params.id);

  if (!unit) {
    return next(new ErrorResponse(`Unit not found with id of ${req.params.id}`, 404));
  }

  await unit.delete();

  res.status(200).json({
    success: true,
    data: {}
  });
});

exports.getUnitDetails = asyncHandler(async (req, res, next) => {
  const unit = await Unit.findUnitById(req.params.id);

  if (!unit) {
    return next(new ErrorResponse(`Unit not found with id of ${req.params.id}`, 404));
  }

  const [property, currentContract, currentTenant, ownership, utilityMeters, recentTickets] = await Promise.all([
    unit.getProperty(),
    unit.getCurrentContract(),
    unit.getCurrentTenant(),
    unit.getOwnership(),
    unit.getUtilityMeters(),
    unit.getRecentTickets()
  ]);

  res.status(200).json({
    success: true,
    data: {
      unit,
      property,
      currentContract,
      currentTenant,
      ownership,
      utilityMeters,
      recentTickets
    }
  });
});

exports.updateUnitStatus = asyncHandler(async (req, res, next) => {
  const { current_status } = req.body;
  
  if (!current_status) {
    return next(new ErrorResponse('Status is required', 400));
  }

  const validStatuses = ['For Sale', 'For Rent', 'For Lease', 'Occupied', 'Vacant', 'Maintenance'];
  if (!validStatuses.includes(current_status)) {
    return next(new ErrorResponse(`Status must be one of: ${validStatuses.join(', ')}`, 400));
  }

  let unit = await Unit.findUnitById(req.params.id);

  if (!unit) {
    return next(new ErrorResponse(`Unit not found with id of ${req.params.id}`, 404));
  }

  unit = await unit.update({ current_status });

  res.status(200).json({
    success: true,
    data: unit
  });
});



exports.getUnitByTenantId = asyncHandler(async(req,res)=>{
  const tenant_id = req.params.tenant_id;

  const result = await Unit.getUnitByTenantId(tenant_id);
  res.status(200).json({
    success:true,
    result
  })
})