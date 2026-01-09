/**
 * Módulo de Agendamento de Encontros - Acompanhante +18
 *
 * Gerencia:
 * - Agenda de horários disponíveis
 * - Confirmação de encontros
 * - Local (com ou sem)
 * - Taxas de deslocamento
 */

class AgendamentoEncontros {
  constructor() {
    this.encontros = new Map(); // id -> encontro
    this.agenda = new Map(); // data -> [horarios ocupados]
  }

  /**
   * Configuração padrão
   */
  getConfig(configCustom = {}) {
    return {
      valores: {
        encontro_1h: configCustom.encontro_1h || 500,
        encontro_2h: configCustom.encontro_2h || 800,
        encontro_3h: configCustom.encontro_3h || 1000,
        pernoite: configCustom.pernoite || 1500,
        taxa_deslocamento: configCustom.taxa_deslocamento || 50,
        taxa_deslocamento_longe: configCustom.taxa_deslocamento_longe || 100
      },
      horarios_disponiveis: configCustom.horarios || [
        '10:00', '11:00', '12:00', '13:00', '14:00',
        '15:00', '16:00', '17:00', '18:00', '19:00',
        '20:00', '21:00', '22:00', '23:00'
      ],
      antecedencia_minima_horas: configCustom.antecedencia || 2,
      regioes_atendimento: configCustom.regioes || ['Centro', 'Zona Sul', 'Zona Norte', 'Zona Oeste'],
      tem_local_proprio: configCustom.tem_local !== false,
      local_bairro: configCustom.bairro || 'Centro',
      exige_sinal: configCustom.exige_sinal !== false,
      valor_sinal_percentual: configCustom.sinal || 30
    };
  }

