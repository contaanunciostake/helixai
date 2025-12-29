/**
 * Modal de Tinta - CRUD completo para Loja de Tintas
 * Adicionar, Editar e Visualizar tintas com campos especificos
 */

import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import {
  Loader2, Save, X, Paintbrush, DollarSign, Boxes, Palette,
  Droplets, Layers, Home, Sun, Tag
} from 'lucide-react';

import {
  TIPOS_TINTA, ACABAMENTOS, BASES, LINHAS, AMBIENTES, VOLUMES, MARCAS_TINTAS, CORES_POPULARES
} from '../TintasPages.jsx';

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

export default function TintaModal({
  isOpen,
  onClose,
  mode = 'create',
  tinta = null,
  empresaId,
  onSuccess
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('info');

  const [formData, setFormData] = useState({
    // Informacoes basicas
    nome: '',
    descricao: '',
    sku: '',

    // Tipo e caracteristicas
    tipo: 'acrilica',
    acabamento: 'fosco',
    base: 'agua',
    linha: 'standard',
    ambiente: 'interno_externo',

    // Cor
    cor: '',
    codigo_cor: '',
    hex_cor: '#FFFFFF',

    // Marca e volume
    marca: '',
    volume: 18,

    // Rendimento e aplicacao
    rendimento_m2: 10,
    tempo_secagem: '1h ao toque',
    demaos: 2,
    diluente: 'Agua',

    // Preco e estoque
    preco: '',
    preco_promocional: '',
    estoque: '',
    estoque_minimo: 10,

    // Outros
    disponivel: true,
    palavras_chave: ''
  });

  // Preencher form quando editar/visualizar
  useEffect(() => {
    if (tinta && (mode === 'edit' || mode === 'view')) {
      // Extrair tipo da categoria (ex: "Tintas - Acrilica" -> "acrilica")
      let tipoExtraido = 'acrilica';
      if (tinta.categoria) {
        const match = tinta.categoria.match(/Tintas\s*-\s*(\w+)/i);
        if (match) tipoExtraido = match[1].toLowerCase();
        else if (tinta.categoria.toLowerCase().includes('esmalte')) tipoExtraido = 'esmalte';
        else if (tinta.categoria.toLowerCase().includes('verniz')) tipoExtraido = 'verniz';
        else if (tinta.categoria.toLowerCase().includes('textura')) tipoExtraido = 'textura';
        else if (tinta.categoria.toLowerCase().includes('latex')) tipoExtraido = 'latex';
      }

      setFormData({
        nome: tinta.nome || '',
        descricao: tinta.descricao || '',
        sku: tinta.sku || '',
        tipo: tipoExtraido,
        acabamento: tinta.subcategoria || tinta.acabamento || 'fosco',
        base: tinta.base || 'agua',
        linha: tinta.linha || 'standard',
        ambiente: tinta.aplicacao || tinta.ambiente || 'interno_externo',
        cor: tinta.cor || '',
        codigo_cor: tinta.codigo_cor || '',
        hex_cor: tinta.hex_cor || '#FFFFFF',
        marca: tinta.marca || '',
        volume: tinta.volume || 18,
        rendimento_m2: tinta.rendimento_m2 || 10,
        tempo_secagem: tinta.tempo_secagem || '1h ao toque',
        demaos: tinta.demaos || 2,
        diluente: tinta.diluente || 'Agua',
        preco: tinta.preco || '',
        preco_promocional: tinta.preco_promocional || '',
        estoque: tinta.estoque || '',
        estoque_minimo: tinta.estoque_minimo || 10,
        disponivel: tinta.disponivel !== false,
        palavras_chave: tinta.palavras_chave || ''
      });
    } else if (mode === 'create') {
      // Reset form
      setFormData({
        nome: '',
        descricao: '',
        sku: '',
        tipo: 'acrilica',
        acabamento: 'fosco',
        base: 'agua',
        linha: 'standard',
        ambiente: 'interno_externo',
        cor: '',
        codigo_cor: '',
        hex_cor: '#FFFFFF',
        marca: '',
        volume: 18,
        rendimento_m2: 10,
        tempo_secagem: '1h ao toque',
        demaos: 2,
        diluente: 'Agua',
        preco: '',
        preco_promocional: '',
        estoque: '',
        estoque_minimo: 10,
        disponivel: true,
        palavras_chave: ''
      });
    }
    setActiveTab('info');
  }, [tinta, mode, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCorSelect = (cor) => {
    setFormData(prev => ({
      ...prev,
      cor: cor.nome,
      codigo_cor: cor.codigo,
      hex_cor: cor.hex
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
        : `${API_URL}/api/produtos/${tinta.id}`;

      const method = mode === 'create' ? 'POST' : 'PUT';

      // Mapear campos do formulario para o modelo Produto
      const produtoData = {
        empresa_id: empresaId,
        nome: formData.nome,
        descricao: formData.descricao,
        categoria: formData.tipo ? `Tintas - ${formData.tipo.charAt(0).toUpperCase() + formData.tipo.slice(1)}` : 'Tintas',
        subcategoria: formData.acabamento,
        preco: parseFloat(formData.preco) || 0,
        preco_promocional: parseFloat(formData.preco_promocional) || null,
        estoque: parseInt(formData.estoque) || 0,
        disponivel: formData.disponivel,
        sku: formData.sku,
        marca: formData.marca,
        aplicacao: formData.ambiente,
        palavras_chave: [
          formData.nome,
          formData.tipo,
          formData.acabamento,
          formData.base,
          formData.marca,
          formData.cor,
          formData.palavras_chave
        ].filter(Boolean).join(', ').toLowerCase()
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Empresa-ID': empresaId?.toString()
        },
        body: JSON.stringify(produtoData)
      });

      const data = await response.json();

      if (data.success) {
        onSuccess && onSuccess();
        onClose();
      } else {
        setError(data.error || 'Erro ao salvar produto');
      }
    } catch (err) {
      console.error('Erro ao salvar tinta:', err);
      setError('Erro de conexao. Verifique se o servidor esta rodando.');
    } finally {
      setLoading(false);
    }
  };

  const isReadOnly = mode === 'view';
  const title = mode === 'create' ? 'Nova Tinta' : mode === 'edit' ? 'Editar Tinta' : 'Detalhes da Tinta';

  const tabs = [
    { id: 'info', label: 'Informacoes', icon: Tag },
    { id: 'tipo', label: 'Tipo e Acabamento', icon: Layers },
    { id: 'cor', label: 'Cor', icon: Palette },
    { id: 'preco', label: 'Preco e Estoque', icon: DollarSign }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0f1629] border-white/10 text-white max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Paintbrush className="h-5 w-5 text-purple-400" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {mode === 'create' ? 'Preencha os dados da nova tinta' :
             mode === 'edit' ? 'Altere os dados da tinta' :
             'Visualizando detalhes da tinta'}
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-white/5 rounded-lg">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4 p-1">
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Tab: Informacoes Basicas */}
            {activeTab === 'info' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Nome do Produto *</Label>
                    <Input
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      placeholder="Ex: Tinta Acrilica Premium Fosco"
                      className="bg-white/5 border-white/10 text-white"
                      required
                      disabled={isReadOnly}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">SKU/Codigo</Label>
                    <Input
                      name="sku"
                      value={formData.sku}
                      onChange={handleChange}
                      placeholder="Ex: TINT-ACR-001"
                      className="bg-white/5 border-white/10 text-white"
                      disabled={isReadOnly}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Descricao</Label>
                  <textarea
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleChange}
                    placeholder="Descricao detalhada do produto..."
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 min-h-[80px]"
                    disabled={isReadOnly}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Marca</Label>
                    <select
                      name="marca"
                      value={formData.marca}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                      disabled={isReadOnly}
                    >
                      <option value="">Selecione...</option>
                      {MARCAS_TINTAS.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Linha</Label>
                    <select
                      name="linha"
                      value={formData.linha}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                      disabled={isReadOnly}
                    >
                      {LINHAS.map(l => (
                        <option key={l.value} value={l.value}>{l.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Palavras-chave</Label>
                  <Input
                    name="palavras_chave"
                    value={formData.palavras_chave}
                    onChange={handleChange}
                    placeholder="tinta, acrilica, fosco, branco, parede"
                    className="bg-white/5 border-white/10 text-white"
                    disabled={isReadOnly}
                  />
                </div>
              </div>
            )}

            {/* Tab: Tipo e Acabamento */}
            {activeTab === 'tipo' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Tipo de Tinta</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {TIPOS_TINTA.map(tipo => (
                      <button
                        key={tipo.value}
                        type="button"
                        onClick={() => !isReadOnly && handleChange({ target: { name: 'tipo', value: tipo.value } })}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          formData.tipo === tipo.value
                            ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                        } ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}`}
                      >
                        <tipo.icon className="h-5 w-5 mb-1" />
                        <span className="text-sm font-medium">{tipo.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Acabamento</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {ACABAMENTOS.map(ac => (
                      <button
                        key={ac.value}
                        type="button"
                        onClick={() => !isReadOnly && handleChange({ target: { name: 'acabamento', value: ac.value } })}
                        className={`p-3 rounded-lg border text-center transition-all ${
                          formData.acabamento === ac.value
                            ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                        } ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}`}
                      >
                        <span className="text-sm font-medium block">{ac.label}</span>
                        <span className="text-xs text-white/40">{ac.description}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Base</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {BASES.map(base => (
                        <button
                          key={base.value}
                          type="button"
                          onClick={() => !isReadOnly && handleChange({ target: { name: 'base', value: base.value } })}
                          className={`p-3 rounded-lg border text-center transition-all ${
                            formData.base === base.value
                              ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                              : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                          } ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}`}
                        >
                          <Droplets className="h-5 w-5 mx-auto mb-1" />
                          <span className="text-sm font-medium block">{base.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Ambiente Indicado</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {AMBIENTES.map(amb => (
                        <button
                          key={amb.value}
                          type="button"
                          onClick={() => !isReadOnly && handleChange({ target: { name: 'ambiente', value: amb.value } })}
                          className={`p-2 rounded-lg border text-center transition-all ${
                            formData.ambiente === amb.value
                              ? 'bg-green-500/20 border-green-500/50 text-green-300'
                              : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                          } ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}`}
                        >
                          <amb.icon className="h-4 w-4 mx-auto mb-1" />
                          <span className="text-xs">{amb.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Volume (L)</Label>
                    <select
                      name="volume"
                      value={formData.volume}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                      disabled={isReadOnly}
                    >
                      {VOLUMES.map(v => (
                        <option key={v.value} value={v.value}>{v.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Rendimento (m2/L)</Label>
                    <Input
                      name="rendimento_m2"
                      type="number"
                      step="0.5"
                      value={formData.rendimento_m2}
                      onChange={handleChange}
                      className="bg-white/5 border-white/10 text-white"
                      disabled={isReadOnly}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Demaos</Label>
                    <select
                      name="demaos"
                      value={formData.demaos}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                      disabled={isReadOnly}
                    >
                      <option value={1}>1 demao</option>
                      <option value={2}>2 demaos</option>
                      <option value={3}>3 demaos</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Tempo de Secagem</Label>
                    <Input
                      name="tempo_secagem"
                      value={formData.tempo_secagem}
                      onChange={handleChange}
                      placeholder="Ex: 1h ao toque, 4h entre demaos"
                      className="bg-white/5 border-white/10 text-white"
                      disabled={isReadOnly}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Diluente</Label>
                    <select
                      name="diluente"
                      value={formData.diluente}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                      disabled={isReadOnly}
                    >
                      <option value="Agua">Agua</option>
                      <option value="Aguarras">Aguarras</option>
                      <option value="Thinner">Thinner</option>
                      <option value="Nao diluir">Nao diluir</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Cor */}
            {activeTab === 'cor' && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Nome da Cor</Label>
                    <Input
                      name="cor"
                      value={formData.cor}
                      onChange={handleChange}
                      placeholder="Ex: Branco Neve"
                      className="bg-white/5 border-white/10 text-white"
                      disabled={isReadOnly}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Codigo da Cor</Label>
                    <Input
                      name="codigo_cor"
                      value={formData.codigo_cor}
                      onChange={handleChange}
                      placeholder="Ex: W001"
                      className="bg-white/5 border-white/10 text-white"
                      disabled={isReadOnly}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Cor (HEX)</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        name="hex_cor"
                        value={formData.hex_cor}
                        onChange={handleChange}
                        className="h-10 w-14 rounded-lg border border-white/10 bg-transparent cursor-pointer"
                        disabled={isReadOnly}
                      />
                      <Input
                        value={formData.hex_cor}
                        onChange={(e) => handleChange({ target: { name: 'hex_cor', value: e.target.value } })}
                        className="bg-white/5 border-white/10 text-white flex-1"
                        disabled={isReadOnly}
                      />
                    </div>
                  </div>
                </div>

                {/* Preview da cor */}
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                  <div
                    className="w-20 h-20 rounded-xl border-2 border-white/20 shadow-lg"
                    style={{ backgroundColor: formData.hex_cor }}
                  />
                  <div>
                    <p className="text-lg font-semibold text-white">{formData.cor || 'Selecione uma cor'}</p>
                    <p className="text-sm text-white/60">Codigo: {formData.codigo_cor || '-'}</p>
                    <p className="text-sm text-white/60">HEX: {formData.hex_cor}</p>
                  </div>
                </div>

                {/* Cores pre-definidas */}
                {!isReadOnly && (
                  <div className="space-y-2">
                    <Label className="text-gray-300">Cores Populares (clique para selecionar)</Label>
                    <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-48 overflow-y-auto p-2 bg-white/5 rounded-lg">
                      {CORES_POPULARES.map((cor) => (
                        <button
                          key={cor.codigo}
                          type="button"
                          onClick={() => handleCorSelect(cor)}
                          className={`group relative aspect-square rounded-lg border-2 transition-all hover:scale-110 ${
                            formData.codigo_cor === cor.codigo
                              ? 'border-purple-500 ring-2 ring-purple-500/50'
                              : 'border-white/10 hover:border-white/30'
                          }`}
                          style={{ backgroundColor: cor.hex }}
                          title={`${cor.nome} (${cor.codigo})`}
                        >
                          <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 rounded-lg text-[10px] text-white font-medium">
                            {cor.codigo}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Preco e Estoque */}
            {activeTab === 'preco' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300 flex items-center gap-1">
                      <DollarSign className="h-4 w-4" /> Preco *
                    </Label>
                    <Input
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
                    <Label className="text-gray-300">Preco Promocional</Label>
                    <Input
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300 flex items-center gap-1">
                      <Boxes className="h-4 w-4" /> Estoque Atual
                    </Label>
                    <Input
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
                    <Label className="text-gray-300">Estoque Minimo</Label>
                    <Input
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

                <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg">
                  <input
                    type="checkbox"
                    id="disponivel"
                    name="disponivel"
                    checked={formData.disponivel}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500/50"
                    disabled={isReadOnly}
                  />
                  <Label htmlFor="disponivel" className="text-gray-300">Produto disponivel para venda</Label>
                </div>

                {/* Resumo do Produto */}
                <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                  <h3 className="font-semibold text-white mb-3">Resumo do Produto</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-white/60">Tipo:</div>
                    <div className="text-white">{TIPOS_TINTA.find(t => t.value === formData.tipo)?.label}</div>
                    <div className="text-white/60">Acabamento:</div>
                    <div className="text-white">{ACABAMENTOS.find(a => a.value === formData.acabamento)?.label}</div>
                    <div className="text-white/60">Base:</div>
                    <div className="text-white">{BASES.find(b => b.value === formData.base)?.label}</div>
                    <div className="text-white/60">Volume:</div>
                    <div className="text-white">{formData.volume}L</div>
                    <div className="text-white/60">Rendimento:</div>
                    <div className="text-white">{formData.rendimento_m2} m2/L</div>
                    <div className="text-white/60">Preco:</div>
                    <div className="text-green-400 font-semibold">
                      R$ {parseFloat(formData.preco || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        <DialogFooter className="mt-4">
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
                  {mode === 'create' ? 'Criar Tinta' : 'Salvar Alteracoes'}
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
