
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import compression from 'compression';
import cookieParser from 'cookie-parser';

import { testConnection } from './config/db.js';

import auth from './routes/user/auth.js';
import users from './routes/user/userRoutes.js';
import roles from './routes/role/roles.js';
import tenants from './routes/tenant/tenants.js';
import apartments from './routes/apartment/apartments.js';
import buildings from './routes/building/buildings.js';
import floors from './routes/floor/floors.js';
import villas from './routes/villa/villas.js';





const app = express();

app.set('trust proxy', 1);

app.use(compression());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use('/public', express.static('public'));

app.use(helmet());

app.use(cors({
  origin: ['https://sentrixproperty.research-hero.xyz', 'http://localhost:5173','http://localhost:5174'],
  credentials: true
}));

const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 10) * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil((process.env.RATE_LIMIT_WINDOW || 10) * 60)
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json(limiter.message);
  }
});

const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 50,
  delayMs: 500,
  maxDelayMs: 20000
});

app.use('/api/', limiter);
app.use('/api/', speedLimiter);

app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/roles', roles);
app.use('/api/v1/tenants', tenants);
app.use('/api/v1/apartments', apartments);
app.use('/api/v1/buildings', buildings);
app.use('/api/v1/floors', floors);
app.use('/api/v1/villas', villas);




app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

const PORT = process.env.PORT || 5000;



app.listen(PORT, async() => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);

  try{
    const isConnected = await testConnection();
    if (isConnected) {
      console.log("✅ MySQL Database connected successfully");
    } else {
      console.log("❌ Database connection failed");
    }

  } catch (error) {
    console.log('❌ Database connection failed', error);
  }
});


