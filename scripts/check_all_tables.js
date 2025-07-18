import db from '../config/db.js';

const checkAllTables = async () => {
  try {
    console.log('🔍 Checking all database tables...\n');
    
    const [tables] = await db.execute('SHOW TABLES');
    
    console.log('Available tables:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`  - ${tableName}`);
    });
    
    console.log(`\nTotal tables: ${tables.length}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
};

checkAllTables();
