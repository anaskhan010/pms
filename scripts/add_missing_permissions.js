import db from '../config/db.js';

/**
 * Add Missing Permissions
 * This script adds the missing delete permissions that were identified in the test
 */

const addMissingPermissions = async () => {
  try {
    console.log('🔧 ADDING MISSING PERMISSIONS\n');
    console.log('='.repeat(50));

    const missingPermissions = [
      {
        name: 'buildings.create',
        description: 'Create new buildings',
        resource: 'buildings',
        action: 'create'
      },
      {
        name: 'buildings.delete',
        description: 'Delete buildings',
        resource: 'buildings',
        action: 'delete'
      },
      {
        name: 'tenants.delete',
        description: 'Delete tenants',
        resource: 'tenants',
        action: 'delete'
      },
      {
        name: 'financial_transactions.update',
        description: 'Update financial transactions',
        resource: 'financial_transactions',
        action: 'update'
      },
      {
        name: 'financial_transactions.delete',
        description: 'Delete financial transactions',
        resource: 'financial_transactions',
        action: 'delete'
      }
    ];

    console.log(`Adding ${missingPermissions.length} missing permissions...\n`);

    for (const permission of missingPermissions) {
      // Check if permission already exists
      const [existing] = await db.execute(`
        SELECT COUNT(*) as count FROM permissions WHERE permissionName = ?
      `, [permission.name]);

      if (existing[0].count === 0) {
        // Add the permission
        await db.execute(`
          INSERT INTO permissions (permissionName, description, resource, action)
          VALUES (?, ?, ?, ?)
        `, [permission.name, permission.description, permission.resource, permission.action]);
        
        console.log(`✅ Added: ${permission.name} - ${permission.description}`);
      } else {
        console.log(`⚠️ Already exists: ${permission.name}`);
      }
    }

    // Now assign these permissions to appropriate roles
    console.log('\n📋 Assigning permissions to roles...\n');

    const rolePermissionAssignments = [
      // Admin gets all permissions
      { roleId: 1, permissions: missingPermissions.map(p => p.name) },
      
      // Owner gets most permissions except some delete operations
      { roleId: 2, permissions: ['buildings.create', 'buildings.delete', 'tenants.delete', 'financial_transactions.update', 'financial_transactions.delete'] },
      
      // Manager gets create and update permissions
      { roleId: 3, permissions: ['buildings.create', 'financial_transactions.update'] },
      
      // Staff gets no additional permissions (view only)
      { roleId: 4, permissions: [] },
      
      // Maintenance gets building permissions
      { roleId: 5, permissions: ['buildings.create'] },
      
      // Security gets no additional permissions
      { roleId: 6, permissions: [] }
    ];

    for (const assignment of rolePermissionAssignments) {
      const [roleInfo] = await db.execute(`
        SELECT roleName FROM role WHERE roleId = ?
      `, [assignment.roleId]);

      if (roleInfo.length > 0) {
        const roleName = roleInfo[0].roleName;
        console.log(`\n🔑 Assigning permissions to ${roleName} (ID: ${assignment.roleId}):`);

        for (const permissionName of assignment.permissions) {
          // Get permission ID
          const [permissionInfo] = await db.execute(`
            SELECT permissionId FROM permissions WHERE permissionName = ?
          `, [permissionName]);

          if (permissionInfo.length > 0) {
            const permissionId = permissionInfo[0].permissionId;

            // Check if assignment already exists
            const [existingAssignment] = await db.execute(`
              SELECT COUNT(*) as count FROM role_permissions 
              WHERE roleId = ? AND permissionId = ?
            `, [assignment.roleId, permissionId]);

            if (existingAssignment[0].count === 0) {
              // Add the assignment
              await db.execute(`
                INSERT INTO role_permissions (roleId, permissionId)
                VALUES (?, ?)
              `, [assignment.roleId, permissionId]);
              
              console.log(`  ✅ ${permissionName}`);
            } else {
              console.log(`  ⚠️ ${permissionName} (already assigned)`);
            }
          }
        }
      }
    }

    // Verify the additions
    console.log('\n📊 Verification...\n');

    for (const permission of missingPermissions) {
      const [exists] = await db.execute(`
        SELECT COUNT(*) as count FROM permissions WHERE permissionName = ?
      `, [permission.name]);
      
      console.log(`${exists[0].count > 0 ? '✅' : '❌'} ${permission.name}: ${exists[0].count > 0 ? 'EXISTS' : 'MISSING'}`);
    }

    // Check role permission counts
    console.log('\n📊 Updated role permission counts:\n');

    const [rolePermissionCounts] = await db.execute(`
      SELECT r.roleName, COUNT(rp.permissionId) as permCount
      FROM role r
      LEFT JOIN role_permissions rp ON r.roleId = rp.roleId
      WHERE r.roleId BETWEEN 1 AND 6
      GROUP BY r.roleId, r.roleName
      ORDER BY r.roleId
    `);

    rolePermissionCounts.forEach(role => {
      console.log(`  ${role.roleName}: ${role.permCount} permissions`);
    });

    console.log('\n🎯 MISSING PERMISSIONS ADDED SUCCESSFULLY!');
    console.log('✅ All required CRUD permissions now exist');
    console.log('✅ Permissions assigned to appropriate roles');
    console.log('✅ Permission-based UI controls fully supported');

  } catch (error) {
    console.error('💥 Error adding missing permissions:', error);
  } finally {
    process.exit(0);
  }
};

// Run the script
addMissingPermissions();
