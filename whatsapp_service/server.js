/**
 * VendeAI - Serviço de Integração WhatsApp Web
 * Usando Baileys (WhatsApp Web API)
 */

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const QRCode = require('qrcode-terminal');
const qrcodeImage = require('qrcode');
const pino = require('pino');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173', 'http://localhost:5000', 'http://localhost:3000', 'http://localhost:5177'],
        methods: ['GET', 'POST'],
        credentials: true
    }
});
const PORT = 3001;

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5000', 'http://localhost:3000', 'http://localhost:5177'],
    credentials: true
}));
app.use(express.json());

// Armazenamento de sessões ativas
const activeSessions = new Map();

// Logger
const logger = pino({ level: 'info' });

/**
 * Converter QR code string para base64 PNG
 */
async function generateQRCodeImage(qrString) {
    try {
        const qrDataUrl = await qrcodeImage.toDataURL(qrString, {
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });
        return qrDataUrl;
    } catch (error) {
        console.error('Erro ao gerar imagem QR:', error);
        return null;
    }
}

/**
 * Emitir evento Socket.io para empresa específica
 */
function emitToEmpresa(empresaId, event, data) {
    const room = `empresa_${empresaId}`;
    io.to(room).emit(event, {
        empresaId,
        timestamp: new Date().toISOString(),
        ...data
    });
    console.log(`[Socket.io] Evento '${event}' emitido para ${room}:`, JSON.stringify(data).substring(0, 100));
}

/**
 * Criar nova sessão WhatsApp
 */
async function createWhatsAppSession(empresaId) {
    const sessionPath = `./sessions/session_${empresaId}`;

    try {
        // Carregar estado de autenticação
        const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

        // Criar socket WhatsApp
        const sock = makeWASocket({
            auth: state,
            logger: pino({ level: 'silent' }),
            browser: ['VendeAI', 'Chrome', '10.0']
        });

        // Armazenar sessão
        activeSessions.set(empresaId, {
            sock,
            qr: null,
            connected: false,
            numero: null,
            lastUpdate: new Date()
        });

        // Event: Atualização de conexão
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            // QR Code gerado
            if (qr) {
                console.log(`[Empresa ${empresaId}] QR Code gerado`);
                const session = activeSessions.get(empresaId);
                if (session) {
                    session.qr = qr;
                    session.lastUpdate = new Date();

                    // Converter QR para base64 e emitir via Socket.io
                    generateQRCodeImage(qr).then(qrImage => {
                        session.qrImage = qrImage;
                        emitToEmpresa(empresaId, 'qr-generated', {
                            qr: qrImage,
                            message: 'QR Code gerado. Escaneie com o WhatsApp.'
                        });
                    });
                }
            }

            // Conexão estabelecida
            if (connection === 'open') {
                console.log(`[Empresa ${empresaId}] WhatsApp conectado!`);
                const session = activeSessions.get(empresaId);
                if (session) {
                    session.connected = true;
                    session.qr = null;
                    session.qrImage = null;
                    session.numero = sock.user?.id || null;
                    session.lastUpdate = new Date();
                }

                // Emitir evento Socket.io de conexão estabelecida
                emitToEmpresa(empresaId, 'connection-success', {
                    connected: true,
                    numero: sock.user?.id,
                    message: 'WhatsApp conectado com sucesso!'
                });

                // Notificar backend Flask sobre conexão bem-sucedida
                notifyBackend(empresaId, 'connected', {
                    numero: sock.user?.id
                });
            }

            // Desconexão
            if (connection === 'close') {
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

                console.log(`[Empresa ${empresaId}] Conexão fechada. Status: ${statusCode}, Reconectar? ${shouldReconnect}`);

                // Emitir evento de desconexão
                emitToEmpresa(empresaId, 'connection-lost', {
                    connected: false,
                    message: shouldReconnect ? 'Conexão perdida. Tentando reconectar...' : 'Desconectado do WhatsApp'
                });

                if (shouldReconnect) {
                    // Tentar reconectar
                    setTimeout(() => createWhatsAppSession(empresaId), 3000);
                } else {
                    // Usuário fez logout - limpar sessão
                    console.log(`[Empresa ${empresaId}] Limpando sessão antiga...`);
                    activeSessions.delete(empresaId);
                    notifyBackend(empresaId, 'disconnected', {});

                    // Limpar arquivos de sessão para forçar novo QR code
                    const fs = require('fs');
                    const sessionPath = `./sessions/session_${empresaId}`;
                    if (fs.existsSync(sessionPath)) {
                        fs.rmSync(sessionPath, { recursive: true, force: true });
                        console.log(`[Empresa ${empresaId}] Arquivos de sessão removidos`);
                    }
                }
            }
        });

        // Event: Atualizar credenciais
        sock.ev.on('creds.update', saveCreds);

        // Event: Mensagem recebida
        sock.ev.on('messages.upsert', async ({ messages }) => {
            for (const message of messages) {
                if (message.key.fromMe) continue; // Ignorar mensagens próprias

                const from = message.key.remoteJid;
                const text = message.message?.conversation ||
                             message.message?.extendedTextMessage?.text || '';

                console.log(`[Empresa ${empresaId}] Mensagem de ${from}: ${text}`);

                // Enviar mensagem para backend Flask processar
                notifyBackend(empresaId, 'message_received', {
                    from,
                    text,
                    timestamp: message.messageTimestamp,
                    messageId: message.key.id
                });
            }
        });

        return sock;

    } catch (error) {
        console.error(`[Empresa ${empresaId}] Erro ao criar sessão:`, error);
        throw error;
    }
}

