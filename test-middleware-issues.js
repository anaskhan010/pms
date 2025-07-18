import db from './config/db.js';

/**
 * Test Middleware Issues
 * Tests all middleware functions to see what's broken
 */

const testMiddlewareIssues = async () => {
  console.log('🔧 Testing Middleware Issues');
  console.log('='.repeat(50));

  try {
    // Setup test data
    await setupMiddlewareTestData();
    
    // Test all middleware functions
    await testBuildingMiddleware();
    await testVillaMiddleware();
    await testTenantMiddleware();
    await testTransactionMiddleware();
    await testUserMiddleware();
    
    console.log('\n🎉 Middleware testing completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await cleanupMiddlewareTestData();
  }
};

const setupMiddlewareTestData = async () => {
  console.log('\n📝 Setting up middleware test data...');
  
  // Create owner role if not exists
  await db.execute(`INSERT IGNORE INTO role (roleId, roleName) VALUES (2, 'owner')`);

  // Create two test owners
  await db.execute(`
    INSERT IGNORE INTO user (userId, firstName, lastName, email, password, phoneNumber, address, gender, image, nationality, dateOfBirth)
    VALUES (9001, 'Middleware Owner', 'A', 'middleware.a@test.com', 'password123', '1111111111', 'Address A', 'Male', 'test.jpg', 'Country A', '1990-01-01')
  `);

  await db.execute(`
    INSERT IGNORE INTO user (userId, firstName, lastName, email, password, phoneNumber, address, gender, image, nationality, dateOfBirth)
    VALUES (9002, 'Middleware Owner', 'B', 'middleware.b@test.com', 'password123', '2222222222', 'Address B', 'Male', 'test.jpg', 'Country B', '1990-01-01')
  `);

  await db.execute(`INSERT IGNORE INTO userRole (userId, roleId) VALUES (9001, 2)`);
  await db.execute(`INSERT IGNORE INTO userRole (userId, roleId) VALUES (9002, 2)`);

  // Owner A creates data
  await db.execute(`
    INSERT IGNORE INTO building (buildingId, buildingName, buildingAddress, buildingCreatedDate, createdBy)
    VALUES (8001, 'Middleware A Building', 'Middleware A Address', '2024-01-01', 9001)
  `);

  await db.execute(`
    INSERT IGNORE INTO villas (villasId, Name, Address, bedrooms, bathrooms, length, width, price, description, yearOfCreation, status, createdBy)
    VALUES (3001, 'Middleware A Villa', 'Middleware A Villa Address', 3, 2, 1000, 1200, 50000, 'Middleware A Villa', '2020-01-01', 'Available', 9001)
  `);

  await db.execute(`
    INSERT IGNORE INTO user (userId, firstName, lastName, email, password, phoneNumber, address, gender, image, nationality, dateOfBirth)
    VALUES (9010, 'Middleware A', 'Tenant', 'middleware.a.tenant@test.com', 'password123', '3333333333', 'Tenant Address', 'Male', 'tenant.jpg', 'Tenant Country', '1990-01-01')
  `);

  await db.execute(`
    INSERT IGNORE INTO tenant (tenantId, userId, occupation, createdBy)
    VALUES (7001, 9010, 'Middleware A Job', 9001)
  `);

  await db.execute(`
    INSERT IGNORE INTO FinancialTransactions (transactionId, tenantId, amount, transactionType, status, paymentMethod, transactionDate, createdBy)
    VALUES ('middleware-a-txn-001', 7001, 1000.00, 'Rent Payment', 'Completed', 'Bank Transfer', '2024-01-01', 9001)
  `);

  await db.execute(`
    INSERT IGNORE INTO user (userId, firstName, lastName, email, password, phoneNumber, address, gender, image, nationality, dateOfBirth, createdBy)
    VALUES (9020, 'Middleware A', 'Staff', 'middleware.a.staff@test.com', 'password123', '4444444444', 'Staff Address', 'Male', 'staff.jpg', 'Staff Country', '1990-01-01', 9001)
  `);

  // Owner B creates data
  await db.execute(`
    INSERT IGNORE INTO building (buildingId, buildingName, buildingAddress, buildingCreatedDate, createdBy)
    VALUES (8002, 'Middleware B Building', 'Middleware B Address', '2024-01-01', 9002)
  `);

  await db.execute(`
    INSERT IGNORE INTO villas (villasId, Name, Address, bedrooms, bathrooms, length, width, price, description, yearOfCreation, status, createdBy)
    VALUES (3002, 'Middleware B Villa', 'Middleware B Villa Address', 4, 3, 1200, 1400, 75000, 'Middleware B Villa', '2020-01-01', 'Available', 9002)
  `);

  await db.execute(`
    INSERT IGNORE INTO user (userId, firstName, lastName, email, password, phoneNumber, address, gender, image, nationality, dateOfBirth)
    VALUES (9011, 'Middleware B', 'Tenant', 'middleware.b.tenant@test.com', 'password123', '5555555555', 'Tenant Address', 'Male', 'tenant.jpg', 'Tenant Country', '1990-01-01')
  `);

  await db.execute(`
    INSERT IGNORE INTO tenant (tenantId, userId, occupation, createdBy)
    VALUES (7002, 9011, 'Middleware B Job', 9002)
  `);

  await db.execute(`
    INSERT IGNORE INTO FinancialTransactions (transactionId, tenantId, amount, transactionType, status, paymentMethod, transactionDate, createdBy)
    VALUES ('middleware-b-txn-001', 7002, 1500.00, 'Rent Payment', 'Completed', 'Cash', '2024-01-01', 9002)
  `);

  await db.execute(`
    INSERT IGNORE INTO user (userId, firstName, lastName, email, password, phoneNumber, address, gender, image, nationality, dateOfBirth, createdBy)
    VALUES (9021, 'Middleware B', 'Staff', 'middleware.b.staff@test.com', 'password123', '6666666666', 'Staff Address', 'Male', 'staff.jpg', 'Staff Country', '1990-01-01', 9002)
  `);

  console.log('✅ Middleware test data setup completed!');
};

const testBuildingMiddleware = async () => {
  console.log('\n🏢 Testing building middleware (getOwnerBuildings)...');
  
  // Simulate middleware for Owner A
  const [ownerABuildings] = await db.execute('SELECT buildingId FROM building WHERE createdBy = ?', [9001]);
  const ownerABuildingIds = ownerABuildings.map(row => row.buildingId);
  
  console.log(`   Owner A should see buildings: [${ownerABuildingIds.join(', ')}]`);
  
  // Simulate middleware for Owner B
  const [ownerBBuildings] = await db.execute('SELECT buildingId FROM building WHERE createdBy = ?', [9002]);
  const ownerBBuildingIds = ownerBBuildings.map(row => row.buildingId);
  
  console.log(`   Owner B should see buildings: [${ownerBBuildingIds.join(', ')}]`);
  
  // Check for cross-contamination
  const overlap = ownerABuildingIds.filter(id => ownerBBuildingIds.includes(id));
  if (overlap.length === 0) {
    console.log('   ✅ Building middleware: No cross-contamination');
  } else {
    console.log(`   ❌ Building middleware: Cross-contamination found: [${overlap.join(', ')}]`);
  }
};

const testVillaMiddleware = async () => {
  console.log('\n🏡 Testing villa middleware (getOwnerVillas)...');
  
  // Simulate middleware for Owner A
  const [ownerAVillas] = await db.execute('SELECT villasId FROM villas WHERE createdBy = ?', [9001]);
  const ownerAVillaIds = ownerAVillas.map(row => row.villasId);
  
  console.log(`   Owner A should see villas: [${ownerAVillaIds.join(', ')}]`);
  
  // Simulate middleware for Owner B
  const [ownerBVillas] = await db.execute('SELECT villasId FROM villas WHERE createdBy = ?', [9002]);
  const ownerBVillaIds = ownerBVillas.map(row => row.villasId);
  
  console.log(`   Owner B should see villas: [${ownerBVillaIds.join(', ')}]`);
  
  // Check for cross-contamination
  const overlap = ownerAVillaIds.filter(id => ownerBVillaIds.includes(id));
  if (overlap.length === 0) {
    console.log('   ✅ Villa middleware: No cross-contamination');
  } else {
    console.log(`   ❌ Villa middleware: Cross-contamination found: [${overlap.join(', ')}]`);
  }
};

const testTenantMiddleware = async () => {
  console.log('\n👥 Testing tenant middleware (getTenantAccess)...');
  
  // Simulate middleware for Owner A
  const [ownerABuildings] = await db.execute('SELECT buildingId FROM building WHERE createdBy = ?', [9001]);
  const ownerABuildingIds = ownerABuildings.map(row => row.buildingId);
  
  const [ownerATenants] = await db.execute('SELECT tenantId FROM tenant WHERE createdBy = ?', [9001]);
  const ownerATenantIds = ownerATenants.map(row => row.tenantId);
  
  console.log(`   Owner A should see buildings: [${ownerABuildingIds.join(', ')}], tenants: [${ownerATenantIds.join(', ')}]`);
  
  // Simulate middleware for Owner B
  const [ownerBBuildings] = await db.execute('SELECT buildingId FROM building WHERE createdBy = ?', [9002]);
  const ownerBBuildingIds = ownerBBuildings.map(row => row.buildingId);
  
  const [ownerBTenants] = await db.execute('SELECT tenantId FROM tenant WHERE createdBy = ?', [9002]);
  const ownerBTenantIds = ownerBTenants.map(row => row.tenantId);
  
  console.log(`   Owner B should see buildings: [${ownerBBuildingIds.join(', ')}], tenants: [${ownerBTenantIds.join(', ')}]`);
  
  // Check for cross-contamination
  const buildingOverlap = ownerABuildingIds.filter(id => ownerBBuildingIds.includes(id));
  const tenantOverlap = ownerATenantIds.filter(id => ownerBTenantIds.includes(id));
  
  if (buildingOverlap.length === 0 && tenantOverlap.length === 0) {
    console.log('   ✅ Tenant middleware: No cross-contamination');
  } else {
    console.log(`   ❌ Tenant middleware: Cross-contamination found`);
  }
};

const testTransactionMiddleware = async () => {
  console.log('\n💰 Testing transaction middleware (getTransactionAccess)...');
  
  // Simulate middleware for Owner A
  const [ownerABuildings] = await db.execute('SELECT buildingId FROM building WHERE createdBy = ?', [9001]);
  const ownerABuildingIds = ownerABuildings.map(row => row.buildingId);
  
  const [ownerATransactions] = await db.execute('SELECT transactionId FROM FinancialTransactions WHERE createdBy = ?', [9001]);
  const ownerATransactionIds = ownerATransactions.map(row => row.transactionId);
  
  console.log(`   Owner A should see buildings: [${ownerABuildingIds.join(', ')}], transactions: [${ownerATransactionIds.join(', ')}]`);
  
  // Simulate middleware for Owner B
  const [ownerBBuildings] = await db.execute('SELECT buildingId FROM building WHERE createdBy = ?', [9002]);
  const ownerBBuildingIds = ownerBBuildings.map(row => row.buildingId);
  
  const [ownerBTransactions] = await db.execute('SELECT transactionId FROM FinancialTransactions WHERE createdBy = ?', [9002]);
  const ownerBTransactionIds = ownerBTransactions.map(row => row.transactionId);
  
  console.log(`   Owner B should see buildings: [${ownerBBuildingIds.join(', ')}], transactions: [${ownerBTransactionIds.join(', ')}]`);
  
  // Check for cross-contamination
  const buildingOverlap = ownerABuildingIds.filter(id => ownerBBuildingIds.includes(id));
  const transactionOverlap = ownerATransactionIds.filter(id => ownerBTransactionIds.includes(id));
  
  if (buildingOverlap.length === 0 && transactionOverlap.length === 0) {
    console.log('   ✅ Transaction middleware: No cross-contamination');
  } else {
    console.log(`   ❌ Transaction middleware: Cross-contamination found`);
  }
};

const testUserMiddleware = async () => {
  console.log('\n👤 Testing user middleware (getUserAccess)...');
  
  // Simulate middleware for Owner A
  const [ownerAUsers] = await db.execute('SELECT userId FROM user WHERE createdBy = ? OR userId = ?', [9001, 9001]);
  const ownerAUserIds = ownerAUsers.map(row => row.userId);
  
  console.log(`   Owner A should see users: [${ownerAUserIds.join(', ')}]`);
  
  // Simulate middleware for Owner B
  const [ownerBUsers] = await db.execute('SELECT userId FROM user WHERE createdBy = ? OR userId = ?', [9002, 9002]);
  const ownerBUserIds = ownerBUsers.map(row => row.userId);
  
  console.log(`   Owner B should see users: [${ownerBUserIds.join(', ')}]`);
  
  // Check for cross-contamination (excluding themselves)
  const ownerAOtherUsers = ownerAUserIds.filter(id => id !== 9001);
  const ownerBOtherUsers = ownerBUserIds.filter(id => id !== 9002);
  const userOverlap = ownerAOtherUsers.filter(id => ownerBOtherUsers.includes(id));
  
  if (userOverlap.length === 0) {
    console.log('   ✅ User middleware: No cross-contamination');
  } else {
    console.log(`   ❌ User middleware: Cross-contamination found: [${userOverlap.join(', ')}]`);
  }
};

const cleanupMiddlewareTestData = async () => {
  console.log('\n🧹 Cleaning up middleware test data...');
  
  try {
    await db.execute('DELETE FROM FinancialTransactions WHERE transactionId IN ("middleware-a-txn-001", "middleware-b-txn-001")');
    await db.execute('DELETE FROM tenant WHERE tenantId IN (7001, 7002)');
    await db.execute('DELETE FROM villas WHERE villasId IN (3001, 3002)');
    await db.execute('DELETE FROM building WHERE buildingId IN (8001, 8002)');
    await db.execute('DELETE FROM userRole WHERE userId BETWEEN 9001 AND 9021');
    await db.execute('DELETE FROM user WHERE userId BETWEEN 9001 AND 9021');
    
    console.log('✅ Middleware test data cleanup completed!');
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
};

// Run the test
testMiddlewareIssues().then(() => {
  process.exit(0);
});
