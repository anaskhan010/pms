import FinancialTransaction from '../models/financial/FinancialTransaction.js';

const testTransactionCreation = async () => {
  console.log('💰 Testing Transaction Creation');
  console.log('='.repeat(50));

  try {
    // Test with minimal data (similar to what frontend might send)
    const testTransaction = {
      tenantId: 4,
      apartmentId: 15,
      contractId: 9, // Using correct contract ID for Tenant 4 and Apartment 15
      transactionType: 'Rent Payment',
      amount: 2500.00,
      paymentMethod: 'Bank Transfer',
      status: 'Completed',
      description: 'Test rent payment'
    };

    console.log('\n📋 Creating transaction with data:');
    console.log(JSON.stringify(testTransaction, null, 2));

    const result = await FinancialTransaction.createTransaction(testTransaction);
    
    console.log('\n✅ Transaction created successfully!');
    console.log('Transaction ID:', result.transactionId);
    console.log('Reference Number:', result.referenceNumber);

    console.log('\n' + '='.repeat(50));
    console.log('🎉 Transaction creation test completed!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Error Code:', error.code);
    if (error.sql) {
      console.error('SQL Query:', error.sql);
    }
  }
};

// Run the test
testTransactionCreation();
