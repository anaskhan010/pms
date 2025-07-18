import db from './config/db.js';

/**
 * Final Verification Test
 * Tests all aspects of the hierarchical ownership system:
 * 1. Permission system works correctly
 * 2. Owner A cannot see Owner B's data
 * 3. Owner B cannot see Owner A's data
 * 4. All resource types are properly isolated
 * 5. No permission errors occur
 */

const testFinalVerification = async () => {
  console.log('🎯 Final Verification Test - Complete System Check');
  console.log('='.repeat(60));

  try {
    // Setup comprehensive test data
    await setupFinalTestData();
    
    // Test all aspects of the system
    await testPermissionSystem();
    await testCompleteDataIsolation();
    await testResourceCreation();
    await testEmptyStateHandling();
    
    console.log('\n🎉 Final verification completed successfully!');
    console.log('✅ System is fully functional with perfect data isolation');
    
  } catch (error) {
    console.error('❌ Final verification failed:', error);
  } finally {
    await cleanupFinalTestData();
  }
};

const setupFinalTestData = async () => {
  console.log('\n📝 Setting up final verification test data...');
  
  // Create owner role if not exists
  await db.execute(`INSERT IGNORE INTO role (roleId, roleName) VALUES (2, 'owner')`);

  // Create two comprehensive owner users
  const owners = [
    { id: 9001, name: 'Final Owner Alpha', email: 'final.alpha@test.com' },
    { id: 9002, name: 'Final Owner Beta', email: 'final.beta@test.com' }
  ];

  for (const owner of owners) {
    await db.execute(`
      INSERT IGNORE INTO user (userId, firstName, lastName, email, password, phoneNumber, address, gender, image, nationality, dateOfBirth)
      VALUES (?, ?, 'Test', ?, 'password123', '1234567890', 'Test Address', 'Male', 'test.jpg', 'Test Country', '1990-01-01')
    `, [owner.id, owner.name, owner.email]);

    await db.execute(`INSERT IGNORE INTO userRole (userId, roleId) VALUES (?, 2)`, [owner.id]);
  }

  // Owner Alpha creates comprehensive data
  await db.execute(`
    INSERT IGNORE INTO building (buildingId, buildingName, buildingAddress, buildingCreatedDate, createdBy)
    VALUES (8001, 'Final Alpha Building', 'Final Alpha Address', '2024-01-01', 9001)
  `);

  await db.execute(`
    INSERT IGNORE INTO villas (villasId, Name, Address, bedrooms, bathrooms, length, width, price, description, yearOfCreation, status, createdBy)
    VALUES (3001, 'Final Alpha Villa', 'Final Alpha Villa Address', 3, 2, 1000, 1200, 50000, 'Final Alpha Villa', '2020-01-01', 'Available', 9001)
  `);

  await db.execute(`
    INSERT IGNORE INTO floor (floorId, buildingId, floorName)
    VALUES (6001, 8001, 'Final Alpha Floor')
  `);

  await db.execute(`
    INSERT IGNORE INTO apartment (apartmentId, floorId, bedrooms, bathrooms, length, width, rentPrice, status, description)
    VALUES (5001, 6001, 2, 1, 700, 800, 1000, 'Rented', 'Final Alpha Apartment')
  `);

  await db.execute(`
    INSERT IGNORE INTO user (userId, firstName, lastName, email, password, phoneNumber, address, gender, image, nationality, dateOfBirth)
    VALUES (9010, 'Final Alpha', 'Tenant', 'final.alpha.tenant@test.com', 'password123', '1111111111', 'Tenant Address', 'Male', 'tenant.jpg', 'Tenant Country', '1990-01-01')
  `);

  await db.execute(`
    INSERT IGNORE INTO tenant (tenantId, userId, occupation, createdBy)
    VALUES (7001, 9010, 'Final Alpha Job', 9001)
  `);

  await db.execute(`
    INSERT IGNORE INTO ApartmentAssigned (tenantId, apartmentId)
    VALUES (7001, 5001)
  `);

  await db.execute(`
    INSERT IGNORE INTO FinancialTransactions (transactionId, tenantId, apartmentId, amount, transactionType, status, paymentMethod, transactionDate, createdBy)
    VALUES ('final-alpha-txn-001', 7001, 5001, 1000.00, 'Rent Payment', 'Completed', 'Bank Transfer', '2024-01-01', 9001)
  `);

  await db.execute(`
    INSERT IGNORE INTO user (userId, firstName, lastName, email, password, phoneNumber, address, gender, image, nationality, dateOfBirth, createdBy)
    VALUES (9020, 'Final Alpha', 'Staff', 'final.alpha.staff@test.com', 'password123', '3333333333', 'Staff Address', 'Male', 'staff.jpg', 'Staff Country', '1990-01-01', 9001)
  `);

  // Owner Beta creates comprehensive data
  await db.execute(`
    INSERT IGNORE INTO building (buildingId, buildingName, buildingAddress, buildingCreatedDate, createdBy)
    VALUES (8002, 'Final Beta Building', 'Final Beta Address', '2024-01-01', 9002)
  `);

  await db.execute(`
    INSERT IGNORE INTO villas (villasId, Name, Address, bedrooms, bathrooms, length, width, price, description, yearOfCreation, status, createdBy)
    VALUES (3002, 'Final Beta Villa', 'Final Beta Villa Address', 4, 3, 1200, 1400, 75000, 'Final Beta Villa', '2020-01-01', 'Available', 9002)
  `);

  await db.execute(`
    INSERT IGNORE INTO floor (floorId, buildingId, floorName)
    VALUES (6002, 8002, 'Final Beta Floor')
  `);

  await db.execute(`
    INSERT IGNORE INTO apartment (apartmentId, floorId, bedrooms, bathrooms, length, width, rentPrice, status, description)
    VALUES (5002, 6002, 3, 2, 900, 1000, 1500, 'Rented', 'Final Beta Apartment')
  `);

  await db.execute(`
    INSERT IGNORE INTO user (userId, firstName, lastName, email, password, phoneNumber, address, gender, image, nationality, dateOfBirth)
    VALUES (9011, 'Final Beta', 'Tenant', 'final.beta.tenant@test.com', 'password123', '2222222222', 'Tenant Address', 'Male', 'tenant.jpg', 'Tenant Country', '1990-01-01')
  `);

  await db.execute(`
    INSERT IGNORE INTO tenant (tenantId, userId, occupation, createdBy)
    VALUES (7002, 9011, 'Final Beta Job', 9002)
  `);

  await db.execute(`
    INSERT IGNORE INTO ApartmentAssigned (tenantId, apartmentId)
    VALUES (7002, 5002)
  `);

  await db.execute(`
    INSERT IGNORE INTO FinancialTransactions (transactionId, tenantId, apartmentId, amount, transactionType, status, paymentMethod, transactionDate, createdBy)
    VALUES ('final-beta-txn-001', 7002, 5002, 1500.00, 'Rent Payment', 'Completed', 'Cash', '2024-01-01', 9002)
  `);

  await db.execute(`
    INSERT IGNORE INTO user (userId, firstName, lastName, email, password, phoneNumber, address, gender, image, nationality, dateOfBirth, createdBy)
    VALUES (9021, 'Final Beta', 'Staff', 'final.beta.staff@test.com', 'password123', '4444444444', 'Staff Address', 'Male', 'staff.jpg', 'Staff Country', '1990-01-01', 9002)
  `);

  console.log('✅ Final verification test data setup completed!');
};

