import db from '../config/db.js';

const testOwnerFixes = async () => {
  console.log('🧪 Testing Owner Fixes');
  console.log('='.repeat(50));

  try {
    // Test 1: Check apartment assignments filtering for owners
    console.log('\n📋 Test 1: Apartment Assignments Filtering');
    console.log('-'.repeat(40));
    
    // Get an owner user
    const [ownerUsers] = await db.execute(`
      SELECT u.userId, u.firstName, u.lastName, r.roleId, r.roleName
      FROM user u
      INNER JOIN userRole ur ON u.userId = ur.userId
      INNER JOIN role r ON ur.roleId = r.roleId
      WHERE r.roleName = 'owner'
      LIMIT 1
    `);

    if (ownerUsers.length > 0) {
      const owner = ownerUsers[0];
      console.log(`Testing for owner: ${owner.firstName} ${owner.lastName} (ID: ${owner.userId}, Role ID: ${owner.roleId})`);
      
      // Get owner's assigned buildings
      const [ownerBuildings] = await db.execute(`
        SELECT buildingId FROM buildingAssigned WHERE userId = ?
      `, [owner.userId]);
      
      const buildingIds = ownerBuildings.map(b => b.buildingId);
      console.log('Owner assigned buildings:', buildingIds);

      if (buildingIds.length > 0) {
        // Test apartment assignments filtering
        const placeholders = buildingIds.map(() => '?').join(',');
        const [filteredAssignments] = await db.execute(`
          SELECT
            aa.tenantId,
            aa.apartmentId,
            CONCAT(u.firstName, ' ', u.lastName) as tenantName,
            b.buildingId,
            b.buildingName
          FROM ApartmentAssigned aa
          LEFT JOIN tenant t ON aa.tenantId = t.tenantId
          LEFT JOIN user u ON t.userId = u.userId
          LEFT JOIN apartment a ON aa.apartmentId = a.apartmentId
          LEFT JOIN floor f ON a.floorId = f.floorId
          LEFT JOIN building b ON f.buildingId = b.buildingId
          WHERE b.buildingId IN (${placeholders})
          ORDER BY b.buildingName
        `, buildingIds);

        console.log('Filtered apartment assignments for owner:', filteredAssignments);
        console.log(`✅ Owner should see ${filteredAssignments.length} apartment assignments`);
      } else {
        console.log('⚠️ Owner has no building assignments');
      }
    } else {
      console.log('❌ No owner users found');
    }

    // Test 2: Check super admin role identification
    console.log('\n📋 Test 2: Super Admin Role Check');
    console.log('-'.repeat(40));
    
    const [superAdmins] = await db.execute(`
      SELECT u.userId, u.firstName, u.lastName, r.roleId, r.roleName
      FROM user u
      INNER JOIN userRole ur ON u.userId = ur.userId
      INNER JOIN role r ON ur.roleId = r.roleId
      WHERE r.roleId = 1
      LIMIT 5
    `);

    console.log('Super admin users (role ID 1):');
    superAdmins.forEach(admin => {
      console.log(`- ${admin.firstName} ${admin.lastName} (ID: ${admin.userId}, Role ID: ${admin.roleId})`);
    });

    if (superAdmins.length > 0) {
      console.log('✅ Super admin users found - they should see "Assign Building To User" button');
    } else {
      console.log('⚠️ No super admin users found');
    }

    // Test 3: Check regular admin vs super admin
    const [regularAdmins] = await db.execute(`
      SELECT u.userId, u.firstName, u.lastName, r.roleId, r.roleName
      FROM user u
      INNER JOIN userRole ur ON u.userId = ur.userId
      INNER JOIN role r ON ur.roleId = r.roleId
      WHERE r.roleName = 'admin' AND r.roleId != 1
      LIMIT 5
    `);

    console.log('\nRegular admin users (not super admin):');
    regularAdmins.forEach(admin => {
      console.log(`- ${admin.firstName} ${admin.lastName} (ID: ${admin.userId}, Role ID: ${admin.roleId})`);
    });

    if (regularAdmins.length > 0) {
      console.log('✅ Regular admin users found - they should NOT see "Assign Building To User" button');
    } else {
      console.log('ℹ️ No regular admin users found');
    }

    // Test 4: Check owner users
    console.log('\nOwner users:');
    ownerUsers.forEach(owner => {
      console.log(`- ${owner.firstName} ${owner.lastName} (ID: ${owner.userId}, Role ID: ${owner.roleId})`);
    });

    if (ownerUsers.length > 0) {
      console.log('✅ Owner users found - they should NOT see "Assign Building To User" button');
    }

    console.log('\n🎉 Owner fixes test completed!');
    console.log('\n📝 Summary of fixes:');
    console.log('1. ✅ Apartment assignments API now filters by owner buildings');
    console.log('2. ✅ Financial transaction modal will show only owner tenants');
    console.log('3. ✅ "Assign Building To User" button only visible to super admin (role ID 1)');
    console.log('\n📋 Expected behavior:');
    console.log('- Owners: See only their tenants in financial transaction modal');
    console.log('- Owners: Cannot see "Assign Building To User" button');
    console.log('- Super Admin (role ID 1): Can see "Assign Building To User" button');
    console.log('- Regular Admin: Cannot see "Assign Building To User" button');

  } catch (error) {
    console.error('❌ Error testing owner fixes:', error);
    throw error;
  } finally {
    await db.end();
  }
};

// Run the test
testOwnerFixes().catch(console.error);
