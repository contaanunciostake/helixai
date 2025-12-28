/**
 * ═══════════════════════════════════════════════════════════════
 * PÁGINA: EQUIPE
 * Gerenciamento de usuários, permissões e performance
 * ═══════════════════════════════════════════════════════════════
 */

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DataTable } from '@/components/common/DataTable'
import {
  Users, Plus, Edit, Trash2, Shield, Crown, User as UserIcon,
  TrendingUp, Award, Target, Phone, Mail, Calendar
} from 'lucide-react'

export default function TeamPage({ user, showNotification }) {
  const [membros, setMembros] = useState([
    {
      id: 1,
      nome: 'Carlos Silva',
      email: 'carlos@empresa.com',
      telefone: '+55 11 99999-1111',
      cargo: 'Gerente de Vendas',
      role: 'admin',
      ativo: true,
      entrou: '2023-01-15',
      leadsAtendidos: 145,
      vendasFechadas: 23,
      taxaConversao: 15.9,
      ticketMedio: 145900,
    },
    {
      id: 2,
      nome: 'Ana Costa',
      email: 'ana@empresa.com',
      telefone: '+55 11 99999-2222',
      cargo: 'Vendedora Sênior',
      role: 'vendedor',
      ativo: true,
      entrou: '2023-03-20',
      leadsAtendidos: 234,
      vendasFechadas: 45,
      taxaConversao: 19.2,
      ticketMedio: 152000,
    },
    {
      id: 3,
      nome: 'Roberto Mendes',
      email: 'roberto@empresa.com',
      telefone: '+55 11 99999-3333',
      cargo: 'Vendedor',
      role: 'vendedor',
      ativo: true,
      entrou: '2023-06-10',
      leadsAtendidos: 189,
      vendasFechadas: 31,
      taxaConversao: 16.4,
      ticketMedio: 138500,
    },
    {
      id: 4,
      nome: 'Julia Santos',
      email: 'julia@empresa.com',
      telefone: '+55 11 99999-4444',
      cargo: 'Vendedora',
      role: 'vendedor',
      ativo: true,
      entrou: '2023-08-05',
      leadsAtendidos: 167,
      vendasFechadas: 28,
      taxaConversao: 16.8,
      ticketMedio: 141200,
    },
    {
      id: 5,
      nome: 'Pedro Alves',
      email: 'pedro@empresa.com',
      telefone: '+55 11 99999-5555',
      cargo: 'Suporte',
      role: 'visualizador',
      ativo: false,
      entrou: '2023-02-28',
      leadsAtendidos: 0,
      vendasFechadas: 0,
      taxaConversao: 0,
      ticketMedio: 0,
    },
  ])

  const [dialogAberto, setDialogAberto] = useState(false)
  const [membroEditando, setMembroEditando] = useState(null)

  const roles = [
    {
      id: 'admin',
      nome: 'Administrador',
      icone: Crown,
      cor: 'yellow',
      descricao: 'Acesso total ao sistema',
      permissoes: ['Todas as permissões', 'Gerenciar usuários', 'Configurar sistema', 'Ver relatórios'],
    },
    {
      id: 'vendedor',
      nome: 'Vendedor',
      icone: Target,
      cor: 'blue',
      descricao: 'Atendimento e vendas',
      permissoes: ['Atender leads', 'Criar propostas', 'Agendar visitas', 'Ver estoque'],
    },
    {
      id: 'visualizador',
      nome: 'Visualizador',
      icone: Shield,
      cor: 'gray',
      descricao: 'Apenas visualização',
      permissoes: ['Ver dashboard', 'Ver relatórios', 'Ver equipe'],
    },
  ]

  // Colunas da tabela
  const colunas = [
    {
      accessorKey: 'nome',
      header: 'Membro',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-blue-600 text-white">
              {row.original.nome.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-white">{row.original.nome}</p>
            <p className="text-xs text-gray-400">{row.original.cargo}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Contato',
      cell: ({ row }) => (
        <div className="text-sm">
          <div className="flex items-center gap-1 text-gray-300">
            <Mail className="h-3 w-3" />
            {row.original.email}
          </div>
          <div className="flex items-center gap-1 text-gray-400 mt-1">
            <Phone className="h-3 w-3" />
            {row.original.telefone}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Função',
      cell: ({ row }) => {
        const role = roles.find(r => r.id === row.original.role)
        const Icon = role?.icone
        return (
          <Badge className={`bg-${role?.cor}-500/20 text-${role?.cor}-400`}>
            <Icon className="h-3 w-3 mr-1" />
            {role?.nome}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'vendasFechadas',
      header: 'Vendas',
      cell: ({ row }) => (
        <div className="text-center">
          <p className="text-lg font-bold text-white">{row.original.vendasFechadas}</p>
          <p className="text-xs text-gray-400">{row.original.taxaConversao}% conversão</p>
        </div>
      ),
    },
    {
      accessorKey: 'ativo',
      header: 'Status',
      cell: ({ row }) => (
        <Badge className={row.original.ativo ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
          {row.original.ativo ? 'Ativo' : 'Inativo'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => editarMembro(row.original)}
            className="text-blue-400 hover:bg-blue-900/20"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => deletarMembro(row.original.id)}
            className="text-red-400 hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  const editarMembro = (membro) => {
    setMembroEditando(membro)
    setDialogAberto(true)
  }

  const deletarMembro = (id) => {
    if (confirm('Deseja realmente remover este membro?')) {
      setMembros(membros.filter(m => m.id !== id))
      showNotification?.('Membro removido!')
    }
  }

  const salvarMembro = () => {
    if (membroEditando.id) {
      setMembros(membros.map(m => m.id === membroEditando.id ? membroEditando : m))
      showNotification?.('Membro atualizado!')
    } else {
      const novoMembro = {
        ...membroEditando,
        id: Math.max(...membros.map(m => m.id)) + 1,
        leadsAtendidos: 0,
        vendasFechadas: 0,
        taxaConversao: 0,
        ticketMedio: 0,
        entrou: new Date().toISOString().split('T')[0],
      }
      setMembros([...membros, novoMembro])
      showNotification?.('Membro adicionado!')
    }
    setDialogAberto(false)
    setMembroEditando(null)
  }

  // Top Performers
  const topPerformers = [...membros]
    .filter(m => m.ativo && m.role === 'vendedor')
    .sort((a, b) => b.vendasFechadas - a.vendasFechadas)
    .slice(0, 3)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Equipe</h1>
          <p className="text-gray-400 mt-1">Gerencie membros, permissões e performance</p>
        </div>
        <Button
          onClick={() => {
            setMembroEditando({
              id: null,
              nome: '',
              email: '',
              telefone: '',
              cargo: '',
              role: 'vendedor',
              ativo: true,
            })
            setDialogAberto(true)
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Membro
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1e293b] border-[#334155]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total da Equipe</p>
                <p className="text-2xl font-bold text-white mt-1">{membros.filter(m => m.ativo).length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1e293b] border-[#334155]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Vendas no Mês</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {membros.reduce((acc, m) => acc + m.vendasFechadas, 0)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1e293b] border-[#334155]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Taxa Média de Conversão</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {(membros.reduce((acc, m) => acc + m.taxaConversao, 0) / membros.filter(m => m.ativo && m.role === 'vendedor').length).toFixed(1)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1e293b] border-[#334155]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Ticket Médio</p>
                <p className="text-2xl font-bold text-white mt-1">
                  R$ {Math.round(membros.reduce((acc, m) => acc + m.ticketMedio, 0) / membros.filter(m => m.ativo && m.role === 'vendedor').length / 1000)}k
                </p>
              </div>
              <Award className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="membros" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-[#0f172a]">
          <TabsTrigger value="membros">Membros</TabsTrigger>
          <TabsTrigger value="permissoes">Permissões</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* TAB: Membros */}
        <TabsContent value="membros" className="space-y-6">
          <Card className="bg-[#1e293b] border-[#334155]">
            <CardContent className="p-6">
              <DataTable
                data={membros}
                columns={colunas}
                onRowClick={(row) => editarMembro(row)}
                enableSearch={true}
                enableColumnVisibility={true}
                enablePagination={true}
                pageSize={10}
                searchPlaceholder="Buscar membros..."
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Permissões */}
        <TabsContent value="permissoes" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map((role) => {
              const Icon = role.icone
              const count = membros.filter(m => m.role === role.id && m.ativo).length

              return (
                <Card key={role.id} className="bg-[#1e293b] border-[#334155]">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-5 w-5 text-${role.cor}-500`} />
                        <CardTitle className="text-white">{role.nome}</CardTitle>
                      </div>
                      <Badge className={`bg-${role.cor}-500/20 text-${role.cor}-400`}>{count}</Badge>
                    </div>
                    <CardDescription className="text-gray-400">{role.descricao}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-white mb-3">Permissões:</p>
                      {role.permissoes.map((permissao, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm text-gray-300">
                          <div className={`w-1.5 h-1.5 rounded-full bg-${role.cor}-500 mt-1.5`}></div>
                          <span>{permissao}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* TAB: Performance */}
        <TabsContent value="performance" className="space-y-6">
          {/* Top Performers */}
          <Card className="bg-[#1e293b] border-[#334155]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                Top Performers do Mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPerformers.map((membro, index) => (
                  <div
                    key={membro.id}
                    className="flex items-center gap-4 p-4 bg-[#0f172a] border border-[#334155] rounded-lg"
                  >
                    <div className={`text-3xl font-bold ${
                      index === 0 ? 'text-yellow-500' :
                      index === 1 ? 'text-gray-400' :
                      'text-orange-600'
                    }`}>
                      #{index + 1}
                    </div>

                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-blue-600 text-white text-lg">
                        {membro.nome.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <p className="font-semibold text-white">{membro.nome}</p>
                      <p className="text-sm text-gray-400">{membro.cargo}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">{membro.vendasFechadas}</p>
                      <p className="text-xs text-gray-400">vendas</p>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-semibold text-green-400">{membro.taxaConversao}%</p>
                      <p className="text-xs text-gray-400">conversão</p>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-semibold text-blue-400">R$ {Math.round(membro.ticketMedio / 1000)}k</p>
                      <p className="text-xs text-gray-400">ticket médio</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Todos os Membros - Performance Detalhada */}
          <Card className="bg-[#1e293b] border-[#334155]">
            <CardHeader>
              <CardTitle className="text-white">Performance Individual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {membros.filter(m => m.ativo && m.role === 'vendedor').map((membro) => (
                  <div key={membro.id} className="p-4 bg-[#0f172a] border border-[#334155] rounded-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar>
                        <AvatarFallback className="bg-blue-600 text-white">
                          {membro.nome.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-white">{membro.nome}</p>
                        <p className="text-xs text-gray-400">{membro.cargo}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-white">{membro.leadsAtendidos}</p>
                        <p className="text-xs text-gray-400">Leads</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-400">{membro.vendasFechadas}</p>
                        <p className="text-xs text-gray-400">Vendas</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-400">{membro.taxaConversao}%</p>
                        <p className="text-xs text-gray-400">Conversão</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de Edição */}
      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent className="bg-[#1e293b] border-[#334155]">
          <DialogHeader>
            <DialogTitle className="text-white">
              {membroEditando?.id ? 'Editar Membro' : 'Novo Membro'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Configure as informações do membro da equipe
            </DialogDescription>
          </DialogHeader>

          {membroEditando && (
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-white">Nome Completo</Label>
                <Input
                  value={membroEditando.nome}
                  onChange={(e) => setMembroEditando({ ...membroEditando, nome: e.target.value })}
                  className="mt-2 bg-[#0f172a] border-[#334155] text-white"
                  placeholder="Ex: João Silva"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Email</Label>
                  <Input
                    type="email"
                    value={membroEditando.email}
                    onChange={(e) => setMembroEditando({ ...membroEditando, email: e.target.value })}
                    className="mt-2 bg-[#0f172a] border-[#334155] text-white"
                    placeholder="email@empresa.com"
                  />
                </div>

                <div>
                  <Label className="text-white">Telefone</Label>
                  <Input
                    value={membroEditando.telefone}
                    onChange={(e) => setMembroEditando({ ...membroEditando, telefone: e.target.value })}
                    className="mt-2 bg-[#0f172a] border-[#334155] text-white"
                    placeholder="+55 11 99999-9999"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Cargo</Label>
                  <Input
                    value={membroEditando.cargo}
                    onChange={(e) => setMembroEditando({ ...membroEditando, cargo: e.target.value })}
                    className="mt-2 bg-[#0f172a] border-[#334155] text-white"
                    placeholder="Ex: Vendedor"
                  />
                </div>

                <div>
                  <Label className="text-white">Função/Permissão</Label>
                  <select
                    value={membroEditando.role}
                    onChange={(e) => setMembroEditando({ ...membroEditando, role: e.target.value })}
                    className="w-full mt-2 bg-[#0f172a] border border-[#334155] text-white rounded-lg p-2"
                  >
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>{role.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#0f172a] border border-[#334155] rounded-lg">
                <Label className="text-white">Membro Ativo</Label>
                <input
                  type="checkbox"
                  checked={membroEditando.ativo}
                  onChange={(e) => setMembroEditando({ ...membroEditando, ativo: e.target.checked })}
                  className="w-4 h-4"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAberto(false)} className="border-gray-600 text-gray-300">
              Cancelar
            </Button>
            <Button onClick={salvarMembro} className="bg-blue-600 hover:bg-blue-700">
              Salvar Membro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
