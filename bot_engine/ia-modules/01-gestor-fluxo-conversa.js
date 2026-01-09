/**
 * Gestor de Fluxo de Conversa - Luana
 * Gerencia as etapas da conversa: Início → Meio → Fim
 * Garante que a vendedora siga o fluxo natural de vendas
 *
 * ✅ ATUALIZADO: Suporte opcional para análise com Claude AI
 */

import Anthropic from '@anthropic-ai/sdk';

class GestorFluxoConversa {
  constructor(anthropicKey = null) {
    // Armazena etapa de cada conversa: telefone => { etapa, contexto }
    this.conversas = new Map();

    // ✅ Inicializar Claude (opcional - se não fornecido, usa apenas regex)
    this.anthropic = anthropicKey ? new Anthropic({ apiKey: anthropicKey }) : null;

    if (this.anthropic) {
      console.log('[GESTOR-FLUXO] ✅ Claude AI habilitado para análise avançada');
    } else {
      console.log('[GESTOR-FLUXO] ℹ️  Modo regex (sem IA)');
    }
  }

  /**
   * Identifica a etapa atual da conversa
   * @param {string} telefone - Telefone do cliente
   * @param {Array} historico - Histórico de mensagens
   * @param {boolean} usarIA - Se true, usa Claude para análise (padrão: false)
   * @returns {Promise<string>|string} - 'INICIO', 'EXPLORACAO', 'APRESENTACAO', 'DETALHAMENTO', 'FECHAMENTO'
   */
  async identificarEtapa(telefone, historico, usarIA = false) {
    // Se não tem histórico ou apenas 1 mensagem, é INICIO
    if (!historico || historico.length <= 1) {
      return 'INICIO';
    }

    // ✅ MODO IA: Usar Claude para análise mais precisa
    if (usarIA && this.anthropic) {
      try {
        return await this._identificarEtapaComIA(telefone, historico);
      } catch (error) {
        console.error('[GESTOR-FLUXO] ❌ Erro na análise com IA, usando regex:', error.message);
        // Fallback para regex
      }
    }

    // MODO REGEX (padrão - mais rápido, sem custo de API)
    const contexto = this.conversas.get(telefone) || { etapa: 'INICIO', interacoes: 0 };

    // Contar mensagens do cliente (excluindo mensagens do bot)
    const mensagensCliente = historico.filter(m => m.role === 'user').length;

    // Analisar última mensagem do cliente para detectar mudanças de etapa
    const ultimaMensagem = historico[historico.length - 1];
    const texto = ultimaMensagem.content?.toLowerCase() || '';

    // LÓGICA DE PROGRESSÃO DE ETAPAS

    // ✅ PRIORIDADE MÁXIMA: Cliente confirmou horário de visita? -> AGENDAMENTO_CONFIRMADO
    if (this.detectarConfirmacaoAgendamento(texto)) {
      return 'AGENDAMENTO_CONFIRMADO';
    }

    // Cliente mencionou veículo específico ou tipo? -> EXPLORACAO ou APRESENTACAO
    if (this.detectarMencaoVeiculo(texto)) {
      if (contexto.etapa === 'INICIO') {
        return 'EXPLORACAO';
      }
      return 'APRESENTACAO';
    }

    // Cliente quer mais detalhes? -> DETALHAMENTO
    if (this.detectarPedidoDetalhes(texto)) {
      return 'DETALHAMENTO';
    }

    // Cliente demonstrou interesse forte? -> FECHAMENTO
    if (this.detectarInteresseFechamento(texto)) {
      return 'FECHAMENTO';
    }

    // Progressão natural baseada em número de mensagens
    if (mensagensCliente === 1) return 'INICIO';
    if (mensagensCliente <= 3) return 'EXPLORACAO';
    if (mensagensCliente <= 6) return 'APRESENTACAO';
    if (mensagensCliente <= 10) return 'DETALHAMENTO';

    return 'FECHAMENTO';
  }

