const Tenant = require('../../models/tenant/Tenant');
const ErrorResponse = require('../../utils/errorResponse');
const asyncHandler = require('../../utils/asyncHandler');

// @desc    Get all tenants
// @route   GET /api/v1/tenants
// @access  Private
exports.getTenants = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  
  const filters = {
    nationality: req.query.nationality,
    search: req.query.search
  };

  const result = await Tenant.findAll(page, limit, filters);

  res.status(200).json({
    success: true,
    count: result.tenants.length,
    pagination: {
      page: result.page,
      pages: result.pages,
      total: result.total
    },
    data: result.tenants
  });
});

// @desc    Get single tenant
// @route   GET /api/v1/tenants/:id
// @access  Private
exports.getTenant = asyncHandler(async (req, res, next) => {
  const tenant = await Tenant.findById(req.params.id);

  if (!tenant) {
    return next(new ErrorResponse(`Tenant not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: tenant
  });
});


exports.createTenant = asyncHandler(async (req, res, next) => {
  
  // Check if tenant with email already exists
  if (req.body.email) {
    const existingTenant = await Tenant.findByEmail(req.body.email);
    if (existingTenant) {
      return next(new ErrorResponse('Tenant with this email already exists', 400));
    }
  }

  const tenant = await Tenant.create(req.body);

  res.status(201).json({
    success: true,
    data: tenant
  });
});


exports.updateTenant = asyncHandler(async (req, res, next) => {
  let tenant = await Tenant.findById(req.params.id);

  if (!tenant) {
    return next(new ErrorResponse(`Tenant not found with id of ${req.params.id}`, 404));
  }

  // Check if email is being changed and if it's already taken
  if (req.body.email && req.body.email !== tenant.email) {
    const existingTenant = await Tenant.findByEmail(req.body.email);
    if (existingTenant) {
      return next(new ErrorResponse('Email already in use', 400));
    }
  }

  tenant = await tenant.update(req.body);

  res.status(200).json({
    success: true,
    data: tenant
  });
});

// @desc    Delete tenant
// @route   DELETE /api/v1/tenants/:id
// @access  Private (Admin only)
exports.deleteTenant = asyncHandler(async (req, res, next) => {
  const tenant = await Tenant.findById(req.params.id);

  if (!tenant) {
    return next(new ErrorResponse(`Tenant not found with id of ${req.params.id}`, 404));
  }

  await tenant.delete();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get tenant contracts
// @route   GET /api/v1/tenants/:id/contracts
// @access  Private
exports.getTenantContracts = asyncHandler(async (req, res, next) => {
  const tenant = await Tenant.findById(req.params.id);

  if (!tenant) {
    return next(new ErrorResponse(`Tenant not found with id of ${req.params.id}`, 404));
  }

  const contracts = await tenant.getContracts();

  res.status(200).json({
    success: true,
    count: contracts.length,
    data: contracts
  });
});

// @desc    Get tenant active contracts
// @route   GET /api/v1/tenants/:id/active-contracts
// @access  Private
exports.getTenantActiveContracts = asyncHandler(async (req, res, next) => {
  const tenant = await Tenant.findById(req.params.id);

  if (!tenant) {
    return next(new ErrorResponse(`Tenant not found with id of ${req.params.id}`, 404));
  }

  const activeContracts = await tenant.getActiveContracts();

  res.status(200).json({
    success: true,
    count: activeContracts.length,
    data: activeContracts
  });
});

// @desc    Get tenant payments
// @route   GET /api/v1/tenants/:id/payments
// @access  Private
exports.getTenantPayments = asyncHandler(async (req, res, next) => {
  const tenant = await Tenant.findById(req.params.id);

  if (!tenant) {
    return next(new ErrorResponse(`Tenant not found with id of ${req.params.id}`, 404));
  }

  const limit = parseInt(req.query.limit, 10) || 10;
  const payments = await tenant.getPayments(limit);

  res.status(200).json({
    success: true,
    count: payments.length,
    data: payments
  });
});

// @desc    Get tenant tickets
// @route   GET /api/v1/tenants/:id/tickets
// @access  Private
exports.getTenantTickets = asyncHandler(async (req, res, next) => {
  const tenant = await Tenant.findById(req.params.id);

  if (!tenant) {
    return next(new ErrorResponse(`Tenant not found with id of ${req.params.id}`, 404));
  }

  const limit = parseInt(req.query.limit, 10) || 10;
  const tickets = await tenant.getTickets(limit);

  res.status(200).json({
    success: true,
    count: tickets.length,
    data: tickets
  });
});
