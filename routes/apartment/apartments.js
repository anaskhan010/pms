import express from 'express';
import apartmentController from '../../controllers/apartment/apartmentController.js';
import { protect, adminOnly, adminAndOwner, getOwnerBuildings } from '../../middleware/auth.js';
import { handleUploadError } from '../../middleware/upload.js';
import {
  validateId,
  handleValidationErrors
} from '../../middleware/validation.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Create apartment image upload configuration
const apartmentImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'public', 'uploads', 'apartments');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, 'apartment-' + uniqueSuffix + extension);
  }
});

const apartmentImageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const uploadApartmentImages = multer({
  storage: apartmentImageStorage,
  fileFilter: apartmentImageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
}).array('images', 10); // Allow up to 10 images

const uploadSingleApartmentImage = multer({
  storage: apartmentImageStorage,
  fileFilter: apartmentImageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
}).single('image');

router.use(protect);

// Statistics route
router.get('/getApartmentStatistics', adminOnly, apartmentController.getApartmentStatistics);

// Main CRUD routes
router.get('/getApartments', adminAndOwner, getOwnerBuildings, apartmentController.getAllApartments);

router.post(
  '/createApartment',
  adminOnly,
  uploadApartmentImages,
  handleUploadError,
  apartmentController.createApartment
);

router.get('/getApartment/:id', adminAndOwner, getOwnerBuildings, validateId, handleValidationErrors, apartmentController.getApartmentById);

router.put(
  '/updateApartment/:id',
  adminOnly,
  validateId,
  handleValidationErrors,
  uploadApartmentImages,
  handleUploadError,
  apartmentController.updateApartment
);

router.delete('/deleteApartment/:id', adminOnly, validateId, handleValidationErrors, apartmentController.deleteApartment);

// Apartment image management routes
router.post(
  '/addApartmentImage/:id',
  adminOnly,
  validateId,
  handleValidationErrors,
  uploadSingleApartmentImage,
  handleUploadError,
  apartmentController.addApartmentImage
);

router.delete(
  '/deleteApartmentImage/:id/:imageId',
  adminOnly,
  validateId,
  handleValidationErrors,
  apartmentController.deleteApartmentImage
);

// Apartment amenities routes
router.get('/getApartmentAmenities/:id', validateId, handleValidationErrors, apartmentController.getApartmentAmenities);

router.put('/updateApartmentAmenities/:id', adminOnly, validateId, handleValidationErrors, apartmentController.updateApartmentAmenities);

export default router;
