import db from '../config/db.js';

const checkFinancialTables = async () => {
  try {
    console.log('🔍 Checking financial transaction tables...\n');
    
    // Check all tables with 'transaction' in the name
    const [tables] = await db.execute(`
      SHOW TABLES LIKE '%transaction%'
    `);
    
    console.log('Tables with "transaction" in name:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`  - ${tableName}`);
    });
    
    // Check all tables with 'financial' in the name
    const [financialTables] = await db.execute(`
      SHOW TABLES LIKE '%financial%'
    `);
    
    console.log('\nTables with "financial" in name:');
    financialTables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`  - ${tableName}`);
    });
    
    // Check all tables
    const [allTables] = await db.execute('SHOW TABLES');
    
    console.log('\nAll tables in database:');
    allTables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`  - ${tableName}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
};

checkFinancialTables();
