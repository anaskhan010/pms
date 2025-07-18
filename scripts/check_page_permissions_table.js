import db from '../config/db.js';

const checkPagePermissionsTable = async () => {
  try {
    console.log('🔍 Checking page_permissions table structure...\n');
    
    const [columns] = await db.execute('DESCRIBE page_permissions');
    
    console.log('Page permissions table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Key ? `KEY: ${col.Key}` : ''} ${col.Default !== null ? `DEFAULT: ${col.Default}` : ''}`);
    });
    
    console.log('\nExisting permissions:');
    const [permissions] = await db.execute('SELECT * FROM page_permissions LIMIT 10');
    console.table(permissions);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
};

checkPagePermissionsTable();
