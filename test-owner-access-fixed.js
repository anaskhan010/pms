import axios from 'axios';
import db from './config/db.js';

const BASE_URL = 'http://localhost:5000/api/v1';

// Test owner access after the assignment-based fix
const testOwnerAccessFixed = async () => {
  try {
    console.log('🧪 Testing Owner Access After Assignment-Based Fix...\n');

    // Step 1: Get owner user and their assignments
    const [ownerUsers] = await db.execute(`
      SELECT u.userId, u.firstName, u.lastName, u.email, ur.roleId 
      FROM user u 
      JOIN userRole ur ON u.userId = ur.userId 
      WHERE ur.roleId = 2
      LIMIT 1
    `);
    
    if (ownerUsers.length === 0) {
      console.log('❌ No owner users found');
      return;
    }

    const testOwner = ownerUsers[0];
    console.log(`Testing with owner: ${testOwner.firstName} ${testOwner.lastName} (ID: ${testOwner.userId})`);

    // Step 2: Check assigned buildings
    const [assignedBuildings] = await db.execute(`
      SELECT ba.buildingId, b.buildingName 
      FROM buildingAssigned ba 
      JOIN building b ON ba.buildingId = b.buildingId 
      WHERE ba.userId = ?
    `, [testOwner.userId]);
    
    console.log(`\nBuildings assigned to owner: ${assignedBuildings.length}`);
    assignedBuildings.forEach(building => {
      console.log(`- ${building.buildingName} (ID: ${building.buildingId})`);
    });

    // Step 3: Check tenants in assigned buildings
    const assignedBuildingIds = assignedBuildings.map(b => b.buildingId);
    let tenantsInAssignedBuildings = [];
    
    if (assignedBuildingIds.length > 0) {
      const placeholders = assignedBuildingIds.map(() => '?').join(',');
      const [tenants] = await db.execute(`
        SELECT DISTINCT t.tenantId, u.firstName, u.lastName
        FROM tenant t
        INNER JOIN user u ON t.userId = u.userId
        INNER JOIN ApartmentAssigned aa ON t.tenantId = aa.tenantId
        INNER JOIN apartment a ON aa.apartmentId = a.apartmentId
        INNER JOIN floor f ON a.floorId = f.floorId
        WHERE f.buildingId IN (${placeholders})
      `, assignedBuildingIds);
      
      tenantsInAssignedBuildings = tenants;
    }
    
    console.log(`\nTenants in assigned buildings: ${tenantsInAssignedBuildings.length}`);
    tenantsInAssignedBuildings.forEach(tenant => {
      console.log(`- ${tenant.firstName} ${tenant.lastName} (ID: ${tenant.tenantId})`);
    });

    // Step 4: Login as owner
    console.log('\n4. Logging in as owner...');
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

    // Step 5: Test building access (should show ASSIGNED buildings)
    console.log('\n5. Testing building access...');
    try {
      const buildingsResponse = await axios.get(`${BASE_URL}/buildings/getBuildings`, { headers });
      console.log(`✅ Buildings API accessible: ${buildingsResponse.data.count} buildings found`);
      
      if (buildingsResponse.data.data && buildingsResponse.data.data.length > 0) {
        console.log('Buildings returned by API:');
        buildingsResponse.data.data.forEach(building => {
          console.log(`- ${building.buildingName} (ID: ${building.buildingId})`);
          
          // Check if this matches assigned buildings
          const isAssigned = assignedBuildings.some(ab => ab.buildingId === building.buildingId);
          console.log(`  ${isAssigned ? '✅ CORRECTLY ASSIGNED' : '❌ NOT ASSIGNED'}`);
        });
      }
      
      // Verify count matches
      if (buildingsResponse.data.count === assignedBuildings.length) {
        console.log('✅ Building count matches assigned buildings');
      } else {
        console.log(`❌ Building count mismatch: API returned ${buildingsResponse.data.count}, expected ${assignedBuildings.length}`);
      }
      
    } catch (error) {
      console.log(`❌ Building access failed: ${error.response?.data?.error || error.message}`);
    }

    // Step 6: Test tenant access (should show tenants in ASSIGNED buildings)
    console.log('\n6. Testing tenant access...');
    try {
      const tenantsResponse = await axios.get(`${BASE_URL}/tenants/`, { headers });
      console.log(`✅ Tenants API accessible: ${tenantsResponse.data.count} tenants found`);
      
      if (tenantsResponse.data.data && tenantsResponse.data.data.length > 0) {
        console.log('Tenants returned by API:');
        tenantsResponse.data.data.forEach(tenant => {
          console.log(`- ${tenant.firstName} ${tenant.lastName} (ID: ${tenant.tenantId})`);
          
          // Check if this matches tenants in assigned buildings
          const isInAssignedBuilding = tenantsInAssignedBuildings.some(t => t.tenantId === tenant.tenantId);
          console.log(`  ${isInAssignedBuilding ? '✅ IN ASSIGNED BUILDING' : '❌ NOT IN ASSIGNED BUILDING'}`);
        });
      }
      
    } catch (error) {
      console.log(`❌ Tenant access failed: ${error.response?.data?.error || error.message}`);
    }

    // Step 7: Test individual building access
    if (assignedBuildings.length > 0) {
      console.log('\n7. Testing individual building access...');
      const testBuildingId = assignedBuildings[0].buildingId;
      
      try {
        const buildingResponse = await axios.get(`${BASE_URL}/buildings/getBuilding/${testBuildingId}`, { headers });
        console.log(`✅ Individual building access successful: ${buildingResponse.data.data.buildingName}`);
      } catch (error) {
        console.log(`❌ Individual building access failed: ${error.response?.data?.error || error.message}`);
      }
    }

    console.log('\n🎉 Owner access test completed!');
    console.log('✅ Owner should now be able to see their ASSIGNED buildings, apartments, and tenants.');

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
testOwnerAccessFixed();
