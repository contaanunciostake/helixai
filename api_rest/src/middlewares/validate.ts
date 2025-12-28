/**
 * ════════════════════════════════════════════════════════════════
 * VALIDATION MIDDLEWARE - ZOD SCHEMAS
 * ════════════════════════════════════════════════════════════════
 */

import { Request, Response, NextFunction } from 'express';
import { z, ZodError, ZodSchema } from 'zod';
import { ValidationError } from '@/types';

/**
 * Validate request data against Zod schema
 */
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message
        }));

        next(
          new ValidationError(
            `Erro de validação: ${formattedErrors.map((e) => e.message).join(', ')}`
          )
        );
      } else {
        next(error);
      }
    }
  };
};

// ══════════════════════════════════════════════════════════════
// COMMON VALIDATION SCHEMAS
// ══════════════════════════════════════════════════════════════

// Pagination schema
export const paginationSchema = z.object({
  query: z.object({
    page: z.string().optional().default('1').transform(Number),
    limit: z.string().optional().default('10').transform(Number),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional()
  })
});

// ID parameter schema
export const idParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID deve ser um UUID válido')
  })
});

// Date range schema
export const dateRangeSchema = z.object({
  query: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional()
  })
});

// ══════════════════════════════════════════════════════════════
// AUTH VALIDATION SCHEMAS
// ══════════════════════════════════════════════════════════════

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres')
  })
});

export const registerSchema = z.object({
  body: z.object({
    nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
    tipo: z.enum(['ADMIN', 'VENDEDOR', 'GERENTE']).optional(),
    empresaId: z.string().uuid('ID da empresa deve ser um UUID válido').optional()
  })
});

// ══════════════════════════════════════════════════════════════
// BOT CONFIG VALIDATION SCHEMAS
// ══════════════════════════════════════════════════════════════

export const createBotConfigSchema = z.object({
  body: z.object({
    nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    descricao: z.string().optional(),
    ativo: z.boolean().optional().default(true),
    configuracoes: z
      .object({
        personality: z
          .object({
            tone: z.string().optional(),
            formality: z.string().optional(),
            emoji: z.boolean().optional()
          })
          .optional(),
        responses: z
          .object({
            greeting: z.string().optional(),
            farewell: z.string().optional(),
            fallback: z.string().optional()
          })
          .optional(),
        features: z
          .object({
            appointmentBooking: z.boolean().optional(),
            vehicleRecommendation: z.boolean().optional(),
            priceNegotiation: z.boolean().optional()
          })
          .optional(),
        limits: z
          .object({
            maxMessagesPerConversation: z.number().optional(),
            maxResponseTime: z.number().optional()
          })
          .optional()
      })
      .optional()
  })
});

export const updateBotConfigSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID deve ser um UUID válido')
  }),
  body: z.object({
    nome: z.string().min(3).optional(),
    descricao: z.string().optional(),
    ativo: z.boolean().optional(),
    configuracoes: z.record(z.unknown()).optional()
  })
});

// ══════════════════════════════════════════════════════════════
// VEHICLE VALIDATION SCHEMAS
// ══════════════════════════════════════════════════════════════

export const createVehicleSchema = z.object({
  body: z.object({
    marca: z.string().min(2, 'Marca deve ter no mínimo 2 caracteres'),
    modelo: z.string().min(2, 'Modelo deve ter no mínimo 2 caracteres'),
    ano: z.number().int().min(1900).max(new Date().getFullYear() + 1),
    preco: z.number().positive('Preço deve ser positivo'),
    km: z.number().int().nonnegative('Quilometragem deve ser positiva'),
    cor: z.string().optional(),
    combustivel: z.string().optional(),
    cambio: z.string().optional(),
    portas: z.number().int().positive().optional(),
    descricao: z.string().optional(),
    disponivel: z.boolean().optional().default(true),
    fotos: z.array(z.string().url()).optional()
  })
});

export const updateVehicleSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID deve ser um UUID válido')
  }),
  body: z.object({
    marca: z.string().min(2).optional(),
    modelo: z.string().min(2).optional(),
    ano: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
    preco: z.number().positive().optional(),
    km: z.number().int().nonnegative().optional(),
    cor: z.string().optional(),
    combustivel: z.string().optional(),
    cambio: z.string().optional(),
    portas: z.number().int().positive().optional(),
    descricao: z.string().optional(),
    disponivel: z.boolean().optional(),
    fotos: z.array(z.string().url()).optional()
  })
});

// ══════════════════════════════════════════════════════════════
// CONVERSATION VALIDATION SCHEMAS
// ══════════════════════════════════════════════════════════════

export const createConversationSchema = z.object({
  body: z.object({
    clienteNome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
    clienteTelefone: z.string().min(10, 'Telefone inválido'),
    status: z.enum(['ATIVO', 'ENCERRADO', 'PAUSADO']).optional()
  })
});

export const updateConversationStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID deve ser um UUID válido')
  }),
  body: z.object({
    status: z.enum(['ATIVO', 'ENCERRADO', 'PAUSADO'])
  })
});
