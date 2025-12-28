/**
 * ════════════════════════════════════════════════════════════════
 * ERROR HANDLER MIDDLEWARE
 * ════════════════════════════════════════════════════════════════
 */

import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { logger } from '@/utils/logger';
import { AppError } from '@/types';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  // Log error
  logger.error(`Error: ${err.message}`, {
    error: err,
    path: req.path,
    method: req.method,
    ip: req.ip,
    stack: err.stack
  });

  // Default error values
  let statusCode = 500;
  let message = 'Erro interno do servidor';
  let details: unknown = undefined;

  // Handle custom AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Handle Prisma errors
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = 400;

    switch (err.code) {
      case 'P2002':
        message = 'Registro duplicado. Este valor já existe no sistema.';
        details = { field: err.meta?.target };
        break;

      case 'P2025':
        message = 'Registro não encontrado.';
        statusCode = 404;
        break;

      case 'P2003':
        message = 'Violação de chave estrangeira. Registro relacionado não existe.';
        break;

      case 'P2014':
        message = 'Violação de relação. Não é possível deletar registro com dependências.';
        break;

      default:
        message = 'Erro de banco de dados.';
        details = process.env.NODE_ENV === 'development' ? { code: err.code } : undefined;
    }
  }

  // Handle Prisma validation errors
  else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = 'Dados de entrada inválidos.';
    details = process.env.NODE_ENV === 'development' ? err.message : undefined;
  }

  // Handle JSON parsing errors
  else if (err instanceof SyntaxError && 'body' in err) {
    statusCode = 400;
    message = 'JSON inválido no corpo da requisição.';
  }

  // Development vs Production error details
  const errorResponse = {
    success: false,
    error: message,
    ...(details && { details }),
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      originalError: err.message
    })
  };

  res.status(statusCode).json(errorResponse);
};
