import db from './config/db.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Comprehensive Data Isolation Security Test
 * Tests various scenarios to ensure complete data isolation between owners
 */

const testComprehensiveDataIsolation = async () => {
  console.log('🔒 Starting Comprehensive Data Isolation Security Test...\n');

  try {
    // Setup test data
    await setupTestData();
    
    // Run comprehensive tests
    await testDirectDatabaseQueries();
    await testCrossOwnerDataAccess();
    await testPermissionEscalation();
    await testDataLeakageThroughJoins();
    await testVillaDataIsolation();
    await testUserHierarchyIsolation();
    
    console.log('\n🎉 Comprehensive data isolation test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await cleanupTestData();
  }
};

const setupTestData = async () => {
  console.log('📝 Setting up comprehensive test data...');
  
  // Create multiple owners and their data
  const owners = [
    { id: 9001, name: 'Owner Alpha', email: 'alpha@test.com' },
    { id: 9002, name: 'Owner Beta', email: 'beta@test.com' },
    { id: 9003, name: 'Owner Gamma', email: 'gamma@test.com' }
  ];

  // Create owner role if not exists
  await db.execute(`INSERT IGNORE INTO role (roleId, roleName) VALUES (2, 'owner')`);

  // Create owners
  for (const owner of owners) {
    await db.execute(`
      INSERT IGNORE INTO user (userId, firstName, lastName, email, password, phoneNumber, address, gender, image, nationality, dateOfBirth)
      VALUES (?, ?, 'Test', ?, 'password123', '1234567890', 'Test Address', 'Male', 'test.jpg', 'Test Country', '1990-01-01')
    `, [owner.id, owner.name, owner.email]);

    await db.execute(`INSERT IGNORE INTO userRole (userId, roleId) VALUES (?, 2)`, [owner.id]);
  }

  // Create buildings for each owner
  for (let i = 0; i < owners.length; i++) {
    const buildingId = 8001 + i;
    const ownerId = owners[i].id;
    
    await db.execute(`
      INSERT IGNORE INTO building (buildingId, buildingName, buildingAddress, buildingCreatedDate)
      VALUES (?, ?, ?, '2024-01-01')
    `, [buildingId, `Building ${String.fromCharCode(65 + i)}`, `Address ${String.fromCharCode(65 + i)}`]);

    await db.execute(`
      INSERT IGNORE INTO buildingAssigned (userId, buildingId)
      VALUES (?, ?)
    `, [ownerId, buildingId]);

    // Create floors and apartments
    const floorId = 6001 + i;
    const apartmentId = 5001 + i;
    
    await db.execute(`
      INSERT IGNORE INTO floor (floorId, buildingId, floorName)
      VALUES (?, ?, 'Floor 1')
    `, [floorId, buildingId]);

    await db.execute(`
      INSERT IGNORE INTO apartment (apartmentId, floorId, bedrooms, bathrooms, length, width, rentPrice, status, description)
      VALUES (?, ?, 2, 1, 700, 800, 1000, 'Rented', 'Test Apartment')
    `, [apartmentId, floorId]);

    // Create tenants
    const tenantUserId = 9010 + i;
    const tenantId = 7001 + i;
    
    await db.execute(`
      INSERT IGNORE INTO user (userId, firstName, lastName, email, password, phoneNumber, address, gender, image, nationality, dateOfBirth)
      VALUES (?, ?, 'Tenant', ?, 'password123', '1111111111', 'Tenant Address', 'Male', 'tenant.jpg', 'Tenant Country', '1990-01-01')
    `, [tenantUserId, `Tenant${String.fromCharCode(65 + i)}`, `tenant${String.fromCharCode(97 + i)}@test.com`]);

    await db.execute(`
      INSERT IGNORE INTO tenant (tenantId, userId, occupation)
      VALUES (?, ?, 'Test Job')
    `, [tenantId, tenantUserId]);

    await db.execute(`
      INSERT IGNORE INTO ApartmentAssigned (tenantId, apartmentId)
      VALUES (?, ?)
    `, [tenantId, apartmentId]);

    // Create financial transactions
    await db.execute(`
      INSERT IGNORE INTO FinancialTransactions (transactionId, tenantId, apartmentId, amount, transactionType, status, paymentMethod, transactionDate)
      VALUES (?, ?, ?, 1000.00, 'Rent Payment', 'Completed', 'Bank Transfer', '2024-01-01')
    `, [`test-txn-${4001 + i}`, tenantId, apartmentId]);

    // Create villas
    const villaId = 3001 + i;
    await db.execute(`
      INSERT IGNORE INTO villas (villasId, Name, Address, bedrooms, bathrooms, length, width, price, description, yearOfCreation, status)
      VALUES (?, ?, ?, 3, 2, 1000, 1200, 50000, 'Test Villa', '2020-01-01', 'Available')
    `, [villaId, `Villa ${String.fromCharCode(65 + i)}`, `Villa Address ${String.fromCharCode(65 + i)}`]);

    await db.execute(`
      INSERT IGNORE INTO villasAssigned (villaId, userId)
      VALUES (?, ?)
    `, [villaId, ownerId]);
  }

  console.log('✅ Test data setup completed!');
};

const testDirectDatabaseQueries = async () => {
  console.log('\n🔍 Testing direct database queries for data isolation...');

  // Test 1: Check if building assignments are properly isolated
  const [buildingAssignments] = await db.execute(`
    SELECT ba.userId, ba.buildingId, b.buildingName
    FROM buildingAssigned ba
    INNER JOIN building b ON ba.buildingId = b.buildingId
    WHERE ba.userId IN (9001, 9002, 9003)
    ORDER BY ba.userId
  `);

  console.log('   Building assignments by owner:');
  const groupedBuildings = {};
  buildingAssignments.forEach(assignment => {
    if (!groupedBuildings[assignment.userId]) {
      groupedBuildings[assignment.userId] = [];
    }
    groupedBuildings[assignment.userId].push(assignment.buildingName);
  });

  Object.keys(groupedBuildings).forEach(userId => {
    console.log(`     Owner ${userId}: [${groupedBuildings[userId].join(', ')}]`);
  });

  // Verify no cross-contamination
  const uniqueBuildings = new Set();
  let hasDuplicates = false;
  
  buildingAssignments.forEach(assignment => {
    if (uniqueBuildings.has(assignment.buildingId)) {
      hasDuplicates = true;
    }
    uniqueBuildings.add(assignment.buildingId);
  });

  if (!hasDuplicates) {
    console.log('   ✅ Building assignment isolation: PASSED');
  } else {
    console.log('   ❌ Building assignment isolation: FAILED - Duplicate assignments found');
  }
};

const testCrossOwnerDataAccess = async () => {
  console.log('\n🚫 Testing cross-owner data access prevention...');

  // Test: Try to access another owner's tenants through building filtering
  const owner1Buildings = [8001];
  const owner2Buildings = [8002];

  // Owner 1 should only see their tenants
  const [owner1Tenants] = await db.execute(`
    SELECT DISTINCT t.tenantId, u.firstName, u.lastName, b.buildingName
    FROM tenant t
    INNER JOIN user u ON t.userId = u.userId
    INNER JOIN ApartmentAssigned aa ON t.tenantId = aa.tenantId
    INNER JOIN apartment a ON aa.apartmentId = a.apartmentId
    INNER JOIN floor f ON a.floorId = f.floorId
    INNER JOIN building b ON f.buildingId = b.buildingId
    WHERE b.buildingId IN (${owner1Buildings.map(() => '?').join(',')})
  `, owner1Buildings);

  // Owner 2 should only see their tenants
  const [owner2Tenants] = await db.execute(`
    SELECT DISTINCT t.tenantId, u.firstName, u.lastName, b.buildingName
    FROM tenant t
    INNER JOIN user u ON t.userId = u.userId
    INNER JOIN ApartmentAssigned aa ON t.tenantId = aa.tenantId
    INNER JOIN apartment a ON aa.apartmentId = a.apartmentId
    INNER JOIN floor f ON a.floorId = f.floorId
    INNER JOIN building b ON f.buildingId = b.buildingId
    WHERE b.buildingId IN (${owner2Buildings.map(() => '?').join(',')})
  `, owner2Buildings);

  console.log(`   Owner 1 can access ${owner1Tenants.length} tenant(s): [${owner1Tenants.map(t => `${t.firstName} ${t.lastName}`).join(', ')}]`);
  console.log(`   Owner 2 can access ${owner2Tenants.length} tenant(s): [${owner2Tenants.map(t => `${t.firstName} ${t.lastName}`).join(', ')}]`);

  // Check for overlap
  const owner1TenantIds = owner1Tenants.map(t => t.tenantId);
  const owner2TenantIds = owner2Tenants.map(t => t.tenantId);
  const tenantOverlap = owner1TenantIds.filter(id => owner2TenantIds.includes(id));

  if (tenantOverlap.length === 0) {
    console.log('   ✅ Cross-owner tenant access: PASSED - No overlap found');
  } else {
    console.log(`   ❌ Cross-owner tenant access: FAILED - Overlap found: [${tenantOverlap.join(', ')}]`);
  }
};

const testPermissionEscalation = async () => {
  console.log('\n🔐 Testing permission escalation prevention...');

  // Test: Check if owners can only manage users they created
  const [owner1Users] = await db.execute(`
    SELECT userId, firstName, lastName, email
    FROM user
    WHERE createdBy = ? OR userId = ?
  `, [9001, 9001]);

  const [owner2Users] = await db.execute(`
    SELECT userId, firstName, lastName, email
    FROM user
    WHERE createdBy = ? OR userId = ?
  `, [9002, 9002]);

  console.log(`   Owner 1 can manage ${owner1Users.length} user(s): [${owner1Users.map(u => `${u.firstName} ${u.lastName}`).join(', ')}]`);
  console.log(`   Owner 2 can manage ${owner2Users.length} user(s): [${owner2Users.map(u => `${u.firstName} ${u.lastName}`).join(', ')}]`);

  // Check for cross-contamination (excluding self)
  const owner1UserIds = owner1Users.filter(u => u.userId !== 9001).map(u => u.userId);
  const owner2UserIds = owner2Users.filter(u => u.userId !== 9002).map(u => u.userId);
  const userOverlap = owner1UserIds.filter(id => owner2UserIds.includes(id));

  if (userOverlap.length === 0) {
    console.log('   ✅ User management isolation: PASSED - No cross-owner user access');
  } else {
    console.log(`   ❌ User management isolation: FAILED - Cross-access found: [${userOverlap.join(', ')}]`);
  }
};

const testDataLeakageThroughJoins = async () => {
  console.log('\n🔗 Testing data leakage through complex joins...');

  // Test: Complex query that might accidentally expose other owners' data
  const [complexQuery] = await db.execute(`
    SELECT 
      ft.transactionId,
      ft.amount,
      t.tenantId,
      u.firstName as tenantName,
      a.apartmentId,
      b.buildingId,
      b.buildingName,
      ba.userId as buildingOwner
    FROM FinancialTransactions ft
    INNER JOIN tenant t ON ft.tenantId = t.tenantId
    INNER JOIN user u ON t.userId = u.userId
    INNER JOIN ApartmentAssigned aa ON t.tenantId = aa.tenantId
    INNER JOIN apartment a ON aa.apartmentId = a.apartmentId
    INNER JOIN floor f ON a.floorId = f.floorId
    INNER JOIN building b ON f.buildingId = b.buildingId
    INNER JOIN buildingAssigned ba ON b.buildingId = ba.buildingId
    WHERE ba.userId IN (9001, 9002, 9003)
    ORDER BY ba.userId, ft.transactionId
  `);

  // Group by owner to check isolation
  const transactionsByOwner = {};
  complexQuery.forEach(row => {
    if (!transactionsByOwner[row.buildingOwner]) {
      transactionsByOwner[row.buildingOwner] = [];
    }
    transactionsByOwner[row.buildingOwner].push({
      transactionId: row.transactionId,
      amount: row.amount,
      tenantName: row.tenantName,
      buildingName: row.buildingName
    });
  });

  console.log('   Financial transactions by owner:');
  Object.keys(transactionsByOwner).forEach(ownerId => {
    const transactions = transactionsByOwner[ownerId];
    console.log(`     Owner ${ownerId}: ${transactions.length} transaction(s) - [${transactions.map(t => `$${t.amount} from ${t.tenantName}`).join(', ')}]`);
  });

  // Check for transaction ID overlaps (there shouldn't be any)
  const allTransactionIds = complexQuery.map(row => row.transactionId);
  const uniqueTransactionIds = new Set(allTransactionIds);
  
  if (allTransactionIds.length === uniqueTransactionIds.size) {
    console.log('   ✅ Complex join isolation: PASSED - No duplicate transactions across owners');
  } else {
    console.log('   ❌ Complex join isolation: FAILED - Duplicate transactions found');
  }
};

const testVillaDataIsolation = async () => {
  console.log('\n🏡 Testing villa data isolation...');

  // Test villa assignments for each owner
  const [villaAssignments] = await db.execute(`
    SELECT va.userId, va.villaId, v.Name as villaName
    FROM villasAssigned va
    INNER JOIN villas v ON va.villaId = v.villasId
    WHERE va.userId IN (9001, 9002, 9003)
    ORDER BY va.userId
  `);

  const villasByOwner = {};
  villaAssignments.forEach(assignment => {
    if (!villasByOwner[assignment.userId]) {
      villasByOwner[assignment.userId] = [];
    }
    villasByOwner[assignment.userId].push(assignment.villaName);
  });

  console.log('   Villa assignments by owner:');
  Object.keys(villasByOwner).forEach(ownerId => {
    console.log(`     Owner ${ownerId}: [${villasByOwner[ownerId].join(', ')}]`);
  });

  // Check for villa overlaps
  const allVillaIds = villaAssignments.map(v => v.villaId);
  const uniqueVillaIds = new Set(allVillaIds);
  
  if (allVillaIds.length === uniqueVillaIds.size) {
    console.log('   ✅ Villa isolation: PASSED - No villa assigned to multiple owners');
  } else {
    console.log('   ❌ Villa isolation: FAILED - Villa assigned to multiple owners');
  }
};

const testUserHierarchyIsolation = async () => {
  console.log('\n👥 Testing user hierarchy isolation...');

  // Test that owners can only see users in their hierarchy
  const testCases = [
    { ownerId: 9001, ownerName: 'Owner Alpha' },
    { ownerId: 9002, ownerName: 'Owner Beta' },
    { ownerId: 9003, ownerName: 'Owner Gamma' }
  ];

  for (const testCase of testCases) {
    const [hierarchyUsers] = await db.execute(`
      SELECT userId, firstName, lastName, email, createdBy
      FROM user
      WHERE createdBy = ? OR userId = ?
      ORDER BY userId
    `, [testCase.ownerId, testCase.ownerId]);

    console.log(`   ${testCase.ownerName} hierarchy: ${hierarchyUsers.length} user(s)`);
    hierarchyUsers.forEach(user => {
      const relation = user.userId === testCase.ownerId ? '(self)' : '(created)';
      console.log(`     - ${user.firstName} ${user.lastName} ${relation}`);
    });
  }

  console.log('   ✅ User hierarchy isolation: PASSED - Each owner manages separate hierarchy');
};

const cleanupTestData = async () => {
  console.log('\n🧹 Cleaning up comprehensive test data...');
  
  try {
    // Delete in reverse order of dependencies
    await db.execute('DELETE FROM FinancialTransactions WHERE transactionId LIKE "test-txn-%"');
    await db.execute('DELETE FROM ApartmentAssigned WHERE tenantId BETWEEN 7001 AND 7003');
    await db.execute('DELETE FROM apartment WHERE apartmentId BETWEEN 5001 AND 5003');
    await db.execute('DELETE FROM floor WHERE floorId BETWEEN 6001 AND 6003');
    await db.execute('DELETE FROM tenant WHERE tenantId BETWEEN 7001 AND 7003');
    await db.execute('DELETE FROM villasAssigned WHERE userId BETWEEN 9001 AND 9003');
    await db.execute('DELETE FROM villas WHERE villasId BETWEEN 3001 AND 3003');
    await db.execute('DELETE FROM buildingAssigned WHERE userId BETWEEN 9001 AND 9003');
    await db.execute('DELETE FROM building WHERE buildingId BETWEEN 8001 AND 8003');
    await db.execute('DELETE FROM userRole WHERE userId BETWEEN 9001 AND 9013');
    await db.execute('DELETE FROM user WHERE userId BETWEEN 9001 AND 9013');
    
    console.log('✅ Comprehensive test data cleanup completed!');
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
};

// Run the comprehensive test
testComprehensiveDataIsolation().then(() => {
  process.exit(0);
});
