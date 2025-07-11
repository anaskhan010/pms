import FinancialTransaction from '../models/financial/FinancialTransaction.js';
import db from '../config/db.js';

const testTransactionFix = async () => {
  console.log('🧪 Testing Transaction Creation Fix');
  console.log('='.repeat(50));

  try {
    // First, let's check what tenants and apartments exist
    console.log('\n📋 Checking existing tenants and apartments...');
    
    const [tenants] = await db.execute(`
      SELECT t.tenantId, CONCAT(u.firstName, ' ', u.lastName) as name
      FROM tenant t
      INNER JOIN user u ON t.userId = u.userId
      LIMIT 5
    `);
    console.log('Available tenants:', tenants);

    const [apartments] = await db.execute(`
      SELECT a.apartmentId, a.rentPrice, b.buildingName
      FROM apartment a
      INNER JOIN floor f ON a.floorId = f.floorId
      INNER JOIN building b ON f.buildingId = b.buildingId
      LIMIT 5
    `);
    console.log('Available apartments:', apartments);

    // Check tenant assignments
    const [assignments] = await db.execute(`
      SELECT aa.tenantId, aa.apartmentId, c.contractId
      FROM ApartmentAssigned aa
      LEFT JOIN Contract c ON aa.tenantId = c.tenantId
      LIMIT 5
    `);
    console.log('Tenant assignments:', assignments);

    if (tenants.length > 0 && apartments.length > 0) {
      const tenant = tenants[0];
      const apartment = apartments[0];
      
      console.log(`\n💰 Testing transaction creation for Tenant ${tenant.tenantId} and Apartment ${apartment.apartmentId}...`);

      // Test transaction creation without contractId
      const testTransaction = {
        tenantId: tenant.tenantId,
        apartmentId: apartment.apartmentId,
        // contractId: null, // Not providing contractId
        transactionType: 'Rent Payment',
        amount: 1500.00,
        paymentMethod: 'Bank Transfer',
        status: 'Completed',
        description: 'Test rent payment without contractId'
      };

      const result = await FinancialTransaction.createTransaction(testTransaction);
      console.log('✅ Transaction created successfully:', result.transactionId);

      // Check if payment history was created
      const [paymentHistory] = await db.execute(
        'SELECT * FROM TenantPaymentHistory WHERE transactionId = ?',
        [result.transactionId]
      );
      
      if (paymentHistory.length > 0) {
        console.log('✅ Payment history created:', paymentHistory[0]);
      } else {
        console.log('ℹ️ No payment history created (expected for non-rent payments or when contractId is null)');
      }

      // Clean up test transaction
      await db.execute('DELETE FROM FinancialTransactions WHERE transactionId = ?', [result.transactionId]);
      await db.execute('DELETE FROM TenantPaymentHistory WHERE transactionId = ?', [result.transactionId]);
      console.log('🧹 Test transaction cleaned up');

    } else {
      console.log('❌ No tenants or apartments found for testing');
    }

    console.log('\n🎉 Transaction creation test completed!');

  } catch (error) {
    console.error('❌ Error testing transaction creation:', error);
    throw error;
  } finally {
    await db.end();
  }
};

// Run the test
testTransactionFix().catch(console.error);
