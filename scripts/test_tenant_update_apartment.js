import tenantModel from '../models/tenant/Tenant.js';
import db from '../config/db.js';

const testTenantUpdateWithApartmentChange = async () => {
  console.log('🔄 Testing Tenant Update with Apartment Assignment Change');
  console.log('='.repeat(65));

  try {
    // First, create a test tenant with apartment assignment
    console.log('\n📋 Step 1: Creating test tenant with initial apartment...');
    
    // Get two available apartments
    const [apartments] = await db.execute(`
      SELECT apartmentId, status, bedrooms, bathrooms, rentPrice
      FROM apartment 
      WHERE status = 'Vacant'
      ORDER BY apartmentId 
      LIMIT 2
    `);
    
    if (apartments.length < 2) {
      console.log('❌ Need at least 2 vacant apartments for this test');
      return;
    }

    const apartment1Id = apartments[0].apartmentId;
    const apartment2Id = apartments[1].apartmentId;
    
    console.log(`Using apartments: ${apartment1Id} (initial) and ${apartment2Id} (update to)`);

    // Create test tenant
    const testTenantData = {
      firstName: 'Update',
      lastName: 'Test',
      email: `update.test.${Date.now()}@example.com`,
      password: 'TestPassword123!',
      phoneNumber: '+971501234567',
      address: 'Dubai, UAE',
      gender: 'Male',
      nationality: 'UAE',
      dateOfBirth: '1990-01-01',
      registrationNumber: 'UPD123456',
      registrationExpiry: '2025-12-31',
      occupation: 'Software Engineer',
      apartmentId: apartment1Id,
      contractStartDate: '2025-01-01',
      contractEndDate: '2025-12-31',
      securityFee: 5000
    };

    const createdTenant = await tenantModel.createTenant(testTenantData);
    console.log(`✅ Tenant created with ID: ${createdTenant.tenantId}`);

    // Verify initial apartment status
    const [initialStatus] = await db.execute(
      'SELECT apartmentId, status FROM apartment WHERE apartmentId IN (?, ?)',
      [apartment1Id, apartment2Id]
    );
    console.log('\n📊 Initial apartment statuses:');
    console.table(initialStatus);

    // Step 2: Update tenant to change apartment assignment
    console.log('\n🔄 Step 2: Updating tenant to change apartment assignment...');
    
    const updateData = {
      firstName: 'Updated',
      lastName: 'Tenant',
      occupation: 'Senior Software Engineer'
    };

    const apartmentAssignmentData = {
      apartmentId: apartment2Id,
      contractStartDate: '2025-02-01',
      contractEndDate: '2025-12-31',
      securityFee: 6000
    };

    const updatedTenant = await tenantModel.updateTenant(
      createdTenant.tenantId, 
      updateData, 
      apartmentAssignmentData
    );

    console.log('✅ Tenant updated successfully');

    // Verify apartment status changes
    const [finalStatus] = await db.execute(
      'SELECT apartmentId, status FROM apartment WHERE apartmentId IN (?, ?)',
      [apartment1Id, apartment2Id]
    );
    console.log('\n📊 Final apartment statuses:');
    console.table(finalStatus);

    // Verify apartment assignments
    const [assignments] = await db.execute(
      'SELECT tenantId, apartmentId FROM ApartmentAssigned WHERE tenantId = ?',
      [createdTenant.tenantId]
    );
    console.log('\n📊 Current apartment assignments:');
    console.table(assignments);

    // Verify results
    const apartment1Final = finalStatus.find(a => a.apartmentId === apartment1Id);
    const apartment2Final = finalStatus.find(a => a.apartmentId === apartment2Id);

    if (apartment1Final.status === 'Vacant' && apartment2Final.status === 'Rented') {
      console.log('\n🎉 SUCCESS: Apartment statuses updated correctly!');
      console.log(`  - Apartment ${apartment1Id}: Rented → Vacant ✅`);
      console.log(`  - Apartment ${apartment2Id}: Vacant → Rented ✅`);
    } else {
      console.log('\n❌ FAILED: Apartment statuses not updated correctly');
      console.log(`  - Apartment ${apartment1Id}: Expected 'Vacant', got '${apartment1Final.status}'`);
      console.log(`  - Apartment ${apartment2Id}: Expected 'Rented', got '${apartment2Final.status}'`);
    }

    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    
    // Delete apartment assignment
    await db.execute('DELETE FROM ApartmentAssigned WHERE tenantId = ?', [createdTenant.tenantId]);
    
    // Delete contract details and contracts
    await db.execute('DELETE FROM ContractDetails WHERE contractId IN (SELECT contractId FROM Contract WHERE tenantId = ?)', [createdTenant.tenantId]);
    await db.execute('DELETE FROM Contract WHERE tenantId = ?', [createdTenant.tenantId]);
    
    // Delete tenant and user
    await db.execute('DELETE FROM tenant WHERE tenantId = ?', [createdTenant.tenantId]);
    await db.execute('DELETE FROM user WHERE userId = ?', [createdTenant.userId]);
    
    // Reset apartment statuses
    await db.execute('UPDATE apartment SET status = ? WHERE apartmentId IN (?, ?)', ['Vacant', apartment1Id, apartment2Id]);
    
    console.log('✅ Cleanup completed');

  } catch (error) {
    console.error('❌ Error during tenant update test:', error);
  } finally {
    process.exit(0);
  }
};

testTenantUpdateWithApartmentChange();
