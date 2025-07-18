import axios from 'axios';
import db from './config/db.js';

const BASE_URL = 'http://localhost:5000/api/v1';

// Debug tenant access issue
const debugTenantAccess = async () => {
  try {
    console.log('🔍 Debugging Tenant Access Issue...\n');

    // Step 1: Get owner user
    const [ownerUsers] = await db.execute(`
      SELECT u.userId, u.firstName, u.lastName, u.email 
      FROM user u 
      JOIN userRole ur ON u.userId = ur.userId 
      WHERE ur.roleId = 2
      LIMIT 1
    `);
    
    const testOwner = ownerUsers[0];
    console.log(`Testing with owner: ${testOwner.firstName} ${testOwner.lastName} (ID: ${testOwner.userId})`);

    // Step 2: Check what the middleware should return
    console.log('\n2. Checking what getTenantAccess middleware should return...');
    
    // Check assigned buildings
    const [assignedBuildings] = await db.execute(`
      SELECT buildingId FROM buildingAssigned WHERE userId = ?
    `, [testOwner.userId]);
    
    const buildingIds = assignedBuildings.map(row => row.buildingId);
    console.log(`Assigned building IDs: [${buildingIds.join(', ')}]`);
    
    // Check tenants created by owner
    const [createdTenants] = await db.execute(`
      SELECT tenantId FROM tenant WHERE createdBy = ?
    `, [testOwner.userId]);
    
    const tenantIds = createdTenants.map(row => row.tenantId);
    console.log(`Created tenant IDs: [${tenantIds.join(', ')}]`);
    
    console.log(`Expected tenantFilter: { buildingIds: [${buildingIds.join(', ')}], tenantIds: [${tenantIds.join(', ')}] }`);

    // Step 3: Check what tenants should be visible
    console.log('\n3. Checking what tenants should be visible...');
    
    if (buildingIds.length > 0) {
      const placeholders = buildingIds.map(() => '?').join(',');
      const [tenantsInBuildings] = await db.execute(`
        SELECT DISTINCT t.tenantId, u.firstName, u.lastName
        FROM tenant t
        INNER JOIN user u ON t.userId = u.userId
        INNER JOIN ApartmentAssigned aa ON t.tenantId = aa.tenantId
        INNER JOIN apartment a ON aa.apartmentId = a.apartmentId
        INNER JOIN floor f ON a.floorId = f.floorId
        WHERE f.buildingId IN (${placeholders})
      `, buildingIds);
      
      console.log(`Tenants in assigned buildings: ${tenantsInBuildings.length}`);
      tenantsInBuildings.forEach(tenant => {
        console.log(`- ${tenant.firstName} ${tenant.lastName} (ID: ${tenant.tenantId})`);
      });
    }

    // Step 4: Login and test API
    console.log('\n4. Testing API with owner login...');
    
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.default.hash('owner123', 12);
    await db.execute('UPDATE user SET password = ? WHERE userId = ?', [hashedPassword, testOwner.userId]);
    
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testOwner.email,
      password: 'owner123'
    });

    const ownerToken = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${ownerToken}` };

    // Test tenant API with debug
    try {
      const tenantsResponse = await axios.get(`${BASE_URL}/tenants/?limit=50`, { headers });
      console.log(`API Response: ${tenantsResponse.data.count} tenants found`);
      console.log(`Total in system: ${tenantsResponse.data.total}`);
      
      if (tenantsResponse.data.data && tenantsResponse.data.data.length > 0) {
        console.log('Tenants returned by API:');
        tenantsResponse.data.data.forEach(tenant => {
          console.log(`- Tenant ID: ${tenant.tenantId}, User: ${tenant.firstName} ${tenant.lastName}`);
        });
      } else {
        console.log('❌ No tenants returned by API');
      }
      
    } catch (error) {
      console.log(`❌ Tenant API failed: ${error.response?.data?.error || error.message}`);
      if (error.response?.data) {
        console.log('Full error response:', error.response.data);
      }
    }

    // Step 5: Check server logs for middleware output
    console.log('\n5. Check the server console logs for middleware debug output');
    console.log('Look for lines like: "🔍 Filtering tenants for owner: X buildings, Y direct tenants"');

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    await db.end();
  }
};

// Run the debug
debugTenantAccess();
