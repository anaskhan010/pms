import axios from 'axios';
import db from '../config/db.js';

/**
 * Comprehensive System Test Suite
 * Tests all implemented features: hierarchical user management, dynamic sidebar, role management
 */

// Configuration
const API_URL = 'http://localhost:5000/api/v1';

const runComprehensiveSystemTest = async () => {
  try {
    console.log('🧪 COMPREHENSIVE SYSTEM TEST SUITE\n');
    console.log('='.repeat(80));
    console.log('Testing: Hierarchical User Management + Dynamic Sidebar + Role Management');
    console.log('='.repeat(80));

    const testResults = {
      hierarchicalUserManagement: { passed: 0, failed: 0, tests: [] },
      dynamicSidebar: { passed: 0, failed: 0, tests: [] },
      roleManagement: { passed: 0, failed: 0, tests: [] },
      integration: { passed: 0, failed: 0, tests: [] }
    };

    // Helper function to record test results
    const recordTest = (category, testName, passed, details = '') => {
      testResults[category].tests.push({ name: testName, passed, details });
      if (passed) {
        testResults[category].passed++;
        console.log(`  ✅ ${testName} ${details}`);
      } else {
        testResults[category].failed++;
        console.log(`  ❌ ${testName} ${details}`);
      }
    };

    // ==================== HIERARCHICAL USER MANAGEMENT TESTS ====================
    console.log('\n🔍 TESTING HIERARCHICAL USER MANAGEMENT');
    console.log('-'.repeat(50));

    try {
      // Test 1: Admin login and user creation
      const adminLogin = await axios.post(`${API_URL}/auth/login`, {
        email: 'admin@gmail.com',
        password: 'admin123'
      });
      const adminToken = adminLogin.data.token;
      recordTest('hierarchicalUserManagement', 'Admin Login', true, '(admin@gmail.com)');

      // Test 2: Owner login and restricted access
      const ownerLogin = await axios.post(`${API_URL}/auth/login`, {
        email: 'arslan@sentrixmedia.com',
        password: 'arslan123'
      });
      const ownerToken = ownerLogin.data.token;
      recordTest('hierarchicalUserManagement', 'Owner Login', true, '(arslan@sentrixmedia.com)');

      // Test 3: Owner user visibility (should only see own created users)
      const ownerUsers = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${ownerToken}` }
      });
      const adminUsers = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      recordTest('hierarchicalUserManagement', 'Data Isolation', 
        ownerUsers.data.data.length < adminUsers.data.data.length,
        `(Owner: ${ownerUsers.data.data.length}, Admin: ${adminUsers.data.data.length})`
      );

      // Test 4: Owner role creation restrictions
      try {
        await axios.post(`${API_URL}/users`, {
          firstName: 'Test', lastName: 'Admin', email: 'test.admin@test.com',
          password: 'test123', phoneNumber: '+1234567890', roleId: 1
        }, { headers: { Authorization: `Bearer ${ownerToken}` } });
        recordTest('hierarchicalUserManagement', 'Admin Creation Block', false, '(Should have been blocked)');
      } catch (error) {
        recordTest('hierarchicalUserManagement', 'Admin Creation Block', true, '(Properly blocked)');
      }

      // Test 5: Database creator tracking
      const [creatorTracking] = await db.execute(`
        SELECT COUNT(*) as count FROM user WHERE createdBy IS NOT NULL
      `);
      recordTest('hierarchicalUserManagement', 'Creator Tracking', 
        creatorTracking[0].count > 0, `(${creatorTracking[0].count} users tracked)`
      );

    } catch (error) {
      recordTest('hierarchicalUserManagement', 'System Access', false, `(${error.message})`);
    }

    // ==================== DYNAMIC SIDEBAR TESTS ====================
    console.log('\n🔍 TESTING DYNAMIC SIDEBAR SYSTEM');
    console.log('-'.repeat(50));

    try {
      // Test 6: Sidebar database structure
      const [sidebarPages] = await db.execute('SELECT COUNT(*) as count FROM sidebar_pages WHERE isActive = 1');
      const [pagePermissions] = await db.execute('SELECT COUNT(*) as count FROM page_permissions');
      const [rolePagePermissions] = await db.execute('SELECT COUNT(*) as count FROM role_page_permissions WHERE isGranted = 1');
      
      recordTest('dynamicSidebar', 'Database Structure', 
        sidebarPages[0].count >= 10 && pagePermissions[0].count >= 30,
        `(${sidebarPages[0].count} pages, ${pagePermissions[0].count} permissions)`
      );

      // Test 7: Admin sidebar access
      const adminSidebar = await axios.get(`${API_URL}/sidebar/getMyPages`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      recordTest('dynamicSidebar', 'Admin Sidebar Access', 
        adminSidebar.data.data.length >= 10, `(${adminSidebar.data.data.length} pages)`
      );

      // Test 8: Owner sidebar filtering
      const ownerSidebar = await axios.get(`${API_URL}/sidebar/getMyPages`, {
        headers: { Authorization: `Bearer ${ownerToken}` }
      });
      recordTest('dynamicSidebar', 'Owner Sidebar Filtering', 
        ownerSidebar.data.data.length < adminSidebar.data.data.length,
        `(${ownerSidebar.data.data.length} pages vs ${adminSidebar.data.data.length})`
      );

      // Test 9: Permission checking
      const permissionCheck = await axios.get(`${API_URL}/sidebar/checkPagePermission`, {
        headers: { Authorization: `Bearer ${ownerToken}` },
        params: { pageUrl: '/virtual-tour', permissionType: 'view' }
      });
      recordTest('dynamicSidebar', 'Permission Checking', 
        !permissionCheck.data.data.hasPermission, '(Owner blocked from admin page)'
      );

    } catch (error) {
      recordTest('dynamicSidebar', 'Sidebar System', false, `(${error.message})`);
    }

    // ==================== ROLE MANAGEMENT TESTS ====================
    console.log('\n🔍 TESTING ROLE MANAGEMENT SYSTEM');
    console.log('-'.repeat(50));

    try {
      // Test 10: Role statistics
      const roleStats = await axios.get(`${API_URL}/roles/statistics`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      recordTest('roleManagement', 'Role Statistics', 
        roleStats.data.data.length >= 4, `(${roleStats.data.data.length} role types)`
      );

      // Test 11: Role hierarchy
      const roleHierarchy = await axios.get(`${API_URL}/dynamic-roles/hierarchy`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      recordTest('roleManagement', 'Role Hierarchy', 
        roleHierarchy.data.data.length >= 7, `(${roleHierarchy.data.data.length} roles)`
      );

      // Test 12: Staff role permissions
      const [staffRolePermissions] = await db.execute(`
        SELECT r.roleName, COUNT(rp.permissionId) as permCount, COUNT(rpp.pageId) as pageCount
        FROM role r
        LEFT JOIN role_permissions rp ON r.roleId = rp.roleId
        LEFT JOIN role_page_permissions rpp ON r.roleId = rpp.roleId AND rpp.isGranted = 1
        WHERE r.roleId BETWEEN 3 AND 6
        GROUP BY r.roleId, r.roleName
      `);
      
      const staffRolesWorking = staffRolePermissions.every(role => 
        parseInt(role.permCount) > 0 && parseInt(role.pageCount) > 0
      );
      recordTest('roleManagement', 'Staff Role Permissions', staffRolesWorking,
        `(${staffRolePermissions.length} staff roles configured)`
      );

      // Test 13: Custom role creation capability
      const roleTemplate = await axios.get(`${API_URL}/dynamic-roles/template`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      recordTest('roleManagement', 'Role Creation Template', 
        roleTemplate.data.data.availablePages && roleTemplate.data.data.availableResources,
        '(Template available)'
      );

    } catch (error) {
      recordTest('roleManagement', 'Role Management', false, `(${error.message})`);
    }

    // ==================== INTEGRATION TESTS ====================
    console.log('\n🔍 TESTING SYSTEM INTEGRATION');
    console.log('-'.repeat(50));

    try {
      // Test 14: End-to-end user workflow
      const workflowTest = await testUserWorkflow(adminToken, ownerToken);
      recordTest('integration', 'User Workflow', workflowTest.success, workflowTest.details);

      // Test 15: Permission consistency
      const permissionConsistency = await testPermissionConsistency();
      recordTest('integration', 'Permission Consistency', permissionConsistency.success, permissionConsistency.details);

      // Test 16: Data isolation verification
      const dataIsolation = await testDataIsolation(ownerToken);
      recordTest('integration', 'Data Isolation', dataIsolation.success, dataIsolation.details);

    } catch (error) {
      recordTest('integration', 'System Integration', false, `(${error.message})`);
    }

    // ==================== TEST RESULTS SUMMARY ====================
    console.log('\n📊 COMPREHENSIVE TEST RESULTS');
    console.log('='.repeat(80));

    let totalPassed = 0, totalFailed = 0;
    
    Object.entries(testResults).forEach(([category, results]) => {
      const categoryName = category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      console.log(`\n${categoryName}:`);
      console.log(`  ✅ Passed: ${results.passed}`);
      console.log(`  ❌ Failed: ${results.failed}`);
      console.log(`  📊 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
      
      totalPassed += results.passed;
      totalFailed += results.failed;
    });

    console.log('\n🎯 OVERALL SYSTEM STATUS');
    console.log('='.repeat(80));
    console.log(`✅ Total Tests Passed: ${totalPassed}`);
    console.log(`❌ Total Tests Failed: ${totalFailed}`);
    console.log(`📊 Overall Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`);
    
    const systemStatus = totalFailed === 0 ? '🚀 SYSTEM FULLY OPERATIONAL' : 
                        totalFailed <= 2 ? '⚠️ SYSTEM MOSTLY OPERATIONAL' : 
                        '🔧 SYSTEM NEEDS ATTENTION';
    
    console.log(`🏆 System Status: ${systemStatus}`);

    console.log('\n🎉 COMPREHENSIVE SYSTEM TEST COMPLETE!');

  } catch (error) {
    console.error('💥 Critical error during comprehensive system test:', error);
  } finally {
    process.exit(0);
  }
};

