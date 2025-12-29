/**
 * ══════════════════════════════════════════════════════════════
 * PÁGINAS DO NICHO ATACADO/VAREJO
 * Sistema completo para gestão de distribuidoras e lojas
 * Com CRUD completo conectado ao backend
 * ══════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import {
  Package, Warehouse, Tags, Factory, Upload, Plus, Search, Filter,
  Truck, FileText, Receipt, CreditCard, UserCheck, ClipboardList,
  Calculator, TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  Clock, MapPin, Phone, Mail, Building2, DollarSign, Boxes, Eye,
  Edit, Trash2, MoreHorizontal, Download, Printer, RefreshCw,
  ArrowUpRight, ArrowDownRight, ShoppingCart, Calendar, BarChart3,
  Loader2, X, FileSpreadsheet, AlertCircle
} from 'lucide-react';

// Importar modais
import ProductModal from './modals/ProductModal.jsx';
import CustomerModal from './modals/CustomerModal.jsx';
import OrderModal from './modals/OrderModal.jsx';

// URL do Backend - detectar ambiente
const getBackendUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' &&
      (window.location.hostname.includes('onrender.com') || window.location.hostname.includes('render.com'))) {
    return 'https://vendefacil-backend.onrender.com';
  }
  return 'http://localhost:5000';
};

const API_URL = getBackendUrl();

// ══════════════════════════════════════════════════════════════
// PÁGINA: CONTROLE DE ESTOQUE (Produtos)
// ══════════════════════════════════════════════════════════════
export function EstoquePage({ user }) {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('todos');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const empresaId = user?.empresa_id;

  // Carregar produtos
  useEffect(() => {
    loadProdutos();
  }, [empresaId]);

  const loadProdutos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/produtos/listar?empresa_id=${empresaId}`, {
        headers: { 'X-Empresa-ID': empresaId?.toString() }
      });
      const data = await response.json();
      if (data.success) {
        // API retorna data.data.produtos (formato produtos_api.py)
        const produtosList = data.data?.produtos || data.produtos || [];
        setProdutos(produtosList);
        console.log('[ESTOQUE] Produtos carregados:', produtosList.length);
      }
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedProduct(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const handleEdit = (produto) => {
    setSelectedProduct(produto);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleView = (produto) => {
    setSelectedProduct(produto);
    setModalMode('view');
    setModalOpen(true);
  };

  const handleDelete = async (produto) => {
    if (!confirm(`Deseja realmente excluir o produto "${produto.nome}"?`)) return;

    try {
      const response = await fetch(`${API_URL}/api/produtos/excluir/${produto.id}`, {
        method: 'DELETE',
        headers: { 'X-Empresa-ID': empresaId?.toString() }
      });
      const data = await response.json();
      if (data.success) {
        loadProdutos();
      }
    } catch (err) {
      console.error('Erro ao excluir produto:', err);
    }
  };

  const getStatus = (produto) => {
    if (produto.estoque === 0) return 'zerado';
    if (produto.estoque < (produto.estoque_minimo || 10)) return 'baixo';
    return 'ok';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ok': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'baixo': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'zerado': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-white/60 bg-white/10 border-white/20';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'ok': return 'Em estoque';
      case 'baixo': return 'Estoque baixo';
      case 'zerado': return 'Sem estoque';
      default: return 'N/D';
    }
  };

  // Filtrar produtos
  const produtosFiltrados = produtos.filter(p => {
    const matchSearch = !searchTerm ||
      p.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategoria = filtroCategoria === 'todos' || p.categoria === filtroCategoria;
    const status = getStatus(p);
    const matchStatus = filtroStatus === 'todos' || status === filtroStatus;
    return matchSearch && matchCategoria && matchStatus;
  });

  // Calcular stats
  const stats = {
    total: produtos.length,
    valorTotal: produtos.reduce((acc, p) => acc + (p.preco * p.estoque), 0),
    estoqueBaixo: produtos.filter(p => getStatus(p) === 'baixo').length,
    semEstoque: produtos.filter(p => getStatus(p) === 'zerado').length
  };

  // Categorias únicas
  const categorias = [...new Set(produtos.map(p => p.categoria).filter(Boolean))];

  return (
    <div className="min-h-screen bg-black p-6 space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-glass border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs">Total Produtos</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                <Boxes className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-glass border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs">Valor em Estoque</p>
                <p className="text-2xl font-bold text-green-400">R$ {stats.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-glass border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs">Estoque Baixo</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.estoqueBaixo}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-500/20 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-glass border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs">Sem Estoque</p>
                <p className="text-2xl font-bold text-red-400">{stats.semEstoque}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500/20 to-rose-500/20 flex items-center justify-center">
                <Package className="h-6 w-6 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <Card className="card-glass border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                  placeholder="Buscar produto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            >
              <option value="todos">Todas Categorias</option>
              {categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            >
              <option value="todos">Todos Status</option>
              <option value="ok">Em estoque</option>
              <option value="baixo">Estoque baixo</option>
              <option value="zerado">Sem estoque</option>
            </select>
            <Button
              onClick={loadProdutos}
              variant="outline"
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button
              onClick={handleCreate}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Produtos */}
      <Card className="card-glass border-white/10">
        <CardHeader className="border-b border-white/10">
          <CardTitle className="text-white flex items-center gap-2">
            <Warehouse className="h-5 w-5 text-emerald-400" />
            Controle de Estoque
          </CardTitle>
          <CardDescription className="text-gray-400">
            {produtosFiltrados.length} produto(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
            </div>
          ) : produtosFiltrados.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum produto encontrado</p>
              <Button onClick={handleCreate} className="mt-4 bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Produto
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 text-white/60 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Produto</th>
                    <th className="px-4 py-3 text-left">SKU</th>
                    <th className="px-4 py-3 text-left">Categoria</th>
                    <th className="px-4 py-3 text-left">Marca</th>
                    <th className="px-4 py-3 text-center">Estoque</th>
                    <th className="px-4 py-3 text-center">Mínimo</th>
                    <th className="px-4 py-3 text-right">Preço</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {produtosFiltrados.map((produto) => {
                    const status = getStatus(produto);
                    return (
                      <tr key={produto.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3">
                          <div className="text-white font-medium">{produto.nome}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-400 font-mono text-sm">{produto.sku || '-'}</td>
                        <td className="px-4 py-3 text-gray-300">{produto.categoria || '-'}</td>
                        <td className="px-4 py-3 text-gray-300">{produto.marca || '-'}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-bold ${status === 'zerado' ? 'text-red-400' : status === 'baixo' ? 'text-yellow-400' : 'text-white'}`}>
                            {produto.estoque || 0}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-gray-400">{produto.estoque_minimo || 10}</td>
                        <td className="px-4 py-3 text-right text-emerald-400 font-medium">
                          R$ {parseFloat(produto.preco || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(status)}`}>
                            {getStatusLabel(status)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleView(produto)}
                              className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                              title="Ver detalhes"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(produto)}
                              className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-blue-400 transition-colors"
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(produto)}
                              className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-red-400 transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Produto */}
      <ProductModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        product={selectedProduct}
        empresaId={empresaId}
        onSuccess={loadProdutos}
      />
    </div>
  );
}


// ══════════════════════════════════════════════════════════════
// PÁGINA: CLIENTES
// ══════════════════════════════════════════════════════════════
export function ClientesPage({ user }) {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const empresaId = user?.empresa_id;

  useEffect(() => {
    loadClientes();
  }, [empresaId]);

  const loadClientes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/clientes/listar?empresa_id=${empresaId}`, {
        headers: { 'X-Empresa-ID': empresaId?.toString() }
      });
      const data = await response.json();
      if (data.success) {
        setClientes(data.clientes || []);
      }
    } catch (err) {
      console.error('Erro ao carregar clientes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedCustomer(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const handleEdit = (cliente) => {
    setSelectedCustomer(cliente);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleView = (cliente) => {
    setSelectedCustomer(cliente);
    setModalMode('view');
    setModalOpen(true);
  };

  const handleDelete = async (cliente) => {
    if (!confirm(`Deseja realmente excluir o cliente "${cliente.nome}"?`)) return;

    try {
      const response = await fetch(`${API_URL}/api/clientes/excluir/${cliente.id}`, {
        method: 'DELETE',
        headers: { 'X-Empresa-ID': empresaId?.toString() }
      });
      const data = await response.json();
      if (data.success) {
        loadClientes();
      }
    } catch (err) {
      console.error('Erro ao excluir cliente:', err);
    }
  };

  const clientesFiltrados = clientes.filter(c => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return c.nome?.toLowerCase().includes(search) ||
           c.cpf_cnpj?.includes(search) ||
           c.email?.toLowerCase().includes(search) ||
           c.cidade?.toLowerCase().includes(search);
  });

  return (
    <div className="min-h-screen bg-black p-6 space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-glass border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs">Total Clientes</p>
                <p className="text-2xl font-bold text-white">{clientes.length}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-glass border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs">Pessoa Jurídica</p>
                <p className="text-2xl font-bold text-emerald-400">{clientes.filter(c => c.tipo === 'PJ').length}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-glass border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs">Pessoa Física</p>
                <p className="text-2xl font-bold text-purple-400">{clientes.filter(c => c.tipo === 'PF').length}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-glass border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs">Total em Compras</p>
                <p className="text-2xl font-bold text-green-400">
                  R$ {clientes.reduce((acc, c) => acc + (c.total_compras || 0), 0).toLocaleString('pt-BR')}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <Card className="card-glass border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                  placeholder="Buscar cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>
            <Button
              onClick={loadClientes}
              variant="outline"
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button
              onClick={handleCreate}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Clientes */}
      <Card className="card-glass border-white/10">
        <CardHeader className="border-b border-white/10">
          <CardTitle className="text-white flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-blue-400" />
            Carteira de Clientes
          </CardTitle>
          <CardDescription className="text-gray-400">
            {clientesFiltrados.length} cliente(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
            </div>
          ) : clientesFiltrados.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum cliente encontrado</p>
              <Button onClick={handleCreate} className="mt-4 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Cliente
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 text-white/60 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Cliente</th>
                    <th className="px-4 py-3 text-left">Tipo</th>
                    <th className="px-4 py-3 text-left">CPF/CNPJ</th>
                    <th className="px-4 py-3 text-left">Cidade</th>
                    <th className="px-4 py-3 text-left">Contato</th>
                    <th className="px-4 py-3 text-right">Total Compras</th>
                    <th className="px-4 py-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {clientesFiltrados.map((cliente) => (
                    <tr key={cliente.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <div className="text-white font-medium">{cliente.nome}</div>
                        <div className="text-gray-500 text-sm">{cliente.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          cliente.tipo === 'PJ'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        }`}>
                          {cliente.tipo === 'PJ' ? 'Pessoa Jurídica' : 'Pessoa Física'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-300 font-mono text-sm">{cliente.cpf_cnpj || '-'}</td>
                      <td className="px-4 py-3 text-gray-300">{cliente.cidade ? `${cliente.cidade}/${cliente.estado}` : '-'}</td>
                      <td className="px-4 py-3">
                        <div className="text-gray-300 text-sm">{cliente.telefone || cliente.celular || '-'}</div>
                      </td>
                      <td className="px-4 py-3 text-right text-green-400 font-medium">
                        R$ {parseFloat(cliente.total_compras || 0).toLocaleString('pt-BR')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleView(cliente)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                            title="Ver detalhes"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(cliente)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-blue-400 transition-colors"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(cliente)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-red-400 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Cliente */}
      <CustomerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        customer={selectedCustomer}
        empresaId={empresaId}
        onSuccess={loadClientes}
      />
    </div>
  );
}


