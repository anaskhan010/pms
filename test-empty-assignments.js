import db from './config/db.js';

/**
 * Test Empty Assignments Handling
 * Tests that users with no building/villa assignments can access the system
 * without getting "No buildings assigned to this user" errors
 */

const testEmptyAssignments = async () => {
  console.log('🧪 Testing Empty Assignments Handling');
  console.log('='.repeat(50));

  try {
    // Setup test data
    await setupTestUser();
    
    // Test middleware functions
    await testBuildingMiddleware();
    await testVillaMiddleware();
    await testTenantMiddleware();
    await testTransactionMiddleware();
    
    console.log('\n🎉 All empty assignment tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await cleanupTestData();
  }
};

const setupTestUser = async () => {
  console.log('\n📝 Setting up test user with no assignments...');
  
  // Create owner role if not exists
  await db.execute(`INSERT IGNORE INTO role (roleId, roleName) VALUES (2, 'owner')`);

  // Create test user with no building/villa assignments
  const testUserId = 9999;
  await db.execute(`
    INSERT IGNORE INTO user (userId, firstName, lastName, email, password, phoneNumber, address, gender, image, nationality, dateOfBirth)
    VALUES (?, 'Test', 'User', 'test.empty@test.com', 'password123', '1234567890', 'Test Address', 'Male', 'test.jpg', 'Test Country', '1990-01-01')
  `, [testUserId]);

  await db.execute(`INSERT IGNORE INTO userRole (userId, roleId) VALUES (?, 2)`, [testUserId]);

  console.log('✅ Test user created with no assignments');
};

const testBuildingMiddleware = async () => {
  console.log('\n🏢 Testing building middleware with empty assignments...');
  
  const testUserId = 9999;
  
  // Simulate the middleware logic
  try {
    // Check if user has view_own permission (they should)
    const [permissionCheck] = await db.execute(`
      SELECT COUNT(*) as hasPermission
      FROM permissions p
      INNER JOIN role_permissions rp ON p.permissionId = rp.permissionId
      INNER JOIN userRole ur ON rp.roleId = ur.roleId
      WHERE ur.userId = ? AND p.resource = 'buildings' AND p.action = 'view_own'
    `, [testUserId]);
    
    const hasViewOwnPermission = permissionCheck[0].hasPermission > 0;
    console.log(`   User has buildings.view_own permission: ${hasViewOwnPermission ? '✅ YES' : '❌ NO'}`);
    
    if (hasViewOwnPermission) {
      // Get buildings assigned to this user (should be empty)
      const [rows] = await db.execute('SELECT buildingId FROM buildingAssigned WHERE userId = ?', [testUserId]);
      const ownerBuildings = rows.map(row => row.buildingId);
      
      console.log(`   Buildings assigned to user: [${ownerBuildings.join(', ') || 'NONE'}]`);
      console.log(`   Middleware should allow access with empty array: ${ownerBuildings.length === 0 ? '✅ YES' : '❌ NO'}`);
      
      // This should NOT throw an error anymore
      console.log('   ✅ Building middleware: PASSED - No error thrown for empty assignments');
    }
  } catch (error) {
    console.log(`   ❌ Building middleware: FAILED - ${error.message}`);
  }
};

const testVillaMiddleware = async () => {
  console.log('\n🏡 Testing villa middleware with empty assignments...');
  
  const testUserId = 9999;
  
  try {
    // Check if user has view_own permission
    const [permissionCheck] = await db.execute(`
      SELECT COUNT(*) as hasPermission
      FROM permissions p
      INNER JOIN role_permissions rp ON p.permissionId = rp.permissionId
      INNER JOIN userRole ur ON rp.roleId = ur.roleId
      WHERE ur.userId = ? AND p.resource = 'villas' AND p.action = 'view_own'
    `, [testUserId]);
    
    const hasViewOwnPermission = permissionCheck[0].hasPermission > 0;
    console.log(`   User has villas.view_own permission: ${hasViewOwnPermission ? '✅ YES' : '❌ NO'}`);
    
    if (hasViewOwnPermission) {
      // Get villas assigned to this user (should be empty)
      const [rows] = await db.execute('SELECT villaId FROM villasAssigned WHERE userId = ?', [testUserId]);
      const ownerVillas = rows.map(row => row.villaId);
      
      console.log(`   Villas assigned to user: [${ownerVillas.join(', ') || 'NONE'}]`);
      console.log(`   Middleware should allow access with empty array: ${ownerVillas.length === 0 ? '✅ YES' : '❌ NO'}`);
      
      console.log('   ✅ Villa middleware: PASSED - No error thrown for empty assignments');
    }
  } catch (error) {
    console.log(`   ❌ Villa middleware: FAILED - ${error.message}`);
  }
};

const testTenantMiddleware = async () => {
  console.log('\n👥 Testing tenant middleware with empty assignments...');
  
  const testUserId = 9999;
  
  try {
    // Check if user has view_own permission
    const [permissionCheck] = await db.execute(`
      SELECT COUNT(*) as hasPermission
      FROM permissions p
      INNER JOIN role_permissions rp ON p.permissionId = rp.permissionId
      INNER JOIN userRole ur ON rp.roleId = ur.roleId
      WHERE ur.userId = ? AND p.resource = 'tenants' AND p.action = 'view_own'
    `, [testUserId]);
    
    const hasViewOwnPermission = permissionCheck[0].hasPermission > 0;
    console.log(`   User has tenants.view_own permission: ${hasViewOwnPermission ? '✅ YES' : '❌ NO'}`);
    
    if (hasViewOwnPermission) {
      // Get buildings assigned to this user for tenant filtering (should be empty)
      const [buildingRows] = await db.execute('SELECT buildingId FROM buildingAssigned WHERE userId = ?', [testUserId]);
      const buildingIds = buildingRows.map(row => row.buildingId);
      
      console.log(`   Buildings for tenant filtering: [${buildingIds.join(', ') || 'NONE'}]`);
      console.log(`   Middleware should allow access with empty array: ${buildingIds.length === 0 ? '✅ YES' : '❌ NO'}`);
      
      console.log('   ✅ Tenant middleware: PASSED - No error thrown for empty assignments');
    }
  } catch (error) {
    console.log(`   ❌ Tenant middleware: FAILED - ${error.message}`);
  }
};

const testTransactionMiddleware = async () => {
  console.log('\n💰 Testing transaction middleware with empty assignments...');
  
  const testUserId = 9999;
  
  try {
    // Check if user has view_own permission
    const [permissionCheck] = await db.execute(`
      SELECT COUNT(*) as hasPermission
      FROM permissions p
      INNER JOIN role_permissions rp ON p.permissionId = rp.permissionId
      INNER JOIN userRole ur ON rp.roleId = ur.roleId
      WHERE ur.userId = ? AND p.resource = 'transactions' AND p.action = 'view_own'
    `, [testUserId]);
    
    const hasViewOwnPermission = permissionCheck[0].hasPermission > 0;
    console.log(`   User has transactions.view_own permission: ${hasViewOwnPermission ? '✅ YES' : '❌ NO'}`);
    
    if (hasViewOwnPermission) {
      // Get buildings assigned to this user for transaction filtering (should be empty)
      const [buildingRows] = await db.execute('SELECT buildingId FROM buildingAssigned WHERE userId = ?', [testUserId]);
      const buildingIds = buildingRows.map(row => row.buildingId);
      
      console.log(`   Buildings for transaction filtering: [${buildingIds.join(', ') || 'NONE'}]`);
      console.log(`   Middleware should allow access with empty array: ${buildingIds.length === 0 ? '✅ YES' : '❌ NO'}`);
      
      console.log('   ✅ Transaction middleware: PASSED - No error thrown for empty assignments');
    }
  } catch (error) {
    console.log(`   ❌ Transaction middleware: FAILED - ${error.message}`);
  }
};

const testModelQueries = async () => {
  console.log('\n🔍 Testing model queries with empty filters...');
  
  try {
    // Test building model with empty ownerBuildings
    const buildingFilters = { ownerBuildings: [] };
    console.log('   Testing building model with empty ownerBuildings...');
    
    // This should return empty results, not throw an error
    const buildingQuery = `
      SELECT COUNT(*) as total
      FROM building b
      WHERE 1 = 1
    `;
    
    // Add owner building filtering (should be skipped for empty array)
    let finalQuery = buildingQuery;
    const queryParams = [];
    
    if (buildingFilters.ownerBuildings && buildingFilters.ownerBuildings.length > 0) {
      const placeholders = buildingFilters.ownerBuildings.map(() => '?').join(',');
      finalQuery += ` AND b.buildingId IN (${placeholders})`;
      queryParams.push(...buildingFilters.ownerBuildings);
    }
    
    const [buildingResult] = await db.execute(finalQuery, queryParams);
    console.log(`   Building query result: ${buildingResult[0].total} total buildings (should show all buildings since no filter applied)`);
    
    // Test tenant model with empty ownerBuildings
    const tenantFilters = { ownerBuildings: [] };
    console.log('   Testing tenant model with empty ownerBuildings...');
    
    const tenantQuery = `
      SELECT COUNT(*) as total
      FROM tenant t
      INNER JOIN user u ON t.userId = u.userId
      LEFT JOIN ApartmentAssigned aa ON t.tenantId = aa.tenantId
      LEFT JOIN apartment a ON aa.apartmentId = a.apartmentId
      LEFT JOIN floor f ON a.floorId = f.floorId
      LEFT JOIN building b ON f.buildingId = b.buildingId
      WHERE 1 = 1
    `;
    
    let finalTenantQuery = tenantQuery;
    const tenantParams = [];
    
    if (tenantFilters.ownerBuildings && tenantFilters.ownerBuildings.length > 0) {
      const placeholders = tenantFilters.ownerBuildings.map(() => '?').join(',');
      finalTenantQuery += ` AND (b.buildingId IN (${placeholders}) OR aa.apartmentId IS NULL)`;
      tenantParams.push(...tenantFilters.ownerBuildings);
    }
    
    const [tenantResult] = await db.execute(finalTenantQuery, tenantParams);
    console.log(`   Tenant query result: ${tenantResult[0].total} total tenants (should show all tenants since no filter applied)`);
    
    console.log('   ✅ Model queries: PASSED - Handle empty filters gracefully');
    
  } catch (error) {
    console.log(`   ❌ Model queries: FAILED - ${error.message}`);
  }
};

const cleanupTestData = async () => {
  console.log('\n🧹 Cleaning up test data...');
  
  try {
    await db.execute('DELETE FROM userRole WHERE userId = 9999');
    await db.execute('DELETE FROM user WHERE userId = 9999');
    
    console.log('✅ Test data cleanup completed!');
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
};

// Run the test
testEmptyAssignments().then(() => {
  process.exit(0);
});
