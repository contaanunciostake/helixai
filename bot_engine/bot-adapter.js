/**
 * Adaptador Multi-Tenant para Bot WhatsApp
 * Integra o bot com backend VendeAI
 */

import { getEmpresaConfig, salvarMensagem, salvarConversa, salvarLead, atualizarStatusWhatsApp } from './database_client.js';

class BotAdapter {
  constructor() {
    this.empresaId = null;
    this.empresaConfig = null;
    this.myPhoneNumber = null;
  }

  /**
   * Inicializa o adapter com configurações da empresa
   * @param {string} phoneNumber - Número WhatsApp do bot (ex: 5511999999999)
   */
  async initialize(phoneNumber) {
    this.myPhoneNumber = phoneNumber;

    try {
      // Buscar configuração da empresa pelo número WhatsApp (silenciosamente)
      const config = await getEmpresaConfig(phoneNumber);

      if (!config) {
        // Backend Flask não está configurado para este número (modo standalone)
        return false;
      }

      this.empresaId = config.empresa_id;
      this.empresaConfig = config.config;

      console.log(`[BOT-ADAPTER] ✅ Empresa carregada: ${config.empresa_nome}`);
      console.log(`[BOT-ADAPTER] ✅ Empresa ID: ${this.empresaId}`);
      console.log(`[BOT-ADAPTER] ✅ Auto-resposta: ${this.empresaConfig.auto_resposta_ativa ? 'ATIVA' : 'DESATIVADA'}`);
      console.log(`[BOT-ADAPTER] ✅ Enviar áudio: ${this.empresaConfig.enviar_audio ? 'SIM' : 'NÃO'}`);
      console.log(`[BOT-ADAPTER] ✅ OpenAI Model: ${this.empresaConfig.openai_model || 'gpt-4'}`);

      // Atualizar status WhatsApp
      await atualizarStatusWhatsApp(this.empresaId, true);

      return true;
    } catch (error) {
      console.error('[BOT-ADAPTER] Erro ao inicializar:', error);
      return false;
    }
  }

  /**
   * Retorna chave OpenAI da empresa
   */
  getOpenAIKey() {
    return this.empresaConfig?.openai_api_key || process.env.OPENAI_API_KEY;
  }

  /**
   * Retorna modelo OpenAI da empresa
   */
  getOpenAIModel() {
    return this.empresaConfig?.openai_model || 'gpt-4';
  }

  /**
   * Retorna chave Groq da empresa
   */
  // getGroqKey() {
  //   return this.empresaConfig?.groq_api_key || process.env.GROQ_API_KEY;
  // }

  /**
   * Retorna chave ElevenLabs da empresa
   */
  getElevenLabsKey() {
    return this.empresaConfig?.elevenlabs_api_key || process.env.ELEVENLABS_API_KEY;
  }

  /**
   * Retorna Voice ID ElevenLabs da empresa
   */
  getElevenLabsVoiceId() {
    return this.empresaConfig?.elevenlabs_voice_id || process.env.ELEVENLABS_VOICE_ID;
  }

  /**
   * Retorna Agent ID ElevenLabs da empresa
   */
  getElevenLabsAgentId() {
    return this.empresaConfig?.elevenlabs_agent_id || process.env.ELEVENLABS_AGENT_ID;
  }

  /**
   * Verifica se auto-resposta está ativa
   */
  isAutoRespostaAtiva() {
    return this.empresaConfig?.auto_resposta_ativa !== false;
  }

  /**
   * Verifica se deve enviar áudio
   */
  shouldEnviarAudio() {
    return this.empresaConfig?.enviar_audio === true;
  }

  /**
   * Verifica se módulo FIPE está ativo
   */
  isModuloFipeAtivo() {
    return this.empresaConfig?.modulo_fipe_ativo === true;
  }

  /**
   * Verifica se módulo financiamento está ativo
   */
  isModuloFinanciamentoAtivo() {
    return this.empresaConfig?.modulo_financiamento_ativo === true;
  }

