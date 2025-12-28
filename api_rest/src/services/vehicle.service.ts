/**
 * ════════════════════════════════════════════════════════════════
 * VEHICLE SERVICE
 * ════════════════════════════════════════════════════════════════
 */

import { VehicleRepository } from '@/repositories/vehicle.repository';
import { NotFoundError, PaginationParams } from '@/types';

interface CreateVehicleData {
  marca: string;
  modelo: string;
  ano: number;
  preco: number;
  km: number;
  cor?: string;
  combustivel?: string;
  cambio?: string;
  portas?: number;
  descricao?: string;
  disponivel?: boolean;
  fotos?: string[];
}

interface UpdateVehicleData {
  marca?: string;
  modelo?: string;
  ano?: number;
  preco?: number;
  km?: number;
  cor?: string;
  combustivel?: string;
  cambio?: string;
  portas?: number;
  descricao?: string;
  disponivel?: boolean;
  fotos?: string[];
}

export class VehicleService {
  private vehicleRepository: VehicleRepository;

  constructor() {
    this.vehicleRepository = new VehicleRepository();
  }

  /**
   * Get all vehicles with pagination
   */
  async getAll(empresaId: string, pagination: PaginationParams) {
    return await this.vehicleRepository.findByCompany(empresaId, pagination);
  }

  /**
   * Get vehicle by ID
   */
  async getById(id: string, empresaId: string) {
    const vehicle = await this.vehicleRepository.findById(id);

    if (!vehicle || vehicle.empresaId !== empresaId) {
      throw new NotFoundError('Veículo não encontrado');
    }

    return vehicle;
  }

  /**
   * Create new vehicle
   */
  async create(data: CreateVehicleData, empresaId: string) {
    return await this.vehicleRepository.create({
      ...data,
      empresaId,
      disponivel: data.disponivel ?? true
    });
  }

  /**
   * Update vehicle
   */
  async update(id: string, data: UpdateVehicleData, empresaId: string) {
    // Verify ownership
    const existing = await this.getById(id, empresaId);

    if (!existing) {
      throw new NotFoundError('Veículo não encontrado');
    }

    return await this.vehicleRepository.update(id, data);
  }

  /**
   * Delete vehicle (soft delete)
   */
  async delete(id: string, empresaId: string) {
    // Verify ownership
    const existing = await this.getById(id, empresaId);

    if (!existing) {
      throw new NotFoundError('Veículo não encontrado');
    }

    return await this.vehicleRepository.softDelete(id);
  }

  /**
   * Toggle vehicle availability
   */
  async toggleAvailability(id: string, empresaId: string) {
    // Verify ownership
    const existing = await this.getById(id, empresaId);

    if (!existing) {
      throw new NotFoundError('Veículo não encontrado');
    }

    return await this.vehicleRepository.update(id, {
      disponivel: !existing.disponivel
    });
  }

  /**
   * Search available vehicles with filters
   */
  async searchAvailable(empresaId: string, filters: Record<string, unknown>) {
    return await this.vehicleRepository.searchAvailable(empresaId, filters);
  }
}
