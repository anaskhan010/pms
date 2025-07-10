import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config({ path: './config/config.env' });

const testApiEndpoint = async () => {
  try {
    console.log('🔄 Testing /api/v1/tenants/available-for-assignment endpoint...');

    // Note: This would normally require authentication, but we're testing the endpoint structure
    const url = 'http://localhost:5000/api/v1/tenants/available-for-assignment';
    console.log('📡 Making request to:', url);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // In a real scenario, you'd need to add Authorization header
          // 'Authorization': 'Bearer YOUR_TOKEN_HERE'
        }
      });

      console.log('📊 Response status:', response.status);
      console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.status === 401) {
        console.log('🔐 Expected 401 - Authentication required (this is normal)');
        console.log('✅ Endpoint exists and is properly protected');
      } else if (response.ok) {
        const data = await response.json();
        console.log('✅ Response data:', JSON.stringify(data, null, 2));
      } else {
        const errorText = await response.text();
        console.log('❌ Error response:', errorText);
      }
    } catch (fetchError) {
      if (fetchError.code === 'ECONNREFUSED') {
        console.log('❌ Connection refused - Backend server is not running on port 5000');
      } else {
        console.log('❌ Fetch error:', fetchError.message);
      }
    }

  } catch (error) {
    console.error('❌ Error testing API endpoint:', error.message);
  }
};

// Run the test
testApiEndpoint();
