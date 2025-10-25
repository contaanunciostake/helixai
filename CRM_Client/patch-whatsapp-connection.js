/**
 * ════════════════════════════════════════════════════════════════════════════
 * PATCH: Corrigir Conexão WhatsApp no CRM
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Este script corrige o App.jsx para usar o novo bot-api-server (porta 3010)
 * ao invés das APIs antigas (portas 5000 e 3001)
 *
 * USO: node patch-whatsapp-connection.js
 *
 * ════════════════════════════════════════════════════════════════════════════
 */

import fs from 'fs';
import path from 'path';

const APP_JSX_PATH = './crm-client-app/src/App.jsx';
const BACKUP_PATH = './crm-client-app/src/App.jsx.backup-whatsapp-fix';

console.log('🔧 Patch: Corrigir Conexão WhatsApp no CRM\n');

// Verificar se App.jsx existe
if (!fs.existsSync(APP_JSX_PATH)) {
  console.error('❌ Erro: App.jsx não encontrado em:', APP_JSX_PATH);
  console.error('💡 Execute este script na pasta CRM_Client');
  process.exit(1);
}

// Ler App.jsx
let content = fs.readFileSync(APP_JSX_PATH, 'utf-8');

// Criar backup
console.log('📦 Criando backup...');
fs.writeFileSync(BACKUP_PATH, content);
console.log(`✅ Backup criado: ${BACKUP_PATH}\n`);

// ══════════════════════════════════════════════════════════════
// PATCH 1: Substituir URLs antigas pelas novas
// ══════════════════════════════════════════════════════════════
console.log('🔧 [1/5] Corrigindo URLs da API...');

const oldAPIs = `const VENDEAI_API_URL = 'http://localhost:5000'
const WHATSAPP_SERVICE_URL = 'http://localhost:3001'`;

const newAPIs = `// ✅ CORRIGIDO: Nova API do bot-api-server
const BOT_API_URL = 'http://localhost:3010'
const BOT_WS_URL = 'ws://localhost:3010/ws'

// APIs antigas desabilitadas (não funcionam mais)
// const VENDEAI_API_URL = 'http://localhost:5000'  // ❌ Não existe
// const WHATSAPP_SERVICE_URL = 'http://localhost:3001'  // ❌ Não existe`;

content = content.replace(oldAPIs, newAPIs);
console.log('✅ URLs corrigidas\n');

// ══════════════════════════════════════════════════════════════
// PATCH 2: Comentar useEffect de busca de nicho (API antiga)
// ══════════════════════════════════════════════════════════════
console.log('🔧 [2/5] Desabilitando código de API antiga (nicho)...');

const nichoFetchPattern = /\/\/ Buscar nicho da empresa ao carregar componente\s+useEffect\(\(\) => \{[\s\S]*?fetchEmpresaNicho\(\)\s+\}, \[\]\)/;

if (nichoFetchPattern.test(content)) {
  content = content.replace(nichoFetchPattern, (match) => {
    return `// ❌ DESABILITADO: API antiga não existe mais
  /* ${match} */`;
  });
  console.log('✅ Código de nicho desabilitado\n');
} else {
  console.log('⚠️  Código de nicho não encontrado (pode já estar corrigido)\n');
}

// ══════════════════════════════════════════════════════════════
// PATCH 3: Comentar useEffect de busca de status (API antiga)
// ══════════════════════════════════════════════════════════════
console.log('🔧 [3/5] Desabilitando código de API antiga (status)...');

const statusFetchPattern = /\/\/ Buscar estado do bot ao carregar componente\s+useEffect\(\(\) => \{[\s\S]*?fetchBotStatus\(\)\s+\}, \[\]\)/;

if (statusFetchPattern.test(content)) {
  content = content.replace(statusFetchPattern, (match) => {
    return `// ❌ DESABILITADO: API antiga não existe mais
  /* ${match} */`;
  });
  console.log('✅ Código de status desabilitado\n');
} else {
  console.log('⚠️  Código de status não encontrado (pode já estar corrigido)\n');
}

// ══════════════════════════════════════════════════════════════
// PATCH 4: Comentar useEffect de Socket.IO (API antiga)
// ══════════════════════════════════════════════════════════════
console.log('🔧 [4/5] Desabilitando Socket.IO antigo...');

const socketPattern = /\/\/ Conectar ao WhatsApp Service via Socket\.io\s+useEffect\(\(\) => \{[\s\S]*?setSocket\(socketConnection\)\s+return[\s\S]*?\}, \[\]\)/;

