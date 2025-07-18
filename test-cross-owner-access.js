import db from './config/db.js';

/**
 * Test Cross-Owner Access Prevention
 * Tests that Owner B cannot view Owner A's:
 * - Tenants
 * - Financial Transactions  
 * - User Management
 * And vice versa
 */

const testCrossOwnerAccess = async () => {
  console.log('🚫 Testing Cross-Owner Access Prevention');
  console.log('='.repeat(50));

  try {
    // Setup comprehensive test data
    await setupCrossOwnerTestData();
    
    // Test all cross-owner access scenarios
    await testTenantCrossAccess();
    await testFinancialCrossAccess();
    await testUserManagementCrossAccess();
    
    console.log('\n🎉 All cross-owner access tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await cleanupCrossOwnerTestData();
  }
};

const setupCrossOwnerTestData = async () => {
  console.log('\n📝 Setting up comprehensive cross-owner test data...');
  
  // Create two owner users
  const owners = [
    { id: 9001, name: 'Cross Owner Alpha', email: 'cross.alpha@test.com' },
    { id: 9002, name: 'Cross Owner Beta', email: 'cross.beta@test.com' }
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

  // Owner Alpha creates buildings
  await db.execute(`
    INSERT IGNORE INTO building (buildingId, buildingName, buildingAddress, buildingCreatedDate, createdBy)
    VALUES (8001, 'Cross Alpha Building', 'Cross Alpha Address', '2024-01-01', 9001)
  `);

  // Owner Beta creates buildings
  await db.execute(`
    INSERT IGNORE INTO building (buildingId, buildingName, buildingAddress, buildingCreatedDate, createdBy)
    VALUES (8002, 'Cross Beta Building', 'Cross Beta Address', '2024-01-01', 9002)
  `);

  // Create floors and apartments for both owners
  await db.execute(`
    INSERT IGNORE INTO floor (floorId, buildingId, floorName)
    VALUES (6001, 8001, 'Alpha Floor 1')
  `);

  await db.execute(`
    INSERT IGNORE INTO apartment (apartmentId, floorId, bedrooms, bathrooms, length, width, rentPrice, status, description)
    VALUES (5001, 6001, 2, 1, 700, 800, 1000, 'Rented', 'Alpha Apartment')
  `);

  await db.execute(`
    INSERT IGNORE INTO floor (floorId, buildingId, floorName)
    VALUES (6002, 8002, 'Beta Floor 1')
  `);

  await db.execute(`
    INSERT IGNORE INTO apartment (apartmentId, floorId, bedrooms, bathrooms, length, width, rentPrice, status, description)
    VALUES (5002, 6002, 3, 2, 900, 1000, 1500, 'Rented', 'Beta Apartment')
  `);

  // Owner Alpha creates tenants
  await db.execute(`
    INSERT IGNORE INTO user (userId, firstName, lastName, email, password, phoneNumber, address, gender, image, nationality, dateOfBirth)
    VALUES (9010, 'Alpha', 'Tenant', 'alpha.tenant@test.com', 'password123', '1111111111', 'Tenant Address', 'Male', 'tenant.jpg', 'Tenant Country', '1990-01-01')
  `);

  await db.execute(`
    INSERT IGNORE INTO tenant (tenantId, userId, occupation, createdBy)
    VALUES (7001, 9010, 'Alpha Job', 9001)
  `);

  await db.execute(`
    INSERT IGNORE INTO ApartmentAssigned (tenantId, apartmentId)
    VALUES (7001, 5001)
  `);

  // Owner Beta creates tenants
  await db.execute(`
    INSERT IGNORE INTO user (userId, firstName, lastName, email, password, phoneNumber, address, gender, image, nationality, dateOfBirth)
    VALUES (9011, 'Beta', 'Tenant', 'beta.tenant@test.com', 'password123', '2222222222', 'Tenant Address', 'Male', 'tenant.jpg', 'Tenant Country', '1990-01-01')
  `);

  await db.execute(`
    INSERT IGNORE INTO tenant (tenantId, userId, occupation, createdBy)
    VALUES (7002, 9011, 'Beta Job', 9002)
  `);

  await db.execute(`
    INSERT IGNORE INTO ApartmentAssigned (tenantId, apartmentId)
    VALUES (7002, 5002)
  `);

  // Owner Alpha creates financial transactions
  await db.execute(`
    INSERT IGNORE INTO FinancialTransactions (transactionId, tenantId, apartmentId, amount, transactionType, status, paymentMethod, transactionDate, createdBy)
    VALUES ('cross-alpha-txn-001', 7001, 5001, 1000.00, 'Rent Payment', 'Completed', 'Bank Transfer', '2024-01-01', 9001)
  `);

  // Owner Beta creates financial transactions
  await db.execute(`
    INSERT IGNORE INTO FinancialTransactions (transactionId, tenantId, apartmentId, amount, transactionType, status, paymentMethod, transactionDate, createdBy)
    VALUES ('cross-beta-txn-001', 7002, 5002, 1500.00, 'Rent Payment', 'Completed', 'Cash', '2024-01-01', 9002)
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

  console.log('✅ Cross-owner test data setup completed!');
};

const testTenantCrossAccess = async () => {
  console.log('\n👥 Testing tenant cross-owner access prevention...');
  
  // Test Owner Alpha's tenant access
  console.log('   Testing Owner Alpha tenant access...');
  
  // Simulate middleware for Owner Alpha
  const alphaOwnedBuildings = await getOwnerBuildings(9001);
  const alphaOwnedTenants = await getOwnerTenants(9001);
  
  console.log(`   Alpha owns ${alphaOwnedBuildings.length} building(s): [${alphaOwnedBuildings.join(', ')}]`);
  console.log(`   Alpha created ${alphaOwnedTenants.length} tenant(s): [${alphaOwnedTenants.join(', ')}]`);
  
  // Simulate tenant query for Owner Alpha
  const alphaVisibleTenants = await simulateTenantQuery({
    buildingIds: alphaOwnedBuildings,
    tenantIds: alphaOwnedTenants
  });
  
  console.log(`   Alpha can see ${alphaVisibleTenants.length} tenant(s): [${alphaVisibleTenants.map(t => `${t.firstName} ${t.lastName}`).join(', ')}]`);
  
  // Test Owner Beta's tenant access
  console.log('   Testing Owner Beta tenant access...');
  
  const betaOwnedBuildings = await getOwnerBuildings(9002);
  const betaOwnedTenants = await getOwnerTenants(9002);
  
  console.log(`   Beta owns ${betaOwnedBuildings.length} building(s): [${betaOwnedBuildings.join(', ')}]`);
  console.log(`   Beta created ${betaOwnedTenants.length} tenant(s): [${betaOwnedTenants.join(', ')}]`);
  
  const betaVisibleTenants = await simulateTenantQuery({
    buildingIds: betaOwnedBuildings,
    tenantIds: betaOwnedTenants
  });
  
  console.log(`   Beta can see ${betaVisibleTenants.length} tenant(s): [${betaVisibleTenants.map(t => `${t.firstName} ${t.lastName}`).join(', ')}]`);
  
  // Verify no cross-contamination
  const alphaCanSeeBetaTenants = alphaVisibleTenants.some(t => t.createdBy === 9002);
  const betaCanSeeAlphaTenants = betaVisibleTenants.some(t => t.createdBy === 9001);
  
  if (!alphaCanSeeBetaTenants && !betaCanSeeAlphaTenants) {
    console.log('   ✅ Tenant cross-access prevention: PASSED');
  } else {
    console.log('   ❌ Tenant cross-access prevention: FAILED');
    if (alphaCanSeeBetaTenants) console.log('     - Alpha can see Beta tenants');
    if (betaCanSeeAlphaTenants) console.log('     - Beta can see Alpha tenants');
  }
};

const testFinancialCrossAccess = async () => {
  console.log('\n💰 Testing financial transaction cross-owner access prevention...');
  
  // Test Owner Alpha's transaction access
  console.log('   Testing Owner Alpha transaction access...');
  
  const alphaOwnedBuildings = await getOwnerBuildings(9001);
  const alphaOwnedTransactions = await getOwnerTransactions(9001);
  
  console.log(`   Alpha owns ${alphaOwnedBuildings.length} building(s): [${alphaOwnedBuildings.join(', ')}]`);
  console.log(`   Alpha created ${alphaOwnedTransactions.length} transaction(s): [${alphaOwnedTransactions.join(', ')}]`);
  
  const alphaVisibleTransactions = await simulateTransactionQuery({
    buildingIds: alphaOwnedBuildings,
    transactionIds: alphaOwnedTransactions
  });
  
  console.log(`   Alpha can see ${alphaVisibleTransactions.length} transaction(s): [${alphaVisibleTransactions.map(t => `$${t.amount}`).join(', ')}]`);
  
  // Test Owner Beta's transaction access
  console.log('   Testing Owner Beta transaction access...');
  
  const betaOwnedBuildings = await getOwnerBuildings(9002);
  const betaOwnedTransactions = await getOwnerTransactions(9002);
  
  console.log(`   Beta owns ${betaOwnedBuildings.length} building(s): [${betaOwnedBuildings.join(', ')}]`);
  console.log(`   Beta created ${betaOwnedTransactions.length} transaction(s): [${betaOwnedTransactions.join(', ')}]`);
  
  const betaVisibleTransactions = await simulateTransactionQuery({
    buildingIds: betaOwnedBuildings,
    transactionIds: betaOwnedTransactions
  });
  
  console.log(`   Beta can see ${betaVisibleTransactions.length} transaction(s): [${betaVisibleTransactions.map(t => `$${t.amount}`).join(', ')}]`);
  
  // Verify no cross-contamination
  const alphaCanSeeBetaTransactions = alphaVisibleTransactions.some(t => t.createdBy === 9002);
  const betaCanSeeAlphaTransactions = betaVisibleTransactions.some(t => t.createdBy === 9001);
  
  if (!alphaCanSeeBetaTransactions && !betaCanSeeAlphaTransactions) {
    console.log('   ✅ Financial cross-access prevention: PASSED');
  } else {
    console.log('   ❌ Financial cross-access prevention: FAILED');
    if (alphaCanSeeBetaTransactions) console.log('     - Alpha can see Beta transactions');
    if (betaCanSeeAlphaTransactions) console.log('     - Beta can see Alpha transactions');
  }
};

const testUserManagementCrossAccess = async () => {
  console.log('\n👤 Testing user management cross-owner access prevention...');
  
  // Test Owner Alpha's user management access
  console.log('   Testing Owner Alpha user management access...');
  
  const alphaManageableUsers = await getManageableUsers(9001);
  console.log(`   Alpha can manage ${alphaManageableUsers.length} user(s): [${alphaManageableUsers.map(u => `${u.firstName} ${u.lastName}`).join(', ')}]`);
  
  // Test Owner Beta's user management access
  console.log('   Testing Owner Beta user management access...');
  
  const betaManageableUsers = await getManageableUsers(9002);
  console.log(`   Beta can manage ${betaManageableUsers.length} user(s): [${betaManageableUsers.map(u => `${u.firstName} ${u.lastName}`).join(', ')}]`);
  
  // Verify no cross-contamination (excluding themselves)
  const alphaUserIds = alphaManageableUsers.filter(u => u.userId !== 9001).map(u => u.userId);
  const betaUserIds = betaManageableUsers.filter(u => u.userId !== 9002).map(u => u.userId);
  const userOverlap = alphaUserIds.filter(id => betaUserIds.includes(id));
  
  if (userOverlap.length === 0) {
    console.log('   ✅ User management cross-access prevention: PASSED');
  } else {
    console.log(`   ❌ User management cross-access prevention: FAILED - Overlap: [${userOverlap.join(', ')}]`);
  }
};

// Helper functions
const getOwnerBuildings = async (userId) => {
  const [rows] = await db.execute('SELECT buildingId FROM building WHERE createdBy = ?', [userId]);
  return rows.map(row => row.buildingId);
};

const getOwnerTenants = async (userId) => {
  const [rows] = await db.execute('SELECT tenantId FROM tenant WHERE createdBy = ?', [userId]);
  return rows.map(row => row.tenantId);
};

const getOwnerTransactions = async (userId) => {
  const [rows] = await db.execute('SELECT transactionId FROM FinancialTransactions WHERE createdBy = ?', [userId]);
  return rows.map(row => row.transactionId);
};

const getManageableUsers = async (userId) => {
  const [rows] = await db.execute(`
    SELECT userId, firstName, lastName, createdBy
    FROM user
    WHERE createdBy = ? OR userId = ?
  `, [userId, userId]);
  return rows;
};

const simulateTenantQuery = async (filters) => {
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
  
  // Apply building filtering
  if (filters.buildingIds && filters.buildingIds.length > 0) {
    const placeholders = filters.buildingIds.map(() => '?').join(',');
    query += ` AND (b.buildingId IN (${placeholders}) OR aa.apartmentId IS NULL)`;
    values.push(...filters.buildingIds);
  }
  
  // Apply direct tenant filtering
  if (filters.tenantIds && filters.tenantIds.length > 0) {
    const placeholders = filters.tenantIds.map(() => '?').join(',');
    query += ` OR t.tenantId IN (${placeholders})`;
    values.push(...filters.tenantIds);
  }
  
  // If no filters, return empty
  if ((!filters.buildingIds || filters.buildingIds.length === 0) && 
      (!filters.tenantIds || filters.tenantIds.length === 0)) {
    query += ' AND 1 = 0';
  }
  
  const [tenants] = await db.execute(query, values);
  return tenants;
};

const simulateTransactionQuery = async (filters) => {
  let query = `
    SELECT DISTINCT ft.transactionId, ft.amount, ft.createdBy
    FROM FinancialTransactions ft
    LEFT JOIN tenant t ON ft.tenantId = t.tenantId
    LEFT JOIN ApartmentAssigned aa ON t.tenantId = aa.tenantId
    LEFT JOIN apartment a ON aa.apartmentId = a.apartmentId
    LEFT JOIN floor f ON a.floorId = f.floorId
    LEFT JOIN building b ON f.buildingId = b.buildingId
    WHERE 1 = 1
  `;
  let values = [];
  
  // Apply building filtering
  if (filters.buildingIds && filters.buildingIds.length > 0) {
    const placeholders = filters.buildingIds.map(() => '?').join(',');
    query += ` AND b.buildingId IN (${placeholders})`;
    values.push(...filters.buildingIds);
  }
  
  // Apply direct transaction filtering
  if (filters.transactionIds && filters.transactionIds.length > 0) {
    const placeholders = filters.transactionIds.map(() => '?').join(',');
    query += ` OR ft.transactionId IN (${placeholders})`;
    values.push(...filters.transactionIds);
  }
  
  // If no filters, return empty
  if ((!filters.buildingIds || filters.buildingIds.length === 0) && 
      (!filters.transactionIds || filters.transactionIds.length === 0)) {
    query += ' AND 1 = 0';
  }
  
  const [transactions] = await db.execute(query, values);
  return transactions;
};

const cleanupCrossOwnerTestData = async () => {
  console.log('\n🧹 Cleaning up cross-owner test data...');
  
  try {
    await db.execute('DELETE FROM FinancialTransactions WHERE transactionId IN ("cross-alpha-txn-001", "cross-beta-txn-001")');
    await db.execute('DELETE FROM ApartmentAssigned WHERE tenantId IN (7001, 7002)');
    await db.execute('DELETE FROM apartment WHERE apartmentId IN (5001, 5002)');
    await db.execute('DELETE FROM floor WHERE floorId IN (6001, 6002)');
    await db.execute('DELETE FROM tenant WHERE tenantId IN (7001, 7002)');
    await db.execute('DELETE FROM building WHERE buildingId IN (8001, 8002)');
    await db.execute('DELETE FROM userRole WHERE userId BETWEEN 9001 AND 9021');
    await db.execute('DELETE FROM user WHERE userId BETWEEN 9001 AND 9021');
    
    console.log('✅ Cross-owner test data cleanup completed!');
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
};

// Run the test
testCrossOwnerAccess().then(() => {
  process.exit(0);
});
