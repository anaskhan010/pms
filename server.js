const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Connect to database
const db = require('./config/db');

// Route files
const auth = require('./routes/user/auth');
const properties = require('./routes/property/properties');
const units = require('./routes/property/units');
const owners = require('./routes/owner/owners');
const tenants = require('./routes/tenant/tenants');
const contracts = require('./routes/contract/contracts');
const payments = require('./routes/payment/payments');
const invoices = require('./routes/payment/invoices');

// Middleware files
const errorHandler = require('./middleware/error');

const app = express();

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('combined'));
}

// Security headers
app.use(helmet());

// Enable CORS
app.use(cors({
  origin: 'http://sentrixproperty.research-hero.xyz',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 10) * 60 * 1000, // 10 mins
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/properties', properties);
app.use('/api/v1/units', units);
app.use('/api/v1/owners', owners);
app.use('/api/v1/tenants', tenants);
app.use('/api/v1/contracts', contracts);
app.use('/api/v1/payments', payments);
app.use('/api/v1/invoices', invoices);

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'PMS API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Handle 404 routes
app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handler middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to database
    await db.getConnection();
    console.log('Database connection successful'.white);
    

    
    const server = app.listen(PORT, () => {
      console.log(
        `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
      );
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err, promise) => {
      console.log(`Error: ${err.message}`.red);
      // Close server & exit process
      server.close(() => {
        process.exit(1);
      });
    });

    // Handle SIGTERM
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received. Shutting down gracefully...'.yellow);
      server.close(async () => {
        await db.close();
        console.log('Process terminated'.red);
        process.exit(0);
      });
    });

    // Handle SIGINT (Ctrl+C)
    process.on('SIGINT', async () => {
      console.log('\nSIGINT received. Shutting down gracefully...'.yellow);
      server.close(async () => {
        await db.close();
        console.log('Process terminated'.red);
        process.exit(0);
      });
    });

  } catch (error) {
    console.error(`Failed to start server: ${error.message}`.red);
    process.exit(1);
  }
};

startServer();
