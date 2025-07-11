import FinancialTransaction from '../models/financial/FinancialTransaction.js';
import PaymentSchedule from '../models/financial/PaymentSchedule.js';

const createSampleData = async () => {
  console.log('🏗️ Creating Sample Financial Transaction Data');
  console.log('='.repeat(50));

  try {
    // Sample transaction data (using existing tenant/apartment IDs from your system)
    const sampleTransactions = [
      {
        tenantId: 4,
        apartmentId: 14,
        contractId: 5,
        transactionType: 'Rent Payment',
        amount: 2500.00,
        currency: 'AED',
        paymentMethod: 'Bank Transfer',
        transactionDate: '2025-01-15',
        status: 'Completed',
        description: 'Monthly rent payment for January 2025',
        billingPeriodStart: '2025-01-01',
        billingPeriodEnd: '2025-01-31',
        referenceNumber: 'TXN-250115-0001'
      },
      {
        tenantId: 4,
        apartmentId: 14,
        contractId: 5,
        transactionType: 'Security Deposit',
        amount: 5000.00,
        currency: 'AED',
        paymentMethod: 'Credit Card',
        transactionDate: '2024-12-01',
        status: 'Completed',
        description: 'Security deposit for apartment rental',
        referenceNumber: 'TXN-241201-0001'
      },
      {
        tenantId: 4,
        apartmentId: 14,
        contractId: 5,
        transactionType: 'Maintenance Fee',
        amount: 150.00,
        currency: 'AED',
        paymentMethod: 'Cash',
        transactionDate: '2025-01-10',
        status: 'Completed',
        description: 'AC maintenance fee',
        referenceNumber: 'TXN-250110-0001'
      }
    ];

    console.log('\n💰 Creating sample financial transactions...');
    for (let i = 0; i < sampleTransactions.length; i++) {
      const transaction = await FinancialTransaction.createTransaction(sampleTransactions[i]);
      console.log(`✅ Created transaction ${i + 1}: ${transaction.transactionType} - AED ${transaction.amount}`);
    }

    console.log('\n📅 Creating sample payment schedule...');
    const scheduleData = {
      contractId: 5,
      tenantId: 4,
      apartmentId: 14,
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      rentAmount: 2500.00
    };

    const schedules = await PaymentSchedule.generateMonthlyRentSchedule(scheduleData);
    console.log(`✅ Created ${schedules.length} monthly payment schedules`);

    console.log('\n' + '='.repeat(50));
    console.log('🎉 Sample financial data created successfully!');
    console.log('\nYou can now test the financial transaction system with real data.');

  } catch (error) {
    console.error('❌ Error creating sample data:', error.message);
    if (error.code) {
      console.error('Error Code:', error.code);
    }
  }
};

// Run the script
createSampleData();
