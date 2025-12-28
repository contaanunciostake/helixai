/**
 * ════════════════════════════════════════════════════════════════
 * USER CONTROLLER
 * ════════════════════════════════════════════════════════════════
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from '@/types';
import { UserService } from '@/services/user.service';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * Get all users in company
   */
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const { page, limit, sortBy, sortOrder } = req.query;

      const result = await this.userService.getAll(req.user.empresaId, {
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
   * Get user by ID
   */
  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const { id } = req.params;

      const user = await this.userService.getById(id, req.user.empresaId);

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user
   */
  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const { id } = req.params;
      const updateData = req.body;

      const user = await this.userService.update(id, updateData, req.user.empresaId);

      res.json({
        success: true,
        message: 'Usuário atualizado com sucesso',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user (soft delete)
   */
  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const { id } = req.params;

      await this.userService.delete(id, req.user.empresaId);

      res.json({
        success: true,
        message: 'Usuário deletado com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user role
   */
  async updateRole(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const { id } = req.params;
      const { role } = req.body;

      const user = await this.userService.updateRole(id, role, req.user.empresaId);

      res.json({
        success: true,
        message: 'Role atualizada com sucesso',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }
}
