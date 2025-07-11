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

const setupPermissionSystem = async () => {
  let connection;
  
  try {
    console.log('🔄 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database successfully');

    // Read the SQL file
    const sqlFilePath = path.join(process.cwd(), 'scripts', 'create_permission_system.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('🔄 Setting up permission system...');
    
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
              error.code === 'ER_TABLE_EXISTS_ERROR' ||
              error.code === 'ER_DUP_ENTRY') {
            console.log(`⚠️  Statement skipped (already exists): ${error.message}`);
          } else {
            console.error(`❌ Error executing statement: ${error.message}`);
            throw error;
          }
        }
      }
    }

    console.log('🎉 Permission system setup completed successfully!');

    // Verify the setup
    console.log('🔄 Verifying permission system...');
    
    // Check permissions table
    try {
      const [permissions] = await connection.execute('SELECT COUNT(*) as count FROM permissions');
      console.log(`✅ Permissions table created with ${permissions[0].count} permissions`);
    } catch (error) {
      console.log('⚠️  Permissions table verification failed');
    }

    // Check role_permissions table
    try {
      const [rolePermissions] = await connection.execute('SELECT COUNT(*) as count FROM role_permissions');
      console.log(`✅ Role permissions table created with ${rolePermissions[0].count} assignments`);
    } catch (error) {
      console.log('⚠️  Role permissions table verification failed');
    }

    // Check admin permissions
    try {
      const [adminPerms] = await connection.execute(`
        SELECT COUNT(*) as count 
        FROM role_permissions rp 
        INNER JOIN role r ON rp.roleId = r.roleId 
        WHERE r.roleName = 'admin'
      `);
      console.log(`✅ Admin role has ${adminPerms[0].count} permissions`);
    } catch (error) {
      console.log('⚠️  Admin permissions verification failed');
    }

    // Check owner permissions
    try {
      const [ownerPerms] = await connection.execute(`
        SELECT COUNT(*) as count 
        FROM role_permissions rp 
        INNER JOIN role r ON rp.roleId = r.roleId 
        WHERE r.roleName = 'owner'
      `);
      console.log(`✅ Owner role has ${ownerPerms[0].count} permissions`);
    } catch (error) {
      console.log('⚠️  Owner permissions verification failed');
    }

    console.log('✅ Permission system verification completed');

  } catch (error) {
    console.error('❌ Permission system setup failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
};

// Run the setup
setupPermissionSystem();
