/**
 * ════════════════════════════════════════════════════════════════
 * AUTH CONTROLLER
 * ════════════════════════════════════════════════════════════════
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from '@/types';
import { AuthService } from '@/services/auth.service';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Login user
   */
  async login(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const result = await this.authService.login(email, password);

      res.json({
        success: true,
        message: 'Login realizado com sucesso',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Register new user
   */
  async register(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userData = req.body;

      const result = await this.authService.register(userData);

      res.status(201).json({
        success: true,
        message: 'Usuário registrado com sucesso',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const profile = await this.authService.getProfile(req.user.id);

      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh JWT token
   */
  async refreshToken(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const result = await this.authService.refreshToken(req.user.id);

      res.json({
        success: true,
        message: 'Token atualizado com sucesso',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user
   */
  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // In a real implementation, you would invalidate the token here
      // For now, we'll just return a success message

      res.json({
        success: true,
        message: 'Logout realizado com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }
}
