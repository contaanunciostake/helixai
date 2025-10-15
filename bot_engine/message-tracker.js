// =====================================================
// MESSAGE TRACKER - Sistema de Rastreamento de Mensagens
// =====================================================
// Autor: Helix AI Developer
// Data: 2025-01-13
// Propósito: Rastrear, debugar e garantir entrega de mensagens WhatsApp

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class MessageTracker {
  constructor() {
    this.logsDir = path.join(__dirname, 'logs');
    this.logsFile = path.join(this.logsDir, 'envios.log');
    this.rateLimitMap = new Map(); // telefone -> timestamp do último envio
    this.retryQueue = new Map(); // messageId -> retry info
    this.messageStatus = new Map(); // messageId -> status

    // Configurações
    this.MIN_INTERVAL_MS = 3000; // 3 segundos entre mensagens
    this.MAX_RETRIES = 3;
    this.RETRY_DELAYS = [5000, 10000, 15000]; // 5s, 10s, 15s

    // Criar diretório de logs se não existir
    this.initLogs();
  }

  initLogs() {
    try {
      if (!fs.existsSync(this.logsDir)) {
        fs.mkdirSync(this.logsDir, { recursive: true });
        console.log('📁 [TRACKER] Diretório de logs criado');
      }

      if (!fs.existsSync(this.logsFile)) {
        fs.writeFileSync(this.logsFile, '');
        console.log('📝 [TRACKER] Arquivo de logs criado');
      }
    } catch (error) {
      console.error('❌ [TRACKER] Erro ao inicializar logs:', error.message);
    }
  }

  /**
   * Gera ID único para mensagem
   */
  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Verifica se pode enviar mensagem (rate limiting)
   * @param {string} telefone - Número do telefone
   * @returns {Object} { canSend: boolean, waitTime: number }
   */
  checkRateLimit(telefone) {
    const now = Date.now();
    const lastSent = this.rateLimitMap.get(telefone) || 0;
    const timeSinceLastSend = now - lastSent;

    if (timeSinceLastSend < this.MIN_INTERVAL_MS) {
      const waitTime = this.MIN_INTERVAL_MS - timeSinceLastSend;
      return { canSend: false, waitTime };
    }

    return { canSend: true, waitTime: 0 };
  }

  /**
   * Aguarda rate limit antes de enviar
   * @param {string} telefone - Número do telefone
   */
  async waitForRateLimit(telefone) {
    const { canSend, waitTime } = this.checkRateLimit(telefone);

    if (!canSend) {
      console.log(`⏱️ [TRACKER] Rate limit: aguardando ${waitTime}ms para ${telefone}`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  /**
   * Registra envio de mensagem
   * @param {string} telefone - Número do telefone
   */
  markSent(telefone) {
    this.rateLimitMap.set(telefone, Date.now());
  }

  /**
   * Log estruturado para arquivo
   * @param {Object} data - Dados do log
   */
  logToFile(data) {
    try {
      const logEntry = {
        timestamp: new Date().toISOString(),
        ...data
      };

      const logLine = JSON.stringify(logEntry) + '\n';
      fs.appendFileSync(this.logsFile, logLine);
    } catch (error) {
      console.error('❌ [TRACKER] Erro ao escrever log:', error.message);
    }
  }

  /**
   * Envia mensagem com tracking completo
   * @param {Object} sock - Socket do WhatsApp
   * @param {string} telefone - Número do telefone
   * @param {Object} content - Conteúdo da mensagem
   * @param {string} messageType - Tipo da mensagem (text, audio, image, etc)
   * @param {Object} options - Opções adicionais { retries, onSuccess, onError }
   * @returns {Promise<Object>} Resultado do envio
   */
  async sendWithTracking(sock, telefone, content, messageType = 'unknown', options = {}) {
    const messageId = this.generateMessageId();
    const startTime = Date.now();
    const retries = options.retries || 0;
    const maxRetries = options.maxRetries || this.MAX_RETRIES;

    // ========== LOG PRÉ-ENVIO ==========
    console.log('\n' + '='.repeat(60));
    console.log('📤 [TRACKER] PREPARANDO ENVIO');
    console.log('='.repeat(60));
    console.log('🆔 Message ID:', messageId);
    console.log('📱 Telefone:', telefone);
    console.log('📝 Tipo:', messageType);
    console.log('🔄 Tentativa:', retries + 1, '/', maxRetries);
    console.log('⏰ Timestamp:', new Date().toISOString());
    console.log('📦 Conteúdo:', JSON.stringify(content).substring(0, 100) + '...');
    console.log('='.repeat(60));

    try {
      // ========== VERIFICAR CONEXÃO ==========
      if (!sock || !sock.user) {
        throw new Error('Socket não está conectado');
      }

      console.log('✅ [TRACKER] Socket verificado: conectado');

      // ========== RATE LIMITING ==========
      await this.waitForRateLimit(telefone);
      console.log('✅ [TRACKER] Rate limit OK');

      // ========== ENVIAR MENSAGEM ==========
      console.log('📡 [TRACKER] Enviando mensagem...');
      const result = await sock.sendMessage(telefone, content);
      const duration = Date.now() - startTime;

      // Marcar como enviado
      this.markSent(telefone);
      this.messageStatus.set(messageId, {
        status: 'sent',
        timestamp: Date.now(),
        result
      });

      // ========== LOG DE SUCESSO ==========
      console.log('\n' + '✅'.repeat(30));
      console.log('✅ [TRACKER] MENSAGEM ENVIADA COM SUCESSO!');
      console.log('✅'.repeat(30));
      console.log('🆔 Message ID:', messageId);
      console.log('📱 Telefone:', telefone);
      console.log('⏱️ Duração:', duration + 'ms');
      console.log('📊 Status:', result.status || 'PENDING');
      console.log('🔑 Key:', JSON.stringify(result.key));
      console.log('✅'.repeat(30) + '\n');

      // Log para arquivo
      this.logToFile({
        messageId,
        telefone,
        tipo: messageType,
        sucesso: true,
        duracao: duration,
        tentativa: retries + 1,
        status: result.status || 'PENDING',
        key: result.key
      });

      // Callback de sucesso
      if (options.onSuccess) {
        options.onSuccess(result);
      }

      return {
        success: true,
        messageId,
        result,
        duration
      };

    } catch (error) {
      const duration = Date.now() - startTime;

      // ========== LOG DE ERRO ==========
      console.log('\n' + '❌'.repeat(30));
      console.log('❌ [TRACKER] ERRO AO ENVIAR MENSAGEM!');
      console.log('❌'.repeat(30));
      console.log('🆔 Message ID:', messageId);
      console.log('📱 Telefone:', telefone);
      console.log('⏱️ Duração:', duration + 'ms');
      console.log('🔄 Tentativa:', retries + 1, '/', maxRetries);
      console.log('⚠️ Erro:', error.message);
      console.log('📚 Stack:', error.stack);
      console.log('❌'.repeat(30) + '\n');

      // Log para arquivo
      this.logToFile({
        messageId,
        telefone,
        tipo: messageType,
        sucesso: false,
        duracao: duration,
        tentativa: retries + 1,
        erro: error.message,
        stack: error.stack
      });

      // ========== RETRY LOGIC ==========
      if (retries < maxRetries) {
        const nextRetry = retries + 1;
        const delay = this.RETRY_DELAYS[retries] || 15000;

        console.log(`🔄 [TRACKER] Tentando novamente em ${delay}ms (tentativa ${nextRetry}/${maxRetries})...`);

        await new Promise(resolve => setTimeout(resolve, delay));

        // Retry recursivo
        return this.sendWithTracking(sock, telefone, content, messageType, {
          ...options,
          retries: nextRetry
        });
      }

      // ========== TODAS AS TENTATIVAS FALHARAM ==========
      console.log('💀 [TRACKER] FALHA PERMANENTE após', maxRetries, 'tentativas');

      this.logToFile({
        messageId,
        telefone,
        tipo: messageType,
        sucesso: false,
        duracao: duration,
        tentativa: retries + 1,
        erro: 'FALHA_PERMANENTE',
        detalhes: error.message
      });

      // Callback de erro
      if (options.onError) {
        options.onError(error);
      }

      return {
        success: false,
        messageId,
        error: error.message,
        duration
      };
    }
  }

  /**
   * Obtém estatísticas de envio
   * @returns {Object} Estatísticas
   */
  getStats() {
    try {
      const logs = fs.readFileSync(this.logsFile, 'utf8')
        .split('\n')
        .filter(line => line.trim())
        .map(line => JSON.parse(line));

      const total = logs.length;
      const sucessos = logs.filter(log => log.sucesso).length;
      const falhas = logs.filter(log => !log.sucesso).length;
      const taxaSucesso = total > 0 ? ((sucessos / total) * 100).toFixed(2) : 0;

      return {
        total,
        sucessos,
        falhas,
        taxaSucesso: taxaSucesso + '%',
        ultimoEnvio: logs[logs.length - 1]
      };
    } catch (error) {
      return {
        total: 0,
        sucessos: 0,
        falhas: 0,
        taxaSucesso: '0%',
        erro: error.message
      };
    }
  }

  /**
   * Limpa logs antigos (opcional)
   * @param {number} days - Dias para manter
   */
  cleanOldLogs(days = 7) {
    try {
      const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
      const logs = fs.readFileSync(this.logsFile, 'utf8')
        .split('\n')
        .filter(line => line.trim())
        .map(line => JSON.parse(line))
        .filter(log => new Date(log.timestamp).getTime() > cutoffTime);

      fs.writeFileSync(this.logsFile, logs.map(log => JSON.stringify(log)).join('\n') + '\n');
      console.log(`🧹 [TRACKER] Logs limpos: mantidos últimos ${days} dias`);
    } catch (error) {
      console.error('❌ [TRACKER] Erro ao limpar logs:', error.message);
    }
  }
}

// Exportar instância única (singleton)
export default new MessageTracker();
