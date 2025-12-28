/**
 * ════════════════════════════════════════════════════════════════
 * VENDEAI API - SERVER
 * ════════════════════════════════════════════════════════════════
 */

import 'dotenv/config';
import app from './app';
import { logger } from '@/utils/logger';
import { prisma } from '@/config/database';

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Unhandled Rejection:', reason);
  process.exit(1);
});

// Start server
const server = app.listen(PORT, () => {
  logger.info('════════════════════════════════════════════════════════════════');
  logger.info(`🚀 VendeAI API Server`);
  logger.info('════════════════════════════════════════════════════════════════');
  logger.info(`📡 Environment: ${NODE_ENV}`);
  logger.info(`🌐 Server: http://localhost:${PORT}`);
  logger.info(`📚 API Docs: http://localhost:${PORT}/api/docs`);
  logger.info(`🏥 Health: http://localhost:${PORT}/api/health`);
  logger.info('════════════════════════════════════════════════════════════════');
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`\n${signal} received. Starting graceful shutdown...`);

  // Stop accepting new connections
  server.close(async () => {
    logger.info('HTTP server closed');

    try {
      // Close database connections
      await prisma.$disconnect();
      logger.info('Database connections closed');

      logger.info('✅ Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default server;
