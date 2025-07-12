import tenantModel from '../models/tenant/Tenant.js';
import db from '../config/db.js';

const testTenantCreationWithApartment = async () => {
  console.log('👤 Testing Tenant Creation with Apartment Assignment');
  console.log('='.repeat(60));

  try {
    // First, get an available apartment
    console.log('\n📋 Finding available apartments:');
    const [apartments] = await db.execute(`
      SELECT apartmentId, status, bedrooms, bathrooms, rentPrice
      FROM apartment 
      WHERE status = 'Vacant'
      ORDER BY apartmentId 
      LIMIT 3
    `);
    
    console.table(apartments);

    if (apartments.length === 0) {
      console.log('❌ No vacant apartments found');
      return;
    }

    const testApartmentId = apartments[0].apartmentId;
    console.log(`\n🏠 Using apartment ID: ${testApartmentId} for test`);

    // Create test tenant data
    const testTenantData = {
      firstName: 'Test',
      lastName: 'Tenant',
      email: `test.tenant.${Date.now()}@example.com`,
      password: 'TestPassword123!',
      phoneNumber: '+971501234567',
      address: 'Dubai, UAE',
      gender: 'Male',
      nationality: 'UAE',
      dateOfBirth: '1990-01-01',
      registrationNumber: 'REG123456',
      registrationExpiry: '2025-12-31',
      occupation: 'Software Engineer',
      apartmentId: testApartmentId,
      contractStartDate: '2025-01-01',
      contractEndDate: '2025-12-31',
      securityFee: 5000
    };

    console.log('\n📝 Creating tenant with data:');
    console.log('Tenant email:', testTenantData.email);
    console.log('Apartment ID:', testTenantData.apartmentId);
    console.log('Contract dates:', testTenantData.contractStartDate, 'to', testTenantData.contractEndDate);

    // Create the tenant
    const createdTenant = await tenantModel.createTenant(testTenantData);
    console.log('\n✅ Tenant created successfully:');
    console.log('Tenant ID:', createdTenant.tenantId);

    // Check if apartment status was updated
    console.log('\n🔍 Checking apartment status after tenant creation:');
    const [updatedApartment] = await db.execute(
      'SELECT apartmentId, status FROM apartment WHERE apartmentId = ?',
      [testApartmentId]
    );

    console.table(updatedApartment);

    if (updatedApartment[0].status === 'Rented') {
      console.log('🎉 SUCCESS: Apartment status updated to "Rented"!');
    } else {
      console.log('❌ FAILED: Apartment status was not updated to "Rented"');
      console.log('Current status:', updatedApartment[0].status);
    }

    // Check apartment assignment
    console.log('\n🔍 Checking apartment assignment:');
    const [assignment] = await db.execute(
      'SELECT * FROM ApartmentAssigned WHERE tenantId = ? AND apartmentId = ?',
      [createdTenant.tenantId, testApartmentId]
    );

    if (assignment.length > 0) {
      console.log('✅ Apartment assignment created successfully');
      console.table(assignment);
    } else {
      console.log('❌ Apartment assignment not found');
    }

    // Cleanup - Delete the test tenant and reset apartment status
    console.log('\n🧹 Cleaning up test data...');
    
    // Delete apartment assignment
    await db.execute('DELETE FROM ApartmentAssigned WHERE tenantId = ?', [createdTenant.tenantId]);
    
    // Delete contract details
    await db.execute('DELETE FROM ContractDetails WHERE contractId IN (SELECT contractId FROM Contract WHERE tenantId = ?)', [createdTenant.tenantId]);
    
    // Delete contract
    await db.execute('DELETE FROM Contract WHERE tenantId = ?', [createdTenant.tenantId]);
    
    // Delete tenant
    await db.execute('DELETE FROM tenant WHERE tenantId = ?', [createdTenant.tenantId]);
    
    // Delete user
    await db.execute('DELETE FROM user WHERE userId = ?', [createdTenant.userId]);
    
    // Reset apartment status
    await db.execute('UPDATE apartment SET status = ? WHERE apartmentId = ?', ['Vacant', testApartmentId]);
    
    console.log('✅ Cleanup completed');

  } catch (error) {
    console.error('❌ Error during tenant creation test:', error);
  } finally {
    process.exit(0);
  }
};

testTenantCreationWithApartment();
