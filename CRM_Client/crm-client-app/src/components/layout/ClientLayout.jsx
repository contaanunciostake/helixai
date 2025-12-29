import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Bot, MessageSquare, TrendingUp, Calendar, Heart, Building2, Car,
  Settings, BarChart3, Menu, X, LogOut, Power, QrCode, Upload, Database, Circle,
  Sparkles, Package, Send, Smile, Clock, DollarSign, BookOpen, Plug, Users,
  ChevronDown, ChevronRight, ShoppingCart, Truck, FileText, UserCheck, Factory,
  Boxes, ClipboardList, Receipt, MapPin, CreditCard, Warehouse, Tags, Calculator,
  PieChart, Home, Wrench, Palette, Paintbrush, Droplets, History, Pipette, Store
} from 'lucide-react';

export function ClientLayout({ children, currentPage, onPageChange, user, onLogout, nicho }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [catalogoOpen, setCatalogoOpen] = useState(false);
  const [operacoesOpen, setOperacoesOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar tamanho da tela
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ══════════════════════════════════════════════════════════════
  // MENU ESPECÍFICO: VEÍCULOS
  // ══════════════════════════════════════════════════════════════
  const menuVeiculos = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'whatsapp', label: 'Conexão WhatsApp', icon: Bot },
    { id: 'separator-1', isSeparator: true, label: 'CATÁLOGO' },
    { id: 'products', label: 'Veículos', icon: Car },
    { id: 'importar-estoque', label: 'Importar Veículos', icon: Upload },
    { id: 'separator-2', isSeparator: true, label: 'COMERCIAL' },
    { id: 'deals', label: 'Vendas', icon: TrendingUp },
    { id: 'appointments', label: 'Test Drives', icon: Calendar },
    { id: 'calendar', label: 'Calendário', icon: Calendar },
    { id: 'separator-3', isSeparator: true, label: 'GESTÃO' },
    { id: 'veiculos', label: 'Monitor Sistema', icon: Database },
    { id: 'team', label: 'Equipe', icon: Users },
    { id: 'reports', label: 'Relatórios', icon: BarChart3 },
  ];

  // ══════════════════════════════════════════════════════════════
  // MENU ESPECÍFICO: ATACADO/VAREJO
  // ══════════════════════════════════════════════════════════════
  const menuAtacadoVarejo = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'whatsapp', label: 'Conexão WhatsApp', icon: Bot },
    { id: 'separator-1', isSeparator: true, label: 'CATÁLOGO' },
    {
      id: 'catalogo-dropdown',
      label: 'Produtos',
      icon: Package,
      isDropdown: true,
      dropdownState: 'catalogoOpen',
      children: [
        { id: 'products', label: 'Todos os Produtos', icon: Boxes },
        { id: 'categorias', label: 'Categorias', icon: Tags },
        { id: 'importar-produtos', label: 'Importar Excel', icon: Upload },
        { id: 'marcas', label: 'Marcas', icon: Factory },
      ]
    },
    { id: 'estoque', label: 'Controle de Estoque', icon: Warehouse },
    { id: 'separator-2', isSeparator: true, label: 'OPERAÇÕES' },
    {
      id: 'operacoes-dropdown',
      label: 'Vendas & Pedidos',
      icon: ShoppingCart,
      isDropdown: true,
      dropdownState: 'operacoesOpen',
      children: [
        { id: 'pedidos', label: 'Pedidos', icon: ClipboardList },
        { id: 'orcamentos', label: 'Orçamentos', icon: Calculator },
        { id: 'deals', label: 'Vendas Realizadas', icon: TrendingUp },
      ]
    },
    { id: 'entregas', label: 'Entregas', icon: Truck },
    { id: 'agendamentos', label: 'Agendamentos', icon: Calendar },
    { id: 'separator-3', isSeparator: true, label: 'CADASTROS' },
    { id: 'clientes', label: 'Clientes', icon: UserCheck },
    { id: 'fornecedores', label: 'Fornecedores', icon: Factory },
    { id: 'separator-4', isSeparator: true, label: 'GESTÃO' },
    { id: 'team', label: 'Equipe', icon: Users },
    { id: 'reports', label: 'Relatórios', icon: BarChart3 },
    { id: 'separator-5', isSeparator: true, label: 'CONFIGURAÇÕES' },
    { id: 'loja-virtual', label: 'Loja Virtual', icon: Store },
    { id: 'config-empresa', label: 'Minha Empresa', icon: Wrench },
  ];

  // ══════════════════════════════════════════════════════════════
  // MENU ESPECÍFICO: IMÓVEIS
  // ══════════════════════════════════════════════════════════════
  const menuImoveis = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'whatsapp', label: 'Conexão WhatsApp', icon: Bot },
    { id: 'separator-1', isSeparator: true, label: 'IMÓVEIS' },
    { id: 'products', label: 'Meus Imóveis', icon: Building2 },
    { id: 'imoveis', label: 'Cadastrar Imóvel', icon: Home },
    { id: 'separator-2', isSeparator: true, label: 'COMERCIAL' },
    { id: 'deals', label: 'Negociações', icon: TrendingUp },
    { id: 'appointments', label: 'Visitas', icon: MapPin },
    { id: 'calendar', label: 'Calendário', icon: Calendar },
    { id: 'separator-3', isSeparator: true, label: 'GESTÃO' },
    { id: 'team', label: 'Corretores', icon: Users },
    { id: 'reports', label: 'Relatórios', icon: BarChart3 },
  ];

  // ══════════════════════════════════════════════════════════════
  // MENU ESPECÍFICO: LOJA DE TINTAS
  // ══════════════════════════════════════════════════════════════
  const menuLojaTintas = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'whatsapp', label: 'Conexão WhatsApp', icon: Bot },
    { id: 'separator-1', isSeparator: true, label: 'CATÁLOGO' },
    {
      id: 'catalogo-dropdown',
      label: 'Tintas',
      icon: Paintbrush,
      isDropdown: true,
      dropdownState: 'catalogoOpen',
      children: [
        { id: 'products', label: 'Catalogo de Tintas', icon: Paintbrush },
        { id: 'paleta_cores', label: 'Paleta de Cores', icon: Palette },
        { id: 'importar-produtos', label: 'Importar Excel', icon: Upload },
      ]
    },
    { id: 'calculadora', label: 'Calculadora', icon: Calculator },
    { id: 'separator-2', isSeparator: true, label: 'VENDAS' },
    {
      id: 'operacoes-dropdown',
      label: 'Vendas & Orcamentos',
      icon: ShoppingCart,
      isDropdown: true,
      dropdownState: 'operacoesOpen',
      children: [
        { id: 'orcamentos_tintas', label: 'Orcamentos', icon: ClipboardList },
        { id: 'deals', label: 'Vendas Realizadas', icon: TrendingUp },
        { id: 'pedidos', label: 'Pedidos', icon: Receipt },
      ]
    },
    { id: 'entregas', label: 'Entregas', icon: Truck },
    { id: 'separator-3', isSeparator: true, label: 'CLIENTES' },
    { id: 'clientes', label: 'Clientes', icon: UserCheck },
    { id: 'historico_cores', label: 'Historico de Cores', icon: History },
    { id: 'separator-4', isSeparator: true, label: 'GESTÃO' },
    { id: 'team', label: 'Equipe', icon: Users },
    { id: 'reports', label: 'Relatorios', icon: BarChart3 },
    { id: 'separator-5', isSeparator: true, label: 'CONFIGURAÇÕES' },
    { id: 'loja-virtual', label: 'Loja Virtual', icon: Store },
    { id: 'config-empresa', label: 'Minha Loja', icon: Wrench },
  ];

  // ══════════════════════════════════════════════════════════════
  // SELECIONAR MENU BASEADO NO NICHO
  // ══════════════════════════════════════════════════════════════
  const getMenuByNicho = () => {
    switch (nicho) {
      case 'veiculos':
        return menuVeiculos;
      case 'atacado_varejo':
        return menuAtacadoVarejo;
      case 'loja_tintas':
        return menuLojaTintas; // Menu específico para Loja de Tintas
      case 'imoveis':
        return menuImoveis;
      default:
        return menuVeiculos; // Menu padrão
    }
  };

  const menuItems = getMenuByNicho();

  // Título do painel por nicho
  const getPanelTitle = () => {
    switch (nicho) {
      case 'veiculos': return 'Painel Veículos';
      case 'atacado_varejo': return 'Painel Varejo';
      case 'loja_tintas': return 'Painel Tintas';
      case 'imoveis': return 'Painel Imóveis';
      default: return 'Painel Cliente';
    }
  };

  // Gerenciar estados dos dropdowns
  const getDropdownState = (stateName) => {
    switch (stateName) {
      case 'catalogoOpen': return catalogoOpen;
      case 'operacoesOpen': return operacoesOpen;
      default: return false;
    }
  };

  const toggleDropdown = (stateName) => {
    switch (stateName) {
      case 'catalogoOpen': setCatalogoOpen(!catalogoOpen); break;
      case 'operacoesOpen': setOperacoesOpen(!operacoesOpen); break;
    }
  };

  // Auto-abrir dropdown se página filha estiver ativa
  useEffect(() => {
    menuItems.forEach(item => {
      if (item.isDropdown && item.children) {
        const isChildActive = item.children.some(child => child.id === currentPage);
        if (isChildActive) {
          switch (item.dropdownState) {
            case 'catalogoOpen': setCatalogoOpen(true); break;
            case 'operacoesOpen': setOperacoesOpen(true); break;
          }
        }
      }
    });
  }, [currentPage, nicho]);

  // Encontrar label da página atual (incluindo filhos de dropdowns)
  const getCurrentPageLabel = () => {
    for (const item of menuItems) {
      if (item.id === currentPage) return item.label;
      if (item.children) {
        const child = item.children.find(c => c.id === currentPage);
        if (child) return child.label;
      }
    }
    return 'Dashboard';
  };

  // Fechar sidebar mobile ao clicar em item do menu
  const handlePageChange = (pageId) => {
    onPageChange(pageId);
    if (isMobile) {
      setIsMobileSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-black overflow-hidden w-full max-w-full relative">
      {/* Grid Pattern Background */}
      <div className="fixed inset-0 z-0 pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '4rem 4rem',
        maskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, #000 70%, transparent 110%)'
      }}></div>

      {/* Stars - apenas em desktop para performance */}
      {!isMobile && Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="fixed w-1 h-1 bg-white rounded-full pointer-events-none"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            zIndex: 0,
            animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite ${Math.random() * 3}s`
          }}
        />
      ))}

      {/* Mobile Overlay */}
      {isMobile && isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar Verde Neon - Responsiva */}
      <aside className={`
        ${isMobile
          ? `fixed top-0 left-0 h-full w-72 transform transition-transform duration-300 ease-in-out z-50 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
          : `${isSidebarOpen ? 'w-72' : 'w-20'} relative transition-all duration-500 ease-in-out`
        }
        flex flex-col flex-shrink-0 z-10
      `}>
        {/* Glass Effect Background */}
        <div className="absolute inset-0 card-glass border-r border-white/8">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Logo Section */}
          <div className="h-20 flex items-center justify-between px-5 border-b border-white/10">
            {isSidebarOpen && (
              <div className="flex items-center space-x-2">
                <img
                  src="/AIra_Logotipo.png"
                  alt="AIRA Logo"
                  className="h-8 w-auto"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.4))' }}
                />
                <div>
                  <p className="text-xs text-white/60 font-medium">{getPanelTitle()}</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="relative text-white/60 hover:text-white p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-green-500/30 transition-all duration-300 hover:scale-110"
            >
              {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto py-3 scrollbar-thin scrollbar-thumb-green-500/30 scrollbar-track-transparent">
            {menuItems.map((item, index) => {
              // Separador de seção
              if (item.isSeparator) {
                return isSidebarOpen ? (
                  <div key={item.id} className="px-4 py-2 mt-2">
                    <span className="text-[10px] font-bold text-white/30 tracking-wider uppercase">
                      {item.label}
                    </span>
                  </div>
                ) : (
                  <div key={item.id} className="mx-3 my-2 h-px bg-white/10"></div>
                );
              }

              const Icon = item.icon;
              const isActive = currentPage === item.id;
              const isDropdownOpen = item.isDropdown && getDropdownState(item.dropdownState);
              const isChildActive = item.isDropdown && item.children?.some(child => child.id === currentPage);

              // Se for um dropdown
              if (item.isDropdown) {
                return (
                  <div key={item.id} className="relative">
                    {/* Botão principal do dropdown */}
                    <button
                      onClick={() => toggleDropdown(item.dropdownState)}
                      className="w-full group relative overflow-hidden transition-all duration-300"
                    >
                      {isChildActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/5 to-green-500/10"></div>
                      )}

                      <div className={`relative flex items-center ${isSidebarOpen ? 'space-x-4 px-4 py-3' : 'justify-center px-3 py-3'} transition-all duration-300 border-l-4 ${
                        isChildActive
                          ? 'bg-gradient-to-r from-green-500/20 to-emerald-600/20 text-white shadow-lg shadow-green-500/30 border-l-green-400'
                          : 'border-l-transparent hover:border-l-green-400/50 hover:bg-gradient-to-r hover:from-green-500/10 hover:to-emerald-600/10 text-white/70 hover:text-white'
                      }`}>
                        <div className={`flex items-center justify-center flex-shrink-0 h-10 w-10 rounded-xl ${
                          isChildActive
                            ? 'bg-gradient-to-br from-green-500/30 to-emerald-600/30 shadow-lg shadow-green-500/30'
                            : 'bg-white/5 group-hover:bg-gradient-to-br group-hover:from-green-500/20 group-hover:to-emerald-600/20'
                        }`}>
                          <Icon className={`h-5 w-5 ${isChildActive ? 'text-green-400' : 'text-white/80 group-hover:text-green-400'}`} />
                        </div>

                        {isSidebarOpen && (
                          <>
                            <span className={`font-semibold text-sm flex-1 text-left ${
                              isChildActive
                                ? 'bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent'
                                : 'text-white/90 group-hover:text-white'
                            }`}>
                              {item.label}
                            </span>
                            <div className={`flex items-center justify-center h-6 w-6 rounded-lg ${
                              isDropdownOpen ? 'bg-green-500/20' : 'bg-white/5'
                            }`}>
                              {isDropdownOpen ? (
                                <ChevronDown className="h-4 w-4 text-green-400" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-white/70" />
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </button>

                    {/* Itens do dropdown */}
                    {isDropdownOpen && isSidebarOpen && (
                      <div className="relative overflow-hidden bg-gradient-to-b from-black/40 via-black/30 to-black/20 backdrop-blur-sm border-l-2 border-green-500/10 ml-4">
                        {item.children.map((child) => {
                          const ChildIcon = child.icon;
                          const isChildItemActive = currentPage === child.id;

                          return (
                            <button
                              key={child.id}
                              onClick={() => handlePageChange(child.id)}
                              className="w-full group relative overflow-hidden transition-all duration-300"
                            >
                              <div className={`relative flex items-center space-x-3 pl-8 pr-4 py-2.5 transition-all duration-300 border-l-2 ${
                                isChildItemActive
                                  ? 'bg-gradient-to-r from-green-500/20 to-emerald-600/20 text-white border-l-green-400'
                                  : 'border-l-transparent hover:border-l-green-400/40 hover:bg-gradient-to-r hover:from-green-500/10 hover:to-transparent text-white/60 hover:text-white'
                              }`}>
                                <div className={`flex items-center justify-center h-8 w-8 rounded-lg ${
                                  isChildItemActive
                                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30'
                                    : 'bg-white/5 group-hover:bg-green-500/20'
                                }`}>
                                  <ChildIcon className={`h-4 w-4 ${isChildItemActive ? 'text-white' : 'text-white/60 group-hover:text-green-400'}`} />
                                </div>
                                <span className={`text-sm ${isChildItemActive ? 'text-white font-medium' : 'text-white/80'}`}>
                                  {child.label}
                                </span>
                                {isChildItemActive && (
                                  <div className="ml-auto h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              // Menu item normal
              return (
                <button
                  key={item.id}
                  onClick={() => handlePageChange(item.id)}
                  className="w-full group relative overflow-hidden transition-all duration-300"
                >
                  <div className={`relative flex items-center ${isSidebarOpen ? 'space-x-4 px-4 py-3' : 'justify-center px-3 py-3'} transition-all duration-300 border-l-4 ${
                    isActive
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-xl shadow-green-500/40 border-l-white'
                      : 'border-l-transparent hover:border-l-white hover:bg-gradient-to-r hover:from-green-500/90 hover:to-emerald-600/90 text-white/70 hover:text-white hover:shadow-lg hover:shadow-green-500/30'
                  }`}>
                    <div className={`flex items-center justify-center flex-shrink-0 h-10 w-10 rounded-xl ${
                      isActive ? 'bg-white/15 shadow-lg' : 'bg-transparent group-hover:bg-white/10'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>

                    {isSidebarOpen && (
                      <span className="font-semibold text-sm flex-1 text-left">
                        {item.label}
                      </span>
                    )}

                    {isActive && isSidebarOpen && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <div className="h-2 w-2 rounded-full bg-white shadow-lg shadow-white/50 animate-pulse"></div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="border-t border-white/10 p-4">
            <div className={`relative overflow-hidden rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-3.5 ${
              isSidebarOpen ? '' : 'px-2'
            }`}>
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>

              <div className={`relative flex items-center ${isSidebarOpen ? 'space-x-3' : 'justify-center'}`}>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full blur-sm"></div>
                  <div className="relative h-11 w-11 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-green-500/30 ring-2 ring-white/10">
                    {user?.nome?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-400 rounded-full border-2 border-black shadow-lg shadow-green-400/50 animate-pulse"></div>
                </div>

                {isSidebarOpen && (
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{user?.nome || 'Usuário'}</p>
                    <p className="text-white/60 text-xs truncate flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse"></span>
                      {user?.empresa?.nome || 'AIra CRM'}
                    </p>
                  </div>
                )}
              </div>

              {isSidebarOpen && (
                <button
                  onClick={onLogout}
                  className="relative w-full mt-3 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-red-500/30 text-white/70 hover:text-red-400 transition-all duration-300 group"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm font-medium">Sair da Conta</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 w-full max-w-full relative">
        {/* Header - Responsivo */}
        <header className="relative h-16 lg:h-20 flex items-center justify-between px-4 lg:px-8 flex-shrink-0 z-10">
          <div className="absolute inset-0 card-glass border-b border-white/10">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-emerald-500/5"></div>
          </div>

          <div className="relative z-10 flex items-center gap-3 lg:gap-4">
            {/* Botão Menu Mobile */}
            {isMobile && (
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-green-500/30 text-white/70 hover:text-white transition-all"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}

            <div className="min-w-0">
              <h1 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent truncate">
                {getCurrentPageLabel()}
              </h1>
              <p className="text-xs lg:text-sm text-white/60 font-medium mt-0.5 hidden sm:block truncate">
                {nicho === 'atacado_varejo' ? 'Gerencie seu atacado/varejo' :
                 nicho === 'veiculos' ? 'Venda mais veículos com IA' :
                 nicho === 'imoveis' ? 'Feche mais negócios' :
                 nicho === 'loja_tintas' ? 'Venda mais tintas com Laura IA' :
                 'Gerencie seu negócio'}
              </p>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-2 lg:gap-4">
            {/* Status - Esconder texto em mobile */}
            <div className="relative overflow-hidden rounded-lg bg-green-500/10 backdrop-blur-sm border border-green-500/30 px-2 lg:px-4 py-1.5 lg:py-2">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10"></div>
              <div className="relative flex items-center gap-1.5 lg:gap-2">
                <div className="h-2 w-2 rounded-full bg-green-400 shadow-lg shadow-green-400/50 animate-pulse"></div>
                <Sparkles className="h-3.5 w-3.5 text-green-400 hidden sm:block" />
                <span className="text-xs lg:text-sm text-green-400 font-semibold hidden sm:block">Online</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content - Responsivo */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden w-full min-w-0 max-w-full relative">
          <div className="w-full h-full max-w-full p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Style for animations */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }

        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.3);
          border-radius: 3px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.5);
        }
      `}</style>
    </div>
  );
}
