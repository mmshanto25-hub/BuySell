import { Router } from 'express';
import { isDatabaseConnected } from '../../common/database/connection';
import { getMetrics } from '../../common/middleware/performanceMonitor';

export const healthRouter = Router();

healthRouter.get('/liveness', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

healthRouter.get('/readiness', (req, res) => {
  const dbConnected = isDatabaseConnected();
  const mem = process.memoryUsage();
  const memoryOk = mem.heapUsed / mem.heapTotal < 0.95; // <95% heap usage

  const isReady = memoryOk; // DB is optional (graceful degradation)

  res.status(isReady ? 200 : 503).json({
    status: isReady ? 'ready' : 'degraded',
    checks: {
      database: dbConnected ? 'connected' : 'disconnected (fallback mode)',
      memory: memoryOk ? 'ok' : 'pressure',
      heapUsedMB: Math.round(mem.heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(mem.heapTotal / 1024 / 1024),
    },
    timestamp: new Date().toISOString(),
  });
});

healthRouter.get('/metrics', (req, res) => {
  const metrics = getMetrics();
  res.status(200).json({
    status: 'ok',
    ...metrics,
    timestamp: new Date().toISOString(),
  });
});
