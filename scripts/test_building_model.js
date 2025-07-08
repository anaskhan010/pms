import buildingModel from '../models/property/Building.js';

const testBuildingModel = async () => {
  try {
    console.log('🔍 Testing Building Model...');
    
    // Test getAllBuildings
    console.log('📋 Testing getAllBuildings...');
    const result = await buildingModel.getAllBuildings(1, 10);
    console.log('✅ getAllBuildings successful');
    console.log(`   Found ${result.buildings.length} buildings`);
    console.log(`   Total: ${result.total}`);
    
    if (result.buildings.length > 0) {
      const firstBuilding = result.buildings[0];
      console.log(`   First building: ${firstBuilding.buildingName}`);
      
      // Test getBuildingById
      console.log('🔍 Testing getBuildingById...');
      const building = await buildingModel.getBuildingById(firstBuilding.buildingId);
      if (building) {
        console.log('✅ getBuildingById successful');
        console.log(`   Building: ${building.buildingName}`);
      } else {
        console.log('❌ getBuildingById returned null');
      }
      
      // Test getBuildingImages
      console.log('🖼️ Testing getBuildingImages...');
      const images = await buildingModel.getBuildingImages(firstBuilding.buildingId);
      console.log(`✅ getBuildingImages successful - found ${images.length} images`);
    }
    
    // Test getBuildingStatistics
    console.log('📊 Testing getBuildingStatistics...');
    const stats = await buildingModel.getBuildingStatistics();
    console.log('✅ getBuildingStatistics successful');
    console.log(`   Total buildings: ${stats.totalBuildings}`);
    
  } catch (error) {
    console.error('❌ Building model test failed:', error);
    console.error('Stack trace:', error.stack);
  }
};

testBuildingModel().catch(console.error);
