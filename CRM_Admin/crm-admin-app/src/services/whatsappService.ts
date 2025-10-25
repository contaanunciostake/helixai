/**
 * WhatsApp Service - Gerenciar conexões WhatsApp com Socket.io
 * @description Serviço para conectar ao whatsapp_service (porta 3001) e gerenciar conexões via QR Code
 */

import axios, { AxiosInstance } from 'axios';
import { io, Socket } from 'socket.io-client';

const WHATSAPP_SERVICE_URL = import.meta.env.VITE_WHATSAPP_SERVICE_URL || 'http://localhost:3001';

export interface WhatsAppStatus {
  empresaId: number;
  connected: boolean;
  qr: string | null;
  numero: string | null;
  timestamp: string;
}

export interface WhatsAppCallbacks {
  onQRGenerated?: (data: { qr: string; message: string }) => void;
  onConnectionSuccess?: (data: { connected: boolean; numero: string; message: string }) => void;
  onConnectionLost?: (data: { connected: boolean; message: string }) => void;
  onCurrentStatus?: (status: WhatsAppStatus) => void;
}

class WhatsAppService {
  private api: AxiosInstance;
  private socket: Socket | null = null;

  constructor() {
    // HTTP API Client
    this.api = axios.create({
      baseURL: WHATSAPP_SERVICE_URL,
      timeout: 60000,
      withCredentials: true,
    });

    // Interceptor para logs (dev)
    if (import.meta.env.DEV) {
      this.api.interceptors.request.use(
        (config) => {
          console.log(`[WhatsApp Service] ${config.method?.toUpperCase()} ${config.url}`);
          return config;
        },
        (error) => {
          console.error('[WhatsApp Service] Request error:', error);
          return Promise.reject(error);
        }
      );

      this.api.interceptors.response.use(
        (response) => {
          console.log(`[WhatsApp Service] Response:`, response.status, response.data);
          return response;
        },
        (error) => {
          console.error('[WhatsApp Service] Response error:', error.response?.data || error.message);
          return Promise.reject(error);
        }
      );
    }
  }

