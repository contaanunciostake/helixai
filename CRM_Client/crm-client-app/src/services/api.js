/**
 * ═══════════════════════════════════════════════════════════════
 * API SERVICE
 * Camada de comunicação com o backend
 * ═══════════════════════════════════════════════════════════════
 */

import axios from 'axios'

// Base URLs
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const BOT_API_URL = import.meta.env.VITE_BOT_API_URL || 'http://localhost:3010'

// Criar instância do axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Adicionar token se existir
    const user = localStorage.getItem('crm_user')
    if (user) {
      try {
        const userData = JSON.parse(user)
        if (userData.token) {
          config.headers.Authorization = `Bearer ${userData.token}`
        }
        // Adicionar empresa_id se disponível
        if (userData.empresa_id && !config.params?.empresa_id) {
          config.params = {
            ...config.params,
            empresa_id: userData.empresa_id,
          }
        }
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Handle global errors
    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 401:
          // Unauthorized - limpar dados e redirecionar para login
          localStorage.removeItem('crm_user')
          localStorage.removeItem('crm_isLoggedIn')
          window.location.href = '/login'
          break

        case 403:
          console.error('Forbidden - Sem permissão')
          break

        case 404:
          console.error('Resource not found')
          break

        case 500:
          console.error('Server error')
          break

        default:
          console.error('API Error:', error)
      }

      return Promise.reject(data?.error || data?.message || error.message)
    }

    if (error.request) {
      console.error('Network error:', error.request)
      return Promise.reject('Erro de conexão com o servidor')
    }

    return Promise.reject(error.message)
  }
)

// ═══════════════════════════════════════════════════════════
// API METHODS
// ═══════════════════════════════════════════════════════════

