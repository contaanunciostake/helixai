import { useState, useEffect } from 'react';
import {
  Building2, Search, Plus, Edit, Trash2, Eye, Filter,
  ChevronLeft, ChevronRight, RefreshCw, Download,
  MessageSquare, Users, Target, CheckCircle, XCircle, Clock
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';

export function EmpresasAdmin() {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [planoFilter, setPlanoFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [empresaSelecionada, setEmpresaSelecionada] = useState(null);
  const [formData, setFormData] = useState({
    nome: '', nome_fantasia: '', cnpj: '', email: '', telefone: '',
    plano: 'free', nicho: '', cidade: '', estado: ''
  });

  useEffect(() => {
    carregarEmpresas();
  }, [page, search, planoFilter, statusFilter]);

  const carregarEmpresas = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getEmpresas({
        page,
        per_page: 15,
        search,
        plano: planoFilter,
        status: statusFilter
      });

      if (response.success) {
        setEmpresas(response.data.empresas);
        setTotalPages(response.data.total_pages);
        setTotal(response.data.total);
      }
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (empresaSelecionada) {
        await adminApi.updateEmpresa(empresaSelecionada.id, formData);
      } else {
        await adminApi.createEmpresa(formData);
      }
      setShowModal(false);
      setEmpresaSelecionada(null);
      setFormData({ nome: '', nome_fantasia: '', cnpj: '', email: '', telefone: '', plano: 'free', nicho: '', cidade: '', estado: '' });
      carregarEmpresas();
    } catch (error) {
      console.error('Erro ao salvar empresa:', error);
      alert('Erro ao salvar empresa: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Tem certeza que deseja deletar esta empresa?')) {
      try {
        await adminApi.deleteEmpresa(id);
        carregarEmpresas();
      } catch (error) {
        console.error('Erro ao deletar empresa:', error);
        alert('Erro ao deletar empresa: ' + error.message);
      }
    }
  };

  const handleEdit = (empresa) => {
    setEmpresaSelecionada(empresa);
    setFormData({
      nome: empresa.nome || '',
      nome_fantasia: empresa.nome_fantasia || '',
      cnpj: empresa.cnpj || '',
      email: empresa.email || '',
      telefone: empresa.telefone || '',
      plano: empresa.plano || 'free',
      nicho: empresa.nicho || '',
      cidade: empresa.cidade || '',
      estado: empresa.estado || ''
    });
    setShowModal(true);
  };

  const getPlanoColor = (plano) => {
    switch (plano) {
      case 'enterprise': return 'text-purple-400 bg-purple-500/20';
      case 'pro': return 'text-blue-400 bg-blue-500/20';
      case 'basic': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Gestao de Empresas</h2>
          <p className="text-gray-400">{total} empresas cadastradas</p>
        </div>

        <button
          onClick={() => { setEmpresaSelecionada(null); setFormData({ nome: '', nome_fantasia: '', cnpj: '', email: '', telefone: '', plano: 'free', nicho: '', cidade: '', estado: '' }); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all"
        >
          <Plus className="h-5 w-5" />
          Nova Empresa
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome, email ou CNPJ..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50"
          />
        </div>

        <select
          value={planoFilter}
          onChange={(e) => { setPlanoFilter(e.target.value); setPage(1); }}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
        >
          <option value="">Todos os planos</option>
          <option value="free">Gratuito</option>
          <option value="basic">Basico</option>
          <option value="pro">Profissional</option>
          <option value="enterprise">Enterprise</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
        >
          <option value="">Todos os status</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>

        <button onClick={carregarEmpresas} className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10">
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>

      {/* Tabela */}
      <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Empresa</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Contato</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Plano</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">WhatsApp</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Bot</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Usuarios</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Leads</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto" />
                </td>
              </tr>
            ) : empresas.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-gray-400">
                  Nenhuma empresa encontrada
                </td>
              </tr>
            ) : (
              empresas.map((empresa) => (
                <tr key={empresa.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/20">
                        <Building2 className="h-4 w-4 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{empresa.nome}</p>
                        <p className="text-xs text-gray-400">{empresa.nome_fantasia}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-white">{empresa.email}</p>
                    <p className="text-xs text-gray-400">{empresa.telefone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPlanoColor(empresa.plano)}`}>
                      {empresa.plano?.toUpperCase() || 'FREE'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {empresa.whatsapp_conectado ? (
                      <CheckCircle className="h-5 w-5 text-green-400 mx-auto" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-500 mx-auto" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {empresa.bot_ativo ? (
                      <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400">Ativo</span>
                    ) : (
                      <span className="px-2 py-1 rounded text-xs bg-gray-500/20 text-gray-400">Inativo</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm text-white">{empresa.total_usuarios || 0}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm text-white">{empresa.total_leads || 0}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEdit(empresa)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(empresa.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginacao */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">
          Mostrando {empresas.length} de {total} empresas
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm text-white px-4">
            Pagina {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-gray-900 border border-white/10 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">
              {empresaSelecionada ? 'Editar Empresa' : 'Nova Empresa'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Nome *</label>
                  <input
                    type="text"
                    required
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Nome Fantasia</label>
                  <input
                    type="text"
                    value={formData.nome_fantasia}
                    onChange={(e) => setFormData({ ...formData, nome_fantasia: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Telefone</label>
                  <input
                    type="text"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">CNPJ</label>
                  <input
                    type="text"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Plano</label>
                  <select
                    value={formData.plano}
                    onChange={(e) => setFormData({ ...formData, plano: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
                  >
                    <option value="free">Gratuito</option>
                    <option value="basic">Basico</option>
                    <option value="pro">Profissional</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Nicho</label>
                  <select
                    value={formData.nicho}
                    onChange={(e) => setFormData({ ...formData, nicho: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
                  >
                    <option value="">Selecione</option>
                    <option value="veiculos">Veiculos</option>
                    <option value="imoveis">Imoveis</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Estado</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg"
                >
                  {empresaSelecionada ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmpresasAdmin;
