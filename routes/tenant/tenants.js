import express from 'express';
import tenantController from '../../controllers/tenant/tenantController.js';
import {
  protect,
  requireResourcePermission,
  smartAuthorize,
  getTenantAccess,
  validateResourceOwnership
} from '../../middleware/auth.js';
import { uploadTenantDocument, uploadTenantFiles, handleUploadError } from '../../middleware/upload.js';
import {
  validateTenant,
  validateId,
  handleValidationErrors
} from '../../middleware/validation.js';

const router = express.Router();

router.use(protect);

router.get('/statistics', smartAuthorize('tenants', 'view'), tenantController.getTenantStatistics);
router.get('/count', smartAuthorize('tenants', 'view'), tenantController.getTenantCount);

// Building and apartment routes for tenant creation
router.get('/buildings', smartAuthorize('buildings', 'view'), getTenantAccess, tenantController.getAllBuildings);
router.get('/buildings/:buildingId/floors', smartAuthorize('buildings', 'view'), getTenantAccess, tenantController.getFloorsByBuilding);
router.get('/floors/:floorId/apartments', smartAuthorize('apartments', 'view'), getTenantAccess, tenantController.getApartmentsByFloor);
router.get('/available-apartments', smartAuthorize('apartments', 'view'), getTenantAccess, tenantController.getAvailableApartments);
router.get('/available-for-assignment', smartAuthorize('tenants', 'assign'), tenantController.getAvailableTenantsForAssignment);
router.get('/assignments', smartAuthorize('tenants', 'view'), getTenantAccess, tenantController.getApartmentAssignments);

// Alternative endpoints for frontend compatibility
router.get('/get-all-tenants', smartAuthorize('tenants', 'view'), getTenantAccess, tenantController.getAllTenants);
router.post('/create-tenant',
  smartAuthorize('tenants', 'create'),
  getTenantAccess,
  uploadTenantFiles,
  handleUploadError,
  tenantController.createTenant
);

router.route('/')
  .get(smartAuthorize('tenants', 'view'), getTenantAccess, tenantController.getAllTenants)
  .post(
    smartAuthorize('tenants', 'create'),
    getTenantAccess,
    uploadTenantFiles,
    handleUploadError,
    validateTenant,
    handleValidationErrors,
    tenantController.createTenant
  );

router.route('/:id')
  .get(validateId, handleValidationErrors, tenantController.getTenantById)
  .put(
    smartAuthorize('tenants', 'update'),
    validateResourceOwnership('tenants'),
    validateId,
    uploadTenantDocument,
    handleUploadError,
    handleValidationErrors,
    tenantController.updateTenant
  )
  .delete(smartAuthorize('tenants', 'delete'), validateId, handleValidationErrors, tenantController.deleteTenant);

router.route('/:id/apartments')
  .get(validateId, handleValidationErrors, tenantController.getTenantApartments);

router.route('/:id/apartments/:apartmentId')
  .post(smartAuthorize('apartments', 'assign'), validateId, handleValidationErrors, tenantController.assignApartment)
  .delete(smartAuthorize('apartments', 'assign'), validateId, handleValidationErrors, tenantController.removeApartmentAssignment);

router.route('/:id/contracts')
  .get(validateId, handleValidationErrors, tenantController.getTenantContracts);

export default router;
