import { useState, useEffect } from 'react';
import {
  DollarSign, Search, Filter, ChevronLeft, ChevronRight, RefreshCw,
  CheckCircle, Clock, XCircle, Package, Users, TrendingUp,
  ArrowUpRight, Calendar, Wallet
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';

export function ComissoesAdmin() {
  const [comissoes, setComissoes] = useState([]);
  const [totais, setTotais] = useState({ pendente: 0, aprovado: 0, pago: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    carregarComissoes();
  }, [page, statusFilter]);

  const carregarComissoes = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getComissoes({
        page,
        per_page: 15,
        status: statusFilter
      });

      if (response.success) {
        setComissoes(response.data.comissoes);
        setTotalPages(response.data.total_pages);
        setTotal(response.data.total);
        setTotais(response.data.totais);
      }
    } catch (error) {
      console.error('Erro ao carregar comissoes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAprovar = async (id) => {
    try {
      await adminApi.aprovarComissao(id);
      carregarComissoes();
    } catch (error) {
      console.error('Erro ao aprovar comissao:', error);
      alert('Erro ao aprovar comissao: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'aprovada': return 'text-green-400 bg-green-500/20';
      case 'pendente': return 'text-yellow-400 bg-yellow-500/20';
      case 'paga': return 'text-blue-400 bg-blue-500/20';
      case 'cancelada': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'primeira_venda': return 'text-purple-400 bg-purple-500/20';
      case 'recorrente': return 'text-blue-400 bg-blue-500/20';
      case 'bonus': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getTipoLabel = (tipo) => {
    switch (tipo) {
      case 'primeira_venda': return '1a Venda';
      case 'recorrente': return 'Recorrente';
      case 'bonus': return 'Bonus';
      default: return tipo;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Comissoes</h2>
          <p className="text-gray-400">Gestao de comissoes dos afiliados</p>
        </div>
      </div>

      {/* Cards de Metricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/30 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/20">
              <Clock className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                R$ {(totais.pendente || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-400">Pendente</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-green-500/10 border border-green-500/30 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                R$ {(totais.aprovado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-400">Aprovado</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-blue-500/10 border border-blue-500/30 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Wallet className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                R$ {(totais.pago || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-400">Total Pago</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Package className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{total}</p>
              <p className="text-xs text-gray-400">Total Comissoes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-4">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
        >
          <option value="">Todos os status</option>
          <option value="pendente">Pendente</option>
          <option value="aprovada">Aprovada</option>
          <option value="paga">Paga</option>
          <option value="cancelada">Cancelada</option>
        </select>

        <button onClick={carregarComissoes} className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10">
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>

      {/* Tabela */}
      <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Afiliado</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Tipo</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Valor Base</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">%</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Comissao</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Data</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="px-4 py-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto" />
                </td>
              </tr>
            ) : comissoes.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-4 py-8 text-center text-gray-400">
                  Nenhuma comissao encontrada
                </td>
              </tr>
            ) : (
              comissoes.map((comissao) => (
                <tr key={comissao.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-400">#{comissao.id}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                        {comissao.afiliado_nome?.charAt(0)?.toUpperCase() || 'A'}
                      </div>
                      <span className="text-sm text-white">{comissao.afiliado_nome || `Afiliado #${comissao.afiliado_id}`}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTipoColor(comissao.tipo)}`}>
                      {getTipoLabel(comissao.tipo)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm text-gray-400">
                      R$ {(comissao.valor_base || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm text-white">{comissao.percentual || 0}%</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-bold text-green-400">
                      R$ {(comissao.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getStatusColor(comissao.status)}`}>
                      {comissao.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Calendar className="h-4 w-4" />
                      {comissao.data_geracao
                        ? new Date(comissao.data_geracao).toLocaleDateString('pt-BR')
                        : '-'}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {comissao.status === 'pendente' && (
                        <button
                          onClick={() => handleAprovar(comissao.id)}
                          className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 text-xs font-medium transition-colors"
                        >
                          Aprovar
                        </button>
                      )}
                    </div>
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
          Mostrando {comissoes.length} de {total} comissoes
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

export default ComissoesAdmin;
