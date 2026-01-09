/**
 * Processador Inteligente de Mensagens
 * Integra gestor de fluxo + personalidade + contexto
 */

import gestorFluxo from './01-gestor-fluxo-conversa.js';
import luana from './02-personalidade-luana.js';

class ProcessadorMensagens {
  constructor(openaiKey, groqKey) {
    this.openaiKey = openaiKey;
    this.groqKey = groqKey;
    this.openaiModel = 'gpt-4-turbo-preview';
  }

  /**
   * Processa mensagem do cliente e gera resposta inteligente
   * @param {string} telefone - Telefone do cliente
   * @param {string} nomeCliente - Nome do cliente
   * @param {string} mensagemCliente - Mensagem enviada pelo cliente
   * @param {Array} historico - Histórico de mensagens [{ role: 'user'|'assistant', content: '...' }]
   * @param {Object} empresaConfig - Configurações da empresa
   * @returns {Promise<Object>} { resposta: string, etapa: string, acoes: [] }
   */
  async processar(telefone, nomeCliente, mensagemCliente, historico = [], empresaConfig = {}) {
    try {
      console.log(`\n🎯 [PROCESSADOR] Processando mensagem de ${nomeCliente}`);

      // 1. IDENTIFICAR ETAPA DA CONVERSA
      const etapaAtual = gestorFluxo.identificarEtapa(telefone, historico);
      const isPrimeiraMensagem = gestorFluxo.isPrimeiraMensagem(historico);

      console.log(`📍 [PROCESSADOR] Etapa: ${etapaAtual} | Primeira msg: ${isPrimeiraMensagem}`);

      // 2. ANALISAR INTENÇÃO DO CLIENTE
      const intencoes = gestorFluxo.analisarIntencao(mensagemCliente);
      console.log(`🎯 [PROCESSADOR] Intenções detectadas:`, intencoes);

      // 3. OBTER CONTEXTO DA CONVERSA
      const contexto = gestorFluxo.obterContexto(telefone);

      // 4. GERAR PROMPTS DINÂMICOS
      const promptSistema = this.construirPromptSistema(
        etapaAtual,
        nomeCliente,
        isPrimeiraMensagem,
        intencoes,
        empresaConfig
      );

      // 5. CONSTRUIR HISTÓRICO PARA IA
      const mensagensIA = [
        { role: 'system', content: promptSistema },
        ...historico,
        { role: 'user', content: mensagemCliente }
      ];

      // 6. CHAMAR IA (OpenAI ou Groq)
      const resposta = await this.chamarIA(mensagensIA);

      // 7. DETECTAR AÇÕES ESPECIAIS
      const acoes = this.detectarAcoes(resposta, intencoes);

      // 8. ATUALIZAR CONTEXTO
      gestorFluxo.atualizarContexto(telefone, etapaAtual, {
        ultimaMensagem: mensagemCliente,
        ultimaResposta: resposta,
        intencoes,
        acoes
      });

      console.log(`✅ [PROCESSADOR] Resposta gerada (${resposta.length} chars)`);

      return {
        resposta,
        etapa: etapaAtual,
        intencoes,
        acoes,
        contexto
      };

    } catch (error) {
      console.error('❌ [PROCESSADOR] Erro ao processar mensagem:', error);
      return {
        resposta: 'Desculpe, tive um problema técnico. Pode repetir por favor?',
        etapa: 'ERRO',
        intencoes: [],
        acoes: []
      };
    }
  }

