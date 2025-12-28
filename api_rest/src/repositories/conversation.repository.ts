/**
 * ════════════════════════════════════════════════════════════════
 * CONVERSATION REPOSITORY
 * ════════════════════════════════════════════════════════════════
 */

import { prisma } from '@/config/database';
import { PaginationParams } from '@/types';

export class ConversationRepository {
  /**
   * Find conversation by ID
   */
  async findById(id: string) {
    return await prisma.conversation.findUnique({
      where: { id, deletadoEm: null },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' },
          take: 50 // Limit messages to prevent huge payloads
        },
        context: true
      }
    });
  }

  /**
   * Find conversation by phone
   */
  async findByPhone(phone: string, empresaId: string) {
    return await prisma.conversation.findFirst({
      where: {
        clienteTelefone: phone,
        empresaId,
        deletadoEm: null
      },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' },
          take: 50
        },
        context: true
      }
    });
  }

  /**
   * Find all conversations by company
   */
  async findByCompany(empresaId: string, pagination: PaginationParams) {
    const { page, limit, sortBy = 'iniciadoEm', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.conversation.findMany({
        where: { empresaId, deletadoEm: null },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: { messages: true }
          }
        }
      }),
      prisma.conversation.count({
        where: { empresaId, deletadoEm: null }
      })
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Update conversation
   */
  async update(id: string, data: Partial<{ status: string; ultimaMensagem: Date }>) {
    return await prisma.conversation.update({
      where: { id },
      data
    });
  }

  /**
   * Get conversation context
   */
  async getContext(conversationId: string) {
    return await prisma.conversationContext.findUnique({
      where: { conversationId }
    });
  }

  /**
   * Count active conversations
   */
  async countActive(empresaId: string) {
    return await prisma.conversation.count({
      where: {
        empresaId,
        status: 'ATIVO',
        deletadoEm: null
      }
    });
  }
}
