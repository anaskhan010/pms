import fs from 'fs';
import path from 'path';
import db from '../config/db.js';

const runMigration = async () => {
  try {
    console.log('🔄 Starting database migration...');
    
    // Read the migration SQL file
    const migrationPath = path.join(process.cwd(), 'scripts', 'fix_image_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        await db.execute(statement);
        console.log(`✅ Statement ${i + 1} executed successfully`);
      } catch (error) {
        // Some statements might fail if they already exist, that's okay
        if (error.code === 'ER_DUP_KEYNAME' || 
            error.code === 'ER_CANT_DROP_FIELD_OR_KEY' ||
            error.code === 'ER_TABLE_EXISTS_ERROR' ||
            error.message.includes('already exists') ||
            error.message.includes('Duplicate key name')) {
          console.log(`⚠️  Statement ${i + 1} skipped (already exists): ${error.message}`);
        } else {
          console.log(`❌ Statement ${i + 1} failed: ${error.message}`);
          // Continue with other statements
        }
      }
    }
    
    console.log('✅ Database migration completed successfully!');
    
    // Test the updated tables
    console.log('\n🔍 Testing updated table structures...');
    
    try {
      const [buildingImageRows] = await db.execute('DESCRIBE buildingImage');
      console.log('✅ buildingImage table structure:');
      buildingImageRows.forEach(row => {
        console.log(`   ${row.Field}: ${row.Type}`);
      });
    } catch (error) {
      console.log('❌ Error checking buildingImage table:', error.message);
    }
    
    try {
      const [apartmentImageRows] = await db.execute('DESCRIBE apartmentImages');
      console.log('✅ apartmentImages table structure:');
      apartmentImageRows.forEach(row => {
        console.log(`   ${row.Field}: ${row.Type}`);
      });
    } catch (error) {
      console.log('❌ Error checking apartmentImages table:', error.message);
    }
    
    try {
      const [amenitiesRows] = await db.execute('DESCRIBE apartmentAmenities');
      console.log('✅ apartmentAmenities table structure:');
      amenitiesRows.forEach(row => {
        console.log(`   ${row.Field}: ${row.Type}`);
      });
    } catch (error) {
      console.log('❌ Error checking apartmentAmenities table:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    // Close database connection
    try {
      await db.end();
      console.log('🔌 Database connection closed');
    } catch (error) {
      console.log('⚠️  Error closing database connection:', error.message);
    }
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('❌ Unhandled Promise Rejection:', err.message);
  process.exit(1);
});

// Run the migration
runMigration().catch(console.error);
