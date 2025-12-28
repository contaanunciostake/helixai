/**
 * ════════════════════════════════════════════════════════════════
 * RATE LIMITER MIDDLEWARE
 * ════════════════════════════════════════════════════════════════
 */

import rateLimit from 'express-rate-limit';
import { logger } from '@/utils/logger';

const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10); // 15 minutes
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10);

export const rateLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: MAX_REQUESTS,
  message: {
    success: false,
    error: 'Muitas requisições. Tente novamente mais tarde.',
    retryAfter: Math.ceil(WINDOW_MS / 1000 / 60) + ' minutos'
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: 'Muitas requisições. Tente novamente mais tarde.',
      retryAfter: Math.ceil(WINDOW_MS / 1000 / 60) + ' minutos'
    });
  }
});

// Stricter rate limit for authentication routes
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: {
    success: false,
    error: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
  },
  skipSuccessfulRequests: true // Don't count successful requests
});
