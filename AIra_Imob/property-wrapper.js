
import fs from 'fs';
import path from 'path';

const PROPERTIES_DB_PATH = path.resolve('../Databases/properties.json');

let propertiesData = [];
try {
    const data = fs.readFileSync(PROPERTIES_DB_PATH, 'utf8');
    propertiesData = JSON.parse(data);
} catch (error) {
    console.error('Erro ao carregar properties.json:', error);
}

function normalizar(texto) {
    if (!texto) return '';
    return texto
        .toLowerCase()
        .normalize('NFD')
        .replace(/\u0300-\u036f/g, '')
        .trim();
}

function stringSimilar(str1, str2) {
    const s1 = normalizar(str1);
    const s2 = normalizar(str2);
    if (s1 === s2) return true;
    if (s1.includes(s2) || s2.includes(s1)) return true;
    const words1 = s1.split(/\s+/);
    const words2 = s2.split(/\s+/);
    const commonWords = words1.filter(w => words2.includes(w));
    const similarity = commonWords.length / Math.max(words1.length, words2.length);
    return similarity >= 0.6;
}

export async function consultarImovel(params) {
    console.log(`\n🔍 [IMOVEL] Iniciando consulta...`);
    console.log(`   Parâmetros: ${JSON.stringify(params)}`);

    let resultados = propertiesData.filter(imovel => {
        let match = true;

        if (params.property_type && !stringSimilar(imovel.property_type, params.property_type)) {
            match = false;
        }
        if (params.finalidade && !stringSimilar(imovel.finalidade, params.finalidade)) {
            match = false;
        }
        if (params.cidade && !stringSimilar(imovel.endereco.cidade, params.cidade)) {
            match = false;
        }
        if (params.bairro && !stringSimilar(imovel.endereco.bairro, params.bairro)) {
            match = false;
        }
        if (params.min_quartos && imovel.quartos < params.min_quartos) {
            match = false;
        }
        if (params.max_preco && imovel.preco > params.max_preco) {
            match = false;
        }
        if (params.comodidades && params.comodidades.length > 0) {
            for (const comodidade of params.comodidades) {
                if (!imovel.comodidades.some(c => stringSimilar(c, comodidade))) {
                    match = false;
                    break;
                }
            }
        }
        return match;
    });

    if (resultados.length === 0) {
        console.log(`❌ [IMOVEL] Nenhum imóvel encontrado para os critérios.`);
        return {
            erro: true,
            erro_tipo: 'nao_encontrado',
            info: 'Não encontrei nenhum imóvel com esses critérios. Tente ajustar sua busca.',
            pedir_detalhes: true,
            detalhes_necessarios: 'tipo de imóvel, cidade, bairro, número de quartos ou faixa de preço.'
        };
    }

    console.log(`✅ [IMOVEL] ${resultados.length} imóvel(is) encontrado(s).`);
    return {
        sucesso: true,
        imoveis: resultados.slice(0, 5), // Retorna os primeiros 5 para exemplo
        total_encontrados: resultados.length
    };
}

export async function compararComMercado(property_id, preco_informado) {
    console.log(`\n📊 [IMOVEL] Comparando preço de mercado para o imóvel ID: ${property_id}`);

    const imovel = propertiesData.find(p => p.property_id === property_id);
    if (!imovel) {
        return {
            erro: true,
            info: 'Imóvel não encontrado no banco de dados.'
        };
    }

    // Simular valor de mercado baseado no tipo e localização
    // Esta é uma simulação simples. Em um sistema real, usaria dados de mercado mais complexos.
    let valorMercadoBase = imovel.preco;
    let variacao = random.uniform(-0.15, 0.15); // Variação de -15% a +15%
    let valorMercado = valorMercadoBase * (1 + variacao);

    const diferenca = preco_informado - valorMercado;
    const percentualDiferenca = ((diferenca / valorMercado) * 100).toFixed(2);

    let avaliacao;
    let emoji;

    if (diferenca < -valorMercado * 0.05) { // Mais de 5% abaixo
        avaliacao = 'Excelente oportunidade! Muito abaixo do valor de mercado.';
        emoji = '🟢';
    } else if (diferenca < 0) { // Abaixo do mercado
        avaliacao = 'Bom negócio! Abaixo do valor de mercado.';
        emoji = '🟢';
    } else if (diferenca <= valorMercado * 0.02) { // Até 2% acima
        avaliacao = 'Preço justo, alinhado com o mercado.';
        emoji = '🟡';
    } else if (diferenca <= valorMercado * 0.07) { // Até 7% acima
        avaliacao = 'Levemente acima do valor de mercado.';
        emoji = '🟠';
    } else { // Mais de 7% acima
        avaliacao = 'Acima do valor de mercado.';
        emoji = '🔴';
    }

    return {
        sucesso: true,
        property_id: imovel.property_id,
        preco_informado: preco_informado,
        valor_mercado_estimado: valorMercado,
        diferenca: diferenca,
        percentual_diferenca: percentualDiferenca,
        avaliacao: avaliacao,
        emoji: emoji,
        esta_abaixo_mercado: diferenca < 0,
        esta_acima_mercado: diferenca > 0
    };
}

