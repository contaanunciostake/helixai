/**
 * Memória de Contexto - Acompanhante +18
 *
 * Mantém informações importantes do cliente:
 * - Nome, preferências
 * - Histórico de conversas
 * - Encontros anteriores
 * - Interesses específicos
 */

import Anthropic from '@anthropic-ai/sdk';

class MemoriaContextoAcompanhante {
  constructor() {
    this.client = new Anthropic();
    this.modelo = 'claude-3-haiku-20240307';
    this.memorias = new Map(); // telefone -> dados
  }

  /**
   * Extrai informações importantes da conversa
   */
  async extrairInformacoes(mensagem, telefone, historicoConversa = []) {
    const memoriaAtual = this.memorias.get(telefone) || this.criarMemoriaVazia();

    const prompt = `Extraia informações importantes desta conversa com um cliente.

MENSAGEM ATUAL: "${mensagem}"

HISTÓRICO:
${historicoConversa.slice(-10).map(m => `${m.role}: ${m.content}`).join('\n')}

MEMÓRIA ATUAL DO CLIENTE:
${JSON.stringify(memoriaAtual, null, 2)}

Extraia/atualize:
1. Nome do cliente (se mencionado)
2. Preferências (o que ele gosta, tipo de encontro, etc)
3. Local preferido (tem local ou não, região)
4. Disponibilidade (horários, dias)
5. Orçamento aproximado (se mencionou valores)
6. Interesse principal (conteúdo, encontro, ambos)
7. Informações pessoais (cidade, profissão, idade se disse)
8. Histórico (se já comprou antes, se é cliente novo)
9. Red flags (sinais de alerta, comportamento estranho)
10. Notas importantes (qualquer coisa relevante)

Responda em JSON (mantenha valores anteriores se não tiver novos):
{
  "nome": "string ou null",
  "preferencias": ["lista"],
  "local_preferido": "com_local|sem_local|indefinido",
  "regiao": "string ou null",
  "disponibilidade": {
    "dias": ["lista"],
    "horarios": ["lista"],
    "urgencia": "hoje|essa_semana|sem_pressa"
  },
  "orcamento": "baixo|medio|alto|indefinido",
  "interesse_principal": "conteudo|encontro|ambos|indefinido",
  "info_pessoal": {
    "cidade": "string ou null",
    "profissao": "string ou null",
    "idade_aproximada": "string ou null"
  },
  "historico": {
    "cliente_novo": true|false,
    "compras_anteriores": 0,
    "ultima_interacao": "data ou null"
  },
  "red_flags": ["lista"],
  "notas": ["lista de observações importantes"],
  "nivel_interesse": 0-100
}`;

    try {
      const response = await this.client.messages.create({
        model: this.modelo,
        max_tokens: 800,
        messages: [{ role: 'user', content: prompt }]
      });

      const texto = response.content[0].text;
      const jsonMatch = texto.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const novaMemoria = JSON.parse(jsonMatch[0]);
        // Mesclar com memória existente
        const memoriaAtualizada = this.mesclarMemorias(memoriaAtual, novaMemoria);
        memoriaAtualizada.ultima_atualizacao = new Date().toISOString();
        this.memorias.set(telefone, memoriaAtualizada);
        return memoriaAtualizada;
      }

      return memoriaAtual;

    } catch (error) {
      console.error('Erro ao extrair informações:', error);
      return this.extrairLocal(mensagem, memoriaAtual);
    }
  }

  /**
   * Cria memória vazia para novo cliente
   */
  criarMemoriaVazia() {
    return {
      nome: null,
      preferencias: [],
      local_preferido: 'indefinido',
      regiao: null,
      disponibilidade: {
        dias: [],
        horarios: [],
        urgencia: 'sem_pressa'
      },
      orcamento: 'indefinido',
      interesse_principal: 'indefinido',
      info_pessoal: {
        cidade: null,
        profissao: null,
        idade_aproximada: null
      },
      historico: {
        cliente_novo: true,
        compras_anteriores: 0,
        ultima_interacao: null
      },
      red_flags: [],
      notas: [],
      nivel_interesse: 30,
      primeira_mensagem: new Date().toISOString(),
      ultima_atualizacao: new Date().toISOString()
    };
  }

  /**
   * Mescla memórias mantendo informações importantes
   */
  mesclarMemorias(antiga, nova) {
    return {
      nome: nova.nome || antiga.nome,
      preferencias: [...new Set([...antiga.preferencias, ...nova.preferencias])],
      local_preferido: nova.local_preferido !== 'indefinido' ? nova.local_preferido : antiga.local_preferido,
      regiao: nova.regiao || antiga.regiao,
      disponibilidade: {
        dias: nova.disponibilidade?.dias?.length ? nova.disponibilidade.dias : antiga.disponibilidade.dias,
        horarios: nova.disponibilidade?.horarios?.length ? nova.disponibilidade.horarios : antiga.disponibilidade.horarios,
        urgencia: nova.disponibilidade?.urgencia || antiga.disponibilidade.urgencia
      },
      orcamento: nova.orcamento !== 'indefinido' ? nova.orcamento : antiga.orcamento,
      interesse_principal: nova.interesse_principal !== 'indefinido' ? nova.interesse_principal : antiga.interesse_principal,
      info_pessoal: {
        cidade: nova.info_pessoal?.cidade || antiga.info_pessoal.cidade,
        profissao: nova.info_pessoal?.profissao || antiga.info_pessoal.profissao,
        idade_aproximada: nova.info_pessoal?.idade_aproximada || antiga.info_pessoal.idade_aproximada
      },
      historico: {
        cliente_novo: antiga.historico.cliente_novo,
        compras_anteriores: Math.max(antiga.historico.compras_anteriores, nova.historico?.compras_anteriores || 0),
        ultima_interacao: nova.historico?.ultima_interacao || antiga.historico.ultima_interacao
      },
      red_flags: [...new Set([...antiga.red_flags, ...(nova.red_flags || [])])],
      notas: [...antiga.notas, ...(nova.notas || [])].slice(-20), // Últimas 20 notas
      nivel_interesse: nova.nivel_interesse || antiga.nivel_interesse,
      primeira_mensagem: antiga.primeira_mensagem
    };
  }

  /**
   * Extração local (fallback)
   */
  extrairLocal(mensagem, memoriaAtual) {
    const msg = mensagem.toLowerCase();
    const memoria = { ...memoriaAtual };

    // Detectar nome
    const nomeMatch = msg.match(/me chamo (\w+)|meu nome [eé] (\w+)|sou o (\w+)/);
    if (nomeMatch) {
      memoria.nome = nomeMatch[1] || nomeMatch[2] || nomeMatch[3];
    }

    // Detectar local
    if (msg.match(/tenho local|meu apto|minha casa|hotel/)) {
      memoria.local_preferido = 'sem_local'; // ele tem local
    } else if (msg.match(/tem local|voce tem|seu local|onde voce atende/)) {
      memoria.local_preferido = 'com_local'; // precisa do local dela
    }

    // Detectar urgência
    if (msg.match(/hoje|agora|urgente/)) {
      memoria.disponibilidade.urgencia = 'hoje';
    } else if (msg.match(/essa semana|amanha|proximo/)) {
      memoria.disponibilidade.urgencia = 'essa_semana';
    }

    // Detectar interesse
    if (msg.match(/encontro|presencial|sair/)) {
      memoria.interesse_principal = 'encontro';
    } else if (msg.match(/foto|video|conteudo|pack/)) {
      memoria.interesse_principal = 'conteudo';
    }

    // Detectar red flags
    if (msg.match(/sem camisinha|sem protecao/)) {
      if (!memoria.red_flags.includes('sem_protecao')) {
        memoria.red_flags.push('sem_protecao');
      }
    }

    memoria.ultima_atualizacao = new Date().toISOString();
    return memoria;
  }

  /**
   * Recupera memória de um cliente
   */
  getMemoria(telefone) {
    return this.memorias.get(telefone) || this.criarMemoriaVazia();
  }

  /**
   * Gera resumo da memória para incluir no prompt
   */
  gerarResumoParaPrompt(telefone) {
    const memoria = this.getMemoria(telefone);

    let resumo = '';

    if (memoria.nome) {
      resumo += `Nome do cliente: ${memoria.nome}\n`;
    }

    if (memoria.interesse_principal !== 'indefinido') {
      resumo += `Interesse: ${memoria.interesse_principal}\n`;
    }

    if (memoria.local_preferido !== 'indefinido') {
      resumo += `Local: ${memoria.local_preferido === 'com_local' ? 'Precisa do seu local' : 'Ele tem local'}\n`;
    }

    if (memoria.regiao) {
      resumo += `Região: ${memoria.regiao}\n`;
    }

    if (memoria.preferencias.length > 0) {
      resumo += `Preferências: ${memoria.preferencias.join(', ')}\n`;
    }

    if (memoria.disponibilidade.urgencia !== 'sem_pressa') {
      resumo += `Urgência: ${memoria.disponibilidade.urgencia}\n`;
    }

    if (memoria.red_flags.length > 0) {
      resumo += `⚠️ ALERTAS: ${memoria.red_flags.join(', ')}\n`;
    }

    if (!memoria.historico.cliente_novo) {
      resumo += `Cliente recorrente (${memoria.historico.compras_anteriores} compras anteriores)\n`;
    }

    return resumo || 'Cliente novo, ainda sem informações coletadas.';
  }

  /**
   * Limpa memória antiga (mais de 30 dias)
   */
  limparMemoriasAntigas() {
    const agora = new Date();
    const limiteDias = 30;

    for (const [telefone, memoria] of this.memorias) {
      const ultima = new Date(memoria.ultima_atualizacao);
      const diffDias = (agora - ultima) / (1000 * 60 * 60 * 24);

      if (diffDias > limiteDias) {
        this.memorias.delete(telefone);
      }
    }
  }
}

export default new MemoriaContextoAcompanhante();
