import { useState } from 'react';
import { MessageSquare, Search, Filter, Phone, Mail, Calendar, Clock, Bot, User, Send, Paperclip, MoreVertical, Star, Archive, Trash2 } from 'lucide-react';
import { DashboardLayout } from '../Dashboard/components/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

export function Conversas() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedConversa, setSelectedConversa] = useState(null);
  const [novaMensagem, setNovaMensagem] = useState('');

  const [stats] = useState({
    conversasAtivas: 47,
    conversasArquivadas: 312,
    tempoMedioResposta: '1.8s',
    satisfacao: 94.5
  });

  const [conversas, setConversas] = useState([
    {
      id: 1,
      contato: {
        nome: 'Ricardo Mendes',
        email: 'ricardo.mendes@email.com',
        telefone: '+55 11 99888-7777',
        avatar: 'RM'
      },
      origem: 'AIra Auto',
      status: 'ativa',
      ultimaMensagem: 'Perfeito! Gostaria de agendar um test drive.',
      dataUltimaMensagem: '2025-10-16T16:45:00',
      naoLidas: 2,
      mensagens: [
        { id: 1, tipo: 'bot', texto: 'Olá! Sou a AIra, assistente virtual da concessionária. Como posso ajudá-lo hoje?', hora: '14:20' },
        { id: 2, tipo: 'usuario', texto: 'Olá! Estou interessado em SUVs. Quais modelos vocês têm?', hora: '14:22' },
        { id: 3, tipo: 'bot', texto: 'Temos excelentes opções! Nossa linha de SUVs inclui: Compass, Renegade e Commander. Qual deles te interessa mais?', hora: '14:22' },
        { id: 4, tipo: 'usuario', texto: 'O Commander me chamou atenção. Pode me dar mais detalhes?', hora: '14:25' },
        { id: 5, tipo: 'bot', texto: 'Ótima escolha! O Commander é nosso SUV premium com 7 lugares, motor 1.3 Turbo, câmbio automático CVT e tração 4x4. Temos em estoque nas cores branco, preto e prata. O preço parte de R$ 180.000. Gostaria de agendar um test drive?', hora: '14:26' },
        { id: 6, tipo: 'usuario', texto: 'Perfeito! Gostaria de agendar um test drive.', hora: '16:45' }
      ]
    },
    {
      id: 2,
      contato: {
        nome: 'Patricia Souza',
        email: 'patricia.souza@email.com',
        telefone: '+55 21 98777-6666',
        avatar: 'PS'
      },
      origem: 'AIra Imob',
      status: 'ativa',
      ultimaMensagem: 'Pode me enviar mais fotos do apartamento?',
      dataUltimaMensagem: '2025-10-16T15:30:00',
      naoLidas: 1,
      mensagens: [
        { id: 1, tipo: 'bot', texto: 'Olá! Sou a AIra, assistente virtual da imobiliária. Busca imóvel para compra ou locação?', hora: '10:15' },
        { id: 2, tipo: 'usuario', texto: 'Estou procurando apartamento de 3 quartos para comprar.', hora: '10:18' },
        { id: 3, tipo: 'bot', texto: 'Temos várias opções! Qual região você prefere e qual seu orçamento aproximado?', hora: '10:18' },
        { id: 4, tipo: 'usuario', texto: 'Zona Sul, até R$ 700.000', hora: '10:20' },
        { id: 5, tipo: 'bot', texto: 'Encontrei 3 apartamentos perfeitos para você! Destaque: Ap. 120m², 3 quartos (1 suíte), 2 vagas, sacada com churrasqueira, no Leblon por R$ 650.000. Quer mais detalhes?', hora: '10:21' },
        { id: 6, tipo: 'usuario', texto: 'Pode me enviar mais fotos do apartamento?', hora: '15:30' }
      ]
    },
    {
      id: 3,
      contato: {
        nome: 'Fernando Costa',
        email: 'fernando.costa@email.com',
        telefone: '+55 11 97666-5555',
        avatar: 'FC'
      },
      origem: 'AIra Auto',
      status: 'pendente',
      ultimaMensagem: 'Vou pensar um pouco mais e retorno.',
      dataUltimaMensagem: '2025-10-15T18:20:00',
      naoLidas: 0,
      mensagens: [
        { id: 1, tipo: 'bot', texto: 'Olá! Como posso ajudá-lo hoje?', hora: '16:10' },
        { id: 2, tipo: 'usuario', texto: 'Quero trocar meu carro. Aceita usado?', hora: '16:15' },
        { id: 3, tipo: 'bot', texto: 'Sim! Trabalhamos com avaliação de veículos usados. Qual o modelo e ano do seu carro?', hora: '16:15' },
        { id: 4, tipo: 'usuario', texto: 'Civic 2018', hora: '16:18' },
        { id: 5, tipo: 'bot', texto: 'Excelente! Pela tabela FIPE, seu Civic 2018 vale entre R$ 85.000 e R$ 92.000. Posso agendar uma avaliação presencial?', hora: '16:19' },
        { id: 6, tipo: 'usuario', texto: 'Vou pensar um pouco mais e retorno.', hora: '18:20' }
      ]
    },
    {
      id: 4,
      contato: {
        nome: 'Camila Ribeiro',
        email: 'camila.ribeiro@email.com',
        telefone: '+55 11 96555-4444',
        avatar: 'CR'
      },
      origem: 'AIra Imob',
      status: 'ativa',
      ultimaMensagem: 'Sim! Amanhã pela manhã está ótimo.',
      dataUltimaMensagem: '2025-10-16T14:15:00',
      naoLidas: 3,
      mensagens: [
        { id: 1, tipo: 'bot', texto: 'Olá! Como posso ajudar?', hora: '09:30' },
        { id: 2, tipo: 'usuario', texto: 'Procuro casa em condomínio fechado', hora: '09:35' },
        { id: 3, tipo: 'bot', texto: 'Qual cidade e bairro prefere?', hora: '09:35' },
        { id: 4, tipo: 'usuario', texto: 'Alphaville, São Paulo', hora: '09:40' },
        { id: 5, tipo: 'bot', texto: 'Temos uma casa linda! 4 quartos, piscina, área gourmet, R$ 890.000. Quer agendar visita?', hora: '09:41' },
        { id: 6, tipo: 'usuario', texto: 'Sim! Amanhã pela manhã está ótimo.', hora: '14:15' }
      ]
    },
    {
      id: 5,
      contato: {
        nome: 'Lucas Martins',
        email: 'lucas.martins@email.com',
        telefone: '+55 21 95444-3333',
        avatar: 'LM'
      },
      origem: 'AIra Auto',
      status: 'arquivada',
      ultimaMensagem: 'Obrigado! Fechei com outra loja.',
      dataUltimaMensagem: '2025-10-10T11:30:00',
      naoLidas: 0,
      mensagens: [
        { id: 1, tipo: 'bot', texto: 'Olá! Bem-vindo! Procura algum modelo específico?', hora: '10:00' },
        { id: 2, tipo: 'usuario', texto: 'Onix', hora: '10:05' },
        { id: 3, tipo: 'bot', texto: 'Temos Onix 0km a partir de R$ 75.000. Quer simular financiamento?', hora: '10:05' },
        { id: 4, tipo: 'usuario', texto: 'Obrigado! Fechei com outra loja.', hora: '11:30' }
      ]
    }
  ]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ativa':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/50">Ativa</Badge>;
      case 'pendente':
        return <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/50">Pendente</Badge>;
      case 'arquivada':
        return <Badge className="bg-gray-500/20 text-gray-500 border-gray-500/50">Arquivada</Badge>;
      default:
        return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/50">Nova</Badge>;
    }
  };

  const getOrigemBadge = (origem) => {
    if (origem === 'AIra Auto') {
      return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/50 text-xs">AIra Auto</Badge>;
    }
    return <Badge className="bg-purple-500/20 text-purple-500 border-purple-500/50 text-xs">AIra Imob</Badge>;
  };

  const formatarTempo = (dataString) => {
    const data = new Date(dataString);
    const agora = new Date();
    const diffMs = agora - data;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMs / 3600000);
    const diffDias = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}min atrás`;
    if (diffHoras < 24) return `${diffHoras}h atrás`;
    if (diffDias === 1) return 'Ontem';
    if (diffDias < 7) return `${diffDias} dias atrás`;
    return data.toLocaleDateString('pt-BR');
  };

  const handleSendMessage = () => {
    if (!novaMensagem.trim() || !selectedConversa) return;

    const agora = new Date();
    const horaAtual = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    // Adiciona mensagem do usuário (admin/atendente)
    const novaMensagemObj = {
      id: selectedConversa.mensagens.length + 1,
      tipo: 'usuario',
      texto: novaMensagem,
      hora: horaAtual
    };

    // Atualiza a conversa com a nova mensagem
    const conversasAtualizadas = conversas.map(conversa => {
      if (conversa.id === selectedConversa.id) {
        return {
          ...conversa,
          mensagens: [...conversa.mensagens, novaMensagemObj],
          ultimaMensagem: novaMensagem,
          dataUltimaMensagem: agora.toISOString(),
          status: 'ativa'
        };
      }
      return conversa;
    });

    setConversas(conversasAtualizadas);

    // Atualiza a conversa selecionada
    const conversaAtualizada = conversasAtualizadas.find(c => c.id === selectedConversa.id);
    setSelectedConversa(conversaAtualizada);

    // Limpa o input
    setNovaMensagem('');

    // Simula resposta do bot após 2 segundos (opcional)
    setTimeout(() => {
      const respostaBot = {
        id: conversaAtualizada.mensagens.length + 2,
        tipo: 'bot',
        texto: 'Mensagem recebida! Um atendente humano está analisando sua solicitação.',
        hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };

      const conversasComResposta = conversasAtualizadas.map(conversa => {
        if (conversa.id === selectedConversa.id) {
          return {
            ...conversa,
            mensagens: [...conversaAtualizada.mensagens, novaMensagemObj, respostaBot],
            ultimaMensagem: respostaBot.texto,
            dataUltimaMensagem: new Date().toISOString()
          };
        }
        return conversa;
      });

      setConversas(conversasComResposta);
      const conversaComResposta = conversasComResposta.find(c => c.id === selectedConversa.id);
      setSelectedConversa(conversaComResposta);
    }, 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredConversas = conversas.filter(conversa => {
    const matchesSearch =
      conversa.contato.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conversa.contato.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conversa.ultimaMensagem.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === 'all' || conversa.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Conversas</h1>
            <p className="text-gray-400 mt-1">Histórico completo de interações dos robôs AIra</p>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-[#1a2332] border-[#2d3748]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Conversas Ativas</CardTitle>
              <MessageSquare className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.conversasAtivas}</div>
              <p className="text-xs text-gray-500 mt-1">Em andamento</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2332] border-[#2d3748]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Conversas Arquivadas</CardTitle>
              <Archive className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.conversasArquivadas}</div>
              <p className="text-xs text-gray-500 mt-1">Histórico total</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2332] border-[#2d3748]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Tempo Médio Resposta</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.tempoMedioResposta}</div>
              <p className="text-xs text-gray-500 mt-1">Média dos robôs</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2332] border-[#2d3748]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Satisfação</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.satisfacao}%</div>
              <p className="text-xs text-gray-500 mt-1">Avaliação positiva</p>
            </CardContent>
          </Card>
        </div>

        {/* Interface de Chat */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Lista de Conversas */}
          <Card className="bg-[#1a2332] border-[#2d3748] lg:col-span-1 flex flex-col">
            <CardHeader className="border-b border-[#2d3748]">
              <div className="space-y-4">
                {/* Busca */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar conversas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Filtros */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilterStatus('all')}
                    className={`flex-1 ${
                      filterStatus === 'all'
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-[#0f1419] border-[#2d3748] text-gray-400'
                    }`}
                  >
                    Todas
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilterStatus('ativa')}
                    className={`flex-1 ${
                      filterStatus === 'ativa'
                        ? 'bg-green-600 border-green-600 text-white'
                        : 'bg-[#0f1419] border-[#2d3748] text-gray-400'
                    }`}
                  >
                    Ativas
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilterStatus('arquivada')}
                    className={`flex-1 ${
                      filterStatus === 'arquivada'
                        ? 'bg-gray-600 border-gray-600 text-white'
                        : 'bg-[#0f1419] border-[#2d3748] text-gray-400'
                    }`}
                  >
                    Arquivadas
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
              {filteredConversas.map((conversa) => (
                <div
                  key={conversa.id}
                  onClick={() => setSelectedConversa(conversa)}
                  className={`p-4 border-b border-[#2d3748] hover:bg-[#253447] cursor-pointer transition-colors ${
                    selectedConversa?.id === conversa.id ? 'bg-[#253447]' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {conversa.contato.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-white truncate">
                          {conversa.contato.nome}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          {formatarTempo(conversa.dataUltimaMensagem)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        {getOrigemBadge(conversa.origem)}
                        {getStatusBadge(conversa.status)}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-400 truncate">
                          {conversa.ultimaMensagem}
                        </p>
                        {conversa.naoLidas > 0 && (
                          <span className="ml-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                            {conversa.naoLidas}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Área de Chat */}
          <Card className="bg-[#1a2332] border-[#2d3748] lg:col-span-2 flex flex-col">
            {selectedConversa ? (
              <>
                {/* Header do Chat */}
                <CardHeader className="border-b border-[#2d3748]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {selectedConversa.contato.avatar}
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{selectedConversa.contato.nome}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Mail className="h-3 w-3" />
                          {selectedConversa.contato.email}
                          <Phone className="h-3 w-3 ml-2" />
                          {selectedConversa.contato.telefone}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getOrigemBadge(selectedConversa.origem)}
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-[#0f1419] border-[#2d3748] text-gray-400 hover:bg-[#253447] h-8 w-8 p-0"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Mensagens */}
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedConversa.mensagens.map((mensagem) => (
                    <div
                      key={mensagem.id}
                      className={`flex ${mensagem.tipo === 'usuario' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] ${
                          mensagem.tipo === 'usuario'
                            ? 'bg-blue-600 text-white'
                            : 'bg-[#253447] text-gray-200'
                        } rounded-lg p-3`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {mensagem.tipo === 'bot' ? (
                            <Bot className="h-3 w-3 text-blue-400" />
                          ) : (
                            <User className="h-3 w-3 text-white" />
                          )}
                          <span className="text-xs opacity-75">
                            {mensagem.tipo === 'bot' ? 'AIra' : selectedConversa.contato.nome.split(' ')[0]}
                          </span>
                        </div>
                        <p className="text-sm">{mensagem.texto}</p>
                        <span className="text-xs opacity-75 mt-1 block text-right">
                          {mensagem.hora}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>

                {/* Input de Mensagem */}
                <CardContent className="border-t border-[#2d3748] p-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-[#0f1419] border-[#2d3748] text-gray-400 hover:bg-[#253447] h-10 w-10 p-0"
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <input
                      type="text"
                      placeholder="Digite uma mensagem..."
                      value={novaMensagem}
                      onChange={(e) => setNovaMensagem(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 px-4 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!novaMensagem.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg">Selecione uma conversa para visualizar</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Conversas;