/**
 * Notificar backend Flask sobre eventos WhatsApp
 */
async function notifyBackend(empresaId, event, data) {
    try {
        const axios = require('axios');
        const BACKEND_URL = 'http://localhost:5000';

        let endpoint = '';
        let payload = { empresaId, ...data };

        if (event === 'message_received') {
            endpoint = '/api/webhook/whatsapp/message';
        } else if (event === 'connected' || event === 'disconnected') {
            endpoint = '/api/webhook/whatsapp/connection';
            payload.event = event;
        }

        if (endpoint) {
            console.log(`[Backend] Enviando evento ${event} para ${BACKEND_URL}${endpoint}`);
            const response = await axios.post(`${BACKEND_URL}${endpoint}`, payload, {
                timeout: 10000,
                headers: { 'Content-Type': 'application/json' }
            });
            console.log(`[Backend] ✅ Resposta: ${response.data.success ? 'OK' : 'ERRO'}`);
        } else {
            console.log(`[Backend] Evento ${event} (sem webhook): ${JSON.stringify(data)}`);
        }
    } catch (error) {
        console.error('[Backend] ❌ Erro ao notificar:', error.message);
    }
}

/**
 * Socket.io - Gerenciar conexões
 */
io.on('connection', (socket) => {
    console.log(`[Socket.io] Cliente conectado: ${socket.id}`);

    // Cliente se junta a uma sala específica da empresa
    socket.on('join-empresa', (empresaId) => {
        const room = `empresa_${empresaId}`;
        socket.join(room);
        console.log(`[Socket.io] Cliente ${socket.id} entrou na sala ${room}`);

        // Enviar status atual da empresa
        const session = activeSessions.get(empresaId);
        if (session) {
            socket.emit('current-status', {
                empresaId,
                connected: session.connected,
                qr: session.qrImage || null,
                numero: session.numero,
                timestamp: new Date().toISOString()
            });
        } else {
            socket.emit('current-status', {
                empresaId,
                connected: false,
                qr: null,
                numero: null,
                timestamp: new Date().toISOString()
            });
        }
    });

    socket.on('disconnect', () => {
        console.log(`[Socket.io] Cliente desconectado: ${socket.id}`);
    });
});

/**
 * API Routes
 */

// Iniciar nova sessão WhatsApp
app.post('/api/session/start', async (req, res) => {
    const { empresaId } = req.body;

    if (!empresaId) {
        return res.status(400).json({ error: 'empresaId é obrigatório' });
    }

    try {
        // Verificar se já existe sessão ativa
        if (activeSessions.has(empresaId)) {
            const session = activeSessions.get(empresaId);

            return res.json({
                success: true,
                message: 'Sessão já existe',
                qr: session.qr,
                connected: session.connected,
                numero: session.numero
            });
        }

        // Criar nova sessão
        await createWhatsAppSession(empresaId);

        // Aguardar QR code ser gerado (máximo 5 segundos)
        for (let i = 0; i < 10; i++) {
            await new Promise(resolve => setTimeout(resolve, 500));
            const session = activeSessions.get(empresaId);
            if (session?.qrImage) {
                return res.json({
                    success: true,
                    message: 'QR Code gerado',
                    qr: session.qrImage, // Retorna base64 PNG
                    connected: false
                });
            }
        }

        return res.json({
            success: true,
            message: 'Sessão iniciada, aguardando QR Code...',
            qr: null,
            connected: false
        });

    } catch (error) {
        console.error('Erro ao iniciar sessão:', error);
        res.status(500).json({ error: error.message });
    }
});

