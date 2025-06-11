# PMS API Setup Guide

## Quick Start

### 1. Database Setup

1. **Create MySQL Database**
   ```sql
   CREATE DATABASE pms_database;
   USE pms_database;
   ```

2. **Run the main SQL script**
   ```bash
   mysql -u your_username -p pms_database < Untitled.sql
   ```

3. **Update Users table for authentication**
   ```bash
   mysql -u your_username -p pms_database < scripts/updateUsersTable.sql
   ```

### 2. Install Dependencies

```bash
# Install all dependencies
npm install

# If you encounter npm cache issues, try:
npm cache clean --force
# or
sudo chown -R $(whoami) ~/.npm
```

### 3. Environment Configuration

Update `config/config.env` with your database credentials:

```env
NODE_ENV=development
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=pms_database
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_make_it_very_long_and_complex
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
```

### 4. Start the Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

### 5. Create Admin User

```bash
# Create default admin user
npm run create-admin
```

This creates:
- Email: `admin@pms.com`
- Password: `Admin123!`

**⚠️ Change the password after first login!**

### 6. Test the API

1. **Health Check**
   ```bash
   curl http://localhost:5000/api/v1/health
   ```

2. **Login**
   ```bash
   curl -X POST http://localhost:5000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@pms.com","password":"Admin123!"}'
   ```

3. **Use the JWT token from login response for authenticated requests**

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check MySQL is running
   - Verify credentials in `config/config.env`
   - Ensure database exists

2. **npm Install Issues**
   ```bash
   # Clear npm cache
   npm cache clean --force
   
   # Fix permissions (macOS/Linux)
   sudo chown -R $(whoami) ~/.npm
   
   # Try with --force flag
   npm install --force
   ```

3. **Port Already in Use**
   ```bash
   # Find process using port 5000
   lsof -i :5000
   
   # Kill the process
   kill -9 PID
   
   # Or change port in config/config.env
   ```

4. **JWT Secret Error**
   - Make sure JWT_SECRET is set in config/config.env
   - Use a long, complex secret key

### Database Schema Issues

If you encounter table-related errors:

1. **Check if tables exist**
   ```sql
   SHOW TABLES;
   ```

2. **Verify Users table structure**
   ```sql
   DESCRIBE Users;
   ```

3. **If Users table is missing columns, run:**
   ```bash
   mysql -u your_username -p pms_database < scripts/updateUsersTable.sql
   ```

## API Testing

Use the provided `test-api.http` file with VS Code REST Client extension or similar tools.

### Example Workflow

1. **Register/Login** to get JWT token
2. **Create Property** using the token
3. **Create Units** for the property
4. **Create Tenants** and **Contracts**
5. **Test different user roles** and permissions

## Development Tips

1. **Use nodemon for development**
   ```bash
   npm run dev
   ```

2. **Check logs** for debugging
   - Server logs show in console
   - Database connection status
   - Request/response logging

3. **Test with different user roles**
   - Create users with different roles
   - Test permission restrictions

4. **Use Postman or similar** for API testing
   - Import the test-api.http examples
   - Set up environment variables for tokens

## Production Deployment

1. **Set NODE_ENV=production**
2. **Use strong JWT_SECRET**
3. **Configure proper CORS_ORIGIN**
4. **Set up SSL/HTTPS**
5. **Use process manager** (PM2, etc.)
6. **Set up database backups**
7. **Configure logging**

## Next Steps

After basic setup:

1. **Create more models** (Owner, Payment, Invoice, etc.)
2. **Add more controllers** and routes
3. **Implement file upload** for documents
4. **Add email notifications**
5. **Create frontend application**
6. **Add comprehensive testing**
7. **Set up CI/CD pipeline**
