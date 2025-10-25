import { useState, useEffect } from 'react';
import {
  DollarSign, CreditCard, CheckCircle, XCircle,
  Clock, AlertTriangle, TrendingUp, Wallet,
  Send, X
} from 'lucide-react';

export function AfiliadoSaques() {
  const [saques, setSaques] = useState([]);
  const [saldoDisponivel, setSaldoDisponivel] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModalSaque, setShowModalSaque] = useState(false);
  const [valorSaque, setValorSaque] = useState('');
  const [metodoPagamento, setMetodoPagamento] = useState('pix');
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState('');
  const [config, setConfig] = useState(null);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);

      // Carregar saques
      const resSaques = await fetch('http://localhost:5000/api/afiliados/saques', {
        credentials: 'include'
      });
      const dataSaques = await resSaques.json();

      if (dataSaques.success) {
        setSaques(dataSaques.saques);
        setSaldoDisponivel(dataSaques.saldo_disponivel);
      }

      // Carregar perfil para pegar configurações
      const resPerfil = await fetch('http://localhost:5000/api/afiliados/meu-perfil', {
        credentials: 'include'
      });
      const dataPerfil = await resPerfil.json();

      if (dataPerfil.success) {
        setConfig(dataPerfil.configuracao);
      }

    } catch (error) {
      console.error('[ERRO] Ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const solicitarSaque = async (e) => {
    e.preventDefault();
    setErro('');

    const valor = parseFloat(valorSaque);

    if (!valor || valor <= 0) {
      setErro('Valor inválido');
      return;
    }

    if (config && valor < config.minimo_saque) {
      setErro(`Valor mínimo para saque é R$ ${config.minimo_saque.toFixed(2)}`);
      return;
    }

    if (valor > saldoDisponivel) {
      setErro('Saldo insuficiente');
      return;
    }

    try {
      setProcessando(true);

      const res = await fetch('http://localhost:5000/api/afiliados/solicitar-saque', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          valor,
          metodo_pagamento: metodoPagamento
        })
      });

      const data = await res.json();

      if (data.success) {
        setShowModalSaque(false);
        setValorSaque('');
        carregarDados();
        alert('Saque solicitado com sucesso!');
      } else {
        setErro(data.message || 'Erro ao solicitar saque');
      }

    } catch (error) {
      console.error('[ERRO] Ao solicitar saque:', error);
      setErro('Erro ao processar solicitação');
    } finally {
      setProcessando(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pendente: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', icon: Clock },
      aprovado: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', icon: CheckCircle },
      pago: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', icon: CheckCircle },
      rejeitado: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', icon: XCircle }
    };
    return badges[status] || badges.pendente;
  };

  const calcularTotais = () => {
    const pendente = saques.filter(s => s.status === 'pendente').reduce((sum, s) => sum + s.valor_solicitado, 0);
    const aprovado = saques.filter(s => s.status === 'aprovado').reduce((sum, s) => sum + s.valor_solicitado, 0);
    const pago = saques.filter(s => s.status === 'pago').reduce((sum, s) => sum + s.valor_pago, 0);
    return { pendente, aprovado, pago };
  };

  const totais = calcularTotais();

  if (loading) {
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
          <h1 className="text-2xl font-bold text-white mb-1">Saques</h1>
          <p className="text-gray-400">Gerencie seus saques e pagamentos</p>
        </div>
        <button
          onClick={() => setShowModalSaque(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg hover:shadow-green-500/50 transition-all"
        >
          <Send className="h-5 w-5" />
          Solicitar Saque
        </button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-lg bg-green-500/30">
              <Wallet className="h-5 w-5 text-green-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mb-1">
            R$ {saldoDisponivel.toFixed(2)}
          </p>
          <p className="text-sm text-gray-400">Saldo Disponível</p>
        </div>

        <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-lg bg-yellow-500/20">
              <Clock className="h-5 w-5 text-yellow-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mb-1">
            R$ {totais.pendente.toFixed(2)}
          </p>
          <p className="text-sm text-gray-400">Pendente</p>
        </div>

        <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mb-1">
            R$ {totais.aprovado.toFixed(2)}
          </p>
          <p className="text-sm text-gray-400">Aprovado</p>
        </div>

        <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <DollarSign className="h-5 w-5 text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mb-1">
            R$ {totais.pago.toFixed(2)}
          </p>
          <p className="text-sm text-gray-400">Total Pago</p>
        </div>
      </div>

      {/* Informações */}
      {config && (
        <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-blue-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-blue-400 font-medium mb-1">Informações sobre saques</p>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• Valor mínimo para saque: R$ {config.minimo_saque.toFixed(2)}</li>
                <li>• Prazo de aprovação: até {config.prazo_aprovacao_comissao_dias} dias úteis</li>
                <li>• Comissões ficam disponíveis após {config.prazo_aprovacao_comissao_dias} dias da venda</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tabela de Saques */}
      <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-sm font-semibold text-gray-400">ID</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-400">Data Solicitação</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-400">Método</th>
                <th className="text-right p-4 text-sm font-semibold text-gray-400">Valor Solicitado</th>
                <th className="text-right p-4 text-sm font-semibold text-gray-400">Valor Pago</th>
                <th className="text-center p-4 text-sm font-semibold text-gray-400">Status</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-400">Data Pagamento</th>
              </tr>
            </thead>
            <tbody>
              {saques.map((saque) => {
                const statusInfo = getStatusBadge(saque.status);
                const StatusIcon = statusInfo.icon;

                return (
                  <tr key={saque.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="text-sm text-gray-400">#{saque.id}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-white">
                        {new Date(saque.data_solicitacao).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(saque.data_solicitacao).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-white capitalize">
                        {saque.metodo_pagamento}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="text-sm font-semibold text-white">
                        R$ {saque.valor_solicitado.toFixed(2)}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="text-sm font-semibold text-green-400">
                        {saque.valor_pago ? `R$ ${saque.valor_pago.toFixed(2)}` : '-'}
                      </div>
                      {saque.taxa > 0 && (
                        <div className="text-xs text-gray-400">
                          Taxa: R$ {saque.taxa.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <span className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
                          <StatusIcon className="h-3 w-3" />
                          {saque.status}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      {saque.data_pagamento ? (
                        <div className="text-sm text-white">
                          {new Date(saque.data_pagamento).toLocaleDateString('pt-BR')}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">-</div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {saques.length === 0 && (
          <div className="p-12 text-center">
            <Wallet className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">Nenhum saque encontrado</p>
            <p className="text-sm text-gray-500">Suas solicitações de saque aparecerão aqui</p>
          </div>
        )}
      </div>

      {/* Modal de Solicitar Saque */}
      {showModalSaque && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-white/10 rounded-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowModalSaque(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Solicitar Saque</h2>
              <p className="text-gray-400 text-sm">
                Saldo disponível: <span className="text-green-400 font-semibold">R$ {saldoDisponivel.toFixed(2)}</span>
              </p>
            </div>

            <form onSubmit={solicitarSaque} className="space-y-4">
              {erro && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-400">{erro}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Valor do Saque
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    min={config?.minimo_saque || 0}
                    max={saldoDisponivel}
                    value={valorSaque}
                    onChange={(e) => setValorSaque(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-green-500/50"
                    placeholder="0,00"
                    required
                  />
                </div>
                {config && (
                  <p className="mt-1 text-xs text-gray-500">
                    Mínimo: R$ {config.minimo_saque.toFixed(2)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Método de Pagamento
                </label>
                <select
                  value={metodoPagamento}
                  onChange={(e) => setMetodoPagamento(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-green-500/50"
                >
                  <option value="pix">PIX</option>
                  <option value="transferencia">Transferência Bancária</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModalSaque(false)}
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={processando}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg hover:shadow-green-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processando ? 'Processando...' : 'Solicitar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
