/**
 * Gerador de Respostas - Tintas
 * Gera respostas persuasivas e informativas sobre tintas
 * VendeAI - Sistema de Automação WhatsApp com IA
 */

class GeradorRespostasTintas {
    constructor(config) {
        this.config = config;
        this.nomeAtendente = config.nomeAtendente || 'Laura';
        this.nomeLoja = config.nomeLoja || 'nossa loja';
        this.prazoEntrega = config.prazoEntrega || '1-2 dias úteis';
        this.freteGratisAcima = config.freteGratisAcima || 500;

        // Base de conhecimento técnico
        this.conhecimentoTecnico = {
            preparacao: {
                alvenaria: 'Lixar para remover imperfeições, aplicar massa corrida se necessário, limpar pó e aplicar fundo preparador.',
                madeira: 'Lixar no sentido das fibras, remover pó, aplicar fundo para madeira. Se tiver verniz antigo, lixar bem.',
                metal: 'Remover ferrugem, lixar, aplicar fundo anticorrosivo. Superfície deve estar seca.',
                gesso: 'Esperar cura completa (mínimo 28 dias), lixar e aplicar fundo selador.',
                repintura: 'Lixar a tinta antiga, remover partes soltas, limpar e aplicar fundo se necessário.'
            },
            diluicao: {
                latex: 'Até 30% de água na primeira demão, 10-20% nas demais.',
                acrilica: 'Até 20% de água na primeira demão, 5-10% nas demais.',
                esmalte: 'Aguarrás ou solvente específico da marca, até 10%.',
                verniz: 'Geralmente pronto para uso. Se necessário, até 10% de aguarrás.'
            },
            secagem: {
                latex: { toque: '30 min a 1 hora', entre_demaos: '2 a 4 horas', final: '4 horas' },
                acrilica: { toque: '30 min a 1 hora', entre_demaos: '4 horas', final: '4 a 6 horas' },
                esmalte: { toque: '2 a 4 horas', entre_demaos: '12 a 24 horas', final: '24 horas' },
                verniz: { toque: '1 a 2 horas', entre_demaos: '6 a 8 horas', final: '24 horas' }
            }
        };
    }

