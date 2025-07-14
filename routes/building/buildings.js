import express from 'express';
import buildingController from '../../controllers/building/buildingController.js';
import {
  protect,
  requireResourcePermission,
  smartAuthorize,
  getOwnerBuildings,
  validateResourceOwnership,
  adminOnly,
  adminAndOwner
} from '../../middleware/auth.js';
import { handleUploadError } from '../../middleware/upload.js';
import {
  validateId,
  handleValidationErrors
} from '../../middleware/validation.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Create building image upload configuration
const buildingImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'public', 'uploads', 'buildings');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, 'building-' + uniqueSuffix + extension);
  }
});

const buildingImageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const uploadBuildingImages = multer({
  storage: buildingImageStorage,
  fileFilter: buildingImageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
}).array('images', 10); // Allow up to 10 images

const uploadSingleBuildingImage = multer({
  storage: buildingImageStorage,
  fileFilter: buildingImageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
}).single('image');

router.use(protect);

// Statistics route
router.get('/getBuildingStatistics', requireResourcePermission('buildings', 'view'), buildingController.getBuildingStatistics);

// Main CRUD routes
router.get('/getBuildings', smartAuthorize('buildings', 'view'), getOwnerBuildings, buildingController.getAllBuildings);

router.post(
  '/createBuilding',
  requireResourcePermission('buildings', 'create'),
  uploadBuildingImages,
  handleUploadError,
  buildingController.createBuilding
);

// Comprehensive building creation with floors and apartments
const uploadComprehensiveBuilding = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      // Create directories if they don't exist
      let uploadPath;

      if (file.fieldname === 'buildingImages') {
        uploadPath = path.join(process.cwd(), 'public', 'uploads', 'buildings');
      } else if (file.fieldname.startsWith('apartmentImages_')) {
        uploadPath = path.join(process.cwd(), 'public', 'uploads', 'apartments');
      } else {
        uploadPath = path.join(process.cwd(), 'public', 'uploads', 'temp');
      }

      // Note: Directories should already exist in the public/uploads folder

      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const extension = path.extname(file.originalname);
      let prefix = 'file';

      if (file.fieldname === 'buildingImages') {
        prefix = 'building';
      } else if (file.fieldname.startsWith('apartmentImages_')) {
        prefix = 'apartment';
      }

      cb(null, prefix + '-' + uniqueSuffix + extension);
    }
  }),
  fileFilter: (req, file, cb) => {
    // Accept all image files and any field names
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 50 // Allow up to 50 files total
  }
}).any(); // Use .any() to accept any field names dynamically

router.post(
  '/createComprehensiveBuilding',
  requireResourcePermission('buildings', 'create'),
  uploadComprehensiveBuilding,
  handleUploadError,
  buildingController.createComprehensiveBuilding
);

router.get('/getBuilding/:id', smartAuthorize('buildings', 'view'), getOwnerBuildings, validateId, handleValidationErrors, buildingController.getBuildingById);

router.get('/getComprehensiveBuilding/:id', smartAuthorize('buildings', 'view'), getOwnerBuildings, validateId, handleValidationErrors, buildingController.getComprehensiveBuildingById);

router.put(
  '/updateBuilding/:id',
  smartAuthorize('buildings', 'update'),
  validateResourceOwnership('buildings'),
  validateId,
  handleValidationErrors,
  uploadBuildingImages,
  handleUploadError,
  buildingController.updateBuilding
);

router.put(
  '/updateComprehensiveBuilding/:id',
  smartAuthorize('buildings', 'update'),
  validateResourceOwnership('buildings'),
  validateId,
  handleValidationErrors,
  uploadComprehensiveBuilding,
  handleUploadError,
  buildingController.updateComprehensiveBuilding
);

router.delete('/deleteBuilding/:id', requireResourcePermission('buildings', 'delete'), validateId, handleValidationErrors, buildingController.deleteBuilding);

// Building floors route
router.get('/getBuildingFloors/:id', adminAndOwner, getOwnerBuildings, validateId, handleValidationErrors, buildingController.getBuildingFloors);

// Building image management routes
router.post(
  '/addBuildingImage/:id',
  smartAuthorize('buildings', 'update'),
  validateResourceOwnership('buildings'),
  validateId,
  handleValidationErrors,
  uploadSingleBuildingImage,
  handleUploadError,
  buildingController.addBuildingImage
);

router.delete(
  '/deleteBuildingImage/:id/:imageId',
  smartAuthorize('buildings', 'update'),
  validateResourceOwnership('buildings'),
  validateId,
  handleValidationErrors,
  buildingController.deleteBuildingImage
);

// Building assignment routes for admin users
router.post(
  '/assignBuildingToOwner',
  requireResourcePermission('buildings', 'assign'),
  buildingController.assignBuildingToOwner
);

router.delete(
  '/removeBuildingFromOwner',
  requireResourcePermission('buildings', 'assign'),
  buildingController.removeBuildingFromOwner
);

router.get(
  '/getBuildingAssignments/:id',
  requireResourcePermission('buildings', 'view'),
  validateId,
  handleValidationErrors,
  buildingController.getBuildingAssignments
);

router.get(
  '/getUserAssignedBuildings/:id',
  requireResourcePermission('buildings', 'view'),
  validateId,
  handleValidationErrors,
  buildingController.getUserAssignedBuildings
);

export default router;
