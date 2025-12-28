/**
 * Admin API Service
 * Servico para comunicacao com o backend Admin
 */

const API_BASE_URL = 'http://localhost:5000/api/admin';

class AdminApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      ...options,
      credentials: 'include',
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
      console.error(`[AdminAPI] Erro em ${endpoint}:`, error);
      throw error;
    }
  }

  // ==================== DASHBOARD ====================

  async getDashboardMetrics(dias = 30) {
    return this.request(`/dashboard/metrics?dias=${dias}`);
  }

  async getRecentActivity(limit = 20) {
    return this.request(`/dashboard/recent-activity?limit=${limit}`);
  }

  // ==================== ANALYTICS ====================

  async getAnalyticsOverview(dias = 30) {
    return this.request(`/analytics/overview?dias=${dias}`);
  }

  // ==================== EMPRESAS ====================

  async getEmpresas(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/empresas?${query}`);
  }

  async getEmpresa(id) {
    return this.request(`/empresas/${id}`);
  }

  async createEmpresa(data) {
    return this.request('/empresas', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEmpresa(id, data) {
    return this.request(`/empresas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteEmpresa(id) {
    return this.request(`/empresas/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== USUARIOS ====================

  async getUsuarios(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/usuarios?${query}`);
  }

  async createUsuario(data) {
    return this.request('/usuarios', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUsuario(id, data) {
    return this.request(`/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUsuario(id) {
    return this.request(`/usuarios/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== AFILIADOS ====================

  async getAfiliados(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/afiliados?${query}`);
  }

  async aprovarAfiliado(id) {
    return this.request(`/afiliados/${id}/aprovar`, {
      method: 'POST',
    });
  }

  // ==================== ASSINATURAS ====================

  async getAssinaturas(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/assinaturas?${query}`);
  }

  // ==================== PAGAMENTOS ====================

  async getPagamentos(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/pagamentos?${query}`);
  }

  // ==================== COMISSOES ====================

  async getComissoes(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/comissoes?${query}`);
  }

  async aprovarComissao(id) {
    return this.request(`/comissoes/${id}/aprovar`, {
      method: 'POST',
    });
  }

  // ==================== BOTS ====================

  async getBots() {
    return this.request('/bots');
  }

  async toggleBot(empresaId) {
    return this.request(`/bots/${empresaId}/toggle`, {
      method: 'POST',
    });
  }

  // ==================== LOGS ====================

  async getLogs(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/logs?${query}`);
  }

  // ==================== DATABASE ====================

  async getDatabaseStats() {
    return this.request('/database/stats');
  }

  // ==================== CONFIGURACOES ====================

  async getConfiguracoes() {
    return this.request('/configuracoes');
  }

  async updateConfiguracoes(data) {
    return this.request('/configuracoes', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}

export const adminApi = new AdminApiService();
export default adminApi;
