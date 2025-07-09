import dotenv from 'dotenv';
import db from '../config/db.js';
import buildingModel from '../models/property/Building.js';
import userModel from '../models/user/User.js';

// Load environment variables
dotenv.config({ path: './config/config.env' });

const testUserBuildings = async () => {
  try {
    console.log('🔄 Testing getUserAssignedBuildings function...');

    // Get users with owner role
    const users = await userModel.getUsersByRoleId(2, 5, 0);
    if (users.length === 0) {
      console.log('❌ No users with owner role found');
      return;
    }
    
    console.log(`👥 Found ${users.length} users with owner role:`);
    users.forEach(user => {
      console.log(`  - ${user.firstName} ${user.lastName} (ID: ${user.userId})`);
    });

    // Test getUserAssignedBuildings for each user
    for (const user of users) {
      console.log(`\n🏢 Testing buildings for user: ${user.firstName} ${user.lastName} (ID: ${user.userId})`);
      
      const buildings = await buildingModel.getUserAssignedBuildings(user.userId);
      
      if (buildings.length === 0) {
        console.log('  - No buildings assigned to this user');
      } else {
        console.log(`  - Found ${buildings.length} assigned building(s):`);
        buildings.forEach(building => {
          console.log(`    * ${building.buildingName} (ID: ${building.buildingId})`);
          console.log(`      Address: ${building.buildingAddress}`);
          console.log(`      Created: ${building.buildingCreatedDate}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error testing user buildings:', error.message);
  } finally {
    // Close database connection
    await db.end();
    process.exit(0);
  }
};

// Run the test
testUserBuildings();
