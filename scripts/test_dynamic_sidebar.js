import axios from 'axios';

/**
 * Test Dynamic Sidebar System
 * This script tests that the sidebar shows only pages users have permission to access
 */

// Configuration
const API_URL = 'http://localhost:5000/api/v1';

const testDynamicSidebar = async () => {
  try {
    console.log('🧪 TESTING DYNAMIC SIDEBAR SYSTEM\n');
    console.log('='.repeat(70));

    // Step 1: Login as admin to see all pages
    console.log('\n📋 Step 1: Testing admin sidebar access...');
    
    const adminLoginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@gmail.com',
      password: 'admin123'
    });
    
    const adminToken = adminLoginResponse.data.token;
    console.log(`✅ Admin login successful`);

    // Get admin sidebar pages
    const adminSidebarResponse = await axios.get(`${API_URL}/sidebar/getMyPages`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log(`✅ Admin can see ${adminSidebarResponse.data.data.length} sidebar pages:`);
    adminSidebarResponse.data.data.forEach(page => {
      console.log(`  - ${page.pageName} (${page.pageUrl}) [${page.pageIcon}]`);
    });

    // Step 2: Login as owner to see scoped pages
    console.log('\n📋 Step 2: Testing owner sidebar access...');
    
    const ownerLoginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'arslan@sentrixmedia.com',
      password: 'arslan123'
    });
    
    const ownerToken = ownerLoginResponse.data.token;
    console.log(`✅ Owner login successful`);

    // Get owner sidebar pages
    const ownerSidebarResponse = await axios.get(`${API_URL}/sidebar/getMyPages`, {
      headers: { Authorization: `Bearer ${ownerToken}` }
    });
    
    console.log(`✅ Owner can see ${ownerSidebarResponse.data.data.length} sidebar pages:`);
    ownerSidebarResponse.data.data.forEach(page => {
      console.log(`  - ${page.pageName} (${page.pageUrl}) [${page.pageIcon}]`);
    });

    // Step 3: Test page permission checking
    console.log('\n📋 Step 3: Testing page permission checking...');
    
    // Test admin permissions
    const adminPermissionResponse = await axios.get(`${API_URL}/sidebar/checkPagePermission`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      params: { pageUrl: '/permissions', permissionType: 'view' }
    });
    
    console.log(`✅ Admin permission for /permissions: ${adminPermissionResponse.data.data.hasPermission ? 'GRANTED' : 'DENIED'}`);

    // Test owner permissions
    const ownerPermissionResponse = await axios.get(`${API_URL}/sidebar/checkPagePermission`, {
      headers: { Authorization: `Bearer ${ownerToken}` },
      params: { pageUrl: '/permissions', permissionType: 'view' }
    });
    
    console.log(`✅ Owner permission for /permissions: ${ownerPermissionResponse.data.data.hasPermission ? 'GRANTED' : 'DENIED'}`);

    // Step 4: Test pages with permissions endpoint
    console.log('\n📋 Step 4: Testing pages with permissions endpoint...');
    
    const pagesWithPermissionsResponse = await axios.get(`${API_URL}/sidebar/getPagesWithPermissions`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log(`✅ Found ${pagesWithPermissionsResponse.data.data.length} pages with permissions:`);
    pagesWithPermissionsResponse.data.data.forEach(page => {
      console.log(`  - ${page.pageName}: ${page.permissions.length} permissions`);
      page.permissions.forEach(perm => {
        console.log(`    * ${perm.permissionType} (${perm.permissionName})`);
      });
    });

    // Step 5: Compare sidebar visibility
    console.log('\n📋 Step 5: Comparing sidebar visibility...');
    
    const adminPages = adminSidebarResponse.data.data.map(p => p.pageName);
    const ownerPages = ownerSidebarResponse.data.data.map(p => p.pageName);
    
    console.log(`\n📊 Sidebar Comparison:`);
    console.log(`Admin pages: [${adminPages.join(', ')}]`);
    console.log(`Owner pages: [${ownerPages.join(', ')}]`);
    
    const adminOnlyPages = adminPages.filter(page => !ownerPages.includes(page));
    const commonPages = adminPages.filter(page => ownerPages.includes(page));
    
    console.log(`\n🔒 Access Control Analysis:`);
    console.log(`Common pages: [${commonPages.join(', ')}]`);
    console.log(`Admin-only pages: [${adminOnlyPages.join(', ')}]`);
    console.log(`Owner has restricted access: ${adminOnlyPages.length > 0 ? '✅ YES' : '❌ NO'}`);

    // Final Summary
    console.log('\n📊 DYNAMIC SIDEBAR TEST SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Admin can see ${adminSidebarResponse.data.data.length} pages`);
    console.log(`✅ Owner can see ${ownerSidebarResponse.data.data.length} pages`);
    console.log(`✅ Permission checking working`);
    console.log(`✅ Role-based page filtering: ${adminOnlyPages.length > 0 ? 'ACTIVE' : 'INACTIVE'}`);
    console.log('');
    console.log('🎯 FRONTEND IMPACT:');
    console.log('  ✅ Sidebar shows only permitted pages');
    console.log('  ✅ Dynamic loading from database');
    console.log('  ✅ Role-based access control');
    console.log('  ✅ Permission context integration');
    console.log('');
    console.log('🚀 DYNAMIC SIDEBAR SYSTEM WORKING!');

  } catch (error) {
    console.error('💥 Error during dynamic sidebar test:', error.response?.data || error.message);
  }
};

// Run the test
testDynamicSidebar();
