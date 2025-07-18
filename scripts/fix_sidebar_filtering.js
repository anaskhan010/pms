import db from '../config/db.js';

/**
 * Fix Sidebar Filtering Issue
 * This script fixes the issue where both admin and owner see the same number of sidebar pages
 */

const fixSidebarFiltering = async () => {
  try {
    console.log('🔧 FIXING SIDEBAR FILTERING ISSUE\n');
    console.log('='.repeat(60));

    // Step 1: Check current sidebar permissions
    console.log('\n📋 Step 1: Checking current sidebar permissions...');
    
    const [currentPermissions] = await db.execute(`
      SELECT r.roleName, COUNT(rpp.pageId) as pageCount
      FROM role r
      LEFT JOIN role_page_permissions rpp ON r.roleId = rpp.roleId AND rpp.isGranted = 1
      WHERE r.roleId IN (1, 2)
      GROUP BY r.roleId, r.roleName
      ORDER BY r.roleId
    `);
    
    console.log('Current permissions:');
    currentPermissions.forEach(perm => {
      console.log(`  - ${perm.roleName}: ${perm.pageCount} pages`);
    });

    // Step 2: Clear owner permissions and set proper restrictions
    console.log('\n📋 Step 2: Clearing owner permissions...');
    
    await db.execute(`
      DELETE FROM role_page_permissions WHERE roleId = 2
    `);
    
    console.log('✅ Owner permissions cleared');

    // Step 3: Set proper owner permissions (limited pages)
    console.log('\n📋 Step 3: Setting proper owner permissions...');
    
    const ownerAllowedPages = [
      'Dashboard',
      'Tenants', 
      'Buildings',
      'Villas',
      'Financial Transactions',
      'User Management',
      'Permissions & Roles'
    ];
    
    console.log(`Setting permissions for ${ownerAllowedPages.length} pages:`);
    ownerAllowedPages.forEach(page => console.log(`  - ${page}`));
    
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
        
        console.log(`  ✅ Granted view permission for: ${pageName}`);
      } else {
        console.log(`  ⚠️ Page not found: ${pageName}`);
      }
    }

    // Step 4: Verify the fix
    console.log('\n📋 Step 4: Verifying the fix...');
    
    const [updatedPermissions] = await db.execute(`
      SELECT r.roleName, COUNT(rpp.pageId) as pageCount
      FROM role r
      LEFT JOIN role_page_permissions rpp ON r.roleId = rpp.roleId AND rpp.isGranted = 1
      WHERE r.roleId IN (1, 2)
      GROUP BY r.roleId, r.roleName
      ORDER BY r.roleId
    `);
    
    console.log('Updated permissions:');
    updatedPermissions.forEach(perm => {
      console.log(`  - ${perm.roleName}: ${perm.pageCount} pages`);
    });

    // Step 5: Check specific pages for each role
    console.log('\n📋 Step 5: Checking specific page access...');
    
    const [adminPages] = await db.execute(`
      SELECT sp.pageName
      FROM sidebar_pages sp
      INNER JOIN role_page_permissions rpp ON sp.pageId = rpp.pageId
      WHERE rpp.roleId = 1 AND rpp.isGranted = 1 AND rpp.permissionType = 'view'
      ORDER BY sp.displayOrder
    `);
    
    const [ownerPages] = await db.execute(`
      SELECT sp.pageName
      FROM sidebar_pages sp
      INNER JOIN role_page_permissions rpp ON sp.pageId = rpp.pageId
      WHERE rpp.roleId = 2 AND rpp.isGranted = 1 AND rpp.permissionType = 'view'
      ORDER BY sp.displayOrder
    `);
    
    console.log(`\nAdmin pages (${adminPages.length}):`);
    adminPages.forEach(page => console.log(`  - ${page.pageName}`));
    
    console.log(`\nOwner pages (${ownerPages.length}):`);
    ownerPages.forEach(page => console.log(`  - ${page.pageName}`));
    
    // Step 6: Identify admin-only pages
    const adminPageNames = adminPages.map(p => p.pageName);
    const ownerPageNames = ownerPages.map(p => p.pageName);
    const adminOnlyPages = adminPageNames.filter(name => !ownerPageNames.includes(name));
    
    console.log(`\nAdmin-only pages (${adminOnlyPages.length}):`);
    adminOnlyPages.forEach(page => console.log(`  - ${page}`));

    // Step 7: Test the filtering logic
    console.log('\n📋 Step 7: Testing filtering logic...');
    
    // Simulate getUserPages for owner
    const [ownerTestPages] = await db.execute(`
      SELECT DISTINCT sp.pageId, sp.pageName, sp.pageUrl, sp.pageIcon, sp.displayOrder
      FROM sidebar_pages sp
      INNER JOIN page_permissions pp ON sp.pageId = pp.pageId
      INNER JOIN role_page_permissions rpp ON pp.pageId = rpp.pageId AND pp.permissionType = rpp.permissionType
      WHERE rpp.roleId = 2
      AND sp.isActive = 1 
      AND pp.permissionType = 'view'
      AND rpp.isGranted = 1
      ORDER BY sp.displayOrder ASC
    `);
    
    console.log(`✅ Owner filtering test: ${ownerTestPages.length} pages accessible`);
    
    // Final validation
    const filteringWorking = adminPages.length > ownerPages.length;
    console.log(`✅ Sidebar filtering: ${filteringWorking ? 'WORKING' : 'STILL BROKEN'}`);

    console.log('\n🎯 SIDEBAR FILTERING FIX COMPLETE!');
    console.log(`✅ Admin can see ${adminPages.length} pages`);
    console.log(`✅ Owner can see ${ownerPages.length} pages`);
    console.log(`✅ ${adminOnlyPages.length} pages are admin-only`);
    console.log(`✅ Role-based filtering: ${filteringWorking ? 'ACTIVE' : 'INACTIVE'}`);

  } catch (error) {
    console.error('💥 Error fixing sidebar filtering:', error);
  } finally {
    process.exit(0);
  }
};

// Run the fix
fixSidebarFiltering();
