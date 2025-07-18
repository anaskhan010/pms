import db from './config/db.js';

/**
 * Add Ownership Fields Script
 * Adds createdBy fields to tables for proper hierarchical data isolation
 * Changes system from assignment-based to ownership-based filtering
 */

const addOwnershipFields = async () => {
  console.log('🔧 Adding Ownership Fields for Hierarchical Data Isolation');
  console.log('='.repeat(60));

  try {
    // Add createdBy field to building table
    await addCreatedByToBuilding();
    
    // Add createdBy field to villas table
    await addCreatedByToVillas();
    
    // Add createdBy field to tenant table
    await addCreatedByToTenant();
    
    // Verify all fields are added
    await verifyOwnershipFields();
    
    console.log('\n🎉 All ownership fields added successfully!');
    console.log('\n📋 Next Steps:');
    console.log('1. Update middleware to use createdBy instead of assignments');
    console.log('2. Update models to filter by createdBy');
    console.log('3. Update controllers to set createdBy when creating records');
    
  } catch (error) {
    console.error('❌ Error adding ownership fields:', error);
  } finally {
    process.exit(0);
  }
};

const addCreatedByToBuilding = async () => {
  console.log('\n🏢 Adding createdBy field to building table...');
  
  try {
    // Check if field already exists
    const [columns] = await db.execute('DESCRIBE building');
    const hasCreatedBy = columns.some(col => col.Field === 'createdBy');
    
    if (hasCreatedBy) {
      console.log('   ✅ createdBy field already exists in building table');
      return;
    }
    
    // Add createdBy field
    await db.execute(`
      ALTER TABLE building 
      ADD COLUMN createdBy INT NULL,
      ADD FOREIGN KEY (createdBy) REFERENCES user(userId) ON DELETE SET NULL
    `);
    
    console.log('   ✅ Added createdBy field to building table');
    
    // Update existing buildings to be owned by admin (userId = 1) if exists
    const [adminUser] = await db.execute('SELECT userId FROM user WHERE userId = 1 LIMIT 1');
    if (adminUser.length > 0) {
      await db.execute('UPDATE building SET createdBy = 1 WHERE createdBy IS NULL');
      console.log('   ✅ Set existing buildings to be owned by admin user');
    }
    
  } catch (error) {
    console.error('   ❌ Error adding createdBy to building:', error.message);
  }
};

const addCreatedByToVillas = async () => {
  console.log('\n🏡 Adding createdBy field to villas table...');
  
  try {
    // Check if field already exists
    const [columns] = await db.execute('DESCRIBE villas');
    const hasCreatedBy = columns.some(col => col.Field === 'createdBy');
    
    if (hasCreatedBy) {
      console.log('   ✅ createdBy field already exists in villas table');
      return;
    }
    
    // Add createdBy field
    await db.execute(`
      ALTER TABLE villas 
      ADD COLUMN createdBy INT NULL,
      ADD FOREIGN KEY (createdBy) REFERENCES user(userId) ON DELETE SET NULL
    `);
    
    console.log('   ✅ Added createdBy field to villas table');
    
    // Update existing villas to be owned by admin (userId = 1) if exists
    const [adminUser] = await db.execute('SELECT userId FROM user WHERE userId = 1 LIMIT 1');
    if (adminUser.length > 0) {
      await db.execute('UPDATE villas SET createdBy = 1 WHERE createdBy IS NULL');
      console.log('   ✅ Set existing villas to be owned by admin user');
    }
    
  } catch (error) {
    console.error('   ❌ Error adding createdBy to villas:', error.message);
  }
};

const addCreatedByToTenant = async () => {
  console.log('\n👥 Adding createdBy field to tenant table...');
  
  try {
    // Check if field already exists
    const [columns] = await db.execute('DESCRIBE tenant');
    const hasCreatedBy = columns.some(col => col.Field === 'createdBy');
    
    if (hasCreatedBy) {
      console.log('   ✅ createdBy field already exists in tenant table');
      return;
    }
    
    // Add createdBy field
    await db.execute(`
      ALTER TABLE tenant 
      ADD COLUMN createdBy INT NULL,
      ADD FOREIGN KEY (createdBy) REFERENCES user(userId) ON DELETE SET NULL
    `);
    
    console.log('   ✅ Added createdBy field to tenant table');
    
    // Update existing tenants to be owned by admin (userId = 1) if exists
    const [adminUser] = await db.execute('SELECT userId FROM user WHERE userId = 1 LIMIT 1');
    if (adminUser.length > 0) {
      await db.execute('UPDATE tenant SET createdBy = 1 WHERE createdBy IS NULL');
      console.log('   ✅ Set existing tenants to be owned by admin user');
    }
    
  } catch (error) {
    console.error('   ❌ Error adding createdBy to tenant:', error.message);
  }
};

const verifyOwnershipFields = async () => {
  console.log('\n🔍 Verifying ownership fields...');
  
  const tables = ['building', 'villas', 'tenant', 'user', 'FinancialTransactions'];
  
  for (const table of tables) {
    try {
      const [columns] = await db.execute(`DESCRIBE ${table}`);
      const hasCreatedBy = columns.some(col => col.Field === 'createdBy');
      
      if (hasCreatedBy) {
        // Check records with createdBy values
        const [records] = await db.execute(`
          SELECT COUNT(*) as total, COUNT(createdBy) as withCreatedBy 
          FROM ${table}
        `);
        
        console.log(`   ✅ ${table}: ${records[0].withCreatedBy}/${records[0].total} records have createdBy`);
      } else {
        console.log(`   ❌ ${table}: Missing createdBy field`);
      }
    } catch (error) {
      console.log(`   ❌ ${table}: Error - ${error.message}`);
    }
  }
};

// Run the script
addOwnershipFields();
