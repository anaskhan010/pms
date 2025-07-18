import express from 'express';
import {
  createVirtualTour,
  getAllVirtualTours,
  getVirtualTourById,
  updateVirtualTour,
  deleteVirtualTour,
  getVirtualToursByProperty,
  getVirtualTourStatistics
} from '../../controllers/virtual/virtualTourController.js';
import { protect, smartAuthorize } from '../../middleware/auth.js';

const router = express.Router();

/**
 * Virtual Tour Routes with Role-Based Access Control
 * All routes require authentication and appropriate permissions
 */

// Apply authentication to all routes
router.use(protect);

// @route   GET /api/v1/virtual-tours/statistics
// @desc    Get virtual tour statistics
// @access  Private (requires virtual_tours.view permission)
router.get('/statistics',
  smartAuthorize('virtual_tours', 'view'),
  getVirtualTourStatistics
);

// @route   GET /api/v1/virtual-tours/property/:type/:id
// @desc    Get virtual tours by property
// @access  Private (requires virtual_tours.view permission)
router.get('/property/:type/:id',
  smartAuthorize('virtual_tours', 'view'),
  getVirtualToursByProperty
);

// @route   POST /api/v1/virtual-tours
// @desc    Create new virtual tour
// @access  Private (requires virtual_tours.create permission)
router.post('/',
  smartAuthorize('virtual_tours', 'create'),
  createVirtualTour
);

// @route   GET /api/v1/virtual-tours
// @desc    Get all virtual tours with pagination and filtering
// @access  Private (requires virtual_tours.view permission)
router.get('/',
  smartAuthorize('virtual_tours', 'view'),
  getAllVirtualTours
);

// @route   GET /api/v1/virtual-tours/:id
// @desc    Get virtual tour by ID
// @access  Private (requires virtual_tours.view permission)
router.get('/:id',
  smartAuthorize('virtual_tours', 'view'),
  getVirtualTourById
);

// @route   PUT /api/v1/virtual-tours/:id
// @desc    Update virtual tour
// @access  Private (requires virtual_tours.update permission)
router.put('/:id',
  smartAuthorize('virtual_tours', 'update'),
  updateVirtualTour
);

// @route   DELETE /api/v1/virtual-tours/:id
// @desc    Delete virtual tour (soft delete)
// @access  Private (requires virtual_tours.delete permission)
router.delete('/:id',
  smartAuthorize('virtual_tours', 'delete'),
  deleteVirtualTour
);

export default router;
