import { useState, useEffect } from 'react';
import {
  User, Mail, Phone, CreditCard, Building,
  Save, Edit2, Check, X, AlertCircle, Shield,
  Award, Calendar, TrendingUp, DollarSign
} from 'lucide-react';

export function AfiliadoPerfil({ user, onUpdate }) {
  const [afiliado, setAfiliado] = useState(null);
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const [formData, setFormData] = useState({
    nome_completo: '',
    cpf_cnpj: '',
    telefone: '',
    banco: '',
    agencia: '',
    conta: '',
    tipo_conta: 'corrente',
    pix_tipo: 'cpf',
    pix_chave: ''
  });

  useEffect(() => {
    carregarPerfil();
  }, []);

  const carregarPerfil = async () => {
    try {
      setLoading(true);

      const res = await fetch('http://localhost:5000/api/afiliados/meu-perfil', {
        credentials: 'include'
      });

      const data = await res.json();

      if (data.success) {
        setAfiliado(data.afiliado);
        setFormData({
          nome_completo: data.afiliado.nome_completo || '',
          cpf_cnpj: data.afiliado.cpf_cnpj || '',
          telefone: data.afiliado.telefone || '',
          banco: data.afiliado.banco || '',
          agencia: data.afiliado.agencia || '',
          conta: data.afiliado.conta || '',
          tipo_conta: data.afiliado.tipo_conta || 'corrente',
          pix_tipo: data.afiliado.pix_tipo || 'cpf',
          pix_chave: data.afiliado.pix_chave || ''
        });
      }

    } catch (error) {
      console.error('[ERRO] Ao carregar perfil:', error);
      setErro('Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    try {
      setSalvando(true);

      const res = await fetch('http://localhost:5000/api/afiliados/atualizar-perfil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (data.success) {
        setSucesso('Perfil atualizado com sucesso!');
        setEditando(false);
        carregarPerfil();
        if (onUpdate) onUpdate();

        setTimeout(() => setSucesso(''), 3000);
      } else {
        setErro(data.message || 'Erro ao atualizar perfil');
      }

    } catch (error) {
      console.error('[ERRO] Ao atualizar perfil:', error);
      setErro('Erro ao processar solicitação');
    } finally {
      setSalvando(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      ativo: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Ativo' },
      pendente: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Pendente' },
      inativo: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Inativo' },
      bloqueado: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Bloqueado' }
    };
    return badges[status] || badges.pendente;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
      </div>
    );
  }

  if (!afiliado) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <p className="text-gray-400">Erro ao carregar perfil</p>
      </div>
    );
  }

  const statusInfo = getStatusBadge(afiliado.status);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Meu Perfil</h1>
          <p className="text-gray-400">Gerencie suas informações de afiliado</p>
        </div>
        {!editando && (
          <button
            onClick={() => setEditando(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors"
          >
            <Edit2 className="h-4 w-4" />
            Editar Perfil
          </button>
        )}
      </div>

      {/* Mensagens */}
      {erro && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <p className="text-sm text-red-400">{erro}</p>
        </div>
      )}

      {sucesso && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3">
          <Check className="h-5 w-5 text-green-400" />
          <p className="text-sm text-green-400">{sucesso}</p>
        </div>
      )}

      {/* Status e Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Info do Afiliado */}
        <div className="rounded-xl bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-cyan-500/10 border border-green-500/20 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-green-500/20">
              <Award className="h-6 w-6 text-green-400" />
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.bg} ${statusInfo.text}`}>
              {statusInfo.label}
            </span>
          </div>

          <h3 className="text-lg font-bold text-white mb-1">{afiliado.nome_completo || user?.nome || 'Sem nome'}</h3>
          <p className="text-sm text-gray-400 mb-4">{user?.email}</p>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Chave de Referência</span>
              <code className="text-green-400 font-mono">{afiliado.chave_referencia}</code>
            </div>
            {afiliado.data_inscricao && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Membro desde</span>
                <span className="text-white">
                  {new Date(afiliado.data_inscricao).toLocaleDateString('pt-BR')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <div className="p-2 rounded-lg bg-blue-500/20 w-fit mb-2">
              <TrendingUp className="h-4 w-4 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white mb-1">{afiliado.total_vendas}</p>
            <p className="text-xs text-gray-400">Total de Vendas</p>
          </div>

          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <div className="p-2 rounded-lg bg-green-500/20 w-fit mb-2">
              <DollarSign className="h-4 w-4 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-white mb-1">
              R$ {(afiliado.total_comissoes_geradas || 0).toFixed(0)}
            </p>
            <p className="text-xs text-gray-400">Comissões Geradas</p>
          </div>
        </div>
      </div>

      {/* Formulário de Perfil */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dados Pessoais */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-green-400" />
            Dados Pessoais
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nome Completo
              </label>
              <input
                type="text"
                value={formData.nome_completo}
                onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
                disabled={!editando}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Seu nome completo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                CPF/CNPJ
              </label>
              <input
                type="text"
                value={formData.cpf_cnpj}
                onChange={(e) => setFormData({ ...formData, cpf_cnpj: e.target.value })}
                disabled={!editando}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="000.000.000-00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Telefone
              </label>
              <input
                type="tel"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                disabled={!editando}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>
        </div>

        {/* Dados Bancários */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Building className="h-5 w-5 text-green-400" />
            Dados Bancários
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Banco
              </label>
              <input
                type="text"
                value={formData.banco}
                onChange={(e) => setFormData({ ...formData, banco: e.target.value })}
                disabled={!editando}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Nome do banco"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tipo de Conta
              </label>
              <select
                value={formData.tipo_conta}
                onChange={(e) => setFormData({ ...formData, tipo_conta: e.target.value })}
                disabled={!editando}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="corrente">Corrente</option>
                <option value="poupanca">Poupança</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Agência
              </label>
              <input
                type="text"
                value={formData.agencia}
                onChange={(e) => setFormData({ ...formData, agencia: e.target.value })}
                disabled={!editando}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="0000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Conta
              </label>
              <input
                type="text"
                value={formData.conta}
                onChange={(e) => setFormData({ ...formData, conta: e.target.value })}
                disabled={!editando}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="00000-0"
              />
            </div>
          </div>
        </div>

        {/* PIX */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-green-400" />
            PIX
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tipo de Chave
              </label>
              <select
                value={formData.pix_tipo}
                onChange={(e) => setFormData({ ...formData, pix_tipo: e.target.value })}
                disabled={!editando}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="cpf">CPF</option>
                <option value="cnpj">CNPJ</option>
                <option value="email">E-mail</option>
                <option value="telefone">Telefone</option>
                <option value="aleatoria">Chave Aleatória</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Chave PIX
              </label>
              <input
                type="text"
                value={formData.pix_chave}
                onChange={(e) => setFormData({ ...formData, pix_chave: e.target.value })}
                disabled={!editando}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Sua chave PIX"
              />
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        {editando && (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setEditando(false);
                carregarPerfil();
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors"
            >
              <X className="h-4 w-4" />
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg hover:shadow-green-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              {salvando ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        )}
      </form>

      {/* Informações sobre Comissões */}
      <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-400" />
          Suas Comissões
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-1">Primeira Venda</p>
            <p className="text-2xl font-bold text-green-400">{afiliado.comissao_primeira_venda}%</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-1">Recorrente</p>
            <p className="text-2xl font-bold text-green-400">{afiliado.comissao_recorrente}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
