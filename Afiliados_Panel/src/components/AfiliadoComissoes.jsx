import { useState, useEffect } from 'react';
import {
  DollarSign, TrendingUp, Clock, CheckCircle,
  XCircle, Filter, Calendar, Download, Search
} from 'lucide-react';

export function AfiliadoComissoes() {
  const [comissoes, setComissoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    status: '',
    tipo: '',
    page: 1
  });
  const [pagination, setPagination] = useState(null);
  const [totais, setTotais] = useState({
    pendentes: 0,
    aprovadas: 0,
    pagas: 0,
    total: 0
  });

  useEffect(() => {
    carregarComissoes();
  }, [filtros]);

  const carregarComissoes = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (filtros.status) params.append('status', filtros.status);
      if (filtros.tipo) params.append('tipo', filtros.tipo);
      params.append('page', filtros.page);

      const res = await fetch(`http://localhost:5000/api/afiliados/comissoes?${params}`, {
        credentials: 'include'
      });

      const data = await res.json();

      if (data.success) {
        setComissoes(data.comissoes);
        setPagination(data.pagination);
        calcularTotais(data.comissoes);
      }
    } catch (error) {
      console.error('[ERRO] Ao carregar comissões:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularTotais = (comissoesData) => {
    const pendentes = comissoesData
      .filter(c => c.status === 'pendente')
      .reduce((sum, c) => sum + c.valor, 0);

    const aprovadas = comissoesData
      .filter(c => c.status === 'aprovada')
      .reduce((sum, c) => sum + c.valor, 0);

    const pagas = comissoesData
      .filter(c => c.status === 'paga')
      .reduce((sum, c) => sum + c.valor, 0);

    const total = comissoesData.reduce((sum, c) => sum + c.valor, 0);

    setTotais({ pendentes, aprovadas, pagas, total });
  };

  const getStatusBadge = (status) => {
    const badges = {
      pendente: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      aprovada: 'bg-green-500/20 text-green-400 border-green-500/30',
      paga: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      cancelada: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return badges[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const getTipoBadge = (tipo) => {
    const badges = {
      primeira_venda: 'bg-purple-500/20 text-purple-400',
      recorrente: 'bg-cyan-500/20 text-cyan-400',
      bonus: 'bg-orange-500/20 text-orange-400'
    };
    return badges[tipo] || 'bg-gray-500/20 text-gray-400';
  };

  const getTipoLabel = (tipo) => {
    const labels = {
      primeira_venda: 'Primeira Venda',
      recorrente: 'Recorrente',
      bonus: 'Bônus'
    };
    return labels[tipo] || tipo;
  };

  if (loading && comissoes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Minhas Comissões</h1>
          <p className="text-gray-400">Acompanhe suas comissões e ganhos</p>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-lg bg-yellow-500/20">
              <Clock className="h-5 w-5 text-yellow-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mb-1">
            R$ {totais.pendentes.toFixed(2)}
          </p>
          <p className="text-sm text-gray-400">Pendentes</p>
        </div>

        <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mb-1">
            R$ {totais.aprovadas.toFixed(2)}
          </p>
          <p className="text-sm text-gray-400">Aprovadas</p>
        </div>

        <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <DollarSign className="h-5 w-5 text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mb-1">
            R$ {totais.pagas.toFixed(2)}
          </p>
          <p className="text-sm text-gray-400">Pagas</p>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-lg bg-green-500/30">
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mb-1">
            R$ {totais.total.toFixed(2)}
          </p>
          <p className="text-sm text-gray-400">Total do Período</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filtros.status}
          onChange={(e) => setFiltros({ ...filtros, status: e.target.value, page: 1 })}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-green-500/50"
        >
          <option value="">Todos os Status</option>
          <option value="pendente">Pendente</option>
          <option value="aprovada">Aprovada</option>
          <option value="paga">Paga</option>
          <option value="cancelada">Cancelada</option>
        </select>

        <select
          value={filtros.tipo}
          onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value, page: 1 })}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-green-500/50"
        >
          <option value="">Todos os Tipos</option>
          <option value="primeira_venda">Primeira Venda</option>
          <option value="recorrente">Recorrente</option>
          <option value="bonus">Bônus</option>
        </select>
      </div>

      {/* Tabela de Comissões */}
      <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-sm font-semibold text-gray-400">Data</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-400">Tipo</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-400">Descrição</th>
                <th className="text-right p-4 text-sm font-semibold text-gray-400">Base</th>
                <th className="text-right p-4 text-sm font-semibold text-gray-400">%</th>
                <th className="text-right p-4 text-sm font-semibold text-gray-400">Valor</th>
                <th className="text-center p-4 text-sm font-semibold text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {comissoes.map((comissao) => (
                <tr key={comissao.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="text-sm text-white">
                      {new Date(comissao.data_geracao).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(comissao.data_geracao).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded ${getTipoBadge(comissao.tipo)}`}>
                      {getTipoLabel(comissao.tipo)}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-white max-w-xs truncate">
                      {comissao.descricao || '-'}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="text-sm text-gray-400">
                      R$ {comissao.valor_base?.toFixed(2) || '-'}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="text-sm text-gray-400">
                      {comissao.percentual || '-'}%
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="text-lg font-bold text-green-400">
                      R$ {comissao.valor.toFixed(2)}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center">
                      <span className={`text-xs px-3 py-1 rounded-full border ${getStatusBadge(comissao.status)}`}>
                        {comissao.status}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {comissoes.length === 0 && (
          <div className="p-12 text-center">
            <DollarSign className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Nenhuma comissão encontrada</p>
          </div>
        )}
      </div>

      {/* Paginação */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setFiltros({ ...filtros, page: filtros.page - 1 })}
            disabled={filtros.page === 1}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-400">
            Página {filtros.page} de {pagination.pages}
          </span>
          <button
            onClick={() => setFiltros({ ...filtros, page: filtros.page + 1 })}
            disabled={filtros.page === pagination.pages}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}
