import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home, Car, Building2, Users, UserPlus, MessageSquare, Calendar,
  TrendingUp, FileText, FileSignature, BarChart3, Activity,
  UsersRound, Puzzle, Settings, Package, ChevronLeft, ChevronRight
} from 'lucide-react';
import { cn } from '../../../lib/utils';

const menuItems = [
  // Seção Principal
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: Car, label: 'AIra Auto', path: '/aira-auto' },
  { icon: Building2, label: 'AIra Imob', path: '/aira-imob', divider: true },

  // Seção Gestão
  { icon: Users, label: 'Clientes', path: '/clientes' },
  { icon: UserPlus, label: 'Leads', path: '/leads' },
  { icon: MessageSquare, label: 'Conversas', path: '/conversas' },
  { icon: Calendar, label: 'Agendamentos', path: '/agendamentos', divider: true },

  // Seção Catálogos
  { icon: Car, label: 'Veículos', path: '/veiculos' },
  { icon: Building2, label: 'Imóveis', path: '/imoveis', divider: true },

  // Seção Vendas
  { icon: TrendingUp, label: 'Funil de Vendas', path: '/funil' },
  { icon: FileText, label: 'Propostas', path: '/propostas' },
  { icon: FileSignature, label: 'Contratos', path: '/contratos', divider: true },

  // Seção Analytics
  { icon: BarChart3, label: 'Relatórios', path: '/relatorios' },
  { icon: Activity, label: 'Métricas', path: '/metricas', divider: true },

  // Seção Sistema
  { icon: UsersRound, label: 'Equipe', path: '/equipe' },
  { icon: Puzzle, label: 'Integrações', path: '/integracoes' },
  { icon: Settings, label: 'Configurações', path: '/configuracoes' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-screen transition-all duration-300 ease-in-out z-40",
        "bg-[#1a2332] border-r border-[#2d3748] flex flex-col",
        collapsed ? "w-[70px]" : "w-[280px]"
      )}
    >
      {/* Logo Header */}
      <div className="h-[70px] flex items-center justify-between px-4 border-b border-[#2d3748]">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Dashtrans</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-[#253447] transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          )}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        <ul className="space-y-1">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <li key={index}>
                {item.divider && <div className="my-3 border-t border-[#2d3748]" />}
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                    "hover:bg-[#253447] group relative",
                    location.pathname === item.path && "bg-blue-600 shadow-lg shadow-blue-500/30"
                  )}
                >
                  <Icon className={cn(
                    "w-5 h-5 flex-shrink-0",
                    location.pathname === item.path ? "text-white" : "text-gray-400 group-hover:text-gray-200"
                  )} />
                  {!collapsed && (
                    <span className={cn(
                      "text-sm font-medium",
                      location.pathname === item.path ? "text-white" : "text-gray-300 group-hover:text-white"
                    )}>
                      {item.label}
                    </span>
                  )}

                  {/* Tooltip quando collapsed */}
                  {collapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {item.label}
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-[#2d3748]">
          <div className="text-xs text-gray-500 text-center">
            © 2025 Dashtrans
          </div>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;