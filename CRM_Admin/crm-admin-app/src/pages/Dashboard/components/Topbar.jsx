import { Search, Bell, MessageSquare, Flag, User, Settings, LogOut, ShieldCheck, CreditCard, HelpCircle } from 'lucide-react';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { useAuth } from '../../../contexts/AuthContext';

export function Topbar() {
  const { user, logout } = useAuth();

  // Função de logout que usa o contexto de autenticação
  const handleLogout = () => {
    console.log('[CRM Admin] 👋 Logout realizado - Redirecionando para Landing Page')
    logout()
  }
  return (
    <header className="fixed top-0 right-0 left-[280px] h-[70px] bg-[#1a2332] border-b border-[#2d3748] z-30 transition-all duration-300">
      <div className="h-full flex items-center justify-between px-6">
        {/* Left Side - Search */}
        <div className="flex items-center gap-4 flex-1 max-w-xl">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input 
              type="search"
              placeholder="Pesquisar..."
              className="pl-10 bg-[#0f1419] border-[#2d3748] text-white placeholder:text-gray-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Right Side - Icons & Profile */}
        <div className="flex items-center gap-4">
          {/* Language Selector */}
          <Button variant="ghost" size="icon" className="relative hover:bg-[#253447]">
            <Flag className="w-5 h-5 text-gray-400" />
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative hover:bg-[#253447]">
            <Bell className="w-5 h-5 text-gray-400" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              7
            </Badge>
          </Button>

          {/* Messages */}
          <Button variant="ghost" size="icon" className="relative hover:bg-[#253447]">
            <MessageSquare className="w-5 h-5 text-gray-400" />
            <Badge 
              variant="default" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-blue-600"
            >
              5
            </Badge>
          </Button>

          {/* Divider */}
          <div className="w-px h-8 bg-[#2d3748]" />

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 hover:bg-[#253447] rounded-lg p-2 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                  {user?.nome?.substring(0, 2).toUpperCase() || 'AD'}
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-sm font-medium text-white">{user?.nome || 'Administrador'}</div>
                  <div className="text-xs text-gray-400">{user?.funcao || 'Admin'}</div>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-[#1a2332] border-[#2d3748]" align="end">
              <DropdownMenuLabel className="text-gray-400">Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#2d3748]" />
              <DropdownMenuItem className="text-white hover:bg-[#253447] focus:bg-[#253447] cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-white hover:bg-[#253447] focus:bg-[#253447] cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-white hover:bg-[#253447] focus:bg-[#253447] cursor-pointer">
                <ShieldCheck className="mr-2 h-4 w-4" />
                <span>Segurança</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-white hover:bg-[#253447] focus:bg-[#253447] cursor-pointer">
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Assinatura</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-white hover:bg-[#253447] focus:bg-[#253447] cursor-pointer">
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Ajuda</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#2d3748]" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-400 hover:bg-[#253447] focus:bg-[#253447] cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default Topbar;