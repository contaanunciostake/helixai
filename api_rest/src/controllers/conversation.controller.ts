/**
 * ════════════════════════════════════════════════════════════════
 * CONVERSATION CONTROLLER
 * ════════════════════════════════════════════════════════════════
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from '@/types';
import { ConversationService } from '@/services/conversation.service';

export class ConversationController {
  private conversationService: ConversationService;

  constructor() {
    this.conversationService = new ConversationService();
  }

  /**
   * Get all conversations with pagination
   */
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const { page, limit, sortBy, sortOrder } = req.query;

      const result = await this.conversationService.getAll(req.user.empresaId, {
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
   * Get conversation by ID with messages
   */
  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const { id } = req.params;

      const conversation = await this.conversationService.getById(id, req.user.empresaId);

      res.json({
        success: true,
        data: conversation
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get conversation by phone number
   */
  async getByPhone(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const { phone } = req.params;

      const conversation = await this.conversationService.getByPhone(
        phone,
        req.user.empresaId
      );

      res.json({
        success: true,
        data: conversation
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update conversation status
   */
  async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const { id } = req.params;
      const { status } = req.body;

      const conversation = await this.conversationService.updateStatus(
        id,
        status,
        req.user.empresaId
      );

      res.json({
        success: true,
        message: 'Status atualizado com sucesso',
        data: conversation
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all messages for a conversation
   */
  async getMessages(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const { id } = req.params;

      const messages = await this.conversationService.getMessages(id, req.user.empresaId);

      res.json({
        success: true,
        data: messages
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get conversation context
   */
  async getContext(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const { id } = req.params;

      const context = await this.conversationService.getContext(id, req.user.empresaId);

      res.json({
        success: true,
        data: context
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get count of active conversations
   */
  async getActiveCount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const count = await this.conversationService.getActiveCount(req.user.empresaId);

      res.json({
        success: true,
        data: { count }
      });
    } catch (error) {
      next(error);
    }
  }
}
