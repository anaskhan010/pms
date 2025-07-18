import db from './config/db.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Data Isolation Test Script
 * Tests that Owner A cannot access Owner B's data and vice versa
 */

const testDataIsolation = async () => {
  console.log('🔒 Starting Data Isolation Test...\n');

  try {
    // Step 1: Create test users and roles
    console.log('📝 Step 1: Setting up test data...');
    
    // Create owner role if not exists
    const [ownerRole] = await db.execute(`
      INSERT IGNORE INTO role (roleId, roleName) VALUES (2, 'owner')
    `);

    // Create two test owner users
    const ownerA = {
      userId: 9001,
      firstName: 'Owner',
      lastName: 'A',
      email: 'owner.a@test.com',
      password: 'password123',
      phoneNumber: '1234567890'
    };

    const ownerB = {
      userId: 9002,
      firstName: 'Owner',
      lastName: 'B',
      email: 'owner.b@test.com',
      password: 'password123',
      phoneNumber: '0987654321'
    };

    // Insert test users
    await db.execute(`
      INSERT IGNORE INTO user (userId, firstName, lastName, email, password, phoneNumber)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [ownerA.userId, ownerA.firstName, ownerA.lastName, ownerA.email, ownerA.password, ownerA.phoneNumber]);

    await db.execute(`
      INSERT IGNORE INTO user (userId, firstName, lastName, email, password, phoneNumber)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [ownerB.userId, ownerB.firstName, ownerB.lastName, ownerB.email, ownerB.password, ownerB.phoneNumber]);

    // Assign owner role to both users
    await db.execute(`
      INSERT IGNORE INTO userRole (userId, roleId) VALUES (?, 2)
    `, [ownerA.userId]);

    await db.execute(`
      INSERT IGNORE INTO userRole (userId, roleId) VALUES (?, 2)
    `, [ownerB.userId]);

    // Step 2: Create test buildings
    console.log('🏢 Step 2: Creating test buildings...');
    
    const buildingA = {
      buildingId: 8001,
      buildingName: 'Building A',
      buildingAddress: 'Address A'
    };

    const buildingB = {
      buildingId: 8002,
      buildingName: 'Building B',
      buildingAddress: 'Address B'
    };

    await db.execute(`
      INSERT IGNORE INTO building (buildingId, buildingName, buildingAddress)
      VALUES (?, ?, ?)
    `, [buildingA.buildingId, buildingA.buildingName, buildingA.buildingAddress]);

    await db.execute(`
      INSERT IGNORE INTO building (buildingId, buildingName, buildingAddress)
      VALUES (?, ?, ?)
    `, [buildingB.buildingId, buildingB.buildingName, buildingB.buildingAddress]);

    // Step 3: Assign buildings to owners
    console.log('🔗 Step 3: Assigning buildings to owners...');
    
    await db.execute(`
      INSERT IGNORE INTO buildingAssigned (userId, buildingId)
      VALUES (?, ?)
    `, [ownerA.userId, buildingA.buildingId]);

    await db.execute(`
      INSERT IGNORE INTO buildingAssigned (userId, buildingId)
      VALUES (?, ?)
    `, [ownerB.userId, buildingB.buildingId]);

    // Step 4: Create test tenants
    console.log('👥 Step 4: Creating test tenants...');
    
    // Create user accounts for tenants
    await db.execute(`
      INSERT IGNORE INTO user (userId, firstName, lastName, email, password, phoneNumber)
      VALUES (9003, 'Tenant', 'A', 'tenant.a@test.com', 'password123', '1111111111')
    `);

    await db.execute(`
      INSERT IGNORE INTO user (userId, firstName, lastName, email, password, phoneNumber)
      VALUES (9004, 'Tenant', 'B', 'tenant.b@test.com', 'password123', '2222222222')
    `);

    // Create tenant records
    await db.execute(`
      INSERT IGNORE INTO tenant (tenantId, userId, occupation)
      VALUES (7001, 9003, 'Job A')
    `);

    await db.execute(`
      INSERT IGNORE INTO tenant (tenantId, userId, occupation)
      VALUES (7002, 9004, 'Job B')
    `);

    // Step 5: Create floors and apartments
    console.log('🏠 Step 5: Creating floors and apartments...');
    
    // Create floors
    await db.execute(`
      INSERT IGNORE INTO floor (floorId, buildingId, floorName)
      VALUES (6001, ?, 'Floor 1')
    `, [buildingA.buildingId]);

    await db.execute(`
      INSERT IGNORE INTO floor (floorId, buildingId, floorName)
      VALUES (6002, ?, 'Floor 1')
    `, [buildingB.buildingId]);

    // Create apartments
    await db.execute(`
      INSERT IGNORE INTO apartment (apartmentId, floorId, bedrooms, bathrooms, length, width, rentPrice, status, description)
      VALUES (5001, 6001, 2, 1, 700, 800, 1000, 'Rented', 'Test Apartment A1')
    `);

    await db.execute(`
      INSERT IGNORE INTO apartment (apartmentId, floorId, bedrooms, bathrooms, length, width, rentPrice, status, description)
      VALUES (5002, 6002, 3, 2, 900, 1000, 1500, 'Rented', 'Test Apartment B1')
    `);

    // Assign tenants to apartments
    await db.execute(`
      INSERT IGNORE INTO ApartmentAssigned (tenantId, apartmentId)
      VALUES (7001, 5001)
    `);

    await db.execute(`
      INSERT IGNORE INTO ApartmentAssigned (tenantId, apartmentId)
      VALUES (7002, 5002)
    `);

    // Step 6: Create test financial transactions
    console.log('💰 Step 6: Creating test financial transactions...');
    
    await db.execute(`
      INSERT IGNORE INTO FinancialTransactions (transactionId, tenantId, apartmentId, amount, transactionType, status, paymentMethod, transactionDate)
      VALUES ('test-txn-4001', 7001, 5001, 1000.00, 'Rent Payment', 'Completed', 'Bank Transfer', '2024-01-01')
    `);

    await db.execute(`
      INSERT IGNORE INTO FinancialTransactions (transactionId, tenantId, apartmentId, amount, transactionType, status, paymentMethod, transactionDate)
      VALUES ('test-txn-4002', 7002, 5002, 1500.00, 'Rent Payment', 'Completed', 'Cash', '2024-01-01')
    `);

    console.log('✅ Test data setup completed!\n');

    // Step 7: Test data isolation
    console.log('🧪 Step 7: Testing data isolation...\n');

    // Test building access
    await testBuildingIsolation(ownerA.userId, ownerB.userId);
    
    // Test tenant access
    await testTenantIsolation(ownerA.userId, ownerB.userId);
    
    // Test financial transaction access
    await testTransactionIsolation(ownerA.userId, ownerB.userId);
    
    // Test user management isolation
    await testUserManagementIsolation(ownerA.userId, ownerB.userId);

    console.log('\n🎉 Data isolation test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

const testBuildingIsolation = async (ownerAId, ownerBId) => {
  console.log('🏢 Testing building data isolation...');

  // Get buildings assigned to Owner A
  const [ownerABuildings] = await db.execute(`
    SELECT buildingId FROM buildingAssigned WHERE userId = ?
  `, [ownerAId]);

  // Get buildings assigned to Owner B
  const [ownerBBuildings] = await db.execute(`
    SELECT buildingId FROM buildingAssigned WHERE userId = ?
  `, [ownerBId]);

  console.log(`   Owner A has access to ${ownerABuildings.length} building(s): [${ownerABuildings.map(b => b.buildingId).join(', ')}]`);
  console.log(`   Owner B has access to ${ownerBBuildings.length} building(s): [${ownerBBuildings.map(b => b.buildingId).join(', ')}]`);

  // Check if there's any overlap (there shouldn't be)
  const ownerABuildingIds = ownerABuildings.map(b => b.buildingId);
  const ownerBBuildingIds = ownerBBuildings.map(b => b.buildingId);
  const overlap = ownerABuildingIds.filter(id => ownerBBuildingIds.includes(id));

  if (overlap.length === 0) {
    console.log('   ✅ Building isolation: PASSED - No overlap between owners');
  } else {
    console.log(`   ❌ Building isolation: FAILED - Overlap found: [${overlap.join(', ')}]`);
  }
};

const testTenantIsolation = async (ownerAId, ownerBId) => {
  console.log('👥 Testing tenant data isolation...');

  // Get tenants accessible to Owner A (through building assignments)
  const [ownerATenants] = await db.execute(`
    SELECT DISTINCT t.tenantId, t.userId, u.firstName, u.lastName
    FROM tenant t
    INNER JOIN user u ON t.userId = u.userId
    INNER JOIN ApartmentAssigned aa ON t.tenantId = aa.tenantId
    INNER JOIN apartment a ON aa.apartmentId = a.apartmentId
    INNER JOIN floor f ON a.floorId = f.floorId
    INNER JOIN building b ON f.buildingId = b.buildingId
    INNER JOIN buildingAssigned ba ON b.buildingId = ba.buildingId
    WHERE ba.userId = ?
  `, [ownerAId]);

  // Get tenants accessible to Owner B
  const [ownerBTenants] = await db.execute(`
    SELECT DISTINCT t.tenantId, t.userId, u.firstName, u.lastName
    FROM tenant t
    INNER JOIN user u ON t.userId = u.userId
    INNER JOIN ApartmentAssigned aa ON t.tenantId = aa.tenantId
    INNER JOIN apartment a ON aa.apartmentId = a.apartmentId
    INNER JOIN floor f ON a.floorId = f.floorId
    INNER JOIN building b ON f.buildingId = b.buildingId
    INNER JOIN buildingAssigned ba ON b.buildingId = ba.buildingId
    WHERE ba.userId = ?
  `, [ownerBId]);

  console.log(`   Owner A can access ${ownerATenants.length} tenant(s): [${ownerATenants.map(t => `${t.firstName} ${t.lastName}`).join(', ')}]`);
  console.log(`   Owner B can access ${ownerBTenants.length} tenant(s): [${ownerBTenants.map(t => `${t.firstName} ${t.lastName}`).join(', ')}]`);

  // Check for overlap
  const ownerATenantIds = ownerATenants.map(t => t.tenantId);
  const ownerBTenantIds = ownerBTenants.map(t => t.tenantId);
  const overlap = ownerATenantIds.filter(id => ownerBTenantIds.includes(id));

  if (overlap.length === 0) {
    console.log('   ✅ Tenant isolation: PASSED - No overlap between owners');
  } else {
    console.log(`   ❌ Tenant isolation: FAILED - Overlap found: [${overlap.join(', ')}]`);
  }
};

const testTransactionIsolation = async (ownerAId, ownerBId) => {
  console.log('💰 Testing financial transaction data isolation...');

  // Get transactions accessible to Owner A
  const [ownerATransactions] = await db.execute(`
    SELECT DISTINCT ft.transactionId, ft.amount, ft.transactionType
    FROM FinancialTransactions ft
    INNER JOIN tenant t ON ft.tenantId = t.tenantId
    INNER JOIN ApartmentAssigned aa ON t.tenantId = aa.tenantId
    INNER JOIN apartment a ON aa.apartmentId = a.apartmentId
    INNER JOIN floor f ON a.floorId = f.floorId
    INNER JOIN building b ON f.buildingId = b.buildingId
    INNER JOIN buildingAssigned ba ON b.buildingId = ba.buildingId
    WHERE ba.userId = ?
  `, [ownerAId]);

  // Get transactions accessible to Owner B
  const [ownerBTransactions] = await db.execute(`
    SELECT DISTINCT ft.transactionId, ft.amount, ft.transactionType
    FROM FinancialTransactions ft
    INNER JOIN tenant t ON ft.tenantId = t.tenantId
    INNER JOIN ApartmentAssigned aa ON t.tenantId = aa.tenantId
    INNER JOIN apartment a ON aa.apartmentId = a.apartmentId
    INNER JOIN floor f ON a.floorId = f.floorId
    INNER JOIN building b ON f.buildingId = b.buildingId
    INNER JOIN buildingAssigned ba ON b.buildingId = ba.buildingId
    WHERE ba.userId = ?
  `, [ownerBId]);

  console.log(`   Owner A can access ${ownerATransactions.length} transaction(s): [${ownerATransactions.map(t => `$${t.amount} ${t.transactionType}`).join(', ')}]`);
  console.log(`   Owner B can access ${ownerBTransactions.length} transaction(s): [${ownerBTransactions.map(t => `$${t.amount} ${t.transactionType}`).join(', ')}]`);

  // Check for overlap
  const ownerATransactionIds = ownerATransactions.map(t => t.transactionId);
  const ownerBTransactionIds = ownerBTransactions.map(t => t.transactionId);
  const overlap = ownerATransactionIds.filter(id => ownerBTransactionIds.includes(id));

  if (overlap.length === 0) {
    console.log('   ✅ Transaction isolation: PASSED - No overlap between owners');
  } else {
    console.log(`   ❌ Transaction isolation: FAILED - Overlap found: [${overlap.join(', ')}]`);
  }
};

const testUserManagementIsolation = async (ownerAId, ownerBId) => {
  console.log('👤 Testing user management data isolation...');

  // Get users that Owner A can manage (users they created)
  const [ownerAUsers] = await db.execute(`
    SELECT userId, firstName, lastName, email
    FROM user
    WHERE createdBy = ? OR userId = ?
  `, [ownerAId, ownerAId]);

  // Get users that Owner B can manage
  const [ownerBUsers] = await db.execute(`
    SELECT userId, firstName, lastName, email
    FROM user
    WHERE createdBy = ? OR userId = ?
  `, [ownerBId, ownerBId]);

  console.log(`   Owner A can manage ${ownerAUsers.length} user(s): [${ownerAUsers.map(u => `${u.firstName} ${u.lastName}`).join(', ')}]`);
  console.log(`   Owner B can manage ${ownerBUsers.length} user(s): [${ownerBUsers.map(u => `${u.firstName} ${u.lastName}`).join(', ')}]`);

  // Check for overlap (excluding themselves)
  const ownerAUserIds = ownerAUsers.filter(u => u.userId !== ownerAId).map(u => u.userId);
  const ownerBUserIds = ownerBUsers.filter(u => u.userId !== ownerBId).map(u => u.userId);
  const overlap = ownerAUserIds.filter(id => ownerBUserIds.includes(id));

  if (overlap.length === 0) {
    console.log('   ✅ User management isolation: PASSED - No overlap between owners');
  } else {
    console.log(`   ❌ User management isolation: FAILED - Overlap found: [${overlap.join(', ')}]`);
  }
};

// Cleanup function to remove test data
const cleanupTestData = async () => {
  console.log('\n🧹 Cleaning up test data...');
  
  try {
    // Delete in reverse order of dependencies
    await db.execute('DELETE FROM FinancialTransactions WHERE transactionId IN ("test-txn-4001", "test-txn-4002")');
    await db.execute('DELETE FROM ApartmentAssigned WHERE tenantId IN (7001, 7002)');
    await db.execute('DELETE FROM apartment WHERE apartmentId IN (5001, 5002)');
    await db.execute('DELETE FROM floor WHERE floorId IN (6001, 6002)');
    await db.execute('DELETE FROM tenant WHERE tenantId IN (7001, 7002)');
    await db.execute('DELETE FROM buildingAssigned WHERE userId IN (9001, 9002)');
    await db.execute('DELETE FROM building WHERE buildingId IN (8001, 8002)');
    await db.execute('DELETE FROM userRole WHERE userId IN (9001, 9002, 9003, 9004)');
    await db.execute('DELETE FROM user WHERE userId IN (9001, 9002, 9003, 9004)');

    console.log('✅ Test data cleanup completed!');
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
};

// Run the test
const runTest = async () => {
  await testDataIsolation();
  await cleanupTestData();
  process.exit(0);
};

runTest();
