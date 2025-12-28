import { useState, useEffect } from 'react';
import {
  MessageSquare, Search, RefreshCw, Power, PowerOff,
  Smartphone, CheckCircle, XCircle, Zap, Building2,
  Activity, Wifi, WifiOff, Settings
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';

export function BotsAdmin() {
  const [bots, setBots] = useState([]);
  const [estatisticas, setEstatisticas] = useState({ total: 0, conectados: 0, ativos: 0, uptime: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    carregarBots();
    const interval = setInterval(carregarBots, 15000); // Atualiza a cada 15s
    return () => clearInterval(interval);
  }, []);

  const carregarBots = async () => {
    try {
      setRefreshing(true);
      const response = await adminApi.getBots();

      if (response.success) {
        setBots(response.data.bots);
        setEstatisticas(response.data.estatisticas);
      }
    } catch (error) {
      console.error('Erro ao carregar bots:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleToggleBot = async (empresaId) => {
    try {
      await adminApi.toggleBot(empresaId);
      carregarBots();
    } catch (error) {
      console.error('Erro ao toggle bot:', error);
      alert('Erro ao alterar status do bot: ' + error.message);
    }
  };

  const botsFiltrados = search
    ? bots.filter(b =>
        b.empresa_nome?.toLowerCase().includes(search.toLowerCase()) ||
        b.whatsapp_numero?.includes(search)
      )
    : bots;

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
          <h2 className="text-2xl font-bold text-white mb-1">Monitor de Bots WhatsApp</h2>
          <p className="text-gray-400">Status e controle de todos os bots do sistema</p>
        </div>

        <button
          onClick={carregarBots}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10"
        >
          <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {/* Status em tempo real */}
      <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
        <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-sm text-green-400">Monitoramento em tempo real ativo</span>
        <span className="text-xs text-gray-400 ml-auto">
          Atualizado: {new Date().toLocaleTimeString()}
        </span>
      </div>

      {/* Cards de Metricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <MessageSquare className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{estatisticas.total}</p>
              <p className="text-xs text-gray-400">Total de Bots</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Wifi className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{estatisticas.conectados}</p>
              <p className="text-xs text-gray-400">Conectados</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <Zap className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{estatisticas.ativos}</p>
              <p className="text-xs text-gray-400">Ativos</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <Activity className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{estatisticas.uptime}%</p>
              <p className="text-xs text-gray-400">Uptime</p>
            </div>
          </div>
        </div>
      </div>

      {/* Busca */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por empresa ou numero..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50"
        />
      </div>

      {/* Grid de Bots */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {botsFiltrados.map((bot) => (
          <div
            key={bot.id}
            className={`rounded-xl border p-4 transition-all ${
              bot.bot_ativo
                ? 'bg-green-500/5 border-green-500/30'
                : bot.whatsapp_conectado
                ? 'bg-yellow-500/5 border-yellow-500/30'
                : 'bg-white/5 border-white/10'
            }`}
          >
            {/* Header do Card */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  bot.bot_ativo ? 'bg-green-500/20' : 'bg-gray-500/20'
                }`}>
                  <MessageSquare className={`h-5 w-5 ${
                    bot.bot_ativo ? 'text-green-400' : 'text-gray-400'
                  }`} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{bot.empresa_nome}</h3>
                  <p className="text-xs text-gray-400">{bot.nome_bot || 'Bot sem nome'}</p>
                </div>
              </div>

              {/* Toggle */}
              <button
                onClick={() => handleToggleBot(bot.id)}
                className={`p-2 rounded-lg transition-all ${
                  bot.bot_ativo
                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                    : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                }`}
                title={bot.bot_ativo ? 'Desativar bot' : 'Ativar bot'}
              >
                {bot.bot_ativo ? <Power className="h-5 w-5" /> : <PowerOff className="h-5 w-5" />}
              </button>
            </div>

            {/* Status */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">WhatsApp</span>
                <div className="flex items-center gap-1">
                  {bot.whatsapp_conectado ? (
                    <>
                      <Wifi className="h-3 w-3 text-green-400" />
                      <span className="text-xs text-green-400">Conectado</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-3 w-3 text-red-400" />
                      <span className="text-xs text-red-400">Desconectado</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Numero</span>
                <span className="text-xs text-white">
                  {bot.whatsapp_numero || 'Nao configurado'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Nicho</span>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  bot.nicho === 'veiculos'
                    ? 'bg-blue-500/20 text-blue-400'
                    : bot.nicho === 'imoveis'
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {bot.nicho || 'Nao definido'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Setup</span>
                {bot.setup_completo ? (
                  <span className="text-xs text-green-400 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Completo
                  </span>
                ) : (
                  <span className="text-xs text-yellow-400 flex items-center gap-1">
                    <XCircle className="h-3 w-3" /> Incompleto
                  </span>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <span className={`text-xs px-2 py-1 rounded font-medium ${
                bot.plano === 'enterprise' ? 'bg-purple-500/20 text-purple-400' :
                bot.plano === 'pro' ? 'bg-blue-500/20 text-blue-400' :
                bot.plano === 'basic' ? 'bg-green-500/20 text-green-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {bot.plano?.toUpperCase() || 'FREE'}
              </span>

              <button className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        {botsFiltrados.length === 0 && (
          <div className="col-span-full text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Nenhum bot encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default BotsAdmin;
