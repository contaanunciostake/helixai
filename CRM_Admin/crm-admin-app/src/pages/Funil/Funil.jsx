import { useState } from 'react';
import { DashboardLayout } from '../Dashboard/components/DashboardLayout';
import { TrendingUp, DollarSign, Target, Users, Phone, Mail, Calendar } from 'lucide-react';

export function Funil() {
  const estatisticas = [
    {
      titulo: 'Oportunidades Ativas',
      valor: '87',
      icone: Target,
      cor: 'blue',
      variacao: '+12 esta semana'
    },
    {
      titulo: 'Valor em Negociação',
      valor: 'R$ 4.2M',
      icone: DollarSign,
      cor: 'green',
      variacao: 'Ticket médio R$ 48k'
    },
    {
      titulo: 'Taxa de Conversão',
      valor: '24%',
      icone: TrendingUp,
      cor: 'purple',
      variacao: '+3% vs mês anterior'
    },
    {
      titulo: 'Vendas este Mês',
      valor: '23',
      icone: Users,
      cor: 'orange',
      variacao: 'R$ 1.1M em vendas'
    }
  ];

  const colunas = [
    {
      id: 'lead',
      titulo: 'Novo Lead',
      cor: 'blue',
      oportunidades: [
        {
          id: 1,
          cliente: 'João Silva',
          produto: 'Toyota Corolla XEI 2023',
          valor: 145900,
          dias: 2,
          contato: '(11) 98765-4321',
          origem: 'WhatsApp'
        },
        {
          id: 2,
          cliente: 'Ana Costa',
          produto: 'Apto 3 Dorms - Jardins',
          valor: 850000,
          dias: 1,
          contato: '(11) 91234-5678',
          origem: 'Site'
        },
        {
          id: 3,
          cliente: 'Pedro Oliveira',
          produto: 'Honda Civic Touring',
          valor: 189900,
          dias: 3,
          contato: '(11) 99876-5432',
          origem: 'Instagram'
        }
      ]
    },
    {
      id: 'qualificacao',
      titulo: 'Qualificação',
      cor: 'yellow',
      oportunidades: [
        {
          id: 4,
          cliente: 'Maria Santos',
          produto: 'Casa Alphaville',
          valor: 1850000,
          dias: 5,
          contato: '(11) 97654-3210',
          origem: 'Indicação'
        },
        {
          id: 5,
          cliente: 'Carlos Mendes',
          produto: 'VW T-Cross Highline',
          valor: 135000,
          dias: 4,
          contato: '(11) 96543-2109',
          origem: 'WhatsApp'
        },
        {
          id: 6,
          cliente: 'Juliana Rocha',
          produto: 'Cobertura Vila Madalena',
          valor: 1450000,
          dias: 6,
          contato: '(11) 95432-1098',
          origem: 'Site'
        }
      ]
    },
    {
      id: 'proposta',
      titulo: 'Proposta Enviada',
      cor: 'purple',
      oportunidades: [
        {
          id: 7,
          cliente: 'Roberto Lima',
          produto: 'Jeep Compass Limited',
          valor: 165000,
          dias: 8,
          contato: '(11) 94321-0987',
          origem: 'WhatsApp'
        },
        {
          id: 8,
          cliente: 'Fernanda Alves',
          produto: 'Apto 2 Dorms - Moema',
          valor: 720000,
          dias: 7,
          contato: '(11) 93210-9876',
          origem: 'Facebook'
        },
        {
          id: 9,
          cliente: 'Ricardo Souza',
          produto: 'Hyundai Creta Ultimate',
          valor: 152000,
          dias: 9,
          contato: '(11) 92109-8765',
          origem: 'Site'
        },
        {
          id: 10,
          cliente: 'Patricia Dias',
          produto: 'Sala Comercial Faria Lima',
          valor: 680000,
          dias: 10,
          contato: '(11) 91098-7654',
          origem: 'Indicação'
        }
      ]
    },
    {
      id: 'negociacao',
      titulo: 'Negociação',
      cor: 'orange',
      oportunidades: [
        {
          id: 11,
          cliente: 'Marcos Ferreira',
          produto: 'Fiat Toro Volcano',
          valor: 178000,
          dias: 12,
          contato: '(11) 90987-6543',
          origem: 'WhatsApp'
        },
        {
          id: 12,
          cliente: 'Luciana Martins',
          produto: 'Casa Morumbi',
          valor: 1200000,
          dias: 15,
          contato: '(11) 89876-5432',
          origem: 'Site'
        },
        {
          id: 13,
          cliente: 'Felipe Gomes',
          produto: 'Nissan Kicks Exclusive',
          valor: 118000,
          dias: 11,
          contato: '(11) 88765-4321',
          origem: 'Instagram'
        }
      ]
    },
    {
      id: 'fechamento',
      titulo: 'Fechamento',
      cor: 'green',
      oportunidades: [
        {
          id: 14,
          cliente: 'Sandra Castro',
          produto: 'Chevrolet Onix Plus',
          valor: 89900,
          dias: 18,
          contato: '(11) 87654-3210',
          origem: 'WhatsApp'
        },
        {
          id: 15,
          cliente: 'Eduardo Nunes',
          produto: 'Sobrado Santana',
          valor: 680000,
          dias: 20,
          contato: '(11) 86543-2109',
          origem: 'Indicação'
        }
      ]
    }
  ];

  const getCorBadge = (cor) => {
    const cores = {
      blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      green: 'bg-green-500/20 text-green-400 border-green-500/30'
    };
    return cores[cor] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const formatarPreco = (preco) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(preco);
  };

  const calcularValorColuna = (oportunidades) => {
    return oportunidades.reduce((acc, opp) => acc + opp.valor, 0);
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Funil de Vendas</h1>
          <p className="text-gray-400">Acompanhe o pipeline de vendas e gerencie oportunidades</p>
        </div>

        {/* Estatísticas */}
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

        {/* Funil Kanban */}
        <div className="overflow-x-auto">
          <div className="inline-flex gap-4 min-w-full pb-4">
            {colunas.map((coluna) => {
              const valorTotal = calcularValorColuna(coluna.oportunidades);
              return (
                <div key={coluna.id} className="flex-shrink-0 w-80">
                  {/* Cabeçalho da Coluna */}
                  <div className="bg-[#1a2332] border border-[#2d3748] rounded-t-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-semibold">{coluna.titulo}</h3>
                      <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold ${getCorBadge(coluna.cor)}`}>
                        {coluna.oportunidades.length}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">
                      Total: <span className="text-green-400 font-semibold">{formatarPreco(valorTotal)}</span>
                    </div>
                  </div>

                  {/* Cards das Oportunidades */}
                  <div className="bg-[#0f1419] border-l border-r border-b border-[#2d3748] rounded-b-lg p-2 space-y-2 min-h-[500px] max-h-[600px] overflow-y-auto">
                    {coluna.oportunidades.map((oportunidade) => (
                      <div
                        key={oportunidade.id}
                        className="bg-[#1a2332] border border-[#2d3748] rounded-lg p-3 hover:border-blue-500/50 transition-colors cursor-pointer"
                      >
                        <div className="mb-2">
                          <h4 className="text-white font-medium text-sm mb-1">
                            {oportunidade.cliente}
                          </h4>
                          <p className="text-gray-400 text-xs mb-2">
                            {oportunidade.produto}
                          </p>
                        </div>

                        <div className="mb-3">
                          <div className="text-lg font-bold text-green-400">
                            {formatarPreco(oportunidade.valor)}
                          </div>
                        </div>

                        <div className="space-y-1.5 mb-3">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Phone className="h-3 w-3" />
                            <span>{oportunidade.contato}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Mail className="h-3 w-3" />
                            <span>Origem: {oportunidade.origem}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-[#2d3748]">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            <span>Há {oportunidade.dias} dias</span>
                          </div>
                          <button className="text-xs text-blue-400 hover:text-blue-300">
                            Ver detalhes
                          </button>
                        </div>
                      </div>
                    ))}

                    {coluna.oportunidades.length === 0 && (
                      <div className="text-center py-8 text-gray-500 text-sm">
                        Nenhuma oportunidade
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resumo */}
        <div className="bg-[#1a2332] border border-[#2d3748] rounded-lg p-4">
          <h3 className="text-white font-semibold mb-3">Resumo do Funil</h3>
          <div className="grid grid-cols-5 gap-4">
            {colunas.map((coluna) => {
              const valorTotal = calcularValorColuna(coluna.oportunidades);
              return (
                <div key={coluna.id} className="text-center">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border mb-2 ${getCorBadge(coluna.cor)}`}>
                    {coluna.titulo}
                  </div>
                  <div className="text-sm text-gray-400 mb-1">
                    {coluna.oportunidades.length} oportunidades
                  </div>
                  <div className="text-sm font-semibold text-green-400">
                    {formatarPreco(valorTotal)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Funil;
