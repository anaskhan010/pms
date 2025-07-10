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

const runVillaMigration = async () => {
  let connection;
  
  try {
    console.log('🔄 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database successfully');

    // Read the SQL file
    const sqlFilePath = path.join(process.cwd(), 'scripts', 'villa_migration.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('🔄 Running villa migration...');
    
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

    console.log('🎉 Villa migration completed successfully!');

    // Verify the changes
    console.log('🔄 Verifying villa tables...');
    
    // Check villasAssigned table structure
    try {
      const [villasAssignedCols] = await connection.execute('DESCRIBE villasAssigned');
      console.log('villasAssigned table columns:', villasAssignedCols.map(col => col.Field));
    } catch (error) {
      console.log('⚠️  villasAssigned table does not exist');
    }

    // Check if old table exists
    try {
      const [oldTableCols] = await connection.execute('DESCRIBE villasAsigned');
      console.log('⚠️  Old villasAsigned table still exists');
    } catch (error) {
      console.log('✅ Old villasAsigned table removed');
    }

    console.log('✅ Villa migration verification completed');

  } catch (error) {
    console.error('❌ Villa migration failed:', error.message);
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
runVillaMigration();
