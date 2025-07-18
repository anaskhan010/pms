import db from '../config/db.js';

const checkVirtualToursVendorsTables = async () => {
  try {
    console.log('🔍 Checking virtual tours and vendors table structures...\n');
    
    console.log('Virtual Tours table:');
    const [vtColumns] = await db.execute('DESCRIBE virtual_tours');
    vtColumns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });
    
    console.log('\nVendors table:');
    const [vendorColumns] = await db.execute('DESCRIBE vendors');
    vendorColumns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });
    
    console.log('\nSample virtual tours data:');
    const [vtData] = await db.execute('SELECT * FROM virtual_tours LIMIT 3');
    console.table(vtData);
    
    console.log('\nSample vendors data:');
    const [vendorData] = await db.execute('SELECT * FROM vendors LIMIT 3');
    console.table(vendorData);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
};

checkVirtualToursVendorsTables();
