import mysql from "mysql2/promise";
import dotenv from 'dotenv'

dotenv.config({ path: './config/config.env' });


const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: '+00:00',
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

console.log('Database config:', {
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  database: dbConfig.database
});

const pool = mysql.createPool(dbConfig);

pool.on('connection', function (connection) {
  console.log('Database connected as id ' + connection.threadId);
});

pool.on('error', function(err) {
  console.error('Database error:', err);
  if(err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('Database connection was closed.');
  }
  if(err.code === 'ER_CON_COUNT_ERROR') {
    console.log('Database has too many connections.');
  }
  if(err.code === 'ECONNREFUSED') {
    console.log('Database connection was refused.');
  }
  if(err.code === 'ER_NO_DB_ERROR') {
    console.log('No database selected. Database name:', process.env.DB_NAME);
  }
});

// Test database connection function
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connection test successful');

    // Test if we can select the database
    const [result] = await connection.execute('SELECT DATABASE() as current_db');
    console.log('Current database:', result[0].current_db);

    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    console.error('Error code:', error.code);
    return false;
  }
};

export default pool;
export { testConnection };






