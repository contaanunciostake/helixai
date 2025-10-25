# 🧪 TESTE AGORA - Multi-Tenant

## ✅ Mudanças Aplicadas

1. ✅ **App.jsx atualizado** com empresa_id em todos os endpoints
2. ✅ **Script criado** para ativar bot-api-server multi-tenant
3. ✅ **session-manager.js** criado
4. ✅ **bot-api-server-multi-tenant.js** criado

---

## 🚀 Passo a Passo Rápido

### 1. Parar Processos Atuais

```bash
# No terminal do bot-api-server
Ctrl+C

# No terminal do CRM Client
Ctrl+C
```

---

### 2. Aplicar Multi-Tenant (Backend)

**Executar o script:**
```cmd
D:\Helix\HelixAI\APLICAR_MULTI_TENANT.bat
```

**Ou manualmente:**
```cmd
cd D:\Helix\HelixAI\VendeAI\bot_engine

rem Backup do antigo
ren bot-api-server.js bot-api-server-OLD.js

rem Ativar multi-tenant
ren bot-api-server-multi-tenant.js bot-api-server.js
```

---

### 3. Reiniciar Bot API Server

```bash
cd D:\Helix\HelixAI\VendeAI\bot_engine
node bot-api-server.js
```

**✅ Esperado no console:**
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

**❌ Se aparecer "Cannot find module './session-manager.js'":**
- Verificar que arquivo existe em `D:\Helix\HelixAI\VendeAI\bot_engine\`

---

### 4. Reiniciar CRM Client

```bash
cd D:\Helix\HelixAI\CRM_Client\crm-client-app
npm run dev
```

---

### 5. Testar com Primeiro Usuário

**a) Abrir navegador Chrome:**
```
http://localhost:5173/login
```

**b) Login:**
```
Email: admin@empresa.com (ou seu usuário)
Senha: sua senha
```

**c) Ir para "Bot WhatsApp"**

**d) Clicar "Gerar QR Code"**

**Console bot-api-server deve mostrar:**
```
✅ [WS] Cliente conectado - Empresa 1
[CONNECT] ======================================
[CONNECT] Conectando empresa 1...
[SESSION-MANAGER] Criando sessão para empresa 1...
📁 [SESSION-MANAGER] Diretório criado: auth_info_baileys\empresa_1
📱 [SESSION 1] QR Code gerado
[CONNECT] ✅ Sessão criada para empresa 1
[CONNECT] ======================================
```

**Browser deve mostrar:**
```
✅ QR Code aparece
✅ Status: "Conectando..."
```

**e) Escanear QR Code no celular**

**Console bot-api-server:**
```
✅ [SESSION 1] WhatsApp conectado!
📞 [SESSION 1] Número: 5511999999999
```

**Browser:**
```
✅ Status: "Conectado"
✅ Número: "+55 11 99999-9999"
```

---

### 6. Testar com Segundo Usuário

**a) Abrir navegador Firefox (ou aba anônima do Chrome):**
```
http://localhost:5173/login
```

**b) Login com segundo usuário:**
```
Email: usuario2@empresa.com
Senha: senha2
```

**c) Ir para "Bot WhatsApp"**

**d) Clicar "Gerar QR Code"**

**Console bot-api-server deve mostrar:**
```
✅ [WS] Cliente conectado - Empresa 2
[CONNECT] Conectando empresa 2...
[SESSION-MANAGER] Criando sessão para empresa 2...
📁 [SESSION-MANAGER] Diretório criado: auth_info_baileys\empresa_2
📱 [SESSION 2] QR Code gerado
```

**e) Verificar que:**
- ✅ **QR Code do usuário 2 é DIFERENTE do usuário 1**
- ✅ **Usuário 1 continua conectado** (não desconectou)
- ✅ **Ambos têm status independentes**

---

### 7. Verificar Endpoint /sessions

**Abrir novo terminal:**
```bash
curl http://localhost:3010/api/bot/sessions
```

**Ou no navegador:**
```
http://localhost:3010/api/bot/sessions
```

**✅ Deve mostrar:**
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

### 8. Testar Isolamento

**a) No navegador do Usuário 1:**
```
Clicar "Desconectar"
```

**Verificar:**
- ✅ WhatsApp do Usuário 1 desconecta
- ✅ **Usuário 2 CONTINUA CONECTADO** (não afetou!)

**Console bot-api-server:**
```
[DISCONNECT] ======================================
[DISCONNECT] Desconectando empresa 1...
✅ [SESSION 1] Logout realizado
✅ [SESSION 1] Socket fechado
✅ [SESSION 1] Credenciais deletadas
[DISCONNECT] ✅ Empresa 1 desconectada
[DISCONNECT] ======================================
```

**Endpoint /sessions agora mostra:**
```json
{
  "total": 1,
  "connected": 1,
  "disconnected": 0,
  "sessions": [
    {
      "empresaId": 2,
      "connected": true,
      "phoneNumber": "5521888888888",
      "connectionStatus": "connected"
    }
  ]
}
```

---

### 9. Verificar Credenciais Separadas

```cmd
cd D:\Helix\HelixAI\VendeAI\bot_engine
dir auth_info_baileys
```

**✅ Deve mostrar:**
```
auth_info_baileys\
├── empresa_1\
│   ├── creds.json
│   └── app-state-sync-key-...
└── empresa_2\
    ├── creds.json
    └── app-state-sync-key-...
