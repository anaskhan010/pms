import express from 'express';
import tenantController from '../../controllers/tenant/tenantController.js';
import { protect, adminOnly, adminAndManager } from '../../middleware/auth.js';
import { uploadTenantDocument, uploadTenantFiles, handleUploadError } from '../../middleware/upload.js';
import {
  validateTenant,
  validateId,
  handleValidationErrors
} from '../../middleware/validation.js';

const router = express.Router();

router.use(protect);

router.get('/statistics', adminOnly, tenantController.getTenantStatistics);
router.get('/count', adminOnly, tenantController.getTenantCount);

// Building and apartment routes for tenant creation
router.get('/buildings', adminOnly, tenantController.getAllBuildings);
router.get('/buildings/:buildingId/floors', adminOnly, tenantController.getFloorsByBuilding);
router.get('/floors/:floorId/apartments', adminOnly, tenantController.getApartmentsByFloor);
router.get('/available-apartments', adminOnly, tenantController.getAvailableApartments);

// Alternative endpoints for frontend compatibility
router.get('/get-all-tenants', adminOnly, tenantController.getAllTenants);
router.post('/create-tenant',
  adminOnly,
  uploadTenantFiles,
  handleUploadError,
  tenantController.createTenant
);

router.route('/')
  .get(adminOnly, tenantController.getAllTenants)
  .post(
    adminOnly,
    uploadTenantFiles,
    handleUploadError,
    validateTenant,
    handleValidationErrors,
    tenantController.createTenant
  );

router.route('/:id')
  .get(validateId, handleValidationErrors, tenantController.getTenantById)
  .put(
    adminOnly,
    validateId,
    uploadTenantDocument,
    handleUploadError,
    handleValidationErrors,
    tenantController.updateTenant
  )
  .delete(adminOnly, validateId, handleValidationErrors, tenantController.deleteTenant);

router.route('/:id/apartments')
  .get(validateId, handleValidationErrors, tenantController.getTenantApartments);

router.route('/:id/apartments/:apartmentId')
  .post(adminOnly, validateId, handleValidationErrors, tenantController.assignApartment)
  .delete(adminOnly, validateId, handleValidationErrors, tenantController.removeApartmentAssignment);

export default router;
