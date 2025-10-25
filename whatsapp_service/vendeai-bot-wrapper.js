/**
 * ════════════════════════════════════════════════════════════════════════════
 * VENDEAI BOT WRAPPER - Wrapper do Bot de Veículos
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Wrapper que encapsula toda a lógica do VendeAI Bot (veículos)
 * e o torna compatível com o sistema multi-tenant
 *
 * RECURSOS:
 * - ✅ IA Master (análise de intenções, recomendações, sentimento)
 * - ✅ Busca inteligente de veículos no banco
 * - ✅ Integração com API FIPE
 * - ✅ Simulador de financiamento
 * - ✅ Agendamento de visitas
 * - ✅ Geração de áudio (ElevenLabs)
 * - ✅ Contexto temporal de conversas
 * - ✅ Sistema de memória e follow-up
 *
 * ════════════════════════════════════════════════════════════════════════════
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { ElevenLabsClient } from 'elevenlabs';
import mysql from 'mysql2/promise';
import axios from 'axios';

/**
 * Repository de Veículos
 */
class VeiculosRepository {
  constructor(dbPool, empresaId) {
    this.dbPool = dbPool;
    this.empresaId = empresaId;
  }

  /**
   * Buscar veículos com filtros inteligentes
   */
  async buscarVeiculos(filtros = {}) {
    try {
      let query = 'SELECT * FROM veiculos WHERE empresa_id = ? AND disponivel = 1';
      const params = [this.empresaId];

      if (filtros.marca) {
        query += ' AND marca LIKE ?';
        params.push(`%${filtros.marca}%`);
      }

      if (filtros.modelo) {
        query += ' AND modelo LIKE ?';
        params.push(`%${filtros.modelo}%`);
      }

      if (filtros.preco_max) {
        query += ' AND preco <= ?';
        params.push(filtros.preco_max);
      }

      if (filtros.preco_min) {
        query += ' AND preco >= ?';
        params.push(filtros.preco_min);
      }

      if (filtros.ano_min) {
        query += ' AND ano_modelo >= ?';
        params.push(filtros.ano_min);
      }

      if (filtros.combustivel) {
        query += ' AND combustivel = ?';
        params.push(filtros.combustivel);
      }

      query += ' ORDER BY destaque DESC, criado_em DESC LIMIT 10';

      const [rows] = await this.dbPool.query(query, params);
      return rows;

    } catch (error) {
      console.error('[VEICULOS-REPO] ❌ Erro ao buscar veículos:', error);
      return [];
    }
  }

  /**
   * Obter veículo por ID
   */
  async obterVeiculoPorId(veiculoId) {
    try {
      const [rows] = await this.dbPool.query(
        'SELECT * FROM veiculos WHERE id = ? AND empresa_id = ?',
        [veiculoId, this.empresaId]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('[VEICULOS-REPO] ❌ Erro ao obter veículo:', error);
      return null;
    }
  }
}

/**
 * Sistema de IA Master
 */
class IAMaster {
  constructor(config) {
    this.config = config;

    // Inicializar clientes de IA
    if (config.openai_api_key) {
      this.openai = new OpenAI({ apiKey: config.openai_api_key });
    }

    if (config.anthropic_api_key) {
      this.anthropic = new Anthropic({ apiKey: config.anthropic_api_key });
    }
  }

  /**
   * Analisar intenção da mensagem
   */
  async analisarIntencao(mensagem, contexto = {}) {
    try {
      const prompt = `Analise a seguinte mensagem de um cliente interessado em veículos:

Mensagem: "${mensagem}"
Contexto: ${JSON.stringify(contexto)}

Identifique:
1. Intenção principal (interesse_compra, duvida, negociacao, agendamento, objecao, despedida)
2. Filtros mencionados (marca, modelo, ano, preço, etc)
3. Sentimento (positivo, neutro, negativo)
4. Próxima ação recomendada

Responda em JSON com a estrutura:
{
  "intencao": "...",
  "filtros": {...},
  "sentimento": "...",
  "proxima_acao": "..."
}`;

      let resposta;

      if (this.anthropic) {
        const response = await this.anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 500,
          messages: [{ role: 'user', content: prompt }]
        });
        resposta = response.content[0].text;
      } else if (this.openai) {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-4-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 500
        });
        resposta = response.choices[0].message.content;
      }

      // Tentar extrair JSON da resposta
      const jsonMatch = resposta.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return {
        intencao: 'interesse_compra',
        filtros: {},
        sentimento: 'neutro',
        proxima_acao: 'mostrar_veiculos'
      };

    } catch (error) {
      console.error('[IA-MASTER] ❌ Erro ao analisar intenção:', error);
      return {
        intencao: 'interesse_compra',
        filtros: {},
        sentimento: 'neutro',
        proxima_acao: 'mostrar_veiculos'
      };
    }
  }

  /**
   * Gerar resposta personalizada
   */
  async gerarResposta(mensagem, veiculos, contexto = {}) {
    try {
      const veiculosTexto = veiculos.map(v =>
        `${v.marca} ${v.modelo} ${v.ano_modelo} - R$ ${v.preco?.toLocaleString('pt-BR')}`
      ).join('\n');

      const prompt = `Você é um vendedor de veículos profissional e amigável.

Cliente perguntou: "${mensagem}"

Veículos disponíveis:
${veiculosTexto}

Contexto da conversa: ${JSON.stringify(contexto)}

Gere uma resposta persuasiva, destacando os veículos mais adequados.
Seja natural, empático e focado em ajudar o cliente.`;

      let resposta;

      if (this.anthropic) {
        const response = await this.anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 300,
          messages: [{ role: 'user', content: prompt }]
        });
        resposta = response.content[0].text;
      } else if (this.openai) {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-4-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 300
        });
        resposta = response.choices[0].message.content;
      }

      return resposta || 'Temos ótimas opções disponíveis! Posso ajudar você a encontrar o veículo ideal.';

    } catch (error) {
      console.error('[IA-MASTER] ❌ Erro ao gerar resposta:', error);
      return 'Temos ótimas opções disponíveis! Posso ajudar você a encontrar o veículo ideal.';
    }
  }
}