```

**Cada empresa tem suas próprias credenciais isoladas!** ✅

---

## ✅ Checklist de Sucesso

Marque cada item testado:

- [ ] Bot API Server mostra "MULTI-TENANT ATIVO"
- [ ] Usuário 1 conecta e gera QR Code
- [ ] Console mostra "Empresa 1" nas mensagens
- [ ] Usuário 2 conecta em navegador diferente
- [ ] Usuário 2 gera QR Code DIFERENTE
- [ ] Console mostra "Empresa 2" nas mensagens
- [ ] Ambos usuários conectados simultaneamente
- [ ] Endpoint /sessions mostra 2 sessões
- [ ] Desconectar Usuário 1 NÃO afeta Usuário 2
- [ ] Credenciais em pastas separadas (empresa_1, empresa_2)
- [ ] Cada usuário vê apenas seu próprio status

---

## 🚨 Se Algo Der Errado

### Erro: "Cannot find module './session-manager.js'"

**Verificar:**
```cmd
cd D:\Helix\HelixAI\VendeAI\bot_engine
dir session-manager.js
```

**Se não existir:**
- Arquivo foi criado em `D:\Helix\HelixAI\VendeAI\bot_engine\session-manager.js`
- Verificar que está no caminho correto

### Erro: Ainda mostra "BOT API SERVER - VendeAI" (sem MULTI-TENANT)

**Causa:** Ainda está usando o arquivo antigo

**Solução:**
```cmd
cd D:\Helix\HelixAI\VendeAI\bot_engine
dir bot-api-server*.js
```

**Deve mostrar:**
```
bot-api-server.js         ← NOVO (multi-tenant)
bot-api-server-OLD.js     ← ANTIGO (backup)
```

**Se estiver invertido:**
```cmd
ren bot-api-server.js bot-api-server-TEMP.js
ren bot-api-server-OLD.js bot-api-server.js
ren bot-api-server-TEMP.js bot-api-server-OLD.js
```

### Erro: WebSocket não conecta

**Verificar console do browser:**
```
[CRM] Conectando ao Bot VendeAI Auto (ws://localhost:3010/ws?empresa_id=1)
```

**Deve ter `?empresa_id=X` na URL!**

**Se não tiver:**
- App.jsx não foi atualizado corretamente
- Verificar mudanças nas linhas 532-534

### Erro: Ambos usuários veem mesmo QR Code

**Causa:** Frontend não está enviando empresa_id diferente

**Verificar:**
```javascript
// No console do browser (F12):
console.log('Empresa ID:', user?.empresa_id)
```

**Deve mostrar:**
```
Usuário 1 → Empresa ID: 1
Usuário 2 → Empresa ID: 2
```

**Se ambos mostram "1":**
- Usuários estão usando a mesma conta
- Criar segundo usuário com empresa_id diferente no banco

---

## 📊 Resultado Esperado

Após todos os testes:

```
✅ Sistema Multi-Tenant 100% funcional
✅ 2 usuários conectados simultaneamente
✅ QR Codes diferentes
✅ Status independentes
✅ Credenciais isoladas
✅ Desconectar um não afeta o outro
```

---

## 🎉 Próximo Passo

Se tudo funcionou:

1. **Testar com mais usuários** (3, 4, 5...)
2. **Executar SQL de personalização** (`add_personalizacao_empresas.sql`)
3. **Criar interface de configuração** no CRM
4. **Testar bot com configurações diferentes** por empresa

**Sistema pronto para escalar! 🚀**