  /**
   * ✨ NOVO: Identifica etapa usando Claude AI (análise mais precisa)
   * @private
   */
  async _identificarEtapaComIA(telefone, historico) {
    const contexto = this.conversas.get(telefone) || { etapa: 'INICIO', interacoes: 0 };

    // Construir contexto para Claude
    const historicoTexto = historico
      .slice(-5) // Últimas 5 mensagens
      .map(m => `${m.role}: "${m.content}"`)
      .join('\n');

    const prompt = `Analise esta conversa de vendas de carros e identifique a etapa atual:

HISTÓRICO:
${historicoTexto}

ETAPA ANTERIOR: ${contexto.etapa}

ETAPAS POSSÍVEIS (retorne APENAS uma palavra):
- INICIO: Cliente começando conversa, saudações
- EXPLORACAO: Cliente mencionou interesse, descobrindo necessidades
- APRESENTACAO: Apresentando veículos específicos
- DETALHAMENTO: Cliente pediu mais detalhes de veículo
- FECHAMENTO: Cliente demonstrou forte interesse, negociando
- AGENDAMENTO_CONFIRMADO: Cliente CONFIRMOU horário específico de visita

REGRAS:
- Se cliente confirmar horário específico (ex: "amanhã às 15h", "pode ser às 14"), retorne AGENDAMENTO_CONFIRMADO
- Se cliente apenas perguntou sobre horários SEM confirmar, ainda é FECHAMENTO
- Considere progressão natural: INICIO → EXPLORACAO → APRESENTACAO → DETALHAMENTO → FECHAMENTO → AGENDAMENTO_CONFIRMADO

Responda APENAS com a etapa (uma palavra):`;

    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 50,
      temperature: 0.2,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const etapa = response.content[0].text.trim().toUpperCase();

    // Validar resposta
    const etapasValidas = ['INICIO', 'EXPLORACAO', 'APRESENTACAO', 'DETALHAMENTO', 'FECHAMENTO', 'AGENDAMENTO_CONFIRMADO'];
    if (etapasValidas.includes(etapa)) {
      console.log(`[GESTOR-FLUXO] 🤖 Claude identificou: ${etapa}`);
      return etapa;
    }

    // Fallback se Claude retornou algo inválido
    console.warn(`[GESTOR-FLUXO] ⚠️  Resposta inválida do Claude: "${etapa}", usando regex`);
    return contexto.etapa;
  }

  /**
   * Detecta se cliente mencionou veículo
   */
  detectarMencaoVeiculo(texto) {
    const palavrasChave = [
      'suv', 'sedan', 'hatch', 'pickup', 'caminhonete',
      'automático', 'manual', 'flex', 'gasolina', 'diesel',
      'carro', 'veículo', 'automóvel', 'auto',
      'cor', 'ano', 'km', 'quilômetros', 'valor', 'preço'
    ];

    return palavrasChave.some(palavra => texto.includes(palavra));
  }

  /**
   * Detecta se cliente pediu mais detalhes
   */
  detectarPedidoDetalhes(texto) {
    const palavrasChave = [
      'detalhe', 'mais informação', 'especificação', 'ficha técnica',
      'consumo', 'motor', 'câmbio', 'potência', 'torque',
      'equipamento', 'item', 'opcional', 'acessório',
      'revisão', 'garantia', 'procedência'
    ];

    return palavrasChave.some(palavra => texto.includes(palavra));
  }

  /**
   * Detecta interesse em fechar negócio
   */
  detectarInteresseFechamento(texto) {
    const palavrasChave = [
      'gostei', 'interessei', 'quero', 'comprar', 'adquirir',
      'financiamento', 'parcela', 'entrada', 'condição',
      'test drive', 'visitar', 'ver pessoalmente', 'ir na loja',
      'agendar', 'quando posso', 'horário', 'endereço',
      'fechar', 'negócio', 'acordo', 'proposta'
    ];

    return palavrasChave.some(palavra => texto.includes(palavra));
  }

  /**
   * Detecta se cliente CONFIRMOU um horário específico de visita/test drive
   * Exemplos: "pode ser às 15?", "amanhã às 14h", "confirmo às 10h"
   */
  detectarConfirmacaoAgendamento(texto) {
    // Padrões de horário: "15h", "às 15", "14:00", "3 horas", "15 horas"
    const padraoHorario = /\b(\d{1,2})(h|:|\s*hora)/i;

    // Palavras de confirmação
    const confirmacoes = [
      'pode ser', 'confirmo', 'tá bom', 'ta bom', 'ok',
      'fechado', 'combinado', 'certo', 'beleza', 'perfeito',
      'amanhã', 'hoje', 'depois', 'terça', 'quarta', 'quinta',
      'sexta', 'sábado', 'sabado', 'domingo', 'segunda'
    ];

    const temHorario = padraoHorario.test(texto);
    const temConfirmacao = confirmacoes.some(palavra => texto.includes(palavra));

    // Se tem horário + confirmação, ou se a mensagem é curta e tem horário (ex: "15h", "às 3")
    return (temHorario && temConfirmacao) || (temHorario && texto.length < 20);
  }

