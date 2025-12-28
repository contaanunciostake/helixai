/**
 * ═══════════════════════════════════════════════════════════════
 * REACT QUERY CONFIGURATION
 * Setup do React Query para state management assíncrono
 * ═══════════════════════════════════════════════════════════════
 */

import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      cacheTime: 1000 * 60 * 10, // 10 minutos
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
      // Optimistic updates por padrão
      refetchInterval: false,
      // Error handling global
      onError: (error) => {
        console.error('Query Error:', error)
      },
    },
    mutations: {
      retry: 1,
      onError: (error) => {
        console.error('Mutation Error:', error)
      },
    },
  },
})

// Query Keys - Padronização de chaves para cache
export const queryKeys = {
  // Auth
  auth: {
    user: ['auth', 'user'],
    session: ['auth', 'session'],
  },

  // Dashboard
  dashboard: {
    stats: (empresaId) => ['dashboard', 'stats', empresaId],
    metrics: (empresaId, period) => ['dashboard', 'metrics', empresaId, period],
  },

  // Mensagens
  messages: {
    all: (empresaId) => ['messages', empresaId],
    detail: (id) => ['messages', 'detail', id],
    templates: ['messages', 'templates'],
  },

  // Bot
  bot: {
    config: (empresaId) => ['bot', 'config', empresaId],
    personality: (empresaId) => ['bot', 'personality', empresaId],
    behavior: (empresaId) => ['bot', 'behavior', empresaId],
    schedule: (empresaId) => ['bot', 'schedule', empresaId],
  },

  // Conversas
  conversations: {
    all: (empresaId, filters) => ['conversations', empresaId, filters],
    detail: (id) => ['conversations', 'detail', id],
    active: (empresaId) => ['conversations', 'active', empresaId],
  },

  // Produtos/Veículos
  products: {
    all: (empresaId, filters) => ['products', empresaId, filters],
    detail: (id) => ['products', 'detail', id],
    categories: ['products', 'categories'],
  },

  // Negócios
  business: {
    financiamento: (empresaId) => ['business', 'financiamento', empresaId],
    descontos: (empresaId) => ['business', 'descontos', empresaId],
    promocoes: (empresaId) => ['business', 'promocoes', empresaId],
  },

  // Base de Conhecimento
  knowledge: {
    all: (empresaId) => ['knowledge', empresaId],
    categories: (empresaId) => ['knowledge', 'categories', empresaId],
    detail: (id) => ['knowledge', 'detail', id],
    search: (query) => ['knowledge', 'search', query],
  },

  // Integrações
  integrations: {
    all: (empresaId) => ['integrations', empresaId],
    detail: (type) => ['integrations', 'detail', type],
    logs: (empresaId, type) => ['integrations', 'logs', empresaId, type],
  },

  // Relatórios
  reports: {
    leads: (empresaId, period) => ['reports', 'leads', empresaId, period],
    conversions: (empresaId, period) => ['reports', 'conversions', empresaId, period],
    performance: (empresaId, period) => ['reports', 'performance', empresaId, period],
  },

  // Equipe
  team: {
    all: (empresaId) => ['team', empresaId],
    detail: (id) => ['team', 'detail', id],
    permissions: (id) => ['team', 'permissions', id],
    performance: (id, period) => ['team', 'performance', id, period],
  },
}
