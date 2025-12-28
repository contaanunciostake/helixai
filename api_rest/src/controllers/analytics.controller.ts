/**
 * ════════════════════════════════════════════════════════════════
 * ANALYTICS CONTROLLER
 * ════════════════════════════════════════════════════════════════
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from '@/types';
import { AnalyticsService } from '@/services/analytics.service';

export class AnalyticsController {
  private analyticsService: AnalyticsService;

  constructor() {
    this.analyticsService = new AnalyticsService();
  }

  /**
   * Get analytics overview for dashboard
   */
  async getOverview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const { startDate, endDate } = req.query;

      const overview = await this.analyticsService.getOverview(req.user.empresaId, {
        startDate: startDate as string | undefined,
        endDate: endDate as string | undefined
      });

      res.json({
        success: true,
        data: overview
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get conversation analytics
   */
  async getConversationStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const { startDate, endDate } = req.query;

      const stats = await this.analyticsService.getConversationStats(req.user.empresaId, {
        startDate: startDate as string | undefined,
        endDate: endDate as string | undefined
      });

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get message analytics
   */
  async getMessageStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const { startDate, endDate } = req.query;

      const stats = await this.analyticsService.getMessageStats(req.user.empresaId, {
        startDate: startDate as string | undefined,
        endDate: endDate as string | undefined
      });

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get bot performance metrics
   */
  async getPerformanceMetrics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const { startDate, endDate } = req.query;

      const metrics = await this.analyticsService.getPerformanceMetrics(req.user.empresaId, {
        startDate: startDate as string | undefined,
        endDate: endDate as string | undefined
      });

      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get conversion funnel data
   */
  async getConversionFunnel(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const { startDate, endDate } = req.query;

      const funnel = await this.analyticsService.getConversionFunnel(req.user.empresaId, {
        startDate: startDate as string | undefined,
        endDate: endDate as string | undefined
      });

      res.json({
        success: true,
        data: funnel
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get most requested vehicles
   */
  async getTopVehicles(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const topVehicles = await this.analyticsService.getTopVehicles(req.user.empresaId);

      res.json({
        success: true,
        data: topVehicles
      });
    } catch (error) {
      next(error);
    }
  }
}
