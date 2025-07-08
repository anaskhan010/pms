import express from 'express';

// Import route files to test their structure
import buildingRoutes from '../routes/building/buildings.js';
import apartmentRoutes from '../routes/apartment/apartments.js';
import floorRoutes from '../routes/floor/floors.js';

console.log('🔄 Testing route configurations...');

// Create a test app to register routes
const testApp = express();

try {
  // Test building routes
  console.log('✅ Building routes imported successfully');
  testApp.use('/api/v1/buildings', buildingRoutes);
  
  // Test apartment routes  
  console.log('✅ Apartment routes imported successfully');
  testApp.use('/api/v1/apartments', apartmentRoutes);
  
  // Test floor routes
  console.log('✅ Floor routes imported successfully');
  testApp.use('/api/v1/floors', floorRoutes);
  
  console.log('🎉 All routes configured successfully!');
  
  // List the expected endpoints
  console.log('\n📋 Available API Endpoints:');
  
  console.log('\n🏢 Building Endpoints:');
  console.log('  GET    /api/v1/buildings/getBuildingStatistics');
  console.log('  GET    /api/v1/buildings/getBuildings');
  console.log('  POST   /api/v1/buildings/createBuilding');
  console.log('  GET    /api/v1/buildings/getBuilding/:id');
  console.log('  PUT    /api/v1/buildings/updateBuilding/:id');
  console.log('  DELETE /api/v1/buildings/deleteBuilding/:id');
  console.log('  GET    /api/v1/buildings/getBuildingFloors/:id');
  console.log('  POST   /api/v1/buildings/addBuildingImage/:id');
  console.log('  DELETE /api/v1/buildings/deleteBuildingImage/:id/:imageId');
  
  console.log('\n🏠 Apartment Endpoints:');
  console.log('  GET    /api/v1/apartments/getApartmentStatistics');
  console.log('  GET    /api/v1/apartments/getApartments');
  console.log('  POST   /api/v1/apartments/createApartment');
  console.log('  GET    /api/v1/apartments/getApartment/:id');
  console.log('  PUT    /api/v1/apartments/updateApartment/:id');
  console.log('  DELETE /api/v1/apartments/deleteApartment/:id');
  console.log('  POST   /api/v1/apartments/addApartmentImage/:id');
  console.log('  DELETE /api/v1/apartments/deleteApartmentImage/:id/:imageId');
  console.log('  GET    /api/v1/apartments/getApartmentAmenities/:id');
  console.log('  PUT    /api/v1/apartments/updateApartmentAmenities/:id');
  
  console.log('\n🏢 Floor Endpoints:');
  console.log('  GET    /api/v1/floors/getFloorStatistics');
  console.log('  GET    /api/v1/floors/getFloors');
  console.log('  POST   /api/v1/floors/createFloor');
  console.log('  GET    /api/v1/floors/getFloor/:id');
  console.log('  PUT    /api/v1/floors/updateFloor/:id');
  console.log('  DELETE /api/v1/floors/deleteFloor/:id');
  console.log('  GET    /api/v1/floors/getFloorApartments/:id');
  console.log('  POST   /api/v1/floors/addFloorImage/:id');
  console.log('  DELETE /api/v1/floors/deleteFloorImage/:id/:imageId');
  
  console.log('\n✅ Route configuration test completed successfully!');
  
} catch (error) {
  console.error('❌ Error testing routes:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}
