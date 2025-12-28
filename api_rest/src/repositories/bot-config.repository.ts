/**
 * ════════════════════════════════════════════════════════════════
 * BOT CONFIG REPOSITORY
 * ════════════════════════════════════════════════════════════════
 */

import { prisma } from '@/config/database';
import { BotSettings } from '@/types';

export class BotConfigRepository {
  /**
   * Find bot config by ID
   */
  async findById(id: string) {
    return await prisma.botConfiguration.findUnique({
      where: { id, deletadoEm: null }
    });
  }

  /**
   * Find all configs by company
   */
  async findByCompany(empresaId: string) {
    return await prisma.botConfiguration.findMany({
      where: { empresaId, deletadoEm: null },
      orderBy: { criadoEm: 'desc' }
    });
  }

  /**
   * Create new bot config
   */
  async create(data: {
    nome: string;
    descricao?: string;
    ativo: boolean;
    configuracoes?: BotSettings;
    empresaId: string;
  }) {
    return await prisma.botConfiguration.create({
      data: {
        nome: data.nome,
        descricao: data.descricao,
        ativo: data.ativo,
        configuracoes: data.configuracoes || {},
        empresaId: data.empresaId
      }
    });
  }

  /**
   * Update bot config
   */
  async update(
    id: string,
    data: Partial<{
      nome: string;
      descricao: string;
      ativo: boolean;
      configuracoes: BotSettings;
    }>
  ) {
    return await prisma.botConfiguration.update({
      where: { id },
      data: {
        ...data,
        atualizadoEm: new Date()
      }
    });
  }

  /**
   * Soft delete bot config
   */
  async softDelete(id: string) {
    return await prisma.botConfiguration.update({
      where: { id },
      data: {
        deletadoEm: new Date()
      }
    });
  }
}
