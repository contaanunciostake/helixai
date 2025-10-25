/**
 * ════════════════════════════════════════════════════════════════
 * COMPONENTE: Appointments - Kanban de Agendamentos (Green Neon Design)
 * ════════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button.jsx';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx';
import {
  Calendar, Clock, MapPin, User, Phone, Mail, Car, Building2,
  CheckCircle, XCircle, AlertCircle, Plus, Search, FileText,
  Upload, Download, Trash2, Eye, MessageSquare, DollarSign,
  CreditCard, FileCheck, Paperclip, X, TrendingUp, BarChart, Printer, Edit, RefreshCw
} from 'lucide-react';
import { baixarContrato, previewContrato, gerarContratoHTML } from '@/utils/contratoGenerator.js';
import ContratoEditor from '@/components/ContratoEditor.jsx';

export default function Appointments({ user, botConfig, showNotification }) {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [activeCategory, setActiveCategory] = useState('agendamentos'); // 'agendamentos' ou 'financiamentos'
  const [showEditContratoModal, setShowEditContratoModal] = useState(false);
  const [dadosContratoParaEdicao, setDadosContratoParaEdicao] = useState(null);

  // Estados do Kanban - Agendamentos
  const [agendamentosColumns, setAgendamentosColumns] = useState({
    'pendente': {
      id: 'pendente',
      title: 'Aguardando Confirmação',
      color: 'yellow',
      icon: AlertCircle,
      items: []
    },
    'confirmado': {
      id: 'confirmado',
      title: 'Confirmados',
      color: 'blue',
      icon: CheckCircle,
      items: []
    },
    'realizado': {
      id: 'realizado',
      title: 'Realizados',
      color: 'green',
      icon: CheckCircle,
      items: []
    },
    'cancelado': {
      id: 'cancelado',
      title: 'Cancelados',
      color: 'red',
      icon: XCircle,
      items: []
    }
  });

  // Estados do Kanban - Financiamentos
  const [financiamentosColumns, setFinanciamentosColumns] = useState({
    'documentos-pendentes': {
      id: 'documentos-pendentes',
      title: 'Documentos Pendentes',
      color: 'yellow',
      icon: Upload,
      items: []
    },
    'em-analise': {
      id: 'em-analise',
      title: 'Em Análise',
      color: 'blue',
      icon: BarChart,
      items: []
    },
    'aprovado': {
      id: 'aprovado',
      title: 'Aprovados',
      color: 'green',
      icon: CheckCircle,
      items: []
    },
    'reprovado': {
      id: 'reprovado',
      title: 'Reprovados',
      color: 'red',
      icon: XCircle,
      items: []
    }
  });

  useEffect(() => {
    loadData();
  }, [user, activeCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      const empresaId = user?.empresa_id || 5;

      try {
        const endpoint = activeCategory === 'agendamentos' ? 'appointments' : 'financings';
        const response = await fetch(`${botConfig.apiUrl}/api/${endpoint}/${empresaId}`);
        const data = await response.json();

        if (data.success && data.data) {
          distributeItemsToColumns(data.data);
        } else {
          generateMockData();
        }
      } catch (apiError) {
        console.log(`[APPOINTMENTS] API indisponível, usando dados de exemplo`);
        generateMockData();
      }
    } catch (error) {
      console.error('[APPOINTMENTS] Erro:', error);
      generateMockData();
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = () => {
    if (activeCategory === 'agendamentos') {
      const mockAgendamentos = [
        {
          id: 1,
          categoria: 'agendamento',
          nome: 'Ricardo Mendes',
          telefone: '+55 11 99888-7777',
          email: 'ricardo.mendes@email.com',
          tipo: 'test-drive',
          veiculo: 'Jeep Commander Limited 2024',
          data: '2025-10-25',
          hora: '14:00',
          local: 'Concessionária Zona Sul',
          endereco: 'Av. das Nações Unidas, 1234 - São Paulo/SP',
          status: 'confirmado',
          observacoes: 'Cliente já visitou o showroom anteriormente',
          origem_bot: true,
          data_criacao: '2025-10-18'
        },
        {
          id: 2,
          categoria: 'agendamento',
          nome: 'Patricia Souza',
          telefone: '+55 21 98777-6666',
          email: 'patricia.souza@email.com',
          tipo: 'visita',
          imovel: 'Apartamento 3 quartos - Leblon',
          data: '2025-10-26',
          hora: '10:30',
          local: 'Apartamento Leblon',
          endereco: 'Rua Dias Ferreira, 567 - Rio de Janeiro/RJ',
          status: 'pendente',
          observacoes: 'Levar planta e documentação do imóvel',
          origem_bot: true,
          data_criacao: '2025-10-19'
        },
        {
          id: 3,
          categoria: 'agendamento',
          nome: 'Pedro Henrique',
          telefone: '+55 11 95555-4444',
          email: 'pedro.henrique@email.com',
          tipo: 'test-drive',
          veiculo: 'Fiat Toro Endurance 2024',
          data: '2025-10-25',
          hora: '16:00',
          local: 'Concessionária Campinas',
          endereco: 'Rodovia Santos Dumont, km 45 - Campinas/SP',
          status: 'pendente',
          observacoes: 'Cliente solicitou test drive via WhatsApp',
          origem_bot: true,
          data_criacao: '2025-10-19'
        },
        {
          id: 4,
          categoria: 'agendamento',
          nome: 'Lucas Martins',
          telefone: '+55 21 95444-3333',
          email: 'lucas.martins@email.com',
          tipo: 'test-drive',
          veiculo: 'Chevrolet Onix Plus 2024',
          data: '2025-10-20',
          hora: '15:00',
          local: 'Concessionária Zona Norte',
          endereco: 'Av. Brasil, 5000 - Rio de Janeiro/RJ',
          status: 'realizado',
          observacoes: 'Cliente gostou do veículo e solicitou proposta',
          origem_bot: true,
          data_criacao: '2025-10-15'
        },
        {
          id: 5,
          categoria: 'agendamento',
          nome: 'Fernanda Lima',
          telefone: '+55 11 92222-1111',
          email: 'fernanda.lima@email.com',
          tipo: 'visita',
          imovel: 'Casa em condomínio - Alphaville',
          data: '2025-10-18',
          hora: '10:00',
          local: 'Alphaville',
          endereco: 'Alameda das Flores, 456 - Barueri/SP',
          status: 'cancelado',
          observacoes: 'Cliente cancelou por motivos pessoais',
          origem_bot: false,
          data_criacao: '2025-10-12'
        }
      ];
      distributeItemsToColumns(mockAgendamentos);
    } else {
      const mockFinanciamentos = [
        {
          id: 101,
          categoria: 'financiamento',
          nome: 'Camila Ribeiro',
          telefone: '+55 11 96555-4444',
          email: 'camila.ribeiro@email.com',
          veiculo: 'Toyota Corolla Cross XRE 2024',
          valor_veiculo: 180000,
          valor_entrada: 50000,
          valor_financiado: 130000,
          parcelas: 60,
          valor_parcela: 2800,
          status: 'aprovado',
          banco: 'Banco Itaú',
          taxa_juros: 1.49,
          observacoes: 'Financiamento aprovado com taxa promocional',
          origem_bot: true,
          data_criacao: '2025-10-15',
          documentos: [
            { id: 1, nome: 'RG_Frente.pdf', tipo: 'documento', tamanho: '1.2 MB', data_upload: '2025-10-15', enviado_whatsapp: true },
            { id: 2, nome: 'RG_Verso.pdf', tipo: 'documento', tamanho: '1.1 MB', data_upload: '2025-10-15', enviado_whatsapp: true },
            { id: 3, nome: 'CPF.pdf', tipo: 'documento', tamanho: '890 KB', data_upload: '2025-10-15', enviado_whatsapp: true },
            { id: 4, nome: 'Comprovante_Renda.pdf', tipo: 'comprovante', tamanho: '2.1 MB', data_upload: '2025-10-16', enviado_whatsapp: true },
            { id: 5, nome: 'Comprovante_Residencia.pdf', tipo: 'comprovante', tamanho: '1.5 MB', data_upload: '2025-10-16', enviado_whatsapp: false }
          ]
        },
        {
          id: 102,
          categoria: 'financiamento',
          nome: 'Roberto Silva',
          telefone: '+55 11 93333-2222',
          email: 'roberto.silva@email.com',
          veiculo: 'Volkswagen T-Cross Highline 2024',
          valor_veiculo: 145000,
          valor_entrada: 30000,
          valor_financiado: 115000,
          parcelas: 48,
          valor_parcela: 3100,
          status: 'em-analise',
          banco: 'Banco Santander',
          taxa_juros: 1.69,
          observacoes: 'Aguardando análise de crédito do banco',
          origem_bot: true,
          data_criacao: '2025-10-18',
          documentos: [
            { id: 6, nome: 'Documentos_Pessoais.pdf', tipo: 'documento', tamanho: '3.5 MB', data_upload: '2025-10-18', enviado_whatsapp: true },
            { id: 7, nome: 'Holerite_Atual.pdf', tipo: 'comprovante', tamanho: '890 KB', data_upload: '2025-10-18', enviado_whatsapp: true }
          ]
        },
        {
          id: 103,
          categoria: 'financiamento',
          nome: 'Ana Paula Costa',
          telefone: '+55 21 96666-5555',
          email: 'ana.costa@email.com',
          veiculo: 'Jeep Renegade Sport 2024',
          valor_veiculo: 125000,
          valor_entrada: 25000,
          valor_financiado: 100000,
          parcelas: 48,
          valor_parcela: 2650,
          status: 'documentos-pendentes',
          banco: 'Banco Bradesco',
          taxa_juros: 1.59,
          observacoes: 'Aguardando envio de comprovante de renda atualizado',
          origem_bot: true,
          data_criacao: '2025-10-19',
          documentos: [
            { id: 8, nome: 'RG.pdf', tipo: 'documento', tamanho: '1.8 MB', data_upload: '2025-10-19', enviado_whatsapp: true }
          ]
        },
        {
          id: 104,
          categoria: 'financiamento',
          nome: 'Marcos Oliveira',
          telefone: '+55 11 94444-3333',
          email: 'marcos.oliveira@email.com',
          veiculo: 'Honda HR-V Touring 2024',
          valor_veiculo: 165000,
          valor_entrada: 60000,
          valor_financiado: 105000,
          parcelas: 36,
          valor_parcela: 3800,
          status: 'reprovado',
          banco: 'Banco do Brasil',
          taxa_juros: 1.89,
          observacoes: 'Reprovado por score de crédito. Sugerido aumentar entrada.',
          origem_bot: true,
          data_criacao: '2025-10-16',
          documentos: [
            { id: 9, nome: 'Documentos_Completos.pdf', tipo: 'documento', tamanho: '5.2 MB', data_upload: '2025-10-16', enviado_whatsapp: true }
          ]
        }
      ];
      distributeItemsToColumns(mockFinanciamentos);
    }
  };

  const distributeItemsToColumns = (items) => {
    if (activeCategory === 'agendamentos') {
      const newColumns = {
        'pendente': { ...agendamentosColumns['pendente'], items: [] },
        'confirmado': { ...agendamentosColumns['confirmado'], items: [] },
        'realizado': { ...agendamentosColumns['realizado'], items: [] },
        'cancelado': { ...agendamentosColumns['cancelado'], items: [] }
      };

      items.forEach(item => {
        if (newColumns[item.status]) {
          newColumns[item.status].items.push(item);
        }
      });

      setAgendamentosColumns(newColumns);
    } else {
      const newColumns = {
        'documentos-pendentes': { ...financiamentosColumns['documentos-pendentes'], items: [] },
        'em-analise': { ...financiamentosColumns['em-analise'], items: [] },
        'aprovado': { ...financiamentosColumns['aprovado'], items: [] },
        'reprovado': { ...financiamentosColumns['reprovado'], items: [] }
      };

      items.forEach(item => {
        if (newColumns[item.status]) {
          newColumns[item.status].items.push(item);
        }
      });

      setFinanciamentosColumns(newColumns);
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const columns = activeCategory === 'agendamentos' ? agendamentosColumns : financiamentosColumns;
    const setColumns = activeCategory === 'agendamentos' ? setAgendamentosColumns : setFinanciamentosColumns;

    if (source.droppableId !== destination.droppableId) {
      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];
      const sourceItems = [...sourceColumn.items];
      const destItems = [...destColumn.items];
      const [removed] = sourceItems.splice(source.index, 1);

      removed.status = destination.droppableId;
      destItems.splice(destination.index, 0, removed);

      setColumns({
        ...columns,
        [source.droppableId]: {
          ...sourceColumn,
          items: sourceItems
        },
        [destination.droppableId]: {
          ...destColumn,
          items: destItems
        }
      });

      updateItemStatus(removed.id, destination.droppableId);
    } else {
      const column = columns[source.droppableId];
      const copiedItems = [...column.items];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);

      setColumns({
        ...columns,
        [source.droppableId]: {
          ...column,
          items: copiedItems
        }
      });
    }
  };

  const updateItemStatus = async (itemId, newStatus) => {
    try {
      console.log(`Atualizando ${activeCategory} ${itemId} para status ${newStatus}`);
      showNotification('Status atualizado com sucesso!');
    } catch (error) {
      console.error('[APPOINTMENTS] Erro ao atualizar status:', error);
      showNotification('Erro ao atualizar status');
    }
  };

  const handleCardClick = (item) => {
    setSelectedItem(item);
    setUploadedFiles(item.documentos || []);
    setShowDetailModal(true);
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      nome: file.name,
      tipo: file.type.includes('pdf') ? 'documento' : 'imagem',
      tamanho: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      data_upload: new Date().toISOString().split('T')[0],
      enviado_whatsapp: false,
      file: file
    }));

    setUploadedFiles([...uploadedFiles, ...newFiles]);
    showNotification(`${files.length} arquivo(s) adicionado(s)`);
  };

  const handleDeleteFile = (index) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    showNotification('Arquivo removido');
  };

  const handleGerarContrato = () => {
    if (!selectedItem) return;

    const dadosEmpresa = {
      nome: user?.empresa_nome || 'Concessionária VendeAI Auto',
      nome_fantasia: 'VendeAI Auto',
      cnpj: user?.empresa_cnpj || '12.345.678/0001-90',
      endereco: 'Avenida Paulista, 1000',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01310-100'
    };

    const dadosCliente = {
      nome: selectedItem.nome,
      telefone: selectedItem.telefone,
      email: selectedItem.email,
      cpf: '000.000.000-00',
      rg: '00.000.000-0',
      nacionalidade: 'brasileiro(a)',
      estado_civil: 'solteiro(a)',
      profissao: 'autônomo(a)',
      endereco: 'Rua Exemplo, 456',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '00000-000'
    };

    const dadosFinanciamento = {
      valor_veiculo: selectedItem.valor_veiculo,
      valor_entrada: selectedItem.valor_entrada,
      valor_financiado: selectedItem.valor_financiado,
      parcelas: selectedItem.parcelas,
      valor_parcela: selectedItem.valor_parcela,
      banco: selectedItem.banco,
      taxa_juros: selectedItem.taxa_juros
    };

    const dadosVeiculo = {
      marca: selectedItem.veiculo.split(' ')[0],
      modelo: selectedItem.veiculo,
      ano: '2024',
      ano_fabricacao: '2024',
      ano_modelo: '2024',
      cor: 'A definir',
      placa: 'A transferir',
      chassi: 'Conforme documentação',
      renavam: 'Conforme documentação',
      combustivel: 'Flex',
      km: 0
    };

    baixarContrato(dadosEmpresa, dadosCliente, dadosFinanciamento, dadosVeiculo);
    showNotification('Contrato gerado com sucesso!');
  };

  const handleVisualizarContrato = () => {
    if (!selectedItem) return;

    const dadosEmpresa = {
      nome: user?.empresa_nome || 'Concessionária VendeAI Auto',
      nome_fantasia: 'VendeAI Auto',
      cnpj: user?.empresa_cnpj || '12.345.678/0001-90',
      endereco: 'Avenida Paulista, 1000',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01310-100'
    };

    const dadosCliente = {
      nome: selectedItem.nome,
      telefone: selectedItem.telefone,
      email: selectedItem.email,
      cpf: '000.000.000-00',
      rg: '00.000.000-0',
      nacionalidade: 'brasileiro(a)',
      estado_civil: 'solteiro(a)',
      profissao: 'autônomo(a)',
      endereco: 'Rua Exemplo, 456',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '00000-000'
    };

    const dadosFinanciamento = {
      valor_veiculo: selectedItem.valor_veiculo,
      valor_entrada: selectedItem.valor_entrada,
      valor_financiado: selectedItem.valor_financiado,
      parcelas: selectedItem.parcelas,
      valor_parcela: selectedItem.valor_parcela,
      banco: selectedItem.banco,
      taxa_juros: selectedItem.taxa_juros
    };

    const dadosVeiculo = {
      marca: selectedItem.veiculo.split(' ')[0],
      modelo: selectedItem.veiculo,
      ano: '2024',
      ano_fabricacao: '2024',
      ano_modelo: '2024',
      cor: 'A definir',
      placa: 'A transferir',
      chassi: 'Conforme documentação',
      renavam: 'Conforme documentação',
      combustivel: 'Flex',
      km: 0
    };

    previewContrato(dadosEmpresa, dadosCliente, dadosFinanciamento, dadosVeiculo);
    showNotification('Abrindo visualização do contrato...');
  };

  const handleEditarContrato = () => {
    if (!selectedItem) return;

    const dadosEmpresa = {
      nome: user?.empresa_nome || 'Concessionária VendeAI Auto',
      nome_fantasia: 'VendeAI Auto',
      cnpj: user?.empresa_cnpj || '12.345.678/0001-90',
      endereco: 'Avenida Paulista, 1000',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01310-100'
    };

    const dadosCliente = {
      nome: selectedItem.nome,
      telefone: selectedItem.telefone,
      email: selectedItem.email,
      cpf: '000.000.000-00',
      rg: '00.000.000-0',
      nacionalidade: 'brasileiro(a)',
      estado_civil: 'solteiro(a)',
      profissao: 'autônomo(a)',
      endereco: 'Rua Exemplo, 456',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '00000-000'
    };

    const dadosFinanciamento = {
      valor_veiculo: selectedItem.valor_veiculo,
      valor_entrada: selectedItem.valor_entrada,
      valor_financiado: selectedItem.valor_financiado,
      parcelas: selectedItem.parcelas,
      valor_parcela: selectedItem.valor_parcela,
      banco: selectedItem.banco,
      taxa_juros: selectedItem.taxa_juros
    };

    const dadosVeiculo = {
      marca: selectedItem.veiculo.split(' ')[0],
      modelo: selectedItem.veiculo,
      ano: '2024',
      ano_fabricacao: '2024',
      ano_modelo: '2024',
      cor: 'A definir',
      placa: 'A transferir',
      chassi: 'Conforme documentação',
      renavam: 'Conforme documentação',
      combustivel: 'Flex',
      km: 0
    };

    setDadosContratoParaEdicao({
      dadosEmpresa,
      dadosCliente,
      dadosFinanciamento,
      dadosVeiculo
    });

    setShowEditContratoModal(true);
    showNotification('Abrindo editor de contrato...');
  };

  const handleSalvarContratoEditado = (dadosAtualizados) => {
    console.log('Contrato atualizado:', dadosAtualizados);
    setShowEditContratoModal(false);
  };

  const getColumnColorClass = (color) => {
    const colors = {
      yellow: 'border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-yellow-600/5',
      blue: 'border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-blue-600/5',
      green: 'border-green-500/30 bg-gradient-to-br from-green-500/10 to-green-600/5',
      red: 'border-red-500/30 bg-gradient-to-br from-red-500/10 to-red-600/5'
    };
    return colors[color] || colors.blue;
  };

  const getColumnIconColor = (color) => {
    const colors = {
      yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      green: 'bg-green-500/20 text-green-400 border-green-500/30',
      red: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return colors[color] || colors.blue;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getTotalStats = () => {
    const columns = activeCategory === 'agendamentos' ? agendamentosColumns : financiamentosColumns;
    let total = 0;
    Object.values(columns).forEach(column => {
      total += column.items.length;
    });
    return total;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-12">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-green-500 animate-spin mx-auto mb-4" />
          <p className="text-green-400 text-lg">Carregando {activeCategory}...</p>
        </div>
      </div>
    );
  }

  const currentColumns = activeCategory === 'agendamentos' ? agendamentosColumns : financiamentosColumns;

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
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/50">
                {activeCategory === 'agendamentos' ? (
                  <Calendar className="h-8 w-8 text-white" />
                ) : (
                  <CreditCard className="h-8 w-8 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                  {activeCategory === 'agendamentos' ? 'Agendamentos' : 'Financiamentos'}
                </h1>
                <p className="text-gray-400 mt-1">
                  Arraste os cards entre as colunas • Total: {getTotalStats()} itens
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Buscar cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 w-64"
                />
              </div>
              <Button className="btn-primary-neon">
                <Plus className="h-4 w-4 mr-2" />
                Novo {activeCategory === 'agendamentos' ? 'Agendamento' : 'Financiamento'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Toggle Categories - Botões Compactos */}
      <div className="flex gap-3">
        <button
          onClick={() => setActiveCategory('agendamentos')}
          className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
            activeCategory === 'agendamentos'
              ? 'card-glass-small border-2 border-green-500 shadow-lg shadow-green-500/20'
              : 'card-glass-small border border-white/10 hover:border-green-500/50'
          }`}
        >
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
            activeCategory === 'agendamentos'
              ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/50'
              : 'bg-gray-800'
          }`}>
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 text-left">
            <h3 className={`text-sm font-bold ${
              activeCategory === 'agendamentos' ? 'text-white' : 'text-gray-400'
            }`}>
              Agendamentos
            </h3>
          </div>
          {activeCategory === 'agendamentos' && (
            <CheckCircle className="h-5 w-5 text-green-400" />
          )}
        </button>

        <button
          onClick={() => setActiveCategory('financiamentos')}
          className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
            activeCategory === 'financiamentos'
              ? 'card-glass-small border-2 border-green-500 shadow-lg shadow-green-500/20'
              : 'card-glass-small border border-white/10 hover:border-green-500/50'
          }`}
        >
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
            activeCategory === 'financiamentos'
              ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/50'
              : 'bg-gray-800'
          }`}>
            <CreditCard className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 text-left">
            <h3 className={`text-sm font-bold ${
              activeCategory === 'financiamentos' ? 'text-white' : 'text-gray-400'
            }`}>
              Financiamentos
            </h3>
          </div>
          {activeCategory === 'financiamentos' && (
            <CheckCircle className="h-5 w-5 text-green-400" />
          )}
        </button>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.values(currentColumns).map((column) => {
            const Icon = column.icon;
            return (
              <div key={column.id} className="flex flex-col">
                <div className={`relative overflow-hidden rounded-xl card-glass-small border ${getColumnColorClass(column.color)} mb-3`}>
                  <div className="relative p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center border ${getColumnIconColor(column.color)}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-sm">{column.title}</h3>
                          <p className="text-xs text-gray-400">{column.items.length} {column.items.length === 1 ? 'item' : 'itens'}</p>
                        </div>
                      </div>
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm border ${getColumnIconColor(column.color)}`}>
                        {column.items.length}
                      </div>
                    </div>
                  </div>
                </div>

                <Droppable droppableId={column.id} isDropDisabled={false}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`space-y-3 min-h-[500px] p-2 rounded-lg transition-all duration-300 ${
                        snapshot.isDraggingOver ? `border-2 border-dashed ${
                          column.color === 'yellow' ? 'bg-yellow-500/10 border-yellow-500' :
                          column.color === 'blue' ? 'bg-blue-500/10 border-blue-500' :
                          column.color === 'green' ? 'bg-green-500/10 border-green-500' :
                          'bg-red-500/10 border-red-500'
                        }` : 'bg-transparent'
                      }`}
                    >
                      {column.items.map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => handleCardClick(item)}
                              className={`card-glass-small rounded-lg p-4 cursor-grab active:cursor-grabbing transition-all duration-300 ${
                                snapshot.isDragging
                                  ? `shadow-2xl rotate-3 scale-110 shadow-green-500/20 border-2 border-green-500`
                                  : 'border border-white/10 hover:border-green-500/50 hover:shadow-md'
                              }`}
                            >
                              {activeCategory === 'agendamentos' ? (
                                // Card de Agendamento
                                <div className="space-y-3">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <h4 className="text-white font-bold text-sm flex items-center gap-2">
                                        <User className="h-4 w-4 text-green-400" />
                                        {item.nome}
                                      </h4>
                                      <div className={`mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                        item.tipo === 'test-drive'
                                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                          : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                                      }`}>
                                        {item.tipo === 'test-drive' ? (
                                          <><Car className="h-3 w-3" /> Test Drive</>
                                        ) : (
                                          <><Building2 className="h-3 w-3" /> Visita</>
                                        )}
                                      </div>
                                    </div>
                                    {item.origem_bot && (
                                      <div className="bg-green-500/20 p-1.5 rounded-lg border border-green-500/30">
                                        <MessageSquare className="h-4 w-4 text-green-400" title="Criado pelo bot WhatsApp" />
                                      </div>
                                    )}
                                  </div>

                                  <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-2.5 space-y-2">
                                    <p className="text-xs text-gray-200 font-medium truncate">
                                      {item.veiculo || item.imovel}
                                    </p>
                                    <div className="space-y-1.5 text-xs text-gray-400">
                                      <div className="flex items-center gap-2">
                                        <Calendar className="h-3.5 w-3.5 text-green-400" />
                                        <span className="text-white font-medium">{new Date(item.data).toLocaleDateString('pt-BR')}</span>
                                        <Clock className="h-3.5 w-3.5 text-green-400 ml-2" />
                                        <span className="text-white font-medium">{item.hora}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <MapPin className="h-3.5 w-3.5 text-yellow-400 flex-shrink-0" />
                                        <span className="truncate">{item.local}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                // Card de Financiamento
                                <div className="space-y-3">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <h4 className="text-white font-bold text-sm flex items-center gap-2">
                                        <User className="h-4 w-4 text-green-400" />
                                        {item.nome}
                                      </h4>
                                      <p className="text-xs text-gray-400 mt-1.5 truncate flex items-center gap-1">
                                        <Car className="h-3 w-3 text-gray-500" />
                                        {item.veiculo}
                                      </p>
                                    </div>
                                    {item.documentos && item.documentos.length > 0 && (
                                      <div className="bg-blue-500/20 px-2 py-1 rounded-lg flex items-center gap-1 border border-blue-500/30">
                                        <Paperclip className="h-3.5 w-3.5 text-blue-400" />
                                        <span className="text-xs text-blue-400 font-bold">{item.documentos.length}</span>
                                      </div>
                                    )}
                                  </div>

                                  <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-2.5 space-y-2">
                                    <div className="flex justify-between items-center">
                                      <span className="text-xs text-gray-400">Valor Total</span>
                                      <span className="text-white font-bold text-sm">{formatPrice(item.valor_veiculo)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-xs text-gray-400">Entrada</span>
                                      <span className="text-green-400 font-bold text-sm flex items-center gap-1">
                                        <TrendingUp className="h-3 w-3" />
                                        {formatPrice(item.valor_entrada)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center pt-1 border-t border-gray-700">
                                      <span className="text-xs text-gray-400">Parcelas</span>
                                      <span className="text-blue-400 font-bold text-sm">
                                        {item.parcelas}x {formatPrice(item.valor_parcela)}
                                      </span>
                                    </div>
                                  </div>

                                  {item.banco && (
                                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-gray-300 font-medium flex items-center justify-between">
                                      <span className="flex items-center gap-1">
                                        <CreditCard className="h-3 w-3" />
                                        {item.banco}
                                      </span>
                                      <span className="text-white">{item.taxa_juros}% a.m.</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Modal de Detalhes - Green Neon */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="bg-black border-green-500/30 text-white max-w-4xl max-h-[90vh] overflow-y-auto card-glass">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5 pointer-events-none"></div>
          <DialogHeader className="relative">
            <DialogTitle className="text-2xl flex items-center gap-2 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              {selectedItem?.nome}
              {selectedItem?.origem_bot && (
                <MessageSquare className="h-5 w-5 text-green-400" title="Criado pelo bot WhatsApp" />
              )}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {activeCategory === 'agendamentos' ? 'Detalhes do agendamento' : 'Detalhes do financiamento e documentos'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4 relative">
            {activeCategory === 'agendamentos' ? (
              // Detalhes do Agendamento
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="card-glass-small rounded-lg p-4">
                    <label className="text-sm text-gray-400">Cliente</label>
                    <p className="text-white font-medium">{selectedItem?.nome}</p>
                  </div>
                  <div className="card-glass-small rounded-lg p-4">
                    <label className="text-sm text-gray-400">Tipo</label>
                    <p className="text-white capitalize">{selectedItem?.tipo?.replace('-', ' ')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="card-glass-small rounded-lg p-4">
                    <label className="text-sm text-gray-400">Telefone</label>
                    <p className="text-white flex items-center gap-2">
                      <Phone className="h-4 w-4 text-green-400" />
                      {selectedItem?.telefone}
                    </p>
                  </div>
                  <div className="card-glass-small rounded-lg p-4">
                    <label className="text-sm text-gray-400">Email</label>
                    <p className="text-white flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-400" />
                      {selectedItem?.email}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="card-glass-small rounded-lg p-4">
                    <label className="text-sm text-gray-400">Data</label>
                    <p className="text-white">
                      {selectedItem && new Date(selectedItem.data).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="card-glass-small rounded-lg p-4">
                    <label className="text-sm text-gray-400">Horário</label>
                    <p className="text-white">{selectedItem?.hora}</p>
                  </div>
                  <div className="card-glass-small rounded-lg p-4">
                    <label className="text-sm text-gray-400">Status</label>
                    <p className="text-white capitalize">{selectedItem?.status?.replace('-', ' ')}</p>
                  </div>
                </div>

                <div className="card-glass-small rounded-lg p-4">
                  <label className="text-sm text-gray-400">Local</label>
                  <p className="text-white">{selectedItem?.local}</p>
                </div>

                <div className="card-glass-small rounded-lg p-4">
                  <label className="text-sm text-gray-400">Endereço</label>
                  <p className="text-white text-sm">{selectedItem?.endereco}</p>
                </div>

                <div className="card-glass-small rounded-lg p-4">
                  <label className="text-sm text-gray-400">Produto/Serviço</label>
                  <p className="text-white font-medium">
                    {selectedItem?.veiculo || selectedItem?.imovel}
                  </p>
                </div>

                {selectedItem?.observacoes && (
                  <div className="card-glass-small rounded-lg p-4">
                    <label className="text-sm text-gray-400">Observações</label>
                    <p className="text-white text-sm bg-gray-900/50 p-3 rounded-lg mt-2">
                      {selectedItem.observacoes}
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t border-green-500/20">
                  <Button
                    className="w-full btn-primary-neon"
                    onClick={() => {
                      const cleanPhone = selectedItem?.telefone.replace(/\D/g, '');
                      window.open(`https://wa.me/${cleanPhone}`, '_blank');
                    }}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contatar via WhatsApp
                  </Button>
                </div>
              </>
            ) : (
              // Detalhes do Financiamento
              <>
                <div className="card-glass-small border border-green-500/20 rounded-xl p-6 space-y-4">
                  <h3 className="text-white text-lg font-bold flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-400" />
                    Informações do Financiamento
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <label className="text-sm text-gray-400">Cliente</label>
                      <p className="text-white font-medium">{selectedItem?.nome}</p>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <label className="text-sm text-gray-400">Telefone</label>
                      <p className="text-white">{selectedItem?.telefone}</p>
                    </div>
                  </div>

                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <label className="text-sm text-gray-400">Veículo</label>
                    <p className="text-white font-semibold text-lg">{selectedItem?.veiculo}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <label className="text-sm text-gray-400">Valor Total</label>
                      <p className="text-white font-bold text-xl">
                        {selectedItem && formatPrice(selectedItem.valor_veiculo)}
                      </p>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <label className="text-sm text-gray-400">Entrada</label>
                      <p className="text-green-400 font-bold text-xl">
                        {selectedItem && formatPrice(selectedItem.valor_entrada)}
                      </p>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <label className="text-sm text-gray-400">Financiado</label>
                      <p className="text-blue-400 font-bold text-xl">
                        {selectedItem && formatPrice(selectedItem.valor_financiado)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <label className="text-sm text-gray-400">Parcelas</label>
                      <p className="text-white font-bold text-lg">{selectedItem?.parcelas}x</p>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <label className="text-sm text-gray-400">Valor da Parcela</label>
                      <p className="text-white font-bold text-lg">
                        {selectedItem && formatPrice(selectedItem.valor_parcela)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <label className="text-sm text-gray-400">Banco</label>
                      <p className="text-white">{selectedItem?.banco}</p>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <label className="text-sm text-gray-400">Taxa de Juros</label>
                      <p className="text-white">{selectedItem?.taxa_juros}% a.m.</p>
                    </div>
                  </div>

                  {selectedItem?.observacoes && (
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <label className="text-sm text-gray-400">Observações</label>
                      <p className="text-white text-sm bg-black/30 p-3 rounded-lg mt-2">
                        {selectedItem.observacoes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Upload de Documentos */}
                <div className="card-glass-small border border-green-500/20 rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white flex items-center gap-2 text-lg font-bold">
                      <FileCheck className="h-5 w-5 text-green-400" />
                      Documentos ({uploadedFiles.length})
                    </h3>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </Button>
                    </label>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Documentos enviados pelo cliente via WhatsApp ou upload manual
                  </p>

                  {uploadedFiles.length > 0 ? (
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div
                          key={file.id || index}
                          className="flex items-center justify-between bg-gray-900/50 p-3 rounded-lg border border-gray-700 hover:border-green-500/50 transition-all"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="bg-green-500/20 p-2 rounded-lg border border-green-500/30">
                              <FileText className="h-5 w-5 text-green-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-white text-sm font-medium truncate">{file.nome}</p>
                                {file.enviado_whatsapp && (
                                  <MessageSquare className="h-4 w-4 text-green-400 flex-shrink-0" title="Enviado via WhatsApp" />
                                )}
                              </div>
                              <p className="text-gray-400 text-xs">
                                {file.tamanho} • {new Date(file.data_upload).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteFile(index)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-900/30 rounded-lg">
                      <Upload className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400 text-sm">Nenhum documento enviado ainda</p>
                      <p className="text-gray-500 text-xs mt-1">
                        Faça upload dos documentos ou aguarde o cliente enviar via WhatsApp
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-green-500/20">
                  <Button
                    className="w-full btn-primary-neon"
                    onClick={() => {
                      const msg = `Olá ${selectedItem?.nome}! Precisamos dos seguintes documentos para dar continuidade ao seu financiamento:\n\n• RG e CPF\n• Comprovante de renda\n• Comprovante de residência\n\nPor favor, envie os documentos por este WhatsApp.`;
                      const cleanPhone = selectedItem?.telefone.replace(/\D/g, '');
                      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
                      showNotification('Mensagem preparada no WhatsApp');
                    }}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Solicitar Documentos via WhatsApp
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição de Contrato */}
      <ContratoEditor
        isOpen={showEditContratoModal}
        onClose={() => setShowEditContratoModal(false)}
        dadosIniciais={dadosContratoParaEdicao}
        onSave={handleSalvarContratoEditado}
        showNotification={showNotification}
      />

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
