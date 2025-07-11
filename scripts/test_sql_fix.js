import FinancialTransaction from '../models/financial/FinancialTransaction.js';

const testSQLFix = async () => {
  console.log('🧪 Testing SQL Fix for Financial Transactions');
  console.log('='.repeat(50));

  try {
    // Test 1: Get all transactions without filters
    console.log('\n📋 Test 1: Get all transactions (no filters)');
    const allTransactions = await FinancialTransaction.getAllTransactions();
    console.log('✅ Success - Found', allTransactions.length, 'transactions');

    // Test 2: Get transactions with pagination
    console.log('\n📄 Test 2: Get transactions with pagination');
    const paginatedTransactions = await FinancialTransaction.getAllTransactions({
      limit: 5,
      offset: 0
    });
    console.log('✅ Success - Found', paginatedTransactions.length, 'transactions (paginated)');

    // Test 3: Get transactions with filters
    console.log('\n🔍 Test 3: Get transactions with filters');
    const filteredTransactions = await FinancialTransaction.getAllTransactions({
      transactionType: 'Rent Payment',
      status: 'Completed'
    });
    console.log('✅ Success - Found', filteredTransactions.length, 'filtered transactions');

    // Test 4: Get transactions with filters and pagination
    console.log('\n🔍📄 Test 4: Get transactions with filters and pagination');
    const filteredPaginatedTransactions = await FinancialTransaction.getAllTransactions({
      transactionType: 'Rent Payment',
      limit: 3,
      offset: 0
    });
    console.log('✅ Success - Found', filteredPaginatedTransactions.length, 'filtered paginated transactions');

    console.log('\n' + '='.repeat(50));
    console.log('🎉 All SQL tests passed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('SQL Error:', error.sql);
    console.error('Error Code:', error.code);
  }
};

// Run the test
testSQLFix();
