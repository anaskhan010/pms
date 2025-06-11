const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: './config/config.env' });

async function testConnection() {
  console.log('Testing database connection...');
  console.log('Host:', process.env.DB_HOST);
  console.log('Port:', process.env.DB_PORT);
  console.log('User:', process.env.DB_USER);
  console.log('Database:', process.env.DB_NAME);
  console.log('Password:', process.env.DB_PASSWORD ? '[SET]' : '[EMPTY]');

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('✅ Database connection successful!');
    
    // Test a simple query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Query test successful:', rows);
    
    await connection.end();
    console.log('✅ Connection closed successfully');
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Suggestions:');
      console.log('1. Make sure MySQL server is running');
      console.log('2. Check if MySQL is running on the correct port (3306)');
      console.log('3. Try: brew services start mysql (on macOS)');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Suggestions:');
      console.log('1. Check username and password in config.env');
      console.log('2. Make sure the user has access to the database');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('\n💡 Suggestions:');
      console.log('1. Create the database first');
      console.log('2. Run: CREATE DATABASE pms_database;');
    }
  }
}

testConnection();
