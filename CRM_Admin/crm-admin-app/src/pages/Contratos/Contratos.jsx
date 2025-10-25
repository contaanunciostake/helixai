import { useState } from 'react';
import { DashboardLayout } from '../Dashboard/components/DashboardLayout';
import { Search, FileSignature, CheckCircle, Clock, AlertCircle, DollarSign, Download } from 'lucide-react';

export function Contratos() {
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success');

  const [estatisticas, setEstatisticas] = useState([
    {
      titulo: 'Total de Contratos',
      valor: '234',
      icone: FileSignature,
      cor: 'blue',
      variacao: '+15 este mês'
    },
    {
      titulo: 'Aguardando Assinatura',
      valor: '28',
      icone: Clock,
      cor: 'yellow',
      variacao: '12% do total'
    },
    {
      titulo: 'Ativos',
      valor: '189',
      icone: CheckCircle,
      cor: 'green',
      variacao: '81% do total'
    },
    {
      titulo: 'Valor Total',
      valor: 'R$ 28.5M',
      icone: DollarSign,
      cor: 'purple',
      variacao: 'Ticket médio R$ 122k'
    }
  ]);

  const [contratos, setContratos] = useState([
    {
      id: 'CONT-2024-001',
      cliente: 'João Silva',
      produto: 'Toyota Corolla XEI 2023',
      valor: 140900,
      dataAssinatura: '2024-01-15',
      dataVencimento: '2025-01-15',
      statusAssinatura: 'Assinado',
      statusPagamento: 'Em Dia',
      parcelas: '12x de R$ 11.741,67',
      vendedor: 'Carlos Mendes'
    },
    {
      id: 'CONT-2024-002',
      cliente: 'Maria Santos',
      produto: 'Casa Condomínio Alphaville',
      valor: 1800000,
      dataAssinatura: '2024-01-12',
      dataVencimento: '2044-01-12',
      statusAssinatura: 'Assinado',
      statusPagamento: 'Em Dia',
      parcelas: 'Entrada + 240x de R$ 7.500',
      vendedor: 'Ana Costa'
    },
    {
      id: 'CONT-2024-003',
      cliente: 'Carlos Mendes',
      produto: 'VW T-Cross Highline',
      valor: 131500,
      dataAssinatura: '',
      dataVencimento: '2025-01-30',
      statusAssinatura: 'Pendente',
      statusPagamento: '-',
      parcelas: '10x de R$ 13.150',
      vendedor: 'Roberto Lima'
    },
    {
      id: 'CONT-2024-004',
      cliente: 'Ana Costa',
      produto: 'Apto 3 Dorms - Jardim Paulista',
      valor: 830000,
      dataAssinatura: '2024-01-10',
      dataVencimento: '2044-01-10',
      statusAssinatura: 'Assinado',
      statusPagamento: 'Atrasado',
      parcelas: 'Entrada + 300x de R$ 2.766,67',
      vendedor: 'Fernanda Alves'
    },
    {
      id: 'CONT-2024-005',
      cliente: 'Juliana Rocha',
      produto: 'Cobertura Duplex Vila Madalena',
      valor: 1405000,
      dataAssinatura: '2024-01-08',
      dataVencimento: '2044-01-08',
      statusAssinatura: 'Assinado',
      statusPagamento: 'Em Dia',
      parcelas: 'Entrada + 360x de R$ 3.902,78',
      vendedor: 'Patricia Dias'
    },
    {
      id: 'CONT-2024-006',
      cliente: 'Roberto Lima',
      produto: 'Jeep Compass Limited',
      valor: 158500,
      dataAssinatura: '',
      dataVencimento: '2025-02-01',
      statusAssinatura: 'Pendente',
      statusPagamento: '-',
      parcelas: '15x de R$ 10.566,67',
      vendedor: 'Lucas Martins'
    },
    {
      id: 'CONT-2024-007',
      cliente: 'Ricardo Souza',
      produto: 'Hyundai Creta Ultimate',
      valor: 148000,
      dataAssinatura: '2024-01-09',
      dataVencimento: '2025-01-09',
      statusAssinatura: 'Assinado',
      statusPagamento: 'Em Dia',
      parcelas: '12x de R$ 12.333,33',
      vendedor: 'Eduardo Nunes'
    },
    {
      id: 'CONT-2024-008',
      cliente: 'Patricia Dias',
      produto: 'Sala Comercial Faria Lima',
      valor: 668000,
      dataAssinatura: '2024-01-11',
      dataVencimento: '2034-01-11',
      statusAssinatura: 'Assinado',
      statusPagamento: 'Em Dia',
      parcelas: 'Entrada + 120x de R$ 5.566,67',
      vendedor: 'Marcos Ferreira'
    },
    {
      id: 'CONT-2024-009',
      cliente: 'Sandra Castro',
      produto: 'Chevrolet Onix Plus Premier',
      valor: 89900,
      dataAssinatura: '2024-01-13',
      dataVencimento: '2025-01-13',
      statusAssinatura: 'Assinado',
      statusPagamento: 'Adiantado',
      parcelas: '8x de R$ 11.237,50',
      vendedor: 'Felipe Gomes'
    },
    {
      id: 'CONT-2024-010',
      cliente: 'Eduardo Nunes',
      produto: 'Sobrado Santana',
      valor: 680000,
      dataAssinatura: '',
      dataVencimento: '2044-02-05',
      statusAssinatura: 'Aguardando Análise',
      statusPagamento: '-',
      parcelas: 'Entrada + 240x de R$ 2.833,33',
      vendedor: 'Sandra Castro'
    }
  ]);

  const getStatusAssinaturaBadge = (status) => {
    const cores = {
      'Assinado': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Pendente': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'Aguardando Análise': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Cancelado': 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return cores[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const getStatusPagamentoBadge = (status) => {
    const cores = {
      'Em Dia': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Atrasado': 'bg-red-500/20 text-red-400 border-red-500/30',
      'Adiantado': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      '-': 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    return cores[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const formatarPreco = (preco) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(preco);
  };

  const formatarData = (dataString) => {
    if (!dataString) return '-';
    return new Date(dataString + 'T00:00:00').toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const showNotificationMessage = (type, message) => {
    setNotificationType(type);
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  const atualizarEstatisticas = (novosContratos) => {
    const total = novosContratos.length;
    const aguardando = novosContratos.filter(c => c.statusAssinatura === 'Pendente' || c.statusAssinatura === 'Aguardando Análise').length;
    const ativos = novosContratos.filter(c => c.statusAssinatura === 'Assinado').length;
    const valorTotal = novosContratos.reduce((acc, c) => acc + c.valor, 0);
    const ticketMedio = valorTotal / total;

    setEstatisticas([
      {
        titulo: 'Total de Contratos',
        valor: total.toString(),
        icone: FileSignature,
        cor: 'blue',
        variacao: '+15 este mês'
      },
      {
        titulo: 'Aguardando Assinatura',
        valor: aguardando.toString(),
        icone: Clock,
        cor: 'yellow',
        variacao: `${Math.round((aguardando / total) * 100)}% do total`
      },
      {
        titulo: 'Ativos',
        valor: ativos.toString(),
        icone: CheckCircle,
        cor: 'green',
        variacao: `${Math.round((ativos / total) * 100)}% do total`
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

  const handleAssinar = (contratoId) => {
    const hoje = new Date();
    const dataAssinatura = hoje.toISOString().split('T')[0];

    const contratosAtualizados = contratos.map(c => {
      if (c.id === contratoId) {
        return {
          ...c,
          statusAssinatura: 'Assinado',
          dataAssinatura: dataAssinatura,
          statusPagamento: 'Em Dia'
        };
      }
      return c;
    });

    setContratos(contratosAtualizados);
    atualizarEstatisticas(contratosAtualizados);

    const contrato = contratos.find(c => c.id === contratoId);
    showNotificationMessage('success', `Contrato ${contratoId} assinado com sucesso! Cliente: ${contrato.cliente}`);
  };

  const contratosFiltrados = contratos.filter(contrato => {
    const matchBusca = busca === '' ||
      contrato.id.toLowerCase().includes(busca.toLowerCase()) ||
      contrato.cliente.toLowerCase().includes(busca.toLowerCase()) ||
      contrato.produto.toLowerCase().includes(busca.toLowerCase());

    const matchStatus = filtroStatus === 'todos' || contrato.statusAssinatura === filtroStatus;

    return matchBusca && matchStatus;
  });

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Contratos</h1>
          <p className="text-gray-400">Gerencie contratos, assinaturas e pagamentos</p>
        </div>

        {/* Notificações */}
        {showNotification && (
          <div className="bg-green-500/20 border-green-500/50 border rounded-lg p-4 flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
            <p className="text-green-400 font-medium">{notificationMessage}</p>
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
              <option value="Assinado">Assinado</option>
              <option value="Pendente">Pendente</option>
              <option value="Aguardando Análise">Aguardando Análise</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        {/* Lista de Contratos */}
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
                    Valor / Parcelas
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Assinatura
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Pagamento
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
                {contratosFiltrados.map((contrato) => (
                  <tr key={contrato.id} className="hover:bg-[#0f1419] transition-colors">
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-white mb-1">
                        {contrato.id}
                      </div>
                      <div className="text-xs text-gray-500">{contrato.cliente}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-white">{contrato.produto}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-semibold text-green-400 mb-1">
                        {formatarPreco(contrato.valor)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {contrato.parcelas}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="mb-1">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusAssinaturaBadge(contrato.statusAssinatura)}`}>
                          {contrato.statusAssinatura === 'Assinado' ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                          {contrato.statusAssinatura}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatarData(contrato.dataAssinatura)}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusPagamentoBadge(contrato.statusPagamento)}`}>
                        {contrato.statusPagamento}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-400">{contrato.vendedor}</div>
                    </td>
                    <td className="px-4 py-4 text-right space-x-2">
                      {(contrato.statusAssinatura === 'Pendente' || contrato.statusAssinatura === 'Aguardando Análise') && (
                        <button
                          onClick={() => handleAssinar(contrato.id)}
                          className="text-green-400 hover:text-green-300 text-sm font-medium inline-flex items-center gap-1"
                        >
                          <FileSignature className="h-4 w-4" />
                          Assinar
                        </button>
                      )}
                      <button className="text-blue-400 hover:text-blue-300 text-sm">
                        <Download className="h-4 w-4 inline" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-300 text-sm">
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {contratosFiltrados.length === 0 && (
            <div className="text-center py-12">
              <FileSignature className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Nenhum contrato encontrado</p>
            </div>
          )}
        </div>

        {/* Paginação */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Mostrando {contratosFiltrados.length} de {contratos.length} contratos
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

export default Contratos;
