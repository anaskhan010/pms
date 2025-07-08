# Updated API Routes Documentation

## Overview
All building, apartment, and floor API routes have been updated with consistent naming conventions following the pattern `/api/v1/{resource}/{action}` format.

## Building API Routes (`/api/v1/buildings`)

### Statistics
- `GET /api/v1/buildings/getBuildingStatistics` - Get building statistics

### CRUD Operations
- `GET /api/v1/buildings/getBuildings` - Get all buildings
- `GET /api/v1/buildings/getBuilding/:id` - Get building by ID
- `POST /api/v1/buildings/createBuilding` - Create new building (with image upload)
- `PUT /api/v1/buildings/updateBuilding/:id` - Update building (with image upload)
- `DELETE /api/v1/buildings/deleteBuilding/:id` - Delete building

### Related Data
- `GET /api/v1/buildings/getBuildingFloors/:id` - Get floors for a building

### Image Management
- `POST /api/v1/buildings/addBuildingImage/:id` - Add building image
- `DELETE /api/v1/buildings/deleteBuildingImage/:id/:imageId` - Delete building image

## Floor API Routes (`/api/v1/floors`)

### Statistics
- `GET /api/v1/floors/getFloorStatistics` - Get floor statistics

### CRUD Operations
- `GET /api/v1/floors/getFloors` - Get all floors
- `GET /api/v1/floors/getFloor/:id` - Get floor by ID
- `POST /api/v1/floors/createFloor` - Create new floor (with image upload)
- `PUT /api/v1/floors/updateFloor/:id` - Update floor (with image upload)
- `DELETE /api/v1/floors/deleteFloor/:id` - Delete floor

### Related Data
- `GET /api/v1/floors/getFloorApartments/:id` - Get apartments for a floor

### Image Management
- `POST /api/v1/floors/addFloorImage/:id` - Add floor image
- `DELETE /api/v1/floors/deleteFloorImage/:id/:imageId` - Delete floor image

## Apartment API Routes (`/api/v1/apartments`)

### Statistics
- `GET /api/v1/apartments/getApartmentStatistics` - Get apartment statistics

### CRUD Operations
- `GET /api/v1/apartments/getApartments` - Get all apartments
- `GET /api/v1/apartments/getApartment/:id` - Get apartment by ID
- `POST /api/v1/apartments/createApartment` - Create new apartment (with image upload)
- `PUT /api/v1/apartments/updateApartment/:id` - Update apartment (with image upload)
- `DELETE /api/v1/apartments/deleteApartment/:id` - Delete apartment

### Image Management
- `POST /api/v1/apartments/addApartmentImage/:id` - Add apartment image
- `DELETE /api/v1/apartments/deleteApartmentImage/:id/:imageId` - Delete apartment image

### Amenities Management
- `GET /api/v1/apartments/getApartmentAmenities/:id` - Get apartment amenities
- `PUT /api/v1/apartments/updateApartmentAmenities/:id` - Update apartment amenities

## Frontend API Service Updates

### Updated Methods in `adminApiService.js`

#### Building Methods
- `getBuildings()` → `/buildings/getBuildings`
- `getBuildingById(id)` → `/buildings/getBuilding/${id}`
- `createBuilding(data, images)` → `/buildings/createBuilding`
- `updateBuilding(id, data, images)` → `/buildings/updateBuilding/${id}`
- `deleteBuilding(id)` → `/buildings/deleteBuilding/${id}`
- `getFloorsByBuilding(id)` → `/buildings/getBuildingFloors/${id}`

#### Apartment Methods
- `getApartments(params)` → `/apartments/getApartments`
- `getApartment(id)` → `/apartments/getApartment/${id}`
- `getApartmentStatistics()` → `/apartments/getApartmentStatistics`

#### New Methods Added
- `createApartment(data, images)` → `/apartments/createApartment`
- `updateApartment(id, data, images)` → `/apartments/updateApartment/${id}`
- `deleteApartment(id)` → `/apartments/deleteApartment/${id}`

#### Floor Methods (New)
- `getFloors(params)` → `/floors/getFloors`
- `getFloor(id)` → `/floors/getFloor/${id}`
- `createFloor(data, images)` → `/floors/createFloor`

## Request/Response Format

### Create/Update Requests (with images)
```javascript
// FormData format for multipart/form-data
const formData = new FormData();
formData.append('fieldName', value);
images.forEach(image => formData.append('images', image));
```

### Standard Response Format
```json
{
  "success": true,
  "data": {...},
  "message": "Operation completed successfully"
}
```

### Error Response Format
```json
{
  "success": false,
  "error": "Error message",
  "data": []
}
```

## Image Upload Support

### File Upload Configuration
- **Max file size**: 10MB per image
- **Max files**: 10 images per request
- **Supported formats**: All image types (jpg, png, gif, etc.)
- **Storage location**: `public/uploads/{type}/`

### Image URL Format
- **Building images**: `/public/uploads/buildings/building-{timestamp}-{random}.{ext}`
- **Floor images**: `/public/uploads/floors/floor-{timestamp}-{random}.{ext}`
- **Apartment images**: `/public/uploads/apartments/apartment-{timestamp}-{random}.{ext}`

## Backward Compatibility

### Tenant Routes (Still Available)
- `GET /api/v1/tenants/buildings` - Get buildings for tenant creation
- `GET /api/v1/tenants/buildings/:id/floors` - Get floors by building
- `GET /api/v1/tenants/floors/:id/apartments` - Get apartments by floor
- `GET /api/v1/tenants/available-apartments` - Get available apartments

## Migration Notes

### Frontend Changes Required
1. Update all API calls to use new route names
2. Test image upload functionality
3. Update error handling for new response format
4. Test hierarchical navigation (building → floor → apartment)

### Testing Checklist
- [ ] Building CRUD operations
- [ ] Floor CRUD operations  
- [ ] Apartment CRUD operations
- [ ] Image upload/delete for all types
- [ ] Apartment amenities management
- [ ] Statistics endpoints
- [ ] Error handling
- [ ] File cleanup on deletion

## Status
✅ Backend routes updated
✅ Frontend API service updated
✅ Database schema fixed
✅ Image upload directories created
🔄 Frontend components need testing with new routes
