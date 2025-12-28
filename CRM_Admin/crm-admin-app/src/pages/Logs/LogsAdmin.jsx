import { useState, useEffect } from 'react';
import {
  FileText, Search, Filter, ChevronLeft, ChevronRight, RefreshCw,
  AlertCircle, CheckCircle, Info, XCircle, Clock, User,
  Building2, Activity, Download
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';

export function LogsAdmin() {
  const [logs, setLogs] = useState([]);
  const [tiposDisponiveis, setTiposDisponiveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [tipoFilter, setTipoFilter] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    carregarLogs();
  }, [page, tipoFilter]);

  const carregarLogs = async () => {
    try {
      setRefreshing(true);
      const response = await adminApi.getLogs({
        page,
        per_page: 30,
        tipo: tipoFilter
      });

      if (response.success) {
        setLogs(response.data.logs);
        setTotalPages(response.data.total_pages);
        setTotal(response.data.total);
        setTiposDisponiveis(response.data.tipos_disponiveis || []);
      }
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'erro':
      case 'error':
        return { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20' };
      case 'alerta':
      case 'warning':
        return { icon: AlertCircle, color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
      case 'sucesso':
      case 'success':
        return { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/20' };
      case 'login':
        return { icon: User, color: 'text-blue-400', bg: 'bg-blue-500/20' };
      case 'config_alterada':
        return { icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/20' };
      default:
        return { icon: Info, color: 'text-gray-400', bg: 'bg-gray-500/20' };
    }
  };

  const formatarData = (dataString) => {
    if (!dataString) return '-';
    const data = new Date(dataString);
    return data.toLocaleString('pt-BR');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Logs do Sistema</h2>
          <p className="text-gray-400">{total} registros encontrados</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={carregarLogs}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10"
          >
            <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-400 hover:bg-purple-500/30">
            <Download className="h-4 w-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-4">
        <select
          value={tipoFilter}
          onChange={(e) => { setTipoFilter(e.target.value); setPage(1); }}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
        >
          <option value="">Todos os tipos</option>
          {tiposDisponiveis.map((tipo) => (
            <option key={tipo} value={tipo}>{tipo}</option>
          ))}
        </select>

        <div className="text-sm text-gray-400">
          Auto-refresh a cada 30 segundos
        </div>
      </div>

      {/* Tabela de Logs */}
      <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Tipo</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Acao</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Descricao</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Usuario</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">IP</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Data/Hora</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto" />
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-gray-400">
                  Nenhum log encontrado
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const { icon: Icon, color, bg } = getTipoIcon(log.tipo);

                return (
                  <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className={`inline-flex items-center gap-2 px-2 py-1 rounded ${bg}`}>
                        <Icon className={`h-4 w-4 ${color}`} />
                        <span className={`text-xs font-medium ${color}`}>{log.tipo}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-white">{log.acao || '-'}</span>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="text-sm text-gray-400 truncate" title={log.descricao}>
                        {log.descricao || '-'}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {log.usuario_id ? (
                        <span className="text-sm text-white">Usuario #{log.usuario_id}</span>
                      ) : (
                        <span className="text-sm text-gray-500">Sistema</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded">
                        {log.ip_address || '-'}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Clock className="h-4 w-4" />
                        {formatarData(log.criado_em)}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Paginacao */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">
          Mostrando {logs.length} de {total} logs
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm text-white px-4">
            Pagina {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default LogsAdmin;
