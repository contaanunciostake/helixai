import { useState } from 'react';
import { Users, UserPlus, Search, Edit, Trash2, Phone, Mail, MapPin, Calendar, TrendingUp, UserCheck, UserX, Eye, X, Save } from 'lucide-react';
import { DashboardLayout } from '../Dashboard/components/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

export function Clientes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // view, edit, create
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState(null);

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cidade: '',
    status: 'ativo',
    origem: 'AIra Auto'
  });

  const [stats, setStats] = useState({
    totalClientes: 8,
    clientesAtivos: 6,
    clientesInativos: 2,
    novosEsteMes: 3
  });

  const [clientes, setClientes] = useState([
    {
      id: 1,
      nome: 'João Silva',
      email: 'joao.silva@email.com',
      telefone: '+55 11 98765-4321',
      cidade: 'São Paulo, SP',
      status: 'ativo',
      origem: 'AIra Auto',
      dataCadastro: '2025-01-15',
      ultimaInteracao: '2025-10-14',
      totalCompras: 2,
      valorTotal: 'R$ 185.000'
    },
    {
      id: 2,
      nome: 'Maria Santos',
      email: 'maria.santos@email.com',
      telefone: '+55 11 91234-5678',
      cidade: 'Rio de Janeiro, RJ',
      status: 'ativo',
      origem: 'AIra Imob',
      dataCadastro: '2025-02-20',
      ultimaInteracao: '2025-10-15',
      totalCompras: 1,
      valorTotal: 'R$ 450.000'
    },
    {
      id: 3,
      nome: 'Carlos Oliveira',
      email: 'carlos.oliveira@email.com',
      telefone: '+55 21 97777-8888',
      cidade: 'Belo Horizonte, MG',
      status: 'inativo',
      origem: 'AIra Auto',
      dataCadastro: '2024-11-10',
      ultimaInteracao: '2025-08-20',
      totalCompras: 0,
      valorTotal: 'R$ 0'
    },
    {
      id: 4,
      nome: 'Ana Paula Costa',
      email: 'ana.costa@email.com',
      telefone: '+55 11 96666-5555',
      cidade: 'São Paulo, SP',
      status: 'ativo',
      origem: 'AIra Imob',
      dataCadastro: '2025-03-05',
      ultimaInteracao: '2025-10-16',
      totalCompras: 3,
      valorTotal: 'R$ 1.200.000'
    },
    {
      id: 5,
      nome: 'Pedro Henrique',
      email: 'pedro.henrique@email.com',
      telefone: '+55 11 95555-4444',
      cidade: 'Campinas, SP',
      status: 'ativo',
      origem: 'AIra Auto',
      dataCadastro: '2025-04-12',
      ultimaInteracao: '2025-10-13',
      totalCompras: 1,
      valorTotal: 'R$ 95.000'
    },
    {
      id: 6,
      nome: 'Juliana Ferreira',
      email: 'juliana.ferreira@email.com',
      telefone: '+55 21 94444-3333',
      cidade: 'Curitiba, PR',
      status: 'ativo',
      origem: 'AIra Imob',
      dataCadastro: '2025-05-08',
      ultimaInteracao: '2025-10-16',
      totalCompras: 2,
      valorTotal: 'R$ 780.000'
    },
    {
      id: 7,
      nome: 'Roberto Alves',
      email: 'roberto.alves@email.com',
      telefone: '+55 11 93333-2222',
      cidade: 'Porto Alegre, RS',
      status: 'inativo',
      origem: 'AIra Auto',
      dataCadastro: '2024-12-20',
      ultimaInteracao: '2025-07-10',
      totalCompras: 0,
      valorTotal: 'R$ 0'
    },
    {
      id: 8,
      nome: 'Fernanda Lima',
      email: 'fernanda.lima@email.com',
      telefone: '+55 11 92222-1111',
      cidade: 'Brasília, DF',
      status: 'ativo',
      origem: 'AIra Imob',
      dataCadastro: '2025-06-15',
      ultimaInteracao: '2025-10-15',
      totalCompras: 1,
      valorTotal: 'R$ 520.000'
    },
  ]);

  const openViewModal = (cliente) => {
    setSelectedCliente(cliente);
    setModalMode('view');
    setShowModal(true);
  };

  const openEditModal = (cliente) => {
    setSelectedCliente(cliente);
    setFormData({
      nome: cliente.nome,
      email: cliente.email,
      telefone: cliente.telefone,
      cidade: cliente.cidade,
      status: cliente.status,
      origem: cliente.origem
    });
    setModalMode('edit');
    setShowModal(true);
  };

  const openCreateModal = () => {
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      cidade: '',
      status: 'ativo',
      origem: 'AIra Auto'
    });
    setModalMode('create');
    setShowModal(true);
  };

  const handleDelete = (cliente) => {
    setClienteToDelete(cliente);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    const updated = clientes.filter(c => c.id !== clienteToDelete.id);
    setClientes(updated);
    setStats(prev => ({
      ...prev,
      totalClientes: prev.totalClientes - 1,
      clientesAtivos: clienteToDelete.status === 'ativo' ? prev.clientesAtivos - 1 : prev.clientesAtivos,
      clientesInativos: clienteToDelete.status === 'inativo' ? prev.clientesInativos - 1 : prev.clientesInativos
    }));
    setShowDeleteConfirm(false);
    setClienteToDelete(null);
  };

  const handleSave = () => {
    if (modalMode === 'create') {
      const newCliente = {
        id: clientes.length + 1,
        ...formData,
        dataCadastro: new Date().toISOString().split('T')[0],
        ultimaInteracao: new Date().toISOString().split('T')[0],
        totalCompras: 0,
        valorTotal: 'R$ 0'
      };
      setClientes([...clientes, newCliente]);
      setStats(prev => ({
        ...prev,
        totalClientes: prev.totalClientes + 1,
        clientesAtivos: formData.status === 'ativo' ? prev.clientesAtivos + 1 : prev.clientesAtivos,
        clientesInativos: formData.status === 'inativo' ? prev.clientesInativos + 1 : prev.clientesInativos,
        novosEsteMes: prev.novosEsteMes + 1
      }));
    } else if (modalMode === 'edit') {
      const updated = clientes.map(c =>
        c.id === selectedCliente.id
          ? { ...c, ...formData }
          : c
      );
      setClientes(updated);

      // Atualizar stats se o status mudou
      if (selectedCliente.status !== formData.status) {
        setStats(prev => ({
          ...prev,
          clientesAtivos: formData.status === 'ativo' ? prev.clientesAtivos + 1 : prev.clientesAtivos - 1,
          clientesInativos: formData.status === 'inativo' ? prev.clientesInativos + 1 : prev.clientesInativos - 1
        }));
      }
    }
    setShowModal(false);
    setSelectedCliente(null);
  };

  const getStatusBadge = (status) => {
    if (status === 'ativo') {
      return <Badge className="bg-green-500/20 text-green-500 border-green-500/50">Ativo</Badge>;
    }
    return <Badge className="bg-gray-500/20 text-gray-500 border-gray-500/50">Inativo</Badge>;
  };

  const getOrigemBadge = (origem) => {
    if (origem === 'AIra Auto') {
      return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/50">AIra Auto</Badge>;
    }
    return <Badge className="bg-purple-500/20 text-purple-500 border-purple-500/50">AIra Imob</Badge>;
  };

  const filteredClientes = clientes.filter(cliente => {
    const matchesSearch =
      cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.telefone.includes(searchTerm) ||
      cliente.cidade.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === 'all' || cliente.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Clientes</h1>
            <p className="text-gray-400 mt-1">Gerenciamento completo da base de clientes</p>
          </div>
          <Button
            onClick={openCreateModal}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-[#1a2332] border-[#2d3748]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total de Clientes</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalClientes}</div>
              <p className="text-xs text-gray-500 mt-1">Base completa</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2332] border-[#2d3748]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Clientes Ativos</CardTitle>
              <UserCheck className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.clientesAtivos}</div>
              <p className="text-xs text-gray-500 mt-1">Com interação recente</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2332] border-[#2d3748]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Clientes Inativos</CardTitle>
              <UserX className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.clientesInativos}</div>
              <p className="text-xs text-gray-500 mt-1">Sem interação há 90+ dias</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2332] border-[#2d3748]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Novos Este Mês</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.novosEsteMes}</div>
              <p className="text-xs text-gray-500 mt-1">Outubro 2025</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Busca */}
        <Card className="bg-[#1a2332] border-[#2d3748]">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Busca */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome, email, telefone ou cidade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Filtro de Status */}
              <div className="flex gap-2">
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
                  onClick={() => setFilterStatus('ativo')}
                  className={`${
                    filterStatus === 'ativo'
                      ? 'bg-green-600 border-green-600 text-white'
                      : 'bg-[#1a2332] border-[#2d3748] text-gray-400'
                  }`}
                >
                  Ativos
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilterStatus('inativo')}
                  className={`${
                    filterStatus === 'inativo'
                      ? 'bg-orange-600 border-orange-600 text-white'
                      : 'bg-[#1a2332] border-[#2d3748] text-gray-400'
                  }`}
                >
                  Inativos
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Clientes */}
        <Card className="bg-[#1a2332] border-[#2d3748]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Lista de Clientes</CardTitle>
                <CardDescription className="text-gray-400">
                  {filteredClientes.length} cliente{filteredClientes.length !== 1 ? 's' : ''} encontrado{filteredClientes.length !== 1 ? 's' : ''}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2d3748]">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Cliente</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Contato</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Localização</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Origem</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Última Interação</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClientes.map((cliente) => (
                    <tr
                      key={cliente.id}
                      className="border-b border-[#2d3748] hover:bg-[#253447] transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                            {cliente.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">{cliente.nome}</div>
                            <div className="text-xs text-gray-500">ID: #{cliente.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-300">
                            <Mail className="h-3 w-3 text-gray-500" />
                            {cliente.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-300">
                            <Phone className="h-3 w-3 text-gray-500" />
                            {cliente.telefone}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <MapPin className="h-3 w-3 text-gray-500" />
                          {cliente.cidade}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(cliente.status)}
                      </td>
                      <td className="py-4 px-4">
                        {getOrigemBadge(cliente.origem)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <Calendar className="h-3 w-3 text-gray-500" />
                          {new Date(cliente.ultimaInteracao).toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openViewModal(cliente)}
                            className="bg-[#0f1419] border-[#2d3748] text-gray-400 hover:bg-[#253447] hover:text-white h-8 w-8 p-0"
                            title="Visualizar"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(cliente)}
                            className="bg-[#0f1419] border-[#2d3748] text-gray-400 hover:bg-[#253447] hover:text-white h-8 w-8 p-0"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(cliente)}
                            className="bg-[#0f1419] border-[#2d3748] text-gray-400 hover:bg-red-600 hover:text-white hover:border-red-600 h-8 w-8 p-0"
                            title="Deletar"
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
      </div>

      {/* Modal de Visualizar/Editar/Criar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a2332] border border-[#2d3748] rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[#2d3748]">
              <h2 className="text-xl font-bold text-white">
                {modalMode === 'view' && 'Detalhes do Cliente'}
                {modalMode === 'edit' && 'Editar Cliente'}
                {modalMode === 'create' && 'Novo Cliente'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {modalMode === 'view' && selectedCliente ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400">Nome</label>
                      <p className="text-white font-medium">{selectedCliente.nome}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Email</label>
                      <p className="text-white font-medium">{selectedCliente.email}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Telefone</label>
                      <p className="text-white font-medium">{selectedCliente.telefone}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Cidade</label>
                      <p className="text-white font-medium">{selectedCliente.cidade}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Status</label>
                      <div className="mt-1">{getStatusBadge(selectedCliente.status)}</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Origem</label>
                      <div className="mt-1">{getOrigemBadge(selectedCliente.origem)}</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Data de Cadastro</label>
                      <p className="text-white font-medium">{new Date(selectedCliente.dataCadastro).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Última Interação</label>
                      <p className="text-white font-medium">{new Date(selectedCliente.ultimaInteracao).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Total de Compras</label>
                      <p className="text-white font-medium">{selectedCliente.totalCompras}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Valor Total</label>
                      <p className="text-green-400 font-medium">{selectedCliente.valorTotal}</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Nome Completo</label>
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      className="w-full px-4 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="João Silva"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-4 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="joao@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Telefone</label>
                      <input
                        type="text"
                        value={formData.telefone}
                        onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                        className="w-full px-4 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="+55 11 98765-4321"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Cidade</label>
                    <input
                      type="text"
                      value={formData.cidade}
                      onChange={(e) => setFormData({...formData, cidade: e.target.value})}
                      className="w-full px-4 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="São Paulo, SP"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className="w-full px-4 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="ativo">Ativo</option>
                        <option value="inativo">Inativo</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Origem</label>
                      <select
                        value={formData.origem}
                        onChange={(e) => setFormData({...formData, origem: e.target.value})}
                        className="w-full px-4 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="AIra Auto">AIra Auto</option>
                        <option value="AIra Imob">AIra Imob</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-[#2d3748]">
              <Button
                onClick={() => setShowModal(false)}
                variant="outline"
                className="bg-[#0f1419] border-[#2d3748] text-gray-400 hover:bg-[#253447]"
              >
                {modalMode === 'view' ? 'Fechar' : 'Cancelar'}
              </Button>
              {modalMode !== 'view' && (
                <Button
                  onClick={handleSave}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {modalMode === 'create' ? 'Criar Cliente' : 'Salvar Alterações'}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteConfirm && clienteToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a2332] border border-[#2d3748] rounded-lg w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-bold text-white mb-2">Confirmar Exclusão</h3>
              <p className="text-gray-400 mb-4">
                Tem certeza que deseja excluir o cliente <span className="text-white font-semibold">{clienteToDelete.nome}</span>?
                Esta ação não pode ser desfeita.
              </p>
              <div className="flex items-center justify-end gap-3">
                <Button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setClienteToDelete(null);
                  }}
                  variant="outline"
                  className="bg-[#0f1419] border-[#2d3748] text-gray-400 hover:bg-[#253447]"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={confirmDelete}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir Cliente
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default Clientes;
