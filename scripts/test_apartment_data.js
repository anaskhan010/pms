import db from '../config/db.js';

const testApartmentData = async () => {
  console.log('🏠 Testing Apartment Data Structure');
  console.log('='.repeat(50));

  try {
    // Test the apartment query that the frontend uses
    console.log('\n📋 Testing apartment query...');
    const apartmentQuery = `
      SELECT 
        a.apartmentId,
        a.bedrooms,
        a.bathrooms,
        a.length,
        a.width,
        a.rentPrice,
        a.status,
        f.floorId,
        f.floorName,
        b.buildingId,
        b.buildingName,
        b.buildingAddress
      FROM apartment a
      INNER JOIN floor f ON a.floorId = f.floorId
      INNER JOIN building b ON f.buildingId = b.buildingId
      ORDER BY b.buildingName, f.floorName, a.apartmentId
      LIMIT 5
    `;

    const [apartments] = await db.execute(apartmentQuery);
    console.log(`✅ Found ${apartments.length} apartments`);
    
    if (apartments.length > 0) {
      console.log('\n📊 Sample apartment data:');
      console.log(JSON.stringify(apartments[0], null, 2));
      
      console.log('\n📋 All apartments summary:');
      apartments.forEach((apt, index) => {
        console.log(`${index + 1}. Apartment ${apt.apartmentId} in ${apt.buildingName} (Building ID: ${apt.buildingId})`);
      });
    }

    // Also test tenant assignments
    console.log('\n🔗 Testing tenant assignments...');
    const assignmentQuery = `
      SELECT 
        aa.tenantId,
        aa.apartmentId,
        t.userId,
        CONCAT(u.firstName, ' ', u.lastName) as tenantName,
        a.apartmentId as apartmentNumber,
        b.buildingId,
        b.buildingName
      FROM ApartmentAssigned aa
      LEFT JOIN tenant t ON aa.tenantId = t.tenantId
      LEFT JOIN user u ON t.userId = u.userId
      LEFT JOIN apartment a ON aa.apartmentId = a.apartmentId
      LEFT JOIN floor f ON a.floorId = f.floorId
      LEFT JOIN building b ON f.buildingId = b.buildingId
      ORDER BY b.buildingName
    `;

    const [assignments] = await db.execute(assignmentQuery);
    console.log(`✅ Found ${assignments.length} assignments`);
    
    if (assignments.length > 0) {
      console.log('\n📊 Assignment data:');
      assignments.forEach((assignment, index) => {
        console.log(`${index + 1}. ${assignment.tenantName} -> Apartment ${assignment.apartmentId} in ${assignment.buildingName} (Building ID: ${assignment.buildingId})`);
      });
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎉 Data structure test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Error Code:', error.code);
    if (error.sql) {
      console.error('SQL Query:', error.sql);
    }
  }
};

// Run the test
testApartmentData();
