# Property Management System (PMS) API

A comprehensive Property Management System API built with Node.js, Express, and MySQL. This system provides advanced authentication, role-based access control, and complete property management functionality.

## Features

- **Advanced Authentication**: JWT-based authentication with role-based access control
- **Property Management**: Complete CRUD operations for properties and units
- **Tenant Management**: Tenant registration, contracts, and payment tracking
- **Contract Management**: Rental and lease contract handling
- **Payment Processing**: Invoice generation and payment tracking
- **Utility Management**: Utility bills and meter readings
- **Maintenance Tickets**: Issue tracking and resolution
- **Security**: Rate limiting, CORS, helmet security headers
- **Validation**: Comprehensive input validation and sanitization

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL with mysql2/promise
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs, helmet, cors, express-rate-limit
- **Validation**: express-validator
- **Environment**: dotenv
- **Logging**: morgan
- **Development**: nodemon

## Project Structure

```
PMS/
├── config/
│   ├── config.env          # Environment variables
│   └── db.js              # Database connection
├── controllers/
│   ├── authController.js   # Authentication logic
│   ├── propertyController.js
│   └── unitController.js
├── middleware/
│   ├── auth.js            # Authentication middleware
│   ├── error.js           # Error handling
│   └── validation.js      # Input validation
├── models/
│   ├── User.js            # User model
│   ├── Property.js        # Property model
│   ├── Unit.js            # Unit model
│   ├── Tenant.js          # Tenant model
│   └── Contract.js        # Contract model
├── routes/
│   ├── auth.js            # Authentication routes
│   ├── properties.js      # Property routes
│   └── units.js           # Unit routes
├── utils/
│   ├── errorResponse.js   # Custom error class
│   └── asyncHandler.js    # Async error handler
├── server.js              # Main server file
├── package.json
└── README.md
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PMS
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up MySQL Database**
   - Create a MySQL database
   - Run the SQL script from `Untitled.sql` to create tables
   - Update database credentials in `config/config.env`

4. **Configure Environment Variables**
   - Copy and update `config/config.env` with your settings:
   ```env
   NODE_ENV=development
   PORT=5000
   
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=your_database_name
   DB_USER=your_username
   DB_PASSWORD=your_password
   
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRE=30d
   JWT_COOKIE_EXPIRE=30
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/me` - Get current user
- `PUT /api/v1/auth/updatedetails` - Update user details
- `PUT /api/v1/auth/updatepassword` - Update password

### Properties
- `GET /api/v1/properties` - Get all properties
- `POST /api/v1/properties` - Create property (Admin/Manager)
- `GET /api/v1/properties/:id` - Get single property
- `PUT /api/v1/properties/:id` - Update property (Admin/Manager)
- `DELETE /api/v1/properties/:id` - Delete property (Admin)
- `GET /api/v1/properties/:id/units` - Get property units
- `GET /api/v1/properties/:id/statistics` - Get property statistics

### Units
- `GET /api/v1/units` - Get all units
- `POST /api/v1/units` - Create unit (Admin/Manager)
- `GET /api/v1/units/:id` - Get single unit
- `PUT /api/v1/units/:id` - Update unit (Admin/Manager)
- `DELETE /api/v1/units/:id` - Delete unit (Admin)
- `GET /api/v1/units/:id/details` - Get unit with related data
- `PUT /api/v1/units/:id/status` - Update unit status

### Health Check
- `GET /api/v1/health` - API health status

## User Roles

- **super_admin**: Full system access
- **admin**: Manage all resources, users
- **manager**: Manage properties, units, tenants, contracts
- **owner**: Manage own properties and units
- **tenant**: View own data, create tickets

## Authentication

All protected routes require a JWT token. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

Or the token will be automatically included if stored in cookies.

## Error Handling

The API uses consistent error responses:

```json
{
  "success": false,
  "error": "Error message here"
}
```

## Rate Limiting

API requests are limited to prevent abuse:
- 100 requests per 10 minutes per IP address
- Configurable via environment variables

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Rate limiting
- CORS protection
- Security headers with helmet
- Input validation and sanitization
- SQL injection prevention

## Development

```bash
# Install development dependencies
npm install --save-dev nodemon

# Run in development mode with auto-restart
npm run dev

# View logs
tail -f logs/app.log
```

## Database Schema

The system uses the comprehensive database schema defined in `Untitled.sql` with tables for:
- Properties and Units
- Owners and Tenants
- Contracts and Payments
- Invoices and Utility Bills
- Maintenance Tickets
- User Management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please contact the development team.
