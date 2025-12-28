/**
 * ════════════════════════════════════════════════════════════════
 * CONVERSATION SERVICE
 * ════════════════════════════════════════════════════════════════
 */

import { ConversationRepository } from '@/repositories/conversation.repository';
import { MessageRepository } from '@/repositories/message.repository';
import { NotFoundError, PaginationParams } from '@/types';

export class ConversationService {
  private conversationRepository: ConversationRepository;
  private messageRepository: MessageRepository;

  constructor() {
    this.conversationRepository = new ConversationRepository();
    this.messageRepository = new MessageRepository();
  }

  /**
   * Get all conversations with pagination
   */
  async getAll(empresaId: string, pagination: PaginationParams) {
    return await this.conversationRepository.findByCompany(empresaId, pagination);
  }

  /**
   * Get conversation by ID with messages
   */
  async getById(id: string, empresaId: string) {
    const conversation = await this.conversationRepository.findById(id);

    if (!conversation || conversation.empresaId !== empresaId) {
      throw new NotFoundError('Conversa não encontrada');
    }

    return conversation;
  }

  /**
   * Get conversation by phone number
   */
  async getByPhone(phone: string, empresaId: string) {
    const conversation = await this.conversationRepository.findByPhone(phone, empresaId);

    if (!conversation) {
      throw new NotFoundError('Conversa não encontrada para este número');
    }

    return conversation;
  }

  /**
   * Update conversation status
   */
  async updateStatus(
    id: string,
    status: 'ATIVO' | 'ENCERRADO' | 'PAUSADO',
    empresaId: string
  ) {
    // Verify ownership
    const existing = await this.getById(id, empresaId);

    if (!existing) {
      throw new NotFoundError('Conversa não encontrada');
    }

    return await this.conversationRepository.update(id, { status });
  }

  /**
   * Get all messages for a conversation
   */
  async getMessages(conversationId: string, empresaId: string) {
    // Verify conversation ownership
    await this.getById(conversationId, empresaId);

    return await this.messageRepository.findByConversation(conversationId);
  }

  /**
   * Get conversation context
   */
  async getContext(conversationId: string, empresaId: string) {
    // Verify conversation ownership
    await this.getById(conversationId, empresaId);

    return await this.conversationRepository.getContext(conversationId);
  }

  /**
   * Get count of active conversations
   */
  async getActiveCount(empresaId: string) {
    return await this.conversationRepository.countActive(empresaId);
  }
}
