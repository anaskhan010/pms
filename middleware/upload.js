import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const createStorage = (uploadPath) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const fullPath = path.join(__dirname, '..', 'public', 'uploads', uploadPath);
      ensureDirectoryExists(fullPath);
      cb(null, fullPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const extension = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + extension);
    }
  });
};

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const documentFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/jpg'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, DOCX, and image files are allowed!'), false);
  }
};

const uploadConfigs = {
  userImage: multer({
    storage: createStorage('users'),
    fileFilter: imageFilter,
    limits: {
      fileSize: 5 * 1024 * 1024,
    }
  }),

  propertyImage: multer({
    storage: createStorage('properties'),
    fileFilter: imageFilter,
    limits: {
      fileSize: 10 * 1024 * 1024,
    }
  }),

  tenantDocument: multer({
    storage: createStorage('tenants'),
    fileFilter: documentFilter,
    limits: {
      fileSize: 10 * 1024 * 1024,
    }
  }),

  contractDocument: multer({
    storage: createStorage('contracts'),
    fileFilter: documentFilter,
    limits: {
      fileSize: 15 * 1024 * 1024,
    }
  })
};

const uploadUserImage = uploadConfigs.userImage.single('image');
const uploadPropertyImages = uploadConfigs.propertyImage.array('images', 10);
const uploadTenantDocument = uploadConfigs.tenantDocument.single('document');
const uploadContractDocument = uploadConfigs.contractDocument.single('contract');

// Enhanced tenant upload that handles both image and ejari document
const uploadTenantFiles = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === 'image') {
        cb(null, 'public/uploads/tenants/');
      } else if (file.fieldname === 'ejariDocument') {
        cb(null, 'public/uploads/tenants/ejari/');
      } else {
        cb(null, 'public/uploads/tenants/');
      }
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const extension = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + extension);
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'image') {
      // Image validation
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed for profile picture'), false);
      }
    } else if (file.fieldname === 'ejariDocument') {
      // Document validation (PDF, images)
      if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Only PDF or image files are allowed for Ejari document'), false);
      }
    } else {
      cb(new Error('Unexpected field name for file upload.'), false);
    }
  }
}).fields([
  { name: 'image', maxCount: 1 },
  { name: 'ejariDocument', maxCount: 1 }
]);

const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Please upload a smaller file.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Too many files. Please upload fewer files.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: 'Unexpected field name for file upload.'
      });
    }
  }
  
  if (error.message.includes('Only image files are allowed')) {
    return res.status(400).json({
      success: false,
      error: 'Only image files (JPEG, PNG, JPG) are allowed.'
    });
  }
  
  if (error.message.includes('Only PDF, DOC, DOCX')) {
    return res.status(400).json({
      success: false,
      error: 'Only PDF, DOC, DOCX, and image files are allowed.'
    });
  }
  
  next(error);
};

export {
  uploadUserImage,
  uploadPropertyImages,
  uploadTenantDocument,
  uploadTenantFiles,
  uploadContractDocument,
  handleUploadError
};
