import { useState } from 'react';
import { LayoutDashboard, Bot, MessageSquare, TrendingUp, Calendar, Heart, Building2, Car, Settings, BarChart3, Menu, X, LogOut, Power, QrCode, Upload, Database, Circle, Sparkles, Package } from 'lucide-react';

export function ClientLayout({ children, currentPage, onPageChange, user, onLogout, nicho }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Menu base (sempre presente)
  const baseMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'whatsapp', label: 'Bot WhatsApp', icon: Bot },
    { id: 'bot-settings', label: 'Configurações do Bot', icon: Settings },
    { id: 'conversations', label: 'Conversas', icon: MessageSquare },
    { id: 'products', label: 'Veículos', icon: Package }, // ✅ MENU VEÍCULOS
    { id: 'deals', label: 'Vendas', icon: TrendingUp },
    { id: 'appointments', label: 'Agendamentos', icon: Calendar },
    { id: 'calendar', label: 'Calendário', icon: Calendar },
  ];

  // Itens específicos por nicho
  const nichoMenuItems = {
    veiculos: [
      { id: 'veiculos', label: 'Monitor do Sistema', icon: Database },
    ],
    imoveis: [
      { id: 'imoveis', label: 'Imóveis', icon: Building2 },
    ],
    outros: [
      { id: 'imoveis', label: 'Imóveis', icon: Building2 },
      { id: 'veiculos', label: 'Monitor do Sistema', icon: Database },
    ]
  };

  // Itens finais (sempre presentes)
  const finalMenuItems = [
    { id: 'reports', label: 'Relatórios', icon: BarChart3 },
  ];

  // Montar menu baseado no nicho
  const menuItems = [
    ...baseMenuItems,
    ...(nichoMenuItems[nicho] || nichoMenuItems.outros),
    ...finalMenuItems
  ];

  return (
    <div className="flex h-screen bg-black overflow-hidden w-full relative">
      {/* Grid Pattern Background */}
      <div className="fixed inset-0 z-0 pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '4rem 4rem',
        maskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, #000 70%, transparent 110%)'
      }}></div>

      {/* Stars */}
      {Array.from({ length: 50 }).map((_, i) => (
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

      {/* Sidebar Verde Neon */}
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-20'} relative transition-all duration-500 ease-in-out flex flex-col flex-shrink-0 z-10`}>
        {/* Glass Effect Background */}
        <div className="absolute inset-0 card-glass border-r border-white/8">
          {/* Gradient Overlay Verde */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Logo Section AIra */}
          <div className="h-20 flex items-center justify-between px-5 border-b border-white/10">
            {isSidebarOpen && (
              <div className="flex items-center space-x-2">
                {/* Logo AIra */}
                <img
                  src="/AIra_Logotipo.png"
                  alt="AIRA Logo"
                  className="h-8 w-auto"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.4))' }}
                />
                <div>
                  <p className="text-xs text-white/60 font-medium">Painel Cliente</p>
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
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className="w-full group relative overflow-hidden transition-all duration-300 border-b border-white/10 last:border-b-0"
                >
                  {/* Menu Item com Linha Vertical e Hover */}
                  <div className={`relative flex items-center ${isSidebarOpen ? 'space-x-4 px-4 py-3.5' : 'justify-center px-3 py-3.5'} transition-all duration-300 border-l-4 ${
                    isActive
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-xl shadow-green-500/40 border-l-white'
                      : 'border-l-transparent hover:border-l-white hover:bg-gradient-to-r hover:from-green-500/90 hover:to-emerald-600/90 text-white/70 hover:text-white hover:shadow-lg hover:shadow-green-500/30'
                  }`}>
                    {/* Icon Container - Maior */}
                    <div className={`flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                      isSidebarOpen ? 'h-11 w-11' : 'h-10 w-10'
                    } rounded-xl ${
                      isActive
                        ? 'bg-white/15 shadow-lg'
                        : 'bg-transparent group-hover:bg-white/10'
                    }`}>
                      <Icon className={`transition-all duration-300 ${
                        isSidebarOpen ? 'h-6 w-6' : 'h-5 w-5'
                      }`} />
                    </div>

                    {/* Label */}
                    {isSidebarOpen && (
                      <span className={`font-semibold text-sm flex-1 text-left transition-all duration-300 ${
                        isActive ? 'text-white' : 'text-white/80 group-hover:text-white'
                      }`}>
                        {item.label}
                      </span>
                    )}

                    {/* Active Indicator - Ponto à Direita */}
                    {isActive && isSidebarOpen && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <div className="h-2.5 w-2.5 rounded-full bg-white shadow-lg shadow-white/50 animate-pulse"></div>
                      </div>
                    )}

                    {/* Hover Shine Effect - Mais Intenso */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
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
              {/* Background Gradient Verde */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>

              <div className={`relative flex items-center ${isSidebarOpen ? 'space-x-3' : 'justify-center'}`}>
                {/* Avatar */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full blur-sm"></div>
                  <div className="relative h-11 w-11 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-green-500/30 ring-2 ring-white/10">
                    {user?.nome?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  {/* Online Indicator */}
                  <div className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-400 rounded-full border-2 border-black shadow-lg shadow-green-400/50 animate-pulse"></div>
                </div>

                {isSidebarOpen && (
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{user?.nome || 'Usuário'}</p>
                    <p className="text-white/60 text-xs truncate flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse"></span>
                      {user?.empresa || 'AIra CRM'}
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
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 w-full relative">
        {/* Header Verde Neon */}
        <header className="relative h-20 flex items-center justify-between px-8 flex-shrink-0 z-10">
          {/* Glass Background */}
          <div className="absolute inset-0 card-glass border-b border-white/10">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-emerald-500/5"></div>
          </div>

          <div className="relative z-10">
            <h1 className="text-xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              {menuItems.find(item => item.id === currentPage)?.label || 'Dashboard'}
            </h1>
            <p className="text-sm text-white/60 font-medium mt-0.5">Gerencie seu negócio com inteligência</p>
          </div>

          <div className="relative z-10 flex items-center space-x-4">
            {/* Status Badge Verde Neon */}
            <div className="relative overflow-hidden rounded-lg bg-green-500/10 backdrop-blur-sm border border-green-500/30 px-4 py-2">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10"></div>
              <div className="relative flex items-center space-x-2">
                <div className="relative">
                  <div className="h-2 w-2 rounded-full bg-green-400 shadow-lg shadow-green-400/50 animate-pulse"></div>
                </div>
                <Sparkles className="h-3.5 w-3.5 text-green-400" />
                <span className="text-sm text-green-400 font-semibold">Sistema Online</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto w-full min-w-0 relative">
          <div className="w-full h-full">
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

        /* Custom Scrollbar */
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

        .scrollbar-track-transparent::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
}
