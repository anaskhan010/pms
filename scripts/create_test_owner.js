import dotenv from 'dotenv';
import db from '../config/db.js';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config({ path: './config/config.env' });

const createTestOwner = async () => {
  try {
    console.log('🔄 Creating test owner user...');

    // Check if test owner already exists
    const [existingUsers] = await db.execute('SELECT * FROM user WHERE email = ?', ['owner@test.com']);
    
    if (existingUsers.length > 0) {
      console.log('✅ Test owner user already exists with ID:', existingUsers[0].userId);
      
      // Check if user has owner role
      const [userRole] = await db.execute(
        'SELECT ur.*, r.roleName FROM userRole ur JOIN role r ON ur.roleId = r.roleId WHERE ur.userId = ?', 
        [existingUsers[0].userId]
      );
      
      if (userRole.length > 0) {
        console.log('✅ User has role:', userRole[0].roleName);
      }
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 12);

    // Create user
    const [userResult] = await db.execute(
      'INSERT INTO user (firstName, lastName, email, password, phoneNumber, address, gender, nationality, dateOfBirth, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      ['Test', 'Owner', 'owner@test.com', hashedPassword, '+1234567890', '123 Test Street', 'Male', 'US', '1990-01-01', '/public/uploads/users/default-avatar.png']
    );

    const userId = userResult.insertId;
    console.log('✅ Test owner user created with ID:', userId);

    // Assign owner role (roleId = 2)
    await db.execute('INSERT INTO userRole (userId, roleId) VALUES (?, ?)', [userId, 2]);
    console.log('✅ Owner role assigned to user');

    // Display user info
    const [userInfo] = await db.execute(
      'SELECT u.*, r.roleName FROM user u JOIN userRole ur ON u.userId = ur.userId JOIN role r ON ur.roleId = r.roleId WHERE u.userId = ?',
      [userId]
    );

    console.log('\n📋 Created user details:');
    console.log(`  - ID: ${userInfo[0].userId}`);
    console.log(`  - Name: ${userInfo[0].firstName} ${userInfo[0].lastName}`);
    console.log(`  - Email: ${userInfo[0].email}`);
    console.log(`  - Role: ${userInfo[0].roleName}`);

  } catch (error) {
    console.error('❌ Error creating test owner:', error.message);
  } finally {
    // Close database connection
    await db.end();
    process.exit(0);
  }
};

// Run the script
createTestOwner();
