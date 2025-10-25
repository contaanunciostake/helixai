# 🧪 Teste Rápido Multi-Tenant

## ⚡ Verificação em 10 Minutos

### Pré-requisitos

```bash
# 1. SQL fix executado
# 2. session-manager.js criado
# 3. bot-api-server.js substituído
# 4. App.jsx atualizado
```

---

## 🚀 TESTE 1: Bot API Server Inicia

```bash
cd D:\Helix\HelixAI\VendeAI\bot_engine
node bot-api-server.js
```

**✅ Esperado:**
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
- `Cannot find module './session-manager.js'` → Verificar arquivo existe
- `Error: listen EADDRINUSE` → Porta 3010 em uso, matar processo

---

## 🧪 TESTE 2: Conectar Empresa 1

```bash
# Em outro terminal
cd D:\Helix\HelixAI\CRM_Client\crm-client-app
npm run dev
```

**No navegador:**
```
1. Ir para: http://localhost:5173/login
2. Login: admin@empresa.com / senha
3. Ir para: Bot WhatsApp
4. Clicar: "Gerar QR Code"
```

**Console bot-api-server:**
```
✅ [WS] Cliente conectado - Empresa 1
[CONNECT] Conectando empresa 1...
[SESSION-MANAGER] Criando sessão para empresa 1...
📁 [SESSION-MANAGER] Diretório criado: auth_info_baileys\empresa_1
📱 [SESSION 1] QR Code gerado
```

**Browser:**
```
✅ QR Code aparece
✅ Status: "Conectando..."
```

**Escanear QR Code:**
```
Console bot-api-server:
✅ [SESSION 1] WhatsApp conectado!
📞 [SESSION 1] Número: 5511999999999

Browser:
✅ Status: "Conectado"
✅ Número: "+55 11 99999-9999"
```

---

## 🧪 TESTE 3: Endpoint /sessions

```bash
curl http://localhost:3010/api/bot/sessions
```

**✅ Esperado:**
```json
{
  "success": true,
  "data": {
    "total": 1,
    "connected": 1,
    "disconnected": 0,
    "sessions": [
      {
        "empresaId": 1,
        "connected": true,
        "phoneNumber": "5511999999999",
        "connectionStatus": "connected"
      }
    ]
  }
}
```

---

## 🧪 TESTE 4: Toggle Bot

**No browser (Empresa 1):**
```
1. Clicar "Desativar Bot"
```

**Console bot-api-server:**
```
[TOGGLE] =========================================
[TOGGLE] Empresa ID: 1
[TOGGLE] Novo status: DESATIVADO
[TOGGLE] ✅ Tabela 'empresas' atualizada (helixai_db)
[TOGGLE] ✅ Tabela 'bot_config' atualizada
[TOGGLE] ✅ Cache do CRM Adapter limpo
[TOGGLE] Bot DESATIVADO para empresa 1
[TOGGLE] =========================================
```

**Enviar mensagem para WhatsApp:**
```
❌ Bot NÃO responde (desativado)
```

**Clicar "Ativar Bot":**
```
Enviar mensagem novamente
✅ Bot RESPONDE (ativado)
```

---

## 🧪 TESTE 5: Disconnect

**No browser:**
```
1. Clicar "Desconectar"
```

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

**Verificar celular:**
```
✅ WhatsApp desconectou (aparecer notificação "WhatsApp Web desconectado")
```

---

## 🧪 TESTE 6: Reconnect

**No browser:**
```
1. Clicar "Gerar QR Code"
```

**Console bot-api-server:**
```
[CONNECT] Conectando empresa 1...
[SESSION-MANAGER] Criando sessão para empresa 1...
📱 [SESSION 1] QR Code gerado
```

**Browser:**
```
✅ Novo QR Code aparece
✅ Escanear e conectar novamente
✅ WhatsApp reconecta
```

---

## 🧪 TESTE 7: Múltiplas Empresas (Avançado)

### Criar Segunda Empresa

```sql
USE helixai_db;

INSERT INTO empresas (nome, email, telefone, nicho, bot_ativo, plano_id, status)
VALUES ('Loja SP', 'sp@example.com', '11888888888', 'veiculos', 1, 1, 'ativo');

-- Criar banco da empresa
CREATE DATABASE empresa_2_db;

USE empresa_2_db;

-- Copiar estrutura do banco modelo
-- (ou rodar script setup_tenant_database.sql)
```

### Abrir Dois Navegadores

**Navegador 1 (Chrome):**
```
Login: admin@empresa1.com
Bot WhatsApp → Gerar QR → Conectar
```

**Navegador 2 (Firefox/Aba Anônima):**
```
Login: admin@empresa2.com
Bot WhatsApp → Gerar QR → Conectar
```

**Console bot-api-server:**
```
✅ [SESSION 1] WhatsApp conectado! (Empresa 1)
📞 [SESSION 1] Número: 5511999999999

✅ [SESSION 2] WhatsApp conectado! (Empresa 2)
📞 [SESSION 2] Número: 5521888888888
```

