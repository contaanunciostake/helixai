/**
 * ═══════════════════════════════════════════════════════════════
 * PÁGINA: BASE DE CONHECIMENTO
 * FAQ gerenciável com categorias e busca
 * ═══════════════════════════════════════════════════════════════
 */

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DataTable } from '@/components/common/DataTable'
import { useDebounce } from '@/hooks/useDebounce'
import {
  BookOpen, Plus, Edit, Trash2, Search, TrendingUp,
  Folder, FileText, Eye, HelpCircle
} from 'lucide-react'

export default function KnowledgeBasePage({ user, showNotification }) {
  const [categorias, setCategorias] = useState([
    { id: 1, nome: 'Geral', cor: 'blue', questoes: 15 },
    { id: 2, nome: 'Financiamento', cor: 'green', questoes: 8 },
    { id: 3, nome: 'Documentação', cor: 'orange', questoes: 6 },
    { id: 4, nome: 'Garantia', cor: 'purple', questoes: 5 },
    { id: 5, nome: 'Entrega', cor: 'pink', questoes: 4 },
  ])

  const [faqs, setFaqs] = useState([
    {
      id: 1,
      categoria: 'Geral',
      pergunta: 'Quais formas de pagamento vocês aceitam?',
      resposta: 'Aceitamos pagamento à vista (dinheiro, PIX, transferência) e financiamento através de nossos parceiros bancários. Para financiamento, trabalhamos com os principais bancos do mercado com taxas competitivas.',
      visualizacoes: 245,
      ativo: true,
    },
    {
      id: 2,
      categoria: 'Financiamento',
      pergunta: 'Qual o valor mínimo de entrada para financiamento?',
      resposta: 'O valor mínimo de entrada varia de acordo com o banco financiador, mas geralmente é de 20% do valor total do veículo. Em alguns casos especiais, podemos trabalhar com entradas menores.',
      visualizacoes: 189,
      ativo: true,
    },
    {
      id: 3,
      categoria: 'Financiamento',
      pergunta: 'Quantas parcelas posso financiar?',
      resposta: 'Oferecemos financiamento de 12 até 60 meses, dependendo do valor do veículo e da análise de crédito. As condições e taxas variam conforme o banco escolhido.',
      visualizacoes: 167,
      ativo: true,
    },
    {
      id: 4,
      categoria: 'Documentação',
      pergunta: 'Quais documentos preciso para comprar um veículo?',
      resposta: 'Para pessoa física: RG, CPF, comprovante de residência e comprovante de renda. Para pessoa jurídica: Contrato social, CNPJ, documentos do responsável legal e comprovantes fiscais.',
      visualizacoes: 156,
      ativo: true,
    },
    {
      id: 5,
      categoria: 'Garantia',
      pergunta: 'Os veículos têm garantia?',
      resposta: 'Sim! Todos os nossos veículos seminovos possuem garantia de 3 meses para motor e câmbio. Veículos zero km seguem a garantia de fábrica (geralmente 12 meses).',
      visualizacoes: 134,
      ativo: true,
    },
    {
      id: 6,
      categoria: 'Geral',
      pergunta: 'Aceitam veículo usado na troca?',
      resposta: 'Sim! Aceitamos seu veículo usado como parte do pagamento. Fazemos uma avaliação justa baseada na tabela FIPE e nas condições do veículo.',
      visualizacoes: 128,
      ativo: true,
    },
    {
      id: 7,
      categoria: 'Entrega',
      pergunta: 'Quanto tempo demora para receber o veículo?',
      resposta: 'Veículos disponíveis em estoque podem ser retirados em até 2 dias úteis após a aprovação do financiamento (se houver) e assinatura dos documentos. Para veículos sob encomenda, o prazo varia conforme o fabricante.',
      visualizacoes: 98,
      ativo: true,
    },
  ])

  const [busca, setBusca] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas')
  const [dialogAberto, setDialogAberto] = useState(false)
  const [faqEditando, setFaqEditando] = useState(null)
  const [modoVisualizacao, setModoVisualizacao] = useState('faq') // 'faq' ou 'tabela'

  const buscaDebounced = useDebounce(busca, 300)

  // Filtrar FAQs
  const faqsFiltrados = useMemo(() => {
    return faqs.filter(faq => {
      const matchBusca = !buscaDebounced ||
        faq.pergunta.toLowerCase().includes(buscaDebounced.toLowerCase()) ||
        faq.resposta.toLowerCase().includes(buscaDebounced.toLowerCase())

      const matchCategoria = categoriaFiltro === 'Todas' || faq.categoria === categoriaFiltro

      return matchBusca && matchCategoria && faq.ativo
    })
  }, [faqs, buscaDebounced, categoriaFiltro])

  // Agrupar por categoria
  const faqsPorCategoria = useMemo(() => {
    const grupos = {}
    faqsFiltrados.forEach(faq => {
      if (!grupos[faq.categoria]) {
        grupos[faq.categoria] = []
      }
      grupos[faq.categoria].push(faq)
    })
    return grupos
  }, [faqsFiltrados])

  // Colunas da tabela
  const colunas = [
    {
      accessorKey: 'pergunta',
      header: 'Pergunta',
      cell: ({ row }) => (
        <div className="max-w-md">
          <p className="font-medium text-white truncate">{row.original.pergunta}</p>
          <Badge variant="outline" className="mt-1 text-xs">{row.original.categoria}</Badge>
        </div>
      ),
    },
    {
      accessorKey: 'resposta',
      header: 'Resposta',
      cell: ({ row }) => (
        <p className="text-sm text-gray-400 line-clamp-2 max-w-lg">{row.original.resposta}</p>
      ),
    },
    {
      accessorKey: 'visualizacoes',
      header: 'Visualizações',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-gray-400" />
          <span>{row.original.visualizacoes}</span>
        </div>
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
            onClick={() => editarFaq(row.original)}
            className="text-blue-400 hover:bg-blue-900/20"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => deletarFaq(row.original.id)}
            className="text-red-400 hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  const editarFaq = (faq) => {
    setFaqEditando(faq)
    setDialogAberto(true)
  }

  const deletarFaq = (id) => {
    if (confirm('Deseja realmente excluir esta pergunta?')) {
      setFaqs(faqs.map(f => f.id === id ? { ...f, ativo: false } : f))
      showNotification?.('Pergunta excluída!')
    }
  }

  const salvarFaq = () => {
    if (faqEditando.id) {
      setFaqs(faqs.map(f => f.id === faqEditando.id ? faqEditando : f))
      showNotification?.('Pergunta atualizada!')
    } else {
      const novaFaq = {
        ...faqEditando,
        id: Math.max(...faqs.map(f => f.id)) + 1,
        visualizacoes: 0,
        ativo: true,
      }
      setFaqs([...faqs, novaFaq])
      showNotification?.('Pergunta adicionada!')
    }
    setDialogAberto(false)
    setFaqEditando(null)
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

      {/* Header com identidade visual do Dashboard */}
      <div className="relative overflow-hidden rounded-2xl card-glass">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
        <div className="relative p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  Base de Conhecimento
                </h1>
                <p className="text-white/60 mt-1 text-sm">FAQ e perguntas frequentes do bot</p>
              </div>
            </div>
            <Button
              onClick={() => {
                setFaqEditando({
                  id: null,
                  categoria: 'Geral',
                  pergunta: '',
                  resposta: '',
                  visualizacoes: 0,
                  ativo: true,
                })
                setDialogAberto(true)
              }}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/30"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Pergunta
            </Button>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
        {categorias.map((cat) => (
          <Card key={cat.id} className="relative overflow-hidden rounded-2xl card-glass border-white/10">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
            <CardContent className="relative p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">{cat.nome}</p>
                  <p className="text-2xl font-bold text-white mt-1">{cat.questoes}</p>
                </div>
                <Folder className={`h-8 w-8 text-${cat.cor}-500`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Controles */}
      <Card className="relative overflow-hidden rounded-2xl card-glass border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
        <CardContent className="relative p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Busca */}
            <div className="flex-1 w-full md:max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
                <Input
                  placeholder="Buscar perguntas..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10 bg-black/30 border-white/10 text-white placeholder:text-white/40"
                />
              </div>
            </div>

            {/* Filtro de Categoria */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={categoriaFiltro === 'Todas' ? 'default' : 'outline'}
                onClick={() => setCategoriaFiltro('Todas')}
                className={categoriaFiltro === 'Todas' ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30' : 'border-white/20 text-white/80 hover:bg-white/10'}
              >
                Todas
              </Button>
              {categorias.map((cat) => (
                <Button
                  key={cat.id}
                  size="sm"
                  variant={categoriaFiltro === cat.nome ? 'default' : 'outline'}
                  onClick={() => setCategoriaFiltro(cat.nome)}
                  className={categoriaFiltro === cat.nome ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30' : 'border-white/20 text-white/80 hover:bg-white/10'}
                >
                  {cat.nome}
                </Button>
              ))}
            </div>

            {/* Toggle de Visualização */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={modoVisualizacao === 'faq' ? 'default' : 'outline'}
                onClick={() => setModoVisualizacao('faq')}
                className={modoVisualizacao === 'faq' ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30' : 'border-white/20 text-white/80 hover:bg-white/10'}
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                FAQ
              </Button>
              <Button
                size="sm"
                variant={modoVisualizacao === 'tabela' ? 'default' : 'outline'}
                onClick={() => setModoVisualizacao('tabela')}
                className={modoVisualizacao === 'tabela' ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30' : 'border-white/20 text-white/80 hover:bg-white/10'}
              >
                <FileText className="h-4 w-4 mr-2" />
                Tabela
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conteúdo */}
      {modoVisualizacao === 'faq' ? (
        /* Visualização FAQ */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
          {/* Lista de Perguntas */}
          <div className="lg:col-span-2">
            <Card className="relative overflow-hidden rounded-2xl card-glass border-white/10">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
              <CardHeader className="relative">
                <CardTitle className="text-white">
                  Perguntas Frequentes ({faqsFiltrados.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <ScrollArea className="h-[600px] pr-4">
                  {Object.keys(faqsPorCategoria).length > 0 ? (
                    <Accordion type="single" collapsible className="space-y-4">
                      {Object.entries(faqsPorCategoria).map(([categoria, perguntas]) => (
                        <div key={categoria} className="space-y-2">
                          <div className="flex items-center gap-2 mb-2">
                            <Folder className="h-4 w-4 text-green-500" />
                            <h3 className="font-semibold text-white">{categoria}</h3>
                            <Badge variant="outline" className="text-xs border-white/20 text-white/80">{perguntas.length}</Badge>
                          </div>

                          {perguntas.map((faq) => (
                            <AccordionItem
                              key={faq.id}
                              value={faq.id.toString()}
                              className="bg-black/30 border border-white/10 rounded-lg px-4"
                            >
                              <AccordionTrigger className="text-white hover:no-underline">
                                <div className="flex items-center gap-3 text-left">
                                  <HelpCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                                  <span>{faq.pergunta}</span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="text-white/80">
                                <div className="pt-2 pb-3 space-y-3">
                                  <p>{faq.resposta}</p>

                                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                                    <div className="flex items-center gap-4 text-xs text-white/60">
                                      <div className="flex items-center gap-1">
                                        <Eye className="h-3 w-3" />
                                        {faq.visualizacoes} visualizações
                                      </div>
                                    </div>

                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => editarFaq(faq)}
                                        className="text-green-400 hover:bg-green-500/20 h-8"
                                      >
                                        <Edit className="h-3 w-3 mr-1" />
                                        Editar
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </div>
                      ))}
                    </Accordion>
                  ) : (
                    <div className="text-center py-12">
                      <HelpCircle className="h-12 w-12 text-white/40 mx-auto mb-4" />
                      <p className="text-white/60">Nenhuma pergunta encontrada</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Estatísticas Laterais */}
          <div className="space-y-4">
            {/* Mais Visualizadas */}
            <Card className="relative overflow-hidden rounded-2xl card-glass border-white/10">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
              <CardHeader className="relative">
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Mais Visualizadas
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <div className="space-y-3">
                  {[...faqs]
                    .sort((a, b) => b.visualizacoes - a.visualizacoes)
                    .slice(0, 5)
                    .map((faq, index) => (
                      <div key={faq.id} className="flex items-start gap-3 p-3 bg-black/30 border border-white/10 rounded-lg">
                        <div className="text-2xl font-bold text-white/40">{index + 1}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{faq.pergunta}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Eye className="h-3 w-3 text-white/60" />
                            <span className="text-xs text-white/60">{faq.visualizacoes}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Por Categoria */}
            <Card className="relative overflow-hidden rounded-2xl card-glass border-white/10">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
              <CardHeader className="relative">
                <CardTitle className="text-white">Por Categoria</CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <div className="space-y-2">
                  {categorias.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between p-2 bg-black/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full bg-${cat.cor}-500`}></div>
                        <span className="text-sm text-white">{cat.nome}</span>
                      </div>
                      <Badge variant="outline" className="text-xs border-white/20 text-white/80">{cat.questoes}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Visualização Tabela */
        <Card className="relative overflow-hidden rounded-2xl card-glass border-white/10">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
          <CardContent className="relative p-6">
            <DataTable
              data={faqsFiltrados}
              columns={colunas}
              onRowClick={(row) => editarFaq(row)}
              enableSearch={false}
              enableColumnVisibility={true}
              enablePagination={true}
              pageSize={15}
            />
          </CardContent>
        </Card>
      )}

      {/* Dialog de Edição */}
      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent className="bg-black border-white/10 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              {faqEditando?.id ? 'Editar Pergunta' : 'Nova Pergunta'}
            </DialogTitle>
            <DialogDescription className="text-white/60">
              Configure a pergunta e resposta
            </DialogDescription>
          </DialogHeader>

          {faqEditando && (
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-white">Categoria</Label>
                <select
                  value={faqEditando.categoria}
                  onChange={(e) => setFaqEditando({ ...faqEditando, categoria: e.target.value })}
                  className="w-full mt-2 bg-black/30 border border-white/10 text-white rounded-lg p-2"
                >
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.nome}>{cat.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-white">Pergunta</Label>
                <Input
                  value={faqEditando.pergunta}
                  onChange={(e) => setFaqEditando({ ...faqEditando, pergunta: e.target.value })}
                  className="mt-2 bg-black/30 border-white/10 text-white placeholder:text-white/40"
                  placeholder="Ex: Quais formas de pagamento vocês aceitam?"
                />
              </div>

              <div>
                <Label className="text-white">Resposta</Label>
                <textarea
                  value={faqEditando.resposta}
                  onChange={(e) => setFaqEditando({ ...faqEditando, resposta: e.target.value })}
                  rows={6}
                  className="w-full mt-2 bg-black/30 border border-white/10 rounded-lg p-3 text-white placeholder:text-white/40 resize-none"
                  placeholder="Digite a resposta detalhada aqui..."
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAberto(false)} className="border-white/20 text-white/80 hover:bg-white/10">
              Cancelar
            </Button>
            <Button onClick={salvarFaq} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/30">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
