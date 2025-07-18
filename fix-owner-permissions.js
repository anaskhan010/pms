import db from './config/db.js';

/**
 * Fix Owner Permissions Script
 * Removes general 'view' permissions from owner role to enforce data isolation
 * Keeps only 'view_own' permissions to ensure owners can only see their own data
 */

const fixOwnerPermissions = async () => {
  console.log('🔧 Fixing Owner Permissions for Data Isolation');
  console.log('='.repeat(60));

  try {
    // Get owner role ID
    const [ownerRole] = await db.execute('SELECT roleId, roleName FROM role WHERE roleName = ?', ['owner']);
    
    if (ownerRole.length === 0) {
      console.log('❌ Owner role not found');
      return;
    }

    const ownerRoleId = ownerRole[0].roleId;
    console.log(`✅ Found owner role with ID: ${ownerRoleId}`);

    // List of general 'view' permissions that should be removed from owner role
    // These allow access to ALL data instead of just owner's own data
    const generalViewPermissions = [
      'buildings.view',
      'tenants.view', 
      'apartments.view',
      'transactions.view',
      'financial_transactions.view',
      'villas.view',
      'users.view',
      'vendors.view',
      'virtual_tours.view',
      'messages.view',
      'permissions.view',
      'roles.view'
    ];

    console.log('\n🔍 Checking current owner permissions...');
    
    // Get all current permissions for owner role
    const [currentPermissions] = await db.execute(`
      SELECT p.permissionId, p.permissionName, p.resource, p.action, p.description
      FROM permissions p
      INNER JOIN role_permissions rp ON p.permissionId = rp.permissionId
      WHERE rp.roleId = ?
      ORDER BY p.resource, p.action
    `, [ownerRoleId]);

    console.log(`Found ${currentPermissions.length} permissions currently assigned to owner role`);

    // Find permissions to remove
    const permissionsToRemove = currentPermissions.filter(perm => 
      generalViewPermissions.includes(perm.permissionName)
    );

    console.log(`\n❌ Found ${permissionsToRemove.length} general 'view' permissions to remove:`);
    permissionsToRemove.forEach(perm => {
      console.log(`   - ${perm.permissionName} (${perm.description})`);
    });

    // Remove the problematic permissions
    if (permissionsToRemove.length > 0) {
      console.log('\n🗑️  Removing general view permissions...');
      
      for (const perm of permissionsToRemove) {
        await db.execute(`
          DELETE FROM role_permissions 
          WHERE roleId = ? AND permissionId = ?
        `, [ownerRoleId, perm.permissionId]);
        
        console.log(`   ✅ Removed: ${perm.permissionName}`);
      }
    }

    // Verify that view_own permissions still exist
    console.log('\n✅ Verifying view_own permissions are still present...');
    
    const viewOwnPermissions = [
      'buildings.view_own',
      'tenants.view_own',
      'apartments.view_own', 
      'transactions.view_own',
      'villas.view_own'
    ];

    for (const permName of viewOwnPermissions) {
      const [exists] = await db.execute(`
        SELECT COUNT(*) as count
        FROM permissions p
        INNER JOIN role_permissions rp ON p.permissionId = rp.permissionId
        WHERE rp.roleId = ? AND p.permissionName = ?
      `, [ownerRoleId, permName]);

      if (exists[0].count > 0) {
        console.log(`   ✅ ${permName} - Present`);
      } else {
        console.log(`   ❌ ${permName} - Missing`);
        
        // Try to add missing view_own permission
        const [permissionExists] = await db.execute(`
          SELECT permissionId FROM permissions WHERE permissionName = ?
        `, [permName]);
        
        if (permissionExists.length > 0) {
          await db.execute(`
            INSERT IGNORE INTO role_permissions (roleId, permissionId)
            VALUES (?, ?)
          `, [ownerRoleId, permissionExists[0].permissionId]);
          console.log(`   ➕ Added missing ${permName} permission`);
        }
      }
    }

    // Show final permissions for owner role
    console.log('\n📊 Final permissions for owner role:');
    const [finalPermissions] = await db.execute(`
      SELECT p.permissionName, p.resource, p.action, p.description
      FROM permissions p
      INNER JOIN role_permissions rp ON p.permissionId = rp.permissionId
      WHERE rp.roleId = ?
      ORDER BY p.resource, p.action
    `, [ownerRoleId]);

    // Group by resource for better display
    const permissionsByResource = {};
    finalPermissions.forEach(perm => {
      if (!permissionsByResource[perm.resource]) {
        permissionsByResource[perm.resource] = [];
      }
      permissionsByResource[perm.resource].push(perm);
    });

    Object.keys(permissionsByResource).forEach(resource => {
      console.log(`\n   ${resource.toUpperCase()}:`);
      permissionsByResource[resource].forEach(perm => {
        const isViewOwn = perm.action.includes('view_own');
        const icon = isViewOwn ? '🔒' : '🔓';
        console.log(`     ${icon} ${perm.permissionName} (${perm.action})`);
      });
    });

    // Test data isolation with a sample query
    console.log('\n🧪 Testing data isolation...');
    
    // Get a sample owner user
    const [ownerUsers] = await db.execute(`
      SELECT u.userId, u.firstName, u.lastName
      FROM user u
      INNER JOIN userRole ur ON u.userId = ur.userId
      WHERE ur.roleId = ?
      LIMIT 1
    `, [ownerRoleId]);

    if (ownerUsers.length > 0) {
      const testUserId = ownerUsers[0].userId;
      console.log(`Testing with user: ${ownerUsers[0].firstName} ${ownerUsers[0].lastName} (ID: ${testUserId})`);
      
      // Test building access
      const hasGeneralBuildingView = await checkPermission(testUserId, 'buildings', 'view');
      const hasOwnBuildingView = await checkPermission(testUserId, 'buildings', 'view_own');
      
      console.log(`   buildings.view: ${hasGeneralBuildingView ? '❌ YES (BAD)' : '✅ NO (GOOD)'}`);
      console.log(`   buildings.view_own: ${hasOwnBuildingView ? '✅ YES (GOOD)' : '❌ NO (BAD)'}`);
      
      // Test tenant access
      const hasGeneralTenantView = await checkPermission(testUserId, 'tenants', 'view');
      const hasOwnTenantView = await checkPermission(testUserId, 'tenants', 'view_own');
      
      console.log(`   tenants.view: ${hasGeneralTenantView ? '❌ YES (BAD)' : '✅ NO (GOOD)'}`);
      console.log(`   tenants.view_own: ${hasOwnTenantView ? '✅ YES (GOOD)' : '❌ NO (BAD)'}`);
    }

    console.log('\n🎉 Owner permissions fixed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - Removed ${permissionsToRemove.length} general 'view' permissions`);
    console.log('   - Kept view_own permissions for data isolation');
    console.log('   - Owners can now only see their own assigned data');

  } catch (error) {
    console.error('❌ Error fixing owner permissions:', error);
  } finally {
    process.exit(0);
  }
};

// Helper function to check if user has specific permission
const checkPermission = async (userId, resource, action) => {
  const [result] = await db.execute(`
    SELECT COUNT(*) as hasPermission
    FROM permissions p
    INNER JOIN role_permissions rp ON p.permissionId = rp.permissionId
    INNER JOIN userRole ur ON rp.roleId = ur.roleId
    WHERE ur.userId = ? AND p.resource = ? AND p.action = ?
  `, [userId, resource, action]);
  
  return result[0].hasPermission > 0;
};

// Run the fix
fixOwnerPermissions();
