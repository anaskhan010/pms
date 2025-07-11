import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './config/config.env' });

const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true
};

const runDatabaseFixes = async () => {
  let connection;
  
  try {
    console.log('🔄 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database successfully');

    // Read the SQL file
    const sqlFilePath = path.join(process.cwd(), 'scripts', 'fix_image_tables.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('🔄 Running database schema fixes...');
    
    // Split SQL content by semicolons and execute each statement
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          console.log(`Executing: ${statement.substring(0, 50)}...`);
          await connection.execute(statement);
          console.log('✅ Statement executed successfully');
        } catch (error) {
          // Some statements might fail if they already exist, that's okay
          if (error.code === 'ER_DUP_KEYNAME' || 
              error.code === 'ER_CANT_DROP_FIELD_OR_KEY' ||
              error.code === 'ER_DUP_FIELDNAME' ||
              error.code === 'ER_TABLE_EXISTS_ERROR') {
            console.log(`⚠️  Statement skipped (already exists): ${error.message}`);
          } else {
            console.error(`❌ Error executing statement: ${error.message}`);
            throw error;
          }
        }
      }
    }

    console.log('🎉 Database schema fixes completed successfully!');

    // Verify the changes
    console.log('🔄 Verifying database changes...');
    
    // Check buildingImage table structure
    const [buildingImageCols] = await connection.execute('DESCRIBE buildingImage');
    console.log('buildingImage table columns:', buildingImageCols.map(col => col.Field));

    // Check apartmentImages table structure
    const [apartmentImagesCols] = await connection.execute('DESCRIBE apartmentImages');
    console.log('apartmentImages table columns:', apartmentImagesCols.map(col => col.Field));

    // Check if floorImages table exists
    try {
      const [floorImagesCols] = await connection.execute('DESCRIBE floorImages');
      console.log('floorImages table columns:', floorImagesCols.map(col => col.Field));
    } catch (error) {
      if (error.code === 'ER_NO_SUCH_TABLE') {
        console.log('⚠️  floorImages table does not exist yet');
      } else {
        throw error;
      }
    }

    // Check apartmentAmenities table structure
    const [amenitiesCols] = await connection.execute('DESCRIBE apartmentAmenities');
    console.log('apartmentAmenities table columns:', amenitiesCols.map(col => col.Field));

    console.log('✅ Database verification completed');

  } catch (error) {
    console.error('❌ Database migration failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
};

// Run the migration
runDatabaseFixes();
