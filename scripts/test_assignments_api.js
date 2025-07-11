import Tenant from '../models/tenant/Tenant.js';

const testAssignmentsAPI = async () => {
  console.log('🔗 Testing Apartment Assignments API');
  console.log('='.repeat(50));

  try {
    console.log('\n📋 Fetching apartment assignments...');
    const assignments = await Tenant.getApartmentAssignments();
    
    console.log(`✅ Found ${assignments.length} apartment assignments`);
    
    if (assignments.length > 0) {
      console.log('\n📊 Sample assignment data:');
      console.log(JSON.stringify(assignments[0], null, 2));
      
      console.log('\n📋 All assignments summary:');
      assignments.forEach((assignment, index) => {
        console.log(`${index + 1}. Tenant: ${assignment.tenantName} -> Apartment ${assignment.apartmentId} in ${assignment.buildingName}`);
      });
    } else {
      console.log('\n⚠️ No apartment assignments found');
      console.log('This might be expected if no apartments are currently assigned');
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎉 Apartment assignments API test completed successfully!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Error Code:', error.code);
    if (error.sql) {
      console.error('SQL Query:', error.sql);
    }
  }
};

// Run the test
testAssignmentsAPI();
