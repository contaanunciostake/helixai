/**
 * 🚗 API FIPE v2 - Consulta Tabela FIPE de Veículos
 *
 * Documentação oficial: https://fipe.online/docs/api/fipe
 *
 * API v2 Endpoints (com autenticação):
 * - Base: https://fipe.parallelum.com.br/api/v2
 * - Marcas: /cars/brands
 * - Modelos: /cars/brands/{id}/models
 * - Anos: /cars/brands/{id}/models/{id}/years
 * - Valor: /cars/brands/{id}/models/{id}/years/{id}
 *
 * ⚠️ IMPORTANTE: Requer token de assinatura (fipe.online)
 * Header: X-Subscription-Token
 */

import axios from 'axios';
import dotenv from 'dotenv';

// Carregar .env
dotenv.config();

const API_BASE = 'https://fipe.parallelum.com.br/api/v2';
const FIPE_TOKEN = process.env.FIPE_API_TOKEN;

// Criar instância axios com token
const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'X-Subscription-Token': FIPE_TOKEN,
    'User-Agent': 'FeiraoShowCar/1.0',
    'Accept': 'application/json'
  },
  timeout: 10000
});

// Log do status do token
if (FIPE_TOKEN) {
  console.log('🔑 [FIPE] Token de assinatura configurado');
} else {
  console.warn('⚠️ [FIPE] ATENÇÃO: Token não configurado! Rate limit: 500 req/dia');
}

/**
 * Mapeia tipo de veículo PT → EN (API v2)
 */
function mapearTipoVeiculo(tipo) {
  const mapa = {
    'carros': 'cars',
    'motos': 'motorcycles',
    'caminhoes': 'trucks',
    'caminhões': 'trucks'
  };
  return mapa[tipo.toLowerCase()] || 'cars';
}

/**
 * Normaliza string removendo acentos e colocando em lowercase
 */
function normalizar(texto) {
  if (!texto) return '';
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Verifica se duas strings são similares (fuzzy match)
 */
function stringSimilar(str1, str2) {
  const s1 = normalizar(str1);
  const s2 = normalizar(str2);

  // Exato
  if (s1 === s2) return true;

  // Contém
  if (s1.includes(s2) || s2.includes(s1)) return true;

  // Palavras em comum
  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);
  const commonWords = words1.filter(w => words2.includes(w));

  // Se tiver pelo menos 60% de palavras em comum
  const similarity = commonWords.length / Math.max(words1.length, words2.length);
  return similarity >= 0.6;
}

/**
 * Converte valor FIPE string para número
 */
function converterValorParaNumero(valorString) {
  try {
    return parseFloat(
      valorString
        .replace('R$', '')
        .replace(/\./g, '')
        .replace(',', '.')
        .trim()
    );
  } catch {
    return 0;
  }
}

/**
 * Consulta valor FIPE de um veículo (API v2)
 *
 * @param {string} marca - Nome da marca (ex: "Honda", "Volkswagen")
 * @param {string} modelo - Nome do modelo (ex: "Civic", "Gol")
 * @param {number} [ano] - Ano do veículo (opcional, usa mais recente se não informado)
 * @returns {Promise<Object>} Dados FIPE ou null se não encontrado
 */