  /**
   * Constrói prompt sistema dinâmico
   */
  construirPromptSistema(etapa, nomeCliente, isPrimeira, intencoes, empresaConfig) {
    let prompt = luana.gerarPromptSistema(empresaConfig);

    // Adicionar instruções específicas da etapa
    const instrucaoEtapa = gestorFluxo.gerarInstrucaoEtapa(etapa, nomeCliente, isPrimeira);
    prompt += '\n\n' + instrucaoEtapa;

    // Adicionar contexto de personalidade
    const contextoPersonalidade = luana.gerarPromptContextual(etapa, nomeCliente);
    prompt += '\n\n' + contextoPersonalidade;

    // Adicionar regras específicas baseadas em intenções
    if (intencoes.includes('confirmacao_horario')) {
      prompt += '\n\n✅✅✅ CRÍTICO: Cliente CONFIRMOU HORÁRIO de visita! VENDA FECHADA! Confirme o horário, diga que vai aguardá-lo e NÃO faça mais perguntas! ✅✅✅';
    }

    if (intencoes.includes('financiamento')) {
      prompt += '\n\n⚠️ Cliente perguntou sobre FINANCIAMENTO - mencione que pode simular agora pelo WhatsApp!';
    }

    if (intencoes.includes('agendamento')) {
      prompt += '\n\n⚠️ Cliente quer AGENDAR - seja proativa em oferecer horários concretos!';
    }

    if (intencoes.includes('interesse_forte')) {
      prompt += '\n\n🔥 Cliente demonstrou INTERESSE FORTE - avance para fechamento!';
    }

    return prompt;
  }

  /**
   * Chama IA (OpenAI GPT-4)
   */
  async chamarIA(mensagens) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiKey}`
        },
        body: JSON.stringify({
          model: this.openaiModel,
          messages: mensagens,
          temperature: 0.8, // Criatividade balanceada
          max_tokens: 500,  // Respostas concisas
          presence_penalty: 0.6,  // Evita repetição
          frequency_penalty: 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content.trim();

    } catch (error) {
      console.error('❌ [PROCESSADOR] Erro ao chamar OpenAI:', error);

      // Fallback: resposta padrão
      return 'Desculpe, estou com um problema técnico no momento. Pode tentar novamente em instantes?';
    }
  }

  /**
   * Detecta ações especiais que devem ser tomadas
   */
  detectarAcoes(resposta, intencoes) {
    const acoes = [];

    // Se resposta menciona agendar, retornar ação
    if (resposta.toLowerCase().includes('agendar') ||
        resposta.toLowerCase().includes('test drive') ||
        intencoes.includes('agendamento')) {
      acoes.push({
        tipo: 'AGENDAR_TEST_DRIVE',
        descricao: 'Oferecer agendamento de test drive'
      });
    }

    // Se menciona financiamento
    if (resposta.toLowerCase().includes('financiamento') ||
        resposta.toLowerCase().includes('simular') ||
        intencoes.includes('financiamento')) {
      acoes.push({
        tipo: 'SIMULAR_FINANCIAMENTO',
        descricao: 'Iniciar simulação de financiamento'
      });
    }

    // Se cliente demonstrou interesse forte
    if (intencoes.includes('interesse_forte')) {
      acoes.push({
        tipo: 'MARCAR_LEAD_QUENTE',
        descricao: 'Atualizar lead para temperatura QUENTE'
      });
    }

    // Se menciona enviar fotos/vídeos
    if (resposta.toLowerCase().includes('foto') ||
        resposta.toLowerCase().includes('vídeo')) {
      acoes.push({
        tipo: 'ENVIAR_MIDIA',
        descricao: 'Enviar fotos ou vídeos do veículo'
      });
    }

    return acoes;
  }

  /**
   * Formata histórico de mensagens para IA
   */
  formatarHistorico(mensagens) {
    return mensagens.map(msg => ({
      role: msg.enviada_por_bot ? 'assistant' : 'user',
      content: msg.conteudo
    }));
  }

  /**
   * Extrai nome do cliente da primeira mensagem (se não fornecido)
   */
  extrairNome(mensagem) {
    // Padrões comuns: "Oi, sou João", "Meu nome é Maria", etc
    const padroes = [
      /(?:sou|me chamo|meu nome é)\s+([A-Za-zÀ-ÿ]+)/i,
      /^([A-Za-zÀ-ÿ]+)$/i  // Apenas nome
    ];

    for (const padrao of padroes) {
      const match = mensagem.match(padrao);
      if (match) return match[1];
    }

    return null;
  }
}

export default ProcessadorMensagens;
