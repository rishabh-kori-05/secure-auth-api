import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env';
import { swaggerSpec } from './config/swagger';
import { apiLimiter } from './middleware/rateLimiter';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import routes from './routes';

export function createApp(): Application {
  const app = express();

  // ─── Security Headers ───────────────────────────────────────────────────────
  app.use(helmet());

  // ─── CORS ───────────────────────────────────────────────────────────────────
  app.use(
    cors({
      origin: env.isProd ? env.CLIENT_URL : true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );

  // ─── Body Parsing ────────────────────────────────────────────────────────────
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
  app.use(cookieParser());

  // ─── Request Logging ─────────────────────────────────────────────────────────
  if (env.isDev) {
    app.use(morgan('dev'));
  } else {
    app.use(
      morgan('combined', {
        stream: { write: (message) => logger.info(message.trim()) },
      }),
    );
  }

  // ─── Trust Proxy (for rate limiting behind load balancers) ──────────────────
  app.set('trust proxy', 1);

  // ─── Swagger Docs ─────────────────────────────────────────────────────────────
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: 'Secure Auth API',
      customCss: '.swagger-ui .topbar { display: none }',
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'none',
        filter: true,
      },
    }),
  );

  // Expose raw spec for tooling
  app.get('/api-docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // ─── Global Rate Limit ───────────────────────────────────────────────────────
  app.use(`/api/${env.API_VERSION}`, apiLimiter);

  // ─── API Routes ──────────────────────────────────────────────────────────────
  app.use(`/api/${env.API_VERSION}`, routes);

  // ─── 404 Handler ─────────────────────────────────────────────────────────────
  app.use(notFoundHandler);

  // ─── Global Error Handler ────────────────────────────────────────────────────
  app.use(errorHandler);

  return app;
}
