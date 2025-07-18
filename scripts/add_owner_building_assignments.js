import db from '../config/db.js';

/**
 * Add Building Assignments for Owner Users
 * This script assigns buildings to owner users for testing purposes
 */

const addOwnerBuildingAssignments = async () => {
  try {
    console.log('🏢 ADDING BUILDING ASSIGNMENTS FOR OWNER USERS\n');
    console.log('='.repeat(60));

    // Step 1: Get owner users
    console.log('\n📋 Step 1: Getting owner users...');
    
    const [ownerUsers] = await db.execute(`
      SELECT u.userId, u.firstName, u.lastName, u.email
      FROM user u
      INNER JOIN userRole ur ON u.userId = ur.userId
      WHERE ur.roleId = 2
    `);

    if (ownerUsers.length === 0) {
      console.log('❌ No owner users found');
      return;
    }

    console.log(`✅ Found ${ownerUsers.length} owner users:`);
    ownerUsers.forEach(user => {
      console.log(`  - ${user.firstName} ${user.lastName} (${user.email}) - ID: ${user.userId}`);
    });

    // Step 2: Get available buildings
    console.log('\n📋 Step 2: Getting available buildings...');
    
    const [buildings] = await db.execute(`
      SELECT buildingId, buildingName, buildingAddress
      FROM building
      ORDER BY buildingId
      LIMIT 10
    `);

    if (buildings.length === 0) {
      console.log('❌ No buildings found');
      return;
    }

    console.log(`✅ Found ${buildings.length} buildings:`);
    buildings.forEach(building => {
      console.log(`  - ${building.buildingName} (ID: ${building.buildingId}) - ${building.buildingAddress}`);
    });

    // Step 3: Create building assignments
    console.log('\n📋 Step 3: Creating building assignments...');
    
    let assignmentCount = 0;
    
    for (let i = 0; i < ownerUsers.length && i < buildings.length; i++) {
      const owner = ownerUsers[i];
      const building = buildings[i];
      
      // Check if assignment already exists
      const [existingAssignment] = await db.execute(`
        SELECT COUNT(*) as count FROM buildingAssigned 
        WHERE userId = ? AND buildingId = ?
      `, [owner.userId, building.buildingId]);

      if (existingAssignment[0].count === 0) {
        // Create the assignment
        await db.execute(`
          INSERT INTO buildingAssigned (userId, buildingId)
          VALUES (?, ?)
        `, [owner.userId, building.buildingId]);
        
        console.log(`  ✅ Assigned ${building.buildingName} to ${owner.firstName} ${owner.lastName}`);
        assignmentCount++;
      } else {
        console.log(`  ⚠️ ${building.buildingName} already assigned to ${owner.firstName} ${owner.lastName}`);
      }
    }

    // If we have more buildings than owners, assign additional buildings to the first owner
    if (buildings.length > ownerUsers.length && ownerUsers.length > 0) {
      const firstOwner = ownerUsers[0];
      
      for (let i = ownerUsers.length; i < Math.min(buildings.length, ownerUsers.length + 2); i++) {
        const building = buildings[i];
        
        // Check if assignment already exists
        const [existingAssignment] = await db.execute(`
          SELECT COUNT(*) as count FROM buildingAssigned 
          WHERE userId = ? AND buildingId = ?
        `, [firstOwner.userId, building.buildingId]);

        if (existingAssignment[0].count === 0) {
          // Create the assignment
          await db.execute(`
            INSERT INTO buildingAssigned (userId, buildingId)
            VALUES (?, ?)
          `, [firstOwner.userId, building.buildingId]);
          
          console.log(`  ✅ Assigned additional building ${building.buildingName} to ${firstOwner.firstName} ${firstOwner.lastName}`);
          assignmentCount++;
        }
      }
    }

    // Step 4: Verify assignments
    console.log('\n📋 Step 4: Verifying building assignments...');
    
    const [finalAssignments] = await db.execute(`
      SELECT ba.userId, ba.buildingId,
             u.firstName, u.lastName, u.email,
             b.buildingName, b.buildingAddress
      FROM buildingAssigned ba
      INNER JOIN user u ON ba.userId = u.userId
      INNER JOIN building b ON ba.buildingId = b.buildingId
      INNER JOIN userRole ur ON u.userId = ur.userId
      WHERE ur.roleId = 2
      ORDER BY u.userId, b.buildingId
    `);

    console.log(`✅ Total building assignments: ${finalAssignments.length}`);
    
    if (finalAssignments.length > 0) {
      console.log('\n📊 Building Assignments Summary:');
      
      const assignmentsByOwner = {};
      finalAssignments.forEach(assignment => {
        const ownerKey = `${assignment.firstName} ${assignment.lastName}`;
        if (!assignmentsByOwner[ownerKey]) {
          assignmentsByOwner[ownerKey] = [];
        }
        assignmentsByOwner[ownerKey].push({
          buildingName: assignment.buildingName,
          buildingId: assignment.buildingId
        });
      });

      Object.entries(assignmentsByOwner).forEach(([ownerName, buildings]) => {
        console.log(`\n  👤 ${ownerName}:`);
        buildings.forEach(building => {
          console.log(`    - ${building.buildingName} (ID: ${building.buildingId})`);
        });
      });
    }

    // Step 5: Test financial transaction access
    console.log('\n📋 Step 5: Testing financial transaction access...');
    
    if (finalAssignments.length > 0) {
      const testOwner = finalAssignments[0];
      
      // Get owner's assigned buildings
      const [ownerBuildings] = await db.execute(`
        SELECT buildingId FROM buildingAssigned WHERE userId = ?
      `, [testOwner.userId]);

      if (ownerBuildings.length > 0) {
        const buildingIds = ownerBuildings.map(b => b.buildingId);
        const placeholders = buildingIds.map(() => '?').join(',');
        
        // Check if owner can access transactions for their buildings
        const [accessibleTransactions] = await db.execute(`
          SELECT COUNT(DISTINCT ft.transactionId) as count
          FROM FinancialTransactions ft
          INNER JOIN ApartmentAssigned aa ON ft.tenantId = aa.tenantId
          INNER JOIN apartment a ON aa.apartmentId = a.apartmentId
          INNER JOIN floor f ON a.floorId = f.floorId
          WHERE f.buildingId IN (${placeholders})
        `, buildingIds);

        console.log(`✅ Owner ${testOwner.firstName} ${testOwner.lastName} can access ${accessibleTransactions[0].count} transactions`);
      }
    }

    console.log('\n🎯 BUILDING ASSIGNMENTS CREATION COMPLETE!');
    console.log(`✅ Created ${assignmentCount} new building assignments`);
    console.log(`✅ Total assignments: ${finalAssignments.length}`);
    console.log('✅ Owner users can now access their assigned building data');
    console.log('✅ Financial transaction filtering will work properly');

  } catch (error) {
    console.error('💥 Error adding building assignments:', error);
  } finally {
    process.exit(0);
  }
};

// Run the script
addOwnerBuildingAssignments();
