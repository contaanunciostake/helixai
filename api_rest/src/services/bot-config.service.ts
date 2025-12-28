/**
 * ════════════════════════════════════════════════════════════════
 * BOT CONFIG SERVICE
 * ════════════════════════════════════════════════════════════════
 */

import { BotConfigRepository } from '@/repositories/bot-config.repository';
import { NotFoundError, BotSettings } from '@/types';

interface CreateBotConfigData {
  nome: string;
  descricao?: string;
  ativo?: boolean;
  configuracoes?: BotSettings;
}

interface UpdateBotConfigData {
  nome?: string;
  descricao?: string;
  ativo?: boolean;
  configuracoes?: BotSettings;
}

export class BotConfigService {
  private botConfigRepository: BotConfigRepository;

  constructor() {
    this.botConfigRepository = new BotConfigRepository();
  }

  /**
   * Get all bot configurations for company
   */
  async getAll(empresaId: string) {
    return await this.botConfigRepository.findByCompany(empresaId);
  }

  /**
   * Get bot configuration by ID
   */
  async getById(id: string, empresaId: string) {
    const config = await this.botConfigRepository.findById(id);

    if (!config || config.empresaId !== empresaId) {
      throw new NotFoundError('Configuração não encontrada');
    }

    return config;
  }

  /**
   * Create new bot configuration
   */
  async create(data: CreateBotConfigData, empresaId: string) {
    return await this.botConfigRepository.create({
      ...data,
      empresaId,
      ativo: data.ativo ?? true
    });
  }

  /**
   * Update bot configuration
   */
  async update(id: string, data: UpdateBotConfigData, empresaId: string) {
    // Verify ownership
    const existing = await this.getById(id, empresaId);

    if (!existing) {
      throw new NotFoundError('Configuração não encontrada');
    }

    return await this.botConfigRepository.update(id, data);
  }

  /**
   * Delete bot configuration (soft delete)
   */
  async delete(id: string, empresaId: string) {
    // Verify ownership
    const existing = await this.getById(id, empresaId);

    if (!existing) {
      throw new NotFoundError('Configuração não encontrada');
    }

    return await this.botConfigRepository.softDelete(id);
  }

  /**
   * Toggle bot active status
   */
  async toggleActive(id: string, empresaId: string) {
    // Verify ownership
    const existing = await this.getById(id, empresaId);

    if (!existing) {
      throw new NotFoundError('Configuração não encontrada');
    }

    return await this.botConfigRepository.update(id, {
      ativo: !existing.ativo
    });
  }
}
