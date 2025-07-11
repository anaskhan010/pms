const Owner = require('../../models/owner/Owner');
const ErrorResponse = require('../../utils/errorResponse');
const asyncHandler = require('../../utils/asyncHandler');

exports.getOwners = asyncHandler(async (req, res, next) => {
  

  const result = await Owner.findAll();

  res.status(200).json({
    success: true,
   
   
    data: result[0]
  });
});

exports.getOwner = asyncHandler(async (req, res, next) => {
  const owner = await Owner.findById(req.params.id);

  if (!owner) {
    return next(new ErrorResponse(`Owner not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: owner
  });
});


exports.createOwner = asyncHandler(async (req, res,next) => {
 
  if (req.body.email) {
    const existingOwner = await Owner.findByEmail(req.body.email);
    if (existingOwner) {
      return next(new ErrorResponse('Owner with this email already exists', 400));
    }
  }

  const owner = await Owner.createOwner(req.body);

  res.status(201).json({
    success: true,
    data: owner
  });
});


exports.updateOwner = asyncHandler(async (req, res, next) => {
  let owner = await Owner.findById(req.params.id);

  if (!owner) {
    return next(new ErrorResponse(`Owner not found with id of ${req.params.id}`, 404));
  }

  if (req.body.email && req.body.email !== owner.email) {
    const existingOwner = await Owner.findByEmail(req.body.email);
    if (existingOwner) {
      return next(new ErrorResponse('Email already in use', 400));
    }
  }

  owner = await owner.update(req.body);

  res.status(200).json({
    success: true,
    data: owner
  });
});

exports.deleteOwner = asyncHandler(async (req, res, next) => {
  const owner = await Owner.findById(req.params.id);

  if (!owner) {
    return next(new ErrorResponse(`Owner not found with id of ${req.params.id}`, 404));
  }

  await owner.delete();

  res.status(200).json({
    success: true,
    data: {}
  });
});

exports.getOwnerProperties = asyncHandler(async (req, res, next) => {
  const owner = await Owner.findById(req.params.id);

  if (!owner) {
    return next(new ErrorResponse(`Owner not found with id of ${req.params.id}`, 404));
  }

  const properties = await owner.getProperties();

  res.status(200).json({
    success: true,
    count: properties.length,
    data: properties
  });
});

exports.getOwnerUnits = asyncHandler(async (req, res, next) => {
  const owner = await Owner.findById(req.params.id);

  if (!owner) {
    return next(new ErrorResponse(`Owner not found with id of ${req.params.id}`, 404));
  }

  const units = await owner.getUnits();

  res.status(200).json({
    success: true,
    count: units.length,
    data: units
  });
});

exports.getOwnerContracts = asyncHandler(async (req, res, next) => {
  const owner = await Owner.findById(req.params.id);

  if (!owner) {
    return next(new ErrorResponse(`Owner not found with id of ${req.params.id}`, 404));
  }

  const contracts = await owner.getContracts();

  res.status(200).json({
    success: true,
    count: contracts.length,
    data: contracts
  });
});

exports.getOwnerFinancialSummary = asyncHandler(async (req, res, next) => {
  const owner = await Owner.findById(req.params.id);

  if (!owner) {
    return next(new ErrorResponse(`Owner not found with id of ${req.params.id}`, 404));
  }

  const financialSummary = await owner.getFinancialSummary();

  res.status(200).json({
    success: true,
    data: {
      owner: owner,
      financial_summary: financialSummary
    }
  });
});
