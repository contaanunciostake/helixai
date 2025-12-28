/**
 * ════════════════════════════════════════════════════════════════
 * CONVERSATION ROUTES
 * ════════════════════════════════════════════════════════════════
 */

import { Router } from 'express';
import { ConversationController } from '@/controllers/conversation.controller';
import { authenticate } from '@/middlewares/auth';
import {
  validate,
  paginationSchema,
  idParamSchema,
  updateConversationStatusSchema
} from '@/middlewares/validate';

const router = Router();
const conversationController = new ConversationController();

// All routes require authentication
router.use(authenticate);

// ══════════════════════════════════════════════════════════════
// CONVERSATION ROUTES
// ══════════════════════════════════════════════════════════════

/**
 * @route   GET /api/conversations
 * @desc    Get all conversations with pagination
 * @access  Private
 */
router.get(
  '/',
  validate(paginationSchema),
  conversationController.getAll.bind(conversationController)
);

/**
 * @route   GET /api/conversations/:id
 * @desc    Get conversation by ID with messages
 * @access  Private
 */
router.get(
  '/:id',
  validate(idParamSchema),
  conversationController.getById.bind(conversationController)
);

/**
 * @route   GET /api/conversations/phone/:phone
 * @desc    Get conversation by phone number
 * @access  Private
 */
router.get('/phone/:phone', conversationController.getByPhone.bind(conversationController));

/**
 * @route   PATCH /api/conversations/:id/status
 * @desc    Update conversation status
 * @access  Private
 */
router.patch(
  '/:id/status',
  validate(updateConversationStatusSchema),
  conversationController.updateStatus.bind(conversationController)
);

/**
 * @route   GET /api/conversations/:id/messages
 * @desc    Get all messages for a conversation
 * @access  Private
 */
router.get(
  '/:id/messages',
  validate(idParamSchema),
  conversationController.getMessages.bind(conversationController)
);

/**
 * @route   GET /api/conversations/:id/context
 * @desc    Get conversation context
 * @access  Private
 */
router.get(
  '/:id/context',
  validate(idParamSchema),
  conversationController.getContext.bind(conversationController)
);

/**
 * @route   GET /api/conversations/active/count
 * @desc    Get count of active conversations
 * @access  Private
 */
router.get('/active/count', conversationController.getActiveCount.bind(conversationController));

export default router;
