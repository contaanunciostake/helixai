/**
 * IA Master - Acompanhante +18
 *
 * Orquestrador principal que integra todos os módulos:
 * - Analisador de Intenções
 * - Analisador de Sentimento
 * - Memória de Contexto
 * - Agendamento de Encontros
 * - Gerador de Respostas
 * - Preditor de Fechamento
 */

import analisadorIntencoes from './01-analisador-intencoes.js';
import personalidade from './02-personalidade-sedutora.js';
import analisadorSentimento from './03-analisador-sentimento.js';
import memoriaContexto from './04-memoria-contexto.js';
import agendamentoEncontros from './05-agendamento-encontros.js';
import geradorRespostas from './06-gerador-respostas.js';
import preditorFechamento from './07-preditor-fechamento.js';

class IAMasterAcompanhante {
  constructor(config = {}) {
    this.config = {
      nome: config.nome || 'Luna',
      cidade: config.cidade || 'São Paulo',
      valores: config.valores || {
        conteudo_basico: 50,
        conteudo_vip: 150,
        conteudo_premium: 300,
        encontro_1h: 500,
        encontro_2h: 800,
        pernoite: 1500
      },
      ...config
    };

    this.conversas = new Map(); // telefone -> estado da conversa
  }

  /**
   * Processa mensagem do cliente (função principal)
   */
  async processarMensagem(telefone, mensagem, historicoConversa = []) {
    console.log(`\n📩 [${telefone}] Processando: "${mensagem}"`);

    const inicio = Date.now();

    try {
      // 1. Obter/criar estado da conversa
      const estado = this.getEstadoConversa(telefone);

      // 2. Executar análises em paralelo
      const [intencao, sentimento, memoria] = await Promise.all([
        analisadorIntencoes.analisar(mensagem, historicoConversa),
        analisadorSentimento.analisar(mensagem, historicoConversa),
        memoriaContexto.extrairInformacoes(mensagem, telefone, historicoConversa)
      ]);

      console.log(`📊 Intenção: ${intencao.intencao} | Sentimento: ${sentimento.sentimento_principal} | Temp: ${sentimento.temperatura}`);

      // 3. Verificar sinais de alerta
      if (this.deveRecusar(sentimento)) {
        return this.gerarRespostaRecusa(sentimento.sinais_alerta, memoria.nome);
      }

      // 4. Determinar etapa da conversa
      const etapa = this.determinarEtapa(intencao, memoria, estado);
      console.log(`📍 Etapa: ${etapa}`);

      // 5. Atualizar estado
      estado.etapaAtual = etapa;
      estado.ultimaIntencao = intencao.intencao;
      estado.ultimaMensagem = new Date().toISOString();
      this.conversas.set(telefone, estado);

      // 6. Gerar resposta
      const resposta = await geradorRespostas.gerarResposta({
        mensagemCliente: mensagem,
        historicoConversa,
        analiseIntencao: intencao,
        analiseSentimento: sentimento,
        memoriaCliente: memoria,
        etapaAtual: etapa,
        configAcompanhante: this.config
      });

      // 7. Predizer fechamento (para métricas)
      const predicao = await preditorFechamento.prever({
        historicoConversa: [...historicoConversa, { role: 'user', content: mensagem }],
        analiseSentimento: sentimento,
        memoriaCliente: memoria,
        tempoConversa: estado.tempoConversa || 0
      });

      const tempoProcessamento = Date.now() - inicio;
      console.log(`✅ Resposta gerada em ${tempoProcessamento}ms | Prob. fechamento: ${predicao.probabilidade_fechamento}%`);

      return {
        sucesso: true,
        resposta: resposta.resposta,
        analise: {
          intencao,
          sentimento,
          memoria,
          predicao,
          etapa
        },
        tempoProcessamento,
        modelo: resposta.modelo
      };

    } catch (error) {
      console.error('❌ Erro ao processar mensagem:', error);

      return {
        sucesso: false,
        resposta: this.gerarRespostaErro(),
        erro: error.message
      };
    }
  }

  /**
   * Determina etapa atual da conversa
   */
  determinarEtapa(intencao, memoria, estado) {
    const interessePrincipal = memoria.interesse_principal;
    const intencaoAtual = intencao.intencao;
    const etapaAnterior = estado.etapaAtual;

    // Mapa de transições
    const transicoes = {
      SAUDACAO: 'INICIO',
      CONTEUDO: interessePrincipal === 'conteudo' ? 'APRESENTACAO_CONTEUDO' : 'QUALIFICACAO_CONTEUDO',
      ENCONTRO: interessePrincipal === 'encontro' ? 'APRESENTACAO_ENCONTRO' : 'QUALIFICACAO_ENCONTRO',
      VALORES: interessePrincipal === 'conteudo' ? 'APRESENTACAO_CONTEUDO' : 'APRESENTACAO_ENCONTRO',
      LOCAL: 'QUALIFICACAO_ENCONTRO',
      DISPONIBILIDADE: 'APRESENTACAO_ENCONTRO',
      NEGOCIACAO: 'NEGOCIACAO',
      CONFIRMACAO: interessePrincipal === 'conteudo' ? 'FECHAMENTO_CONTEUDO' : 'FECHAMENTO_ENCONTRO',
      DUVIDA: etapaAnterior || 'INICIO',
      ENCERRAMENTO: 'ENCERRAMENTO',
      INDEFINIDO: etapaAnterior || 'INICIO'
    };

    return transicoes[intencaoAtual] || 'INICIO';
  }

