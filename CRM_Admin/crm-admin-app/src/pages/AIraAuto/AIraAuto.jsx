import { useState, useEffect } from 'react';
import { Power, Activity, MessageSquare, Users, TrendingUp, Settings, RefreshCw, Download, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { DashboardLayout } from '../Dashboard/components/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import WhatsAppConnection from '../../components/WhatsApp/WhatsAppConnection';

export function AIraAuto() {
  const [robotStatus, setRobotStatus] = useState(true); // true = online, false = offline
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [config, setConfig] = useState({
    modelo: 'GPT-4 Turbo',
    horario: '24/7',
    limiteConversas: 'Ilimitado',
    tempoResposta: '2.3 segundos'
  });
  const [logs, setLogs] = useState([
    { id: 1, timestamp: '2025-10-16 14:30:15', type: 'info', message: 'Robô iniciado com sucesso' },
    { id: 2, timestamp: '2025-10-16 14:32:20', type: 'success', message: 'Conectado ao WhatsApp' },
    { id: 3, timestamp: '2025-10-16 14:35:45', type: 'info', message: 'Nova conversa iniciada com +55 11 98765-4321' },
    { id: 4, timestamp: '2025-10-16 14:38:12', type: 'success', message: 'Lead qualificado: João Silva' },
    { id: 5, timestamp: '2025-10-16 14:40:30', type: 'info', message: 'Agendamento realizado para 18/10/2025' },
  ]);

  const [stats] = useState({
    conversasAtivas: 12,
    leadsQualificados: 45,
    agendamentos: 23,
    taxaConversao: 34.5
  });

  const toggleRobot = () => {
    setRobotStatus(!robotStatus);
    const newLog = {
      id: logs.length + 1,
      timestamp: new Date().toLocaleString('pt-BR'),
      type: robotStatus ? 'warning' : 'success',
      message: robotStatus ? 'Robô desligado pelo administrador' : 'Robô ligado pelo administrador'
    };
    setLogs([newLog, ...logs]);
  };

  const getLogIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getLogColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-green-400';
      case 'warning':
        return 'text-orange-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-blue-400';
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">AIra Automotiva</h1>
            <p className="text-gray-400 mt-1">Gerenciamento e monitoramento do robô de vendas</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              className="bg-[#1a2332] border-[#2d3748] text-white hover:bg-[#253447]"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-[#1a2332] border-[#2d3748] text-white hover:bg-[#253447]"
            >
              <Settings className="mr-2 h-4 w-4" />
              Configurar
            </Button>
          </div>
        </div>

        {/* Status Card com Toggle */}
        <Card className="bg-[#1a2332] border-[#2d3748]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  robotStatus ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}>
                  <Power className={`h-8 w-8 ${robotStatus ? 'text-green-500' : 'text-red-500'}`} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Status do Robô</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-2 h-2 rounded-full ${robotStatus ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                    <span className={`text-sm font-medium ${robotStatus ? 'text-green-500' : 'text-red-500'}`}>
                      {robotStatus ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                onClick={toggleRobot}
                className={`${
                  robotStatus
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                } text-white px-8 py-6 text-lg font-semibold`}
              >
                <Power className="mr-2 h-5 w-5" />
                {robotStatus ? 'Desligar Robô' : 'Ligar Robô'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp Connection */}
        <WhatsAppConnection
          empresaId={1}
          empresaNome="AIra Auto"
          botType="auto"
        />

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-[#1a2332] border-[#2d3748]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Conversas Ativas</CardTitle>
              <MessageSquare className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.conversasAtivas}</div>
              <p className="text-xs text-gray-500 mt-1">Em tempo real</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2332] border-[#2d3748]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Leads Qualificados</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.leadsQualificados}</div>
              <p className="text-xs text-gray-500 mt-1">Últimos 7 dias</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2332] border-[#2d3748]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Agendamentos</CardTitle>
              <Activity className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.agendamentos}</div>
              <p className="text-xs text-gray-500 mt-1">Últimos 7 dias</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2332] border-[#2d3748]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Taxa de Conversão</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.taxaConversao}%</div>
              <p className="text-xs text-gray-500 mt-1">Últimos 7 dias</p>
            </CardContent>
          </Card>
        </div>

        {/* Logs em Tempo Real */}
        <Card className="bg-[#1a2332] border-[#2d3748]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Logs do Sistema</CardTitle>
                <CardDescription className="text-gray-400">Monitoramento em tempo real das atividades</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="bg-[#0f1419] border-[#2d3748] text-white hover:bg-[#253447]"
              >
                <Download className="mr-2 h-4 w-4" />
                Exportar Logs
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 bg-[#0f1419] rounded-lg hover:bg-[#253447] transition-colors"
                >
                  <div className="mt-1">
                    {getLogIcon(log.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 font-mono">{log.timestamp}</span>
                      <Badge
                        variant="outline"
                        className={`text-xs border-${log.type === 'success' ? 'green' : log.type === 'warning' ? 'orange' : log.type === 'error' ? 'red' : 'blue'}-500/50`}
                      >
                        {log.type.toUpperCase()}
                      </Badge>
                    </div>
                    <p className={`text-sm mt-1 ${getLogColor(log.type)}`}>
                      {log.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Informações do Robô */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-[#1a2332] border-[#2d3748]">
            <CardHeader>
              <CardTitle className="text-white">Configurações Atuais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-[#0f1419] rounded-lg">
                <span className="text-sm text-gray-400">Modelo de IA</span>
                <span className="text-sm text-white font-medium">GPT-4 Turbo</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#0f1419] rounded-lg">
                <span className="text-sm text-gray-400">Horário de Funcionamento</span>
                <span className="text-sm text-white font-medium">24/7</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#0f1419] rounded-lg">
                <span className="text-sm text-gray-400">Limite de Conversas</span>
                <span className="text-sm text-white font-medium">Ilimitado</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#0f1419] rounded-lg">
                <span className="text-sm text-gray-400">Tempo de Resposta Médio</span>
                <span className="text-sm text-white font-medium">2.3 segundos</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2332] border-[#2d3748]">
            <CardHeader>
              <CardTitle className="text-white">Informações do Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-[#0f1419] rounded-lg">
                <span className="text-sm text-gray-400">Versão</span>
                <span className="text-sm text-white font-medium">v2.5.1</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#0f1419] rounded-lg">
                <span className="text-sm text-gray-400">Última Atualização</span>
                <span className="text-sm text-white font-medium">16/10/2025 12:30</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#0f1419] rounded-lg">
                <span className="text-sm text-gray-400">Tempo de Atividade</span>
                <span className="text-sm text-white font-medium">15 dias, 8 horas</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#0f1419] rounded-lg">
                <span className="text-sm text-gray-400">Servidor</span>
                <span className="text-sm text-white font-medium">AWS us-east-1</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AIraAuto;
