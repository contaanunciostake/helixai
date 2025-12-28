/**
 * ════════════════════════════════════════════════════════════════
 * USER SERVICE
 * ════════════════════════════════════════════════════════════════
 */

import { UserRepository } from '@/repositories/user.repository';
import { NotFoundError, PaginationParams } from '@/types';

interface UpdateUserData {
  nome?: string;
  email?: string;
  tipo?: 'ADMIN' | 'VENDEDOR' | 'GERENTE';
}

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Get all users in company
   */
  async getAll(empresaId: string, pagination: PaginationParams) {
    return await this.userRepository.findByCompany(empresaId, pagination);
  }

  /**
   * Get user by ID
   */
  async getById(id: string, empresaId: string) {
    const user = await this.userRepository.findById(id);

    if (!user || user.empresaId !== empresaId) {
      throw new NotFoundError('Usuário não encontrado');
    }

    // Return without password
    const { senha, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Update user
   */
  async update(id: string, data: UpdateUserData, empresaId: string) {
    // Verify ownership
    const existing = await this.getById(id, empresaId);

    if (!existing) {
      throw new NotFoundError('Usuário não encontrado');
    }

    const updated = await this.userRepository.update(id, data);

    // Return without password
    const { senha, ...userWithoutPassword } = updated;
    return userWithoutPassword;
  }

  /**
   * Delete user (soft delete)
   */
  async delete(id: string, empresaId: string) {
    // Verify ownership
    const existing = await this.getById(id, empresaId);

    if (!existing) {
      throw new NotFoundError('Usuário não encontrado');
    }

    return await this.userRepository.softDelete(id);
  }

  /**
   * Update user role
   */
  async updateRole(
    id: string,
    role: 'ADMIN' | 'VENDEDOR' | 'GERENTE',
    empresaId: string
  ) {
    // Verify ownership
    const existing = await this.getById(id, empresaId);

    if (!existing) {
      throw new NotFoundError('Usuário não encontrado');
    }

    const updated = await this.userRepository.update(id, { tipo: role });

    // Return without password
    const { senha, ...userWithoutPassword } = updated;
    return userWithoutPassword;
  }
}
