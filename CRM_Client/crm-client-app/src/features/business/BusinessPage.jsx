/**
 * ═══════════════════════════════════════════════════════════════
 * PÁGINA: NEGÓCIO
 * Configurações de financiamento, descontos e promoções
 * ═══════════════════════════════════════════════════════════════
 */

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DataTable } from '@/components/common/DataTable'
import {
  DollarSign, Percent, TrendingUp, Tag, Save, Plus, Edit, Trash2,
  Calculator, CreditCard, Building, AlertCircle
} from 'lucide-react'

export default function BusinessPage({ user, showNotification }) {
  // Configurações de Financiamento
  const [financiamento, setFinanciamento] = useState({
    taxaJurosMin: 1.5,
    taxaJurosMax: 3.5,
    parcelasMin: 12,
    parcelasMax: 60,
    entradaMinima: 20, // porcentagem
    habilitado: true,
  })

  // Parceiros Financeiros
  const [parceiros, setParceiros] = useState([
    { id: 1, nome: 'Banco do Brasil', taxa: 1.8, prazo: 60, ativo: true },
    { id: 2, nome: 'Itaú', taxa: 1.9, prazo: 60, ativo: true },
    { id: 3, nome: 'Santander', taxa: 2.1, prazo: 48, ativo: true },
    { id: 4, nome: 'Bradesco', taxa: 2.0, prazo: 60, ativo: true },
  ])

  // Políticas de Desconto
  const [descontos, setDescontos] = useState({
    descontoMaximo: 15, // porcentagem
    descontoAutomaticoVista: 5, // porcentagem
    descontoAutomatico: true,
    aprovacaoNecessaria: true,
    limiteAprovacaoAutomatica: 10, // porcentagem
  })

  // Promoções
  const [promocoes, setPromocoes] = useState([
    {
      id: 1,
      nome: 'Black Friday',
      desconto: 20,
      tipo: 'percentual',
      inicio: '2024-11-20',
      fim: '2024-11-30',
      ativo: true,
      produtos: 'Todos',
    },
    {
      id: 2,
      nome: 'Queima de Estoque',
      desconto: 5000,
      tipo: 'valor_fixo',
      inicio: '2024-01-15',
      fim: '2024-01-31',
      ativo: true,
      produtos: 'Veículos 2022',
    },
    {
      id: 3,
      nome: 'Frete Grátis',
      desconto: 0,
      tipo: 'frete_gratis',
      inicio: '2024-01-01',
      fim: '2024-12-31',
      ativo: false,
      produtos: 'Todos',
    },
  ])

  const [dialogAberto, setDialogAberto] = useState(false)
  const [promocaoEditando, setPromocaoEditando] = useState(null)

  // Colunas da tabela de promoções
  const colunas = [
    {
      accessorKey: 'nome',
      header: 'Nome',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.original.nome}</span>
          {row.original.ativo && <Badge className="bg-green-500/20 text-green-400">Ativa</Badge>}
        </div>
      ),
    },
    {
      accessorKey: 'desconto',
      header: 'Desconto',
      cell: ({ row }) => {
        const { desconto, tipo } = row.original
        if (tipo === 'percentual') return `${desconto}%`
        if (tipo === 'valor_fixo') return `R$ ${desconto.toLocaleString('pt-BR')}`
        return 'Frete Grátis'
      },
    },
    {
      accessorKey: 'tipo',
      header: 'Tipo',
      cell: ({ row }) => {
        const tipos = {
          percentual: 'Percentual',
          valor_fixo: 'Valor Fixo',
          frete_gratis: 'Frete Grátis',
        }
        return tipos[row.original.tipo]
      },
    },
    {
      accessorKey: 'periodo',
      header: 'Período',
      cell: ({ row }) => (
        <span className="text-sm">
          {new Date(row.original.inicio).toLocaleDateString('pt-BR')} até{' '}
          {new Date(row.original.fim).toLocaleDateString('pt-BR')}
        </span>
      ),
    },
    {
      accessorKey: 'produtos',
      header: 'Produtos',
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs">{row.original.produtos}</Badge>
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
            onClick={() => editarPromocao(row.original)}
            className="text-blue-400 hover:bg-blue-900/20"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => deletarPromocao(row.original.id)}
            className="text-red-400 hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  const editarPromocao = (promocao) => {
    setPromocaoEditando(promocao)
    setDialogAberto(true)
  }

  const deletarPromocao = (id) => {
    if (confirm('Deseja realmente excluir esta promoção?')) {
      setPromocoes(promocoes.filter(p => p.id !== id))
      showNotification?.('Promoção excluída!')
    }
  }

  const salvarPromocao = () => {
    if (promocaoEditando.id) {
      setPromocoes(promocoes.map(p => p.id === promocaoEditando.id ? promocaoEditando : p))
      showNotification?.('Promoção atualizada!')
    } else {
      const novaPromocao = {
        ...promocaoEditando,
        id: Math.max(...promocoes.map(p => p.id)) + 1,
      }
      setPromocoes([...promocoes, novaPromocao])
      showNotification?.('Promoção criada!')
    }
    setDialogAberto(false)
    setPromocaoEditando(null)
  }

  const salvarConfiguracoes = () => {
    showNotification?.('Configurações salvas com sucesso!')
  }

  const calcularParcela = (valor, taxa, parcelas) => {
    const taxaMensal = taxa / 100
    const valorParcela = valor * (taxaMensal * Math.pow(1 + taxaMensal, parcelas)) /
                        (Math.pow(1 + taxaMensal, parcelas) - 1)
    return valorParcela
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Configurações de Negócio</h1>
          <p className="text-gray-400 mt-1">Gerencie financiamento, descontos e promoções</p>
        </div>
        <Button onClick={salvarConfiguracoes} className="bg-green-600 hover:bg-green-700">
          <Save className="h-4 w-4 mr-2" />
          Salvar Tudo
        </Button>
      </div>

      <Tabs defaultValue="financiamento" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-[#0f172a]">
          <TabsTrigger value="financiamento">Financiamento</TabsTrigger>
          <TabsTrigger value="descontos">Descontos</TabsTrigger>
          <TabsTrigger value="promocoes">Promoções</TabsTrigger>
        </TabsList>

        {/* TAB: Financiamento */}
        <TabsContent value="financiamento" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configurações Gerais */}
            <Card className="bg-[#1e293b] border-[#334155]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-blue-500" />
                  Configurações de Financiamento
                </CardTitle>
                <CardDescription className="text-gray-400">Defina os parâmetros de financiamento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-[#0f172a] border border-[#334155] rounded-lg">
                  <Label className="text-white">Habilitar Financiamento</Label>
                  <Switch
                    checked={financiamento.habilitado}
                    onCheckedChange={(checked) => setFinanciamento({ ...financiamento, habilitado: checked })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Taxa de Juros Mín. (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={financiamento.taxaJurosMin}
                      onChange={(e) => setFinanciamento({ ...financiamento, taxaJurosMin: parseFloat(e.target.value) })}
                      className="mt-2 bg-[#0f172a] border-[#334155] text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Taxa de Juros Máx. (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={financiamento.taxaJurosMax}
                      onChange={(e) => setFinanciamento({ ...financiamento, taxaJurosMax: parseFloat(e.target.value) })}
                      className="mt-2 bg-[#0f172a] border-[#334155] text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Parcelas Mínimas</Label>
                    <Input
                      type="number"
                      value={financiamento.parcelasMin}
                      onChange={(e) => setFinanciamento({ ...financiamento, parcelasMin: parseInt(e.target.value) })}
                      className="mt-2 bg-[#0f172a] border-[#334155] text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Parcelas Máximas</Label>
                    <Input
                      type="number"
                      value={financiamento.parcelasMax}
                      onChange={(e) => setFinanciamento({ ...financiamento, parcelasMax: parseInt(e.target.value) })}
                      className="mt-2 bg-[#0f172a] border-[#334155] text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white">Entrada Mínima (%)</Label>
                  <Input
                    type="number"
                    value={financiamento.entradaMinima}
                    onChange={(e) => setFinanciamento({ ...financiamento, entradaMinima: parseInt(e.target.value) })}
                    className="mt-2 bg-[#0f172a] border-[#334155] text-white"
                  />
                </div>

                {/* Simulador */}
                <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-lg p-4 mt-6">
                  <h4 className="text-sm font-semibold text-white mb-3">Simulação Rápida</h4>
                  <div className="space-y-2 text-sm text-gray-300">
                    <p>Valor do Veículo: <span className="font-bold text-white">R$ 50.000</span></p>
                    <p>Entrada ({financiamento.entradaMinima}%): <span className="font-bold text-white">R$ {(50000 * financiamento.entradaMinima / 100).toLocaleString('pt-BR')}</span></p>
                    <p>Valor Financiado: <span className="font-bold text-white">R$ {(50000 * (100 - financiamento.entradaMinima) / 100).toLocaleString('pt-BR')}</span></p>
                    <p>Parcela ({financiamento.parcelasMax}x): <span className="font-bold text-green-400">
                      R$ {calcularParcela(50000 * (100 - financiamento.entradaMinima) / 100, financiamento.taxaJurosMin, financiamento.parcelasMax).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span></p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Parceiros Financeiros */}
            <Card className="bg-[#1e293b] border-[#334155]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Building className="h-5 w-5 text-green-500" />
                  Parceiros Financeiros
                </CardTitle>
                <CardDescription className="text-gray-400">Bancos e instituições financeiras</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {parceiros.map((parceiro) => (
                    <div
                      key={parceiro.id}
                      className="flex items-center justify-between p-4 bg-[#0f172a] border border-[#334155] rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-white">{parceiro.nome}</p>
                        <div className="flex gap-4 mt-1">
                          <span className="text-xs text-gray-400">Taxa: {parceiro.taxa}% a.m.</span>
                          <span className="text-xs text-gray-400">Até {parceiro.prazo}x</span>
                        </div>
                      </div>
                      <Switch
                        checked={parceiro.ativo}
                        onCheckedChange={(checked) => {
                          setParceiros(parceiros.map(p =>
                            p.id === parceiro.id ? { ...p, ativo: checked } : p
                          ))
                        }}
                      />
                    </div>
                  ))}

                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Parceiro
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB: Descontos */}
        <TabsContent value="descontos" className="space-y-6">
          <Card className="bg-[#1e293b] border-[#334155]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Percent className="h-5 w-5 text-orange-500" />
                Políticas de Desconto
              </CardTitle>
              <CardDescription className="text-gray-400">Configure regras de desconto automáticas e manuais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-white">Desconto Máximo Permitido (%)</Label>
                    <Input
                      type="number"
                      value={descontos.descontoMaximo}
                      onChange={(e) => setDescontos({ ...descontos, descontoMaximo: parseInt(e.target.value) })}
                      className="mt-2 bg-[#0f172a] border-[#334155] text-white"
                    />
                    <p className="text-xs text-gray-400 mt-1">Limite máximo que pode ser oferecido em qualquer venda</p>
                  </div>

                  <div>
                    <Label className="text-white">Desconto Automático à Vista (%)</Label>
                    <Input
                      type="number"
                      value={descontos.descontoAutomaticoVista}
                      onChange={(e) => setDescontos({ ...descontos, descontoAutomaticoVista: parseInt(e.target.value) })}
                      className="mt-2 bg-[#0f172a] border-[#334155] text-white"
                    />
                    <p className="text-xs text-gray-400 mt-1">Desconto aplicado automaticamente em compras à vista</p>
                  </div>

                  <div>
                    <Label className="text-white">Limite para Aprovação Automática (%)</Label>
                    <Input
                      type="number"
                      value={descontos.limiteAprovacaoAutomatica}
                      onChange={(e) => setDescontos({ ...descontos, limiteAprovacaoAutomatica: parseInt(e.target.value) })}
                      className="mt-2 bg-[#0f172a] border-[#334155] text-white"
                    />
                    <p className="text-xs text-gray-400 mt-1">Descontos acima deste valor precisam de aprovação</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-[#0f172a] border border-[#334155] rounded-lg">
                    <div>
                      <Label className="text-white">Desconto Automático Habilitado</Label>
                      <p className="text-xs text-gray-400 mt-1">Aplicar descontos automaticamente</p>
                    </div>
                    <Switch
                      checked={descontos.descontoAutomatico}
                      onCheckedChange={(checked) => setDescontos({ ...descontos, descontoAutomatico: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#0f172a] border border-[#334155] rounded-lg">
                    <div>
                      <Label className="text-white">Aprovação Necessária</Label>
                      <p className="text-xs text-gray-400 mt-1">Requer aprovação do gerente</p>
                    </div>
                    <Switch
                      checked={descontos.aprovacaoNecessaria}
                      onCheckedChange={(checked) => setDescontos({ ...descontos, aprovacaoNecessaria: checked })}
                    />
                  </div>

                  {/* Exemplo Visual */}
                  <div className="bg-gradient-to-br from-orange-900/20 to-yellow-900/20 border border-orange-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-2 mb-3">
                      <AlertCircle className="h-5 w-5 text-orange-400 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-white">Como Funciona</h4>
                        <p className="text-xs text-gray-300 mt-1">
                          Descontos até {descontos.limiteAprovacaoAutomatica}% são aplicados automaticamente.
                          Acima disso, requerem aprovação do gerente.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Promoções */}
        <TabsContent value="promocoes" className="space-y-6">
          <Card className="bg-[#1e293b] border-[#334155]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Tag className="h-5 w-5 text-purple-500" />
                    Promoções Ativas
                  </CardTitle>
                  <CardDescription className="text-gray-400">Gerencie campanhas e ofertas especiais</CardDescription>
                </div>
                <Button
                  onClick={() => {
                    setPromocaoEditando({
                      id: null,
                      nome: '',
                      desconto: 0,
                      tipo: 'percentual',
                      inicio: '',
                      fim: '',
                      ativo: true,
                      produtos: 'Todos',
                    })
                    setDialogAberto(true)
                  }}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Promoção
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                data={promocoes}
                columns={colunas}
                onRowClick={(row) => editarPromocao(row)}
                enableSearch={true}
                enableColumnVisibility={true}
                enablePagination={true}
                pageSize={10}
                searchPlaceholder="Buscar promoções..."
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de Edição de Promoção */}
      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent className="bg-[#1e293b] border-[#334155]">
          <DialogHeader>
            <DialogTitle className="text-white">
              {promocaoEditando?.id ? 'Editar Promoção' : 'Nova Promoção'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Configure os detalhes da promoção
            </DialogDescription>
          </DialogHeader>

          {promocaoEditando && (
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-white">Nome da Promoção</Label>
                <Input
                  value={promocaoEditando.nome}
                  onChange={(e) => setPromocaoEditando({ ...promocaoEditando, nome: e.target.value })}
                  className="mt-2 bg-[#0f172a] border-[#334155] text-white"
                  placeholder="Ex: Black Friday"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Tipo de Desconto</Label>
                  <select
                    value={promocaoEditando.tipo}
                    onChange={(e) => setPromocaoEditando({ ...promocaoEditando, tipo: e.target.value })}
                    className="w-full mt-2 bg-[#0f172a] border border-[#334155] text-white rounded-lg p-2"
                  >
                    <option value="percentual">Percentual (%)</option>
                    <option value="valor_fixo">Valor Fixo (R$)</option>
                    <option value="frete_gratis">Frete Grátis</option>
                  </select>
                </div>

                {promocaoEditando.tipo !== 'frete_gratis' && (
                  <div>
                    <Label className="text-white">Valor do Desconto</Label>
                    <Input
                      type="number"
                      value={promocaoEditando.desconto}
                      onChange={(e) => setPromocaoEditando({ ...promocaoEditando, desconto: parseFloat(e.target.value) })}
                      className="mt-2 bg-[#0f172a] border-[#334155] text-white"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Data de Início</Label>
                  <Input
                    type="date"
                    value={promocaoEditando.inicio}
                    onChange={(e) => setPromocaoEditando({ ...promocaoEditando, inicio: e.target.value })}
                    className="mt-2 bg-[#0f172a] border-[#334155] text-white"
                  />
                </div>

                <div>
                  <Label className="text-white">Data de Término</Label>
                  <Input
                    type="date"
                    value={promocaoEditando.fim}
                    onChange={(e) => setPromocaoEditando({ ...promocaoEditando, fim: e.target.value })}
                    className="mt-2 bg-[#0f172a] border-[#334155] text-white"
                  />
                </div>
              </div>

              <div>
                <Label className="text-white">Produtos Aplicáveis</Label>
                <Input
                  value={promocaoEditando.produtos}
                  onChange={(e) => setPromocaoEditando({ ...promocaoEditando, produtos: e.target.value })}
                  className="mt-2 bg-[#0f172a] border-[#334155] text-white"
                  placeholder="Ex: Todos, Veículos 2022, etc"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-[#0f172a] border border-[#334155] rounded-lg">
                <Label className="text-white">Promoção Ativa</Label>
                <Switch
                  checked={promocaoEditando.ativo}
                  onCheckedChange={(checked) => setPromocaoEditando({ ...promocaoEditando, ativo: checked })}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAberto(false)} className="border-gray-600 text-gray-300">
              Cancelar
            </Button>
            <Button onClick={salvarPromocao} className="bg-purple-600 hover:bg-purple-700">
              Salvar Promoção
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
