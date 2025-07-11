import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './config/config.env' });

const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

const checkColumnExists = async (connection, tableName, columnName) => {
  try {
    const [rows] = await connection.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [process.env.DB_NAME, tableName, columnName]
    );
    return rows.length > 0;
  } catch (error) {
    return false;
  }
};

const checkTableExists = async (connection, tableName) => {
  try {
    const [rows] = await connection.execute(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
      [process.env.DB_NAME, tableName]
    );
    return rows.length > 0;
  } catch (error) {
    return false;
  }
};

const runSafeMigration = async () => {
  let connection;
  
  try {
    console.log('🔄 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database successfully');

    // 1. Create floorImages table if it doesn't exist
    console.log('🔄 Creating floorImages table...');
    const floorImagesExists = await checkTableExists(connection, 'floorImages');
    
    if (!floorImagesExists) {
      await connection.execute(`
        CREATE TABLE floorImages (
          imageId int NOT NULL AUTO_INCREMENT,
          floorId int NOT NULL,
          imageUrl varchar(500) NOT NULL,
          createdAt timestamp DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (imageId),
          INDEX idx_floor_id (floorId),
          CONSTRAINT fk_floor_image_floor 
          FOREIGN KEY (floorId) REFERENCES floor (floorId) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
      `);
      console.log('✅ floorImages table created');
    } else {
      console.log('⚠️  floorImages table already exists');
    }

    // 2. Fix buildingImage table structure
    console.log('🔄 Checking buildingImage table...');
    const buildingImageExists = await checkTableExists(connection, 'buildingImage');
    
    if (buildingImageExists) {
      // Check if imageUrl column exists and is correct type
      const [buildingCols] = await connection.execute('DESCRIBE buildingImage');
      const imageUrlCol = buildingCols.find(col => col.Field === 'imageUrl');
      const imagesCol = buildingCols.find(col => col.Field === 'images');
      
      if (imagesCol && imagesCol.Type.includes('int')) {
        console.log('🔄 Fixing buildingImage.images column...');
        await connection.execute('ALTER TABLE buildingImage CHANGE COLUMN images imageUrl VARCHAR(500) NOT NULL');
        console.log('✅ buildingImage.images column fixed');
      }

      // Add createdAt if it doesn't exist
      const createdAtExists = await checkColumnExists(connection, 'buildingImage', 'createdAt');
      if (!createdAtExists) {
        await connection.execute('ALTER TABLE buildingImage ADD COLUMN createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
        console.log('✅ buildingImage.createdAt column added');
      }
    }

    // 3. Fix apartmentImages table structure
    console.log('🔄 Checking apartmentImages table...');
    const apartmentImagesExists = await checkTableExists(connection, 'apartmentImages');
    
    if (apartmentImagesExists) {
      const [apartmentCols] = await connection.execute('DESCRIBE apartmentImages');
      const imageUrlCol = apartmentCols.find(col => col.Field === 'imageUrl');
      
      if (imageUrlCol && imageUrlCol.Type.includes('int')) {
        console.log('🔄 Fixing apartmentImages.imageUrl column...');
        await connection.execute('ALTER TABLE apartmentImages CHANGE COLUMN imageUrl imageUrl VARCHAR(500) NOT NULL');
        console.log('✅ apartmentImages.imageUrl column fixed');
      }

      // Add createdAt if it doesn't exist
      const createdAtExists = await checkColumnExists(connection, 'apartmentImages', 'createdAt');
      if (!createdAtExists) {
        await connection.execute('ALTER TABLE apartmentImages ADD COLUMN createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
        console.log('✅ apartmentImages.createdAt column added');
      }
    }

    // 4. Fix apartmentAmenities table
    console.log('🔄 Checking apartmentAmenities table...');
    const amenitiesExists = await checkTableExists(connection, 'apartmentAmenities');
    
    if (amenitiesExists) {
      const [amenityCols] = await connection.execute('DESCRIBE apartmentAmenities');
      const listCol = amenityCols.find(col => col.Field === 'listOfAmenities');
      
      if (listCol && listCol.Type.includes('int')) {
        console.log('🔄 Fixing apartmentAmenities.listOfAmenities column...');
        await connection.execute('ALTER TABLE apartmentAmenities CHANGE COLUMN listOfAmenities amenityName VARCHAR(100) NOT NULL');
        console.log('✅ apartmentAmenities.listOfAmenities column fixed');
      }
    }

    console.log('🎉 Database migration completed successfully!');

    // Verify the changes
    console.log('🔄 Verifying database changes...');
    
    // Check all tables
    const tables = ['buildingImage', 'apartmentImages', 'floorImages', 'apartmentAmenities'];
    
    for (const table of tables) {
      const exists = await checkTableExists(connection, table);
      if (exists) {
        const [cols] = await connection.execute(`DESCRIBE ${table}`);
        console.log(`${table} columns:`, cols.map(col => `${col.Field} (${col.Type})`));
      } else {
        console.log(`⚠️  ${table} table does not exist`);
      }
    }

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
runSafeMigration();
