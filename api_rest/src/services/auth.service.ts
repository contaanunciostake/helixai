/**
 * ════════════════════════════════════════════════════════════════
 * AUTH SERVICE
 * ════════════════════════════════════════════════════════════════
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRepository } from '@/repositories/user.repository';
import { UnauthorizedError, ValidationError } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);

interface RegisterData {
  nome: string;
  email: string;
  password: string;
  tipo?: 'ADMIN' | 'VENDEDOR' | 'GERENTE';
  empresaId?: string;
}

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Login user and generate JWT token
   */
  async login(email: string, password: string) {
    // Find user by email
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedError('Email ou senha inválidos');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.senha);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Email ou senha inválidos');
    }

    // Check if user is active
    if (user.deletadoEm) {
      throw new UnauthorizedError('Usuário inativo');
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        empresaId: user.empresaId,
        email: user.email,
        tipo: user.tipo
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Return user data and token (excluding password)
    const { senha, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
      expiresIn: JWT_EXPIRES_IN
    };
  }

  /**
   * Register new user
   */
  async register(data: RegisterData) {
    // Check if email already exists
    const existingUser = await this.userRepository.findByEmail(data.email);

    if (existingUser) {
      throw new ValidationError('Email já está em uso');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

    // Create user
    const user = await this.userRepository.create({
      nome: data.nome,
      email: data.email,
      senha: hashedPassword,
      tipo: data.tipo || 'VENDEDOR',
      empresaId: data.empresaId || '' // Will need proper company creation flow
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        empresaId: user.empresaId,
        email: user.email,
        tipo: user.tipo
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Return user data and token (excluding password)
    const { senha, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
      expiresIn: JWT_EXPIRES_IN
    };
  }

  /**
   * Get user profile
   */
  async getProfile(userId: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedError('Usuário não encontrado');
    }

    // Return user data without password
    const { senha, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }

  /**
   * Refresh JWT token
   */
  async refreshToken(userId: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedError('Usuário não encontrado');
    }

    // Generate new JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        empresaId: user.empresaId,
        email: user.email,
        tipo: user.tipo
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return {
      token,
      expiresIn: JWT_EXPIRES_IN
    };
  }
}
