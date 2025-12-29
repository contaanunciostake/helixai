/**
 * Modal de Orcamento - Criar e visualizar orcamentos de tintas
 */

import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import {
  Loader2, Save, X, ClipboardList, Plus, Trash2,
  User, Phone, Building2, DollarSign, Printer, Download,
  Calculator, CheckCircle
} from 'lucide-react';

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

export default function OrcamentoModal({
  isOpen,
  onClose,
  mode = 'create',
  orcamento = null,
  empresaId,
  onSuccess
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    cliente_nome: '',
    cliente_telefone: '',
    cliente_email: '',
    obra: '',
    observacoes: '',
    validade_dias: 7,
    itens: []
  });

  const [novoItem, setNovoItem] = useState({
    tinta: '',
    cor: '',
    volume: '18L',
    quantidade: 1,
    valor_unitario: 0
  });

  useEffect(() => {
    if (orcamento && (mode === 'edit' || mode === 'view')) {
      setFormData({
        cliente_nome: orcamento.cliente_nome || '',
        cliente_telefone: orcamento.cliente_telefone || '',
        cliente_email: orcamento.cliente_email || '',
        obra: orcamento.obra || '',
        observacoes: orcamento.observacoes || '',
        validade_dias: orcamento.validade_dias || 7,
        itens: orcamento.itens || []
      });
    } else if (mode === 'create') {
      setFormData({
        cliente_nome: '',
        cliente_telefone: '',
        cliente_email: '',
        obra: '',
        observacoes: '',
        validade_dias: 7,
        itens: []
      });
    }
  }, [orcamento, mode, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (e) => {
    const { name, value } = e.target;
    setNovoItem(prev => ({ ...prev, [name]: value }));
  };

  const adicionarItem = () => {
    if (!novoItem.tinta || !novoItem.valor_unitario) return;

    const item = {
      ...novoItem,
      valor_unitario: parseFloat(novoItem.valor_unitario),
      quantidade: parseInt(novoItem.quantidade) || 1,
      valor_total: parseFloat(novoItem.valor_unitario) * (parseInt(novoItem.quantidade) || 1)
    };

    setFormData(prev => ({
      ...prev,
      itens: [...prev.itens, item]
    }));

    setNovoItem({
      tinta: '',
      cor: '',
      volume: '18L',
      quantidade: 1,
      valor_unitario: 0
    });
  };

  const removerItem = (index) => {
    setFormData(prev => ({
      ...prev,
      itens: prev.itens.filter((_, i) => i !== index)
    }));
  };

  const calcularTotal = () => {
    return formData.itens.reduce((acc, item) => acc + (item.valor_total || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'view') return;

    setLoading(true);
    setError(null);

    try {
      const url = mode === 'create'
        ? `${API_URL}/api/tintas/orcamentos`
        : `${API_URL}/api/tintas/orcamentos/${orcamento.id}`;

      const response = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Empresa-ID': empresaId?.toString()
        },
        body: JSON.stringify({
          ...formData,
          empresa_id: empresaId,
          valor_total: calcularTotal()
        })
      });

      const data = await response.json();

      if (data.success) {
        onSuccess && onSuccess();
        onClose();
      } else {
        setError(data.error || 'Erro ao salvar orcamento');
      }
    } catch (err) {
      console.error('Erro ao salvar orcamento:', err);
      setError('Erro de conexao');
    } finally {
      setLoading(false);
    }
  };

  const isReadOnly = mode === 'view';
  const title = mode === 'create' ? 'Novo Orcamento' : mode === 'edit' ? 'Editar Orcamento' : 'Detalhes do Orcamento';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0f1629] border-white/10 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ClipboardList className="h-5 w-5 text-purple-400" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {mode === 'view' && orcamento?.status && (
              <span className={`px-2 py-1 rounded-full text-xs ${
                orcamento.status === 'aprovado' ? 'bg-green-500/20 text-green-400' :
                orcamento.status === 'pendente' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {orcamento.status.charAt(0).toUpperCase() + orcamento.status.slice(1)}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Dados do Cliente */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2">
              <User className="h-4 w-4" /> Dados do Cliente
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Nome do Cliente *</Label>
                <Input
                  name="cliente_nome"
                  value={formData.cliente_nome}
                  onChange={handleChange}
                  placeholder="Nome completo"
                  className="bg-white/5 border-white/10 text-white"
                  required
                  disabled={isReadOnly}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Telefone</Label>
                <Input
                  name="cliente_telefone"
                  value={formData.cliente_telefone}
                  onChange={handleChange}
                  placeholder="(00) 00000-0000"
                  className="bg-white/5 border-white/10 text-white"
                  disabled={isReadOnly}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Email</Label>
                <Input
                  name="cliente_email"
                  type="email"
                  value={formData.cliente_email}
                  onChange={handleChange}
                  placeholder="email@exemplo.com"
                  className="bg-white/5 border-white/10 text-white"
                  disabled={isReadOnly}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Obra/Projeto</Label>
                <Input
                  name="obra"
                  value={formData.obra}
                  onChange={handleChange}
                  placeholder="Ex: Pintura residencia - Sala e Quartos"
                  className="bg-white/5 border-white/10 text-white"
                  disabled={isReadOnly}
                />
              </div>
            </div>
          </div>

          {/* Itens do Orcamento */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2">
              <ClipboardList className="h-4 w-4" /> Itens do Orcamento
            </h3>

            {/* Adicionar novo item */}
            {!isReadOnly && (
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                <div className="grid grid-cols-5 gap-3">
                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs text-gray-400">Tinta</Label>
                    <Input
                      name="tinta"
                      value={novoItem.tinta}
                      onChange={handleItemChange}
                      placeholder="Nome da tinta"
                      className="bg-white/5 border-white/10 text-white text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-400">Cor</Label>
                    <Input
                      name="cor"
                      value={novoItem.cor}
                      onChange={handleItemChange}
                      placeholder="Cor"
                      className="bg-white/5 border-white/10 text-white text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-400">Volume</Label>
                    <select
                      name="volume"
                      value={novoItem.volume}
                      onChange={handleItemChange}
                      className="w-full px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                    >
                      <option value="1L">1L</option>
                      <option value="3.6L">3.6L</option>
                      <option value="18L">18L</option>
                      <option value="20L">20L</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-400">Qtd</Label>
                    <Input
                      name="quantidade"
                      type="number"
                      min="1"
                      value={novoItem.quantidade}
                      onChange={handleItemChange}
                      className="bg-white/5 border-white/10 text-white text-sm"
                    />
                  </div>
                </div>
                <div className="flex items-end gap-3">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs text-gray-400">Valor Unitario (R$)</Label>
                    <Input
                      name="valor_unitario"
                      type="number"
                      step="0.01"
                      value={novoItem.valor_unitario}
                      onChange={handleItemChange}
                      placeholder="0.00"
                      className="bg-white/5 border-white/10 text-white text-sm"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={adicionarItem}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar
                  </Button>
                </div>
              </div>
            )}

            {/* Lista de itens */}
            <div className="space-y-2">
              {formData.itens.length === 0 ? (
                <div className="text-center py-6 text-white/40 bg-white/5 rounded-lg">
                  Nenhum item adicionado
                </div>
              ) : (
                formData.itens.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-white">{item.tinta}</p>
                      <p className="text-sm text-white/60">
                        {item.cor} - {item.volume} x {item.quantidade}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-semibold">
                        R$ {(item.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-white/40">
                        R$ {(item.valor_unitario || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} cada
                      </p>
                    </div>
                    {!isReadOnly && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removerItem(idx)}
                        className="ml-2"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Total */}
            {formData.itens.length > 0 && (
              <div className="flex justify-between items-center p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                <span className="font-semibold text-white">Total do Orcamento</span>
                <span className="text-2xl font-bold text-green-400">
                  R$ {calcularTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
          </div>

          {/* Observacoes */}
          <div className="space-y-2">
            <Label className="text-gray-300">Observacoes</Label>
            <textarea
              name="observacoes"
              value={formData.observacoes}
              onChange={handleChange}
              placeholder="Observacoes adicionais..."
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 min-h-[80px]"
              disabled={isReadOnly}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Validade (dias)</Label>
            <Input
              name="validade_dias"
              type="number"
              min="1"
              value={formData.validade_dias}
              onChange={handleChange}
              className="bg-white/5 border-white/10 text-white w-32"
              disabled={isReadOnly}
            />
          </div>
        </form>

        <DialogFooter className="mt-6 flex-wrap gap-2">
          {mode === 'view' && (
            <>
              <Button variant="outline" className="bg-white/5 border-white/10 text-white">
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
              <Button variant="outline" className="bg-white/5 border-white/10 text-white">
                <Download className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
            </>
          )}

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
              disabled={loading || formData.itens.length === 0}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {mode === 'create' ? 'Criar Orcamento' : 'Salvar'}
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
