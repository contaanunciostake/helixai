import { useState, useEffect } from 'react';
import {
  Building2, Search, Filter, Plus, Edit2, Trash2, Eye,
  CheckCircle, XCircle, Clock, TrendingUp, Users, MessageSquare,
  ChevronLeft, ChevronRight, Download, RefreshCw
} from 'lucide-react';

export function CompanyManagement() {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    search: '',
    plano: '',
    status: '',
    page: 1,
    limit: 20
  });
  const [totalPages, setTotalPages] = useState(1);
  const [empresaSelecionada, setEmpresaSelecionada] = useState(null);
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false);

  // Carregar empresas
  useEffect(() => {
    carregarEmpresas();
  }, [filtros]);

  const carregarEmpresas = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.keys(filtros).forEach(key => {
        if (filtros[key]) params.append(key, filtros[key]);
      });

      const res = await fetch(`http://localhost:5000/api/admin/empresas?${params.toString()}`, {
        credentials: 'include'
      });

      const data = await res.json();

      if (data.success) {
        setEmpresas(data.data.empresas);
        setTotalPages(data.data.total_pages);
      }
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
    } finally {
      setLoading(false);
    }
  };

  const verDetalhes = async (empresaId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/empresas/${empresaId}`, {
        credentials: 'include'
      });

      const data = await res.json();

      if (data.success) {
        setEmpresaSelecionada(data.data);
        setMostrarDetalhes(true);
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
    }
  };

  const fecharDetalhes = () => {
    setMostrarDetalhes(false);
    setEmpresaSelecionada(null);
  };

  const getPlanoColor = (plano) => {
    const cores = {
      'free': 'text-gray-400 bg-gray-500/10 border-gray-500/30',
      'basic': 'text-blue-400 bg-blue-500/10 border-blue-500/30',
      'pro': 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      'enterprise': 'text-amber-400 bg-amber-500/10 border-amber-500/30'
    };
    return cores[plano] || cores.free;
  };

  const getPlanoLabel = (plano) => {
    const labels = {
      'free': 'Gratuito',
      'basic': 'Básico',
      'pro': 'Profissional',
      'enterprise': 'Enterprise'
    };
    return labels[plano] || plano;
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Gestão de Empresas</h2>
          <p className="text-gray-400 text-sm mt-1">
            Gerencie todas as empresas cadastradas no sistema
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all">
          <Plus className="h-5 w-5" />
          Nova Empresa
        </button>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar empresa..."
              value={filtros.search}
              onChange={(e) => setFiltros({ ...filtros, search: e.target.value, page: 1 })}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:border-purple-500/50 focus:outline-none"
            />
          </div>
        </div>

        {/* Filtro Plano */}
        <select
          value={filtros.plano}
          onChange={(e) => setFiltros({ ...filtros, plano: e.target.value, page: 1 })}
          className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-purple-500/50 focus:outline-none"
        >
          <option value="">Todos os planos</option>
          <option value="free">Gratuito</option>
          <option value="basic">Básico</option>
          <option value="pro">Profissional</option>
          <option value="enterprise">Enterprise</option>
        </select>

        {/* Filtro Status */}
        <select
          value={filtros.status}
          onChange={(e) => setFiltros({ ...filtros, status: e.target.value, page: 1 })}
          className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-purple-500/50 focus:outline-none"
        >
          <option value="">Todos os status</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>
      </div>

      {/* Tabela de Empresas */}
      <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Empresa</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Plano</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">WhatsApp</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Usuários</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Leads</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Criado em</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-12">
                    <RefreshCw className="h-8 w-8 text-purple-400 animate-spin mx-auto mb-2" />
                    <p className="text-gray-400">Carregando empresas...</p>
                  </td>
                </tr>
              ) : empresas.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12">
                    <Building2 className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">Nenhuma empresa encontrada</p>
                  </td>
                </tr>
              ) : (
                empresas.map((empresa) => (
                  <tr key={empresa.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">{empresa.nome}</p>
                        <p className="text-gray-400 text-sm">{empresa.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPlanoColor(empresa.plano)}`}>
                        {getPlanoLabel(empresa.plano)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {empresa.plano_ativo ? (
                        <div className="flex items-center gap-2 text-green-400">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm">Ativo</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-400">
                          <XCircle className="h-4 w-4" />
                          <span className="text-sm">Inativo</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {empresa.whatsapp_conectado ? (
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                          <span className="text-sm text-gray-300">{empresa.whatsapp_numero}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Não conectado</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Users className="h-4 w-4" />
                        <span className="text-sm">{empresa.num_usuarios}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-300">
                        <MessageSquare className="h-4 w-4" />
                        <span className="text-sm">{empresa.num_leads}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-400">
                        {empresa.criado_em ? new Date(empresa.criado_em).toLocaleDateString('pt-BR') : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => verDetalhes(empresa.id)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-500/30 text-gray-400 hover:text-purple-400 transition-all"
                          title="Ver detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          className="p-2 rounded-lg bg-white/5 hover:bg-blue-500/20 border border-white/10 hover:border-blue-500/30 text-gray-400 hover:text-blue-400 transition-all"
                          title="Editar"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 text-gray-400 hover:text-red-400 transition-all"
                          title="Desativar"
                        >
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

        {/* Paginação */}
        {!loading && empresas.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
            <p className="text-sm text-gray-400">
              Página {filtros.page} de {totalPages}
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setFiltros({ ...filtros, page: filtros.page - 1 })}
                disabled={filtros.page === 1}
                className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <button
                onClick={() => setFiltros({ ...filtros, page: filtros.page + 1 })}
                disabled={filtros.page === totalPages}
                className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Detalhes */}
      {mostrarDetalhes && empresaSelecionada && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl border border-white/10 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gray-900 border-b border-white/10 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">{empresaSelecionada.nome}</h3>
                <p className="text-gray-400 text-sm">{empresaSelecionada.email}</p>
              </div>
              <button
                onClick={fecharDetalhes}
                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="p-6 space-y-6">
              {/* Informações Básicas */}
              <div>
                <h4 className="text-sm font-semibold text-gray-400 uppercase mb-4">Informações Básicas</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Nome Fantasia</p>
                    <p className="text-white font-medium">{empresaSelecionada.nome_fantasia || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">CNPJ</p>
                    <p className="text-white font-medium">{empresaSelecionada.cnpj || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Telefone</p>
                    <p className="text-white font-medium">{empresaSelecionada.telefone || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Website</p>
                    <p className="text-white font-medium">{empresaSelecionada.website || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Nicho</p>
                    <p className="text-white font-medium capitalize">{empresaSelecionada.nicho || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Criado em</p>
                    <p className="text-white font-medium">
                      {empresaSelecionada.criado_em ? new Date(empresaSelecionada.criado_em).toLocaleString('pt-BR') : '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Plano & Status */}
              <div>
                <h4 className="text-sm font-semibold text-gray-400 uppercase mb-4">Plano & Status</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-sm text-gray-400 mb-1">Plano Atual</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getPlanoColor(empresaSelecionada.plano)}`}>
                      {getPlanoLabel(empresaSelecionada.plano)}
                    </span>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-sm text-gray-400 mb-1">Status do Plano</p>
                    <p className={`text-lg font-bold ${empresaSelecionada.plano_ativo ? 'text-green-400' : 'text-red-400'}`}>
                      {empresaSelecionada.plano_ativo ? 'Ativo' : 'Inativo'}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-sm text-gray-400 mb-1">Bot Status</p>
                    <p className={`text-lg font-bold ${empresaSelecionada.bot_ativo ? 'text-green-400' : 'text-gray-400'}`}>
                      {empresaSelecionada.bot_ativo ? 'Ativo' : 'Desativado'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Estatísticas */}
              <div>
                <h4 className="text-sm font-semibold text-gray-400 uppercase mb-4">Estatísticas</h4>
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
                    <Users className="h-8 w-8 text-blue-400 mb-2" />
                    <p className="text-2xl font-bold text-white">{empresaSelecionada.estatisticas?.total_leads || 0}</p>
                    <p className="text-sm text-gray-400">Total Leads</p>
                  </div>
                  <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30">
                    <MessageSquare className="h-8 w-8 text-purple-400 mb-2" />
                    <p className="text-2xl font-bold text-white">{empresaSelecionada.estatisticas?.total_conversas || 0}</p>
                    <p className="text-sm text-gray-400">Conversas</p>
                  </div>
                  <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30">
                    <TrendingUp className="h-8 w-8 text-green-400 mb-2" />
                    <p className="text-2xl font-bold text-white">{empresaSelecionada.estatisticas?.total_mensagens || 0}</p>
                    <p className="text-sm text-gray-400">Mensagens</p>
                  </div>
                  <div className="p-4 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30">
                    <Clock className="h-8 w-8 text-amber-400 mb-2" />
                    <p className="text-2xl font-bold text-white">{empresaSelecionada.estatisticas?.total_campanhas || 0}</p>
                    <p className="text-sm text-gray-400">Campanhas</p>
                  </div>
                </div>
              </div>

              {/* Usuários */}
              {empresaSelecionada.usuarios && empresaSelecionada.usuarios.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 uppercase mb-4">
                    Usuários ({empresaSelecionada.usuarios.length})
                  </h4>
                  <div className="space-y-2">
                    {empresaSelecionada.usuarios.map((usuario) => (
                      <div key={usuario.id} className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">{usuario.nome}</p>
                          <p className="text-sm text-gray-400">{usuario.email}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-400 capitalize">{usuario.tipo.replace('_', ' ')}</span>
                          {usuario.ativo ? (
                            <span className="h-2 w-2 rounded-full bg-green-400"></span>
                          ) : (
                            <span className="h-2 w-2 rounded-full bg-red-400"></span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-900 border-t border-white/10 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={fecharDetalhes}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
              >
                Fechar
              </button>
              <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all">
                Editar Empresa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
