/**
 * ════════════════════════════════════════════════════════════════════════════
 * ELEVENLABS SERVICE - Servico de Text-to-Speech
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Servico para gerar audio a partir de texto usando ElevenLabs API.
 * Converte MP3 para OGG/Opus para compatibilidade com WhatsApp.
 *
 * ════════════════════════════════════════════════════════════════════════════
 */

import { ElevenLabsClient } from 'elevenlabs';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Converter numero para texto por extenso (simplificado)
 */
function numeroParaExtenso(num) {
  const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
  const especiais = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
  const dezenas = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

  if (num === 0) return 'zero';
  if (num === 100) return 'cem';

  let resultado = '';

  // Milhões
  if (num >= 1000000) {
    const milhoes = Math.floor(num / 1000000);
    resultado += milhoes === 1 ? 'um milhão' : numeroParaExtenso(milhoes) + ' milhões';
    num %= 1000000;
    if (num > 0) resultado += ' ';
  }

  // Milhares
  if (num >= 1000) {
    const milhares = Math.floor(num / 1000);
    resultado += milhares === 1 ? 'mil' : numeroParaExtenso(milhares) + ' mil';
    num %= 1000;
    if (num > 0) resultado += ' ';
  }

  // Centenas
  if (num >= 100) {
    if (num === 100) {
      resultado += 'cem';
      return resultado;
    }
    resultado += centenas[Math.floor(num / 100)];
    num %= 100;
    if (num > 0) resultado += ' e ';
  }

  // Dezenas e unidades
  if (num >= 10 && num < 20) {
    resultado += especiais[num - 10];
  } else {
    if (num >= 20) {
      resultado += dezenas[Math.floor(num / 10)];
      num %= 10;
      if (num > 0) resultado += ' e ';
    }
    if (num > 0 && num < 10) {
      resultado += unidades[num];
    }
  }

  return resultado.trim();
}

/**
 * Formatar texto para TTS (remover emojis, formatar numeros, etc)
 */
function prepararTextoParaTTS(texto) {
  let formatado = texto
    // Remover emojis
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
    .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '')
    .replace(/[\u{2600}-\u{26FF}]/gu, '')
    .replace(/[\u{2700}-\u{27BF}]/gu, '')
    // Remover asteriscos de markdown
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    // Normalizar espacos
    .replace(/\s+/g, ' ')
    .trim();

  // Converter números com milhares para extenso (ex: 123,238 km → cento e vinte e três mil duzentos e trinta e oito quilômetros)
  // Formato: 123,238 ou 123.238 (separador de milhar)
  formatado = formatado.replace(/(\d{1,3})[,.](\d{3})\s*(km|quilometros?|quilômetros?)/gi, (match, milhar, centena, unidade) => {
    const numero = parseInt(milhar) * 1000 + parseInt(centena);
    const extenso = numeroParaExtenso(numero);
    const unidadeFormatada = unidade.toLowerCase().startsWith('km') ? 'quilômetros' : 'quilômetros';
    return extenso + ' ' + unidadeFormatada;
  });

  // Converter números grandes sem unidade (ex: 150,000 → cento e cinquenta mil)
  formatado = formatado.replace(/(\d{1,3})[,.](\d{3})(?!\d)/g, (match, milhar, centena) => {
    const numero = parseInt(milhar) * 1000 + parseInt(centena);
    return numeroParaExtenso(numero);
  });

  // Formatar valores monetarios
  formatado = formatado
    .replace(/R\$\s*(\d+)\.(\d{3})/g, (match, milhar, centena) => {
      const numero = parseInt(milhar) * 1000 + parseInt(centena);
      return numeroParaExtenso(numero) + ' reais';
    })
    .replace(/R\$\s*(\d+),(\d{2})/g, '$1 reais e $2 centavos')
    .replace(/R\$\s*(\d+)/g, '$1 reais');

  return formatado;
}

/**
 * Converter MP3 para OGG/Opus usando ffmpeg
 */
async function converterMp3ParaOgg(mp3Buffer) {
  return new Promise((resolve, reject) => {
    const tempDir = path.join(__dirname, '..', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempMp3 = path.join(tempDir, `tts_${Date.now()}.mp3`);
    const tempOgg = path.join(tempDir, `tts_${Date.now()}.ogg`);

    // Salvar MP3 temporario
    fs.writeFileSync(tempMp3, mp3Buffer);

    // Converter com ffmpeg
    const ffmpeg = spawn('ffmpeg', [
      '-i', tempMp3,
      '-acodec', 'libopus',
      '-b:a', '64k',
      '-ac', '1',
      '-ar', '48000',
      '-y',
      tempOgg
    ]);

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        const oggBuffer = fs.readFileSync(tempOgg);

        // Limpar arquivos temporarios
        try {
          fs.unlinkSync(tempMp3);
          fs.unlinkSync(tempOgg);
        } catch (e) {
          console.warn('[ELEVENLABS] Aviso: Erro ao limpar arquivos temporarios');
        }

        resolve(oggBuffer);
      } else {
        // Limpar arquivos temporarios
        try {
          if (fs.existsSync(tempMp3)) fs.unlinkSync(tempMp3);
          if (fs.existsSync(tempOgg)) fs.unlinkSync(tempOgg);
        } catch (e) {}

        reject(new Error(`FFmpeg saiu com codigo ${code}`));
      }
    });

    ffmpeg.on('error', (err) => {
      // Limpar arquivos temporarios
      try {
        if (fs.existsSync(tempMp3)) fs.unlinkSync(tempMp3);
        if (fs.existsSync(tempOgg)) fs.unlinkSync(tempOgg);
      } catch (e) {}

      reject(err);
    });
  });
}

