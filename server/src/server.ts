import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { config } from './config/env';
import { apiLimiter } from './middleware/rateLimiter';
import valuationRoutes from './routes/valuation.routes';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/user.routes';
import inspectionRoutes from './routes/inspection.routes';

const app = express();

// Trust reverse proxy for deployment on platforms like Render / Vercel
app.set('trust proxy', 1);

// CORS Configuration - Strictly driven by CLIENT_URL environment variable
const envOrigins = (config.clientUrl || '')
  .split(',')
  .map(url => url.trim().replace(/\/$/, ''))
  .filter(Boolean);

// Local development ports
const localDevOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
];

const allowedOrigins = Array.from(new Set([...envOrigins, ...localDevOrigins]));

export const isOriginAllowed = (origin?: string): boolean => {
  if (!origin) return true; // allow curl, mobile, server-to-server requests
  const normalizedOrigin = origin.replace(/\/$/, '');
  
  if (allowedOrigins.includes(normalizedOrigin)) {
    return true;
  }
  
  // Allow *.vercel.app origins for seamless Vercel production & preview deployments
  if (/^https:\/\/[a-zA-Z0-9-]+\.vercel\.app$/.test(normalizedOrigin)) {
    return true;
  }
  
  return false;
};

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset'],
  optionsSuccessStatus: 200,
};

// 1. Apply CORS before other middleware so preflight OPTIONS requests are answered immediately
app.use(cors(corsOptions));

// 2. Security Headers via Helmet
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// Strict Body Parsers (Prevents memory exhaustion attacks via massive payloads)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Global Rate Limiting
app.use('/api', apiLimiter);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/valuations', valuationRoutes);
app.use('/api/inspections', inspectionRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

// Centralized Error-Handling Middleware (Prevents information leakage, stack traces, and internal path exposure)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const isCORS = err.message && err.message.includes('CORS');
  const statusCode = isCORS ? 403 : (err.status || err.statusCode || 500);

  if (statusCode === 500) {
    console.error('Unhandled Server Exception:', {
      name: err.name,
      message: err.message,
      path: req.path,
      method: req.method,
      stack: config.isProduction ? undefined : err.stack
    });
  }

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 && config.isProduction
      ? 'An internal error occurred. Please contact the administrator.'
      : (err.message || 'An error occurred')
  });
});

// Database connection & Server Boot
mongoose.connect(config.mongoUri)
  .then(() => {
    console.log('Connected securely to MongoDB');
    app.listen(config.port, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${config.port}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  });

