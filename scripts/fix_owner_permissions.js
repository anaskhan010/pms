import db from '../config/db.js';

const fixOwnerPermissions = async () => {
  console.log('🔧 Fixing Owner Permissions for Financial Transactions');
  console.log('='.repeat(60));

  try {
    // Check current permissions in database
    console.log('\n📋 Checking current permissions...');
    const [currentPermissions] = await db.execute(`
      SELECT permissionId, permissionName, resource, action, description
      FROM permissions
      WHERE resource = 'transactions' OR permissionName LIKE '%transaction%'
      ORDER BY permissionName
    `);
    console.log('Current transaction permissions:', currentPermissions);

    // Check if transactions.view_own permission exists
    const viewOwnExists = currentPermissions.some(p => p.permissionName === 'transactions.view_own');
    
    if (!viewOwnExists) {
      console.log('\n➕ Adding missing transactions.view_own permission...');
      
      // Add the missing permission
      const insertPermissionQuery = `
        INSERT INTO permissions (permissionName, resource, action, description)
        VALUES (?, ?, ?, ?)
      `;
      
      const [insertResult] = await db.execute(insertPermissionQuery, [
        'transactions.view_own',
        'transactions',
        'view_own',
        'View own financial transactions (for owners)'
      ]);
      
      console.log('✅ Added transactions.view_own permission with ID:', insertResult.insertId);
      
      // Get the owner role ID
      const [ownerRole] = await db.execute(`
        SELECT roleId, roleName FROM role WHERE roleName = 'owner'
      `);
      
      if (ownerRole.length > 0) {
        const ownerRoleId = ownerRole[0].roleId;
        console.log(`\n🔗 Assigning permission to owner role (ID: ${ownerRoleId})...`);
        
        // Assign the permission to owner role
        const assignPermissionQuery = `
          INSERT INTO role_permissions (roleId, permissionId)
          VALUES (?, ?)
        `;
        
        await db.execute(assignPermissionQuery, [ownerRoleId, insertResult.insertId]);
        console.log('✅ Assigned transactions.view_own permission to owner role');
      } else {
        console.log('❌ Owner role not found in database');
      }
    } else {
      console.log('✅ transactions.view_own permission already exists');
    }

    // Check if transactions.view permission exists (for admins)
    const viewExists = currentPermissions.some(p => p.permissionName === 'transactions.view');
    
    if (!viewExists) {
      console.log('\n➕ Adding missing transactions.view permission...');
      
      // Add the missing permission
      const insertPermissionQuery = `
        INSERT INTO permissions (permissionName, resource, action, description)
        VALUES (?, ?, ?, ?)
      `;
      
      const [insertResult] = await db.execute(insertPermissionQuery, [
        'transactions.view',
        'transactions',
        'view',
        'View all financial transactions (for admins)'
      ]);
      
      console.log('✅ Added transactions.view permission with ID:', insertResult.insertId);
      
      // Get the admin role ID
      const [adminRole] = await db.execute(`
        SELECT roleId, roleName FROM role WHERE roleName = 'admin'
      `);
      
      if (adminRole.length > 0) {
        const adminRoleId = adminRole[0].roleId;
        console.log(`\n🔗 Assigning permission to admin role (ID: ${adminRoleId})...`);
        
        // Assign the permission to admin role
        const assignPermissionQuery = `
          INSERT INTO role_permissions (roleId, permissionId)
          VALUES (?, ?)
        `;
        
        await db.execute(assignPermissionQuery, [adminRoleId, insertResult.insertId]);
        console.log('✅ Assigned transactions.view permission to admin role');
      } else {
        console.log('❌ Admin role not found in database');
      }
    } else {
      console.log('✅ transactions.view permission already exists');
    }

    // Check final permissions for owner role
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

    // Test with a specific owner user
    console.log('\n🧪 Testing permissions for owner user...');
    const [ownerUsers] = await db.execute(`
      SELECT u.userId, u.firstName, u.lastName, r.roleName
      FROM user u
      INNER JOIN userRole ur ON u.userId = ur.userId
      INNER JOIN role r ON ur.roleId = r.roleId
      WHERE r.roleName = 'owner'
      LIMIT 1
    `);

    if (ownerUsers.length > 0) {
      const ownerUser = ownerUsers[0];
      console.log(`Testing for user: ${ownerUser.firstName} ${ownerUser.lastName} (ID: ${ownerUser.userId})`);
      
      const [userPermissions] = await db.execute(`
        SELECT DISTINCT p.permissionName, p.resource, p.action
        FROM permissions p
        INNER JOIN role_permissions rp ON p.permissionId = rp.permissionId
        INNER JOIN userRole ur ON rp.roleId = ur.roleId
        WHERE ur.userId = ? AND p.resource = 'transactions'
      `, [ownerUser.userId]);
      
      console.log('User transaction permissions:', userPermissions);
      
      const hasViewOwn = userPermissions.some(p => p.permissionName === 'transactions.view_own');
      console.log(`Has transactions.view_own: ${hasViewOwn ? '✅' : '❌'}`);
    }

    console.log('\n🎉 Owner permissions fix completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Refresh the frontend application');
    console.log('2. Login as owner user');
    console.log('3. Financial Transactions should now be visible in sidebar');

  } catch (error) {
    console.error('❌ Error fixing owner permissions:', error);
    throw error;
  } finally {
    await db.end();
  }
};

// Run the fix
fixOwnerPermissions().catch(console.error);
