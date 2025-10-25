import { useState } from 'react';
import { DashboardLayout } from '../Dashboard/components/DashboardLayout';
import { Puzzle, Check, AlertCircle, MessageSquare, Send, Database, Cloud, Settings } from 'lucide-react';

export function Integracoes() {
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success');

  const [integracoes, setIntegracoes] = useState([
    {
      id: 1,
      nome: 'WhatsApp Business',
      descricao: 'Conexão com WhatsApp Business API para atendimento',
      categoria: 'Mensageria',
      status: 'Ativo',
      ultimaSync: '2024-01-17 14:30',
      config: 'Número: +55 11 98765-4321',
      icone: MessageSquare,
      cor: 'green'
    },
    {
      id: 2,
      nome: 'Telegram Bot',
      descricao: 'Bot de atendimento automático no Telegram',
      categoria: 'Mensageria',
      status: 'Ativo',
      ultimaSync: '2024-01-17 14:25',
      config: 'Bot: @seu_bot',
      icone: Send,
      cor: 'blue'
    },
    {
      id: 3,
      nome: 'Google Drive',
      descricao: 'Sincronização de documentos e contratos',
      categoria: 'Armazenamento',
      status: 'Ativo',
      ultimaSync: '2024-01-17 14:20',
      config: 'Pasta: CRM Documents',
      icone: Cloud,
      cor: 'blue'
    },
    {
      id: 4,
      nome: 'API de Pagamentos',
      descricao: 'Gateway de pagamento para processar transações',
      categoria: 'Financeiro',
      status: 'Ativo',
      ultimaSync: '2024-01-17 14:15',
      config: 'Provider: Stripe',
      icone: Database,
      cor: 'purple'
    },
    {
      id: 5,
      nome: 'Mailchimp',
      descricao: 'Automação de email marketing',
      categoria: 'Marketing',
      status: 'Inativo',
      ultimaSync: '2024-01-10 10:00',
      config: 'Lista: CRM Leads',
      icone: Send,
      cor: 'yellow'
    },
    {
      id: 6,
      nome: 'Zendesk',
      descricao: 'Sistema de tickets para suporte ao cliente',
      categoria: 'Suporte',
      status: 'Ativo',
      ultimaSync: '2024-01-17 14:10',
      config: 'Domínio: empresa.zendesk.com',
      icone: MessageSquare,
      cor: 'green'
    },
    {
      id: 7,
      nome: 'Google Analytics',
      descricao: 'Rastreamento de métricas e conversões',
      categoria: 'Analytics',
      status: 'Ativo',
      ultimaSync: '2024-01-17 14:00',
      config: 'ID: UA-123456789-1',
      icone: Database,
      cor: 'orange'
    },
    {
      id: 8,
      nome: 'Slack',
      descricao: 'Notificações em tempo real para a equipe',
      categoria: 'Comunicação',
      status: 'Ativo',
      ultimaSync: '2024-01-17 13:55',
      config: 'Canal: #crm-alerts',
      icone: MessageSquare,
      cor: 'purple'
    },
    {
      id: 9,
      nome: 'Dropbox',
      descricao: 'Backup automático de arquivos',
      categoria: 'Armazenamento',
      status: 'Erro',
      ultimaSync: '2024-01-15 08:00',
      config: 'Pasta: /CRM Backup',
      icone: Cloud,
      cor: 'red'
    },
    {
      id: 10,
      nome: 'RD Station',
      descricao: 'Automação de marketing e leads',
      categoria: 'Marketing',
      status: 'Ativo',
      ultimaSync: '2024-01-17 13:50',
      config: 'Token: rd_***********',
      icone: Database,
      cor: 'blue'
    }
  ]);

  const handleConnect = (integracaoId) => {
    setIntegracoes(prev => prev.map(integracao => {
      if (integracao.id === integracaoId) {
        showNotificationMessage('success', `${integracao.nome} conectado com sucesso!`);
        return {
          ...integracao,
          status: 'Ativo',
          ultimaSync: new Date().toLocaleString('pt-BR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }).replace(',', '')
        };
      }
      return integracao;
    }));
  };

  const handleDisconnect = (integracaoId) => {
    const integracao = integracoes.find(i => i.id === integracaoId);
    setIntegracoes(prev => prev.map(i => {
      if (i.id === integracaoId) {
        showNotificationMessage('warning', `${integracao.nome} desconectado`);
        return {
          ...i,
          status: 'Inativo',
          ultimaSync: new Date().toLocaleString('pt-BR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }).replace(',', '')
        };
      }
      return i;
    }));
  };

  const showNotificationMessage = (type, message) => {
    setNotificationType(type);
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  const estatisticas = [
    {
      titulo: 'Total de Integrações',
      valor: integracoes.length,
      icone: Puzzle,
      cor: 'blue',
      variacao: `${integracoes.filter(i => i.status === 'Ativo').length} ativas`
    },
    {
      titulo: 'WhatsApp',
      valor: integracoes.filter(i => i.categoria === 'Mensageria' && i.status === 'Ativo').length,
      icone: MessageSquare,
      cor: 'green',
      variacao: 'Conectadas'
    },
    {
      titulo: 'APIs Ativas',
      valor: integracoes.filter(i => i.status === 'Ativo').length,
      icone: Database,
      cor: 'purple',
      variacao: '100% operacional'
    },
    {
      titulo: 'Cloud Storage',
      valor: integracoes.filter(i => i.categoria === 'Armazenamento' && i.status === 'Ativo').length,
      icone: Cloud,
      cor: 'orange',
      variacao: 'Sincronizadas'
    }
  ];

  const getStatusBadge = (status) => {
    const cores = {
      'Ativo': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Inativo': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      'Erro': 'bg-red-500/20 text-red-400 border-red-500/30',
      'Configurando': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    };
    return cores[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const getStatusIcon = (status) => {
    if (status === 'Ativo') return <Check className="h-4 w-4" />;
    if (status === 'Erro') return <AlertCircle className="h-4 w-4" />;
    return <Settings className="h-4 w-4" />;
  };

  const getCategorias = () => {
    const cats = [...new Set(integracoes.map(i => i.categoria))];
    return ['Todas', ...cats];
  };

  const integracoesFiltradas = filtroCategoria === 'Todas'
    ? integracoes
    : integracoes.filter(i => i.categoria === filtroCategoria);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Integrações</h1>
            <p className="text-gray-400">Gerencie conexões com serviços externos</p>
          </div>
          <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition-colors">
            <Puzzle className="h-4 w-4" />
            Nova Integração
          </button>
        </div>

        {/* Notificações */}
        {showNotification && (
          <div className={`${
            notificationType === 'success' ? 'bg-green-500/20 border-green-500/50' : 'bg-orange-500/20 border-orange-500/50'
          } border rounded-lg p-4 flex items-center gap-3`}>
            <div className={`h-8 w-8 rounded-full ${
              notificationType === 'success' ? 'bg-green-500' : 'bg-orange-500'
            } flex items-center justify-center flex-shrink-0`}>
              <Check className="h-5 w-5 text-white" />
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

        {/* Filtros */}
        <div className="bg-[#1a2332] border border-[#2d3748] rounded-lg p-4">
          <div className="flex gap-2 flex-wrap">
            {getCategorias().map((cat) => (
              <button
                key={cat}
                onClick={() => setFiltroCategoria(cat)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  filtroCategoria === cat
                    ? 'bg-blue-500 text-white border border-blue-500'
                    : 'bg-[#0f1419] text-gray-400 border border-[#2d3748] hover:bg-[#1a2332]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Integrações */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {integracoesFiltradas.map((integracao) => {
            const Icone = integracao.icone;
            return (
              <div
                key={integracao.id}
                className="bg-[#1a2332] border border-[#2d3748] rounded-lg p-4 hover:border-blue-500/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className={`h-12 w-12 rounded-lg bg-${integracao.cor}-500/20 border border-${integracao.cor}-500/30 flex items-center justify-center flex-shrink-0`}>
                      <Icone className={`h-6 w-6 text-${integracao.cor}-500`} />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-1">{integracao.nome}</h3>
                      <p className="text-sm text-gray-400 mb-2">{integracao.descricao}</p>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(integracao.status)}`}>
                          {getStatusIcon(integracao.status)}
                          {integracao.status}
                        </span>
                        <span className="text-xs text-gray-500">{integracao.categoria}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0f1419] border border-[#2d3748] rounded-lg p-3 mb-3">
                  <div className="text-xs text-gray-500 mb-1">Configuração</div>
                  <div className="text-sm text-white">{integracao.config}</div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#2d3748]">
                  <div className="text-xs text-gray-500">
                    Última sinc: {integracao.ultimaSync}
                  </div>
                  <div className="flex gap-2">
                    <button className="text-blue-400 hover:text-blue-300 text-sm">
                      Configurar
                    </button>
                    {integracao.status === 'Ativo' && (
                      <button
                        onClick={() => handleDisconnect(integracao.id)}
                        className="text-red-400 hover:text-red-300 text-sm font-medium"
                      >
                        Desconectar
                      </button>
                    )}
                    {integracao.status !== 'Ativo' && (
                      <button
                        onClick={() => handleConnect(integracao.id)}
                        className="text-green-400 hover:text-green-300 text-sm font-medium"
                      >
                        Conectar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {integracoesFiltradas.length === 0 && (
          <div className="bg-[#1a2332] border border-[#2d3748] rounded-lg p-12 text-center">
            <Puzzle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Nenhuma integração encontrada</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Integracoes;