  /**
   * Cria novo agendamento
   */
  criarAgendamento(dados) {
    const id = `enc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const encontro = {
      id,
      cliente: {
        telefone: dados.telefone,
        nome: dados.nome || 'Cliente',
      },
      data: dados.data,
      horario: dados.horario,
      duracao: dados.duracao || '1h',
      local: {
        tipo: dados.local_tipo, // 'proprio' ou 'cliente'
        endereco: dados.endereco || null,
        bairro: dados.bairro || null,
        observacoes: dados.obs_local || null
      },
      valores: {
        base: dados.valor_base,
        deslocamento: dados.taxa_deslocamento || 0,
        total: dados.valor_base + (dados.taxa_deslocamento || 0)
      },
      pagamento: {
        forma: dados.forma_pagamento || 'pix',
        sinal_pago: false,
        valor_sinal: dados.valor_sinal || 0,
        pago_total: false
      },
      status: 'pendente', // pendente, confirmado, realizado, cancelado, no_show
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
      historico: []
    };

    this.encontros.set(id, encontro);
    this.bloquearHorario(dados.data, dados.horario, dados.duracao);

    return encontro;
  }

  /**
   * Bloqueia horário na agenda
   */
  bloquearHorario(data, horario, duracao) {
    const dataKey = this.formatarData(data);

    if (!this.agenda.has(dataKey)) {
      this.agenda.set(dataKey, []);
    }

    const ocupados = this.agenda.get(dataKey);
    const horasBloquear = this.calcularHorasBloqueio(horario, duracao);

    ocupados.push(...horasBloquear);
    this.agenda.set(dataKey, [...new Set(ocupados)]);
  }

  /**
   * Calcula horas a bloquear baseado na duração
   */
  calcularHorasBloqueio(horarioInicio, duracao) {
    const horas = [];
    const [hora, minuto] = horarioInicio.split(':').map(Number);

    let duracaoHoras = 1;
    if (duracao === '2h') duracaoHoras = 2;
    if (duracao === '3h') duracaoHoras = 3;
    if (duracao === 'pernoite') duracaoHoras = 8;

    for (let i = 0; i < duracaoHoras; i++) {
      const h = (hora + i) % 24;
      horas.push(`${h.toString().padStart(2, '0')}:00`);
    }

    return horas;
  }

  /**
   * Verifica disponibilidade
   */
  verificarDisponibilidade(data, horario, duracao = '1h') {
    const dataKey = this.formatarData(data);
    const ocupados = this.agenda.get(dataKey) || [];

    const horasNecessarias = this.calcularHorasBloqueio(horario, duracao);

    for (const hora of horasNecessarias) {
      if (ocupados.includes(hora)) {
        return false;
      }
    }

    // Verificar antecedência mínima
    const config = this.getConfig();
    const agora = new Date();
    const dataEncontro = new Date(`${data}T${horario}`);
    const diffHoras = (dataEncontro - agora) / (1000 * 60 * 60);

    if (diffHoras < config.antecedencia_minima_horas) {
      return false;
    }

    return true;
  }

  /**
   * Lista horários disponíveis para uma data
   */
  getHorariosDisponiveis(data, duracao = '1h') {
    const config = this.getConfig();
    const dataKey = this.formatarData(data);
    const ocupados = this.agenda.get(dataKey) || [];

    return config.horarios_disponiveis.filter(horario => {
      const horasNecessarias = this.calcularHorasBloqueio(horario, duracao);
      return !horasNecessarias.some(h => ocupados.includes(h));
    });
  }

  /**
   * Confirma encontro (após sinal ou confirmação)
   */
  confirmarEncontro(encontroId, dadosPagamento = {}) {
    const encontro = this.encontros.get(encontroId);
    if (!encontro) return null;

    encontro.status = 'confirmado';
    encontro.pagamento.sinal_pago = dadosPagamento.sinal_pago || false;
    encontro.atualizado_em = new Date().toISOString();
    encontro.historico.push({
      acao: 'confirmado',
      data: new Date().toISOString(),
      detalhes: dadosPagamento
    });

    return encontro;
  }

  /**
   * Cancela encontro
   */
  cancelarEncontro(encontroId, motivo = '') {
    const encontro = this.encontros.get(encontroId);
    if (!encontro) return null;

    encontro.status = 'cancelado';
    encontro.atualizado_em = new Date().toISOString();
    encontro.historico.push({
      acao: 'cancelado',
      data: new Date().toISOString(),
      motivo
    });

    // Liberar horário
    this.liberarHorario(encontro.data, encontro.horario, encontro.duracao);

    return encontro;
  }

  /**
   * Libera horário na agenda
   */
  liberarHorario(data, horario, duracao) {
    const dataKey = this.formatarData(data);
    const ocupados = this.agenda.get(dataKey) || [];
    const horasLiberar = this.calcularHorasBloqueio(horario, duracao);

    const novosOcupados = ocupados.filter(h => !horasLiberar.includes(h));
    this.agenda.set(dataKey, novosOcupados);
  }

  /**
   * Calcula valor total do encontro
   */
  calcularValor(duracao, temLocal, regiao, config = {}) {
    const cfg = this.getConfig(config);
    let valor = 0;

    // Valor base por duração
    switch (duracao) {
      case '1h':
        valor = cfg.valores.encontro_1h;
        break;
      case '2h':
        valor = cfg.valores.encontro_2h;
        break;
      case '3h':
        valor = cfg.valores.encontro_3h;
        break;
      case 'pernoite':
        valor = cfg.valores.pernoite;
        break;
      default:
        valor = cfg.valores.encontro_1h;
    }

    // Taxa de deslocamento (se ela vai até o cliente)
    let taxaDeslocamento = 0;
    if (!temLocal || temLocal === 'cliente') {
      // Verifica se região é longe
      const regioesLonge = ['Zona Leste', 'Guarulhos', 'ABC', 'Outro'];
      if (regioesLonge.includes(regiao)) {
        taxaDeslocamento = cfg.valores.taxa_deslocamento_longe;
      } else if (regiao && regiao !== cfg.local_bairro) {
        taxaDeslocamento = cfg.valores.taxa_deslocamento;
      }
    }

    return {
      valor_base: valor,
      taxa_deslocamento: taxaDeslocamento,
      valor_total: valor + taxaDeslocamento,
      valor_sinal: Math.round((valor + taxaDeslocamento) * (cfg.valor_sinal_percentual / 100))
    };
  }

  /**
   * Gera mensagem de confirmação
   */
  gerarMensagemConfirmacao(encontro, nomeAcompanhante = 'Luna') {
    const emoji = {
      '1h': '⏰',
      '2h': '⏰',
      '3h': '⏰',
      'pernoite': '🌙'
    };

    let msg = `Encontro confirmado! 💋\n\n`;
    msg += `📅 Data: ${this.formatarDataExibicao(encontro.data)}\n`;
    msg += `${emoji[encontro.duracao] || '⏰'} Horário: ${encontro.horario}\n`;
    msg += `⏱️ Duração: ${encontro.duracao}\n`;

    if (encontro.local.tipo === 'proprio') {
      msg += `📍 Local: Meu local (passo endereço mais perto da hora)\n`;
    } else {
      msg += `📍 Local: ${encontro.local.bairro || 'Seu local'}\n`;
    }

    msg += `\n💰 Valor: R$ ${encontro.valores.total}`;
    if (encontro.valores.deslocamento > 0) {
      msg += ` (inclui R$ ${encontro.valores.deslocamento} de deslocamento)`;
    }

    if (encontro.pagamento.valor_sinal > 0 && !encontro.pagamento.sinal_pago) {
      msg += `\n\n💳 Sinal de R$ ${encontro.pagamento.valor_sinal} para confirmar`;
    }

    msg += `\n\nTe espero ansiosa! 😘`;

    return msg;
  }

  /**
   * Gera lembrete para o dia do encontro
   */
  gerarMensagemLembrete(encontro) {
    return `Oi amor! 💋
Só passando pra confirmar nosso encontro de hoje às ${encontro.horario}!
Tá tudo certo pra você?

Me avisa quando estiver saindo! 😘`;
  }

  /**
   * Busca encontros de um cliente
   */
  getEncontrosCliente(telefone) {
    const encontros = [];

    for (const [id, encontro] of this.encontros) {
      if (encontro.cliente.telefone === telefone) {
        encontros.push(encontro);
      }
    }

    return encontros.sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em));
  }

  /**
   * Busca encontros do dia
   */
  getEncontrosDoDia(data) {
    const dataKey = this.formatarData(data || new Date());
    const encontros = [];

    for (const [id, encontro] of this.encontros) {
      if (this.formatarData(encontro.data) === dataKey && encontro.status !== 'cancelado') {
        encontros.push(encontro);
      }
    }

    return encontros.sort((a, b) => a.horario.localeCompare(b.horario));
  }

  /**
   * Formata data para chave
   */
  formatarData(data) {
    if (typeof data === 'string' && data.includes('-')) {
      return data.split('T')[0];
    }

    const d = new Date(data);
    return d.toISOString().split('T')[0];
  }

  /**
   * Formata data para exibição
   */
  formatarDataExibicao(data) {
    const d = new Date(data);
    const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

    return `${dias[d.getDay()]}, ${d.getDate()} de ${meses[d.getMonth()]}`;
  }

  /**
   * Exporta dados para persistência
   */
  exportar() {
    return {
      encontros: Array.from(this.encontros.entries()),
      agenda: Array.from(this.agenda.entries())
    };
  }

  /**
   * Importa dados salvos
   */
  importar(dados) {
    if (dados.encontros) {
      this.encontros = new Map(dados.encontros);
    }
    if (dados.agenda) {
      this.agenda = new Map(dados.agenda);
    }
  }
}

export default new AgendamentoEncontros();
