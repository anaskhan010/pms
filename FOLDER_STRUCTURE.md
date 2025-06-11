# Complete PMS API Folder Structure

## 📁 Project Structure

```
PMS/
├── 📁 config/
│   ├── config.env              # Environment variables
│   └── db.js                   # MySQL database connection with mysql2/promise
│
├── 📁 controllers/             # Organized by feature
│   ├── 📁 contract/
│   │   └── contractController.js
│   ├── 📁 owner/
│   │   └── ownerController.js
│   ├── 📁 payment/
│   │   ├── invoiceController.js
│   │   └── paymentController.js
│   ├── 📁 property/
│   │   ├── propertyController.js
│   │   └── unitController.js
│   ├── 📁 tenant/
│   │   └── tenantController.js
│   ├── 📁 ticket/
│   │   └── (to be created)
│   └── 📁 user/
│       └── authController.js
│
├── 📁 middleware/
│   ├── auth.js                 # JWT authentication & authorization
│   ├── error.js                # Global error handling
│   ├── logger.js               # Request logging
│   └── validation.js           # Input validation with express-validator
│
├── 📁 models/                  # Organized by feature
│   ├── 📁 contract/
│   │   └── Contract.js
│   ├── 📁 owner/
│   │   ├── Owner.js
│   │   └── UnitOwnership.js
│   ├── 📁 payment/
│   │   ├── Invoice.js
│   │   └── Payment.js
│   ├── 📁 property/
│   │   ├── Property.js
│   │   └── Unit.js
│   ├── 📁 tenant/
│   │   └── Tenant.js
│   ├── 📁 ticket/
│   │   └── Ticket.js
│   ├── 📁 user/
│   │   └── User.js
│   └── 📁 utility/
│       ├── Utility.js
│       └── UtilityBill.js
│
├── 📁 routes/                  # Organized by feature
│   ├── 📁 contract/
│   │   └── contracts.js
│   ├── 📁 owner/
│   │   └── owners.js
│   ├── 📁 payment/
│   │   ├── invoices.js
│   │   └── payments.js
│   ├── 📁 property/
│   │   ├── properties.js
│   │   └── units.js
│   ├── 📁 tenant/
│   │   └── tenants.js
│   ├── 📁 ticket/
│   │   └── (to be created)
│   └── 📁 user/
│       └── auth.js
│
├── 📁 scripts/
│   ├── createAdmin.js          # Create admin user script
│   └── updateUsersTable.sql    # Database schema updates
│
├── 📁 utils/
│   ├── asyncHandler.js         # Async error wrapper
│   └── errorResponse.js        # Custom error class
│
├── 📄 server.js                # Main server file
├── 📄 package.json             # Dependencies and scripts
├── 📄 README.md                # Project documentation
├── 📄 SETUP.md                 # Setup instructions
├── 📄 API_DOCUMENTATION.md     # Complete API documentation
├── 📄 FOLDER_STRUCTURE.md      # This file
├── 📄 test-api.http            # API testing examples
└── 📄 Untitled.sql             # Database schema
```

## 🗄️ Database Tables Covered

### ✅ Fully Implemented APIs
1. **Users** - Authentication & user management
2. **Properties** - Property management
3. **Units** - Unit management
4. **Owners** - Owner management
5. **UnitOwnership** - Ownership tracking
6. **Tenants** - Tenant management
7. **Contracts** - Contract management
8. **Invoices** - Invoice management
9. **Payments** - Payment processing
10. **Utilities** - Utility types
11. **UtilityBills** - Utility billing
12. **Tickets** - Maintenance tickets

### 🔄 Partially Implemented
13. **UnitUtilityMeters** - Meter management (model exists)
14. **TicketComments** - Ticket comments (referenced in Ticket model)

### ⏳ To Be Implemented
15. **TitleDeedHistory** - Property title tracking
16. **MergedUnits** - Unit merging functionality
17. **MergedUnitComponents** - Merged unit components
18. **EjariRegistrations** - Dubai Ejari system integration

## 🔐 Authentication & Security Features

- **JWT-based authentication** with role-based access control
- **Password hashing** with bcryptjs
- **Rate limiting** to prevent abuse
- **CORS protection** for cross-origin requests
- **Helmet security headers**
- **Input validation** with express-validator
- **SQL injection prevention** with parameterized queries

## 🚀 API Endpoints Summary

### Authentication (8 endpoints)
- User registration, login, logout
- Profile management, password updates

### Properties (6 endpoints)
- CRUD operations, statistics, unit listings

### Units (6 endpoints)
- CRUD operations, detailed views, status updates

### Owners (8 endpoints)
- CRUD operations, property/unit listings, financial summaries

### Tenants (8 endpoints)
- CRUD operations, contract/payment/ticket listings

### Contracts (9 endpoints)
- CRUD operations, detailed views, renewal, status updates

### Invoices (11 endpoints)
- CRUD operations, payment tracking, recurring generation

### Payments (9 endpoints)
- CRUD operations, statistics, refund processing

## 📊 Key Features

### Advanced Functionality
- **Recurring invoice generation** for contracts
- **Payment tracking** with automatic invoice status updates
- **Financial summaries** for owners
- **Utility bill management** with consumption tracking
- **Maintenance ticket system** with comments
- **Unit ownership history** tracking
- **Contract renewal** functionality

### Data Relationships
- **Properties** → **Units** → **Contracts** → **Invoices** → **Payments**
- **Owners** ↔ **UnitOwnership** ↔ **Units**
- **Tenants** ↔ **Contracts** ↔ **Units**
- **Units** ↔ **UtilityMeters** ↔ **UtilityBills**
- **Units** ↔ **Tickets** ↔ **TicketComments**

### Business Logic
- **Automatic invoice numbering** (INV-YYYYMM-NNNN)
- **Payment status calculation** (Paid/Partially Paid/Overdue)
- **Contract expiration tracking**
- **Utility consumption calculation**
- **Ticket resolution time tracking**

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL with mysql2/promise
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs, helmet, cors, express-rate-limit
- **Validation**: express-validator
- **Environment**: dotenv
- **Logging**: morgan, colors
- **Development**: nodemon

## 📝 Usage Instructions

1. **Setup Database**: Run `Untitled.sql` and `scripts/updateUsersTable.sql`
2. **Install Dependencies**: `npm install`
3. **Configure Environment**: Update `config/config.env`
4. **Start Server**: `npm run dev`
5. **Create Admin**: `npm run create-admin`
6. **Test APIs**: Use `test-api.http` or Postman

## 🔄 Next Steps

1. **Complete remaining models**: TitleDeedHistory, MergedUnits, EjariRegistrations
2. **Add file upload**: Document management for contracts/invoices
3. **Implement notifications**: Email/SMS for payments, renewals
4. **Add reporting**: Financial reports, occupancy reports
5. **Create frontend**: React/Vue.js dashboard
6. **Add testing**: Unit tests, integration tests
7. **Deploy**: Production deployment with PM2/Docker

This structure provides a solid foundation for a comprehensive Property Management System with room for future enhancements.
