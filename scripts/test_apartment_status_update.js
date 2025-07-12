import db from '../config/db.js';

const testApartmentStatusUpdate = async () => {
  console.log('🏠 Testing Apartment Status Update');
  console.log('='.repeat(50));

  try {
    // First, let's check what apartments exist and their current status
    console.log('\n📋 Current apartments and their status:');
    const [apartments] = await db.execute(`
      SELECT apartmentId, status, bedrooms, bathrooms, rentPrice
      FROM apartment 
      ORDER BY apartmentId 
      LIMIT 5
    `);
    
    console.table(apartments);

    if (apartments.length === 0) {
      console.log('❌ No apartments found in database');
      return;
    }

    // Test updating the first apartment's status to 'Rented'
    const testApartmentId = apartments[0].apartmentId;
    console.log(`\n🔄 Testing status update for apartment ID: ${testApartmentId}`);
    console.log(`Current status: ${apartments[0].status}`);

    // Update the status
    const updateQuery = 'UPDATE apartment SET status = ? WHERE apartmentId = ?';
    const [updateResult] = await db.execute(updateQuery, ['Rented', testApartmentId]);
    
    console.log('Update result:', updateResult);
    console.log(`Affected rows: ${updateResult.affectedRows}`);

    // Verify the update
    const [verifyResult] = await db.execute(
      'SELECT apartmentId, status FROM apartment WHERE apartmentId = ?',
      [testApartmentId]
    );

    console.log('\n✅ Verification result:');
    console.table(verifyResult);

    if (verifyResult[0].status === 'Rented') {
      console.log('🎉 Status update successful!');
    } else {
      console.log('❌ Status update failed!');
    }

    // Reset the status back to original
    await db.execute(updateQuery, [apartments[0].status, testApartmentId]);
    console.log(`\n🔄 Reset status back to: ${apartments[0].status}`);

  } catch (error) {
    console.error('❌ Error testing apartment status update:', error);
  } finally {
    process.exit(0);
  }
};

testApartmentStatusUpdate();
