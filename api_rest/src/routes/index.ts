/**
 * ════════════════════════════════════════════════════════════════
 * API ROUTES - MAIN ROUTER
 * ════════════════════════════════════════════════════════════════
 */

import { Router } from 'express';
import authRoutes from './auth.routes';
import botConfigRoutes from './bot-config.routes';
import conversationRoutes from './conversation.routes';
import vehicleRoutes from './vehicle.routes';
import userRoutes from './user.routes';
import analyticsRoutes from './analytics.routes';

const router = Router();

// ══════════════════════════════════════════════════════════════
// ROUTE REGISTRATION
// ══════════════════════════════════════════════════════════════

router.use('/auth', authRoutes);
router.use('/bot-config', botConfigRoutes);
router.use('/conversations', conversationRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/users', userRoutes);
router.use('/analytics', analyticsRoutes);

// ══════════════════════════════════════════════════════════════
// API INFO ROUTE
// ══════════════════════════════════════════════════════════════

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'VendeAI API',
    version: process.env.API_VERSION || 'v1',
    endpoints: {
      auth: '/api/auth',
      botConfig: '/api/bot-config',
      conversations: '/api/conversations',
      vehicles: '/api/vehicles',
      users: '/api/users',
      analytics: '/api/analytics',
      docs: '/api/docs',
      health: '/health'
    }
  });
});

export default router;
