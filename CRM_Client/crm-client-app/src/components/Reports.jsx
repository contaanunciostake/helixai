/**
 * ════════════════════════════════════════════════════════════════
 * COMPONENTE: Reports - Sistema Completo de Relatórios
 * Geração de relatórios PDF modernos com dados do banco
 * DESIGN: Verde Neon com Glass-morphism
 * ════════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import {
  FileText, Download, Calendar, Users, DollarSign, TrendingUp,
  Filter, FileSpreadsheet, FileDown, Clock, CheckCircle,
  BarChart3, PieChart, Activity, MessageSquare, Car, Building2,
  AlertCircle, Loader2, Sparkles
} from 'lucide-react';
import html2pdf from 'html2pdf.js';

export default function Reports({ user, botConfig, showNotification }) {
  const [selectedReport, setSelectedReport] = useState(null);
  const [periodFilter, setPeriodFilter] = useState('mensal');
  const [customDateStart, setCustomDateStart] = useState('');
  const [customDateEnd, setCustomDateEnd] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  // Tipos de relatórios disponíveis
  const reportTypes = [
    {
      id: 'clientes',
      title: 'Relatório de Clientes',
      description: 'Lista completa de clientes cadastrados com informações detalhadas',
      icon: Users,
      color: 'green',
      endpoint: 'customers'
    },
    {
      id: 'agendamentos',
      title: 'Relatório de Agendamentos',
      description: 'Histórico de agendamentos (visitas, test-drives, etc)',
      icon: Calendar,
      color: 'emerald',
      endpoint: 'appointments'
    },
    {
      id: 'financiamentos',
      title: 'Relatório de Financiamentos',
      description: 'Análise completa de propostas e financiamentos',
      icon: DollarSign,
      color: 'green',
      endpoint: 'financings'
    },
    {
      id: 'vendas',
      title: 'Relatório de Vendas',
      description: 'Desempenho de vendas e conversões por período',
      icon: TrendingUp,
      color: 'cyan',
      endpoint: 'financings' // Usar financings com filtro de aprovados
    },
    {
      id: 'performance',
      title: 'Relatório de Performance',
      description: 'KPIs e métricas de desempenho geral do sistema',
      icon: BarChart3,
      color: 'green',
      endpoint: 'performance'
    }
  ];

  // Gerar dados mock por tipo
  const generateMockDataByType = (reportType, startDate, endDate) => {
    const mockData = [];
    const numRecords = Math.floor(Math.random() * 20) + 10;

    for (let i = 0; i < numRecords; i++) {
      const randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));

      if (reportType === 'clientes') {
        mockData.push({
          nome: `Cliente ${i + 1}`,
          telefone: `(11) 9${Math.floor(Math.random() * 10000)}-${Math.floor(Math.random() * 10000)}`,
          email: `cliente${i + 1}@example.com`,
          data_criacao: randomDate,
          status: ['ativo', 'inativo'][Math.floor(Math.random() * 2)]
        });
      } else if (reportType === 'agendamentos') {
        mockData.push({
          nome: `Cliente ${i + 1}`,
          telefone: `(11) 9${Math.floor(Math.random() * 10000)}-${Math.floor(Math.random() * 10000)}`,
          tipo: ['test-drive', 'visita', 'avaliacao'][Math.floor(Math.random() * 3)],
          data: randomDate,
          status: ['pendente', 'confirmado', 'realizado', 'cancelado'][Math.floor(Math.random() * 4)]
        });
      } else if (reportType === 'financiamentos' || reportType === 'vendas') {
        mockData.push({
          nome: `Cliente ${i + 1}`,
          telefone: `(11) 9${Math.floor(Math.random() * 10000)}-${Math.floor(Math.random() * 10000)}`,
          valor_veiculo: Math.floor(Math.random() * 100000) + 30000,
          valor_entrada: Math.floor(Math.random() * 30000) + 5000,
          valor_financiado: Math.floor(Math.random() * 70000) + 20000,
          parcelas: [12, 24, 36, 48, 60][Math.floor(Math.random() * 5)],
          data_criacao: randomDate,
          status: ['aprovado', 'pendente', 'em-analise', 'reprovado'][Math.floor(Math.random() * 4)]
        });
      } else if (reportType === 'performance') {
        mockData.push({
          metrica: ['Taxa de Conversão', 'Tempo Médio de Resposta', 'Satisfação do Cliente'][i % 3],
          valor: Math.floor(Math.random() * 100),
          data: randomDate
        });
      }
    }

    return mockData;
  };

  // Calcular datas baseado no filtro de período
  const getDateRange = () => {
    const today = new Date();
    let startDate, endDate;

    switch (periodFilter) {
      case 'diario':
        startDate = new Date(today);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999);
        break;

      case 'semanal':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        endDate = today;
        break;

      case 'mensal':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;

      case 'personalizado':
        startDate = customDateStart ? new Date(customDateStart) : new Date();
        endDate = customDateEnd ? new Date(customDateEnd) : new Date();
        break;

      default:
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = today;
    }

    return { startDate, endDate };
  };

  // Gerar relatório
  const generateReport = async (reportType) => {
    setLoading(true);
    setSelectedReport(reportType);

    try {
      const empresaId = user?.empresa_id || 5;
      const { startDate, endDate } = getDateRange();

      console.log(`[REPORTS] Gerando relatório: ${reportType.title}`);
      console.log(`[REPORTS] Período: ${startDate.toLocaleDateString()} até ${endDate.toLocaleDateString()}`);

      let processedData = [];
      let usedMockData = false;

      // Tentar buscar dados reais primeiro (backend porta 5000)
      try {
        const backendUrl = 'http://localhost:5000';
        const response = await fetch(`${backendUrl}/api/${reportType.endpoint}/${empresaId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`[REPORTS] ✅ Dados reais recebidos:`, data);
          processedData = data.data || data || [];
        } else {
          throw new Error(`API retornou ${response.status}`);
        }
      } catch (apiError) {
        console.warn(`[REPORTS] ⚠️ API não disponível, usando dados de exemplo:`, apiError.message);
        // Gerar dados mock realistas
        processedData = generateMockDataByType(reportType.id, startDate, endDate);
        usedMockData = true;
      }

      // Filtrar por período
      processedData = filterDataByPeriod(processedData, startDate, endDate);

      // Processar específico por tipo
      if (reportType.id === 'vendas') {
        processedData = processedData.filter(item => item.status === 'aprovado');
      }

      // Calcular estatísticas
      const stats = calculateStatistics(processedData, reportType.id);

      setReportData({
        type: reportType,
        data: processedData,
        stats: stats,
        period: {
          filter: periodFilter,
          startDate,
          endDate
        },
        generatedAt: new Date(),
        totalRecords: processedData.length,
        isMock: usedMockData
      });

      if (usedMockData) {
        showNotification(`📊 Relatório gerado com ${processedData.length} registros de exemplo`);
      } else {
        showNotification(`✅ Relatório "${reportType.title}" gerado com ${processedData.length} registros reais!`);
      }
    } catch (error) {
      console.error('[REPORTS] ❌ Erro crítico ao gerar relatório:', error);
      showNotification('❌ Erro ao gerar relatório');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar dados por período
  const filterDataByPeriod = (data, startDate, endDate) => {
    if (!data || data.length === 0) return [];

    return data.filter(item => {
      const itemDate = new Date(item.data_criacao || item.data || item.created_at || new Date());
      return itemDate >= startDate && itemDate <= endDate;
    });
  };

  // Calcular estatísticas do relatório
  const calculateStatistics = (data, reportType) => {
    const stats = {
      total: data.length,
      periodo: periodFilter
    };

    if (reportType === 'financiamentos' || reportType === 'vendas') {
      const valorTotal = data.reduce((sum, item) => sum + (parseFloat(item.valor_veiculo) || 0), 0);
      const valorEntrada = data.reduce((sum, item) => sum + (parseFloat(item.valor_entrada) || 0), 0);
      const valorFinanciado = data.reduce((sum, item) => sum + (parseFloat(item.valor_financiado) || 0), 0);

      stats.valorTotal = valorTotal;
      stats.valorEntrada = valorEntrada;
      stats.valorFinanciado = valorFinanciado;
      stats.ticketMedio = data.length > 0 ? valorTotal / data.length : 0;

      // Status
      const porStatus = {};
      data.forEach(item => {
        const status = item.status || 'indefinido';
        porStatus[status] = (porStatus[status] || 0) + 1;
      });
      stats.porStatus = porStatus;
    }

    if (reportType === 'agendamentos') {
      const porStatus = {};
      const porTipo = {};

      data.forEach(item => {
        const status = item.status || 'indefinido';
        const tipo = item.tipo || 'indefinido';

        porStatus[status] = (porStatus[status] || 0) + 1;
        porTipo[tipo] = (porTipo[tipo] || 0) + 1;
      });

      stats.porStatus = porStatus;
      stats.porTipo = porTipo;
    }

    return stats;
  };

  // Exportar para Excel (CSV)
  const exportToExcel = () => {
    if (!reportData || !reportData.data) return;

    const csvContent = convertToCSV(reportData.data);
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio_${reportData.type.id}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    URL.revokeObjectURL(url);
    showNotification('📊 Relatório exportado para Excel!');
  };

  // Exportar para PDF
  const exportToPDF = () => {
    if (!reportData) return;

    showNotification('📄 Gerando PDF... Por favor aguarde.');

    const htmlContent = generateModernPDFHTML();

    // Criar elemento temporário
    const element = document.createElement('div');
    element.innerHTML = htmlContent;
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    document.body.appendChild(element);

    // Configurações do html2pdf
    const opt = {
      margin: 10,
      filename: `relatorio_${reportData.type.id}_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Gerar PDF e fazer download
    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(() => {
        document.body.removeChild(element);
        showNotification('✅ PDF gerado e baixado com sucesso!');
      })
      .catch((error) => {
        console.error('Erro ao gerar PDF:', error);
        document.body.removeChild(element);
        showNotification('❌ Erro ao gerar PDF');
      });
  };

  // Converter dados para CSV
  const convertToCSV = (data) => {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [];

    csvRows.push(headers.join(';'));

    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
      });
      csvRows.push(values.join(';'));
    });

    return csvRows.join('\n');
  };

  // Gerar HTML moderno para PDF
  const generateModernPDFHTML = () => {
    const { type, data, period, generatedAt, totalRecords, stats } = reportData;

    const formatCurrency = (value) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value || 0);
    };

    const formatDate = (date) => {
      if (!date) return '-';
      return new Date(date).toLocaleDateString('pt-BR');
    };

    // Gerar gráficos de status (barras visuais)
    const generateStatusBars = () => {
      if (!stats.porStatus) return '';

      const total = Object.values(stats.porStatus).reduce((a, b) => a + b, 0);
      const colors = {
        'aprovado': '#10b981',
        'pendente': '#f59e0b',
        'confirmado': '#3b82f6',
        'realizado': '#10b981',
        'cancelado': '#ef4444',
        'reprovado': '#ef4444',
        'em-analise': '#8b5cf6',
        'documentos-pendentes': '#f59e0b'
      };

      return Object.entries(stats.porStatus).map(([status, count]) => {
        const percentage = ((count / total) * 100).toFixed(1);
        const color = colors[status] || '#6b7280';

        return `
          <div style="margin-bottom: 15px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span style="font-weight: 600; text-transform: capitalize; color: #374151;">${status.replace('-', ' ')}</span>
              <span style="color: #6b7280;">${count} (${percentage}%)</span>
            </div>
            <div style="background: #e5e7eb; border-radius: 10px; overflow: hidden; height: 24px;">
              <div style="background: ${color}; height: 100%; width: ${percentage}%; display: flex; align-items: center; padding: 0 10px; color: white; font-size: 12px; font-weight: 600;">
                ${percentage}%
              </div>
            </div>
          </div>
        `;
      }).join('');
    };

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${type.title} - ${user?.empresa_nome || 'AIra CRM'}</title>
  <style>
    @page {
      size: A4;
      margin: 15mm;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #1f2937;
      line-height: 1.6;
      background: white;
      padding: 20px;
    }

    .header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 40px 30px;
      border-radius: 15px;
      margin-bottom: 30px;
      box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
    }

    .header h1 {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 10px;
      text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .header p {
      font-size: 16px;
      opacity: 0.95;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }

    .info-card {
      background: #ffffff;
      border: 2px solid #10b981;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(16, 185, 129, 0.1);
    }

    .info-card .label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .info-card .value {
      font-size: 24px;
      font-weight: 700;
      color: #10b981;
    }

    .stats-section {
      background: #f9fafb;
      border-radius: 15px;
      padding: 25px;
      margin-bottom: 30px;
      border: 2px solid #10b981;
    }

    .stats-section h2 {
      font-size: 20px;
      color: #1f2937;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
    }

    .stats-section h2::before {
      content: '📊';
      margin-right: 10px;
      font-size: 24px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin-bottom: 25px;
    }

    .stat-box {
      background: white;
      border: 2px solid #10b981;
      border-radius: 10px;
      padding: 15px;
      text-align: center;
    }

    .stat-box .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #10b981;
      margin-bottom: 5px;
    }

    .stat-box .stat-label {
      font-size: 11px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .table-container {
      background: white;
      border-radius: 15px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0,0,0,0.08);
      margin-bottom: 30px;
    }

    .table-header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 20px 25px;
      font-size: 18px;
      font-weight: 600;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    thead {
      background: #f9fafb;
    }

    th {
      padding: 15px;
      text-align: left;
      font-weight: 600;
      color: #374151;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #10b981;
    }

    td {
      padding: 12px 15px;
      border-bottom: 1px solid #f3f4f6;
      font-size: 13px;
    }

    tbody tr:hover {
      background: #f9fafb;
    }

    tbody tr:last-child td {
      border-bottom: none;
    }

    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-aprovado { background: #d1fae5; color: #065f46; }
    .status-pendente { background: #fef3c7; color: #92400e; }
    .status-confirmado { background: #dbeafe; color: #1e40af; }
    .status-realizado { background: #d1fae5; color: #065f46; }
    .status-cancelado { background: #fee2e2; color: #991b1b; }
    .status-reprovado { background: #fee2e2; color: #991b1b; }

    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #10b981;
      text-align: center;
      color: #6b7280;
      font-size: 12px;
    }

    .footer-logo {
      font-size: 20px;
      font-weight: 700;
      color: #10b981;
      margin-bottom: 10px;
    }

    .page-break {
      page-break-before: always;
    }

    @media print {
      body {
        padding: 0;
      }
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <!-- HEADER -->
  <div class="header">
    <h1>📄 ${type.title}</h1>
    <p>${type.description}</p>
  </div>

  <!-- INFO CARDS -->
  <div class="info-grid">
    <div class="info-card">
      <div class="label">📅 Período</div>
      <div class="value" style="font-size: 14px;">
        ${period.startDate.toLocaleDateString('pt-BR')}<br>até ${period.endDate.toLocaleDateString('pt-BR')}
      </div>
    </div>
    <div class="info-card">
      <div class="label">⏰ Gerado em</div>
      <div class="value" style="font-size: 14px;">
        ${generatedAt.toLocaleDateString('pt-BR')}<br>${generatedAt.toLocaleTimeString('pt-BR')}
      </div>
    </div>
    <div class="info-card">
      <div class="label">📊 Total de Registros</div>
      <div class="value">${totalRecords}</div>
    </div>
  </div>

  ${stats && (stats.valorTotal || stats.porStatus) ? `
  <!-- ESTATÍSTICAS -->
  <div class="stats-section">
    <h2>Estatísticas do Período</h2>

    ${stats.valorTotal ? `
    <div class="stats-grid">
      <div class="stat-box">
        <div class="stat-value">${formatCurrency(stats.valorTotal)}</div>
        <div class="stat-label">Valor Total</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${formatCurrency(stats.valorEntrada)}</div>
        <div class="stat-label">Entrada Total</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${formatCurrency(stats.valorFinanciado)}</div>
        <div class="stat-label">Financiado Total</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${formatCurrency(stats.ticketMedio)}</div>
        <div class="stat-label">Ticket Médio</div>
      </div>
    </div>
    ` : ''}

    ${stats.porStatus ? `
    <div style="margin-top: 20px;">
      <h3 style="font-size: 16px; margin-bottom: 15px; color: #374151;">Distribuição por Status</h3>
      ${generateStatusBars()}
    </div>
    ` : ''}
  </div>
  ` : ''}

  <!-- TABELA DE DADOS -->
  <div class="table-container">
    <div class="table-header">
      📋 Dados Detalhados (${totalRecords} registros)
    </div>
    <table>
      <thead>
        <tr>
          ${data && data.length > 0 ? Object.keys(data[0]).filter(key =>
            !key.includes('id') &&
            !key.includes('empresa') &&
            key !== 'documentos'
          ).map(key => `<th>${key.replace(/_/g, ' ').toUpperCase()}</th>`).join('') : '<th>Sem dados</th>'}
        </tr>
      </thead>
      <tbody>
        ${data && data.length > 0 ? data.map(row => `
          <tr>
            ${Object.entries(row).filter(([key]) =>
              !key.includes('id') &&
              !key.includes('empresa') &&
              key !== 'documentos'
            ).map(([key, value]) => {
              if (key === 'status') {
                return `<td><span class="status-badge status-${value}">${value}</span></td>`;
              }
              if (key.includes('valor') || key.includes('preco')) {
                return `<td>${formatCurrency(value)}</td>`;
              }
              if (key.includes('data') || key.includes('_at')) {
                return `<td>${formatDate(value)}</td>`;
              }
              return `<td>${value || '-'}</td>`;
            }).join('')}
          </tr>
        `).join('') : '<tr><td colspan="100" style="text-align: center; padding: 40px; color: #6b7280;">Nenhum dado encontrado para o período selecionado</td></tr>'}
      </tbody>
    </table>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <div class="footer-logo">AIra CRM</div>
    <p>Relatório gerado automaticamente pelo sistema</p>
    <p>${user?.empresa_nome || 'VendeAI'} • ${user?.email || ''}</p>
    <p style="margin-top: 10px; opacity: 0.7;">
      Este documento é confidencial e destinado exclusivamente ao uso interno
    </p>
  </div>
</body>
</html>
    `;
  };

  const formatPrice = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-black p-6 space-y-6 relative overflow-hidden">
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
      <div className="relative overflow-hidden rounded-2xl card-glass border border-white/10 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5"></div>
        <div className="relative p-6">
          <div className="flex items-center gap-4 mb-3">
            <div className="metric-icon bg-gradient-to-br from-green-500 to-emerald-600">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Relatórios e Análises
              </h1>
              <p className="text-white/70 mt-1">
                Gere relatórios profissionais com dados em tempo real do banco de dados
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros de Período */}
      <div className="relative overflow-hidden rounded-2xl card-glass border border-white/10 shadow-md">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
        <div className="relative">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Filter className="h-5 w-5 text-green-400" />
              Filtros de Período
            </h2>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setPeriodFilter('diario')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                  periodFilter === 'diario'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10 hover:border-green-500/30'
                }`}
              >
                <Clock className="h-4 w-4" />
                Hoje
              </button>
              <button
                onClick={() => setPeriodFilter('semanal')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                  periodFilter === 'semanal'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10 hover:border-green-500/30'
                }`}
              >
                <Calendar className="h-4 w-4" />
                Últimos 7 Dias
              </button>
              <button
                onClick={() => setPeriodFilter('mensal')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                  periodFilter === 'mensal'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10 hover:border-green-500/30'
                }`}
              >
                <Calendar className="h-4 w-4" />
                Este Mês
              </button>
              <button
                onClick={() => setPeriodFilter('personalizado')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                  periodFilter === 'personalizado'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10 hover:border-green-500/30'
                }`}
              >
                <Calendar className="h-4 w-4" />
                Personalizado
              </button>
            </div>

            {periodFilter === 'personalizado' && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="text-sm text-white/70 block mb-2 font-medium">Data Inicial</label>
                  <input
                    type="date"
                    value={customDateStart}
                    onChange={(e) => setCustomDateStart(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/70 block mb-2 font-medium">Data Final</label>
                  <input
                    type="date"
                    value={customDateEnd}
                    onChange={(e) => setCustomDateEnd(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tipos de Relatórios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          const isGenerating = loading && selectedReport?.id === report.id;

          return (
            <div
              key={report.id}
              className={`report-card ${
                selectedReport?.id === report.id ? 'report-card-selected' : ''
              }`}
              onClick={() => !loading && generateReport(report)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5"></div>
              <div className="relative p-6">
                <div className="metric-icon bg-gradient-to-br from-green-500 to-emerald-600 mb-4">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{report.title}</h3>
                <p className="text-white/60 text-sm mb-4">{report.description}</p>
                <button
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                    isGenerating
                      ? 'bg-white/5 text-white/40 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/50'
                  }`}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4" />
                      Gerar Relatório
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Relatório Gerado */}
      {reportData && (
        <div className="relative overflow-hidden rounded-2xl card-glass border border-white/10 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5"></div>
          <div className="relative">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    {reportData.type.title}
                  </h2>
                  <p className="text-white/60 mt-2 flex items-center gap-2 text-sm flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {reportData.period.startDate.toLocaleDateString('pt-BR')} até{' '}
                      {reportData.period.endDate.toLocaleDateString('pt-BR')}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      <BarChart3 className="h-3.5 w-3.5" />
                      {reportData.totalRecords} registros
                    </span>
                    {reportData.stats?.valorTotal && (
                      <>
                        <span>•</span>
                        <span className="text-green-400 font-semibold flex items-center gap-1.5">
                          <DollarSign className="h-3.5 w-3.5" />
                          {formatPrice(reportData.stats.valorTotal)}
                        </span>
                      </>
                    )}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={exportToExcel}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all duration-300"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Excel
                  </button>
                  <button
                    onClick={exportToPDF}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-medium shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all duration-300"
                  >
                    <FileDown className="h-4 w-4" />
                    PDF
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6">
              {reportData.totalRecords > 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-green-400 text-sm mb-4 flex items-center gap-2 font-medium">
                    <CheckCircle className="h-4 w-4" />
                    {reportData.isMock ? '📊 Relatório gerado com dados de exemplo' : '✅ Relatório gerado com dados reais do banco de dados'}
                  </p>
                  <div className="overflow-x-auto scrollbar-custom">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-green-500/30">
                          {reportData.data && reportData.data.length > 0 &&
                            Object.keys(reportData.data[0])
                              .filter(key => !key.includes('id') && !key.includes('empresa') && key !== 'documentos')
                              .map((key) => (
                                <th key={key} className="text-left p-3 text-green-400 font-semibold text-sm">
                                  {key.replace(/_/g, ' ').toUpperCase()}
                                </th>
                              ))}
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.data.slice(0, 10).map((row, index) => (
                          <tr key={index} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                            {Object.entries(row)
                              .filter(([key]) => !key.includes('id') && !key.includes('empresa') && key !== 'documentos')
                              .map(([key, value], i) => (
                                <td key={i} className="p-3 text-white text-sm">
                                  {key === 'status' ? (
                                    <span className="px-2 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-xs font-medium">
                                      {value}
                                    </span>
                                  ) : key.includes('valor') || key.includes('preco') ? (
                                    <span className="text-green-400 font-medium">{formatPrice(value)}</span>
                                  ) : value instanceof Date ? (
                                    value.toLocaleDateString('pt-BR')
                                  ) : key.includes('data') ? (
                                    new Date(value).toLocaleDateString('pt-BR')
                                  ) : (
                                    value || '-'
                                  )}
                                </td>
                              ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {reportData.totalRecords > 10 && (
                      <p className="text-white/60 text-sm text-center mt-4">
                        Mostrando 10 de {reportData.totalRecords} registros. Exporte para ver todos.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="h-16 w-16 text-white/40 mx-auto mb-4" />
                  <p className="text-white text-lg font-medium">Nenhum dado encontrado para o período selecionado</p>
                  <p className="text-white/60 text-sm mt-2">Tente selecionar outro período ou tipo de relatório</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Styles */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }

        .card-glass {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
        }

        .metric-icon {
          display: inline-flex;
          align-items: center;
          justify-center;
          width: 3rem;
          height: 3rem;
          border-radius: 0.75rem;
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
        }

        .report-card {
          position: relative;
          overflow: hidden;
          border-radius: 1rem;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.1);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .report-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 0 30px rgba(16, 185, 129, 0.3);
          border-color: rgba(16, 185, 129, 0.3);
        }

        .report-card-selected {
          border-color: rgba(16, 185, 129, 0.5);
          box-shadow: 0 0 30px rgba(16, 185, 129, 0.4);
        }

        .scrollbar-custom::-webkit-scrollbar {
          height: 8px;
          width: 8px;
        }

        .scrollbar-custom::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }

        .scrollbar-custom::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.3);
          border-radius: 4px;
        }

        .scrollbar-custom::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.5);
        }
      `}</style>
    </div>
  );
}