export async function buscarDetalhesPersuasaoImovel(property_id, preco_informado = null) {
    console.log(`\n🎯 [IMOVEL] Buscando detalhes para persuasão do imóvel ID: ${property_id}`);

    const imovel = propertiesData.find(p => p.property_id === property_id);
    if (!imovel) {
        return {
            erro: true,
            mensagem_para_cliente: 'Não consegui encontrar os detalhes desse imóvel.',
            sugestao: 'Posso procurar por outros imóveis semelhantes?'
        };
    }

    const comparacaoMercado = await compararComMercado(property_id, preco_informado || imovel.preco);

    const pontosFortes = [
        `Localização privilegiada em ${imovel.endereco.bairro}`,
        `Ampla metragem de ${imovel.metragem}m²`,
        `${imovel.quartos} quartos espaçosos`,
        `Design moderno e acabamentos de alta qualidade`,
        `Área de lazer completa com ${imovel.comodidades.join(', ').toLowerCase()}`
    ];

    const argumentosVenda = [
        { tipo: 'Localização', titulo: 'Ponto Estratégico', texto: `Este imóvel está situado em ${imovel.endereco.bairro}, uma região com excelente infraestrutura e fácil acesso a tudo que você precisa.` },
        { tipo: 'Espaço', titulo: 'Conforto e Amplitude', texto: `Com ${imovel.metragem}m² e ${imovel.quartos} quartos, você terá todo o espaço e conforto para sua família.` },
        { tipo: 'Lazer', titulo: 'Qualidade de Vida', texto: `Desfrute de uma área de lazer completa, incluindo ${imovel.comodidades.join(', ').toLowerCase()}, perfeita para relaxar e se divertir.` },
        { tipo: 'Investimento', titulo: 'Valorização Garantida', texto: `Imóveis nesta região têm apresentado constante valorização, garantindo um excelente retorno sobre seu investimento.` }
    ];

    if (comparacaoMercado.esta_abaixo_mercado) {
        argumentosVenda.unshift({ tipo: 'Oportunidade', titulo: 'Preço Imperdível', texto: `Além de todas as qualidades, este imóvel está ${comparacaoMercado.avaliacao.toLowerCase()}! Uma verdadeira oportunidade.` });
    }

    const sugestoesConversa = [
        'Destacar a localização e as comodidades do imóvel.',
        'Mencionar a avaliação de preço de mercado.',
        'Perguntar sobre as prioridades do cliente para o novo lar.'
    ];

    return {
        sucesso: true,
        resumo: {
            tipo_imovel: imovel.property_type,
            localizacao: `${imovel.endereco.bairro}, ${imovel.endereco.cidade}`,
            preco: imovel.preco,
            metragem: imovel.metragem,
            pontos_fortes_top3: pontosFortes.slice(0, 3),
            avaliacao_mercado: comparacaoMercado.avaliacao
        },
        imovel: imovel,
        comparacao_mercado: comparacaoMercado,
        argumentos_venda: argumentosVenda,
        sugestoes_conversa: sugestoesConversa
    };
}

