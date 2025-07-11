import { body, param, query, validationResult } from 'express-validator';
import ErrorResponse from '../utils/errorResponse.js';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return next(new ErrorResponse(errorMessages.join(', '), 400));
  }
  next();
};

export const validateUserRegistration = [
  body('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('First name must be between 1 and 100 characters'),

  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name must be between 1 and 100 characters'),

  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  body('phoneNumber')
    .notEmpty()
    .withMessage('Phone number is required')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),

  body('address')
    .notEmpty()
    .withMessage('Address is required')
    .isLength({ max: 250 })
    .withMessage('Address cannot exceed 250 characters'),

  body('gender')
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be one of: Male, Female, Other'),

  body('nationality')
    .notEmpty()
    .withMessage('Nationality is required')
    .isLength({ max: 250 })
    .withMessage('Nationality cannot exceed 250 characters'),

  body('dateOfBirth')
    .isISO8601()
    .withMessage('Date of birth must be a valid date'),

  body('roleId')
    .isInt({ min: 1 })
    .withMessage('Role ID must be a valid integer')
];

export const validateUserLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

export const validateProperty = [
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

export const validateUnit = [
  body('property_id')
    .notEmpty()
    .withMessage('Property ID is required'),
  
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

export const validateOwner = [
  body('owner_type')
    .isIn(['Individual', 'Company', 'Bank', 'RealEstateAgent'])
    .withMessage('Owner type must be one of: Individual, Company, Bank, RealEstateAgent'),

  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 255 })
    .withMessage('Name cannot exceed 255 characters'),

  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('phone_number')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number')
];

export const validateContract = [
  body('unit_id')
    .notEmpty()
    .withMessage('Unit ID is required'),

  body('tenant_id')
    .notEmpty()
    .withMessage('Tenant ID is required'),

  body('owner_id')
    .notEmpty()
    .withMessage('Owner ID is required'),
  
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

export const validateTenant = [
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

export const validatePayment = [
  body('tenant_id')
    .notEmpty()
    .withMessage('Tenant ID is required'),
  
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

export const validateId = [
  param('id')
    .isLength({ min: 1 })
    .withMessage('ID is required')
    .notEmpty()
    .withMessage('ID cannot be empty')
];

export const validateRoleId = [
  param('roleId')
    .isLength({ min: 1 })
    .withMessage('Role ID is required')
    .notEmpty()
    .withMessage('Role ID cannot be empty')
    .isNumeric()
    .withMessage('Role ID must be a number')
];

export const validateUserId = [
  param('userId')
    .isLength({ min: 1 })
    .withMessage('User ID is required')
    .notEmpty()
    .withMessage('User ID cannot be empty')
    .isNumeric()
    .withMessage('User ID must be a number')
];

export const validatePermissionId = [
  param('permissionId')
    .isLength({ min: 1 })
    .withMessage('Permission ID is required')
    .notEmpty()
    .withMessage('Permission ID cannot be empty')
    .isNumeric()
    .withMessage('Permission ID must be a number')
];
