import db from '../config/db.js';

const checkUserTable = async () => {
  try {
    console.log('🔍 Checking user table structure...\n');
    
    const [columns] = await db.execute('DESCRIBE user');
    
    console.log('User table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Key ? `KEY: ${col.Key}` : ''} ${col.Default !== null ? `DEFAULT: ${col.Default}` : ''}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
};

checkUserTable();
