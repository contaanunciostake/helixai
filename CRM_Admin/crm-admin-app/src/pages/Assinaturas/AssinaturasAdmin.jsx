import { useState, useEffect } from 'react';
import {
  CreditCard, Search, Filter, ChevronLeft, ChevronRight, RefreshCw,
  DollarSign, Clock, AlertCircle, CheckCircle, Calendar,
  TrendingUp, Building2, ArrowUpRight
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';

export function AssinaturasAdmin() {
  const [assinaturas, setAssinaturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [planoFilter, setPlanoFilter] = useState('');

  useEffect(() => {
    carregarAssinaturas();
  }, [page, planoFilter]);

  const carregarAssinaturas = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAssinaturas({
        page,
        per_page: 15,
        plano: planoFilter
      });

      if (response.success) {
        setAssinaturas(response.data.assinaturas);
        setTotalPages(response.data.total_pages);
        setTotal(response.data.total);
      }
    } catch (error) {
      console.error('Erro ao carregar assinaturas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanoColor = (plano) => {
    switch (plano) {
      case 'enterprise': return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
      case 'pro': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'basic': return 'text-green-400 bg-green-500/20 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getPlanoNome = (plano) => {
    switch (plano) {
      case 'enterprise': return 'Enterprise';
      case 'pro': return 'Profissional';
      case 'basic': return 'Basico';
      default: return 'Gratuito';
    }
  };

  // Calcular MRR
  const mrr = assinaturas.reduce((sum, a) => sum + (a.valor || 0), 0);
  const totalAtivas = assinaturas.filter(a => a.plano_ativo).length;
  const totalVencendo = assinaturas.filter(a => a.dias_restantes && a.dias_restantes <= 7).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Assinaturas</h2>
          <p className="text-gray-400">{total} assinaturas ativas</p>
        </div>
      </div>

      {/* Cards de Metricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <DollarSign className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                R$ {mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-400">MRR Total</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <CheckCircle className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{totalAtivas}</p>
              <p className="text-xs text-gray-400">Assinaturas Ativas</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/20">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{totalVencendo}</p>
              <p className="text-xs text-gray-400">Vencendo em 7 dias</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <TrendingUp className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400 flex items-center gap-1">
                +12.5%
                <ArrowUpRight className="h-4 w-4" />
              </p>
              <p className="text-xs text-gray-400">Crescimento MRR</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-4">
        <select
          value={planoFilter}
          onChange={(e) => { setPlanoFilter(e.target.value); setPage(1); }}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
        >
          <option value="">Todos os planos</option>
          <option value="basic">Basico</option>
          <option value="pro">Profissional</option>
          <option value="enterprise">Enterprise</option>
        </select>

        <button onClick={carregarAssinaturas} className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10">
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>

      {/* Tabela */}
      <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Empresa</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Plano</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Valor</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Data Inicio</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Vencimento</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Dias Restantes</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto" />
                </td>
              </tr>
            ) : assinaturas.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-gray-400">
                  Nenhuma assinatura encontrada
                </td>
              </tr>
            ) : (
              assinaturas.map((assinatura) => (
                <tr key={assinatura.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/20">
                        <Building2 className="h-4 w-4 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{assinatura.empresa_nome}</p>
                        <p className="text-xs text-gray-400">{assinatura.empresa_email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPlanoColor(assinatura.plano)}`}>
                      {getPlanoNome(assinatura.plano)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-bold text-white">
                      R$ {(assinatura.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-xs text-gray-400">/mes</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {assinatura.plano_ativo ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-green-500/20 text-green-400">
                        <CheckCircle className="h-3 w-3" /> Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-red-500/20 text-red-400">
                        <AlertCircle className="h-3 w-3" /> Inativo
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Calendar className="h-4 w-4" />
                      {assinatura.data_inicio
                        ? new Date(assinatura.data_inicio).toLocaleDateString('pt-BR')
                        : '-'}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-400">
                      {assinatura.data_fim
                        ? new Date(assinatura.data_fim).toLocaleDateString('pt-BR')
                        : '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {assinatura.dias_restantes !== null ? (
                      <span className={`text-sm font-bold ${
                        assinatura.dias_restantes <= 7
                          ? 'text-red-400'
                          : assinatura.dias_restantes <= 15
                          ? 'text-yellow-400'
                          : 'text-green-400'
                      }`}>
                        {assinatura.dias_restantes} dias
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginacao */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">
          Mostrando {assinaturas.length} de {total} assinaturas
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

export default AssinaturasAdmin;
