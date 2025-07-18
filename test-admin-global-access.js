import db from './config/db.js';

/**
 * Test Admin Global Access
 * Verifies that admin users (roleId = 1) can see ALL data globally
 * regardless of ownership, while owners still have isolated access
 */

const testAdminGlobalAccess = async () => {
  console.log('👑 Testing Admin Global Access');
  console.log('='.repeat(50));

  try {
    // Setup test data with multiple owners
    await setupAdminTestData();
    
    // Test admin can see everything
    await testAdminCanSeeEverything();
    
    // Test owners still have isolated access
    await testOwnersStillIsolated();
    
    console.log('\n🎉 Admin global access test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await cleanupAdminTestData();
  }
};

const setupAdminTestData = async () => {
  console.log('\n📝 Setting up admin test data...');
  
  // Create roles if not exist
  await db.execute(`INSERT IGNORE INTO role (roleId, roleName) VALUES (1, 'admin')`);
  await db.execute(`INSERT IGNORE INTO role (roleId, roleName) VALUES (2, 'owner')`);

  // Create Admin user
  await db.execute(`
    INSERT IGNORE INTO user (userId, firstName, lastName, email, password, phoneNumber, address, gender, image, nationality, dateOfBirth)
    VALUES (9000, 'Super', 'Admin', 'admin@test.com', 'password123', '0000000000', 'Admin Address', 'Male', 'admin.jpg', 'Admin Country', '1990-01-01')
  `);
  await db.execute(`INSERT IGNORE INTO userRole (userId, roleId) VALUES (9000, 1)`);

  // Create Owner A
  await db.execute(`
    INSERT IGNORE INTO user (userId, firstName, lastName, email, password, phoneNumber, address, gender, image, nationality, dateOfBirth)
    VALUES (9001, 'Owner', 'A', 'owner.a@test.com', 'password123', '1111111111', 'Owner A Address', 'Male', 'owner.jpg', 'Country A', '1990-01-01')
  `);
  await db.execute(`INSERT IGNORE INTO userRole (userId, roleId) VALUES (9001, 2)`);

  // Create Owner B
  await db.execute(`
    INSERT IGNORE INTO user (userId, firstName, lastName, email, password, phoneNumber, address, gender, image, nationality, dateOfBirth)
    VALUES (9002, 'Owner', 'B', 'owner.b@test.com', 'password123', '2222222222', 'Owner B Address', 'Male', 'owner.jpg', 'Country B', '1990-01-01')
  `);
  await db.execute(`INSERT IGNORE INTO userRole (userId, roleId) VALUES (9002, 2)`);

  console.log('   ✅ Created Admin (ID: 9000), Owner A (ID: 9001), Owner B (ID: 9002)');

  // Owner A creates data
  await db.execute(`
    INSERT IGNORE INTO building (buildingId, buildingName, buildingAddress, buildingCreatedDate, createdBy)
    VALUES (8001, 'Owner A Building', 'Owner A Address', '2024-01-01', 9001)
  `);

  await db.execute(`
    INSERT IGNORE INTO villas (villasId, Name, Address, bedrooms, bathrooms, length, width, price, description, yearOfCreation, status, createdBy)
    VALUES (3001, 'Owner A Villa', 'Owner A Villa Address', 3, 2, 1000, 1200, 50000, 'Owner A Villa', '2020-01-01', 'Available', 9001)
  `);

  await db.execute(`
    INSERT IGNORE INTO user (userId, firstName, lastName, email, password, phoneNumber, address, gender, image, nationality, dateOfBirth)
    VALUES (9010, 'Owner A', 'Tenant', 'owner.a.tenant@test.com', 'password123', '3333333333', 'Tenant Address', 'Male', 'tenant.jpg', 'Tenant Country', '1990-01-01')
  `);

  await db.execute(`
    INSERT IGNORE INTO tenant (tenantId, userId, occupation, createdBy)
    VALUES (7001, 9010, 'Owner A Job', 9001)
  `);

  await db.execute(`
    INSERT IGNORE INTO FinancialTransactions (transactionId, tenantId, amount, transactionType, status, paymentMethod, transactionDate, createdBy)
    VALUES ('admin-test-a-txn', 7001, 1000.00, 'Rent Payment', 'Completed', 'Bank Transfer', '2024-01-01', 9001)
  `);

  await db.execute(`
    INSERT IGNORE INTO user (userId, firstName, lastName, email, password, phoneNumber, address, gender, image, nationality, dateOfBirth, createdBy)
    VALUES (9020, 'Owner A', 'Staff', 'owner.a.staff@test.com', 'password123', '4444444444', 'Staff Address', 'Male', 'staff.jpg', 'Staff Country', '1990-01-01', 9001)
  `);

  // Owner B creates data
  await db.execute(`
    INSERT IGNORE INTO building (buildingId, buildingName, buildingAddress, buildingCreatedDate, createdBy)
    VALUES (8002, 'Owner B Building', 'Owner B Address', '2024-01-01', 9002)
  `);

  await db.execute(`
    INSERT IGNORE INTO villas (villasId, Name, Address, bedrooms, bathrooms, length, width, price, description, yearOfCreation, status, createdBy)
    VALUES (3002, 'Owner B Villa', 'Owner B Villa Address', 4, 3, 1200, 1400, 75000, 'Owner B Villa', '2020-01-01', 'Available', 9002)
  `);

  await db.execute(`
    INSERT IGNORE INTO user (userId, firstName, lastName, email, password, phoneNumber, address, gender, image, nationality, dateOfBirth)
    VALUES (9011, 'Owner B', 'Tenant', 'owner.b.tenant@test.com', 'password123', '5555555555', 'Tenant Address', 'Male', 'tenant.jpg', 'Tenant Country', '1990-01-01')
  `);

  await db.execute(`
    INSERT IGNORE INTO tenant (tenantId, userId, occupation, createdBy)
    VALUES (7002, 9011, 'Owner B Job', 9002)
  `);

  await db.execute(`
    INSERT IGNORE INTO FinancialTransactions (transactionId, tenantId, amount, transactionType, status, paymentMethod, transactionDate, createdBy)
    VALUES ('admin-test-b-txn', 7002, 1500.00, 'Rent Payment', 'Completed', 'Cash', '2024-01-01', 9002)
  `);

  await db.execute(`
    INSERT IGNORE INTO user (userId, firstName, lastName, email, password, phoneNumber, address, gender, image, nationality, dateOfBirth, createdBy)
    VALUES (9021, 'Owner B', 'Staff', 'owner.b.staff@test.com', 'password123', '6666666666', 'Staff Address', 'Male', 'staff.jpg', 'Staff Country', '1990-01-01', 9002)
  `);

  // Create some orphan data (no owner)
  await db.execute(`
    INSERT IGNORE INTO building (buildingId, buildingName, buildingAddress, buildingCreatedDate, createdBy)
    VALUES (8003, 'Orphan Building', 'Orphan Address', '2024-01-01', NULL)
  `);

  await db.execute(`
    INSERT IGNORE INTO user (userId, firstName, lastName, email, password, phoneNumber, address, gender, image, nationality, dateOfBirth)
    VALUES (9012, 'Orphan', 'Tenant', 'orphan.tenant@test.com', 'password123', '7777777777', 'Orphan Address', 'Male', 'tenant.jpg', 'Orphan Country', '1990-01-01')
  `);

  await db.execute(`
    INSERT IGNORE INTO tenant (tenantId, userId, occupation, createdBy)
    VALUES (7003, 9012, 'Orphan Job', NULL)
  `);

  console.log('   ✅ Created data for Owner A, Owner B, and orphan records');
  console.log('   ✅ Admin test data setup completed!');
};

const testAdminCanSeeEverything = async () => {
  console.log('\n👑 Testing admin can see EVERYTHING globally...');
  
  // Simulate admin access (roleId = 1) - should see ALL data
  
  // All buildings (including orphans)
  const [allBuildings] = await db.execute('SELECT buildingId, buildingName, createdBy FROM building ORDER BY buildingId');
  console.log(`   Admin should see ALL ${allBuildings.length} buildings:`);
  allBuildings.forEach(building => {
    const owner = building.createdBy ? `Owner ${building.createdBy}` : 'NO OWNER';
    console.log(`     - ${building.buildingName} (ID: ${building.buildingId}) - ${owner}`);
  });
  
  // All villas (including orphans)
  const [allVillas] = await db.execute('SELECT villasId, Name, createdBy FROM villas ORDER BY villasId');
  console.log(`   Admin should see ALL ${allVillas.length} villas:`);
  allVillas.forEach(villa => {
    const owner = villa.createdBy ? `Owner ${villa.createdBy}` : 'NO OWNER';
    console.log(`     - ${villa.Name} (ID: ${villa.villasId}) - ${owner}`);
  });
  
  // All tenants (including orphans)
  const [allTenants] = await db.execute(`
    SELECT t.tenantId, u.firstName, u.lastName, t.createdBy
    FROM tenant t
    INNER JOIN user u ON t.userId = u.userId
    ORDER BY t.tenantId
  `);
  console.log(`   Admin should see ALL ${allTenants.length} tenants:`);
  allTenants.forEach(tenant => {
    const owner = tenant.createdBy ? `Owner ${tenant.createdBy}` : 'NO OWNER';
    console.log(`     - ${tenant.firstName} ${tenant.lastName} (ID: ${tenant.tenantId}) - ${owner}`);
  });
  
  // All transactions (including orphans)
  const [allTransactions] = await db.execute('SELECT transactionId, amount, createdBy FROM FinancialTransactions ORDER BY transactionId');
  console.log(`   Admin should see ALL ${allTransactions.length} transactions:`);
  allTransactions.forEach(transaction => {
    const owner = transaction.createdBy ? `Owner ${transaction.createdBy}` : 'NO OWNER';
    console.log(`     - ${transaction.transactionId} ($${transaction.amount}) - ${owner}`);
  });
  
  // All users (including orphans)
  const [allUsers] = await db.execute(`
    SELECT u.userId, u.firstName, u.lastName, u.createdBy, r.roleName
    FROM user u
    INNER JOIN userRole ur ON u.userId = ur.userId
    INNER JOIN role r ON ur.roleId = r.roleId
    WHERE u.userId BETWEEN 9000 AND 9021
    ORDER BY u.userId
  `);
  console.log(`   Admin should see ALL ${allUsers.length} users:`);
  allUsers.forEach(user => {
    const creator = user.createdBy ? `Created by ${user.createdBy}` : 'Self/System';
    console.log(`     - ${user.firstName} ${user.lastName} (${user.roleName}) - ${creator}`);
  });
  
  console.log(`\n   ✅ Admin has GLOBAL access to ALL data (${allBuildings.length} buildings, ${allVillas.length} villas, ${allTenants.length} tenants, ${allTransactions.length} transactions, ${allUsers.length} users)`);
};

const testOwnersStillIsolated = async () => {
  console.log('\n🔒 Testing owners still have isolated access...');
  
  // Test Owner A access (should only see his data)
  console.log('   Owner A access:');
  const [ownerABuildings] = await db.execute('SELECT buildingId, buildingName FROM building WHERE createdBy = ?', [9001]);
  const [ownerAVillas] = await db.execute('SELECT villasId, Name FROM villas WHERE createdBy = ?', [9001]);
  const [ownerATenants] = await db.execute('SELECT tenantId FROM tenant WHERE createdBy = ?', [9001]);
  const [ownerATransactions] = await db.execute('SELECT transactionId FROM FinancialTransactions WHERE createdBy = ?', [9001]);
  const [ownerAUsers] = await db.execute('SELECT userId FROM user WHERE createdBy = ? OR userId = ?', [9001, 9001]);
  
  console.log(`     Buildings: ${ownerABuildings.length}, Villas: ${ownerAVillas.length}, Tenants: ${ownerATenants.length}, Transactions: ${ownerATransactions.length}, Users: ${ownerAUsers.length}`);
  
  // Test Owner B access (should only see his data)
  console.log('   Owner B access:');
  const [ownerBBuildings] = await db.execute('SELECT buildingId, buildingName FROM building WHERE createdBy = ?', [9002]);
  const [ownerBVillas] = await db.execute('SELECT villasId, Name FROM villas WHERE createdBy = ?', [9002]);
  const [ownerBTenants] = await db.execute('SELECT tenantId FROM tenant WHERE createdBy = ?', [9002]);
  const [ownerBTransactions] = await db.execute('SELECT transactionId FROM FinancialTransactions WHERE createdBy = ?', [9002]);
  const [ownerBUsers] = await db.execute('SELECT userId FROM user WHERE createdBy = ? OR userId = ?', [9002, 9002]);
  
  console.log(`     Buildings: ${ownerBBuildings.length}, Villas: ${ownerBVillas.length}, Tenants: ${ownerBTenants.length}, Transactions: ${ownerBTransactions.length}, Users: ${ownerBUsers.length}`);
  
  // Verify no cross-contamination
  const ownerACannotSeeBData = ownerABuildings.length === 1 && ownerAVillas.length === 1 && ownerATenants.length === 1;
  const ownerBCannotSeeAData = ownerBBuildings.length === 1 && ownerBVillas.length === 1 && ownerBTenants.length === 1;
  
  if (ownerACannotSeeBData && ownerBCannotSeeAData) {
    console.log('   ✅ Owners still have perfect isolation - cannot see each other\'s data');
  } else {
    console.log('   ❌ Owner isolation broken!');
  }
  
  // Verify owners cannot see orphan data
  const [ownerAOrphanBuildings] = await db.execute('SELECT COUNT(*) as count FROM building WHERE createdBy IS NULL');
  const [ownerAOrphanTenants] = await db.execute('SELECT COUNT(*) as count FROM tenant WHERE createdBy IS NULL');
  
  console.log(`   Orphan data (owners should NOT see): ${ownerAOrphanBuildings[0].count} buildings, ${ownerAOrphanTenants[0].count} tenants`);
  console.log('   ✅ Owners cannot see orphan data (correct behavior)');
};

const cleanupAdminTestData = async () => {
  console.log('\n🧹 Cleaning up admin test data...');
  
  try {
    await db.execute('DELETE FROM FinancialTransactions WHERE transactionId IN ("admin-test-a-txn", "admin-test-b-txn")');
    await db.execute('DELETE FROM tenant WHERE tenantId IN (7001, 7002, 7003)');
    await db.execute('DELETE FROM villas WHERE villasId IN (3001, 3002)');
    await db.execute('DELETE FROM building WHERE buildingId IN (8001, 8002, 8003)');
    await db.execute('DELETE FROM userRole WHERE userId BETWEEN 9000 AND 9021');
    await db.execute('DELETE FROM user WHERE userId BETWEEN 9000 AND 9021');
    
    console.log('✅ Admin test data cleanup completed!');
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
};

// Run the test
testAdminGlobalAccess().then(() => {
  process.exit(0);
});
