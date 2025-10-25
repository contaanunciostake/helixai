import { useState, useEffect } from 'react'
import {
  TrendingUp, Users, Building2, DollarSign, Activity,
  AlertCircle, CheckCircle, XCircle, Clock, Zap,
  MessageSquare, Database, CreditCard, ArrowUpRight,
  ArrowDownRight, BarChart3
} from 'lucide-react'

export function AdminDashboard() {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState('30') // dias

  useEffect(() => {
    carregarMetricas()
  }, [periodo])

  const carregarMetricas = async () => {
    try {
      setLoading(true)

      const res = await fetch(`http://localhost:5000/api/admin/dashboard/metrics`, {
        credentials: 'include'
      })

      const data = await res.json()

      if (data.success) {
        setMetrics(data.data)
      } else {
        console.error('[ERRO] API retornou erro:', data.error)
      }

    } catch (error) {
      console.error('[ERRO] Ao carregar métricas:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header com Filtros */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Visão Geral do Sistema</h2>
          <p className="text-gray-400">Métricas e indicadores principais</p>
        </div>

        <select
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50"
        >
          <option value="7">Últimos 7 dias</option>
          <option value="30">Últimos 30 dias</option>
          <option value="90">Últimos 90 dias</option>
          <option value="365">Último ano</option>
        </select>
      </div>

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* MRR - Monthly Recurring Revenue */}
        <div className="rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-green-500/20">
              <DollarSign className="h-6 w-6 text-green-400" />
            </div>
            <div className="flex items-center gap-1 text-green-400 text-sm">
              <ArrowUpRight className="h-4 w-4" />
              <span>+{metrics?.variacao_mrr || 0}%</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1">
            R$ {metrics?.mrr?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
          </p>
          <p className="text-sm text-gray-400">MRR (Receita Recorrente)</p>
        </div>

        {/* Total de Empresas */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-blue-500/20">
              <Building2 className="h-6 w-6 text-blue-400" />
            </div>
            <div className="flex items-center gap-1 text-blue-400 text-sm">
              <ArrowUpRight className="h-4 w-4" />
              <span>+{(metrics?.empresas_ativas || 0) - (metrics?.empresas_inadimplentes || 0)}</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{metrics?.empresas_ativas || 0}</p>
          <p className="text-sm text-gray-400">Empresas Ativas</p>
        </div>

        {/* Total de Usuários */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-purple-500/20">
              <Users className="h-6 w-6 text-purple-400" />
            </div>
            <div className="flex items-center gap-1 text-purple-400 text-sm">
              <ArrowUpRight className="h-4 w-4" />
              <span>+{metrics?.usuarios_novos_mes || 0}</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{metrics?.total_usuarios?.toLocaleString('pt-BR') || 0}</p>
          <p className="text-sm text-gray-400">Usuários Ativos</p>
        </div>

        {/* Bots Ativos */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-cyan-500/20">
              <MessageSquare className="h-6 w-6 text-cyan-400" />
            </div>
            <div className="flex items-center gap-1 text-cyan-400 text-sm">
              <Zap className="h-4 w-4" />
              <span>{metrics?.uptime_bots || 0}%</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{metrics?.bots_ativos || 0}</p>
          <p className="text-sm text-gray-400">Bots WhatsApp Ativos</p>
        </div>
      </div>

      {/* Segunda Linha de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Conversas Hoje */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-indigo-500/20">
              <Activity className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{metrics?.conversas_hoje?.toLocaleString('pt-BR') || 0}</p>
              <p className="text-xs text-gray-400">Conversas Hoje</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Média: {Math.round((metrics?.conversas_hoje || 0) * 0.9)}/dia</span>
            <span className="text-green-400 flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" />
              +18%
            </span>
          </div>
        </div>

        {/* Mensagens Processadas */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-pink-500/20">
              <MessageSquare className="h-5 w-5 text-pink-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {((metrics?.mensagens_mes || 0) / 1000).toFixed(1)}k
              </p>
              <p className="text-xs text-gray-400">Mensagens/Mês</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Custo IA: R$ {(((metrics?.mensagens_mes || 0) * 0.08)).toFixed(0)}</span>
            <span className="text-gray-400">R$ 0,08/msg</span>
          </div>
        </div>

        {/* Taxa de Conversão Global */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-yellow-500/20">
              <TrendingUp className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{metrics?.taxa_conversao || 0}%</p>
              <p className="text-xs text-gray-400">Taxa de Conversão</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Média do setor: 8.5%</span>
            <span className={`flex items-center gap-1 ${(metrics?.taxa_conversao || 0) > 8.5 ? 'text-green-400' : 'text-red-400'}`}>
              {(metrics?.taxa_conversao || 0) > 8.5 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {((metrics?.taxa_conversao || 0) - 8.5).toFixed(1)}pp
            </span>
          </div>
        </div>
      </div>

      {/* Gráficos e Tabelas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status das Empresas */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-purple-400" />
            Status das Empresas
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Ativas</p>
                  <p className="text-xs text-gray-400">Assinatura em dia</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-green-400">{metrics?.empresas_ativas || 0}</p>
                <p className="text-xs text-gray-400">
                  {metrics?.total_empresas ? Math.round((metrics.empresas_ativas / metrics.total_empresas) * 100) : 0}%
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/20">
                  <Clock className="h-4 w-4 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Trial</p>
                  <p className="text-xs text-gray-400">Período de teste</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-yellow-400">{metrics?.empresas_trial || 0}</p>
                <p className="text-xs text-gray-400">
                  {metrics?.total_empresas ? Math.round((metrics.empresas_trial / metrics.total_empresas) * 100) : 0}%
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/20">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Vencidas</p>
                  <p className="text-xs text-gray-400">Pagamento atrasado</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-red-400">{metrics?.empresas_inadimplentes || 0}</p>
                <p className="text-xs text-gray-400">
                  {metrics?.total_empresas ? Math.round((metrics.empresas_inadimplentes / metrics.total_empresas) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Distribuição por Plano */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-purple-400" />
            Distribuição por Plano
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Enterprise (R$ 497)</span>
                <span className="text-sm font-bold text-white">42 empresas</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2">
                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 h-2 rounded-full" style={{ width: '17%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Profissional (R$ 197)</span>
                <span className="text-sm font-bold text-white">98 empresas</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-600 h-2 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Básico (R$ 97)</span>
                <span className="text-sm font-bold text-white">107 empresas</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full" style={{ width: '43%' }}></div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">MRR Total</span>
              <span className="text-xl font-bold text-green-400">R$ 142.450/mês</span>
            </div>
          </div>
        </div>
      </div>

      {/* Últimas Atividades */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-400" />
            Últimas Atividades
          </h3>
          <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
            Ver Todas
          </button>
        </div>

        <div className="space-y-3">
          {[
            { tipo: 'new_company', empresa: 'AutoShow Premium', tempo: '2 minutos atrás', icon: Building2, color: 'green' },
            { tipo: 'payment', empresa: 'Imobiliária Prime', tempo: '15 minutos atrás', icon: DollarSign, color: 'blue' },
            { tipo: 'bot_activated', empresa: 'MegaVeículos', tempo: '1 hora atrás', icon: MessageSquare, color: 'purple' },
            { tipo: 'churn', empresa: 'Vendas Fast', tempo: '2 horas atrás', icon: AlertCircle, color: 'red' },
            { tipo: 'upgrade', empresa: 'Carros & Cia', tempo: '3 horas atrás', icon: TrendingUp, color: 'yellow' },
          ].map((atividade, idx) => {
            const Icon = atividade.icon
            return (
              <div key={idx} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                <div className={`p-2 rounded-lg bg-${atividade.color}-500/20`}>
                  <Icon className={`h-4 w-4 text-${atividade.color}-400`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{atividade.empresa}</p>
                  <p className="text-xs text-gray-400">{atividade.tempo}</p>
                </div>
                <div className={`text-xs px-2 py-1 rounded bg-${atividade.color}-500/20 text-${atividade.color}-400`}>
                  {atividade.tipo}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Alertas e Ações Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertas */}
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-400" />
            Alertas e Avisos
          </h3>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 rounded-full bg-red-400 mt-2"></div>
              <div>
                <p className="text-sm font-medium text-white">14 empresas com pagamento vencido</p>
                <p className="text-xs text-gray-400">Requer ação imediata</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 rounded-full bg-yellow-400 mt-2"></div>
              <div>
                <p className="text-sm font-medium text-white">8 trials terminando em 3 dias</p>
                <p className="text-xs text-gray-400">Oportunidade de conversão</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 rounded-full bg-orange-400 mt-2"></div>
              <div>
                <p className="text-sm font-medium text-white">3 bots com erro de conexão</p>
                <p className="text-xs text-gray-400">Verificar WhatsApp</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-6">
          <h3 className="text-lg font-bold text-white mb-4">Ações Rápidas</h3>

          <div className="grid grid-cols-2 gap-3">
            <button className="p-4 rounded-lg bg-purple-500/20 border border-purple-500/30 hover:bg-purple-500/30 transition-colors text-left group">
              <Building2 className="h-5 w-5 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium text-white">Nova Empresa</p>
            </button>

            <button className="p-4 rounded-lg bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 transition-colors text-left group">
              <Users className="h-5 w-5 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium text-white">Novo Usuário</p>
            </button>

            <button className="p-4 rounded-lg bg-green-500/20 border border-green-500/30 hover:bg-green-500/30 transition-colors text-left group">
              <BarChart3 className="h-5 w-5 text-green-400 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium text-white">Relatório</p>
            </button>

            <button className="p-4 rounded-lg bg-cyan-500/20 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors text-left group">
              <Database className="h-5 w-5 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium text-white">Backup</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
