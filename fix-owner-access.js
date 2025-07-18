import db from './config/db.js';

/**
 * Fix Owner Access Issues
 * This script will:
 * 1. Ensure all owner users have correct permissions
 * 2. Report on existing data issues
 * 3. Provide recommendations for fixing data
 */

const fixOwnerAccess = async () => {
  console.log('🔧 Fixing Owner Access Issues');
  console.log('='.repeat(50));

  try {
    await checkAndFixPermissions();
    await analyzeExistingData();
    await testOwnerAccess();
    
    console.log('\n🎉 Owner access fix completed!');
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
};

const checkAndFixPermissions = async () => {
  console.log('\n🔐 Checking and fixing permissions...');
  
  // Get owner role ID
  const [ownerRole] = await db.execute('SELECT roleId FROM role WHERE roleName = "owner"');
  if (ownerRole.length === 0) {
    console.log('❌ Owner role not found!');
    return;
  }
  
  const ownerRoleId = ownerRole[0].roleId;
  console.log(`✅ Found owner role with ID: ${ownerRoleId}`);
  
  // Required permissions for owners
  const requiredPermissions = [
    'buildings.view_own',
    'buildings.create',
    'buildings.update_own',
    'buildings.delete_own',
    'villas.view_own',
    'villas.create',
    'villas.update_own',
    'villas.delete_own',
    'tenants.view_own',
    'tenants.create',
    'tenants.update_own',
    'tenants.delete_own',
    'transactions.view_own',
    'transactions.create',
    'transactions.update_own',
    'transactions.delete_own',
    'users.view_own',
    'users.create',
    'users.update_own',
    'users.delete_own'
  ];
  
  console.log('   Checking required permissions...');
  let missingPermissions = 0;
  
  for (const permName of requiredPermissions) {
    // Check if permission exists
    const [permission] = await db.execute('SELECT permissionId FROM permissions WHERE permissionName = ?', [permName]);
    
    if (permission.length === 0) {
      console.log(`   ❌ Permission ${permName} does not exist in database`);
      continue;
    }
    
    const permissionId = permission[0].permissionId;
    
    // Check if owner role has this permission
    const [rolePermission] = await db.execute('SELECT * FROM role_permissions WHERE roleId = ? AND permissionId = ?', [ownerRoleId, permissionId]);
    
    if (rolePermission.length === 0) {
      // Add the permission
      await db.execute('INSERT INTO role_permissions (roleId, permissionId) VALUES (?, ?)', [ownerRoleId, permissionId]);
      console.log(`   ✅ Added: ${permName}`);
      missingPermissions++;
    } else {
      console.log(`   ✓ Already has: ${permName}`);
    }
  }
  
  if (missingPermissions > 0) {
    console.log(`   🔧 Fixed ${missingPermissions} missing permission(s)`);
  } else {
    console.log('   ✅ All required permissions are present');
  }
};

const analyzeExistingData = async () => {
  console.log('\n📊 Analyzing existing data...');
  
  // Check owner users
  const [owners] = await db.execute(`
    SELECT u.userId, u.firstName, u.lastName, u.email
    FROM user u
    INNER JOIN userRole ur ON u.userId = ur.userId
    WHERE ur.roleId = 2
    ORDER BY u.userId
  `);
  
  console.log(`   Found ${owners.length} owner user(s):`);
  owners.forEach(owner => {
    console.log(`     - ${owner.firstName} ${owner.lastName} (ID: ${owner.userId}) - ${owner.email}`);
  });
  
  if (owners.length === 0) {
    console.log('   ⚠️  No owner users found! You need to create owner users first.');
    return;
  }
  
  // Check data for each owner
  for (const owner of owners) {
    console.log(`\\n   📋 Data for ${owner.firstName} ${owner.lastName} (ID: ${owner.userId}):`);
    
    // Check buildings
    const [buildings] = await db.execute('SELECT buildingId, buildingName FROM building WHERE createdBy = ?', [owner.userId]);
    console.log(`     Buildings: ${buildings.length}`);
    buildings.forEach(building => {
      console.log(`       - ${building.buildingName} (ID: ${building.buildingId})`);
    });
    
    // Check villas
    const [villas] = await db.execute('SELECT villasId, Name FROM villas WHERE createdBy = ?', [owner.userId]);
    console.log(`     Villas: ${villas.length}`);
    villas.forEach(villa => {
      console.log(`       - ${villa.Name} (ID: ${villa.villasId})`);
    });
    
    // Check tenants
    const [tenants] = await db.execute(`
      SELECT t.tenantId, u.firstName, u.lastName
      FROM tenant t
      INNER JOIN user u ON t.userId = u.userId
      WHERE t.createdBy = ?
    `, [owner.userId]);
    console.log(`     Tenants: ${tenants.length}`);
    tenants.forEach(tenant => {
      console.log(`       - ${tenant.firstName} ${tenant.lastName} (ID: ${tenant.tenantId})`);
    });
    
    // Check tenants in owner's buildings
    const [buildingTenants] = await db.execute(`
      SELECT DISTINCT t.tenantId, u.firstName, u.lastName, b.buildingName
      FROM tenant t
      INNER JOIN user u ON t.userId = u.userId
      INNER JOIN ApartmentAssigned aa ON t.tenantId = aa.tenantId
      INNER JOIN apartment a ON aa.apartmentId = a.apartmentId
      INNER JOIN floor f ON a.floorId = f.floorId
      INNER JOIN building b ON f.buildingId = b.buildingId
      WHERE b.createdBy = ?
    `, [owner.userId]);
    console.log(`     Tenants in buildings: ${buildingTenants.length}`);
    buildingTenants.forEach(tenant => {
      console.log(`       - ${tenant.firstName} ${tenant.lastName} (ID: ${tenant.tenantId}) in ${tenant.buildingName}`);
    });
    
    // Check transactions
    const [transactions] = await db.execute('SELECT transactionId, amount FROM FinancialTransactions WHERE createdBy = ?', [owner.userId]);
    console.log(`     Transactions: ${transactions.length}`);
    transactions.forEach(transaction => {
      console.log(`       - ${transaction.transactionId} ($${transaction.amount})`);
    });
    
    // Check users
    const [users] = await db.execute(`
      SELECT userId, firstName, lastName
      FROM user
      WHERE createdBy = ?
    `, [owner.userId]);
    console.log(`     Users: ${users.length}`);
    users.forEach(user => {
      console.log(`       - ${user.firstName} ${user.lastName} (ID: ${user.userId})`);
    });
    
    const totalItems = buildings.length + villas.length + tenants.length + buildingTenants.length + transactions.length + users.length;
    if (totalItems === 0) {
      console.log(`     ⚠️  Owner has no data - they should create buildings/tenants first`);
    }
  }
  
  // Check orphan data
  console.log('\\n   👻 Checking orphan data (createdBy = NULL):');
  
  const [orphanBuildings] = await db.execute('SELECT COUNT(*) as count FROM building WHERE createdBy IS NULL');
  const [orphanVillas] = await db.execute('SELECT COUNT(*) as count FROM villas WHERE createdBy IS NULL');
  const [orphanTenants] = await db.execute('SELECT COUNT(*) as count FROM tenant WHERE createdBy IS NULL');
  const [orphanTransactions] = await db.execute('SELECT COUNT(*) as count FROM FinancialTransactions WHERE createdBy IS NULL');
  const [orphanUsers] = await db.execute('SELECT COUNT(*) as count FROM user WHERE createdBy IS NULL AND userId NOT IN (SELECT userId FROM userRole WHERE roleId = 1)');
  
  console.log(`     Orphan buildings: ${orphanBuildings[0].count}`);
  console.log(`     Orphan villas: ${orphanVillas[0].count}`);
  console.log(`     Orphan tenants: ${orphanTenants[0].count}`);
  console.log(`     Orphan transactions: ${orphanTransactions[0].count}`);
  console.log(`     Orphan users: ${orphanUsers[0].count}`);
  
  const totalOrphans = orphanBuildings[0].count + orphanVillas[0].count + orphanTenants[0].count + orphanTransactions[0].count + orphanUsers[0].count;
  if (totalOrphans > 0) {
    console.log(`     ⚠️  Found ${totalOrphans} orphan record(s) - these won't be visible to owners`);
    console.log(`     💡 You may need to assign ownership to these records or delete them`);
  }
};

const testOwnerAccess = async () => {
  console.log('\\n🧪 Testing owner access...');
  
  // Get first owner
  const [owners] = await db.execute(`
    SELECT u.userId, u.firstName, u.lastName
    FROM user u
    INNER JOIN userRole ur ON u.userId = ur.userId
    WHERE ur.roleId = 2
    LIMIT 1
  `);
  
  if (owners.length === 0) {
    console.log('   ❌ No owner users to test');
    return;
  }
  
  const owner = owners[0];
  console.log(`   Testing access for: ${owner.firstName} ${owner.lastName} (ID: ${owner.userId})`);
  
  // Simulate middleware
  const [buildingRows] = await db.execute('SELECT buildingId FROM building WHERE createdBy = ?', [owner.userId]);
  const buildingIds = buildingRows.map(row => row.buildingId);
  
  const [tenantRows] = await db.execute('SELECT tenantId FROM tenant WHERE createdBy = ?', [owner.userId]);
  const tenantIds = tenantRows.map(row => row.tenantId);
  
  console.log(`   Owner has ${buildingIds.length} building(s) and ${tenantIds.length} direct tenant(s)`);
  
  // Test tenant query
  if (buildingIds.length > 0 || tenantIds.length > 0) {
    let query = `
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

    if (tenantIds.length > 0) {
      ownershipConditions.push(`t.tenantId IN (${tenantIds.map(() => '?').join(',')})`);
      values.push(...tenantIds);
    }

    if (ownershipConditions.length > 0) {
      query += ` AND (${ownershipConditions.join(' OR ')})`;
      query += ' AND t.createdBy IS NOT NULL';
    }
    
    const [results] = await db.execute(query, values);
    console.log(`   Owner can see ${results.length} tenant(s) through API`);
    
    if (results.length > 0) {
      console.log('   ✅ Owner access is working correctly');
    } else {
      console.log('   ⚠️  Owner cannot see any tenants - check if tenants are properly assigned to apartments');
    }
  } else {
    console.log('   💡 Owner has no buildings or tenants - they need to create some first');
  }
};

// Run the fix
fixOwnerAccess().then(() => {
  process.exit(0);
});
