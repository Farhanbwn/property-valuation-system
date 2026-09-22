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

// Security Headers via Helmet
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS Configuration - Restrict to authorized client origins
const allowedOrigins = [
  config.clientUrl,
  'http://localhost:5173',
  'http://localhost:3000',
  'https://client-henna-gamma-96.vercel.app'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl) or matched origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy: Origin not allowed'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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

