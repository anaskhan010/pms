import db from '../config/db.js';

const checkBuildingAssignedTable = async () => {
  try {
    console.log('🔍 Checking buildingAssigned table structure...\n');
    
    const [columns] = await db.execute('DESCRIBE buildingAssigned');
    
    console.log('buildingAssigned table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Key ? `KEY: ${col.Key}` : ''} ${col.Default !== null ? `DEFAULT: ${col.Default}` : ''}`);
    });
    
    // Check existing data
    const [data] = await db.execute('SELECT * FROM buildingAssigned LIMIT 5');
    console.log('\nExisting assignments:');
    console.table(data);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
};

checkBuildingAssignedTable();
