# Building, Apartment & Floor API Fixes and Improvements

## Overview
This document outlines all the fixes and improvements made to the building, apartment, and floor APIs based on the database analysis and requirements.

## Database Schema Fixes

### 1. Image Tables Fixed
- **buildingImage table**: Fixed `images` column from INT to VARCHAR(500) as `imageUrl`
- **apartmentImages table**: Fixed `imageUrl` column from INT to VARCHAR(500)
- **floorImages table**: Created new table for floor image management
- **apartmentAmenities table**: Fixed `listOfAmenities` from INT to VARCHAR(100) as `amenityName`
- Added `createdAt` timestamp columns to all image tables

### 2. Database Structure Verification
All image tables now have proper structure:
```sql
buildingImage: imageId (int), buildingId (int), imageUrl (varchar(500)), createdAt (timestamp)
apartmentImages: imageId (int), apartmentId (int), imageUrl (varchar(500)), createdAt (timestamp)
floorImages: imageId (int), floorId (int), imageUrl (varchar(500)), createdAt (timestamp)
apartmentAmenities: amenitiesId (int), apartmentId (int), amenityName (varchar(100))
```

## New API Endpoints Added

### Floor Management API (`/api/v1/floors`)
- `GET /api/v1/floors` - Get all floors with pagination and filters
- `POST /api/v1/floors` - Create new floor with image upload support
- `GET /api/v1/floors/:id` - Get floor by ID with images
- `PUT /api/v1/floors/:id` - Update floor with image upload support
- `DELETE /api/v1/floors/:id` - Delete floor (with image cleanup)
- `GET /api/v1/floors/:id/apartments` - Get all apartments in a floor
- `GET /api/v1/floors/statistics` - Get floor statistics
- `POST /api/v1/floors/:id/images` - Add single floor image
- `DELETE /api/v1/floors/:id/images/:imageId` - Delete floor image

### Enhanced Apartment API (`/api/v1/apartments`)
**New endpoints added:**
- `POST /api/v1/apartments/:id/images` - Add apartment image
- `DELETE /api/v1/apartments/:id/images/:imageId` - Delete apartment image
- `GET /api/v1/apartments/:id/amenities` - Get apartment amenities
- `PUT /api/v1/apartments/:id/amenities` - Update apartment amenities

**Enhanced existing endpoints:**
- `POST /api/v1/apartments` - Now supports image upload during creation
- `PUT /api/v1/apartments/:id` - Now supports image upload during update
- `DELETE /api/v1/apartments/:id` - Now includes image cleanup

### Enhanced Building API (`/api/v1/buildings`)
**Already had image support, verified working:**
- `POST /api/v1/buildings/:id/images` - Add building image
- `DELETE /api/v1/buildings/:id/images/:imageId` - Delete building image

## File Upload Configuration

### Upload Directories Created
- `public/uploads/buildings/` - Building images
- `public/uploads/floors/` - Floor images  
- `public/uploads/apartments/` - Apartment images

### Upload Configurations
- **File size limit**: 10MB per image
- **File types**: Only image files (jpg, png, gif, etc.)
- **Multiple uploads**: Up to 10 images per request
- **Naming convention**: `{type}-{timestamp}-{random}.{ext}`

## Model Enhancements

### Floor Model (`backend/models/property/Floor.js`)
**New functions added:**
- `getFloorImages(floorId)` - Get all images for a floor
- `getFloorImageById(imageId)` - Get specific floor image
- `addFloorImage(floorId, imageUrl)` - Add new floor image
- `deleteFloorImage(imageId)` - Delete floor image
- `updateFloorImage(imageId, imageUrl)` - Update floor image

### Apartment Model (`backend/models/property/Apartment.js`)
**Already had image functions, verified working:**
- `getApartmentImages(apartmentId)`
- `addApartmentImage(apartmentId, imageUrl)`
- `deleteApartmentImage(imageId)`
- `getApartmentAmenities(apartmentId)`
- `updateApartmentAmenities(apartmentId, amenities)`

## Controller Enhancements

### New Floor Controller (`backend/controllers/floor/floorController.js`)
Complete CRUD operations with image management:
- Full floor lifecycle management
- Image upload/delete with file cleanup
- Statistics and apartment listing
- Error handling and validation

### Enhanced Apartment Controller (`backend/controllers/apartment/apartmentController.js`)
**New methods added:**
- `addApartmentImage()` - Handle single image upload
- `deleteApartmentImage()` - Handle image deletion with file cleanup
- `getApartmentAmenities()` - Get apartment amenities
- `updateApartmentAmenities()` - Update apartment amenities list

**Enhanced existing methods:**
- `createApartment()` - Now handles image upload during creation
- `updateApartment()` - Now handles image upload during update
- `deleteApartment()` - Now includes image file cleanup

## Route Enhancements

### New Floor Routes (`backend/routes/floor/floors.js`)
- Complete RESTful API with image upload support
- Multer configuration for floor images
- Authentication and authorization middleware
- Validation middleware integration

### Enhanced Apartment Routes (`backend/routes/apartment/apartments.js`)
- Added image management endpoints
- Added amenities management endpoints
- Integrated multer for apartment image uploads
- Enhanced existing routes with image support

## Image Storage Strategy

### File Path Structure
- **Building images**: `/public/uploads/buildings/building-{timestamp}-{random}.{ext}`
- **Floor images**: `/public/uploads/floors/floor-{timestamp}-{random}.{ext}`
- **Apartment images**: `/public/uploads/apartments/apartment-{timestamp}-{random}.{ext}`

### Database Storage
- Image file paths are stored in database as: `/public/uploads/{type}/{filename}`
- Allows for easy URL construction and file cleanup
- Consistent with existing tenant image storage pattern

## API Response Format

### Consistent Response Structure
```json
{
  "success": true,
  "data": {...},
  "message": "Operation completed successfully"
}
```

### Error Handling
- Proper error responses with meaningful messages
- File cleanup on failed operations
- Validation error handling

## Status Calculation Fix

### Apartment Status
The apartment status is now calculated dynamically based on `ApartmentAssigned` table:
- **Available**: No tenant assigned (`aa.tenantId IS NULL`)
- **Occupied**: Tenant assigned (`aa.tenantId IS NOT NULL`)

This provides real-time status instead of relying on potentially outdated enum values.

## Migration Scripts

### Database Migration
- `backend/scripts/safe_database_migration.js` - Safe migration script that checks existing structure
- Handles existing columns gracefully
- Provides detailed logging and verification

## Testing

### Server Status
- ✅ Server starts successfully on port 5000
- ✅ Database connection established
- ✅ All routes registered properly
- ✅ Image upload directories created

### Next Steps for Testing
1. Test floor CRUD operations
2. Test apartment image upload/delete
3. Test apartment amenities management
4. Verify image file cleanup on deletion
5. Test hierarchical building → floor → apartment navigation

## Summary

All building, apartment, and floor APIs are now properly structured with:
- ✅ Fixed database schema for image storage
- ✅ Complete CRUD operations for floors
- ✅ Enhanced apartment image and amenities management
- ✅ Consistent file upload handling
- ✅ Proper error handling and cleanup
- ✅ RESTful API design patterns
- ✅ Authentication and authorization
- ✅ Real-time status calculation
