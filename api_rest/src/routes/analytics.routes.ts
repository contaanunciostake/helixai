/**
 * ════════════════════════════════════════════════════════════════
 * ANALYTICS ROUTES
 * ════════════════════════════════════════════════════════════════
 */

import { Router } from 'express';
import { AnalyticsController } from '@/controllers/analytics.controller';
import { authenticate } from '@/middlewares/auth';
import { validate, dateRangeSchema } from '@/middlewares/validate';

const router = Router();
const analyticsController = new AnalyticsController();

// All routes require authentication
router.use(authenticate);

// ══════════════════════════════════════════════════════════════
// ANALYTICS ROUTES
// ══════════════════════════════════════════════════════════════

/**
 * @route   GET /api/analytics/overview
 * @desc    Get analytics overview for dashboard
 * @access  Private
 */
router.get(
  '/overview',
  validate(dateRangeSchema),
  analyticsController.getOverview.bind(analyticsController)
);

/**
 * @route   GET /api/analytics/conversations
 * @desc    Get conversation analytics
 * @access  Private
 */
router.get(
  '/conversations',
  validate(dateRangeSchema),
  analyticsController.getConversationStats.bind(analyticsController)
);

/**
 * @route   GET /api/analytics/messages
 * @desc    Get message analytics
 * @access  Private
 */
router.get(
  '/messages',
  validate(dateRangeSchema),
  analyticsController.getMessageStats.bind(analyticsController)
);

/**
 * @route   GET /api/analytics/performance
 * @desc    Get bot performance metrics
 * @access  Private
 */
router.get(
  '/performance',
  validate(dateRangeSchema),
  analyticsController.getPerformanceMetrics.bind(analyticsController)
);

/**
 * @route   GET /api/analytics/conversion
 * @desc    Get conversion funnel data
 * @access  Private
 */
router.get(
  '/conversion',
  validate(dateRangeSchema),
  analyticsController.getConversionFunnel.bind(analyticsController)
);

/**
 * @route   GET /api/analytics/top-vehicles
 * @desc    Get most requested vehicles
 * @access  Private
 */
router.get('/top-vehicles', analyticsController.getTopVehicles.bind(analyticsController));

export default router;
