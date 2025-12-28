/**
 * ════════════════════════════════════════════════════════════════
 * USER ROUTES
 * ════════════════════════════════════════════════════════════════
 */

import { Router } from 'express';
import { UserController } from '@/controllers/user.controller';
import { authenticate, authorize } from '@/middlewares/auth';
import { validate, paginationSchema, idParamSchema } from '@/middlewares/validate';

const router = Router();
const userController = new UserController();

// All routes require authentication
router.use(authenticate);

// ══════════════════════════════════════════════════════════════
// USER ROUTES
// ══════════════════════════════════════════════════════════════

/**
 * @route   GET /api/users
 * @desc    Get all users in company
 * @access  Private (Admin/Gerente only)
 */
router.get(
  '/',
  authorize('ADMIN', 'GERENTE'),
  validate(paginationSchema),
  userController.getAll.bind(userController)
);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin/Gerente only)
 */
router.get(
  '/:id',
  authorize('ADMIN', 'GERENTE'),
  validate(idParamSchema),
  userController.getById.bind(userController)
);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private (Admin only)
 */
router.put(
  '/:id',
  authorize('ADMIN'),
  validate(idParamSchema),
  userController.update.bind(userController)
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user (soft delete)
 * @access  Private (Admin only)
 */
router.delete(
  '/:id',
  authorize('ADMIN'),
  validate(idParamSchema),
  userController.delete.bind(userController)
);

/**
 * @route   PATCH /api/users/:id/role
 * @desc    Update user role
 * @access  Private (Admin only)
 */
router.patch(
  '/:id/role',
  authorize('ADMIN'),
  validate(idParamSchema),
  userController.updateRole.bind(userController)
);

export default router;
