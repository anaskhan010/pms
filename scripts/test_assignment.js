import dotenv from 'dotenv';
import db from '../config/db.js';
import buildingModel from '../models/property/Building.js';
import userModel from '../models/user/User.js';

// Load environment variables
dotenv.config({ path: './config/config.env' });

const testAssignment = async () => {
  try {
    console.log('🔄 Testing building assignment...');

    // Get a building
    const buildings = await buildingModel.getAllBuildings(1, 5);
    if (buildings.buildings.length === 0) {
      console.log('❌ No buildings found');
      return;
    }
    
    const building = buildings.buildings[0];
    console.log(`📋 Using building: ${building.buildingName} (ID: ${building.buildingId})`);

    // Get a user with owner role
    const users = await userModel.getUsersByRoleId(2, 5, 0);
    if (users.length === 0) {
      console.log('❌ No users with owner role found');
      return;
    }
    
    const user = users[0];
    console.log(`👤 Using user: ${user.firstName} ${user.lastName} (ID: ${user.userId}, Role: ${user.roleName})`);

    // Test getUserById to make sure it returns role info
    const userDetails = await userModel.getUserById(user.userId);
    console.log(`🔍 User details from getUserById:`, {
      userId: userDetails.userId,
      name: `${userDetails.firstName} ${userDetails.lastName}`,
      roleName: userDetails.roleName
    });

    // Test assignment
    try {
      const assignmentId = await buildingModel.assignBuildingToUser(building.buildingId, user.userId);
      console.log('✅ Assignment successful! Assignment ID:', assignmentId);
    } catch (error) {
      if (error.message.includes('already assigned')) {
        console.log('ℹ️ Building already assigned to this user');
      } else {
        console.error('❌ Assignment failed:', error.message);
      }
    }

    // Check current assignments
    const assignments = await buildingModel.getBuildingAssignments(building.buildingId);
    console.log('\n📊 Current assignments for this building:');
    assignments.forEach(assignment => {
      console.log(`  - User: ${assignment.firstName} ${assignment.lastName} (${assignment.email})`);
    });

  } catch (error) {
    console.error('❌ Error testing assignment:', error.message);
  } finally {
    // Close database connection
    await db.end();
    process.exit(0);
  }
};

// Run the test
testAssignment();