  /**
   * Obtém ou cria estado da conversa
   */
  getEstadoConversa(telefone) {
    if (!this.conversas.has(telefone)) {
      this.conversas.set(telefone, {
        telefone,
        etapaAtual: 'INICIO',
        ultimaIntencao: null,
        ultimaMensagem: null,
        inicioConversa: new Date().toISOString(),
        tempoConversa: 0,
        tentativasFechamento: 0,
        encontroAgendado: null
      });
    }

    const estado = this.conversas.get(telefone);

    // Calcular tempo de conversa
    if (estado.inicioConversa) {
      estado.tempoConversa = Math.round(
        (new Date() - new Date(estado.inicioConversa)) / 60000
      );
    }

    return estado;
  }

  /**
   * Verifica se deve recusar atendimento
   */
  deveRecusar(sentimento) {
    const alertasGraves = ['pedido_sem_protecao', 'desrespeito'];
    return sentimento.sinais_alerta?.some(a => alertasGraves.includes(a));
  }

  /**
   * Gera resposta de recusa educada
   */
  gerarRespostaRecusa(alertas, nome = 'amor') {
    if (alertas.includes('pedido_sem_protecao')) {
      return {
        sucesso: true,
        resposta: `${nome}, essa é uma regra que não abro mão 😊\nÉ pro meu cuidado e pro seu também.\nCom proteção a gente aproveita sem preocupação! 💋`,
        tipo: 'recusa_educada'
      };
    }

    if (alertas.includes('desrespeito')) {
      return {
        sucesso: true,
        resposta: `Amor, não aceito esse tipo de tratamento.\nSe quiser conversar com respeito, tô aqui 😊`,
        tipo: 'recusa_desrespeito'
      };
    }

    return {
      sucesso: true,
      resposta: `Desculpa amor, mas não vai rolar dessa forma 😊`,
      tipo: 'recusa_generica'
    };
  }

  /**
   * Gera resposta de erro genérica
   */
  gerarRespostaErro() {
    return `Oi amor! 😊 Desculpa a demora... me conta, o que você procura?`;
  }

  /**
   * Agenda encontro através do módulo
   */
  async agendarEncontro(telefone, dados) {
    const memoria = memoriaContexto.getMemoria(telefone);

    const valorCalculado = agendamentoEncontros.calcularValor(
      dados.duracao,
      dados.local_tipo,
      dados.regiao,
      this.config.valores
    );

    const encontro = agendamentoEncontros.criarAgendamento({
      telefone,
      nome: memoria.nome || dados.nome,
      data: dados.data,
      horario: dados.horario,
      duracao: dados.duracao,
      local_tipo: dados.local_tipo,
      endereco: dados.endereco,
      bairro: dados.bairro,
      valor_base: valorCalculado.valor_base,
      taxa_deslocamento: valorCalculado.taxa_deslocamento,
      valor_sinal: valorCalculado.valor_sinal
    });

    // Atualizar estado
    const estado = this.getEstadoConversa(telefone);
    estado.encontroAgendado = encontro.id;
    this.conversas.set(telefone, estado);

    return {
      encontro,
      mensagemConfirmacao: agendamentoEncontros.gerarMensagemConfirmacao(encontro, this.config.nome)
    };
  }

  /**
   * Verifica disponibilidade
   */
  verificarDisponibilidade(data, horario, duracao = '1h') {
    return agendamentoEncontros.verificarDisponibilidade(data, horario, duracao);
  }

  /**
   * Lista horários disponíveis
   */
  getHorariosDisponiveis(data, duracao = '1h') {
    return agendamentoEncontros.getHorariosDisponiveis(data, duracao);
  }

  /**
   * Obtém encontros do dia
   */
  getEncontrosDoDia(data) {
    return agendamentoEncontros.getEncontrosDoDia(data);
  }

  /**
   * Obtém memória de um cliente
   */
  getMemoriaCliente(telefone) {
    return memoriaContexto.getMemoria(telefone);
  }

  /**
   * Obtém resumo da memória para prompt
   */
  getResumoCliente(telefone) {
    return memoriaContexto.gerarResumoParaPrompt(telefone);
  }

  /**
   * Atualiza configuração
   */
  setConfig(novaConfig) {
    this.config = { ...this.config, ...novaConfig };
  }

  /**
   * Exporta dados para persistência
   */
  exportarDados() {
    return {
      conversas: Array.from(this.conversas.entries()),
      agendamentos: agendamentoEncontros.exportar(),
      config: this.config
    };
  }

  /**
   * Importa dados salvos
   */
  importarDados(dados) {
    if (dados.conversas) {
      this.conversas = new Map(dados.conversas);
    }
    if (dados.agendamentos) {
      agendamentoEncontros.importar(dados.agendamentos);
    }
    if (dados.config) {
      this.config = dados.config;
    }
  }

  /**
   * Reseta conversa de um cliente
   */
  resetarConversa(telefone) {
    this.conversas.delete(telefone);
  }

  /**
   * Estatísticas gerais
   */
  getEstatisticas() {
    const conversas = Array.from(this.conversas.values());
    const encontros = agendamentoEncontros.getEncontrosDoDia(new Date());

    return {
      conversas_ativas: conversas.length,
      conversas_hoje: conversas.filter(c =>
        new Date(c.inicioConversa).toDateString() === new Date().toDateString()
      ).length,
      encontros_hoje: encontros.length,
      encontros_confirmados: encontros.filter(e => e.status === 'confirmado').length
    };
  }
}

// Exportar classe e instância padrão
export { IAMasterAcompanhante };
export default new IAMasterAcompanhante();