// Obter status da sessão
app.get('/api/session/status/:empresaId', (req, res) => {
    const { empresaId } = req.params;
    const session = activeSessions.get(parseInt(empresaId));

    if (!session) {
        return res.json({
            success: true,
            connected: false,
            qr: null,
            numero: null
        });
    }

    res.json({
        success: true,
        connected: session.connected,
        qr: session.qr,
        numero: session.numero,
        lastUpdate: session.lastUpdate
    });
});

// Desconectar sessão
app.post('/api/session/disconnect', async (req, res) => {
    const { empresaId } = req.body;

    if (!empresaId) {
        return res.status(400).json({ error: 'empresaId é obrigatório' });
    }

    const session = activeSessions.get(empresaId);

    if (!session) {
        return res.json({ success: true, message: 'Nenhuma sessão ativa' });
    }

    try {
        await session.sock.logout();
        activeSessions.delete(empresaId);

        res.json({ success: true, message: 'Sessão desconectada' });
    } catch (error) {
        console.error('Erro ao desconectar:', error);
        res.status(500).json({ error: error.message });
    }
});

// Enviar mensagem
app.post('/api/message/send', async (req, res) => {
    const { empresaId, to, text } = req.body;

    if (!empresaId || !to || !text) {
        return res.status(400).json({ error: 'empresaId, to e text são obrigatórios' });
    }

    const session = activeSessions.get(empresaId);

    if (!session || !session.connected) {
        return res.status(400).json({ error: 'WhatsApp não está conectado' });
    }

    try {
        // Formatar número (adicionar @s.whatsapp.net se necessário)
        const jid = to.includes('@') ? to : `${to}@s.whatsapp.net`;

        await session.sock.sendMessage(jid, { text });

        res.json({ success: true, message: 'Mensagem enviada' });
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        res.status(500).json({ error: error.message });
    }
});

// Limpar sessão (forçar novo QR code)
app.post('/api/session/clear', async (req, res) => {
    const { empresaId } = req.body;

    if (!empresaId) {
        return res.status(400).json({ error: 'empresaId é obrigatório' });
    }

    try {
        // Remover sessão ativa
        const session = activeSessions.get(empresaId);
        if (session) {
            try {
                await session.sock.logout();
            } catch (err) {
                // Ignorar erro de logout se já desconectado
            }
            activeSessions.delete(empresaId);
        }

        // Limpar arquivos de sessão
        const fs = require('fs');
        const sessionPath = `./sessions/session_${empresaId}`;
        if (fs.existsSync(sessionPath)) {
            fs.rmSync(sessionPath, { recursive: true, force: true });
            console.log(`[Empresa ${empresaId}] Sessão limpa com sucesso`);
        }

        res.json({
            success: true,
            message: 'Sessão limpa. Você pode gerar um novo QR Code agora.'
        });
    } catch (error) {
        console.error('Erro ao limpar sessão:', error);
        res.status(500).json({ error: error.message });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        activeSessions: activeSessions.size,
        uptime: process.uptime()
    });
});

// Iniciar servidor
server.listen(PORT, () => {
    console.log('='.repeat(70));
    console.log('VENDEAI - SERVIÇO WHATSAPP WEB + SOCKET.IO');
    console.log('='.repeat(70));
    console.log(`Servidor HTTP rodando em http://localhost:${PORT}`);
    console.log(`Socket.io rodando em http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log('='.repeat(70));
    console.log('Eventos Socket.io disponíveis:');
    console.log('  - qr-generated: Quando QR code é gerado');
    console.log('  - connection-success: Quando WhatsApp conecta');
    console.log('  - connection-lost: Quando WhatsApp desconecta');
    console.log('='.repeat(70));
});
