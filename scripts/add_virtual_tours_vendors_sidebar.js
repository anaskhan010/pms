import db from '../config/db.js';

/**
 * Add Virtual Tours and Vendors to Sidebar
 * This script adds virtual tours and vendors pages to the sidebar with proper permissions
 */

const addVirtualToursVendorsSidebar = async () => {
  try {
    console.log('📋 ADDING VIRTUAL TOURS AND VENDORS TO SIDEBAR\n');
    console.log('='.repeat(60));

    // Step 1: Add sidebar pages
    console.log('\n📋 Step 1: Adding sidebar pages...');
    
    const sidebarPages = [
      {
        pageName: 'Virtual Tours',
        pageUrl: '/admin/virtual-tours',
        pageIcon: 'fas fa-video',
        displayOrder: 8
      },
      {
        pageName: 'Vendors',
        pageUrl: '/admin/vendors',
        pageIcon: 'fas fa-handshake',
        displayOrder: 9
      }
    ];

    const addedPageIds = [];

    for (const page of sidebarPages) {
      // Check if page already exists
      const [existing] = await db.execute(`
        SELECT COUNT(*) as count FROM sidebar_pages WHERE pageName = ?
      `, [page.pageName]);

      if (existing[0].count === 0) {
        const [result] = await db.execute(`
          INSERT INTO sidebar_pages (pageName, pageUrl, pageIcon, displayOrder, isActive)
          VALUES (?, ?, ?, ?, 1)
        `, [page.pageName, page.pageUrl, page.pageIcon, page.displayOrder]);
        
        addedPageIds.push({ pageId: result.insertId, pageName: page.pageName });
        console.log(`✅ Added sidebar page: ${page.pageName} (ID: ${result.insertId})`);
      } else {
        // Get existing page ID
        const [pageResult] = await db.execute(`
          SELECT pageId FROM sidebar_pages WHERE pageName = ?
        `, [page.pageName]);
        
        addedPageIds.push({ pageId: pageResult[0].pageId, pageName: page.pageName });
        console.log(`⚠️ Sidebar page already exists: ${page.pageName} (ID: ${pageResult[0].pageId})`);
      }
    }

    // Step 2: Add page permissions
    console.log('\n📋 Step 2: Adding page permissions...');
    
    const pagePermissions = [
      // Virtual Tours permissions
      { pageName: 'Virtual Tours', permissionType: 'view', permissionName: 'View Virtual Tours' },
      { pageName: 'Virtual Tours', permissionType: 'create', permissionName: 'Create Virtual Tours' },
      { pageName: 'Virtual Tours', permissionType: 'update', permissionName: 'Update Virtual Tours' },
      { pageName: 'Virtual Tours', permissionType: 'delete', permissionName: 'Delete Virtual Tours' },

      // Vendors permissions (using only allowed ENUM values)
      { pageName: 'Vendors', permissionType: 'view', permissionName: 'View Vendors' },
      { pageName: 'Vendors', permissionType: 'create', permissionName: 'Create Vendors' },
      { pageName: 'Vendors', permissionType: 'update', permissionName: 'Update Vendors' },
      { pageName: 'Vendors', permissionType: 'delete', permissionName: 'Delete Vendors' },
      { pageName: 'Vendors', permissionType: 'manage', permissionName: 'Manage Vendors' } // Using 'manage' instead of 'assign' and 'review'
    ];

    for (const permission of pagePermissions) {
      const pageData = addedPageIds.find(p => p.pageName === permission.pageName);
      if (pageData) {
        // Check if permission already exists
        const [existing] = await db.execute(`
          SELECT COUNT(*) as count FROM page_permissions 
          WHERE pageId = ? AND permissionType = ?
        `, [pageData.pageId, permission.permissionType]);

        if (existing[0].count === 0) {
          await db.execute(`
            INSERT INTO page_permissions (pageId, permissionType, permissionName)
            VALUES (?, ?, ?)
          `, [pageData.pageId, permission.permissionType, permission.permissionName]);
          
          console.log(`  ✅ Added permission: ${permission.pageName} - ${permission.permissionType}`);
        } else {
          console.log(`  ⚠️ Permission already exists: ${permission.pageName} - ${permission.permissionType}`);
        }
      }
    }

    // Step 3: Assign page permissions to roles
    console.log('\n📋 Step 3: Assigning page permissions to roles...');
    
    const rolePageAssignments = [
      // Admin gets all permissions
      { roleId: 1, permissions: pagePermissions },
      
      // Owner gets most permissions
      { roleId: 2, permissions: pagePermissions },
      
      // Manager gets operational permissions
      { roleId: 3, permissions: pagePermissions.filter(p =>
        p.permissionType === 'view' || p.permissionType === 'create' ||
        p.permissionType === 'update' || p.permissionType === 'manage'
      )},
      
      // Staff gets view permissions only
      { roleId: 4, permissions: pagePermissions.filter(p => p.permissionType === 'view') },
      
      // Maintenance gets view and manage permissions
      { roleId: 5, permissions: pagePermissions.filter(p =>
        p.permissionType === 'view' || p.permissionType === 'manage'
      )},
      
      // Security gets view permissions only
      { roleId: 6, permissions: pagePermissions.filter(p => p.permissionType === 'view') }
    ];

    for (const assignment of rolePageAssignments) {
      const [roleInfo] = await db.execute(`
        SELECT roleName FROM role WHERE roleId = ?
      `, [assignment.roleId]);

      if (roleInfo.length > 0) {
        const roleName = roleInfo[0].roleName;
        console.log(`\n🔑 Assigning page permissions to ${roleName}:`);

        for (const permission of assignment.permissions) {
          const pageData = addedPageIds.find(p => p.pageName === permission.pageName);
          if (pageData) {
            // Check if assignment already exists
            const [existingAssignment] = await db.execute(`
              SELECT COUNT(*) as count FROM role_page_permissions 
              WHERE roleId = ? AND pageId = ? AND permissionType = ?
            `, [assignment.roleId, pageData.pageId, permission.permissionType]);

            if (existingAssignment[0].count === 0) {
              await db.execute(`
                INSERT INTO role_page_permissions (roleId, pageId, permissionType, isGranted)
                VALUES (?, ?, ?, 1)
              `, [assignment.roleId, pageData.pageId, permission.permissionType]);
              
              console.log(`  ✅ ${permission.pageName} - ${permission.permissionType}`);
            } else {
              console.log(`  ⚠️ ${permission.pageName} - ${permission.permissionType} (already assigned)`);
            }
          }
        }
      }
    }

    // Step 4: Verify the additions
    console.log('\n📋 Step 4: Verifying sidebar additions...');
    
    // Check sidebar pages
    const [finalSidebarPages] = await db.execute(`
      SELECT COUNT(*) as count FROM sidebar_pages WHERE isActive = 1
    `);
    console.log(`✅ Total active sidebar pages: ${finalSidebarPages[0].count}`);

    // Check page permissions
    const [finalPagePermissions] = await db.execute(`
      SELECT COUNT(*) as count FROM page_permissions
    `);
    console.log(`✅ Total page permissions: ${finalPagePermissions[0].count}`);

    // Check role page permissions
    const [finalRolePagePermissions] = await db.execute(`
      SELECT COUNT(*) as count FROM role_page_permissions WHERE isGranted = 1
    `);
    console.log(`✅ Total granted role page permissions: ${finalRolePagePermissions[0].count}`);

    // Show role access summary
    console.log('\n📊 Role access summary:');
    const [roleAccess] = await db.execute(`
      SELECT r.roleName, COUNT(rpp.pageId) as pageCount
      FROM role r
      LEFT JOIN role_page_permissions rpp ON r.roleId = rpp.roleId AND rpp.isGranted = 1 AND rpp.permissionType = 'view'
      WHERE r.roleId BETWEEN 1 AND 6
      GROUP BY r.roleId, r.roleName
      ORDER BY r.roleId
    `);

    roleAccess.forEach(role => {
      console.log(`  - ${role.roleName}: ${role.pageCount} pages`);
    });

    // Show new pages specifically
    console.log('\n📊 New pages added:');
    for (const pageData of addedPageIds) {
      const [pagePermCount] = await db.execute(`
        SELECT COUNT(*) as count FROM page_permissions WHERE pageId = ?
      `, [pageData.pageId]);
      
      const [roleAssignCount] = await db.execute(`
        SELECT COUNT(DISTINCT roleId) as count FROM role_page_permissions 
        WHERE pageId = ? AND isGranted = 1
      `, [pageData.pageId]);
      
      console.log(`  - ${pageData.pageName}: ${pagePermCount[0].count} permissions, ${roleAssignCount[0].count} roles assigned`);
    }

    console.log('\n🎯 VIRTUAL TOURS AND VENDORS SIDEBAR INTEGRATION COMPLETE!');
    console.log('✅ Sidebar pages added successfully');
    console.log('✅ Page permissions configured');
    console.log('✅ Role assignments completed');
    console.log('✅ System ready for virtual tours and vendors management');

  } catch (error) {
    console.error('💥 Error adding virtual tours and vendors to sidebar:', error);
  } finally {
    process.exit(0);
  }
};

// Run the script
addVirtualToursVendorsSidebar();
