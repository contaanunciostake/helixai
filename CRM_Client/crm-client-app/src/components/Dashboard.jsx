/**
 * ════════════════════════════════════════════════════════════════
 * COMPONENTE: Dashboard Verde Neon - AIra CRM
 * Design futurista com tema verde neon da landing page
 * ════════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import {
  MessageSquare, Users, TrendingUp, Activity, Bot, Calendar,
  Car, CheckCircle, AlertTriangle, Info, RefreshCw, Power,
  Smartphone, Settings as SettingsIcon, Clock, DollarSign,
  BarChart3, Zap, TrendingDown, ArrowUpRight, ArrowDownRight,
  Eye, PhoneCall, Mail, MapPin, Globe, Building2, Sparkles
} from 'lucide-react';

export default function Dashboard({ user, botConfig, onNavigate, showNotification }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    loadDashboardData();

    // Auto-refresh a cada 5 segundos para atualizar status do bot
    const interval = setInterval(() => {
      loadDashboardData(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [user]);

  const loadDashboardData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      const empresaId = user?.empresa_id || 5;

      // Buscar estatísticas do backend
      let statsData = { data: {} };
      try {
        const statsResponse = await fetch(`http://localhost:5000/api/stats/${empresaId}`);
        if (statsResponse.ok) {
          const data = await statsResponse.json();
          if (data.success) {
            statsData = data;
          }
        } else if (statsResponse.status === 404) {
          console.warn(`[DASHBOARD] ⚠️ Empresa ${empresaId} não encontrada no banco`);
        } else {
          console.warn(`[DASHBOARD] ⚠️ API stats retornou ${statsResponse.status}`);
        }
      } catch (statsError) {
        console.warn('[DASHBOARD] ⚠️ Erro ao buscar stats:', statsError.message);
      }

      // Buscar status real do bot/WhatsApp da empresa
      let botStatus = {
        ativo: false,
        configurado: false,
        whatsapp: {
          connected: false,
          phoneNumber: null
        }
      };

      try {
        console.log('[DASHBOARD] 📡 Buscando status da empresa...');
        const empresaResponse = await fetch(`http://localhost:5000/api/empresa/info`);
        console.log('[DASHBOARD] 📡 Status HTTP:', empresaResponse.status);

        if (empresaResponse.ok) {
          const empresaData = await empresaResponse.json();
          console.log('[DASHBOARD] 📡 Dados recebidos:', empresaData);

          // A API retorna os dados diretamente (não dentro de success/empresa)
          if (empresaData.id) {
            botStatus = {
              ativo: empresaData.bot_ativo || false,
              configurado: empresaData.whatsapp_conectado || false,
              whatsapp: {
                connected: empresaData.whatsapp_conectado || false,
                phoneNumber: empresaData.whatsapp_numero || null
              }
            };
            console.log('[DASHBOARD] ✅ Status real do bot:', botStatus);
            console.log('[DASHBOARD] 📱 WhatsApp:', botStatus.whatsapp.connected ? `Conectado (${botStatus.whatsapp.phoneNumber})` : 'Desconectado');
          } else {
            console.warn('[DASHBOARD] ⚠️ Resposta sem ID da empresa:', empresaData);
          }
        } else {
          const errorText = await empresaResponse.text();
          console.error('[DASHBOARD] ❌ Erro HTTP:', empresaResponse.status, errorText);
        }
      } catch (botError) {
        console.error('[DASHBOARD] ❌ Erro ao buscar status do bot:', botError);
      }

      // Montar dados do dashboard
      const dashboardData = {
        empresa: {
          nome: user?.empresa_nome || 'Empresa',
          nicho: user?.nicho || 'veiculos',
          telefone: user?.whatsapp || '(00) 00000-0000',
          email: user?.email || 'contato@empresa.com',
          endereco: 'Rua Principal, 123 - Centro',
          horarioAtendimento: 'Seg-Sex: 8h às 18h',
          website: 'www.empresa.com.br'
        },
        bot: botStatus,
        stats: {
          totalVeiculos: 45,
          totalClientes: statsData?.data?.clientes?.total || 0,
          totalConversas: statsData?.data?.conversas?.total || 0,
          totalAgendamentos: statsData?.data?.agendamentos?.total || 0,
          agendamentosPendentes: statsData?.data?.agendamentos?.pendentes || 0,
          financiamentosTotal: statsData?.data?.financiamentos?.total || 0,
          financiamentosAprovados: statsData?.data?.financiamentos?.aprovados || 0,
          mensagensHoje: statsData?.data?.mensagens?.hoje || 0,
          mensagensSemana: statsData?.data?.mensagens?.semana || 0,
          taxaResposta: statsData?.data?.bot?.taxa_resposta || 0,
          tempoMedioResposta: statsData?.data?.bot?.tempo_medio_resposta || '-',
          leadsMes: statsData?.data?.leads?.mes || 0,
          vendasMes: 12,
          receitaMes: 680000,
          ticketMedio: 56666.67
        },
        warnings: [],
        needsSetup: []
      };

      setDashboardData(dashboardData);
    } catch (error) {
      console.error('[DASHBOARD] Erro:', error);
      showNotification('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black relative overflow-hidden">
        {/* Grid pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '4rem 4rem'
        }}></div>

        {/* Stars */}
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite ${Math.random() * 3}s`
            }}
          />
        ))}

        <div className="text-center relative z-10">
          <div className="relative">
            <div className="h-20 w-20 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin mx-auto" />
            <Bot className="h-8 w-8 text-green-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-white/70 mt-6 text-sm font-medium">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center p-12 bg-black">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <p className="text-white/70">Erro ao carregar dados</p>
        </div>
      </div>
    );
  }

  const { empresa, bot, stats, warnings, needsSetup } = dashboardData;

  return (
    <div className="min-h-screen bg-black p-6 space-y-6 relative">
      {/* Stars Background */}
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

      {/* Header com logo AIra */}
      <div className="relative overflow-hidden rounded-2xl card-glass">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
        <div className="relative p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                <span className="text-2xl">◆</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  {empresa.nome}
                </h1>
                <div className="flex items-center gap-4 mt-1.5 text-xs text-white/60">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{empresa.endereco}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{empresa.horarioAtendimento}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right mr-4">
                <p className="text-xs text-white/50">Última atualização</p>
                <p className="text-sm text-white/90 font-semibold">
                  {new Date().toLocaleTimeString('pt-BR')}
                </p>
              </div>
              <Button
                onClick={() => loadDashboardData()}
                disabled={refreshing}
                className="btn-primary-neon text-white"
              >
                {refreshing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Atualizar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Status do Bot - Card Gaming Estilo PS5 */}
      <div className="relative overflow-hidden rounded-3xl card-glass border border-white/10">
        <div className={`absolute inset-0 ${
          bot.whatsapp.connected && bot.ativo
            ? 'bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-cyan-500/5'
            : 'bg-gradient-to-br from-white/5 to-white/2'
        }`} />

        {/* Efeito de luz superior (estilo PS5) */}
        <div className={`absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent to-transparent opacity-50 ${
          bot.whatsapp.connected && bot.ativo ? 'via-green-400' : 'via-red-400'
        }`}></div>

        <div className="relative p-6">
          {/* Informações do Bot */}
          <div className="flex items-center gap-5 mb-6">
            <div className="relative">
              <div className={`h-20 w-20 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 ${
                bot.whatsapp.connected && bot.ativo
                  ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-500/50'
                  : 'bg-gradient-to-br from-red-500/70 to-gray-600/70 shadow-red-500/30'
              }`}>
                <Bot className={`h-10 w-10 transition-all duration-300 ${
                  bot.whatsapp.connected && bot.ativo ? 'text-white' : 'text-white/60'
                }`} />
              </div>
              {bot.whatsapp.connected && bot.ativo ? (
                <div className="absolute -top-1 -right-1 h-5 w-5 bg-green-400 rounded-full border-3 border-black shadow-lg shadow-green-400/50 animate-pulse" />
              ) : (
                <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full border-3 border-black shadow-lg shadow-red-500/50" />
              )}
            </div>
            <div className="flex-1">
              <h3 className={`text-2xl font-bold mb-1 flex items-center gap-2 transition-all duration-300 ${
                bot.whatsapp.connected && bot.ativo ? 'text-white' : 'text-red-400'
              }`}>
                {bot.whatsapp.connected && bot.ativo ? (
                  <>
                    <Sparkles className="h-6 w-6 text-green-400 animate-pulse" />
                    Bot Conectado
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-6 w-6 text-red-400" />
                    Bot Desconectado
                  </>
                )}
              </h3>
              <p className="text-white/60 text-sm mb-3">
                {bot.whatsapp.connected && bot.whatsapp.phoneNumber
                  ? `WhatsApp conectado: +${bot.whatsapp.phoneNumber.replace(/\D/g, '')}`
                  : bot.whatsapp.connected && !bot.whatsapp.phoneNumber
                  ? 'WhatsApp conectado - sincronizando número...'
                  : 'Conecte seu WhatsApp para começar a atender clientes'}
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-all duration-300 ${
                  bot.whatsapp.connected && bot.ativo
                    ? 'bg-green-500/20 border border-green-500/30'
                    : 'bg-red-500/20 border border-red-500/30'
                }`}>
                  <div className={`h-2 w-2 rounded-full shadow-lg ${
                    bot.whatsapp.connected && bot.ativo
                      ? 'bg-green-400 shadow-green-400/50 animate-pulse'
                      : 'bg-red-400 shadow-red-400/50'
                  }`} />
                  <span className={`text-xs font-semibold ${
                    bot.whatsapp.connected && bot.ativo ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {bot.whatsapp.connected && bot.ativo ? 'Online' : 'Offline'}
                  </span>
                </div>
                {bot.whatsapp.connected && bot.ativo && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-lg">
                    <MessageSquare className="h-3.5 w-3.5 text-white/60" />
                    <span className="text-white/90 text-xs font-semibold">
                      {stats.mensagensHoje > 0 ? `${stats.mensagensHoje} mensagens hoje` : 'Nenhuma mensagem hoje'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Botão Gerenciar Bot - Estilo Gaming Card */}
          <button
            onClick={() => onNavigate('whatsapp')}
            className="gaming-card-button w-full group relative overflow-hidden rounded-2xl transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]"
          >
            {/* Background gradiente animado */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 opacity-90 group-hover:opacity-100 transition-opacity duration-300"></div>

            {/* Brilho superior */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>

            {/* Efeito de partículas */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/40 rounded-full animate-ping"></div>
              <div className="absolute top-3/4 right-1/3 w-1.5 h-1.5 bg-white/30 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
              <div className="absolute bottom-1/3 left-2/3 w-1 h-1 bg-white/20 rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
            </div>

            {/* Shine effect hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>

            {/* Shadow interna */}
            <div className="absolute inset-0 shadow-[inset_0_2px_20px_rgba(0,0,0,0.3)]"></div>

            {/* Conteúdo */}
            <div className="relative px-8 py-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
                  <SettingsIcon className="h-7 w-7 text-white" />
                </div>
                <div className="text-left">
                  <h4 className="text-xl font-bold text-white mb-0.5 group-hover:tracking-wide transition-all duration-300">
                    Gerenciar Bot
                  </h4>
                  <p className="text-sm text-white/80 font-medium">
                    Configurações e controles avançados
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col items-end mr-2">
                  <span className="text-xs text-white/60 font-medium">Acesso</span>
                  <span className="text-sm text-white font-bold">Completo</span>
                </div>
                <div className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 group-hover:scale-110 transition-all duration-300">
                  <ArrowUpRight className="h-6 w-6 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                </div>
              </div>
            </div>

            {/* Brilho inferior */}
            <div className="absolute bottom-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
          </button>

          {/* Métricas do Bot */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="card-glass rounded-xl p-4 text-center hover:bg-white/5 transition-colors border border-white/5 hover:border-green-500/30">
              <MessageSquare className="h-5 w-5 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{formatNumber(stats.mensagensSemana)}</p>
              <p className="text-xs text-white/60 mt-1">Mensagens Semana</p>
            </div>
            <div className="card-glass rounded-xl p-4 text-center hover:bg-white/5 transition-colors border border-white/5 hover:border-green-500/30">
              <Activity className="h-5 w-5 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats.taxaResposta}%</p>
              <p className="text-xs text-white/60 mt-1">Taxa Resposta</p>
            </div>
            <div className="card-glass rounded-xl p-4 text-center hover:bg-white/5 transition-colors border border-white/5 hover:border-green-500/30">
              <Clock className="h-5 w-5 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats.tempoMedioResposta}</p>
              <p className="text-xs text-white/60 mt-1">Tempo Médio</p>
            </div>
            <div className="card-glass rounded-xl p-4 text-center hover:bg-white/5 transition-colors border border-white/5 hover:border-green-500/30">
              <TrendingUp className="h-5 w-5 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{formatNumber(stats.totalConversas)}</p>
              <p className="text-xs text-white/60 mt-1">Total Conversas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Receita Mensal */}
        <div className="relative overflow-hidden rounded-xl card-glass hover:bg-white/5 transition-all group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-11 w-11 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <ArrowUpRight className="h-5 w-5 text-green-400" />
            </div>
            <h3 className="text-xs text-white/60 font-medium mb-1">Receita do Mês</h3>
            <p className="text-2xl font-bold text-white">{formatPrice(stats.receitaMes)}</p>
            <p className="text-xs text-green-400 font-semibold mt-2">+12% vs mês anterior</p>
          </div>
        </div>

        {/* Total Clientes */}
        <div className="relative overflow-hidden rounded-xl card-glass hover:bg-white/5 transition-all group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-11 w-11 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Users className="h-6 w-6 text-white" />
              </div>
              <ArrowUpRight className="h-5 w-5 text-green-400" />
            </div>
            <h3 className="text-xs text-white/60 font-medium mb-1">Total de Clientes</h3>
            <p className="text-2xl font-bold text-white">{formatNumber(stats.totalClientes)}</p>
            <p className="text-xs text-green-400 font-semibold mt-2">+{stats.leadsMes} novos este mês</p>
          </div>
        </div>

        {/* Veículos/Produtos */}
        <div className="relative overflow-hidden rounded-xl card-glass hover:bg-white/5 transition-all group">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-11 w-11 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <Car className="h-6 w-6 text-white" />
              </div>
            </div>
            <h3 className="text-xs text-white/60 font-medium mb-1">Veículos Disponíveis</h3>
            <p className="text-2xl font-bold text-white">{formatNumber(stats.totalVeiculos)}</p>
            <p className="text-xs text-white/60 font-semibold mt-2">No estoque</p>
          </div>
        </div>

        {/* Agendamentos */}
        <div className="relative overflow-hidden rounded-xl card-glass hover:bg-white/5 transition-all group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-11 w-11 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              {stats.agendamentosPendentes > 0 && (
                <div className="h-6 w-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center shadow-lg shadow-amber-500/50 animate-pulse">
                  {stats.agendamentosPendentes}
                </div>
              )}
            </div>
            <h3 className="text-xs text-white/60 font-medium mb-1">Agendamentos</h3>
            <p className="text-2xl font-bold text-white">{formatNumber(stats.totalAgendamentos)}</p>
            <p className="text-xs text-amber-400 font-semibold mt-2">
              {stats.agendamentosPendentes} pendentes
            </p>
          </div>
        </div>
      </div>

      {/* Cards Secundários */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informações da Empresa */}
        <div className="relative overflow-hidden rounded-xl card-glass">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
          <div className="relative p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-green-400" />
              Informações da Empresa
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <PhoneCall className="h-4 w-4 text-green-400 mt-0.5" />
                <div>
                  <p className="text-xs text-white/50">Telefone</p>
                  <p className="text-sm text-white font-medium">{empresa.telefone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <Mail className="h-4 w-4 text-green-400 mt-0.5" />
                <div>
                  <p className="text-xs text-white/50">E-mail</p>
                  <p className="text-sm text-white font-medium">{empresa.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <Globe className="h-4 w-4 text-green-400 mt-0.5" />
                <div>
                  <p className="text-xs text-white/50">Website</p>
                  <p className="text-sm text-white font-medium">{empresa.website}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="relative overflow-hidden rounded-xl card-glass">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
          <div className="relative p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-green-400" />
              Ações Rápidas
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => onNavigate('conversations')}
                className="bg-white/5 hover:bg-white/10 text-white border border-white/10 h-auto py-4 flex-col gap-2 transition-all hover:border-green-500/30"
              >
                <MessageSquare className="h-5 w-5 text-green-400" />
                <span className="text-xs font-medium">Ver Conversas</span>
              </Button>
              <Button
                onClick={() => onNavigate('appointments')}
                className="bg-white/5 hover:bg-white/10 text-white border border-white/10 h-auto py-4 flex-col gap-2 transition-all hover:border-green-500/30"
              >
                <Calendar className="h-5 w-5 text-green-400" />
                <span className="text-xs font-medium">Agendamentos</span>
              </Button>
              <Button
                onClick={() => onNavigate('reports')}
                className="bg-white/5 hover:bg-white/10 text-white border border-white/10 h-auto py-4 flex-col gap-2 transition-all hover:border-green-500/30"
              >
                <BarChart3 className="h-5 w-5 text-green-400" />
                <span className="text-xs font-medium">Relatórios</span>
              </Button>
              <Button
                onClick={() => onNavigate('bot-settings')}
                className="bg-white/5 hover:bg-white/10 text-white border border-white/10 h-auto py-4 flex-col gap-2 transition-all hover:border-green-500/30"
              >
                <SettingsIcon className="h-5 w-5 text-green-400" />
                <span className="text-xs font-medium">Configurações</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer com Estatísticas Adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative overflow-hidden rounded-xl card-glass p-4 hover:bg-white/5 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/60 mb-1">Vendas do Mês</p>
              <p className="text-xl font-bold text-white">{stats.vendasMes}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-400 opacity-50" />
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl card-glass p-4 hover:bg-white/5 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/60 mb-1">Ticket Médio</p>
              <p className="text-xl font-bold text-white">{formatPrice(stats.ticketMedio)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-400 opacity-50" />
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl card-glass p-4 hover:bg-white/5 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/60 mb-1">Leads do Mês</p>
              <p className="text-xl font-bold text-white">{stats.leadsMes}</p>
            </div>
            <Users className="h-8 w-8 text-green-400 opacity-50" />
          </div>
        </div>
      </div>

      {/* Style for animations */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
      `}</style>
    </div>
  );
}
