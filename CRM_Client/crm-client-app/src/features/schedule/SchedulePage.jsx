/**
 * ═══════════════════════════════════════════════════════════════
 * PÁGINA: HORÁRIOS
 * Configuração de horários de atendimento com calendário visual
 * ═══════════════════════════════════════════════════════════════
 */

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Clock, Save, Plus, Trash2, CalendarDays, Moon, Sun,
  Coffee, Briefcase, AlertTriangle
} from 'lucide-react'

export default function SchedulePage({ user, showNotification }) {
  const [horarios, setHorarios] = useState({
    segunda: { ativo: true, inicio: '08:00', fim: '18:00', almoco: { ativo: true, inicio: '12:00', fim: '13:00' } },
    terca: { ativo: true, inicio: '08:00', fim: '18:00', almoco: { ativo: true, inicio: '12:00', fim: '13:00' } },
    quarta: { ativo: true, inicio: '08:00', fim: '18:00', almoco: { ativo: true, inicio: '12:00', fim: '13:00' } },
    quinta: { ativo: true, inicio: '08:00', fim: '18:00', almoco: { ativo: true, inicio: '12:00', fim: '13:00' } },
    sexta: { ativo: true, inicio: '08:00', fim: '18:00', almoco: { ativo: true, inicio: '12:00', fim: '13:00' } },
    sabado: { ativo: true, inicio: '08:00', fim: '13:00', almoco: { ativo: false, inicio: '', fim: '' } },
    domingo: { ativo: false, inicio: '', fim: '', almoco: { ativo: false, inicio: '', fim: '' } },
  })

  const [feriados, setFeriados] = useState([
    { id: 1, data: new Date(2024, 0, 1), nome: 'Ano Novo', ativo: true },
    { id: 2, data: new Date(2024, 3, 21), nome: 'Tiradentes', ativo: true },
    { id: 3, data: new Date(2024, 4, 1), nome: 'Dia do Trabalho', ativo: true },
    { id: 4, data: new Date(2024, 8, 7), nome: 'Independência', ativo: true },
    { id: 5, data: new Date(2024, 9, 12), nome: 'Nossa Senhora Aparecida', ativo: true },
    { id: 6, data: new Date(2024, 10, 2), nome: 'Finados', ativo: true },
    { id: 7, data: new Date(2024, 10, 15), nome: 'Proclamação da República', ativo: true },
    { id: 8, data: new Date(2024, 11, 25), nome: 'Natal', ativo: true },
  ])

  const [comportamentoForaHorario, setComportamentoForaHorario] = useState({
    mensagemAutomatica: true,
    mensagem: 'Olá! No momento estamos fora do horário de atendimento. Nosso horário de funcionamento é de segunda a sexta, das 8h às 18h, e sábados das 8h às 13h. Deixe sua mensagem que retornaremos em breve!',
    gravarMensagem: true,
    notificarEquipe: false,
  })

  const [selectedDate, setSelectedDate] = useState(new Date())

  const diasSemana = [
    { key: 'segunda', label: 'Segunda-feira', icon: Briefcase },
    { key: 'terca', label: 'Terça-feira', icon: Briefcase },
    { key: 'quarta', label: 'Quarta-feira', icon: Briefcase },
    { key: 'quinta', label: 'Quinta-feira', icon: Briefcase },
    { key: 'sexta', label: 'Sexta-feira', icon: Briefcase },
    { key: 'sabado', label: 'Sábado', icon: Coffee },
    { key: 'domingo', label: 'Domingo', icon: Moon },
  ]

  const updateHorario = (dia, campo, valor) => {
    setHorarios({
      ...horarios,
      [dia]: {
        ...horarios[dia],
        [campo]: valor,
      },
    })
  }

  const updateAlmoco = (dia, campo, valor) => {
    setHorarios({
      ...horarios,
      [dia]: {
        ...horarios[dia],
        almoco: {
          ...horarios[dia].almoco,
          [campo]: valor,
        },
      },
    })
  }

  const aplicarParaTodos = (dia) => {
    const horarioPadrao = horarios[dia]
    const novosHorarios = {}

    diasSemana.forEach(({ key }) => {
      if (key !== 'domingo') {
        novosHorarios[key] = { ...horarioPadrao }
      } else {
        novosHorarios[key] = horarios[key]
      }
    })

    setHorarios(novosHorarios)
    showNotification?.('Horários aplicados para todos os dias!')
  }

  const adicionarFeriado = () => {
    const novoFeriado = {
      id: Math.max(...feriados.map(f => f.id)) + 1,
      data: selectedDate,
      nome: 'Novo Feriado',
      ativo: true,
    }
    setFeriados([...feriados, novoFeriado])
    showNotification?.('Feriado adicionado!')
  }

  const removerFeriado = (id) => {
    setFeriados(feriados.filter(f => f.id !== id))
    showNotification?.('Feriado removido!')
  }

  const salvarConfiguracoes = () => {
    // Aqui você faria a chamada para a API
    showNotification?.('Configurações de horários salvas com sucesso!')
  }

  // Verificar se um dia está disponível
  const isDiaDisponivel = (dia) => {
    const diaKey = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'][dia.getDay()]
    return horarios[diaKey]?.ativo
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
                <Clock className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  Horários de Atendimento
                </h1>
                <p className="text-white/60 mt-1 text-sm">Configure os horários em que o bot estará disponível</p>
              </div>
            </div>
            <Button onClick={salvarConfiguracoes} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/30">
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuração por Dia da Semana */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="relative overflow-hidden rounded-2xl card-glass border-white/10">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
            <CardHeader className="relative">
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-500" />
                Horários por Dia da Semana
              </CardTitle>
              <CardDescription className="text-white/60">Configure o expediente de cada dia</CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-4">
              {diasSemana.map(({ key, label, icon: Icon }) => (
                <div key={key} className="bg-black/30 border border-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-white/60" />
                      <Label className="text-white font-semibold">{label}</Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => aplicarParaTodos(key)}
                        className="border-green-400/50 text-green-400 hover:bg-green-500/20 text-xs"
                      >
                        Aplicar para todos
                      </Button>
                      <Switch
                        checked={horarios[key].ativo}
                        onCheckedChange={(checked) => updateHorario(key, 'ativo', checked)}
                      />
                    </div>
                  </div>

                  {horarios[key].ativo && (
                    <div className="space-y-4">
                      {/* Horário de Funcionamento */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm text-white/60">Início</Label>
                          <Input
                            type="time"
                            value={horarios[key].inicio}
                            onChange={(e) => updateHorario(key, 'inicio', e.target.value)}
                            className="mt-1 bg-black/30 border-white/10 text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-sm text-white/60">Fim</Label>
                          <Input
                            type="time"
                            value={horarios[key].fim}
                            onChange={(e) => updateHorario(key, 'fim', e.target.value)}
                            className="mt-1 bg-black/30 border-white/10 text-white"
                          />
                        </div>
                      </div>

                      {/* Horário de Almoço */}
                      <div className="border-t border-white/10 pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <Label className="text-sm text-white/80">Intervalo de Almoço</Label>
                          <Switch
                            checked={horarios[key].almoco.ativo}
                            onCheckedChange={(checked) => updateAlmoco(key, 'ativo', checked)}
                          />
                        </div>

                        {horarios[key].almoco.ativo && (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm text-white/60">Início</Label>
                              <Input
                                type="time"
                                value={horarios[key].almoco.inicio}
                                onChange={(e) => updateAlmoco(key, 'inicio', e.target.value)}
                                className="mt-1 bg-black/30 border-white/10 text-white"
                              />
                            </div>
                            <div>
                              <Label className="text-sm text-white/60">Fim</Label>
                              <Input
                                type="time"
                                value={horarios[key].almoco.fim}
                                onChange={(e) => updateAlmoco(key, 'fim', e.target.value)}
                                className="mt-1 bg-black/30 border-white/10 text-white"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {!horarios[key].ativo && (
                    <div className="text-center py-4">
                      <Badge variant="outline" className="text-white/60 border-white/20">Fechado</Badge>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Calendário e Feriados */}
        <div className="space-y-4">
          {/* Calendário Visual */}
          <Card className="relative overflow-hidden rounded-2xl card-glass border-white/10">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
            <CardHeader className="relative">
              <CardTitle className="text-white flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-green-500" />
                Calendário
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border border-white/10"
                modifiers={{
                  disponivel: (date) => isDiaDisponivel(date),
                  feriado: (date) => feriados.some(f =>
                    f.data.toDateString() === date.toDateString() && f.ativo
                  ),
                }}
                modifiersClassNames={{
                  disponivel: 'bg-green-900/20 text-green-400',
                  feriado: 'bg-red-900/20 text-red-400',
                }}
              />
            </CardContent>
          </Card>

          {/* Feriados */}
          <Card className="relative overflow-hidden rounded-2xl card-glass border-white/10">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Feriados</CardTitle>
                <Button size="sm" onClick={adicionarFeriado} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/30">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription className="text-white/60">Datas em que não haverá atendimento</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {feriados.map((feriado) => (
                    <div
                      key={feriado.id}
                      className="flex items-center justify-between p-3 bg-black/30 border border-white/10 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{feriado.nome}</p>
                        <p className="text-xs text-white/60">
                          {feriado.data.toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={feriado.ativo}
                          onCheckedChange={(checked) => {
                            setFeriados(feriados.map(f =>
                              f.id === feriado.id ? { ...f, ativo: checked } : f
                            ))
                          }}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removerFeriado(feriado.id)}
                          className="text-red-400 hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Comportamento Fora do Horário */}
      <Card className="relative overflow-hidden rounded-2xl card-glass border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
        <CardHeader className="relative">
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Comportamento Fora do Horário
          </CardTitle>
          <CardDescription className="text-white/60">
            Como o bot deve se comportar quando não estiver no expediente
          </CardDescription>
        </CardHeader>
        <CardContent className="relative space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-black/30 border border-white/10 rounded-lg">
                <Label className="text-white">Enviar mensagem automática</Label>
                <Switch
                  checked={comportamentoForaHorario.mensagemAutomatica}
                  onCheckedChange={(checked) =>
                    setComportamentoForaHorario({ ...comportamentoForaHorario, mensagemAutomatica: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-black/30 border border-white/10 rounded-lg">
                <Label className="text-white">Gravar mensagem do cliente</Label>
                <Switch
                  checked={comportamentoForaHorario.gravarMensagem}
                  onCheckedChange={(checked) =>
                    setComportamentoForaHorario({ ...comportamentoForaHorario, gravarMensagem: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-black/30 border border-white/10 rounded-lg">
                <Label className="text-white">Notificar equipe</Label>
                <Switch
                  checked={comportamentoForaHorario.notificarEquipe}
                  onCheckedChange={(checked) =>
                    setComportamentoForaHorario({ ...comportamentoForaHorario, notificarEquipe: checked })
                  }
                />
              </div>
            </div>

            <div>
              <Label className="text-white mb-2 block">Mensagem de Ausência</Label>
              <textarea
                value={comportamentoForaHorario.mensagem}
                onChange={(e) =>
                  setComportamentoForaHorario({ ...comportamentoForaHorario, mensagem: e.target.value })
                }
                rows={8}
                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white placeholder:text-white/40 resize-none"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
