/**
 * Consultor de Cores
 * Sugere cores e combinações para ambientes
 * VendeAI - Sistema de Automação WhatsApp com IA
 */

import axios from 'axios';

class ConsultorCores {
    constructor(config) {
        this.config = config;
        this.apiUrl = config.backendUrl || 'http://localhost:5000';
        this.empresaId = config.empresaId;

        // Sugestões de cores por ambiente
        this.sugestoesPorAmbiente = {
            quarto: {
                principais: ['azul serenidade', 'verde menta', 'bege areia', 'lavanda'],
                destaques: ['azul petroleo', 'terracota', 'mostarda'],
                dica: 'Cores suaves ajudam a relaxar e dormir melhor'
            },
            sala: {
                principais: ['branco gelo', 'cinza claro', 'bege', 'off-white'],
                destaques: ['azul marinho', 'verde escuro', 'terracota'],
                dica: 'Tons neutros ampliam o ambiente e combinam com qualquer decoração'
            },
            cozinha: {
                principais: ['branco', 'amarelo claro', 'verde menta'],
                destaques: ['vermelho', 'azul', 'laranja'],
                dica: 'Cores claras transmitem limpeza e higiene'
            },
            banheiro: {
                principais: ['branco', 'azul claro', 'verde água'],
                destaques: ['azul turquesa', 'verde esmeralda'],
                dica: 'Tons de azul e verde remetem à água e frescor'
            },
            escritorio: {
                principais: ['branco', 'cinza claro', 'azul acinzentado'],
                destaques: ['verde escuro', 'azul marinho'],
                dica: 'Cores neutras aumentam o foco e a produtividade'
            },
            fachada: {
                principais: ['branco', 'bege', 'cinza', 'palha'],
                destaques: ['marrom', 'verde musgo', 'azul escuro'],
                dica: 'Cores claras refletem calor e mantêm a casa mais fresca'
            }
        };

        // Cores tendência 2024/2025
        this.coresTendencia = [
            { nome: 'Peach Fuzz', hex: '#FFBE98', descricao: 'Cor do ano Pantone 2024' },
            { nome: 'Terracota', hex: '#E07A5F', descricao: 'Aconchegante e terroso' },
            { nome: 'Verde Sálvia', hex: '#9DC183', descricao: 'Natureza e bem-estar' },
            { nome: 'Azul Profundo', hex: '#003366', descricao: 'Elegância e sofisticação' },
            { nome: 'Off-White', hex: '#FAF9F6', descricao: 'Clássico e atemporal' }
        ];
    }

    /**
     * Sugere cores baseado nos parâmetros
     */
    async sugerir(parametros) {
        const { ambiente, estilo, cor } = parametros;

        // Buscar cores da paleta da empresa
        let coresDisponiveis = [];
        try {
            const response = await axios.get(`${this.apiUrl}/api/bot/tintas/cores`, {
                params: { empresa_id: this.empresaId },
                timeout: 10000
            });
            coresDisponiveis = response.data.cores || [];
        } catch (e) {
            console.log('[ConsultorCores] Usando sugestões padrão');
        }

        let texto = '';

        // Se perguntou sobre um ambiente específico
        if (ambiente) {
            const ambienteLower = ambiente.toLowerCase();
            const sugestao = this.sugestoesPorAmbiente[ambienteLower] ||
                           this.sugestoesPorAmbiente['sala'];

            texto = `🎨 *Sugestões de cores para ${ambiente}*\n\n`;

            texto += `*Cores principais (paredes):*\n`;
            sugestao.principais.forEach(c => {
                texto += `   • ${c.charAt(0).toUpperCase() + c.slice(1)}\n`;
            });

            texto += `\n*Cores de destaque (parede de destaque/detalhes):*\n`;
            sugestao.destaques.forEach(c => {
                texto += `   • ${c.charAt(0).toUpperCase() + c.slice(1)}\n`;
            });

            texto += `\n💡 *Dica:* ${sugestao.dica}\n`;

        } else if (cor) {
            // Se mencionou uma cor específica
            texto = await this.sugerirCombinacoesParaCor(cor);

        } else {
            // Sugestão geral / tendências
            texto = `🎨 *Cores em Alta 2024/2025*\n\n`;

            this.coresTendencia.forEach(c => {
                texto += `• *${c.nome}*\n`;
                texto += `  ${c.descricao}\n\n`;
            });

            texto += `Quer sugestões para algum ambiente específico? Me conta qual cômodo você vai pintar! 🏠`;
        }

        // Adicionar cores disponíveis na loja se tiver
        if (coresDisponiveis.length > 0) {
            texto += `\n\n📍 *Cores disponíveis na loja:*\n`;
            coresDisponiveis.slice(0, 5).forEach(c => {
                const tendencia = c.tendencia ? ' ⭐' : '';
                texto += `   • ${c.nome}${tendencia}\n`;
            });
        }

        return {
            texto,
            cores_sugeridas: coresDisponiveis
        };
    }

    /**
     * Sugere combinações para uma cor específica
     */
    async sugerirCombinacoesParaCor(corPrincipal) {
        const combinacoes = {
            'branco': ['cinza', 'azul marinho', 'preto', 'madeira'],
            'bege': ['marrom', 'terracota', 'verde', 'azul'],
            'cinza': ['amarelo', 'rosa', 'azul', 'branco'],
            'azul': ['branco', 'bege', 'dourado', 'cinza'],
            'verde': ['branco', 'bege', 'madeira', 'rosa'],
            'rosa': ['cinza', 'branco', 'dourado', 'verde'],
            'amarelo': ['cinza', 'branco', 'azul marinho', 'preto'],
            'terracota': ['bege', 'verde oliva', 'branco', 'madeira']
        };

        const corLower = corPrincipal.toLowerCase();
        const combina = combinacoes[corLower] || ['branco', 'bege', 'cinza'];

        let texto = `🎨 *Cores que combinam com ${corPrincipal}*\n\n`;

        texto += `O ${corPrincipal} fica lindo com:\n`;
        combina.forEach((c, i) => {
            texto += `   ${i + 1}. ${c.charAt(0).toUpperCase() + c.slice(1)}\n`;
        });

        texto += `\n💡 *Dica de decoração:*\n`;
        texto += `Use a cor principal em 60% das paredes, uma cor secundária em 30%, e deixe 10% para uma cor de destaque nos detalhes!\n`;

        texto += `\nQuer ver opções de tintas nessas cores? 🖌️`;

        return texto;
    }

    /**
     * Retorna cores tendência
     */
    getCoresTendencia() {
        return this.coresTendencia;
    }
}

export { ConsultorCores };
export default ConsultorCores;
