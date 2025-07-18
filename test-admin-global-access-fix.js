import axios from 'axios';
import db from './config/db.js';

const BASE_URL = 'http://localhost:5000/api/v1';

// Test admin global access after fixes
const testAdminGlobalAccess = async () => {
  try {
    console.log('🧪 Testing Admin Global Access After Fixes...\n');

    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@gmail.com',
      password: 'admin123'
    });

    if (!loginResponse.data.success) {
      throw new Error('Admin login failed');
    }

    const adminToken = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${adminToken}` };

    console.log('✅ Admin login successful');
    console.log(`Admin User ID: ${loginResponse.data.data.userId}`);
    console.log(`Admin Role ID: ${loginResponse.data.data.roleId}\n`);

    // Step 2: Test villa access
    console.log('2. Testing villa access...');
    try {
      const villasResponse = await axios.get(`${BASE_URL}/villas/getVillas`, { headers });
      console.log(`✅ Villas fetched successfully: ${villasResponse.data.count} villas found`);
      console.log(`Total villas in system: ${villasResponse.data.total}`);
    } catch (error) {
      console.log(`❌ Villa access failed: ${error.response?.data?.error || error.message}`);
    }

    // Step 3: Test building access
    console.log('\n3. Testing building access...');
    try {
      const buildingsResponse = await axios.get(`${BASE_URL}/buildings/getBuildings`, { headers });
      console.log(`✅ Buildings fetched successfully: ${buildingsResponse.data.count} buildings found`);
      console.log(`Total buildings in system: ${buildingsResponse.data.total}`);
    } catch (error) {
      console.log(`❌ Building access failed: ${error.response?.data?.error || error.message}`);
    }

    // Step 4: Test tenant access
    console.log('\n4. Testing tenant access...');
    try {
      const tenantsResponse = await axios.get(`${BASE_URL}/tenants/`, { headers });
      console.log(`✅ Tenants fetched successfully: ${tenantsResponse.data.count} tenants found`);
      console.log(`Total tenants in system: ${tenantsResponse.data.total}`);
    } catch (error) {
      console.log(`❌ Tenant access failed: ${error.response?.data?.error || error.message}`);
    }

    // Step 5: Test financial transaction access
    console.log('\n5. Testing financial transaction access...');
    try {
      const transactionsResponse = await axios.get(`${BASE_URL}/financial/transactions/`, { headers });
      console.log(`✅ Transactions fetched successfully: ${transactionsResponse.data.count} transactions found`);
      console.log(`Total transactions in system: ${transactionsResponse.data.total}`);
    } catch (error) {
      console.log(`❌ Transaction access failed: ${error.response?.data?.error || error.message}`);
    }

    // Step 6: Test user management access
    console.log('\n6. Testing user management access...');
    try {
      const usersResponse = await axios.get(`${BASE_URL}/users/`, { headers });
      console.log(`✅ Users fetched successfully: ${usersResponse.data.data.users.length} users found`);
      console.log(`Total users in system: ${usersResponse.data.data.pagination.totalUsers}`);
    } catch (error) {
      console.log(`❌ User access failed: ${error.response?.data?.error || error.message}`);
    }

    // Step 7: Verify database counts directly
    console.log('\n7. Verifying database counts directly...');
    
    const [villaCount] = await db.execute('SELECT COUNT(*) as count FROM villas');
    const [buildingCount] = await db.execute('SELECT COUNT(*) as count FROM building');
    const [tenantCount] = await db.execute('SELECT COUNT(*) as count FROM tenant');
    const [transactionCount] = await db.execute('SELECT COUNT(*) as count FROM FinancialTransactions');
    const [userCount] = await db.execute('SELECT COUNT(*) as count FROM user');

    console.log(`Database villa count: ${villaCount[0].count}`);
    console.log(`Database building count: ${buildingCount[0].count}`);
    console.log(`Database tenant count: ${tenantCount[0].count}`);
    console.log(`Database transaction count: ${transactionCount[0].count}`);
    console.log(`Database user count: ${userCount[0].count}`);

    console.log('\n🎉 Admin global access test completed!');
    console.log('✅ Admin should be able to see ALL data without any filtering restrictions.');

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
testAdminGlobalAccess();
