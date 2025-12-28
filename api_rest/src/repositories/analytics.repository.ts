/**
 * ════════════════════════════════════════════════════════════════
 * ANALYTICS REPOSITORY
 * ════════════════════════════════════════════════════════════════
 */

import { prisma } from '@/config/database';

interface DateRange {
  startDate?: string;
  endDate?: string;
}

export class AnalyticsRepository {
  /**
   * Build date filter
   */
  private buildDateFilter(dateRange: DateRange) {
    const filter: Record<string, unknown> = {};

    if (dateRange.startDate || dateRange.endDate) {
      filter.gte = dateRange.startDate ? new Date(dateRange.startDate) : undefined;
      filter.lte = dateRange.endDate ? new Date(dateRange.endDate) : undefined;
    }

    return Object.keys(filter).length > 0 ? filter : undefined;
  }

  /**
   * Get analytics overview
   */
  async getOverview(empresaId: string, dateRange: DateRange) {
    const dateFilter = this.buildDateFilter(dateRange);

    const [
      totalConversations,
      activeConversations,
      totalMessages,
      totalVehicles,
      availableVehicles
    ] = await Promise.all([
      prisma.conversation.count({
        where: {
          empresaId,
          deletadoEm: null,
          ...(dateFilter && { iniciadoEm: dateFilter })
        }
      }),
      prisma.conversation.count({
        where: {
          empresaId,
          status: 'ATIVO',
          deletadoEm: null
        }
      }),
      prisma.message.count({
        where: {
          conversation: { empresaId },
          ...(dateFilter && { timestamp: dateFilter })
        }
      }),
      prisma.vehicle.count({
        where: { empresaId, deletadoEm: null }
      }),
      prisma.vehicle.count({
        where: { empresaId, disponivel: true, deletadoEm: null }
      })
    ]);

    return {
      totalConversations,
      activeConversations,
      totalMessages,
      totalVehicles,
      availableVehicles,
      averageMessagesPerConversation:
        totalConversations > 0 ? Math.round(totalMessages / totalConversations) : 0
    };
  }

  /**
   * Get conversation statistics
   */
  async getConversationStats(empresaId: string, dateRange: DateRange) {
    const dateFilter = this.buildDateFilter(dateRange);

    const statusCounts = await prisma.conversation.groupBy({
      by: ['status'],
      where: {
        empresaId,
        deletadoEm: null,
        ...(dateFilter && { iniciadoEm: dateFilter })
      },
      _count: true
    });

    return {
      byStatus: statusCounts.map((item) => ({
        status: item.status,
        count: item._count
      }))
    };
  }

  /**
   * Get message statistics
   */
  async getMessageStats(empresaId: string, dateRange: DateRange) {
    const dateFilter = this.buildDateFilter(dateRange);

    const messageCounts = await prisma.message.groupBy({
      by: ['tipo'],
      where: {
        conversation: { empresaId },
        ...(dateFilter && { timestamp: dateFilter })
      },
      _count: true
    });

    return {
      byType: messageCounts.map((item) => ({
        type: item.tipo,
        count: item._count
      }))
    };
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(empresaId: string, dateRange: DateRange) {
    const dateFilter = this.buildDateFilter(dateRange);

    const conversations = await prisma.conversation.findMany({
      where: {
        empresaId,
        deletadoEm: null,
        ...(dateFilter && { iniciadoEm: dateFilter })
      },
      select: {
        iniciadoEm: true,
        ultimaMensagem: true,
        _count: {
          select: { messages: true }
        }
      }
    });

    // Calculate average response time (simplified)
    const avgMessagesPerConv =
      conversations.reduce((sum, conv) => sum + conv._count.messages, 0) /
      (conversations.length || 1);

    return {
      totalConversations: conversations.length,
      averageMessagesPerConversation: Math.round(avgMessagesPerConv),
      // Add more sophisticated metrics as needed
      averageConversationDuration: 0 // Placeholder
    };
  }

  /**
   * Get conversion funnel
   */
  async getConversionFunnel(empresaId: string, dateRange: DateRange) {
    const dateFilter = this.buildDateFilter(dateRange);

    const [totalInitiated, withMessages, completed] = await Promise.all([
      prisma.conversation.count({
        where: {
          empresaId,
          deletadoEm: null,
          ...(dateFilter && { iniciadoEm: dateFilter })
        }
      }),
      prisma.conversation.count({
        where: {
          empresaId,
          deletadoEm: null,
          messages: { some: {} },
          ...(dateFilter && { iniciadoEm: dateFilter })
        }
      }),
      prisma.conversation.count({
        where: {
          empresaId,
          status: 'ENCERRADO',
          deletadoEm: null,
          ...(dateFilter && { iniciadoEm: dateFilter })
        }
      })
    ]);

    return {
      initiated: totalInitiated,
      engaged: withMessages,
      completed,
      conversionRate: totalInitiated > 0 ? (completed / totalInitiated) * 100 : 0
    };
  }

  /**
   * Get top vehicles
   */
  async getTopVehicles(empresaId: string) {
    // This is a simplified version
    // In a real implementation, you'd track vehicle mentions/interests in conversations
    return await prisma.vehicle.findMany({
      where: {
        empresaId,
        disponivel: true,
        deletadoEm: null
      },
      orderBy: { preco: 'desc' },
      take: 10
    });
  }
}