  /**
   * Conectar ao Socket.io e se juntar à sala da empresa
   */
  connectSocket(empresaId: number, callbacks: WhatsAppCallbacks): void {
    if (this.socket?.connected) {
      console.log('[WhatsApp Service] Socket já conectado');
      return;
    }

    console.log(`[WhatsApp Service] Conectando Socket.io para empresa ${empresaId}...`);

    this.socket = io(WHATSAPP_SERVICE_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    // Evento: Conectado ao servidor
    this.socket.on('connect', () => {
      console.log('[WhatsApp Service] Socket conectado!', this.socket?.id);
      // Se juntar à sala da empresa
      this.socket?.emit('join-empresa', empresaId);
    });

    // Evento: Status atual (recebido ao entrar na sala)
    this.socket.on('current-status', (status: WhatsAppStatus) => {
      console.log('[WhatsApp Service] Status atual recebido:', status);
      callbacks.onCurrentStatus?.(status);
    });

    // Evento: QR Code gerado
    this.socket.on('qr-generated', (data: { empresaId: number; qr: string; message: string; timestamp: string }) => {
      console.log('[WhatsApp Service] QR Code gerado:', data.message);
      callbacks.onQRGenerated?.({ qr: data.qr, message: data.message });
    });

    // Evento: Conexão estabelecida
    this.socket.on('connection-success', (data: { empresaId: number; connected: boolean; numero: string; message: string; timestamp: string }) => {
      console.log('[WhatsApp Service] Conexão estabelecida:', data.message);
      callbacks.onConnectionSuccess?.({ connected: data.connected, numero: data.numero, message: data.message });
    });

    // Evento: Conexão perdida
    this.socket.on('connection-lost', (data: { empresaId: number; connected: boolean; message: string; timestamp: string }) => {
      console.log('[WhatsApp Service] Conexão perdida:', data.message);
      callbacks.onConnectionLost?.({ connected: data.connected, message: data.message });
    });

    // Evento: Desconectado do servidor
    this.socket.on('disconnect', (reason) => {
      console.warn('[WhatsApp Service] Socket desconectado:', reason);
    });

    // Evento: Erro
    this.socket.on('error', (error) => {
      console.error('[WhatsApp Service] Socket erro:', error);
    });
  }

  /**
   * Desconectar Socket.io
   */
  disconnectSocket(): void {
    if (this.socket) {
      console.log('[WhatsApp Service] Desconectando Socket.io...');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Gerar QR Code para conexão WhatsApp
   */
  async generateQRCode(empresaId: number): Promise<{ success: boolean; qr: string | null; message: string }> {
    try {
      const response = await this.api.post('/api/session/start', { empresaId });
      return response.data;
    } catch (error: any) {
      console.error('[WhatsApp Service] Erro ao gerar QR Code:', error);
      return {
        success: false,
        qr: null,
        message: error.response?.data?.error || 'Erro ao gerar QR Code'
      };
    }
  }

  /**
   * Obter status da conexão WhatsApp
   */
  async getConnectionStatus(empresaId: number): Promise<WhatsAppStatus | null> {
    try {
      const response = await this.api.get(`/api/session/status/${empresaId}`);
      return {
        empresaId,
        connected: response.data.connected,
        qr: response.data.qr,
        numero: response.data.numero,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('[WhatsApp Service] Erro ao obter status:', error);
      return null;
    }
  }

  /**
   * Desconectar WhatsApp (logout)
   */
  async disconnect(empresaId: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.api.post('/api/session/disconnect', { empresaId });
      return {
        success: response.data.success,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('[WhatsApp Service] Erro ao desconectar:', error);
      return {
        success: false,
        message: error.response?.data?.error || 'Erro ao desconectar'
      };
    }
  }

  /**
   * Limpar sessão e forçar novo QR Code
   */
  async clearSession(empresaId: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.api.post('/api/session/clear', { empresaId });
      return {
        success: response.data.success,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('[WhatsApp Service] Erro ao limpar sessão:', error);
      return {
        success: false,
        message: error.response?.data?.error || 'Erro ao limpar sessão'
      };
    }
  }

  /**
   * Verificar se o serviço WhatsApp está online
   */
  async healthCheck(): Promise<{ status: string; activeSessions: number; uptime: number } | null> {
    try {
      const response = await this.api.get('/health');
      return response.data;
    } catch (error) {
      console.error('[WhatsApp Service] Health check falhou:', error);
      return null;
    }
  }

  /**
   * Ativar/Desativar o bot
   */
  async toggleBot(ativar: boolean, empresaId: number = 1): Promise<{ success: boolean; message: string; bot_ativo?: boolean }> {
    try {
      const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      console.log(`[WhatsApp Service] Chamando ${BACKEND_URL}/whatsapp/api/ativar-bot-public`);

      const response = await axios.post(`${BACKEND_URL}/whatsapp/api/ativar-bot-public`, {
        ativar,
        empresa_id: empresaId
      });
      return {
        success: response.data.success,
        message: response.data.message,
        bot_ativo: response.data.bot_ativo
      };
    } catch (error: any) {
      console.error('[WhatsApp Service] Erro ao ativar/desativar bot:', error);
      return {
        success: false,
        message: error.response?.data?.error || error.message || 'Erro ao ativar/desativar bot'
      };
    }
  }

  /**
   * Obter status do bot e conexão WhatsApp do backend Flask
   */
  async getStatus(empresaId: number = 1): Promise<{ success: boolean; status?: any; error?: string }> {
    try {
      const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      const response = await axios.get(`${BACKEND_URL}/whatsapp/api/status-public`, {
        params: { empresa_id: empresaId }
      });
      return {
        success: response.data.success,
        status: response.data.status
      };
    } catch (error: any) {
      console.error('[WhatsApp Service] Erro ao obter status:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Erro ao obter status'
      };
    }
  }
}

// Export singleton instance
export const whatsappService = new WhatsAppService();
export default whatsappService;
