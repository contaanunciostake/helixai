/**
 * ════════════════════════════════════════════════════════════════
 * VEHICLE REPOSITORY
 * ════════════════════════════════════════════════════════════════
 */

import { prisma } from '@/config/database';
import { PaginationParams } from '@/types';

export class VehicleRepository {
  /**
   * Find vehicle by ID
   */
  async findById(id: string) {
    return await prisma.vehicle.findUnique({
      where: { id, deletadoEm: null }
    });
  }

  /**
   * Find all vehicles by company
   */
  async findByCompany(empresaId: string, pagination: PaginationParams) {
    const { page, limit, sortBy = 'criadoEm', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.vehicle.findMany({
        where: { empresaId, deletadoEm: null },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder }
      }),
      prisma.vehicle.count({
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
   * Create new vehicle
   */
  async create(data: {
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
    disponivel: boolean;
    fotos?: string[];
    empresaId: string;
  }) {
    return await prisma.vehicle.create({
      data: {
        ...data,
        fotos: data.fotos || []
      }
    });
  }

  /**
   * Update vehicle
   */
  async update(
    id: string,
    data: Partial<{
      marca: string;
      modelo: string;
      ano: number;
      preco: number;
      km: number;
      cor: string;
      combustivel: string;
      cambio: string;
      portas: number;
      descricao: string;
      disponivel: boolean;
      fotos: string[];
    }>
  ) {
    return await prisma.vehicle.update({
      where: { id },
      data: {
        ...data,
        atualizadoEm: new Date()
      }
    });
  }

  /**
   * Soft delete vehicle
   */
  async softDelete(id: string) {
    return await prisma.vehicle.update({
      where: { id },
      data: {
        deletadoEm: new Date()
      }
    });
  }

  /**
   * Search available vehicles with filters
   */
  async searchAvailable(empresaId: string, filters: Record<string, unknown>) {
    const where: Record<string, unknown> = {
      empresaId,
      disponivel: true,
      deletadoEm: null
    };

    // Add filters
    if (filters.marca) where.marca = filters.marca;
    if (filters.modelo) where.modelo = { contains: filters.modelo as string };
    if (filters.anoMin) where.ano = { gte: Number(filters.anoMin) };
    if (filters.anoMax) where.ano = { ...where.ano, lte: Number(filters.anoMax) };
    if (filters.precoMin) where.preco = { gte: Number(filters.precoMin) };
    if (filters.precoMax) where.preco = { ...where.preco, lte: Number(filters.precoMax) };
    if (filters.kmMax) where.km = { lte: Number(filters.kmMax) };
    if (filters.combustivel) where.combustivel = filters.combustivel;
    if (filters.cambio) where.cambio = filters.cambio;

    return await prisma.vehicle.findMany({
      where,
      orderBy: { preco: 'asc' }
    });
  }
}
