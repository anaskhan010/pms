const Joi = require('joi');
const logger = require('./logger');

/**
 * Enterprise-level validation utility using Joi
 * Provides comprehensive validation schemas and helpers
 */

const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\+]?[1-9][\d]{0,15}$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  alphanumericWithSpaces: /^[a-zA-Z0-9\s]+$/,
  positiveNumber: /^\d*\.?\d+$/,
  currency: /^\d+(\.\d{1,2})?$/
};

const baseSchemas = {
  id: Joi.number().integer().positive(),
  uuid: Joi.string().pattern(patterns.uuid),
  email: Joi.string().email().lowercase().trim(),
  phone: Joi.string().pattern(patterns.phone).allow('', null),
  name: Joi.string().min(2).max(100).trim(),
  description: Joi.string().max(1000).allow('', null),
  date: Joi.date().iso(),
  currency: Joi.number().precision(2).positive(),
  percentage: Joi.number().min(0).max(100),
  status: Joi.string().valid('active', 'inactive', 'pending', 'suspended'),
  pagination: {
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().default('created_at'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
  }
};

const tenantSchemas = {
  create: Joi.object({
    first_name: baseSchemas.name.required(),
    last_name: baseSchemas.name.required(),
    email: baseSchemas.email.required(),
    phone_number: baseSchemas.phone,
    nationality: Joi.string().max(50).allow('', null),
    id_document_type: Joi.string().valid('passport', 'national_id', 'driving_license').required(),
    id_document_number: Joi.string().min(5).max(50).required(),
    date_of_birth: Joi.date().max('now').allow(null),
    emergency_contact_name: baseSchemas.name.allow('', null),
    emergency_contact_phone: baseSchemas.phone,
    notes: baseSchemas.description
  }),

  update: Joi.object({
    first_name: baseSchemas.name,
    last_name: baseSchemas.name,
    email: baseSchemas.email,
    phone_number: baseSchemas.phone,
    nationality: Joi.string().max(50).allow('', null),
    id_document_type: Joi.string().valid('passport', 'national_id', 'driving_license'),
    id_document_number: Joi.string().min(5).max(50),
    date_of_birth: Joi.date().max('now').allow(null),
    emergency_contact_name: baseSchemas.name.allow('', null),
    emergency_contact_phone: baseSchemas.phone,
    notes: baseSchemas.description
  }).min(1),

  query: Joi.object({
    ...baseSchemas.pagination,
    search: Joi.string().max(100).allow(''),
    nationality: Joi.string().max(50).allow(''),
    status: baseSchemas.status.allow(''),
    id_document_type: Joi.string().valid('passport', 'national_id', 'driving_license').allow('')
  }),

  bulkOperation: Joi.object({
    tenant_ids: Joi.array().items(baseSchemas.id).min(1).max(100).required(),
    operation: Joi.string().valid('activate', 'deactivate', 'delete', 'export').required(),
    reason: Joi.string().max(500).when('operation', {
      is: Joi.string().valid('deactivate', 'delete'),
      then: Joi.required(),
      otherwise: Joi.optional()
    })
  })
};

const propertySchemas = {
  create: Joi.object({
    property_number: Joi.string().min(1).max(50).required(),
    property_type: Joi.string().valid('apartment', 'villa', 'office', 'retail', 'warehouse').required(),
    address_line1: Joi.string().min(5).max(200).required(),
    address_line2: Joi.string().max(200).allow('', null),
    city: Joi.string().min(2).max(100).required(),
    state_province: Joi.string().max(100).allow('', null),
    postal_code: Joi.string().max(20).allow('', null),
    country: Joi.string().min(2).max(100).required(),
    total_floors: Joi.number().integer().min(1).max(200),
    total_units: Joi.number().integer().min(1).max(1000),
    built_year: Joi.number().integer().min(1900).max(new Date().getFullYear()),
    plot_size_sqm: Joi.number().positive().allow(null),
    built_up_area_sqm: Joi.number().positive().allow(null),
    parking_spaces: Joi.number().integer().min(0).allow(null),
    amenities: Joi.array().items(Joi.string().max(100)),
    description: baseSchemas.description,
    status: baseSchemas.status.default('active')
  }),

  update: Joi.object({
    property_number: Joi.string().min(1).max(50),
    property_type: Joi.string().valid('apartment', 'villa', 'office', 'retail', 'warehouse'),
    address_line1: Joi.string().min(5).max(200),
    address_line2: Joi.string().max(200).allow('', null),
    city: Joi.string().min(2).max(100),
    state_province: Joi.string().max(100).allow('', null),
    postal_code: Joi.string().max(20).allow('', null),
    country: Joi.string().min(2).max(100),
    total_floors: Joi.number().integer().min(1).max(200),
    total_units: Joi.number().integer().min(1).max(1000),
    built_year: Joi.number().integer().min(1900).max(new Date().getFullYear()),
    plot_size_sqm: Joi.number().positive().allow(null),
    built_up_area_sqm: Joi.number().positive().allow(null),
    parking_spaces: Joi.number().integer().min(0).allow(null),
    amenities: Joi.array().items(Joi.string().max(100)),
    description: baseSchemas.description,
    status: baseSchemas.status
  }).min(1),

  query: Joi.object({
    ...baseSchemas.pagination,
    search: Joi.string().max(100).allow(''),
    property_type: Joi.string().valid('apartment', 'villa', 'office', 'retail', 'warehouse').allow(''),
    city: Joi.string().max(100).allow(''),
    status: baseSchemas.status.allow(''),
    min_units: Joi.number().integer().min(1),
    max_units: Joi.number().integer().min(1),
    built_year_from: Joi.number().integer().min(1900),
    built_year_to: Joi.number().integer().max(new Date().getFullYear())
  })
};

const unitSchemas = {
  create: Joi.object({
    property_id: baseSchemas.id.required(),
    unit_number: Joi.string().min(1).max(20).required(),
    unit_type: Joi.string().valid('studio', '1br', '2br', '3br', '4br', '5br', 'penthouse', 'office', 'retail').required(),
    floor_number: Joi.number().integer().min(0).max(200),
    area_sqft: Joi.number().positive(),
    bedrooms: Joi.number().integer().min(0).max(10),
    bathrooms: Joi.number().min(0).max(10),
    balconies: Joi.number().integer().min(0).max(5),
    parking_spaces: Joi.number().integer().min(0).max(10),
    monthly_rent: baseSchemas.currency,
    security_deposit: baseSchemas.currency,
    furnished_status: Joi.string().valid('unfurnished', 'semi-furnished', 'fully-furnished'),
    amenities: Joi.array().items(Joi.string().max(100)),
    description: baseSchemas.description,
    status: Joi.string().valid('available', 'occupied', 'maintenance', 'reserved').default('available')
  }),

  update: Joi.object({
    unit_number: Joi.string().min(1).max(20),
    unit_type: Joi.string().valid('studio', '1br', '2br', '3br', '4br', '5br', 'penthouse', 'office', 'retail'),
    floor_number: Joi.number().integer().min(0).max(200),
    area_sqft: Joi.number().positive(),
    bedrooms: Joi.number().integer().min(0).max(10),
    bathrooms: Joi.number().min(0).max(10),
    balconies: Joi.number().integer().min(0).max(5),
    parking_spaces: Joi.number().integer().min(0).max(10),
    monthly_rent: baseSchemas.currency,
    security_deposit: baseSchemas.currency,
    furnished_status: Joi.string().valid('unfurnished', 'semi-furnished', 'fully-furnished'),
    amenities: Joi.array().items(Joi.string().max(100)),
    description: baseSchemas.description,
    status: Joi.string().valid('available', 'occupied', 'maintenance', 'reserved')
  }).min(1)
};

/**
 * Validation middleware factory
 * @param {Object} schema - Joi schema
 * @param {string} source - Source of data (body, query, params)
 * @returns {Function} Express middleware
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = req[source];
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      logger.warn('Validation failed', {
        source,
        errors,
        originalData: data,
        userId: req.user?.user_id
      });

      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
    }

    req[source] = value;
    next();
  };
};

/**
 * Bulk validation helper
 * @param {Array} items - Items to validate
 * @param {Object} schema - Joi schema
 * @returns {Object} Validation result
 */
const validateBulk = (items, schema) => {
  const results = {
    valid: [],
    invalid: [],
    errors: []
  };

  items.forEach((item, index) => {
    const { error, value } = schema.validate(item, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      results.invalid.push({ index, item, error: error.details });
      results.errors.push(...error.details.map(detail => ({
        index,
        field: detail.path.join('.'),
        message: detail.message
      })));
    } else {
      results.valid.push({ index, item: value });
    }
  });

  return results;
};

module.exports = {
  patterns,
  baseSchemas,
  tenantSchemas,
  propertySchemas,
  unitSchemas,
  validate,
  validateBulk
};
