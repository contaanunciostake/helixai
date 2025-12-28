/**
 * ════════════════════════════════════════════════════════════════
 * REQUEST LOGGER MIDDLEWARE
 * ════════════════════════════════════════════════════════════════
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  // Log request
  logger.http(`→ ${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'http';

    logger[logLevel](`← ${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
  });

  next();
};
