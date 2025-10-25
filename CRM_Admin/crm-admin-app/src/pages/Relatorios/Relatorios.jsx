import { useState } from 'react';
import { DashboardLayout } from '../Dashboard/components/DashboardLayout';
import { BarChart3, Download, Calendar, TrendingUp, Users, DollarSign, Package, FileText } from 'lucide-react';

export function Relatorios() {
  const [periodoSelecionado, setPeriodoSelecionado] = useState('mensal');

  const estatisticas = [
    {
      titulo: 'Vendas Totais',
      valor: 'R$ 2.4M',
      icone: DollarSign,
      cor: 'green',
      variacao: '+18% vs período anterior'
    },
    {
      titulo: 'Novos Clientes',
      valor: '127',
      icone: Users,
      cor: 'blue',
      variacao: '+12% vs período anterior'
    },
    {
      titulo: 'Taxa de Conversão',
      valor: '24%',
      icone: TrendingUp,
      cor: 'purple',
      variacao: '+3% vs período anterior'
    },
    {
      titulo: 'Ticket Médio',
      valor: 'R$ 82k',
      icone: Package,
      cor: 'orange',
      variacao: '+5% vs período anterior'
    }
  ];

  const relatorios = [
    {
      id: 1,
      titulo: 'Relatório de Vendas Mensal',
      descricao: 'Análise completa das vendas realizadas no último mês',
      tipo: 'Vendas',
      periodo: 'Janeiro 2024',
      dataGeracao: '2024-02-01',
      tamanho: '2.4 MB',
      formato: 'PDF'
    },
    {
      id: 2,
      titulo: 'Relatório de Leads',
      descricao: 'Performance de captação e conversão de leads',
      tipo: 'Marketing',
      periodo: 'Janeiro 2024',
      dataGeracao: '2024-02-01',
      tamanho: '1.8 MB',
      formato: 'PDF'
    },
    {
      id: 3,
      titulo: 'Relatório Financeiro',
      descricao: 'Demonstrativo de receitas, despesas e lucro',
      tipo: 'Financeiro',
      periodo: 'Q4 2023',
      dataGeracao: '2024-01-15',
      tamanho: '3.2 MB',
      formato: 'Excel'
    },
    {
      id: 4,
      titulo: 'Relatório de Estoque',
      descricao: 'Status de veículos e imóveis disponíveis',
      tipo: 'Estoque',
      periodo: 'Janeiro 2024',
      dataGeracao: '2024-02-01',
      tamanho: '1.5 MB',
      formato: 'PDF'
    },
    {
      id: 5,
      titulo: 'Relatório de Performance de Equipe',
      descricao: 'Métricas individuais e coletivas dos vendedores',
      tipo: 'RH',
      periodo: 'Janeiro 2024',
      dataGeracao: '2024-02-01',
      tamanho: '2.1 MB',
      formato: 'PDF'
    },
    {
      id: 6,
      titulo: 'Relatório de Conversas',
      descricao: 'Análise de atendimentos via WhatsApp e outros canais',
      tipo: 'Atendimento',
      periodo: 'Janeiro 2024',
      dataGeracao: '2024-02-01',
      tamanho: '1.9 MB',
      formato: 'PDF'
    },
    {
      id: 7,
      titulo: 'Relatório de Propostas',
      descricao: 'Taxa de aprovação e rejeição de propostas comerciais',
      tipo: 'Vendas',
      periodo: 'Janeiro 2024',
      dataGeracao: '2024-02-01',
      tamanho: '1.6 MB',
      formato: 'PDF'
    },
    {
      id: 8,
      titulo: 'Relatório de Contratos',
      descricao: 'Status de assinaturas e inadimplência',
      tipo: 'Financeiro',
      periodo: 'Janeiro 2024',
      dataGeracao: '2024-02-01',
      tamanho: '2.3 MB',
      formato: 'PDF'
    }
  ];

  const getTipoBadge = (tipo) => {
    const cores = {
      'Vendas': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Marketing': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Financeiro': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'Estoque': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'RH': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      'Atendimento': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    };
    return cores[tipo] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const formatarData = (dataString) => {
    return new Date(dataString + 'T00:00:00').toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Relatórios</h1>
            <p className="text-gray-400">Acesse e exporte relatórios detalhados do sistema</p>
          </div>
          <div className="flex gap-3">
            <select
              value={periodoSelecionado}
              onChange={(e) => setPeriodoSelecionado(e.target.value)}
              className="px-4 py-2 bg-[#1a2332] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="semanal">Última Semana</option>
              <option value="mensal">Último Mês</option>
              <option value="trimestral">Último Trimestre</option>
              <option value="anual">Último Ano</option>
            </select>
            <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition-colors">
              <FileText className="h-4 w-4" />
              Gerar Novo Relatório
            </button>
          </div>
        </div>

        {/* Estatísticas do Período */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {estatisticas.map((stat, index) => {
            const Icone = stat.icone;
            return (
              <div key={index} className="bg-[#1a2332] border border-[#2d3748] rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">{stat.titulo}</span>
                  <Icone className={`h-5 w-5 text-${stat.cor}-500`} />
                </div>
                <div className="text-2xl font-bold text-white mb-1">{stat.valor}</div>
                <div className="text-xs text-gray-500">{stat.variacao}</div>
              </div>
            );
          })}
        </div>

        {/* Gráfico Simulado */}
        <div className="bg-[#1a2332] border border-[#2d3748] rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Vendas por Período</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-sm">
                Vendas
              </button>
              <button className="px-3 py-1 bg-[#0f1419] text-gray-400 border border-[#2d3748] rounded text-sm hover:bg-[#1a2332]">
                Leads
              </button>
              <button className="px-3 py-1 bg-[#0f1419] text-gray-400 border border-[#2d3748] rounded text-sm hover:bg-[#1a2332]">
                Receita
              </button>
            </div>
          </div>
          <div className="h-64 flex items-end justify-between gap-2">
            {[65, 78, 45, 82, 91, 73, 88, 95, 67, 89, 92, 85].map((value, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-blue-500 to-blue-600 rounded-t hover:from-blue-600 hover:to-blue-700 transition-colors cursor-pointer"
                  style={{ height: `${value}%` }}
                  title={`${value}%`}
                />
                <span className="text-xs text-gray-500">
                  {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][index]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Lista de Relatórios Disponíveis */}
        <div className="bg-[#1a2332] border border-[#2d3748] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Relatórios Disponíveis</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {relatorios.map((relatorio) => (
              <div
                key={relatorio.id}
                className="bg-[#0f1419] border border-[#2d3748] rounded-lg p-4 hover:border-blue-500/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                      <BarChart3 className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium mb-1">{relatorio.titulo}</h4>
                      <p className="text-sm text-gray-400 mb-2">{relatorio.descricao}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getTipoBadge(relatorio.tipo)}`}>
                          {relatorio.tipo}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {relatorio.periodo}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#2d3748]">
                  <div className="text-xs text-gray-500">
                    <div>Gerado: {formatarData(relatorio.dataGeracao)}</div>
                    <div>{relatorio.formato} • {relatorio.tamanho}</div>
                  </div>
                  <button className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm flex items-center gap-2 transition-colors">
                    <Download className="h-4 w-4" />
                    Baixar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Relatorios;
