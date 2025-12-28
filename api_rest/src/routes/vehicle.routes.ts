/**
 * ════════════════════════════════════════════════════════════════
 * VEHICLE ROUTES
 * ════════════════════════════════════════════════════════════════
 */

import { Router } from 'express';
import { VehicleController } from '@/controllers/vehicle.controller';
import { authenticate, authorize } from '@/middlewares/auth';
import {
  validate,
  paginationSchema,
  idParamSchema,
  createVehicleSchema,
  updateVehicleSchema
} from '@/middlewares/validate';

const router = Router();
const vehicleController = new VehicleController();

// All routes require authentication
router.use(authenticate);

// ══════════════════════════════════════════════════════════════
// VEHICLE ROUTES
// ══════════════════════════════════════════════════════════════

/**
 * @route   GET /api/vehicles
 * @desc    Get all vehicles with pagination and filters
 * @access  Private
 */
router.get(
  '/',
  validate(paginationSchema),
  vehicleController.getAll.bind(vehicleController)
);

/**
 * @route   GET /api/vehicles/:id
 * @desc    Get vehicle by ID
 * @access  Private
 */
router.get(
  '/:id',
  validate(idParamSchema),
  vehicleController.getById.bind(vehicleController)
);

/**
 * @route   POST /api/vehicles
 * @desc    Create new vehicle
 * @access  Private (Admin/Gerente only)
 */
router.post(
  '/',
  authorize('ADMIN', 'GERENTE'),
  validate(createVehicleSchema),
  vehicleController.create.bind(vehicleController)
);

/**
 * @route   PUT /api/vehicles/:id
 * @desc    Update vehicle
 * @access  Private (Admin/Gerente only)
 */
router.put(
  '/:id',
  authorize('ADMIN', 'GERENTE'),
  validate(updateVehicleSchema),
  vehicleController.update.bind(vehicleController)
);

/**
 * @route   DELETE /api/vehicles/:id
 * @desc    Delete vehicle (soft delete)
 * @access  Private (Admin only)
 */
router.delete(
  '/:id',
  authorize('ADMIN'),
  validate(idParamSchema),
  vehicleController.delete.bind(vehicleController)
);

/**
 * @route   PATCH /api/vehicles/:id/toggle
 * @desc    Toggle vehicle availability
 * @access  Private (Admin/Gerente only)
 */
router.patch(
  '/:id/toggle',
  authorize('ADMIN', 'GERENTE'),
  validate(idParamSchema),
  vehicleController.toggleAvailability.bind(vehicleController)
);

/**
 * @route   GET /api/vehicles/search/available
 * @desc    Search available vehicles with filters
 * @access  Private
 */
router.get('/search/available', vehicleController.searchAvailable.bind(vehicleController));

export default router;
