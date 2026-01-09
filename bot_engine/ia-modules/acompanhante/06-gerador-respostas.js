/**
 * Gerador de Respostas - Acompanhante +18
 *
 * Gera respostas persuasivas e sedutoras
 * usando Claude Sonnet para máxima qualidade
 */

import Anthropic from '@anthropic-ai/sdk';
import personalidade from './02-personalidade-sedutora.js';

class GeradorRespostasAcompanhante {
  constructor() {
    this.client = new Anthropic();
    this.modelo = 'claude-sonnet-4-20250514'; // Melhor qualidade para respostas
  }

  /**
   * Gera resposta principal
   */
  async gerarResposta(dados) {
    const {
      mensagemCliente,
      historicoConversa = [],
      analiseIntencao = {},
      analiseSentimento = {},
      memoriaCliente = {},
      etapaAtual = 'INICIO',
      configAcompanhante = {}
    } = dados;

    // Montar prompt do sistema
    const promptSistema = personalidade.gerarPromptSistema(configAcompanhante);
    const promptContextual = personalidade.gerarPromptContextual(
      etapaAtual,
      memoriaCliente.nome || 'amor',
      { interesse: memoriaCliente.interesse_principal }
    );

    // Montar contexto completo
    const contexto = this.montarContexto(analiseIntencao, analiseSentimento, memoriaCliente);

    const prompt = `${promptSistema}

${promptContextual}

# 📊 ANÁLISE DO CLIENTE:
${contexto}

# 💬 HISTÓRICO RECENTE:
${this.formatarHistorico(historicoConversa)}

# 📩 MENSAGEM DO CLIENTE:
"${mensagemCliente}"

# 🎯 SUA TAREFA:
Responda como ${configAcompanhante.nome || 'Luna'} de forma natural, sedutora e persuasiva.
- Use as informações do cliente para personalizar
- Siga a etapa atual da conversa
- Seja envolvente mas não desesperada
- Guie para o fechamento naturalmente
- MÁXIMO 4-5 linhas (é WhatsApp!)

Responda APENAS com a mensagem, sem explicações:`;

    try {
      const response = await this.client.messages.create({
        model: this.modelo,
        max_tokens: 300,
        messages: [
          ...this.formatarHistoricoParaAPI(historicoConversa),
          { role: 'user', content: prompt }
        ]
      });

      let resposta = response.content[0].text.trim();

      // Limpar formatação indesejada
      resposta = this.limparResposta(resposta);

      return {
        sucesso: true,
        resposta,
        modelo: this.modelo,
        tokens_usados: response.usage?.output_tokens || 0
      };

    } catch (error) {
      console.error('Erro ao gerar resposta:', error);

      // Fallback para resposta local
      return {
        sucesso: false,
        resposta: this.gerarRespostaFallback(etapaAtual, memoriaCliente.nome),
        modelo: 'fallback',
        erro: error.message
      };
    }
  }

  /**
   * Monta contexto para o prompt
   */
  montarContexto(intencao, sentimento, memoria) {
    let contexto = '';

    if (memoria.nome) {
      contexto += `- Nome: ${memoria.nome}\n`;
    }

    if (intencao.intencao) {
      contexto += `- Intenção detectada: ${intencao.intencao}\n`;
      contexto += `- Próximo passo sugerido: ${intencao.proximo_passo_sugerido}\n`;
    }

    if (sentimento.temperatura) {
      contexto += `- Temperatura do cliente: ${sentimento.temperatura}/100\n`;
      contexto += `- Sentimento: ${sentimento.sentimento_principal}\n`;
      contexto += `- Probabilidade de fechar: ${sentimento.probabilidade_fechamento}\n`;
    }

    if (sentimento.sinais_alerta?.length > 0) {
      contexto += `- ⚠️ ALERTAS: ${sentimento.sinais_alerta.join(', ')}\n`;
    }

    if (memoria.interesse_principal && memoria.interesse_principal !== 'indefinido') {
      contexto += `- Interesse principal: ${memoria.interesse_principal}\n`;
    }

    if (memoria.local_preferido && memoria.local_preferido !== 'indefinido') {
      contexto += `- Sobre local: ${memoria.local_preferido === 'com_local' ? 'Precisa do seu local' : 'Ele tem local'}\n`;
    }

    if (memoria.disponibilidade?.urgencia && memoria.disponibilidade.urgencia !== 'sem_pressa') {
      contexto += `- Urgência: ${memoria.disponibilidade.urgencia}\n`;
    }

    if (sentimento.recomendacao) {
      contexto += `- Recomendação: ${sentimento.recomendacao}\n`;
    }

    return contexto || 'Cliente novo, sem informações ainda.';
  }

