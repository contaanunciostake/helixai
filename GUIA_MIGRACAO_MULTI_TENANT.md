# 🚀 Guia de Migração: Single-Tenant → Multi-Tenant

## 📋 Visão Geral

Este guia orienta a migração do sistema atual (1 empresa por vez) para a arquitetura multi-tenant (múltiplas empresas simultaneamente).

**Tempo estimado:** 30-60 minutos
**Dificuldade:** Média
**Requer:** Node.js, acesso ao banco de dados, conhecimento básico de Git

---

## ⚠️ ANTES DE COMEÇAR

### 1. Backup Completo

```bash
# Backup do código
cd D:\Helix\HelixAI\VendeAI\bot_engine
git add .
git commit -m "Backup antes da migração multi-tenant"

# Backup do banco de dados
mysqldump -u root -p helixai_db > D:\Helix\HelixAI\backup_helixai_db.sql
```

### 2. Parar Todos os Processos

```bash
# Parar bot-api-server
# Ctrl+C no terminal onde está rodando

# Parar main.js (se estiver rodando)
# Ctrl+C

# Parar CRM Client frontend
# Ctrl+C

# Verificar se nenhum processo node está rodando
tasklist | findstr node
# Deve retornar vazio ou apenas processos não relacionados
```

### 3. Verificar Banco de Dados

```sql
-- Verificar se coluna bot_ativo existe
USE helixai_db;
DESCRIBE empresas;

-- Se NÃO existir, executar:
ALTER TABLE empresas
ADD COLUMN bot_ativo TINYINT(1) DEFAULT 1
COMMENT 'Bot WhatsApp ativo (1=sim, 0=não)';

UPDATE empresas SET bot_ativo = 1 WHERE bot_ativo IS NULL;
```

---

## 🔧 PASSO 1: Copiar Novos Arquivos

### 1.1. Session Manager

```bash
# O arquivo já foi criado em:
# D:\Helix\HelixAI\VendeAI\bot_engine\session-manager.js
# Não precisa fazer nada - ele já está no lugar certo
```

### 1.2. Backup do Bot API Server Antigo

```bash
cd D:\Helix\HelixAI\VendeAI\bot_engine

# Renomear arquivo antigo
ren bot-api-server.js bot-api-server-OLD.js
```

### 1.3. Renomear Novo Bot API Server

```bash
# Renomear arquivo multi-tenant para o nome original
ren bot-api-server-multi-tenant.js bot-api-server.js
```

**Resultado esperado:**
```
D:\Helix\HelixAI\VendeAI\bot_engine\
├── bot-api-server.js            ← NOVO (multi-tenant)
├── bot-api-server-OLD.js        ← ANTIGO (backup)
├── session-manager.js           ← NOVO
├── main.js                      ← Será modificado depois
└── ...
```

---

## 🔧 PASSO 2: Atualizar App.jsx (Frontend)

### 2.1. Localizar App.jsx

```
D:\Helix\HelixAI\CRM_Client\crm-client-app\src\App.jsx
```

### 2.2. Fazer Backup

```bash
cd D:\Helix\HelixAI\CRM_Client\crm-client-app\src
copy App.jsx App-OLD.jsx
```

### 2.3. Aplicar Mudanças

Abrir `App.jsx` e fazer as seguintes alterações:

#### Mudança 1: WebSocket com empresa_id (Linha ~532)

**Procurar por:**
```javascript
ws = new WebSocket(botConfig.wsUrl)
```

**Substituir por:**
```javascript
ws = new WebSocket(`${botConfig.wsUrl}?empresa_id=${user?.empresa_id || 1}`)
```

#### Mudança 2: Endpoint reconnect (Linha ~656)

**Procurar por:**
```javascript
const reconnectResponse = await fetch(`${botConfig.apiUrl}/api/bot/reconnect`, {
```

**Substituir por:**
```javascript
const reconnectResponse = await fetch(`${botConfig.apiUrl}/api/bot/reconnect/${user?.empresa_id || 1}`, {
```

#### Mudança 3: Endpoint disconnect (Linha ~681)

**Procurar por:**
```javascript
const response = await fetch(`${botConfig.apiUrl}/api/bot/disconnect`, {
```

**Substituir por:**
```javascript
const response = await fetch(`${botConfig.apiUrl}/api/bot/disconnect/${user?.empresa_id || 1}`, {
```

#### Mudança 4: Função generateQRCode - Usar /connect (Linha ~645)

**Procurar por:**
```javascript
const generateQRCode = async () => {
  // ... validações ...

  setIsConnecting(true)
  console.log('[CRM] Gerando QR Code...')

  try {
    const botConfig = getBotConfig()

    // ✅ Forçar reconexão
    console.log('[CRM] Forçando reconexão...');
    const reconnectResponse = await fetch(`${botConfig.apiUrl}/api/bot/reconnect`, {
```

