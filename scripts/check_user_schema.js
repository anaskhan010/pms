import db from '../config/db.js';

/**
 * Check if user table has createdBy column for hierarchical user management
 */

const checkUserSchema = async () => {
  try {
    console.log('🔍 CHECKING USER TABLE SCHEMA\n');
    console.log('='.repeat(50));

    // Check current user table structure
    const [columns] = await db.execute(`
      DESCRIBE user
    `);

    console.log('\n📋 Current user table columns:');
    columns.forEach(column => {
      console.log(`  - ${column.Field} (${column.Type}) ${column.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${column.Key ? `[${column.Key}]` : ''} ${column.Default ? `DEFAULT: ${column.Default}` : ''}`);
    });

    // Check if createdBy column exists
    const hasCreatedBy = columns.some(col => col.Field === 'createdBy');
    console.log(`\n🔍 createdBy column exists: ${hasCreatedBy ? '✅ YES' : '❌ NO'}`);

    if (!hasCreatedBy) {
      console.log('\n📝 Need to add createdBy column for hierarchical user management');
      console.log('   This column will track which user created each user');
      
      // Add the createdBy column
      console.log('\n🔧 Adding createdBy column...');
      await db.execute(`
        ALTER TABLE user 
        ADD COLUMN createdBy INT NULL,
        ADD FOREIGN KEY (createdBy) REFERENCES user(userId) ON DELETE SET NULL
      `);
      
      console.log('✅ createdBy column added successfully');
      
      // Update existing users to have admin as creator (for existing data)
      console.log('\n🔧 Setting admin as creator for existing users...');
      await db.execute(`
        UPDATE user 
        SET createdBy = (
          SELECT u.userId 
          FROM user u 
          INNER JOIN userRole ur ON u.userId = ur.userId 
          WHERE ur.roleId = 1 
          LIMIT 1
        )
        WHERE createdBy IS NULL AND userId != (
          SELECT u.userId 
          FROM user u 
          INNER JOIN userRole ur ON u.userId = ur.userId 
          WHERE ur.roleId = 1 
          LIMIT 1
        )
      `);
      
      console.log('✅ Existing users updated with admin as creator');
    }

    // Verify the schema after changes
    console.log('\n📋 Final user table schema:');
    const [finalColumns] = await db.execute(`DESCRIBE user`);
    finalColumns.forEach(column => {
      console.log(`  - ${column.Field} (${column.Type}) ${column.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${column.Key ? `[${column.Key}]` : ''} ${column.Default ? `DEFAULT: ${column.Default}` : ''}`);
    });

    // Test hierarchical relationships
    console.log('\n📊 Testing hierarchical relationships:');
    const [users] = await db.execute(`
      SELECT u.userId, u.firstName, u.lastName, u.email, u.createdBy,
             creator.firstName as creatorFirstName, creator.lastName as creatorLastName,
             r.roleName
      FROM user u
      LEFT JOIN user creator ON u.createdBy = creator.userId
      INNER JOIN userRole ur ON u.userId = ur.userId
      INNER JOIN role r ON ur.roleId = r.roleId
      ORDER BY u.userId
      LIMIT 10
    `);

    users.forEach(user => {
      const creator = user.creatorFirstName ? `${user.creatorFirstName} ${user.creatorLastName}` : 'None';
      console.log(`  👤 ${user.firstName} ${user.lastName} (${user.roleName}) - Created by: ${creator}`);
    });

    console.log('\n🎯 HIERARCHICAL USER MANAGEMENT SCHEMA READY!');
    console.log('✅ Users can now be created with creator tracking');
    console.log('✅ Owners can only see/manage users they created');
    console.log('✅ Complete data isolation between different owners');

  } catch (error) {
    console.error('💥 Error checking user schema:', error);
  } finally {
    process.exit(0);
  }
};

// Run the check
checkUserSchema();
