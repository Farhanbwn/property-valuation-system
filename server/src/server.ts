import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import valuationRoutes from './routes/valuation.routes';
import authRoutes from './routes/authRoutes';
import { User } from './models/User';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/';

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 10000 : 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/valuations', valuationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Database connection
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Seed admin user
    try {
      const adminExists = await User.findOne({ email: 'Admin@bwnpvc.com' });
      if (!adminExists) {
        const passwordHash = await bcrypt.hash('Admin@NC_9232', 10);
        await User.create({
          name: 'Admin',
          email: 'Admin@bwnpvc.com',
          passwordHash,
          role: 'admin'
        });
        console.log('Admin user seeded');
      }
    } catch (e) {
      console.error('Failed to seed admin user', e);
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });
