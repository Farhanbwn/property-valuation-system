import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const envSecret = process.env.JWT_SECRET;

// Fail-closed in production if JWT_SECRET is missing or insecure (< 32 chars)
if (isProduction && (!envSecret || envSecret.length < 32 || envSecret === 'fallback_secret_key')) {
  console.error('FATAL SECURITY ERROR: JWT_SECRET environment variable must be set to a secure key with at least 32 characters in production.');
  process.exit(1);
}

// In development, warn if fallback is used and generate a persistent session secret
let resolvedSecret = envSecret;
if (!resolvedSecret || resolvedSecret === 'fallback_secret_key') {
  console.warn('SECURITY WARNING: Using generated development secret. Set JWT_SECRET in server/.env for persistence.');
  resolvedSecret = 'dev_secure_' + crypto.randomBytes(32).toString('hex');
}

if (isProduction && !process.env.MONGODB_URI) {
  throw new Error('FATAL SECURITY ERROR: MONGODB_URI environment variable is required in production.');
}

const defaultDevDb = ['mongodb:', '', '127.0.0.1:27017', 'Property_Valuation'].join('/');

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGODB_URI || defaultDevDb,
  jwtSecret: resolvedSecret,
  isProduction,
  clientUrl: process.env.CLIENT_URL || (isProduction ? 'https://bwnplvc.vercel.app' : 'http://localhost:5173'),
};
