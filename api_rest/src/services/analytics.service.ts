/**
 * ════════════════════════════════════════════════════════════════
 * ANALYTICS SERVICE
 * ════════════════════════════════════════════════════════════════
 */

import { AnalyticsRepository } from '@/repositories/analytics.repository';

interface DateRange {
  startDate?: string;
  endDate?: string;
}

export class AnalyticsService {
  private analyticsRepository: AnalyticsRepository;

  constructor() {
    this.analyticsRepository = new AnalyticsRepository();
  }

  /**
   * Get analytics overview for dashboard
   */
  async getOverview(empresaId: string, dateRange: DateRange) {
    return await this.analyticsRepository.getOverview(empresaId, dateRange);
  }

  /**
   * Get conversation analytics
   */
  async getConversationStats(empresaId: string, dateRange: DateRange) {
    return await this.analyticsRepository.getConversationStats(empresaId, dateRange);
  }

  /**
   * Get message analytics
   */
  async getMessageStats(empresaId: string, dateRange: DateRange) {
    return await this.analyticsRepository.getMessageStats(empresaId, dateRange);
  }

  /**
   * Get bot performance metrics
   */
  async getPerformanceMetrics(empresaId: string, dateRange: DateRange) {
    return await this.analyticsRepository.getPerformanceMetrics(empresaId, dateRange);
  }

  /**
   * Get conversion funnel data
   */
  async getConversionFunnel(empresaId: string, dateRange: DateRange) {
    return await this.analyticsRepository.getConversionFunnel(empresaId, dateRange);
  }

  /**
   * Get most requested vehicles
   */
  async getTopVehicles(empresaId: string) {
    return await this.analyticsRepository.getTopVehicles(empresaId);
  }
}
