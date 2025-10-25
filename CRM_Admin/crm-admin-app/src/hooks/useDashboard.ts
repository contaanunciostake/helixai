/**
 * Dashboard React Query Hooks
 * Hooks customizados para gerenciar estado e cache dos dados do dashboard
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';
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

// ==================== Query Keys ====================
export const dashboardKeys = {
  all: ['dashboard'] as const,
  metrics: (params?: DashboardParams) => ['dashboard', 'metrics', params] as const,
  charts: (params?: ChartsParams) => ['dashboard', 'charts', params] as const,
  topProducts: (params?: TopProductsParams) => ['dashboard', 'top-products', params] as const,
  transactions: (params?: TransactionsParams) => ['dashboard', 'transactions', params] as const,
  summary: () => ['dashboard', 'summary'] as const,
};

// ==================== Hook: Dashboard Metrics ====================
export function useDashboardMetrics(
  params?: DashboardParams,
  options?: Omit<UseQueryOptions<DashboardMetrics>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: dashboardKeys.metrics(params),
    queryFn: () => dashboardService.getMetrics(params),
    staleTime: 1000 * 60 * 2, // 2 minutos
    refetchOnWindowFocus: false,
    ...options,
  });
}

// ==================== Hook: Charts Data ====================
export function useDashboardCharts(
  params?: ChartsParams,
  options?: Omit<UseQueryOptions<ChartsData>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: dashboardKeys.charts(params),
    queryFn: () => dashboardService.getCharts(params),
    staleTime: 1000 * 60 * 2, // 2 minutos
    refetchOnWindowFocus: false,
    ...options,
  });
}

// ==================== Hook: Top Products ====================
export function useTopProducts(
  params?: TopProductsParams,
  options?: Omit<UseQueryOptions<TopProductsData>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: dashboardKeys.topProducts(params),
    queryFn: () => dashboardService.getTopProducts(params),
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
    ...options,
  });
}

// ==================== Hook: Transactions ====================
export function useTransactions(
  params?: TransactionsParams,
  options?: Omit<UseQueryOptions<TransactionsData>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: dashboardKeys.transactions(params),
    queryFn: () => dashboardService.getTransactions(params),
    staleTime: 1000 * 60 * 1, // 1 minuto
    refetchOnWindowFocus: false,
    ...options,
  });
}

// ==================== Hook: Dashboard Summary ====================
export function useDashboardSummary(
  options?: Omit<UseQueryOptions<DashboardSummary>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: dashboardKeys.summary(),
    queryFn: () => dashboardService.getSummary(),
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
    ...options,
  });
}

// ==================== Hook: Export Data (Mutation) ====================
export function useExportData() {
  return useMutation({
    mutationFn: async (params: ExportParams) => {
      const blob = await dashboardService.exportData(params);
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `dashboard_${params.dados}_${timestamp}.${params.tipo}`;
      dashboardService.downloadExport(blob, filename);
      return { success: true, filename };
    },
    onSuccess: (data) => {
      console.log(`[Export] Arquivo ${data.filename} baixado com sucesso`);
    },
    onError: (error: any) => {
      console.error('[Export] Erro ao exportar:', error);
    },
  });
}

// ==================== Hook: Refresh All Data ====================
export function useRefreshDashboard() {
  const queryClient = useQueryClient();

  const refreshAll = () => {
    console.log('[Dashboard] Atualizando todos os dados...');
    queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
  };

  const refreshMetrics = () => {
    queryClient.invalidateQueries({ queryKey: ['dashboard', 'metrics'] });
  };

  const refreshCharts = () => {
    queryClient.invalidateQueries({ queryKey: ['dashboard', 'charts'] });
  };

  const refreshProducts = () => {
    queryClient.invalidateQueries({ queryKey: ['dashboard', 'top-products'] });
  };

  const refreshTransactions = () => {
    queryClient.invalidateQueries({ queryKey: ['dashboard', 'transactions'] });
  };

  return {
    refreshAll,
    refreshMetrics,
    refreshCharts,
    refreshProducts,
    refreshTransactions,
  };
}

// ==================== Hook: Combined Dashboard Data ====================
/**
 * Hook que combina todos os dados do dashboard em uma única chamada
 * Útil para carregar a página completa de uma vez
 */
export function useDashboardData(periodo: number = 30) {
  const metrics = useDashboardMetrics({ periodo });
  const charts = useDashboardCharts({ periodo, tipos: 'revenue,customers,visitors' });
  const topProducts = useTopProducts({ limit: 10, periodo });
  const transactions = useTransactions({ page: 1, limit: 10 });
  const summary = useDashboardSummary();

  const isLoading =
    metrics.isLoading ||
    charts.isLoading ||
    topProducts.isLoading ||
    transactions.isLoading ||
    summary.isLoading;

  const isError =
    metrics.isError ||
    charts.isError ||
    topProducts.isError ||
    transactions.isError ||
    summary.isError;

  const error =
    metrics.error ||
    charts.error ||
    topProducts.error ||
    transactions.error ||
    summary.error;

  return {
    metrics: metrics.data,
    charts: charts.data,
    topProducts: topProducts.data,
    transactions: transactions.data,
    summary: summary.data,
    isLoading,
    isError,
    error,
    refetch: () => {
      metrics.refetch();
      charts.refetch();
      topProducts.refetch();
      transactions.refetch();
      summary.refetch();
    },
  };
}
