const { body, param, query, validationResult } = require('express-validator');
const ErrorResponse = require('../utils/errorResponse');

// Handle validation errors
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return next(new ErrorResponse(errorMessages.join(', '), 400));
  }
  next();
};

// User validation rules
exports.validateUserRegistration = [
  body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('role')
    .isIn(['admin', 'manager', 'owner', 'tenant'])
    .withMessage('Role must be one of: admin, manager, owner, tenant'),
  
  body('first_name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('First name must be between 1 and 100 characters'),
  
  body('last_name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name must be between 1 and 100 characters')
];

exports.validateUserLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Property validation rules
exports.validateProperty = [
  body('property_number')
    .notEmpty()
    .withMessage('Property number is required')
    .isLength({ max: 255 })
    .withMessage('Property number cannot exceed 255 characters'),
  
  body('address_line1')
    .notEmpty()
    .withMessage('Address line 1 is required')
    .isLength({ max: 255 })
    .withMessage('Address line 1 cannot exceed 255 characters'),
  
  body('city')
    .notEmpty()
    .withMessage('City is required')
    .isLength({ max: 255 })
    .withMessage('City cannot exceed 255 characters'),
  
  body('country')
    .notEmpty()
    .withMessage('Country is required')
    .isLength({ max: 255 })
    .withMessage('Country cannot exceed 255 characters'),
  
  body('plot_size_sqm')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Plot size must be a positive number'),
  
  body('total_units')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Total units must be a positive integer')
];

// Unit validation rules
exports.validateUnit = [
  body('property_id')
    .notEmpty()
    .withMessage('Property ID is required')
    .isUUID()
    .withMessage('Property ID must be a valid UUID'),
  
  body('unit_number')
    .notEmpty()
    .withMessage('Unit number is required')
    .isLength({ max: 255 })
    .withMessage('Unit number cannot exceed 255 characters'),
  
  body('unit_type')
    .isIn(['Residential', 'Commercial', 'Retail'])
    .withMessage('Unit type must be one of: Residential, Commercial, Retail'),
  
  body('current_status')
    .isIn(['For Sale', 'For Rent', 'For Lease', 'Occupied', 'Vacant', 'Maintenance'])
    .withMessage('Status must be one of: For Sale, For Rent, For Lease, Occupied, Vacant, Maintenance'),
  
  body('num_bedrooms')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Number of bedrooms must be a non-negative integer'),
  
  body('num_bathrooms')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Number of bathrooms must be a non-negative integer'),
  
  body('area_sqm')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Area must be a positive number')
];

// Contract validation rules
exports.validateContract = [
  body('unit_id')
    .notEmpty()
    .withMessage('Unit ID is required')
    .isUUID()
    .withMessage('Unit ID must be a valid UUID'),
  
  body('tenant_id')
    .notEmpty()
    .withMessage('Tenant ID is required')
    .isUUID()
    .withMessage('Tenant ID must be a valid UUID'),
  
  body('owner_id')
    .notEmpty()
    .withMessage('Owner ID is required')
    .isUUID()
    .withMessage('Owner ID must be a valid UUID'),
  
  body('contract_type')
    .isIn(['Rental', 'Lease'])
    .withMessage('Contract type must be either Rental or Lease'),
  
  body('start_date')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  body('end_date')
    .isISO8601()
    .withMessage('End date must be a valid date'),
  
  body('monthly_rent_amount')
    .isFloat({ min: 0 })
    .withMessage('Monthly rent amount must be a positive number'),
  
  body('currency')
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-letter code (e.g., USD, AED)'),
  
  body('payment_frequency')
    .isIn(['Monthly', 'Quarterly', 'Semi-Annually', 'Annually'])
    .withMessage('Payment frequency must be one of: Monthly, Quarterly, Semi-Annually, Annually')
];

// Tenant validation rules
exports.validateTenant = [
  body('first_name')
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 255 })
    .withMessage('First name cannot exceed 255 characters'),
  
  body('last_name')
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 255 })
    .withMessage('Last name cannot exceed 255 characters'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('phone_number')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('id_document_type')
    .isIn(['National ID', 'Passport', 'Driver License'])
    .withMessage('ID document type must be one of: National ID, Passport, Driver License'),
  
  body('id_document_number')
    .notEmpty()
    .withMessage('ID document number is required')
    .isLength({ max: 255 })
    .withMessage('ID document number cannot exceed 255 characters'),
  
  body('date_of_birth')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid date')
];

// Payment validation rules
exports.validatePayment = [
  body('tenant_id')
    .notEmpty()
    .withMessage('Tenant ID is required')
    .isUUID()
    .withMessage('Tenant ID must be a valid UUID'),
  
  body('payment_amount')
    .isFloat({ min: 0.01 })
    .withMessage('Payment amount must be greater than 0'),
  
  body('currency')
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-letter code'),
  
  body('payment_method')
    .isIn(['Bank Transfer', 'Cheque', 'Cash', 'Credit Card', 'Online'])
    .withMessage('Payment method must be one of: Bank Transfer, Cheque, Cash, Credit Card, Online'),
  
  body('payment_date')
    .isISO8601()
    .withMessage('Payment date must be a valid date')
];

// ID parameter validation
exports.validateId = [
  param('id')
    .isUUID()
    .withMessage('ID must be a valid UUID')
];
