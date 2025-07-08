const Invoice = require('../../models/payment/Invoice');
const Contract = require('../../models/contract/Contract');
const Tenant = require('../../models/tenant/Tenant');
const Unit = require('../../models/property/Unit');
const ErrorResponse = require('../../utils/errorResponse');
const asyncHandler = require('../../utils/asyncHandler');

exports.getInvoices = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  
  const filters = {
    invoice_status: req.query.invoice_status,
    tenant_id: req.query.tenant_id,
    contract_id: req.query.contract_id,
    overdue: req.query.overdue === 'true'
  };

  const result = await Invoice.findAll(page, limit, filters);

  res.status(200).json({
    success: true,
    count: result.invoices.length,
    pagination: {
      page: result.page,
      pages: result.pages,
      total: result.total
    },
    data: result.invoices
  });
});

exports.getInvoice = asyncHandler(async (req, res, next) => {
  const invoice = await Invoice.findById(req.params.id);

  if (!invoice) {
    return next(new ErrorResponse(`Invoice not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: invoice
  });
});

exports.getInvoiceByNumber = asyncHandler(async (req, res, next) => {
  const invoice = await Invoice.findByNumber(req.params.invoiceNumber);

  if (!invoice) {
    return next(new ErrorResponse(`Invoice not found with number ${req.params.invoiceNumber}`, 404));
  }

  res.status(200).json({
    success: true,
    data: invoice
  });
});

exports.createInvoice = asyncHandler(async (req, res, next) => {
  const unit = await Unit.findById(req.body.unit_id);
  if (!unit) {
    return next(new ErrorResponse(`Unit not found with id of ${req.body.unit_id}`, 404));
  }

  const tenant = await Tenant.findById(req.body.tenant_id);
  if (!tenant) {
    return next(new ErrorResponse(`Tenant not found with id of ${req.body.tenant_id}`, 404));
  }

  if (req.body.contract_id) {
    const contract = await Contract.findById(req.body.contract_id);
    if (!contract) {
      return next(new ErrorResponse(`Contract not found with id of ${req.body.contract_id}`, 404));
    }
  }

  const invoice = await Invoice.create(req.body);

  res.status(201).json({
    success: true,
    data: invoice
  });
});

exports.updateInvoice = asyncHandler(async (req, res, next) => {
  let invoice = await Invoice.findById(req.params.id);

  if (!invoice) {
    return next(new ErrorResponse(`Invoice not found with id of ${req.params.id}`, 404));
  }

  invoice = await invoice.update(req.body);

  res.status(200).json({
    success: true,
    data: invoice
  });
});

exports.deleteInvoice = asyncHandler(async (req, res, next) => {
  const invoice = await Invoice.findById(req.params.id);

  if (!invoice) {
    return next(new ErrorResponse(`Invoice not found with id of ${req.params.id}`, 404));
  }

  await invoice.delete();

  res.status(200).json({
    success: true,
    data: {}
  });
});

exports.getInvoiceDetails = asyncHandler(async (req, res, next) => {
  const invoice = await Invoice.findById(req.params.id);

  if (!invoice) {
    return next(new ErrorResponse(`Invoice not found with id of ${req.params.id}`, 404));
  }

  const details = await invoice.getDetails();

  res.status(200).json({
    success: true,
    data: details
  });
});

exports.getInvoicePayments = asyncHandler(async (req, res, next) => {
  const invoice = await Invoice.findById(req.params.id);

  if (!invoice) {
    return next(new ErrorResponse(`Invoice not found with id of ${req.params.id}`, 404));
  }

  const payments = await invoice.getPayments();

  res.status(200).json({
    success: true,
    count: payments.length,
    data: payments
  });
});

exports.markInvoiceAsPaid = asyncHandler(async (req, res, next) => {
  const invoice = await Invoice.findById(req.params.id);

  if (!invoice) {
    return next(new ErrorResponse(`Invoice not found with id of ${req.params.id}`, 404));
  }

  const { payment_amount } = req.body;
  const updatedInvoice = await invoice.markAsPaid(payment_amount);

  res.status(200).json({
    success: true,
    message: 'Invoice marked as paid',
    data: updatedInvoice
  });
});

exports.generateRecurringInvoices = asyncHandler(async (req, res, next) => {
  const contract = await Contract.findById(req.params.contractId);

  if (!contract) {
    return next(new ErrorResponse(`Contract not found with id of ${req.params.contractId}`, 404));
  }

  const months = parseInt(req.body.months) || 12;
  const invoices = await Invoice.generateRecurringInvoices(req.params.contractId, months);

  res.status(201).json({
    success: true,
    message: `Generated ${invoices.length} recurring invoices`,
    data: invoices
  });
});

exports.updateInvoiceStatus = asyncHandler(async (req, res, next) => {
  const { invoice_status } = req.body;
  
  if (!invoice_status) {
    return next(new ErrorResponse('Invoice status is required', 400));
  }

  const validStatuses = ['Generated', 'Sent', 'Paid', 'Partially Paid', 'Overdue', 'Cancelled'];
  if (!validStatuses.includes(invoice_status)) {
    return next(new ErrorResponse(`Status must be one of: ${validStatuses.join(', ')}`, 400));
  }

  let invoice = await Invoice.findById(req.params.id);

  if (!invoice) {
    return next(new ErrorResponse(`Invoice not found with id of ${req.params.id}`, 404));
  }

  invoice = await invoice.update({ invoice_status });

  res.status(200).json({
    success: true,
    data: invoice
  });
});