if (socketPattern.test(content)) {
  content = content.replace(socketPattern, (match) => {
    return `// ❌ DESABILITADO: Socket.IO antigo não existe mais
  /* ${match} */

  // ✅ NOVO: WebSocket para bot-api-server
  useEffect(() => {
    if (typeof window === 'undefined') return;

    console.log('[CRM] Conectando ao Bot API Server...');
    let ws = null;

    const connectWebSocket = () => {
      try {
        ws = new WebSocket(BOT_WS_URL);

        ws.onopen = () => {
          console.log('[CRM] ✅ Conectado ao Bot API Server');
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            console.log('[CRM] 📨 Mensagem recebida:', message);

            if (message.type === 'status') {
              const status = message.data.connectionStatus;
              setBotStatus(status);

              if (status === 'connected') {
                setShowQRCode(false);
                setWhatsappNumber(message.data.phoneNumber);
                showNotificationMsg('WhatsApp conectado com sucesso!');
              } else if (status === 'disconnected') {
                setShowQRCode(false);
                setWhatsappNumber(null);
              }
            } else if (message.type === 'qr') {
              console.log('[CRM] 📱 QR Code recebido');
              setQrCodeValue(message.data.qrCode);
              setShowQRCode(true);
              setBotStatus('connecting');
              showNotificationMsg('QR Code gerado! Escaneie com seu WhatsApp');
            }
          } catch (error) {
            console.error('[CRM] ❌ Erro ao processar mensagem:', error);
          }
        };

        ws.onerror = (error) => {
          console.error('[CRM] ❌ Erro no WebSocket:', error);
          showNotificationMsg('Erro ao conectar com o bot. Verifique se está rodando.');
        };

        ws.onclose = () => {
          console.log('[CRM] ❌ WebSocket desconectado');
          setTimeout(() => {
            console.log('[CRM] 🔄 Tentando reconectar...');
            connectWebSocket();
          }, 3000);
        };
      } catch (error) {
        console.error('[CRM] ❌ Erro ao criar WebSocket:', error);
      }
    };

    connectWebSocket();

    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [])`;
  });
  console.log('✅ Socket.IO substituído por WebSocket\n');
} else {
  console.log('⚠️  Socket.IO não encontrado (pode já estar corrigido)\n');
}

// ══════════════════════════════════════════════════════════════
// PATCH 5: Corrigir função generateQRCode
// ══════════════════════════════════════════════════════════════
console.log('🔧 [5/5] Corrigindo função generateQRCode...');

const generateQRPattern = /const generateQRCode = async \(\) => \{[\s\S]*?\/\/ Usar CRM Bridge API[\s\S]*?const response = await fetch\(`\$\{VENDEAI_API_URL\}\/api\/crm\/whatsapp\/start`[\s\S]*?\}\s+catch/;

if (generateQRPattern.test(content)) {
  content = content.replace(generateQRPattern, `const generateQRCode = async () => {
    if (isConnecting) {
      console.log('[CRM] Já está conectando, ignorando clique duplicado');
      return;
    }

    try {
      setIsConnecting(true);
      setBotStatus('connecting');
      showNotificationMsg('Solicitando QR Code...');

      // ✅ Chamar nova API
      const response = await fetch(\`\${BOT_API_URL}/api/bot/qr\`);

      if (response.ok) {
        const data = await response.json();

        if (data.success && data.data.qrCode) {
          setQrCodeValue(data.data.qrCode);
          setShowQRCode(true);
          showNotificationMsg('QR Code recebido! Escaneie com seu WhatsApp');
        } else {
          showNotificationMsg('Bot ainda não gerou QR code. Aguarde...');
        }
      } else if (response.status === 404) {
        showNotificationMsg('QR code não disponível. Bot pode já estar conectado.');
      }
    } catch`);
  console.log('✅ generateQRCode corrigida\n');
} else {
  console.log('⚠️  generateQRCode não encontrada (pode já estar corrigida)\n');
}

// ══════════════════════════════════════════════════════════════
// Salvar arquivo corrigido
// ══════════════════════════════════════════════════════════════
fs.writeFileSync(APP_JSX_PATH, content);

console.log('════════════════════════════════════════════════════════════════');
console.log('✅ PATCH APLICADO COM SUCESSO!');
console.log('════════════════════════════════════════════════════════════════');
console.log(`📦 Backup: ${BACKUP_PATH}`);
console.log(`📝 App.jsx corrigido com sucesso!`);
console.log('\n📋 PRÓXIMOS PASSOS:');
console.log('   1. Certifique-se de que o bot está rodando:');
console.log('      cd ../VendeAI/bot_engine');
console.log('      node main.js');
console.log('   ');
console.log('   2. Inicie o CRM:');
console.log('      cd crm-client-app');
console.log('      npm run dev');
console.log('   ');
console.log('   3. Acesse: http://localhost:5177');
console.log('   4. Vá na página "Bot" e clique em "Conectar WhatsApp"');
console.log('════════════════════════════════════════════════════════════════\n');
console.log('💡 Se algo der errado, restaure o backup:');
console.log(`   cp ${BACKUP_PATH} ${APP_JSX_PATH}`);
console.log('════════════════════════════════════════════════════════════════\n');
