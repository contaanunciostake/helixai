/**
 * ════════════════════════════════════════════════════════════════
 * VENDEAI API - EXPRESS APPLICATION
 * ════════════════════════════════════════════════════════════════
 */

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

// Middlewares
import { errorHandler } from '@/middlewares/error-handler';
import { notFoundHandler } from '@/middlewares/not-found-handler';
import { requestLogger } from '@/middlewares/request-logger';
import { rateLimiter } from '@/middlewares/rate-limiter';

// Routes
import routes from '@/routes';

// Utils
import { logger } from '@/utils/logger';
import swaggerDocument from '@/config/swagger';

const app: Application = express();

// ══════════════════════════════════════════════════════════════
// SECURITY MIDDLEWARE
// ══════════════════════════════════════════════════════════════

// Helmet - Security headers
app.use(helmet());

// CORS - Cross-Origin Resource Sharing
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: process.env.CORS_CREDENTIALS === 'true',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// ══════════════════════════════════════════════════════════════
// GENERAL MIDDLEWARE
// ══════════════════════════════════════════════════════════════

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// HTTP request logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(
    morgan('combined', {
      stream: {
        write: (message: string) => logger.http(message.trim())
      }
    })
  );
}

// Custom request logger
app.use(requestLogger);

// Rate limiting (if enabled)
if (process.env.ENABLE_RATE_LIMIT === 'true') {
  app.use('/api', rateLimiter);
}

// ══════════════════════════════════════════════════════════════
// HEALTH CHECK
// ══════════════════════════════════════════════════════════════

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'VendeAI API - Sistema de Bot Vendedor',
    version: process.env.API_VERSION || 'v1',
    docs: '/api/docs',
    health: '/health'
  });
});

// ══════════════════════════════════════════════════════════════
// API DOCUMENTATION (SWAGGER)
// ══════════════════════════════════════════════════════════════

if (process.env.ENABLE_SWAGGER === 'true') {
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'VendeAI API Documentation'
    })
  );
}

// ══════════════════════════════════════════════════════════════
// API ROUTES
// ══════════════════════════════════════════════════════════════

const API_PREFIX = process.env.API_PREFIX || '/api';
app.use(API_PREFIX, routes);

// ══════════════════════════════════════════════════════════════
// ERROR HANDLING
// ══════════════════════════════════════════════════════════════

// 404 Not Found
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
