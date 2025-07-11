import express from 'express';
import tenantController from '../../controllers/tenant/tenantController.js';
import { protect, adminOnly, adminAndManager, adminAndOwner, getOwnerBuildings } from '../../middleware/auth.js';
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
router.get('/buildings', adminAndOwner, getOwnerBuildings, tenantController.getAllBuildings);
router.get('/buildings/:buildingId/floors', adminAndOwner, getOwnerBuildings, tenantController.getFloorsByBuilding);
router.get('/floors/:floorId/apartments', adminAndOwner, getOwnerBuildings, tenantController.getApartmentsByFloor);
router.get('/available-apartments', adminAndOwner, getOwnerBuildings, tenantController.getAvailableApartments);
router.get('/available-for-assignment', adminOnly, tenantController.getAvailableTenantsForAssignment);
router.get('/assignments', adminAndOwner, getOwnerBuildings, tenantController.getApartmentAssignments);

// Alternative endpoints for frontend compatibility
router.get('/get-all-tenants', adminAndOwner, getOwnerBuildings, tenantController.getAllTenants);
router.post('/create-tenant',
  adminAndOwner,
  getOwnerBuildings,
  uploadTenantFiles,
  handleUploadError,
  tenantController.createTenant
);

router.route('/')
  .get(adminAndOwner, getOwnerBuildings, tenantController.getAllTenants)
  .post(
    adminAndOwner,
    getOwnerBuildings,
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

router.route('/:id/contracts')
  .get(validateId, handleValidationErrors, tenantController.getTenantContracts);

export default router;
