import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api/v1';
let authToken = null;

// Helper function to make authenticated requests
const makeRequest = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json();
    return { response, data };
  } catch (error) {
    console.error(`Request failed for ${endpoint}:`, error.message);
    return { response: null, data: { error: error.message } };
  }
};

// Test login
const testLogin = async () => {
  console.log('🔐 Testing login...');
  
  const { response, data } = await makeRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@gmail.com',
      password: 'admin'
    })
  });

  if (response && response.ok && data.success) {
    authToken = data.token;
    console.log('✅ Login successful');
    console.log('👤 User:', data.user.firstName, data.user.lastName, '- Role:', data.user.roleName);
    return true;
  } else {
    console.log('❌ Login failed:', data.error || 'Unknown error');
    return false;
  }
};

// Test getting user's sidebar pages
const testGetMyPages = async () => {
  console.log('\n📄 Testing getMyPages...');
  
  const { response, data } = await makeRequest('/sidebar/getMyPages');

  if (response && response.ok && data.success) {
    console.log('✅ getMyPages successful');
    console.log('📊 Pages count:', data.count);
    console.log('📋 Pages:', data.data.map(p => `${p.pageName} (${p.pageUrl})`));
    return true;
  } else {
    console.log('❌ getMyPages failed:', data.error || 'Unknown error');
    return false;
  }
};

// Test getting pages with permissions
const testGetPagesWithPermissions = async () => {
  console.log('\n🔐 Testing getPagesWithPermissions...');
  
  const { response, data } = await makeRequest('/sidebar/getPagesWithPermissions');

  if (response && response.ok && data.success) {
    console.log('✅ getPagesWithPermissions successful');
    console.log('📊 Pages count:', data.count);
    data.data.forEach(page => {
      console.log(`📋 ${page.pageName}: ${page.permissions.map(p => p.permissionType).join(', ')}`);
    });
    return true;
  } else {
    console.log('❌ getPagesWithPermissions failed:', data.error || 'Unknown error');
    return false;
  }
};

// Test getting role permissions
const testGetRolePermissions = async (roleId = 1) => {
  console.log(`\n👥 Testing getRolePagePermissions for role ${roleId}...`);
  
  const { response, data } = await makeRequest(`/sidebar/getRolePagePermissions/${roleId}`);

  if (response && response.ok && data.success) {
    console.log('✅ getRolePagePermissions successful');
    console.log('📊 Pages count:', data.count);
    data.data.forEach(page => {
      const grantedPermissions = page.permissions.filter(p => p.isGranted).map(p => p.permissionType);
      console.log(`📋 ${page.pageName}: ${grantedPermissions.join(', ') || 'No permissions'}`);
    });
    return true;
  } else {
    console.log('❌ getRolePagePermissions failed:', data.error || 'Unknown error');
    return false;
  }
};

// Test checking page permission
const testCheckPagePermission = async () => {
  console.log('\n🔍 Testing checkPagePermission...');
  
  const { response, data } = await makeRequest('/sidebar/checkPagePermission?pageUrl=/admin/dashboard&permissionType=view');

  if (response && response.ok && data.success) {
    console.log('✅ checkPagePermission successful');
    console.log('🔐 Has permission:', data.data.hasPermission);
    return true;
  } else {
    console.log('❌ checkPagePermission failed:', data.error || 'Unknown error');
    return false;
  }
};

// Test updating role permissions
const testUpdateRolePermissions = async (roleId = 2) => {
  console.log(`\n✏️ Testing updateRolePermissions for role ${roleId}...`);
  
  // First get current permissions to modify
  const { response: getResponse, data: getCurrentData } = await makeRequest(`/sidebar/getRolePagePermissions/${roleId}`);
  
  if (!getResponse || !getResponse.ok) {
    console.log('❌ Could not get current permissions for update test');
    return false;
  }

  // Modify permissions - give view access to dashboard
  const pagePermissions = getCurrentData.data.map(page => {
    if (page.pageName === 'Dashboard') {
      return {
        pageId: page.pageId,
        permissions: page.permissions.map(p => ({
          ...p,
          isGranted: p.permissionType === 'view' ? true : p.isGranted
        }))
      };
    }
    return {
      pageId: page.pageId,
      permissions: page.permissions
    };
  });

  const { response, data } = await makeRequest(`/sidebar/updateRolePermissions/${roleId}`, {
    method: 'PUT',
    body: JSON.stringify({ pagePermissions })
  });

  if (response && response.ok && data.success) {
    console.log('✅ updateRolePermissions successful');
    console.log('💾 Message:', data.message);
    return true;
  } else {
    console.log('❌ updateRolePermissions failed:', data.error || 'Unknown error');
    return false;
  }
};

// Run all tests
const runAllTests = async () => {
  console.log('🚀 Starting Sidebar System Tests...\n');
  
  const results = {
    login: false,
    getMyPages: false,
    getPagesWithPermissions: false,
    getRolePermissions: false,
    checkPagePermission: false,
    updateRolePermissions: false
  };

  // Test login first
  results.login = await testLogin();
  if (!results.login) {
    console.log('\n❌ Cannot continue tests without authentication');
    return results;
  }

  // Test all sidebar endpoints
  results.getMyPages = await testGetMyPages();
  results.getPagesWithPermissions = await testGetPagesWithPermissions();
  results.getRolePermissions = await testGetRolePermissions(1); // Test admin role
  results.checkPagePermission = await testCheckPagePermission();
  results.updateRolePermissions = await testUpdateRolePermissions(2); // Test owner role

  // Summary
  console.log('\n📊 Test Results Summary:');
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}`);
  });

  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Sidebar system is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Check the logs above for details.');
  }

  return results;
};

// Run the tests
runAllTests().catch(console.error);
