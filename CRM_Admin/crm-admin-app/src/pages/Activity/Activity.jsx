import { useState, useEffect } from 'react';
import {
  Activity as ActivityIcon, Building2, Users, DollarSign,
  MessageSquare, AlertCircle, CheckCircle, Clock,
  TrendingUp, RefreshCw, Filter, Search
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';

export function Activity() {
  const [atividades, setAtividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState('');

  useEffect(() => {
    carregarAtividades();
    const interval = setInterval(carregarAtividades, 10000); // Atualiza a cada 10s
    return () => clearInterval(interval);
  }, []);

  const carregarAtividades = async () => {
    try {
      setRefreshing(true);
      const response = await adminApi.getRecentActivity(50);
      if (response.success) {
        setAtividades(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar atividades:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getIconByType = (tipo) => {
    switch (tipo) {
      case 'new_company':
        return { icon: Building2, color: 'green', bg: 'bg-green-500/20' };
      case 'payment':
        return { icon: DollarSign, color: 'blue', bg: 'bg-blue-500/20' };
      case 'bot_activated':
        return { icon: MessageSquare, color: 'purple', bg: 'bg-purple-500/20' };
      case 'churn':
        return { icon: AlertCircle, color: 'red', bg: 'bg-red-500/20' };
      case 'upgrade':
        return { icon: TrendingUp, color: 'yellow', bg: 'bg-yellow-500/20' };
      case 'login':
        return { icon: Users, color: 'cyan', bg: 'bg-cyan-500/20' };
      case 'config_alterada':
        return { icon: CheckCircle, color: 'indigo', bg: 'bg-indigo-500/20' };
      default:
        return { icon: ActivityIcon, color: 'gray', bg: 'bg-gray-500/20' };
    }
  };

  const formatarTempo = (dataString) => {
    if (!dataString) return 'Agora';
    const data = new Date(dataString);
    const agora = new Date();
    const diff = agora - data;

    const segundos = Math.floor(diff / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);

    if (dias > 0) return `${dias} dia${dias > 1 ? 's' : ''} atras`;
    if (horas > 0) return `${horas} hora${horas > 1 ? 's' : ''} atras`;
    if (minutos > 0) return `${minutos} minuto${minutos > 1 ? 's' : ''} atras`;
    return 'Agora mesmo';
  };

  const atividadesFiltradas = filtroTipo
    ? atividades.filter((a) => a.tipo === filtroTipo)
    : atividades;

  const tiposUnicos = [...new Set(atividades.map((a) => a.tipo))];

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
          <h2 className="text-2xl font-bold text-white mb-1">Atividade do Sistema</h2>
          <p className="text-gray-400">Historico de acoes e eventos em tempo real</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={carregarAtividades}
            disabled={refreshing}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50"
          >
            <option value="">Todos os tipos</option>
            {tiposUnicos.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo?.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Status em Tempo Real */}
      <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
        <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-sm text-green-400">Monitoramento em tempo real ativo</span>
        <span className="text-xs text-gray-400 ml-auto">
          Ultima atualizacao: {new Date().toLocaleTimeString()}
        </span>
      </div>

      {/* Timeline de Atividades */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-6">
        <div className="space-y-4">
          {atividadesFiltradas.map((atividade, idx) => {
            const { icon: Icon, color, bg } = getIconByType(atividade.tipo);

            return (
              <div
                key={idx}
                className="flex items-start gap-4 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all border-l-4 border-l-transparent hover:border-l-purple-500"
              >
                <div className={`p-3 rounded-xl ${bg}`}>
                  <Icon className={`h-5 w-5 text-${color}-400`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-white">
                      {atividade.acao || atividade.tipo}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded bg-${color}-500/20 text-${color}-400`}>
                      {atividade.tipo?.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{atividade.descricao}</p>
                  {atividade.ip_address && (
                    <p className="text-xs text-gray-500 mt-1">IP: {atividade.ip_address}</p>
                  )}
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatarTempo(atividade.criado_em)}
                  </span>
                  {atividade.usuario_id && (
                    <span className="text-xs text-gray-600 mt-1">
                      Usuario #{atividade.usuario_id}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {atividadesFiltradas.length === 0 && (
            <div className="text-center py-8">
              <ActivityIcon className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">Nenhuma atividade encontrada</p>
            </div>
          )}
        </div>
      </div>

      {/* Resumo de Tipos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tiposUnicos.slice(0, 4).map((tipo) => {
          const count = atividades.filter((a) => a.tipo === tipo).length;
          const { icon: Icon, color, bg } = getIconByType(tipo);

          return (
            <div
              key={tipo}
              className="rounded-xl bg-white/5 border border-white/10 p-4 cursor-pointer hover:bg-white/10 transition-all"
              onClick={() => setFiltroTipo(filtroTipo === tipo ? '' : tipo)}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${bg}`}>
                  <Icon className={`h-4 w-4 text-${color}-400`} />
                </div>
                <div>
                  <p className="text-xl font-bold text-white">{count}</p>
                  <p className="text-xs text-gray-400 capitalize">{tipo?.replace('_', ' ')}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Activity;
