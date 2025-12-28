import { useState, useEffect } from 'react';
import {
  DollarSign, Search, CheckCircle, XCircle, Filter,
  ChevronLeft, ChevronRight, RefreshCw, Users, TrendingUp,
  Link2, Clock, Eye, UserCheck, Award, Wallet
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';

export function AfiliadosAdmin() {
  const [afiliados, setAfiliados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    carregarAfiliados();
  }, [page, statusFilter]);

  const carregarAfiliados = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAfiliados({
        page,
        per_page: 15,
        status: statusFilter
      });

      if (response.success) {
        setAfiliados(response.data.afiliados);
        setTotalPages(response.data.total_pages);
        setTotal(response.data.total);
      }
    } catch (error) {
      console.error('Erro ao carregar afiliados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAprovar = async (id) => {
    try {
      await adminApi.aprovarAfiliado(id);
      carregarAfiliados();
    } catch (error) {
      console.error('Erro ao aprovar afiliado:', error);
      alert('Erro ao aprovar afiliado: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ativo': return 'text-green-400 bg-green-500/20';
      case 'pendente': return 'text-yellow-400 bg-yellow-500/20';
      case 'inativo': return 'text-gray-400 bg-gray-500/20';
      case 'bloqueado': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  // Estatisticas
  const totalAtivos = afiliados.filter(a => a.status === 'ativo').length;
  const totalPendentes = afiliados.filter(a => a.status === 'pendente').length;
  const totalComissoes = afiliados.reduce((sum, a) => sum + (a.total_comissoes_geradas || 0), 0);
  const totalVendas = afiliados.reduce((sum, a) => sum + (a.total_vendas || 0), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Gestao de Afiliados</h2>
          <p className="text-gray-400">{total} afiliados no programa</p>
        </div>
      </div>

      {/* Cards de Metricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <UserCheck className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{totalAtivos}</p>
              <p className="text-xs text-gray-400">Afiliados Ativos</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/20">
              <Clock className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{totalPendentes}</p>
              <p className="text-xs text-gray-400">Aguardando Aprovacao</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <TrendingUp className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{totalVendas}</p>
              <p className="text-xs text-gray-400">Total de Vendas</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <DollarSign className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                R$ {totalComissoes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-400">Comissoes Geradas</p>
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
          <option value="ativo">Ativos</option>
          <option value="pendente">Pendentes</option>
          <option value="inativo">Inativos</option>
          <option value="bloqueado">Bloqueados</option>
        </select>

        <button onClick={carregarAfiliados} className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10">
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>

      {/* Tabela */}
      <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Afiliado</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Codigo</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Status</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Clicks</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Cadastros</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Vendas</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Comissoes</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Saldo</th>
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
            ) : afiliados.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-4 py-8 text-center text-gray-400">
                  Nenhum afiliado encontrado
                </td>
              </tr>
            ) : (
              afiliados.map((afiliado) => (
                <tr key={afiliado.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold">
                        {afiliado.nome_completo?.charAt(0)?.toUpperCase() || afiliado.usuario_nome?.charAt(0)?.toUpperCase() || 'A'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{afiliado.nome_completo || afiliado.usuario_nome}</p>
                        <p className="text-xs text-gray-400">{afiliado.usuario_email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link2 className="h-4 w-4 text-gray-400" />
                      <code className="text-sm text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
                        {afiliado.chave_referencia}
                      </code>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getStatusColor(afiliado.status)}`}>
                      {afiliado.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm text-white">{afiliado.total_clicks || 0}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm text-white">{afiliado.total_cadastros || 0}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm font-bold text-green-400">{afiliado.total_vendas || 0}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm text-white">
                      R$ {(afiliado.total_comissoes_geradas || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-bold text-green-400">
                      R$ {(afiliado.saldo_disponivel || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {afiliado.status === 'pendente' && (
                        <button
                          onClick={() => handleAprovar(afiliado.id)}
                          className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 text-xs font-medium transition-colors"
                        >
                          Aprovar
                        </button>
                      )}
                      <button className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
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
          Mostrando {afiliados.length} de {total} afiliados
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

export default AfiliadosAdmin;
