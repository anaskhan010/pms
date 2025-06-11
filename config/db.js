const mysql = require('mysql2/promise');
const colors = require('colors');

class Database {
  constructor() {
    this.pool = null;
  }

  async connect() {
    try {
      this.pool = mysql.createPool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        charset: 'utf8mb4',
        timezone: '+00:00'
      });

      // Test the connection
      const connection = await this.pool.getConnection();
      console.log(`MySQL Connected: ${connection.connection.config.host}`.cyan.underline);
      connection.release();
      
      return this.pool;
    } catch (error) {
      console.error(`Database connection error: ${error.message}`);
      console.error('Full error:', error);
      console.error('Please check:');
      console.error('1. MySQL server is running');
      console.error('2. Database credentials in config.env are correct');
      console.error('3. Database exists');
      process.exit(1);
    }
  }

  async query(sql, params = []) {
    try {
      const [rows] = await this.pool.execute(sql, params);
      return rows;
    } catch (error) {
      console.error(`Database query error: ${error.message}`.red);
      throw error;
    }
  }

  async transaction(callback) {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
      console.log('Database connection closed'.yellow);
    }
  }
}

module.exports = new Database();
