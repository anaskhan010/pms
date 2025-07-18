import express from 'express';
import {
  createVendor,
  getAllVendors,
  getVendorById,
  updateVendor,
  deleteVendor,
  assignVendorToProperty,
  getVendorAssignments,
  addVendorReview,
  getVendorStatistics
} from '../../controllers/vendor/vendorController.js';
import { protect, smartAuthorize } from '../../middleware/auth.js';
import { applyDataFiltering } from '../../middleware/dataFiltering.js';

const router = express.Router();

/**
 * Vendor Routes with Role-Based Access Control
 * All routes require authentication and appropriate permissions
 */

// Apply authentication to all routes
router.use(protect);

// Apply data filtering middleware for vendor isolation
router.use(applyDataFiltering);

// @route   GET /api/v1/vendors/statistics
// @desc    Get vendor statistics
// @access  Private (requires vendors.view permission)
router.get('/statistics',
  smartAuthorize('vendors', 'view'),
  getVendorStatistics
);

// @route   POST /api/v1/vendors
// @desc    Create new vendor
// @access  Private (requires vendors.create permission)
router.post('/',
  smartAuthorize('vendors', 'create'),
  createVendor
);

// @route   GET /api/v1/vendors
// @desc    Get all vendors with pagination and filtering
// @access  Private (requires vendors.view permission)
router.get('/',
  smartAuthorize('vendors', 'view'),
  getAllVendors
);

// @route   GET /api/v1/vendors/:id
// @desc    Get vendor by ID
// @access  Private (requires vendors.view permission)
router.get('/:id',
  smartAuthorize('vendors', 'view'),
  getVendorById
);

// @route   PUT /api/v1/vendors/:id
// @desc    Update vendor
// @access  Private (requires vendors.update permission)
router.put('/:id',
  smartAuthorize('vendors', 'update'),
  updateVendor
);

// @route   DELETE /api/v1/vendors/:id
// @desc    Delete vendor (soft delete)
// @access  Private (requires vendors.delete permission)
router.delete('/:id',
  smartAuthorize('vendors', 'delete'),
  deleteVendor
);

// @route   POST /api/v1/vendors/:id/assign
// @desc    Assign vendor to property
// @access  Private (requires vendors.manage permission)
router.post('/:id/assign',
  smartAuthorize('vendors', 'manage'),
  assignVendorToProperty
);

// @route   GET /api/v1/vendors/:id/assignments
// @desc    Get vendor assignments
// @access  Private (requires vendors.view permission)
router.get('/:id/assignments',
  smartAuthorize('vendors', 'view'),
  getVendorAssignments
);

// @route   POST /api/v1/vendors/:id/reviews
// @desc    Add vendor review
// @access  Private (requires vendors.manage permission)
router.post('/:id/reviews',
  smartAuthorize('vendors', 'manage'),
  addVendorReview
);

export default router;
