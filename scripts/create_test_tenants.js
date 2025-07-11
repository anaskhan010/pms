import dotenv from 'dotenv';
import db from '../config/db.js';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config({ path: './config/config.env' });

const createTestTenants = async () => {
  try {
    console.log('🔄 Creating test tenants for apartment assignment...');

    const testTenants = [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com',
        phoneNumber: '+1234567891',
        occupation: 'Software Developer',
        nationality: 'US'
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@test.com',
        phoneNumber: '+1234567892',
        occupation: 'Teacher',
        nationality: 'UK'
      },
      {
        firstName: 'Ahmed',
        lastName: 'Ali',
        email: 'ahmed.ali@test.com',
        phoneNumber: '+1234567893',
        occupation: 'Doctor',
        nationality: 'SA'
      }
    ];

    const hashedPassword = await bcrypt.hash('password123', 12);

    for (const tenantData of testTenants) {
      // Check if user already exists
      const [existingUser] = await db.execute('SELECT * FROM user WHERE email = ?', [tenantData.email]);
      
      if (existingUser.length > 0) {
        console.log(`✅ User ${tenantData.firstName} ${tenantData.lastName} already exists`);
        continue;
      }

      // Create user
      const [userResult] = await db.execute(
        'INSERT INTO user (firstName, lastName, email, password, phoneNumber, address, gender, nationality, dateOfBirth, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          tenantData.firstName,
          tenantData.lastName,
          tenantData.email,
          hashedPassword,
          tenantData.phoneNumber,
          '123 Test Street',
          'Male',
          tenantData.nationality,
          '1990-01-01',
          '/public/uploads/users/default-avatar.png'
        ]
      );

      const userId = userResult.insertId;

      // Create tenant
      const [tenantResult] = await db.execute(
        'INSERT INTO tenant (userId, occupation) VALUES (?, ?)',
        [userId, tenantData.occupation]
      );

      console.log(`✅ Created tenant: ${tenantData.firstName} ${tenantData.lastName} (User ID: ${userId}, Tenant ID: ${tenantResult.insertId})`);
    }

    // Display all tenants and their assignment status
    console.log('\n📋 All tenants in the system:');
    const allTenantsQuery = `
      SELECT t.tenantId, u.firstName, u.lastName, u.email, t.occupation,
             CASE WHEN aa.tenantId IS NOT NULL THEN 'Assigned' ELSE 'Available' END as status
      FROM tenant t
      INNER JOIN user u ON t.userId = u.userId
      LEFT JOIN ApartmentAssigned aa ON t.tenantId = aa.tenantId
      ORDER BY u.firstName, u.lastName
    `;
    const [allTenants] = await db.execute(allTenantsQuery);
    
    allTenants.forEach(tenant => {
      console.log(`  - ${tenant.firstName} ${tenant.lastName} (${tenant.email}) - ${tenant.occupation} - Status: ${tenant.status}`);
    });

    // Show available tenants for assignment
    console.log('\n✅ Available tenants for assignment:');
    const availableQuery = `
      SELECT t.tenantId, u.firstName, u.lastName, u.email, u.phoneNumber, t.occupation, u.nationality
      FROM tenant t
      INNER JOIN user u ON t.userId = u.userId
      LEFT JOIN ApartmentAssigned aa ON t.tenantId = aa.tenantId
      WHERE aa.tenantId IS NULL
      ORDER BY u.firstName, u.lastName
    `;
    const [availableTenants] = await db.execute(availableQuery);
    
    if (availableTenants.length === 0) {
      console.log('  - No tenants available for assignment');
    } else {
      availableTenants.forEach(tenant => {
        console.log(`  - ${tenant.firstName} ${tenant.lastName} (${tenant.email}) - ${tenant.occupation}`);
      });
    }

  } catch (error) {
    console.error('❌ Error creating test tenants:', error.message);
  } finally {
    // Close database connection
    await db.end();
    process.exit(0);
  }
};

// Run the script
createTestTenants();