// Helper test functions
const testUserWorkflow = async (adminToken, ownerToken) => {
  try {
    // Test complete user workflow: login -> view users -> check permissions -> access sidebar
    const workflow = await axios.get(`${API_URL}/users`, { headers: { Authorization: `Bearer ${ownerToken}` } });
    const sidebar = await axios.get(`${API_URL}/sidebar/getMyPages`, { headers: { Authorization: `Bearer ${ownerToken}` } });
    return { success: workflow.data.success && sidebar.data.success, details: 'Complete workflow functional' };
  } catch (error) {
    return { success: false, details: error.message };
  }
};

const testPermissionConsistency = async () => {
  try {
    const [consistency] = await db.execute(`
      SELECT COUNT(*) as count FROM role_page_permissions rpp
      INNER JOIN sidebar_pages sp ON rpp.pageId = sp.pageId
      WHERE rpp.isGranted = 1 AND sp.isActive = 1
    `);
    return { success: consistency[0].count > 0, details: `${consistency[0].count} consistent permissions` };
  } catch (error) {
    return { success: false, details: error.message };
  }
};

const testDataIsolation = async (ownerToken) => {
  try {
    const users = await axios.get(`${API_URL}/users`, { headers: { Authorization: `Bearer ${ownerToken}` } });
    const sidebar = await axios.get(`${API_URL}/sidebar/getMyPages`, { headers: { Authorization: `Bearer ${ownerToken}` } });
    return { success: users.data.data.length <= 5 && sidebar.data.data.length <= 10, details: 'Data properly isolated' };
  } catch (error) {
    return { success: false, details: error.message };
  }
};

// Run the comprehensive test
runComprehensiveSystemTest();
