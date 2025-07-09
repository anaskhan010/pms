import dotenv from 'dotenv';
import db from '../config/db.js';
import userModel from '../models/user/User.js';

// Load environment variables
dotenv.config({ path: './config/config.env' });

const testUsersByRole = async () => {
  try {
    console.log('🔄 Testing getUsersByRoleId function...');

    // Test getting users with roleId = 2 (owner)
    const users = await userModel.getUsersByRoleId(2, 10, 0);
    console.log('✅ Users with owner role (roleId = 2):');
    
    if (users.length === 0) {
      console.log('  - No users found with owner role');
    } else {
      users.forEach(user => {
        console.log(`  - ID: ${user.userId}, Name: ${user.firstName} ${user.lastName}, Email: ${user.email}, Role: ${user.roleName}`);
      });
    }

    // Test getting count
    const count = await userModel.getUsersCountByRole(2);
    console.log(`\n📊 Total users with owner role: ${count}`);

  } catch (error) {
    console.error('❌ Error testing users by role:', error.message);
  } finally {
    // Close database connection
    await db.end();
    process.exit(0);
  }
};

// Run the test
testUsersByRole();
