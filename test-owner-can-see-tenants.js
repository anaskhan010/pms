import db from './config/db.js';

/**
 * Test Owner Can See Their Own Tenants
 * Verifies that legitimate owners can see their own tenants
 */

const testOwnerCanSeeOwnTenants = async () => {
  console.log('👤 Testing: Owner Can See Their Own Tenants');
  console.log('='.repeat(50));

  try {
    // Setup test data
    await setupOwnerTenantTestData();
    
    // Test that owners can see their own tenants
    await testOwnerTenantVisibility();
    
    console.log('\n🎉 Owner tenant visibility test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await cleanupOwnerTenantTestData();
  }
};

const setupOwnerTenantTestData = async () => {
  console.log('\n📝 Setting up owner tenant test data...');
  
  // Create owner role if not exists
  await db.execute(`INSERT IGNORE INTO role (roleId, roleName) VALUES (2, 'owner')`);

  // Create test owner
  await db.execute(`
    INSERT IGNORE INTO user (userId, firstName, lastName, email, password, phoneNumber, address, gender, image, nationality, dateOfBirth)
    VALUES (9001, 'Test Owner', 'User', 'test.owner@test.com', 'password123', '1234567890', 'Test Address', 'Male', 'test.jpg', 'Test Country', '1990-01-01')
  `);

  await db.execute(`INSERT IGNORE INTO userRole (userId, roleId) VALUES (9001, 2)`);

  // Owner creates a building
  await db.execute(`
    INSERT IGNORE INTO building (buildingId, buildingName, buildingAddress, buildingCreatedDate, createdBy)
    VALUES (8001, 'Test Owner Building', 'Test Owner Address', '2024-01-01', 9001)
  `);

  // Create floor and apartment
  await db.execute(`
    INSERT IGNORE INTO floor (floorId, buildingId, floorName)
    VALUES (6001, 8001, 'Test Floor')
  `);

  await db.execute(`
    INSERT IGNORE INTO apartment (apartmentId, floorId, bedrooms, bathrooms, length, width, rentPrice, status, description)
    VALUES (5001, 6001, 2, 1, 700, 800, 1000, 'Rented', 'Test Apartment')
  `);

  // Create tenant user
  await db.execute(`
    INSERT IGNORE INTO user (userId, firstName, lastName, email, password, phoneNumber, address, gender, image, nationality, dateOfBirth)
    VALUES (9010, 'Test', 'Tenant', 'test.tenant@test.com', 'password123', '1111111111', 'Tenant Address', 'Male', 'tenant.jpg', 'Tenant Country', '1990-01-01')
  `);

  // Owner creates tenant
  await db.execute(`
    INSERT IGNORE INTO tenant (tenantId, userId, occupation, createdBy)
    VALUES (7001, 9010, 'Test Job', 9001)
  `);

  // Assign tenant to apartment
  await db.execute(`
    INSERT IGNORE INTO ApartmentAssigned (tenantId, apartmentId)
    VALUES (7001, 5001)
  `);

  // Create another tenant directly created by owner (not in building)
  await db.execute(`
    INSERT IGNORE INTO user (userId, firstName, lastName, email, password, phoneNumber, address, gender, image, nationality, dateOfBirth)
    VALUES (9011, 'Direct', 'Tenant', 'direct.tenant@test.com', 'password123', '2222222222', 'Direct Tenant Address', 'Male', 'tenant.jpg', 'Tenant Country', '1990-01-01')
  `);

  await db.execute(`
    INSERT IGNORE INTO tenant (tenantId, userId, occupation, createdBy)
    VALUES (7002, 9011, 'Direct Job', 9001)
  `);

  console.log('✅ Owner tenant test data setup completed!');
  console.log('   - Created owner (ID: 9001)');
  console.log('   - Created building (ID: 8001) owned by owner');
  console.log('   - Created tenant (ID: 7001) in owner\'s building');
  console.log('   - Created direct tenant (ID: 7002) created by owner');
};

const testOwnerTenantVisibility = async () => {
  console.log('\n🔍 Testing owner tenant visibility...');
  
  const ownerId = 9001;
  
  // Simulate the middleware logic
  console.log('   Simulating getTenantAccess middleware...');
  
  // Get buildings created by owner
  const [buildingRows] = await db.execute('SELECT buildingId FROM building WHERE createdBy = ?', [ownerId]);
  const buildingIds = buildingRows.map(row => row.buildingId);
  
  // Get tenants created by owner
  const [tenantRows] = await db.execute('SELECT tenantId FROM tenant WHERE createdBy = ?', [ownerId]);
  const tenantIds = tenantRows.map(row => row.tenantId);
  
  console.log(`   Owner has ${buildingIds.length} building(s): [${buildingIds.join(', ')}]`);
  console.log(`   Owner created ${tenantIds.length} tenant(s): [${tenantIds.join(', ')}]`);
  
  // Simulate the tenant query (same as in the model)
  console.log('   Simulating tenant query...');
  
  let query = `
    SELECT DISTINCT t.tenantId, u.firstName, u.lastName, t.createdBy
    FROM tenant t
    INNER JOIN user u ON t.userId = u.userId
    LEFT JOIN ApartmentAssigned aa ON t.tenantId = aa.tenantId
    LEFT JOIN apartment a ON aa.apartmentId = a.apartmentId
    LEFT JOIN floor f ON a.floorId = f.floorId
    LEFT JOIN building b ON f.buildingId = b.buildingId
    WHERE 1 = 1
  `;
  let values = [];
  
  // Apply ownership conditions
  let ownershipConditions = [];
  
  if (buildingIds.length > 0) {
    ownershipConditions.push(`(b.buildingId IN (${buildingIds.map(() => '?').join(',')}) AND aa.apartmentId IS NOT NULL)`);
    values.push(...buildingIds);
  }
  
  if (tenantIds.length > 0) {
    ownershipConditions.push(`t.tenantId IN (${tenantIds.map(() => '?').join(',')})`);
    values.push(...tenantIds);
  }
  
  if (ownershipConditions.length > 0) {
    query += ` AND (${ownershipConditions.join(' OR ')})`;
    query += ' AND t.createdBy IS NOT NULL';
  } else {
    query += ` AND 1 = 0`;
  }
  
  console.log('   Query:', query);
  console.log('   Values:', values);
  
  const [results] = await db.execute(query, values);
  
  console.log(`   Owner can see ${results.length} tenant(s):`);
  results.forEach(tenant => {
    const owner = tenant.createdBy ? `Owner ${tenant.createdBy}` : 'NO OWNER';
    console.log(`     - ${tenant.firstName} ${tenant.lastName} (ID: ${tenant.tenantId}) - Created by: ${owner}`);
  });
  
  // Verify results
  if (results.length >= 2) {
    console.log('   ✅ SUCCESS: Owner can see their own tenants');
    
    // Check that all visible tenants belong to the owner
    const allBelongToOwner = results.every(tenant => tenant.createdBy === ownerId);
    if (allBelongToOwner) {
      console.log('   ✅ SECURITY: All visible tenants belong to the owner');
    } else {
      console.log('   ❌ SECURITY: Some visible tenants do not belong to the owner');
    }
  } else {
    console.log('   ❌ PROBLEM: Owner cannot see their own tenants');
    
    // Debug: Check if tenants exist
    const [allOwnerTenants] = await db.execute(`
      SELECT t.tenantId, u.firstName, u.lastName, t.createdBy
      FROM tenant t
      INNER JOIN user u ON t.userId = u.userId
      WHERE t.createdBy = ?
    `, [ownerId]);
    
    console.log(`   Debug: Owner actually has ${allOwnerTenants.length} tenant(s) in database:`);
    allOwnerTenants.forEach(tenant => {
      console.log(`     - ${tenant.firstName} ${tenant.lastName} (ID: ${tenant.tenantId})`);
    });
  }
};

const cleanupOwnerTenantTestData = async () => {
  console.log('\n🧹 Cleaning up owner tenant test data...');
  
  try {
    await db.execute('DELETE FROM ApartmentAssigned WHERE tenantId IN (7001, 7002)');
    await db.execute('DELETE FROM apartment WHERE apartmentId = 5001');
    await db.execute('DELETE FROM floor WHERE floorId = 6001');
    await db.execute('DELETE FROM tenant WHERE tenantId IN (7001, 7002)');
    await db.execute('DELETE FROM building WHERE buildingId = 8001');
    await db.execute('DELETE FROM userRole WHERE userId IN (9001, 9010, 9011)');
    await db.execute('DELETE FROM user WHERE userId IN (9001, 9010, 9011)');
    
    console.log('✅ Owner tenant test data cleanup completed!');
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
};

// Run the test
testOwnerCanSeeOwnTenants().then(() => {
  process.exit(0);
});
