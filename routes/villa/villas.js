import express from 'express';
import villaController from '../../controllers/villa/villaController.js';
import {
  protect,
  requirePermission,
  requireResourcePermission,
  smartAuthorize,
  getOwnerVillas,
  validateResourceOwnership
} from '../../middleware/auth.js';
import { handleUploadError } from '../../middleware/upload.js';
import {
  validateId,
  handleValidationErrors
} from '../../middleware/validation.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Create upload directory if it doesn't exist
const villaUploadDir = path.join(process.cwd(), 'public', 'uploads', 'villas');
if (!fs.existsSync(villaUploadDir)) {
  fs.mkdirSync(villaUploadDir, { recursive: true });
}

// Villa image storage configuration
const villaImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, villaUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'villa-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for images
const villaImageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const uploadVillaImages = multer({
  storage: villaImageStorage,
  fileFilter: villaImageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
}).array('images', 10); // Allow up to 10 images

const uploadSingleVillaImage = multer({
  storage: villaImageStorage,
  fileFilter: villaImageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
}).single('image');

router.use(protect);

// Statistics route
router.get('/getVillaStatistics', requireResourcePermission('villas', 'view'), villaController.getVillaStatistics);

// Main CRUD routes
router.get('/getVillas', smartAuthorize('villas', 'view'), getOwnerVillas, villaController.getAllVillas);

router.post(
  '/createVilla',
  requireResourcePermission('villas', 'create'),
  uploadVillaImages,
  handleUploadError,
  villaController.createVilla
);

router.get('/getVilla/:id', smartAuthorize('villas', 'view'), validateId, handleValidationErrors, villaController.getVillaById);

router.put(
  '/updateVilla/:id',
  smartAuthorize('villas', 'update'),
  validateResourceOwnership('villas'),
  validateId,
  handleValidationErrors,
  uploadVillaImages,
  handleUploadError,
  villaController.updateVilla
);

router.delete('/deleteVilla/:id', requireResourcePermission('villas', 'delete'), validateId, handleValidationErrors, villaController.deleteVilla);

// Villa image management routes
router.get('/getVillaImages/:id', smartAuthorize('villas', 'view'), validateId, handleValidationErrors, villaController.getVillaImages);

router.post(
  '/addVillaImage/:id',
  smartAuthorize('villas', 'update'),
  validateId,
  handleValidationErrors,
  uploadSingleVillaImage,
  handleUploadError,
  villaController.addVillaImage
);

router.delete(
  '/deleteVillaImage/:id/:imageId',
  smartAuthorize('villas', 'update'),
  validateId,
  handleValidationErrors,
  villaController.deleteVillaImage
);

// Villa assignment routes for admin users
router.post(
  '/assignVillaToOwner',
  requireResourcePermission('villas', 'assign'),
  villaController.assignVillaToOwner
);

router.delete(
  '/removeVillaFromOwner',
  requireResourcePermission('villas', 'assign'),
  villaController.removeVillaFromOwner
);

router.get(
  '/getVillaAssignments/:id',
  requireResourcePermission('villas', 'view'),
  validateId,
  handleValidationErrors,
  villaController.getVillaAssignments
);

router.get(
  '/getUserAssignedVillas/:id',
  requireResourcePermission('villas', 'view'),
  validateId,
  handleValidationErrors,
  villaController.getUserAssignedVillas
);

export default router;
