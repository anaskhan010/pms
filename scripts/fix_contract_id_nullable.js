import db from '../config/db.js';

const fixContractIdNullable = async () => {
  console.log('🔧 Fixing contractId to be nullable in TenantPaymentHistory table');
  console.log('='.repeat(60));

  try {
    // Check current table structure
    console.log('\n📋 Current table structure:');
    const [currentStructure] = await db.execute('DESCRIBE TenantPaymentHistory');
    console.table(currentStructure);

    // Modify the contractId column to allow NULL values
    console.log('\n🔄 Modifying contractId column to allow NULL...');
    const alterQuery = `
      ALTER TABLE TenantPaymentHistory 
      MODIFY COLUMN contractId int NULL
    `;
    
    await db.execute(alterQuery);
    console.log('✅ Successfully modified contractId column to allow NULL values');

    // Check updated table structure
    console.log('\n📋 Updated table structure:');
    const [updatedStructure] = await db.execute('DESCRIBE TenantPaymentHistory');
    console.table(updatedStructure);

    // Test the change by checking if we can insert a record with NULL contractId
    console.log('\n🧪 Testing NULL contractId insertion...');
    const testQuery = `
      INSERT INTO TenantPaymentHistory (
        tenantId, apartmentId, contractId, transactionId, paymentMonth,
        rentAmount, lateFee, totalPaid, paymentDate, paymentMethod, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const testValues = [
      1, // tenantId
      1, // apartmentId  
      null, // contractId (NULL)
      'test-transaction-id',
      '2025-01-01', // paymentMonth
      1000.00, // rentAmount
      0.00, // lateFee
      1000.00, // totalPaid
      '2025-01-01', // paymentDate
      'Bank Transfer', // paymentMethod
      'On Time' // status
    ];

    const [testResult] = await db.execute(testQuery, testValues);
    console.log('✅ Test insertion successful with NULL contractId');
    
    // Clean up test record
    await db.execute('DELETE FROM TenantPaymentHistory WHERE transactionId = ?', ['test-transaction-id']);
    console.log('🧹 Test record cleaned up');

    console.log('\n🎉 Database schema fix completed successfully!');
    console.log('Now transactions can be created without requiring a contractId');

  } catch (error) {
    console.error('❌ Error fixing database schema:', error);
    throw error;
  } finally {
    await db.end();
  }
};

// Run the fix
fixContractIdNullable().catch(console.error);
