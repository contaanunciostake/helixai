/**
 * Dashboard API Service
 * Serviço para comunicação com as APIs do backend
 */

import axios, { AxiosInstance } from 'axios';
import type {
  DashboardMetrics,
  ChartsData,
  TopProductsData,
  TransactionsData,
  DashboardSummary,
  DashboardParams,
  ChartsParams,
  TopProductsParams,
  TransactionsParams,
  ExportParams,
} from '../types/dashboard';

// Configuração base do Axios
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class DashboardService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Para enviar cookies de sessão
    });

    // Interceptor para log de requests (desenvolvimento)
    this.api.interceptors.request.use(
      (config) => {
        console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor para log de responses (desenvolvimento)
    this.api.interceptors.response.use(
      (response) => {
        console.log(`[API] Response ${response.status}:`, response.data);
        return response;
      },
      (error) => {
        console.error('[API] Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Busca métricas principais do dashboard
   */
  async getMetrics(params?: DashboardParams): Promise<DashboardMetrics> {
    const response = await this.api.get<DashboardMetrics>('/api/dashboard/metrics', {
      params,
    });
    return response.data;
  }

  /**
   * Busca dados para os gráficos
   */
  async getCharts(params?: ChartsParams): Promise<ChartsData> {
    const response = await this.api.get<ChartsData>('/api/dashboard/charts', {
      params,
    });
    return response.data;
  }

  /**
   * Busca top produtos mais vendidos
   */
  async getTopProducts(params?: TopProductsParams): Promise<TopProductsData> {
    const response = await this.api.get<TopProductsData>('/api/dashboard/top-products', {
      params,
    });
    return response.data;
  }

  /**
   * Busca histórico de transações com paginação
   */
  async getTransactions(params?: TransactionsParams): Promise<TransactionsData> {
    const response = await this.api.get<TransactionsData>('/api/dashboard/transactions', {
      params,
    });
    return response.data;
  }

  /**
   * Busca resumo geral do dashboard
   */
  async getSummary(): Promise<DashboardSummary> {
    const response = await this.api.get<DashboardSummary>('/api/dashboard/summary');
    return response.data;
  }

  /**
   * Exporta dados do dashboard
   */
  async exportData(params: ExportParams): Promise<Blob> {
    const response = await this.api.post<Blob>('/api/dashboard/export', params, {
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Baixa arquivo de exportação
   */
  downloadExport(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
}

// Instância singleton do serviço
export const dashboardService = new DashboardService();

// Funções auxiliares de formatação
export const formatters = {
  /**
   * Formata valor monetário (BRL)
   */
  currency: (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  },

  /**
   * Formata número com separadores de milhares
   */
  number: (value: number): string => {
    return new Intl.NumberFormat('pt-BR').format(value);
  },

  /**
   * Formata porcentagem
   */
  percentage: (value: number): string => {
    return `${value.toFixed(1)}%`;
  },

  /**
   * Formata data para exibição
   */
  date: (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  },

  /**
   * Formata data e hora
   */
  datetime: (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  },

  /**
   * Formata data curta (dia/mês)
   */
  shortDate: (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
    }).format(date);
  },

  /**
   * Compacta números grandes (1.2K, 1.5M, etc)
   */
  compactNumber: (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      notation: 'compact',
      compactDisplay: 'short',
    }).format(value);
  },
};

export default dashboardService;
