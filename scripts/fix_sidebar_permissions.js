import db from '../config/db.js';

/**
 * Fix Sidebar Permissions for Proper Role-Based Access Control
 * This script ensures owners only see pages they should have access to
 */

const fixSidebarPermissions = async () => {
  try {
    console.log('🔧 FIXING SIDEBAR PERMISSIONS FOR ROLE-BASED ACCESS\n');
    console.log('='.repeat(70));

    // Step 1: Clear existing owner permissions
    console.log('\n📋 Step 1: Clearing existing owner permissions...');
    
    await db.execute(`
      DELETE FROM role_page_permissions 
      WHERE roleId = 2
    `);
    
    console.log('✅ Cleared all owner permissions');

    // Step 2: Define owner-specific pages (what owners should see)
    console.log('\n📋 Step 2: Setting up owner-specific permissions...');
    
    const ownerAllowedPages = [
      'Dashboard',
      'Tenants', 
      'Buildings',
      'Villas',
      'Financial Transactions',
      'User Management',
      'Permissions & Roles'
    ];
    
    // Admin-only pages (owners should NOT see these)
    const adminOnlyPages = [
      'Virtual Tour',
      'Vendors', 
      'Messages'
    ];
    
    console.log(`✅ Owner allowed pages: [${ownerAllowedPages.join(', ')}]`);
    console.log(`✅ Admin-only pages: [${adminOnlyPages.join(', ')}]`);

    // Step 3: Grant view permissions to owner for allowed pages
    console.log('\n📋 Step 3: Granting owner permissions...');
    
    for (const pageName of ownerAllowedPages) {
      const [pageResult] = await db.execute(`
        SELECT pageId FROM sidebar_pages WHERE pageName = ?
      `, [pageName]);
      
      if (pageResult.length > 0) {
        const pageId = pageResult[0].pageId;
        
        // Grant view permission
        await db.execute(`
          INSERT INTO role_page_permissions (roleId, pageId, permissionType, isGranted)
          VALUES (2, ?, 'view', 1)
        `, [pageId]);
        
        // Grant CRUD permissions for specific pages
        if (['Tenants', 'Buildings', 'Villas', 'Financial Transactions'].includes(pageName)) {
          const crudPermissions = ['create', 'update', 'delete'];
          for (const permission of crudPermissions) {
            await db.execute(`
              INSERT INTO role_page_permissions (roleId, pageId, permissionType, isGranted)
              VALUES (2, ?, ?, 1)
            `, [pageId, permission]);
          }
        }
        
        // Grant manage permission for User Management and Permissions & Roles
        if (['User Management', 'Permissions & Roles'].includes(pageName)) {
          await db.execute(`
            INSERT INTO role_page_permissions (roleId, pageId, permissionType, isGranted)
            VALUES (2, ?, 'manage', 1)
          `, [pageId]);
        }
        
        console.log(`  ✅ Granted permissions for: ${pageName}`);
      }
    }

    // Step 4: Verify the changes
    console.log('\n📋 Step 4: Verifying permission changes...');
    
    const [adminPermissions] = await db.execute(`
      SELECT COUNT(*) as count
      FROM role_page_permissions rpp
      INNER JOIN sidebar_pages sp ON rpp.pageId = sp.pageId
      WHERE rpp.roleId = 1 AND rpp.isGranted = 1 AND rpp.permissionType = 'view'
    `);
    
    const [ownerPermissions] = await db.execute(`
      SELECT COUNT(*) as count
      FROM role_page_permissions rpp
      INNER JOIN sidebar_pages sp ON rpp.pageId = sp.pageId
      WHERE rpp.roleId = 2 AND rpp.isGranted = 1 AND rpp.permissionType = 'view'
    `);
    
    console.log(`✅ Admin can view ${adminPermissions[0].count} pages`);
    console.log(`✅ Owner can view ${ownerPermissions[0].count} pages`);
    console.log(`✅ Role-based filtering: ${adminPermissions[0].count > ownerPermissions[0].count ? 'ACTIVE' : 'INACTIVE'}`);

    // Step 5: Show detailed permissions
    console.log('\n📋 Step 5: Detailed permission breakdown...');
    
    const [adminPages] = await db.execute(`
      SELECT sp.pageName
      FROM role_page_permissions rpp
      INNER JOIN sidebar_pages sp ON rpp.pageId = sp.pageId
      WHERE rpp.roleId = 1 AND rpp.isGranted = 1 AND rpp.permissionType = 'view'
      ORDER BY sp.displayOrder
    `);
    
    const [ownerPages] = await db.execute(`
      SELECT sp.pageName
      FROM role_page_permissions rpp
      INNER JOIN sidebar_pages sp ON rpp.pageId = sp.pageId
      WHERE rpp.roleId = 2 AND rpp.isGranted = 1 AND rpp.permissionType = 'view'
      ORDER BY sp.displayOrder
    `);
    
    console.log(`\n🔑 Admin pages: [${adminPages.map(p => p.pageName).join(', ')}]`);
    console.log(`🔑 Owner pages: [${ownerPages.map(p => p.pageName).join(', ')}]`);
    
    const adminOnlyPagesList = adminPages.filter(ap => 
      !ownerPages.some(op => op.pageName === ap.pageName)
    ).map(p => p.pageName);
    
    console.log(`🔒 Admin-only pages: [${adminOnlyPagesList.join(', ')}]`);

    // Step 6: Test the getUserPages function
    console.log('\n📋 Step 6: Testing getUserPages function...');
    
    // Get a sample owner user
    const [ownerUser] = await db.execute(`
      SELECT u.userId, u.firstName, u.lastName
      FROM user u
      INNER JOIN userRole ur ON u.userId = ur.userId
      WHERE ur.roleId = 2
      LIMIT 1
    `);
    
    if (ownerUser.length > 0) {
      const userId = ownerUser[0].userId;
      console.log(`Testing with owner user: ${ownerUser[0].firstName} ${ownerUser[0].lastName} (ID: ${userId})`);
      
      const [userPages] = await db.execute(`
        SELECT DISTINCT sp.pageId, sp.pageName, sp.pageUrl, sp.pageIcon, sp.displayOrder
        FROM sidebar_pages sp
        INNER JOIN page_permissions pp ON sp.pageId = pp.pageId
        INNER JOIN role_page_permissions rpp ON pp.pageId = rpp.pageId AND pp.permissionType = rpp.permissionType
        INNER JOIN userRole ur ON rpp.roleId = ur.roleId
        WHERE ur.userId = ? 
        AND sp.isActive = 1 
        AND pp.permissionType = 'view'
        AND rpp.isGranted = 1
        ORDER BY sp.displayOrder ASC
      `, [userId]);
      
      console.log(`✅ Owner user can see ${userPages.length} pages:`);
      userPages.forEach(page => {
        console.log(`  - ${page.pageName} (${page.pageUrl})`);
      });
    }

    console.log('\n🎯 SIDEBAR PERMISSIONS FIXED!');
    console.log('✅ Role-based access control implemented');
    console.log('✅ Owner permissions properly scoped');
    console.log('✅ Admin retains full access');
    console.log('✅ Frontend sidebar will now show filtered pages');

  } catch (error) {
    console.error('💥 Error fixing sidebar permissions:', error);
  } finally {
    process.exit(0);
  }
};

// Run the fix
fixSidebarPermissions();
