import { app } from './app';
import { ENV } from './common/config/env';

const server = app.listen(ENV.PORT, () => {
  console.log(`[MARKETPLACE API] Server running on port ${ENV.PORT} in ${ENV.NODE_ENV} mode.`);
  console.log(`[MARKETPLACE API] Base URL: http://localhost:${ENV.PORT}/api/v1`);
  console.log(`[MARKETPLACE API] Health: http://localhost:${ENV.PORT}/health/liveness`);
});

process.on('SIGTERM', () => {
  console.log('[SIGTERM] Shutting down gracefully...');
  server.close(() => {
    console.log('[SERVER] Closed all active connections.');
    process.exit(0);
  });
});
