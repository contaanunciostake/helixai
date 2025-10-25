/**
 * WhatsApp Service Estável - Usando whatsapp-web.js
 * Muito mais estável que Baileys!
 */

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { Client, LocalAuth } = require('whatsapp-web.js');
const QRCode = require('qrcode');
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173', 'http://localhost:5000', 'http://localhost:3000', 'http://localhost:5177'],
        methods: ['GET', 'POST'],
        credentials: true
    }
});
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5000', 'http://localhost:3000', 'http://localhost:5177'],
    credentials: true
}));
app.use(express.json());

// Armazenamento de clientes WhatsApp ativos
const activeClients = new Map();

/**
 * Converter QR code string para base64 PNG
 */
async function generateQRCodeImage(qrString) {
    try {
        const qrDataUrl = await QRCode.toDataURL(qrString, {
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
    console.log(`[Socket.io] Evento '${event}' emitido para ${room}`);
}

/**
 * Criar cliente WhatsApp para uma empresa
 */
function createWhatsAppClient(empresaId) {
    console.log(`[Empresa ${empresaId}] Criando cliente WhatsApp...`);

    const client = new Client({
        authStrategy: new LocalAuth({
            clientId: `empresa_${empresaId}`,
            dataPath: './sessions'
        }),
        puppeteer: {
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--disable-gpu',
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process'
            ],
            timeout: 60000 // 60 segundos de timeout
        },
        webVersionCache: {
            type: 'remote',
            remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
        }
    });

    // Armazenar informações do cliente
    const clientInfo = {
        client,
        qr: null,
        qrImage: null,
        connected: false,
        numero: null,
        lastUpdate: new Date(),
        isReady: false
    };

    activeClients.set(empresaId, clientInfo);

    // Event: QR Code gerado
    client.on('qr', async (qr) => {
        console.log(`[Empresa ${empresaId}] QR Code gerado`);
        const info = activeClients.get(empresaId);
        if (info) {
            info.qr = qr;
            info.qrImage = await generateQRCodeImage(qr);
            info.lastUpdate = new Date();

            emitToEmpresa(empresaId, 'qr-generated', {
                qr: info.qrImage,
                message: 'QR Code gerado. Escaneie com o WhatsApp.'
            });
        }
    });

    // Event: Autenticação bem-sucedida
    client.on('authenticated', () => {
        console.log(`[Empresa ${empresaId}] Autenticado com sucesso`);
    });

    // Event: Falha na autenticação
    client.on('auth_failure', (msg) => {
        console.error(`[Empresa ${empresaId}] Falha na autenticação:`, msg);
        emitToEmpresa(empresaId, 'connection-lost', {
            connected: false,
            message: 'Falha na autenticação. Tente novamente.'
        });
    });

    // Event: Cliente pronto (conectado)
    client.on('ready', () => {
        console.log(`[Empresa ${empresaId}] WhatsApp conectado e pronto!`);
        const info = activeClients.get(empresaId);
        if (info) {
            info.connected = true;
            info.isReady = true;
            info.qr = null;
            info.qrImage = null;
            info.numero = client.info?.wid?.user || null;
            info.lastUpdate = new Date();

            emitToEmpresa(empresaId, 'connection-success', {
                connected: true,
                numero: info.numero,
                message: 'WhatsApp conectado com sucesso!'
            });

            // Notificar backend
            notifyBackend(empresaId, 'connected', {
                numero: info.numero
            });
        }
    });

    // Event: Desconectado
    client.on('disconnected', (reason) => {
        console.log(`[Empresa ${empresaId}] Desconectado:`, reason);
        const info = activeClients.get(empresaId);
        if (info) {
            info.connected = false;
            info.isReady = false;
            info.numero = null;
            info.lastUpdate = new Date();
        }

        emitToEmpresa(empresaId, 'connection-lost', {
            connected: false,
            message: 'Conexão perdida. Clique em "Conectar WhatsApp" novamente.'
        });

        // Notificar backend
        notifyBackend(empresaId, 'disconnected', {});

        // Limpar da lista de clientes ativos
        activeClients.delete(empresaId);
    });

    // Event: Mensagem recebida
    client.on('message', async (message) => {
        if (message.fromMe) return; // Ignorar mensagens próprias

        console.log(`[Empresa ${empresaId}] Mensagem de ${message.from}: ${message.body}`);

        // Enviar para backend processar
        notifyBackend(empresaId, 'message_received', {
            from: message.from,
            text: message.body,
            timestamp: message.timestamp,
            messageId: message.id._serialized
        });
    });

    // Event: Erro no loading
    client.on('loading_screen', (percent, message) => {
        console.log(`[Empresa ${empresaId}] Carregando: ${percent}% - ${message}`);
    });

    // Event: Erro remoto (WhatsApp Web)
    client.on('remote_session_saved', () => {
        console.log(`[Empresa ${empresaId}] Sessão remota salva`);
    });

    // Event: Estado do cliente mudou
    client.on('change_state', (state) => {
        console.log(`[Empresa ${empresaId}] Estado mudou para: ${state}`);
    });

    // Inicializar cliente com retry
    const initializeWithRetry = async (retries = 3) => {
        for (let i = 0; i < retries; i++) {
            try {
                console.log(`[Empresa ${empresaId}] Tentativa de inicialização ${i + 1}/${retries}...`);
                await client.initialize();
                console.log(`[Empresa ${empresaId}] ✅ Cliente inicializado com sucesso!`);
                return;
            } catch (err) {
                console.error(`[Empresa ${empresaId}] ❌ Erro na tentativa ${i + 1}:`, err.message);

                // Se foi a última tentativa, remover da lista e notificar
                if (i === retries - 1) {
                    console.error(`[Empresa ${empresaId}] ❌ Todas as tentativas falharam. Removendo cliente.`);
                    activeClients.delete(empresaId);

                    emitToEmpresa(empresaId, 'connection-lost', {
                        connected: false,
                        message: `Erro ao inicializar WhatsApp: ${err.message}. Tente novamente ou reinicie o serviço.`
                    });
                    return;
                }

                // Aguardar 2 segundos antes da próxima tentativa
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
    };

    initializeWithRetry();

    return client;
}

/**
 * Notificar backend Flask sobre eventos WhatsApp
 */
async function notifyBackend(empresaId, event, data) {
    try {
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

        // Enviar status atual
        const clientInfo = activeClients.get(empresaId);
        if (clientInfo) {
            socket.emit('current-status', {
                empresaId,
                connected: clientInfo.connected && clientInfo.isReady,
                qr: clientInfo.qrImage || null,
                numero: clientInfo.numero,
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

// Iniciar sessão WhatsApp
app.post('/api/session/start', async (req, res) => {
    const { empresaId } = req.body;

    if (!empresaId) {
        return res.status(400).json({ error: 'empresaId é obrigatório' });
    }

    try {
        console.log(`[API] Iniciando sessão para empresa ${empresaId}...`);

        // Verificar se já existe cliente ativo
        const existingClient = activeClients.get(empresaId);

        if (existingClient) {
            console.log(`[API] Cliente já existe para empresa ${empresaId}`);

            if (existingClient.connected && existingClient.isReady) {
                console.log(`[API] Cliente já conectado`);
                return res.json({
                    success: true,
                    message: 'WhatsApp já conectado',
                    connected: true,
                    numero: existingClient.numero
                });
            } else if (existingClient.qrImage) {
                console.log(`[API] QR Code já disponível`);
                return res.json({
                    success: true,
                    message: 'QR Code disponível',
                    qr: existingClient.qrImage,
                    connected: false
                });
            } else {
                console.log(`[API] Cliente existe mas não está pronto. Removendo e recriando...`);
                // Cliente existe mas não tem QR nem está conectado - remover e criar novo
                try {
                    await existingClient.client.destroy();
                } catch (e) {
                    console.log(`[API] Erro ao destruir cliente antigo (ignorado):`, e.message);
                }
                activeClients.delete(empresaId);
            }
        }

        // Criar novo cliente
        console.log(`[API] Criando novo cliente para empresa ${empresaId}...`);
        createWhatsAppClient(empresaId);

        // Aguardar QR code ser gerado (máximo 30 segundos)
        console.log(`[API] Aguardando QR Code (máximo 30 segundos)...`);
        for (let i = 0; i < 60; i++) {
            await new Promise(resolve => setTimeout(resolve, 500));
            const clientInfo = activeClients.get(empresaId);

            if (!clientInfo) {
                // Cliente foi removido (erro de inicialização)
                console.log(`[API] Cliente foi removido (erro de inicialização)`);
                return res.status(500).json({
                    success: false,
                    error: 'Erro ao inicializar WhatsApp. Verifique se o Chrome/Chromium está instalado e tente novamente.'
                });
            }

            if (clientInfo?.qrImage) {
                console.log(`[API] ✅ QR Code gerado com sucesso!`);
                return res.json({
                    success: true,
                    message: 'QR Code gerado com sucesso',
                    qr: clientInfo.qrImage,
                    connected: false
                });
            }

            if (clientInfo?.connected) {
                console.log(`[API] ✅ WhatsApp conectado!`);
                return res.json({
                    success: true,
                    message: 'WhatsApp conectado',
                    connected: true,
                    numero: clientInfo.numero
                });
            }

            // Log a cada 5 segundos
            if (i % 10 === 0 && i > 0) {
                console.log(`[API] Ainda aguardando... (${i/2} segundos)`);
            }
        }

        console.log(`[API] ⚠️ Timeout ao aguardar QR Code`);
        return res.json({
            success: true,
            message: 'Sessão iniciada, aguarde o QR Code aparecer ou atualize a página...',
            qr: null,
            connected: false
        });

    } catch (error) {
        console.error('[API] ❌ Erro ao iniciar sessão:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Erro desconhecido ao iniciar sessão'
        });
    }
});

// Obter status da sessão (por path param)
app.get('/api/session/status/:empresaId', (req, res) => {
    const { empresaId } = req.params;
    const clientInfo = activeClients.get(parseInt(empresaId));

    if (!clientInfo) {
        return res.json({
            success: true,
            connected: false,
            qr: null,
            numero: null
        });
    }

    res.json({
        success: true,
        connected: clientInfo.connected && clientInfo.isReady,
        qr: clientInfo.qrImage,
        numero: clientInfo.numero,
        lastUpdate: clientInfo.lastUpdate
    });
});

// Obter status da sessão (por query param - para compatibilidade com backend Flask)
app.get('/api/session/status', (req, res) => {
    const empresaId = parseInt(req.query.empresaId);

    if (!empresaId) {
        return res.status(400).json({ error: 'empresaId é obrigatório' });
    }

    const clientInfo = activeClients.get(empresaId);

    if (!clientInfo) {
        return res.json({
            success: true,
            connected: false,
            qr: null,
            numero: null
        });
    }

    res.json({
        success: true,
        connected: clientInfo.connected && clientInfo.isReady,
        qr: clientInfo.qrImage,
        numero: clientInfo.numero,
        lastUpdate: clientInfo.lastUpdate
    });
});

// Desconectar sessão
app.post('/api/session/disconnect', async (req, res) => {
    const { empresaId } = req.body;

    if (!empresaId) {
        return res.status(400).json({ error: 'empresaId é obrigatório' });
    }

    const clientInfo = activeClients.get(empresaId);

    if (!clientInfo) {
        return res.json({ success: true, message: 'Nenhuma sessão ativa' });
    }

    try {
        await clientInfo.client.logout();
        activeClients.delete(empresaId);

        res.json({ success: true, message: 'Sessão desconectada' });
    } catch (error) {
        console.error('Erro ao desconectar:', error);
        activeClients.delete(empresaId);
        res.json({ success: true, message: 'Sessão removida' });
    }
});

// Enviar mensagem
app.post('/api/message/send', async (req, res) => {
    const { empresaId, to, text } = req.body;

    if (!empresaId || !to || !text) {
        return res.status(400).json({ error: 'empresaId, to e text são obrigatórios' });
    }

    const clientInfo = activeClients.get(empresaId);

    if (!clientInfo || !clientInfo.connected || !clientInfo.isReady) {
        return res.status(400).json({ error: 'WhatsApp não está conectado' });
    }

    try {
        await clientInfo.client.sendMessage(to, text);
        res.json({ success: true, message: 'Mensagem enviada' });
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        res.status(500).json({ error: error.message });
    }
});

// Limpar sessão
app.post('/api/session/clear', async (req, res) => {
    const { empresaId } = req.body;

    if (!empresaId) {
        return res.status(400).json({ error: 'empresaId é obrigatório' });
    }

    try {
        const clientInfo = activeClients.get(empresaId);
        if (clientInfo) {
            try {
                await clientInfo.client.destroy();
            } catch (err) {
                console.log('Erro ao destruir cliente (ignorado):', err.message);
            }
            activeClients.delete(empresaId);
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
        activeSessions: activeClients.size,
        uptime: process.uptime(),
        library: 'whatsapp-web.js'
    });
});

// Iniciar servidor
server.listen(PORT, () => {
    console.log('='.repeat(70));
    console.log('WHATSAPP SERVICE ESTÁVEL - whatsapp-web.js + Socket.io');
    console.log('='.repeat(70));
    console.log(`Servidor HTTP rodando em http://localhost:${PORT}`);
    console.log(`Socket.io rodando em http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log('='.repeat(70));
    console.log('✅ Muito mais estável que Baileys!');
    console.log('✅ Reconexão automática');
    console.log('✅ Gerenciamento de sessões por empresa');
    console.log('='.repeat(70));
});
