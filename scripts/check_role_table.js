import db from '../config/db.js';

const checkRoleTable = async () => {
  try {
    console.log('🔍 Checking role table structure...\n');
    
    const [columns] = await db.execute('DESCRIBE role');
    
    console.log('Role table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Key ? `KEY: ${col.Key}` : ''} ${col.Default ? `DEFAULT: ${col.Default}` : ''}`);
    });
    
    console.log('\nSample role data:');
    const [roles] = await db.execute('SELECT * FROM role LIMIT 5');
    console.table(roles);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
};

checkRoleTable();
