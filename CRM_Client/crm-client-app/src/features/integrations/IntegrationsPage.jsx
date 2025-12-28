/**
 * ═══════════════════════════════════════════════════════════════
 * PÁGINA: INTEGRAÇÕES
 * Gerenciamento de integrações com CRMs e APIs externas
 * ═══════════════════════════════════════════════════════════════
 */

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DataTable } from '@/components/common/DataTable'
import {
  Plug, Settings, CheckCircle, XCircle, RefreshCw,
  AlertCircle, Eye, Download, Upload, Zap
} from 'lucide-react'

export default function IntegrationsPage({ user, showNotification }) {
  const [integracoes, setIntegracoes] = useState([
    {
      id: 1,
      nome: 'Pipedrive',
      tipo: 'CRM',
      descricao: 'CRM focado em vendas com pipeline visual',
      icone: '🔵',
      conectado: true,
      ultimaSync: '2024-01-20 14:30',
      leadsSincronizados: 1247,
      apiKey: 'pk_xxxxxxxxxxxxxxxxx',
      apiUrl: 'https://api.pipedrive.com/v1',
      configuracoes: {
        syncAutomatico: true,
        syncInterval: 15, // minutos
        criarLeadsAuto: true,
        atualizarLeadsAuto: true,
      },
    },
    {
      id: 2,
      nome: 'HubSpot',
      tipo: 'CRM',
      descricao: 'Plataforma completa de CRM e marketing',
      icone: '🟠',
      conectado: false,
      ultimaSync: null,
      leadsSincronizados: 0,
      apiKey: '',
      apiUrl: 'https://api.hubapi.com',
      configuracoes: {
        syncAutomatico: false,
        syncInterval: 30,
        criarLeadsAuto: false,
        atualizarLeadsAuto: false,
      },
    },
    {
      id: 3,
      nome: 'RD Station',
      tipo: 'CRM',
      descricao: 'Automação de marketing e vendas',
      icone: '🟢',
      conectado: false,
      ultimaSync: null,
      leadsSincronizados: 0,
      apiKey: '',
      apiUrl: 'https://api.rd.services',
      configuracoes: {
        syncAutomatico: false,
        syncInterval: 30,
        criarLeadsAuto: false,
        atualizarLeadsAuto: false,
      },
    },
    {
      id: 4,
      nome: 'Google Calendar',
      tipo: 'Calendário',
      descricao: 'Sincronização de agendamentos',
      icone: '📅',
      conectado: true,
      ultimaSync: '2024-01-20 15:00',
      leadsSincronizados: 45, // agendamentos
      apiKey: '',
      apiUrl: 'https://www.googleapis.com/calendar/v3',
      configuracoes: {
        syncAutomatico: true,
        syncInterval: 5,
        criarLeadsAuto: true,
        atualizarLeadsAuto: true,
      },
    },
  ])

  const [logs, setLogs] = useState([
    { id: 1, integracao: 'Pipedrive', tipo: 'sync', mensagem: 'Sincronização completa: 15 leads atualizados', status: 'sucesso', data: '2024-01-20 14:30' },
    { id: 2, integracao: 'Google Calendar', tipo: 'sync', mensagem: 'Sincronização completa: 3 novos agendamentos', status: 'sucesso', data: '2024-01-20 15:00' },
    { id: 3, integracao: 'HubSpot', tipo: 'conexao', mensagem: 'Falha na autenticação: API key inválida', status: 'erro', data: '2024-01-20 10:15' },
    { id: 4, integracao: 'Pipedrive', tipo: 'webhook', mensagem: 'Novo lead recebido via webhook', status: 'sucesso', data: '2024-01-20 13:45' },
    { id: 5, integracao: 'RD Station', tipo: 'teste', mensagem: 'Teste de conexão realizado', status: 'aviso', data: '2024-01-19 16:20' },
  ])

  const [dialogAberto, setDialogAberto] = useState(false)
  const [integracaoEditando, setIntegracaoEditando] = useState(null)
  const [testando, setTestando] = useState(false)

  // Colunas da tabela de logs
  const colunasLogs = [
    {
      accessorKey: 'data',
      header: 'Data/Hora',
      cell: ({ row }) => (
        <span className="text-sm">{row.original.data}</span>
      ),
    },
    {
      accessorKey: 'integracao',
      header: 'Integração',
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.integracao}</Badge>
      ),
    },
    {
      accessorKey: 'tipo',
      header: 'Tipo',
      cell: ({ row }) => {
        const tipos = {
          sync: { label: 'Sincronização', cor: 'blue' },
          conexao: { label: 'Conexão', cor: 'purple' },
          webhook: { label: 'Webhook', cor: 'green' },
          teste: { label: 'Teste', cor: 'orange' },
        }
        const tipo = tipos[row.original.tipo]
        return <Badge className={`bg-${tipo.cor}-500/20 text-${tipo.cor}-400`}>{tipo.label}</Badge>
      },
    },
    {
      accessorKey: 'mensagem',
      header: 'Mensagem',
      cell: ({ row }) => (
        <span className="text-sm text-gray-300">{row.original.mensagem}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status
        const icons = {
          sucesso: <CheckCircle className="h-4 w-4 text-green-500" />,
          erro: <XCircle className="h-4 w-4 text-red-500" />,
          aviso: <AlertCircle className="h-4 w-4 text-yellow-500" />,
        }
        return icons[status]
      },
    },
  ]

  const configurarIntegracao = (integracao) => {
    setIntegracaoEditando(integracao)
    setDialogAberto(true)
  }

  const testarConexao = async (integracao) => {
    setTestando(true)
    // Simular teste
    await new Promise(resolve => setTimeout(resolve, 2000))
    setTestando(false)

    if (integracao.apiKey) {
      showNotification?.('✅ Conexão testada com sucesso!')
      setLogs([
        { id: logs.length + 1, integracao: integracao.nome, tipo: 'teste', mensagem: 'Teste de conexão bem-sucedido', status: 'sucesso', data: new Date().toLocaleString('pt-BR') },
        ...logs,
      ])
    } else {
      showNotification?.('❌ Erro: API key não configurada')
      setLogs([
        { id: logs.length + 1, integracao: integracao.nome, tipo: 'teste', mensagem: 'Teste falhou: API key ausente', status: 'erro', data: new Date().toLocaleString('pt-BR') },
        ...logs,
      ])
    }
  }

  const conectarIntegracao = (integracaoId) => {
    setIntegracoes(integracoes.map(i =>
      i.id === integracaoId
        ? { ...i, conectado: !i.conectado, ultimaSync: i.conectado ? null : new Date().toLocaleString('pt-BR') }
        : i
    ))
    const integracao = integracoes.find(i => i.id === integracaoId)
    showNotification?.(integracao.conectado ? '❌ Integração desconectada' : '✅ Integração conectada!')
  }

  const sincronizarAgora = async (integracao) => {
    showNotification?.('🔄 Sincronizando...')

    // Simular sincronização
    await new Promise(resolve => setTimeout(resolve, 2000))

    setIntegracoes(integracoes.map(i =>
      i.id === integracao.id
        ? { ...i, ultimaSync: new Date().toLocaleString('pt-BR') }
        : i
    ))

    setLogs([
      { id: logs.length + 1, integracao: integracao.nome, tipo: 'sync', mensagem: 'Sincronização manual concluída', status: 'sucesso', data: new Date().toLocaleString('pt-BR') },
      ...logs,
    ])

    showNotification?.('✅ Sincronização concluída!')
  }

  const salvarConfiguracao = () => {
    if (integracaoEditando) {
      setIntegracoes(integracoes.map(i =>
        i.id === integracaoEditando.id ? integracaoEditando : i
      ))
      showNotification?.('✅ Configuração salva!')
    }
    setDialogAberto(false)
    setIntegracaoEditando(null)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Integrações</h1>
          <p className="text-gray-400 mt-1">Conecte com CRMs e ferramentas externas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-gray-600 text-gray-300">
            <Download className="h-4 w-4 mr-2" />
            Exportar Logs
          </Button>
        </div>
      </div>

      <Tabs defaultValue="integracoes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-[#0f172a]">
          <TabsTrigger value="integracoes">Integrações Disponíveis</TabsTrigger>
          <TabsTrigger value="logs">Logs de Sincronização</TabsTrigger>
        </TabsList>

        {/* TAB: Integrações */}
        <TabsContent value="integracoes" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integracoes.map((integracao) => (
              <Card key={integracao.id} className="bg-[#1e293b] border-[#334155]">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{integracao.icone}</div>
                      <div>
                        <CardTitle className="text-white">{integracao.nome}</CardTitle>
                        <Badge variant="outline" className="mt-1 text-xs">{integracao.tipo}</Badge>
                      </div>
                    </div>
                    {integracao.conectado ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  <CardDescription className="text-gray-400 mt-2">
                    {integracao.descricao}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Status */}
                  <div className="bg-[#0f172a] border border-[#334155] rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Status</span>
                      <Badge className={integracao.conectado ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
                        {integracao.conectado ? 'Conectado' : 'Desconectado'}
                      </Badge>
                    </div>

                    {integracao.conectado && (
                      <>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Última Sync</span>
                          <span className="text-gray-300">{integracao.ultimaSync}</span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">
                            {integracao.tipo === 'CRM' ? 'Leads' : 'Agendamentos'}
                          </span>
                          <span className="text-white font-semibold">{integracao.leadsSincronizados}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="space-y-2">
                    {integracao.conectado ? (
                      <>
                        <Button
                          onClick={() => sincronizarAgora(integracao)}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          size="sm"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Sincronizar Agora
                        </Button>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            onClick={() => configurarIntegracao(integracao)}
                            variant="outline"
                            size="sm"
                            className="border-gray-600 text-gray-300"
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Configurar
                          </Button>
                          <Button
                            onClick={() => conectarIntegracao(integracao.id)}
                            variant="outline"
                            size="sm"
                            className="border-red-600 text-red-400 hover:bg-red-900/20"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Desconectar
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <Button
                          onClick={() => conectarIntegracao(integracao.id)}
                          className="w-full bg-green-600 hover:bg-green-700"
                          size="sm"
                        >
                          <Plug className="h-4 w-4 mr-2" />
                          Conectar
                        </Button>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            onClick={() => configurarIntegracao(integracao)}
                            variant="outline"
                            size="sm"
                            className="border-gray-600 text-gray-300"
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Configurar
                          </Button>
                          <Button
                            onClick={() => testarConexao(integracao)}
                            variant="outline"
                            size="sm"
                            className="border-blue-600 text-blue-400 hover:bg-blue-900/20"
                            disabled={testando}
                          >
                            {testando ? (
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Zap className="h-4 w-4 mr-2" />
                            )}
                            Testar
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* TAB: Logs */}
        <TabsContent value="logs" className="space-y-6">
          <Card className="bg-[#1e293b] border-[#334155]">
            <CardHeader>
              <CardTitle className="text-white">Histórico de Sincronizações</CardTitle>
              <CardDescription className="text-gray-400">
                Últimas {logs.length} operações realizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={logs}
                columns={colunasLogs}
                enableSearch={true}
                enableColumnVisibility={true}
                enablePagination={true}
                pageSize={15}
                searchPlaceholder="Buscar logs..."
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de Configuração */}
      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent className="bg-[#1e293b] border-[#334155] max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <span className="text-2xl">{integracaoEditando?.icone}</span>
              Configurar {integracaoEditando?.nome}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Configure as credenciais e opções de sincronização
            </DialogDescription>
          </DialogHeader>

          {integracaoEditando && (
            <div className="space-y-4 py-4">
              {/* Credenciais */}
              <div className="space-y-4 p-4 bg-[#0f172a] border border-[#334155] rounded-lg">
                <h4 className="text-sm font-semibold text-white">Credenciais de API</h4>

                <div>
                  <Label className="text-white">API Key</Label>
                  <Input
                    type="password"
                    value={integracaoEditando.apiKey}
                    onChange={(e) => setIntegracaoEditando({ ...integracaoEditando, apiKey: e.target.value })}
                    className="mt-2 bg-[#1e293b] border-[#334155] text-white"
                    placeholder="Digite sua API key..."
                  />
                </div>

                <div>
                  <Label className="text-white">API URL</Label>
                  <Input
                    value={integracaoEditando.apiUrl}
                    onChange={(e) => setIntegracaoEditando({ ...integracaoEditando, apiUrl: e.target.value })}
                    className="mt-2 bg-[#1e293b] border-[#334155] text-white"
                  />
                </div>
              </div>

              {/* Configurações de Sync */}
              <div className="space-y-4 p-4 bg-[#0f172a] border border-[#334155] rounded-lg">
                <h4 className="text-sm font-semibold text-white">Configurações de Sincronização</h4>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Sincronização Automática</Label>
                    <p className="text-xs text-gray-400">Sincronizar dados automaticamente</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={integracaoEditando.configuracoes.syncAutomatico}
                    onChange={(e) => setIntegracaoEditando({
                      ...integracaoEditando,
                      configuracoes: { ...integracaoEditando.configuracoes, syncAutomatico: e.target.checked }
                    })}
                    className="w-4 h-4"
                  />
                </div>

                <div>
                  <Label className="text-white">Intervalo de Sincronização (minutos)</Label>
                  <Input
                    type="number"
                    value={integracaoEditando.configuracoes.syncInterval}
                    onChange={(e) => setIntegracaoEditando({
                      ...integracaoEditando,
                      configuracoes: { ...integracaoEditando.configuracoes, syncInterval: parseInt(e.target.value) }
                    })}
                    className="mt-2 bg-[#1e293b] border-[#334155] text-white"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Criar Leads Automaticamente</Label>
                    <p className="text-xs text-gray-400">Novos leads são criados automaticamente</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={integracaoEditando.configuracoes.criarLeadsAuto}
                    onChange={(e) => setIntegracaoEditando({
                      ...integracaoEditando,
                      configuracoes: { ...integracaoEditando.configuracoes, criarLeadsAuto: e.target.checked }
                    })}
                    className="w-4 h-4"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Atualizar Leads Automaticamente</Label>
                    <p className="text-xs text-gray-400">Leads existentes são atualizados</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={integracaoEditando.configuracoes.atualizarLeadsAuto}
                    onChange={(e) => setIntegracaoEditando({
                      ...integracaoEditando,
                      configuracoes: { ...integracaoEditando.configuracoes, atualizarLeadsAuto: e.target.checked }
                    })}
                    className="w-4 h-4"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAberto(false)} className="border-gray-600 text-gray-300">
              Cancelar
            </Button>
            <Button onClick={salvarConfiguracao} className="bg-blue-600 hover:bg-blue-700">
              Salvar Configuração
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
