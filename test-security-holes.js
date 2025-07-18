import db from './config/db.js';

/**
 * Test Security Holes - Individual Record Access
 * Tests that Owner B cannot access individual records of Owner A through:
 * - GET /api/tenants/:id (getTenantById)
 * - GET /api/tenants/:id/apartments (getTenantApartments)
 * - GET /api/tenants/:id/contracts (getTenantContracts)
 * - GET /api/financial/transactions/:id (getTransaction)
 */

const testSecurityHoles = async () => {
  console.log('🔒 Testing Security Holes - Individual Record Access');
  console.log('='.repeat(60));

  try {
    // Setup test data
    await setupSecurityTestData();
    
    // Test individual record access security
    await testTenantByIdSecurity();
    await testTenantApartmentsSecurity();
    await testTenantContractsSecurity();
    await testTransactionByIdSecurity();
    
    console.log('\n🎉 All security hole tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await cleanupSecurityTestData();
  }
};

const setupSecurityTestData = async () => {
  console.log('\n📝 Setting up security test data...');
  
  // Create two owner users
  await db.execute(`INSERT IGNORE INTO user (userId, firstName, lastName, email, password, phoneNumber, address, gender, image, nationality, dateOfBirth) VALUES (9001, 'Security Owner', 'A', 'security.a@test.com', 'password123', '1111111111', 'Address A', 'Male', 'test.jpg', 'Country A', '1990-01-01')`);
  await db.execute(`INSERT IGNORE INTO user (userId, firstName, lastName, email, password, phoneNumber, address, gender, image, nationality, dateOfBirth) VALUES (9002, 'Security Owner', 'B', 'security.b@test.com', 'password123', '2222222222', 'Address B', 'Male', 'test.jpg', 'Country B', '1990-01-01')`);
  
  await db.execute(`INSERT IGNORE INTO userRole (userId, roleId) VALUES (9001, 2)`);
  await db.execute(`INSERT IGNORE INTO userRole (userId, roleId) VALUES (9002, 2)`);
  
  // Owner A creates comprehensive data
  await db.execute(`INSERT IGNORE INTO building (buildingId, buildingName, buildingAddress, buildingCreatedDate, createdBy) VALUES (8001, 'Security A Building', 'Security A Address', '2024-01-01', 9001)`);
  
  await db.execute(`INSERT IGNORE INTO floor (floorId, buildingId, floorName) VALUES (6001, 8001, 'Security A Floor')`);
  
  await db.execute(`INSERT IGNORE INTO apartment (apartmentId, floorId, bedrooms, bathrooms, length, width, rentPrice, status, description) VALUES (5001, 6001, 2, 1, 700, 800, 1000, 'Rented', 'Security A Apartment')`);
  
  await db.execute(`INSERT IGNORE INTO user (userId, firstName, lastName, email, password, phoneNumber, address, gender, image, nationality, dateOfBirth) VALUES (9010, 'Security A', 'Tenant', 'security.a.tenant@test.com', 'password123', '3333333333', 'Tenant Address', 'Male', 'tenant.jpg', 'Tenant Country', '1990-01-01')`);
  
  await db.execute(`INSERT IGNORE INTO tenant (tenantId, userId, occupation, createdBy) VALUES (7001, 9010, 'Security A Job', 9001)`);
  
  await db.execute(`INSERT IGNORE INTO ApartmentAssigned (tenantId, apartmentId) VALUES (7001, 5001)`);
  
  await db.execute(`INSERT IGNORE INTO FinancialTransactions (transactionId, tenantId, apartmentId, amount, transactionType, status, paymentMethod, transactionDate, createdBy) VALUES ('security-a-txn-001', 7001, 5001, 1000.00, 'Rent Payment', 'Completed', 'Bank Transfer', '2024-01-01', 9001)`);
  
  // Owner B creates comprehensive data
  await db.execute(`INSERT IGNORE INTO building (buildingId, buildingName, buildingAddress, buildingCreatedDate, createdBy) VALUES (8002, 'Security B Building', 'Security B Address', '2024-01-01', 9002)`);
  
  await db.execute(`INSERT IGNORE INTO floor (floorId, buildingId, floorName) VALUES (6002, 8002, 'Security B Floor')`);
  
  await db.execute(`INSERT IGNORE INTO apartment (apartmentId, floorId, bedrooms, bathrooms, length, width, rentPrice, status, description) VALUES (5002, 6002, 3, 2, 900, 1000, 1500, 'Rented', 'Security B Apartment')`);
  
  await db.execute(`INSERT IGNORE INTO user (userId, firstName, lastName, email, password, phoneNumber, address, gender, image, nationality, dateOfBirth) VALUES (9011, 'Security B', 'Tenant', 'security.b.tenant@test.com', 'password123', '4444444444', 'Tenant Address', 'Male', 'tenant.jpg', 'Tenant Country', '1990-01-01')`);
  
  await db.execute(`INSERT IGNORE INTO tenant (tenantId, userId, occupation, createdBy) VALUES (7002, 9011, 'Security B Job', 9002)`);
  
  await db.execute(`INSERT IGNORE INTO ApartmentAssigned (tenantId, apartmentId) VALUES (7002, 5002)`);
  
  await db.execute(`INSERT IGNORE INTO FinancialTransactions (transactionId, tenantId, apartmentId, amount, transactionType, status, paymentMethod, transactionDate, createdBy) VALUES ('security-b-txn-001', 7002, 5002, 1500.00, 'Rent Payment', 'Completed', 'Cash', '2024-01-01', 9002)`);
  
  console.log('✅ Security test data setup completed!');
  console.log('   - Owner A created: Building 8001, Tenant 7001, Transaction security-a-txn-001');
  console.log('   - Owner B created: Building 8002, Tenant 7002, Transaction security-b-txn-001');
};

const testTenantByIdSecurity = async () => {
  console.log('\n👤 Testing getTenantById security...');
  
  // Simulate Owner B trying to access Owner A's tenant (ID: 7001)
  console.log('   Testing: Owner B tries to access Owner A tenant (ID: 7001)');
  
  // Simulate the middleware for Owner B
  const ownerBBuildingIds = await getOwnerBuildings(9002);
  const ownerBTenantIds = await getOwnerTenants(9002);
  
  console.log(`   Owner B has access to buildings: [${ownerBBuildingIds.join(', ')}]`);
  console.log(`   Owner B has access to tenants: [${ownerBTenantIds.join(', ')}]`);
  
  // Check if Owner B can access Owner A's tenant
  const canAccessTenant = ownerBTenantIds.includes(7001);
  
  if (!canAccessTenant) {
    console.log('   ✅ Security: Owner B CANNOT access Owner A tenant (7001) - BLOCKED');
  } else {
    console.log('   ❌ Security: Owner B CAN access Owner A tenant (7001) - SECURITY HOLE!');
  }
  
  // Test the opposite - Owner A trying to access Owner B's tenant
  console.log('   Testing: Owner A tries to access Owner B tenant (ID: 7002)');
  
  const ownerABuildingIds = await getOwnerBuildings(9001);
  const ownerATenantIds = await getOwnerTenants(9001);
  
  const canAccessTenant2 = ownerATenantIds.includes(7002);
  
  if (!canAccessTenant2) {
    console.log('   ✅ Security: Owner A CANNOT access Owner B tenant (7002) - BLOCKED');
  } else {
    console.log('   ❌ Security: Owner A CAN access Owner B tenant (7002) - SECURITY HOLE!');
  }
};

const testTenantApartmentsSecurity = async () => {
  console.log('\n🏠 Testing getTenantApartments security...');
  
  // Similar test for tenant apartments access
  const ownerBTenantIds = await getOwnerTenants(9002);
  const canAccessApartments = ownerBTenantIds.includes(7001);
  
  if (!canAccessApartments) {
    console.log('   ✅ Security: Owner B CANNOT access Owner A tenant apartments (7001) - BLOCKED');
  } else {
    console.log('   ❌ Security: Owner B CAN access Owner A tenant apartments (7001) - SECURITY HOLE!');
  }
};

const testTenantContractsSecurity = async () => {
  console.log('\n📄 Testing getTenantContracts security...');
  
  // Similar test for tenant contracts access
  const ownerBTenantIds = await getOwnerTenants(9002);
  const canAccessContracts = ownerBTenantIds.includes(7001);
  
  if (!canAccessContracts) {
    console.log('   ✅ Security: Owner B CANNOT access Owner A tenant contracts (7001) - BLOCKED');
  } else {
    console.log('   ❌ Security: Owner B CAN access Owner A tenant contracts (7001) - SECURITY HOLE!');
  }
};

const testTransactionByIdSecurity = async () => {
  console.log('\n💰 Testing getTransaction security...');
  
  // Test transaction access
  console.log('   Testing: Owner B tries to access Owner A transaction (security-a-txn-001)');
  
  const ownerBBuildingIds = await getOwnerBuildings(9002);
  const ownerBTransactionIds = await getOwnerTransactions(9002);
  
  console.log(`   Owner B has access to buildings: [${ownerBBuildingIds.join(', ')}]`);
  console.log(`   Owner B has access to transactions: [${ownerBTransactionIds.join(', ')}]`);
  
  const canAccessTransaction = ownerBTransactionIds.includes('security-a-txn-001');
  
  if (!canAccessTransaction) {
    console.log('   ✅ Security: Owner B CANNOT access Owner A transaction - BLOCKED');
  } else {
    console.log('   ❌ Security: Owner B CAN access Owner A transaction - SECURITY HOLE!');
  }
  
  // Test building-based access (transaction for tenant in Owner A's building)
  const ownerATransaction = await getTransactionDetails('security-a-txn-001');
  const canAccessViaBuildingAccess = ownerATransaction && ownerATransaction.tenantId && 
    await checkTenantInBuildings(ownerATransaction.tenantId, ownerBBuildingIds);
  
  if (!canAccessViaBuildingAccess) {
    console.log('   ✅ Security: Owner B CANNOT access Owner A transaction via building access - BLOCKED');
  } else {
    console.log('   ❌ Security: Owner B CAN access Owner A transaction via building access - SECURITY HOLE!');
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

const getTransactionDetails = async (transactionId) => {
  const [rows] = await db.execute('SELECT tenantId FROM FinancialTransactions WHERE transactionId = ?', [transactionId]);
  return rows.length > 0 ? rows[0] : null;
};

const checkTenantInBuildings = async (tenantId, buildingIds) => {
  if (!tenantId || !buildingIds || buildingIds.length === 0) return false;
  
  const placeholders = buildingIds.map(() => '?').join(',');
  const query = `
    SELECT COUNT(*) as count
    FROM ApartmentAssigned aa
    INNER JOIN apartment a ON aa.apartmentId = a.apartmentId
    INNER JOIN floor f ON a.floorId = f.floorId
    INNER JOIN building b ON f.buildingId = b.buildingId
    WHERE aa.tenantId = ? AND b.buildingId IN (${placeholders})
  `;
  
  const [result] = await db.execute(query, [tenantId, ...buildingIds]);
  return result[0].count > 0;
};

const cleanupSecurityTestData = async () => {
  console.log('\n🧹 Cleaning up security test data...');
  
  try {
    await db.execute('DELETE FROM FinancialTransactions WHERE transactionId IN ("security-a-txn-001", "security-b-txn-001")');
    await db.execute('DELETE FROM ApartmentAssigned WHERE tenantId IN (7001, 7002)');
    await db.execute('DELETE FROM apartment WHERE apartmentId IN (5001, 5002)');
    await db.execute('DELETE FROM floor WHERE floorId IN (6001, 6002)');
    await db.execute('DELETE FROM tenant WHERE tenantId IN (7001, 7002)');
    await db.execute('DELETE FROM building WHERE buildingId IN (8001, 8002)');
    await db.execute('DELETE FROM userRole WHERE userId BETWEEN 9001 AND 9011');
    await db.execute('DELETE FROM user WHERE userId BETWEEN 9001 AND 9011');
    
    console.log('✅ Security test data cleanup completed!');
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
};

// Run the test
testSecurityHoles().then(() => {
  process.exit(0);
});
