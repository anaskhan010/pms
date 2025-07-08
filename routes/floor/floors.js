import express from 'express';
import floorController from '../../controllers/floor/floorController.js';
import { protect, adminOnly } from '../../middleware/auth.js';
import { handleUploadError } from '../../middleware/upload.js';
import {
  validateId,
  handleValidationErrors
} from '../../middleware/validation.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Create floor image upload configuration
const floorImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'public', 'uploads', 'floors');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, 'floor-' + uniqueSuffix + extension);
  }
});

const floorImageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const uploadFloorImages = multer({
  storage: floorImageStorage,
  fileFilter: floorImageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
}).array('images', 10); // Allow up to 10 images

const uploadSingleFloorImage = multer({
  storage: floorImageStorage,
  fileFilter: floorImageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
}).single('image');

router.use(protect);

// Statistics route
router.get('/getFloorStatistics', adminOnly, floorController.getFloorStatistics);

// Main CRUD routes
router.get('/getFloors', adminOnly, floorController.getAllFloors);

router.post(
  '/createFloor',
  adminOnly,
  uploadFloorImages,
  handleUploadError,
  floorController.createFloor
);

router.get('/getFloor/:id', validateId, handleValidationErrors, floorController.getFloorById);

router.put(
  '/updateFloor/:id',
  adminOnly,
  validateId,
  handleValidationErrors,
  uploadFloorImages,
  handleUploadError,
  floorController.updateFloor
);

router.delete('/deleteFloor/:id', adminOnly, validateId, handleValidationErrors, floorController.deleteFloor);

// Floor apartments route
router.get('/getFloorApartments/:id', validateId, handleValidationErrors, floorController.getFloorApartments);

// Floor image management routes
router.post(
  '/addFloorImage/:id',
  adminOnly,
  validateId,
  handleValidationErrors,
  uploadSingleFloorImage,
  handleUploadError,
  floorController.addFloorImage
);

router.delete(
  '/deleteFloorImage/:id/:imageId',
  adminOnly,
  validateId,
  handleValidationErrors,
  floorController.deleteFloorImage
);

export default router;
