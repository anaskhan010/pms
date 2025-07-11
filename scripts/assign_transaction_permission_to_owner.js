import db from '../config/db.js';

const assignTransactionPermissionToOwner = async () => {
  console.log('🔧 Assigning Transaction Permission to Owner Role');
  console.log('='.repeat(60));

  try {
    // Get the owner role ID
    console.log('\n📋 Finding owner role...');
    const [ownerRole] = await db.execute(`
      SELECT roleId, roleName FROM role WHERE roleName = 'owner'
    `);
    
    if (ownerRole.length === 0) {
      console.log('❌ Owner role not found in database');
      return;
    }
    
    const ownerRoleId = ownerRole[0].roleId;
    console.log(`✅ Found owner role with ID: ${ownerRoleId}`);

    // Get the transactions.view_own permission ID
    console.log('\n📋 Finding transactions.view_own permission...');
    const [permission] = await db.execute(`
      SELECT permissionId, permissionName FROM permissions 
      WHERE permissionName = 'transactions.view_own'
    `);
    
    if (permission.length === 0) {
      console.log('❌ transactions.view_own permission not found in database');
      return;
    }
    
    const permissionId = permission[0].permissionId;
    console.log(`✅ Found transactions.view_own permission with ID: ${permissionId}`);

    // Check if the permission is already assigned to owner role
    console.log('\n🔍 Checking if permission is already assigned...');
    const [existingAssignment] = await db.execute(`
      SELECT * FROM role_permissions 
      WHERE roleId = ? AND permissionId = ?
    `, [ownerRoleId, permissionId]);

    if (existingAssignment.length > 0) {
      console.log('✅ Permission is already assigned to owner role');
    } else {
      console.log('➕ Assigning permission to owner role...');
      
      // Assign the permission to owner role
      const assignPermissionQuery = `
        INSERT INTO role_permissions (roleId, permissionId)
        VALUES (?, ?)
      `;
      
      await db.execute(assignPermissionQuery, [ownerRoleId, permissionId]);
      console.log('✅ Successfully assigned transactions.view_own permission to owner role');
    }

    // Verify the assignment
    console.log('\n🧪 Verifying assignment...');
    const [verifyAssignment] = await db.execute(`
      SELECT p.permissionName, r.roleName
      FROM role_permissions rp
      INNER JOIN permissions p ON rp.permissionId = p.permissionId
      INNER JOIN role r ON rp.roleId = r.roleId
      WHERE r.roleName = 'owner' AND p.permissionName = 'transactions.view_own'
    `);

    if (verifyAssignment.length > 0) {
      console.log('✅ Verification successful - permission is assigned to owner role');
    } else {
      console.log('❌ Verification failed - permission is not assigned');
    }

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

    // Show all owner permissions
    console.log('\n📊 All permissions for owner role:');
    const [allOwnerPermissions] = await db.execute(`
      SELECT p.permissionName, p.resource, p.action, p.description
      FROM permissions p
      INNER JOIN role_permissions rp ON p.permissionId = rp.permissionId
      INNER JOIN role r ON rp.roleId = r.roleId
      WHERE r.roleName = 'owner'
      ORDER BY p.resource, p.action
    `);
    console.table(allOwnerPermissions);

    console.log('\n🎉 Transaction permission assignment completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Refresh the frontend application');
    console.log('2. Login as owner user');
    console.log('3. Financial Transactions should now be visible in sidebar');

  } catch (error) {
    console.error('❌ Error assigning transaction permission to owner:', error);
    throw error;
  } finally {
    await db.end();
  }
};

// Run the assignment
assignTransactionPermissionToOwner().catch(console.error);
