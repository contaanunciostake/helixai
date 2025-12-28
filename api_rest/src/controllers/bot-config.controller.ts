/**
 * ════════════════════════════════════════════════════════════════
 * BOT CONFIG CONTROLLER
 * ════════════════════════════════════════════════════════════════
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from '@/types';
import { BotConfigService } from '@/services/bot-config.service';

export class BotConfigController {
  private botConfigService: BotConfigService;

  constructor() {
    this.botConfigService = new BotConfigService();
  }

  /**
   * Get all bot configurations for company
   */
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const configs = await this.botConfigService.getAll(req.user.empresaId);

      res.json({
        success: true,
        data: configs
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get bot configuration by ID
   */
  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const { id } = req.params;

      const config = await this.botConfigService.getById(id, req.user.empresaId);

      res.json({
        success: true,
        data: config
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new bot configuration
   */
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const configData = req.body;

      const config = await this.botConfigService.create(configData, req.user.empresaId);

      res.status(201).json({
        success: true,
        message: 'Configuração criada com sucesso',
        data: config
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update bot configuration
   */
  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const { id } = req.params;
      const updateData = req.body;

      const config = await this.botConfigService.update(id, updateData, req.user.empresaId);

      res.json({
        success: true,
        message: 'Configuração atualizada com sucesso',
        data: config
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete bot configuration (soft delete)
   */
  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const { id } = req.params;

      await this.botConfigService.delete(id, req.user.empresaId);

      res.json({
        success: true,
        message: 'Configuração deletada com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Toggle bot active status
   */
  async toggleActive(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const { id } = req.params;

      const config = await this.botConfigService.toggleActive(id, req.user.empresaId);

      res.json({
        success: true,
        message: `Bot ${config.ativo ? 'ativado' : 'desativado'} com sucesso`,
        data: config
      });
    } catch (error) {
      next(error);
    }
  }
}
