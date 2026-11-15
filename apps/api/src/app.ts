import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { ENV } from './common/config/env';
import { errorHandler } from './common/middleware/errorHandler';
import { rateLimiter } from './common/middleware/rateLimiter';
import { sanitizeInput, requestId, responseTime } from './common/middleware/securityHeaders';
import { performanceMonitor } from './common/middleware/performanceMonitor';
import { healthRouter } from './modules/health/health.routes';
import { authRouter } from './modules/auth/auth.routes';
import { userRouter } from './modules/users/user.routes';
import { sellerRouter } from './modules/sellers/seller.routes';
import { productRouter } from './modules/catalog/product.routes';
import { catalogRouter } from './modules/catalog/catalog.routes';
import { cartRouter } from './modules/cart/cart.routes';
import { ordersRouter } from './modules/orders/orders.routes';
import { paymentRouter, webhookRouter } from './modules/payments/payment.routes';
import { logisticsRouter, courierWebhookRouter } from './modules/logistics/logistics.routes';
import { returnRouter, disputeRouter } from './modules/returns/return.routes';
import { financeRouter, sellerFinanceRouter, adminSettlementRouter } from './modules/finance/finance.routes';
import { adminRouter } from './modules/admin/admin.routes';
import { reviewRouter } from './modules/reviews/review.routes';
import { couponRouter, sellerCouponRouter, adminCouponRouter } from './modules/marketing/coupon.routes';
import { aiRouter } from './modules/ai/ai.routes';
import { seoRouter } from './modules/seo/seo.routes';
import { SeoService } from './modules/seo/seo.service';

export const app = express();

// ─── Phase 8: Security & Observability Middleware ─────────────
app.use(requestId);
app.use(responseTime);
app.use(performanceMonitor);
app.use(helmet());
app.use(
  cors({
    origin: ENV.CORS_ORIGINS,
    credentials: true,
    exposedHeaders: ['X-Request-Id', 'X-Response-Time', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser(ENV.COOKIE_SECRET));
app.use(sanitizeInput);

// Global rate limit: 100 req/min per IP
app.use(rateLimiter(100, 60_000));

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
app.get('/sitemap.xml', async (req, res, next) => {
  try {
    const xml = await SeoService.generateSitemap();
    res.header('Content-Type', 'application/xml');
    res.status(200).send(xml);
  } catch (err) {
    next(err);
  }
});
app.get('/robots.txt', (req, res) => {
  res.header('Content-Type', 'text/plain');
  res.status(200).send(SeoService.getRobotsTxt());
});

// Stricter rate limit on auth endpoints: 10 req/min
app.use('/api/v1/auth', rateLimiter(10, 60_000));
app.use('/api/v1/auth', authRouter);

app.use('/api/v1', userRouter);
app.use('/api/v1', sellerRouter);
app.use('/api/v1', productRouter);
app.use('/api/v1', catalogRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/checkout', ordersRouter);
app.use('/api/v1/orders', ordersRouter);
app.use('/api/v1/payments', paymentRouter);
app.use('/api/v1/webhooks/logistics', courierWebhookRouter);
app.use('/api/v1/webhooks', webhookRouter);
app.use('/api/v1/logistics', logisticsRouter);
app.use('/api/v1/returns', returnRouter);
app.use('/api/v1/disputes', disputeRouter);
app.use('/api/v1/finance', financeRouter);
app.use('/api/v1/seller', sellerFinanceRouter);
app.use('/api/v1/seller/coupons', sellerCouponRouter);
app.use('/api/v1/admin/finance', adminSettlementRouter);
app.use('/api/v1/admin/coupons', adminCouponRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/coupons', couponRouter);
app.use('/api/v1/ai', aiRouter);
app.use('/api/v1/seo', seoRouter);

// Centralized Global Error Handler
app.use(errorHandler);
