/**
 * ════════════════════════════════════════════════════════════════
 * MESSAGE REPOSITORY
 * ════════════════════════════════════════════════════════════════
 */

import { prisma } from '@/config/database';

export class MessageRepository {
  /**
   * Find all messages by conversation
   */
  async findByConversation(conversationId: string) {
    return await prisma.message.findMany({
      where: { conversationId },
      orderBy: { timestamp: 'asc' }
    });
  }

  /**
   * Create new message
   */
  async create(data: {
    conversationId: string;
    tipo: 'RECEBIDA' | 'ENVIADA';
    conteudo: string;
    lida?: boolean;
  }) {
    return await prisma.message.create({
      data: {
        ...data,
        lida: data.lida ?? false,
        timestamp: new Date()
      }
    });
  }

  /**
   * Mark message as read
   */
  async markAsRead(id: string) {
    return await prisma.message.update({
      where: { id },
      data: { lida: true }
    });
  }

  /**
   * Count unread messages for conversation
   */
  async countUnread(conversationId: string) {
    return await prisma.message.count({
      where: {
        conversationId,
        tipo: 'RECEBIDA',
        lida: false
      }
    });
  }
}
