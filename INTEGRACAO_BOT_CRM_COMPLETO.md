# 🤖 Integração Completa: VendeAI Bot + CRM do Cliente

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Instalação e Configuração](#instalação-e-configuração)
4. [Como Usar](#como-usar)
5. [Solução de Problemas](#solução-de-problemas)
6. [API Reference](#api-reference)

---

## 🎯 Visão Geral

Esta integração permite que o **CRM do Cliente** controle o **bot VendeAI** através de uma interface web moderna. O cliente pode:

✅ Ver o QR code do WhatsApp diretamente no CRM
✅ Conectar/desconectar o WhatsApp pelo navegador
✅ Visualizar status da conexão em tempo real
✅ Ativar/desativar o bot sem usar o terminal
✅ Receber atualizações instantâneas via WebSocket

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTE (Browser)                        │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │          CRM Cliente (React - localhost:5177)            │  │
│  │                                                           │  │
│  │  ┌─────────────────────────────────────────────────┐    │  │
│  │  │    <WhatsAppBotControl />                       │    │  │
│  │  │    - Exibe QR Code                              │    │  │
│  │  │    - Botões Conectar/Desconectar                │    │  │
│  │  │    - Status em tempo real                       │    │  │
│  │  └─────────────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            ▲                ▲
                            │                │
                    ┌───────┴────────┐  ┌───┴───────┐
                    │   WebSocket    │  │ REST API  │
                    │ (Tempo Real)   │  │  (HTTP)   │
                    └───────┬────────┘  └───┬───────┘
                            │                │
                            ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                 BOT API SERVER (Node.js)                        │
│                   localhost:3010                                │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  bot-api-server.js                                       │  │
│  │  - Servidor Express + WebSocket                          │  │
│  │  - Expõe QR code em base64                               │  │
│  │  - Gerencia estado do bot                                │  │
│  │  - Endpoints REST para controle                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            ▲                                     │
│                            │                                     │
│                            │ (Funções exportadas)                │
│                            │                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  main.js (Bot VendeAI)                                   │  │
│  │  - Conexão WhatsApp (Baileys)                            │  │
│  │  - Gera QR code → envia para API                         │  │
│  │  - Atualiza status → notifica via WebSocket              │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            ▼
                    ┌───────────────┐
                    │   WhatsApp    │
                    │   (Baileys)   │
                    └───────────────┘
```

---

## ⚙️ Instalação e Configuração

### 1️⃣ Instalar Dependências do Bot

```bash
cd VendeAI/bot_engine
npm install cors qrcode ws express
```

### 2️⃣ Executar Script de Integração

Este script modifica o `main.js` automaticamente para integrar com a API:

```bash
cd VendeAI/bot_engine
node integrate-bot-api.js
```

**O que este script faz:**
- ✅ Cria backup do `main.js`
- ✅ Adiciona imports necessários
- ✅ Integra chamadas para o bot-api-server
- ✅ Adiciona callbacks de QR code e status

### 3️⃣ Verificar Arquivos Criados

Certifique-se de que os seguintes arquivos foram criados:

```
VendeAI/bot_engine/
  ├── bot-api-server.js           ✅ Servidor API + WebSocket
  ├── integrate-bot-api.js        ✅ Script de integração
  └── main.js                     ✅ Modificado com integração

CRM_Client/crm-client-app/src/components/
  └── WhatsAppBotControl.jsx      ✅ Componente React
```

### 4️⃣ Adicionar Componente ao CRM

Edite o arquivo `CRM_Client/crm-client-app/src/App.jsx`:

```jsx
import WhatsAppBotControl from './components/WhatsAppBotControl'

// Adicione onde você quer que o controle apareça:
<WhatsAppBotControl />
```

**Exemplo de Integração:**

```jsx
function App() {
  return (
    <div className="app">
      {/* Seus componentes existentes */}

      {/* Adicione o controle do bot */}
      <div className="container mx-auto p-6">
        <WhatsAppBotControl />
      </div>
    </div>
  )
}
```

---

## 🚀 Como Usar

### Passo 1: Iniciar o Bot VendeAI

```bash
cd VendeAI/bot_engine
node main.js
```

**Você verá:**
```
════════════════════════════════════════════════════════════════
🚀 BOT API SERVER - VendeAI
════════════════════════════════════════════════════════════════
📡 API REST:    http://localhost:3010
🔌 WebSocket:   ws://localhost:3010/ws
════════════════════════════════════════════════════════════════
```

### Passo 2: Iniciar o CRM do Cliente

```bash
cd CRM_Client/crm-client-app
npm run dev
```

Acesse: `http://localhost:5177`

### Passo 3: Conectar WhatsApp pelo CRM

1. **Abra o CRM** no navegador
2. **Aguarde o QR code** aparecer automaticamente
3. **Escaneie com WhatsApp:**
   - Abra WhatsApp no celular
   - Configurações → Aparelhos conectados
   - Conectar um aparelho
   - Escaneie o QR code

✅ **Pronto!** O bot está conectado e ativo!

---

## 🔧 API Reference

### REST Endpoints

#### `GET /api/bot/status`
Retorna o status atual do bot.

**Resposta:**
```json
{
  "success": true,
  "data": {
    "connected": true,
    "connectionStatus": "connected",
    "qrCode": null,
    "phoneNumber": "5511999999999",
    "lastUpdate": "2025-10-18T20:30:00.000Z",
    "error": null
  }
}
```

#### `GET /api/bot/qr`
Retorna o último QR code em base64.

**Resposta:**
```json
{
  "success": true,
  "data": {
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUh...",
    "timestamp": "2025-10-18T20:30:00.000Z"
  }
}
```

#### `POST /api/bot/disconnect`
Desconecta o bot.

**Resposta:**
```json
{
  "success": true,
  "message": "Bot desconectado com sucesso"
}
```

#### `POST /api/bot/reconnect`
Reconecta o bot.

**Resposta:**
```json
{
  "success": true,
  "message": "Reconectando bot..."
}
```

#### `GET /health`
Health check do servidor.

**Resposta:**
```json
{
  "success": true,
  "status": "online",
  "timestamp": "2025-10-18T20:30:00.000Z",
  "websocketClients": 2
}
```

---

### WebSocket Events

#### Conectar ao WebSocket:
```javascript
const ws = new WebSocket('ws://localhost:3010/ws');
```

#### Eventos Recebidos:

**1. Status Atualizado**
```json
{
  "type": "status",
  "data": {
    "connected": true,
    "connectionStatus": "connected",
    "phoneNumber": "5511999999999"
  }
}
```

**2. Novo QR Code**
```json
{
  "type": "qr",
  "data": {
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUh...",
    "timestamp": "2025-10-18T20:30:00.000Z"
  }
}
```

**3. QR Code Limpo**
```json
{
  "type": "qr_cleared",
  "data": {
    "message": "QR code cleared"
  }
}
```

---

## 🐛 Solução de Problemas

### ❌ Problema: QR Code não aparece

**Solução:**
1. Verifique se o bot está rodando: `node main.js`
2. Verifique se a porta 3010 está livre
3. Confira os logs do terminal do bot
4. Clique em "Atualizar Status" no CRM

### ❌ Problema: WebSocket não conecta

**Solução:**
1. Verifique se o bot API server está rodando
2. Abra o console do navegador (F12) e veja erros
3. Certifique-se de que não há firewall bloqueando a porta 3010
4. Teste manualmente: `curl http://localhost:3010/health`

### ❌ Problema: Bot desconecta sozinho

**Solução:**
1. Verifique a conexão com a internet
2. Veja os logs do bot para erros
3. Tente limpar a sessão:
   ```bash
   cd VendeAI/bot_engine
   rm -rf auth_info_baileys
   node main.js
   ```

### ❌ Problema: CORS Error no navegador

**Solução:**
1. Verifique se instalou a dependência `cors`
2. Confira se o `bot-api-server.js` tem `app.use(cors())`
3. Reinicie o bot

---

## 📊 Status dos Components

### ✅ Arquivos Criados:
- [x] `VendeAI/bot_engine/bot-api-server.js` - Servidor API + WebSocket
- [x] `VendeAI/bot_engine/integrate-bot-api.js` - Script de integração
- [x] `CRM_Client/crm-client-app/src/components/WhatsAppBotControl.jsx` - Componente React

### 📝 Arquivos que Você Precisa Modificar:
- [ ] `CRM_Client/crm-client-app/src/App.jsx` - Adicionar `<WhatsAppBotControl />`

### ⚡ Comandos de Execução:
```bash
# 1. Integrar API ao bot (executar uma vez)
cd VendeAI/bot_engine
node integrate-bot-api.js

# 2. Iniciar bot (sempre)
node main.js

# 3. Iniciar CRM (sempre)
cd CRM_Client/crm-client-app
npm run dev
```

---

## 🎉 Sucesso!

Se tudo estiver funcionando, você verá:

1. ✅ **Terminal do bot:** QR code + mensagem "Bot API Server iniciado"
2. ✅ **CRM no navegador:** Componente exibindo QR code
3. ✅ **Console do navegador:** "WebSocket conectado!"
4. ✅ **Após escanear QR:** Status muda para "Conectado e Ativo"

---

## 🆘 Precisa de Ajuda?

- 📖 **Documentação completa:** `INTEGRACAO_BOT_CRM_COMPLETO.md`
- 🔧 **Logs do bot:** Verifique o terminal onde rodou `node main.js`
- 🌐 **Console do navegador:** Pressione F12 para ver erros JavaScript
- 📁 **Backups:** O script cria backup automático do `main.js`

---

**Desenvolvido com ❤️ pela equipe Helix AI**
