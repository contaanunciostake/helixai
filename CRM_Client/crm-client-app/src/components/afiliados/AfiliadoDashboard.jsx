import { useState, useEffect } from 'react';
import {
  TrendingUp, DollarSign, Users, MousePointerClick,
  Copy, Check, ExternalLink, Calendar, ArrowUpRight,
  Award, Target, Zap
} from 'lucide-react';

export function AfiliadoDashboard() {
  const [afiliado, setAfiliado] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [linkCopiado, setLinkCopiado] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);

      // Carregar perfil do afiliado
      const resPerfil = await fetch('http://localhost:5000/api/afiliados/meu-perfil', {
        credentials: 'include'
      });
      const dataPerfil = await resPerfil.json();

      if (dataPerfil.success) {
        setAfiliado(dataPerfil.afiliado);
      }

      // Carregar dashboard
      const resDashboard = await fetch('http://localhost:5000/api/afiliados/dashboard?periodo_dias=30', {
        credentials: 'include'
      });
      const dataDashboard = await resDashboard.json();

      if (dataDashboard.success) {
        setDashboard(dataDashboard);
      }

    } catch (error) {
      console.error('[ERRO] Ao carregar dados do afiliado:', error);
    } finally {
      setLoading(false);
    }
  };

  const copiarLink = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/afiliados/meu-link', {
        credentials: 'include'
      });
      const data = await res.json();

      if (data.success) {
        await navigator.clipboard.writeText(data.link);
        setLinkCopiado(true);
        setTimeout(() => setLinkCopiado(false), 3000);
      }
    } catch (error) {
      console.error('[ERRO] Ao copiar link:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
      </div>
    );
  }

  if (!afiliado) {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto text-center">
          <Award className="h-16 w-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Programa de Afiliados AIRA</h2>
          <p className="text-gray-400 mb-6">
            Ganhe comissões indicando novos clientes para a AIRA
          </p>
          <button
            onClick={() => window.location.href = '#/afiliados/registrar'}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg hover:shadow-green-500/50 transition-all"
          >
            Quero ser Afiliado
          </button>
        </div>
      </div>
    );
  }

  const metricas = dashboard?.metricas;

  return (
    <div className="p-6 space-y-6">
      {/* Header com Link de Referência */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-cyan-500/10 border border-green-500/20 p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent"></div>

        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Meu Link de Afiliado</h2>
              <p className="text-gray-400">Compartilhe e ganhe comissões</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
              afiliado.status === 'ativo'
                ? 'bg-green-500/20 text-green-400'
                : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              {afiliado.status === 'ativo' ? 'Ativo' : 'Pendente'}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 bg-black/40 backdrop-blur-sm border border-green-500/30 rounded-xl px-4 py-3">
              <code className="text-green-400 text-sm">
                {`${window.location.origin}/r/${afiliado.chave_referencia}`}
              </code>
            </div>
            <button
              onClick={copiarLink}
              className="flex items-center gap-2 px-4 py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-xl text-green-400 transition-all"
            >
              {linkCopiado ? (
                <>
                  <Check className="h-5 w-5" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="h-5 w-5" />
                  Copiar
                </>
              )}
            </button>
          </div>

          {/* Comissões */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-black/40 backdrop-blur-sm border border-green-500/20 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Primeira Venda</p>
              <p className="text-lg font-bold text-green-400">
                {afiliado.comissao_primeira_venda}%
              </p>
            </div>
            <div className="bg-black/40 backdrop-blur-sm border border-green-500/20 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Recorrente</p>
              <p className="text-lg font-bold text-green-400">
                {afiliado.comissao_recorrente}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Clicks */}
        <div className="relative overflow-hidden rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <MousePointerClick className="h-5 w-5 text-blue-400" />
            </div>
            <span className="text-xs text-gray-400">Últimos 30 dias</span>
          </div>
          <p className="text-2xl font-bold text-white mb-1">
            {metricas?.periodo?.clicks || 0}
          </p>
          <p className="text-sm text-gray-400">Clicks</p>
          <p className="text-xs text-gray-500 mt-1">
            Total: {metricas?.total?.clicks || 0}
          </p>
        </div>

        {/* Cadastros */}
        <div className="relative overflow-hidden rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Users className="h-5 w-5 text-purple-400" />
            </div>
            <span className="text-xs text-gray-400">Últimos 30 dias</span>
          </div>
          <p className="text-2xl font-bold text-white mb-1">
            {metricas?.periodo?.cadastros || 0}
          </p>
          <p className="text-sm text-gray-400">Cadastros</p>
          <p className="text-xs text-gray-500 mt-1">
            Total: {metricas?.total?.cadastros || 0}
          </p>
        </div>

        {/* Vendas */}
        <div className="relative overflow-hidden rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <span className="text-xs text-gray-400">Últimos 30 dias</span>
          </div>
          <p className="text-2xl font-bold text-white mb-1">
            {metricas?.periodo?.vendas || 0}
          </p>
          <p className="text-sm text-gray-400">Vendas</p>
          <p className="text-xs text-green-400 mt-1">
            Taxa: {metricas?.periodo?.taxa_conversao || 0}%
          </p>
        </div>

        {/* Saldo */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-lg bg-green-500/30">
              <DollarSign className="h-5 w-5 text-green-400" />
            </div>
            <Zap className="h-5 w-5 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-white mb-1">
            R$ {(metricas?.total?.saldo_disponivel || 0).toFixed(2)}
          </p>
          <p className="text-sm text-gray-400">Saldo Disponível</p>
          <button className="mt-2 text-xs text-green-400 hover:text-green-300 flex items-center gap-1">
            <ExternalLink className="h-3 w-3" />
            Solicitar Saque
          </button>
        </div>
      </div>

      {/* Tabelas de Resumo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Últimas Referências */}
        <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-5">
          <h3 className="text-lg font-bold text-white mb-4">Últimas Referências</h3>
          <div className="space-y-3">
            {dashboard?.ultimas_referencias?.slice(0, 5).map(ref => (
              <div key={ref.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                <div>
                  <p className="text-sm font-medium text-white">
                    {ref.status === 'convertido' ? 'Venda' : ref.status === 'cadastro' ? 'Cadastro' : 'Click'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(ref.data_clique).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="text-right">
                  {ref.valor_compra && (
                    <p className="text-sm font-bold text-green-400">
                      R$ {ref.valor_compra.toFixed(2)}
                    </p>
                  )}
                  <span className={`text-xs px-2 py-1 rounded ${
                    ref.status === 'convertido' ? 'bg-green-500/20 text-green-400' :
                    ref.status === 'cadastro' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {ref.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Últimas Comissões */}
        <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-5">
          <h3 className="text-lg font-bold text-white mb-4">Últimas Comissões</h3>
          <div className="space-y-3">
            {dashboard?.ultimas_comissoes?.slice(0, 5).map(com => (
              <div key={com.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                <div>
                  <p className="text-sm font-medium text-white">
                    R$ {com.valor.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(com.data_geracao).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  com.status === 'aprovada' ? 'bg-green-500/20 text-green-400' :
                  com.status === 'paga' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {com.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
