/**
 * Recomendador de Tintas
 * Busca e recomenda produtos baseado nas necessidades do cliente
 * VendeAI - Sistema de Automação WhatsApp com IA
 */

import axios from 'axios';

class RecomendadorTintas {
    constructor(config) {
        this.config = config;
        this.apiUrl = config.backendUrl || 'http://localhost:5000';
        this.empresaId = config.empresaId;
    }

    /**
     * Busca produtos de tinta
     */
    async buscarProdutos(parametros) {
        console.log(`[RecomendadorTintas] Buscando produtos com:`, parametros);

        try {
            const response = await axios.get(`${this.apiUrl}/api/bot/tintas/produtos`, {
                params: {
                    empresa_id: this.empresaId,
                    tipo: parametros.tipo_tinta,
                    ambiente: parametros.ambiente,
                    marca: parametros.marca,
                    busca: parametros.busca
                },
                timeout: 10000
            });

            const produtos = response.data.produtos || [];

            if (produtos.length === 0) {
                return {
                    texto: 'No momento não encontrei esse produto específico em estoque. 🔍\n\nPosso te ajudar com uma alternativa? Me conta mais sobre o que você precisa pintar!',
                    produtos: []
                };
            }

            // Formatar resposta
            let texto = `Encontrei ${produtos.length} opção(ões) pra você! 🎨\n\n`;

            produtos.slice(0, 5).forEach((p, i) => {
                texto += `*${i + 1}. ${p.nome}*`;
                if (p.marca) texto += ` (${p.marca})`;
                texto += `\n`;

                if (p.tipo) texto += `   • Tipo: ${p.tipo}`;
                if (p.acabamento) texto += ` ${p.acabamento}`;
                texto += `\n`;

                if (p.ambiente) texto += `   • Ambiente: ${p.ambiente}\n`;
                if (p.rendimento_m2_litro) texto += `   • Rendimento: ${p.rendimento_m2_litro}m²/L\n`;

                if (p.tamanhos_precos) {
                    const precos = Object.entries(p.tamanhos_precos)
                        .filter(([, preco]) => preco > 0)
                        .map(([tam, preco]) => `${tam}: R$${preco.toFixed(2)}`)
                        .join(' | ');
                    if (precos) texto += `   • Preços: ${precos}\n`;
                }
                texto += '\n';
            });

            texto += `\nQuer mais detalhes de algum? Posso calcular a quantidade que você vai precisar! 📐`;

            return { texto, produtos };

        } catch (error) {
            console.error('[RecomendadorTintas] Erro ao buscar:', error.message);
            return {
                texto: 'Deixa eu verificar nosso catálogo... Um momento! 🔄',
                produtos: [],
                erro: error.message
            };
        }
    }

    /**
     * Compara produtos
     */
    async compararProdutos(parametros) {
        const { marca, tipo_tinta } = parametros;

        let texto = `📊 *Comparação de Tintas*\n\n`;

        // Comparações genéricas se não tiver produtos específicos
        if (tipo_tinta === 'acrilica' || tipo_tinta === 'latex') {
            texto += `*Acrílica vs Látex:*\n\n`;
            texto += `🎨 *Tinta Acrílica:*\n`;
            texto += `• Maior durabilidade e resistência\n`;
            texto += `• Ideal para áreas externas e molhadas\n`;
            texto += `• Mais fácil de limpar\n`;
            texto += `• Preço um pouco maior\n\n`;

            texto += `🪣 *Tinta Látex:*\n`;
            texto += `• Boa relação custo-benefício\n`;
            texto += `• Indicada para áreas internas\n`;
            texto += `• Secagem rápida\n`;
            texto += `• Preço mais acessível\n\n`;

            texto += `💡 *Minha sugestão:* Para ambientes internos com pouco contato com umidade, látex resolve bem. Para áreas externas ou banheiros/cozinhas, invista em acrílica!`;
        } else {
            texto += `Me conta quais produtos você quer comparar que eu te ajudo! 😊`;
        }

        return { texto };
    }

    /**
     * Informa preços
     */
    async informarPrecos(parametros) {
        try {
            const response = await axios.get(`${this.apiUrl}/api/bot/tintas/produtos`, {
                params: {
                    empresa_id: this.empresaId,
                    tipo: parametros.tipo_tinta,
                    marca: parametros.marca
                },
                timeout: 10000
            });

            const produtos = response.data.produtos || [];

            if (produtos.length === 0) {
                return {
                    texto: 'Me conta qual produto você quer saber o preço? Tenho várias marcas disponíveis! 😊'
                };
            }

            let texto = `💰 *Preços Atualizados:*\n\n`;

            produtos.slice(0, 3).forEach(p => {
                texto += `*${p.nome}* ${p.marca ? `(${p.marca})` : ''}\n`;
                if (p.tamanhos_precos) {
                    Object.entries(p.tamanhos_precos).forEach(([tam, preco]) => {
                        if (preco > 0) {
                            texto += `   ${tam}: *R$ ${preco.toFixed(2)}*\n`;
                        }
                    });
                }
                texto += '\n';
            });

            texto += `\n📦 Frete grátis acima de R$ ${this.config.freteGratisAcima || 500}!`;

            return { texto, produtos };

        } catch (error) {
            return {
                texto: 'Deixa eu verificar os preços... Qual produto específico você quer? 🤔'
            };
        }
    }
}

export { RecomendadorTintas };
export default RecomendadorTintas;