/**
 * Classe ElevenLabsService
 */
export class ElevenLabsService {
  constructor(apiKey, voiceId) {
    this.apiKey = apiKey || process.env.ELEVENLABS_API_KEY;
    this.voiceId = voiceId || process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL'; // Sarah (voz padrao)

    if (!this.apiKey) {
      console.warn('[ELEVENLABS] ⚠️ API Key nao configurada');
      this.client = null;
    } else {
      this.client = new ElevenLabsClient({
        apiKey: this.apiKey
      });
      console.log('[ELEVENLABS] ✅ Cliente inicializado');
    }
  }

  /**
   * Verificar se o servico esta disponivel
   */
  isAvailable() {
    return this.client !== null;
  }

  /**
   * Gerar audio a partir de texto
   * @param {string} texto - Texto para converter em audio
   * @param {Object} options - Opcoes de geracao
   * @returns {Buffer} - Buffer de audio OGG/Opus
   */
  async textToSpeech(texto, options = {}) {
    if (!this.client) {
      throw new Error('ElevenLabs nao esta configurado');
    }

    try {
      // Preparar texto para TTS
      const textoFormatado = prepararTextoParaTTS(texto);

      // ═══════════════════════════════════════════════════════════════
      // LIMITE DE TEXTO PARA AUDIO DE MAX 22 SEGUNDOS
      // ~500 caracteres = ~20-22 segundos em velocidade normal
      // NUNCA cortar frases no meio - sempre terminar em pontuação
      // ═══════════════════════════════════════════════════════════════
      const MAX_CHARS = 500;
      let textoLimitado = textoFormatado;

      if (textoFormatado.length > MAX_CHARS) {
        // Encontrar o último ponto de corte natural (. ! ? ou quebra de linha)
        const pontosFim = ['.', '!', '?', '\n'];
        let ultimoPonto = -1;

        // Procurar o último ponto de finalização antes do limite
        for (let i = Math.min(textoFormatado.length - 1, MAX_CHARS); i >= 0; i--) {
          if (pontosFim.includes(textoFormatado[i])) {
            ultimoPonto = i;
            break;
          }
        }

        if (ultimoPonto > 100) {
          // Cortar no ponto de finalização encontrado
          textoLimitado = textoFormatado.substring(0, ultimoPonto + 1).trim();
        } else {
          // Se não encontrou ponto, cortar na última vírgula ou espaço
          const ultimaVirgula = textoFormatado.lastIndexOf(',', MAX_CHARS);
          const ultimoEspaco = textoFormatado.lastIndexOf(' ', MAX_CHARS);
          const cortarEm = Math.max(ultimaVirgula, ultimoEspaco);

          if (cortarEm > 100) {
            textoLimitado = textoFormatado.substring(0, cortarEm).trim();
          } else {
            textoLimitado = textoFormatado.substring(0, MAX_CHARS).trim();
          }
        }

        console.log(`[ELEVENLABS] Texto cortado de ${textoFormatado.length} para ${textoLimitado.length} chars (sem cortar frases)`);
      }

      console.log(`[ELEVENLABS] Gerando audio para: "${textoLimitado.substring(0, 50)}..."`);

      // Gerar audio com ElevenLabs
      const audioStream = await this.client.textToSpeech.convert(
        options.voiceId || this.voiceId,
        {
          text: textoLimitado,
          model_id: options.model || 'eleven_multilingual_v2',
          voice_settings: {
            stability: options.stability || 0.5,
            similarity_boost: options.similarity_boost || 0.75,
            style: options.style || 0.0,
            use_speaker_boost: true
          },
          output_format: 'mp3_44100_128'
        }
      );

      // Converter stream para buffer
      const chunks = [];
      for await (const chunk of audioStream) {
        chunks.push(chunk);
      }

      const mp3Buffer = Buffer.concat(chunks);
      console.log(`[ELEVENLABS] MP3 gerado: ${mp3Buffer.length} bytes`);

      // Converter para OGG/Opus (formato WhatsApp)
      const oggBuffer = await converterMp3ParaOgg(mp3Buffer);
      console.log(`[ELEVENLABS] OGG/Opus gerado: ${oggBuffer.length} bytes`);

      return oggBuffer;

    } catch (error) {
      console.error('[ELEVENLABS] Erro ao gerar audio:', error.message);
      throw error;
    }
  }

  /**
   * Listar vozes disponiveis
   */
  async listarVozes() {
    if (!this.client) {
      throw new Error('ElevenLabs nao esta configurado');
    }

    try {
      const response = await this.client.voices.getAll();
      return response.voices.map(v => ({
        id: v.voice_id,
        name: v.name,
        category: v.category,
        labels: v.labels
      }));
    } catch (error) {
      console.error('[ELEVENLABS] Erro ao listar vozes:', error.message);
      throw error;
    }
  }
}

export default ElevenLabsService;
