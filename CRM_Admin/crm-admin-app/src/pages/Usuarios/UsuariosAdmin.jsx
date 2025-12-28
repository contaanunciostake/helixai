import { useState, useEffect } from 'react';
import {
  Users, Search, Plus, Edit, Trash2, Filter,
  ChevronLeft, ChevronRight, RefreshCw, Shield,
  UserCheck, UserX, Mail, Phone, Building2
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';

export function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [empresas, setEmpresas] = useState([]);
  const [formData, setFormData] = useState({
    nome: '', email: '', senha: '', tipo: 'usuario', ativo: true, telefone: '', empresa_id: ''
  });

  useEffect(() => {
    carregarUsuarios();
    carregarEmpresas();
  }, [page, search, tipoFilter]);

  const carregarUsuarios = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getUsuarios({
        page,
        per_page: 15,
        search,
        tipo: tipoFilter
      });

      if (response.success) {
        setUsuarios(response.data.usuarios);
        setTotalPages(response.data.total_pages);
        setTotal(response.data.total);
      }
    } catch (error) {
      console.error('Erro ao carregar usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const carregarEmpresas = async () => {
    try {
      const response = await adminApi.getEmpresas({ per_page: 100 });
      if (response.success) {
        setEmpresas(response.data.empresas);
      }
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = { ...formData };
      if (!dataToSend.senha) delete dataToSend.senha;
      if (!dataToSend.empresa_id) delete dataToSend.empresa_id;

      if (usuarioSelecionado) {
        await adminApi.updateUsuario(usuarioSelecionado.id, dataToSend);
      } else {
        if (!formData.senha) {
          alert('Senha e obrigatoria para novos usuarios');
          return;
        }
        await adminApi.createUsuario(dataToSend);
      }
      setShowModal(false);
      setUsuarioSelecionado(null);
      resetForm();
      carregarUsuarios();
    } catch (error) {
      console.error('Erro ao salvar usuario:', error);
      alert('Erro ao salvar usuario: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Tem certeza que deseja deletar este usuario?')) {
      try {
        await adminApi.deleteUsuario(id);
        carregarUsuarios();
      } catch (error) {
        console.error('Erro ao deletar usuario:', error);
        alert('Erro ao deletar usuario: ' + error.message);
      }
    }
  };

  const handleEdit = (usuario) => {
    setUsuarioSelecionado(usuario);
    setFormData({
      nome: usuario.nome || '',
      email: usuario.email || '',
      senha: '',
      tipo: usuario.tipo || 'usuario',
      ativo: usuario.ativo !== false,
      telefone: usuario.telefone || '',
      empresa_id: usuario.empresa_id || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      nome: '', email: '', senha: '', tipo: 'usuario', ativo: true, telefone: '', empresa_id: ''
    });
  };

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'super_admin': return 'text-red-400 bg-red-500/20';
      case 'admin_empresa': return 'text-purple-400 bg-purple-500/20';
      case 'usuario': return 'text-blue-400 bg-blue-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getTipoLabel = (tipo) => {
    switch (tipo) {
      case 'super_admin': return 'Super Admin';
      case 'admin_empresa': return 'Admin Empresa';
      case 'usuario': return 'Usuario';
      case 'visualizador': return 'Visualizador';
      default: return tipo;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Gestao de Usuarios</h2>
          <p className="text-gray-400">{total} usuarios cadastrados</p>
        </div>

        <button
          onClick={() => { setUsuarioSelecionado(null); resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all"
        >
          <Plus className="h-5 w-5" />
          Novo Usuario
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50"
          />
        </div>

        <select
          value={tipoFilter}
          onChange={(e) => { setTipoFilter(e.target.value); setPage(1); }}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
        >
          <option value="">Todos os tipos</option>
          <option value="super_admin">Super Admin</option>
          <option value="admin_empresa">Admin Empresa</option>
          <option value="usuario">Usuario</option>
          <option value="visualizador">Visualizador</option>
        </select>

        <button onClick={carregarUsuarios} className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10">
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>

      {/* Tabela */}
      <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Usuario</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Contato</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Tipo</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Empresa</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Ultimo Acesso</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto" />
                </td>
              </tr>
            ) : usuarios.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-gray-400">
                  Nenhum usuario encontrado
                </td>
              </tr>
            ) : (
              usuarios.map((usuario) => (
                <tr key={usuario.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                        {usuario.nome?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{usuario.nome}</p>
                        <p className="text-xs text-gray-400">ID: {usuario.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-sm text-white">
                      <Mail className="h-4 w-4 text-gray-400" />
                      {usuario.email}
                    </div>
                    {usuario.telefone && (
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                        <Phone className="h-3 w-3" />
                        {usuario.telefone}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTipoColor(usuario.tipo)}`}>
                      {getTipoLabel(usuario.tipo)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {usuario.empresa_nome ? (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-white">{usuario.empresa_nome}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {usuario.ativo ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-green-500/20 text-green-400">
                        <UserCheck className="h-3 w-3" /> Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-red-500/20 text-red-400">
                        <UserX className="h-3 w-3" /> Inativo
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-400">
                      {usuario.ultimo_acesso
                        ? new Date(usuario.ultimo_acesso).toLocaleDateString('pt-BR')
                        : 'Nunca'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEdit(usuario)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(usuario.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors">
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
          Mostrando {usuarios.length} de {total} usuarios
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
          <div className="bg-gray-900 border border-white/10 rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-xl font-bold text-white mb-4">
              {usuarioSelecionado ? 'Editar Usuario' : 'Novo Usuario'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                <label className="text-sm text-gray-400 block mb-1">
                  Senha {usuarioSelecionado ? '(deixe em branco para manter)' : '*'}
                </label>
                <input
                  type="password"
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Tipo</label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
                  >
                    <option value="usuario">Usuario</option>
                    <option value="admin_empresa">Admin Empresa</option>
                    <option value="super_admin">Super Admin</option>
                    <option value="visualizador">Visualizador</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-1">Empresa</label>
                  <select
                    value={formData.empresa_id}
                    onChange={(e) => setFormData({ ...formData, empresa_id: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
                  >
                    <option value="">Nenhuma</option>
                    {empresas.map((emp) => (
                      <option key={emp.id} value={emp.id}>{emp.nome}</option>
                    ))}
                  </select>
                </div>
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

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                  className="rounded border-white/10 bg-white/5 text-purple-500 focus:ring-purple-500"
                />
                <label htmlFor="ativo" className="text-sm text-gray-400">Usuario ativo</label>
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
                  {usuarioSelecionado ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsuariosAdmin;
