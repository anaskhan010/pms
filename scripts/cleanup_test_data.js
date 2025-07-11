import db from '../config/db.js';

const cleanupTestData = async () => {
  console.log('🧹 Cleaning up test data for apartment assignment test');
  console.log('='.repeat(50));

  try {
    // Clean up apartment 15 assignments and related data
    const apartmentId = 15;
    const tenantId = 4;

    console.log('\n🔄 Cleaning up existing assignments...');

    // 1. Delete payment schedules for any contracts related to this apartment
    const [contracts] = await db.execute(
      'SELECT contractId FROM ContractDetails WHERE apartmentId = ?',
      [apartmentId]
    );

    for (const contract of contracts) {
      await db.execute(
        'DELETE FROM PaymentSchedule WHERE contractId = ?',
        [contract.contractId]
      );
      console.log(`✅ Deleted payment schedules for contract ${contract.contractId}`);
    }

    // 2. Delete contract details
    await db.execute(
      'DELETE FROM ContractDetails WHERE apartmentId = ?',
      [apartmentId]
    );
    console.log('✅ Deleted contract details');

    // 3. Delete contracts
    await db.execute(
      'DELETE FROM Contract WHERE tenantId = ?',
      [tenantId]
    );
    console.log('✅ Deleted contracts');

    // 4. Delete apartment assignments
    await db.execute(
      'DELETE FROM ApartmentAssigned WHERE apartmentId = ? OR tenantId = ?',
      [apartmentId, tenantId]
    );
    console.log('✅ Deleted apartment assignments');

    // 5. Reset apartment status to Vacant (check valid enum values)
    await db.execute(
      'UPDATE apartment SET status = ? WHERE apartmentId = ?',
      ['Vacant', apartmentId]
    );
    console.log('✅ Reset apartment status to Vacant');

    // 6. Clean up any financial transactions
    await db.execute(
      'DELETE FROM TenantPaymentHistory WHERE tenantId = ? AND apartmentId = ?',
      [tenantId, apartmentId]
    );
    console.log('✅ Deleted payment history');

    await db.execute(
      'DELETE FROM FinancialTransactions WHERE tenantId = ? AND apartmentId = ?',
      [tenantId, apartmentId]
    );
    console.log('✅ Deleted financial transactions');

    console.log('\n' + '='.repeat(50));
    console.log('🎉 Cleanup completed successfully!');
    console.log(`Apartment ${apartmentId} is now ready for testing`);

  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    console.error('Error Code:', error.code);
  }
};

// Run the cleanup
cleanupTestData();