**Endpoint /sessions:**
```bash
curl http://localhost:3010/api/bot/sessions
```

```json
{
  "total": 2,
  "connected": 2,
  "sessions": [
    {"empresaId": 1, "connected": true, "phoneNumber": "5511999999999"},
    {"empresaId": 2, "connected": true, "phoneNumber": "5521888888888"}
  ]
}
```

---

## 🧪 TESTE 8: Isolamento de Credenciais

```bash
cd D:\Helix\HelixAI\VendeAI\bot_engine
dir auth_info_baileys
```

**✅ Esperado:**
```
auth_info_baileys\
├── empresa_1\
│   ├── creds.json
│   └── app-state-sync-key-AAAAA....json
└── empresa_2\
    ├── creds.json
    └── app-state-sync-key-BBBBB....json
```

---

## 🧪 TESTE 9: Isolamento de Estoque

**Empresa 1:**
```sql
USE empresa_1_db;
INSERT INTO veiculos (marca, modelo, ano, preco)
VALUES ('Honda', 'Civic', 2024, 120000);

SELECT * FROM veiculos;
-- Retorna: Civic 2024
```

**Empresa 2:**
```sql
USE empresa_2_db;
SELECT * FROM veiculos;
-- ❌ NÃO retorna Civic (está em empresa_1_db)

INSERT INTO veiculos (marca, modelo, ano, preco)
VALUES ('VW', 'Golf', 2024, 110000);

SELECT * FROM veiculos;
-- Retorna APENAS: Golf 2024
```

**Enviar mensagem para WhatsApp da Empresa 1:**
```
Cliente: "Quero ver carros"
Bot responde: "Temos Honda Civic 2024..."
❌ Bot NÃO menciona VW Golf (é da Empresa 2)
```

**Enviar mensagem para WhatsApp da Empresa 2:**
```
Cliente: "Quero ver carros"
Bot responde: "Temos VW Golf 2024..."
❌ Bot NÃO menciona Honda Civic (é da Empresa 1)
```

---

## ✅ Checklist Final

Marcar cada item testado:

### Infraestrutura
- [ ] Bot API Server inicia sem erros
- [ ] Console mostra "MULTI-TENANT ATIVO"
- [ ] Endpoint /health retorna status
- [ ] Endpoint /sessions lista sessões

### Conexão WhatsApp
- [ ] QR Code é gerado corretamente
- [ ] WebSocket conecta com empresa_id
- [ ] WhatsApp conecta após escanear
- [ ] Status atualiza para "Conectado"
- [ ] Número do WhatsApp aparece correto

### Toggle Bot
- [ ] Desativar → Bot para de responder
- [ ] Ativar → Bot volta a responder
- [ ] Mudança reflete em < 2 segundos
- [ ] Console mostra "Cache limpo"

### Disconnect/Reconnect
- [ ] Disconnect → WhatsApp desconecta do celular
- [ ] Disconnect → Credenciais deletadas
- [ ] Reconnect → Novo QR Code aparece
- [ ] Reconnect → Conecta novamente

### Multi-Tenant
- [ ] Duas empresas conectam simultaneamente
- [ ] Credenciais em pastas separadas
- [ ] Endpoint /sessions mostra ambas
- [ ] Cada empresa só vê seu estoque
- [ ] Desconectar Empresa 1 não afeta Empresa 2

### Isolamento
- [ ] Cada empresa tem banco separado
- [ ] Estoque não mistura entre empresas
- [ ] Bot responde com produtos corretos
- [ ] JWT contém empresa_id correto

---

## 🎯 Resultado Esperado

Após todos os testes:

```
✅ Sistema Multi-Tenant 100% funcional
✅ Múltiplas empresas conectadas
✅ Isolamento total de dados
✅ Toggle funcionando
✅ Disconnect/Reconnect funcionando
✅ Estoque separado por empresa
✅ Credenciais isoladas
✅ Performance adequada
```

---

## 🚨 Troubleshooting Rápido

### Erro: WebSocket não conecta
**Verificar console do browser:**
```javascript
// Deve mostrar:
[CRM] Conectando ao Bot VendeAI Auto (ws://localhost:3010/ws?empresa_id=1)
```

**Se falta `?empresa_id=X`:**
- App.jsx não foi atualizado corretamente

### Erro: QR Code não aparece
**Console bot-api-server:**
```
✅ [SESSION X] QR Code gerado
```

**Se não aparecer:**
- Verificar que session-manager.js existe
- Verificar que broadcastToSession está funcionando

### Erro: Bot responde com estoque errado
**Verificar:**
```sql
-- Qual banco está sendo usado?
SELECT DATABASE();

-- Deve retornar: empresa_X_db (X = empresa_id correto)
```

---

## 🎉 Próximo Passo

Após tudo testado e funcionando:

1. **Commit das mudanças:**
```bash
git add .
git commit -m "Implementação multi-tenant completa"
```

2. **Documentar para equipe**
3. **Preparar para produção**
4. **Monitorar logs**

**Sistema pronto para escalar!** 🚀
