import express from 'express';
import buildingController from '../../controllers/building/buildingController.js';
import { protect, adminOnly, adminAndOwner, getOwnerBuildings } from '../../middleware/auth.js';
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
router.get('/getBuildingStatistics', adminOnly, buildingController.getBuildingStatistics);

// Main CRUD routes
router.get('/getBuildings', adminAndOwner, getOwnerBuildings, buildingController.getAllBuildings);

router.post(
  '/createBuilding',
  adminOnly,
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
  adminOnly,
  uploadComprehensiveBuilding,
  handleUploadError,
  buildingController.createComprehensiveBuilding
);

router.get('/getBuilding/:id', adminAndOwner, getOwnerBuildings, validateId, handleValidationErrors, buildingController.getBuildingById);

router.get('/getComprehensiveBuilding/:id', adminAndOwner, getOwnerBuildings, validateId, handleValidationErrors, buildingController.getComprehensiveBuildingById);

router.put(
  '/updateBuilding/:id',
  adminOnly,
  validateId,
  handleValidationErrors,
  uploadBuildingImages,
  handleUploadError,
  buildingController.updateBuilding
);

router.put(
  '/updateComprehensiveBuilding/:id',
  adminOnly,
  validateId,
  handleValidationErrors,
  uploadComprehensiveBuilding,
  handleUploadError,
  buildingController.updateComprehensiveBuilding
);

router.delete('/deleteBuilding/:id', adminOnly, validateId, handleValidationErrors, buildingController.deleteBuilding);

// Building floors route
router.get('/getBuildingFloors/:id', adminAndOwner, getOwnerBuildings, validateId, handleValidationErrors, buildingController.getBuildingFloors);

// Building image management routes
router.post(
  '/addBuildingImage/:id',
  adminOnly,
  validateId,
  handleValidationErrors,
  uploadSingleBuildingImage,
  handleUploadError,
  buildingController.addBuildingImage
);

router.delete(
  '/deleteBuildingImage/:id/:imageId',
  adminOnly,
  validateId,
  handleValidationErrors,
  buildingController.deleteBuildingImage
);

// Building assignment routes for super admin
router.post(
  '/assignBuildingToOwner',
  adminOnly,
  buildingController.assignBuildingToOwner
);

router.delete(
  '/removeBuildingFromOwner',
  adminOnly,
  buildingController.removeBuildingFromOwner
);

router.get(
  '/getBuildingAssignments/:id',
  adminOnly,
  validateId,
  handleValidationErrors,
  buildingController.getBuildingAssignments
);

router.get(
  '/getUserAssignedBuildings/:id',
  adminOnly,
  validateId,
  handleValidationErrors,
  buildingController.getUserAssignedBuildings
);

export default router;
