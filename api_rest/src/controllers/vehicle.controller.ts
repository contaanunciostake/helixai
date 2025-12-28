/**
 * ════════════════════════════════════════════════════════════════
 * VEHICLE CONTROLLER
 * ════════════════════════════════════════════════════════════════
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from '@/types';
import { VehicleService } from '@/services/vehicle.service';

export class VehicleController {
  private vehicleService: VehicleService;

  constructor() {
    this.vehicleService = new VehicleService();
  }

  /**
   * Get all vehicles with pagination and filters
   */
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const { page, limit, sortBy, sortOrder } = req.query;

      const result = await this.vehicleService.getAll(req.user.empresaId, {
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        sortBy: sortBy as string,
        sortOrder: (sortOrder as 'asc' | 'desc') || 'desc'
      });

      res.json({
        success: true,
        data: result.data,
        meta: result.meta
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get vehicle by ID
   */
  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const { id } = req.params;

      const vehicle = await this.vehicleService.getById(id, req.user.empresaId);

      res.json({
        success: true,
        data: vehicle
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new vehicle
   */
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const vehicleData = req.body;

      const vehicle = await this.vehicleService.create(vehicleData, req.user.empresaId);

      res.status(201).json({
        success: true,
        message: 'Veículo criado com sucesso',
        data: vehicle
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update vehicle
   */
  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const { id } = req.params;
      const updateData = req.body;

      const vehicle = await this.vehicleService.update(id, updateData, req.user.empresaId);

      res.json({
        success: true,
        message: 'Veículo atualizado com sucesso',
        data: vehicle
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete vehicle (soft delete)
   */
  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const { id } = req.params;

      await this.vehicleService.delete(id, req.user.empresaId);

      res.json({
        success: true,
        message: 'Veículo deletado com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Toggle vehicle availability
   */
  async toggleAvailability(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const { id } = req.params;

      const vehicle = await this.vehicleService.toggleAvailability(id, req.user.empresaId);

      res.json({
        success: true,
        message: `Veículo ${vehicle.disponivel ? 'disponibilizado' : 'indisponibilizado'} com sucesso`,
        data: vehicle
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search available vehicles with filters
   */
  async searchAvailable(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const filters = req.query;

      const vehicles = await this.vehicleService.searchAvailable(
        req.user.empresaId,
        filters
      );

      res.json({
        success: true,
        data: vehicles
      });
    } catch (error) {
      next(error);
    }
  }
}
