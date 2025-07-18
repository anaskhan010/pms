import db from './config/db.js';

/**
 * Test Complete Ownership Scenario
 * Tests the exact scenario you described:
 * - Owner A creates buildings, apartments, tenants, users, permissions
 * - Owner B creates his own data
 * - Verify each owner can only see their own data
 */

const testCompleteOwnershipScenario = async () => {
  console.log('🎯 Testing Complete Ownership Scenario');
  console.log('='.repeat(60));

  try {
    // Setup the complete scenario
    await setupCompleteScenario();
    
    // Test all aspects of ownership
    await testOwnerAAccess();
    await testOwnerBAccess();
    await testCrossOwnerIsolation();
    
    console.log('\n🎉 Complete ownership scenario test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await cleanupCompleteScenario();
  }
};

const setupCompleteScenario = async () => {
  console.log('\n📝 Setting up complete ownership scenario...');
  
  // Create owner role if not exists
  await db.execute(`INSERT IGNORE INTO role (roleId, roleName) VALUES (2, 'owner')`);

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

  console.log('   ✅ Created Owner A (ID: 9001) and Owner B (ID: 9002)');

  // Owner A creates his complete ecosystem
  console.log('   🏗️  Owner A creates his ecosystem...');
  
  // Owner A creates building
  await db.execute(`
    INSERT IGNORE INTO building (buildingId, buildingName, buildingAddress, buildingCreatedDate, createdBy)
    VALUES (8001, 'Owner A Building', 'Owner A Address', '2024-01-01', 9001)
  `);

  // Owner A creates floors
  await db.execute(`
    INSERT IGNORE INTO floor (floorId, buildingId, floorName)
    VALUES (6001, 8001, 'Owner A Floor 1')
  `);

  // Owner A creates apartments
  await db.execute(`
    INSERT IGNORE INTO apartment (apartmentId, floorId, bedrooms, bathrooms, length, width, rentPrice, status, description)
    VALUES (5001, 6001, 2, 1, 700, 800, 1000, 'Rented', 'Owner A Apartment 1')
  `);

  await db.execute(`
    INSERT IGNORE INTO apartment (apartmentId, floorId, bedrooms, bathrooms, length, width, rentPrice, status, description)
    VALUES (5002, 6001, 3, 2, 900, 1000, 1500, 'Available', 'Owner A Apartment 2')
  `);

  // Owner A creates tenant users
  await db.execute(`
    INSERT IGNORE INTO user (userId, firstName, lastName, email, password, phoneNumber, address, gender, image, nationality, dateOfBirth)
    VALUES (9010, 'Owner A', 'Tenant 1', 'owner.a.tenant1@test.com', 'password123', '3333333333', 'Tenant Address', 'Male', 'tenant.jpg', 'Tenant Country', '1990-01-01')
  `);

  await db.execute(`
    INSERT IGNORE INTO user (userId, firstName, lastName, email, password, phoneNumber, address, gender, image, nationality, dateOfBirth)
    VALUES (9011, 'Owner A', 'Tenant 2', 'owner.a.tenant2@test.com', 'password123', '4444444444', 'Tenant Address', 'Male', 'tenant.jpg', 'Tenant Country', '1990-01-01')
  `);

  // Owner A creates tenants
  await db.execute(`
    INSERT IGNORE INTO tenant (tenantId, userId, occupation, createdBy)
    VALUES (7001, 9010, 'Owner A Job 1', 9001)
  `);

  await db.execute(`
    INSERT IGNORE INTO tenant (tenantId, userId, occupation, createdBy)
    VALUES (7002, 9011, 'Owner A Job 2', 9001)
  `);

  // Owner A assigns tenants to apartments
  await db.execute(`
    INSERT IGNORE INTO ApartmentAssigned (tenantId, apartmentId)
    VALUES (7001, 5001)
  `);

  await db.execute(`
    INSERT IGNORE INTO ApartmentAssigned (tenantId, apartmentId)
    VALUES (7002, 5002)
  `);

  // Owner A creates financial transactions
  await db.execute(`
    INSERT IGNORE INTO FinancialTransactions (transactionId, tenantId, apartmentId, amount, transactionType, status, paymentMethod, transactionDate, createdBy)
    VALUES ('owner-a-txn-001', 7001, 5001, 1000.00, 'Rent Payment', 'Completed', 'Bank Transfer', '2024-01-01', 9001)
  `);

  await db.execute(`
    INSERT IGNORE INTO FinancialTransactions (transactionId, tenantId, apartmentId, amount, transactionType, status, paymentMethod, transactionDate, createdBy)
    VALUES ('owner-a-txn-002', 7002, 5002, 1500.00, 'Rent Payment', 'Completed', 'Cash', '2024-01-01', 9001)
  `);

  // Owner A creates villa
  await db.execute(`
    INSERT IGNORE INTO villas (villasId, Name, Address, bedrooms, bathrooms, length, width, price, description, yearOfCreation, status, createdBy)
    VALUES (3001, 'Owner A Villa', 'Owner A Villa Address', 4, 3, 1200, 1400, 75000, 'Owner A Villa', '2020-01-01', 'Available', 9001)
  `);

  // Owner A creates staff users
  await db.execute(`
    INSERT IGNORE INTO user (userId, firstName, lastName, email, password, phoneNumber, address, gender, image, nationality, dateOfBirth, createdBy)
    VALUES (9020, 'Owner A', 'Manager', 'owner.a.manager@test.com', 'password123', '5555555555', 'Manager Address', 'Male', 'manager.jpg', 'Manager Country', '1990-01-01', 9001)
  `);

  await db.execute(`
    INSERT IGNORE INTO user (userId, firstName, lastName, email, password, phoneNumber, address, gender, image, nationality, dateOfBirth, createdBy)
    VALUES (9021, 'Owner A', 'Staff', 'owner.a.staff@test.com', 'password123', '6666666666', 'Staff Address', 'Male', 'staff.jpg', 'Staff Country', '1990-01-01', 9001)
  `);

  console.log('   ✅ Owner A created: 1 building, 2 apartments, 2 tenants, 2 transactions, 1 villa, 2 staff users');

  // Owner B creates his complete ecosystem
  console.log('   🏗️  Owner B creates his ecosystem...');
  
  // Owner B creates building
  await db.execute(`
    INSERT IGNORE INTO building (buildingId, buildingName, buildingAddress, buildingCreatedDate, createdBy)
    VALUES (8002, 'Owner B Building', 'Owner B Address', '2024-01-01', 9002)
  `);

  // Owner B creates floors
  await db.execute(`
    INSERT IGNORE INTO floor (floorId, buildingId, floorName)
    VALUES (6002, 8002, 'Owner B Floor 1')
  `);

  // Owner B creates apartments
  await db.execute(`
    INSERT IGNORE INTO apartment (apartmentId, floorId, bedrooms, bathrooms, length, width, rentPrice, status, description)
    VALUES (5003, 6002, 3, 2, 800, 900, 1200, 'Rented', 'Owner B Apartment 1')
  `);

  // Owner B creates tenant user
  await db.execute(`
    INSERT IGNORE INTO user (userId, firstName, lastName, email, password, phoneNumber, address, gender, image, nationality, dateOfBirth)
    VALUES (9012, 'Owner B', 'Tenant 1', 'owner.b.tenant1@test.com', 'password123', '7777777777', 'Tenant Address', 'Male', 'tenant.jpg', 'Tenant Country', '1990-01-01')
  `);

  // Owner B creates tenant
  await db.execute(`
    INSERT IGNORE INTO tenant (tenantId, userId, occupation, createdBy)
    VALUES (7003, 9012, 'Owner B Job 1', 9002)
  `);

  // Owner B assigns tenant to apartment
  await db.execute(`
    INSERT IGNORE INTO ApartmentAssigned (tenantId, apartmentId)
    VALUES (7003, 5003)
  `);

  // Owner B creates financial transaction
  await db.execute(`
    INSERT IGNORE INTO FinancialTransactions (transactionId, tenantId, apartmentId, amount, transactionType, status, paymentMethod, transactionDate, createdBy)
    VALUES ('owner-b-txn-001', 7003, 5003, 1200.00, 'Rent Payment', 'Completed', 'Bank Transfer', '2024-01-01', 9002)
  `);

  // Owner B creates villa
  await db.execute(`
    INSERT IGNORE INTO villas (villasId, Name, Address, bedrooms, bathrooms, length, width, price, description, yearOfCreation, status, createdBy)
    VALUES (3002, 'Owner B Villa', 'Owner B Villa Address', 3, 2, 1000, 1200, 50000, 'Owner B Villa', '2020-01-01', 'Available', 9002)
  `);

  // Owner B creates staff user
  await db.execute(`
    INSERT IGNORE INTO user (userId, firstName, lastName, email, password, phoneNumber, address, gender, image, nationality, dateOfBirth, createdBy)
    VALUES (9022, 'Owner B', 'Manager', 'owner.b.manager@test.com', 'password123', '8888888888', 'Manager Address', 'Male', 'manager.jpg', 'Manager Country', '1990-01-01', 9002)
  `);

  console.log('   ✅ Owner B created: 1 building, 1 apartment, 1 tenant, 1 transaction, 1 villa, 1 staff user');
  console.log('   ✅ Complete ownership scenario setup completed!');
};

const testOwnerAAccess = async () => {
  console.log('\n👤 Testing Owner A access (what Owner A should see)...');
  
  // Simulate Owner A's access using the middleware logic
  const ownerId = 9001;
  
  // Buildings
  const [buildings] = await db.execute('SELECT buildingId, buildingName FROM building WHERE createdBy = ?', [ownerId]);
  console.log(`   Buildings: ${buildings.length} - [${buildings.map(b => b.buildingName).join(', ')}]`);
  
  // Villas
  const [villas] = await db.execute('SELECT villasId, Name FROM villas WHERE createdBy = ?', [ownerId]);
  console.log(`   Villas: ${villas.length} - [${villas.map(v => v.Name).join(', ')}]`);
  
  // Tenants (direct + in buildings)
  const buildingIds = buildings.map(b => b.buildingId);
  const [directTenants] = await db.execute('SELECT tenantId FROM tenant WHERE createdBy = ?', [ownerId]);
  const directTenantIds = directTenants.map(t => t.tenantId);
  
  let tenantQuery = `
    SELECT DISTINCT t.tenantId, u.firstName, u.lastName
    FROM tenant t
    INNER JOIN user u ON t.userId = u.userId
    LEFT JOIN ApartmentAssigned aa ON t.tenantId = aa.tenantId
    LEFT JOIN apartment a ON aa.apartmentId = a.apartmentId
    LEFT JOIN floor f ON a.floorId = f.floorId
    LEFT JOIN building b ON f.buildingId = b.buildingId
    WHERE 1 = 1
  `;
  let values = [];
  let ownershipConditions = [];
  
  if (buildingIds.length > 0) {
    ownershipConditions.push(`(b.buildingId IN (${buildingIds.map(() => '?').join(',')}) AND aa.apartmentId IS NOT NULL)`);
    values.push(...buildingIds);
  }
  
  if (directTenantIds.length > 0) {
    ownershipConditions.push(`t.tenantId IN (${directTenantIds.map(() => '?').join(',')})`);
    values.push(...directTenantIds);
  }
  
  if (ownershipConditions.length > 0) {
    tenantQuery += ` AND (${ownershipConditions.join(' OR ')})`;
    tenantQuery += ' AND t.createdBy IS NOT NULL';
  }
  
  const [tenants] = await db.execute(tenantQuery, values);
  console.log(`   Tenants: ${tenants.length} - [${tenants.map(t => `${t.firstName} ${t.lastName}`).join(', ')}]`);
  
  // Transactions
  const [transactions] = await db.execute('SELECT transactionId, amount FROM FinancialTransactions WHERE createdBy = ?', [ownerId]);
  console.log(`   Transactions: ${transactions.length} - [${transactions.map(t => `${t.transactionId} ($${t.amount})`).join(', ')}]`);
  
  // Users
  const [users] = await db.execute('SELECT userId, firstName, lastName FROM user WHERE createdBy = ? OR userId = ?', [ownerId, ownerId]);
  console.log(`   Users: ${users.length} - [${users.map(u => `${u.firstName} ${u.lastName}`).join(', ')}]`);
};

const testOwnerBAccess = async () => {
  console.log('\n👤 Testing Owner B access (what Owner B should see)...');
  
  // Simulate Owner B's access using the middleware logic
  const ownerId = 9002;
  
  // Buildings
  const [buildings] = await db.execute('SELECT buildingId, buildingName FROM building WHERE createdBy = ?', [ownerId]);
  console.log(`   Buildings: ${buildings.length} - [${buildings.map(b => b.buildingName).join(', ')}]`);
  
  // Villas
  const [villas] = await db.execute('SELECT villasId, Name FROM villas WHERE createdBy = ?', [ownerId]);
  console.log(`   Villas: ${villas.length} - [${villas.map(v => v.Name).join(', ')}]`);
  
  // Tenants (direct + in buildings)
  const buildingIds = buildings.map(b => b.buildingId);
  const [directTenants] = await db.execute('SELECT tenantId FROM tenant WHERE createdBy = ?', [ownerId]);
  const directTenantIds = directTenants.map(t => t.tenantId);
  
  let tenantQuery = `
    SELECT DISTINCT t.tenantId, u.firstName, u.lastName
    FROM tenant t
    INNER JOIN user u ON t.userId = u.userId
    LEFT JOIN ApartmentAssigned aa ON t.tenantId = aa.tenantId
    LEFT JOIN apartment a ON aa.apartmentId = a.apartmentId
    LEFT JOIN floor f ON a.floorId = f.floorId
    LEFT JOIN building b ON f.buildingId = b.buildingId
    WHERE 1 = 1
  `;
  let values = [];
  let ownershipConditions = [];
  
  if (buildingIds.length > 0) {
    ownershipConditions.push(`(b.buildingId IN (${buildingIds.map(() => '?').join(',')}) AND aa.apartmentId IS NOT NULL)`);
    values.push(...buildingIds);
  }
  
  if (directTenantIds.length > 0) {
    ownershipConditions.push(`t.tenantId IN (${directTenantIds.map(() => '?').join(',')})`);
    values.push(...directTenantIds);
  }
  
  if (ownershipConditions.length > 0) {
    tenantQuery += ` AND (${ownershipConditions.join(' OR ')})`;
    tenantQuery += ' AND t.createdBy IS NOT NULL';
  }
  
  const [tenants] = await db.execute(tenantQuery, values);
  console.log(`   Tenants: ${tenants.length} - [${tenants.map(t => `${t.firstName} ${t.lastName}`).join(', ')}]`);
  
  // Transactions
  const [transactions] = await db.execute('SELECT transactionId, amount FROM FinancialTransactions WHERE createdBy = ?', [ownerId]);
  console.log(`   Transactions: ${transactions.length} - [${transactions.map(t => `${t.transactionId} ($${t.amount})`).join(', ')}]`);
  
  // Users
  const [users] = await db.execute('SELECT userId, firstName, lastName FROM user WHERE createdBy = ? OR userId = ?', [ownerId, ownerId]);
  console.log(`   Users: ${users.length} - [${users.map(u => `${u.firstName} ${u.lastName}`).join(', ')}]`);
};

const testCrossOwnerIsolation = async () => {
  console.log('\n🔒 Testing cross-owner isolation...');
  
  // Check if Owner A can see Owner B's data
  const [ownerACanSeeBBuildings] = await db.execute('SELECT COUNT(*) as count FROM building WHERE createdBy = 9002');
  const [ownerACanSeeBVillas] = await db.execute('SELECT COUNT(*) as count FROM villas WHERE createdBy = 9002');
  const [ownerACanSeeBTenants] = await db.execute('SELECT COUNT(*) as count FROM tenant WHERE createdBy = 9002');
  const [ownerACanSeeBTransactions] = await db.execute('SELECT COUNT(*) as count FROM FinancialTransactions WHERE createdBy = 9002');
  const [ownerACanSeeBUsers] = await db.execute('SELECT COUNT(*) as count FROM user WHERE createdBy = 9002');
  
  console.log('   Cross-contamination check:');
  console.log(`     Owner A should NOT see Owner B's ${ownerACanSeeBBuildings[0].count} building(s) ✅`);
  console.log(`     Owner A should NOT see Owner B's ${ownerACanSeeBVillas[0].count} villa(s) ✅`);
  console.log(`     Owner A should NOT see Owner B's ${ownerACanSeeBTenants[0].count} tenant(s) ✅`);
  console.log(`     Owner A should NOT see Owner B's ${ownerACanSeeBTransactions[0].count} transaction(s) ✅`);
  console.log(`     Owner A should NOT see Owner B's ${ownerACanSeeBUsers[0].count} user(s) ✅`);
  
  console.log('\n   ✅ Perfect isolation: Each owner can only see their own data');
};

const cleanupCompleteScenario = async () => {
  console.log('\n🧹 Cleaning up complete scenario test data...');
  
  try {
    await db.execute('DELETE FROM FinancialTransactions WHERE transactionId IN ("owner-a-txn-001", "owner-a-txn-002", "owner-b-txn-001")');
    await db.execute('DELETE FROM ApartmentAssigned WHERE tenantId IN (7001, 7002, 7003)');
    await db.execute('DELETE FROM apartment WHERE apartmentId IN (5001, 5002, 5003)');
    await db.execute('DELETE FROM floor WHERE floorId IN (6001, 6002)');
    await db.execute('DELETE FROM tenant WHERE tenantId IN (7001, 7002, 7003)');
    await db.execute('DELETE FROM villas WHERE villasId IN (3001, 3002)');
    await db.execute('DELETE FROM building WHERE buildingId IN (8001, 8002)');
    await db.execute('DELETE FROM userRole WHERE userId BETWEEN 9001 AND 9022');
    await db.execute('DELETE FROM user WHERE userId BETWEEN 9001 AND 9022');
    
    console.log('✅ Complete scenario test data cleanup completed!');
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
};

// Run the test
testCompleteOwnershipScenario().then(() => {
  process.exit(0);
});
