import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { ENV } from './common/config/env';
import { errorHandler } from './common/middleware/errorHandler';
import { healthRouter } from './modules/health/health.routes';
import { authRouter } from './modules/auth/auth.routes';
import { userRouter } from './modules/users/user.routes';
import { catalogRouter } from './modules/catalog/catalog.routes';
import { ordersRouter } from './modules/orders/orders.routes';
import { financeRouter } from './modules/finance/finance.routes';

export const app = express();

// Security & Parsing Middleware
app.use(helmet());
app.use(
  cors({
    origin: ENV.CORS_ORIGINS,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser(ENV.COOKIE_SECRET));

// Root Health & Welcome
app.get('/', (req, res) => {
  res.status(200).json({
    service: 'Enterprise Multi-Vendor Marketplace REST API',
    version: '1.0.0',
    documentation: '/docs/API.md',
    health: '/health/liveness',
  });
});

// Mount Routes
app.use('/health', healthRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1', userRouter);
app.use('/api/v1', catalogRouter);
app.use('/api/v1/orders', ordersRouter);
app.use('/api/v1/finance', financeRouter);

// Centralized Global Error Handler
app.use(errorHandler);
