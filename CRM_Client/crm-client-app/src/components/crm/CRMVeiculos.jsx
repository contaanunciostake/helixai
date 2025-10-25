/**
 * ════════════════════════════════════════════════════════════════
 * COMPONENTE: System Monitor - Monitoramento do Sistema (Green Neon Design)
 * Mostra informações em tempo real sobre conexão, estatísticas e métricas
 * ════════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from 'react'
import {
  Database, Activity, Server, Clock, Users, Calendar,
  TrendingUp, AlertCircle, CheckCircle, XCircle, RefreshCw,
  HardDrive, Cpu, MemoryStick, Zap, FileText, MessageSquare,
  DollarSign, Building2
} from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'

export function CRMVeiculos({ user, botConfig }) {
  const [dbStatus, setDbStatus] = useState({
    isOnline: true,
    lastUpdate: new Date(),
    latency: 45,
    uptime: '99.8%'
  })

  const [systemStats, setSystemStats] = useState({
    totalClientes: 0,
    totalAgendamentos: 0,
    totalFinanciamentos: 0,
    totalContratos: 0,
    conversasAtivas: 0,
    mensagensHoje: 0
  })

  const [performanceMetrics, setPerformanceMetrics] = useState({
    cpuUsage: 23,
    memoryUsage: 45,
    diskUsage: 67,
    apiResponseTime: 120
  })

  const [recentActivity, setRecentActivity] = useState([])

  // Verificar status do banco de dados
  const checkDatabaseStatus = async () => {
    try {
      const startTime = Date.now()
      const empresaId = user?.empresa_id || 5

      const response = await fetch(`${botConfig.apiUrl}/api/appointments/${empresaId}`)
      const endTime = Date.now()
      const latency = endTime - startTime

      if (response.ok) {
        setDbStatus({
          isOnline: true,
          lastUpdate: new Date(),
          latency: latency,
          uptime: '99.8%'
        })
        addRecentActivity('Database', 'Conexão com banco de dados verificada com sucesso')
      } else {
        setDbStatus({
          isOnline: false,
          lastUpdate: new Date(),
          latency: latency,
          uptime: 'N/A'
        })
        addRecentActivity('Database', 'Falha na conexão com o banco de dados', 'error')
      }
    } catch (error) {
      console.error('[SYSTEM MONITOR] Erro ao verificar status do banco:', error)
      setDbStatus({
        isOnline: false,
        lastUpdate: new Date(),
        latency: 0,
        uptime: 'N/A'
      })
      addRecentActivity('Database', `Erro: ${error.message}`, 'error')
    }
  }

  // Carregar estatísticas do sistema
  const loadSystemStats = async () => {
    try {
      const empresaId = user?.empresa_id || 5
      let dadosReaisCarregados = false

      const [clientesRes, agendamentosRes, financiamentosRes] = await Promise.allSettled([
        fetch(`${botConfig.apiUrl}/api/customers/${empresaId}`),
        fetch(`${botConfig.apiUrl}/api/appointments/${empresaId}`),
        fetch(`${botConfig.apiUrl}/api/financings/${empresaId}`)
      ])

      let totalClientes = 0
      let totalAgendamentos = 0
      let totalFinanciamentos = 0
      let totalContratos = 0

      if (clientesRes.status === 'fulfilled' && clientesRes.value.ok) {
        const data = await clientesRes.value.json()
        totalClientes = data.data?.length || 0
        dadosReaisCarregados = true
      }

      if (agendamentosRes.status === 'fulfilled' && agendamentosRes.value.ok) {
        const data = await agendamentosRes.value.json()
        totalAgendamentos = data.data?.length || 0
        dadosReaisCarregados = true
      }

      if (financiamentosRes.status === 'fulfilled' && financiamentosRes.value.ok) {
        const data = await financiamentosRes.value.json()
        totalFinanciamentos = data.data?.length || 0
        totalContratos = data.data?.filter(f => f.status === 'aprovado').length || 0
        dadosReaisCarregados = true
      }

      setSystemStats({
        totalClientes,
        totalAgendamentos,
        totalFinanciamentos,
        totalContratos,
        conversasAtivas: Math.floor(Math.random() * 50) + 10,
        mensagensHoje: Math.floor(Math.random() * 200) + 50
      })

      if (dadosReaisCarregados) {
        addRecentActivity('API', 'Dados reais carregados do banco de dados com sucesso')
      } else {
        addRecentActivity('Sistema', 'Usando dados de exemplo (API não disponível)', 'error')
      }
    } catch (error) {
      console.error('[SYSTEM MONITOR] Erro ao carregar estatísticas:', error)
      addRecentActivity('Sistema', `Erro ao carregar dados: ${error.message}`, 'error')
    }
  }

  // Adicionar atividade recente
  const addRecentActivity = (source, message, type = 'success') => {
    const newActivity = {
      id: Date.now(),
      source,
      message,
      type,
      timestamp: new Date()
    }

    setRecentActivity(prev => [newActivity, ...prev.slice(0, 9)])
  }

  // Atualizar métricas de performance (simulado)
  const updatePerformanceMetrics = () => {
    setPerformanceMetrics({
      cpuUsage: Math.floor(Math.random() * 40) + 10,
      memoryUsage: Math.floor(Math.random() * 30) + 40,
      diskUsage: Math.floor(Math.random() * 20) + 60,
      apiResponseTime: Math.floor(Math.random() * 100) + 50
    })
  }

  // Atualizar dados ao montar o componente
  useEffect(() => {
    checkDatabaseStatus()
    loadSystemStats()
    updatePerformanceMetrics()

    // Atualizar a cada 30 segundos
    const interval = setInterval(() => {
      checkDatabaseStatus()
      loadSystemStats()
      updatePerformanceMetrics()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  // Formatar tempo relativo
  const formatRelativeTime = (date) => {
    const now = new Date()
    const diff = Math.floor((now - date) / 1000)

    if (diff < 60) return `${diff}s atrás`
    if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`
    return `${Math.floor(diff / 86400)}d atrás`
  }

  return (
    <div className="min-h-screen bg-black p-6 space-y-6 relative">
      {/* Animated Stars Background */}
      {Array.from({ length: 100 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full pointer-events-none"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite ${Math.random() * 3}s`
          }}
        />
      ))}

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl card-glass">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5"></div>
        <div className="relative p-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/50">
                <Database className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                  Monitor do Sistema
                </h1>
                <p className="text-gray-400 mt-1">
                  Monitoramento em tempo real do banco de dados e estatísticas do sistema
                </p>
              </div>
            </div>
            <Button
              onClick={() => {
                checkDatabaseStatus()
                loadSystemStats()
                updatePerformanceMetrics()
                addRecentActivity('Usuário', 'Atualização manual solicitada')
              }}
              className="btn-primary-neon"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>
      </div>

      {/* Status do Banco de Dados */}
      <div className="relative overflow-hidden rounded-2xl card-glass">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
        <div className="relative">
          <div className="p-6 border-b border-green-500/20">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Server className="h-5 w-5 text-green-400" />
              Status do Banco de Dados
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="metric-card">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5"></div>
                <div className="relative p-5">
                  <div className="flex items-center gap-4">
                    <div className={`metric-icon ${dbStatus.isOnline ? 'bg-green-500' : 'bg-red-500'}`}>
                      {dbStatus.isOnline ? (
                        <CheckCircle className="h-6 w-6 text-white" />
                      ) : (
                        <XCircle className="h-6 w-6 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Status</p>
                      <p className={`text-lg font-bold ${dbStatus.isOnline ? 'text-green-400' : 'text-red-400'}`}>
                        {dbStatus.isOnline ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="metric-card">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5"></div>
                <div className="relative p-5">
                  <div className="flex items-center gap-4">
                    <div className="metric-icon">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Última Atualização</p>
                      <p className="text-lg font-bold text-white">
                        {formatRelativeTime(dbStatus.lastUpdate)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="metric-card">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5"></div>
                <div className="relative p-5">
                  <div className="flex items-center gap-4">
                    <div className="metric-icon">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Latência</p>
                      <p className="text-lg font-bold text-white">{dbStatus.latency}ms</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="metric-card">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5"></div>
                <div className="relative p-5">
                  <div className="flex items-center gap-4">
                    <div className="metric-icon">
                      <Activity className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Uptime</p>
                      <p className="text-lg font-bold text-white">{dbStatus.uptime}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estatísticas do Sistema */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Total de Clientes', value: systemStats.totalClientes, icon: Users, badge: 'Real' },
          { label: 'Agendamentos', value: systemStats.totalAgendamentos, icon: Calendar, badge: 'Real' },
          { label: 'Financiamentos', value: systemStats.totalFinanciamentos, icon: DollarSign, badge: 'Real' },
          { label: 'Contratos Aprovados', value: systemStats.totalContratos, icon: FileText, badge: 'Real' },
          { label: 'Conversas Ativas', value: systemStats.conversasAtivas, icon: MessageSquare, badge: 'Simulado', simulated: true },
          { label: 'Mensagens Hoje', value: systemStats.mensagensHoje, icon: MessageSquare, badge: 'Simulado', simulated: true }
        ].map((stat, index) => (
          <div key={index} className="metric-card hover:scale-105 transition-transform duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5"></div>
            <div className="relative p-5">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm text-gray-400">{stat.label}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${
                      stat.simulated
                        ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                        : 'bg-green-500/20 text-green-400 border-green-500/30'
                    }`}>
                      {stat.badge}
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
                  <p className={`text-xs mt-1 flex items-center gap-1 ${stat.simulated ? 'text-gray-400' : 'text-green-400'}`}>
                    {!stat.simulated && <TrendingUp className="h-3 w-3" />}
                    {stat.simulated ? 'Dados de exemplo' : 'Dados do banco'}
                  </p>
                </div>
                <div className="metric-icon">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance do Sistema */}
        <div className="relative overflow-hidden rounded-2xl card-glass">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
          <div className="relative">
            <div className="p-6 border-b border-green-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-green-400" />
                    Performance do Sistema
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    Métricas de desempenho simuladas
                  </p>
                </div>
                <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full border border-yellow-500/30">
                  Simulado
                </span>
              </div>
            </div>
            <div className="p-6 space-y-5">
              {/* CPU Usage */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-300 flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-green-400" />
                    CPU
                  </span>
                  <span className="text-sm font-semibold text-white">{performanceMetrics.cpuUsage}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2 border border-gray-700">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500 shadow-lg shadow-green-500/50"
                    style={{ width: `${performanceMetrics.cpuUsage}%` }}
                  ></div>
                </div>
              </div>

              {/* Memory Usage */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-300 flex items-center gap-2">
                    <MemoryStick className="h-4 w-4 text-green-400" />
                    Memória
                  </span>
                  <span className="text-sm font-semibold text-white">{performanceMetrics.memoryUsage}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2 border border-gray-700">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500 shadow-lg shadow-green-500/50"
                    style={{ width: `${performanceMetrics.memoryUsage}%` }}
                  ></div>
                </div>
              </div>

              {/* Disk Usage */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-300 flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-green-400" />
                    Disco
                  </span>
                  <span className="text-sm font-semibold text-white">{performanceMetrics.diskUsage}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2 border border-gray-700">
                  <div
                    className="bg-gradient-to-r from-yellow-500 to-orange-600 h-2 rounded-full transition-all duration-500 shadow-lg shadow-yellow-500/50"
                    style={{ width: `${performanceMetrics.diskUsage}%` }}
                  ></div>
                </div>
              </div>

              {/* API Response Time */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-300 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-green-400" />
                    Tempo de Resposta API
                  </span>
                  <span className="text-sm font-semibold text-white">{performanceMetrics.apiResponseTime}ms</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2 border border-gray-700">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500 shadow-lg shadow-green-500/50"
                    style={{ width: `${Math.min((performanceMetrics.apiResponseTime / 500) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Atividade Recente */}
        <div className="relative overflow-hidden rounded-2xl card-glass">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
          <div className="relative">
            <div className="p-6 border-b border-green-500/20">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-400" />
                Atividade Recente
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Últimas ações e eventos do sistema
              </p>
            </div>
            <div className="p-6">
              {recentActivity.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="relative overflow-hidden card-glass-small rounded-lg p-3 border border-green-500/20"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-800/30 to-gray-900/20"></div>
                      <div className="relative flex items-start gap-3">
                        <div className={`p-2 rounded-full ${
                          activity.type === 'error' ? 'bg-red-500/20 border border-red-500/30' : 'bg-green-500/20 border border-green-500/30'
                        }`}>
                          {activity.type === 'error' ? (
                            <AlertCircle className="h-4 w-4 text-red-400" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">{activity.source}</p>
                          <p className="text-xs text-gray-400 truncate">{activity.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatRelativeTime(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">Nenhuma atividade recente</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Informações do Sistema */}
      <div className="relative overflow-hidden rounded-2xl card-glass">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
        <div className="relative">
          <div className="p-6 border-b border-green-500/20">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="h-5 w-5 text-green-400" />
              Informações do Sistema
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="metric-card">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5"></div>
                <div className="relative p-5">
                  <p className="text-sm text-gray-400 mb-2">Versão do Sistema</p>
                  <p className="text-2xl font-bold text-white">v2.5.0</p>
                  <p className="text-xs text-green-400 mt-1">Última atualização</p>
                </div>
              </div>
              <div className="metric-card">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5"></div>
                <div className="relative p-5">
                  <p className="text-sm text-gray-400 mb-2">Empresa</p>
                  <p className="text-2xl font-bold text-white">{user?.empresa_nome || 'VendeAI CRM'}</p>
                  <p className="text-xs text-green-400 mt-1">Empresa ID: {user?.empresa_id || 'N/A'}</p>
                </div>
              </div>
              <div className="metric-card">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5"></div>
                <div className="relative p-5">
                  <p className="text-sm text-gray-400 mb-2">Ambiente</p>
                  <p className="text-2xl font-bold text-white">Produção</p>
                  <p className="text-xs text-green-400 mt-1">Sistema estável</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        .card-glass {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .card-glass-small {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(5px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .metric-card {
          position: relative;
          overflow: hidden;
          border-radius: 0.75rem;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }

        .metric-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 0 30px rgba(16, 185, 129, 0.3);
          border-color: rgba(16, 185, 129, 0.3);
        }

        .metric-icon {
          height: 3rem;
          width: 3rem;
          border-radius: 0.5rem;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
        }

        .btn-primary-neon {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
          color: white;
          transition: all 0.3s ease;
        }

        .btn-primary-neon:hover {
          box-shadow: 0 0 30px rgba(16, 185, 129, 0.6);
          transform: translateY(-2px);
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }

        /* Scrollbar personalizada */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #10b981, #059669);
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #059669, #047857);
        }
      `}</style>
    </div>
  )
}