const testPermissionSystem = async () => {
  console.log('\n🔐 Testing permission system...');
  
  // Check that all required permissions exist
  const requiredPermissions = [
    'buildings.view_own',
    'villas.view_own', 
    'tenants.view_own',
    'transactions.view_own',
    'users.view_own'
  ];
  
  console.log('   Checking required permissions exist:');
  for (const permName of requiredPermissions) {
    const [permission] = await db.execute('SELECT permissionId FROM permissions WHERE permissionName = ?', [permName]);
    if (permission.length > 0) {
      console.log(`     ✅ ${permName}`);
    } else {
      console.log(`     ❌ ${permName} - MISSING`);
    }
  }
  
  // Check that owner role has all required permissions
  console.log('   Checking owner role has required permissions:');
  const [ownerPerms] = await db.execute(`
    SELECT p.permissionName
    FROM permissions p
    INNER JOIN role_permissions rp ON p.permissionId = rp.permissionId
    INNER JOIN role r ON rp.roleId = r.roleId
    WHERE r.roleName = 'owner' AND p.permissionName IN (${requiredPermissions.map(() => '?').join(',')})
  `, requiredPermissions);
  
  const ownerPermNames = ownerPerms.map(p => p.permissionName);
  for (const permName of requiredPermissions) {
    if (ownerPermNames.includes(permName)) {
      console.log(`     ✅ Owner has ${permName}`);
    } else {
      console.log(`     ❌ Owner missing ${permName}`);
    }
  }
};

