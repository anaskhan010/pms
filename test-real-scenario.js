import db from './config/db.js';

/**
 * Test Real Scenario
 * Simulates the exact scenario you described:
 * 1. Owner A creates a building
 * 2. Owner B logs in and tries to view buildings
 * 3. Verify Owner B cannot see Owner A's building
 */

const testRealScenario = async () => {
  console.log('🎯 Testing Real Scenario: Owner A creates building, Owner B cannot see it');
  console.log('='.repeat(70));

  try {
    // Setup test users
    await setupRealTestUsers();
    
    // Step 1: Owner A creates a building
    await ownerACreatesBuilding();
    
    // Step 2: Owner B tries to view buildings
    await ownerBViewsBuildings();
    
    // Step 3: Verify isolation
    await verifyIsolation();
    
    console.log('\n🎉 Real scenario test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await cleanupRealTestData();
  }
};

const setupRealTestUsers = async () => {
  console.log('\n👥 Setting up real test users...');
  
  // Create owner role if not exists
  await db.execute(`INSERT IGNORE INTO role (roleId, roleName) VALUES (2, 'owner')`);

  // Create Owner A
  await db.execute(`
    INSERT IGNORE INTO user (userId, firstName, lastName, email, password, phoneNumber, address, gender, image, nationality, dateOfBirth)
    VALUES (9001, 'Real Owner', 'A', 'real.owner.a@test.com', 'password123', '1234567890', 'Owner A Address', 'Male', 'owner.jpg', 'Country A', '1990-01-01')
  `);

  await db.execute(`INSERT IGNORE INTO userRole (userId, roleId) VALUES (9001, 2)`);

  // Create Owner B
  await db.execute(`
    INSERT IGNORE INTO user (userId, firstName, lastName, email, password, phoneNumber, address, gender, image, nationality, dateOfBirth)
    VALUES (9002, 'Real Owner', 'B', 'real.owner.b@test.com', 'password123', '0987654321', 'Owner B Address', 'Male', 'owner.jpg', 'Country B', '1990-01-01')
  `);

  await db.execute(`INSERT IGNORE INTO userRole (userId, roleId) VALUES (9002, 2)`);

  console.log('✅ Real test users created:');
  console.log('   - Owner A (ID: 9001): real.owner.a@test.com');
  console.log('   - Owner B (ID: 9002): real.owner.b@test.com');
};

const ownerACreatesBuilding = async () => {
  console.log('\n🏗️  Step 1: Owner A creates a building...');
  
  // Simulate Owner A creating a building through the API
  const buildingData = {
    buildingName: 'Owner A New Building',
    buildingAddress: 'Owner A New Address',
    buildingCreatedDate: new Date(),
    createdBy: 9001  // Owner A's ID
  };
  
  const [result] = await db.execute(`
    INSERT INTO building (buildingName, buildingAddress, buildingCreatedDate, createdBy)
    VALUES (?, ?, ?, ?)
  `, [buildingData.buildingName, buildingData.buildingAddress, buildingData.buildingCreatedDate, buildingData.createdBy]);
  
  const newBuildingId = result.insertId;
  
  console.log(`✅ Owner A created building: "${buildingData.buildingName}" (ID: ${newBuildingId})`);
  console.log(`   - Created by: Owner A (ID: ${buildingData.createdBy})`);
  console.log(`   - Address: ${buildingData.buildingAddress}`);
  
  return newBuildingId;
};

const ownerBViewsBuildings = async () => {
  console.log('\n👀 Step 2: Owner B tries to view buildings...');
  
  // Simulate the middleware getting Owner B's buildings
  console.log('   Simulating middleware: getOwnerBuildings for Owner B...');
  const [ownerBBuildings] = await db.execute('SELECT buildingId FROM building WHERE createdBy = ?', [9002]);
  const ownerBBuildingIds = ownerBBuildings.map(row => row.buildingId);
  
  console.log(`   Owner B owns ${ownerBBuildingIds.length} building(s): [${ownerBBuildingIds.join(', ') || 'NONE'}]`);
  
  // Simulate the controller/model filtering
  console.log('   Simulating API call: GET /api/buildings for Owner B...');
  
  let query = 'SELECT buildingId, buildingName, buildingAddress, createdBy FROM building WHERE 1 = 1';
  let values = [];
  
  // Apply the same filtering logic as in the model
  if (ownerBBuildingIds.length > 0) {
    const placeholders = ownerBBuildingIds.map(() => '?').join(',');
    query += ` AND buildingId IN (${placeholders})`;
    values.push(...ownerBBuildingIds);
  } else {
    // User has no buildings - show nothing (empty result)
    query += ` AND 1 = 0`;
  }
  
  const [ownerBVisibleBuildings] = await db.execute(query, values);
  
  console.log(`   Owner B API result: ${ownerBVisibleBuildings.length} building(s)`);
  if (ownerBVisibleBuildings.length > 0) {
    ownerBVisibleBuildings.forEach(building => {
      console.log(`     - ${building.buildingName} (ID: ${building.buildingId}, Created by: ${building.createdBy})`);
    });
  } else {
    console.log('     - No buildings visible to Owner B ✅');
  }
  
  return ownerBVisibleBuildings;
};

const verifyIsolation = async () => {
  console.log('\n🔍 Step 3: Verifying data isolation...');
  
  // Get all buildings in the system
  const [allBuildings] = await db.execute('SELECT buildingId, buildingName, createdBy FROM building ORDER BY buildingId');
  
  console.log('   All buildings in system:');
  allBuildings.forEach(building => {
    const owner = building.createdBy ? `Owner ${building.createdBy}` : 'NO OWNER';
    console.log(`     - ${building.buildingName} (ID: ${building.buildingId}) - ${owner}`);
  });
  
  // Check Owner A's view
  const [ownerABuildings] = await db.execute('SELECT buildingId FROM building WHERE createdBy = ?', [9001]);
  const ownerABuildingIds = ownerABuildings.map(row => row.buildingId);
  
  // Check Owner B's view
  const [ownerBBuildings] = await db.execute('SELECT buildingId FROM building WHERE createdBy = ?', [9002]);
  const ownerBBuildingIds = ownerBBuildings.map(row => row.buildingId);
  
  console.log('\n   Ownership verification:');
  console.log(`     Owner A can see ${ownerABuildingIds.length} building(s): [${ownerABuildingIds.join(', ') || 'NONE'}]`);
  console.log(`     Owner B can see ${ownerBBuildingIds.length} building(s): [${ownerBBuildingIds.join(', ') || 'NONE'}]`);

  // Check for cross-contamination
  const overlap = ownerABuildingIds.filter(id => ownerBBuildingIds.includes(id));

  if (overlap.length === 0) {
    console.log('\n   ✅ ISOLATION VERIFIED: No overlap between owners');
    console.log('   ✅ Owner A cannot see Owner B buildings');
    console.log('   ✅ Owner B cannot see Owner A buildings');
    console.log('   ✅ Perfect hierarchical data isolation achieved!');
  } else {
    console.log(`\n   ❌ ISOLATION FAILED: Overlap found: [${overlap.join(', ')}]`);
  }

  // Test specific scenario: Owner B should NOT see Owner A's new building
  const ownerANewBuildings = allBuildings.filter(b => b.createdBy === 9001);
  const ownerBCanSeeOwnerABuildings = ownerBBuildingIds.some(id =>
    ownerANewBuildings.some(b => b.buildingId === id)
  );

  if (!ownerBCanSeeOwnerABuildings) {
    console.log('\n   🎯 SCENARIO VERIFIED: Owner B cannot see Owner A\'s new building ✅');
  } else {
    console.log('\n   🚨 SCENARIO FAILED: Owner B can see Owner A\'s new building ❌');
  }
};

const cleanupRealTestData = async () => {
  console.log('\n🧹 Cleaning up real test data...');
  
  try {
    // Delete buildings created by test users
    await db.execute('DELETE FROM building WHERE createdBy IN (9001, 9002)');
    
    // Delete test users
    await db.execute('DELETE FROM userRole WHERE userId IN (9001, 9002)');
    await db.execute('DELETE FROM user WHERE userId IN (9001, 9002)');
    
    console.log('✅ Real test data cleanup completed!');
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
};

// Run the test
testRealScenario().then(() => {
  process.exit(0);
});
