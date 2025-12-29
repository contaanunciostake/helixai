/**
 * ══════════════════════════════════════════════════════════════
 * LOJA VIRTUAL - Gerenciamento da Loja Pública
 * Permite configurar e gerenciar a loja virtual pública
 * Similar a iFood/AnotaAi
 * ══════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import {
  Store, Link, Copy, ExternalLink, Eye, EyeOff, Settings, Image,
  Palette, MapPin, Clock, Truck, DollarSign, Package, CheckCircle,
  AlertCircle, Loader2, Share2, QrCode, RefreshCw, ShoppingBag,
  Phone, Globe, Instagram, Facebook, MessageSquare, Star, Camera,
  Upload, Trash2, Edit, Save, X
} from 'lucide-react';

// URL do Backend
const getBackendUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined' &&
      (window.location.hostname.includes('onrender.com') || window.location.hostname.includes('render.com'))) {
    return 'https://vendefacil-backend.onrender.com';
  }
  return 'http://localhost:5000';
};

const API_URL = getBackendUrl();

// URL da Loja Pública
const getLojaPublicaUrl = () => {
  if (typeof window !== 'undefined' &&
      (window.location.hostname.includes('onrender.com') || window.location.hostname.includes('render.com'))) {
    return 'https://vendefacil-backend.onrender.com';
  }
  return 'http://localhost:5000';
};

const LOJA_BASE_URL = getLojaPublicaUrl();

export default function LojaVirtual({ user }) {
  const [config, setConfig] = useState({
    slug: '',
    logo_url: '',
    banner_url: '',
    cor_primaria: '#22C55E',
    cor_secundaria: '#16A34A',
    loja_publica_ativa: false,
    descricao_curta: '',
    descricao_longa: '',
    taxa_entrega: 0,
    pedido_minimo: 0,
    tempo_entrega: '30-60 min',
    raio_entrega_km: 10,
    aceita_retirada: true,
    aceita_entrega: true,
    horario_abertura: '08:00',
    horario_fechamento: '22:00',
    dias_funcionamento: ['seg', 'ter', 'qua', 'qui', 'sex', 'sab'],
    whatsapp_numero: '',
    instagram: '',
    facebook: '',
    avaliacao_media: 0,
    total_avaliacoes: 0
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [loadingProdutos, setLoadingProdutos] = useState(true);
  const [copied, setCopied] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [categorias, setCategorias] = useState([]);

  const empresaId = user?.empresa_id;

  // Carregar dados
  useEffect(() => {
    if (empresaId) {
      loadConfig();
      loadProdutos();
      loadCategorias();
    }
  }, [empresaId]);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/loja-virtual/config?empresa_id=${empresaId}`, {
        headers: { 'X-Empresa-ID': empresaId?.toString() }
      });
      const data = await response.json();
      if (data.success && data.config) {
        setConfig(prev => ({ ...prev, ...data.config }));
      }
    } catch (err) {
      console.error('Erro ao carregar config da loja:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProdutos = async () => {
    try {
      setLoadingProdutos(true);
      const response = await fetch(`${API_URL}/api/produtos/listar?empresa_id=${empresaId}`, {
        headers: { 'X-Empresa-ID': empresaId?.toString() }
      });
      const data = await response.json();
      if (data.success) {
        const produtosList = data.data?.produtos || data.produtos || [];
        setProdutos(produtosList);
      }
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
    } finally {
      setLoadingProdutos(false);
    }
  };

  const loadCategorias = async () => {
    try {
      const response = await fetch(`${API_URL}/api/loja-virtual/categorias?empresa_id=${empresaId}`, {
        headers: { 'X-Empresa-ID': empresaId?.toString() }
      });
      const data = await response.json();
      if (data.success) {
        setCategorias(data.categorias || []);
      }
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      const response = await fetch(`${API_URL}/api/loja-virtual/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Empresa-ID': empresaId?.toString()
        },
        body: JSON.stringify({ ...config, empresa_id: empresaId })
      });
      const data = await response.json();
      if (data.success) {
        setSaveMessage({ type: 'success', text: 'Configurações da loja salvas!' });
        if (data.slug) {
          setConfig(prev => ({ ...prev, slug: data.slug }));
        }
      } else {
        setSaveMessage({ type: 'error', text: data.error || 'Erro ao salvar' });
      }
    } catch (err) {
      setSaveMessage({ type: 'error', text: 'Erro ao salvar configurações' });
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(null), 4000);
    }
  };

  const handleToggleLoja = async () => {
    const novoStatus = !config.loja_publica_ativa;
    setConfig(prev => ({ ...prev, loja_publica_ativa: novoStatus }));

    try {
      await fetch(`${API_URL}/api/loja-virtual/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Empresa-ID': empresaId?.toString()
        },
        body: JSON.stringify({ empresa_id: empresaId, ativa: novoStatus })
      });
      setSaveMessage({
        type: 'success',
        text: novoStatus ? 'Loja ativada!' : 'Loja desativada'
      });
    } catch (err) {
      setConfig(prev => ({ ...prev, loja_publica_ativa: !novoStatus }));
      setSaveMessage({ type: 'error', text: 'Erro ao alterar status' });
    }
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const toggleDia = (dia) => {
    setConfig(prev => {
      const dias = prev.dias_funcionamento || [];
      if (dias.includes(dia)) {
        return { ...prev, dias_funcionamento: dias.filter(d => d !== dia) };
      }
      return { ...prev, dias_funcionamento: [...dias, dia] };
    });
  };

  const copyLink = () => {
    const url = `${LOJA_BASE_URL}/loja/${config.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openLoja = () => {
    window.open(`${LOJA_BASE_URL}/loja/${config.slug}`, '_blank');
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

  // Contar produtos ativos
  const produtosAtivos = produtos.filter(p => p.disponivel_loja !== false && p.estoque > 0).length;
  const categoriasUnicas = [...new Set(produtos.map(p => p.categoria).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Store className="h-7 w-7 text-emerald-400" />
            Loja Virtual
          </h1>
          <p className="text-gray-400 mt-1">Configure sua loja pública estilo iFood</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {config.slug && (
            <>
              <Button
                variant="outline"
                onClick={copyLink}
                className="border-white/20 text-white hover:bg-white/10"
              >
                {copied ? <CheckCircle className="h-4 w-4 mr-2 text-green-400" /> : <Copy className="h-4 w-4 mr-2" />}
                {copied ? 'Copiado!' : 'Copiar Link'}
              </Button>
              <Button
                variant="outline"
                onClick={openLoja}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver Loja
              </Button>
            </>
          )}
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
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Mensagem */}
      {saveMessage && (
        <div className={`rounded-xl p-4 ${saveMessage.type === 'success' ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
          <div className={`flex items-center gap-2 ${saveMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
            {saveMessage.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            {saveMessage.text}
          </div>
        </div>
      )}

      {/* Status e Link da Loja */}
      <Card className="card-glass border-white/10 overflow-hidden">
        <div className={`h-2 ${config.loja_publica_ativa ? 'bg-gradient-to-r from-emerald-500 to-green-500' : 'bg-gradient-to-r from-gray-500 to-gray-600'}`} />
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`h-16 w-16 rounded-2xl flex items-center justify-center ${config.loja_publica_ativa ? 'bg-emerald-500/20' : 'bg-gray-500/20'}`}>
                {config.loja_publica_ativa ? (
                  <Eye className="h-8 w-8 text-emerald-400" />
                ) : (
                  <EyeOff className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {config.loja_publica_ativa ? 'Loja Ativa' : 'Loja Desativada'}
                </h3>
                <p className="text-gray-400 text-sm">
                  {config.loja_publica_ativa
                    ? 'Sua loja está visível para clientes'
                    : 'Ative para que clientes vejam sua loja'}
                </p>
                {config.slug && (
                  <div className="flex items-center gap-2 mt-2">
                    <Link className="h-4 w-4 text-emerald-400" />
                    <code className="text-emerald-400 text-sm bg-emerald-500/10 px-2 py-0.5 rounded">
                      {LOJA_BASE_URL}/loja/{config.slug}
                    </code>
                  </div>
                )}
              </div>
            </div>
            <Button
              onClick={handleToggleLoja}
              className={config.loja_publica_ativa
                ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30'
                : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30'}
            >
              {config.loja_publica_ativa ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Desativar Loja
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Ativar Loja
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-glass border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{produtosAtivos}</p>
                <p className="text-xs text-gray-400">Produtos na loja</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-glass border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{categoriasUnicas.length}</p>
                <p className="text-xs text-gray-400">Categorias</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-glass border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <Star className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{config.avaliacao_media?.toFixed(1) || '0.0'}</p>
                <p className="text-xs text-gray-400">{config.total_avaliacoes || 0} avaliações</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-glass border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">R$ {config.pedido_minimo?.toFixed(2) || '0,00'}</p>
                <p className="text-xs text-gray-400">Pedido mínimo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Identidade Visual */}
        <Card className="card-glass border-white/10">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-white flex items-center gap-2">
              <Image className="h-5 w-5 text-pink-400" />
              Identidade Visual
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Slug da Loja (URL)</label>
              <Input
                value={config.slug}
                onChange={(e) => handleChange('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="minha-loja"
                className="bg-white/5 border-white/10 text-white"
              />
              <p className="text-xs text-gray-500 mt-1">Apenas letras minúsculas, números e hífen</p>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">URL do Logo</label>
              <Input
                value={config.logo_url}
                onChange={(e) => handleChange('logo_url', e.target.value)}
                placeholder="https://exemplo.com/logo.png"
                className="bg-white/5 border-white/10 text-white"
              />
              {config.logo_url && (
                <div className="mt-2 p-2 bg-white/5 rounded-lg inline-block">
                  <img src={config.logo_url} alt="Logo" className="h-16 w-16 object-contain" />
                </div>
              )}
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">URL do Banner</label>
              <Input
                value={config.banner_url}
                onChange={(e) => handleChange('banner_url', e.target.value)}
                placeholder="https://exemplo.com/banner.jpg"
                className="bg-white/5 border-white/10 text-white"
              />
              {config.banner_url && (
                <div className="mt-2 rounded-lg overflow-hidden">
                  <img src={config.banner_url} alt="Banner" className="w-full h-24 object-cover" />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Cor Primária</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={config.cor_primaria}
                    onChange={(e) => handleChange('cor_primaria', e.target.value)}
                    className="h-10 w-14 rounded cursor-pointer bg-transparent"
                  />
                  <Input
                    value={config.cor_primaria}
                    onChange={(e) => handleChange('cor_primaria', e.target.value)}
                    className="bg-white/5 border-white/10 text-white flex-1"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Cor Secundária</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={config.cor_secundaria}
                    onChange={(e) => handleChange('cor_secundaria', e.target.value)}
                    className="h-10 w-14 rounded cursor-pointer bg-transparent"
                  />
                  <Input
                    value={config.cor_secundaria}
                    onChange={(e) => handleChange('cor_secundaria', e.target.value)}
                    className="bg-white/5 border-white/10 text-white flex-1"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Descrições */}
        <Card className="card-glass border-white/10">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-white flex items-center gap-2">
              <Globe className="h-5 w-5 text-cyan-400" />
              Descrições e Contato
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Descrição Curta (para listagem)</label>
              <Input
                value={config.descricao_curta}
                onChange={(e) => handleChange('descricao_curta', e.target.value)}
                placeholder="Distribuidora de lubrificantes e filtros"
                maxLength={100}
                className="bg-white/5 border-white/10 text-white"
              />
              <p className="text-xs text-gray-500 mt-1">{config.descricao_curta?.length || 0}/100</p>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Descrição Completa</label>
              <textarea
                value={config.descricao_longa}
                onChange={(e) => handleChange('descricao_longa', e.target.value)}
                placeholder="Conte mais sobre sua empresa..."
                rows={3}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">WhatsApp</label>
                <Input
                  value={config.whatsapp_numero}
                  onChange={(e) => handleChange('whatsapp_numero', e.target.value)}
                  placeholder="5511999999999"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Instagram</label>
                <Input
                  value={config.instagram}
                  onChange={(e) => handleChange('instagram', e.target.value)}
                  placeholder="@minhaloja"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Entrega */}
        <Card className="card-glass border-white/10">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-white flex items-center gap-2">
              <Truck className="h-5 w-5 text-orange-400" />
              Configurações de Entrega
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.aceita_entrega}
                  onChange={(e) => handleChange('aceita_entrega', e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-white/5"
                />
                <span className="text-white">Aceita Entrega</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.aceita_retirada}
                  onChange={(e) => handleChange('aceita_retirada', e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-white/5"
                />
                <span className="text-white">Aceita Retirada</span>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Taxa de Entrega (R$)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={config.taxa_entrega}
                  onChange={(e) => handleChange('taxa_entrega', parseFloat(e.target.value) || 0)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Pedido Mínimo (R$)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={config.pedido_minimo}
                  onChange={(e) => handleChange('pedido_minimo', parseFloat(e.target.value) || 0)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Tempo de Entrega</label>
                <Input
                  value={config.tempo_entrega}
                  onChange={(e) => handleChange('tempo_entrega', e.target.value)}
                  placeholder="30-60 min"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Raio de Entrega (km)</label>
                <Input
                  type="number"
                  value={config.raio_entrega_km}
                  onChange={(e) => handleChange('raio_entrega_km', parseInt(e.target.value) || 0)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Horário de Funcionamento */}
        <Card className="card-glass border-white/10">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-400" />
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
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      (config.dias_funcionamento || []).includes(dia.id)
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {dia.label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Produtos da Loja */}
      <Card className="card-glass border-white/10">
        <CardHeader className="border-b border-white/10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Package className="h-5 w-5 text-emerald-400" />
              Produtos na Loja ({produtosAtivos} de {produtos.length})
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.hash = '#/importar-produtos'}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Upload className="h-4 w-4 mr-2" />
              Importar Produtos
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {loadingProdutos ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 text-emerald-400 animate-spin" />
            </div>
          ) : produtos.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Nenhum produto cadastrado</h3>
              <p className="text-gray-400 mb-4">Importe produtos via Excel para exibir na sua loja</p>
              <Button
                onClick={() => window.location.hash = '#/importar-produtos'}
                className="bg-gradient-to-r from-emerald-500 to-green-600"
              >
                <Upload className="h-4 w-4 mr-2" />
                Importar Produtos
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {produtos.slice(0, 20).map(produto => (
                <div
                  key={produto.id}
                  className={`p-3 rounded-xl border transition-all ${
                    produto.disponivel_loja !== false && produto.estoque > 0
                      ? 'bg-white/5 border-white/10 hover:border-emerald-500/50'
                      : 'bg-white/5 border-white/10 opacity-50'
                  }`}
                >
                  <div className="aspect-square bg-white/5 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                    {produto.imagem_url ? (
                      <img src={produto.imagem_url} alt={produto.nome} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="h-8 w-8 text-gray-600" />
                    )}
                  </div>
                  <h4 className="text-white text-sm font-medium truncate">{produto.nome}</h4>
                  <p className="text-emerald-400 font-bold text-sm">
                    R$ {produto.preco?.toFixed(2)?.replace('.', ',')}
                  </p>
                  <p className="text-xs text-gray-500">
                    Estoque: {produto.estoque || 0}
                  </p>
                </div>
              ))}
            </div>
          )}
          {produtos.length > 20 && (
            <div className="text-center mt-4">
              <p className="text-gray-400 text-sm">
                Mostrando 20 de {produtos.length} produtos
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
