/**
 * ════════════════════════════════════════════════════════════════
 * AUTH SERVICE - UNIT TESTS
 * ════════════════════════════════════════════════════════════════
 */

import { AuthService } from '@/services/auth.service';
import { UserRepository } from '@/repositories/user.repository';
import { UnauthorizedError, ValidationError } from '@/types';
import bcrypt from 'bcrypt';

// Mock dependencies
jest.mock('@/repositories/user.repository');
jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    authService = new AuthService();
    userRepository = new UserRepository() as jest.Mocked<UserRepository>;
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login user successfully with valid credentials', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      const mockUser = {
        id: '123',
        empresaId: 'emp-123',
        email,
        senha: 'hashed-password',
        nome: 'Test User',
        tipo: 'VENDEDOR',
        deletadoEm: null
      };

      userRepository.findByEmail = jest.fn().mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock) = jest.fn().mockResolvedValue(true);

      // Act
      const result = await authService.login(email, password);

      // Assert
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.user).not.toHaveProperty('senha');
      expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
    });

    it('should throw UnauthorizedError for invalid email', async () => {
      // Arrange
      userRepository.findByEmail = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login('invalid@example.com', 'password')).rejects.toThrow(
        UnauthorizedError
      );
    });

    it('should throw UnauthorizedError for invalid password', async () => {
      // Arrange
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        senha: 'hashed-password',
        deletadoEm: null
      };

      userRepository.findByEmail = jest.fn().mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock) = jest.fn().mockResolvedValue(false);

      // Act & Assert
      await expect(
        authService.login('test@example.com', 'wrong-password')
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError for deleted user', async () => {
      // Arrange
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        senha: 'hashed-password',
        deletadoEm: new Date()
      };

      userRepository.findByEmail = jest.fn().mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock) = jest.fn().mockResolvedValue(true);

      // Act & Assert
      await expect(authService.login('test@example.com', 'password')).rejects.toThrow(
        UnauthorizedError
      );
    });
  });

  describe('register', () => {
    it('should register new user successfully', async () => {
      // Arrange
      const userData = {
        nome: 'New User',
        email: 'new@example.com',
        password: 'password123'
      };

      userRepository.findByEmail = jest.fn().mockResolvedValue(null);
      (bcrypt.hash as jest.Mock) = jest.fn().mockResolvedValue('hashed-password');
      userRepository.create = jest.fn().mockResolvedValue({
        id: '123',
        ...userData,
        senha: 'hashed-password',
        tipo: 'VENDEDOR'
      });

      // Act
      const result = await authService.register(userData);

      // Assert
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.user).not.toHaveProperty('senha');
      expect(userRepository.create).toHaveBeenCalled();
    });

    it('should throw ValidationError for duplicate email', async () => {
      // Arrange
      const userData = {
        nome: 'New User',
        email: 'existing@example.com',
        password: 'password123'
      };

      userRepository.findByEmail = jest.fn().mockResolvedValue({ id: '123' });

      // Act & Assert
      await expect(authService.register(userData)).rejects.toThrow(ValidationError);
    });
  });
});
