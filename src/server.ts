import { createApp } from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';
import { logger } from './utils/logger';

async function bootstrap(): Promise<void> {
  try {
    await connectDatabase();

    const app = createApp();

    const server = app.listen(env.PORT, () => {
      logger.info(`
╔═══════════════════════════════════════════════════╗
║          Secure Auth API — Server Started         ║
╠═══════════════════════════════════════════════════╣
║  Environment : ${env.NODE_ENV.padEnd(33)}║
║  Port        : ${String(env.PORT).padEnd(33)}║
║  API Base    : /api/${env.API_VERSION.padEnd(29)}║
║  Swagger UI  : /api-docs${' '.repeat(25)}║
╚═══════════════════════════════════════════════════╝
      `);
    });

    // ─── Graceful Shutdown ────────────────────────────────────────────────────
    const shutdown = (signal: string) => {
      logger.info(`${signal} received — shutting down gracefully`);
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
      // Force exit after 10s if server hangs
      setTimeout(() => process.exit(1), 10_000).unref();
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled Promise Rejection:', reason);
      // Don't crash in dev — crash in prod so orchestrators can restart
      if (env.isProd) process.exit(1);
    });

    process.on('uncaughtException', (err) => {
      logger.error('Uncaught Exception:', err);
      process.exit(1);
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}

bootstrap();
