import db from '../config/db.js';

const checkVirtualToursTable = async () => {
  try {
    console.log('🔍 Checking virtual_tours table structure...\n');
    
    const [columns] = await db.execute('DESCRIBE virtual_tours');
    
    console.log('Virtual tours table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Key ? `KEY: ${col.Key}` : ''} ${col.Default !== null ? `DEFAULT: ${col.Default}` : ''}`);
    });
    
    console.log('\nVendors table columns:');
    const [vendorColumns] = await db.execute('DESCRIBE vendors');
    vendorColumns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Key ? `KEY: ${col.Key}` : ''} ${col.Default !== null ? `DEFAULT: ${col.Default}` : ''}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
};

checkVirtualToursTable();
