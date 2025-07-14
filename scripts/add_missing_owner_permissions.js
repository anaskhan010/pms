import db from '../config/db.js';

const addMissingOwnerPermissions = async () => {
  try {
    console.log('🔧 Adding missing permissions for owner role...\n');

    // Get owner role ID
    const [ownerRole] = await db.execute(`
      SELECT roleId, roleName FROM role WHERE roleName = 'owner'
    `);

    if (ownerRole.length === 0) {
      console.log('❌ Owner role not found in database');
      return;
    }

    const ownerRoleId = ownerRole[0].roleId;
    console.log(`✅ Found owner role with ID: ${ownerRoleId}`);

    // List of permissions that owner should have
    const requiredPermissions = [
      'apartments.assign',
      'apartments.view_own',
      'tenants.assign'
    ];

    for (const permissionName of requiredPermissions) {
      console.log(`\n🔍 Checking permission: ${permissionName}`);
      
      // Check if permission exists
      const [permission] = await db.execute(`
        SELECT permissionId, permissionName FROM permissions WHERE permissionName = ?
      `, [permissionName]);

      let permissionId;

      if (permission.length === 0) {
        console.log(`➕ Creating missing permission: ${permissionName}`);
        
        // Extract resource and action from permission name
        const [resource, action] = permissionName.split('.');
        
        // Create the permission
        const [insertResult] = await db.execute(`
          INSERT INTO permissions (permissionName, resource, action, description)
          VALUES (?, ?, ?, ?)
        `, [
          permissionName,
          resource,
          action,
          `${action.charAt(0).toUpperCase() + action.slice(1)} ${resource} (for owners)`
        ]);

        permissionId = insertResult.insertId;
        console.log(`✅ Created permission with ID: ${permissionId}`);
      } else {
        permissionId = permission[0].permissionId;
        console.log(`✅ Permission already exists with ID: ${permissionId}`);
      }

      // Check if permission is already assigned to owner role
      const [existingAssignment] = await db.execute(`
        SELECT * FROM role_permissions WHERE roleId = ? AND permissionId = ?
      `, [ownerRoleId, permissionId]);

      if (existingAssignment.length === 0) {
        console.log(`🔗 Assigning permission to owner role...`);
        
        await db.execute(`
          INSERT INTO role_permissions (roleId, permissionId) VALUES (?, ?)
        `, [ownerRoleId, permissionId]);
        
        console.log(`✅ Assigned ${permissionName} to owner role`);
      } else {
        console.log(`✅ Permission already assigned to owner role`);
      }
    }

    // Display final permissions for owner role
    console.log('\n📊 Final permissions for owner role:');
    const [ownerPermissions] = await db.execute(`
      SELECT p.permissionName, p.resource, p.action, p.description
      FROM permissions p
      INNER JOIN role_permissions rp ON p.permissionId = rp.permissionId
      INNER JOIN role r ON rp.roleId = r.roleId
      WHERE r.roleName = 'owner'
      ORDER BY p.resource, p.action
    `);
    
    console.table(ownerPermissions);

    console.log('\n✅ Successfully updated owner permissions!');
    
  } catch (error) {
    console.error('❌ Error adding owner permissions:', error);
  } finally {
    process.exit(0);
  }
};

// Run the script
addMissingOwnerPermissions();
