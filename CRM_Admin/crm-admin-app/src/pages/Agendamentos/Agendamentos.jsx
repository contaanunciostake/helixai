import { useState } from 'react';
import { Calendar, Clock, MapPin, User, Phone, Mail, Car, Building2, CheckCircle, XCircle, AlertCircle, ChevronLeft, ChevronRight, Plus, Filter, Search, Eye, Edit, Trash2, X, Save } from 'lucide-react';
import { DashboardLayout } from '../Dashboard/components/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

export function Agendamentos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [mesAtual, setMesAtual] = useState(new Date());

  // Estados para CRUD
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // view, edit, create
  const [selectedAgendamento, setSelectedAgendamento] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [agendamentoToDelete, setAgendamentoToDelete] = useState(null);

  const [formData, setFormData] = useState({
    tipo: 'test-drive',
    cliente: { nome: '', email: '', telefone: '' },
    origem: 'AIra Auto',
    status: 'pendente',
    data: new Date().toISOString().split('T')[0],
    hora: '09:00',
    duracao: '30min',
    local: '',
    endereco: '',
    detalhes: '',
    observacoes: ''
  });

  const [stats, setStats] = useState({
    agendamentosHoje: 3,
    aguardandoConfirmacao: 2,
    confirmados: 6,
    realizados: 1
  });

  const [agendamentos, setAgendamentos] = useState([
    {
      id: 1,
      tipo: 'test-drive',
      cliente: {
        nome: 'Ricardo Mendes',
        email: 'ricardo.mendes@email.com',
        telefone: '+55 11 99888-7777'
      },
      origem: 'AIra Auto',
      status: 'confirmado',
      data: '2025-10-17',
      hora: '14:00',
      duracao: '30min',
      local: 'Concessionária Zona Sul',
      endereco: 'Av. das Nações Unidas, 1234 - São Paulo/SP',
      detalhes: 'Test drive - Jeep Commander Limited',
      observacoes: 'Cliente já visitou o showroom anteriormente'
    },
    {
      id: 2,
      tipo: 'visita',
      cliente: {
        nome: 'Patricia Souza',
        email: 'patricia.souza@email.com',
        telefone: '+55 21 98777-6666'
      },
      origem: 'AIra Imob',
      status: 'confirmado',
      data: '2025-10-17',
      hora: '10:30',
      duracao: '45min',
      local: 'Apartamento Leblon',
      endereco: 'Rua Dias Ferreira, 567 - Rio de Janeiro/RJ',
      detalhes: 'Visita ao apartamento 3 quartos',
      observacoes: 'Levar planta e documentação'
    },
    {
      id: 3,
      tipo: 'visita',
      cliente: {
        nome: 'Camila Ribeiro',
        email: 'camila.ribeiro@email.com',
        telefone: '+55 11 96555-4444'
      },
      origem: 'AIra Imob',
      status: 'confirmado',
      data: '2025-10-17',
      hora: '09:00',
      duracao: '1h',
      local: 'Casa Alphaville',
      endereco: 'Alameda das Flores, 123 - Alphaville/SP',
      detalhes: 'Visita à casa em condomínio fechado',
      observacoes: 'Cliente interessada em financiamento'
    },
    {
      id: 4,
      tipo: 'test-drive',
      cliente: {
        nome: 'Pedro Henrique',
        email: 'pedro.henrique@email.com',
        telefone: '+55 11 95555-4444'
      },
      origem: 'AIra Auto',
      status: 'pendente',
      data: '2025-10-17',
      hora: '16:00',
      duracao: '30min',
      local: 'Concessionária Campinas',
      endereco: 'Rodovia Santos Dumont, km 45 - Campinas/SP',
      detalhes: 'Test drive - Fiat Toro',
      observacoes: 'Aguardando confirmação do cliente'
    },
    {
      id: 5,
      tipo: 'reuniao',
      cliente: {
        nome: 'Ana Paula Costa',
        email: 'ana.costa@email.com',
        telefone: '+55 11 96666-5555'
      },
      origem: 'AIra Imob',
      status: 'confirmado',
      data: '2025-10-18',
      hora: '14:30',
      duracao: '1h30min',
      local: 'Escritório Imobiliária',
      endereco: 'Av. Paulista, 1000 - São Paulo/SP',
      detalhes: 'Assinatura de contrato',
      observacoes: 'Trazer documentação pessoal'
    },
    {
      id: 6,
      tipo: 'visita',
      cliente: {
        nome: 'Beatriz Almeida',
        email: 'beatriz.almeida@email.com',
        telefone: '+55 11 94333-2222'
      },
      origem: 'AIra Imob',
      status: 'pendente',
      data: '2025-10-18',
      hora: '11:00',
      duracao: '45min',
      local: 'Apartamento Vila Mariana',
      endereco: 'Rua Domingos de Morais, 890 - São Paulo/SP',
      detalhes: 'Visita ao apartamento 2 quartos',
      observacoes: ''
    },
    {
      id: 7,
      tipo: 'test-drive',
      cliente: {
        nome: 'Lucas Martins',
        email: 'lucas.martins@email.com',
        telefone: '+55 21 95444-3333'
      },
      origem: 'AIra Auto',
      status: 'realizado',
      data: '2025-10-15',
      hora: '15:00',
      duracao: '30min',
      local: 'Concessionária Zona Norte',
      endereco: 'Av. Brasil, 5000 - Rio de Janeiro/RJ',
      detalhes: 'Test drive - Chevrolet Onix',
      observacoes: 'Cliente gostou do veículo'
    },
    {
      id: 8,
      tipo: 'visita',
      cliente: {
        nome: 'Fernanda Lima',
        email: 'fernanda.lima@email.com',
        telefone: '+55 11 92222-1111'
      },
      origem: 'AIra Imob',
      status: 'cancelado',
      data: '2025-10-14',
      hora: '10:00',
      duracao: '45min',
      local: 'Apartamento Moema',
      endereco: 'Av. Moema, 456 - São Paulo/SP',
      detalhes: 'Visita cancelada pelo cliente',
      observacoes: 'Cliente desistiu da compra'
    },
    {
      id: 9,
      tipo: 'reuniao',
      cliente: {
        nome: 'Roberto Alves',
        email: 'roberto.alves@email.com',
        telefone: '+55 11 93333-2222'
      },
      origem: 'AIra Auto',
      status: 'confirmado',
      data: '2025-10-19',
      hora: '10:00',
      duracao: '1h',
      local: 'Concessionária Centro',
      endereco: 'Rua da Consolação, 2000 - São Paulo/SP',
      detalhes: 'Negociação de troca',
      observacoes: 'Avaliação de veículo usado'
    },
    {
      id: 10,
      tipo: 'visita',
      cliente: {
        nome: 'Gabriela Ferreira',
        email: 'gabriela.ferreira@email.com',
        telefone: '+55 11 92111-0000'
      },
      origem: 'AIra Imob',
      status: 'confirmado',
      data: '2025-10-19',
      hora: '15:30',
      duracao: '1h',
      local: 'Cobertura Jardins',
      endereco: 'Rua Haddock Lobo, 789 - São Paulo/SP',
      detalhes: 'Visita à cobertura duplex',
      observacoes: 'Cliente VIP - Alta renda'
    }
  ]);

  // Funções para abrir modais
  const openViewModal = (agendamento) => {
    setSelectedAgendamento(agendamento);
    setModalMode('view');
    setShowModal(true);
  };

  const openEditModal = (agendamento) => {
    setSelectedAgendamento(agendamento);
    setFormData({
      tipo: agendamento.tipo,
      cliente: { ...agendamento.cliente },
      origem: agendamento.origem,
      status: agendamento.status,
      data: agendamento.data,
      hora: agendamento.hora,
      duracao: agendamento.duracao,
      local: agendamento.local,
      endereco: agendamento.endereco,
      detalhes: agendamento.detalhes,
      observacoes: agendamento.observacoes
    });
    setModalMode('edit');
    setShowModal(true);
  };

  const openCreateModal = () => {
    setFormData({
      tipo: 'test-drive',
      cliente: { nome: '', email: '', telefone: '' },
      origem: 'AIra Auto',
      status: 'pendente',
      data: new Date().toISOString().split('T')[0],
      hora: '09:00',
      duracao: '30min',
      local: '',
      endereco: '',
      detalhes: '',
      observacoes: ''
    });
    setModalMode('create');
    setShowModal(true);
  };

  const handleDelete = (agendamento) => {
    setAgendamentoToDelete(agendamento);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    const updated = agendamentos.filter(a => a.id !== agendamentoToDelete.id);
    setAgendamentos(updated);

    // Atualizar estatísticas
    const hoje = new Date().toISOString().split('T')[0];
    setStats(prev => ({
      ...prev,
      agendamentosHoje: agendamentoToDelete.data === hoje ? prev.agendamentosHoje - 1 : prev.agendamentosHoje,
      aguardandoConfirmacao: agendamentoToDelete.status === 'pendente' ? prev.aguardandoConfirmacao - 1 : prev.aguardandoConfirmacao,
      confirmados: agendamentoToDelete.status === 'confirmado' ? prev.confirmados - 1 : prev.confirmados,
      realizados: agendamentoToDelete.status === 'realizado' ? prev.realizados - 1 : prev.realizados
    }));

    setShowDeleteConfirm(false);
    setAgendamentoToDelete(null);
  };

  const handleSave = () => {
    if (modalMode === 'create') {
      const newAgendamento = {
        id: agendamentos.length + 1,
        ...formData
      };
      setAgendamentos([...agendamentos, newAgendamento]);

      // Atualizar estatísticas
      const hoje = new Date().toISOString().split('T')[0];
      setStats(prev => ({
        ...prev,
        agendamentosHoje: formData.data === hoje ? prev.agendamentosHoje + 1 : prev.agendamentosHoje,
        aguardandoConfirmacao: formData.status === 'pendente' ? prev.aguardandoConfirmacao + 1 : prev.aguardandoConfirmacao,
        confirmados: formData.status === 'confirmado' ? prev.confirmados + 1 : prev.confirmados
      }));
    } else if (modalMode === 'edit') {
      const updated = agendamentos.map(a =>
        a.id === selectedAgendamento.id ? { ...a, ...formData } : a
      );
      setAgendamentos(updated);

      // Atualizar estatísticas se status mudou
      if (selectedAgendamento.status !== formData.status) {
        setStats(prev => {
          const newStats = { ...prev };

          // Decrementar status anterior
          if (selectedAgendamento.status === 'pendente') newStats.aguardandoConfirmacao--;
          else if (selectedAgendamento.status === 'confirmado') newStats.confirmados--;
          else if (selectedAgendamento.status === 'realizado') newStats.realizados--;

          // Incrementar novo status
          if (formData.status === 'pendente') newStats.aguardandoConfirmacao++;
          else if (formData.status === 'confirmado') newStats.confirmados++;
          else if (formData.status === 'realizado') newStats.realizados++;

          return newStats;
        });
      }
    }

    setShowModal(false);
    setSelectedAgendamento(null);
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'test-drive':
        return <Car className="h-4 w-4" />;
      case 'visita':
        return <Building2 className="h-4 w-4" />;
      case 'reuniao':
        return <User className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getTipoBadge = (tipo) => {
    switch (tipo) {
      case 'test-drive':
        return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/50">Test Drive</Badge>;
      case 'visita':
        return <Badge className="bg-purple-500/20 text-purple-500 border-purple-500/50">Visita</Badge>;
      case 'reuniao':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/50">Reunião</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-500 border-gray-500/50">Outro</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmado':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/50"><CheckCircle className="h-3 w-3 mr-1" />Confirmado</Badge>;
      case 'pendente':
        return <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/50"><AlertCircle className="h-3 w-3 mr-1" />Pendente</Badge>;
      case 'realizado':
        return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/50"><CheckCircle className="h-3 w-3 mr-1" />Realizado</Badge>;
      case 'cancelado':
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/50"><XCircle className="h-3 w-3 mr-1" />Cancelado</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-500 border-gray-500/50">Novo</Badge>;
    }
  };

  const getOrigemBadge = (origem) => {
    if (origem === 'AIra Auto') {
      return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/50 text-xs">AIra Auto</Badge>;
    }
    return <Badge className="bg-purple-500/20 text-purple-500 border-purple-500/50 text-xs">AIra Imob</Badge>;
  };

  const filteredAgendamentos = agendamentos.filter(agendamento => {
    const matchesSearch =
      agendamento.cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agendamento.local.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agendamento.detalhes.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTipo = filterTipo === 'all' || agendamento.tipo === filterTipo;
    const matchesStatus = filterStatus === 'all' || agendamento.status === filterStatus;

    return matchesSearch && matchesTipo && matchesStatus;
  });

  // Agrupar por data
  const agendamentosPorData = filteredAgendamentos.reduce((acc, agendamento) => {
    const data = agendamento.data;
    if (!acc[data]) {
      acc[data] = [];
    }
    acc[data].push(agendamento);
    return acc;
  }, {});

  const formatarData = (dataString) => {
    const data = new Date(dataString + 'T00:00:00');
    const hoje = new Date();
    const amanha = new Date(hoje);
    amanha.setDate(hoje.getDate() + 1);

    if (data.toDateString() === hoje.toDateString()) {
      return 'Hoje';
    } else if (data.toDateString() === amanha.toDateString()) {
      return 'Amanhã';
    } else {
      return data.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Agendamentos</h1>
            <p className="text-gray-400 mt-1">Gerenciamento de visitas, test drives e reuniões</p>
          </div>
          <Button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Novo Agendamento
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-[#1a2332] border-[#2d3748]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Hoje</CardTitle>
              <Calendar className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.agendamentosHoje}</div>
              <p className="text-xs text-gray-500 mt-1">Agendamentos para hoje</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2332] border-[#2d3748]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Aguardando</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.aguardandoConfirmacao}</div>
              <p className="text-xs text-gray-500 mt-1">Pendentes de confirmação</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2332] border-[#2d3748]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Confirmados</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.confirmados}</div>
              <p className="text-xs text-gray-500 mt-1">Próximos 7 dias</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2332] border-[#2d3748]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Realizados</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.realizados}</div>
              <p className="text-xs text-gray-500 mt-1">Últimos 30 dias</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Busca */}
        <Card className="bg-[#1a2332] border-[#2d3748]">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              {/* Busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por cliente, local ou detalhes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Filtros */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex gap-2">
                  <span className="text-sm text-gray-400 flex items-center">Tipo:</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilterTipo('all')}
                    className={`${
                      filterTipo === 'all'
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-[#0f1419] border-[#2d3748] text-gray-400'
                    }`}
                  >
                    Todos
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilterTipo('test-drive')}
                    className={`${
                      filterTipo === 'test-drive'
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-[#0f1419] border-[#2d3748] text-gray-400'
                    }`}
                  >
                    Test Drive
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilterTipo('visita')}
                    className={`${
                      filterTipo === 'visita'
                        ? 'bg-purple-600 border-purple-600 text-white'
                        : 'bg-[#0f1419] border-[#2d3748] text-gray-400'
                    }`}
                  >
                    Visitas
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilterTipo('reuniao')}
                    className={`${
                      filterTipo === 'reuniao'
                        ? 'bg-green-600 border-green-600 text-white'
                        : 'bg-[#0f1419] border-[#2d3748] text-gray-400'
                    }`}
                  >
                    Reuniões
                  </Button>
                </div>

                <div className="flex gap-2">
                  <span className="text-sm text-gray-400 flex items-center">Status:</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilterStatus('all')}
                    className={`${
                      filterStatus === 'all'
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-[#0f1419] border-[#2d3748] text-gray-400'
                    }`}
                  >
                    Todos
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilterStatus('confirmado')}
                    className={`${
                      filterStatus === 'confirmado'
                        ? 'bg-green-600 border-green-600 text-white'
                        : 'bg-[#0f1419] border-[#2d3748] text-gray-400'
                    }`}
                  >
                    Confirmados
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilterStatus('pendente')}
                    className={`${
                      filterStatus === 'pendente'
                        ? 'bg-orange-600 border-orange-600 text-white'
                        : 'bg-[#0f1419] border-[#2d3748] text-gray-400'
                    }`}
                  >
                    Pendentes
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Agendamentos Agrupados por Data */}
        <div className="space-y-4">
          {Object.keys(agendamentosPorData).sort().map((data) => (
            <Card key={data} className="bg-[#1a2332] border-[#2d3748]">
              <CardHeader className="border-b border-[#2d3748]">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <CardTitle className="text-white capitalize">{formatarData(data)}</CardTitle>
                  <Badge className="ml-2 bg-blue-500/20 text-blue-500 border-blue-500/50">
                    {agendamentosPorData[data].length} agendamento{agendamentosPorData[data].length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {agendamentosPorData[data].sort((a, b) => a.hora.localeCompare(b.hora)).map((agendamento) => (
                  <div
                    key={agendamento.id}
                    className="p-4 border-b border-[#2d3748] last:border-0 hover:bg-[#253447] transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* Horário */}
                      <div className="text-center min-w-[70px]">
                        <div className="text-2xl font-bold text-blue-500">{agendamento.hora}</div>
                        <div className="text-xs text-gray-500">{agendamento.duracao}</div>
                      </div>

                      {/* Detalhes */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getTipoBadge(agendamento.tipo)}
                          {getOrigemBadge(agendamento.origem)}
                          {getStatusBadge(agendamento.status)}
                        </div>

                        <h4 className="text-white font-medium mb-2">{agendamento.detalhes}</h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-400">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            {agendamento.cliente.nome}
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-500" />
                            {agendamento.cliente.telefone}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            {agendamento.local}
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            {agendamento.cliente.email}
                          </div>
                        </div>

                        {agendamento.observacoes && (
                          <div className="mt-2 text-sm text-gray-500 italic">
                            Obs: {agendamento.observacoes}
                          </div>
                        )}
                      </div>

                      {/* Ações */}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => openViewModal(agendamento)}
                          variant="outline"
                          size="sm"
                          className="bg-[#0f1419] border-[#2d3748] text-gray-400 hover:bg-blue-600 hover:text-white hover:border-blue-600"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        <Button
                          onClick={() => openEditModal(agendamento)}
                          variant="outline"
                          size="sm"
                          className="bg-[#0f1419] border-[#2d3748] text-gray-400 hover:bg-green-600 hover:text-white hover:border-green-600"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          onClick={() => handleDelete(agendamento)}
                          variant="outline"
                          size="sm"
                          className="bg-[#0f1419] border-[#2d3748] text-gray-400 hover:bg-red-600 hover:text-white hover:border-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAgendamentos.length === 0 && (
          <Card className="bg-[#1a2332] border-[#2d3748] p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Nenhum agendamento encontrado</p>
          </Card>
        )}

        {/* Modal de Visualização/Edição/Criação */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a2332] border border-[#2d3748] rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">
                    {modalMode === 'view' && 'Detalhes do Agendamento'}
                    {modalMode === 'edit' && 'Editar Agendamento'}
                    {modalMode === 'create' && 'Novo Agendamento'}
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
                        <label className="text-sm text-gray-400">Tipo</label>
                        <p className="text-white capitalize">{selectedAgendamento.tipo.replace('-', ' ')}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Status</label>
                        <p className="text-white capitalize">{selectedAgendamento.status}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Cliente</label>
                      <p className="text-white">{selectedAgendamento.cliente.nome}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-400">Email</label>
                        <p className="text-white">{selectedAgendamento.cliente.email}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Telefone</label>
                        <p className="text-white">{selectedAgendamento.cliente.telefone}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm text-gray-400">Data</label>
                        <p className="text-white">{new Date(selectedAgendamento.data + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Hora</label>
                        <p className="text-white">{selectedAgendamento.hora}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Duração</label>
                        <p className="text-white">{selectedAgendamento.duracao}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Local</label>
                      <p className="text-white">{selectedAgendamento.local}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Endereço</label>
                      <p className="text-white">{selectedAgendamento.endereco}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Detalhes</label>
                      <p className="text-white">{selectedAgendamento.detalhes}</p>
                    </div>
                    {selectedAgendamento.observacoes && (
                      <div>
                        <label className="text-sm text-gray-400">Observações</label>
                        <p className="text-white">{selectedAgendamento.observacoes}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-400 block mb-1">Tipo</label>
                        <select
                          value={formData.tipo}
                          onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                          className="w-full px-3 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="test-drive">Test Drive</option>
                          <option value="visita">Visita</option>
                          <option value="reuniao">Reunião</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 block mb-1">Status</label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({...formData, status: e.target.value})}
                          className="w-full px-3 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="pendente">Pendente</option>
                          <option value="confirmado">Confirmado</option>
                          <option value="realizado">Realizado</option>
                          <option value="cancelado">Cancelado</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 block mb-1">Nome do Cliente</label>
                      <input
                        type="text"
                        value={formData.cliente.nome}
                        onChange={(e) => setFormData({...formData, cliente: {...formData.cliente, nome: e.target.value}})}
                        className="w-full px-3 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:border-blue-500"
                        placeholder="Nome completo"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-400 block mb-1">Email</label>
                        <input
                          type="email"
                          value={formData.cliente.email}
                          onChange={(e) => setFormData({...formData, cliente: {...formData.cliente, email: e.target.value}})}
                          className="w-full px-3 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:border-blue-500"
                          placeholder="email@exemplo.com"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 block mb-1">Telefone</label>
                        <input
                          type="tel"
                          value={formData.cliente.telefone}
                          onChange={(e) => setFormData({...formData, cliente: {...formData.cliente, telefone: e.target.value}})}
                          className="w-full px-3 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:border-blue-500"
                          placeholder="+55 11 99999-9999"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm text-gray-400 block mb-1">Data</label>
                        <input
                          type="date"
                          value={formData.data}
                          onChange={(e) => setFormData({...formData, data: e.target.value})}
                          className="w-full px-3 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 block mb-1">Hora</label>
                        <input
                          type="time"
                          value={formData.hora}
                          onChange={(e) => setFormData({...formData, hora: e.target.value})}
                          className="w-full px-3 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 block mb-1">Duração</label>
                        <select
                          value={formData.duracao}
                          onChange={(e) => setFormData({...formData, duracao: e.target.value})}
                          className="w-full px-3 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="30min">30 min</option>
                          <option value="45min">45 min</option>
                          <option value="1h">1 hora</option>
                          <option value="1h30min">1h 30min</option>
                          <option value="2h">2 horas</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 block mb-1">Local</label>
                      <input
                        type="text"
                        value={formData.local}
                        onChange={(e) => setFormData({...formData, local: e.target.value})}
                        className="w-full px-3 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:border-blue-500"
                        placeholder="Concessionária, Imóvel, etc."
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 block mb-1">Endereço</label>
                      <input
                        type="text"
                        value={formData.endereco}
                        onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                        className="w-full px-3 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:border-blue-500"
                        placeholder="Endereço completo"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 block mb-1">Detalhes</label>
                      <input
                        type="text"
                        value={formData.detalhes}
                        onChange={(e) => setFormData({...formData, detalhes: e.target.value})}
                        className="w-full px-3 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:border-blue-500"
                        placeholder="Descrição do agendamento"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 block mb-1">Observações</label>
                      <textarea
                        value={formData.observacoes}
                        onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                        className="w-full px-3 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:border-blue-500"
                        placeholder="Observações adicionais"
                        rows="3"
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
                Tem certeza que deseja deletar o agendamento de <span className="text-white font-semibold">{agendamentoToDelete?.cliente.nome}</span> em{' '}
                <span className="text-white font-semibold">{new Date(agendamentoToDelete?.data + 'T00:00:00').toLocaleDateString('pt-BR')}</span> às{' '}
                <span className="text-white font-semibold">{agendamentoToDelete?.hora}</span>?
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

export default Agendamentos;