export const apiService = {
  // Auth
  auth: {
    login: (credentials) => api.post('/api/auth/login', credentials),
    logout: () => api.post('/api/auth/logout'),
    register: (data) => api.post('/api/auth/register', data),
    checkSession: () => api.get('/api/auth/session'),
  },

  // Dashboard
  dashboard: {
    getStats: (empresaId) => api.get('/api/dashboard/stats', { params: { empresa_id: empresaId } }),
    getMetrics: (empresaId, period) => api.get('/api/dashboard/metrics', { params: { empresa_id: empresaId, period } }),
  },

  // Mensagens
  messages: {
    getAll: (empresaId) => api.get('/api/messages', { params: { empresa_id: empresaId } }),
    getById: (id) => api.get(`/api/messages/${id}`),
    create: (data) => api.post('/api/messages', data),
    update: (id, data) => api.put(`/api/messages/${id}`, data),
    delete: (id) => api.delete(`/api/messages/${id}`),
    getTemplates: () => api.get('/api/messages/templates'),
    testMessage: (data) => api.post('/api/messages/test', data),
  },

  // Bot Configuration
  bot: {
    getConfig: (empresaId) => api.get(`/api/bot/config/${empresaId}`),
    updateConfig: (empresaId, data) => api.put(`/api/bot/config/${empresaId}`, data),
    getPersonality: (empresaId) => api.get(`/api/bot/personality/${empresaId}`),
    updatePersonality: (empresaId, data) => api.put(`/api/bot/personality/${empresaId}`, data),
    getBehavior: (empresaId) => api.get(`/api/bot/behavior/${empresaId}`),
    updateBehavior: (empresaId, data) => api.put(`/api/bot/behavior/${empresaId}`, data),
    getSchedule: (empresaId) => api.get(`/api/bot/schedule/${empresaId}`),
    updateSchedule: (empresaId, data) => api.put(`/api/bot/schedule/${empresaId}`, data),
  },

  // Conversas
  conversations: {
    getAll: (empresaId, filters) => api.get('/api/conversations', { params: { empresa_id: empresaId, ...filters } }),
    getById: (id) => api.get(`/api/conversations/${id}`),
    getActive: (empresaId) => api.get('/api/conversations/active', { params: { empresa_id: empresaId } }),
    assumeConversation: (id) => api.post(`/api/conversations/${id}/assume`),
    transferConversation: (id, vendedorId) => api.post(`/api/conversations/${id}/transfer`, { vendedor_id: vendedorId }),
    addNote: (id, note) => api.post(`/api/conversations/${id}/notes`, { note }),
    addTag: (id, tag) => api.post(`/api/conversations/${id}/tags`, { tag }),
    sendMessage: (id, message) => api.post(`/api/conversations/${id}/messages`, { message }),
  },

  // Produtos/Veículos
  products: {
    getAll: (empresaId, filters) => api.get('/api/products', { params: { empresa_id: empresaId, ...filters } }),
    getById: (id) => api.get(`/api/products/${id}`),
    create: (data) => api.post('/api/products', data),
    update: (id, data) => api.put(`/api/products/${id}`, data),
    delete: (id) => api.delete(`/api/products/${id}`),
    uploadImages: (id, formData) => api.post(`/api/products/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
    import: (formData) => api.post('/api/products/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  },

  // Negócios
  business: {
    getFinanciamento: (empresaId) => api.get('/api/business/financiamento', { params: { empresa_id: empresaId } }),
    updateFinanciamento: (empresaId, data) => api.put('/api/business/financiamento', data, { params: { empresa_id: empresaId } }),
    getDescontos: (empresaId) => api.get('/api/business/descontos', { params: { empresa_id: empresaId } }),
    updateDescontos: (empresaId, data) => api.put('/api/business/descontos', data, { params: { empresa_id: empresaId } }),
    getPromocoes: (empresaId) => api.get('/api/business/promocoes', { params: { empresa_id: empresaId } }),
    createPromocao: (data) => api.post('/api/business/promocoes', data),
    updatePromocao: (id, data) => api.put(`/api/business/promocoes/${id}`, data),
    deletePromocao: (id) => api.delete(`/api/business/promocoes/${id}`),
  },

  // Base de Conhecimento
  knowledge: {
    getAll: (empresaId) => api.get('/api/knowledge', { params: { empresa_id: empresaId } }),
    getById: (id) => api.get(`/api/knowledge/${id}`),
    getCategories: (empresaId) => api.get('/api/knowledge/categories', { params: { empresa_id: empresaId } }),
    create: (data) => api.post('/api/knowledge', data),
    update: (id, data) => api.put(`/api/knowledge/${id}`, data),
    delete: (id) => api.delete(`/api/knowledge/${id}`),
    search: (query, empresaId) => api.get('/api/knowledge/search', { params: { q: query, empresa_id: empresaId } }),
  },

  // Integrações
  integrations: {
    getAll: (empresaId) => api.get('/api/integrations', { params: { empresa_id: empresaId } }),
    getById: (type) => api.get(`/api/integrations/${type}`),
    connect: (type, credentials) => api.post(`/api/integrations/${type}/connect`, credentials),
    disconnect: (type) => api.post(`/api/integrations/${type}/disconnect`),
    testConnection: (type) => api.post(`/api/integrations/${type}/test`),
    getLogs: (empresaId, type) => api.get('/api/integrations/logs', { params: { empresa_id: empresaId, type } }),
    syncLeads: (type) => api.post(`/api/integrations/${type}/sync`),
  },

  // Relatórios
  reports: {
    getLeads: (empresaId, period) => api.get('/api/reports/leads', { params: { empresa_id: empresaId, period } }),
    getConversions: (empresaId, period) => api.get('/api/reports/conversions', { params: { empresa_id: empresaId, period } }),
    getPerformance: (empresaId, period) => api.get('/api/reports/performance', { params: { empresa_id: empresaId, period } }),
    export: (type, empresaId, period, format) => api.get('/api/reports/export', {
      params: { type, empresa_id: empresaId, period, format },
      responseType: 'blob',
    }),
  },

  // Equipe
  team: {
    getAll: (empresaId) => api.get('/api/team', { params: { empresa_id: empresaId } }),
    getById: (id) => api.get(`/api/team/${id}`),
    create: (data) => api.post('/api/team', data),
    update: (id, data) => api.put(`/api/team/${id}`, data),
    delete: (id) => api.delete(`/api/team/${id}`),
    updatePermissions: (id, permissions) => api.put(`/api/team/${id}/permissions`, permissions),
    getPerformance: (id, period) => api.get(`/api/team/${id}/performance`, { params: { period } }),
  },
}

export default api