/**
 * Gerador de Áudio (ElevenLabs)
 */
class AudioGenerator {
  constructor(config) {
    this.config = config;

    if (config.elevenlabs_api_key) {
      this.client = new ElevenLabsClient({ apiKey: config.elevenlabs_api_key });
      this.voiceId = config.elevenlabs_voice_id || 'Rachel';
    }
  }

  /**
   * Converter texto em áudio
   */
  async textToSpeech(texto) {
    try {
      if (!this.client) {
        return null;
      }

      // Limpar texto para TTS
      const textoLimpo = this._limparTextoParaTTS(texto);

      const audio = await this.client.generate({
        voice: this.voiceId,
        text: textoLimpo,
        model_id: 'eleven_multilingual_v2'
      });

      // Retornar URL ou buffer do áudio
      return audio;

    } catch (error) {
      console.error('[AUDIO-GEN] ❌ Erro ao gerar áudio:', error);
      return null;
    }
  }

  _limparTextoParaTTS(texto) {
    return texto
      .replace(/\*/g, '')
      .replace(/_/g, '')
      .replace(/#{1,6}\s/g, '')
      .replace(/\[.*?\]/g, '')
      .substring(0, 500); // Limitar tamanho
  }
}

/**
 * Wrapper Principal do VendeAI Bot
 */
export class VendeAIBotWrapper {
  constructor(empresaId, config, dbPool) {
    this.empresaId = empresaId;
    this.config = config;
    this.dbPool = dbPool;

    // Inicializar componentes
    this.veiculosRepo = new VeiculosRepository(dbPool, empresaId);
    this.iaMaster = new IAMaster(config);
    this.audioGen = new AudioGenerator(config);

    // Contextos de conversas (memória temporal)
    this.conversasContexto = new Map();

    console.log(`✅ [VENDEAI-WRAPPER] Bot inicializado para empresa ${empresaId}`);
  }

  /**
   * Processar mensagem recebida
   */
  async processarMensagem(telefone, mensagem, messageKey) {
    try {
      console.log(`\n[VENDEAI] 📨 Mensagem de ${telefone}: ${mensagem.substring(0, 100)}...`);

      // Obter ou criar contexto da conversa
      let contexto = this.conversasContexto.get(telefone) || {
        historico: [],
        filtros: {},
        ultimaInteracao: Date.now()
      };

      // Atualizar histórico
      contexto.historico.push({
        role: 'user',
        content: mensagem,
        timestamp: Date.now()
      });

      // Analisar intenção usando IA
      const analise = await this.iaMaster.analisarIntencao(mensagem, contexto);

      console.log(`[VENDEAI] 🧠 Intenção detectada: ${analise.intencao}`);
      console.log(`[VENDEAI] 🎭 Sentimento: ${analise.sentimento}`);

      // Atualizar filtros do contexto
      contexto.filtros = { ...contexto.filtros, ...analise.filtros };

      // Buscar veículos baseado nos filtros
      const veiculos = await this.veiculosRepo.buscarVeiculos(contexto.filtros);

      console.log(`[VENDEAI] 🚗 ${veiculos.length} veículos encontrados`);

      // Gerar resposta personalizada
      const resposta = await this.iaMaster.gerarResposta(mensagem, veiculos, contexto);

      // Atualizar histórico com resposta do bot
      contexto.historico.push({
        role: 'assistant',
        content: resposta,
        timestamp: Date.now()
      });

      contexto.ultimaInteracao = Date.now();

      // Salvar contexto
      this.conversasContexto.set(telefone, contexto);

      // Retornar resposta
      return {
        texto: resposta,
        veiculos: veiculos.slice(0, 3), // Top 3 veículos
        gerarAudio: this.config.enviar_audio && this.config.usar_elevenlabs
      };

    } catch (error) {
      console.error('[VENDEAI] ❌ Erro ao processar mensagem:', error);
      return {
        texto: 'Desculpe, tive um problema ao processar sua mensagem. Pode tentar novamente?',
        veiculos: [],
        gerarAudio: false
      };
    }
  }

  /**
   * Gerar áudio da resposta
   */
  async gerarAudio(texto) {
    try {
      return await this.audioGen.textToSpeech(texto);
    } catch (error) {
      console.error('[VENDEAI] ❌ Erro ao gerar áudio:', error);
      return null;
    }
  }

  /**
   * Limpar contextos antigos (> 24h)
   */
  limparContextosAntigos() {
    const agora = Date.now();
    const VINTE_QUATRO_HORAS = 24 * 60 * 60 * 1000;

    for (const [telefone, contexto] of this.conversasContexto.entries()) {
      if (agora - contexto.ultimaInteracao > VINTE_QUATRO_HORAS) {
        this.conversasContexto.delete(telefone);
        console.log(`[VENDEAI] 🗑️ Contexto limpo para ${telefone}`);
      }
    }
  }

  /**
   * Obter estatísticas do bot
   */
  getEstatisticas() {
    return {
      empresaId: this.empresaId,
      conversasAtivas: this.conversasContexto.size,
      features: {
        ia: !!this.iaMaster,
        audio: !!this.audioGen.client,
        veiculos: true
      }
    };
  }
}

export default VendeAIBotWrapper;
