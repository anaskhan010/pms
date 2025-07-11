import db from '../config/db.js';

const checkContracts = async () => {
  console.log('📋 Checking Available Contracts');
  console.log('='.repeat(50));

  try {
    // Check contracts
    const [contracts] = await db.execute('SELECT * FROM Contract ORDER BY contractId');
    console.log(`✅ Found ${contracts.length} contracts`);
    
    if (contracts.length > 0) {
      console.log('\n📊 Available contracts:');
      contracts.forEach((contract, index) => {
        console.log(`${index + 1}. Contract ID: ${contract.contractId}, Tenant ID: ${contract.tenantId}, Start: ${contract.startDate}, End: ${contract.endDate}`);
      });
    } else {
      console.log('\n⚠️ No contracts found');
    }

    // Check contract details
    const [contractDetails] = await db.execute('SELECT * FROM ContractDetails ORDER BY contractId');
    console.log(`\n✅ Found ${contractDetails.length} contract details`);
    
    if (contractDetails.length > 0) {
      console.log('\n📊 Contract details:');
      contractDetails.forEach((detail, index) => {
        console.log(`${index + 1}. Contract ID: ${detail.contractId}, Apartment ID: ${detail.apartmentId}`);
      });
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎉 Contract check completed!');

  } catch (error) {
    console.error('❌ Check failed:', error.message);
    console.error('Error Code:', error.code);
  }
};

// Run the check
checkContracts();
