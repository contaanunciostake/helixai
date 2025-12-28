/**
 * ════════════════════════════════════════════════════════════════
 * AUTH ROUTES
 * ════════════════════════════════════════════════════════════════
 */

import { Router } from 'express';
import { AuthController } from '@/controllers/auth.controller';
import { validate, loginSchema, registerSchema } from '@/middlewares/validate';
import { authRateLimiter } from '@/middlewares/rate-limiter';
import { authenticate } from '@/middlewares/auth';

const router = Router();
const authController = new AuthController();

// ══════════════════════════════════════════════════════════════
// PUBLIC ROUTES (NO AUTH REQUIRED)
// ══════════════════════════════════════════════════════════════

/**
 * @route   POST /api/auth/login
 * @desc    Login user and get JWT token
 * @access  Public
 */
router.post(
  '/login',
  authRateLimiter,
  validate(loginSchema),
  authController.login.bind(authController)
);

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post(
  '/register',
  authRateLimiter,
  validate(registerSchema),
  authController.register.bind(authController)
);

// ══════════════════════════════════════════════════════════════
// PROTECTED ROUTES (AUTH REQUIRED)
// ══════════════════════════════════════════════════════════════

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, authController.getProfile.bind(authController));

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh JWT token
 * @access  Private
 */
router.post('/refresh', authenticate, authController.refreshToken.bind(authController));

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (invalidate token)
 * @access  Private
 */
router.post('/logout', authenticate, authController.logout.bind(authController));

export default router;