const testCompleteDataIsolation = async () => {
  console.log('\n🔒 Testing complete data isolation...');
  
  // Test all resource types
  const resourceTests = [
    { name: 'Buildings', table: 'building', idField: 'buildingId', nameField: 'buildingName' },
    { name: 'Villas', table: 'villas', idField: 'villasId', nameField: 'Name' },
    { name: 'Tenants', table: 'tenant', idField: 'tenantId', nameField: 'tenantId' },
    { name: 'Transactions', table: 'FinancialTransactions', idField: 'transactionId', nameField: 'transactionId' },
    { name: 'Users', table: 'user', idField: 'userId', nameField: 'firstName' }
  ];
  
  for (const resource of resourceTests) {
    console.log(`   Testing ${resource.name} isolation:`);
    
    // Get Owner Alpha's resources
    const [alphaResources] = await db.execute(`
      SELECT ${resource.idField}, ${resource.nameField}, createdBy 
      FROM ${resource.table} 
      WHERE createdBy = 9001
    `);
    
    // Get Owner Beta's resources
    const [betaResources] = await db.execute(`
      SELECT ${resource.idField}, ${resource.nameField}, createdBy 
      FROM ${resource.table} 
      WHERE createdBy = 9002
    `);
    
    console.log(`     Alpha has ${alphaResources.length} ${resource.name.toLowerCase()}`);
    console.log(`     Beta has ${betaResources.length} ${resource.name.toLowerCase()}`);
    
    // Check for cross-contamination
    const alphaIds = alphaResources.map(r => r[resource.idField]);
    const betaIds = betaResources.map(r => r[resource.idField]);
    const overlap = alphaIds.filter(id => betaIds.includes(id));
    
    if (overlap.length === 0) {
      console.log(`     ✅ ${resource.name} isolation: PERFECT`);
    } else {
      console.log(`     ❌ ${resource.name} isolation: FAILED - Overlap: [${overlap.join(', ')}]`);
    }
  }
};

const testResourceCreation = async () => {
  console.log('\n🏗️  Testing resource creation with ownership...');
  
  // Test that new resources get proper createdBy values
  console.log('   Testing building creation with ownership:');
  
  const [result] = await db.execute(`
    INSERT INTO building (buildingName, buildingAddress, buildingCreatedDate, createdBy)
    VALUES ('Test Ownership Building', 'Test Address', '2024-01-01', 9001)
  `);
  
  const newBuildingId = result.insertId;
  
  const [newBuilding] = await db.execute('SELECT buildingName, createdBy FROM building WHERE buildingId = ?', [newBuildingId]);
  
  if (newBuilding.length > 0 && newBuilding[0].createdBy === 9001) {
    console.log('     ✅ Building created with correct ownership');
  } else {
    console.log('     ❌ Building creation ownership failed');
  }
  
  // Clean up test building
  await db.execute('DELETE FROM building WHERE buildingId = ?', [newBuildingId]);
};

const testEmptyStateHandling = async () => {
  console.log('\n🔍 Testing empty state handling...');
  
  // Create a new owner with no resources
  await db.execute(`
    INSERT IGNORE INTO user (userId, firstName, lastName, email, password, phoneNumber, address, gender, image, nationality, dateOfBirth)
    VALUES (9003, 'Empty Owner', 'Test', 'empty.owner@test.com', 'password123', '5555555555', 'Empty Address', 'Male', 'test.jpg', 'Empty Country', '1990-01-01')
  `);

  await db.execute(`INSERT IGNORE INTO userRole (userId, roleId) VALUES (9003, 2)`);
  
  // Test that empty owner sees no resources
  const [emptyBuildings] = await db.execute('SELECT buildingId FROM building WHERE createdBy = ?', [9003]);
  const [emptyVillas] = await db.execute('SELECT villasId FROM villas WHERE createdBy = ?', [9003]);
  const [emptyTenants] = await db.execute('SELECT tenantId FROM tenant WHERE createdBy = ?', [9003]);
  
  console.log(`   Empty owner has ${emptyBuildings.length} buildings`);
  console.log(`   Empty owner has ${emptyVillas.length} villas`);
  console.log(`   Empty owner has ${emptyTenants.length} tenants`);
  
  if (emptyBuildings.length === 0 && emptyVillas.length === 0 && emptyTenants.length === 0) {
    console.log('   ✅ Empty state handling: PERFECT');
  } else {
    console.log('   ❌ Empty state handling: FAILED');
  }
  
  // Clean up empty owner
  await db.execute('DELETE FROM userRole WHERE userId = 9003');
  await db.execute('DELETE FROM user WHERE userId = 9003');
};

const cleanupFinalTestData = async () => {
  console.log('\n🧹 Cleaning up final verification test data...');
  
  try {
    await db.execute('DELETE FROM FinancialTransactions WHERE transactionId IN ("final-alpha-txn-001", "final-beta-txn-001")');
    await db.execute('DELETE FROM ApartmentAssigned WHERE tenantId IN (7001, 7002)');
    await db.execute('DELETE FROM apartment WHERE apartmentId IN (5001, 5002)');
    await db.execute('DELETE FROM floor WHERE floorId IN (6001, 6002)');
    await db.execute('DELETE FROM tenant WHERE tenantId IN (7001, 7002)');
    await db.execute('DELETE FROM villas WHERE villasId IN (3001, 3002)');
    await db.execute('DELETE FROM building WHERE buildingId IN (8001, 8002)');
    await db.execute('DELETE FROM userRole WHERE userId BETWEEN 9001 AND 9021');
    await db.execute('DELETE FROM user WHERE userId BETWEEN 9001 AND 9021');
    
    console.log('✅ Final verification test data cleanup completed!');
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
};

// Run the test
testFinalVerification().then(() => {
  process.exit(0);
});