  /**
   * Formata histórico para exibição no prompt
   */
  formatarHistorico(historico) {
    if (!historico || historico.length === 0) {
      return 'Primeira mensagem do cliente.';
    }

    return historico.slice(-6).map(m => {
      const role = m.role === 'user' ? 'Cliente' : 'Você';
      return `${role}: ${m.content}`;
    }).join('\n');
  }

  /**
   * Formata histórico para API do Claude
   */
  formatarHistoricoParaAPI(historico) {
    if (!historico || historico.length === 0) {
      return [];
    }

    return historico.slice(-10).map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content
    }));
  }

  /**
   * Limpa resposta de formatação indesejada
   */
  limparResposta(resposta) {
    // Remove aspas no início/fim
    resposta = resposta.replace(/^["']|["']$/g, '');

    // Remove prefixos como "Luna:" ou "Resposta:"
    resposta = resposta.replace(/^(Luna|Resposta|Mensagem):\s*/i, '');

    // Remove quebras de linha excessivas
    resposta = resposta.replace(/\n{3,}/g, '\n\n');

    return resposta.trim();
  }

  /**
   * Resposta de fallback quando API falha
   */
  gerarRespostaFallback(etapa, nome = 'amor') {
    const respostas = {
      INICIO: `Oi ${nome}! 😘 Que bom que você me achou! Me conta, o que te trouxe até mim?`,
      QUALIFICACAO_CONTEUDO: `Me conta o que você curte, ${nome}... 😏 Fotos mais sensuais ou algo mais ousado?`,
      QUALIFICACAO_ENCONTRO: `Hmm gostei! 😈 Me conta, você tem local ou prefere o meu, ${nome}?`,
      APRESENTACAO_CONTEUDO: `Tenho opções especiais pra você, ${nome}! 🔥 Quer conhecer?`,
      APRESENTACAO_ENCONTRO: `Posso te receber no meu cantinho ou ir até você, ${nome}... 💋 O que prefere?`,
      NEGOCIACAO: `Entendo, ${nome}! Posso fazer algo especial pra você... 😘`,
      FECHAMENTO_CONTEUDO: `Perfeito! 💕 Te mando tudo assim que confirmar, ${nome}!`,
      FECHAMENTO_ENCONTRO: `Combinado então, ${nome}! 😘 Mal posso esperar...`,
      DEFAULT: `Me conta mais, ${nome}... 💋`
    };

    return respostas[etapa] || respostas.DEFAULT;
  }

  /**
   * Gera resposta para situação específica
   */
  async gerarRespostaSituacao(situacao, nomeCliente = 'amor', config = {}) {
    // Primeiro tenta resposta pré-definida
    const respostaPredefinida = personalidade.getRespostaSituacao(situacao, nomeCliente);

    if (respostaPredefinida && !respostaPredefinida.includes('Me conta mais')) {
      return {
        sucesso: true,
        resposta: respostaPredefinida,
        modelo: 'predefinida'
      };
    }

    // Se não tiver, gera com IA
    return this.gerarResposta({
      mensagemCliente: `[Situação: ${situacao}]`,
      etapaAtual: 'INICIO',
      configAcompanhante: config
    });
  }

  /**
   * Gera variação de uma mensagem (para não repetir)
   */
  async gerarVariacao(mensagemOriginal, config = {}) {
    const prompt = `Reescreva esta mensagem de forma diferente, mantendo o mesmo tom sedutor e significado:

"${mensagemOriginal}"

REGRAS:
- Mantenha o tom sedutor e envolvente
- Use emojis semelhantes
- Mantenha o tamanho similar
- Mude as palavras mas mantenha a essência

Responda apenas com a nova versão:`;

    try {
      const response = await this.client.messages.create({
        model: 'claude-3-haiku-20240307', // Haiku é suficiente para variações
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }]
      });

      return this.limparResposta(response.content[0].text);

    } catch (error) {
      return mensagemOriginal; // Retorna original se falhar
    }
  }
}

export default new GeradorRespostasAcompanhante();
