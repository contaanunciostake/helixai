/**
 * ════════════════════════════════════════════════════════════════
 * BOT CONFIGURATION ROUTES
 * ════════════════════════════════════════════════════════════════
 */

import { Router } from 'express';
import { BotConfigController } from '@/controllers/bot-config.controller';
import { authenticate, authorize } from '@/middlewares/auth';
import {
  validate,
  createBotConfigSchema,
  updateBotConfigSchema,
  idParamSchema
} from '@/middlewares/validate';

const router = Router();
const botConfigController = new BotConfigController();

// All routes require authentication
router.use(authenticate);

// ══════════════════════════════════════════════════════════════
// BOT CONFIGURATION ROUTES
// ══════════════════════════════════════════════════════════════

/**
 * @route   GET /api/bot-config
 * @desc    Get all bot configurations for company
 * @access  Private
 */
router.get('/', botConfigController.getAll.bind(botConfigController));

/**
 * @route   GET /api/bot-config/:id
 * @desc    Get bot configuration by ID
 * @access  Private
 */
router.get(
  '/:id',
  validate(idParamSchema),
  botConfigController.getById.bind(botConfigController)
);

/**
 * @route   POST /api/bot-config
 * @desc    Create new bot configuration
 * @access  Private (Admin/Gerente only)
 */
router.post(
  '/',
  authorize('ADMIN', 'GERENTE'),
  validate(createBotConfigSchema),
  botConfigController.create.bind(botConfigController)
);

/**
 * @route   PUT /api/bot-config/:id
 * @desc    Update bot configuration
 * @access  Private (Admin/Gerente only)
 */
router.put(
  '/:id',
  authorize('ADMIN', 'GERENTE'),
  validate(updateBotConfigSchema),
  botConfigController.update.bind(botConfigController)
);

/**
 * @route   DELETE /api/bot-config/:id
 * @desc    Delete bot configuration (soft delete)
 * @access  Private (Admin only)
 */
router.delete(
  '/:id',
  authorize('ADMIN'),
  validate(idParamSchema),
  botConfigController.delete.bind(botConfigController)
);

/**
 * @route   PATCH /api/bot-config/:id/toggle
 * @desc    Toggle bot active status
 * @access  Private (Admin/Gerente only)
 */
router.patch(
  '/:id/toggle',
  authorize('ADMIN', 'GERENTE'),
  validate(idParamSchema),
  botConfigController.toggleActive.bind(botConfigController)
);

export default router;
