import { useState } from 'react';
import { UserPlus, Search, Phone, Mail, MessageSquare, Calendar, TrendingUp, Award, Clock, Eye, Edit, Trash2, Star, Target, Users, X, Save } from 'lucide-react';
import { DashboardLayout } from '../Dashboard/components/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

export function Leads() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterOrigem, setFilterOrigem] = useState('all');

  // Estados para CRUD
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // view, edit, create
  const [selectedLead, setSelectedLead] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    origem: 'AIra Auto',
    status: 'morno',
    score: 50,
    interesse: '',
    dataCriacao: new Date().toISOString().split('T')[0],
    ultimoContato: new Date().toISOString(),
    proximaAcao: '',
    valorEstimado: 'R$ 0'
  });

  const [stats, setStats] = useState({
    totalLeads: 10,
    leadsQuentes: 4,
    leadsMornos: 4,
    leadsFrios: 2
  });

  const [leads, setLeads] = useState([
    {
      id: 1,
      nome: 'Ricardo Mendes',
      email: 'ricardo.mendes@email.com',
      telefone: '+55 11 99888-7777',
      origem: 'AIra Auto',
      status: 'quente',
      score: 95,
      interesse: 'SUV Premium',
      dataCriacao: '2025-10-15',
      ultimoContato: '2025-10-16 14:30',
      proximaAcao: 'Agendar test drive',
      valorEstimado: 'R$ 180.000'
    },
    {
      id: 2,
      nome: 'Patricia Souza',
      email: 'patricia.souza@email.com',
      telefone: '+55 21 98777-6666',
      origem: 'AIra Imob',
      status: 'quente',
      score: 92,
      interesse: 'Apartamento 3 quartos',
      dataCriacao: '2025-10-14',
      ultimoContato: '2025-10-16 11:15',
      proximaAcao: 'Agendar visita',
      valorEstimado: 'R$ 650.000'
    },
    {
      id: 3,
      nome: 'Fernando Costa',
      email: 'fernando.costa@email.com',
      telefone: '+55 11 97666-5555',
      origem: 'AIra Auto',
      status: 'morno',
      score: 68,
      interesse: 'Sedan Executivo',
      dataCriacao: '2025-10-13',
      ultimoContato: '2025-10-15 16:45',
      proximaAcao: 'Enviar proposta',
      valorEstimado: 'R$ 120.000'
    },
    {
      id: 4,
      nome: 'Camila Ribeiro',
      email: 'camila.ribeiro@email.com',
      telefone: '+55 11 96555-4444',
      origem: 'AIra Imob',
      status: 'quente',
      score: 88,
      interesse: 'Casa em condomínio',
      dataCriacao: '2025-10-12',
      ultimoContato: '2025-10-16 09:20',
      proximaAcao: 'Apresentar opções',
      valorEstimado: 'R$ 890.000'
    },
    {
      id: 5,
      nome: 'Lucas Martins',
      email: 'lucas.martins@email.com',
      telefone: '+55 21 95444-3333',
      origem: 'AIra Auto',
      status: 'morno',
      score: 71,
      interesse: 'Hatchback Econômico',
      dataCriacao: '2025-10-11',
      ultimoContato: '2025-10-14 13:50',
      proximaAcao: 'Follow-up telefone',
      valorEstimado: 'R$ 75.000'
    },
    {
      id: 6,
      nome: 'Beatriz Almeida',
      email: 'beatriz.almeida@email.com',
      telefone: '+55 11 94333-2222',
      origem: 'AIra Imob',
      status: 'morno',
      score: 65,
      interesse: 'Apartamento 2 quartos',
      dataCriacao: '2025-10-10',
      ultimoContato: '2025-10-15 10:30',
      proximaAcao: 'Enviar catálogo',
      valorEstimado: 'R$ 420.000'
    },
    {
      id: 7,
      nome: 'Rodrigo Santos',
      email: 'rodrigo.santos@email.com',
      telefone: '+55 21 93222-1111',
      origem: 'AIra Auto',
      status: 'frio',
      score: 42,
      interesse: 'Pickup',
      dataCriacao: '2025-10-08',
      ultimoContato: '2025-10-10 15:20',
      proximaAcao: 'Reativação',
      valorEstimado: 'R$ 210.000'
    },
    {
      id: 8,
      nome: 'Gabriela Ferreira',
      email: 'gabriela.ferreira@email.com',
      telefone: '+55 11 92111-0000',
      origem: 'AIra Imob',
      status: 'quente',
      score: 90,
      interesse: 'Cobertura duplex',
      dataCriacao: '2025-10-16',
      ultimoContato: '2025-10-16 16:10',
      proximaAcao: 'Apresentar imóvel premium',
      valorEstimado: 'R$ 1.200.000'
    },
    {
      id: 9,
      nome: 'Marcelo Lima',
      email: 'marcelo.lima@email.com',
      telefone: '+55 21 91000-9999',
      origem: 'AIra Auto',
      status: 'frio',
      score: 38,
      interesse: 'Van',
      dataCriacao: '2025-10-05',
      ultimoContato: '2025-10-07 14:00',
      proximaAcao: 'Aguardar contato',
      valorEstimado: 'R$ 150.000'
    },
    {
      id: 10,
      nome: 'Renata Oliveira',
      email: 'renata.oliveira@email.com',
      telefone: '+55 11 90999-8888',
      origem: 'AIra Imob',
      status: 'morno',
      score: 73,
      interesse: 'Sala comercial',
      dataCriacao: '2025-10-09',
      ultimoContato: '2025-10-15 11:45',
      proximaAcao: 'Negociar condições',
      valorEstimado: 'R$ 380.000'
    },
  ]);

  // Funções para abrir modais
  const openViewModal = (lead) => {
    setSelectedLead(lead);
    setModalMode('view');
    setShowModal(true);
  };

  const openEditModal = (lead) => {
    setSelectedLead(lead);
    setFormData({
      nome: lead.nome,
      email: lead.email,
      telefone: lead.telefone,
      origem: lead.origem,
      status: lead.status,
      score: lead.score,
      interesse: lead.interesse,
      dataCriacao: lead.dataCriacao,
      ultimoContato: lead.ultimoContato,
      proximaAcao: lead.proximaAcao,
      valorEstimado: lead.valorEstimado
    });
    setModalMode('edit');
    setShowModal(true);
  };

  const openCreateModal = () => {
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      origem: 'AIra Auto',
      status: 'morno',
      score: 50,
      interesse: '',
      dataCriacao: new Date().toISOString().split('T')[0],
      ultimoContato: new Date().toISOString(),
      proximaAcao: '',
      valorEstimado: 'R$ 0'
    });
    setModalMode('create');
    setShowModal(true);
  };

  const handleDelete = (lead) => {
    setLeadToDelete(lead);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    const updated = leads.filter(l => l.id !== leadToDelete.id);
    setLeads(updated);

    // Atualizar estatísticas
    setStats(prev => ({
      ...prev,
      totalLeads: prev.totalLeads - 1,
      leadsQuentes: leadToDelete.status === 'quente' ? prev.leadsQuentes - 1 : prev.leadsQuentes,
      leadsMornos: leadToDelete.status === 'morno' ? prev.leadsMornos - 1 : prev.leadsMornos,
      leadsFrios: leadToDelete.status === 'frio' ? prev.leadsFrios - 1 : prev.leadsFrios
    }));

    setShowDeleteConfirm(false);
    setLeadToDelete(null);
  };

  const handleSave = () => {
    if (modalMode === 'create') {
      const newLead = {
        id: leads.length + 1,
        ...formData
      };
      setLeads([...leads, newLead]);

      // Atualizar estatísticas
      setStats(prev => ({
        ...prev,
        totalLeads: prev.totalLeads + 1,
        leadsQuentes: formData.status === 'quente' ? prev.leadsQuentes + 1 : prev.leadsQuentes,
        leadsMornos: formData.status === 'morno' ? prev.leadsMornos + 1 : prev.leadsMornos,
        leadsFrios: formData.status === 'frio' ? prev.leadsFrios + 1 : prev.leadsFrios
      }));
    } else if (modalMode === 'edit') {
      const updated = leads.map(l =>
        l.id === selectedLead.id ? { ...l, ...formData } : l
      );
      setLeads(updated);

      // Atualizar estatísticas se status mudou
      if (selectedLead.status !== formData.status) {
        setStats(prev => {
          const newStats = { ...prev };

          // Decrementar status anterior
          if (selectedLead.status === 'quente') newStats.leadsQuentes--;
          else if (selectedLead.status === 'morno') newStats.leadsMornos--;
          else if (selectedLead.status === 'frio') newStats.leadsFrios--;

          // Incrementar novo status
          if (formData.status === 'quente') newStats.leadsQuentes++;
          else if (formData.status === 'morno') newStats.leadsMornos++;
          else if (formData.status === 'frio') newStats.leadsFrios++;

          return newStats;
        });
      }
    }

    setShowModal(false);
    setSelectedLead(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'quente':
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/50">🔥 Quente</Badge>;
      case 'morno':
        return <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/50">🌡️ Morno</Badge>;
      case 'frio':
        return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/50">❄️ Frio</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-500 border-gray-500/50">Novo</Badge>;
    }
  };

  const getOrigemBadge = (origem) => {
    if (origem === 'AIra Auto') {
      return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/50">AIra Auto</Badge>;
    }
    return <Badge className="bg-purple-500/20 text-purple-500 border-purple-500/50">AIra Imob</Badge>;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreStars = (score) => {
    const stars = Math.ceil(score / 20);
    return Array(5).fill(0).map((_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${i < stars ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`}
      />
    ));
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch =
      lead.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.telefone.includes(searchTerm) ||
      lead.interesse.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
    const matchesOrigem = filterOrigem === 'all' || lead.origem === filterOrigem;

    return matchesSearch && matchesStatus && matchesOrigem;
  });

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Leads</h1>
            <p className="text-gray-400 mt-1">Gerenciamento de leads qualificados pelos robôs</p>
          </div>
          <Button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700 text-white">
            <UserPlus className="mr-2 h-4 w-4" />
            Novo Lead Manual
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-[#1a2332] border-[#2d3748]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total de Leads</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalLeads}</div>
              <p className="text-xs text-gray-500 mt-1">Base ativa</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2332] border-[#2d3748]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Leads Quentes</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.leadsQuentes}</div>
              <p className="text-xs text-gray-500 mt-1">Alta probabilidade</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2332] border-[#2d3748]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Leads Mornos</CardTitle>
              <Target className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.leadsMornos}</div>
              <p className="text-xs text-gray-500 mt-1">Necessita follow-up</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2332] border-[#2d3748]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Leads Frios</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.leadsFrios}</div>
              <p className="text-xs text-gray-500 mt-1">Baixo engajamento</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Busca */}
        <Card className="bg-[#1a2332] border-[#2d3748]">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              {/* Busca */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome, email, telefone ou interesse..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Filtros */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex gap-2">
                  <span className="text-sm text-gray-400 flex items-center">Status:</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilterStatus('all')}
                    className={`${
                      filterStatus === 'all'
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-[#1a2332] border-[#2d3748] text-gray-400'
                    }`}
                  >
                    Todos
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilterStatus('quente')}
                    className={`${
                      filterStatus === 'quente'
                        ? 'bg-red-600 border-red-600 text-white'
                        : 'bg-[#1a2332] border-[#2d3748] text-gray-400'
                    }`}
                  >
                    🔥 Quentes
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilterStatus('morno')}
                    className={`${
                      filterStatus === 'morno'
                        ? 'bg-orange-600 border-orange-600 text-white'
                        : 'bg-[#1a2332] border-[#2d3748] text-gray-400'
                    }`}
                  >
                    🌡️ Mornos
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilterStatus('frio')}
                    className={`${
                      filterStatus === 'frio'
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-[#1a2332] border-[#2d3748] text-gray-400'
                    }`}
                  >
                    ❄️ Frios
                  </Button>
                </div>

                <div className="flex gap-2">
                  <span className="text-sm text-gray-400 flex items-center">Origem:</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilterOrigem('all')}
                    className={`${
                      filterOrigem === 'all'
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-[#1a2332] border-[#2d3748] text-gray-400'
                    }`}
                  >
                    Todas
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilterOrigem('AIra Auto')}
                    className={`${
                      filterOrigem === 'AIra Auto'
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-[#1a2332] border-[#2d3748] text-gray-400'
                    }`}
                  >
                    AIra Auto
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilterOrigem('AIra Imob')}
                    className={`${
                      filterOrigem === 'AIra Imob'
                        ? 'bg-purple-600 border-purple-600 text-white'
                        : 'bg-[#1a2332] border-[#2d3748] text-gray-400'
                    }`}
                  >
                    AIra Imob
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Leads */}
        <Card className="bg-[#1a2332] border-[#2d3748]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Lista de Leads</CardTitle>
                <CardDescription className="text-gray-400">
                  {filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''} encontrado{filteredLeads.length !== 1 ? 's' : ''}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2d3748]">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Lead</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Contato</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Score</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Origem</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Interesse</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Próxima Ação</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="border-b border-[#2d3748] hover:bg-[#253447] transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-semibold">
                            {lead.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">{lead.nome}</div>
                            <div className="text-xs text-gray-500">ID: #{lead.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-300">
                            <Mail className="h-3 w-3 text-gray-500" />
                            {lead.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-300">
                            <Phone className="h-3 w-3 text-gray-500" />
                            {lead.telefone}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(lead.status)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className={`text-lg font-bold ${getScoreColor(lead.score)}`}>
                            {lead.score}
                          </div>
                          <div className="flex gap-0.5">
                            {getScoreStars(lead.score)}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {getOrigemBadge(lead.origem)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-white">{lead.interesse}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-blue-400">{lead.proximaAcao}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            onClick={() => openViewModal(lead)}
                            variant="outline"
                            size="sm"
                            className="bg-[#0f1419] border-[#2d3748] text-gray-400 hover:bg-[#253447] hover:text-white h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => openEditModal(lead)}
                            variant="outline"
                            size="sm"
                            className="bg-[#0f1419] border-[#2d3748] text-gray-400 hover:bg-blue-600 hover:text-white hover:border-blue-600 h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(lead)}
                            variant="outline"
                            size="sm"
                            className="bg-[#0f1419] border-[#2d3748] text-gray-400 hover:bg-red-600 hover:text-white hover:border-red-600 h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Modal de Visualização/Edição/Criação */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a2332] border border-[#2d3748] rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">
                    {modalMode === 'view' && 'Detalhes do Lead'}
                    {modalMode === 'edit' && 'Editar Lead'}
                    {modalMode === 'create' && 'Novo Lead'}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {modalMode === 'view' ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-400">Nome</label>
                        <p className="text-white">{selectedLead.nome}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Score</label>
                        <p className={`text-lg font-bold ${getScoreColor(selectedLead.score)}`}>
                          {selectedLead.score}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-400">Email</label>
                        <p className="text-white">{selectedLead.email}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Telefone</label>
                        <p className="text-white">{selectedLead.telefone}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-400">Origem</label>
                        <p className="text-white">{selectedLead.origem}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Status</label>
                        <p className="text-white capitalize">{selectedLead.status}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Interesse</label>
                      <p className="text-white">{selectedLead.interesse}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Próxima Ação</label>
                      <p className="text-white">{selectedLead.proximaAcao}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Valor Estimado</label>
                      <p className="text-white">{selectedLead.valorEstimado}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-400">Data de Criação</label>
                        <p className="text-white">{new Date(selectedLead.dataCriacao).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Último Contato</label>
                        <p className="text-white">{new Date(selectedLead.ultimoContato).toLocaleString('pt-BR')}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-400 block mb-1">Nome</label>
                        <input
                          type="text"
                          value={formData.nome}
                          onChange={(e) => setFormData({...formData, nome: e.target.value})}
                          className="w-full px-3 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:border-blue-500"
                          placeholder="Nome completo"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 block mb-1">Score (0-100)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={formData.score}
                          onChange={(e) => setFormData({...formData, score: parseInt(e.target.value)})}
                          className="w-full px-3 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-400 block mb-1">Email</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full px-3 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:border-blue-500"
                          placeholder="email@exemplo.com"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 block mb-1">Telefone</label>
                        <input
                          type="tel"
                          value={formData.telefone}
                          onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                          className="w-full px-3 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:border-blue-500"
                          placeholder="+55 11 99999-9999"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-400 block mb-1">Origem</label>
                        <select
                          value={formData.origem}
                          onChange={(e) => setFormData({...formData, origem: e.target.value})}
                          className="w-full px-3 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="AIra Auto">AIra Auto</option>
                          <option value="AIra Imob">AIra Imob</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 block mb-1">Status</label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({...formData, status: e.target.value})}
                          className="w-full px-3 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="quente">Quente</option>
                          <option value="morno">Morno</option>
                          <option value="frio">Frio</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 block mb-1">Interesse</label>
                      <input
                        type="text"
                        value={formData.interesse}
                        onChange={(e) => setFormData({...formData, interesse: e.target.value})}
                        className="w-full px-3 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:border-blue-500"
                        placeholder="SUV, Apartamento, etc."
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 block mb-1">Próxima Ação</label>
                      <input
                        type="text"
                        value={formData.proximaAcao}
                        onChange={(e) => setFormData({...formData, proximaAcao: e.target.value})}
                        className="w-full px-3 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:border-blue-500"
                        placeholder="Agendar visita, enviar proposta, etc."
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 block mb-1">Valor Estimado</label>
                      <input
                        type="text"
                        value={formData.valorEstimado}
                        onChange={(e) => setFormData({...formData, valorEstimado: e.target.value})}
                        className="w-full px-3 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:border-blue-500"
                        placeholder="R$ 100.000"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-[#0f1419] border border-[#2d3748] text-white rounded-lg hover:bg-[#253447] transition-colors"
                  >
                    {modalMode === 'view' ? 'Fechar' : 'Cancelar'}
                  </button>
                  {modalMode !== 'view' && (
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    >
                      <Save className="h-4 w-4" />
                      Salvar
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Confirmação de Exclusão */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a2332] border border-[#2d3748] rounded-lg w-full max-w-md p-6">
              <h2 className="text-xl font-bold text-white mb-4">Confirmar Exclusão</h2>
              <p className="text-gray-400 mb-6">
                Tem certeza que deseja deletar o lead <span className="text-white font-semibold">{leadToDelete?.nome}</span>?
                Esta ação não pode ser desfeita.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-[#0f1419] border border-[#2d3748] text-white rounded-lg hover:bg-[#253447] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  Deletar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Leads;
