/**
 * ══════════════════════════════════════════════════════════════
 * PAGINAS DO NICHO LOJA DE TINTAS
 * Sistema completo para gestao de lojas de tintas
 * Com CRUD completo conectado ao backend
 *
 * Funcionalidades:
 * - Catalogo de Tintas com filtros especificos
 * - Paleta de Cores interativa
 * - Calculadora de Rendimento
 * - Orcamentos com calculo automatico
 * - Historico de cores por cliente
 * - Gestao de clientes e pedidos
 * ══════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import {
  Palette, Paintbrush, Droplets, Calculator, FileText,
  Package, Search, Filter, Plus, Eye, Edit, Trash2,
  ShoppingCart, Users, TrendingUp, AlertTriangle,
  DollarSign, Boxes, Download, Printer, RefreshCw,
  Loader2, X, CheckCircle, Copy, Pipette, Ruler,
  Home, Building2, Sun, Moon, Layers, Sparkles,
  History, ClipboardList, Receipt
} from 'lucide-react';

// Importar modais
import TintaModal from './modals/TintaModal.jsx';
import OrcamentoModal from './modals/OrcamentoModal.jsx';
import CalculadoraModal from './modals/CalculadoraModal.jsx';

const API_URL = '';

// ══════════════════════════════════════════════════════════════
// CONSTANTES E OPCOES PARA TINTAS
// ══════════════════════════════════════════════════════════════

export const TIPOS_TINTA = [
  { value: 'latex', label: 'Tinta Latex', icon: Droplets },
  { value: 'acrilica', label: 'Tinta Acrilica', icon: Paintbrush },
  { value: 'esmalte', label: 'Esmalte', icon: Sparkles },
  { value: 'verniz', label: 'Verniz', icon: Layers },
  { value: 'textura', label: 'Textura', icon: Layers },
  { value: 'massa_corrida', label: 'Massa Corrida', icon: Layers },
  { value: 'selador', label: 'Selador', icon: Droplets },
  { value: 'fundo_preparador', label: 'Fundo Preparador', icon: Layers },
  { value: 'impermeabilizante', label: 'Impermeabilizante', icon: Droplets },
  { value: 'tinta_piso', label: 'Tinta para Piso', icon: Layers }
];

export const ACABAMENTOS = [
  { value: 'fosco', label: 'Fosco', description: 'Sem brilho, disfarça imperfeicoes' },
  { value: 'acetinado', label: 'Acetinado', description: 'Brilho suave, facil limpeza' },
  { value: 'semibrilho', label: 'Semibrilho', description: 'Brilho moderado, resistente' },
  { value: 'brilhante', label: 'Brilhante', description: 'Alto brilho, muito resistente' }
];

export const BASES = [
  { value: 'agua', label: 'Base Agua', description: 'Ecologica, seca rapido, pouco cheiro' },
  { value: 'solvente', label: 'Base Solvente', description: 'Alta durabilidade, resistente' }
];

export const LINHAS = [
  { value: 'premium', label: 'Premium', color: 'text-yellow-400' },
  { value: 'standard', label: 'Standard', color: 'text-blue-400' },
  { value: 'economica', label: 'Economica', color: 'text-green-400' }
];

export const AMBIENTES = [
  { value: 'interno', label: 'Interno', icon: Home },
  { value: 'externo', label: 'Externo', icon: Sun },
  { value: 'interno_externo', label: 'Interno/Externo', icon: Building2 }
];

export const VOLUMES = [
  { value: 0.9, label: '900ml' },
  { value: 1, label: '1 Litro' },
  { value: 3.6, label: '3,6 Litros (Galao)' },
  { value: 18, label: '18 Litros (Lata)' },
  { value: 20, label: '20 Litros' }
];

export const MARCAS_TINTAS = [
  'Suvinil', 'Coral', 'Sherwin-Williams', 'Lukscolor', 'Eucatex',
  'Dacar', 'Anjo', 'Renner', 'Montana', 'Killing', 'Hydronorth',
  'Iquine', 'Futura', 'Miracor', 'Outras'
];

// Paleta de cores populares
export const CORES_POPULARES = [
  { nome: 'Branco Neve', hex: '#FFFFFF', codigo: 'W001' },
  { nome: 'Branco Gelo', hex: '#F5F5F5', codigo: 'W002' },
  { nome: 'Perola', hex: '#FAF0E6', codigo: 'W003' },
  { nome: 'Palha', hex: '#F5DEB3', codigo: 'Y001' },
  { nome: 'Camurca', hex: '#D2B48C', codigo: 'Y002' },
  { nome: 'Areia', hex: '#C2B280', codigo: 'Y003' },
  { nome: 'Pessego', hex: '#FFDAB9', codigo: 'O001' },
  { nome: 'Salmao', hex: '#FA8072', codigo: 'O002' },
  { nome: 'Terracota', hex: '#E2725B', codigo: 'O003' },
  { nome: 'Cinza Claro', hex: '#D3D3D3', codigo: 'G001' },
  { nome: 'Cinza Medio', hex: '#A9A9A9', codigo: 'G002' },
  { nome: 'Cinza Escuro', hex: '#696969', codigo: 'G003' },
  { nome: 'Azul Celeste', hex: '#87CEEB', codigo: 'B001' },
  { nome: 'Azul Bebe', hex: '#89CFF0', codigo: 'B002' },
  { nome: 'Azul Marinho', hex: '#000080', codigo: 'B003' },
  { nome: 'Verde Menta', hex: '#98FF98', codigo: 'V001' },
  { nome: 'Verde Agua', hex: '#00FFFF', codigo: 'V002' },
  { nome: 'Verde Floresta', hex: '#228B22', codigo: 'V003' },
  { nome: 'Rosa Claro', hex: '#FFB6C1', codigo: 'P001' },
  { nome: 'Rosa Antigo', hex: '#D8A9A9', codigo: 'P002' },
  { nome: 'Lilas', hex: '#C8A2C8', codigo: 'P003' },
  { nome: 'Amarelo Sol', hex: '#FFD700', codigo: 'A001' },
  { nome: 'Amarelo Canario', hex: '#FFEF00', codigo: 'A002' },
  { nome: 'Laranja', hex: '#FFA500', codigo: 'L001' },
  { nome: 'Vermelho', hex: '#FF0000', codigo: 'R001' },
  { nome: 'Vermelho Oxido', hex: '#B22222', codigo: 'R002' },
  { nome: 'Marrom Cafe', hex: '#6F4E37', codigo: 'M001' },
  { nome: 'Marrom Chocolate', hex: '#7B3F00', codigo: 'M002' },
  { nome: 'Preto', hex: '#000000', codigo: 'K001' }
];

// ══════════════════════════════════════════════════════════════
// PAGINA: CATALOGO DE TINTAS
// ══════════════════════════════════════════════════════════════
export function CatalogoTintasPage({ user }) {
  const [tintas, setTintas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroAcabamento, setFiltroAcabamento] = useState('todos');
  const [filtroBase, setFiltroBase] = useState('todos');
  const [filtroMarca, setFiltroMarca] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('todos');

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProdutos, setTotalProdutos] = useState(0);
  const ITEMS_PER_PAGE = 24;

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedTinta, setSelectedTinta] = useState(null);

  const empresaId = user?.empresa_id;

  useEffect(() => {
    loadTintas();
  }, [empresaId, currentPage, searchTerm]);

  const loadTintas = async () => {
    try {
      setLoading(true);
      const searchParam = searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : '';
      const response = await fetch(
        `${API_URL}/api/produtos/?empresa_id=${empresaId}&page=${currentPage}&limit=${ITEMS_PER_PAGE}${searchParam}`,
        { headers: { 'X-Empresa-ID': empresaId?.toString() } }
      );
      const data = await response.json();
      if (data.success) {
        const produtos = data.data?.produtos || data.produtos || data.data || [];
        setTintas(produtos);
        const pagination = data.data?.pagination || data.pagination;
        setTotalPages(pagination?.pages || Math.ceil((pagination?.total || produtos.length) / ITEMS_PER_PAGE) || 1);
        setTotalProdutos(pagination?.total || produtos.length);
      }
    } catch (err) {
      console.error('[TINTAS] Erro ao carregar:', err);
      // Dados de exemplo para desenvolvimento
      setTintas([
        {
          id: 1, nome: 'Tinta Acrilica Premium Fosco', tipo: 'acrilica', acabamento: 'fosco',
          base: 'agua', cor: 'Branco Neve', codigo_cor: 'W001', hex_cor: '#FFFFFF',
          linha: 'premium', ambiente: 'interno_externo', marca: 'Suvinil',
          volume: 18, rendimento_m2: 12, preco: 289.90, estoque: 45,
          tempo_secagem: '1h ao toque', demaos: 2
        },
        {
          id: 2, nome: 'Esmalte Sintetico Brilhante', tipo: 'esmalte', acabamento: 'brilhante',
          base: 'solvente', cor: 'Branco', codigo_cor: 'W001', hex_cor: '#FFFFFF',
          linha: 'standard', ambiente: 'interno_externo', marca: 'Coral',
          volume: 3.6, rendimento_m2: 10, preco: 89.90, estoque: 32,
          tempo_secagem: '4h ao toque', demaos: 2
        },
        {
          id: 3, nome: 'Tinta Latex PVA Economica', tipo: 'latex', acabamento: 'fosco',
          base: 'agua', cor: 'Palha', codigo_cor: 'Y001', hex_cor: '#F5DEB3',
          linha: 'economica', ambiente: 'interno', marca: 'Lukscolor',
          volume: 18, rendimento_m2: 8, preco: 149.90, estoque: 28,
          tempo_secagem: '30min ao toque', demaos: 3
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedTinta(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const handleEdit = (tinta) => {
    setSelectedTinta(tinta);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleView = (tinta) => {
    setSelectedTinta(tinta);
    setModalMode('view');
    setModalOpen(true);
  };

  const handleDelete = async (tinta) => {
    if (!confirm(`Deseja realmente excluir "${tinta.nome}"?`)) return;
    try {
      const response = await fetch(`${API_URL}/api/produtos/${tinta.id}?empresa_id=${empresaId}`, {
        method: 'DELETE',
        headers: { 'X-Empresa-ID': empresaId?.toString() }
      });
      const data = await response.json();
      if (data.success) {
        loadTintas();
      }
    } catch (err) {
      console.error('Erro ao excluir:', err);
    }
  };

  const getStatus = (tinta) => {
    if (tinta.estoque === 0) return 'zerado';
    if (tinta.estoque < 10) return 'baixo';
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

  // Filtrar tintas
  const tintasFiltradas = tintas.filter(t => {
    const matchSearch = !searchTerm ||
      t.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.cor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.codigo_cor?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTipo = filtroTipo === 'todos' || t.tipo === filtroTipo;
    const matchAcabamento = filtroAcabamento === 'todos' || t.acabamento === filtroAcabamento;
    const matchBase = filtroBase === 'todos' || t.base === filtroBase;
    const matchMarca = filtroMarca === 'todos' || t.marca === filtroMarca;
    const status = getStatus(t);
    const matchStatus = filtroStatus === 'todos' || status === filtroStatus;
    return matchSearch && matchTipo && matchAcabamento && matchBase && matchMarca && matchStatus;
  });

  // Stats
  const stats = {
    total: tintas.length,
    valorTotal: tintas.reduce((acc, t) => acc + ((t.preco || 0) * (t.estoque || 0)), 0),
    estoqueBaixo: tintas.filter(t => getStatus(t) === 'baixo').length,
    semEstoque: tintas.filter(t => getStatus(t) === 'zerado').length
  };

  // Marcas unicas
  const marcasDisponiveis = [...new Set(tintas.map(t => t.marca).filter(Boolean))];

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
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <Paintbrush className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-glass border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs">Valor em Estoque</p>
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
                <Boxes className="h-6 w-6 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <Card className="card-glass border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                placeholder="Buscar por nome, cor ou codigo..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-10 bg-white/5 border-white/10 text-white"
              />
            </div>

            {/* Filtros */}
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
            >
              <option value="todos">Todos os Tipos</option>
              {TIPOS_TINTA.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>

            <select
              value={filtroAcabamento}
              onChange={(e) => setFiltroAcabamento(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
            >
              <option value="todos">Todos Acabamentos</option>
              {ACABAMENTOS.map(a => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>

            <select
              value={filtroBase}
              onChange={(e) => setFiltroBase(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
            >
              <option value="todos">Todas as Bases</option>
              {BASES.map(b => (
                <option key={b.value} value={b.value}>{b.label}</option>
              ))}
            </select>

            <Button onClick={handleCreate} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Nova Tinta
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Tintas */}
      <Card className="card-glass border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Palette className="h-5 w-5 text-purple-400" />
            Catalogo de Tintas ({totalProdutos > 0 ? totalProdutos : tintasFiltradas.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            </div>
          ) : tintasFiltradas.length === 0 ? (
            <div className="text-center py-12 text-white/60">
              <Paintbrush className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma tinta encontrada</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tintasFiltradas.map((tinta) => {
                  const status = getStatus(tinta);
                  return (
                    <div
                      key={tinta.id}
                      className="relative bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all group"
                    >
                      {/* Cor Badge */}
                      <div className="flex items-start gap-3">
                        <div
                          className="w-14 h-14 rounded-lg border-2 border-white/20 shadow-lg flex-shrink-0"
                          style={{ backgroundColor: tinta.hex_cor || '#CCCCCC' }}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white truncate">{tinta.nome}</h3>
                          <p className="text-sm text-white/60">{tinta.marca}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                              {ACABAMENTOS.find(a => a.value === tinta.acabamento)?.label || tinta.acabamento}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                              {BASES.find(b => b.value === tinta.base)?.label || tinta.base}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                        <div className="text-white/60">
                          <span className="block text-xs">Cor</span>
                          <span className="text-white">{tinta.cor} ({tinta.codigo_cor})</span>
                        </div>
                        <div className="text-white/60">
                          <span className="block text-xs">Volume</span>
                          <span className="text-white">{tinta.volume}L</span>
                        </div>
                        <div className="text-white/60">
                          <span className="block text-xs">Rendimento</span>
                          <span className="text-white">{tinta.rendimento_m2} m2/L</span>
                        </div>
                        <div className="text-white/60">
                          <span className="block text-xs">Preco</span>
                          <span className="text-green-400 font-semibold">
                            R$ {(tinta.preco || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      {/* Estoque */}
                      <div className="mt-3 flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(status)}`}>
                          Estoque: {tinta.estoque} un
                        </span>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleView(tinta)}
                            className="h-8 w-8 p-0 bg-white/10 hover:bg-white/20 border border-white/20"
                            title="Visualizar"
                          >
                            <Eye className="h-4 w-4 text-white/80" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(tinta)}
                            className="h-8 w-8 p-0 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4 text-blue-400" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(tinta)}
                            className="h-8 w-8 p-0 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Paginacao */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                  <div className="text-sm text-white/60">
                    Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, totalProdutos)} de {totalProdutos} produtos
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="bg-white/5 border-white/10 text-white disabled:opacity-30"
                    >
                      Primeira
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="bg-white/5 border-white/10 text-white disabled:opacity-30"
                    >
                      Anterior
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className={currentPage === pageNum
                              ? "bg-purple-600 text-white"
                              : "bg-white/5 border-white/10 text-white"
                            }
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="bg-white/5 border-white/10 text-white disabled:opacity-30"
                    >
                      Proxima
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="bg-white/5 border-white/10 text-white disabled:opacity-30"
                    >
                      Ultima
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      <TintaModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        tinta={selectedTinta}
        empresaId={empresaId}
        onSuccess={loadTintas}
      />
    </div>
  );
}


// ══════════════════════════════════════════════════════════════
// PAGINA: PALETA DE CORES
// ══════════════════════════════════════════════════════════════
export function PaletaCoresPage({ user }) {
  const [coresFiltradas, setCoresFiltradas] = useState(CORES_POPULARES);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCor, setSelectedCor] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    if (searchTerm) {
      setCoresFiltradas(CORES_POPULARES.filter(c =>
        c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.hex.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    } else {
      setCoresFiltradas(CORES_POPULARES);
    }
  }, [searchTerm]);

  const copiarCodigo = (codigo) => {
    navigator.clipboard.writeText(codigo);
    setCopiedCode(codigo);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Agrupar cores por familia
  const coresPorFamilia = {
    'Brancos e Neutros': coresFiltradas.filter(c => c.codigo.startsWith('W') || c.codigo.startsWith('G')),
    'Amarelos e Beges': coresFiltradas.filter(c => c.codigo.startsWith('Y') || c.codigo.startsWith('A')),
    'Laranjas e Terracota': coresFiltradas.filter(c => c.codigo.startsWith('O') || c.codigo.startsWith('L')),
    'Vermelhos e Marrons': coresFiltradas.filter(c => c.codigo.startsWith('R') || c.codigo.startsWith('M')),
    'Azuis': coresFiltradas.filter(c => c.codigo.startsWith('B')),
    'Verdes': coresFiltradas.filter(c => c.codigo.startsWith('V')),
    'Rosas e Lilas': coresFiltradas.filter(c => c.codigo.startsWith('P')),
    'Preto': coresFiltradas.filter(c => c.codigo.startsWith('K'))
  };

  return (
    <div className="min-h-screen bg-black p-6 space-y-6">
      {/* Header */}
      <Card className="card-glass border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Palette className="h-6 w-6 text-purple-400" />
                Paleta de Cores
              </CardTitle>
              <CardDescription className="text-white/60">
                {CORES_POPULARES.length} cores disponiveis para consulta
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                placeholder="Buscar cor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Cores agrupadas */}
      {Object.entries(coresPorFamilia).map(([familia, cores]) => cores.length > 0 && (
        <Card key={familia} className="card-glass border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg">{familia}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {cores.map((cor) => (
                <div
                  key={cor.codigo}
                  className={`group cursor-pointer rounded-xl overflow-hidden border-2 transition-all hover:scale-105 ${
                    selectedCor?.codigo === cor.codigo ? 'border-purple-500 ring-2 ring-purple-500/50' : 'border-white/10'
                  }`}
                  onClick={() => setSelectedCor(cor)}
                >
                  <div
                    className="h-20 w-full"
                    style={{ backgroundColor: cor.hex }}
                  />
                  <div className="p-2 bg-white/5">
                    <p className="text-sm font-medium text-white truncate">{cor.nome}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-white/60">{cor.codigo}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                        onClick={(e) => { e.stopPropagation(); copiarCodigo(cor.codigo); }}
                      >
                        {copiedCode === cor.codigo ? (
                          <CheckCircle className="h-3 w-3 text-green-400" />
                        ) : (
                          <Copy className="h-3 w-3 text-white/60" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Detalhes da cor selecionada */}
      {selectedCor && (
        <Card className="card-glass border-purple-500/30 fixed bottom-6 right-6 w-72 shadow-2xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div
                className="w-16 h-16 rounded-lg border-2 border-white/20 shadow-lg"
                style={{ backgroundColor: selectedCor.hex }}
              />
              <div>
                <h3 className="font-semibold text-white">{selectedCor.nome}</h3>
                <p className="text-sm text-white/60">Codigo: {selectedCor.codigo}</p>
                <p className="text-sm text-white/60">HEX: {selectedCor.hex}</p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                onClick={() => copiarCodigo(selectedCor.codigo)}
              >
                <Copy className="h-4 w-4 mr-1" />
                Copiar
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="bg-white/5 border-white/10"
                onClick={() => setSelectedCor(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


// ══════════════════════════════════════════════════════════════
// PAGINA: CALCULADORA DE RENDIMENTO
// ══════════════════════════════════════════════════════════════
export function CalculadoraRendimentoPage({ user }) {
  const [largura, setLargura] = useState('');
  const [altura, setAltura] = useState('');
  const [portas, setPortas] = useState(0);
  const [janelas, setJanelas] = useState(0);
  const [demaos, setDemaos] = useState(2);
  const [rendimentoPorLitro, setRendimentoPorLitro] = useState(10);
  const [volumeEmbalagem, setVolumeEmbalagem] = useState(18);
  const [resultado, setResultado] = useState(null);

  const calcular = () => {
    const areaTotal = parseFloat(largura) * parseFloat(altura);
    const areaPortas = portas * 1.6; // Porta padrao 0.8m x 2m
    const areaJanelas = janelas * 1.2; // Janela padrao 1m x 1.2m
    const areaUtil = areaTotal - areaPortas - areaJanelas;
    const areaPintura = areaUtil * demaos;
    const litrosNecessarios = areaPintura / rendimentoPorLitro;
    const embalagensNecessarias = Math.ceil(litrosNecessarios / volumeEmbalagem);
    const sobraLitros = (embalagensNecessarias * volumeEmbalagem) - litrosNecessarios;

    setResultado({
      areaTotal,
      areaPortas,
      areaJanelas,
      areaUtil,
      areaPintura,
      litrosNecessarios: litrosNecessarios.toFixed(2),
      embalagensNecessarias,
      volumeEmbalagem,
      sobraLitros: sobraLitros.toFixed(2)
    });
  };

  const limpar = () => {
    setLargura('');
    setAltura('');
    setPortas(0);
    setJanelas(0);
    setDemaos(2);
    setResultado(null);
  };

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="card-glass border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calculator className="h-6 w-6 text-purple-400" />
              Calculadora de Rendimento
            </CardTitle>
            <CardDescription className="text-white/60">
              Calcule a quantidade exata de tinta necessaria para seu projeto
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulario */}
          <Card className="card-glass border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-lg">Dados do Ambiente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/80">Largura (m)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={largura}
                    onChange={(e) => setLargura(e.target.value)}
                    placeholder="Ex: 4.5"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80">Altura (m)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={altura}
                    onChange={(e) => setAltura(e.target.value)}
                    placeholder="Ex: 2.8"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/80">Quantidade de Portas</Label>
                  <Input
                    type="number"
                    min="0"
                    value={portas}
                    onChange={(e) => setPortas(parseInt(e.target.value) || 0)}
                    className="bg-white/5 border-white/10 text-white"
                  />
                  <p className="text-xs text-white/40">Descontado 1.6m2 por porta</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80">Quantidade de Janelas</Label>
                  <Input
                    type="number"
                    min="0"
                    value={janelas}
                    onChange={(e) => setJanelas(parseInt(e.target.value) || 0)}
                    className="bg-white/5 border-white/10 text-white"
                  />
                  <p className="text-xs text-white/40">Descontado 1.2m2 por janela</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white/80">Numero de Demaos</Label>
                <select
                  value={demaos}
                  onChange={(e) => setDemaos(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                >
                  <option value={1}>1 demao</option>
                  <option value={2}>2 demaos (recomendado)</option>
                  <option value={3}>3 demaos</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/80">Rendimento (m2/L)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={rendimentoPorLitro}
                    onChange={(e) => setRendimentoPorLitro(parseFloat(e.target.value) || 10)}
                    className="bg-white/5 border-white/10 text-white"
                  />
                  <p className="text-xs text-white/40">Verificar na embalagem</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80">Volume Embalagem (L)</Label>
                  <select
                    value={volumeEmbalagem}
                    onChange={(e) => setVolumeEmbalagem(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  >
                    {VOLUMES.map(v => (
                      <option key={v.value} value={v.value}>{v.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={calcular}
                  disabled={!largura || !altura}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Calcular
                </Button>
                <Button
                  onClick={limpar}
                  variant="outline"
                  className="bg-white/5 border-white/10 text-white"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Limpar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Resultado */}
          <Card className={`card-glass border-white/10 ${resultado ? 'border-purple-500/30' : ''}`}>
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-400" />
                Resultado do Calculo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!resultado ? (
                <div className="text-center py-12 text-white/40">
                  <Ruler className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Preencha os dados e clique em Calcular</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl text-center">
                    <p className="text-white/60 text-sm">Voce precisa de</p>
                    <p className="text-4xl font-bold text-purple-400">
                      {resultado.embalagensNecessarias}
                    </p>
                    <p className="text-white">
                      {resultado.embalagensNecessarias === 1 ? 'embalagem' : 'embalagens'} de {resultado.volumeEmbalagem}L
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b border-white/10">
                      <span className="text-white/60">Area total</span>
                      <span className="text-white font-medium">{resultado.areaTotal.toFixed(2)} m2</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-white/10">
                      <span className="text-white/60">Desconto portas</span>
                      <span className="text-white/80">-{resultado.areaPortas.toFixed(2)} m2</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-white/10">
                      <span className="text-white/60">Desconto janelas</span>
                      <span className="text-white/80">-{resultado.areaJanelas.toFixed(2)} m2</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-white/10">
                      <span className="text-white/60">Area util</span>
                      <span className="text-white font-medium">{resultado.areaUtil.toFixed(2)} m2</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-white/10">
                      <span className="text-white/60">Area total c/ demaos</span>
                      <span className="text-white font-medium">{resultado.areaPintura.toFixed(2)} m2</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-white/10">
                      <span className="text-white/60">Litros necessarios</span>
                      <span className="text-purple-400 font-semibold">{resultado.litrosNecessarios} L</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-white/60">Sobra estimada</span>
                      <span className="text-green-400">{resultado.sobraLitros} L</span>
                    </div>
                  </div>

                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-sm text-yellow-300">
                    <AlertTriangle className="h-4 w-4 inline mr-2" />
                    Recomendamos adicionar 10% extra para retoques e perdas
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


// ══════════════════════════════════════════════════════════════
// PAGINA: ORCAMENTOS
// ══════════════════════════════════════════════════════════════
export function OrcamentosPage({ user }) {
  const [orcamentos, setOrcamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrcamento, setSelectedOrcamento] = useState(null);
  const [modalMode, setModalMode] = useState('create');

  const empresaId = user?.empresa_id;

  useEffect(() => {
    loadOrcamentos();
  }, [empresaId]);

  const loadOrcamentos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/tintas/orcamentos?empresa_id=${empresaId}`, {
        headers: { 'X-Empresa-ID': empresaId?.toString() }
      });
      const data = await response.json();
      if (data.success) {
        setOrcamentos(data.orcamentos || []);
      }
    } catch (err) {
      console.error('[ORCAMENTOS] Erro:', err);
      // Dados exemplo
      setOrcamentos([
        {
          id: 1,
          cliente_nome: 'Joao Silva',
          cliente_telefone: '11999998888',
          obra: 'Pintura residencia - Sala e Quartos',
          status: 'pendente',
          valor_total: 1850.00,
          criado_em: new Date().toISOString(),
          itens: [
            { tinta: 'Suvinil Fosco Premium', cor: 'Branco Neve', volume: '18L', qtd: 2, valor: 579.80 },
            { tinta: 'Suvinil Acrilica', cor: 'Palha', volume: '18L', qtd: 1, valor: 289.90 }
          ]
        },
        {
          id: 2,
          cliente_nome: 'Maria Santos',
          cliente_telefone: '11988887777',
          obra: 'Fachada comercial',
          status: 'aprovado',
          valor_total: 2450.00,
          criado_em: new Date(Date.now() - 86400000).toISOString(),
          itens: [
            { tinta: 'Coral Rende Muito', cor: 'Branco Gelo', volume: '18L', qtd: 4, valor: 980.00 }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedOrcamento(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const handleView = (orcamento) => {
    setSelectedOrcamento(orcamento);
    setModalMode('view');
    setModalOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'aprovado': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'pendente': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'rejeitado': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'expirado': return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
      default: return 'text-white/60 bg-white/10 border-white/20';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'aprovado': return 'Aprovado';
      case 'pendente': return 'Pendente';
      case 'rejeitado': return 'Rejeitado';
      case 'expirado': return 'Expirado';
      default: return status;
    }
  };

  // Stats
  const stats = {
    total: orcamentos.length,
    pendentes: orcamentos.filter(o => o.status === 'pendente').length,
    aprovados: orcamentos.filter(o => o.status === 'aprovado').length,
    valorTotal: orcamentos.filter(o => o.status === 'aprovado').reduce((acc, o) => acc + o.valor_total, 0)
  };

  return (
    <div className="min-h-screen bg-black p-6 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-glass border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs">Total Orcamentos</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <ClipboardList className="h-8 w-8 text-purple-400" />
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
              <AlertTriangle className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-glass border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs">Aprovados</p>
                <p className="text-2xl font-bold text-green-400">{stats.aprovados}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-glass border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs">Valor Aprovado</p>
                <p className="text-2xl font-bold text-green-400">
                  R$ {stats.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <Card className="card-glass border-white/10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                  placeholder="Buscar orcamento..."
                  className="pl-10 bg-white/5 border-white/10 text-white w-64"
                />
              </div>
            </div>
            <Button onClick={handleCreate} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Novo Orcamento
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      <Card className="card-glass border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Receipt className="h-5 w-5 text-purple-400" />
            Orcamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            </div>
          ) : orcamentos.length === 0 ? (
            <div className="text-center py-12 text-white/60">
              <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum orcamento encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orcamentos.map((orcamento) => (
                <div
                  key={orcamento.id}
                  className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all cursor-pointer"
                  onClick={() => handleView(orcamento)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white">{orcamento.cliente_nome}</h3>
                      <p className="text-sm text-white/60">{orcamento.obra}</p>
                      <p className="text-xs text-white/40 mt-1">
                        {new Date(orcamento.criado_em).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(orcamento.status)}`}>
                        {getStatusLabel(orcamento.status)}
                      </span>
                      <p className="text-xl font-bold text-green-400 mt-2">
                        R$ {orcamento.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      <OrcamentoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        orcamento={selectedOrcamento}
        empresaId={empresaId}
        onSuccess={loadOrcamentos}
      />
    </div>
  );
}


// ══════════════════════════════════════════════════════════════
// PAGINA: HISTORICO DE CORES DO CLIENTE
// ══════════════════════════════════════════════════════════════
export function HistoricoCoresPage({ user }) {
  const [clientes, setClientes] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const empresaId = user?.empresa_id;

  useEffect(() => {
    loadClientes();
  }, [empresaId]);

  const loadClientes = async () => {
    try {
      setLoading(true);
      // Carregar clientes com historico de cores
      // Por enquanto, dados exemplo
      setClientes([
        {
          id: 1,
          nome: 'Joao Silva',
          telefone: '11999998888',
          historico: [
            { data: '2024-01-15', obra: 'Sala de estar', cor: 'Branco Neve', codigo: 'W001', hex: '#FFFFFF', tinta: 'Suvinil Fosco Premium', volume: '18L' },
            { data: '2024-01-15', obra: 'Sala de estar', cor: 'Palha', codigo: 'Y001', hex: '#F5DEB3', tinta: 'Suvinil Acrilica', volume: '3.6L' },
            { data: '2023-08-20', obra: 'Quarto casal', cor: 'Cinza Claro', codigo: 'G001', hex: '#D3D3D3', tinta: 'Coral Rende Muito', volume: '18L' }
          ]
        },
        {
          id: 2,
          nome: 'Maria Santos',
          telefone: '11988887777',
          historico: [
            { data: '2024-02-10', obra: 'Fachada', cor: 'Branco Gelo', codigo: 'W002', hex: '#F5F5F5', tinta: 'Coral Protecao Sol e Chuva', volume: '18L' }
          ]
        }
      ]);
    } catch (err) {
      console.error('Erro ao carregar clientes:', err);
    } finally {
      setLoading(false);
    }
  };

  const clientesFiltrados = clientes.filter(c =>
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.telefone.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-black p-6 space-y-6">
      {/* Header */}
      <Card className="card-glass border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <History className="h-6 w-6 text-purple-400" />
                Historico de Cores
              </CardTitle>
              <CardDescription className="text-white/60">
                Consulte cores ja compradas por cada cliente
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Clientes */}
        <Card className="card-glass border-white/10 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-white text-lg">Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
              </div>
            ) : (
              <div className="space-y-2">
                {clientesFiltrados.map((cliente) => (
                  <div
                    key={cliente.id}
                    onClick={() => setSelectedCliente(cliente)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      selectedCliente?.id === cliente.id
                        ? 'bg-purple-500/20 border border-purple-500/30'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <p className="font-medium text-white">{cliente.nome}</p>
                    <p className="text-sm text-white/60">{cliente.telefone}</p>
                    <p className="text-xs text-purple-400 mt-1">
                      {cliente.historico.length} {cliente.historico.length === 1 ? 'cor' : 'cores'} registradas
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Historico do Cliente */}
        <Card className="card-glass border-white/10 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white text-lg">
              {selectedCliente ? `Historico de ${selectedCliente.nome}` : 'Selecione um cliente'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedCliente ? (
              <div className="text-center py-12 text-white/40">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Selecione um cliente para ver o historico de cores</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedCliente.historico.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl"
                  >
                    <div
                      className="w-14 h-14 rounded-lg border-2 border-white/20 shadow-lg flex-shrink-0"
                      style={{ backgroundColor: item.hex }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{item.cor}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                          {item.codigo}
                        </span>
                      </div>
                      <p className="text-sm text-white/60">{item.tinta} - {item.volume}</p>
                      <p className="text-xs text-white/40 mt-1">{item.obra}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-white/60">
                        {new Date(item.data).toLocaleDateString('pt-BR')}
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="mt-1"
                        onClick={() => navigator.clipboard.writeText(item.codigo)}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copiar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


// ══════════════════════════════════════════════════════════════
// EXPORTS
// ══════════════════════════════════════════════════════════════
export default {
  CatalogoTintasPage,
  PaletaCoresPage,
  CalculadoraRendimentoPage,
  OrcamentosPage,
  HistoricoCoresPage
};
