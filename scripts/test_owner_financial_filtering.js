import FinancialTransaction from '../models/financial/FinancialTransaction.js';
import db from '../config/db.js';

const testOwnerFinancialFiltering = async () => {
  console.log('🧪 Testing Owner Financial Transaction Filtering');
  console.log('='.repeat(60));

  try {
    // First, let's check the current data structure
    console.log('\n📋 Checking current data...');
    
    // Check buildings and their assignments
    const [buildings] = await db.execute(`
      SELECT b.buildingId, b.buildingName, ba.userId as assignedUserId
      FROM building b
      LEFT JOIN buildingAssigned ba ON b.buildingId = ba.buildingId
      ORDER BY b.buildingId
    `);
    console.log('Buildings and assignments:', buildings);

    // Check tenants and their apartment assignments
    const [tenantAssignments] = await db.execute(`
      SELECT 
        aa.tenantId, 
        aa.apartmentId,
        CONCAT(u.firstName, ' ', u.lastName) as tenantName,
        a.apartmentId as apartmentNumber,
        f.floorName,
        b.buildingId,
        b.buildingName
      FROM ApartmentAssigned aa
      INNER JOIN tenant t ON aa.tenantId = t.tenantId
      INNER JOIN user u ON t.userId = u.userId
      INNER JOIN apartment a ON aa.apartmentId = a.apartmentId
      INNER JOIN floor f ON a.floorId = f.floorId
      INNER JOIN building b ON f.buildingId = b.buildingId
      ORDER BY b.buildingId, aa.tenantId
    `);
    console.log('Tenant assignments:', tenantAssignments);

    // Check existing financial transactions
    const [existingTransactions] = await db.execute(`
      SELECT ft.transactionId, ft.tenantId, ft.apartmentId, ft.amount, ft.transactionType
      FROM FinancialTransactions ft
      ORDER BY ft.createdAt DESC
      LIMIT 5
    `);
    console.log('Existing transactions:', existingTransactions);

    // Test filtering for a specific owner
    if (buildings.length > 0 && buildings.some(b => b.assignedUserId)) {
      const ownerBuilding = buildings.find(b => b.assignedUserId);
      const ownerUserId = ownerBuilding.assignedUserId;
      const ownerBuildingIds = buildings
        .filter(b => b.assignedUserId === ownerUserId)
        .map(b => b.buildingId);

      console.log(`\n🔍 Testing filtering for owner ${ownerUserId} with buildings:`, ownerBuildingIds);

      // Test the new filtering logic
      const filters = {
        ownerBuildings: ownerBuildingIds
      };

      const filteredTransactions = await FinancialTransaction.getAllTransactions(filters);
      console.log('Filtered transactions for owner:', filteredTransactions);

      // Test without filtering (admin view)
      const allTransactions = await FinancialTransaction.getAllTransactions({});
      console.log('All transactions (admin view):', allTransactions.length, 'total');

      console.log(`\n📊 Results:`);
      console.log(`- Owner sees: ${filteredTransactions.length} transactions`);
      console.log(`- Admin sees: ${allTransactions.length} transactions`);
      console.log(`- Filtering working: ${filteredTransactions.length <= allTransactions.length ? '✅' : '❌'}`);

      // Show which tenants the owner should see
      const ownerTenants = tenantAssignments.filter(ta => 
        ownerBuildingIds.includes(ta.buildingId)
      );
      console.log(`\n👥 Owner should see tenants:`, ownerTenants.map(t => `${t.tenantName} (ID: ${t.tenantId})`));

      // Show which tenants are in the filtered transactions
      const transactionTenants = [...new Set(filteredTransactions.map(t => t.tenantId))];
      console.log(`💰 Transactions are for tenants:`, transactionTenants);

    } else {
      console.log('❌ No building assignments found for testing');
    }

    console.log('\n🎉 Financial transaction filtering test completed!');

  } catch (error) {
    console.error('❌ Error testing financial transaction filtering:', error);
    throw error;
  } finally {
    await db.end();
  }
};

// Run the test
testOwnerFinancialFiltering().catch(console.error);
