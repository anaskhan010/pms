import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api/v1';

// Test data
const testData = {
  // Sample transaction data
  transaction: {
    tenantId: 4, // Assuming tenant with ID 4 exists
    apartmentId: 14, // Assuming apartment with ID 14 exists
    contractId: 5, // Assuming contract with ID 5 exists
    transactionType: 'Rent Payment',
    amount: 2500.00,
    currency: 'AED',
    paymentMethod: 'Bank Transfer',
    transactionDate: '2025-01-15',
    status: 'Completed',
    description: 'Monthly rent payment for January 2025',
    billingPeriodStart: '2025-01-01',
    billingPeriodEnd: '2025-01-31'
  },
  
  // Sample rent payment data
  rentPayment: {
    tenantId: 4,
    apartmentId: 14,
    contractId: 5,
    amount: 2500.00,
    paymentMethod: 'Credit Card',
    paymentDate: '2025-01-15',
    billingPeriodStart: '2025-01-01',
    billingPeriodEnd: '2025-01-31',
    lateFee: 0,
    notes: 'Test rent payment'
  }
};

// Helper function to make API requests
const apiRequest = async (endpoint, method = 'GET', data = null) => {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    console.log(`\n🔄 ${method} ${endpoint}`);
    const response = await fetch(url, options);
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Success:', result.message || 'Request completed');
      if (result.data) {
        console.log('📊 Data:', JSON.stringify(result.data, null, 2));
      }
      return result;
    } else {
      console.log('❌ Error:', result.error || result.message);
      return null;
    }
  } catch (error) {
    console.log('💥 Request failed:', error.message);
    return null;
  }
};

const runTests = async () => {
  console.log('🚀 Starting Financial Transaction API Tests\n');
  console.log('=' .repeat(50));

  // Test 1: Get all financial transactions
  console.log('\n📋 Test 1: Get All Financial Transactions');
  await apiRequest('/financial/transactions');

  // Test 2: Get financial transaction statistics
  console.log('\n📊 Test 2: Get Financial Transaction Statistics');
  await apiRequest('/financial/transactions/statistics');

  // Test 3: Create a new financial transaction
  console.log('\n➕ Test 3: Create Financial Transaction');
  const createResult = await apiRequest('/financial/transactions', 'POST', testData.transaction);
  let createdTransactionId = null;
  if (createResult && createResult.data) {
    createdTransactionId = createResult.data.transactionId;
  }

  // Test 4: Process rent payment
  console.log('\n💰 Test 4: Process Rent Payment');
  await apiRequest('/financial/transactions/rent-payment', 'POST', testData.rentPayment);

  // Test 5: Get tenant payment history
  console.log('\n📜 Test 5: Get Tenant Payment History');
  await apiRequest(`/financial/transactions/tenant/${testData.transaction.tenantId}/history`);

  // Test 6: Get apartment payment history
  console.log('\n🏠 Test 6: Get Apartment Payment History');
  await apiRequest(`/financial/transactions/apartment/${testData.transaction.apartmentId}/history`);

  // Test 7: Get payment schedules
  console.log('\n📅 Test 7: Get Payment Schedules');
  await apiRequest('/financial/payment-schedules');

  // Test 8: Get overdue payments
  console.log('\n⏰ Test 8: Get Overdue Payments');
  await apiRequest('/financial/payment-schedules/overdue');

  // Test 9: Get upcoming payments
  console.log('\n🔔 Test 9: Get Upcoming Payments');
  await apiRequest('/financial/payment-schedules/upcoming?days=30');

  // Test 10: Update transaction (if we created one)
  if (createdTransactionId) {
    console.log('\n✏️ Test 10: Update Financial Transaction');
    await apiRequest(`/financial/transactions/${createdTransactionId}`, 'PUT', {
      status: 'Completed',
      description: 'Updated test transaction'
    });
  }

  // Test 11: Generate monthly payment schedule
  console.log('\n📆 Test 11: Generate Monthly Payment Schedule');
  await apiRequest('/financial/payment-schedules/generate-monthly', 'POST', {
    contractId: 5,
    tenantId: 4,
    apartmentId: 14,
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    rentAmount: 2500.00
  });

  // Test 12: Get payment schedule statistics
  console.log('\n📈 Test 12: Get Payment Schedule Statistics');
  await apiRequest('/financial/payment-schedules/statistics');

  console.log('\n' + '='.repeat(50));
  console.log('🎉 Financial Transaction API Tests Completed!');
  console.log('\nNote: Some tests may fail if the required data (tenants, apartments, contracts) doesn\'t exist in the database.');
  console.log('Make sure you have test data before running these tests.');
};

// Run the tests
runTests().catch(console.error);
