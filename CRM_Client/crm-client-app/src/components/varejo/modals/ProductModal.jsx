/**
 * Modal de Produto - CRUD completo para Varejo
 * Adicionar, Editar e Visualizar produtos
 */

import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Loader2, Save, X, Package, DollarSign, Boxes, Tag } from 'lucide-react';

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

export default function ProductModal({
  isOpen,
  onClose,
  mode = 'create', // 'create', 'edit', 'view'
  product = null,
  empresaId,
  onSuccess
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    categoria: '',
    subcategoria: '',
    marca: '',
    preco: '',
    preco_promocional: '',
    estoque: '',
    estoque_minimo: '',
    sku: '',
    aplicacao: '',
    palavras_chave: '',
    disponivel: true
  });

  // Preencher form quando editar/visualizar
  useEffect(() => {
    if (product && (mode === 'edit' || mode === 'view')) {
      setFormData({
        nome: product.nome || '',
        descricao: product.descricao || '',
        categoria: product.categoria || '',
        subcategoria: product.subcategoria || '',
        marca: product.marca || '',
        preco: product.preco || '',
        preco_promocional: product.preco_promocional || '',
        estoque: product.estoque || '',
        estoque_minimo: product.estoque_minimo || '10',
        sku: product.sku || '',
        aplicacao: product.aplicacao || '',
        palavras_chave: product.palavras_chave || '',
        disponivel: product.disponivel !== false
      });
    } else if (mode === 'create') {
      // Reset form for create
      setFormData({
        nome: '',
        descricao: '',
        categoria: '',
        subcategoria: '',
        marca: '',
        preco: '',
        preco_promocional: '',
        estoque: '',
        estoque_minimo: '10',
        sku: '',
        aplicacao: '',
        palavras_chave: '',
        disponivel: true
      });
    }
  }, [product, mode, isOpen]);

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
        ? `${API_URL}/api/produtos/criar`
        : `${API_URL}/api/produtos/${product.id}?empresa_id=${empresaId}`;

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
          preco: parseFloat(formData.preco) || 0,
          preco_promocional: parseFloat(formData.preco_promocional) || null,
          estoque: parseInt(formData.estoque) || 0,
          estoque_minimo: parseInt(formData.estoque_minimo) || 10
        })
      });

      const data = await response.json();

      if (data.success) {
        onSuccess && onSuccess(data.produto || data);
        onClose();
      } else {
        setError(data.error || 'Erro ao salvar produto');
      }
    } catch (err) {
      console.error('Erro ao salvar produto:', err);
      setError('Erro de conexão. Verifique se o servidor está rodando.');
    } finally {
      setLoading(false);
    }
  };

  const isReadOnly = mode === 'view';
  const title = mode === 'create' ? 'Novo Produto' : mode === 'edit' ? 'Editar Produto' : 'Detalhes do Produto';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0f1629] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Package className="h-5 w-5 text-emerald-400" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {mode === 'create' ? 'Preencha os dados do novo produto' :
             mode === 'edit' ? 'Altere os dados do produto' :
             'Visualizando detalhes do produto'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Nome e SKU */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome" className="text-gray-300">Nome do Produto *</Label>
              <Input
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Ex: Óleo Motor 5W30 1L"
                className="bg-white/5 border-white/10 text-white"
                required
                disabled={isReadOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku" className="text-gray-300">SKU/Código</Label>
              <Input
                id="sku"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                placeholder="Ex: IPR-5W30-1L"
                className="bg-white/5 border-white/10 text-white"
                disabled={isReadOnly}
              />
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao" className="text-gray-300">Descrição</Label>
            <textarea
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              placeholder="Descrição detalhada do produto..."
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 min-h-[80px]"
              disabled={isReadOnly}
            />
          </div>

          {/* Categoria, Subcategoria, Marca */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoria" className="text-gray-300">Categoria</Label>
              <select
                id="categoria"
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                disabled={isReadOnly}
              >
                <option value="">Selecione...</option>
                <option value="Lubrificantes">Lubrificantes</option>
                <option value="Filtros">Filtros</option>
                <option value="Aditivos">Aditivos</option>
                <option value="Limpeza Automotiva">Limpeza Automotiva</option>
                <option value="Câmaras de Ar">Câmaras de Ar</option>
                <option value="Peças">Peças</option>
                <option value="Acessórios">Acessórios</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subcategoria" className="text-gray-300">Subcategoria</Label>
              <Input
                id="subcategoria"
                name="subcategoria"
                value={formData.subcategoria}
                onChange={handleChange}
                placeholder="Ex: Óleos de Motor"
                className="bg-white/5 border-white/10 text-white"
                disabled={isReadOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="marca" className="text-gray-300">Marca</Label>
              <Input
                id="marca"
                name="marca"
                value={formData.marca}
                onChange={handleChange}
                placeholder="Ex: Ipiranga"
                className="bg-white/5 border-white/10 text-white"
                disabled={isReadOnly}
              />
            </div>
          </div>

          {/* Preços */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="preco" className="text-gray-300 flex items-center gap-1">
                <DollarSign className="h-4 w-4" /> Preço *
              </Label>
              <Input
                id="preco"
                name="preco"
                type="number"
                step="0.01"
                value={formData.preco}
                onChange={handleChange}
                placeholder="0.00"
                className="bg-white/5 border-white/10 text-white"
                required
                disabled={isReadOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preco_promocional" className="text-gray-300">Preço Promocional</Label>
              <Input
                id="preco_promocional"
                name="preco_promocional"
                type="number"
                step="0.01"
                value={formData.preco_promocional}
                onChange={handleChange}
                placeholder="0.00"
                className="bg-white/5 border-white/10 text-white"
                disabled={isReadOnly}
              />
            </div>
          </div>

          {/* Estoque */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estoque" className="text-gray-300 flex items-center gap-1">
                <Boxes className="h-4 w-4" /> Estoque Atual
              </Label>
              <Input
                id="estoque"
                name="estoque"
                type="number"
                value={formData.estoque}
                onChange={handleChange}
                placeholder="0"
                className="bg-white/5 border-white/10 text-white"
                disabled={isReadOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estoque_minimo" className="text-gray-300">Estoque Mínimo</Label>
              <Input
                id="estoque_minimo"
                name="estoque_minimo"
                type="number"
                value={formData.estoque_minimo}
                onChange={handleChange}
                placeholder="10"
                className="bg-white/5 border-white/10 text-white"
                disabled={isReadOnly}
              />
            </div>
          </div>

          {/* Aplicação e Palavras-chave */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="aplicacao" className="text-gray-300">Aplicação</Label>
              <select
                id="aplicacao"
                name="aplicacao"
                value={formData.aplicacao}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                disabled={isReadOnly}
              >
                <option value="">Selecione...</option>
                <option value="Carro e SUV">Carro e SUV</option>
                <option value="Moto">Moto</option>
                <option value="Caminhão">Caminhão</option>
                <option value="Máquinas Pesadas">Máquinas Pesadas</option>
                <option value="Universal">Universal</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="palavras_chave" className="text-gray-300 flex items-center gap-1">
                <Tag className="h-4 w-4" /> Palavras-chave
              </Label>
              <Input
                id="palavras_chave"
                name="palavras_chave"
                value={formData.palavras_chave}
                onChange={handleChange}
                placeholder="óleo, motor, 5w30, sintético"
                className="bg-white/5 border-white/10 text-white"
                disabled={isReadOnly}
              />
            </div>
          </div>

          {/* Disponível */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="disponivel"
              name="disponivel"
              checked={formData.disponivel}
              onChange={handleChange}
              className="w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500/50"
              disabled={isReadOnly}
            />
            <Label htmlFor="disponivel" className="text-gray-300">Produto disponível para venda</Label>
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
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {mode === 'create' ? 'Criar Produto' : 'Salvar Alterações'}
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