  /**
   * Gera instrução para IA baseada na etapa
   */
  gerarInstrucaoEtapa(etapa, nomeCliente, primeiraInteracao = false) {
    switch (etapa) {
      case 'INICIO':
        if (primeiraInteracao) {
          return `
🎯 ETAPA: BOAS-VINDAS (PRIMEIRA MENSAGEM)

INSTRUÇÕES CRÍTICAS:
1. SEMPRE chame o cliente pelo nome: "${nomeCliente}"
2. NUNCA ofereça veículos nesta primeira mensagem
3. Seja calorosa e receptiva
4. Pergunte como pode ajudar
5. Se o cliente JÁ mencionou um veículo na mensagem dele, você pode responder sobre o veículo

EXEMPLO CORRETO:
"Olá ${nomeCliente}! Bem-vindo(a) à nossa loja! 😊
Sou a Luana, sua consultora de vendas. Como posso ajudar você hoje?"

NUNCA FAÇA:
❌ "Olá! Temos diversos SUVs disponíveis..."
❌ "Oi! Gostaria de ver nossos carros?"
❌ Oferecer algo sem o cliente pedir
`;
        }
        return `
🎯 ETAPA: INÍCIO DA CONVERSA

- Cliente está iniciando contato
- Seja receptiva e pergunta sobre necessidades
- NÃO ofereça veículos ainda
- Faça perguntas abertas para entender o que ele busca
- Use o nome: ${nomeCliente}
`;

      case 'EXPLORACAO':
        return `
🎯 ETAPA: EXPLORAÇÃO DE NECESSIDADES

- Cliente mencionou interesse em veículos
- Faça perguntas qualificadoras:
  • Que tipo de veículo procura? (SUV, sedan, hatch, etc)
  • Qual uso pretende dar? (trabalho, família, viagens)
  • Tem preferência de cor, ano, quilometragem?
  • Qual faixa de valor considera?
- AINDA NÃO apresente veículos específicos
- Entenda profundamente a necessidade do ${nomeCliente}
`;

      case 'APRESENTACAO':
        return `
🎯 ETAPA: APRESENTAÇÃO DE VEÍCULOS

- Agora SIM, apresente veículos que correspondam ao que ${nomeCliente} busca
- Destaque BENEFÍCIOS, não apenas características:
  • SUV = espaço, conforto família, segurança em viagens
  • Sedan = elegância, porta-malas, economia
  • Hatch = praticidade, facilidade estacionar, economia
- Mencione 2-3 opções no máximo
- Pergunte se quer saber mais detalhes de algum específico
- Seja entusiasta sobre as vantagens
`;

      case 'DETALHAMENTO':
        return `
🎯 ETAPA: DETALHAMENTO DO VEÍCULO

- ${nomeCliente} demonstrou interesse em veículo específico
- Forneça informações técnicas relevantes
- Destaque itens de segurança e conforto
- Mencione diferenciais e vantagens
- Pergunte se quer ver fotos, vídeo ou agendar test drive
- Comece a guiar para fechamento
`;

      case 'FECHAMENTO':
        return `
🎯 ETAPA: FECHAMENTO DE VENDA

- ${nomeCliente} está interessado(a)!
- Ofereça opções concretas:
  1. Agendar test drive
  2. Visitar a loja para ver o veículo
  3. Simular financiamento pelo WhatsApp
  4. Falar com gerente sobre condições especiais
- Seja objetiva e crie senso de urgência (sem pressionar)
- "Esse modelo tem bastante procura, ${nomeCliente}..."
- "Posso reservar para você..."
- "Quando gostaria de conhecer pessoalmente?"
`;

      case 'AGENDAMENTO_CONFIRMADO':
        return `
✅ ETAPA: AGENDAMENTO CONFIRMADO - VENDA FECHADA! 🎉

⚠️ CRÍTICO - ${nomeCliente} ACABOU DE CONFIRMAR O HORÁRIO DA VISITA!

ESTA É A ÚLTIMA MENSAGEM DO FUNIL! ENCERRE COM CLASSE:
✅ Confirme o horário com entusiasmo
✅ Diga que vai aguardá-lo(a)
✅ Fique à disposição
❌ NÃO faça mais perguntas sobre modelos ou veículos
❌ NÃO continue vendendo
❌ NÃO ofereça mais nada

ESTRUTURA DA RESPOSTA:
1. Confirmação do horário ("Perfeito! Amanhã às 15h está ótimo!")
2. Aguardo ("Vou te aguardar aqui no Feirão Show Car")
3. Disponibilidade ("Qualquer coisa antes, só me chamar!")
4. Despedida positiva ("Até amanhã!")

EXEMPLOS CORRETOS:
"Perfeito, ${nomeCliente}! Amanhã às 15h está ótimo! 😊
Vou te aguardar aqui no Feirão Show Car.
Qualquer coisa antes disso, é só me chamar! Até amanhã!"

"Fechado! Terça às 14h então! 🚗
Te espero aqui com tudo preparado.
Se precisar de algo, estarei por aqui. Até terça!"

❌ NUNCA FAÇA:
"Perfeito! Às 15h está ótimo! Tem algum modelo específico que você gostaria de ver?"
"Combinado! Quer que eu separe algum carro?"
`;

      default:
        return '';
    }
  }

