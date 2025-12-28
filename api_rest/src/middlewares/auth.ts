/**
 * ════════════════════════════════════════════════════════════════
 * AUTHENTICATION MIDDLEWARE
 * ════════════════════════════════════════════════════════════════
 */

import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, UnauthorizedError, ForbiddenError, TokenPayload } from '@/types';
import { logger } from '@/utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Verify JWT token and attach user to request
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedError('Token de autenticação não fornecido');
    }

    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedError('Formato de token inválido. Use: Bearer <token>');
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

    // Attach user data to request
    req.user = {
      id: decoded.userId,
      empresaId: decoded.empresaId,
      email: decoded.email,
      nome: decoded.email, // Will be replaced with actual name from DB if needed
      tipo: decoded.tipo as 'ADMIN' | 'VENDEDOR' | 'GERENTE'
    };

    logger.debug(`User authenticated: ${req.user.email}`);

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Token expirado. Faça login novamente.'));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Token inválido'));
    } else {
      next(error);
    }
  }
};

/**
 * Check if user has required role
 */
export const authorize = (...allowedRoles: Array<'ADMIN' | 'VENDEDOR' | 'GERENTE'>) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Usuário não autenticado'));
    }

    if (!allowedRoles.includes(req.user.tipo)) {
      logger.warn(`Unauthorized access attempt by ${req.user.email} to ${req.path}`);
      return next(
        new ForbiddenError('Você não tem permissão para acessar este recurso')
      );
    }

    next();
  };
};

/**
 * Optional authentication - doesn't fail if no token provided
 */
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next();
    }

    const [bearer, token] = authHeader.split(' ');

    if (bearer === 'Bearer' && token) {
      const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

      req.user = {
        id: decoded.userId,
        empresaId: decoded.empresaId,
        email: decoded.email,
        nome: decoded.email,
        tipo: decoded.tipo as 'ADMIN' | 'VENDEDOR' | 'GERENTE'
      };
    }

    next();
  } catch (error) {
    // If token is invalid, just continue without user
    next();
  }
};
