/**
 * ✂️ MÓDULO 11: VALIDADOR DE COMPLETUDE DE RESPOSTAS - PRODUTOS
 *
 * Valida se respostas geradas estão completas e não foram cortadas
 * Se detectar corte, completa a resposta automaticamente
 *
 * OBJETIVO: Evitar mensagens cortadas como "Semana pa..."
 */

import Anthropic from '@anthropic-ai/sdk';

export class ValidadorCompletudeProdutos {
  constructor(anthropicKey, botConfig = {}) {
    this.anthropic = new Anthropic({ apiKey: anthropicKey });
    this.botConfig = botConfig;
  }

  atualizarConfig(botConfig) {
    this.botConfig = botConfig;
  }

  /**
   * Valida se uma resposta está completa
   */
  validarCompletude(resposta) {
    const problemas = [];

    // 1. Verificar se termina no meio de uma palavra
    if (/[a-záàâãéèêíïóôõöúçñ]$/i.test(resposta.trim())) {
      problemas.push('Termina no meio de uma palavra');
    }

    // 2. Verificar se termina com pontuação incompleta
    const ultimoChar = resposta.trim().slice(-1);
    const pontuacaoValida = ['.', '!', '?', '😊', '😄', '😍', '🔥', '💰', '✨', '👍'];

    if (!pontuacaoValida.some(p => resposta.trim().endsWith(p))) {
      if (resposta.trim().split(' ').length > 3) {
        problemas.push('Não termina com pontuação válida');
      }
    }

    // 3. Verificar se tem abertura sem fechamento
    const abreParenteses = (resposta.match(/\(/g) || []).length;
    const fechaParenteses = (resposta.match(/\)/g) || []).length;
    if (abreParenteses > fechaParenteses) {
      problemas.push('Parênteses não fechado');
    }

    // 4. Verificar se tem aspas não fechadas
    const aspas = (resposta.match(/"/g) || []).length;
    if (aspas % 2 !== 0) {
      problemas.push('Aspas não fechadas');
    }

    // 5. Verificar frases claramente incompletas
    const palavrasIncompletas = [
      /\bpa$/i,
      /\bpo$/i,
      /\bqu$/i,
      /\bpr$/i,
      /\bse$/i,
      /\s[a-z]{1,2}$/i,
    ];

    for (const padrao of palavrasIncompletas) {
      if (padrao.test(resposta.trim())) {
        problemas.push('Palavra claramente incompleta no final');
        break;
      }
    }

    return {
      completa: problemas.length === 0,
      problemas
    };
  }

  /**
   * Completa uma resposta que foi cortada
   */
  async completarResposta(respostaCortada, contexto = {}) {
    console.log('[VALIDADOR-PRODUTOS] Completando resposta cortada...');

    try {
      const nomeBot = this.botConfig?.nome_bot || 'AIra';

      const prompt = `Você é ${nomeBot}, um(a) vendedor(a) de produtos automotivos. Esta resposta foi cortada no meio e precisa ser completada de forma natural.

RESPOSTA CORTADA:
"${respostaCortada}"

CONTEXTO:
${contexto.mensagemCliente ? `Mensagem do cliente: "${contexto.mensagemCliente}"` : ''}
${contexto.produtoInteresse ? `Produto de interesse: ${contexto.produtoInteresse}` : ''}

TAREFA:
Complete a resposta de forma natural e coerente. A resposta deve:
1. Manter o tom e estilo de ${nomeBot} (informal, amigável, com emojis ocasionais)
2. Completar a última frase que foi cortada
3. Finalizar de forma natural (não precisa adicionar muito texto, apenas completar)
4. Terminar com pontuação adequada
5. NUNCA revelar que é IA ou bot

Retorne APENAS a resposta COMPLETA (desde o início), sem explicações adicionais.`;

      const response = await this.anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
        temperature: 0.7,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const respostaCompleta = response.content[0].text.trim();

      console.log('[VALIDADOR-PRODUTOS] ✓ Resposta completada');
      console.log(`  Original (cortada): "${respostaCortada.slice(-50)}..."`);
      console.log(`  Completa: "${respostaCompleta.slice(-50)}..."`);

      return respostaCompleta;

    } catch (error) {
      console.error('[VALIDADOR-PRODUTOS] Erro ao completar:', error.message);

      // Fallback: adicionar ponto final se não tiver pontuação
      if (!/[.!?]$/.test(respostaCortada.trim())) {
        return respostaCortada.trim() + '.';
      }

      return respostaCortada;
    }
  }

  /**
   * Valida e corrige uma resposta automaticamente
   */
  async validarECorrigir(resposta, contexto = {}) {
    const validacao = this.validarCompletude(resposta);

    if (validacao.completa) {
      console.log('[VALIDADOR-PRODUTOS] ✅ Resposta completa, nenhuma correção necessária');
      return {
        resposta,
        foiCorrigida: false
      };
    }

    console.log('[VALIDADOR-PRODUTOS] ⚠️ Resposta incompleta detectada!');
    console.log(`  Problemas: ${validacao.problemas.join(', ')}`);

    const respostaCompleta = await this.completarResposta(resposta, contexto);

    return {
      resposta: respostaCompleta,
      foiCorrigida: true,
      problemasOriginais: validacao.problemas
    };
  }
}

export default ValidadorCompletudeProdutos;
