import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/marketplace',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'dev-access-secret-32-chars-long-at-least',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-32-chars-long-at-least',
  JWT_ACCESS_EXPIRATION: process.env.JWT_ACCESS_EXPIRATION || '15m',
  JWT_REFRESH_EXPIRATION: process.env.JWT_REFRESH_EXPIRATION || '7d',
  COOKIE_SECRET: process.env.COOKIE_SECRET || 'dev-cookie-secret',
  CORS_ORIGINS: [
    process.env.STOREFRONT_URL || 'http://localhost:3000',
    process.env.SELLER_DASHBOARD_URL || 'http://localhost:3001',
    process.env.ADMIN_DASHBOARD_URL || 'http://localhost:3002',
  ],
};