**Substituir por:**
```javascript
const generateQRCode = async () => {
  // ... validações ...

  setIsConnecting(true)
  console.log('[CRM] Gerando QR Code...')

  try {
    const botConfig = getBotConfig()
    const empresaId = user?.empresa_id || 1

    // ✅ Criar/conectar sessão
    console.log(`[CRM] Conectando empresa ${empresaId}...`);
    const connectResponse = await fetch(`${botConfig.apiUrl}/api/bot/connect/${empresaId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (connectResponse.ok) {
      showNotificationMsg('Gerando QR Code... Aguarde');
      // O QR code virá via WebSocket
    } else {
      throw new Error('Falha ao conectar');
    }
```

#### Mudança 5: Remover /api/bot/clear (se existir)

**Procurar por:**
```javascript
const response = await fetch(`${botConfig.apiUrl}/api/bot/clear`, {
```

**Substituir por:**
```javascript
// ❌ REMOVIDO - Usar disconnect ao invés de clear
const response = await fetch(`${botConfig.apiUrl}/api/bot/disconnect/${user?.empresa_id || 1}`, {
```

### 2.4. Salvar Arquivo

Salvar `App.jsx` com as mudanças aplicadas.

---

## 🔧 PASSO 3: Testar Sistema Multi-Tenant

### 3.1. Iniciar Bot API Server

```bash
cd D:\Helix\HelixAI\VendeAI\bot_engine
node bot-api-server.js
```

**Console esperado:**
```
════════════════════════════════════════════════════════════════
🚀 BOT API SERVER - VendeAI MULTI-TENANT
════════════════════════════════════════════════════════════════
📡 API REST:    http://localhost:3010
🔌 WebSocket:   ws://localhost:3010/ws?empresa_id=X
════════════════════════════════════════════════════════════════
✅ Suporte Multi-Tenant ATIVO
✅ Múltiplas empresas podem conectar simultaneamente
════════════════════════════════════════════════════════════════
```

**❌ Se aparecer erro:**
```
Error: Cannot find module './session-manager.js'
```

**Solução:**
- Verificar que `session-manager.js` existe em `D:\Helix\HelixAI\VendeAI\bot_engine\`

### 3.2. Iniciar CRM Client

```bash
cd D:\Helix\HelixAI\CRM_Client\crm-client-app
npm run dev
```

### 3.3. Testar Conexão WhatsApp

**a) Fazer Login no CRM:**
```
http://localhost:5173/login
```

**b) Ir para "Bot WhatsApp"**

**c) Clicar em "Gerar QR Code"**

**Console do bot-api-server deve mostrar:**
```
[CONNECT] ======================================
[CONNECT] Conectando empresa 1...
[SESSION-MANAGER] Criando sessão para empresa 1...
📁 [SESSION-MANAGER] Diretório criado: auth_info_baileys\empresa_1
✅ [SESSION-MANAGER] Sessão criada para empresa 1
✅ [WS] Cliente conectado - Empresa 1
📱 [SESSION 1] QR Code gerado
```

**d) Escanear QR Code**

**Console esperado:**
```
✅ [SESSION 1] WhatsApp conectado!
📞 [SESSION 1] Número: 5511999999999
```

**e) Verificar no Browser:**
- Status: "Conectado"
- Número: "+55 11 99999-9999"

---

## 🧪 PASSO 4: Testar Multi-Sessão (Múltiplas Empresas)

### 4.1. Criar Segunda Empresa no Banco

```sql
USE helixai_db;

INSERT INTO empresas (nome, email, telefone, nicho, bot_ativo, plano_id, status)
VALUES ('Loja de Carros SP', 'sp@example.com', '11888888888', 'veiculos', 1, 1, 'ativo');

-- Anotar o ID da empresa criada (exemplo: 2)
SELECT id, nome FROM empresas ORDER BY id DESC LIMIT 2;
```

### 4.2. Criar Usuário para Segunda Empresa

```sql
INSERT INTO usuarios (empresa_id, nome, email, senha, role)
VALUES (2, 'Vendedor SP', 'vendedor_sp@example.com', '$2b$10$...', 'admin');
-- Nota: Use uma senha hash real ou crie via interface do CRM
```

### 4.3. Abrir Dois Navegadores

**Navegador 1 (Chrome):**
```
http://localhost:5173/login
→ Login com empresa_id=1
→ Ir para "Bot WhatsApp"
→ Gerar QR Code
→ Conectar WhatsApp 1
```

**Navegador 2 (Firefox ou Aba Anônima):**
```
http://localhost:5173/login
→ Login com empresa_id=2
→ Ir para "Bot WhatsApp"
→ Gerar QR Code
→ Conectar WhatsApp 2
```

### 4.4. Verificar Console do Bot

**Deve mostrar DUAS sessões ativas:**
```
✅ [SESSION 1] WhatsApp conectado!
📞 [SESSION 1] Número: 5511999999999

✅ [SESSION 2] WhatsApp conectado!
📞 [SESSION 2] Número: 5521888888888
```

### 4.5. Verificar Endpoint /sessions

```bash
curl http://localhost:3010/api/bot/sessions
```

**Resposta esperada:**
```json
{
  "success": true,
  "data": {
    "total": 2,
    "connected": 2,
    "disconnected": 0,
    "sessions": [
      {
        "empresaId": 1,
        "connected": true,
        "phoneNumber": "5511999999999",
        "connectionStatus": "connected"
      },
      {
        "empresaId": 2,
        "connected": true,
        "phoneNumber": "5521888888888",
        "connectionStatus": "connected"
      }
    ]
  }
}
```

---

## 🗂️ PASSO 5: Verificar Estrutura de Arquivos

### 5.1. Credenciais Separadas

```bash
cd D:\Helix\HelixAI\VendeAI\bot_engine
dir auth_info_baileys
```

**Estrutura esperada:**
```
auth_info_baileys\
├── empresa_1\
│   ├── creds.json
│   └── app-state-sync-key-AAAAA....json
├── empresa_2\
│   ├── creds.json
│   └── app-state-sync-key-BBBBB....json
└── ...
```

**✅ Cada empresa tem suas próprias credenciais isoladas!**

---

## ✅ PASSO 6: Verificar Funcionalidades

### 6.1. Toggle Bot (Ativar/Desativar)

**Empresa 1:**
- Clicar "Desativar Bot"
- Enviar mensagem para WhatsApp 1
- ✅ Bot NÃO deve responder

**Empresa 2:**
- WhatsApp 2 ainda deve responder normalmente
- ✅ Empresas isoladas

### 6.2. Disconnect/Reconnect

**Empresa 1:**
- Clicar "Desconectar"
- WhatsApp 1 desconecta do celular
- Empresa 2 continua conectada ✅

**Empresa 1:**
- Clicar "Gerar QR Code"
- Novo QR aparece
- Reconectar ✅

---

## 🚨 Troubleshooting

### Erro: "Cannot find module 'session-manager.js'"

**Solução:**
```bash
cd D:\Helix\HelixAI\VendeAI\bot_engine
dir session-manager.js
# Se não existir, copiar do local correto
```

### Erro: "empresa_id is undefined"

**Causa:** Frontend não está enviando empresa_id

**Solução:**
- Verificar que `user?.empresa_id` existe no contexto do React
- Adicionar console.log para debugar:
```javascript
console.log('[DEBUG] user.empresa_id:', user?.empresa_id);
```

### Erro 440 (Conflict)

**Causa:** Múltiplas sessões tentando usar o mesmo número

**Solução:**
```bash
cd D:\Helix\HelixAI\VendeAI\bot_engine
rmdir /S /Q auth_info_baileys
mkdir auth_info_baileys
# Reconectar tudo do zero
```

### WebSocket não conecta

**Causa:** URL sem empresa_id

**Solução:**
- Verificar console do browser:
```
[CRM] Conectando ao Bot VendeAI Auto (ws://localhost:3010/ws?empresa_id=1)
```
- Deve ter `?empresa_id=X` na URL

---

## 📊 Comparação Antes/Depois

### Antes (Single-Tenant):
```
Bot VendeAI (Porta 3010)
  └─ ❌ APENAS 1 EMPRESA POR VEZ

Loja RJ → Conecta ✅
Loja SP → Tenta conectar... ❌ (CONFLITO)
Loja MG → Tenta conectar... ❌ (CONFLITO)
```

### Depois (Multi-Tenant):
```
Bot VendeAI (Porta 3010)
  ├─ ✅ Loja RJ (WhatsApp: +5521999999999)
  ├─ ✅ Loja SP (WhatsApp: +5511888888888)
  ├─ ✅ Loja MG (WhatsApp: +5531777777777)
  └─ ✅ ... (centenas de lojas)

TODAS ATIVAS SIMULTANEAMENTE! 🎉
```

---

## 🎯 Checklist Final

Após a migração, verificar:

- [ ] Bot API Server inicia sem erros
- [ ] Console mostra "MULTI-TENANT ATIVO"
- [ ] CRM Client conecta ao WebSocket com empresa_id
- [ ] QR Code é gerado corretamente
- [ ] WhatsApp conecta sem erros
- [ ] Toggle ativa/desativa funciona
- [ ] Disconnect funciona (logout do celular)
- [ ] Reconnect funciona (novo QR)
- [ ] Múltiplas empresas podem conectar simultaneamente
- [ ] Credenciais ficam em pastas separadas (empresa_X)
- [ ] Endpoint /sessions lista todas as sessões
- [ ] Estoque de cada empresa permanece isolado

---

## 🚀 Sistema 100% Multi-Tenant!

**Benefícios:**
- ✅ Escalável para centenas de empresas
- ✅ Um único servidor para todos os clientes
- ✅ Isolamento completo entre empresas
- ✅ Menor custo de infraestrutura
- ✅ Fácil manutenção e atualização

**Pronto para oferecer como SaaS!** 🎉
