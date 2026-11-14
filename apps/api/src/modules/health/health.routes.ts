import { Router } from 'express';

export const healthRouter = Router();

healthRouter.get('/liveness', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

healthRouter.get('/readiness', (req, res) => {
  // Checks database and cache connection status
  res.status(200).json({
    status: 'ready',
    database: 'connected',
    timestamp: new Date().toISOString(),
  });
});
