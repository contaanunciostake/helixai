import { useState, useEffect } from 'react';
import {
  DollarSign, Search, Filter, ChevronLeft, ChevronRight, RefreshCw,
  CreditCard, Smartphone, FileText, CheckCircle, Clock, XCircle,
  ArrowUpRight, TrendingUp, Calendar, Building2
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';

export function PagamentosAdmin() {
  const [pagamentos, setPagamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    carregarPagamentos();
  }, [page]);

  const carregarPagamentos = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getPagamentos({ page });

      if (response.success) {
        setPagamentos(response.data.pagamentos);
        setTotal(response.data.total);
      }
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-400 bg-green-500/20';
      case 'pending': return 'text-yellow-400 bg-yellow-500/20';
      case 'rejected': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'approved': return 'Aprovado';
      case 'pending': return 'Pendente';
      case 'rejected': return 'Rejeitado';
      default: return status;
    }
  };

  const getMetodoIcon = (metodo) => {
    switch (metodo) {
      case 'credit_card': return CreditCard;
      case 'pix': return Smartphone;
      case 'boleto': return FileText;
      default: return DollarSign;
    }
  };

  const getMetodoLabel = (metodo) => {
    switch (metodo) {
      case 'credit_card': return 'Cartao';
      case 'pix': return 'PIX';
      case 'boleto': return 'Boleto';
      default: return metodo;
    }
  };

  // Calculos
  const totalAprovado = pagamentos.filter(p => p.status === 'approved').reduce((sum, p) => sum + p.valor, 0);
  const totalPendente = pagamentos.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.valor, 0);
  const taxaAprovacao = pagamentos.length > 0
    ? Math.round((pagamentos.filter(p => p.status === 'approved').length / pagamentos.length) * 100)
    : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Pagamentos</h2>
          <p className="text-gray-400">Historico de transacoes</p>
        </div>

        <button onClick={carregarPagamentos} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10">
          <RefreshCw className="h-5 w-5" />
          Atualizar
        </button>
      </div>

      {/* Cards de Metricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                R$ {totalAprovado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-400">Total Aprovado</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/20">
              <Clock className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                R$ {totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-400">Pendente</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <TrendingUp className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{taxaAprovacao}%</p>
              <p className="text-xs text-gray-400">Taxa de Aprovacao</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <DollarSign className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{total}</p>
              <p className="text-xs text-gray-400">Total Transacoes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Empresa</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Valor</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Metodo</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Data</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto" />
                </td>
              </tr>
            ) : pagamentos.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-gray-400">
                  Nenhum pagamento encontrado
                </td>
              </tr>
            ) : (
              pagamentos.map((pagamento) => {
                const MetodoIcon = getMetodoIcon(pagamento.metodo);

                return (
                  <tr key={pagamento.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-400">#{pagamento.id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/20">
                          <Building2 className="h-4 w-4 text-purple-400" />
                        </div>
                        <span className="text-sm text-white">{pagamento.empresa_nome}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-bold text-white">
                        R$ {pagamento.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex items-center gap-2 px-2 py-1 rounded bg-white/5">
                        <MetodoIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-xs text-gray-300">{getMetodoLabel(pagamento.metodo)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(pagamento.status)}`}>
                        {getStatusLabel(pagamento.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Calendar className="h-4 w-4" />
                        {new Date(pagamento.data).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Info */}
      <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
        <p className="text-sm text-blue-400">
          Os pagamentos sao processados pelo Mercado Pago. Para detalhes completos, acesse o painel do Mercado Pago.
        </p>
      </div>
    </div>
  );
}

export default PagamentosAdmin;
