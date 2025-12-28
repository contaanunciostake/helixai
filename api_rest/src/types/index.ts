/**
 * ════════════════════════════════════════════════════════════════
 * GLOBAL TYPE DEFINITIONS
 * ════════════════════════════════════════════════════════════════
 */

import { Request } from 'express';

// ══════════════════════════════════════════════════════════════
// USER & AUTH TYPES
// ══════════════════════════════════════════════════════════════

export interface AuthUser {
  id: string;
  empresaId: string;
  email: string;
  nome: string;
  tipo: 'ADMIN' | 'VENDEDOR' | 'GERENTE';
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export interface TokenPayload {
  userId: string;
  empresaId: string;
  email: string;
  tipo: string;
}

// ══════════════════════════════════════════════════════════════
// API RESPONSE TYPES
// ══════════════════════════════════════════════════════════════

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ══════════════════════════════════════════════════════════════
// ERROR TYPES
// ══════════════════════════════════════════════════════════════

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Não autorizado') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Acesso negado') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Recurso não encontrado') {
    super(message, 404);
  }
}

// ══════════════════════════════════════════════════════════════
// BOT CONFIGURATION TYPES
// ══════════════════════════════════════════════════════════════

export interface BotConfig {
  id: string;
  empresaId: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
  configuracoes: BotSettings;
}

export interface BotSettings {
  personality?: {
    tone?: string;
    formality?: string;
    emoji?: boolean;
  };
  responses?: {
    greeting?: string;
    farewell?: string;
    fallback?: string;
  };
  features?: {
    appointmentBooking?: boolean;
    vehicleRecommendation?: boolean;
    priceNegotiation?: boolean;
  };
  limits?: {
    maxMessagesPerConversation?: number;
    maxResponseTime?: number;
  };
}

// ══════════════════════════════════════════════════════════════
// CONVERSATION TYPES
// ══════════════════════════════════════════════════════════════

export interface ConversationData {
  id: string;
  empresaId: string;
  clienteNome: string;
  clienteTelefone: string;
  status: 'ATIVO' | 'ENCERRADO' | 'PAUSADO';
  iniciadoEm: Date;
  ultimaMensagem?: Date;
  messages?: MessageData[];
}

export interface MessageData {
  id: string;
  conversationId: string;
  tipo: 'RECEBIDA' | 'ENVIADA';
  conteudo: string;
  timestamp: Date;
  lida: boolean;
}

// ══════════════════════════════════════════════════════════════
// VEHICLE TYPES
// ══════════════════════════════════════════════════════════════

export interface VehicleData {
  id: string;
  empresaId: string;
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
}

// ══════════════════════════════════════════════════════════════
// ANALYTICS TYPES
// ══════════════════════════════════════════════════════════════

export interface AnalyticsData {
  empresaId: string;
  periodo: {
    inicio: Date;
    fim: Date;
  };
  metricas: {
    totalConversas: number;
    conversasAtivas: number;
    conversasEncerradas: number;
    tempoMedioResposta: number;
    satisfacaoMedia?: number;
    taxaConversao?: number;
  };
}
