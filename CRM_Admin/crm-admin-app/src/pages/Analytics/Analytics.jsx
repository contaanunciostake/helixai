import { useState, useEffect } from 'react';
import {
  TrendingUp, Users, MessageSquare, Target, ArrowUpRight,
  ArrowDownRight, Calendar, RefreshCw, Download
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';

export function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState(30);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    carregarDados();
    const interval = setInterval(carregarDados, 30000); // Atualiza a cada 30s
    return () => clearInterval(interval);
  }, [periodo]);

  const carregarDados = async () => {
    try {
      setRefreshing(true);
      const response = await adminApi.getAnalyticsOverview(periodo);
      if (response.success) {
        setData(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Analytics</h2>
          <p className="text-gray-400">Analise detalhada do desempenho do sistema</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={carregarDados}
            disabled={refreshing}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          <select
            value={periodo}
            onChange={(e) => setPeriodo(Number(e.target.value))}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50"
          >
            <option value={7}>Ultimos 7 dias</option>
            <option value={30}>Ultimos 30 dias</option>
            <option value={90}>Ultimos 90 dias</option>
          </select>

          <button className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-400 hover:bg-purple-500/30 transition-all">
            <Download className="h-4 w-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Grafico de Linha - Dados Diarios */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-purple-400" />
          Evolucao Diaria
        </h3>

        <div className="h-64 flex items-end gap-1">
          {data?.dados_diarios?.slice(-30).map((dia, idx) => {
            const maxConversas = Math.max(...data.dados_diarios.map(d => d.conversas || 1));
            const altura = ((dia.conversas || 0) / maxConversas) * 100;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center group">
                <div
                  className="w-full bg-gradient-to-t from-purple-500 to-indigo-500 rounded-t transition-all hover:from-purple-400 hover:to-indigo-400"
                  style={{ height: `${Math.max(altura, 5)}%` }}
                  title={`${dia.data}: ${dia.conversas} conversas`}
                />
                {idx % 5 === 0 && (
                  <span className="text-xs text-gray-500 mt-2 transform -rotate-45">
                    {dia.data?.slice(5)}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gradient-to-r from-purple-500 to-indigo-500" />
            <span className="text-sm text-gray-400">Conversas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gradient-to-r from-green-500 to-emerald-500" />
            <span className="text-sm text-gray-400">Leads</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gradient-to-r from-blue-500 to-cyan-500" />
            <span className="text-sm text-gray-400">Mensagens</span>
          </div>
        </div>
      </div>

      {/* Grid de Metricas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Empresas */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-400" />
            Top 10 Empresas por Leads
          </h3>

          <div className="space-y-3">
            {data?.top_empresas?.map((empresa, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-sm font-bold text-purple-400 w-6">#{idx + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white">{empresa.nome}</span>
                    <span className="text-sm font-bold text-white">{empresa.total_leads}</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-indigo-500 h-1.5 rounded-full"
                      style={{
                        width: `${(empresa.total_leads / (data.top_empresas[0]?.total_leads || 1)) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}

            {(!data?.top_empresas || data.top_empresas.length === 0) && (
              <p className="text-gray-400 text-center py-4">Nenhuma empresa com leads ainda</p>
            )}
          </div>
        </div>

        {/* Distribuicao de Leads */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-400" />
            Distribuicao de Leads
          </h3>

          {/* Por Temperatura */}
          <div className="mb-6">
            <p className="text-sm text-gray-400 mb-3">Por Temperatura</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-center">
                <p className="text-2xl font-bold text-red-400">{data?.leads_temperatura?.quente || 0}</p>
                <p className="text-xs text-gray-400">Quentes</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-center">
                <p className="text-2xl font-bold text-yellow-400">{data?.leads_temperatura?.morno || 0}</p>
                <p className="text-xs text-gray-400">Mornos</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-center">
                <p className="text-2xl font-bold text-blue-400">{data?.leads_temperatura?.frio || 0}</p>
                <p className="text-xs text-gray-400">Frios</p>
              </div>
            </div>
          </div>

          {/* Por Status */}
          <div>
            <p className="text-sm text-gray-400 mb-3">Por Status</p>
            <div className="space-y-2">
              {data?.leads_status && Object.entries(data.leads_status).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                  <span className="text-sm text-gray-300 capitalize">{status.replace('_', ' ')}</span>
                  <span className="text-sm font-bold text-white">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Metricas Resumidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-center">
          <p className="text-3xl font-bold text-white">
            {data?.dados_diarios?.reduce((sum, d) => sum + (d.conversas || 0), 0) || 0}
          </p>
          <p className="text-sm text-gray-400">Total Conversas</p>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-center">
          <p className="text-3xl font-bold text-white">
            {data?.dados_diarios?.reduce((sum, d) => sum + (d.leads || 0), 0) || 0}
          </p>
          <p className="text-sm text-gray-400">Total Leads</p>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-center">
          <p className="text-3xl font-bold text-white">
            {((data?.dados_diarios?.reduce((sum, d) => sum + (d.mensagens || 0), 0) || 0) / 1000).toFixed(1)}k
          </p>
          <p className="text-sm text-gray-400">Total Mensagens</p>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-center">
          <p className="text-3xl font-bold text-white">
            {data?.dados_diarios?.length || 0}
          </p>
          <p className="text-sm text-gray-400">Dias Analisados</p>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
