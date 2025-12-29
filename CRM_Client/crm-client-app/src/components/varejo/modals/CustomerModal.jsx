/**
 * Modal de Cliente - CRUD completo para Varejo
 * Adicionar, Editar e Visualizar clientes
 */

import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Loader2, Save, X, UserCheck, Phone, Mail, MapPin, Building2 } from 'lucide-react';

// Detectar URL do backend dinamicamente
const getBackendUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  if (typeof window !== 'undefined' &&
      (window.location.hostname.includes('onrender.com') || window.location.hostname.includes('render.com'))) {
    return 'https://vendefacil-backend.onrender.com'
  }
  return 'http://localhost:5000'
}

const API_URL = getBackendUrl();

export default function CustomerModal({
  isOpen,
  onClose,
  mode = 'create', // 'create', 'edit', 'view'
  customer = null,
  empresaId,
  onSuccess
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'PJ', // PJ ou PF
    cpf_cnpj: '',
    email: '',
    telefone: '',
    celular: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    observacoes: '',
    ativo: true
  });

  // Preencher form quando editar/visualizar
  useEffect(() => {
    if (customer && (mode === 'edit' || mode === 'view')) {
      setFormData({
        nome: customer.nome || '',
        tipo: customer.tipo || 'PJ',
        cpf_cnpj: customer.cpf_cnpj || customer.cnpj || customer.cpf || '',
        email: customer.email || '',
        telefone: customer.telefone || '',
        celular: customer.celular || '',
        endereco: customer.endereco || '',
        numero: customer.numero || '',
        complemento: customer.complemento || '',
        bairro: customer.bairro || '',
        cidade: customer.cidade || '',
        estado: customer.estado || '',
        cep: customer.cep || '',
        observacoes: customer.observacoes || '',
        ativo: customer.ativo !== false
      });
    } else if (mode === 'create') {
      setFormData({
        nome: '',
        tipo: 'PJ',
        cpf_cnpj: '',
        email: '',
        telefone: '',
        celular: '',
        endereco: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: '',
        observacoes: '',
        ativo: true
      });
    }
  }, [customer, mode, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'view') return;

    setLoading(true);
    setError(null);

    try {
      const url = mode === 'create'
        ? `${API_URL}/api/clientes/criar`
        : `${API_URL}/api/clientes/atualizar/${customer.id}`;

      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Empresa-ID': empresaId?.toString()
        },
        body: JSON.stringify({
          ...formData,
          empresa_id: empresaId
        })
      });

      const data = await response.json();

      if (data.success) {
        onSuccess && onSuccess(data.cliente || data);
        onClose();
      } else {
        setError(data.error || 'Erro ao salvar cliente');
      }
    } catch (err) {
      console.error('Erro ao salvar cliente:', err);
      setError('Erro de conexão. Verifique se o servidor está rodando.');
    } finally {
      setLoading(false);
    }
  };

  const formatCPFCNPJ = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (formData.tipo === 'PF') {
      // CPF: 000.000.000-00
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
        .slice(0, 14);
    } else {
      // CNPJ: 00.000.000/0000-00
      return numbers
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
        .slice(0, 18);
    }
  };

  const handleCPFCNPJChange = (e) => {
    const formatted = formatCPFCNPJ(e.target.value);
    setFormData(prev => ({ ...prev, cpf_cnpj: formatted }));
  };

  const isReadOnly = mode === 'view';
  const title = mode === 'create' ? 'Novo Cliente' : mode === 'edit' ? 'Editar Cliente' : 'Detalhes do Cliente';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0f1629] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <UserCheck className="h-5 w-5 text-blue-400" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {mode === 'create' ? 'Cadastre um novo cliente' :
             mode === 'edit' ? 'Altere os dados do cliente' :
             'Visualizando dados do cliente'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Tipo e Nome */}
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo" className="text-gray-300">Tipo *</Label>
              <select
                id="tipo"
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                disabled={isReadOnly}
              >
                <option value="PJ">Pessoa Jurídica</option>
                <option value="PF">Pessoa Física</option>
              </select>
            </div>
            <div className="col-span-3 space-y-2">
              <Label htmlFor="nome" className="text-gray-300">
                {formData.tipo === 'PJ' ? 'Razão Social *' : 'Nome Completo *'}
              </Label>
              <Input
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder={formData.tipo === 'PJ' ? 'Empresa LTDA' : 'João da Silva'}
                className="bg-white/5 border-white/10 text-white"
                required
                disabled={isReadOnly}
              />
            </div>
          </div>

          {/* CPF/CNPJ e Email */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cpf_cnpj" className="text-gray-300 flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                {formData.tipo === 'PJ' ? 'CNPJ' : 'CPF'}
              </Label>
              <Input
                id="cpf_cnpj"
                name="cpf_cnpj"
                value={formData.cpf_cnpj}
                onChange={handleCPFCNPJChange}
                placeholder={formData.tipo === 'PJ' ? '00.000.000/0000-00' : '000.000.000-00'}
                className="bg-white/5 border-white/10 text-white"
                disabled={isReadOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300 flex items-center gap-1">
                <Mail className="h-4 w-4" /> E-mail
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="contato@empresa.com.br"
                className="bg-white/5 border-white/10 text-white"
                disabled={isReadOnly}
              />
            </div>
          </div>

          {/* Telefones */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefone" className="text-gray-300 flex items-center gap-1">
                <Phone className="h-4 w-4" /> Telefone Fixo
              </Label>
              <Input
                id="telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                placeholder="(11) 3333-4444"
                className="bg-white/5 border-white/10 text-white"
                disabled={isReadOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="celular" className="text-gray-300">Celular/WhatsApp</Label>
              <Input
                id="celular"
                name="celular"
                value={formData.celular}
                onChange={handleChange}
                placeholder="(11) 99999-8888"
                className="bg-white/5 border-white/10 text-white"
                disabled={isReadOnly}
              />
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-2">
            <Label className="text-gray-300 flex items-center gap-1">
              <MapPin className="h-4 w-4" /> Endereço
            </Label>
            <div className="grid grid-cols-4 gap-2">
              <div className="col-span-3">
                <Input
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleChange}
                  placeholder="Rua, Avenida..."
                  className="bg-white/5 border-white/10 text-white"
                  disabled={isReadOnly}
                />
              </div>
              <Input
                name="numero"
                value={formData.numero}
                onChange={handleChange}
                placeholder="Nº"
                className="bg-white/5 border-white/10 text-white"
                disabled={isReadOnly}
              />
            </div>
          </div>

          {/* Complemento, Bairro, CEP */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="complemento" className="text-gray-300">Complemento</Label>
              <Input
                id="complemento"
                name="complemento"
                value={formData.complemento}
                onChange={handleChange}
                placeholder="Sala 101"
                className="bg-white/5 border-white/10 text-white"
                disabled={isReadOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bairro" className="text-gray-300">Bairro</Label>
              <Input
                id="bairro"
                name="bairro"
                value={formData.bairro}
                onChange={handleChange}
                placeholder="Centro"
                className="bg-white/5 border-white/10 text-white"
                disabled={isReadOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cep" className="text-gray-300">CEP</Label>
              <Input
                id="cep"
                name="cep"
                value={formData.cep}
                onChange={handleChange}
                placeholder="00000-000"
                className="bg-white/5 border-white/10 text-white"
                disabled={isReadOnly}
              />
            </div>
          </div>

          {/* Cidade e Estado */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cidade" className="text-gray-300">Cidade</Label>
              <Input
                id="cidade"
                name="cidade"
                value={formData.cidade}
                onChange={handleChange}
                placeholder="São Paulo"
                className="bg-white/5 border-white/10 text-white"
                disabled={isReadOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estado" className="text-gray-300">Estado</Label>
              <select
                id="estado"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                disabled={isReadOnly}
              >
                <option value="">Selecione...</option>
                <option value="AC">Acre</option>
                <option value="AL">Alagoas</option>
                <option value="AP">Amapá</option>
                <option value="AM">Amazonas</option>
                <option value="BA">Bahia</option>
                <option value="CE">Ceará</option>
                <option value="DF">Distrito Federal</option>
                <option value="ES">Espírito Santo</option>
                <option value="GO">Goiás</option>
                <option value="MA">Maranhão</option>
                <option value="MT">Mato Grosso</option>
                <option value="MS">Mato Grosso do Sul</option>
                <option value="MG">Minas Gerais</option>
                <option value="PA">Pará</option>
                <option value="PB">Paraíba</option>
                <option value="PR">Paraná</option>
                <option value="PE">Pernambuco</option>
                <option value="PI">Piauí</option>
                <option value="RJ">Rio de Janeiro</option>
                <option value="RN">Rio Grande do Norte</option>
                <option value="RS">Rio Grande do Sul</option>
                <option value="RO">Rondônia</option>
                <option value="RR">Roraima</option>
                <option value="SC">Santa Catarina</option>
                <option value="SP">São Paulo</option>
                <option value="SE">Sergipe</option>
                <option value="TO">Tocantins</option>
              </select>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes" className="text-gray-300">Observações</Label>
            <textarea
              id="observacoes"
              name="observacoes"
              value={formData.observacoes}
              onChange={handleChange}
              placeholder="Anotações sobre o cliente..."
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[80px]"
              disabled={isReadOnly}
            />
          </div>

          {/* Ativo */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="ativo"
              name="ativo"
              checked={formData.ativo}
              onChange={handleChange}
              className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500/50"
              disabled={isReadOnly}
            />
            <Label htmlFor="ativo" className="text-gray-300">Cliente ativo</Label>
          </div>
        </form>

        <DialogFooter className="mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
          >
            <X className="h-4 w-4 mr-2" />
            {mode === 'view' ? 'Fechar' : 'Cancelar'}
          </Button>

          {mode !== 'view' && (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {mode === 'create' ? 'Cadastrar Cliente' : 'Salvar Alterações'}
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