  /**
   * Retorna descrição da empresa (para IA)
   */
  getDescricaoEmpresa() {
    return this.empresaConfig?.descricao_empresa || 'Empresa de vendas';
  }

  /**
   * Retorna produtos/serviços (para IA)
   */
  getProdutosServicos() {
    return this.empresaConfig?.produtos_servicos || '';
  }

  /**
   * Retorna tom de conversa (para IA)
   */
  getTomConversa() {
    return this.empresaConfig?.tom_conversa || 'profissional e amigável';
  }

  /**
   * Retorna mensagem de boas-vindas
   */
  getMensagemBoasVindas() {
    return this.empresaConfig?.mensagem_boas_vindas || 'Olá! Como posso ajudar?';
  }

  /**
   * Registra mensagem recebida do cliente
   */
  async registrarMensagemRecebida(telefone, nomeContato, mensagem, tipo = 'TEXTO', arquivo_url = null) {
    try {
      // 1. Criar/atualizar conversa
      const conversaResult = await salvarConversa(this.empresaId, telefone, {
        nome_contato: nomeContato
      });

      if (!conversaResult?.conversa_id) {
        console.error('[BOT-ADAPTER] Erro ao criar conversa');
        return null;
      }

      const conversaId = conversaResult.conversa_id;

      // 2. Salvar mensagem
      const mensagemResult = await salvarMensagem(this.empresaId, conversaId, {
        tipo,
        conteudo: mensagem,
        arquivo_url,
        enviada_por_bot: false
      });

      console.log(`[BOT-ADAPTER] ✅ Mensagem recebida registrada (Conversa ID: ${conversaId})`);
      return conversaId;
    } catch (error) {
      console.error('[BOT-ADAPTER] Erro ao registrar mensagem recebida:', error);
      return null;
    }
  }

  /**
   * Registra mensagem enviada pelo bot
   */
  async registrarMensagemEnviada(telefone, nomeContato, mensagem, tipo = 'TEXTO', arquivo_url = null) {
    try {
      // 1. Criar/atualizar conversa
      const conversaResult = await salvarConversa(this.empresaId, telefone, {
        nome_contato: nomeContato
      });

      if (!conversaResult?.conversa_id) {
        console.error('[BOT-ADAPTER] Erro ao criar conversa');
        return null;
      }

      const conversaId = conversaResult.conversa_id;

      // 2. Salvar mensagem
      const mensagemResult = await salvarMensagem(this.empresaId, conversaId, {
        tipo,
        conteudo: mensagem,
        arquivo_url,
        enviada_por_bot: true
      });

      console.log(`[BOT-ADAPTER] ✅ Mensagem enviada registrada (Conversa ID: ${conversaId})`);
      return conversaId;
    } catch (error) {
      console.error('[BOT-ADAPTER] Erro ao registrar mensagem enviada:', error);
      return null;
    }
  }

  /**
   * Registra/atualiza lead
   */
  async registrarLead(telefone, nome, email = null, temperatura = 'MORNO') {
    try {
      const result = await salvarLead(this.empresaId, {
        telefone,
        nome,
        email,
        temperatura
      });

      if (result?.lead_id) {
        console.log(`[BOT-ADAPTER] ✅ Lead registrado (ID: ${result.lead_id})`);
      }

      return result;
    } catch (error) {
      console.error('[BOT-ADAPTER] Erro ao registrar lead:', error);
      return null;
    }
  }

  /**
   * Atualiza status de conexão WhatsApp
   */
  async atualizarStatusConexao(conectado) {
    try {
      await atualizarStatusWhatsApp(this.empresaId, conectado);
      console.log(`[BOT-ADAPTER] Status WhatsApp atualizado: ${conectado ? 'CONECTADO' : 'DESCONECTADO'}`);
    } catch (error) {
      console.error('[BOT-ADAPTER] Erro ao atualizar status:', error);
    }
  }
}

// Exportar instância singleton
const botAdapter = new BotAdapter();
export default botAdapter;
