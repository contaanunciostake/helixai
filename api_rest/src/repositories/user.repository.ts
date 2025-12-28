/**
 * ════════════════════════════════════════════════════════════════
 * USER REPOSITORY
 * ════════════════════════════════════════════════════════════════
 */

import { prisma } from '@/config/database';
import { PaginationParams } from '@/types';

export class UserRepository {
  /**
   * Find user by ID
   */
  async findById(id: string) {
    return await prisma.user.findUnique({
      where: { id, deletadoEm: null }
    });
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string) {
    return await prisma.user.findFirst({
      where: { email, deletadoEm: null }
    });
  }

  /**
   * Find all users by company
   */
  async findByCompany(empresaId: string, pagination: PaginationParams) {
    const { page, limit, sortBy = 'criadoEm', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where: { empresaId, deletadoEm: null },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder }
      }),
      prisma.user.count({
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
   * Create new user
   */
  async create(data: {
    nome: string;
    email: string;
    senha: string;
    tipo: string;
    empresaId: string;
  }) {
    return await prisma.user.create({
      data
    });
  }

  /**
   * Update user
   */
  async update(id: string, data: Partial<{ nome: string; email: string; tipo: string }>) {
    return await prisma.user.update({
      where: { id },
      data: {
        ...data,
        atualizadoEm: new Date()
      }
    });
  }

  /**
   * Soft delete user
   */
  async softDelete(id: string) {
    return await prisma.user.update({
      where: { id },
      data: {
        deletadoEm: new Date()
      }
    });
  }
}
