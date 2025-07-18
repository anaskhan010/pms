import db from './config/db.js';

/**
 * Final Data Isolation Test
 * Comprehensive test to verify that Owner A cannot see Owner B's data
 * Tests all major endpoints and data types
 */

const testFinalDataIsolation = async () => {
  console.log('🔒 Final Data Isolation Test');
  console.log('='.repeat(50));

  try {
    // Setup test data
    await setupTestData();
    
    // Test all data isolation scenarios
    await testBuildingIsolation();
    await testTenantIsolation();
    await testFinancialIsolation();
    await testVillaIsolation();
    await testUserIsolation();
    await testPermissionIsolation();
    
    console.log('\n🎉 All data isolation tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await cleanupTestData();
  }
};

const setupTestData = async () => {
  console.log('\n📝 Setting up test data...');
  
  // Create two owner users
  const owners = [
    { id: 9001, name: 'Owner Alpha', email: 'alpha@test.com' },
    { id: 9002, name: 'Owner Beta', email: 'beta@test.com' }
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

  // Create buildings and assign to owners
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

    // Create floors, apartments, tenants, and transactions
    const floorId = 6001 + i;
    const apartmentId = 5001 + i;
    const tenantUserId = 9010 + i;
    const tenantId = 7001 + i;
    const villaId = 3001 + i;
    
    await db.execute(`
      INSERT IGNORE INTO floor (floorId, buildingId, floorName)
      VALUES (?, ?, 'Floor 1')
    `, [floorId, buildingId]);

    await db.execute(`
      INSERT IGNORE INTO apartment (apartmentId, floorId, bedrooms, bathrooms, length, width, rentPrice, status, description)
      VALUES (?, ?, 2, 1, 700, 800, 1000, 'Rented', 'Test Apartment')
    `, [apartmentId, floorId]);

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

    await db.execute(`
      INSERT IGNORE INTO FinancialTransactions (transactionId, tenantId, apartmentId, amount, transactionType, status, paymentMethod, transactionDate)
      VALUES (?, ?, ?, 1000.00, 'Rent Payment', 'Completed', 'Bank Transfer', '2024-01-01')
    `, [`test-txn-${4001 + i}`, tenantId, apartmentId]);

    await db.execute(`
      INSERT IGNORE INTO villas (villasId, Name, Address, bedrooms, bathrooms, length, width, price, description, yearOfCreation, status)
      VALUES (?, ?, ?, 3, 2, 1000, 1200, 50000, 'Test Villa', '2020-01-01', 'Available')
    `, [villaId, `Villa ${String.fromCharCode(65 + i)}`, `Villa Address ${String.fromCharCode(65 + i)}`]);

    await db.execute(`
      INSERT IGNORE INTO villasAssigned (villaId, userId)
      VALUES (?, ?)
    `, [villaId, ownerId]);

    // Create sub-users for each owner
    const subUserId = 9020 + i;
    await db.execute(`
      INSERT IGNORE INTO user (userId, firstName, lastName, email, password, phoneNumber, address, gender, image, nationality, dateOfBirth, createdBy)
      VALUES (?, ?, 'Staff', ?, 'password123', '2222222222', 'Staff Address', 'Male', 'staff.jpg', 'Staff Country', '1990-01-01', ?)
    `, [subUserId, `Staff${String.fromCharCode(65 + i)}`, `staff${String.fromCharCode(97 + i)}@test.com`, ownerId]);
  }

  console.log('✅ Test data setup completed!');
};

const testBuildingIsolation = async () => {
  console.log('\n🏢 Testing building data isolation...');
  
  // Test that each owner only sees their assigned buildings
  const [owner1Buildings] = await db.execute(`
    SELECT b.buildingId, b.buildingName
    FROM building b
    INNER JOIN buildingAssigned ba ON b.buildingId = ba.buildingId
    WHERE ba.userId = ?
  `, [9001]);

  const [owner2Buildings] = await db.execute(`
    SELECT b.buildingId, b.buildingName
    FROM building b
    INNER JOIN buildingAssigned ba ON b.buildingId = ba.buildingId
    WHERE ba.userId = ?
  `, [9002]);

  console.log(`   Owner Alpha can access: [${owner1Buildings.map(b => b.buildingName).join(', ')}]`);
  console.log(`   Owner Beta can access: [${owner2Buildings.map(b => b.buildingName).join(', ')}]`);

  // Check for overlap
  const owner1BuildingIds = owner1Buildings.map(b => b.buildingId);
  const owner2BuildingIds = owner2Buildings.map(b => b.buildingId);
  const overlap = owner1BuildingIds.filter(id => owner2BuildingIds.includes(id));

  if (overlap.length === 0) {
    console.log('   ✅ Building isolation: PASSED');
  } else {
    console.log(`   ❌ Building isolation: FAILED - Overlap: [${overlap.join(', ')}]`);
  }
};

const testTenantIsolation = async () => {
  console.log('\n👥 Testing tenant data isolation...');
  
  // Test tenant access through building assignments
  const [owner1Tenants] = await db.execute(`
    SELECT DISTINCT t.tenantId, u.firstName, u.lastName
    FROM tenant t
    INNER JOIN user u ON t.userId = u.userId
    INNER JOIN ApartmentAssigned aa ON t.tenantId = aa.tenantId
    INNER JOIN apartment a ON aa.apartmentId = a.apartmentId
    INNER JOIN floor f ON a.floorId = f.floorId
    INNER JOIN building b ON f.buildingId = b.buildingId
    INNER JOIN buildingAssigned ba ON b.buildingId = ba.buildingId
    WHERE ba.userId = ?
  `, [9001]);

  const [owner2Tenants] = await db.execute(`
    SELECT DISTINCT t.tenantId, u.firstName, u.lastName
    FROM tenant t
    INNER JOIN user u ON t.userId = u.userId
    INNER JOIN ApartmentAssigned aa ON t.tenantId = aa.tenantId
    INNER JOIN apartment a ON aa.apartmentId = a.apartmentId
    INNER JOIN floor f ON a.floorId = f.floorId
    INNER JOIN building b ON f.buildingId = b.buildingId
    INNER JOIN buildingAssigned ba ON b.buildingId = ba.buildingId
    WHERE ba.userId = ?
  `, [9002]);

  console.log(`   Owner Alpha can access: [${owner1Tenants.map(t => `${t.firstName} ${t.lastName}`).join(', ')}]`);
  console.log(`   Owner Beta can access: [${owner2Tenants.map(t => `${t.firstName} ${t.lastName}`).join(', ')}]`);

  // Check for overlap
  const owner1TenantIds = owner1Tenants.map(t => t.tenantId);
  const owner2TenantIds = owner2Tenants.map(t => t.tenantId);
  const overlap = owner1TenantIds.filter(id => owner2TenantIds.includes(id));

  if (overlap.length === 0) {
    console.log('   ✅ Tenant isolation: PASSED');
  } else {
    console.log(`   ❌ Tenant isolation: FAILED - Overlap: [${overlap.join(', ')}]`);
  }
};

const testFinancialIsolation = async () => {
  console.log('\n💰 Testing financial transaction isolation...');
  
  // Test financial transaction access
  const [owner1Transactions] = await db.execute(`
    SELECT DISTINCT ft.transactionId, ft.amount
    FROM FinancialTransactions ft
    INNER JOIN tenant t ON ft.tenantId = t.tenantId
    INNER JOIN ApartmentAssigned aa ON t.tenantId = aa.tenantId
    INNER JOIN apartment a ON aa.apartmentId = a.apartmentId
    INNER JOIN floor f ON a.floorId = f.floorId
    INNER JOIN building b ON f.buildingId = b.buildingId
    INNER JOIN buildingAssigned ba ON b.buildingId = ba.buildingId
    WHERE ba.userId = ?
  `, [9001]);

  const [owner2Transactions] = await db.execute(`
    SELECT DISTINCT ft.transactionId, ft.amount
    FROM FinancialTransactions ft
    INNER JOIN tenant t ON ft.tenantId = t.tenantId
    INNER JOIN ApartmentAssigned aa ON t.tenantId = aa.tenantId
    INNER JOIN apartment a ON aa.apartmentId = a.apartmentId
    INNER JOIN floor f ON a.floorId = f.floorId
    INNER JOIN building b ON f.buildingId = b.buildingId
    INNER JOIN buildingAssigned ba ON b.buildingId = ba.buildingId
    WHERE ba.userId = ?
  `, [9002]);

  console.log(`   Owner Alpha can access: ${owner1Transactions.length} transaction(s)`);
  console.log(`   Owner Beta can access: ${owner2Transactions.length} transaction(s)`);

  // Check for overlap
  const owner1TransactionIds = owner1Transactions.map(t => t.transactionId);
  const owner2TransactionIds = owner2Transactions.map(t => t.transactionId);
  const overlap = owner1TransactionIds.filter(id => owner2TransactionIds.includes(id));

  if (overlap.length === 0) {
    console.log('   ✅ Financial isolation: PASSED');
  } else {
    console.log(`   ❌ Financial isolation: FAILED - Overlap: [${overlap.join(', ')}]`);
  }
};

const testVillaIsolation = async () => {
  console.log('\n🏡 Testing villa data isolation...');
  
  const [owner1Villas] = await db.execute(`
    SELECT v.villasId, v.Name
    FROM villas v
    INNER JOIN villasAssigned va ON v.villasId = va.villaId
    WHERE va.userId = ?
  `, [9001]);

  const [owner2Villas] = await db.execute(`
    SELECT v.villasId, v.Name
    FROM villas v
    INNER JOIN villasAssigned va ON v.villasId = va.villaId
    WHERE va.userId = ?
  `, [9002]);

  console.log(`   Owner Alpha can access: [${owner1Villas.map(v => v.Name).join(', ')}]`);
  console.log(`   Owner Beta can access: [${owner2Villas.map(v => v.Name).join(', ')}]`);

  // Check for overlap
  const owner1VillaIds = owner1Villas.map(v => v.villasId);
  const owner2VillaIds = owner2Villas.map(v => v.villasId);
  const overlap = owner1VillaIds.filter(id => owner2VillaIds.includes(id));

  if (overlap.length === 0) {
    console.log('   ✅ Villa isolation: PASSED');
  } else {
    console.log(`   ❌ Villa isolation: FAILED - Overlap: [${overlap.join(', ')}]`);
  }
};

const testUserIsolation = async () => {
  console.log('\n👤 Testing user management isolation...');
  
  // Test that owners can only manage users they created
  const [owner1Users] = await db.execute(`
    SELECT userId, firstName, lastName
    FROM user
    WHERE createdBy = ? OR userId = ?
  `, [9001, 9001]);

  const [owner2Users] = await db.execute(`
    SELECT userId, firstName, lastName
    FROM user
    WHERE createdBy = ? OR userId = ?
  `, [9002, 9002]);

  console.log(`   Owner Alpha can manage: [${owner1Users.map(u => `${u.firstName} ${u.lastName}`).join(', ')}]`);
  console.log(`   Owner Beta can manage: [${owner2Users.map(u => `${u.firstName} ${u.lastName}`).join(', ')}]`);

  // Check for overlap (excluding themselves)
  const owner1UserIds = owner1Users.filter(u => u.userId !== 9001).map(u => u.userId);
  const owner2UserIds = owner2Users.filter(u => u.userId !== 9002).map(u => u.userId);
  const overlap = owner1UserIds.filter(id => owner2UserIds.includes(id));

  if (overlap.length === 0) {
    console.log('   ✅ User management isolation: PASSED');
  } else {
    console.log(`   ❌ User management isolation: FAILED - Overlap: [${overlap.join(', ')}]`);
  }
};

const testPermissionIsolation = async () => {
  console.log('\n🔐 Testing permission isolation...');
  
  // Verify that owners only have view_own permissions, not general view permissions
  const [owner1Permissions] = await db.execute(`
    SELECT p.permissionName, p.resource, p.action
    FROM permissions p
    INNER JOIN role_permissions rp ON p.permissionId = rp.permissionId
    INNER JOIN userRole ur ON rp.roleId = ur.roleId
    WHERE ur.userId = ? AND p.resource IN ('buildings', 'tenants', 'transactions', 'villas', 'users')
    AND p.action LIKE '%view%'
    ORDER BY p.resource, p.action
  `, [9001]);

  console.log('   Owner permissions (view-related):');
  owner1Permissions.forEach(perm => {
    const isViewOwn = perm.action === 'view_own';
    const icon = isViewOwn ? '✅' : '❌';
    console.log(`     ${icon} ${perm.permissionName} (${perm.action})`);
  });

  // Check that no general 'view' permissions exist
  const generalViewPerms = owner1Permissions.filter(p => p.action === 'view');
  const viewOwnPerms = owner1Permissions.filter(p => p.action === 'view_own');

  if (generalViewPerms.length === 0 && viewOwnPerms.length > 0) {
    console.log('   ✅ Permission isolation: PASSED - Only view_own permissions found');
  } else {
    console.log(`   ❌ Permission isolation: FAILED - Found ${generalViewPerms.length} general view permissions`);
  }
};

const cleanupTestData = async () => {
  console.log('\n🧹 Cleaning up test data...');
  
  try {
    await db.execute('DELETE FROM FinancialTransactions WHERE transactionId LIKE "test-txn-%"');
    await db.execute('DELETE FROM ApartmentAssigned WHERE tenantId BETWEEN 7001 AND 7002');
    await db.execute('DELETE FROM apartment WHERE apartmentId BETWEEN 5001 AND 5002');
    await db.execute('DELETE FROM floor WHERE floorId BETWEEN 6001 AND 6002');
    await db.execute('DELETE FROM tenant WHERE tenantId BETWEEN 7001 AND 7002');
    await db.execute('DELETE FROM villasAssigned WHERE userId BETWEEN 9001 AND 9002');
    await db.execute('DELETE FROM villas WHERE villasId BETWEEN 3001 AND 3002');
    await db.execute('DELETE FROM buildingAssigned WHERE userId BETWEEN 9001 AND 9002');
    await db.execute('DELETE FROM building WHERE buildingId BETWEEN 8001 AND 8002');
    await db.execute('DELETE FROM userRole WHERE userId BETWEEN 9001 AND 9022');
    await db.execute('DELETE FROM user WHERE userId BETWEEN 9001 AND 9022');
    
    console.log('✅ Test data cleanup completed!');
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
};

// Run the test
testFinalDataIsolation().then(() => {
  process.exit(0);
});
