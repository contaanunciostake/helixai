/**
 * ════════════════════════════════════════════════════════════════
 * COMPONENTE: Sales - Dashboard de Vendas (Green Neon Design)
 * ════════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import {
  TrendingUp, TrendingDown, DollarSign, Users, Calendar, Award,
  Target, RefreshCw, AlertTriangle, Eye, Phone, ShoppingCart,
  Package, Percent, ArrowUpRight, ArrowDownRight, Activity, X, Mail,
  MapPin, Clock, User
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, FunnelChart, Funnel, PieChart, Pie,
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

export default function Sales({ user, botConfig, showNotification }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [periodo, setPeriodo] = useState(30);
  const [salesData, setSalesData] = useState(null);
  const [selectedSale, setSelectedSale] = useState(null);

  // Gerar dados de exemplo para demonstração
  const generateMockData = () => {
    const hoje = new Date();
    const vendasPorDia = [];
    const categorias = ['SUV', 'Sedan', 'Hatch', 'Pickup', 'Esportivo'];
    const vendedores = ['João Silva', 'Maria Santos', 'Pedro Oliveira', 'Ana Costa', 'Carlos Ferreira'];

    // Gerar vendas por dia
    for (let i = periodo - 1; i >= 0; i--) {
      const data = new Date(hoje);
      data.setDate(data.getDate() - i);
      vendasPorDia.push({
        data: data.toISOString().split('T')[0],
        quantidade: Math.floor(Math.random() * 8) + 2,
        valor: (Math.random() * 150000) + 50000
      });
    }

    // Calcular métricas gerais
    const totalVendas = vendasPorDia.reduce((acc, dia) => acc + dia.quantidade, 0);
    const valorTotal = vendasPorDia.reduce((acc, dia) => acc + dia.valor, 0);
    const ticketMedio = totalVendas > 0 ? valorTotal / totalVendas : 0;

    // Vendas por categoria
    const vendasPorCategoria = categorias.map(cat => ({
      categoria: cat,
      quantidade: Math.floor(Math.random() * 15) + 5,
      valor: (Math.random() * 300000) + 100000
    }));

    // Vendas por vendedor
    const vendasPorVendedor = vendedores.map(vendedor => {
      const quantidade = Math.floor(Math.random() * 12) + 3;
      const valorTotal = quantidade * ((Math.random() * 80000) + 40000);
      return {
        vendedor,
        quantidade,
        ticket_medio: valorTotal / quantidade,
        valor_total: valorTotal
      };
    }).sort((a, b) => b.valor_total - a.valor_total);

    // Vendas recentes
    const vendasRecentes = [];
    for (let i = 0; i < 10; i++) {
      const data = new Date(hoje);
      data.setDate(data.getDate() - i);
      vendasRecentes.push({
        id: i + 1,
        cliente: `Cliente ${i + 1}`,
        email: `cliente${i + 1}@email.com`,
        carro: categorias[Math.floor(Math.random() * categorias.length)] + ' ' + (2020 + Math.floor(Math.random() * 4)),
        valor: (Math.random() * 100000) + 30000,
        data: data.toISOString(),
        forma_pagamento: ['a_vista', 'financiado', 'consorcio'][Math.floor(Math.random() * 3)],
        vendedor: vendedores[Math.floor(Math.random() * vendedores.length)],
        telefone: '5511999999999',
        observacoes: 'Cliente interessado em troca. Possui um veículo 2018 para avaliação.'
      });
    }

    // Encontrar recorde do dia
    const recordeDia = vendasPorDia.reduce((max, dia) =>
      dia.valor > (max?.valor || 0) ? dia : max
    , null);

    // Métricas de performance
    const totalLeads = Math.floor(totalVendas * 4.5);
    const visitasRealizadas = Math.floor(totalVendas * 2.8);
    const taxaConversaoLeads = ((totalVendas / totalLeads) * 100).toFixed(1);
    const taxaConversaoVisitas = ((totalVendas / visitasRealizadas) * 100).toFixed(1);

    return {
      metricas_gerais: {
        total_vendas: totalVendas,
        valor_total: valorTotal,
        ticket_medio: ticketMedio,
        crescimento_periodo: ((Math.random() * 30) + 5).toFixed(1),
        roi: ((Math.random() * 200) + 150).toFixed(0)
      },
      funil: {
        total_leads: totalLeads,
        visitas_realizadas: visitasRealizadas,
        total_vendas: totalVendas,
        taxa_conversao_leads: parseFloat(taxaConversaoLeads),
        taxa_conversao_visitas: parseFloat(taxaConversaoVisitas)
      },
      recorde_dia: recordeDia ? {
        data: recordeDia.data,
        quantidade: recordeDia.quantidade,
        valor_total: recordeDia.valor
      } : null,
      vendas_por_dia: vendasPorDia,
      vendas_por_categoria: vendasPorCategoria,
      vendas_por_vendedor: vendasPorVendedor.slice(0, 5),
      vendas_recentes: vendasRecentes,
      performance_radar: categorias.map(cat => ({
        categoria: cat,
        vendas: Math.floor(Math.random() * 100) + 20,
        satisfacao: Math.floor(Math.random() * 40) + 60,
        margemLucro: Math.floor(Math.random() * 30) + 20
      }))
    };
  };

  useEffect(() => {
    loadSalesData();

    // Auto-refresh a cada 60 segundos
    const interval = setInterval(() => {
      loadSalesData(true);
    }, 60000);

    return () => clearInterval(interval);
  }, [user, periodo]);

  const loadSalesData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      const empresaId = user?.empresa_id || 5;

      try {
        const response = await fetch(`${botConfig.apiUrl}/api/sales/${empresaId}?periodo=${periodo}`);
        const data = await response.json();

        if (data.success && data.data) {
          setSalesData(data.data);
        } else {
          console.log('[SALES] Usando dados de exemplo');
          setSalesData(generateMockData());
        }
      } catch (apiError) {
        console.log('[SALES] API indisponível, usando dados de exemplo');
        setSalesData(generateMockData());
      }
    } catch (error) {
      console.error('[SALES] Erro:', error);
      setSalesData(generateMockData());
      if (!silent) {
        showNotification('Usando dados de exemplo para demonstração');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short'
    });
  };

  const formatDateTime = (datetime) => {
    return new Date(datetime).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleWhatsApp = (telefone, nome) => {
    const mensagem = `Olá ${nome}! Tudo bem?`;
    const url = `https://wa.me/${telefone.replace(/\D/g, '')}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  };

  const openSaleDetails = (venda) => {
    setSelectedSale(venda);
  };

  const closeSaleDetails = () => {
    setSelectedSale(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-12">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-green-500 animate-spin mx-auto mb-4" />
          <p className="text-green-400">Carregando dados de vendas...</p>
        </div>
      </div>
    );
  }

  if (!salesData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-12">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-400">Erro ao carregar dados</p>
        </div>
      </div>
    );
  }

  const {
    metricas_gerais,
    funil,
    recorde_dia,
    vendas_por_dia,
    vendas_por_categoria,
    vendas_por_vendedor,
    vendas_recentes,
    performance_radar
  } = salesData;

  // Cores para gráficos - paleta verde neon
  const COLORS = ['#10b981', '#059669', '#047857', '#065f46', '#064e3b'];

  return (
    <div className="min-h-screen bg-black p-6 space-y-6 relative">
      {/* Animated Stars Background */}
      {Array.from({ length: 100 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full pointer-events-none"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite ${Math.random() * 3}s`
          }}
        />
      ))}

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl card-glass">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5"></div>
        <div className="relative p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                Dashboard de Vendas
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Métricas e análises detalhadas dos últimos {periodo} dias
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Filtro de Período */}
              <div className="flex gap-2">
                <Button
                  onClick={() => setPeriodo(7)}
                  size="sm"
                  className={periodo === 7 ? 'btn-primary-neon' : 'btn-secondary'}
                >
                  7 dias
                </Button>
                <Button
                  onClick={() => setPeriodo(30)}
                  size="sm"
                  className={periodo === 30 ? 'btn-primary-neon' : 'btn-secondary'}
                >
                  30 dias
                </Button>
                <Button
                  onClick={() => setPeriodo(90)}
                  size="sm"
                  className={periodo === 90 ? 'btn-primary-neon' : 'btn-secondary'}
                >
                  90 dias
                </Button>
              </div>
              <Button
                onClick={() => loadSalesData()}
                disabled={refreshing}
                className="btn-primary-neon"
              >
                {refreshing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Atualizar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total de Vendas */}
        <div className="metric-card">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5"></div>
          <div className="relative p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total de Vendas</p>
                <h3 className="text-3xl font-bold text-white mt-1">{metricas_gerais.total_vendas}</h3>
                <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  concluídas
                </p>
              </div>
              <div className="metric-icon">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Valor Total */}
        <div className="metric-card">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5"></div>
          <div className="relative p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Faturamento</p>
                <h3 className="text-2xl font-bold text-white mt-1">
                  {formatPrice(metricas_gerais.valor_total)}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  em {periodo} dias
                </p>
              </div>
              <div className="metric-icon">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Ticket Médio */}
        <div className="metric-card">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5"></div>
          <div className="relative p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Ticket Médio</p>
                <h3 className="text-2xl font-bold text-white mt-1">
                  {formatPrice(metricas_gerais.ticket_medio)}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  por venda
                </p>
              </div>
              <div className="metric-icon">
                <Target className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Taxa de Conversão */}
        <div className="metric-card">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5"></div>
          <div className="relative p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Conversão</p>
                <h3 className="text-3xl font-bold text-white mt-1">
                  {funil.taxa_conversao_visitas}%
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  visitas → vendas
                </p>
              </div>
              <div className="metric-icon">
                <Percent className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Crescimento */}
        <div className="metric-card">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5"></div>
          <div className="relative p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Crescimento</p>
                <h3 className="text-3xl font-bold text-white mt-1">
                  +{metricas_gerais.crescimento_periodo}%
                </h3>
                <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3" />
                  vs período anterior
                </p>
              </div>
              <div className="metric-icon">
                <Activity className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* ROI */}
        <div className="metric-card">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5"></div>
          <div className="relative p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">ROI</p>
                <h3 className="text-3xl font-bold text-white mt-1">
                  {metricas_gerais.roi}%
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  retorno investido
                </p>
              </div>
              <div className="metric-icon">
                <Award className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recorde de Vendas */}
      {recorde_dia && (
        <div className="relative overflow-hidden rounded-xl card-glass border-green-500/30">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/10"></div>
          <div className="relative p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-500/20 rounded-full p-4 border border-green-500/30">
                <Award className="h-8 w-8 text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg">Recorde de Vendas em um Dia</h3>
                <p className="text-gray-300 text-sm mt-1">
                  {formatDate(recorde_dia.data)} - {recorde_dia.quantidade} vendas totalizando{' '}
                  <span className="text-green-400 font-semibold">{formatPrice(recorde_dia.valor_total)}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gráficos - Linha 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Área - Evolução do Faturamento */}
        <div className="relative overflow-hidden rounded-2xl card-glass">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
          <div className="relative">
            <div className="p-6 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">Evolução do Faturamento</h3>
              <p className="text-gray-400 text-sm mt-1">
                Receita diária nos últimos {periodo} dias
              </p>
            </div>
            <div className="p-6">
              {vendas_por_dia && vendas_por_dia.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={vendas_por_dia}>
                    <defs>
                      <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="data"
                      tickFormatter={formatDate}
                      stroke="#9ca3af"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#f3f4f6'
                      }}
                      labelFormatter={formatDate}
                      formatter={(value) => [formatPrice(value), 'Faturamento']}
                    />
                    <Area
                      type="monotone"
                      dataKey="valor"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorValor)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400">Nenhuma venda no período</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Gráfico de Vendas por Dia (Quantidade) */}
        <div className="relative overflow-hidden rounded-2xl card-glass">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
          <div className="relative">
            <div className="p-6 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">Vendas por Dia</h3>
              <p className="text-gray-400 text-sm mt-1">
                Quantidade de vendas nos últimos {periodo} dias
              </p>
            </div>
            <div className="p-6">
              {vendas_por_dia && vendas_por_dia.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={vendas_por_dia}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="data"
                      tickFormatter={formatDate}
                      stroke="#9ca3af"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#f3f4f6'
                      }}
                      labelFormatter={formatDate}
                      formatter={(value) => [value, 'Vendas']}
                    />
                    <Bar dataKey="quantidade" fill="#10b981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400">Nenhuma venda no período</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ranking de Vendedores e Vendas Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Vendedores */}
        <div className="relative overflow-hidden rounded-2xl card-glass">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
          <div className="relative">
            <div className="p-6 border-b border-white/10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Award className="h-5 w-5 text-green-400" />
                Top Vendedores
              </h3>
              <p className="text-gray-400 text-sm mt-1">
                Ranking por valor total de vendas nos últimos {periodo} dias
              </p>
            </div>
            <div className="p-6">
              {vendas_por_vendedor && vendas_por_vendedor.length > 0 ? (
                <div className="space-y-3">
                  {vendas_por_vendedor.map((vendedor, index) => (
                    <div
                      key={index}
                      className="relative overflow-hidden card-glass-small rounded-lg p-4 hover:border-green-500/50 transition-all"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-800/30 to-gray-900/20"></div>
                      <div className="relative flex items-center gap-3">
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-xl ${
                          index === 0 ? 'bg-yellow-500/20 text-yellow-400 border-2 border-yellow-500/50' :
                          index === 1 ? 'bg-gray-500/20 text-gray-300 border-2 border-gray-500/50' :
                          index === 2 ? 'bg-orange-500/20 text-orange-400 border-2 border-orange-500/50' :
                          'bg-gray-700/20 text-gray-400 border border-gray-600/50'
                        }`}>
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-semibold">
                            {vendedor.vendedor}
                          </h4>
                          <p className="text-sm text-gray-400">
                            {vendedor.quantidade} vendas • Ticket médio: {formatPrice(vendedor.ticket_medio)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 font-bold text-lg">
                            {formatPrice(vendedor.valor_total)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">Nenhuma venda registrada</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Vendas Recentes */}
        <div className="relative overflow-hidden rounded-2xl card-glass">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
          <div className="relative">
            <div className="p-6 border-b border-white/10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-green-400" />
                Vendas Recentes
              </h3>
              <p className="text-gray-400 text-sm mt-1">
                Últimas vendas realizadas - Clique para ver detalhes
              </p>
            </div>
            <div className="p-6">
              {vendas_recentes && vendas_recentes.length > 0 ? (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {vendas_recentes.map((venda) => (
                    <div
                      key={venda.id}
                      onClick={() => openSaleDetails(venda)}
                      className="relative overflow-hidden card-glass-small rounded-lg p-3 hover:border-green-500/50 cursor-pointer transition-all"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-800/30 to-gray-900/20"></div>
                      <div className="relative">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="text-white font-medium text-sm">
                              {venda.cliente}
                            </h4>
                            <p className="text-xs text-gray-400 mt-1">{venda.carro}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-green-400 font-bold text-sm">{formatPrice(venda.valor)}</p>
                            <p className="text-xs text-gray-500 mt-1">{formatDate(venda.data)}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded font-medium ${
                              venda.forma_pagamento === 'a_vista'
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : venda.forma_pagamento === 'financiado'
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                            }`}>
                              {venda.forma_pagamento === 'a_vista' ? 'À Vista' :
                               venda.forma_pagamento === 'financiado' ? 'Financiado' : 'Consórcio'}
                            </span>
                            <span className="text-xs text-gray-500">• {venda.vendedor}</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleWhatsApp(venda.telefone, venda.cliente);
                            }}
                            className="text-green-400 hover:text-green-300 hover:bg-green-500/10 p-2 rounded-full transition-all"
                            title="Contatar via WhatsApp"
                          >
                            <Phone className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ShoppingCart className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">Nenhuma venda registrada</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Detalhes da Venda */}
      {selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-auto rounded-2xl card-glass">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5"></div>

            {/* Modal Header */}
            <div className="relative p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                  Detalhes da Venda
                </h3>
                <p className="text-gray-400 text-sm mt-1">Informações completas da transação</p>
              </div>
              <button
                onClick={closeSaleDetails}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="relative p-6 space-y-6">
              {/* Valor da Venda - Destaque */}
              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/30">
                <p className="text-gray-400 text-sm mb-2">Valor Total da Venda</p>
                <h2 className="text-4xl font-bold text-green-400">{formatPrice(selectedSale.valor)}</h2>
                <p className="text-gray-400 text-sm mt-2">{formatDateTime(selectedSale.data)}</p>
              </div>

              {/* Informações Principais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card-glass-small rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="h-5 w-5 text-green-400" />
                    <span className="text-gray-400 text-sm">Cliente</span>
                  </div>
                  <p className="text-white font-medium">{selectedSale.cliente}</p>
                </div>

                <div className="card-glass-small rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Phone className="h-5 w-5 text-green-400" />
                    <span className="text-gray-400 text-sm">Telefone</span>
                  </div>
                  <p className="text-white font-medium">{selectedSale.telefone}</p>
                </div>

                <div className="card-glass-small rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="h-5 w-5 text-green-400" />
                    <span className="text-gray-400 text-sm">Email</span>
                  </div>
                  <p className="text-white font-medium">{selectedSale.email || 'Não informado'}</p>
                </div>

                <div className="card-glass-small rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <ShoppingCart className="h-5 w-5 text-green-400" />
                    <span className="text-gray-400 text-sm">Veículo</span>
                  </div>
                  <p className="text-white font-medium">{selectedSale.carro}</p>
                </div>

                <div className="card-glass-small rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="h-5 w-5 text-green-400" />
                    <span className="text-gray-400 text-sm">Forma de Pagamento</span>
                  </div>
                  <p className="text-white font-medium">
                    {selectedSale.forma_pagamento === 'a_vista' ? 'À Vista' :
                     selectedSale.forma_pagamento === 'financiado' ? 'Financiado' : 'Consórcio'}
                  </p>
                </div>

                <div className="card-glass-small rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="h-5 w-5 text-green-400" />
                    <span className="text-gray-400 text-sm">Vendedor</span>
                  </div>
                  <p className="text-white font-medium">{selectedSale.vendedor}</p>
                </div>
              </div>

              {/* Observações */}
              {selectedSale.observacoes && (
                <div className="card-glass-small rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Eye className="h-5 w-5 text-green-400" />
                    <span className="text-gray-400 text-sm">Observações</span>
                  </div>
                  <p className="text-gray-300 text-sm">{selectedSale.observacoes}</p>
                </div>
              )}

              {/* Ações */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleWhatsApp(selectedSale.telefone, selectedSale.cliente)}
                  className="flex-1 btn-primary-neon py-3 rounded-lg font-medium"
                >
                  <Phone className="h-5 w-5 inline mr-2" />
                  Contatar Cliente
                </button>
                <button
                  onClick={closeSaleDetails}
                  className="px-6 py-3 rounded-lg font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Styles */}
      <style>{`
        .card-glass {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .card-glass-small {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(5px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .metric-card {
          position: relative;
          overflow: hidden;
          border-radius: 0.75rem;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }

        .metric-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 0 30px rgba(16, 185, 129, 0.3);
          border-color: rgba(16, 185, 129, 0.3);
        }

        .metric-icon {
          height: 3rem;
          width: 3rem;
          border-radius: 0.5rem;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
        }

        .btn-primary-neon {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
          color: white;
          transition: all 0.3s ease;
        }

        .btn-primary-neon:hover {
          box-shadow: 0 0 30px rgba(16, 185, 129, 0.6);
          transform: translateY(-2px);
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #9ca3af;
          transition: all 0.3s ease;
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }

        /* Scrollbar personalizada */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #10b981, #059669);
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #059669, #047857);
        }
      `}</style>
    </div>
  );
}
