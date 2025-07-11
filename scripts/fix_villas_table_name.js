import db from '../config/db.js';

const fixVillasTableName = async () => {
  console.log('🔧 Fixing Villa Table Name (villasAsigned -> villasAssigned)');
  console.log('='.repeat(60));

  try {
    // Check if the old table exists
    console.log('\n📋 Checking current table status...');
    
    let oldTableExists = false;
    let newTableExists = false;
    
    try {
      await db.execute('DESCRIBE villasAsigned');
      oldTableExists = true;
      console.log('✅ Found old table: villasAsigned');
    } catch (error) {
      console.log('❌ Old table villasAsigned does not exist');
    }
    
    try {
      await db.execute('DESCRIBE villasAssigned');
      newTableExists = true;
      console.log('✅ Found new table: villasAssigned');
    } catch (error) {
      console.log('❌ New table villasAssigned does not exist');
    }

    if (oldTableExists && !newTableExists) {
      console.log('\n🔄 Renaming table from villasAsigned to villasAssigned...');
      
      // Rename the table
      await db.execute('RENAME TABLE villasAsigned TO villasAssigned');
      console.log('✅ Table renamed successfully');
      
      // Verify the rename
      try {
        const [rows] = await db.execute('DESCRIBE villasAssigned');
        console.log('✅ New table structure verified:');
        rows.forEach(row => {
          console.log(`   ${row.Field}: ${row.Type} ${row.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${row.Key ? row.Key : ''}`);
        });
      } catch (error) {
        console.log('❌ Error verifying new table:', error.message);
      }
      
    } else if (!oldTableExists && newTableExists) {
      console.log('✅ Table already correctly named as villasAssigned');
      
    } else if (oldTableExists && newTableExists) {
      console.log('⚠️ Both tables exist! Need to merge data...');
      
      // Check data in both tables
      const [oldData] = await db.execute('SELECT COUNT(*) as count FROM villasAsigned');
      const [newData] = await db.execute('SELECT COUNT(*) as count FROM villasAssigned');
      
      console.log(`Old table (villasAsigned) has ${oldData[0].count} records`);
      console.log(`New table (villasAssigned) has ${newData[0].count} records`);
      
      if (oldData[0].count > 0 && newData[0].count === 0) {
        console.log('🔄 Migrating data from old table to new table...');
        await db.execute('INSERT INTO villasAssigned SELECT * FROM villasAsigned');
        console.log('✅ Data migrated successfully');
        
        console.log('🗑️ Dropping old table...');
        await db.execute('DROP TABLE villasAsigned');
        console.log('✅ Old table dropped');
        
      } else if (oldData[0].count === 0) {
        console.log('🗑️ Old table is empty, dropping it...');
        await db.execute('DROP TABLE villasAsigned');
        console.log('✅ Old table dropped');
        
      } else {
        console.log('⚠️ Both tables have data. Manual intervention required.');
        console.log('Please check the data and decide how to merge.');
      }
      
    } else {
      console.log('❌ Neither table exists! Creating villasAssigned table...');
      
      const createTableQuery = `
        CREATE TABLE villasAssigned (
          assignId int NOT NULL AUTO_INCREMENT,
          villaId int NOT NULL,
          userId int NOT NULL,
          createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (assignId),
          KEY fk_villa_assigned_villa (villaId),
          KEY fk_villa_assigned_user (userId),
          CONSTRAINT fk_villa_assigned_villa FOREIGN KEY (villaId) REFERENCES villas (villasId) ON DELETE CASCADE,
          CONSTRAINT fk_villa_assigned_user FOREIGN KEY (userId) REFERENCES user (userId) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
      `;
      
      await db.execute(createTableQuery);
      console.log('✅ villasAssigned table created successfully');
    }

    // Final verification
    console.log('\n📊 Final verification...');
    try {
      const [structure] = await db.execute('DESCRIBE villasAssigned');
      const [count] = await db.execute('SELECT COUNT(*) as count FROM villasAssigned');
      
      console.log('✅ Final table structure:');
      structure.forEach(row => {
        console.log(`   ${row.Field}: ${row.Type} ${row.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${row.Key ? row.Key : ''}`);
      });
      
      console.log(`✅ Table has ${count[0].count} records`);
      
      // Test a simple query to make sure everything works
      const [testQuery] = await db.execute('SELECT * FROM villasAssigned LIMIT 1');
      console.log('✅ Table query test successful');
      
    } catch (error) {
      console.log('❌ Final verification failed:', error.message);
    }

    console.log('\n🎉 Villa table name fix completed!');
    console.log('\n📝 Summary:');
    console.log('- Table name corrected from villasAsigned to villasAssigned');
    console.log('- All code references updated to use correct table name');
    console.log('- Villa assignment functionality should now work properly');

  } catch (error) {
    console.error('❌ Error fixing villa table name:', error);
    throw error;
  } finally {
    await db.end();
  }
};

// Run the fix
fixVillasTableName().catch(console.error);
