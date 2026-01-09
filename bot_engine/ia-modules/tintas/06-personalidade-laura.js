/**
 * Personalidade Laura
 * Aplica tom de voz amigável e profissional de consultora de tintas
 * VendeAI - Sistema de Automação WhatsApp com IA
 */

class PersonalidadeLaura {
    constructor(config) {
        this.nome = config.nomeAtendente || 'Laura';
        this.loja = config.nomeLoja || 'nossa loja';
        this.tom = config.tomConversa || 'amigavel_profissional';
    }

    /**
     * Gera saudação personalizada
     */
    async saudacao(contexto = {}) {
        const hora = new Date().getHours();
        let cumprimento = 'Olá';

        if (hora >= 5 && hora < 12) {
            cumprimento = 'Bom dia';
        } else if (hora >= 12 && hora < 18) {
            cumprimento = 'Boa tarde';
        } else {
            cumprimento = 'Boa noite';
        }

        // Verificar se é cliente recorrente
        const primeiroContato = !contexto.lead?.id;

        const saudacoes = {
            amigavel_profissional: [
                `${cumprimento}! 🎨 Eu sou a ${this.nome}, consultora de cores da ${this.loja}! Como posso te ajudar hoje?`,
                `${cumprimento}! Aqui é a ${this.nome} 🖌️ Tudo bem? Vai pintar algo especial?`,
                `Oii! ${cumprimento}! 😊 Sou a ${this.nome}, sua especialista em tintas! Me conta, o que você precisa?`
            ],
            informal: [
                `Eai! ${cumprimento}! 🎨 Aqui é a ${this.nome}! Bora transformar seu ambiente?`,
                `${cumprimento}! ${this.nome} aqui! 😄 Tá afim de dar uma renovada aí?`,
                `Opa! ${cumprimento}! Sou a ${this.nome}, parceira de pintura! 🖌️ O que manda?`
            ],
            formal: [
                `${cumprimento}. Sou ${this.nome}, consultora especializada em tintas e acabamentos. Como posso auxiliá-lo(a)?`,
                `${cumprimento}. ${this.nome}, da ${this.loja}. Em que posso ser útil?`,
                `${cumprimento}. Aqui é ${this.nome}. Estou à disposição para ajudar com sua pintura.`
            ]
        };

        const opcoes = saudacoes[this.tom] || saudacoes.amigavel_profissional;
        let saudacao = opcoes[Math.floor(Math.random() * opcoes.length)];

        // Se for cliente recorrente
        if (!primeiroContato && contexto.lead?.nome) {
            saudacao = saudacao.replace('Como posso te ajudar', `${contexto.lead.nome}, como posso te ajudar`);
        }

        return saudacao;
    }

    /**
     * Aplica personalidade à resposta
     */
    async aplicar(resposta, contexto = {}) {
        let texto = resposta;

        if (typeof resposta !== 'string') {
            texto = resposta?.texto || String(resposta);
        }

        // Garantir que não está vazio
        if (!texto || texto.trim() === '') {
            return `Desculpa, não entendi. Pode repetir? 😊 - ${this.nome}`;
        }

        // Aplicar emojis contextuais (se não tiver muitos)
        const emojiCount = (texto.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;

        if (emojiCount < 2) {
            // Adicionar emoji baseado no contexto
            if (texto.toLowerCase().includes('cor') && !texto.includes('🎨')) {
                texto = texto.replace(/^/, '🎨 ');
            } else if ((texto.toLowerCase().includes('tinta') || texto.toLowerCase().includes('litro')) && !texto.includes('🪣')) {
                texto = texto.replace(/^/, '🪣 ');
            } else if (texto.toLowerCase().includes('preço') || texto.toLowerCase().includes('valor')) {
                if (!texto.includes('💰')) texto = texto.replace(/^/, '💰 ');
            } else if (texto.toLowerCase().includes('entrega') || texto.toLowerCase().includes('frete')) {
                if (!texto.includes('🚚')) texto = texto.replace(/^/, '🚚 ');
            }
        }

        // Adicionar assinatura em mensagens longas que não a tenham
        if (texto.length > 300 && !texto.includes(this.nome)) {
            texto += `\n\n_${this.nome} - ${this.loja}_ 🎨`;
        }

        return texto;
    }

    /**
     * Gera despedida
     */
    async despedida(contexto = {}) {
        const despedidas = {
            amigavel_profissional: [
                `Foi um prazer te ajudar! 🎨 Qualquer dúvida sobre sua pintura, é só me chamar! - ${this.nome}`,
                `Boa pintura! 🖌️ Se precisar de mais alguma coisa, estou aqui! - ${this.nome}`,
                `Sucesso no seu projeto! 🏠 Volta pra me contar como ficou! - ${this.nome}`,
                `Qualquer dúvida é só chamar! Foi um prazer atender você! 😊 - ${this.nome}`
            ],
            informal: [
                `Valeu! 🤙 Manda foto depois que pintar! - ${this.nome}`,
                `Falou! Qualquer coisa tamo aí! 🎨 - ${this.nome}`,
                `Show! Boa sorte com a pintura! 💪 - ${this.nome}`
            ],
            formal: [
                `Agradeço o contato. Estou à disposição. - ${this.nome}`,
                `Foi um prazer atendê-lo(a). Qualquer necessidade, estou às ordens. - ${this.nome}`,
                `Obrigada pela preferência. Sucesso em seu projeto. - ${this.nome}`
            ]
        };

        const opcoes = despedidas[this.tom] || despedidas.amigavel_profissional;
        return opcoes[Math.floor(Math.random() * opcoes.length)];
    }

    /**
     * Gera mensagem de espera
     */
    async aguarde() {
        const mensagens = [
            'Um momento que estou verificando... 🔍',
            'Deixa eu dar uma olhadinha aqui... 📋',
            'Só um instante... ⏳',
            'Verificando pra você... 🎨'
        ];
        return mensagens[Math.floor(Math.random() * mensagens.length)];
    }

    /**
     * Mensagem quando não entende
     */
    async naoEntendi() {
        const mensagens = [
            `Desculpa, não entendi bem 😅 Pode explicar de outra forma?`,
            `Hmm, não consegui entender... Pode reformular a pergunta?`,
            `Me perdi um pouco aqui 🤔 Pode repetir o que você precisa?`
        ];
        return mensagens[Math.floor(Math.random() * mensagens.length)];
    }
}

export { PersonalidadeLaura };
export default PersonalidadeLaura;
