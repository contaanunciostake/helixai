/**
 * Analisador de Intenções - Acompanhante +18
 *
 * Detecta o que o cliente quer:
 * - Conteúdo online
 * - Encontro presencial
 * - Informações (valores, local, etc)
 * - Negociação
 */

import Anthropic from '@anthropic-ai/sdk';

class AnalisadorIntencoesAcompanhante {
  constructor() {
    this.client = new Anthropic();
    this.modelo = 'claude-3-haiku-20240307';
  }

  /**
   * Analisa a intenção do cliente
   */
  async analisar(mensagem, historicoConversa = []) {
    const prompt = `Analise a mensagem de um cliente interessado em serviços de acompanhante.

MENSAGEM DO CLIENTE: "${mensagem}"

HISTÓRICO RECENTE:
${historicoConversa.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n')}

Classifique a INTENÇÃO PRINCIPAL em uma das categorias:

1. SAUDACAO - Cumprimento inicial, primeiro contato
2. CONTEUDO - Quer comprar fotos, vídeos, conteúdo online
3. ENCONTRO - Quer marcar encontro presencial
4. VALORES - Perguntando preços, quanto custa
5. LOCAL - Perguntando onde atende, região, endereço
6. DISPONIBILIDADE - Perguntando horários, agenda
7. NEGOCIACAO - Pedindo desconto, negociando valor
8. CONFIRMACAO - Confirmando encontro/compra
9. DUVIDA - Pergunta geral, quer mais informações
10. ENCERRAMENTO - Despedida, agradecimento
11. INDEFINIDO - Não ficou claro

Também identifique:
- URGENCIA: baixa, media, alta (quão ansioso/pronto para fechar)
- PERFIL: curioso, decidido, negociador, desconfiado, respeitoso
- INTERESSE_PRINCIPAL: conteudo, encontro, ambos, indefinido

Responda APENAS em JSON:
{
  "intencao": "CATEGORIA",
  "urgencia": "baixa|media|alta",
  "perfil": "tipo",
  "interesse_principal": "tipo",
  "subtopicos": ["lista", "de", "assuntos"],
  "proximo_passo_sugerido": "o que a acompanhante deve fazer"
}`;

    try {
      const response = await this.client.messages.create({
        model: this.modelo,
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }]
      });

      const texto = response.content[0].text;
      const jsonMatch = texto.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return {
        intencao: 'INDEFINIDO',
        urgencia: 'baixa',
        perfil: 'indefinido',
        interesse_principal: 'indefinido',
        subtopicos: [],
        proximo_passo_sugerido: 'Perguntar o que ele procura'
      };

    } catch (error) {
      console.error('Erro ao analisar intenção:', error);
      return this.analisarLocal(mensagem);
    }
  }

  /**
   * Análise local (sem API) como fallback
   */
  analisarLocal(mensagem) {
    const msg = mensagem.toLowerCase();

    let intencao = 'INDEFINIDO';
    let urgencia = 'baixa';
    let interesse = 'indefinido';

    // Detectar intenção
    if (msg.match(/^(oi|ola|hey|eai|eae|bom dia|boa tarde|boa noite|opa|tudo bem)/)) {
      intencao = 'SAUDACAO';
    } else if (msg.match(/encontro|presencial|pessoalmente|sair|programa|atende\?|disponivel|livre/)) {
      intencao = 'ENCONTRO';
      interesse = 'encontro';
      urgencia = 'media';
    } else if (msg.match(/foto|video|conteudo|pack|nude|ver voce|mostrar/)) {
      intencao = 'CONTEUDO';
      interesse = 'conteudo';
    } else if (msg.match(/valor|preço|preco|quanto|custa|cobra|cache|tabela/)) {
      intencao = 'VALORES';
      urgencia = 'media';
    } else if (msg.match(/onde|local|lugar|regiao|bairro|endereco|endereço|atende onde/)) {
      intencao = 'LOCAL';
    } else if (msg.match(/horario|hora|quando|disponivel|agenda|livre|amanha|hoje|semana/)) {
      intencao = 'DISPONIBILIDADE';
      urgencia = 'media';
    } else if (msg.match(/desconto|mais barato|menos|negociar|diminuir|abaixa|promocao/)) {
      intencao = 'NEGOCIACAO';
    } else if (msg.match(/fechado|combinado|vamos|quero|bora|pode ser|confirmo|to indo|vou/)) {
      intencao = 'CONFIRMACAO';
      urgencia = 'alta';
    } else if (msg.match(/tchau|obrigado|valeu|ate mais|bye|flw/)) {
      intencao = 'ENCERRAMENTO';
    }

    // Detectar urgência
    if (msg.match(/agora|hoje|urgente|ja|já|rapido|logo/)) {
      urgencia = 'alta';
    }

    return {
      intencao,
      urgencia,
      perfil: 'indefinido',
      interesse_principal: interesse,
      subtopicos: [],
      proximo_passo_sugerido: this.getProximoPasso(intencao)
    };
  }

  /**
   * Sugere próximo passo baseado na intenção
   */
  getProximoPasso(intencao) {
    const passos = {
      SAUDACAO: 'Cumprimentar e perguntar o que ele procura',
      CONTEUDO: 'Apresentar pacotes de conteúdo disponíveis',
      ENCONTRO: 'Perguntar preferências: local, horário, duração',
      VALORES: 'Apresentar tabela de valores de forma envolvente',
      LOCAL: 'Explicar regiões de atendimento e opções de local',
      DISPONIBILIDADE: 'Mostrar horários disponíveis e sugerir data',
      NEGOCIACAO: 'Ser firme mas oferecer alternativas',
      CONFIRMACAO: 'Confirmar todos os detalhes e forma de pagamento',
      DUVIDA: 'Responder a dúvida e guiar para próximo passo',
      ENCERRAMENTO: 'Despedir de forma carinhosa, deixar porta aberta',
      INDEFINIDO: 'Perguntar educadamente o que ele procura'
    };

    return passos[intencao] || passos.INDEFINIDO;
  }
}

export default new AnalisadorIntencoesAcompanhante();