  /**
   * Atualiza contexto da conversa
   */
  atualizarContexto(telefone, etapa, dados = {}) {
    const contexto = this.conversas.get(telefone) || {
      etapa: 'INICIO',
      interacoes: 0,
      veiculosApresentados: [],
      interesseManifestado: false
    };

    contexto.etapa = etapa;
    contexto.interacoes++;
    contexto.ultimaAtualizacao = new Date();

    // Mesclar dados adicionais
    Object.assign(contexto, dados);

    this.conversas.set(telefone, contexto);
    return contexto;
  }

  /**
   * Obtém contexto da conversa
   */
  obterContexto(telefone) {
    return this.conversas.get(telefone) || {
      etapa: 'INICIO',
      interacoes: 0,
      veiculosApresentados: [],
      interesseManifestado: false
    };
  }

  /**
   * Detecta se é a primeira mensagem do cliente
   */
  isPrimeiraMensagem(historico) {
    if (!historico || historico.length === 0) return true;

    // Contar apenas mensagens do usuário
    const mensagensUsuario = historico.filter(m => m.role === 'user');
    return mensagensUsuario.length === 1;
  }

  /**
   * Analisa intenção do cliente na mensagem
   */
  analisarIntencao(mensagem) {
    const texto = mensagem.toLowerCase();

    const intencoes = {
      saudacao: ['oi', 'olá', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'hey', 'opa'],
      busca_veiculo: ['quero', 'procuro', 'busco', 'preciso', 'gostaria', 'tem', 'disponível'],
      pedido_info: ['quanto', 'preço', 'valor', 'custo', 'quanto custa', 'informação'],
      interesse_forte: ['gostei', 'interessei', 'adoro', 'perfeito', 'excelente', 'adorei'],
      agendamento: ['visitar', 'ir', 'test drive', 'agendar', 'quando', 'horário'],
      confirmacao_horario: ['pode ser', 'confirmo', 'tá bom', 'ta bom', 'combinado', 'fechado', 'amanhã', 'hoje', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo'],
      financiamento: ['financiar', 'parcela', 'entrada', 'financiamento', 'crédito'],
      duvida: ['?', 'como', 'qual', 'onde', 'dúvida', 'duvida']
    };

    const intencoesDetectadas = [];

    for (const [intencao, palavras] of Object.entries(intencoes)) {
      if (palavras.some(palavra => texto.includes(palavra))) {
        intencoesDetectadas.push(intencao);
      }
    }

    return intencoesDetectadas;
  }

  /**
   * Limpa conversas antigas (> 24h)
   */
  limparConversasAntigas() {
    const agora = new Date();
    const limite = 24 * 60 * 60 * 1000; // 24 horas

    for (const [telefone, contexto] of this.conversas.entries()) {
      if (contexto.ultimaAtualizacao &&
          (agora - contexto.ultimaAtualizacao) > limite) {
        this.conversas.delete(telefone);
        console.log(`[GESTOR-FLUXO] Conversa limpa: ${telefone}`);
      }
    }
  }
}

// ✅ FUNÇÃO FACTORY para criar instância com configuração
export function criarGestorFluxo(anthropicKey = null) {
  return new GestorFluxoConversa(anthropicKey);
}

// Exportar instância singleton (modo regex por padrão)
const gestorFluxo = new GestorFluxoConversa();

// Limpar conversas antigas a cada 1 hora
setInterval(() => {
  gestorFluxo.limparConversasAntigas();
}, 60 * 60 * 1000);

export default gestorFluxo;

// Exportar classe também (para testes ou instâncias customizadas)
export { GestorFluxoConversa };
