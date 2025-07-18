import db from '../config/db.js';

/**
 * Check Sidebar Database Setup
 * This script checks if the sidebar pages and permissions are properly set up in the database
 */

const checkSidebarDatabase = async () => {
  try {
    console.log('🔍 CHECKING SIDEBAR DATABASE SETUP\n');
    console.log('='.repeat(60));

    // Step 1: Check if sidebar_pages table exists and has data
    console.log('\n📋 Step 1: Checking sidebar_pages table...');
    
    try {
      const [pages] = await db.execute(`
        SELECT pageId, pageName, pageUrl, pageIcon, displayOrder, isActive
        FROM sidebar_pages
        ORDER BY displayOrder ASC
      `);
      
      console.log(`✅ Found ${pages.length} sidebar pages:`);
      pages.forEach(page => {
        const status = page.isActive ? '✅ ACTIVE' : '❌ INACTIVE';
        console.log(`  ${page.displayOrder}. ${page.pageName} (${page.pageUrl}) [${page.pageIcon}] - ${status}`);
      });
      
    } catch (error) {
      console.log(`❌ sidebar_pages table error: ${error.message}`);
      
      // Create the table if it doesn't exist
      console.log('\n🔧 Creating sidebar_pages table...');
      await db.execute(`
        CREATE TABLE IF NOT EXISTS sidebar_pages (
          pageId INT AUTO_INCREMENT PRIMARY KEY,
          pageName VARCHAR(100) NOT NULL,
          pageUrl VARCHAR(200) NOT NULL UNIQUE,
          pageIcon VARCHAR(100) NOT NULL,
          displayOrder INT DEFAULT 0,
          description TEXT,
          isActive BOOLEAN DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      
      // Insert default pages
      const defaultPages = [
        { name: 'Dashboard', url: '/dashboard', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z', order: 1 },
        { name: 'My Buildings', url: '/buildings', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', order: 2 },
        { name: 'My Tenants', url: '/tenants', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z', order: 3 },
        { name: 'My Villas', url: '/villas', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', order: 4 },
        { name: 'My Financial Transactions', url: '/financial-transactions', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1', order: 5 },
        { name: 'My User Management', url: '/user-management', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z', order: 6 },
        { name: 'My Permissions & Roles', url: '/permissions', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z', order: 7 },
        { name: 'My Virtual Tour', url: '/virtual-tour', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', order: 8 },
        { name: 'My Vendors', url: '/vendors', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', order: 9 },
        { name: 'My Messages', url: '/messages', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', order: 10 }
      ];
      
      for (const page of defaultPages) {
        await db.execute(`
          INSERT INTO sidebar_pages (pageName, pageUrl, pageIcon, displayOrder)
          VALUES (?, ?, ?, ?)
        `, [page.name, page.url, page.icon, page.order]);
      }
      
      console.log(`✅ Created sidebar_pages table with ${defaultPages.length} default pages`);
    }

    // Step 2: Check page_permissions table
    console.log('\n📋 Step 2: Checking page_permissions table...');
    
    try {
      const [permissions] = await db.execute(`
        SELECT pp.pageId, sp.pageName, pp.permissionType, pp.permissionName
        FROM page_permissions pp
        INNER JOIN sidebar_pages sp ON pp.pageId = sp.pageId
        ORDER BY pp.pageId, pp.permissionType
      `);
      
      console.log(`✅ Found ${permissions.length} page permissions:`);
      const permissionsByPage = permissions.reduce((acc, perm) => {
        if (!acc[perm.pageName]) acc[perm.pageName] = [];
        acc[perm.pageName].push(`${perm.permissionType} (${perm.permissionName})`);
        return acc;
      }, {});
      
      Object.entries(permissionsByPage).forEach(([pageName, perms]) => {
        console.log(`  ${pageName}: ${perms.join(', ')}`);
      });
      
    } catch (error) {
      console.log(`❌ page_permissions table error: ${error.message}`);
      
      // Create the table if it doesn't exist
      console.log('\n🔧 Creating page_permissions table...');
      await db.execute(`
        CREATE TABLE IF NOT EXISTS page_permissions (
          permissionId INT AUTO_INCREMENT PRIMARY KEY,
          pageId INT NOT NULL,
          permissionType VARCHAR(50) NOT NULL,
          permissionName VARCHAR(100) NOT NULL,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (pageId) REFERENCES sidebar_pages(pageId) ON DELETE CASCADE,
          UNIQUE KEY unique_page_permission (pageId, permissionType)
        )
      `);
      
      // Add basic view permissions for all pages
      const [pages] = await db.execute('SELECT pageId, pageName FROM sidebar_pages');
      for (const page of pages) {
        await db.execute(`
          INSERT INTO page_permissions (pageId, permissionType, permissionName, description)
          VALUES (?, 'view', ?, ?)
        `, [page.pageId, `${page.pageName.toLowerCase().replace(/\s+/g, '_')}.view`, `View ${page.pageName} page`]);
      }
      
      console.log(`✅ Created page_permissions table with view permissions for ${pages.length} pages`);
    }

    // Step 3: Check role_page_permissions table
    console.log('\n📋 Step 3: Checking role_page_permissions table...');
    
    try {
      const [rolePermissions] = await db.execute(`
        SELECT rpp.roleId, r.roleName, sp.pageName, rpp.permissionType, rpp.isGranted
        FROM role_page_permissions rpp
        INNER JOIN role r ON rpp.roleId = r.roleId
        INNER JOIN sidebar_pages sp ON rpp.pageId = sp.pageId
        WHERE rpp.isGranted = 1
        ORDER BY rpp.roleId, sp.displayOrder
      `);
      
      console.log(`✅ Found ${rolePermissions.length} granted role permissions:`);
      const permissionsByRole = rolePermissions.reduce((acc, perm) => {
        if (!acc[perm.roleName]) acc[perm.roleName] = [];
        acc[perm.roleName].push(`${perm.pageName} (${perm.permissionType})`);
        return acc;
      }, {});
      
      Object.entries(permissionsByRole).forEach(([roleName, perms]) => {
        console.log(`  ${roleName}: ${perms.join(', ')}`);
      });
      
    } catch (error) {
      console.log(`❌ role_page_permissions table error: ${error.message}`);
      
      // Create the table if it doesn't exist
      console.log('\n🔧 Creating role_page_permissions table...');
      await db.execute(`
        CREATE TABLE IF NOT EXISTS role_page_permissions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          roleId INT NOT NULL,
          pageId INT NOT NULL,
          permissionType VARCHAR(50) NOT NULL,
          isGranted BOOLEAN DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (roleId) REFERENCES role(roleId) ON DELETE CASCADE,
          FOREIGN KEY (pageId) REFERENCES sidebar_pages(pageId) ON DELETE CASCADE,
          UNIQUE KEY unique_role_page_permission (roleId, pageId, permissionType)
        )
      `);
      
      // Grant all permissions to admin role (roleId = 1)
      const [pages] = await db.execute('SELECT pageId FROM sidebar_pages');
      for (const page of pages) {
        await db.execute(`
          INSERT INTO role_page_permissions (roleId, pageId, permissionType, isGranted)
          VALUES (1, ?, 'view', 1)
        `, [page.pageId]);
      }
      
      // Grant limited permissions to owner role (roleId = 2)
      const ownerPages = ['Dashboard', 'My Buildings', 'My Tenants', 'My Villas', 'My Financial Transactions', 'My User Management', 'My Permissions & Roles'];
      for (const pageName of ownerPages) {
        const [pageResult] = await db.execute('SELECT pageId FROM sidebar_pages WHERE pageName = ?', [pageName]);
        if (pageResult.length > 0) {
          await db.execute(`
            INSERT INTO role_page_permissions (roleId, pageId, permissionType, isGranted)
            VALUES (2, ?, 'view', 1)
          `, [pageResult[0].pageId]);
        }
      }
      
      console.log(`✅ Created role_page_permissions table with default permissions`);
    }

    console.log('\n🎯 SIDEBAR DATABASE SETUP COMPLETE!');
    console.log('✅ All required tables exist');
    console.log('✅ Default pages created');
    console.log('✅ Permissions configured');
    console.log('✅ Role-based access ready');

  } catch (error) {
    console.error('💥 Error checking sidebar database:', error);
  } finally {
    process.exit(0);
  }
};

// Run the check
checkSidebarDatabase();
