/**
 * 🚗 MÓDULO 10: CLASSIFICADOR INTELIGENTE DE VEÍCULOS
 *
 * Usa IA para classificar veículos por tipo (hatch, sedan, pickup, suv)
 * baseado no título, já que body_type_id está null no banco.
 *
 * OBJETIVO: Filtrar veículos corretamente SEM regras fixas
 */

import Anthropic from '@anthropic-ai/sdk';

export class ClassificadorVeiculos {
  constructor(anthropicKey) {
    this.anthropic = new Anthropic({ apiKey: anthropicKey });
    this.cache = new Map(); // Cache de classificações
  }

  /**
   * Classifica múltiplos veículos e filtra pelo tipo desejado
   * @param {Array} veiculos - Lista de veículos do banco
   * @param {string} tipoDesejado - Tipo solicitado (hatch, sedan, pickup, suv, etc)
   * @returns {Array} Veículos filtrados que correspondem ao tipo
   */
  async filtrarPorTipo(veiculos, tipoDesejado) {
    if (!tipoDesejado || veiculos.length === 0) {
      return veiculos; // Se não especificou tipo, retorna todos
    }

    console.log(`[CLASSIFICADOR] Filtrando ${veiculos.length} veículos por tipo: ${tipoDesejado}`);

    try {
      // Preparar lista de títulos
      const titulos = veiculos.map(v => v.titulo || v.title);

      // Classificar todos de uma vez usando IA
      const classificacoes = await this._classificarLote(titulos, tipoDesejado);

      // Filtrar veículos que correspondem ao tipo
      const veiculosFiltrados = veiculos.filter((veiculo, index) => {
        return classificacoes[index] === true;
      });

      console.log(`[CLASSIFICADOR] ✓ Filtrados: ${veiculosFiltrados.length}/${veiculos.length} correspondem a "${tipoDesejado}"`);

      return veiculosFiltrados;

    } catch (error) {
      console.error('[CLASSIFICADOR] Erro ao filtrar:', error.message);
      return veiculos; // Fallback: retorna todos se falhar
    }
  }

  /**
   * Classifica um lote de veículos de uma vez
   * @param {Array} titulos - Lista de títulos de veículos
   * @param {string} tipoDesejado - Tipo desejado
   * @returns {Array} Array de booleans indicando se cada veículo corresponde ao tipo
   */
  async _classificarLote(titulos, tipoDesejado) {
    // Criar chave de cache
    const cacheKey = `${tipoDesejado}_${titulos.join('|')}`;

    if (this.cache.has(cacheKey)) {
      console.log('[CLASSIFICADOR] ✓ Cache hit');
      return this.cache.get(cacheKey);
    }

    const prompt = `Você é um especialista em classificação de veículos. Analise esta lista de veículos e identifique quais correspondem ao tipo solicitado.

TIPO SOLICITADO: ${tipoDesejado}

VEÍCULOS PARA CLASSIFICAR:
${titulos.map((t, i) => `${i + 1}. ${t}`).join('\n')}

REGRAS DE CLASSIFICAÇÃO:
- "hatch" ou "hatchback": Veículos com porta-malas integrado (Gol, Onix, HB20, Palio, Uno, Argo, etc)
- "sedan": Veículos 4 portas com porta-malas separado (Civic, Corolla, Jetta, Virtus, Cruze, etc)
- "pickup" ou "caminhonete": Veículos com caçamba (Hilux, Ranger, S10, Toro, Strada, Montana, Saveiro, etc)
- "suv": Veículos utilitários esportivos (Compass, Tucson, HR-V, Kicks, Creta, T-Cross, etc)
- "van": Veículos de carga/passageiros (Ducato, Sprinter, Master, etc)
- "moto" ou "motocicleta": Motos (CG, Titan, Biz, Factor, PCX, etc)

TAREFA:
Para cada veículo, responda apenas "SIM" ou "NÃO" indicando se ele corresponde ao tipo "${tipoDesejado}".

FORMATO DE RESPOSTA (JSON):
{
  "classificacoes": [
    true,  // Veículo 1 corresponde
    false, // Veículo 2 NÃO corresponde
    true,  // Veículo 3 corresponde
    ...
  ],
  "justificativas": [
    "Montana é uma pickup/caminhonete",
    "Gol é hatchback, não ${tipoDesejado}",
    ...
  ]
}

Retorne APENAS o JSON, sem explicações adicionais.`;

    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 2000,
      temperature: 0.2, // Baixa temperatura para classificação precisa
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    // Extrair JSON
    let respostaTexto = response.content[0].text.trim();
    respostaTexto = respostaTexto.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    const jsonMatch = respostaTexto.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Resposta não contém JSON válido');
    }

    const resultado = JSON.parse(jsonMatch[0]);
    const classificacoes = resultado.classificacoes;

    // Mostrar classificações no console
    console.log('[CLASSIFICADOR] Resultado da classificação:');
    titulos.forEach((titulo, i) => {
      const match = classificacoes[i] ? '✅' : '❌';
      console.log(`  ${match} ${i + 1}. ${titulo}`);
      if (resultado.justificativas && resultado.justificativas[i]) {
        console.log(`      → ${resultado.justificativas[i]}`);
      }
    });

    // Salvar no cache
    this.cache.set(cacheKey, classificacoes);

    return classificacoes;
  }

  /**
   * Identifica o tipo de um único veículo
   * @param {string} titulo - Título do veículo
   * @returns {string} Tipo identificado (hatch, sedan, pickup, suv, etc)
   */
  async identificarTipo(titulo) {
    const prompt = `Identifique o tipo deste veículo:

VEÍCULO: ${titulo}

TIPOS POSSÍVEIS:
- hatchback (porta-malas integrado)
- sedan (porta-malas separado)
- pickup (com caçamba)
- suv (utilitário esportivo)
- van
- moto/motocicleta

Responda APENAS com o tipo, em minúsculas, sem explicações.`;

    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 50,
      temperature: 0.1,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    return response.content[0].text.trim().toLowerCase();
  }

  /**
   * Limpa cache de classificações
   */
  limparCache() {
    this.cache.clear();
    console.log('[CLASSIFICADOR] ✓ Cache limpo');
  }
}

export default ClassificadorVeiculos;
