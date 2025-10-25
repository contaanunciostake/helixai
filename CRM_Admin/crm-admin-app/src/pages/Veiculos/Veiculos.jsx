import { useState } from 'react';
import { DashboardLayout } from '../Dashboard/components/DashboardLayout';
import { Search, Car, TrendingUp, DollarSign, Package, Eye, Edit, Trash2, X, Save, Plus } from 'lucide-react';

export function Veiculos() {
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [selectedVeiculo, setSelectedVeiculo] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [veiculoToDelete, setVeiculoToDelete] = useState(null);

  const [formData, setFormData] = useState({
    marca: '',
    modelo: '',
    ano: new Date().getFullYear(),
    preco: 0,
    km: 0,
    combustivel: 'Flex',
    cambio: 'Automático',
    cor: '',
    placa: '',
    status: 'Disponível',
    categoria: 'Sedan',
    localizacao: 'Loja São Paulo'
  });

  const [stats, setStats] = useState({
    total: 10,
    disponiveis: 7,
    vendidos: 1,
    valorEstoque: 1540800
  });

  const [veiculos, setVeiculos] = useState([
    {
      id: 1, marca: 'Toyota', modelo: 'Corolla XEI', ano: 2023, preco: 145900, km: 15000,
      combustivel: 'Flex', cambio: 'Automático', cor: 'Prata', placa: 'ABC-1234',
      status: 'Disponível', categoria: 'Sedan', localizacao: 'Loja São Paulo'
    },
    {
      id: 2, marca: 'Honda', modelo: 'Civic Touring', ano: 2024, preco: 189900, km: 5000,
      combustivel: 'Gasolina', cambio: 'CVT', cor: 'Preto', placa: 'DEF-5678',
      status: 'Reservado', categoria: 'Sedan', localizacao: 'Loja Campinas'
    },
    {
      id: 3, marca: 'Volkswagen', modelo: 'T-Cross Highline', ano: 2023, preco: 135000, km: 22000,
      combustivel: 'Flex', cambio: 'Automático', cor: 'Branco', placa: 'GHI-9012',
      status: 'Disponível', categoria: 'SUV', localizacao: 'Loja São Paulo'
    },
    {
      id: 4, marca: 'Jeep', modelo: 'Compass Limited', ano: 2022, preco: 165000, km: 35000,
      combustivel: 'Flex', cambio: 'Automático', cor: 'Vermelho', placa: 'JKL-3456',
      status: 'Em Negociação', categoria: 'SUV', localizacao: 'Loja Santos'
    },
    {
      id: 5, marca: 'Chevrolet', modelo: 'Onix Plus Premier', ano: 2023, preco: 89900, km: 18000,
      combustivel: 'Flex', cambio: 'Automático', cor: 'Cinza', placa: 'MNO-7890',
      status: 'Disponível', categoria: 'Sedan', localizacao: 'Loja São Paulo'
    },
    {
      id: 6, marca: 'Hyundai', modelo: 'Creta Ultimate', ano: 2024, preco: 152000, km: 8000,
      combustivel: 'Flex', cambio: 'Automático', cor: 'Azul', placa: 'PQR-2345',
      status: 'Disponível', categoria: 'SUV', localizacao: 'Loja Campinas'
    },
    {
      id: 7, marca: 'Fiat', modelo: 'Toro Volcano', ano: 2023, preco: 178000, km: 25000,
      combustivel: 'Diesel', cambio: 'Automático', cor: 'Preto', placa: 'STU-6789',
      status: 'Vendido', categoria: 'Picape', localizacao: 'Loja Santos'
    },
    {
      id: 8, marca: 'Nissan', modelo: 'Kicks Exclusive', ano: 2023, preco: 118000, km: 12000,
      combustivel: 'Flex', cambio: 'CVT', cor: 'Laranja', placa: 'VWX-0123',
      status: 'Disponível', categoria: 'SUV', localizacao: 'Loja São Paulo'
    },
    {
      id: 9, marca: 'Ford', modelo: 'Ranger XLT', ano: 2022, preco: 245000, km: 45000,
      combustivel: 'Diesel', cambio: 'Automático', cor: 'Prata', placa: 'YZA-4567',
      status: 'Em Negociação', categoria: 'Picape', localizacao: 'Loja Campinas'
    },
    {
      id: 10, marca: 'Renault', modelo: 'Duster Intense', ano: 2023, preco: 112000, km: 20000,
      combustivel: 'Flex', cambio: 'CVT', cor: 'Branco', placa: 'BCD-8901',
      status: 'Disponível', categoria: 'SUV', localizacao: 'Loja Santos'
    }
  ]);

  const openViewModal = (veiculo) => {
    setSelectedVeiculo(veiculo);
    setModalMode('view');
    setShowModal(true);
  };

  const openEditModal = (veiculo) => {
    setSelectedVeiculo(veiculo);
    setFormData(veiculo);
    setModalMode('edit');
    setShowModal(true);
  };

  const openCreateModal = () => {
    setFormData({
      marca: '', modelo: '', ano: new Date().getFullYear(), preco: 0, km: 0,
      combustivel: 'Flex', cambio: 'Automático', cor: '', placa: '',
      status: 'Disponível', categoria: 'Sedan', localizacao: 'Loja São Paulo'
    });
    setModalMode('create');
    setShowModal(true);
  };

  const handleDelete = (veiculo) => {
    setVeiculoToDelete(veiculo);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    const updated = veiculos.filter(v => v.id !== veiculoToDelete.id);
    setVeiculos(updated);
    setStats(prev => ({
      ...prev,
      total: prev.total - 1,
      disponiveis: veiculoToDelete.status === 'Disponível' ? prev.disponiveis - 1 : prev.disponiveis,
      vendidos: veiculoToDelete.status === 'Vendido' ? prev.vendidos - 1 : prev.vendidos,
      valorEstoque: prev.valorEstoque - veiculoToDelete.preco
    }));
    setShowDeleteConfirm(false);
    setVeiculoToDelete(null);
  };

  const handleSave = () => {
    if (modalMode === 'create') {
      const newVeiculo = { id: veiculos.length + 1, ...formData };
      setVeiculos([...veiculos, newVeiculo]);
      setStats(prev => ({
        ...prev,
        total: prev.total + 1,
        disponiveis: formData.status === 'Disponível' ? prev.disponiveis + 1 : prev.disponiveis,
        valorEstoque: prev.valorEstoque + formData.preco
      }));
    } else if (modalMode === 'edit') {
      const updated = veiculos.map(v => v.id === selectedVeiculo.id ? { ...v, ...formData } : v);
      setVeiculos(updated);
    }
    setShowModal(false);
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

  const formatarPreco = (preco) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(preco);
  };

  const veiculosFiltrados = veiculos.filter(veiculo => {
    const matchBusca = busca === '' ||
      veiculo.marca.toLowerCase().includes(busca.toLowerCase()) ||
      veiculo.modelo.toLowerCase().includes(busca.toLowerCase()) ||
      veiculo.placa.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === 'todos' || veiculo.status === filtroStatus;
    const matchCategoria = filtroCategoria === 'todos' || veiculo.categoria === filtroCategoria;
    return matchBusca && matchStatus && matchCategoria;
  });

  const estatisticas = [
    { titulo: 'Total de Veículos', valor: stats.total, icone: Car, cor: 'blue', variacao: `${veiculosFiltrados.length} visíveis` },
    { titulo: 'Disponíveis', valor: stats.disponiveis, icone: Package, cor: 'green', variacao: `${Math.round(stats.disponiveis/stats.total*100)}% do estoque` },
    { titulo: 'Vendidos (Mês)', valor: stats.vendidos, icone: TrendingUp, cor: 'purple', variacao: 'Último mês' },
    { titulo: 'Valor em Estoque', valor: formatarPreco(stats.valorEstoque), icone: DollarSign, cor: 'orange', variacao: `Média ${formatarPreco(stats.valorEstoque/stats.total)}` }
  ];

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Veículos</h1>
            <p className="text-gray-400">Gerencie o catálogo de veículos disponíveis</p>
          </div>
          <button onClick={openCreateModal} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Veículo
          </button>
        </div>

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

        <div className="bg-[#1a2332] border border-[#2d3748] rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <input type="text" placeholder="Buscar por marca, modelo ou placa..." value={busca} onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
            </div>
            <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}
              className="px-4 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:border-blue-500">
              <option value="todos">Todos os Status</option>
              <option value="Disponível">Disponível</option>
              <option value="Reservado">Reservado</option>
              <option value="Em Negociação">Em Negociação</option>
              <option value="Vendido">Vendido</option>
            </select>
            <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}
              className="px-4 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:border-blue-500">
              <option value="todos">Todas as Categorias</option>
              <option value="Sedan">Sedan</option>
              <option value="SUV">SUV</option>
              <option value="Picape">Picape</option>
              <option value="Hatch">Hatch</option>
            </select>
          </div>
        </div>

        <div className="bg-[#1a2332] border border-[#2d3748] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0f1419] border-b border-[#2d3748]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Veículo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Ano/KM</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Detalhes</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Preço</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2d3748]">
                {veiculosFiltrados.map((veiculo) => (
                  <tr key={veiculo.id} className="hover:bg-[#0f1419] transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-lg bg-[#0f1419] border border-[#2d3748] flex items-center justify-center mr-3">
                          <Car className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{veiculo.marca} {veiculo.modelo}</div>
                          <div className="text-xs text-gray-500">{veiculo.placa}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-white">{veiculo.ano}</div>
                      <div className="text-xs text-gray-500">{veiculo.km.toLocaleString('pt-BR')} km</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-white">{veiculo.combustivel}</div>
                      <div className="text-xs text-gray-500">{veiculo.cambio}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-semibold text-green-400">{formatarPreco(veiculo.preco)}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(veiculo.status)}`}>
                        {veiculo.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openViewModal(veiculo)} className="p-2 bg-[#0f1419] border border-[#2d3748] text-gray-400 hover:bg-[#253447] hover:text-white rounded" title="Visualizar">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button onClick={() => openEditModal(veiculo)} className="p-2 bg-[#0f1419] border border-[#2d3748] text-gray-400 hover:bg-[#253447] hover:text-white rounded" title="Editar">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(veiculo)} className="p-2 bg-[#0f1419] border border-[#2d3748] text-gray-400 hover:bg-red-600 hover:text-white hover:border-red-600 rounded" title="Deletar">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a2332] border border-[#2d3748] rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[#2d3748]">
              <h2 className="text-xl font-bold text-white">
                {modalMode === 'view' && 'Detalhes do Veículo'}
                {modalMode === 'edit' && 'Editar Veículo'}
                {modalMode === 'create' && 'Novo Veículo'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {modalMode === 'view' && selectedVeiculo ? (
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm text-gray-400">Marca</label><p className="text-white font-medium">{selectedVeiculo.marca}</p></div>
                  <div><label className="text-sm text-gray-400">Modelo</label><p className="text-white font-medium">{selectedVeiculo.modelo}</p></div>
                  <div><label className="text-sm text-gray-400">Ano</label><p className="text-white font-medium">{selectedVeiculo.ano}</p></div>
                  <div><label className="text-sm text-gray-400">KM</label><p className="text-white font-medium">{selectedVeiculo.km.toLocaleString('pt-BR')} km</p></div>
                  <div><label className="text-sm text-gray-400">Preço</label><p className="text-green-400 font-medium">{formatarPreco(selectedVeiculo.preco)}</p></div>
                  <div><label className="text-sm text-gray-400">Combustível</label><p className="text-white font-medium">{selectedVeiculo.combustivel}</p></div>
                  <div><label className="text-sm text-gray-400">Câmbio</label><p className="text-white font-medium">{selectedVeiculo.cambio}</p></div>
                  <div><label className="text-sm text-gray-400">Cor</label><p className="text-white font-medium">{selectedVeiculo.cor}</p></div>
                  <div><label className="text-sm text-gray-400">Placa</label><p className="text-white font-medium">{selectedVeiculo.placa}</p></div>
                  <div><label className="text-sm text-gray-400">Status</label><div className="mt-1"><span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(selectedVeiculo.status)}`}>{selectedVeiculo.status}</span></div></div>
                  <div><label className="text-sm text-gray-400">Categoria</label><p className="text-white font-medium">{selectedVeiculo.categoria}</p></div>
                  <div><label className="text-sm text-gray-400">Localização</label><p className="text-white font-medium">{selectedVeiculo.localizacao}</p></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="Marca" value={formData.marca} onChange={(e) => setFormData({...formData, marca: e.target.value})} className="px-4 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:ring-2 focus:ring-blue-500" />
                  <input type="text" placeholder="Modelo" value={formData.modelo} onChange={(e) => setFormData({...formData, modelo: e.target.value})} className="px-4 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:ring-2 focus:ring-blue-500" />
                  <input type="number" placeholder="Ano" value={formData.ano} onChange={(e) => setFormData({...formData, ano: parseInt(e.target.value)})} className="px-4 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:ring-2 focus:ring-blue-500" />
                  <input type="number" placeholder="KM" value={formData.km} onChange={(e) => setFormData({...formData, km: parseInt(e.target.value)})} className="px-4 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:ring-2 focus:ring-blue-500" />
                  <input type="number" placeholder="Preço" value={formData.preco} onChange={(e) => setFormData({...formData, preco: parseFloat(e.target.value)})} className="px-4 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:ring-2 focus:ring-blue-500" />
                  <select value={formData.combustivel} onChange={(e) => setFormData({...formData, combustivel: e.target.value})} className="px-4 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:ring-2 focus:ring-blue-500">
                    <option value="Flex">Flex</option><option value="Gasolina">Gasolina</option><option value="Diesel">Diesel</option><option value="Elétrico">Elétrico</option>
                  </select>
                  <select value={formData.cambio} onChange={(e) => setFormData({...formData, cambio: e.target.value})} className="px-4 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:ring-2 focus:ring-blue-500">
                    <option value="Automático">Automático</option><option value="Manual">Manual</option><option value="CVT">CVT</option>
                  </select>
                  <input type="text" placeholder="Cor" value={formData.cor} onChange={(e) => setFormData({...formData, cor: e.target.value})} className="px-4 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:ring-2 focus:ring-blue-500" />
                  <input type="text" placeholder="Placa" value={formData.placa} onChange={(e) => setFormData({...formData, placa: e.target.value})} className="px-4 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:ring-2 focus:ring-blue-500" />
                  <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="px-4 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:ring-2 focus:ring-blue-500">
                    <option value="Disponível">Disponível</option><option value="Reservado">Reservado</option><option value="Em Negociação">Em Negociação</option><option value="Vendido">Vendido</option>
                  </select>
                  <select value={formData.categoria} onChange={(e) => setFormData({...formData, categoria: e.target.value})} className="px-4 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:ring-2 focus:ring-blue-500">
                    <option value="Sedan">Sedan</option><option value="SUV">SUV</option><option value="Picape">Picape</option><option value="Hatch">Hatch</option>
                  </select>
                  <input type="text" placeholder="Localização" value={formData.localizacao} onChange={(e) => setFormData({...formData, localizacao: e.target.value})} className="px-4 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white focus:ring-2 focus:ring-blue-500" />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-[#2d3748]">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-[#0f1419] border border-[#2d3748] text-gray-400 hover:bg-[#253447] rounded-lg">
                {modalMode === 'view' ? 'Fechar' : 'Cancelar'}
              </button>
              {modalMode !== 'view' && (
                <button onClick={handleSave} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {modalMode === 'create' ? 'Criar Veículo' : 'Salvar Alterações'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {showDeleteConfirm && veiculoToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a2332] border border-[#2d3748] rounded-lg w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-white mb-2">Confirmar Exclusão</h3>
            <p className="text-gray-400 mb-4">
              Tem certeza que deseja excluir <span className="text-white font-semibold">{veiculoToDelete.marca} {veiculoToDelete.modelo}</span>?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => { setShowDeleteConfirm(false); setVeiculoToDelete(null); }} className="px-4 py-2 bg-[#0f1419] border border-[#2d3748] text-gray-400 hover:bg-[#253447] rounded-lg">
                Cancelar
              </button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Excluir Veículo
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default Veiculos;
