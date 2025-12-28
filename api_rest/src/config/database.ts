/**
 * ════════════════════════════════════════════════════════════════
 * DATABASE CONFIGURATION - PRISMA CLIENT
 * ════════════════════════════════════════════════════════════════
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '@/utils/logger';

// Prisma Client instance
const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === 'development'
      ? [
          { emit: 'event', level: 'query' },
          { emit: 'stdout', level: 'error' },
          { emit: 'stdout', level: 'warn' }
        ]
      : [{ emit: 'stdout', level: 'error' }]
});

// Log queries in development
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query' as never, (e: unknown) => {
    const event = e as { query: string; duration: number };
    logger.debug(`Query: ${event.query} - Duration: ${event.duration}ms`);
  });
}

// Test database connection
export const connectDatabase = async () => {
  try {
    await prisma.$connect();
    logger.info('✅ Database connected successfully');
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

// Disconnect database
export const disconnectDatabase = async () => {
  await prisma.$disconnect();
  logger.info('Database disconnected');
};

export { prisma };