export async function consultarValorFipe(marca, modelo, ano = null) {
  console.log(`\n🔍 [FIPE] Iniciando consulta...`);
  console.log(`   Marca: ${marca}`);
  console.log(`   Modelo: ${modelo}`);
  console.log(`   Ano: ${ano || 'mais recente'}`);

  try {
    // PASSO 1: Buscar ID da marca
    console.log(`\n📋 [FIPE] Passo 1/4: Buscando marca "${marca}"...`);
    const tipoVeiculoEN = mapearTipoVeiculo('carros');
    const { data: marcas } = await apiClient.get(`/${tipoVeiculoEN}/brands`);

    const marcaEncontrada = marcas.find(m => stringSimilar(m.name, marca));

    if (!marcaEncontrada) {
      console.log(`❌ [FIPE] Marca "${marca}" não encontrada`);
      console.log(`💡 [FIPE] Marcas disponíveis similares:`, marcas
        .filter(m => normalizar(m.name).includes(normalizar(marca).split(' ')[0]))
        .map(m => m.name)
        .slice(0, 5)
      );
      return null;
    }

    console.log(`✅ [FIPE] Marca encontrada: ${marcaEncontrada.name} (ID: ${marcaEncontrada.code})`);

    // PASSO 2: Buscar ID do modelo
    console.log(`\n📋 [FIPE] Passo 2/4: Buscando modelo "${modelo}"...`);
    const { data: modelos } = await apiClient.get(`/${tipoVeiculoEN}/brands/${marcaEncontrada.code}/models`);

    // Filtrar modelos candidatos (pode ter várias variações)
    const modelosCandidatos = modelos.filter(m => stringSimilar(m.name, modelo));

    if (modelosCandidatos.length === 0) {
      console.log(`❌ [FIPE] Modelo "${modelo}" não encontrado`);
      console.log(`💡 [FIPE] Modelos disponíveis similares:`, modelos
        .filter(m => normalizar(m.name).includes(normalizar(modelo).split(' ')[0]))
        .map(m => m.name)
        .slice(0, 5)
      );
      return null;
    }

    console.log(`✅ [FIPE] ${modelosCandidatos.length} variação(ões) de "${modelo}" encontrada(s)`);

    // PASSO 3: ITERAR pelas variações até encontrar o ano desejado
    console.log(`\n📋 [FIPE] Passo 3/4: Buscando ano ${ano || 'mais recente'} nas variações...`);

    let dadosFipe = null;
    let anoEscolhido = null;

    for (const modeloVariacao of modelosCandidatos) {
      const { data: anos } = await apiClient.get(
        `/${tipoVeiculoEN}/brands/${marcaEncontrada.code}/models/${modeloVariacao.code}/years`
      );

      // Buscar ano específico
      if (ano) {
        anoEscolhido = anos.find(a => a.code.includes(String(ano)) || a.name.includes(String(ano)));

        if (anoEscolhido) {
          console.log(`✅ [FIPE] Ano ${ano} encontrado em: ${modeloVariacao.name}`);
          console.log(`   Código ano: ${anoEscolhido.code} (${anoEscolhido.name})`);

          // PASSO 4: Buscar valor FIPE
          console.log(`\n📋 [FIPE] Passo 4/4: Buscando valor FIPE...`);
          const { data: dados } = await apiClient.get(
            `/${tipoVeiculoEN}/brands/${marcaEncontrada.code}/models/${modeloVariacao.code}/years/${anoEscolhido.code}`
          );
          dadosFipe = dados;
          break; // Encontrou! Parar busca
        }
      } else {
        // Se não especificou ano, usar primeiro modelo com ano mais recente
        if (anos.length > 0) {
          anoEscolhido = anos[0];
          console.log(`✅ [FIPE] Usando ano mais recente: ${anoEscolhido.name} em ${modeloVariacao.name}`);

          const { data: dados } = await apiClient.get(
            `/${tipoVeiculoEN}/brands/${marcaEncontrada.code}/models/${modeloVariacao.code}/years/${anoEscolhido.code}`
          );
          dadosFipe = dados;
          break;
        }
      }
    }

    if (!dadosFipe) {
      console.log(`❌ [FIPE] Ano ${ano} não encontrado em nenhuma variação de "${modelo}"`);
      console.log(`💡 [FIPE] Tente especificar a versão (ex: "Gol 1.0", "Gol 1.6")`);
      return null;
    }

    console.log(`✅ [FIPE] Consulta concluída com sucesso!`);
    console.log(`💰 [FIPE] Valor: ${dadosFipe.price}`);

    // Formatar resposta (mantendo compatibilidade com formato v1)
    const resultado = {
      sucesso: true,
      marca: dadosFipe.brand,
      modelo: dadosFipe.model,
      ano: dadosFipe.modelYear,
      ano_modelo: dadosFipe.modelYear,
      valor: dadosFipe.price,
      valor_formatado: dadosFipe.price,
      valor_numerico: converterValorParaNumero(dadosFipe.price),
      combustivel: dadosFipe.fuel,
      codigo_fipe: dadosFipe.codeFipe,
      mes_referencia: dadosFipe.referenceMonth,
      tipo_veiculo: dadosFipe.vehicleType,
      sigla_combustivel: dadosFipe.fuelAcronym,
      historico_precos: dadosFipe.priceHistory || []
    };

    console.log(`\n✅ [FIPE] Resultado final:`, JSON.stringify(resultado, null, 2));

    return resultado;

  } catch (error) {
    console.error(`\n❌ [FIPE] Erro ao consultar:`, error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Dados:`, error.response.data);
    }
    return null;
  }
}

/**
 * Compara preço de venda com valor FIPE
 *
 * @param {string} marca - Nome da marca
 * @param {string} modelo - Nome do modelo
 * @param {number} ano - Ano do veículo
 * @param {number} precoVenda - Preço de venda do veículo
 * @returns {Promise<Object>} Comparação ou null se não encontrado
 */
export async function compararComFipe(marca, modelo, ano, precoVenda) {
  console.log(`\n📊 [FIPE] Comparando preço...`);

  try {
    const dadosFipe = await consultarValorFipe(marca, modelo, ano);

    if (!dadosFipe) {
      return null;
    }

    const valorFipe = dadosFipe.valor_numerico;
    const diferenca = precoVenda - valorFipe;
    const percentualDiferenca = ((diferenca / valorFipe) * 100).toFixed(2);

    let avaliacao;
    let emoji;

    if (diferenca < -5000) {
      avaliacao = 'Excelente negócio! Muito abaixo da FIPE';
      emoji = '🟢';
    } else if (diferenca < 0) {
      avaliacao = 'Bom negócio! Abaixo da FIPE';
      emoji = '🟢';
    } else if (diferenca <= 5000) {
      avaliacao = 'Preço justo, próximo da FIPE';
      emoji = '🟡';
    } else if (diferenca <= 10000) {
      avaliacao = 'Levemente acima da FIPE';
      emoji = '🟠';
    } else {
      avaliacao = 'Acima da FIPE';
      emoji = '🔴';
    }

    const resultado = {
      sucesso: true,
      ...dadosFipe,
      preco_venda: precoVenda,
      preco_venda_formatado: `R$ ${precoVenda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      diferenca: diferenca,
      diferenca_formatada: `R$ ${Math.abs(diferenca).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      percentual_diferenca: percentualDiferenca,
      avaliacao: avaliacao,
      emoji: emoji,
      esta_abaixo_fipe: diferenca < 0,
      esta_acima_fipe: diferenca > 0
    };

    console.log(`✅ [FIPE] Comparação concluída:`);
    console.log(`   Valor FIPE: R$ ${valorFipe.toLocaleString('pt-BR')}`);
    console.log(`   Preço venda: R$ ${precoVenda.toLocaleString('pt-BR')}`);
    console.log(`   Diferença: ${percentualDiferenca}% ${emoji}`);
    console.log(`   Avaliação: ${avaliacao}`);

    return resultado;

  } catch (error) {
    console.error(`❌ [FIPE] Erro ao comparar:`, error.message);
    return null;
  }
}

/**
 * Lista todas as marcas disponíveis (API v2)
 *
 * @param {string} [tipoVeiculo='carros'] - 'carros', 'motos' ou 'caminhoes'
 * @returns {Promise<Array>} Lista de marcas
 */
export async function listarMarcas(tipoVeiculo = 'carros') {
  console.log(`\n📋 [FIPE] Listando marcas de ${tipoVeiculo}...`);

  try {
    const tipoVeiculoEN = mapearTipoVeiculo(tipoVeiculo);
    const { data: marcas } = await apiClient.get(`/${tipoVeiculoEN}/brands`);

    console.log(`✅ [FIPE] ${marcas.length} marcas encontradas`);

    return marcas.map(m => ({
      codigo: m.code,
      nome: m.name
    }));

  } catch (error) {
    console.error(`❌ [FIPE] Erro ao listar marcas:`, error.message);
    return [];
  }
}

/**
 * 🎯 BUSCA DETALHES TÉCNICOS COMPLETOS PARA PERSUASÃO
 *
 * Retorna dados FIPE + especificações técnicas + argumentos de venda
 * para uso em conversas persuasivas
 *
 * @param {string} marca - Nome da marca
 * @param {string} modelo - Nome do modelo
 * @param {number} [ano] - Ano do veículo (opcional)
 * @param {number} [precoVenda] - Preço de venda para comparação (opcional)
 * @returns {Promise<Object>} Detalhes completos para persuasão
 */
export async function buscarDetalhesPersuasao(marca, modelo, ano = null, precoVenda = null) {
  console.log(`\n🎯 [FIPE-PERSUASAO] Buscando detalhes completos...`);
  console.log(`   Marca: ${marca}`);
  console.log(`   Modelo: ${modelo}`);
  console.log(`   Ano: ${ano || 'mais recente'}`);

  try {
    // 1. Buscar dados FIPE
    const dadosFipe = await consultarValorFipe(marca, modelo, ano);

    if (!dadosFipe) {
      console.log(`❌ [FIPE-PERSUASAO] Não foi possível buscar dados FIPE`);
      return {
        sucesso: false,
        erro: 'Veículo não encontrado na tabela FIPE',
        mensagem_para_cliente: 'Não consegui encontrar esse modelo específico na tabela FIPE. Pode me passar mais detalhes como o ano ou versão?'
      };
    }

    // 2. Enriquecer com especificações técnicas básicas (base de conhecimento)
    const especsTecnicas = obterEspecificacoesTecnicas(marca, modelo);

    // 3. Calcular argumentos de venda
    const argumentosVenda = gerarArgumentosVenda(dadosFipe, especsTecnicas, precoVenda);

    // 4. Analisar valorização/depreciação
    const analiseValorizacao = analisarValorizacao(dadosFipe);

    // 5. Montar resultado completo
    const resultado = {
      sucesso: true,

      // DADOS FIPE
      dados_fipe: {
        marca: dadosFipe.marca,
        modelo: dadosFipe.modelo,
        ano: dadosFipe.ano,
        combustivel: dadosFipe.combustivel,
        valor_fipe: dadosFipe.valor_formatado,
        valor_fipe_numerico: dadosFipe.valor_numerico,
        codigo_fipe: dadosFipe.codigo_fipe,
        mes_referencia: dadosFipe.mes_referencia
      },

      // ESPECIFICAÇÕES TÉCNICAS
      especificacoes_tecnicas: especsTecnicas,

      // ARGUMENTOS DE VENDA PRONTOS
      argumentos_venda: argumentosVenda,

      // ANÁLISE DE VALORIZAÇÃO
      analise_valorizacao: analiseValorizacao,

      // COMPARAÇÃO COM PREÇO DE VENDA (se fornecido)
      comparacao_preco: precoVenda ? compararPreco(dadosFipe.valor_numerico, precoVenda) : null,

      // SUGESTÕES PARA A IA USAR
      sugestoes_conversa: gerarSugestoesConversa(dadosFipe, especsTecnicas, precoVenda)
    };

    console.log(`✅ [FIPE-PERSUASAO] Detalhes completos gerados com sucesso!`);
    return resultado;

  } catch (error) {
    console.error(`❌ [FIPE-PERSUASAO] Erro:`, error.message);
    return {
      sucesso: false,
      erro: error.message,
      mensagem_para_cliente: 'Tive um problema ao buscar os detalhes técnicos. Mas posso te ajudar com as informações que já tenho aqui!'
    };
  }
}

/**
 * Obtém especificações técnicas básicas de modelos conhecidos
 * (base de conhecimento interna + padrões da marca)
 */
function obterEspecificacoesTecnicas(marca, modelo) {
  const marcaLower = normalizar(marca);
  const modeloLower = normalizar(modelo);

  // Base de conhecimento de especificações comuns
  const baseConhecimento = {
    // HONDA
    'honda_civic': {
      tipo: 'Sedã médio',
      categoria: 'Premium',
      pontos_fortes: ['Consumo econômico', 'Revenda alta', 'Confiabilidade Honda', 'Espaço interno'],
      motor_comum: '1.5 Turbo ou 2.0',
      cambio_comum: 'CVT ou Manual',
      consumo_medio: '12-15 km/l (cidade)',
      publico_alvo: 'Executivos, profissionais liberais',
      diferenciais: ['Design esportivo', 'Tecnologia embarcada', 'Baixo custo de manutenção']
    },
    'honda_fit': {
      tipo: 'Hatch compacto',
      categoria: 'Urbano',
      pontos_fortes: ['Espaço interno (Banco Mágico)', 'Consumo excelente', 'Versatilidade'],
      motor_comum: '1.5 i-VTEC',
      cambio_comum: 'CVT ou Manual',
      consumo_medio: '14-16 km/l (cidade)',
      publico_alvo: 'Jovens, famílias pequenas',
      diferenciais: ['Banco Mágico Honda', 'Porta-malas amplo', 'Revenda garantida']
    },

    // VOLKSWAGEN
    'volkswagen_gol': {
      tipo: 'Hatch popular',
      categoria: 'Entrada',
      pontos_fortes: ['Peças baratas', 'Manutenção fácil', 'Carro popular #1 do Brasil'],
      motor_comum: '1.0 ou 1.6',
      cambio_comum: 'Manual',
      consumo_medio: '12-14 km/l (cidade)',
      publico_alvo: 'Primeiro carro, uso urbano',
      diferenciais: ['Peças abundantes', 'Mecânicos em qualquer lugar', 'Custo-benefício']
    },
    'volkswagen_polo': {
      tipo: 'Hatch médio',
      categoria: 'Intermediário',
      pontos_fortes: ['Qualidade alemã', 'Conforto superior', 'Segurança 5 estrelas'],
      motor_comum: '1.0 TSI Turbo ou 1.6 MSI',
      cambio_comum: 'Automático ou Manual',
      consumo_medio: '13-15 km/l (cidade)',
      publico_alvo: 'Famílias, uso misto',
      diferenciais: ['Suspensão confortável', 'Acabamento premium', 'Tecnologia VW']
    },

    // CHEVROLET
    'chevrolet_onix': {
      tipo: 'Hatch compacto',
      categoria: 'Popular',
      pontos_fortes: ['Líder de vendas', 'Custo-benefício', 'Rede de assistência'],
      motor_comum: '1.0 Turbo ou 1.0 Aspirado',
      cambio_comum: 'Automático ou Manual',
      consumo_medio: '13-15 km/l (cidade)',
      publico_alvo: 'Uso diário, famílias',
      diferenciais: ['MyLink multimídia', 'Conectividade OnStar', 'Peças acessíveis']
    },

    // TOYOTA
    'toyota_corolla': {
      tipo: 'Sedã médio',
      categoria: 'Premium',
      pontos_fortes: ['Durabilidade lendária', 'Revenda altíssima', 'Baixíssima depreciação'],
      motor_comum: '2.0 Flex ou Híbrido',
      cambio_comum: 'CVT',
      consumo_medio: '11-13 km/l (cidade) - Híbrido: 17 km/l',
      publico_alvo: 'Executivos, empresários',
      diferenciais: ['Confiabilidade Toyota', 'Manutenção previsível', 'Tecnologia híbrida']
    },

    // FIAT
    'fiat_argo': {
      tipo: 'Hatch compacto',
      categoria: 'Intermediário',
      pontos_fortes: ['Design moderno', 'Motor Firefly eficiente', 'Dirigibilidade ágil'],
      motor_comum: '1.0 ou 1.3 Firefly',
      cambio_comum: 'Manual ou Automático',
      consumo_medio: '13-15 km/l (cidade)',
      publico_alvo: 'Jovens, uso urbano',
      diferenciais: ['Design italiano', 'Motor moderno', 'Uconnect multimídia']
    },

    // JEEP
    'jeep_compass': {
      tipo: 'SUV médio',
      categoria: 'Premium',
      pontos_fortes: ['Status 4x4', 'Espaço interno', 'Capacidade off-road'],
      motor_comum: '1.3 Turbo ou 2.0 Diesel',
      cambio_comum: 'Automático 6 ou 9 marchas',
      consumo_medio: '10-12 km/l (cidade)',
      publico_alvo: 'Aventureiros, famílias grandes',
      diferenciais: ['Tração 4x4', 'Design icônico Jeep', 'Tecnologia Uconnect']
    },
    'jeep_renegade': {
      tipo: 'SUV compacto',
      categoria: 'Urbano/Aventura',
      pontos_fortes: ['Compacto mas robusto', '4x4 verdadeiro', 'Design único'],
      motor_comum: '1.8 Flex ou 2.0 Diesel',
      cambio_comum: 'Automático',
      consumo_medio: '9-11 km/l (cidade)',
      publico_alvo: 'Jovens aventureiros',
      diferenciais: ['Tração 4x4 Low', 'Personalização interior', 'Som Premium']
    }
  };

  // Tentar encontrar match exato
  const chave = `${marcaLower}_${modeloLower.split(' ')[0]}`;
  if (baseConhecimento[chave]) {
    return baseConhecimento[chave];
  }

  // Fallback: especificações genéricas baseadas na marca
  const especsGenericas = {
    tipo: 'Veículo de passeio',
    categoria: 'Não especificada',
    pontos_fortes: ['Veículo confiável', 'Boa escolha para uso diário'],
    motor_comum: 'Consulte a ficha técnica',
    cambio_comum: 'Manual ou Automático',
    consumo_medio: 'Varia conforme versão',
    publico_alvo: 'Diversos públicos',
    diferenciais: ['Consulte especificações completas na loja']
  };

  // Ajustar por marca conhecida
  if (marcaLower.includes('toyota')) {
    especsGenericas.pontos_fortes.push('Durabilidade Toyota');
    especsGenericas.pontos_fortes.push('Alta revenda');
  } else if (marcaLower.includes('honda')) {
    especsGenericas.pontos_fortes.push('Confiabilidade Honda');
    especsGenericas.pontos_fortes.push('Baixo consumo');
  } else if (marcaLower.includes('volkswagen') || marcaLower.includes('vw')) {
    especsGenericas.pontos_fortes.push('Qualidade alemã');
    especsGenericas.pontos_fortes.push('Segurança');
  }

  return especsGenericas;
}

/**
 * Gera argumentos de venda prontos baseados nos dados
 */
function gerarArgumentosVenda(dadosFipe, especsTecnicas, precoVenda) {
  const argumentos = [];

  // Argumento 1: Valor FIPE
  argumentos.push({
    tipo: 'valor_fipe',
    titulo: '💰 Valor de Mercado Garantido',
    argumento: `Este ${dadosFipe.modelo} ${dadosFipe.ano} está na tabela FIPE por ${dadosFipe.valor_formatado}. Isso garante que você está fazendo um investimento seguro com valor de mercado reconhecido.`
  });

  // Argumento 2: Pontos fortes do modelo
  if (especsTecnicas.pontos_fortes && especsTecnicas.pontos_fortes.length > 0) {
    argumentos.push({
      tipo: 'pontos_fortes',
      titulo: '✅ Vantagens Comprovadas',
      argumento: `Este modelo se destaca por: ${especsTecnicas.pontos_fortes.slice(0, 3).join(', ')}. São características que fazem a diferença no dia a dia!`
    });
  }

  // Argumento 3: Público-alvo específico
  if (especsTecnicas.publico_alvo) {
    argumentos.push({
      tipo: 'publico_alvo',
      titulo: '🎯 Perfeito Para Você',
      argumento: `Este carro foi projetado pensando em ${especsTecnicas.publico_alvo}. Ele atende exatamente as necessidades desse perfil!`
    });
  }

  // Argumento 4: Diferenciais técnicos
  if (especsTecnicas.diferenciais && especsTecnicas.diferenciais.length > 0) {
    argumentos.push({
      tipo: 'diferenciais',
      titulo: '🌟 Diferenciais Exclusivos',
      argumento: `Você vai ter: ${especsTecnicas.diferenciais.slice(0, 3).join(', ')}. Esses são os diferenciais que tornam este modelo único!`
    });
  }

  // Argumento 5: Comparação de preço (se fornecido)
  if (precoVenda) {
    const diferenca = precoVenda - dadosFipe.valor_numerico;
    if (diferenca < 0) {
      const economia = Math.abs(diferenca);
      argumentos.push({
        tipo: 'preco_vantajoso',
        titulo: '🟢 Oportunidade Imperdível',
        argumento: `Nosso preço de R$ ${precoVenda.toLocaleString('pt-BR')} está ${economia.toLocaleString('pt-BR')} ABAIXO da tabela FIPE! É uma economia real de ${((Math.abs(diferenca) / dadosFipe.valor_numerico) * 100).toFixed(1)}%!`
      });
    } else if (diferenca <= 5000) {
      argumentos.push({
        tipo: 'preco_justo',
        titulo: '🟡 Preço Justo de Mercado',
        argumento: `Nosso preço está alinhado com a tabela FIPE, garantindo que você não está pagando a mais. É um negócio transparente e justo!`
      });
    }
  }

  return argumentos;
}

/**
 * Analisa valorização/depreciação do veículo
 */
function analisarValorizacao(dadosFipe) {
  const anoAtual = new Date().getFullYear();
  const anoVeiculo = parseInt(dadosFipe.ano);
  const idadeVeiculo = anoAtual - anoVeiculo;

  let taxaDepreciacaoAnual = 0.12; // 12% ao ano (média mercado)

  // Ajustar taxa por marca (marcas premium depreciam menos)
  const marcaLower = normalizar(dadosFipe.marca);
  if (marcaLower.includes('toyota') || marcaLower.includes('honda')) {
    taxaDepreciacaoAnual = 0.08; // 8% ao ano (marcas que retêm valor)
  } else if (marcaLower.includes('bmw') || marcaLower.includes('mercedes')) {
    taxaDepreciacaoAnual = 0.15; // 15% ao ano (luxo deprecia mais)
  }

  const valorEstimadoZeroKm = dadosFipe.valor_numerico / Math.pow(1 - taxaDepreciacaoAnual, idadeVeiculo);
  const depreciacaoTotal = valorEstimadoZeroKm - dadosFipe.valor_numerico;
  const percentualDepreciacao = ((depreciacaoTotal / valorEstimadoZeroKm) * 100).toFixed(1);

  return {
    idade_veiculo: idadeVeiculo,
    taxa_depreciacao_anual: `${(taxaDepreciacaoAnual * 100).toFixed(0)}%`,
    valor_estimado_zero_km: `R$ ${valorEstimadoZeroKm.toLocaleString('pt-BR')}`,
    depreciacao_total: `R$ ${depreciacaoTotal.toLocaleString('pt-BR')}`,
    percentual_depreciacao: `${percentualDepreciacao}%`,
    retencao_valor: `${(100 - parseFloat(percentualDepreciacao)).toFixed(1)}%`,
    analise: idadeVeiculo <= 3 ? 'Veículo novo com alta retenção de valor' :
             idadeVeiculo <= 7 ? 'Veículo semi-novo com depreciação controlada' :
             'Veículo usado com valor estabilizado'
  };
}

/**
 * Compara preço de venda com valor FIPE
 */
function compararPreco(valorFipe, precoVenda) {
  const diferenca = precoVenda - valorFipe;
  const percentualDiferenca = ((diferenca / valorFipe) * 100).toFixed(2);

  return {
    valor_fipe: valorFipe,
    preco_venda: precoVenda,
    diferenca: diferenca,
    diferenca_formatada: `R$ ${Math.abs(diferenca).toLocaleString('pt-BR')}`,
    percentual: `${percentualDiferenca}%`,
    esta_abaixo_fipe: diferenca < 0,
    economia: diferenca < 0 ? Math.abs(diferenca) : 0,
    avaliacao: diferenca < -5000 ? 'Excelente negócio!' :
               diferenca < 0 ? 'Bom negócio!' :
               diferenca <= 5000 ? 'Preço justo' :
               'Acima da FIPE'
  };
}

/**
 * Gera sugestões de como a IA deve usar esses dados na conversa
 */
function gerarSugestoesConversa(dadosFipe, especsTecnicas, precoVenda) {
  const sugestoes = [];

  sugestoes.push({
    momento: 'cliente_demonstra_interesse',
    sugestao: `Mencione que o ${dadosFipe.modelo} tem ${especsTecnicas.pontos_fortes[0]} e é perfeito para ${especsTecnicas.publico_alvo}`
  });

  sugestoes.push({
    momento: 'cliente_pergunta_valor',
    sugestao: `Informe o preço e imediatamente compare com a tabela FIPE (${dadosFipe.valor_formatado}). ${precoVenda && precoVenda < dadosFipe.valor_numerico ? 'Destaque que está ABAIXO da FIPE!' : 'Reforce que é preço justo de mercado'}`
  });

  sugestoes.push({
    momento: 'cliente_tem_duvidas_qualidade',
    sugestao: `Use os diferenciais: "${especsTecnicas.diferenciais.join('", "')}". São argumentos fortes de qualidade!`
  });

  sugestoes.push({
    momento: 'cliente_compara_com_outro_modelo',
    sugestao: `Reforce os pontos fortes únicos: ${especsTecnicas.pontos_fortes.slice(0, 2).join(' e ')}. Isso diferencia este modelo!`
  });

  return sugestoes;
}
