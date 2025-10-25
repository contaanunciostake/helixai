import { useState } from 'react';
import { DashboardLayout } from '../Dashboard/components/DashboardLayout';
import { Search, FileText, Clock, CheckCircle, XCircle, DollarSign, Calendar, Download } from 'lucide-react';

export function Propostas() {
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success');

  const [estatisticas, setEstatisticas] = useState([
    {
      titulo: 'Total de Propostas',
      valor: '156',
      icone: FileText,
      cor: 'blue',
      variacao: '+18 esta semana'
    },
    {
      titulo: 'Aguardando Resposta',
      valor: '42',
      icone: Clock,
      cor: 'yellow',
      variacao: '27% do total'
    },
    {
      titulo: 'Aprovadas',
      valor: '89',
      icone: CheckCircle,
      cor: 'green',
      variacao: '57% taxa aprovação'
    },
    {
      titulo: 'Valor Total',
      valor: 'R$ 12.8M',
      icone: DollarSign,
      cor: 'purple',
      variacao: 'Ticket médio R$ 82k'
    }
  ]);

  const [propostas, setPropostas] = useState([
    {
      id: 'PROP-2024-001',
      cliente: 'João Silva',
      produto: 'Toyota Corolla XEI 2023',
      valor: 145900,
      desconto: 5000,
      valorFinal: 140900,
      status: 'Aguardando',
      dataEnvio: '2024-01-15',
      validade: '2024-01-29',
      vendedor: 'Carlos Mendes'
    },
    {
      id: 'PROP-2024-002',
      cliente: 'Maria Santos',
      produto: 'Casa Condomínio Alphaville',
      valor: 1850000,
      desconto: 50000,
      valorFinal: 1800000,
      status: 'Aprovada',
      dataEnvio: '2024-01-12',
      validade: '2024-01-26',
      vendedor: 'Ana Costa'
    },
    {
      id: 'PROP-2024-003',
      cliente: 'Pedro Oliveira',
      produto: 'Honda Civic Touring',
      valor: 189900,
      desconto: 8000,
      valorFinal: 181900,
      status: 'Rejeitada',
      dataEnvio: '2024-01-10',
      validade: '2024-01-24',
      vendedor: 'Roberto Lima'
    },
    {
      id: 'PROP-2024-004',
      cliente: 'Ana Costa',
      produto: 'Apto 3 Dorms - Jardim Paulista',
      valor: 850000,
      desconto: 20000,
      valorFinal: 830000,
      status: 'Em Revisão',
      dataEnvio: '2024-01-14',
      validade: '2024-01-28',
      vendedor: 'Fernanda Alves'
    },
    {
      id: 'PROP-2024-005',
      cliente: 'Carlos Mendes',
      produto: 'VW T-Cross Highline',
      valor: 135000,
      desconto: 3500,
      valorFinal: 131500,
      status: 'Aguardando',
      dataEnvio: '2024-01-16',
      validade: '2024-01-30',
      vendedor: 'Carlos Mendes'
    },
    {
      id: 'PROP-2024-006',
      cliente: 'Juliana Rocha',
      produto: 'Cobertura Duplex Vila Madalena',
      valor: 1450000,
      desconto: 45000,
      valorFinal: 1405000,
      status: 'Aprovada',
      dataEnvio: '2024-01-11',
      validade: '2024-01-25',
      vendedor: 'Patricia Dias'
    },
    {
      id: 'PROP-2024-007',
      cliente: 'Roberto Lima',
      produto: 'Jeep Compass Limited',
      valor: 165000,
      desconto: 6500,
      valorFinal: 158500,
      status: 'Aguardando',
      dataEnvio: '2024-01-13',
      validade: '2024-01-27',
      vendedor: 'Lucas Martins'
    },
    {
      id: 'PROP-2024-008',
      cliente: 'Fernanda Alves',
      produto: 'Apto 2 Dorms - Moema',
      valor: 720000,
      desconto: 15000,
      valorFinal: 705000,
      status: 'Expirada',
      dataEnvio: '2024-01-05',
      validade: '2024-01-19',
      vendedor: 'Sandra Castro'
    },
    {
      id: 'PROP-2024-009',
      cliente: 'Ricardo Souza',
      produto: 'Hyundai Creta Ultimate',
      valor: 152000,
      desconto: 4000,
      valorFinal: 148000,
      status: 'Aprovada',
      dataEnvio: '2024-01-09',
      validade: '2024-01-23',
      vendedor: 'Eduardo Nunes'
    },
    {
      id: 'PROP-2024-010',
      cliente: 'Patricia Dias',
      produto: 'Sala Comercial Faria Lima',
      valor: 680000,
      desconto: 12000,
      valorFinal: 668000,
      status: 'Em Revisão',
      dataEnvio: '2024-01-17',
      validade: '2024-01-31',
      vendedor: 'Marcos Ferreira'
    }
  ]);

  const getStatusBadge = (status) => {
    const cores = {
      'Aguardando': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'Aprovada': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Rejeitada': 'bg-red-500/20 text-red-400 border-red-500/30',
      'Em Revisão': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Expirada': 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    return cores[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const getStatusIcon = (status) => {
    const icones = {
      'Aguardando': Clock,
      'Aprovada': CheckCircle,
      'Rejeitada': XCircle,
      'Em Revisão': FileText,
      'Expirada': XCircle
    };
    return icones[status] || FileText;
  };

  const formatarPreco = (preco) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(preco);
  };

  const formatarData = (dataString) => {
    return new Date(dataString + 'T00:00:00').toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const calcularDiasRestantes = (validade) => {
    const hoje = new Date();
    const dataValidade = new Date(validade + 'T00:00:00');
    const diffTime = dataValidade - hoje;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const showNotificationMessage = (type, message) => {
    setNotificationType(type);
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  const atualizarEstatisticas = (novasPropostas) => {
    const total = novasPropostas.length;
    const aguardando = novasPropostas.filter(p => p.status === 'Aguardando' || p.status === 'Em Revisão').length;
    const aprovadas = novasPropostas.filter(p => p.status === 'Aprovada').length;
    const valorTotal = novasPropostas.reduce((acc, p) => acc + p.valorFinal, 0);
    const ticketMedio = valorTotal / total;

    setEstatisticas([
      {
        titulo: 'Total de Propostas',
        valor: total.toString(),
        icone: FileText,
        cor: 'blue',
        variacao: '+18 esta semana'
      },
      {
        titulo: 'Aguardando Resposta',
        valor: aguardando.toString(),
        icone: Clock,
        cor: 'yellow',
        variacao: `${Math.round((aguardando / total) * 100)}% do total`
      },
      {
        titulo: 'Aprovadas',
        valor: aprovadas.toString(),
        icone: CheckCircle,
        cor: 'green',
        variacao: `${Math.round((aprovadas / total) * 100)}% taxa aprovação`
      },
      {
        titulo: 'Valor Total',
        valor: `R$ ${(valorTotal / 1000000).toFixed(1)}M`,
        icone: DollarSign,
        cor: 'purple',
        variacao: `Ticket médio R$ ${Math.round(ticketMedio / 1000)}k`
      }
    ]);
  };

  const handleAprovar = (propostaId) => {
    const propostasAtualizadas = propostas.map(p => {
      if (p.id === propostaId) {
        return { ...p, status: 'Aprovada' };
      }
      return p;
    });

    setPropostas(propostasAtualizadas);
    atualizarEstatisticas(propostasAtualizadas);

    const proposta = propostas.find(p => p.id === propostaId);
    showNotificationMessage('success', `Proposta ${propostaId} aprovada! Cliente: ${proposta.cliente}`);
  };

  const handleRejeitar = (propostaId) => {
    const propostasAtualizadas = propostas.map(p => {
      if (p.id === propostaId) {
        return { ...p, status: 'Rejeitada' };
      }
      return p;
    });

    setPropostas(propostasAtualizadas);
    atualizarEstatisticas(propostasAtualizadas);

    const proposta = propostas.find(p => p.id === propostaId);
    showNotificationMessage('warning', `Proposta ${propostaId} rejeitada. Cliente: ${proposta.cliente}`);
  };

  const propostasFiltradas = propostas.filter(proposta => {
    const matchBusca = busca === '' ||
      proposta.id.toLowerCase().includes(busca.toLowerCase()) ||
      proposta.cliente.toLowerCase().includes(busca.toLowerCase()) ||
      proposta.produto.toLowerCase().includes(busca.toLowerCase());

    const matchStatus = filtroStatus === 'todos' || proposta.status === filtroStatus;

    return matchBusca && matchStatus;
  });

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Propostas</h1>
          <p className="text-gray-400">Gerencie propostas comerciais e acompanhe aprovações</p>
        </div>

        {/* Notificações */}
        {showNotification && (
          <div className={`${
            notificationType === 'success' ? 'bg-green-500/20 border-green-500/50' : 'bg-orange-500/20 border-orange-500/50'
          } border rounded-lg p-4 flex items-center gap-3`}>
            <div className={`h-8 w-8 rounded-full ${
              notificationType === 'success' ? 'bg-green-500' : 'bg-orange-500'
            } flex items-center justify-center flex-shrink-0`}>
              {notificationType === 'success' ? <CheckCircle className="h-5 w-5 text-white" /> : <XCircle className="h-5 w-5 text-white" />}
            </div>
            <p className={`${
              notificationType === 'success' ? 'text-green-400' : 'text-orange-400'
            } font-medium`}>{notificationMessage}</p>
          </div>
        )}

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

        {/* Busca e Filtros */}
        <div className="bg-[#1a2332] border border-[#2d3748] rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar por ID, cliente ou produto..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="px-4 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="todos">Todos os Status</option>
              <option value="Aguardando">Aguardando</option>
              <option value="Em Revisão">Em Revisão</option>
              <option value="Aprovada">Aprovada</option>
              <option value="Rejeitada">Rejeitada</option>
              <option value="Expirada">Expirada</option>
            </select>
          </div>
        </div>

        {/* Lista de Propostas */}
        <div className="bg-[#1a2332] border border-[#2d3748] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0f1419] border-b border-[#2d3748]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    ID / Cliente
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Valores
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Datas
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Vendedor
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2d3748]">
                {propostasFiltradas.map((proposta) => {
                  const StatusIcon = getStatusIcon(proposta.status);
                  const diasRestantes = calcularDiasRestantes(proposta.validade);
                  return (
                    <tr key={proposta.id} className="hover:bg-[#0f1419] transition-colors">
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-white mb-1">
                          {proposta.id}
                        </div>
                        <div className="text-xs text-gray-500">{proposta.cliente}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-white">{proposta.produto}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-white line-through text-gray-500">
                          {formatarPreco(proposta.valor)}
                        </div>
                        <div className="text-sm font-semibold text-green-400">
                          {formatarPreco(proposta.valorFinal)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Desconto: {formatarPreco(proposta.desconto)}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-white mb-1">
                          Enviada: {formatarData(proposta.dataEnvio)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Validade: {formatarData(proposta.validade)}
                          {diasRestantes > 0 && diasRestantes <= 7 && (
                            <span className="ml-1 text-yellow-400">
                              ({diasRestantes}d restantes)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(proposta.status)}`}>
                          <StatusIcon className="h-3 w-3" />
                          {proposta.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-400">{proposta.vendedor}</div>
                      </td>
                      <td className="px-4 py-4 text-right space-x-2">
                        {(proposta.status === 'Aguardando' || proposta.status === 'Em Revisão') && (
                          <>
                            <button
                              onClick={() => handleAprovar(proposta.id)}
                              className="text-green-400 hover:text-green-300 text-sm font-medium"
                            >
                              Aprovar
                            </button>
                            <button
                              onClick={() => handleRejeitar(proposta.id)}
                              className="text-red-400 hover:text-red-300 text-sm font-medium"
                            >
                              Rejeitar
                            </button>
                          </>
                        )}
                        <button className="text-blue-400 hover:text-blue-300 text-sm">
                          <Download className="h-4 w-4 inline" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-300 text-sm">
                          Ver
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {propostasFiltradas.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Nenhuma proposta encontrada</p>
            </div>
          )}
        </div>

        {/* Paginação */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Mostrando {propostasFiltradas.length} de {propostas.length} propostas
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-[#1a2332] border border-[#2d3748] rounded-lg text-white hover:bg-[#0f1419] transition-colors">
              Anterior
            </button>
            <button className="px-4 py-2 bg-blue-500 border border-blue-500 rounded-lg text-white hover:bg-blue-600 transition-colors">
              1
            </button>
            <button className="px-4 py-2 bg-[#1a2332] border border-[#2d3748] rounded-lg text-white hover:bg-[#0f1419] transition-colors">
              2
            </button>
            <button className="px-4 py-2 bg-[#1a2332] border border-[#2d3748] rounded-lg text-white hover:bg-[#0f1419] transition-colors">
              Próximo
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Propostas;
