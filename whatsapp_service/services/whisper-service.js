/**
 * ════════════════════════════════════════════════════════════════════════════
 * WHISPER SERVICE - Servico de Transcrição de Audio
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Servico para transcrever audio de mensagens de voz do WhatsApp
 * usando OpenAI Whisper API.
 *
 * ════════════════════════════════════════════════════════════════════════════
 */

import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { downloadMediaMessage } from '@whiskeysockets/baileys';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class WhisperService {
  constructor(apiKey) {
    if (!apiKey) {
      console.warn('[WHISPER] ⚠️ OPENAI_API_KEY não configurada, transcrição desativada');
      this.openai = null;
      return;
    }

    this.openai = new OpenAI({ apiKey });
    this.tempDir = path.join(__dirname, '..', 'temp');

    // Criar diretório temp se não existir
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }

    console.log('[WHISPER] ✅ Serviço de transcrição inicializado');
  }

  /**
   * Verificar se o serviço está disponível
   */
  isAvailable() {
    return this.openai !== null;
  }

  /**
   * Transcrever audio de uma mensagem do WhatsApp
   * @param {object} message - Mensagem do Baileys com audioMessage
   * @returns {string|null} - Texto transcrito ou null se falhar
   */
  async transcreverMensagem(message) {
    if (!this.openai) {
      console.warn('[WHISPER] Serviço não disponível');
      return null;
    }

    try {
      console.log('[WHISPER] 🎤 Iniciando transcrição de áudio...');

      // Baixar o áudio da mensagem
      const buffer = await downloadMediaMessage(
        message,
        'buffer',
        {},
        {
          reuploadRequest: async () => {
            throw new Error('Reupload não suportado');
          }
        }
      );

      if (!buffer || buffer.length === 0) {
        console.error('[WHISPER] ❌ Buffer de áudio vazio');
        return null;
      }

      console.log(`[WHISPER] 📥 Áudio baixado: ${buffer.length} bytes`);

      // Salvar temporariamente o arquivo
      const tempFile = path.join(this.tempDir, `audio_${Date.now()}.ogg`);
      fs.writeFileSync(tempFile, buffer);

      try {
        // Transcrever com Whisper
        const transcription = await this.openai.audio.transcriptions.create({
          file: fs.createReadStream(tempFile),
          model: 'whisper-1',
          language: 'pt',
          response_format: 'text'
        });

        // Limpar arquivo temporário
        fs.unlinkSync(tempFile);

        const texto = transcription.trim();
        console.log(`[WHISPER] ✅ Transcrição: "${texto.substring(0, 100)}${texto.length > 100 ? '...' : ''}"`);

        return texto;

      } catch (apiError) {
        // Limpar arquivo temporário em caso de erro
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
        throw apiError;
      }

    } catch (error) {
      console.error('[WHISPER] ❌ Erro na transcrição:', error.message);
      return null;
    }
  }

  /**
   * Transcrever áudio a partir de um buffer
   * @param {Buffer} audioBuffer - Buffer do áudio
   * @param {string} formato - Formato do áudio (ogg, mp3, wav, etc)
   * @returns {string|null} - Texto transcrito ou null se falhar
   */
  async transcreverBuffer(audioBuffer, formato = 'ogg') {
    if (!this.openai) {
      console.warn('[WHISPER] Serviço não disponível');
      return null;
    }

    try {
      console.log(`[WHISPER] 🎤 Transcrevendo buffer de ${audioBuffer.length} bytes...`);

      // Salvar temporariamente
      const tempFile = path.join(this.tempDir, `audio_${Date.now()}.${formato}`);
      fs.writeFileSync(tempFile, audioBuffer);

      try {
        const transcription = await this.openai.audio.transcriptions.create({
          file: fs.createReadStream(tempFile),
          model: 'whisper-1',
          language: 'pt',
          response_format: 'text'
        });

        fs.unlinkSync(tempFile);

        const texto = transcription.trim();
        console.log(`[WHISPER] ✅ Transcrição: "${texto.substring(0, 100)}${texto.length > 100 ? '...' : ''}"`);

        return texto;

      } catch (apiError) {
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
        throw apiError;
      }

    } catch (error) {
      console.error('[WHISPER] ❌ Erro na transcrição:', error.message);
      return null;
    }
  }
}

export default WhisperService;
