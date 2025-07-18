import db from '../config/db.js';

/**
 * Enhance Role Permissions System
 * This script ensures all roles have appropriate permissions and can function properly
 */

const enhanceRolePermissions = async () => {
  try {
    console.log('🔧 ENHANCING ROLE PERMISSIONS SYSTEM\n');
    console.log('='.repeat(70));

    // Step 1: Define role-specific permissions
    console.log('\n📋 Step 1: Defining role-specific permissions...');
    
    const rolePermissions = {
      // Manager role (ID: 3) - Can manage tenants and buildings
      3: {
        roleName: 'manager',
        sidebarPages: ['Dashboard', 'Tenants', 'Buildings', 'Financial Transactions'],
        permissions: [
          'dashboard.view',
          'tenants.view', 'tenants.create', 'tenants.update',
          'buildings.view', 'buildings.update',
          'financial_transactions.view', 'financial_transactions.create'
        ]
      },
      // Staff role (ID: 4) - Basic access to view data
      4: {
        roleName: 'staff',
        sidebarPages: ['Dashboard', 'Tenants', 'Buildings'],
        permissions: [
          'dashboard.view',
          'tenants.view',
          'buildings.view'
        ]
      },
      // Maintenance role (ID: 5) - Can view and update buildings/villas
      5: {
        roleName: 'maintenance',
        sidebarPages: ['Dashboard', 'Buildings', 'Villas'],
        permissions: [
          'dashboard.view',
          'buildings.view', 'buildings.update',
          'villas.view', 'villas.update'
        ]
      },
      // Security role (ID: 6) - Can view tenants and buildings
      6: {
        roleName: 'security',
        sidebarPages: ['Dashboard', 'Tenants', 'Buildings', 'Messages'],
        permissions: [
          'dashboard.view',
          'tenants.view',
          'buildings.view',
          'messages.view'
        ]
      }
    };

    console.log(`✅ Defined permissions for ${Object.keys(rolePermissions).length} staff roles`);

    // Step 2: Grant sidebar page permissions
    console.log('\n📋 Step 2: Granting sidebar page permissions...');
    
    for (const [roleId, roleConfig] of Object.entries(rolePermissions)) {
      console.log(`\n🔧 Setting up ${roleConfig.roleName} role (ID: ${roleId})...`);
      
      // Clear existing permissions for this role
      await db.execute(`
        DELETE FROM role_page_permissions WHERE roleId = ?
      `, [roleId]);
      
      // Grant sidebar page permissions
      for (const pageName of roleConfig.sidebarPages) {
        const [pageResult] = await db.execute(`
          SELECT pageId FROM sidebar_pages WHERE pageName = ?
        `, [pageName]);
        
        if (pageResult.length > 0) {
          const pageId = pageResult[0].pageId;
          
          // Grant view permission
          await db.execute(`
            INSERT INTO role_page_permissions (roleId, pageId, permissionType, isGranted)
            VALUES (?, ?, 'view', 1)
          `, [roleId, pageId]);
          
          console.log(`  ✅ Granted view access to: ${pageName}`);
        }
      }
    }

    // Step 3: Grant resource permissions
    console.log('\n📋 Step 3: Granting resource permissions...');
    
    for (const [roleId, roleConfig] of Object.entries(rolePermissions)) {
      console.log(`\n🔧 Setting up resource permissions for ${roleConfig.roleName}...`);
      
      // Clear existing resource permissions for this role
      await db.execute(`
        DELETE FROM role_permissions WHERE roleId = ?
      `, [roleId]);
      
      // Grant resource permissions
      for (const permissionName of roleConfig.permissions) {
        // Check if permission exists
        const [permissionResult] = await db.execute(`
          SELECT permissionId FROM permissions WHERE permissionName = ?
        `, [permissionName]);
        
        if (permissionResult.length > 0) {
          const permissionId = permissionResult[0].permissionId;
          
          // Grant permission to role
          await db.execute(`
            INSERT INTO role_permissions (roleId, permissionId)
            VALUES (?, ?)
          `, [roleId, permissionId]);
          
          console.log(`  ✅ Granted permission: ${permissionName}`);
        } else {
          console.log(`  ⚠️ Permission not found: ${permissionName}`);
        }
      }
    }

    // Step 4: Create missing permissions if needed
    console.log('\n📋 Step 4: Creating missing permissions...');
    
    const requiredPermissions = [
      { name: 'dashboard.view', resource: 'dashboard', action: 'view', description: 'View dashboard' },
      { name: 'tenants.view', resource: 'tenants', action: 'view', description: 'View tenants' },
      { name: 'tenants.create', resource: 'tenants', action: 'create', description: 'Create tenants' },
      { name: 'tenants.update', resource: 'tenants', action: 'update', description: 'Update tenants' },
      { name: 'buildings.view', resource: 'buildings', action: 'view', description: 'View buildings' },
      { name: 'buildings.update', resource: 'buildings', action: 'update', description: 'Update buildings' },
      { name: 'villas.view', resource: 'villas', action: 'view', description: 'View villas' },
      { name: 'villas.update', resource: 'villas', action: 'update', description: 'Update villas' },
      { name: 'financial_transactions.view', resource: 'financial_transactions', action: 'view', description: 'View financial transactions' },
      { name: 'financial_transactions.create', resource: 'financial_transactions', action: 'create', description: 'Create financial transactions' },
      { name: 'messages.view', resource: 'messages', action: 'view', description: 'View messages' }
    ];

    for (const perm of requiredPermissions) {
      const [existing] = await db.execute(`
        SELECT permissionId FROM permissions WHERE permissionName = ?
      `, [perm.name]);
      
      if (existing.length === 0) {
        await db.execute(`
          INSERT INTO permissions (permissionName, resource, action, description)
          VALUES (?, ?, ?, ?)
        `, [perm.name, perm.resource, perm.action, perm.description]);
        
        console.log(`  ✅ Created permission: ${perm.name}`);
      }
    }

    // Step 5: Re-run permission assignments with new permissions
    console.log('\n📋 Step 5: Re-assigning permissions with new permissions...');
    
    for (const [roleId, roleConfig] of Object.entries(rolePermissions)) {
      // Clear and re-assign permissions
      await db.execute(`DELETE FROM role_permissions WHERE roleId = ?`, [roleId]);
      
      for (const permissionName of roleConfig.permissions) {
        const [permissionResult] = await db.execute(`
          SELECT permissionId FROM permissions WHERE permissionName = ?
        `, [permissionName]);
        
        if (permissionResult.length > 0) {
          await db.execute(`
            INSERT INTO role_permissions (roleId, permissionId)
            VALUES (?, ?)
          `, [roleId, permissionResult[0].permissionId]);
        }
      }
      
      console.log(`  ✅ Re-assigned ${roleConfig.permissions.length} permissions to ${roleConfig.roleName}`);
    }

    // Step 6: Verify the enhancements
    console.log('\n📋 Step 6: Verifying enhancements...');
    
    const [updatedRolePermissions] = await db.execute(`
      SELECT r.roleName, COUNT(rp.permissionId) as permissionCount
      FROM role r
      LEFT JOIN role_permissions rp ON r.roleId = rp.roleId
      GROUP BY r.roleId, r.roleName
      ORDER BY r.roleId
    `);
    
    console.log(`✅ Updated role permission counts:`);
    updatedRolePermissions.forEach(rp => {
      console.log(`  - ${rp.roleName}: ${rp.permissionCount} permissions`);
    });

    const [updatedSidebarPermissions] = await db.execute(`
      SELECT r.roleName, COUNT(rpp.pageId) as pageCount
      FROM role r
      LEFT JOIN role_page_permissions rpp ON r.roleId = rpp.roleId AND rpp.isGranted = 1
      GROUP BY r.roleId, r.roleName
      ORDER BY r.roleId
    `);
    
    console.log(`\n✅ Updated sidebar page counts:`);
    updatedSidebarPermissions.forEach(srp => {
      console.log(`  - ${srp.roleName}: ${srp.pageCount} pages`);
    });

    // Step 7: Test a staff role user access
    console.log('\n📋 Step 7: Testing staff role access...');
    
    // Get a staff user or create test scenario
    const [staffUsers] = await db.execute(`
      SELECT u.userId, u.firstName, u.lastName, r.roleName
      FROM user u
      INNER JOIN userRole ur ON u.userId = ur.userId
      INNER JOIN role r ON ur.roleId = r.roleId
      WHERE r.roleId IN (3, 4, 5, 6)
      LIMIT 1
    `);
    
    if (staffUsers.length > 0) {
      const staffUser = staffUsers[0];
      console.log(`Testing with staff user: ${staffUser.firstName} ${staffUser.lastName} (${staffUser.roleName})`);
      
      // Test sidebar access
      const [staffPages] = await db.execute(`
        SELECT DISTINCT sp.pageName
        FROM sidebar_pages sp
        INNER JOIN page_permissions pp ON sp.pageId = pp.pageId
        INNER JOIN role_page_permissions rpp ON pp.pageId = rpp.pageId AND pp.permissionType = rpp.permissionType
        INNER JOIN userRole ur ON rpp.roleId = ur.roleId
        WHERE ur.userId = ? 
        AND sp.isActive = 1 
        AND pp.permissionType = 'view'
        AND rpp.isGranted = 1
        ORDER BY sp.displayOrder ASC
      `, [staffUser.userId]);
      
      console.log(`  ✅ Staff user can access ${staffPages.length} pages: [${staffPages.map(p => p.pageName).join(', ')}]`);
    } else {
      console.log(`  ⚠️ No staff users found for testing`);
    }

    console.log('\n🎯 ROLE PERMISSIONS ENHANCEMENT COMPLETE!');
    console.log('✅ All staff roles now have appropriate permissions');
    console.log('✅ Sidebar access configured for all roles');
    console.log('✅ Resource permissions assigned properly');
    console.log('✅ System ready for multi-role usage');

  } catch (error) {
    console.error('💥 Error during role permissions enhancement:', error);
  } finally {
    process.exit(0);
  }
};

// Run the enhancement
enhanceRolePermissions();
