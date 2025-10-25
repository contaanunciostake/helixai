import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import { ClientLayout } from './components/layout/ClientLayout'
import { Login } from './components/Login'
import Setup from './pages/Setup'
import BotConfiguracoes from './components/BotConfiguracoes'
import WhatsAppConnection from './components/WhatsAppConnection'
import BotSettings from './components/BotSettings'
import Dashboard from './components/Dashboard'
import Conversations from './components/Conversations'
import Products from './components/Products'
import Sales from './components/Sales'
import Appointments from './components/Appointments'
import AppointmentCalendar from './components/AppointmentCalendar'
import { CRMVeiculos } from './components/crm/CRMVeiculos'
import Reports from './components/Reports'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import {
  Building2, Car, MessageSquare, Calendar, Heart, Bot, Send, MapPin, Bed, Bath, Square,
  User, Phone, CheckCircle, TrendingUp, DollarSign, Users, Activity, Power, QrCode,
  Smartphone, RefreshCw, Settings as SettingsIcon, Download, XCircle, Clock, ArrowUpRight,
  BarChart3, Filter, Search, Plus, Eye, Edit, Trash2, Mail, Upload
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import './App.css'

// Configuração da API do VendeAI Backend
// ✅ Bots específicos por nicho
const BOTS_CONFIG = {
  veiculos: {
    name: 'VendeAI Auto',
    apiUrl: 'http://localhost:3010',
    wsUrl: 'ws://localhost:3010/ws',
    icon: '🚗'
  },
  imoveis: {
    name: 'AIra Imob',
    apiUrl: 'http://localhost:3011',
    wsUrl: 'ws://localhost:3011/ws',
    icon: '🏢'
  },
  outros: {
    name: 'AIra CRM',
    apiUrl: 'http://localhost:3010', // Usar bot padrão
    wsUrl: 'ws://localhost:3010/ws',
    icon: '🤖'
  }
}

// APIs antigas desabilitadas (não funcionam mais)
// const VENDEAI_API_URL = 'http://localhost:5000'  // ❌ Não existe
// const WHATSAPP_SERVICE_URL = 'http://localhost:3001'  // ❌ Não existe

function App() {
  // ══════════════════════════════════════════════════════════════
  // AUTENTICAÇÃO - Ler localStorage SINCRONAMENTE
  // ══════════════════════════════════════════════════════════════
  const getInitialAuthState = () => {
    console.log('[CRM Cliente] 🔍 Verificando autenticação inicial...')

    // PRIMEIRO: Verificar se há dados na URL (vindos da Landing Page)
    const urlParams = new URLSearchParams(window.location.search)
    const authParam = urlParams.get('auth')

    if (authParam) {
      try {
        console.log('[CRM Cliente] 📨 Dados recebidos via URL da Landing Page')
        // Decodificar dados da URL
        const userData = JSON.parse(atob(authParam))
        console.log('[CRM Cliente] ✅ Dados decodificados:', userData)

        // Salvar no localStorage DESTA porta (5177)
        localStorage.setItem('crm_user', JSON.stringify(userData))
        localStorage.setItem('crm_isLoggedIn', 'true')
        console.log('[CRM Cliente] 💾 Dados salvos no localStorage da porta 5177')

        // Limpar a URL (remover o parâmetro auth)
        window.history.replaceState({}, document.title, window.location.pathname)

        return { isLoggedIn: true, user: userData }
      } catch (error) {
        console.error('[CRM Cliente] ❌ Erro ao processar dados da URL:', error)
      }
    }

    // SEGUNDO: Verificar localStorage normal (para logins diretos ou refreshs)
    try {
      const storedIsLoggedIn = localStorage.getItem('crm_isLoggedIn')
      const storedUser = localStorage.getItem('crm_user')

      console.log('[CRM Cliente] 📦 Dados do localStorage:', {
        crm_isLoggedIn: storedIsLoggedIn,
        crm_user: storedUser ? 'Existe' : 'Não existe',
        crm_user_preview: storedUser ? storedUser.substring(0, 50) + '...' : null
      })

      if (storedIsLoggedIn === 'true' && storedUser) {
        const userData = JSON.parse(storedUser)
        console.log('[CRM Cliente] ✅ Usuário já autenticado no carregamento:', userData)
        console.log('[CRM Cliente] 🔑 empresa_id do usuário:', userData.empresa_id)
        return { isLoggedIn: true, user: userData }
      }
    } catch (error) {
      console.error('[CRM Cliente] ❌ Erro ao carregar dados iniciais:', error)
      localStorage.removeItem('crm_user')
      localStorage.removeItem('crm_isLoggedIn')
    }

    console.log('[CRM Cliente] ❌ Nenhum usuário autenticado - Mostrando tela de login')
    return { isLoggedIn: false, user: null }
  }

  const initialAuth = getInitialAuthState()
  const [isLoggedIn, setIsLoggedIn] = useState(initialAuth.isLoggedIn)
  const [user, setUser] = useState(initialAuth.user)

  const [currentPage, setCurrentPage] = useState('dashboard')
  const [selectedType, setSelectedType] = useState('imoveis')

  // Nicho da empresa (veiculos ou imoveis)
  const [empresaNicho, setEmpresaNicho] = useState('veiculos') // Definir padrão para evitar null
  const [nichoLoading, setNichoLoading] = useState(false) // Iniciar como false

  // Setup state
  const [needsSetup, setNeedsSetup] = useState(false)
  const [checkingSetup, setCheckingSetup] = useState(true)

  // Socket.io connection
  const [socket, setSocket] = useState(null)

  // Bot States
  const [botStatus, setBotStatus] = useState('disconnected') // disconnected, connecting, connected

  // ══════════════════════════════════════════════════════════════
  // HELPER: Obter configuração do bot baseado no nicho
  // ══════════════════════════════════════════════════════════════
  const getBotConfig = () => {
    return BOTS_CONFIG[empresaNicho] || BOTS_CONFIG.outros
  }

  // Verificar se usuário precisa fazer setup inicial
  useEffect(() => {
    const checkSetup = async () => {
      if (!isLoggedIn || !user || !user.empresa_id) {
        setCheckingSetup(false)
        return
      }

      try {
        console.log('[CRM Cliente] 🔍 Verificando status do setup...')
        console.log('[CRM Cliente] empresa_id:', user.empresa_id)

        const response = await fetch(`http://localhost:5000/api/empresa/check-setup/${user.empresa_id}`)
        const data = await response.json()

        console.log('[CRM Cliente] Resposta completa da API:', JSON.stringify(data, null, 2))
        console.log('[CRM Cliente] data.success:', data.success)

        // ✅ CORRIGIDO: API pode retornar em dois formatos:
        // Formato 1: { success: true, data: { setup_completo: true } }
        // Formato 2: { success: true, setup_completo: true }
        const setupCompleto = data.success && (
          (data.data && data.data.setup_completo === true) ||  // Formato 1
          (data.setup_completo === true)                        // Formato 2
        )

        console.log('[CRM Cliente] setup_completo:', setupCompleto)

        if (!setupCompleto) {
          console.log('[CRM Cliente] ⚠️ Setup não concluído - mostrando wizard...')
          setNeedsSetup(true)
        } else {
          console.log('[CRM Cliente] ✅ Setup já concluído - indo para dashboard')
          setNeedsSetup(false)

          // Carregar nicho da empresa
          if (data.empresa && data.empresa.nicho) {
            console.log('[CRM Cliente] 📊 Nicho da empresa:', data.empresa.nicho)
            setEmpresaNicho(data.empresa.nicho)
          } else if (data.data && data.data.nicho_configurado) {
            console.log('[CRM Cliente] 📊 Nicho configurado, buscando detalhes...')
            fetchEmpresaNicho()
          }
        }
      } catch (error) {
        console.error('[CRM Cliente] ❌ Erro ao verificar setup:', error)
        setNeedsSetup(false)
      } finally {
        setCheckingSetup(false)
      }
    }

    checkSetup()
  }, [isLoggedIn, user])

  // Função para buscar o nicho da empresa
  const fetchEmpresaNicho = async () => {
    try {
      if (!user || !user.empresa_id) return

      console.log('[CRM Cliente] Buscando nicho da empresa...')
      const response = await fetch(`http://localhost:5000/api/empresa/nicho/${user.empresa_id}`)
      const data = await response.json()

      if (data.success && data.nicho) {
        console.log('[CRM Cliente] Nicho da empresa:', data.nicho)
        setEmpresaNicho(data.nicho)
      }
    } catch (error) {
      console.error('[CRM Cliente] Erro ao buscar nicho da empresa:', error)
    }
  }

  const [showQRCode, setShowQRCode] = useState(false)
  const [botActive, setBotActive] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState('')
  const [qrCodeValue, setQrCodeValue] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false) // Prevenir múltiplas chamadas

  // Stats
  const [stats] = useState({
    conversasAtivas: 47,
    leadsQualificados: 156,
    agendamentosHoje: 12,
    taxaConversao: 34.5,
    vendasMes: 23,
    ticketMedio: 145900,
    respostaMedia: '1.8s',
    satisfacao: 94.5
  })

  // Conversas Kanban - COM MAIS ITENS E ARRASTÁVEL
  const [conversas, setConversas] = useState({
    novo: [
      { id: '1', nome: 'Ricardo Mendes', mensagem: 'Interesse em apartamento 3 quartos', hora: '10min', origem: 'WhatsApp', telefone: '+55 11 98765-4321' },
      { id: '2', nome: 'Patricia Souza', mensagem: 'Pergunta sobre financiamento', hora: '25min', origem: 'Site', telefone: '+55 11 98765-1234' },
      { id: '3', nome: 'Roberto Lima', mensagem: 'Quero agendar uma visita', hora: '35min', origem: 'WhatsApp', telefone: '+55 11 98765-5678' },
      { id: '4', nome: 'Sandra Costa', mensagem: 'Informações sobre cobertura', hora: '1h', origem: 'Site', telefone: '+55 11 98765-9012' },
      { id: '5', nome: 'Paulo Oliveira', mensagem: 'Busco apartamento no centro', hora: '2h', origem: 'Telefone', telefone: '+55 11 98765-3456' },
    ],
    emAtendimento: [
      { id: '6', nome: 'Fernando Costa', mensagem: 'Agendando visita ao imóvel', hora: '1h', origem: 'WhatsApp', telefone: '+55 11 98765-7890' },
      { id: '7', nome: 'Camila Ribeiro', mensagem: 'Negociação de valores', hora: '2h', origem: 'Telefone', telefone: '+55 11 98765-2345' },
      { id: '8', nome: 'Marcos Silva', mensagem: 'Interessado em casa no jardim', hora: '3h', origem: 'WhatsApp', telefone: '+55 11 98765-6789' },
      { id: '9', nome: 'Julia Santos', mensagem: 'Dúvidas sobre documentação', hora: '4h', origem: 'Site', telefone: '+55 11 98765-0123' },
    ],
    proposta: [
      { id: '10', nome: 'Lucas Martins', mensagem: 'Aguardando análise de crédito', hora: '1d', origem: 'WhatsApp', telefone: '+55 11 98765-4567' },
      { id: '11', nome: 'Fernanda Alves', mensagem: 'Proposta para apartamento 301', hora: '1d', origem: 'Site', telefone: '+55 11 98765-8901' },
      { id: '12', nome: 'Carlos Eduardo', mensagem: 'Negociação de entrada', hora: '2d', origem: 'WhatsApp', telefone: '+55 11 98765-2109' },
    ],
    fechado: [
      { id: '13', nome: 'Ana Silva', mensagem: 'Venda concluída - Ap 301', hora: '2d', origem: 'WhatsApp', telefone: '+55 11 98765-5432' },
      { id: '14', nome: 'José Carlos', mensagem: 'Contrato assinado - Casa Jardim', hora: '3d', origem: 'Telefone', telefone: '+55 11 98765-9876' },
      { id: '15', nome: 'Maria Fernanda', mensagem: 'Venda concluída - Cobertura', hora: '5d', origem: 'WhatsApp', telefone: '+55 11 98765-6543' },
    ]
  })

  // Vendas/Negócios
  const [deals] = useState([
    {
      id: 1,
      cliente: 'João Silva',
      imovel: 'Apartamento 3 Quartos - Centro',
      valor: 450000,
      status: 'Negociação',
      probabilidade: 75,
      proximaAcao: 'Visita agendada 18/10',
      vendedor: 'Você'
    },
    {
      id: 2,
      cliente: 'Maria Santos',
      imovel: 'Casa 4 Quartos - Jardim',
      valor: 850000,
      status: 'Proposta Enviada',
      probabilidade: 60,
      proximaAcao: 'Aguardando resposta',
      vendedor: 'Você'
    },
    {
      id: 3,
      cliente: 'Carlos Mendes',
      imovel: 'Corolla XEI 2023',
      valor: 145900,
      status: 'Ganho',
      probabilidade: 100,
      proximaAcao: 'Assinatura de contrato',
      vendedor: 'Você'
    },
  ])

  // Dados com MUITO MAIS IMÓVEIS
  const [imoveis] = useState([
    { id: 1, tipo: 'Apartamento', titulo: 'Apartamento 3 Quartos - Centro', cidade: 'São Paulo', preco: 450000, area: 85, quartos: 3, banheiros: 2, favorito: false, views: 234, leads: 12 },
    { id: 2, tipo: 'Casa', titulo: 'Casa 4 Quartos - Jardim América', cidade: 'São Paulo', preco: 850000, area: 180, quartos: 4, banheiros: 3, favorito: false, views: 189, leads: 8 },
    { id: 3, tipo: 'Cobertura', titulo: 'Cobertura Duplex - Beira Mar', cidade: 'Rio de Janeiro', preco: 1200000, area: 220, quartos: 5, banheiros: 4, favorito: true, views: 567, leads: 23 },
    { id: 4, tipo: 'Apartamento', titulo: 'Apartamento 2 Quartos - Vila Mariana', cidade: 'São Paulo', preco: 380000, area: 65, quartos: 2, banheiros: 1, favorito: false, views: 156, leads: 7 },
    { id: 5, tipo: 'Casa', titulo: 'Casa 3 Quartos - Morumbi', cidade: 'São Paulo', preco: 680000, area: 150, quartos: 3, banheiros: 2, favorito: true, views: 298, leads: 15 },
    { id: 6, tipo: 'Apartamento', titulo: 'Apartamento 1 Quarto - Brooklin', cidade: 'São Paulo', preco: 320000, area: 45, quartos: 1, banheiros: 1, favorito: false, views: 145, leads: 5 },
    { id: 7, tipo: 'Cobertura', titulo: 'Cobertura 4 Quartos - Itaim Bibi', cidade: 'São Paulo', preco: 1500000, area: 250, quartos: 4, banheiros: 4, favorito: false, views: 423, leads: 18 },
    { id: 8, tipo: 'Casa', titulo: 'Casa 5 Quartos - Alto de Pinheiros', cidade: 'São Paulo', preco: 2200000, area: 350, quartos: 5, banheiros: 5, favorito: false, views: 567, leads: 21 },
    { id: 9, tipo: 'Apartamento', titulo: 'Apartamento 2 Quartos - Pinheiros', cidade: 'São Paulo', preco: 420000, area: 70, quartos: 2, banheiros: 2, favorito: false, views: 201, leads: 9 },
    { id: 10, tipo: 'Casa', titulo: 'Casa 3 Quartos - Tatuapé', cidade: 'São Paulo', preco: 590000, area: 140, quartos: 3, banheiros: 2, favorito: false, views: 176, leads: 10 },
    { id: 11, tipo: 'Apartamento', titulo: 'Apartamento 3 Quartos - Moema', cidade: 'São Paulo', preco: 520000, area: 90, quartos: 3, banheiros: 2, favorito: true, views: 312, leads: 14 },
    { id: 12, tipo: 'Cobertura', titulo: 'Cobertura 3 Quartos - Leblon', cidade: 'Rio de Janeiro', preco: 2800000, area: 280, quartos: 3, banheiros: 3, favorito: false, views: 678, leads: 29 },
    { id: 13, tipo: 'Casa', titulo: 'Casa 4 Quartos - Perdizes', cidade: 'São Paulo', preco: 890000, area: 190, quartos: 4, banheiros: 3, favorito: false, views: 234, leads: 11 },
    { id: 14, tipo: 'Apartamento', titulo: 'Apartamento 2 Quartos - Santana', cidade: 'São Paulo', preco: 340000, area: 60, quartos: 2, banheiros: 1, favorito: false, views: 123, leads: 6 },
    { id: 15, tipo: 'Casa', titulo: 'Casa 3 Quartos - Campo Belo', cidade: 'São Paulo', preco: 720000, area: 160, quartos: 3, banheiros: 2, favorito: false, views: 189, leads: 8 },
    { id: 16, tipo: 'Apartamento', titulo: 'Apartamento 4 Quartos - Ipanema', cidade: 'Rio de Janeiro', preco: 1800000, area: 150, quartos: 4, banheiros: 3, favorito: true, views: 489, leads: 22 },
    { id: 17, tipo: 'Casa', titulo: 'Casa 2 Quartos - Vila Madalena', cidade: 'São Paulo', preco: 550000, area: 110, quartos: 2, banheiros: 2, favorito: false, views: 167, leads: 7 },
    { id: 18, tipo: 'Cobertura', titulo: 'Cobertura 5 Quartos - Barra da Tijuca', cidade: 'Rio de Janeiro', preco: 3200000, area: 320, quartos: 5, banheiros: 5, favorito: false, views: 789, leads: 34 },
    { id: 19, tipo: 'Apartamento', titulo: 'Apartamento 1 Quarto - Consolação', cidade: 'São Paulo', preco: 290000, area: 40, quartos: 1, banheiros: 1, favorito: false, views: 98, leads: 4 },
    { id: 20, tipo: 'Casa', titulo: 'Casa 4 Quartos - Granja Viana', cidade: 'Cotia', preco: 980000, area: 210, quartos: 4, banheiros: 3, favorito: false, views: 256, leads: 13 },
  ])

  // Dados com MUITO MAIS VEÍCULOS
  const [veiculos] = useState([
    { id: 1, marca: 'Toyota', modelo: 'Corolla XEI 2023', ano: 2023, km: 15000, preco: 145900, combustivel: 'Flex', cor: 'Prata', favorito: false, views: 345, leads: 15 },
    { id: 2, marca: 'Honda', modelo: 'Civic Touring 2023', ano: 2023, km: 8000, preco: 189900, combustivel: 'Gasolina', cor: 'Preto', favorito: true, views: 456, leads: 19 },
    { id: 3, marca: 'Jeep', modelo: 'Compass Limited 2024', ano: 2024, km: 0, preco: 165000, combustivel: 'Flex', cor: 'Branco', favorito: false, views: 289, leads: 11 },
    { id: 4, marca: 'Volkswagen', modelo: 'T-Cross Highline 2023', ano: 2023, km: 12000, preco: 135000, combustivel: 'Flex', cor: 'Azul', favorito: false, views: 234, leads: 9 },
    { id: 5, marca: 'Chevrolet', modelo: 'Onix Plus Premier 2023', ano: 2023, km: 18000, preco: 89900, combustivel: 'Flex', cor: 'Vermelho', favorito: true, views: 312, leads: 14 },
    { id: 6, marca: 'Hyundai', modelo: 'Creta Ultimate 2024', ano: 2024, km: 5000, preco: 148900, combustivel: 'Flex', cor: 'Cinza', favorito: false, views: 278, leads: 12 },
    { id: 7, marca: 'Toyota', modelo: 'Hilux SRX 2023', ano: 2023, km: 22000, preco: 289900, combustivel: 'Diesel', cor: 'Branco', favorito: false, views: 567, leads: 23 },
    { id: 8, marca: 'Fiat', modelo: 'Toro Ultra 2023', ano: 2023, km: 16000, preco: 178900, combustivel: 'Diesel', cor: 'Preto', favorito: false, views: 198, leads: 8 },
    { id: 9, marca: 'Nissan', modelo: 'Kicks Exclusive 2023', ano: 2023, km: 14000, preco: 119900, combustivel: 'Flex', cor: 'Laranja', favorito: false, views: 245, leads: 10 },
    { id: 10, marca: 'Renault', modelo: 'Duster Iconic 2024', ano: 2024, km: 3000, preco: 125900, combustivel: 'Flex', cor: 'Verde', favorito: false, views: 189, leads: 7 },
    { id: 11, marca: 'Honda', modelo: 'HR-V Touring 2023', ano: 2023, km: 10000, preco: 156900, combustivel: 'Gasolina', cor: 'Prata', favorito: true, views: 334, leads: 16 },
    { id: 12, marca: 'Volkswagen', modelo: 'Nivus Highline 2023', ano: 2023, km: 19000, preco: 118900, combustivel: 'Flex', cor: 'Branco', favorito: false, views: 223, leads: 9 },
    { id: 13, marca: 'Chevrolet', modelo: 'Tracker Premier 2024', ano: 2024, km: 7000, preco: 154900, combustivel: 'Flex', cor: 'Azul', favorito: false, views: 267, leads: 11 },
    { id: 14, marca: 'Peugeot', modelo: '2008 Griffe 2023', ano: 2023, km: 13000, preco: 129900, combustivel: 'Flex', cor: 'Cinza', favorito: false, views: 201, leads: 8 },
    { id: 15, marca: 'Jeep', modelo: 'Renegade Longitude 2023', ano: 2023, km: 20000, preco: 139900, combustivel: 'Flex', cor: 'Verde', favorito: false, views: 178, leads: 7 },
    { id: 16, marca: 'Toyota', modelo: 'SW4 SRX 2023', ano: 2023, km: 25000, preco: 389900, combustivel: 'Diesel', cor: 'Prata', favorito: true, views: 489, leads: 21 },
    { id: 17, marca: 'BMW', modelo: 'X1 sDrive20i 2023', ano: 2023, km: 12000, preco: 289900, combustivel: 'Gasolina', cor: 'Preto', favorito: false, views: 456, leads: 19 },
    { id: 18, marca: 'Audi', modelo: 'Q3 Prestige Plus 2023', ano: 2023, km: 9000, preco: 279900, combustivel: 'Gasolina', cor: 'Branco', favorito: false, views: 423, leads: 18 },
    { id: 19, marca: 'Mercedes-Benz', modelo: 'GLA 200 2023', ano: 2023, km: 11000, preco: 298900, combustivel: 'Gasolina', cor: 'Prata', favorito: false, views: 512, leads: 22 },
    { id: 20, marca: 'Volvo', modelo: 'XC60 T5 2023', ano: 2023, km: 15000, preco: 349900, combustivel: 'Gasolina', cor: 'Azul', favorito: true, views: 589, leads: 25 },
  ])

  const [agendamentos] = useState([
    { id: 1, tipo: 'Visita ao Imóvel', titulo: 'Apartamento 3 Quartos - Centro', data: '2025-10-18', hora: '14:30', cliente: 'João Silva', telefone: '+55 11 99999-9999', email: 'joao@email.com', status: 'Confirmado' },
    { id: 2, tipo: 'Test Drive', titulo: 'Honda Civic Touring', data: '2025-10-20', hora: '10:00', cliente: 'Maria Santos', telefone: '+55 11 98888-8888', email: 'maria@email.com', status: 'Pendente' },
    { id: 3, tipo: 'Visita ao Imóvel', titulo: 'Casa 4 Quartos - Jardim', data: '2025-10-19', hora: '16:00', cliente: 'Carlos Mendes', telefone: '+55 11 97777-7777', email: 'carlos@email.com', status: 'Confirmado' },
  ])

  // ══════════════════════════════════════════════════════════════
  // AUTENTICAÇÃO - FUNÇÕES
  // ══════════════════════════════════════════════════════════════

  // ✅ Verificação de login agora é feita SINCRONAMENTE na inicialização (acima)

  // Listener para mudanças no localStorage (sincronização entre abas)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'crm_user' || e.key === 'crm_isLoggedIn') {
        console.log('[CRM] Detectada mudança no localStorage')
        const storedUser = localStorage.getItem('crm_user')
        const storedIsLoggedIn = localStorage.getItem('crm_isLoggedIn')

        if (storedUser && storedIsLoggedIn === 'true') {
          try {
            const userData = JSON.parse(storedUser)
            setUser(userData)
            setIsLoggedIn(true)
            console.log('[CRM] ✅ Login detectado de outra aba:', userData.email)
          } catch (error) {
            console.error('[CRM] Erro ao processar mudança:', error)
            setUser(null)
            setIsLoggedIn(false)
          }
        } else {
          setUser(null)
          setIsLoggedIn(false)
          console.log('[CRM] ❌ Logout detectado de outra aba')
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Função de login
  const handleLogin = (userData) => {
    // Salvar no localStorage
    localStorage.setItem('crm_user', JSON.stringify(userData))
    localStorage.setItem('crm_isLoggedIn', 'true')

    setUser(userData)
    setIsLoggedIn(true)
    console.log('[CRM] ✅ Login realizado:', userData.email)
  }

  // Função de logout
  const handleLogout = () => {
    // Limpar dados ANTES de redirecionar
    localStorage.removeItem('crm_user')
    localStorage.removeItem('crm_isLoggedIn')
    console.log('[CRM] 👋 Logout realizado - Redirecionando para Landing Page')

    // Redirecionar IMEDIATAMENTE para a Landing Page (página inicial)
    // Usar replace para evitar voltar com botão "voltar" do navegador
    window.location.replace('http://localhost:5174')
  }

  // ❌ DESABILITADO: API antiga não existe mais
  /* // Buscar nicho da empresa ao carregar componente
  useEffect(() => {
    const fetchEmpresaNicho = async () => {
      try {
        console.log('[CRM Client] Buscando nicho da empresa...')
        const response = await fetch(`${VENDEAI_API_URL}/api/crm/nicho`, {
          credentials: 'include' // Incluir cookies de autenticação
        })

        console.log('[CRM Client] Resposta recebida:', response.status)

        if (response.ok) {
          const data = await response.json()
          console.log('[CRM Client] Dados recebidos:', data)

          if (data.success && data.nicho) {
            setEmpresaNicho(data.nicho)
            // Atualizar selectedType baseado no nicho
            setSelectedType(data.nicho === 'veiculos' ? 'veiculos' : 'imoveis')
            console.log('[CRM Client] Nicho da empresa:', data.nicho)
          } else {
            console.warn('[CRM Client] Nicho não definido nos dados, mantendo padrão')
          }
        } else {
          console.error('[CRM Client] Erro HTTP ao buscar nicho:', response.status, response.statusText)
        }
      } catch (error) {
        console.error('[CRM Client] Erro ao buscar nicho da empresa:', error)
        // Manter o padrão 'veiculos' já definido no useState
      }
    }

    fetchEmpresaNicho()
  }, []) */

  // ❌ DESABILITADO: API antiga não existe mais
  /* // Buscar estado do bot ao carregar componente
  useEffect(() => {
    const fetchBotStatus = async () => {
      try {
        console.log('[CRM Client] Buscando status do bot...')
        const response = await fetch(`${VENDEAI_API_URL}/api/crm/info`, {
          credentials: 'include' // Incluir cookies de autenticação
        })

        if (response.ok) {
          const data = await response.json()
          console.log('[CRM Client] Dados da empresa recebidos:', data)

          if (data.success && data.empresa) {
            setBotActive(data.empresa.bot_ativo)
            setBotStatus(data.empresa.whatsapp_conectado ? 'connected' : 'disconnected')
            setWhatsappNumber(data.empresa.whatsapp_numero)
            console.log('[CRM Client] Bot ativo:', data.empresa.bot_ativo)
            console.log('[CRM Client] WhatsApp conectado:', data.empresa.whatsapp_conectado)
          }
        } else {
          console.error('[CRM Client] Erro HTTP ao buscar status do bot:', response.status)
        }
      } catch (error) {
        console.error('[CRM Client] Erro ao buscar status do bot:', error)
      }
    }

    fetchBotStatus()
  }, []) */

  // ❌ DESABILITADO: Socket.IO antigo (API não existe mais)
  /*
  useEffect(() => {
    console.log('[CRM] Conectando ao WhatsApp Service...')
    const socketConnection = io(WHATSAPP_SERVICE_URL, {
      transports: ['websocket', 'polling']
    })

    socketConnection.on('connect', () => {
      console.log('[CRM] Conectado ao WhatsApp Service')
      socketConnection.emit('join-empresa', EMPRESA_ID)
    })

    socketConnection.on('current-status', (data) => {
      console.log('[CRM] Status atual:', data)
      if (data.connected) {
        setBotStatus('connected')
        setWhatsappNumber(data.numero)
        setShowQRCode(false)
        showNotificationMsg('WhatsApp já conectado!')
      } else if (data.qr) {
        setBotStatus('connecting')
        setQrCodeValue(data.qr)
        setShowQRCode(true)
      }
    })

    socketConnection.on('qr-generated', (data) => {
      console.log('[CRM] QR Code recebido')
      setBotStatus('connecting')
      setQrCodeValue(data.qr)
      setShowQRCode(true)
      showNotificationMsg(data.message)
    })

    socketConnection.on('connection-success', (data) => {
      console.log('[CRM] WhatsApp conectado!', data)
      setBotStatus('connected')
      setWhatsappNumber(data.numero)
      setShowQRCode(false)
      showNotificationMsg(data.message)
    })

    socketConnection.on('connection-lost', (data) => {
      console.log('[CRM] Conexão perdida:', data)
      setBotStatus('disconnected')
      setWhatsappNumber(null)
      setShowQRCode(false)
      setBotActive(false)
      showNotificationMsg(data.message)
    })

    socketConnection.on('disconnect', () => {
      console.log('[CRM] Desconectado do WhatsApp Service')
    })

    setSocket(socketConnection)

    // Cleanup
    return () => {
      socketConnection.disconnect()
    }
  }, [])
  */

  // Função para buscar configuração do bot do banco de dados
  const fetchBotConfigFromDB = async () => {
    try {
      const botConfig = getBotConfig()
      console.log(`[CRM] Buscando configuração do bot ${botConfig.name}...`)
      const response = await fetch(`${botConfig.apiUrl}/api/bot/config/${user?.empresa_id || 1}`)
      const data = await response.json()

      if (data.success) {
        console.log('[CRM] ✅ Configuração carregada:', data.data)
        setBotActive(data.data.botAtivo)
      } else {
        console.log('[CRM] ⚠️ Configuração não encontrada, usando padrão')
        setBotActive(false)
      }
    } catch (error) {
      console.error('[CRM] ❌ Erro ao buscar configuração:', error)
      setBotActive(false)
    }
  }

  // ✅ NOVO: WebSocket para bot-api-server
  useEffect(() => {
    if (typeof window === 'undefined' || !empresaNicho) return

    const botConfig = getBotConfig()
    console.log(`[CRM] Conectando ao Bot ${botConfig.name} (${botConfig.wsUrl})...`)
    let ws = null
    let reconnectTimeout = null
    let intentionalClose = false

    const connectWebSocket = () => {
      // Prevenir múltiplas conexões
      if (ws && ws.readyState === WebSocket.OPEN) {
        console.log('[CRM] ⚠️ WebSocket já está conectado, ignorando nova conexão')
        return
      }

      try {
        // ✅ MULTI-TENANT: Adicionar empresa_id ao WebSocket
        const empresaId = user?.empresa_id || 1
        console.log(`[CRM] 🔌 Criando WebSocket para empresa ${empresaId}...`)
        ws = new WebSocket(`${botConfig.wsUrl}?empresa_id=${empresaId}`)

        ws.onopen = () => {
          console.log(`[CRM] ✅ WebSocket conectado ao ${botConfig.name}`)
        }

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data)
            console.log('[CRM] 📨 Mensagem recebida:', message.type)

            if (message.type === 'status') {
              const status = message.data.connectionStatus
              setBotStatus(status)

              if (status === 'connected') {
                setShowQRCode(false)
                setWhatsappNumber(message.data.phoneNumber)
                showNotificationMsg(`${botConfig.name} conectado!`)

                // Buscar estado do bot do banco de dados
                fetchBotConfigFromDB()
              } else if (status === 'disconnected') {
                setShowQRCode(false)
                setWhatsappNumber(null)
                setBotActive(false) // Desativar quando desconectar
              }
            } else if (message.type === 'qr') {
              console.log('[CRM] 📱 QR Code recebido!')
              setQrCodeValue(message.data.qrCode)
              setShowQRCode(true)
              setBotStatus('connecting')
              setIsConnecting(false)
              showNotificationMsg('QR Code gerado! Escaneie com WhatsApp')
            }
          } catch (error) {
            console.error('[CRM] ❌ Erro ao processar mensagem:', error)
          }
        }

        ws.onerror = (error) => {
          console.error('[CRM] ❌ Erro no WebSocket:', error)
        }

        ws.onclose = () => {
          console.log('[CRM] ❌ WebSocket desconectado')

          // Só reconectar se não foi um close intencional
          if (!intentionalClose) {
            console.log('[CRM] 🔄 Reconectando em 3 segundos...')
            reconnectTimeout = setTimeout(() => {
              connectWebSocket()
            }, 3000)
          } else {
            console.log('[CRM] ✅ WebSocket fechado intencionalmente')
          }
        }
      } catch (error) {
        console.error('[CRM] ❌ Erro ao criar WebSocket:', error)
      }
    }

    connectWebSocket()

    return () => {
      console.log('[CRM] 🧹 Limpando WebSocket...')
      intentionalClose = true

      // Limpar timeout de reconexão
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
      }

      // Fechar WebSocket
      if (ws) {
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close()
        }
      }
    }
  }, [empresaNicho]) // Reconectar quando nicho mudar

  // Handler para arrastar e soltar no Kanban
  const onDragEnd = (result) => {
    const { source, destination } = result

    // Se não houver destino, cancelar
    if (!destination) return

    // Se soltou no mesmo lugar, cancelar
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    const sourceColumn = conversas[source.droppableId]
    const destColumn = conversas[destination.droppableId]

    // Se mover dentro da mesma coluna
    if (source.droppableId === destination.droppableId) {
      const newColumn = Array.from(sourceColumn)
      const [removed] = newColumn.splice(source.index, 1)
      newColumn.splice(destination.index, 0, removed)

      setConversas({
        ...conversas,
        [source.droppableId]: newColumn
      })
    } else {
      // Se mover entre colunas
      const sourceItems = Array.from(sourceColumn)
      const destItems = Array.from(destColumn)
      const [removed] = sourceItems.splice(source.index, 1)
      destItems.splice(destination.index, 0, removed)

      setConversas({
        ...conversas,
        [source.droppableId]: sourceItems,
        [destination.droppableId]: destItems
      })
    }
  }

  // Funções do Bot com QR Code REAL
  const generateQRCode = async () => {
    // ✅ Bloquear se já está conectado
    if (botStatus === 'connected') {
      showNotificationMsg('WhatsApp já está conectado! Desconecte primeiro para gerar novo QR Code.')
      return
    }

    if (isConnecting) {
      console.log('[CRM] Já está conectando, ignorando clique duplicado');
      return;
    }

    try {
      setIsConnecting(true);
      setBotStatus('connecting');
      const botConfig = getBotConfig()
      const empresaId = user?.empresa_id || 1
      showNotificationMsg(`Conectando ao ${botConfig.name}...`);

      // ✅ MULTI-TENANT: Conectar sessão específica da empresa
      console.log(`[CRM] Conectando empresa ${empresaId}...`);
      const connectResponse = await fetch(`${botConfig.apiUrl}/api/bot/connect/${empresaId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (connectResponse.ok) {
        showNotificationMsg('Conectando... Aguarde o QR Code');
        // O QR code virá via WebSocket
      } else {
        const errorData = await connectResponse.json();
        throw new Error(errorData.error || 'Falha ao conectar');
      }
    } catch (error) {
      console.error('[CRM] Erro ao gerar QR Code:', error)
      setBotStatus('disconnected')
      showNotificationMsg('Erro ao conectar WhatsApp: ' + error.message)
      setIsConnecting(false)
    }
    // Não setIsConnecting(false) aqui - deixar o WebSocket fazer isso quando receber o QR
  }

  const disconnectBot = async () => {
    try {
      const botConfig = getBotConfig()
      const empresaId = user?.empresa_id || 1
      // ✅ MULTI-TENANT: Desconectar sessão específica da empresa
      const response = await fetch(`${botConfig.apiUrl}/api/bot/disconnect/${empresaId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success) {
        setBotStatus('disconnected')
        setBotActive(false)
        setShowQRCode(false)
        setQrCodeValue('')
        setWhatsappNumber(null)
        showNotificationMsg('WhatsApp desconectado')
      }
    } catch (error) {
      console.error('[CRM] Erro ao desconectar:', error)
      showNotificationMsg('Erro ao desconectar WhatsApp')
    }
  }

  const clearSession = async () => {
    try {
      showNotificationMsg('Limpando sessão...')
      const botConfig = getBotConfig()
      const empresaId = user?.empresa_id || 1
      // ✅ MULTI-TENANT: Usar disconnect ao invés de clear (faz logout completo)
      const response = await fetch(`${botConfig.apiUrl}/api/bot/disconnect/${empresaId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success) {
        setBotStatus('disconnected')
        setBotActive(false)
        setShowQRCode(false)
        setQrCodeValue('')
        setWhatsappNumber(null)
        showNotificationMsg(data.message)
      }
    } catch (error) {
      console.error('[CRM] Erro ao limpar sessão:', error)
      showNotificationMsg('Erro ao limpar sessão')
    }
  }

  const toggleBot = async () => {
    if (botStatus !== 'connected') {
      showNotificationMsg('Conecte o WhatsApp primeiro!')
      return
    }

    try {
      const botConfig = getBotConfig()
      const response = await fetch(`${botConfig.apiUrl}/api/bot/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          empresaId: user?.empresa_id || 1,
          botAtivo: !botActive
        })
      })

      const data = await response.json()

      if (data.success) {
        setBotActive(data.bot_ativo)
        showNotificationMsg(data.message)
        console.log('[CRM] Bot status atualizado no banco:', data.bot_ativo)
      } else {
        throw new Error(data.error || 'Erro ao atualizar status do bot')
      }
    } catch (error) {
      console.error('[CRM] Erro ao alternar bot:', error)
      showNotificationMsg('Erro ao atualizar status do bot: ' + error.message)
    }
  }

  const showNotificationMsg = (message) => {
    setNotificationMessage(message)
    setShowNotification(true)
    setTimeout(() => {
      setShowNotification(false)
    }, 3000)
  }

  // Funções dos botões de ação
  const handleCall = (telefone, nome) => {
    showNotificationMsg(`Ligando para ${nome}...`)
    // Em uma aplicação real, isso poderia abrir o aplicativo de telefone
    window.open(`tel:${telefone}`, '_self')
  }

  const handleWhatsApp = (telefone, nome) => {
    showNotificationMsg(`Abrindo WhatsApp de ${nome}...`)
    // Formatar o número removendo caracteres especiais
    const cleanPhone = telefone.replace(/\D/g, '')
    window.open(`https://wa.me/${cleanPhone}`, '_blank')
  }

  const handleEmail = (email, nome) => {
    showNotificationMsg(`Abrindo email para ${nome}...`)
    window.open(`mailto:${email}`, '_blank')
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(price)
  }

  // Renderização das páginas
  const renderPage = () => {
    console.log('[CRM] Renderizando página:', currentPage)
    console.log('[CRM] Nicho da empresa:', empresaNicho)
    console.log('[CRM] Bot status:', botStatus)

    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard
            user={user}
            botConfig={getBotConfig()}
            onNavigate={setCurrentPage}
            showNotification={showNotificationMsg}
          />
        )

      case 'whatsapp':
        return (
          <WhatsAppConnection
            user={user}
            botConfig={getBotConfig()}
            showNotification={showNotificationMsg}
          />
        )

      case 'bot-settings':
        return (
          <BotSettings
            user={user}
            showNotification={showNotificationMsg}
          />
        )

      case 'bot':
        return (
          <div className="p-6 space-y-6">
            {/* Notificação */}
            {showNotification && (
              <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <p className="text-green-400 font-medium">{notificationMessage}</p>
              </div>
            )}

            {/* Loading do Nicho */}
            {nichoLoading && (
              <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 flex items-center gap-3">
                <RefreshCw className="h-5 w-5 text-blue-400 animate-spin" />
                <p className="text-blue-400 font-medium">Carregando configurações...</p>
              </div>
            )}

            {/* Status e Controle do Bot */}
            <Card className="bg-[#1e293b] border-[#334155]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Gerenciamento do Bot {getBotConfig().name} {getBotConfig().icon}
                </CardTitle>
                <CardDescription className="text-gray-400">
                  {empresaNicho === 'veiculos'
                    ? 'Bot especializado em vendas de veículos com integração FIPE e simulador de financiamento'
                    : empresaNicho === 'imoveis'
                    ? 'Bot especializado em vendas de imóveis com agendamento de visitas e simulação de financiamento'
                    : 'Bot de atendimento inteligente'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Controles Principais */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Status Conexão */}
                  <div className="bg-[#0f172a] border border-[#334155] rounded-lg p-6">
                    <h3 className="text-white font-semibold mb-4">Status da Conexão</h3>
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`h-3 w-3 rounded-full ${
                        botStatus === 'connected' ? 'bg-green-500' :
                        botStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                        'bg-red-500'
                      }`}></div>
                      <span className="text-white font-medium">
                        {botStatus === 'connected' ? 'Conectado' :
                         botStatus === 'connecting' ? 'Conectando...' :
                         'Desconectado'}
                      </span>
                    </div>

                    {botStatus === 'disconnected' && (
                      <div className="space-y-2">
                        <Button
                          onClick={generateQRCode}
                          disabled={isConnecting}
                          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isConnecting ? (
                            <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Conectando...</>
                          ) : (
                            <><QrCode className="h-4 w-4 mr-2" />Conectar WhatsApp</>
                          )}
                        </Button>
                        <Button onClick={clearSession} variant="outline" className="w-full border-gray-500 text-gray-400 hover:bg-gray-500/10 text-xs">
                          <RefreshCw className="h-3 w-3 mr-2" />
                          Limpar Sessão (se travar)
                        </Button>
                      </div>
                    )}

                    {botStatus === 'connected' && (
                      <Button onClick={disconnectBot} variant="outline" className="w-full border-red-500 text-red-500 hover:bg-red-500/10">
                        Desconectar
                      </Button>
                    )}
                  </div>

                  {/* Status Bot */}
                  <div className="bg-[#0f172a] border border-[#334155] rounded-lg p-6">
                    <h3 className="text-white font-semibold mb-4">Status do Bot</h3>
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`h-3 w-3 rounded-full ${botActive ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                      <span className="text-white font-medium">
                        {botActive ? 'Ativo (Respondendo)' : 'Pausado'}
                      </span>
                    </div>

                    <Button
                      onClick={toggleBot}
                      disabled={botStatus !== 'connected'}
                      className={`w-full ${botActive ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'}`}
                    >
                      <Power className="h-4 w-4 mr-2" />
                      {botActive ? 'Bot Ativo (Desativar)' : 'Ativar Bot'}
                    </Button>
                  </div>
                </div>

                {/* QR Code REAL */}
                {showQRCode && qrCodeValue && (
                  <div className="bg-[#0f172a] border border-[#334155] rounded-lg p-6">
                    <h3 className="text-white font-semibold mb-4 text-center">Escaneie o QR Code</h3>
                    <div className="bg-white p-4 rounded-lg mx-auto w-fit mb-4">
                      {/* Usar img diretamente pois o QR já vem como base64 do whatsapp-web.js */}
                      <img
                        src={qrCodeValue}
                        alt="QR Code WhatsApp"
                        className="w-64 h-64"
                      />
                    </div>
                    <div className="text-sm text-gray-400 space-y-2">
                      <p className="font-medium text-white">Como conectar:</p>
                      <ol className="space-y-1 list-decimal list-inside">
                        <li>Abra o WhatsApp no seu celular</li>
                        <li>Toque em Menu e selecione "Aparelhos conectados"</li>
                        <li>Toque em "Conectar um aparelho"</li>
                        <li>Aponte para este código</li>
                      </ol>
                    </div>
                  </div>
                )}

                {/* Estatísticas do Bot */}
                {botStatus === 'connected' && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-[#0f172a] border border-[#334155] rounded-lg p-4 text-center">
                      <MessageSquare className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">{stats.conversasAtivas}</div>
                      <p className="text-xs text-gray-400">Conversas Hoje</p>
                    </div>
                    <div className="bg-[#0f172a] border border-[#334155] rounded-lg p-4 text-center">
                      <Activity className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">{stats.respostaMedia}</div>
                      <p className="text-xs text-gray-400">Tempo Resposta</p>
                    </div>
                    <div className="bg-[#0f172a] border border-[#334155] rounded-lg p-4 text-center">
                      <Users className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">{stats.leadsQualificados}</div>
                      <p className="text-xs text-gray-400">Leads Gerados</p>
                    </div>
                    <div className="bg-[#0f172a] border border-[#334155] rounded-lg p-4 text-center">
                      <CheckCircle className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">{stats.satisfacao}%</div>
                      <p className="text-xs text-gray-400">Satisfação</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Configurações do Bot */}
            <BotConfiguracoes
              user={user}
              botConfig={getBotConfig()}
              showNotification={showNotificationMsg}
            />
          </div>
        )

      case 'conversations':
        return (
          <Conversations
            user={user}
            botConfig={getBotConfig()}
            showNotification={showNotificationMsg}
          />
        )

      case 'products':
        return (
          <Products
            user={user}
            nicho={empresaNicho}
          />
        )

      case 'deals':
        return (
          <Sales
            user={user}
            botConfig={getBotConfig()}
            showNotification={showNotificationMsg}
          />
        )

      case 'appointments':
        return (
          <Appointments
            user={user}
            botConfig={getBotConfig()}
            showNotification={showNotificationMsg}
          />
        )

      case 'calendar':
        return (
          <AppointmentCalendar
            user={user}
            botConfig={getBotConfig()}
            showNotification={showNotificationMsg}
          />
        )

      case 'imoveis':
        return (
          <div className="p-6">
            <Card className="bg-[#1e293b] border-[#334155]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Meus Imóveis</CardTitle>
                    <CardDescription className="text-gray-400">Gerencie seu portfólio de {imoveis.length} imóveis</CardDescription>
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Imóvel
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {imoveis.map((imovel) => (
                    <Card key={imovel.id} className="bg-[#0f172a] border-[#334155] hover:border-blue-500 transition-colors">
                      <CardContent className="p-0">
                        <div className="bg-gradient-to-br from-blue-900 to-purple-900 h-48 flex items-center justify-center text-6xl">
                          🏢
                        </div>
                        <div className="p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                                {imovel.tipo}
                              </span>
                              <h3 className="text-white font-semibold mt-2">{imovel.titulo}</h3>
                            </div>
                            <button className="text-gray-400 hover:text-red-500">
                              <Heart className={`h-5 w-5 ${imovel.favorito ? 'fill-red-500 text-red-500' : ''}`} />
                            </button>
                          </div>
                          <div className="flex items-center text-sm text-gray-400">
                            <MapPin className="h-4 w-4 mr-1" />
                            {imovel.cidade}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <div className="flex items-center">
                              <Bed className="h-4 w-4 mr-1" />
                              {imovel.quartos}
                            </div>
                            <div className="flex items-center">
                              <Bath className="h-4 w-4 mr-1" />
                              {imovel.banheiros}
                            </div>
                            <div className="flex items-center">
                              <Square className="h-4 w-4 mr-1" />
                              {imovel.area}m²
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center">
                              <Eye className="h-3 w-3 mr-1" />
                              {imovel.views} views
                            </div>
                            <div className="flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              {imovel.leads} leads
                            </div>
                          </div>
                          <div className="border-t border-[#334155] pt-3">
                            <div className="text-2xl font-bold text-blue-400">
                              {formatPrice(imovel.preco)}
                            </div>
                            <div className="flex gap-2 mt-3">
                              <Button className="flex-1 bg-blue-600 hover:bg-blue-700" size="sm">
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </Button>
                              <Button variant="outline" className="bg-[#1e293b] border-[#334155] text-white hover:bg-[#334155]" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'veiculos':
        return <CRMVeiculos user={user} botConfig={getBotConfig()} />

      case 'favorites':
        return (
          <div className="p-6">
            <Card className="bg-[#1e293b] border-[#334155]">
              <CardHeader>
                <CardTitle className="text-white">Favoritos</CardTitle>
                <CardDescription className="text-gray-400">Itens salvos e marcados como favoritos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...imoveis.filter(i => i.favorito), ...veiculos.filter(v => v.favorito)].map((item) => (
                    <Card key={item.id} className="bg-[#0f172a] border-[#334155]">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className="bg-gradient-to-br from-blue-900 to-purple-900 w-32 h-32 flex-shrink-0 rounded-lg flex items-center justify-center text-4xl">
                            {item.tipo ? '🏢' : '🚗'}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                                  {item.tipo || item.marca}
                                </span>
                                <h3 className="text-white font-semibold mt-1">{item.titulo || item.modelo}</h3>
                              </div>
                              <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                            </div>
                            <div className="text-lg font-bold text-blue-400 mb-2">
                              {formatPrice(item.preco)}
                            </div>
                            <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Ver Detalhes
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'reports':
        return <Reports user={user} botConfig={getBotConfig()} showNotification={showNotificationMsg} />

      case 'settings':
        return (
          <div className="p-6">
            <Card className="bg-[#1e293b] border-[#334155]">
              <CardHeader>
                <CardTitle className="text-white">Configurações</CardTitle>
                <CardDescription className="text-gray-400">Gerencie as preferências do sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-white font-semibold mb-4">Dados da Empresa</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 block mb-2">Nome da Empresa</label>
                      <input
                        type="text"
                        defaultValue="Imobiliária XYZ"
                        className="w-full bg-[#0f172a] border border-[#334155] rounded-lg p-3 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 block mb-2">CNPJ</label>
                      <input
                        type="text"
                        defaultValue="12.345.678/0001-90"
                        className="w-full bg-[#0f172a] border border-[#334155] rounded-lg p-3 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 block mb-2">Telefone</label>
                      <input
                        type="text"
                        defaultValue="+55 11 99999-9999"
                        className="w-full bg-[#0f172a] border border-[#334155] rounded-lg p-3 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 block mb-2">E-mail</label>
                      <input
                        type="email"
                        defaultValue="contato@imobiliariaxyz.com"
                        className="w-full bg-[#0f172a] border border-[#334155] rounded-lg p-3 text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#334155] pt-6">
                  <h3 className="text-white font-semibold mb-4">Notificações</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-[#0f172a] border border-[#334155] rounded-lg">
                      <span className="text-white">Notificar novos leads</span>
                      <div className="w-12 h-6 bg-blue-600 rounded-full cursor-pointer"></div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[#0f172a] border border-[#334155] rounded-lg">
                      <span className="text-white">Notificar agendamentos</span>
                      <div className="w-12 h-6 bg-blue-600 rounded-full cursor-pointer"></div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[#0f172a] border border-[#334155] rounded-lg">
                      <span className="text-white">Notificar mensagens do bot</span>
                      <div className="w-12 h-6 bg-gray-600 rounded-full cursor-pointer"></div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#334155] pt-6">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Salvar Configurações
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'importar-estoque':
        return (
          <div className="p-6">
            <Card className="bg-[#1e293b] border-[#334155]">
              <CardHeader>
                <CardTitle className="text-white">Importar Estoque de Veículos</CardTitle>
                <CardDescription className="text-gray-400">
                  Faça upload de um arquivo Excel (.xlsx, .xls) ou CSV com os dados dos veículos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-2 border-dashed border-[#334155] rounded-lg p-12 text-center hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".xlsx,.xls,.csv"
                    onChange={async (e) => {
                      const file = e.target.files[0]
                      if (!file) return

                      const formData = new FormData()
                      formData.append('file', file)
                      formData.append('empresa_id', user.empresa_id)

                      try {
                        const response = await fetch('http://localhost:5000/api/veiculos/importar', {
                          method: 'POST',
                          body: formData
                        })

                        const data = await response.json()

                        if (data.success) {
                          alert(`✅ ${data.importados} veículos importados com sucesso!`)
                          setCurrentPage('veiculos') // Redirecionar para a página de veículos
                        } else {
                          alert(`❌ Erro: ${data.error}`)
                        }
                      } catch (error) {
                        alert(`❌ Erro ao importar: ${error.message}`)
                      }
                    }}
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer"
                  >
                    <div className="mx-auto w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
                      <Upload className="h-8 w-8 text-blue-500" />
                    </div>
                    <p className="text-white font-medium mb-2">Clique para selecionar ou arraste o arquivo aqui</p>
                    <p className="text-sm text-gray-400">Formatos aceitos: .xlsx, .xls, .csv</p>
                  </label>
                </div>

                <div className="bg-[#0f172a] border border-[#334155] rounded-lg p-6">
                  <h3 className="text-white font-semibold mb-4">📋 Formato do Arquivo</h3>
                  <div className="text-sm text-gray-400 space-y-2">
                    <p className="font-medium text-white">Colunas Obrigatórias:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Marca (ex: Volkswagen, Chevrolet, Fiat)</li>
                      <li>Modelo (ex: Gol, Onix, Uno)</li>
                      <li>Ano (ex: 2020, 2021)</li>
                      <li>KM (ex: 50000, 30000)</li>
                      <li>Preço (ex: 45000, 55000)</li>
                      <li>Combustível (ex: Flex, Gasolina, Diesel)</li>
                    </ul>
                    <p className="font-medium text-white mt-4">Colunas Opcionais:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Cor (ex: Preto, Branco, Prata)</li>
                      <li>Descrição (ex: "Completo, único dono")</li>
                      <li>Fotos (URLs separadas por vírgula ou ponto-e-vírgula)</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setCurrentPage('veiculos')}
                    className="bg-[#334155] hover:bg-[#475569] text-white"
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return <div className="p-6 text-white">Página não encontrada</div>
    }
  }

  // ══════════════════════════════════════════════════════════════
  // RENDERIZAÇÃO CONDICIONAL: Login ou CRM
  // ══════════════════════════════════════════════════════════════

  // Mostrar login se não estiver logado
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />
  }

  // Mostrar loading enquanto verifica setup
  if (checkingSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a1f' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Carregando...</p>
        </div>
      </div>
    )
  }

  // Mostrar Setup se precisar
  if (needsSetup) {
    return <Setup onComplete={() => setNeedsSetup(false)} />
  }

  // Mostrar CRM com menu dinâmico baseado no nicho
  console.log('[CRM Cliente] 🎯 Carregando CRM para nicho:', empresaNicho)

  return (
    <ClientLayout
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      user={user}
      onLogout={handleLogout}
      nicho={empresaNicho}
    >
      {renderPage()}
    </ClientLayout>
  )
}

export default App
