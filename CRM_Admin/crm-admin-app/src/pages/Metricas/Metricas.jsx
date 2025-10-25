import { DashboardLayout } from '../Dashboard/components/DashboardLayout';
import { Activity, TrendingUp, TrendingDown, Users, DollarSign, ShoppingCart, Target, Clock } from 'lucide-react';

export function Metricas() {
  const metricas = [
    {
      titulo: 'Receita Total',
      valor: 'R$ 2.4M',
      variacao: '+18.2%',
      tipo: 'positivo',
      icone: DollarSign,
      cor: 'green',
      meta: '85% da meta mensal'
    },
    {
      titulo: 'Novos Leads',
      valor: '342',
      variacao: '+12.5%',
      tipo: 'positivo',
      icone: Users,
      cor: 'blue',
      meta: '92% da meta mensal'
    },
    {
      titulo: 'Taxa de Conversão',
      valor: '24.3%',
      variacao: '+3.1%',
      tipo: 'positivo',
      icone: Target,
      cor: 'purple',
      meta: 'Acima da meta (22%)'
    },
    {
      titulo: 'Ticket Médio',
      valor: 'R$ 82k',
      variacao: '+5.4%',
      tipo: 'positivo',
      icone: ShoppingCart,
      cor: 'orange',
      meta: 'No target'
    },
    {
      titulo: 'Tempo Médio Resposta',
      valor: '2.4 min',
      variacao: '-15.3%',
      tipo: 'positivo',
      icone: Clock,
      cor: 'cyan',
      meta: 'Abaixo da meta (3min)'
    },
    {
      titulo: 'Propostas Aprovadas',
      valor: '89',
      variacao: '+8.9%',
      tipo: 'positivo',
      icone: Activity,
      cor: 'green',
      meta: '57% taxa de aprovação'
    }
  ];

  const kpis = [
    {
      categoria: 'Vendas',
      indicadores: [
        { nome: 'Vendas do Mês', atual: 34, meta: 40, unidade: 'vendas', progresso: 85 },
        { nome: 'Receita do Mês', atual: 2400000, meta: 2800000, unidade: 'R$', progresso: 86 },
        { nome: 'Ticket Médio', atual: 82000, meta: 78000, unidade: 'R$', progresso: 105 }
      ]
    },
    {
      categoria: 'Marketing',
      indicadores: [
        { nome: 'Leads Captados', atual: 342, meta: 370, unidade: 'leads', progresso: 92 },
        { nome: 'Taxa de Conversão', atual: 24.3, meta: 22, unidade: '%', progresso: 110 },
        { nome: 'Custo por Lead', atual: 45, meta: 50, unidade: 'R$', progresso: 111 }
      ]
    },
    {
      categoria: 'Atendimento',
      indicadores: [
        { nome: 'Tempo Médio Resposta', atual: 2.4, meta: 3, unidade: 'min', progresso: 125 },
        { nome: 'Satisfação Cliente', atual: 4.7, meta: 4.5, unidade: '/5', progresso: 104 },
        { nome: 'Atendimentos/Dia', atual: 87, meta: 80, unidade: 'atend', progresso: 109 }
      ]
    },
    {
      categoria: 'Financeiro',
      indicadores: [
        { nome: 'Inadimplência', atual: 3.2, meta: 5, unidade: '%', progresso: 156 },
        { nome: 'Contratos Ativos', atual: 189, meta: 180, unidade: 'contr', progresso: 105 },
        { nome: 'Margem de Lucro', atual: 28.5, meta: 25, unidade: '%', progresso: 114 }
      ]
    }
  ];

  const formatarValor = (valor, unidade) => {
    if (unidade === 'R$') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0
      }).format(valor);
    }
    return `${valor} ${unidade}`;
  };

  const getCorProgresso = (progresso) => {
    if (progresso >= 100) return 'bg-green-500';
    if (progresso >= 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Métricas</h1>
          <p className="text-gray-400">Acompanhe KPIs e indicadores de performance em tempo real</p>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metricas.map((metrica, index) => {
            const Icone = metrica.icone;
            const VariacaoIcone = metrica.tipo === 'positivo' ? TrendingUp : TrendingDown;
            return (
              <div key={index} className="bg-[#1a2332] border border-[#2d3748] rounded-lg p-4 hover:border-blue-500/30 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-400 text-sm">{metrica.titulo}</span>
                  <Icone className={`h-5 w-5 text-${metrica.cor}-500`} />
                </div>
                <div className="text-3xl font-bold text-white mb-2">{metrica.valor}</div>
                <div className="flex items-center justify-between">
                  <span className={`flex items-center gap-1 text-sm ${metrica.tipo === 'positivo' ? 'text-green-400' : 'text-red-400'}`}>
                    <VariacaoIcone className="h-4 w-4" />
                    {metrica.variacao}
                  </span>
                  <span className="text-xs text-gray-500">{metrica.meta}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* KPIs por Categoria */}
        {kpis.map((kpi, index) => (
          <div key={index} className="bg-[#1a2332] border border-[#2d3748] rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              {kpi.categoria}
            </h3>
            <div className="space-y-4">
              {kpi.indicadores.map((indicador, idx) => (
                <div key={idx} className="bg-[#0f1419] border border-[#2d3748] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{indicador.nome}</span>
                    <span className={`text-sm px-2 py-1 rounded ${indicador.progresso >= 100 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {indicador.progresso}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                    <span>Atual: <span className="text-white font-semibold">{formatarValor(indicador.atual, indicador.unidade)}</span></span>
                    <span>Meta: <span className="text-white font-semibold">{formatarValor(indicador.meta, indicador.unidade)}</span></span>
                  </div>
                  <div className="w-full bg-[#2d3748] rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${getCorProgresso(indicador.progresso)}`}
                      style={{ width: `${Math.min(indicador.progresso, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Comparativo Mensal */}
        <div className="bg-[#1a2332] border border-[#2d3748] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Comparativo Mensal</h3>
          <div className="grid grid-cols-12 gap-2">
            {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'].map((mes, index) => {
              const valores = [72, 68, 85, 78, 92, 88, 95, 91, 87, 94, 89, 96];
              const valor = valores[index];
              return (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div className="w-full h-32 bg-[#0f1419] border border-[#2d3748] rounded-lg flex items-end p-1">
                    <div
                      className="w-full bg-gradient-to-t from-blue-500 to-blue-600 rounded"
                      style={{ height: `${valor}%` }}
                      title={`${valor}%`}
                    />
                  </div>
                  <span className="text-xs text-gray-400">{mes}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Metricas;
