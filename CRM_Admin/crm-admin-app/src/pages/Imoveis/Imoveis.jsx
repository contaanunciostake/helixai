import { useState } from 'react';
import { DashboardLayout } from '../Dashboard/components/DashboardLayout';
import { Search, Building2, TrendingUp, DollarSign, Package, MapPin, Eye, Edit, Trash2, X, Save, Plus } from 'lucide-react';

export function Imoveis() {
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroTipo, setFiltroTipo] = useState('todos');

  // Estados para CRUD
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // view, edit, create
  const [selectedImovel, setSelectedImovel] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [imovelToDelete, setImovelToDelete] = useState(null);

  const [formData, setFormData] = useState({
    tipo: 'Apartamento',
    titulo: '',
    endereco: '',
    cidade: '',
    area: 0,
    quartos: 0,
    banheiros: 0,
    vagas: 0,
    preco: 0,
    condominio: 0,
    iptu: 0,
    status: 'Disponível',
    categoria: 'Venda'
  });

  const [stats, setStats] = useState({
    total: 10,
    disponiveis: 7,
    vendidos: 1,
    valorCarteira: 45200000
  });

  const [imoveis, setImoveis] = useState([
    {
      id: 1,
      tipo: 'Apartamento',
      titulo: 'Apto 3 Dorms - Jardim Paulista',
      endereco: 'Rua Augusta, 1500 - Jardim Paulista',
      cidade: 'São Paulo',
      area: 120,
      quartos: 3,
      banheiros: 2,
      vagas: 2,
      preco: 850000,
      condominio: 1200,
      iptu: 350,
      status: 'Disponível',
      categoria: 'Venda'
    },
    {
      id: 2,
      tipo: 'Casa',
      titulo: 'Casa em Condomínio - Alphaville',
      endereco: 'Alameda das Flores, 234 - Alphaville',
      cidade: 'Barueri',
      area: 280,
      quartos: 4,
      banheiros: 3,
      vagas: 4,
      preco: 1850000,
      condominio: 850,
      iptu: 520,
      status: 'Disponível',
      categoria: 'Venda'
    },
    {
      id: 3,
      tipo: 'Apartamento',
      titulo: 'Studio no Brooklin',
      endereco: 'Rua Joaquim Nabuco, 890 - Brooklin',
      cidade: 'São Paulo',
      area: 35,
      quartos: 1,
      banheiros: 1,
      vagas: 1,
      preco: 3200,
      condominio: 450,
      iptu: 120,
      status: 'Reservado',
      categoria: 'Aluguel'
    },
    {
      id: 4,
      tipo: 'Sala Comercial',
      titulo: 'Sala Comercial - Faria Lima',
      endereco: 'Av. Faria Lima, 3500 - Itaim Bibi',
      cidade: 'São Paulo',
      area: 65,
      quartos: 0,
      banheiros: 1,
      vagas: 2,
      preco: 680000,
      condominio: 980,
      iptu: 280,
      status: 'Em Negociação',
      categoria: 'Venda'
    },
    {
      id: 5,
      tipo: 'Apartamento',
      titulo: 'Cobertura Duplex - Vila Madalena',
      endereco: 'Rua Harmonia, 670 - Vila Madalena',
      cidade: 'São Paulo',
      area: 180,
      quartos: 3,
      banheiros: 3,
      vagas: 3,
      preco: 1450000,
      condominio: 1600,
      iptu: 480,
      status: 'Disponível',
      categoria: 'Venda'
    },
    {
      id: 6,
      tipo: 'Casa',
      titulo: 'Casa Térrea - Morumbi',
      endereco: 'Rua do Morumbi, 1200 - Morumbi',
      cidade: 'São Paulo',
      area: 220,
      quartos: 3,
      banheiros: 2,
      vagas: 3,
      preco: 6500,
      condominio: 0,
      iptu: 420,
      status: 'Disponível',
      categoria: 'Aluguel'
    },
    {
      id: 7,
      tipo: 'Apartamento',
      titulo: 'Apto 2 Dorms - Moema',
      endereco: 'Av. Moema, 780 - Moema',
      cidade: 'São Paulo',
      area: 85,
      quartos: 2,
      banheiros: 2,
      vagas: 2,
      preco: 720000,
      condominio: 890,
      iptu: 290,
      status: 'Vendido',
      categoria: 'Venda'
    },
    {
      id: 8,
      tipo: 'Terreno',
      titulo: 'Terreno Comercial - Berrini',
      endereco: 'Av. Berrini, 2400 - Berrini',
      cidade: 'São Paulo',
      area: 450,
      quartos: 0,
      banheiros: 0,
      vagas: 0,
      preco: 2850000,
      condominio: 0,
      iptu: 680,
      status: 'Disponível',
      categoria: 'Venda'
    },
    {
      id: 9,
      tipo: 'Apartamento',
      titulo: 'Apto 1 Dorm - Perdizes',
      endereco: 'Rua Cardoso de Almeida, 450 - Perdizes',
      cidade: 'São Paulo',
      area: 55,
      quartos: 1,
      banheiros: 1,
      vagas: 1,
      preco: 2800,
      condominio: 520,
      iptu: 150,
      status: 'Em Negociação',
      categoria: 'Aluguel'
    },
    {
      id: 10,
      tipo: 'Casa',
      titulo: 'Sobrado - Santana',
      endereco: 'Rua Voluntários da Pátria, 890 - Santana',
      cidade: 'São Paulo',
      area: 150,
      quartos: 3,
      banheiros: 2,
      vagas: 2,
      preco: 680000,
      condominio: 0,
      iptu: 320,
      status: 'Disponível',
      categoria: 'Venda'
    }
  ]);

  // Funções para abrir modais
  const openViewModal = (imovel) => {
    setSelectedImovel(imovel);
    setModalMode('view');
    setShowModal(true);
  };

  const openEditModal = (imovel) => {
    setSelectedImovel(imovel);
    setFormData({
      tipo: imovel.tipo,
      titulo: imovel.titulo,
      endereco: imovel.endereco,
      cidade: imovel.cidade,
      area: imovel.area,
      quartos: imovel.quartos,
      banheiros: imovel.banheiros,
      vagas: imovel.vagas,
      preco: imovel.preco,
      condominio: imovel.condominio,
      iptu: imovel.iptu,
      status: imovel.status,
      categoria: imovel.categoria
    });
    setModalMode('edit');
    setShowModal(true);
  };

  const openCreateModal = () => {
    setFormData({
      tipo: 'Apartamento',
      titulo: '',
      endereco: '',
      cidade: '',
      area: 0,
      quartos: 0,
      banheiros: 0,
      vagas: 0,
      preco: 0,
      condominio: 0,
      iptu: 0,
      status: 'Disponível',
      categoria: 'Venda'
    });
    setModalMode('create');
    setShowModal(true);
  };

  const handleDelete = (imovel) => {
    setImovelToDelete(imovel);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    const updated = imoveis.filter(i => i.id !== imovelToDelete.id);
    setImoveis(updated);

    // Atualizar estatísticas
    const valorRemovido = imovelToDelete.categoria === 'Venda' ? imovelToDelete.preco : 0;
    setStats(prev => ({
      ...prev,
      total: prev.total - 1,
      disponiveis: imovelToDelete.status === 'Disponível' ? prev.disponiveis - 1 : prev.disponiveis,
      vendidos: imovelToDelete.status === 'Vendido' ? prev.vendidos - 1 : prev.vendidos,
      valorCarteira: prev.valorCarteira - valorRemovido
    }));

    setShowDeleteConfirm(false);
    setImovelToDelete(null);
  };

  const handleSave = () => {
    if (modalMode === 'create') {
      const newImovel = {
        id: imoveis.length + 1,
        ...formData
      };
      setImoveis([...imoveis, newImovel]);

      // Atualizar estatísticas
      const valorAdicionado = formData.categoria === 'Venda' ? formData.preco : 0;
      setStats(prev => ({
        ...prev,
        total: prev.total + 1,
        disponiveis: formData.status === 'Disponível' ? prev.disponiveis + 1 : prev.disponiveis,
        vendidos: formData.status === 'Vendido' ? prev.vendidos + 1 : prev.vendidos,
        valorCarteira: prev.valorCarteira + valorAdicionado
      }));
    } else if (modalMode === 'edit') {
      const updated = imoveis.map(i =>
        i.id === selectedImovel.id ? { ...i, ...formData } : i
      );
      setImoveis(updated);

      // Atualizar estatísticas se status mudou
      if (selectedImovel.status !== formData.status) {
        setStats(prev => ({
          ...prev,
          disponiveis: formData.status === 'Disponível' ? prev.disponiveis + 1 : prev.disponiveis - 1,
          vendidos: formData.status === 'Vendido' ? prev.vendidos + 1 : prev.vendidos - 1
        }));
      }

      // Atualizar valor em carteira se preço mudou
      if (selectedImovel.preco !== formData.preco && formData.categoria === 'Venda') {
        setStats(prev => ({
          ...prev,
          valorCarteira: prev.valorCarteira - selectedImovel.preco + formData.preco
        }));
      }
    }

    setShowModal(false);
    setSelectedImovel(null);
  };

  const getStatusBadge = (status) => {
    const cores = {
      'Disponível': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Reservado': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'Em Negociação': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Vendido': 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    return cores[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const getCategoriaBadge = (categoria) => {
    const cores = {
      'Venda': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'Aluguel': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
    };
    return cores[categoria] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const formatarPreco = (preco, categoria) => {
    const valor = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(preco);

    return categoria === 'Aluguel' ? `${valor}/mês` : valor;
  };

  const formatarValorCarteira = (valor) => {
    if (valor >= 1000000) {
      return `R$ ${(valor / 1000000).toFixed(1)}M`;
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(valor);
  };

  const imoveisFiltrados = imoveis.filter(imovel => {
    const matchBusca = busca === '' ||
      imovel.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      imovel.endereco.toLowerCase().includes(busca.toLowerCase()) ||
      imovel.cidade.toLowerCase().includes(busca.toLowerCase());

    const matchStatus = filtroStatus === 'todos' || imovel.status === filtroStatus;
    const matchTipo = filtroTipo === 'todos' || imovel.tipo === filtroTipo;

    return matchBusca && matchStatus && matchTipo;
  });

  const estatisticas = [
    {
      titulo: 'Total de Imóveis',
      valor: stats.total,
      icone: Building2,
      cor: 'blue',
      variacao: `${imoveisFiltrados.length} visíveis`
    },
    {
      titulo: 'Disponíveis',
      valor: stats.disponiveis,
      icone: Package,
      cor: 'green',
      variacao: `${Math.round(stats.disponiveis/stats.total*100)}% do portfólio`
    },
    {
      titulo: 'Vendidos (Mês)',
      valor: stats.vendidos,
      icone: TrendingUp,
      cor: 'purple',
      variacao: 'Últimos 30 dias'
    },
    {
      titulo: 'Valor em Carteira',
      valor: formatarValorCarteira(stats.valorCarteira),
      icone: DollarSign,
      cor: 'orange',
      variacao: `Ticket médio ${formatarValorCarteira(stats.valorCarteira/stats.total)}`
    }
  ];

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Imóveis</h1>
            <p className="text-gray-400">Gerencie o portfólio de imóveis disponíveis</p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            Novo Imóvel
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar por título, endereço ou cidade..."
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
              <option value="Disponível">Disponível</option>
              <option value="Reservado">Reservado</option>
              <option value="Em Negociação">Em Negociação</option>
              <option value="Vendido">Vendido</option>
            </select>

            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="px-4 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="todos">Todos os Tipos</option>
              <option value="Apartamento">Apartamento</option>
              <option value="Casa">Casa</option>
              <option value="Sala Comercial">Sala Comercial</option>
              <option value="Terreno">Terreno</option>
            </select>
          </div>
        </div>

        {/* Lista de Imóveis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {imoveisFiltrados.map((imovel) => (
            <div key={imovel.id} className="bg-[#1a2332] border border-[#2d3748] rounded-lg p-4 hover:border-blue-500/50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-lg bg-[#0f1419] border border-[#2d3748] flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">{imovel.titulo}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-400 mb-1">
                      <MapPin className="h-3 w-3" />
                      <span>{imovel.endereco}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(imovel.status)}`}>
                        {imovel.status}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getCategoriaBadge(imovel.categoria)}`}>
                        {imovel.categoria}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-3 py-3 border-t border-b border-[#2d3748]">
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-1">Área</div>
                  <div className="text-sm text-white font-medium">{imovel.area}m²</div>
                </div>
                {imovel.quartos > 0 && (
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">Quartos</div>
                    <div className="text-sm text-white font-medium">{imovel.quartos}</div>
                  </div>
                )}
                {imovel.banheiros > 0 && (
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">Banheiros</div>
                    <div className="text-sm text-white font-medium">{imovel.banheiros}</div>
                  </div>
                )}
                {imovel.vagas > 0 && (
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">Vagas</div>
                    <div className="text-sm text-white font-medium">{imovel.vagas}</div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-400 mb-1">
                    {formatarPreco(imovel.preco, imovel.categoria)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Condomínio: R$ {imovel.condominio} • IPTU: R$ {imovel.iptu}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openViewModal(imovel)}
                    className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
                    title="Visualizar"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => openEditModal(imovel)}
                    className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(imovel)}
                    className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                    title="Deletar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {imoveisFiltrados.length === 0 && (
          <div className="bg-[#1a2332] border border-[#2d3748] rounded-lg p-12 text-center">
            <Building2 className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Nenhum imóvel encontrado</p>
          </div>
        )}

        {/* Modal de Visualização/Edição/Criação */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a2332] border border-[#2d3748] rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">
                    {modalMode === 'view' && 'Detalhes do Imóvel'}
                    {modalMode === 'edit' && 'Editar Imóvel'}
                    {modalMode === 'create' && 'Novo Imóvel'}
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
                        <p className="text-white">{selectedImovel.tipo}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Categoria</label>
                        <p className="text-white">{selectedImovel.categoria}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Título</label>
                      <p className="text-white">{selectedImovel.titulo}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Endereço</label>
                      <p className="text-white">{selectedImovel.endereco}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Cidade</label>
                      <p className="text-white">{selectedImovel.cidade}</p>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <label className="text-sm text-gray-400">Área</label>
                        <p className="text-white">{selectedImovel.area}m²</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Quartos</label>
                        <p className="text-white">{selectedImovel.quartos}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Banheiros</label>
                        <p className="text-white">{selectedImovel.banheiros}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Vagas</label>
                        <p className="text-white">{selectedImovel.vagas}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm text-gray-400">Preço</label>
                        <p className="text-white">{formatarPreco(selectedImovel.preco, selectedImovel.categoria)}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Condomínio</label>
                        <p className="text-white">R$ {selectedImovel.condominio}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">IPTU</label>
                        <p className="text-white">R$ {selectedImovel.iptu}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Status</label>
                      <p className="text-white">{selectedImovel.status}</p>
                    </div>
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
                          <option value="Apartamento">Apartamento</option>
                          <option value="Casa">Casa</option>
                          <option value="Sala Comercial">Sala Comercial</option>
                          <option value="Terreno">Terreno</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 block mb-1">Categoria</label>
                        <select
                          value={formData.categoria}
                          onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                          className="w-full px-3 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="Venda">Venda</option>
                          <option value="Aluguel">Aluguel</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 block mb-1">Título</label>
                      <input
                        type="text"
                        value={formData.titulo}
                        onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                        className="w-full px-3 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:border-blue-500"
                        placeholder="Ex: Apto 3 Dorms - Jardim Paulista"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 block mb-1">Endereço</label>
                      <input
                        type="text"
                        value={formData.endereco}
                        onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                        className="w-full px-3 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:border-blue-500"
                        placeholder="Rua, número e bairro"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 block mb-1">Cidade</label>
                      <input
                        type="text"
                        value={formData.cidade}
                        onChange={(e) => setFormData({...formData, cidade: e.target.value})}
                        className="w-full px-3 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:border-blue-500"
                        placeholder="São Paulo"
                      />
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <label className="text-sm text-gray-400 block mb-1">Área (m²)</label>
                        <input
                          type="number"
                          value={formData.area}
                          onChange={(e) => setFormData({...formData, area: parseInt(e.target.value)})}
                          className="w-full px-3 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 block mb-1">Quartos</label>
                        <input
                          type="number"
                          value={formData.quartos}
                          onChange={(e) => setFormData({...formData, quartos: parseInt(e.target.value)})}
                          className="w-full px-3 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 block mb-1">Banheiros</label>
                        <input
                          type="number"
                          value={formData.banheiros}
                          onChange={(e) => setFormData({...formData, banheiros: parseInt(e.target.value)})}
                          className="w-full px-3 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 block mb-1">Vagas</label>
                        <input
                          type="number"
                          value={formData.vagas}
                          onChange={(e) => setFormData({...formData, vagas: parseInt(e.target.value)})}
                          className="w-full px-3 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm text-gray-400 block mb-1">Preço (R$)</label>
                        <input
                          type="number"
                          value={formData.preco}
                          onChange={(e) => setFormData({...formData, preco: parseFloat(e.target.value)})}
                          className="w-full px-3 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 block mb-1">Condomínio (R$)</label>
                        <input
                          type="number"
                          value={formData.condominio}
                          onChange={(e) => setFormData({...formData, condominio: parseFloat(e.target.value)})}
                          className="w-full px-3 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 block mb-1">IPTU (R$)</label>
                        <input
                          type="number"
                          value={formData.iptu}
                          onChange={(e) => setFormData({...formData, iptu: parseFloat(e.target.value)})}
                          className="w-full px-3 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 block mb-1">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className="w-full px-3 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="Disponível">Disponível</option>
                        <option value="Reservado">Reservado</option>
                        <option value="Em Negociação">Em Negociação</option>
                        <option value="Vendido">Vendido</option>
                      </select>
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
                Tem certeza que deseja deletar o imóvel <span className="text-white font-semibold">{imovelToDelete?.titulo}</span>?
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

export default Imoveis;
