/**
 * Dashboard Types
 * TypeScript interfaces para o Dashboard Dashtrans
 */

// ==================== Período ====================
export interface Periodo {
  dias: number;
  inicio: string;
  fim: string;
}

// ==================== Métricas Principais ====================
export interface MetricaData {
  valor?: number;
  total?: number;
  taxa?: number;
  variacao: number;
  comparacao_periodo_anterior: string;
  valor_anterior?: number;
  total_anterior?: number;
  taxa_anterior?: number;
  status?: 'improved' | 'worsened' | 'stable';
}

export interface DashboardMetrics {
  periodo: Periodo;
  metricas: {
    revenue: MetricaData;
    customers: MetricaData;
    visitors: MetricaData;
    bounce_rate: MetricaData;
  };
}

// ==================== Dados de Gráficos ====================
export interface ChartDataPoint {
  date: string;
  value: number;
}

export interface ChartsData {
  revenue_chart?: ChartDataPoint[];
  customers_chart?: ChartDataPoint[];
  visitors_chart?: ChartDataPoint[];
}

// ==================== Top Produtos ====================
export interface TopProduct {
  id?: number;
  name: string;
  sales: number;
  revenue: number;
  percentage: number;
}

export interface TopProductsData {
  products: TopProduct[];
  total_revenue: number;
  periodo_dias: number;
}

// ==================== Transações ====================
export interface Transaction {
  order_id: string;
  date: string;
  customer_name: string;
  customer_phone: string;
  payment_status: string;
  total: number;
  payment_method: string;
  status: string;
  product_name?: string;
}

export interface Pagination {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface TransactionsData {
  transactions: Transaction[];
  pagination: Pagination;
}

// ==================== Resumo ====================
export interface DashboardSummary {
  total_leads: number;
  leads_quentes: number;
  conversas_ativas: number;
  total_convertidos: number;
  taxa_conversao_geral: number;
}

// ==================== Parâmetros de Request ====================
export interface DashboardParams {
  periodo?: number;
}

export interface ChartsParams {
  periodo?: number;
  tipos?: string;
}

export interface TopProductsParams {
  limit?: number;
  periodo?: number;
}

export interface TransactionsParams {
  page?: number;
  limit?: number;
  status?: string;
  sort?: 'date_desc' | 'date_asc' | 'value_desc' | 'value_asc';
}

export interface ExportParams {
  tipo: 'csv' | 'pdf';
  dados: 'transactions' | 'products' | 'analytics';
  filtros?: Record<string, any>;
}

// ==================== Tipos de Métricas ====================
export type MetricType = 'revenue' | 'customers' | 'visitors' | 'bounce_rate';

export interface MetricConfig {
  type: MetricType;
  label: string;
  icon: string;
  formatValue: (value: number) => string;
  description: string;
}
