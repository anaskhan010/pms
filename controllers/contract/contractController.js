import Contract from '../../models/contract/Contract.js';
import Unit from '../../models/property/Unit.js';
import Tenant from '../../models/tenant/Tenant.js';
import Owner from '../../models/owner/Owner.js';
import ErrorResponse from '../../utils/errorResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const getContracts = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  
  

  const result = await Contract.findAllContracts(page, limit);

  console.log(result,"======result=======")

  res.status(200).json({
    success: true,
   
    pagination: {
      page: result.page,
     
      total: result.total
    },
    data: result.contracts
  });
});

export const getContract = asyncHandler(async (req, res, next) => {
  const contract = await Contract.findContractById(req.params.id);

  if (!contract) {
    return next(new ErrorResponse(`Contract not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: contract
  });
});

export const createContract = asyncHandler(async (req, res, next) => {
  const unit = await Unit.findUnitById(req.body.unit_id);
  console.log(unit,"check unit======")
  if (!unit) {
    return next(new ErrorResponse(`Unit not found with id of ${req.body.unit_id}`, 404));
  }

  const tenant = await Tenant.findById(req.body.tenant_id);
  if (!tenant) {
    return next(new ErrorResponse(`Tenant not found with id of ${req.body.tenant_id}`, 404));
  }

  const owner = await Owner.findById(req.body.owner_id);
  if (!owner) {
    return next(new ErrorResponse(`Owner not found with id of ${req.body.owner_id}`, 404));
  }

  const existingContract = await unit[0].current_status;
  if (existingContract && existingContract.contract_status === 'Occupied') {
    return next(new ErrorResponse('Unit already has an active contract', 400));
  }

  const contract = await Contract.createContract(req.body);

  res.status(201).json({
    success: true,
    data: contract
  });
});

export const updateContract = asyncHandler(async (req, res, next) => {
  let contract = await Contract.findContractById(req.params.id);

  if (!contract) {
    return next(new ErrorResponse(`Contract not found with id of ${req.params.id}`, 404));
  }

  contract = await contract.update(req.body);

  res.status(200).json({
    success: true,
    data: contract
  });
});

export const deleteContract = asyncHandler(async (req, res, next) => {
  const contract = await Contract.findContractById(req.params.id);

  if (!contract) {
    return next(new ErrorResponse(`Contract not found with id of ${req.params.id}`, 404));
  }

  await contract.delete();

  res.status(200).json({
    success: true,
    data: {}
  });
});

export const getContractDetails = asyncHandler(async (req, res, next) => {
  const contract = await Contract.findContractById(req.params.id);

  if (!contract) {
    return next(new ErrorResponse(`Contract not found with id of ${req.params.id}`, 404));
  }

  const details = await contract.getDetails();

  res.status(200).json({
    success: true,
    data: details
  });
});

export const getContractInvoices = asyncHandler(async (req, res, next) => {
  const contract = await Contract.findContractById(req.params.id);

  if (!contract) {
    return next(new ErrorResponse(`Contract not found with id of ${req.params.id}`, 404));
  }

  const invoices = await contract.getInvoices();

  res.status(200).json({
    success: true,
    count: invoices.length,
    data: invoices
  });
});

export const getContractPayments = asyncHandler(async (req, res, next) => {
  const contract = await Contract.findContractById(req.params.id);

  if (!contract) {
    return next(new ErrorResponse(`Contract not found with id of ${req.params.id}`, 404));
  }

  const payments = await contract.getPayments();

  res.status(200).json({
    success: true,
    count: payments.length,
    data: payments
  });
});

export const updateContractStatus = asyncHandler(async (req, res, next) => {
  const { contract_status } = req.body;

  if (!contract_status) {
    return next(new ErrorResponse('Contract status is required', 400));
  }

  const validStatuses = ['Active', 'Expired', 'Terminated', 'Pending'];
  if (!validStatuses.includes(contract_status)) {
    return next(new ErrorResponse(`Status must be one of: ${validStatuses.join(', ')}`, 400));
  }

  let contract = await Contract.findContractById(req.params.id);

  if (!contract) {
    return next(new ErrorResponse(`Contract not found with id of ${req.params.id}`, 404));
  }

  contract = await contract.update({ contract_status });

  res.status(200).json({
    success: true,
    data: contract
  });
});

export const renewContract = asyncHandler(async (req, res, next) => {
  const contract = await Contract.findContractById(req.params.id);

  if (!contract) {
    return next(new ErrorResponse(`Contract not found with id of ${req.params.id}`, 404));
  }

  const { new_end_date, new_monthly_rent_amount } = req.body;

  if (!new_end_date) {
    return next(new ErrorResponse('New end date is required for renewal', 400));
  }

  const renewalData = {
    end_date: new_end_date,
    contract_status: 'Active'
  };

  if (new_monthly_rent_amount) {
    renewalData.monthly_rent_amount = new_monthly_rent_amount;
  }

  const renewedContract = await contract.update(renewalData);

  res.status(200).json({
    success: true,
    message: 'Contract renewed successfully',
    data: renewedContract
  });
});

export const getContractsByTenantId = asyncHandler(async (req, res, next) => {
  const tenantId = req.params.tenantId;

  try {
    const contracts = await Contract.findContractsByTenantId(tenantId);

    res.status(200).json({
      success: true,
      count: contracts.length,
      data: contracts
    });
  } catch (error) {
    console.error('Error fetching contracts for tenant:', error);
    return next(new ErrorResponse(error.message, 400));
  }
});
