/**
 * Modal de Pedido - CRUD completo para Varejo
 * Adicionar, Editar e Visualizar pedidos
 */

import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import {
  Loader2, Save, X, ClipboardList, Plus, Trash2, Search,
  User, Package, DollarSign, Calendar
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

export default function OrderModal({
  isOpen,
  onClose,
  mode = 'create', // 'create', 'edit', 'view'
  order = null,
  empresaId,
  onSuccess
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchProduct, setSearchProduct] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const [formData, setFormData] = useState({
    cliente_id: '',
    cliente_nome: '',
    data_pedido: new Date().toISOString().split('T')[0],
    data_entrega: '',
    status: 'pendente',
    observacoes: '',
    forma_pagamento: 'boleto',
    desconto: 0,
    itens: []
  });

  // Carregar clientes e produtos
  useEffect(() => {
    if (isOpen) {
      loadCustomers();
      loadProducts();
    }
  }, [isOpen, empresaId]);

  // Preencher form quando editar/visualizar
  useEffect(() => {
    if (order && (mode === 'edit' || mode === 'view')) {
      setFormData({
        cliente_id: order.cliente_id || '',
        cliente_nome: order.cliente_nome || '',
        data_pedido: order.data_pedido?.split('T')[0] || new Date().toISOString().split('T')[0],
        data_entrega: order.data_entrega?.split('T')[0] || '',
        status: order.status || 'pendente',
        observacoes: order.observacoes || '',
        forma_pagamento: order.forma_pagamento || 'boleto',
        desconto: order.desconto || 0,
        itens: order.itens || []
      });
    } else if (mode === 'create') {
      setFormData({
        cliente_id: '',
        cliente_nome: '',
        data_pedido: new Date().toISOString().split('T')[0],
        data_entrega: '',
        status: 'pendente',
        observacoes: '',
        forma_pagamento: 'boleto',
        desconto: 0,
        itens: []
      });
    }
  }, [order, mode, isOpen]);

  const loadCustomers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/clientes/listar?empresa_id=${empresaId}`, {
        headers: { 'X-Empresa-ID': empresaId?.toString() }
      });
      const data = await response.json();
      if (data.success) {
        setCustomers(data.clientes || data.data || []);
      }
    } catch (err) {
      console.error('Erro ao carregar clientes:', err);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/produtos/?empresa_id=${empresaId}&limit=200`, {
        headers: { 'X-Empresa-ID': empresaId?.toString() }
      });
      const data = await response.json();
      if (data.success) {
        setProducts(data.data?.produtos || data.produtos || []);
      }
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleCustomerChange = (e) => {
    const customerId = e.target.value;
    const customer = customers.find(c => c.id == customerId);
    setFormData(prev => ({
      ...prev,
      cliente_id: customerId,
      cliente_nome: customer?.nome || ''
    }));
  };

  const handleSearchProduct = (e) => {
    const term = e.target.value;
    setSearchProduct(term);

    if (term.length >= 2) {
      const results = products.filter(p =>
        p.nome?.toLowerCase().includes(term.toLowerCase()) ||
        p.sku?.toLowerCase().includes(term.toLowerCase())
      ).slice(0, 5);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const addItem = (product) => {
    const existingIndex = formData.itens.findIndex(i => i.produto_id === product.id);

    if (existingIndex >= 0) {
      // Incrementar quantidade
      const newItens = [...formData.itens];
      newItens[existingIndex].quantidade += 1;
      newItens[existingIndex].subtotal = newItens[existingIndex].quantidade * newItens[existingIndex].preco_unitario;
      setFormData(prev => ({ ...prev, itens: newItens }));
    } else {
      // Adicionar novo item
      const newItem = {
        produto_id: product.id,
        produto_nome: product.nome,
        sku: product.sku,
        quantidade: 1,
        preco_unitario: product.preco || 0,
        subtotal: product.preco || 0
      };
      setFormData(prev => ({ ...prev, itens: [...prev.itens, newItem] }));
    }

    setSearchProduct('');
    setSearchResults([]);
  };

  const updateItemQuantity = (index, quantity) => {
    const newItens = [...formData.itens];
    newItens[index].quantidade = Math.max(1, quantity);
    newItens[index].subtotal = newItens[index].quantidade * newItens[index].preco_unitario;
    setFormData(prev => ({ ...prev, itens: newItens }));
  };

  const removeItem = (index) => {
    const newItens = formData.itens.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, itens: newItens }));
  };

  const calcularTotal = () => {
    const subtotal = formData.itens.reduce((acc, item) => acc + (item.subtotal || 0), 0);
    return subtotal - (formData.desconto || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'view') return;

    if (formData.itens.length === 0) {
      setError('Adicione pelo menos um item ao pedido');
      return;
    }

    if (!formData.cliente_id) {
      setError('Selecione um cliente');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = mode === 'create'
        ? `${API_URL}/api/pedidos/criar`
        : `${API_URL}/api/pedidos/atualizar/${order.id}`;

      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Empresa-ID': empresaId?.toString()
        },
        body: JSON.stringify({
          ...formData,
          empresa_id: empresaId,
          total: calcularTotal()
        })
      });

      const data = await response.json();

      if (data.success) {
        onSuccess && onSuccess(data.pedido || data);
        onClose();
      } else {
        setError(data.error || 'Erro ao salvar pedido');
      }
    } catch (err) {
      console.error('Erro ao salvar pedido:', err);
      setError('Erro de conexão. Verifique se o servidor está rodando.');
    } finally {
      setLoading(false);
    }
  };

  const isReadOnly = mode === 'view';
  const title = mode === 'create' ? 'Novo Pedido' : mode === 'edit' ? 'Editar Pedido' : 'Detalhes do Pedido';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0f1629] border-white/10 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ClipboardList className="h-5 w-5 text-amber-400" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {mode === 'create' ? 'Crie um novo pedido de venda' :
             mode === 'edit' ? 'Altere os dados do pedido' :
             'Visualizando detalhes do pedido'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Cliente */}
          <div className="space-y-2">
            <Label htmlFor="cliente_id" className="text-gray-300 flex items-center gap-1">
              <User className="h-4 w-4" /> Cliente *
            </Label>
            <select
              id="cliente_id"
              name="cliente_id"
              value={formData.cliente_id}
              onChange={handleCustomerChange}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              disabled={isReadOnly}
              required
            >
              <option value="">Selecione um cliente...</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.nome} {c.cpf_cnpj ? `(${c.cpf_cnpj})` : ''}</option>
              ))}
            </select>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_pedido" className="text-gray-300 flex items-center gap-1">
                <Calendar className="h-4 w-4" /> Data do Pedido
              </Label>
              <Input
                id="data_pedido"
                name="data_pedido"
                type="date"
                value={formData.data_pedido}
                onChange={handleChange}
                className="bg-white/5 border-white/10 text-white"
                disabled={isReadOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data_entrega" className="text-gray-300">Previsão de Entrega</Label>
              <Input
                id="data_entrega"
                name="data_entrega"
                type="date"
                value={formData.data_entrega}
                onChange={handleChange}
                className="bg-white/5 border-white/10 text-white"
                disabled={isReadOnly}
              />
            </div>
          </div>

          {/* Status e Forma de Pagamento */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status" className="text-gray-300">Status</Label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                disabled={isReadOnly}
              >
                <option value="pendente">Pendente</option>
                <option value="confirmado">Confirmado</option>
                <option value="em_separacao">Em Separação</option>
                <option value="enviado">Enviado</option>
                <option value="entregue">Entregue</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="forma_pagamento" className="text-gray-300">Forma de Pagamento</Label>
              <select
                id="forma_pagamento"
                name="forma_pagamento"
                value={formData.forma_pagamento}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                disabled={isReadOnly}
              >
                <option value="boleto">Boleto</option>
                <option value="pix">PIX</option>
                <option value="cartao_credito">Cartão de Crédito</option>
                <option value="cartao_debito">Cartão de Débito</option>
                <option value="dinheiro">Dinheiro</option>
                <option value="prazo">À Prazo (30/60/90)</option>
              </select>
            </div>
          </div>

          {/* Adicionar Produtos */}
          {!isReadOnly && (
            <div className="space-y-2">
              <Label className="text-gray-300 flex items-center gap-1">
                <Package className="h-4 w-4" /> Adicionar Produtos
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchProduct}
                  onChange={handleSearchProduct}
                  placeholder="Buscar produto por nome ou SKU..."
                  className="pl-10 bg-white/5 border-white/10 text-white"
                />
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a2744] border border-white/10 rounded-lg overflow-hidden z-10">
                    {searchResults.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => addItem(p)}
                        className="w-full px-4 py-2 text-left hover:bg-white/10 flex justify-between items-center"
                      >
                        <span>{p.nome} <span className="text-gray-500">({p.sku})</span></span>
                        <span className="text-emerald-400">R$ {parseFloat(p.preco || 0).toFixed(2)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Lista de Itens */}
          <div className="space-y-2">
            <Label className="text-gray-300">Itens do Pedido</Label>
            <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
              {formData.itens.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  Nenhum item adicionado
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-white/5 text-gray-400 text-xs">
                    <tr>
                      <th className="px-4 py-2 text-left">Produto</th>
                      <th className="px-4 py-2 text-center">Qtd</th>
                      <th className="px-4 py-2 text-right">Preço Un.</th>
                      <th className="px-4 py-2 text-right">Subtotal</th>
                      {!isReadOnly && <th className="px-4 py-2"></th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {formData.itens.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2">
                          <div className="text-white">{item.produto_nome}</div>
                          <div className="text-gray-500 text-xs">{item.sku}</div>
                        </td>
                        <td className="px-4 py-2 text-center">
                          {isReadOnly ? (
                            item.quantidade
                          ) : (
                            <Input
                              type="number"
                              min="1"
                              value={item.quantidade}
                              onChange={(e) => updateItemQuantity(index, parseInt(e.target.value))}
                              className="w-16 text-center bg-white/5 border-white/10 text-white"
                            />
                          )}
                        </td>
                        <td className="px-4 py-2 text-right text-gray-300">
                          R$ {parseFloat(item.preco_unitario || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-right text-emerald-400 font-medium">
                          R$ {parseFloat(item.subtotal || 0).toFixed(2)}
                        </td>
                        {!isReadOnly && (
                          <td className="px-4 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Totais */}
          <div className="bg-white/5 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-gray-300">
              <span>Subtotal ({formData.itens.length} itens)</span>
              <span>R$ {formData.itens.reduce((acc, i) => acc + (i.subtotal || 0), 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-gray-300">
              <span>Desconto</span>
              <div className="flex items-center gap-2">
                <span>R$</span>
                <Input
                  name="desconto"
                  type="number"
                  step="0.01"
                  value={formData.desconto}
                  onChange={handleChange}
                  className="w-24 text-right bg-white/5 border-white/10 text-white"
                  disabled={isReadOnly}
                />
              </div>
            </div>
            <div className="flex justify-between text-xl font-bold border-t border-white/10 pt-2">
              <span className="text-white">Total</span>
              <span className="text-emerald-400">R$ {calcularTotal().toFixed(2)}</span>
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
              placeholder="Anotações sobre o pedido..."
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 min-h-[60px]"
              disabled={isReadOnly}
            />
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
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {mode === 'create' ? 'Criar Pedido' : 'Salvar Alterações'}
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
