import Tenant from '../models/tenant/Tenant.js';

const testApartmentAssignment = async () => {
  console.log('🏠 Testing Apartment Assignment with Payment Schedule Generation');
  console.log('='.repeat(70));

  try {
    // Test data - using existing tenant and apartment IDs
    const tenantId = 4;
    const apartmentId = 15; // Use a different apartment to avoid conflicts
    
    const contractData = {
      startDate: '2025-02-01',
      endDate: '2025-12-31',
      securityFee: 3000.00
    };

    console.log('\n📋 Assignment Details:');
    console.log(`Tenant ID: ${tenantId}`);
    console.log(`Apartment ID: ${apartmentId}`);
    console.log(`Contract Start: ${contractData.startDate}`);
    console.log(`Contract End: ${contractData.endDate}`);
    console.log(`Security Fee: AED ${contractData.securityFee}`);

    console.log('\n🔄 Starting apartment assignment...');
    const startTime = Date.now();

    const result = await Tenant.assignApartment(tenantId, apartmentId, contractData);

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log('\n✅ Assignment completed successfully!');
    console.log(`⏱️ Total time: ${duration}ms`);
    console.log('\n📊 Result:');
    console.log(JSON.stringify(result, null, 2));

    console.log('\n' + '='.repeat(70));
    console.log('🎉 Apartment assignment test completed successfully!');
    console.log('✅ No lock timeout errors occurred');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Error Code:', error.code);
    
    if (error.code === 'ER_LOCK_WAIT_TIMEOUT') {
      console.error('\n🔒 Lock timeout error details:');
      console.error('- This indicates database lock contention');
      console.error('- The fix should have resolved this issue');
      console.error('- If this persists, check for other long-running transactions');
    }
    
    if (error.sql) {
      console.error('\nSQL Query:', error.sql);
    }
  }
};

// Run the test
testApartmentAssignment();
