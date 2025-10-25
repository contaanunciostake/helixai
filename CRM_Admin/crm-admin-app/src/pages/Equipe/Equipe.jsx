import { useState } from 'react';
import { DashboardLayout } from '../Dashboard/components/DashboardLayout';
import { Search, Users, UserPlus, Shield, Mail, Phone, MoreVertical, Eye, Edit, Trash2, X, Save } from 'lucide-react';

export function Equipe() {
  const [busca, setBusca] = useState('');
  const [filtroCargo, setFiltroCargo] = useState('todos');

  // Estados para CRUD
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // view, edit, create
  const [selectedMembro, setSelectedMembro] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [membroToDelete, setMembroToDelete] = useState(null);

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cargo: 'Vendedor',
    departamento: 'Vendas Auto',
    dataAdmissao: new Date().toISOString().split('T')[0],
    vendasMes: 0,
    status: 'Ativo',
    avatar: ''
  });

  const [stats, setStats] = useState({
    total: 10,
    vendedores: 5,
    atendentes: 3,
    administradores: 1
  });

  const [membros, setMembros] = useState([
    {
      id: 1,
      nome: 'Carlos Mendes',
      email: 'carlos.mendes@empresa.com',
      telefone: '(11) 98765-4321',
      cargo: 'Vendedor',
      departamento: 'Vendas Auto',
      dataAdmissao: '2022-03-15',
      vendasMes: 8,
      status: 'Ativo',
      avatar: 'CM'
    },
    {
      id: 2,
      nome: 'Ana Costa',
      email: 'ana.costa@empresa.com',
      telefone: '(11) 97654-3210',
      cargo: 'Vendedor',
      departamento: 'Vendas Imob',
      dataAdmissao: '2021-06-20',
      vendasMes: 12,
      status: 'Ativo',
      avatar: 'AC'
    },
    {
      id: 3,
      nome: 'Roberto Lima',
      email: 'roberto.lima@empresa.com',
      telefone: '(11) 96543-2109',
      cargo: 'Vendedor',
      departamento: 'Vendas Auto',
      dataAdmissao: '2023-01-10',
      vendasMes: 6,
      status: 'Ativo',
      avatar: 'RL'
    },
    {
      id: 4,
      nome: 'Fernanda Alves',
      email: 'fernanda.alves@empresa.com',
      telefone: '(11) 95432-1098',
      cargo: 'Gerente',
      departamento: 'Vendas',
      dataAdmissao: '2020-08-05',
      vendasMes: 0,
      status: 'Ativo',
      avatar: 'FA'
    },
    {
      id: 5,
      nome: 'Patricia Dias',
      email: 'patricia.dias@empresa.com',
      telefone: '(11) 94321-0987',
      cargo: 'Vendedor',
      departamento: 'Vendas Imob',
      dataAdmissao: '2022-11-15',
      vendasMes: 10,
      status: 'Ativo',
      avatar: 'PD'
    },
    {
      id: 6,
      nome: 'Lucas Martins',
      email: 'lucas.martins@empresa.com',
      telefone: '(11) 93210-9876',
      cargo: 'Atendente',
      departamento: 'Suporte',
      dataAdmissao: '2023-02-01',
      vendasMes: 0,
      status: 'Ativo',
      avatar: 'LM'
    },
    {
      id: 7,
      nome: 'Sandra Castro',
      email: 'sandra.castro@empresa.com',
      telefone: '(11) 92109-8765',
      cargo: 'Atendente',
      departamento: 'Suporte',
      dataAdmissao: '2022-07-20',
      vendasMes: 0,
      status: 'Ativo',
      avatar: 'SC'
    },
    {
      id: 8,
      nome: 'Eduardo Nunes',
      email: 'eduardo.nunes@empresa.com',
      telefone: '(11) 91098-7654',
      cargo: 'Vendedor',
      departamento: 'Vendas Auto',
      dataAdmissao: '2021-09-10',
      vendasMes: 9,
      status: 'Ativo',
      avatar: 'EN'
    },
    {
      id: 9,
      nome: 'Felipe Gomes',
      email: 'felipe.gomes@empresa.com',
      telefone: '(11) 90987-6543',
      cargo: 'Atendente',
      departamento: 'Suporte',
      dataAdmissao: '2023-03-15',
      vendasMes: 0,
      status: 'Ativo',
      avatar: 'FG'
    },
    {
      id: 10,
      nome: 'Marcos Ferreira',
      email: 'marcos.ferreira@empresa.com',
      telefone: '(11) 89876-5432',
      cargo: 'Administrador',
      departamento: 'TI',
      dataAdmissao: '2019-05-01',
      vendasMes: 0,
      status: 'Ativo',
      avatar: 'MF'
    }
  ]);

  // Funções para gerar avatar
  const gerarAvatar = (nome) => {
    const partes = nome.split(' ');
    if (partes.length >= 2) {
      return (partes[0][0] + partes[1][0]).toUpperCase();
    }
    return nome.substring(0, 2).toUpperCase();
  };

  // Funções para abrir modais
  const openViewModal = (membro) => {
    setSelectedMembro(membro);
    setModalMode('view');
    setShowModal(true);
  };

  const openEditModal = (membro) => {
    setSelectedMembro(membro);
    setFormData({
      nome: membro.nome,
      email: membro.email,
      telefone: membro.telefone,
      cargo: membro.cargo,
      departamento: membro.departamento,
      dataAdmissao: membro.dataAdmissao,
      vendasMes: membro.vendasMes,
      status: membro.status,
      avatar: membro.avatar
    });
    setModalMode('edit');
    setShowModal(true);
  };

  const openCreateModal = () => {
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      cargo: 'Vendedor',
      departamento: 'Vendas Auto',
      dataAdmissao: new Date().toISOString().split('T')[0],
      vendasMes: 0,
      status: 'Ativo',
      avatar: ''
    });
    setModalMode('create');
    setShowModal(true);
  };

  const handleDelete = (membro) => {
    setMembroToDelete(membro);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    const updated = membros.filter(m => m.id !== membroToDelete.id);
    setMembros(updated);

    // Atualizar estatísticas
    setStats(prev => ({
      ...prev,
      total: prev.total - 1,
      vendedores: membroToDelete.cargo === 'Vendedor' ? prev.vendedores - 1 : prev.vendedores,
      atendentes: membroToDelete.cargo === 'Atendente' ? prev.atendentes - 1 : prev.atendentes,
      administradores: membroToDelete.cargo === 'Administrador' ? prev.administradores - 1 : prev.administradores
    }));

    setShowDeleteConfirm(false);
    setMembroToDelete(null);
  };

  const handleSave = () => {
    if (modalMode === 'create') {
      const newMembro = {
        id: membros.length + 1,
        ...formData,
        avatar: formData.avatar || gerarAvatar(formData.nome)
      };
      setMembros([...membros, newMembro]);

      // Atualizar estatísticas
      setStats(prev => ({
        ...prev,
        total: prev.total + 1,
        vendedores: formData.cargo === 'Vendedor' ? prev.vendedores + 1 : prev.vendedores,
        atendentes: formData.cargo === 'Atendente' ? prev.atendentes + 1 : prev.atendentes,
        administradores: formData.cargo === 'Administrador' ? prev.administradores + 1 : prev.administradores
      }));
    } else if (modalMode === 'edit') {
      const updated = membros.map(m =>
        m.id === selectedMembro.id ? { ...m, ...formData, avatar: formData.avatar || gerarAvatar(formData.nome) } : m
      );
      setMembros(updated);

      // Atualizar estatísticas se cargo mudou
      if (selectedMembro.cargo !== formData.cargo) {
        setStats(prev => {
          const newStats = { ...prev };

          // Decrementar cargo anterior
          if (selectedMembro.cargo === 'Vendedor') newStats.vendedores--;
          else if (selectedMembro.cargo === 'Atendente') newStats.atendentes--;
          else if (selectedMembro.cargo === 'Administrador') newStats.administradores--;

          // Incrementar novo cargo
          if (formData.cargo === 'Vendedor') newStats.vendedores++;
          else if (formData.cargo === 'Atendente') newStats.atendentes++;
          else if (formData.cargo === 'Administrador') newStats.administradores++;

          return newStats;
        });
      }
    }

    setShowModal(false);
    setSelectedMembro(null);
  };

  const getCargoBadge = (cargo) => {
    const cores = {
      'Vendedor': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Gerente': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'Atendente': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Administrador': 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    };
    return cores[cargo] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const getStatusBadge = (status) => {
    const cores = {
      'Ativo': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Férias': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'Afastado': 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return cores[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const formatarData = (dataString) => {
    return new Date(dataString + 'T00:00:00').toLocaleDateString('pt-BR', {
      month: 'short',
      year: 'numeric'
    });
  };

  const membrosFiltrados = membros.filter(membro => {
    const matchBusca = busca === '' ||
      membro.nome.toLowerCase().includes(busca.toLowerCase()) ||
      membro.email.toLowerCase().includes(busca.toLowerCase()) ||
      membro.departamento.toLowerCase().includes(busca.toLowerCase());

    const matchCargo = filtroCargo === 'todos' || membro.cargo === filtroCargo;

    return matchBusca && matchCargo;
  });

  const estatisticas = [
    {
      titulo: 'Total de Membros',
      valor: stats.total,
      icone: Users,
      cor: 'blue',
      variacao: `${membrosFiltrados.length} visíveis`
    },
    {
      titulo: 'Vendedores',
      valor: stats.vendedores,
      icone: UserPlus,
      cor: 'green',
      variacao: `${Math.round(stats.vendedores/stats.total*100)}% do time`
    },
    {
      titulo: 'Atendentes',
      valor: stats.atendentes,
      icone: Users,
      cor: 'purple',
      variacao: `${Math.round(stats.atendentes/stats.total*100)}% do time`
    },
    {
      titulo: 'Administradores',
      valor: stats.administradores,
      icone: Shield,
      cor: 'orange',
      variacao: `${Math.round(stats.administradores/stats.total*100)}% do time`
    }
  ];

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Equipe</h1>
            <p className="text-gray-400">Gerencie membros da equipe e permissões</p>
          </div>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            Adicionar Membro
          </button>
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

        {/* Busca e Filtros */}
        <div className="bg-[#1a2332] border border-[#2d3748] rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar por nome, email ou departamento..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={filtroCargo}
              onChange={(e) => setFiltroCargo(e.target.value)}
              className="px-4 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="todos">Todos os Cargos</option>
              <option value="Vendedor">Vendedor</option>
              <option value="Atendente">Atendente</option>
              <option value="Gerente">Gerente</option>
              <option value="Administrador">Administrador</option>
            </select>
          </div>
        </div>

        {/* Lista de Membros */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {membrosFiltrados.map((membro) => (
            <div key={membro.id} className="bg-[#1a2332] border border-[#2d3748] rounded-lg p-4 hover:border-blue-500/50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {membro.avatar}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">{membro.nome}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getCargoBadge(membro.cargo)}`}>
                        {membro.cargo}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(membro.status)}`}>
                        {membro.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {membro.departamento} • Desde {formatarData(membro.dataAdmissao)}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openViewModal(membro)}
                    className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/20 rounded transition-colors"
                    title="Visualizar"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => openEditModal(membro)}
                    className="p-1.5 text-gray-400 hover:text-green-400 hover:bg-green-500/20 rounded transition-colors"
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(membro)}
                    className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded transition-colors"
                    title="Deletar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-3 py-3 border-t border-b border-[#2d3748]">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Mail className="h-4 w-4" />
                  <span>{membro.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Phone className="h-4 w-4" />
                  <span>{membro.telefone}</span>
                </div>
              </div>

              {membro.cargo === 'Vendedor' && (
                <div className="bg-[#0f1419] border border-[#2d3748] rounded px-3 py-2">
                  <div className="text-xs text-gray-500 mb-1">Performance este mês</div>
                  <div className="text-lg font-bold text-green-400">{membro.vendasMes} vendas</div>
                </div>
              )}
            </div>
          ))}
        </div>

        {membrosFiltrados.length === 0 && (
          <div className="bg-[#1a2332] border border-[#2d3748] rounded-lg p-12 text-center">
            <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Nenhum membro encontrado</p>
          </div>
        )}

        {/* Modal de Visualização/Edição/Criação */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a2332] border border-[#2d3748] rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">
                    {modalMode === 'view' && 'Detalhes do Membro'}
                    {modalMode === 'edit' && 'Editar Membro'}
                    {modalMode === 'create' && 'Novo Membro'}
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
                    <div className="flex items-center gap-4 mb-6">
                      <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xl">
                        {selectedMembro.avatar}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{selectedMembro.nome}</h3>
                        <p className="text-gray-400">{selectedMembro.cargo}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-400">Email</label>
                        <p className="text-white">{selectedMembro.email}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Telefone</label>
                        <p className="text-white">{selectedMembro.telefone}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-400">Departamento</label>
                        <p className="text-white">{selectedMembro.departamento}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Status</label>
                        <p className="text-white">{selectedMembro.status}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Data de Admissão</label>
                      <p className="text-white">{new Date(selectedMembro.dataAdmissao + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                    </div>
                    {selectedMembro.cargo === 'Vendedor' && (
                      <div>
                        <label className="text-sm text-gray-400">Vendas este mês</label>
                        <p className="text-white text-2xl font-bold text-green-400">{selectedMembro.vendasMes}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400 block mb-1">Nome Completo</label>
                      <input
                        type="text"
                        value={formData.nome}
                        onChange={(e) => setFormData({...formData, nome: e.target.value})}
                        className="w-full px-3 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:border-blue-500"
                        placeholder="Nome completo"
                      />
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
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-400 block mb-1">Cargo</label>
                        <select
                          value={formData.cargo}
                          onChange={(e) => setFormData({...formData, cargo: e.target.value})}
                          className="w-full px-3 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="Vendedor">Vendedor</option>
                          <option value="Atendente">Atendente</option>
                          <option value="Gerente">Gerente</option>
                          <option value="Administrador">Administrador</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 block mb-1">Departamento</label>
                        <select
                          value={formData.departamento}
                          onChange={(e) => setFormData({...formData, departamento: e.target.value})}
                          className="w-full px-3 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="Vendas Auto">Vendas Auto</option>
                          <option value="Vendas Imob">Vendas Imob</option>
                          <option value="Vendas">Vendas</option>
                          <option value="Suporte">Suporte</option>
                          <option value="TI">TI</option>
                          <option value="Financeiro">Financeiro</option>
                          <option value="RH">RH</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-400 block mb-1">Data de Admissão</label>
                        <input
                          type="date"
                          value={formData.dataAdmissao}
                          onChange={(e) => setFormData({...formData, dataAdmissao: e.target.value})}
                          className="w-full px-3 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 block mb-1">Status</label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({...formData, status: e.target.value})}
                          className="w-full px-3 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="Ativo">Ativo</option>
                          <option value="Férias">Férias</option>
                          <option value="Afastado">Afastado</option>
                        </select>
                      </div>
                    </div>
                    {formData.cargo === 'Vendedor' && (
                      <div>
                        <label className="text-sm text-gray-400 block mb-1">Vendas este mês</label>
                        <input
                          type="number"
                          value={formData.vendasMes}
                          onChange={(e) => setFormData({...formData, vendasMes: parseInt(e.target.value)})}
                          className="w-full px-3 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    )}
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
                Tem certeza que deseja remover <span className="text-white font-semibold">{membroToDelete?.nome}</span> da equipe?
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
                  Remover
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Equipe;