// ══════════════════════════════════════════════════════════════
// PÁGINA: PEDIDOS
// ══════════════════════════════════════════════════════════════
export function PedidosPage({ user }) {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('todos');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const empresaId = user?.empresa_id;

  useEffect(() => {
    loadPedidos();
  }, [empresaId]);

  const loadPedidos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/pedidos/listar?empresa_id=${empresaId}`, {
        headers: { 'X-Empresa-ID': empresaId?.toString() }
      });
      const data = await response.json();
      if (data.success) {
        setPedidos(data.pedidos || []);
      }
    } catch (err) {
      console.error('Erro ao carregar pedidos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedOrder(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const handleView = (pedido) => {
    setSelectedOrder(pedido);
    setModalMode('view');
    setModalOpen(true);
  };

  const handleEdit = (pedido) => {
    setSelectedOrder(pedido);
    setModalMode('edit');
    setModalOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendente': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'confirmado': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'em_separacao': return 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30';
      case 'enviado': return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
      case 'entregue': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'cancelado': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-white/60 bg-white/10 border-white/20';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      pendente: 'Pendente',
      confirmado: 'Confirmado',
      em_separacao: 'Em Separação',
      enviado: 'Enviado',
      entregue: 'Entregue',
      cancelado: 'Cancelado'
    };
    return labels[status] || status;
  };

  const pedidosFiltrados = filtroStatus === 'todos'
    ? pedidos
    : pedidos.filter(p => p.status === filtroStatus);

  const stats = {
    total: pedidos.length,
    pendentes: pedidos.filter(p => p.status === 'pendente').length,
    enviados: pedidos.filter(p => p.status === 'enviado').length,
    valorTotal: pedidos.filter(p => p.status !== 'cancelado').reduce((acc, p) => acc + (p.total || 0), 0)
  };

  return (
    <div className="min-h-screen bg-black p-6 space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-glass border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs">Total Pedidos</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                <ClipboardList className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-glass border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.pendentes}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-500/20 flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-glass border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs">Em Transporte</p>
                <p className="text-2xl font-bold text-purple-400">{stats.enviados}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <Truck className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-glass border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs">Valor Total</p>
                <p className="text-2xl font-bold text-green-400">
                  R$ {stats.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <Card className="card-glass border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            >
              <option value="todos">Todos Status</option>
              <option value="pendente">Pendentes</option>
              <option value="confirmado">Confirmados</option>
              <option value="em_separacao">Em Separação</option>
              <option value="enviado">Enviados</option>
              <option value="entregue">Entregues</option>
              <option value="cancelado">Cancelados</option>
            </select>
            <div className="flex-1" />
            <Button
              onClick={loadPedidos}
              variant="outline"
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button
              onClick={handleCreate}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Pedido
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Pedidos */}
      <Card className="card-glass border-white/10">
        <CardHeader className="border-b border-white/10">
          <CardTitle className="text-white flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-amber-400" />
            Pedidos
          </CardTitle>
          <CardDescription className="text-gray-400">
            {pedidosFiltrados.length} pedido(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-amber-400 animate-spin" />
            </div>
          ) : pedidosFiltrados.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum pedido encontrado</p>
              <Button onClick={handleCreate} className="mt-4 bg-amber-600 hover:bg-amber-700">
                <Plus className="h-4 w-4 mr-2" />
                Criar Pedido
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {pedidosFiltrados.map((pedido) => (
                <div
                  key={pedido.id}
                  className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                        <ShoppingCart className="h-6 w-6 text-amber-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold">Pedido #{pedido.id}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs border ${getStatusColor(pedido.status)}`}>
                            {getStatusLabel(pedido.status)}
                          </span>
                        </div>
                        <div className="text-gray-400 text-sm">{pedido.cliente_nome}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-bold text-lg">
                        R$ {parseFloat(pedido.total || 0).toFixed(2)}
                      </div>
                      <div className="text-gray-500 text-sm">
                        {pedido.itens?.length || 0} item(ns)
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleView(pedido)}
                        variant="outline"
                        size="sm"
                        className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleEdit(pedido)}
                        variant="outline"
                        size="sm"
                        className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Pedido */}
      <OrderModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        order={selectedOrder}
        empresaId={empresaId}
        onSuccess={loadPedidos}
      />
    </div>
  );
}


// ══════════════════════════════════════════════════════════════
// PÁGINAS ADICIONAIS (Simplificadas para manter arquivo menor)
// ══════════════════════════════════════════════════════════════

