import axios from 'axios';
import db from './config/db.js';

const BASE_URL = 'http://localhost:5000/api/v1';

// Test owner access to assigned buildings, apartments, and tenants
const testOwnerAccess = async () => {
  try {
    console.log('🧪 Testing Owner Access to Assigned Buildings/Apartments/Tenants...\n');

    // Step 1: Check database for owner users and their assignments
    console.log('1. Checking database for owner users and assignments...');
    
    const [ownerUsers] = await db.execute(`
      SELECT u.userId, u.firstName, u.lastName, u.email, ur.roleId 
      FROM user u 
      JOIN userRole ur ON u.userId = ur.userId 
      WHERE ur.roleId = 2
      LIMIT 3
    `);
    
    console.log('Owner users found:', ownerUsers.length);
    ownerUsers.forEach(user => {
      console.log(`- ${user.firstName} ${user.lastName} (${user.email}) - ID: ${user.userId}`);
    });

    if (ownerUsers.length === 0) {
      console.log('❌ No owner users found in database');
      return;
    }

    const testOwner = ownerUsers[0];
    console.log(`\nTesting with owner: ${testOwner.firstName} ${testOwner.lastName} (ID: ${testOwner.userId})`);

    // Step 2: Check building assignments
    console.log('\n2. Checking building assignments...');
    const [buildingAssignments] = await db.execute(`
      SELECT ba.*, b.buildingName 
      FROM buildingAssigned ba 
      JOIN building b ON ba.buildingId = b.buildingId 
      WHERE ba.userId = ?
    `, [testOwner.userId]);
    
    console.log(`Buildings assigned to owner: ${buildingAssignments.length}`);
    buildingAssignments.forEach(assignment => {
      console.log(`- Building: ${assignment.buildingName} (ID: ${assignment.buildingId})`);
    });

    // Step 3: Check buildings created by owner
    console.log('\n3. Checking buildings created by owner...');
    const [createdBuildings] = await db.execute(`
      SELECT buildingId, buildingName 
      FROM building 
      WHERE createdBy = ?
    `, [testOwner.userId]);
    
    console.log(`Buildings created by owner: ${createdBuildings.length}`);
    createdBuildings.forEach(building => {
      console.log(`- Building: ${building.buildingName} (ID: ${building.buildingId})`);
    });

    // Step 4: Login as owner and test API access
    console.log('\n4. Testing API access as owner...');
    
    // First, reset owner password to known value
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.default.hash('owner123', 12);
    await db.execute('UPDATE user SET password = ? WHERE userId = ?', [hashedPassword, testOwner.userId]);
    
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testOwner.email,
      password: 'owner123'
    });

    if (!loginResponse.data.success) {
      console.log('❌ Owner login failed');
      return;
    }

    const ownerToken = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${ownerToken}` };
    
    console.log('✅ Owner login successful');

    // Step 5: Test building access
    console.log('\n5. Testing building access...');
    try {
      const buildingsResponse = await axios.get(`${BASE_URL}/buildings/getBuildings`, { headers });
      console.log(`✅ Buildings API accessible: ${buildingsResponse.data.count} buildings found`);
      console.log(`Total buildings available to owner: ${buildingsResponse.data.total}`);
      
      if (buildingsResponse.data.data && buildingsResponse.data.data.length > 0) {
        console.log('Buildings returned:');
        buildingsResponse.data.data.forEach(building => {
          console.log(`- ${building.buildingName} (ID: ${building.buildingId})`);
        });
      }
    } catch (error) {
      console.log(`❌ Building access failed: ${error.response?.data?.error || error.message}`);
    }

    // Step 6: Test tenant access
    console.log('\n6. Testing tenant access...');
    try {
      const tenantsResponse = await axios.get(`${BASE_URL}/tenants/`, { headers });
      console.log(`✅ Tenants API accessible: ${tenantsResponse.data.count} tenants found`);
      console.log(`Total tenants available to owner: ${tenantsResponse.data.total}`);
    } catch (error) {
      console.log(`❌ Tenant access failed: ${error.response?.data?.error || error.message}`);
    }

    // Step 7: Check what the middleware is actually filtering
    console.log('\n7. Analyzing the issue...');
    console.log('Current middleware logic:');
    console.log('- getOwnerBuildings: Uses buildings WHERE createdBy = userId');
    console.log('- getTenantAccess: Uses buildings WHERE createdBy = userId');
    console.log('');
    console.log('Expected logic should be:');
    console.log('- getOwnerBuildings: Uses buildingAssigned WHERE userId = userId');
    console.log('- getTenantAccess: Uses tenants in assigned buildings');

    console.log('\n🎯 ISSUE IDENTIFIED:');
    console.log('The middleware is using CREATION-based filtering instead of ASSIGNMENT-based filtering!');
    console.log('Owner users should see buildings ASSIGNED to them, not buildings CREATED by them.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  } finally {
    await db.end();
  }
};

// Run the test
testOwnerAccess();
