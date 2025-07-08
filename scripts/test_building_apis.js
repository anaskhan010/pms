import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api/v1';

// Test data
const testBuilding = {
  buildingName: 'Test Building',
  buildingAddress: 'Test Address, Dubai'
};

let authToken = '';
let createdBuildingId = null;

// Helper function to make authenticated requests
const makeRequest = async (url, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers
  });

  const data = await response.json();
  return { response, data };
};

// Test functions
const testLogin = async () => {
  console.log('🔐 Testing login...');
  const { response, data } = await makeRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@example.com', // Update with actual admin credentials
      password: 'password123'
    })
  });

  if (response.ok && data.success) {
    authToken = data.token;
    console.log('✅ Login successful');
    return true;
  } else {
    console.log('❌ Login failed:', data.error);
    return false;
  }
};

const testGetBuildings = async () => {
  console.log('🏢 Testing get all buildings...');
  const { response, data } = await makeRequest('/buildings');

  if (response.ok && data.success) {
    console.log('✅ Get buildings successful');
    console.log(`   Found ${data.data.length} buildings`);
    return true;
  } else {
    console.log('❌ Get buildings failed:', data.error);
    return false;
  }
};

const testCreateBuilding = async () => {
  console.log('🏗️ Testing create building...');
  const { response, data } = await makeRequest('/buildings', {
    method: 'POST',
    body: JSON.stringify(testBuilding)
  });

  if (response.ok && data.success) {
    createdBuildingId = data.data.buildingId;
    console.log('✅ Create building successful');
    console.log(`   Created building with ID: ${createdBuildingId}`);
    return true;
  } else {
    console.log('❌ Create building failed:', data.error);
    return false;
  }
};

const testGetBuildingById = async () => {
  if (!createdBuildingId) {
    console.log('⏭️ Skipping get building by ID (no building created)');
    return true;
  }

  console.log('🔍 Testing get building by ID...');
  const { response, data } = await makeRequest(`/buildings/${createdBuildingId}`);

  if (response.ok && data.success) {
    console.log('✅ Get building by ID successful');
    console.log(`   Building name: ${data.data.buildingName}`);
    return true;
  } else {
    console.log('❌ Get building by ID failed:', data.error);
    return false;
  }
};

const testUpdateBuilding = async () => {
  if (!createdBuildingId) {
    console.log('⏭️ Skipping update building (no building created)');
    return true;
  }

  console.log('✏️ Testing update building...');
  const updateData = {
    buildingName: 'Updated Test Building',
    buildingAddress: 'Updated Test Address, Dubai'
  };

  const { response, data } = await makeRequest(`/buildings/${createdBuildingId}`, {
    method: 'PUT',
    body: JSON.stringify(updateData)
  });

  if (response.ok && data.success) {
    console.log('✅ Update building successful');
    return true;
  } else {
    console.log('❌ Update building failed:', data.error);
    return false;
  }
};

const testDeleteBuilding = async () => {
  if (!createdBuildingId) {
    console.log('⏭️ Skipping delete building (no building created)');
    return true;
  }

  console.log('🗑️ Testing delete building...');
  const { response, data } = await makeRequest(`/buildings/${createdBuildingId}`, {
    method: 'DELETE'
  });

  if (response.ok && data.success) {
    console.log('✅ Delete building successful');
    return true;
  } else {
    console.log('❌ Delete building failed:', data.error);
    return false;
  }
};

// Run all tests
const runTests = async () => {
  console.log('🚀 Starting Building API Tests...\n');

  const tests = [
    testLogin,
    testGetBuildings,
    testCreateBuilding,
    testGetBuildingById,
    testUpdateBuilding,
    testDeleteBuilding
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.log(`❌ Test failed with error: ${error.message}`);
      failed++;
    }
    console.log(''); // Empty line for readability
  }

  console.log('📊 Test Results:');
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('❌ Unhandled Promise Rejection:', err.message);
  process.exit(1);
});

// Run the tests
runTests().catch(console.error);
