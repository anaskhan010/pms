const Payment = require('../../models/payment/Payment');
const Invoice = require('../../models/payment/Invoice');
const Tenant = require('../../models/tenant/Tenant');
const ErrorResponse = require('../../utils/errorResponse');
const asyncHandler = require('../../utils/asyncHandler');

exports.getPayments = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  
  const filters = {
    tenant_id: req.query.tenant_id,
    payment_method: req.query.payment_method,
    contract_id: req.query.contract_id,
    is_advance_payment: req.query.is_advance_payment,
    date_from: req.query.date_from,
    date_to: req.query.date_to
  };

  const result = await Payment.findAll(page, limit, filters);

  res.status(200).json({
    success: true,
    count: result.payments.length,
    pagination: {
      page: result.page,
      pages: result.pages,
      total: result.total
    },
    data: result.payments
  });
});

exports.getPayment = asyncHandler(async (req, res, next) => {
  const payment = await Payment.findById(req.params.id);

  if (!payment) {
    return next(new ErrorResponse(`Payment not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: payment
  });
});

exports.createPayment = asyncHandler(async (req, res, next) => {
  const tenant = await Tenant.findById(req.body.tenant_id);
  if (!tenant) {
    return next(new ErrorResponse(`Tenant not found with id of ${req.body.tenant_id}`, 404));
  }

  if (req.body.invoice_id) {
    const invoice = await Invoice.findById(req.body.invoice_id);
    if (!invoice) {
      return next(new ErrorResponse(`Invoice not found with id of ${req.body.invoice_id}`, 404));
    }
  }

  const payment = await Payment.create(req.body);

  res.status(201).json({
    success: true,
    data: payment
  });
});

exports.updatePayment = asyncHandler(async (req, res, next) => {
  let payment = await Payment.findById(req.params.id);

  if (!payment) {
    return next(new ErrorResponse(`Payment not found with id of ${req.params.id}`, 404));
  }

  payment = await payment.update(req.body);

  res.status(200).json({
    success: true,
    data: payment
  });
});

exports.deletePayment = asyncHandler(async (req, res, next) => {
  const payment = await Payment.findById(req.params.id);

  if (!payment) {
    return next(new ErrorResponse(`Payment not found with id of ${req.params.id}`, 404));
  }

  await payment.delete();

  res.status(200).json({
    success: true,
    data: {}
  });
});

exports.getPaymentDetails = asyncHandler(async (req, res, next) => {
  const payment = await Payment.findById(req.params.id);

  if (!payment) {
    return next(new ErrorResponse(`Payment not found with id of ${req.params.id}`, 404));
  }

  const details = await payment.getDetails();

  res.status(200).json({
    success: true,
    data: details
  });
});

exports.getTenantPaymentStats = asyncHandler(async (req, res, next) => {
  const tenant = await Tenant.findById(req.params.tenantId);

  if (!tenant) {
    return next(new ErrorResponse(`Tenant not found with id of ${req.params.tenantId}`, 404));
  }

  const year = parseInt(req.query.year) || null;
  const stats = await Payment.getTenantPaymentStats(req.params.tenantId, year);

  res.status(200).json({
    success: true,
    data: {
      tenant: tenant,
      year: year || new Date().getFullYear(),
      statistics: stats
    }
  });
});

exports.getMonthlyPaymentSummary = asyncHandler(async (req, res, next) => {
  const year = parseInt(req.query.year) || null;
  const month = parseInt(req.query.month) || null;
  
  const summary = await Payment.getMonthlyPaymentSummary(year, month);

  res.status(200).json({
    success: true,
    data: {
      year: year || new Date().getFullYear(),
      month: month || new Date().getMonth() + 1,
      summary: summary
    }
  });
});

exports.processRefund = asyncHandler(async (req, res, next) => {
  const payment = await Payment.findById(req.params.id);

  if (!payment) {
    return next(new ErrorResponse(`Payment not found with id of ${req.params.id}`, 404));
  }

  const { refund_amount, reason } = req.body;

  if (!refund_amount || refund_amount <= 0) {
    return next(new ErrorResponse('Valid refund amount is required', 400));
  }

  if (refund_amount > payment.payment_amount) {
    return next(new ErrorResponse('Refund amount cannot exceed payment amount', 400));
  }

  const refund = await payment.processRefund(refund_amount, reason);

  res.status(200).json({
    success: true,
    message: 'Refund processed successfully',
    data: {
      original_payment: payment,
      refund: refund
    }
  });
});
