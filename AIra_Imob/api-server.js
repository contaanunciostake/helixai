/**
 * API Server para AIra Imob (Bot de Imóveis)
 *
 * Expõe endpoint HTTP para receber mensagens do backend Flask
 * e processar com toda a lógica de IA do bot.
 *
 * Porta: 4001
 */

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const PORT = 4001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Armazenar instância do bot (será inicializada quando core.js conectar)
let botInstance = null;

/**
 * Registrar instância do bot
 * Esta função será chamada pelo core.js após conectar ao WhatsApp
 */
export function registrarBot(instance) {
    botInstance = instance;
    console.log('[API-SERVER] ✅ Instância do bot registrada');
}

/**
 * Endpoint principal: Processar mensagem recebida do backend
 *
 * POST /api/processar-mensagem
 * Body: {
 *   texto: string,
 *   telefone: string,
 *   lead_id: number,
 *   conversa_id: number
 * }
 */
app.post('/api/processar-mensagem', async (req, res) => {
    try {
        const { texto, telefone, lead_id, conversa_id } = req.body;

        console.log(`\n🏢 [API-IMOB] Mensagem recebida:`);
        console.log(`   Telefone: ${telefone}`);
        console.log(`   Texto: ${texto}`);
        console.log(`   Lead ID: ${lead_id}`);
        console.log(`   Conversa ID: ${conversa_id}`);

        // Validar dados
        if (!texto || !telefone) {
            return res.status(400).json({
                success: false,
                error: 'Texto e telefone são obrigatórios'
            });
        }

        // Verificar se bot está pronto
        if (!botInstance) {
            console.log('[API-IMOB] ⚠️ Bot ainda não está pronto');
            return res.json({
                success: true,
                resposta: 'Olá! Estou iniciando o sistema. Aguarde alguns segundos e tente novamente.',
                usar_audio: false
            });
        }

        // Processar mensagem com o bot
        const resposta = await processarComBot(texto, telefone, lead_id, conversa_id);

        res.json({
            success: true,
            resposta: resposta,
            usar_audio: false
        });

    } catch (error) {
        console.error('[API-IMOB] ❌ Erro ao processar mensagem:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            resposta: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.'
        });
    }
});

/**
 * Processar mensagem com a lógica completa do bot
 */
async function processarComBot(texto, telefone, lead_id, conversa_id) {
    // TODO: Integrar com a lógica completa do core.js
    // Por enquanto, resposta temporária

    console.log('[API-IMOB] 🤖 Processando com AIra Imob...');

    // Aqui você chamaria a função de processamento do bot
    // Exemplo: await botInstance.processarMensagem(texto, telefone);

    return `🏢 AIra Imob recebeu sua mensagem: "${texto}". Estou processando...`;
}

/**
 * Health check
 */
app.get('/health', (req, res) => {
    res.json({
        status: 'online',
        bot: 'AIra Imob (Imóveis)',
        nicho: 'imoveis',
        bot_pronto: botInstance !== null
    });
});

/**
 * Endpoint de envio de mensagem via WhatsApp
 * Usado pelo bot para enviar mensagens via whatsapp_service_stable
 */
export async function enviarMensagem(telefone, texto) {
    try {
        const axios = (await import('axios')).default;

        const response = await axios.post('http://localhost:3001/api/message/send', {
            empresaId: 1, // ID da empresa AIra Imob
            to: telefone,
            text: texto
        });

        console.log(`[API-IMOB] ✅ Mensagem enviada para ${telefone}`);
        return response.data;
    } catch (error) {
        console.error(`[API-IMOB] ❌ Erro ao enviar mensagem:`, error.message);
        throw error;
    }
}

// Iniciar servidor
app.listen(PORT, () => {
    console.log('\n' + '='.repeat(70));
    console.log('🏢 AIra Imob - API Server');
    console.log('='.repeat(70));
    console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
    console.log(`✅ Health check: http://localhost:${PORT}/health`);
    console.log(`✅ Endpoint: POST http://localhost:${PORT}/api/processar-mensagem`);
    console.log('='.repeat(70));
    console.log('⏳ Aguardando conexão do bot principal...\n');
});

export default app;
