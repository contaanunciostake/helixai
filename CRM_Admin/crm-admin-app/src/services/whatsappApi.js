/**
 * WhatsApp Bot API Service
 * Servico para comunicacao com o Bot API Server (porta 3010)
 */

const BOT_API_URL = 'http://localhost:3010';
const WS_URL = 'ws://localhost:3010/ws';

class WhatsAppApiService {
  constructor() {
    this.baseUrl = BOT_API_URL;
    this.wsUrl = WS_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro na requisicao');
      }

      return data;
    } catch (error) {
      console.error(`[WhatsAppAPI] Erro em ${endpoint}:`, error);
      throw error;
    }
  }

  // ==================== HEALTH ====================

  async healthCheck() {
    return this.request('/health');
  }

  // ==================== STATUS ====================

  async getStatus(empresaId) {
    return this.request(`/api/bot/status/${empresaId}`);
  }

  // ==================== CONEXAO ====================

  async connect(empresaId) {
    return this.request(`/api/bot/connect/${empresaId}`, {
      method: 'POST',
    });
  }

  async disconnect(empresaId, keepAuth = true) {
    return this.request(`/api/bot/disconnect/${empresaId}`, {
      method: 'POST',
      body: JSON.stringify({ keepAuth }),
    });
  }

  // ==================== SESSOES ====================

  async getAllSessions() {
    return this.request('/api/bot/sessions');
  }

  // ==================== NICHO ====================

  async getNicho(empresaId) {
    return this.request(`/api/bot/nicho/${empresaId}`);
  }

  // ==================== MENSAGENS ====================

  async sendMessage(empresaId, telefone, mensagem) {
    return this.request('/api/bot/send-message', {
      method: 'POST',
      body: JSON.stringify({ empresaId, telefone, mensagem }),
    });
  }

  // ==================== CACHE ====================

  async clearCache(empresaId) {
    return this.request(`/api/bot/clear-cache/${empresaId}`, {
      method: 'POST',
    });
  }

  // ==================== WEBSOCKET ====================

  createWebSocket(empresaId) {
    const url = `${this.wsUrl}?empresa_id=${empresaId}`;
    return new WebSocket(url);
  }
}

export const whatsappApi = new WhatsAppApiService();
export default whatsappApi;