export function EntregasPage({ user }) {
  const [entregas, setEntregas] = useState([]);
  const [entregadores, setEntregadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});

  // Filtros
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroEntregador, setFiltroEntregador] = useState('');
  const [filtroData, setFiltroData] = useState('');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedEntrega, setSelectedEntrega] = useState(null);
  const [entregadorModalOpen, setEntregadorModalOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    cliente_nome: '',
    cliente_telefone: '',
    cliente_whatsapp: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    ponto_referencia: '',
    descricao_itens: '',
    quantidade_volumes: 1,
    valor_pedido: '',
    valor_frete: '',
    forma_pagamento: 'pago',
    troco_para: '',
    entregador_id: '',
    prioridade: 'normal',
    data_agendada: '',
    hora_agendada: '',
    observacoes: ''
  });
  const [entregadorForm, setEntregadorForm] = useState({
    nome: '',
    telefone: '',
    whatsapp: '',
    email: '',
    documento: '',
    tipo_veiculo: 'moto',
    placa_veiculo: ''
  });
  const [saving, setSaving] = useState(false);

  const empresaId = user?.empresa_id;

  useEffect(() => {
    loadEntregas();
    loadEntregadores();
    loadStats();
  }, [empresaId]);

  const loadEntregas = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/entregas?empresa_id=${empresaId}`, {
        headers: { 'X-Empresa-ID': empresaId?.toString() }
      });
      const data = await response.json();
      if (data.success) {
        setEntregas(data.data?.entregas || []);
      }
    } catch (err) {
      console.error('Erro ao carregar entregas:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadEntregadores = async () => {
    try {
      const response = await fetch(`${API_URL}/api/entregas/entregadores?empresa_id=${empresaId}`, {
        headers: { 'X-Empresa-ID': empresaId?.toString() }
      });
      const data = await response.json();
      if (data.success) {
        setEntregadores(data.data || []);
      }
    } catch (err) {
      console.error('Erro ao carregar entregadores:', err);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/entregas/stats?empresa_id=${empresaId}`, {
        headers: { 'X-Empresa-ID': empresaId?.toString() }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data || {});
      }
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  };

  const handleCreate = () => {
    setSelectedEntrega(null);
    setFormData({
      cliente_nome: '',
      cliente_telefone: '',
      cliente_whatsapp: '',
      endereco: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
      ponto_referencia: '',
      descricao_itens: '',
      quantidade_volumes: 1,
      valor_pedido: '',
      valor_frete: '',
      forma_pagamento: 'pago',
      troco_para: '',
      entregador_id: '',
      prioridade: 'normal',
      data_agendada: '',
      hora_agendada: '',
      observacoes: ''
    });
    setModalMode('create');
    setModalOpen(true);
  };

  const handleEdit = (entrega) => {
    setSelectedEntrega(entrega);
    setFormData({
      cliente_nome: entrega.cliente_nome || '',
      cliente_telefone: entrega.cliente_telefone || '',
      cliente_whatsapp: entrega.cliente_whatsapp || '',
      endereco: entrega.endereco || '',
      numero: entrega.numero || '',
      complemento: entrega.complemento || '',
      bairro: entrega.bairro || '',
      cidade: entrega.cidade || '',
      estado: entrega.estado || '',
      cep: entrega.cep || '',
      ponto_referencia: entrega.ponto_referencia || '',
      descricao_itens: entrega.descricao_itens || '',
      quantidade_volumes: entrega.quantidade_volumes || 1,
      valor_pedido: entrega.valor_pedido || '',
      valor_frete: entrega.valor_frete || '',
      forma_pagamento: entrega.forma_pagamento || 'pago',
      troco_para: entrega.troco_para || '',
      entregador_id: entrega.entregador_id || '',
      prioridade: entrega.prioridade || 'normal',
      data_agendada: entrega.data_agendada?.split('T')[0] || '',
      hora_agendada: entrega.hora_agendada || '',
      observacoes: entrega.observacoes || ''
    });
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleView = (entrega) => {
    setSelectedEntrega(entrega);
    setModalMode('view');
    setModalOpen(true);
  };

  const handleStatusChange = async (entrega, novoStatus) => {
    try {
      const response = await fetch(`${API_URL}/api/entregas/${entrega.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Empresa-ID': empresaId?.toString()
        },
        body: JSON.stringify({ status: novoStatus })
      });
      const data = await response.json();
      if (data.success) {
        loadEntregas();
        loadStats();
      }
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = modalMode === 'create'
        ? `${API_URL}/api/entregas`
        : `${API_URL}/api/entregas/${selectedEntrega.id}`;

      const response = await fetch(url, {
        method: modalMode === 'create' ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Empresa-ID': empresaId?.toString()
        },
        body: JSON.stringify({
          ...formData,
          valor_pedido: parseFloat(formData.valor_pedido) || 0,
          valor_frete: parseFloat(formData.valor_frete) || 0,
          troco_para: parseFloat(formData.troco_para) || null
        })
      });
      const data = await response.json();
      if (data.success) {
        setModalOpen(false);
        loadEntregas();
        loadStats();
      }
    } catch (err) {
      console.error('Erro ao salvar entrega:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEntregador = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/entregas/entregadores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Empresa-ID': empresaId?.toString()
        },
        body: JSON.stringify(entregadorForm)
      });
      const data = await response.json();
      if (data.success) {
        setEntregadorModalOpen(false);
        setEntregadorForm({
          nome: '', telefone: '', whatsapp: '', email: '',
          documento: '', tipo_veiculo: 'moto', placa_veiculo: ''
        });
        loadEntregadores();
      }
    } catch (err) {
      console.error('Erro ao salvar entregador:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (entrega) => {
    if (!confirm('Deseja realmente excluir esta entrega?')) return;
    try {
      const response = await fetch(`${API_URL}/api/entregas/${entrega.id}`, {
        method: 'DELETE',
        headers: { 'X-Empresa-ID': empresaId?.toString() }
      });
      const data = await response.json();
      if (data.success) {
        loadEntregas();
        loadStats();
      }
    } catch (err) {
      console.error('Erro ao excluir entrega:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'aguardando_coleta': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'em_transito': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'entregue': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'cancelada': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'devolvida': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      pendente: 'Pendente',
      aguardando_coleta: 'Aguardando Coleta',
      em_transito: 'Em Trânsito',
      entregue: 'Entregue',
      cancelada: 'Cancelada',
      devolvida: 'Devolvida'
    };
    return labels[status] || status;
  };

  const getPrioridadeColor = (prioridade) => {
    switch (prioridade) {
      case 'urgente': return 'bg-red-500/20 text-red-400';
      case 'alta': return 'bg-orange-500/20 text-orange-400';
      case 'normal': return 'bg-blue-500/20 text-blue-400';
      case 'baixa': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatarData = (data) => {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarDataHora = (data) => {
    if (!data) return '-';
    return new Date(data).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // Filtrar entregas
  const entregasFiltradas = entregas.filter(e => {
    if (filtroStatus !== 'todos' && e.status !== filtroStatus) return false;
    if (filtroEntregador && e.entregador_id?.toString() !== filtroEntregador) return false;
    if (filtroData && !e.data_criacao?.includes(filtroData)) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-black p-6 space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="card-glass border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs">Hoje</p>
                <p className="text-2xl font-bold text-white">{stats.hoje_total || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-glass border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.pendentes || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-500/20 flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-glass border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs">Em Trânsito</p>
                <p className="text-2xl font-bold text-blue-400">{stats.em_transito || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
                <Truck className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-glass border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs">Entregues Hoje</p>
                <p className="text-2xl font-bold text-green-400">{stats.entregues_hoje || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-glass border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs">Valor do Mês</p>
                <p className="text-2xl font-bold text-emerald-400">
                  R$ {(stats.valor_mes || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <Card className="card-glass border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            >
              <option value="todos">Todos Status</option>
              <option value="pendente">Pendentes</option>
              <option value="aguardando_coleta">Aguardando Coleta</option>
              <option value="em_transito">Em Trânsito</option>
              <option value="entregue">Entregues</option>
              <option value="cancelada">Canceladas</option>
            </select>
            <select
              value={filtroEntregador}
              onChange={(e) => setFiltroEntregador(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            >
              <option value="">Todos Entregadores</option>
              {entregadores.map(ent => (
                <option key={ent.id} value={ent.id}>{ent.nome}</option>
              ))}
            </select>
            <Input
              type="date"
              value={filtroData}
              onChange={(e) => setFiltroData(e.target.value)}
              className="w-auto bg-white/5 border-white/10 text-white"
            />
            <div className="flex-1" />
            <Button
              onClick={loadEntregas}
              variant="outline"
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button
              onClick={() => setEntregadorModalOpen(true)}
              variant="outline"
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Entregadores ({entregadores.length})
            </Button>
            <Button
              onClick={handleCreate}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Entrega
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Entregas */}
      <Card className="card-glass border-white/10">
        <CardHeader className="border-b border-white/10">
          <CardTitle className="text-white flex items-center gap-2">
            <Truck className="h-5 w-5 text-purple-400" />
            Entregas ({entregasFiltradas.length})
          </CardTitle>
          <CardDescription className="text-gray-400">
            Gerenciamento de entregas e rastreamento
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
            </div>
          ) : entregasFiltradas.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma entrega encontrada</p>
              <Button onClick={handleCreate} className="mt-4 bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Criar Entrega
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {entregasFiltradas.map((entrega) => (
                <div key={entrega.id} className="p-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="h-12 w-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                        <Truck className="h-6 w-6 text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-white font-medium">#{entrega.id}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs border ${getStatusColor(entrega.status)}`}>
                            {getStatusLabel(entrega.status)}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${getPrioridadeColor(entrega.prioridade)}`}>
                            {entrega.prioridade || 'normal'}
                          </span>
                          {entrega.origem === 'bot_whatsapp' && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-400">
                              Via WhatsApp
                            </span>
                          )}
                        </div>
                        <p className="text-white mt-1">{entrega.cliente_nome || 'Cliente não informado'}</p>
                        <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {entrega.cliente_telefone || entrega.cliente_whatsapp || '-'}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {entrega.endereco ? `${entrega.endereco}, ${entrega.numero || 's/n'} - ${entrega.bairro || ''}` : '-'}
                          </span>
                        </div>
                        {entrega.descricao_itens && (
                          <p className="text-gray-500 text-sm mt-1 truncate">{entrega.descricao_itens}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Criada em: {formatarDataHora(entrega.data_criacao)}</span>
                          {entrega.entregador_nome && (
                            <span className="flex items-center gap-1">
                              <UserCheck className="h-3 w-3" />
                              {entrega.entregador_nome}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-emerald-400 font-bold text-lg">
                        R$ {parseFloat(entrega.valor_pedido || 0).toFixed(2)}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleView(entrega)}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                          title="Ver detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(entrega)}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-blue-400 transition-colors"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(entrega)}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-red-400 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      {/* Botões de ação rápida */}
                      {entrega.status === 'pendente' && (
                        <Button
                          onClick={() => handleStatusChange(entrega, 'em_transito')}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-xs"
                        >
                          Iniciar Entrega
                        </Button>
                      )}
                      {entrega.status === 'em_transito' && (
                        <Button
                          onClick={() => handleStatusChange(entrega, 'entregue')}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-xs"
                        >
                          Marcar Entregue
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Entrega */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f1629] border border-white/10 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Truck className="h-5 w-5 text-purple-400" />
                  {modalMode === 'create' ? 'Nova Entrega' : modalMode === 'edit' ? 'Editar Entrega' : 'Detalhes da Entrega'}
                </h2>
                <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-white">
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Dados do Cliente */}
              <div>
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-blue-400" />
                  Dados do Cliente
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Nome do Cliente</label>
                    <Input
                      value={formData.cliente_nome}
                      onChange={(e) => setFormData({...formData, cliente_nome: e.target.value})}
                      className="bg-white/5 border-white/10 text-white"
                      disabled={modalMode === 'view'}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Telefone</label>
                    <Input
                      value={formData.cliente_telefone}
                      onChange={(e) => setFormData({...formData, cliente_telefone: e.target.value})}
                      className="bg-white/5 border-white/10 text-white"
                      disabled={modalMode === 'view'}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">WhatsApp</label>
                    <Input
                      value={formData.cliente_whatsapp}
                      onChange={(e) => setFormData({...formData, cliente_whatsapp: e.target.value})}
                      className="bg-white/5 border-white/10 text-white"
                      disabled={modalMode === 'view'}
                    />
                  </div>
                </div>
              </div>

              {/* Endereço */}
              <div>
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-400" />
                  Endereço de Entrega
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-400 mb-1 block">Endereço</label>
                    <Input
                      value={formData.endereco}
                      onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                      className="bg-white/5 border-white/10 text-white"
                      disabled={modalMode === 'view'}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Número</label>
                    <Input
                      value={formData.numero}
                      onChange={(e) => setFormData({...formData, numero: e.target.value})}
                      className="bg-white/5 border-white/10 text-white"
                      disabled={modalMode === 'view'}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Complemento</label>
                    <Input
                      value={formData.complemento}
                      onChange={(e) => setFormData({...formData, complemento: e.target.value})}
                      className="bg-white/5 border-white/10 text-white"
                      disabled={modalMode === 'view'}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Bairro</label>
                    <Input
                      value={formData.bairro}
                      onChange={(e) => setFormData({...formData, bairro: e.target.value})}
                      className="bg-white/5 border-white/10 text-white"
                      disabled={modalMode === 'view'}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">CEP</label>
                    <Input
                      value={formData.cep}
                      onChange={(e) => setFormData({...formData, cep: e.target.value})}
                      className="bg-white/5 border-white/10 text-white"
                      disabled={modalMode === 'view'}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Cidade</label>
                    <Input
                      value={formData.cidade}
                      onChange={(e) => setFormData({...formData, cidade: e.target.value})}
                      className="bg-white/5 border-white/10 text-white"
                      disabled={modalMode === 'view'}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Estado</label>
                    <Input
                      value={formData.estado}
                      onChange={(e) => setFormData({...formData, estado: e.target.value})}
                      className="bg-white/5 border-white/10 text-white"
                      disabled={modalMode === 'view'}
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="text-sm text-gray-400 mb-1 block">Ponto de Referência</label>
                    <Input
                      value={formData.ponto_referencia}
                      onChange={(e) => setFormData({...formData, ponto_referencia: e.target.value})}
                      placeholder="Próximo ao mercado..."
                      className="bg-white/5 border-white/10 text-white"
                      disabled={modalMode === 'view'}
                    />
                  </div>
                </div>
              </div>

              {/* Pedido */}
              <div>
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4 text-purple-400" />
                  Dados do Pedido
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-3">
                    <label className="text-sm text-gray-400 mb-1 block">Descrição dos Itens</label>
                    <textarea
                      value={formData.descricao_itens}
                      onChange={(e) => setFormData({...formData, descricao_itens: e.target.value})}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white min-h-[80px]"
                      disabled={modalMode === 'view'}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Qtd. Volumes</label>
                    <Input
                      type="number"
                      value={formData.quantidade_volumes}
                      onChange={(e) => setFormData({...formData, quantidade_volumes: parseInt(e.target.value) || 1})}
                      className="bg-white/5 border-white/10 text-white"
                      disabled={modalMode === 'view'}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Valor do Pedido (R$)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.valor_pedido}
                      onChange={(e) => setFormData({...formData, valor_pedido: e.target.value})}
                      className="bg-white/5 border-white/10 text-white"
                      disabled={modalMode === 'view'}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Valor do Frete (R$)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.valor_frete}
                      onChange={(e) => setFormData({...formData, valor_frete: e.target.value})}
                      className="bg-white/5 border-white/10 text-white"
                      disabled={modalMode === 'view'}
                    />
                  </div>
                </div>
              </div>

              {/* Pagamento e Entregador */}
              <div>
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-400" />
                  Pagamento e Entregador
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Forma de Pagamento</label>
                    <select
                      value={formData.forma_pagamento}
                      onChange={(e) => setFormData({...formData, forma_pagamento: e.target.value})}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                      disabled={modalMode === 'view'}
                    >
                      <option value="pago">Já Pago</option>
                      <option value="dinheiro">Dinheiro</option>
                      <option value="cartao">Cartão</option>
                      <option value="pix">PIX</option>
                      <option value="a_combinar">A Combinar</option>
                    </select>
                  </div>
                  {formData.forma_pagamento === 'dinheiro' && (
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Troco para (R$)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.troco_para}
                        onChange={(e) => setFormData({...formData, troco_para: e.target.value})}
                        className="bg-white/5 border-white/10 text-white"
                        disabled={modalMode === 'view'}
                      />
                    </div>
                  )}
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Entregador</label>
                    <select
                      value={formData.entregador_id}
                      onChange={(e) => setFormData({...formData, entregador_id: e.target.value})}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                      disabled={modalMode === 'view'}
                    >
                      <option value="">Não atribuído</option>
                      {entregadores.map(ent => (
                        <option key={ent.id} value={ent.id}>{ent.nome} ({ent.tipo_veiculo})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Prioridade</label>
                    <select
                      value={formData.prioridade}
                      onChange={(e) => setFormData({...formData, prioridade: e.target.value})}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                      disabled={modalMode === 'view'}
                    >
                      <option value="baixa">Baixa</option>
                      <option value="normal">Normal</option>
                      <option value="alta">Alta</option>
                      <option value="urgente">Urgente</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Data Agendada</label>
                    <Input
                      type="date"
                      value={formData.data_agendada}
                      onChange={(e) => setFormData({...formData, data_agendada: e.target.value})}
                      className="bg-white/5 border-white/10 text-white"
                      disabled={modalMode === 'view'}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Hora Agendada</label>
                    <Input
                      type="time"
                      value={formData.hora_agendada}
                      onChange={(e) => setFormData({...formData, hora_agendada: e.target.value})}
                      className="bg-white/5 border-white/10 text-white"
                      disabled={modalMode === 'view'}
                    />
                  </div>
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Observações</label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white min-h-[60px]"
                  disabled={modalMode === 'view'}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 flex justify-end gap-3">
              <Button
                onClick={() => setModalOpen(false)}
                variant="outline"
                className="bg-white/5 border-white/10 text-white hover:bg-white/10"
              >
                {modalMode === 'view' ? 'Fechar' : 'Cancelar'}
              </Button>
              {modalMode !== 'view' && (
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {modalMode === 'create' ? 'Criar Entrega' : 'Salvar Alterações'}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Entregadores */}
      {entregadorModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f1629] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-blue-400" />
                  Gerenciar Entregadores
                </h2>
                <button onClick={() => setEntregadorModalOpen(false)} className="text-gray-400 hover:text-white">
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Lista de Entregadores */}
              <div className="space-y-3">
                {entregadores.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">Nenhum entregador cadastrado</p>
                ) : (
                  entregadores.map(ent => (
                    <div key={ent.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <UserCheck className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{ent.nome}</p>
                          <p className="text-gray-400 text-sm">
                            {ent.tipo_veiculo} • {ent.telefone || ent.whatsapp || '-'}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${ent.disponivel ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                        {ent.disponivel ? 'Disponível' : 'Indisponível'}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Formulário Novo Entregador */}
              <div className="border-t border-white/10 pt-6">
                <h3 className="text-white font-medium mb-4">Adicionar Novo Entregador</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Nome *</label>
                    <Input
                      value={entregadorForm.nome}
                      onChange={(e) => setEntregadorForm({...entregadorForm, nome: e.target.value})}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Telefone</label>
                    <Input
                      value={entregadorForm.telefone}
                      onChange={(e) => setEntregadorForm({...entregadorForm, telefone: e.target.value})}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">WhatsApp</label>
                    <Input
                      value={entregadorForm.whatsapp}
                      onChange={(e) => setEntregadorForm({...entregadorForm, whatsapp: e.target.value})}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Documento (CPF)</label>
                    <Input
                      value={entregadorForm.documento}
                      onChange={(e) => setEntregadorForm({...entregadorForm, documento: e.target.value})}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Tipo de Veículo</label>
                    <select
                      value={entregadorForm.tipo_veiculo}
                      onChange={(e) => setEntregadorForm({...entregadorForm, tipo_veiculo: e.target.value})}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                    >
                      <option value="moto">Moto</option>
                      <option value="carro">Carro</option>
                      <option value="van">Van</option>
                      <option value="caminhao">Caminhão</option>
                      <option value="bicicleta">Bicicleta</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Placa do Veículo</label>
                    <Input
                      value={entregadorForm.placa_veiculo}
                      onChange={(e) => setEntregadorForm({...entregadorForm, placa_veiculo: e.target.value})}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleSaveEntregador}
                  disabled={saving || !entregadorForm.nome}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Entregador
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function NotasFiscaisPage({ user }) {
  return (
    <div className="min-h-screen bg-black p-6">
      <Card className="card-glass border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-cyan-400" />
            Notas Fiscais
          </CardTitle>
          <CardDescription className="text-gray-400">
            Emissão e gestão de NF-e
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12 text-gray-400">
          <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p>Sistema de notas fiscais em desenvolvimento</p>
          <p className="text-sm mt-2">Em breve você poderá emitir NF-e aqui</p>
        </CardContent>
      </Card>
    </div>
  );
}

export function FornecedoresPage({ user }) {
  return (
    <div className="min-h-screen bg-black p-6">
      <Card className="card-glass border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Factory className="h-5 w-5 text-orange-400" />
            Fornecedores
          </CardTitle>
          <CardDescription className="text-gray-400">
            Gestão de fornecedores
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12 text-gray-400">
          <Factory className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p>Cadastro de fornecedores em desenvolvimento</p>
        </CardContent>
      </Card>
    </div>
  );
}

export function OrcamentosPage({ user }) {
  const [orcamentos, setOrcamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [refreshInterval, setRefreshInterval] = useState(null);

  // Filtros
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroOrigem, setFiltroOrigem] = useState('todos');
  const [filtroPeriodo, setFiltroPeriodo] = useState('hoje');

  // Modal de detalhes
  const [selectedOrcamento, setSelectedOrcamento] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const empresaId = user?.empresa_id;

  // Carregar orcamentos (entregas do bot)
  useEffect(() => {
    loadOrcamentos();
    loadStats();

    // Auto-refresh a cada 30 segundos
    const interval = setInterval(() => {
      loadOrcamentos();
      loadStats();
    }, 30000);
    setRefreshInterval(interval);

    return () => clearInterval(interval);
  }, [empresaId]);

  const loadOrcamentos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/entregas?empresa_id=${empresaId}&limit=100`, {
        headers: { 'X-Empresa-ID': empresaId?.toString() }
      });
      const data = await response.json();
      if (data.success) {
        setOrcamentos(data.data?.entregas || []);
        console.log('[ORCAMENTOS] Carregados:', data.data?.entregas?.length || 0);
      }
    } catch (err) {
      console.error('Erro ao carregar orcamentos:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/entregas/stats?empresa_id=${empresaId}`, {
        headers: { 'X-Empresa-ID': empresaId?.toString() }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data || {});
      }
    } catch (err) {
      console.error('Erro ao carregar stats:', err);
    }
  };

  const handleStatusChange = async (orcamento, novoStatus) => {
    try {
      const response = await fetch(`${API_URL}/api/entregas/${orcamento.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Empresa-ID': empresaId?.toString()
        },
        body: JSON.stringify({ status: novoStatus })
      });
      const data = await response.json();
      if (data.success) {
        loadOrcamentos();
        loadStats();
      }
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
    }
  };

  const handleView = (orcamento) => {
    setSelectedOrcamento(orcamento);
    setModalOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'aguardando_coleta': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'em_transito': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'entregue': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'cancelada': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      pendente: 'Pendente',
      aguardando_coleta: 'Aguardando Coleta',
      em_transito: 'Em Transito',
      entregue: 'Entregue',
      cancelada: 'Cancelada'
    };
    return labels[status] || status || 'Pendente';
  };

  const getOrigemLabel = (origem) => {
    const labels = {
      bot_whatsapp: 'WhatsApp Bot',
      manual: 'Manual',
      api: 'API Externa'
    };
    return labels[origem] || origem || 'Manual';
  };

  const getOrigemColor = (origem) => {
    switch (origem) {
      case 'bot_whatsapp': return 'bg-green-500/20 text-green-400';
      case 'api': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getPrioridadeColor = (prioridade) => {
    switch (prioridade) {
      case 'urgente': return 'bg-red-500/20 text-red-400';
      case 'alta': return 'bg-orange-500/20 text-orange-400';
      case 'normal': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatarData = (data) => {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarDataHora = (data) => {
    if (!data) return '-';
    return new Date(data).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const formatarMoeda = (valor) => {
    if (!valor) return 'R$ 0,00';
    return `R$ ${parseFloat(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  // Filtrar orcamentos
  const orcamentosFiltrados = orcamentos.filter(o => {
    if (filtroStatus !== 'todos' && o.status !== filtroStatus) return false;
    if (filtroOrigem !== 'todos' && o.origem !== filtroOrigem) return false;

    // Filtro de periodo
    if (filtroPeriodo !== 'todos') {
      const dataOrcamento = new Date(o.criado_em);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      if (filtroPeriodo === 'hoje') {
        const dataHoje = new Date(hoje);
        if (dataOrcamento < dataHoje) return false;
      } else if (filtroPeriodo === 'semana') {
        const inicioSemana = new Date(hoje);
        inicioSemana.setDate(hoje.getDate() - 7);
        if (dataOrcamento < inicioSemana) return false;
      } else if (filtroPeriodo === 'mes') {
        const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        if (dataOrcamento < inicioMes) return false;
      }
    }

    return true;
  });

  // Calcular totais filtrados
  const totaisFiltrados = {
    quantidade: orcamentosFiltrados.length,
    valorTotal: orcamentosFiltrados.reduce((acc, o) => acc + (parseFloat(o.valor_pedido) || 0), 0),
    pendentes: orcamentosFiltrados.filter(o => o.status === 'pendente').length,
    entregues: orcamentosFiltrados.filter(o => o.status === 'entregue').length
  };

  return (
    <div className="min-h-screen bg-black p-6 space-y-6">
      {/* Header com Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="card-glass border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs">Orcamentos Hoje</p>
                <p className="text-2xl font-bold text-white">{stats.hoje_total || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-glass border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.pendentes || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-500/20 flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-glass border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs">Em Transito</p>
                <p className="text-2xl font-bold text-blue-400">{stats.em_transito || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
                <Truck className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-glass border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs">Entregues Hoje</p>
                <p className="text-2xl font-bold text-green-400">{stats.entregues_hoje || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-glass border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs">Valor do Mes</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {formatarMoeda(stats.valor_mes)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="card-glass border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[150px]">
              <label className="text-sm text-gray-400 mb-1 block">Periodo</label>
              <select
                value={filtroPeriodo}
                onChange={(e) => setFiltroPeriodo(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
              >
                <option value="todos">Todos</option>
                <option value="hoje">Hoje</option>
                <option value="semana">Ultima Semana</option>
                <option value="mes">Este Mes</option>
              </select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="text-sm text-gray-400 mb-1 block">Status</label>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
              >
                <option value="todos">Todos</option>
                <option value="pendente">Pendente</option>
                <option value="aguardando_coleta">Aguardando Coleta</option>
                <option value="em_transito">Em Transito</option>
                <option value="entregue">Entregue</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="text-sm text-gray-400 mb-1 block">Origem</label>
              <select
                value={filtroOrigem}
                onChange={(e) => setFiltroOrigem(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
              >
                <option value="todos">Todas</option>
                <option value="bot_whatsapp">WhatsApp Bot</option>
                <option value="manual">Manual</option>
                <option value="api">API Externa</option>
              </select>
            </div>
            <Button
              onClick={() => { loadOrcamentos(); loadStats(); }}
              className="bg-white/10 hover:bg-white/20 text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>

          {/* Resumo do filtro */}
          <div className="mt-4 pt-4 border-t border-white/10 flex gap-6 text-sm">
            <span className="text-gray-400">
              Mostrando: <span className="text-white font-medium">{totaisFiltrados.quantidade}</span> orcamentos
            </span>
            <span className="text-gray-400">
              Total: <span className="text-green-400 font-medium">{formatarMoeda(totaisFiltrados.valorTotal)}</span>
            </span>
            <span className="text-gray-400">
              Pendentes: <span className="text-yellow-400 font-medium">{totaisFiltrados.pendentes}</span>
            </span>
            <span className="text-gray-400">
              Entregues: <span className="text-green-400 font-medium">{totaisFiltrados.entregues}</span>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Orcamentos */}
      <Card className="card-glass border-white/10">
        <CardHeader className="border-b border-white/10">
          <CardTitle className="text-white flex items-center gap-2">
            <Calculator className="h-5 w-5 text-indigo-400" />
            Orcamentos e Pedidos ({orcamentosFiltrados.length})
          </CardTitle>
          <CardDescription className="text-gray-400">
            Vendas registradas pelo bot e sistema - Atualizacao automatica a cada 30s
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="h-8 w-8 mx-auto animate-spin text-blue-400" />
              <p className="text-gray-400 mt-4">Carregando orcamentos...</p>
            </div>
          ) : orcamentosFiltrados.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Nenhum orcamento encontrado</p>
              <p className="text-sm mt-2">Os pedidos do bot WhatsApp aparecerao aqui automaticamente</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {orcamentosFiltrados.map((orcamento) => (
                <div key={orcamento.id} className="p-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    {/* Informacoes do Cliente */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                          <UserCheck className="h-5 w-5 text-indigo-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-medium truncate">
                            {orcamento.cliente_nome || 'Cliente nao informado'}
                          </p>
                          <div className="flex items-center gap-3 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {orcamento.cliente_telefone || orcamento.cliente_whatsapp || '-'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatarDataHora(orcamento.criado_em)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Endereco */}
                      {orcamento.endereco && (
                        <div className="flex items-start gap-2 text-sm text-gray-400 mt-2 ml-13">
                          <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                          <span>
                            {orcamento.endereco}
                            {orcamento.numero && `, ${orcamento.numero}`}
                            {orcamento.complemento && ` - ${orcamento.complemento}`}
                            {orcamento.bairro && ` - ${orcamento.bairro}`}
                            {orcamento.cidade && ` - ${orcamento.cidade}`}
                            {orcamento.estado && `/${orcamento.estado}`}
                            {orcamento.cep && ` - CEP: ${orcamento.cep}`}
                          </span>
                        </div>
                      )}

                      {/* Produtos */}
                      {orcamento.descricao_itens && (
                        <div className="flex items-start gap-2 text-sm mt-2 ml-13">
                          <ShoppingCart className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-300">{orcamento.descricao_itens}</span>
                        </div>
                      )}

                      {/* Observacoes */}
                      {orcamento.observacoes && (
                        <p className="text-sm text-gray-500 mt-2 ml-13 italic">
                          Obs: {orcamento.observacoes}
                        </p>
                      )}
                    </div>

                    {/* Valores e Status */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <p className="text-xl font-bold text-green-400">
                        {formatarMoeda(orcamento.valor_pedido)}
                      </p>
                      {orcamento.valor_frete > 0 && (
                        <p className="text-xs text-gray-400">
                          + Frete: {formatarMoeda(orcamento.valor_frete)}
                        </p>
                      )}

                      {/* Tags de Status */}
                      <div className="flex flex-wrap gap-2 justify-end">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(orcamento.status)}`}>
                          {getStatusLabel(orcamento.status)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOrigemColor(orcamento.origem)}`}>
                          {getOrigemLabel(orcamento.origem)}
                        </span>
                        {orcamento.prioridade && orcamento.prioridade !== 'normal' && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPrioridadeColor(orcamento.prioridade)}`}>
                            {orcamento.prioridade.toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* Agendamento */}
                      {(orcamento.data_agendada || orcamento.hora_agendada) && (
                        <p className="text-xs text-purple-400 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Agendado: {formatarData(orcamento.data_agendada)} {orcamento.hora_agendada}
                        </p>
                      )}

                      {/* Acoes */}
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                          onClick={() => handleView(orcamento)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {orcamento.status === 'pendente' && (
                          <Button
                            size="sm"
                            className="bg-orange-500/20 text-orange-400 hover:bg-orange-500/30"
                            onClick={() => handleStatusChange(orcamento, 'aguardando_coleta')}
                          >
                            Preparar
                          </Button>
                        )}
                        {orcamento.status === 'aguardando_coleta' && (
                          <Button
                            size="sm"
                            className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                            onClick={() => handleStatusChange(orcamento, 'em_transito')}
                          >
                            Enviar
                          </Button>
                        )}
                        {orcamento.status === 'em_transito' && (
                          <Button
                            size="sm"
                            className="bg-green-500/20 text-green-400 hover:bg-green-500/30"
                            onClick={() => handleStatusChange(orcamento, 'entregue')}
                          >
                            Entregar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
      {modalOpen && selectedOrcamento && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-400" />
                Detalhes do Orcamento #{selectedOrcamento.id}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status e Origem */}
              <div className="flex gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedOrcamento.status)}`}>
                  {getStatusLabel(selectedOrcamento.status)}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getOrigemColor(selectedOrcamento.origem)}`}>
                  {getOrigemLabel(selectedOrcamento.origem)}
                </span>
              </div>

              {/* Dados do Cliente */}
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-blue-400" />
                  Dados do Cliente
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Nome</p>
                    <p className="text-white">{selectedOrcamento.cliente_nome || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Telefone</p>
                    <p className="text-white">{selectedOrcamento.cliente_telefone || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">WhatsApp</p>
                    <p className="text-white">{selectedOrcamento.cliente_whatsapp || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">ID Conversa</p>
                    <p className="text-white font-mono text-xs">{selectedOrcamento.conversa_id || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Endereco */}
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-400" />
                  Endereco de Entrega
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="col-span-2">
                    <p className="text-gray-400">Endereco</p>
                    <p className="text-white">
                      {selectedOrcamento.endereco || '-'}
                      {selectedOrcamento.numero && `, ${selectedOrcamento.numero}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Complemento</p>
                    <p className="text-white">{selectedOrcamento.complemento || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Bairro</p>
                    <p className="text-white">{selectedOrcamento.bairro || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Cidade/UF</p>
                    <p className="text-white">
                      {selectedOrcamento.cidade || '-'}{selectedOrcamento.estado && `/${selectedOrcamento.estado}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">CEP</p>
                    <p className="text-white">{selectedOrcamento.cep || '-'}</p>
                  </div>
                  {selectedOrcamento.ponto_referencia && (
                    <div className="col-span-2">
                      <p className="text-gray-400">Ponto de Referencia</p>
                      <p className="text-white">{selectedOrcamento.ponto_referencia}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Produtos e Valores */}
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-purple-400" />
                  Pedido
                </h3>
                <div className="text-sm space-y-3">
                  {selectedOrcamento.descricao_itens && (
                    <div>
                      <p className="text-gray-400">Produtos</p>
                      <p className="text-white whitespace-pre-wrap">{selectedOrcamento.descricao_itens}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-4 pt-3 border-t border-white/10">
                    <div>
                      <p className="text-gray-400">Valor Pedido</p>
                      <p className="text-xl font-bold text-green-400">{formatarMoeda(selectedOrcamento.valor_pedido)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Frete</p>
                      <p className="text-white">{formatarMoeda(selectedOrcamento.valor_frete)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Total</p>
                      <p className="text-xl font-bold text-emerald-400">
                        {formatarMoeda((parseFloat(selectedOrcamento.valor_pedido) || 0) + (parseFloat(selectedOrcamento.valor_frete) || 0))}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400">Forma de Pagamento</p>
                      <p className="text-white">{selectedOrcamento.forma_pagamento || 'A combinar'}</p>
                    </div>
                    {selectedOrcamento.troco_para && (
                      <div>
                        <p className="text-gray-400">Troco para</p>
                        <p className="text-white">{formatarMoeda(selectedOrcamento.troco_para)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Datas */}
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-yellow-400" />
                  Linha do Tempo
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Criado em</p>
                    <p className="text-white">{formatarDataHora(selectedOrcamento.criado_em)}</p>
                  </div>
                  {selectedOrcamento.data_agendada && (
                    <div>
                      <p className="text-gray-400">Agendado para</p>
                      <p className="text-purple-400">
                        {formatarData(selectedOrcamento.data_agendada)} {selectedOrcamento.hora_agendada}
                      </p>
                    </div>
                  )}
                  {selectedOrcamento.data_coleta && (
                    <div>
                      <p className="text-gray-400">Coletado em</p>
                      <p className="text-orange-400">{formatarDataHora(selectedOrcamento.data_coleta)}</p>
                    </div>
                  )}
                  {selectedOrcamento.data_saida && (
                    <div>
                      <p className="text-gray-400">Saiu para entrega</p>
                      <p className="text-blue-400">{formatarDataHora(selectedOrcamento.data_saida)}</p>
                    </div>
                  )}
                  {selectedOrcamento.data_entrega && (
                    <div>
                      <p className="text-gray-400">Entregue em</p>
                      <p className="text-green-400">{formatarDataHora(selectedOrcamento.data_entrega)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Observacoes */}
              {selectedOrcamento.observacoes && (
                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="text-white font-medium mb-2">Observacoes</h3>
                  <p className="text-gray-300 text-sm">{selectedOrcamento.observacoes}</p>
                </div>
              )}
            </div>

            {/* Footer com acoes */}
            <div className="p-6 border-t border-white/10 flex justify-between">
              <Button
                variant="outline"
                className="bg-white/5 border-white/10 text-white"
                onClick={() => setModalOpen(false)}
              >
                Fechar
              </Button>
              <div className="flex gap-2">
                {selectedOrcamento.status === 'pendente' && (
                  <Button
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                    onClick={() => { handleStatusChange(selectedOrcamento, 'aguardando_coleta'); setModalOpen(false); }}
                  >
                    Preparar para Coleta
                  </Button>
                )}
                {selectedOrcamento.status === 'aguardando_coleta' && (
                  <Button
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={() => { handleStatusChange(selectedOrcamento, 'em_transito'); setModalOpen(false); }}
                  >
                    Enviar para Entrega
                  </Button>
                )}
                {selectedOrcamento.status === 'em_transito' && (
                  <Button
                    className="bg-green-500 hover:bg-green-600 text-white"
                    onClick={() => { handleStatusChange(selectedOrcamento, 'entregue'); setModalOpen(false); }}
                  >
                    Marcar como Entregue
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ContasReceberPage({ user }) {
  return (
    <div className="min-h-screen bg-black p-6">
      <Card className="card-glass border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Receipt className="h-5 w-5 text-green-400" />
            Contas a Receber
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12 text-gray-400">
          <Receipt className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p>Contas a receber em desenvolvimento</p>
        </CardContent>
      </Card>
    </div>
  );
}

export function ContasPagarPage({ user }) {
  return (
    <div className="min-h-screen bg-black p-6">
      <Card className="card-glass border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-red-400" />
            Contas a Pagar
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12 text-gray-400">
          <CreditCard className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p>Contas a pagar em desenvolvimento</p>
        </CardContent>
      </Card>
    </div>
  );
}

export function MarcasPage({ user }) {
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const empresaId = user?.empresa_id;

  useEffect(() => {
    loadMarcas();
  }, [empresaId]);

  const loadMarcas = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/marcas/listar?empresa_id=${empresaId}`, {
        headers: { 'X-Empresa-ID': empresaId?.toString() }
      });
      const data = await response.json();
      if (data.success) {
        setMarcas(data.marcas || []);
      }
    } catch (err) {
      console.error('Erro ao carregar marcas:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMarcas = marcas.filter(m =>
    m.nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalProdutos = marcas.reduce((acc, m) => acc + (m.total_produtos || 0), 0);
  const totalEstoque = marcas.reduce((acc, m) => acc + (m.total_estoque || 0), 0);

  return (
    <div className="min-h-screen bg-black p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Factory className="h-6 w-6 text-pink-400" />
            Marcas do Catalogo
          </h1>
          <p className="text-gray-400 mt-1">
            {marcas.length} marcas cadastradas com {totalProdutos} produtos
          </p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar marca..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="card-glass border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-pink-500/20">
                <Factory className="h-6 w-6 text-pink-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total de Marcas</p>
                <p className="text-2xl font-bold text-white">{marcas.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-glass border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-500/20">
                <Package className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total de Produtos</p>
                <p className="text-2xl font-bold text-white">{totalProdutos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-glass border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-emerald-500/20">
                <Boxes className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Estoque Total</p>
                <p className="text-2xl font-bold text-white">{totalEstoque.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Brands Grid */}
      <Card className="card-glass border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Tags className="h-5 w-5 text-pink-400" />
            Marcas Cadastradas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-pink-400" />
            </div>
          ) : filteredMarcas.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Factory className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Nenhuma marca encontrada</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredMarcas.map((marca, index) => (
                <div
                  key={index}
                  className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-pink-500/50 transition-all cursor-pointer group"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <span className="text-xl font-bold text-pink-400">
                        {marca.nome?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="font-semibold text-white mb-1">{marca.nome}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        {marca.total_produtos} produtos
                      </span>
                    </div>
                    <div className="text-xs text-emerald-400 mt-1">
                      {marca.total_estoque?.toLocaleString()} em estoque
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// PÁGINA: CONFIGURAÇÕES DA EMPRESA
// ══════════════════════════════════════════════════════════════
export function ConfiguracoesEmpresaPage({ user }) {
  const [config, setConfig] = useState({
    nome: '',
    nome_fantasia: '',
    cnpj: '',
    telefone: '',
    celular: '',
    email: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    horario_abertura: '08:00',
    horario_fechamento: '18:00',
    dias_funcionamento: ['seg', 'ter', 'qua', 'qui', 'sex', 'sab'],
    aceita_cartao: true,
    aceita_pix: true,
    aceita_boleto: true,
    aceita_dinheiro: true,
    prazo_entrega: '1-3 dias úteis',
    taxa_entrega: 0,
    entrega_gratis_acima: 500,
    mensagem_boas_vindas: '',
    mensagem_ausencia: '',
    sobre_empresa: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  const empresaId = user?.empresa_id;

  useEffect(() => {
    loadConfig();
  }, [empresaId]);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/empresa/config?empresa_id=${empresaId}`, {
        headers: { 'X-Empresa-ID': empresaId?.toString() }
      });
      const data = await response.json();
      if (data.success && data.config) {
        setConfig(prev => ({ ...prev, ...data.config }));
      }
    } catch (err) {
      console.error('Erro ao carregar configurações:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      const response = await fetch(`${API_URL}/api/empresa/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Empresa-ID': empresaId?.toString()
        },
        body: JSON.stringify({ ...config, empresa_id: empresaId })
      });
      const data = await response.json();
      if (data.success) {
        setSaveMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
      } else {
        setSaveMessage({ type: 'error', text: data.error || 'Erro ao salvar' });
      }
    } catch (err) {
      setSaveMessage({ type: 'error', text: 'Erro ao salvar configurações' });
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const toggleDia = (dia) => {
    setConfig(prev => {
      const dias = prev.dias_funcionamento || [];
      if (dias.includes(dia)) {
        return { ...prev, dias_funcionamento: dias.filter(d => d !== dia) };
      } else {
        return { ...prev, dias_funcionamento: [...dias, dia] };
      }
    });
  };

  const diasSemana = [
    { id: 'seg', label: 'Seg' },
    { id: 'ter', label: 'Ter' },
    { id: 'qua', label: 'Qua' },
    { id: 'qui', label: 'Qui' },
    { id: 'sex', label: 'Sex' },
    { id: 'sab', label: 'Sáb' },
    { id: 'dom', label: 'Dom' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Building2 className="h-7 w-7 text-emerald-400" />
            Configurações da Empresa
          </h1>
          <p className="text-gray-400 mt-1">Configure as informações da sua empresa para o bot utilizar</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Salvar Configurações
            </>
          )}
        </Button>
      </div>

      {/* Mensagem de sucesso/erro */}
      {saveMessage && (
        <div className={`rounded-xl p-4 ${saveMessage.type === 'success' ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
          <div className={`flex items-center gap-2 ${saveMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
            {saveMessage.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            {saveMessage.text}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dados da Empresa */}
        <Card className="card-glass border-white/10">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-white flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-400" />
              Dados da Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm text-gray-400 mb-1 block">Razão Social</label>
                <Input
                  value={config.nome}
                  onChange={(e) => handleChange('nome', e.target.value)}
                  placeholder="Comercial Mariano LTDA"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm text-gray-400 mb-1 block">Nome Fantasia</label>
                <Input
                  value={config.nome_fantasia}
                  onChange={(e) => handleChange('nome_fantasia', e.target.value)}
                  placeholder="Comercial Mariano"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">CNPJ</label>
                <Input
                  value={config.cnpj}
                  onChange={(e) => handleChange('cnpj', e.target.value)}
                  placeholder="00.000.000/0001-00"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Telefone</label>
                <Input
                  value={config.telefone}
                  onChange={(e) => handleChange('telefone', e.target.value)}
                  placeholder="(11) 3333-4444"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Celular/WhatsApp</label>
                <Input
                  value={config.celular}
                  onChange={(e) => handleChange('celular', e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">E-mail</label>
                <Input
                  value={config.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="contato@comercialmariano.com.br"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Endereço */}
        <Card className="card-glass border-white/10">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-white flex items-center gap-2">
              <MapPin className="h-5 w-5 text-red-400" />
              Endereço
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="text-sm text-gray-400 mb-1 block">Endereço</label>
                <Input
                  value={config.endereco}
                  onChange={(e) => handleChange('endereco', e.target.value)}
                  placeholder="Rua das Flores"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Número</label>
                <Input
                  value={config.numero}
                  onChange={(e) => handleChange('numero', e.target.value)}
                  placeholder="123"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Complemento</label>
                <Input
                  value={config.complemento}
                  onChange={(e) => handleChange('complemento', e.target.value)}
                  placeholder="Sala 1"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Bairro</label>
                <Input
                  value={config.bairro}
                  onChange={(e) => handleChange('bairro', e.target.value)}
                  placeholder="Centro"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">CEP</label>
                <Input
                  value={config.cep}
                  onChange={(e) => handleChange('cep', e.target.value)}
                  placeholder="01234-567"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Cidade</label>
                <Input
                  value={config.cidade}
                  onChange={(e) => handleChange('cidade', e.target.value)}
                  placeholder="São Paulo"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Estado</label>
                <select
                  value={config.estado}
                  onChange={(e) => handleChange('estado', e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                >
                  <option value="">Selecione</option>
                  <option value="AC">AC</option><option value="AL">AL</option><option value="AP">AP</option>
                  <option value="AM">AM</option><option value="BA">BA</option><option value="CE">CE</option>
                  <option value="DF">DF</option><option value="ES">ES</option><option value="GO">GO</option>
                  <option value="MA">MA</option><option value="MT">MT</option><option value="MS">MS</option>
                  <option value="MG">MG</option><option value="PA">PA</option><option value="PB">PB</option>
                  <option value="PR">PR</option><option value="PE">PE</option><option value="PI">PI</option>
                  <option value="RJ">RJ</option><option value="RN">RN</option><option value="RS">RS</option>
                  <option value="RO">RO</option><option value="RR">RR</option><option value="SC">SC</option>
                  <option value="SP">SP</option><option value="SE">SE</option><option value="TO">TO</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Horário de Funcionamento */}
        <Card className="card-glass border-white/10">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-400" />
              Horário de Funcionamento
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Abertura</label>
                <Input
                  type="time"
                  value={config.horario_abertura}
                  onChange={(e) => handleChange('horario_abertura', e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Fechamento</label>
                <Input
                  type="time"
                  value={config.horario_fechamento}
                  onChange={(e) => handleChange('horario_fechamento', e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Dias de Funcionamento</label>
              <div className="flex flex-wrap gap-2">
                {diasSemana.map(dia => (
                  <button
                    key={dia.id}
                    onClick={() => toggleDia(dia.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      (config.dias_funcionamento || []).includes(dia.id)
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white/10 text-gray-400 hover:bg-white/20'
                    }`}
                  >
                    {dia.label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formas de Pagamento */}
        <Card className="card-glass border-white/10">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-purple-400" />
              Formas de Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'aceita_cartao', label: 'Cartão de Crédito/Débito' },
                { id: 'aceita_pix', label: 'PIX' },
                { id: 'aceita_boleto', label: 'Boleto Bancário' },
                { id: 'aceita_dinheiro', label: 'Dinheiro' }
              ].map(forma => (
                <label key={forma.id} className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => handleChange(forma.id, !config[forma.id])}
                    className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-all ${
                      config[forma.id] ? 'bg-emerald-500 border-emerald-500' : 'border-white/30'
                    }`}
                  >
                    {config[forma.id] && <CheckCircle className="h-3 w-3 text-white" />}
                  </div>
                  <span className="text-white text-sm">{forma.label}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Entrega */}
        <Card className="card-glass border-white/10">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-white flex items-center gap-2">
              <Truck className="h-5 w-5 text-cyan-400" />
              Configurações de Entrega
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Prazo de Entrega</label>
                <Input
                  value={config.prazo_entrega}
                  onChange={(e) => handleChange('prazo_entrega', e.target.value)}
                  placeholder="1-3 dias úteis"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Taxa de Entrega (R$)</label>
                <Input
                  type="number"
                  value={config.taxa_entrega}
                  onChange={(e) => handleChange('taxa_entrega', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm text-gray-400 mb-1 block">Entrega Grátis Acima de (R$)</label>
                <Input
                  type="number"
                  value={config.entrega_gratis_acima}
                  onChange={(e) => handleChange('entrega_gratis_acima', parseFloat(e.target.value) || 0)}
                  placeholder="500.00"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mensagens do Bot */}
        <Card className="card-glass border-white/10 lg:col-span-2">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-400" />
              Mensagens do Bot
            </CardTitle>
            <CardDescription className="text-gray-400">
              Configure as mensagens automáticas que o bot usará
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Mensagem de Boas-Vindas</label>
              <textarea
                value={config.mensagem_boas_vindas}
                onChange={(e) => handleChange('mensagem_boas_vindas', e.target.value)}
                placeholder="Olá! Bem-vindo à Comercial Mariano! Sou a AIra, como posso ajudar você hoje?"
                rows={3}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 resize-none"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Mensagem de Ausência (fora do horário)</label>
              <textarea
                value={config.mensagem_ausencia}
                onChange={(e) => handleChange('mensagem_ausencia', e.target.value)}
                placeholder="Olá! Estamos fora do horário de atendimento. Nosso horário é de segunda a sexta das 8h às 18h. Deixe sua mensagem e retornaremos em breve!"
                rows={3}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 resize-none"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Sobre a Empresa (o bot usará para contextualizar respostas)</label>
              <textarea
                value={config.sobre_empresa}
                onChange={(e) => handleChange('sobre_empresa', e.target.value)}
                placeholder="A Comercial Mariano é uma distribuidora de lubrificantes, filtros e produtos automotivos. Trabalhamos com as melhores marcas como Ipiranga, Texaco, Mann, Tecfil, Fleetguard, Militec. Atendemos oficinas, postos e consumidores finais."
                rows={4}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 resize-none"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


export function ImportarProdutosPage({ user }) {
  const [arquivo, setArquivo] = useState(null);
  const [importando, setImportando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Usar API_URL global definido no topo do arquivo
  const empresaId = user?.empresa_id;

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setArquivo(file);
      setResultado(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      setArquivo(file);
      setResultado(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const baixarTemplate = () => {
    window.open(`${API_URL}/api/produtos/template`, '_blank');
  };

  const importarArquivo = async () => {
    if (!arquivo) return;

    setImportando(true);
    setResultado(null);

    try {
      const formData = new FormData();
      formData.append('arquivo', arquivo);
      formData.append('empresa_id', empresaId);

      const response = await fetch(`${API_URL}/api/produtos/import-csv`, {
        method: 'POST',
        headers: {
          'X-Empresa-ID': empresaId?.toString()
        },
        body: formData
      });

      const data = await response.json();
      setResultado(data);

      if (data.success) {
        setArquivo(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      setResultado({ success: false, error: error.message });
    } finally {
      setImportando(false);
    }
  };

  return (
    <div className="min-h-screen bg-black p-6 space-y-6">
      <Card className="card-glass border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Upload className="h-5 w-5 text-teal-400" />
            Importar Produtos
          </CardTitle>
          <CardDescription className="text-gray-400">
            Importe produtos via arquivo CSV (separado por ; ou ,)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Área de Drop */}
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${
              dragOver
                ? 'border-teal-400 bg-teal-400/10'
                : arquivo
                ? 'border-green-500 bg-green-500/10'
                : 'border-white/20 hover:border-white/40'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />

            {arquivo ? (
              <>
                <FileSpreadsheet className="h-16 w-16 mx-auto mb-4 text-green-400" />
                <p className="text-white font-medium">{arquivo.name}</p>
                <p className="text-gray-400 text-sm mt-1">
                  {(arquivo.size / 1024).toFixed(1)} KB
                </p>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setArquivo(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  variant="ghost"
                  size="sm"
                  className="mt-3 text-red-400 hover:text-red-300"
                >
                  <X className="h-4 w-4 mr-1" />
                  Remover
                </Button>
              </>
            ) : (
              <>
                <Upload className="h-16 w-16 mx-auto mb-4 text-gray-500" />
                <p className="text-white">Arraste um arquivo CSV aqui</p>
                <p className="text-gray-500 text-sm mt-1">ou clique para selecionar</p>
              </>
            )}
          </div>

          {/* Botões */}
          <div className="flex gap-4">
            <Button
              onClick={baixarTemplate}
              variant="outline"
              className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar Template CSV
            </Button>

            <Button
              onClick={importarArquivo}
              disabled={!arquivo || importando}
              className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 disabled:opacity-50"
            >
              {importando ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Importar Produtos
                </>
              )}
            </Button>
          </div>

          {/* Resultado */}
          {resultado && (
            <div className={`rounded-xl p-4 ${resultado.success ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
              {resultado.success ? (
                <>
                  <div className="flex items-center gap-2 text-green-400 font-medium">
                    <CheckCircle className="h-5 w-5" />
                    {resultado.message}
                  </div>
                  <p className="text-gray-400 text-sm mt-2">
                    {resultado.importados} produtos importados de {resultado.total} linhas
                  </p>
                  {resultado.erros?.length > 0 && (
                    <div className="mt-3 text-sm text-yellow-400">
                      <p className="font-medium">Avisos:</p>
                      <ul className="list-disc list-inside mt-1">
                        {resultado.erros.map((erro, i) => (
                          <li key={i}>{erro}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2 text-red-400">
                  <AlertCircle className="h-5 w-5" />
                  <span>{resultado.error}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instruções */}
      <Card className="card-glass border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-lg">Formato do Arquivo CSV</CardTitle>
        </CardHeader>
        <CardContent className="text-gray-400 space-y-4">
          <p>O arquivo deve conter as seguintes colunas (separadas por ; ou ,):</p>
          <div className="bg-black/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
            <code className="text-teal-400">
              nome;descricao;categoria;subcategoria;marca;preco;estoque;sku;aplicacao;disponivel
            </code>
          </div>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><span className="text-white">nome</span> - Nome do produto (obrigatório)</li>
            <li><span className="text-white">descricao</span> - Descrição detalhada</li>
            <li><span className="text-white">categoria</span> - Ex: Lubrificantes, Filtros, Aditivos</li>
            <li><span className="text-white">subcategoria</span> - Ex: Óleos de Motor, Linha Leve</li>
            <li><span className="text-white">marca</span> - Ex: Ipiranga, Mann, Tecfil</li>
            <li><span className="text-white">preco</span> - Valor numérico (45.90 ou 45,90)</li>
            <li><span className="text-white">estoque</span> - Quantidade em estoque</li>
            <li><span className="text-white">sku</span> - Código único do produto</li>
            <li><span className="text-white">aplicacao</span> - Ex: Carro e SUV, Moto, Caminhão</li>
            <li><span className="text-white">disponivel</span> - sim/não ou 1/0</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// PAGINA: AGENDAMENTOS
// ══════════════════════════════════════════════════════════════
export function AgendamentosPage({ user }) {
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroData, setFiltroData] = useState('');

  const empresaId = user?.empresa_id;

  useEffect(() => {
    loadAgendamentos();
  }, [empresaId]);

  const loadAgendamentos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/agendamentos/listar?empresa_id=${empresaId}`, {
        headers: { 'X-Empresa-ID': empresaId?.toString() }
      });
      const data = await response.json();
      if (data.success) {
        setAgendamentos(data.agendamentos || []);
      }
    } catch (err) {
      console.error('Erro ao carregar agendamentos:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatarDataHora = (dataHora) => {
    if (!dataHora) return '-';
    const d = new Date(dataHora);
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmado': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pendente': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'cancelado': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'concluido': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const agendamentosFiltrados = agendamentos.filter(a => {
    if (filtroStatus !== 'todos' && a.status !== filtroStatus) return false;
    if (filtroData && !a.data_hora?.includes(filtroData)) return false;
    return true;
  });

  // Estatisticas
  const stats = {
    total: agendamentos.length,
    pendentes: agendamentos.filter(a => a.status === 'pendente').length,
    confirmados: agendamentos.filter(a => a.status === 'confirmado').length,
    hoje: agendamentos.filter(a => {
      const dataAgendamento = a.data_hora?.split(' ')[0];
      const hoje = new Date().toISOString().split('T')[0];
      return dataAgendamento === hoje;
    }).length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Calendar className="h-7 w-7 text-purple-400" />
            Agendamentos
          </h1>
          <p className="text-gray-400 mt-1">Gerenciar visitas, entregas e retiradas agendadas</p>
        </div>
        <Button
          onClick={loadAgendamentos}
          variant="outline"
          className="bg-white/5 border-white/10 hover:bg-white/10 text-white"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-glass border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-glass border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Hoje</p>
                <p className="text-2xl font-bold text-emerald-400">{stats.hoje}</p>
              </div>
              <Clock className="h-8 w-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-glass border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.pendentes}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-glass border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Confirmados</p>
                <p className="text-2xl font-bold text-green-400">{stats.confirmados}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="card-glass border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm text-gray-400 mb-1 block">Filtrar por Data</label>
              <Input
                type="date"
                value={filtroData}
                onChange={(e) => setFiltroData(e.target.value)}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm text-gray-400 mb-1 block">Status</label>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
              >
                <option value="todos">Todos</option>
                <option value="pendente">Pendentes</option>
                <option value="confirmado">Confirmados</option>
                <option value="concluido">Concluidos</option>
                <option value="cancelado">Cancelados</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Agendamentos */}
      <Card className="card-glass border-white/10">
        <CardHeader className="border-b border-white/10">
          <CardTitle className="text-white flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-purple-400" />
            Lista de Agendamentos ({agendamentosFiltrados.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {agendamentosFiltrados.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum agendamento encontrado</p>
              <p className="text-sm mt-1">Os agendamentos via WhatsApp aparecerao aqui automaticamente</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {agendamentosFiltrados.map((agendamento) => (
                <div key={agendamento.id} className="p-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{agendamento.cliente_nome || 'Cliente'}</p>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {agendamento.cliente_telefone || '-'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatarDataHora(agendamento.data_hora)}
                          </span>
                        </div>
                        {agendamento.descricao && (
                          <p className="text-gray-500 text-sm mt-1">{agendamento.descricao}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(agendamento.status)}`}>
                        {agendamento.status || 'pendente'}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-gray-300">
                        {agendamento.tipo || 'visita'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
