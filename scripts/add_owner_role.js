import dotenv from 'dotenv';
import db from '../config/db.js';

// Load environment variables
dotenv.config({ path: './config/config.env' });

const addOwnerRole = async () => {
  try {
    console.log('🔄 Adding owner role to the database...');

    // Check if owner role already exists
    const [existingRoles] = await db.execute('SELECT * FROM role WHERE roleName = ?', ['owner']);
    
    if (existingRoles.length > 0) {
      console.log('✅ Owner role already exists with ID:', existingRoles[0].roleId);
      return;
    }

    // Insert owner role
    const [result] = await db.execute('INSERT INTO role (roleName) VALUES (?)', ['owner']);
    console.log('✅ Owner role added successfully with ID:', result.insertId);

    // Display all roles
    const [allRoles] = await db.execute('SELECT * FROM role ORDER BY roleId');
    console.log('\n📋 Current roles in the system:');
    allRoles.forEach(role => {
      console.log(`  - ID: ${role.roleId}, Name: ${role.roleName}`);
    });

  } catch (error) {
    console.error('❌ Error adding owner role:', error.message);
  } finally {
    // Close database connection
    await db.end();
    process.exit(0);
  }
};

// Run the script
addOwnerRole();
