/**
 * ═══════════════════════════════════════════════════════════════
 * PÁGINA: MENSAGENS AUTOMATIZADAS
 * Gerenciamento de mensagens do bot com editor e preview
 * ═══════════════════════════════════════════════════════════════
 */

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  MessageSquare, Plus, Edit, Trash2, Copy, Eye, Send,
  Bot, User, Clock, CheckCircle
} from 'lucide-react'

export default function MessagesPage({ user, showNotification }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      nome: 'Mensagem de Boas-Vindas',
      contexto: 'inicio_conversa',
      conteudo: 'Olá! 👋 Bem-vindo à {empresa_nome}!\n\nSou o assistente virtual e estou aqui para te ajudar. Como posso te auxiliar hoje?',
      variaveis: ['{empresa_nome}', '{usuario_nome}'],
      ativo: true,
      editado: '2024-01-15',
    },
    {
      id: 2,
      nome: 'Apresentação de Veículo',
      contexto: 'mostrar_veiculo',
      conteudo: '🚗 **{veiculo_marca} {veiculo_modelo} {veiculo_ano}**\n\n💰 Valor: R$ {veiculo_preco}\n📍 Localização: {empresa_cidade}\n✅ Disponível para test drive!\n\nDeseja saber mais detalhes ou agendar uma visita?',
      variaveis: ['{veiculo_marca}', '{veiculo_modelo}', '{veiculo_ano}', '{veiculo_preco}', '{empresa_cidade}'],
      ativo: true,
      editado: '2024-01-14',
    },
    {
      id: 3,
      nome: 'Agendamento Confirmado',
      contexto: 'confirmacao_agendamento',
      conteudo: '✅ Agendamento confirmado!\n\n📅 Data: {agendamento_data}\n🕐 Horário: {agendamento_hora}\n📍 Local: {empresa_endereco}\n\nVocê receberá um lembrete 1 hora antes.',
      variaveis: ['{agendamento_data}', '{agendamento_hora}', '{empresa_endereco}'],
      ativo: true,
      editado: '2024-01-13',
    },
  ])

  const [selectedMessage, setSelectedMessage] = useState(messages[0])
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(selectedMessage.conteudo)

  // Variáveis disponíveis
  const availableVariables = [
    { var: '{empresa_nome}', desc: 'Nome da empresa' },
    { var: '{empresa_endereco}', desc: 'Endereço da empresa' },
    { var: '{empresa_telefone}', desc: 'Telefone da empresa' },
    { var: '{empresa_cidade}', desc: 'Cidade da empresa' },
    { var: '{usuario_nome}', desc: 'Nome do cliente' },
    { var: '{usuario_telefone}', desc: 'Telefone do cliente' },
    { var: '{veiculo_marca}', desc: 'Marca do veículo' },
    { var: '{veiculo_modelo}', desc: 'Modelo do veículo' },
    { var: '{veiculo_ano}', desc: 'Ano do veículo' },
    { var: '{veiculo_preco}', desc: 'Preço do veículo' },
    { var: '{agendamento_data}', desc: 'Data do agendamento' },
    { var: '{agendamento_hora}', desc: 'Hora do agendamento' },
  ]

  // Preview da mensagem com variáveis substituídas
  const getPreview = (content) => {
    let preview = content
    const previewData = {
      '{empresa_nome}': user?.empresa_nome || 'VendeAI Auto',
      '{empresa_endereco}': 'Av. Paulista, 1000 - São Paulo',
      '{empresa_telefone}': '(11) 99999-9999',
      '{empresa_cidade}': 'São Paulo',
      '{usuario_nome}': 'João Silva',
      '{usuario_telefone}': '(11) 98888-8888',
      '{veiculo_marca}': 'Toyota',
      '{veiculo_modelo}': 'Corolla XEI',
      '{veiculo_ano}': '2023',
      '{veiculo_preco}': '145.900',
      '{agendamento_data}': '25/01/2024',
      '{agendamento_hora}': '14:00',
    }

    Object.entries(previewData).forEach(([key, value]) => {
      preview = preview.replace(new RegExp(key, 'g'), value)
    })

    return preview
  }

  const insertVariable = (variable) => {
    setEditedContent(prev => prev + variable)
  }

  const saveMessage = () => {
    setMessages(messages.map(m =>
      m.id === selectedMessage.id
        ? { ...m, conteudo: editedContent, editado: new Date().toISOString().split('T')[0] }
        : m
    ))
    setSelectedMessage({ ...selectedMessage, conteudo: editedContent })
    setIsEditing(false)
    showNotification?.('Mensagem salva com sucesso!')
  }

  const deleteMessage = (id) => {
    if (confirm('Deseja realmente excluir esta mensagem?')) {
      setMessages(messages.filter(m => m.id !== id))
      if (selectedMessage.id === id) {
        setSelectedMessage(messages[0])
      }
      showNotification?.('Mensagem excluída!')
    }
  }

  const duplicateMessage = (message) => {
    const newMessage = {
      ...message,
      id: Math.max(...messages.map(m => m.id)) + 1,
      nome: `${message.nome} (cópia)`,
      editado: new Date().toISOString().split('T')[0],
    }
    setMessages([...messages, newMessage])
    showNotification?.('Mensagem duplicada!')
  }

  const testMessage = () => {
    showNotification?.('Mensagem de teste enviada!')
  }

  return (
    <div className="min-h-screen bg-black p-6 space-y-6 relative">
      {/* Stars Background */}
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
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
        <div className="relative p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                <MessageSquare className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  Mensagens Automatizadas
                </h1>
                <p className="text-white/60 mt-1 text-sm">Gerencie as mensagens que o bot envia automaticamente</p>
              </div>
            </div>
            <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/30">
              <Plus className="h-4 w-4 mr-2" />
              Nova Mensagem
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Mensagens */}
        <Card className="lg:col-span-1 relative overflow-hidden rounded-2xl card-glass border-white/10">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
          <CardHeader className="relative">
            <CardTitle className="text-white">Mensagens ({messages.length})</CardTitle>
            <CardDescription className="text-white/60">Selecione para editar</CardDescription>
          </CardHeader>
          <CardContent className="relative p-0">
            <ScrollArea className="h-[600px]">
              <div className="space-y-2 p-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    onClick={() => {
                      setSelectedMessage(message)
                      setEditedContent(message.conteudo)
                      setIsEditing(false)
                    }}
                    className={`p-4 rounded-lg cursor-pointer transition-all duration-300 border ${
                      selectedMessage.id === message.id
                        ? 'bg-gradient-to-r from-green-500/30 to-emerald-600/30 border-green-400/50 shadow-lg shadow-green-500/30'
                        : 'bg-white/5 border-white/10 hover:border-green-400/30 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-white text-sm">{message.nome}</h3>
                      {message.ativo && (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">Ativo</Badge>
                      )}
                    </div>
                    <p className="text-xs text-white/60 mb-2">{message.contexto}</p>
                    <p className="text-xs text-white/40 truncate">{message.conteudo.substring(0, 50)}...</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="h-3 w-3 text-white/40" />
                      <span className="text-xs text-white/40">{message.editado}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Editor e Preview */}
        <Card className="lg:col-span-2 relative overflow-hidden rounded-2xl card-glass border-white/10">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
          <CardHeader className="relative">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">{selectedMessage.nome}</CardTitle>
                <CardDescription className="text-white/60">
                  Contexto: <Badge variant="outline" className="ml-2 border-white/20 text-white/80">{selectedMessage.contexto}</Badge>
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => duplicateMessage(selectedMessage)}
                  className="border-white/20 text-white/80 hover:bg-white/10 hover:border-green-400/30"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => deleteMessage(selectedMessage.id)}
                  className="border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <Tabs defaultValue="editor">
              <TabsList className="grid w-full grid-cols-2 bg-black/30 border border-white/10">
                <TabsTrigger value="editor" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500/30 data-[state=active]:to-emerald-600/30 data-[state=active]:text-white text-white/60">Editor</TabsTrigger>
                <TabsTrigger value="preview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500/30 data-[state=active]:to-emerald-600/30 data-[state=active]:text-white text-white/60">Preview</TabsTrigger>
              </TabsList>

              {/* Editor */}
              <TabsContent value="editor" className="space-y-4">
                <div className="space-y-4">
                  {!isEditing ? (
                    <div className="bg-black/30 border border-white/10 rounded-lg p-4">
                      <pre className="text-sm text-white/80 whitespace-pre-wrap font-sans">
                        {selectedMessage.conteudo}
                      </pre>
                      <Button
                        onClick={() => setIsEditing(true)}
                        className="mt-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/30"
                        size="sm"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar Mensagem
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div>
                        <Label htmlFor="message-content" className="text-white">Conteúdo da Mensagem</Label>
                        <Textarea
                          id="message-content"
                          value={editedContent}
                          onChange={(e) => setEditedContent(e.target.value)}
                          rows={12}
                          className="mt-2 bg-black/30 border-white/10 text-white placeholder:text-white/40"
                          placeholder="Digite a mensagem aqui..."
                        />
                      </div>

                      {/* Variáveis Disponíveis */}
                      <div className="bg-black/30 border border-white/10 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-white mb-3">Variáveis Disponíveis (clique para inserir)</h4>
                        <div className="flex flex-wrap gap-2">
                          {availableVariables.map((v) => (
                            <Button
                              key={v.var}
                              size="sm"
                              variant="outline"
                              onClick={() => insertVariable(v.var)}
                              className="border-green-500/30 text-green-400 hover:bg-green-500/20 hover:border-green-500/50 text-xs"
                              title={v.desc}
                            >
                              {v.var}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="flex gap-2">
                        <Button onClick={saveMessage} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/30">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Salvar Alterações
                        </Button>
                        <Button
                          onClick={() => {
                            setEditedContent(selectedMessage.conteudo)
                            setIsEditing(false)
                          }}
                          variant="outline"
                          className="border-white/20 text-white/80 hover:bg-white/10"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>

              {/* Preview */}
              <TabsContent value="preview">
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Eye className="h-5 w-5 text-green-400" />
                      <span className="text-sm font-semibold text-white">Preview da Conversa</span>
                    </div>

                    {/* Simulação de Chat */}
                    <div className="space-y-4">
                      {/* Mensagem do Bot */}
                      <div className="flex items-start gap-3">
                        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-full p-2 shadow-lg shadow-green-500/30">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 bg-black/30 border border-white/10 rounded-lg p-3 max-w-[80%]">
                          <pre className="text-sm text-white/80 whitespace-pre-wrap font-sans">
                            {getPreview(isEditing ? editedContent : selectedMessage.conteudo)}
                          </pre>
                        </div>
                      </div>

                      {/* Resposta do Usuário (exemplo) */}
                      <div className="flex items-start gap-3 justify-end">
                        <div className="flex-1 bg-gradient-to-br from-green-500/30 to-emerald-600/30 border border-green-400/30 rounded-lg p-3 max-w-[80%] text-right">
                          <p className="text-sm text-white">
                            Ótimo! Quero saber mais sobre esse veículo.
                          </p>
                        </div>
                        <div className="bg-white/10 border border-white/20 rounded-full p-2">
                          <User className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Botão de Teste */}
                  <Button onClick={testMessage} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/30 w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Mensagem de Teste
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
