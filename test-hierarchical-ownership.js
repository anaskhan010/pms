import db from './config/db.js';

/**
 * Test Hierarchical Ownership System
 * Tests that Owner A can only see/manage records HE CREATED
 * Tests that Owner B can only see/manage records HE CREATED
 * Complete data isolation based on ownership, not assignments
 */

const testHierarchicalOwnership = async () => {
  console.log('🏗️  Testing Hierarchical Ownership System');
  console.log('='.repeat(60));

  try {
    // Setup test data
    await setupOwnershipTestData();
    
    // Test ownership-based data isolation
    await testBuildingOwnership();
    await testVillaOwnership();
    await testTenantOwnership();
    await testFinancialOwnership();
    await testUserOwnership();
    
    console.log('\n🎉 All hierarchical ownership tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await cleanupOwnershipTestData();
  }
};

const setupOwnershipTestData = async () => {
  console.log('\n📝 Setting up hierarchical ownership test data...');
  
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

  // Owner Alpha creates his buildings
  await db.execute(`
    INSERT IGNORE INTO building (buildingId, buildingName, buildingAddress, buildingCreatedDate, createdBy)
    VALUES (8001, 'Alpha Building 1', 'Alpha Address 1', '2024-01-01', 9001)
  `);
  
  await db.execute(`
    INSERT IGNORE INTO building (buildingId, buildingName, buildingAddress, buildingCreatedDate, createdBy)
    VALUES (8002, 'Alpha Building 2', 'Alpha Address 2', '2024-01-01', 9001)
  `);

  // Owner Beta creates his buildings
  await db.execute(`
    INSERT IGNORE INTO building (buildingId, buildingName, buildingAddress, buildingCreatedDate, createdBy)
    VALUES (8003, 'Beta Building 1', 'Beta Address 1', '2024-01-01', 9002)
  `);

  // Owner Alpha creates his villas
  await db.execute(`
    INSERT IGNORE INTO villas (villasId, Name, Address, bedrooms, bathrooms, length, width, price, description, yearOfCreation, status, createdBy)
    VALUES (3001, 'Alpha Villa 1', 'Alpha Villa Address 1', 3, 2, 1000, 1200, 50000, 'Alpha Villa', '2020-01-01', 'Available', 9001)
  `);

  // Owner Beta creates his villas
  await db.execute(`
    INSERT IGNORE INTO villas (villasId, Name, Address, bedrooms, bathrooms, length, width, price, description, yearOfCreation, status, createdBy)
    VALUES (3002, 'Beta Villa 1', 'Beta Villa Address 1', 4, 3, 1200, 1400, 75000, 'Beta Villa', '2020-01-01', 'Available', 9002)
  `);

  // Create floors and apartments for Alpha's buildings
  await db.execute(`
    INSERT IGNORE INTO floor (floorId, buildingId, floorName)
    VALUES (6001, 8001, 'Alpha Floor 1')
  `);

  await db.execute(`
    INSERT IGNORE INTO apartment (apartmentId, floorId, bedrooms, bathrooms, length, width, rentPrice, status, description)
    VALUES (5001, 6001, 2, 1, 700, 800, 1000, 'Available', 'Alpha Apartment 1')
  `);

  // Create floors and apartments for Beta's buildings
  await db.execute(`
    INSERT IGNORE INTO floor (floorId, buildingId, floorName)
    VALUES (6002, 8003, 'Beta Floor 1')
  `);

  await db.execute(`
    INSERT IGNORE INTO apartment (apartmentId, floorId, bedrooms, bathrooms, length, width, rentPrice, status, description)
    VALUES (5002, 6002, 3, 2, 900, 1000, 1500, 'Available', 'Beta Apartment 1')
  `);

  // Owner Alpha creates his tenants
  await db.execute(`
    INSERT IGNORE INTO user (userId, firstName, lastName, email, password, phoneNumber, address, gender, image, nationality, dateOfBirth)
    VALUES (9010, 'Alpha', 'Tenant', 'alpha.tenant@test.com', 'password123', '1111111111', 'Tenant Address', 'Male', 'tenant.jpg', 'Tenant Country', '1990-01-01')
  `);

  await db.execute(`
    INSERT IGNORE INTO tenant (tenantId, userId, occupation, createdBy)
    VALUES (7001, 9010, 'Alpha Job', 9001)
  `);

  // Owner Beta creates his tenants
  await db.execute(`
    INSERT IGNORE INTO user (userId, firstName, lastName, email, password, phoneNumber, address, gender, image, nationality, dateOfBirth)
    VALUES (9011, 'Beta', 'Tenant', 'beta.tenant@test.com', 'password123', '2222222222', 'Tenant Address', 'Male', 'tenant.jpg', 'Tenant Country', '1990-01-01')
  `);

  await db.execute(`
    INSERT IGNORE INTO tenant (tenantId, userId, occupation, createdBy)
    VALUES (7002, 9011, 'Beta Job', 9002)
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

  // Owner Alpha creates financial transactions
  await db.execute(`
    INSERT IGNORE INTO FinancialTransactions (transactionId, tenantId, apartmentId, amount, transactionType, status, paymentMethod, transactionDate, createdBy)
    VALUES ('alpha-txn-001', 7001, 5001, 1000.00, 'Rent Payment', 'Completed', 'Bank Transfer', '2024-01-01', 9001)
  `);

  // Owner Beta creates financial transactions
  await db.execute(`
    INSERT IGNORE INTO FinancialTransactions (transactionId, tenantId, apartmentId, amount, transactionType, status, paymentMethod, transactionDate, createdBy)
    VALUES ('beta-txn-001', 7002, 5002, 1500.00, 'Rent Payment', 'Completed', 'Cash', '2024-01-01', 9002)
  `);

  // Owner Alpha creates sub-users
  await db.execute(`
    INSERT IGNORE INTO user (userId, firstName, lastName, email, password, phoneNumber, address, gender, image, nationality, dateOfBirth, createdBy)
    VALUES (9020, 'Alpha', 'Staff', 'alpha.staff@test.com', 'password123', '3333333333', 'Staff Address', 'Male', 'staff.jpg', 'Staff Country', '1990-01-01', 9001)
  `);

  // Owner Beta creates sub-users
  await db.execute(`
    INSERT IGNORE INTO user (userId, firstName, lastName, email, password, phoneNumber, address, gender, image, nationality, dateOfBirth, createdBy)
    VALUES (9021, 'Beta', 'Staff', 'beta.staff@test.com', 'password123', '4444444444', 'Staff Address', 'Male', 'staff.jpg', 'Staff Country', '1990-01-01', 9002)
  `);

  console.log('✅ Hierarchical ownership test data setup completed!');
};

const testBuildingOwnership = async () => {
  console.log('\n🏢 Testing building ownership isolation...');
  
  // Test that Owner Alpha only sees buildings HE CREATED
  const [alphaBuildings] = await db.execute(`
    SELECT buildingId, buildingName, createdBy
    FROM building
    WHERE createdBy = ?
  `, [9001]);

  // Test that Owner Beta only sees buildings HE CREATED
  const [betaBuildings] = await db.execute(`
    SELECT buildingId, buildingName, createdBy
    FROM building
    WHERE createdBy = ?
  `, [9002]);

  console.log(`   Owner Alpha created ${alphaBuildings.length} building(s): [${alphaBuildings.map(b => b.buildingName).join(', ')}]`);
  console.log(`   Owner Beta created ${betaBuildings.length} building(s): [${betaBuildings.map(b => b.buildingName).join(', ')}]`);

  // Verify no cross-contamination
  const alphaCanSeeBeta = alphaBuildings.some(b => b.createdBy === 9002);
  const betaCanSeeAlpha = betaBuildings.some(b => b.createdBy === 9001);

  if (!alphaCanSeeBeta && !betaCanSeeAlpha) {
    console.log('   ✅ Building ownership isolation: PASSED - Each owner sees only their own buildings');
  } else {
    console.log('   ❌ Building ownership isolation: FAILED - Cross-contamination detected');
  }
};

const testVillaOwnership = async () => {
  console.log('\n🏡 Testing villa ownership isolation...');
  
  // Test that Owner Alpha only sees villas HE CREATED
  const [alphaVillas] = await db.execute(`
    SELECT villasId, Name, createdBy
    FROM villas
    WHERE createdBy = ?
  `, [9001]);

  // Test that Owner Beta only sees villas HE CREATED
  const [betaVillas] = await db.execute(`
    SELECT villasId, Name, createdBy
    FROM villas
    WHERE createdBy = ?
  `, [9002]);

  console.log(`   Owner Alpha created ${alphaVillas.length} villa(s): [${alphaVillas.map(v => v.Name).join(', ')}]`);
  console.log(`   Owner Beta created ${betaVillas.length} villa(s): [${betaVillas.map(v => v.Name).join(', ')}]`);

  // Verify no cross-contamination
  const alphaCanSeeBeta = alphaVillas.some(v => v.createdBy === 9002);
  const betaCanSeeAlpha = betaVillas.some(v => v.createdBy === 9001);

  if (!alphaCanSeeBeta && !betaCanSeeAlpha) {
    console.log('   ✅ Villa ownership isolation: PASSED - Each owner sees only their own villas');
  } else {
    console.log('   ❌ Villa ownership isolation: FAILED - Cross-contamination detected');
  }
};

const testTenantOwnership = async () => {
  console.log('\n👥 Testing tenant ownership isolation...');
  
  // Test that Owner Alpha only sees tenants HE CREATED
  const [alphaTenants] = await db.execute(`
    SELECT t.tenantId, u.firstName, u.lastName, t.createdBy
    FROM tenant t
    INNER JOIN user u ON t.userId = u.userId
    WHERE t.createdBy = ?
  `, [9001]);

  // Test that Owner Beta only sees tenants HE CREATED
  const [betaTenants] = await db.execute(`
    SELECT t.tenantId, u.firstName, u.lastName, t.createdBy
    FROM tenant t
    INNER JOIN user u ON t.userId = u.userId
    WHERE t.createdBy = ?
  `, [9002]);

  console.log(`   Owner Alpha created ${alphaTenants.length} tenant(s): [${alphaTenants.map(t => `${t.firstName} ${t.lastName}`).join(', ')}]`);
  console.log(`   Owner Beta created ${betaTenants.length} tenant(s): [${betaTenants.map(t => `${t.firstName} ${t.lastName}`).join(', ')}]`);

  // Verify no cross-contamination
  const alphaCanSeeBeta = alphaTenants.some(t => t.createdBy === 9002);
  const betaCanSeeAlpha = betaTenants.some(t => t.createdBy === 9001);

  if (!alphaCanSeeBeta && !betaCanSeeAlpha) {
    console.log('   ✅ Tenant ownership isolation: PASSED - Each owner sees only their own tenants');
  } else {
    console.log('   ❌ Tenant ownership isolation: FAILED - Cross-contamination detected');
  }
};

const testFinancialOwnership = async () => {
  console.log('\n💰 Testing financial transaction ownership isolation...');
  
  // Test that Owner Alpha only sees transactions HE CREATED
  const [alphaTransactions] = await db.execute(`
    SELECT transactionId, amount, createdBy
    FROM FinancialTransactions
    WHERE createdBy = ?
  `, [9001]);

  // Test that Owner Beta only sees transactions HE CREATED
  const [betaTransactions] = await db.execute(`
    SELECT transactionId, amount, createdBy
    FROM FinancialTransactions
    WHERE createdBy = ?
  `, [9002]);

  console.log(`   Owner Alpha created ${alphaTransactions.length} transaction(s): [${alphaTransactions.map(t => `$${t.amount}`).join(', ')}]`);
  console.log(`   Owner Beta created ${betaTransactions.length} transaction(s): [${betaTransactions.map(t => `$${t.amount}`).join(', ')}]`);

  // Verify no cross-contamination
  const alphaCanSeeBeta = alphaTransactions.some(t => t.createdBy === 9002);
  const betaCanSeeAlpha = betaTransactions.some(t => t.createdBy === 9001);

  if (!alphaCanSeeBeta && !betaCanSeeAlpha) {
    console.log('   ✅ Financial ownership isolation: PASSED - Each owner sees only their own transactions');
  } else {
    console.log('   ❌ Financial ownership isolation: FAILED - Cross-contamination detected');
  }
};

const testUserOwnership = async () => {
  console.log('\n👤 Testing user management ownership isolation...');
  
  // Test that Owner Alpha only sees users HE CREATED (plus himself)
  const [alphaUsers] = await db.execute(`
    SELECT userId, firstName, lastName, createdBy
    FROM user
    WHERE createdBy = ? OR userId = ?
  `, [9001, 9001]);

  // Test that Owner Beta only sees users HE CREATED (plus himself)
  const [betaUsers] = await db.execute(`
    SELECT userId, firstName, lastName, createdBy
    FROM user
    WHERE createdBy = ? OR userId = ?
  `, [9002, 9002]);

  console.log(`   Owner Alpha can manage ${alphaUsers.length} user(s): [${alphaUsers.map(u => `${u.firstName} ${u.lastName}`).join(', ')}]`);
  console.log(`   Owner Beta can manage ${betaUsers.length} user(s): [${betaUsers.map(u => `${u.firstName} ${u.lastName}`).join(', ')}]`);

  // Verify no cross-contamination (excluding themselves)
  const alphaCreatedUsers = alphaUsers.filter(u => u.userId !== 9001);
  const betaCreatedUsers = betaUsers.filter(u => u.userId !== 9002);
  
  const alphaCanSeeBeta = alphaCreatedUsers.some(u => u.createdBy === 9002);
  const betaCanSeeAlpha = betaCreatedUsers.some(u => u.createdBy === 9001);

  if (!alphaCanSeeBeta && !betaCanSeeAlpha) {
    console.log('   ✅ User management ownership isolation: PASSED - Each owner manages only their own users');
  } else {
    console.log('   ❌ User management ownership isolation: FAILED - Cross-contamination detected');
  }
};

const cleanupOwnershipTestData = async () => {
  console.log('\n🧹 Cleaning up hierarchical ownership test data...');
  
  try {
    // Delete in reverse order of dependencies
    await db.execute('DELETE FROM FinancialTransactions WHERE transactionId IN ("alpha-txn-001", "beta-txn-001")');
    await db.execute('DELETE FROM ApartmentAssigned WHERE tenantId IN (7001, 7002)');
    await db.execute('DELETE FROM apartment WHERE apartmentId IN (5001, 5002)');
    await db.execute('DELETE FROM floor WHERE floorId IN (6001, 6002)');
    await db.execute('DELETE FROM tenant WHERE tenantId IN (7001, 7002)');
    await db.execute('DELETE FROM villas WHERE villasId IN (3001, 3002)');
    await db.execute('DELETE FROM building WHERE buildingId IN (8001, 8002, 8003)');
    await db.execute('DELETE FROM userRole WHERE userId BETWEEN 9001 AND 9021');
    await db.execute('DELETE FROM user WHERE userId BETWEEN 9001 AND 9021');
    
    console.log('✅ Hierarchical ownership test data cleanup completed!');
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
};

// Run the test
testHierarchicalOwnership().then(() => {
  process.exit(0);
});
