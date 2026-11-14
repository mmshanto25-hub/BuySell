import { app } from './app';
import { ENV } from './common/config/env';
import { connectDatabase, disconnectDatabase } from './common/database/connection';

async function bootstrap() {
  // Attempt to connect to MongoDB
  await connectDatabase();

  const server = app.listen(ENV.PORT, () => {
    console.log(`[MARKETPLACE API] Server running on port ${ENV.PORT} in ${ENV.NODE_ENV} mode.`);
    console.log(`[MARKETPLACE API] Base URL: http://localhost:${ENV.PORT}/api/v1`);
    console.log(`[MARKETPLACE API] Health: http://localhost:${ENV.PORT}/health/liveness`);
  });

  const shutdown = async (signal: string) => {
    console.log(`[${signal}] Initiating graceful shutdown...`);
    await disconnectDatabase();
    server.close(() => {
      console.log('[SERVER] Closed all active connections.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  console.error('[BOOTSTRAP_FATAL]:', err);
  process.exit(1);
});
