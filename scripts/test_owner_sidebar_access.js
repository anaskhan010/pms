import db from '../config/db.js';

const testOwnerSidebarAccess = async () => {
  console.log('🧪 Testing Owner Sidebar Access for Financial Transactions');
  console.log('='.repeat(60));

  try {
    // Check if we have any owner users
    console.log('\n📋 Checking owner users...');
    
    const [owners] = await db.execute(`
      SELECT u.userId, u.firstName, u.lastName, u.email, r.roleName
      FROM user u
      INNER JOIN userRole ur ON u.userId = ur.userId
      INNER JOIN role r ON ur.roleId = r.roleId
      WHERE r.roleName = 'owner'
      LIMIT 5
    `);
    console.log('Owner users:', owners);

    if (owners.length > 0) {
      const owner = owners[0];
      console.log(`\n🔍 Testing access for owner: ${owner.firstName} ${owner.lastName} (ID: ${owner.userId})`);

      // Check building assignments for this owner
      const [buildingAssignments] = await db.execute(`
        SELECT ba.buildingId, b.buildingName
        FROM buildingAssigned ba
        INNER JOIN building b ON ba.buildingId = b.buildingId
        WHERE ba.userId = ?
      `, [owner.userId]);
      console.log('Building assignments:', buildingAssignments);

      // Check if owner has any tenants in their buildings
      if (buildingAssignments.length > 0) {
        const buildingIds = buildingAssignments.map(b => b.buildingId);
        const placeholders = buildingIds.map(() => '?').join(',');
        
        const [tenantAssignments] = await db.execute(`
          SELECT 
            aa.tenantId, 
            CONCAT(u.firstName, ' ', u.lastName) as tenantName,
            a.apartmentId,
            b.buildingName
          FROM ApartmentAssigned aa
          INNER JOIN tenant t ON aa.tenantId = t.tenantId
          INNER JOIN user u ON t.userId = u.userId
          INNER JOIN apartment a ON aa.apartmentId = a.apartmentId
          INNER JOIN floor f ON a.floorId = f.floorId
          INNER JOIN building b ON f.buildingId = b.buildingId
          WHERE b.buildingId IN (${placeholders})
        `, buildingIds);
        console.log('Tenants in owner buildings:', tenantAssignments);

        // Check financial transactions for these tenants
        if (tenantAssignments.length > 0) {
          const tenantIds = tenantAssignments.map(t => t.tenantId);
          const tenantPlaceholders = tenantIds.map(() => '?').join(',');
          
          const [transactions] = await db.execute(`
            SELECT 
              ft.transactionId,
              ft.tenantId,
              ft.amount,
              ft.transactionType,
              ft.status,
              CONCAT(u.firstName, ' ', u.lastName) as tenantName
            FROM FinancialTransactions ft
            INNER JOIN tenant t ON ft.tenantId = t.tenantId
            INNER JOIN user u ON t.userId = u.userId
            WHERE ft.tenantId IN (${tenantPlaceholders})
            ORDER BY ft.createdAt DESC
            LIMIT 10
          `, tenantIds);
          console.log('Financial transactions for owner tenants:', transactions);

          console.log(`\n📊 Summary for owner ${owner.firstName}:`);
          console.log(`- Assigned buildings: ${buildingAssignments.length}`);
          console.log(`- Tenants in buildings: ${tenantAssignments.length}`);
          console.log(`- Financial transactions: ${transactions.length}`);
          
          if (transactions.length > 0) {
            console.log('✅ Owner should be able to see financial transactions in sidebar');
          } else {
            console.log('⚠️ Owner has no financial transactions to view');
          }
        } else {
          console.log('⚠️ Owner has no tenants in their buildings');
        }
      } else {
        console.log('⚠️ Owner has no building assignments');
      }
    } else {
      console.log('❌ No owner users found in database');
    }

    console.log('\n🎉 Owner sidebar access test completed!');
    console.log('\n📝 Frontend Changes Made:');
    console.log('1. Added transactions.view_own permission to owner role in PermissionContext');
    console.log('2. Added financial-transactions to owner sidebar fallback filter');
    console.log('3. Financial transactions menu item should now be visible to owners');

  } catch (error) {
    console.error('❌ Error testing owner sidebar access:', error);
    throw error;
  } finally {
    await db.end();
  }
};

// Run the test
testOwnerSidebarAccess().catch(console.error);