    /**
     * Gera resposta para dúvida técnica
     */
    async responderDuvidaTecnica(mensagem) {
        const msgLower = mensagem.toLowerCase();
        let resposta = '';

        // Preparação de superfície
        if (msgLower.includes('preparar') || msgLower.includes('preparação') || msgLower.includes('antes de pintar')) {
            resposta = `🖌️ *Como Preparar a Superfície*\n\n`;

            if (msgLower.includes('madeira')) {
                resposta += `*Para Madeira:*\n${this.conhecimentoTecnico.preparacao.madeira}`;
            } else if (msgLower.includes('metal') || msgLower.includes('ferro')) {
                resposta += `*Para Metal:*\n${this.conhecimentoTecnico.preparacao.metal}`;
            } else if (msgLower.includes('gesso') || msgLower.includes('drywall')) {
                resposta += `*Para Gesso/Drywall:*\n${this.conhecimentoTecnico.preparacao.gesso}`;
            } else if (msgLower.includes('repintura') || msgLower.includes('já pintada')) {
                resposta += `*Para Repintura:*\n${this.conhecimentoTecnico.preparacao.repintura}`;
            } else {
                resposta += `*Para Alvenaria (paredes):*\n${this.conhecimentoTecnico.preparacao.alvenaria}`;
            }

            resposta += `\n\n💡 *Dica:* Uma boa preparação é metade do trabalho! Superfície bem preparada = pintura duradoura.`;
        }

        // Diluição
        else if (msgLower.includes('dilui') || msgLower.includes('água') || msgLower.includes('aguarras')) {
            resposta = `💧 *Diluição da Tinta*\n\n`;

            Object.entries(this.conhecimentoTecnico.diluicao).forEach(([tipo, instrucao]) => {
                resposta += `*${tipo.charAt(0).toUpperCase() + tipo.slice(1)}:*\n${instrucao}\n\n`;
            });

            resposta += `⚠️ *Importante:* Sempre siga as instruções da embalagem. Diluição excessiva compromete a cobertura!`;
        }

        // Secagem
        else if (msgLower.includes('secagem') || msgLower.includes('secar') || msgLower.includes('demão')) {
            resposta = `⏱️ *Tempos de Secagem*\n\n`;

            Object.entries(this.conhecimentoTecnico.secagem).forEach(([tipo, tempos]) => {
                resposta += `*${tipo.charAt(0).toUpperCase() + tipo.slice(1)}:*\n`;
                resposta += `   • Ao toque: ${tempos.toque}\n`;
                resposta += `   • Entre demãos: ${tempos.entre_demaos}\n`;
                resposta += `   • Final: ${tempos.final}\n\n`;
            });

            resposta += `💡 *Dica:* Evite pintar em dias muito úmidos ou com previsão de chuva!`;
        }

        // Rendimento
        else if (msgLower.includes('rendimento') || msgLower.includes('render') || msgLower.includes('m²')) {
            resposta = `📊 *Rendimento das Tintas*\n\n`;
            resposta += `O rendimento varia conforme o tipo de tinta e superfície:\n\n`;
            resposta += `*Látex/Acrílica:* 8-12 m²/L\n`;
            resposta += `*Esmalte:* 10-14 m²/L\n`;
            resposta += `*Verniz:* 12-16 m²/L\n`;
            resposta += `*Textura:* 2-4 m²/L\n\n`;
            resposta += `💡 Superfícies porosas ou cores escuras reduzem o rendimento.\n\n`;
            resposta += `Quer que eu calcule a quantidade exata pra sua área? Me passa a metragem! 📐`;
        }

        // Diferença entre tintas
        else if (msgLower.includes('diferença') || msgLower.includes('melhor')) {
            if (msgLower.includes('latex') || msgLower.includes('acrilica')) {
                resposta = `🎨 *Látex vs Acrílica*\n\n`;
                resposta += `*Tinta Látex:*\n`;
                resposta += `• Mais econômica\n`;
                resposta += `• Indicada para áreas internas secas\n`;
                resposta += `• Boa cobertura, secagem rápida\n\n`;
                resposta += `*Tinta Acrílica:*\n`;
                resposta += `• Maior durabilidade e resistência\n`;
                resposta += `• Indicada para externas e áreas molhadas\n`;
                resposta += `• Mais fácil de limpar\n`;
                resposta += `• Custo um pouco maior\n\n`;
                resposta += `💡 *Resumo:* Para banheiro, cozinha ou área externa → Acrílica. Para quartos e salas → Látex resolve bem!`;
            } else if (msgLower.includes('fosco') || msgLower.includes('brilho')) {
                resposta = `✨ *Acabamentos*\n\n`;
                resposta += `*Fosco:* Disfarça imperfeições, visual elegante, menos lavável\n\n`;
                resposta += `*Acetinado:* Meio termo, leve brilho, boa limpeza\n\n`;
                resposta += `*Semi-brilho:* Mais resistente, fácil de limpar, destaca paredes\n\n`;
                resposta += `*Brilhante:* Muito lavável, mostra imperfeições\n\n`;
                resposta += `💡 *Dica:* Fosco para quartos e salas. Semi-brilho para cozinhas e banheiros.`;
            } else {
                resposta = `Qual comparação você quer que eu faça?\n\n`;
                resposta += `• Látex vs Acrílica\n`;
                resposta += `• Fosco vs Brilho\n`;
                resposta += `• Marcas específicas\n\n`;
                resposta += `Me conta! 😊`;
            }
        }

        // Resposta genérica para outras dúvidas
        else {
            resposta = `Ótima pergunta! 🤔\n\n`;
            resposta += `Posso te ajudar com:\n`;
            resposta += `• Preparação de superfície\n`;
            resposta += `• Diluição correta\n`;
            resposta += `• Tempos de secagem\n`;
            resposta += `• Rendimento\n`;
            resposta += `• Diferenças entre tipos de tinta\n\n`;
            resposta += `Me conta mais detalhes sobre sua dúvida!`;
        }

        return resposta;
    }

    /**
     * Gera resposta sobre entrega
     */
    async informarEntrega(contexto = {}) {
        let texto = `🚚 *Informações de Entrega*\n\n`;

        texto += `📦 *Prazo:* ${this.prazoEntrega}\n`;
        texto += `💰 *Frete Grátis:* Acima de R$ ${this.freteGratisAcima.toFixed(2)}\n\n`;

        texto += `*Formas de pagamento:*\n`;
        texto += `• PIX (com desconto)\n`;
        texto += `• Cartão de crédito (até 3x sem juros)\n`;
        texto += `• Boleto bancário\n\n`;

        texto += `Quer que eu monte um orçamento pra você? 📋`;

        return texto;
    }

    /**
     * Gera resposta genérica usando contexto
     */
    async gerarResposta(mensagem, contexto = {}, intencao = {}) {
        // Se não conseguiu identificar a intenção, tentar ajudar
        let resposta = `Entendi! Deixa eu ver se posso te ajudar... 🤔\n\n`;

        resposta += `O que você precisa?\n\n`;
        resposta += `🔍 *Buscar produtos* - Me conta o tipo de tinta ou marca\n`;
        resposta += `📐 *Calcular quantidade* - Me passa a metragem\n`;
        resposta += `🎨 *Sugestão de cores* - Me diz o ambiente\n`;
        resposta += `📋 *Fazer orçamento* - Monto pra você\n`;
        resposta += `❓ *Tirar dúvidas* - Pode perguntar!\n\n`;

        resposta += `É só me contar o que você precisa! 😊`;

        return resposta;
    }
}

export { GeradorRespostasTintas };
export default GeradorRespostasTintas;
