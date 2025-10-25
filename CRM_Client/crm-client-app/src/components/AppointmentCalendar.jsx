/**
 * ════════════════════════════════════════════════════════════════
 * COMPONENTE: Appointment Calendar - Visualização de Calendário (Green Neon)
 * ════════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, User,
  MapPin, Phone, Car, Building2, RefreshCw, X
} from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx';

export default function AppointmentCalendar({ user, botConfig, showNotification }) {
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [agendamentos, setAgendamentos] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [dayAgendamentos, setDayAgendamentos] = useState([]);
  const [showDayModal, setShowDayModal] = useState(false);

  useEffect(() => {
    loadAgendamentos();
  }, [user, currentDate]);

  const loadAgendamentos = async () => {
    try {
      setLoading(true);
      const empresaId = user?.empresa_id || 5;

      try {
        const response = await fetch(`${botConfig.apiUrl}/api/appointments/${empresaId}`);
        const data = await response.json();

        if (data.success && data.data) {
          setAgendamentos(data.data);
        } else {
          generateMockData();
        }
      } catch (apiError) {
        console.log('[CALENDAR] API indisponível, usando dados de exemplo');
        generateMockData();
      }
    } catch (error) {
      console.error('[CALENDAR] Erro:', error);
      generateMockData();
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = () => {
    const hoje = new Date();
    const mockAgendamentos = [
      {
        id: 1,
        nome: 'Ricardo Mendes',
        telefone: '+55 11 99888-7777',
        tipo: 'test-drive',
        veiculo: 'Jeep Commander Limited 2024',
        data: new Date(hoje.getFullYear(), hoje.getMonth(), 25).toISOString().split('T')[0],
        hora: '14:00',
        local: 'Concessionária Zona Sul',
        status: 'confirmado'
      },
      {
        id: 2,
        nome: 'Patricia Souza',
        telefone: '+55 21 98777-6666',
        tipo: 'visita',
        imovel: 'Apartamento 3 quartos - Leblon',
        data: new Date(hoje.getFullYear(), hoje.getMonth(), 26).toISOString().split('T')[0],
        hora: '10:30',
        local: 'Apartamento Leblon',
        status: 'pendente'
      },
      {
        id: 3,
        nome: 'Pedro Henrique',
        telefone: '+55 11 95555-4444',
        tipo: 'test-drive',
        veiculo: 'Fiat Toro Endurance 2024',
        data: new Date(hoje.getFullYear(), hoje.getMonth(), 25).toISOString().split('T')[0],
        hora: '16:00',
        local: 'Concessionária Campinas',
        status: 'pendente'
      },
      {
        id: 4,
        nome: 'Lucas Martins',
        telefone: '+55 21 95444-3333',
        tipo: 'test-drive',
        veiculo: 'Chevrolet Onix Plus 2024',
        data: new Date(hoje.getFullYear(), hoje.getMonth(), 28).toISOString().split('T')[0],
        hora: '15:00',
        local: 'Concessionária Zona Norte',
        status: 'confirmado'
      },
      {
        id: 5,
        nome: 'Ana Paula',
        telefone: '+55 11 94444-3333',
        tipo: 'visita',
        imovel: 'Casa 4 quartos - Alphaville',
        data: new Date(hoje.getFullYear(), hoje.getMonth(), 30).toISOString().split('T')[0],
        hora: '11:00',
        local: 'Alphaville Residencial',
        status: 'confirmado'
      },
      {
        id: 6,
        nome: 'Fernando Costa',
        telefone: '+55 11 93333-2222',
        tipo: 'test-drive',
        veiculo: 'Honda Civic 2024',
        data: new Date(hoje.getFullYear(), hoje.getMonth() + 1, 2).toISOString().split('T')[0],
        hora: '09:00',
        local: 'Concessionária',
        status: 'pendente'
      }
    ];

    setAgendamentos(mockAgendamentos);
  };

  // Funções de navegação do calendário
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Obter dias do mês
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Dias do mês anterior (para preencher o início)
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevMonthDay = new Date(year, month, -startingDayOfWeek + i + 1);
      days.push({
        date: prevMonthDay,
        day: prevMonthDay.getDate(),
        isCurrentMonth: false,
        isToday: false
      });
    }

    // Dias do mês atual
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        date: date,
        day: day,
        isCurrentMonth: true,
        isToday: date.toDateString() === today.toDateString()
      });
    }

    // Dias do próximo mês (para completar a grade)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const nextMonthDay = new Date(year, month + 1, i);
      days.push({
        date: nextMonthDay,
        day: i,
        isCurrentMonth: false,
        isToday: false
      });
    }

    return days;
  };

  // Obter agendamentos de um dia específico
  const getAgendamentosForDay = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return agendamentos.filter(ag => ag.data === dateStr);
  };

  // Abrir modal com agendamentos do dia
  const handleDayClick = (date) => {
    const agendamentosDay = getAgendamentosForDay(date);
    if (agendamentosDay.length > 0) {
      setSelectedDay(date);
      setDayAgendamentos(agendamentosDay);
      setShowDayModal(true);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pendente: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      confirmado: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      realizado: 'bg-green-500/20 text-green-400 border-green-500/30',
      cancelado: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return colors[status] || colors.pendente;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-12">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-green-500 animate-spin mx-auto mb-4" />
          <p className="text-green-400 text-lg">Carregando calendário...</p>
        </div>
      </div>
    );
  }

  const days = getDaysInMonth();
  const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

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
                <CalendarIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                  Calendário de Agendamentos
                </h1>
                <p className="text-gray-400 mt-1 capitalize">
                  {monthName} • {agendamentos.length} agendamentos
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={previousMonth} className="bg-gray-800 hover:bg-gray-700">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button onClick={goToToday} className="btn-primary-neon">
                Hoje
              </Button>
              <Button onClick={nextMonth} className="bg-gray-800 hover:bg-gray-700">
                <ChevronRight className="h-5 w-5" />
              </Button>
              <Button onClick={loadAgendamentos} className="bg-gray-800 hover:bg-gray-700">
                <RefreshCw className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="relative overflow-hidden rounded-2xl card-glass">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
        <div className="relative p-6">
          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-bold text-gray-400 p-3"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((dayInfo, index) => {
              const dayAgendamentos = getAgendamentosForDay(dayInfo.date);
              const hasAgendamentos = dayAgendamentos.length > 0;

              return (
                <div
                  key={index}
                  onClick={() => hasAgendamentos && handleDayClick(dayInfo.date)}
                  className={`
                    relative min-h-[100px] p-3 rounded-lg transition-all duration-300
                    ${dayInfo.isCurrentMonth ? 'bg-gray-900/50 border border-gray-700' : 'bg-gray-900/20 border border-gray-800'}
                    ${dayInfo.isToday ? 'border-2 border-green-500 shadow-lg shadow-green-500/20' : ''}
                    ${hasAgendamentos ? 'cursor-pointer hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/20' : ''}
                  `}
                >
                  {/* Day Number */}
                  <div className={`
                    text-sm font-bold mb-2
                    ${dayInfo.isToday ? 'text-green-400' : dayInfo.isCurrentMonth ? 'text-white' : 'text-gray-600'}
                  `}>
                    {dayInfo.day}
                  </div>

                  {/* Agendamentos Preview */}
                  {hasAgendamentos && (
                    <div className="space-y-1">
                      {dayAgendamentos.slice(0, 2).map((ag) => (
                        <div
                          key={ag.id}
                          className={`text-xs px-2 py-1 rounded border truncate ${getStatusColor(ag.status)}`}
                        >
                          {ag.hora} - {ag.nome}
                        </div>
                      ))}
                      {dayAgendamentos.length > 2 && (
                        <div className="text-xs text-gray-400 px-2">
                          +{dayAgendamentos.length - 2} mais
                        </div>
                      )}
                    </div>
                  )}

                  {/* Today Indicator */}
                  {dayInfo.isToday && (
                    <div className="absolute top-1 right-1 h-2 w-2 bg-green-400 rounded-full shadow-lg shadow-green-500/50"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal de Agendamentos do Dia */}
      <Dialog open={showDayModal} onOpenChange={setShowDayModal}>
        <DialogContent className="bg-black border-green-500/30 text-white max-w-3xl max-h-[90vh] overflow-y-auto card-glass">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5 pointer-events-none"></div>
          <DialogHeader className="relative">
            <DialogTitle className="text-2xl bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              Agendamentos do Dia
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedDay && selectedDay.toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4 relative">
            {dayAgendamentos.map((ag) => (
              <div key={ag.id} className="card-glass-small rounded-lg p-4 border border-green-500/20">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      ag.tipo === 'test-drive' ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-gray-500/20 border border-gray-500/30'
                    }`}>
                      {ag.tipo === 'test-drive' ? (
                        <Car className="h-5 w-5 text-blue-400" />
                      ) : (
                        <Building2 className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-white font-bold">{ag.nome}</h3>
                      <p className="text-sm text-gray-400">{ag.veiculo || ag.imovel}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full border font-medium ${getStatusColor(ag.status)}`}>
                    {ag.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Clock className="h-4 w-4 text-green-400" />
                    <span>{ag.hora}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Phone className="h-4 w-4 text-green-400" />
                    <span>{ag.telefone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300 col-span-2">
                    <MapPin className="h-4 w-4 text-yellow-400" />
                    <span>{ag.local}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-700">
                  <Button
                    className="w-full btn-primary-neon"
                    onClick={() => {
                      const cleanPhone = ag.telefone.replace(/\D/g, '');
                      window.open(`https://wa.me/${cleanPhone}`, '_blank');
                    }}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Contatar Cliente
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

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
