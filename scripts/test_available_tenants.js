import dotenv from 'dotenv';
import db from '../config/db.js';
import tenantModel from '../models/tenant/Tenant.js';

// Load environment variables
dotenv.config({ path: './config/config.env' });

const testAvailableTenants = async () => {
  try {
    console.log('🔄 Testing available tenants for assignment...');

    // Check all tenants
    console.log('\n📋 All tenants in the system:');
    const allTenantsQuery = `
      SELECT t.tenantId, u.firstName, u.lastName, u.email, t.occupation
      FROM tenant t
      INNER JOIN user u ON t.userId = u.userId
      ORDER BY u.firstName, u.lastName
    `;
    const [allTenants] = await db.execute(allTenantsQuery);
    
    if (allTenants.length === 0) {
      console.log('  - No tenants found in the system');
    } else {
      allTenants.forEach(tenant => {
        console.log(`  - ID: ${tenant.tenantId}, Name: ${tenant.firstName} ${tenant.lastName}, Email: ${tenant.email}, Occupation: ${tenant.occupation}`);
      });
    }

    // Check apartment assignments
    console.log('\n🏠 Current apartment assignments:');
    const assignmentsQuery = `
      SELECT aa.*, t.tenantId, u.firstName, u.lastName,
             CONCAT('Apartment ', a.apartmentId) as apartmentName,
             b.buildingName, f.floorName
      FROM ApartmentAssigned aa
      INNER JOIN tenant t ON aa.tenantId = t.tenantId
      INNER JOIN user u ON t.userId = u.userId
      INNER JOIN apartment a ON aa.apartmentId = a.apartmentId
      INNER JOIN floor f ON a.floorId = f.floorId
      INNER JOIN building b ON f.buildingId = b.buildingId
      ORDER BY u.firstName, u.lastName
    `;
    const [assignments] = await db.execute(assignmentsQuery);
    
    if (assignments.length === 0) {
      console.log('  - No apartment assignments found');
    } else {
      assignments.forEach(assignment => {
        console.log(`  - ${assignment.firstName} ${assignment.lastName} assigned to ${assignment.apartmentName} on ${assignment.floorName} in ${assignment.buildingName}`);
      });
    }

    // Test the getAvailableTenantsForAssignment function
    console.log('\n✅ Available tenants for assignment:');
    const availableTenants = await tenantModel.getAvailableTenantsForAssignment();
    
    if (availableTenants.length === 0) {
      console.log('  - No tenants available for assignment (all tenants are already assigned)');
    } else {
      console.log(`  - Found ${availableTenants.length} available tenant(s):`);
      availableTenants.forEach(tenant => {
        console.log(`    * ID: ${tenant.tenantId}, Name: ${tenant.firstName} ${tenant.lastName}, Email: ${tenant.email}`);
      });
    }

    // Check if the issue is with the table name case sensitivity
    console.log('\n🔍 Checking table structure:');
    const tablesQuery = `SHOW TABLES LIKE '%apartment%'`;
    const [tables] = await db.execute(tablesQuery);
    console.log('  - Tables found:', tables.map(t => Object.values(t)[0]));

  } catch (error) {
    console.error('❌ Error testing available tenants:', error.message);
  } finally {
    // Close database connection
    await db.end();
    process.exit(0);
  }
};

// Run the test
testAvailableTenants();
