# 🚀 GUIA RÁPIDO - REINICIAR SISTEMA

## ✅ CORREÇÕES APLICADAS

### 1. Verificação de Horário REMOVIDA ✅
- Bot agora funciona 24/7
- Não envia mais "Fora do horário de atendimento"

### 2. Toggle Bot Ativo/Pausado CORRIGIDO ✅
- Sincroniza SQLite ↔ MySQL automaticamente
- Bot verifica `bot_ativo` antes de processar mensagens
- Toggle no CRM agora funciona!

### 3. Bot VendeAI com IA Master ATIVADO ✅
- Usa Anthropic Claude (IA Master)
- Processa mensagens com módulos de IA
- Análise de intenções, sentimento, recomendações

---

## 🔄 COMO REINICIAR AGORA

### 1️⃣ PARAR TUDO (Ctrl+C em cada janela)

```bash
# Backend Flask (porta 5000)
Ctrl+C

# Bot Server (porta 3010)
Ctrl+C

# CRM Cliente (porta 5177)
Ctrl+C
```

### 2️⃣ INICIAR NA ORDEM CORRETA

**A. Backend Flask:**
```bash
cd D:\Helix\HelixAI\backend
python -m flask run --host=0.0.0.0 --port=5000
```

**Aguarde aparecer:**
```
* Running on http://0.0.0.0:5000
```

**B. Bot Server (IMPORTANTE!):**
```bash
cd D:\Helix\HelixAI\whatsapp_service
node integrated-bot-server.js
```

**Aguarde aparecer:**
```
✅ Servidor rodando na porta 3010
```

**C. CRM Cliente:**
```bash
cd D:\Helix\HelixAI\CRM_Client\crm-client-app
npm run dev -- --port 5177
```

**Aguarde aparecer:**
```
Local:   http://localhost:5177/
```

---

## 📱 CONECTAR WHATSAPP

### 1. Acessar CRM
```
http://localhost:5177/
```

### 2. Login
```
Email: demo@vendeai.com
Senha: demo123
```

### 3. Ir em "Bot WhatsApp"

### 4. Clicar em "Conectar"

### 5. Escanear QR Code

### 6. **IMPORTANTE:** ATIVAR O BOT
- Procure o toggle verde no topo
- Certifique-se que está **VERDE** (Ativo)
- Se estiver cinza, clique para ativar

---

## 🧪 TESTAR BOT

### 1. Enviar mensagem no WhatsApp:
```
oi
```

### 2. Logs Esperados (Bot Server):

```
[SESSION-MANAGER] 📨 Mensagem recebida de 5542XXXXXXXX
[VENDEAI-BOT] 📨 Processando mensagem...
[VENDEAI-BOT] ▶️ Bot está ATIVO - processando mensagem  ✅
[VENDEAI-BOT] 📱 De: 5542XXXXXXXX (Victor von Müller)
[VENDEAI-BOT] 💬 Mensagem: oi
[VENDEAI-BOT] ✅ Processando com IA Master...  ✅
[VENDEAI-BOT] 🧠 Usando IA Master para análise...
[IA-MASTER] Módulo 01 - Análise de Intenções
[IA-MASTER] Módulo 02 - Recomendação Inteligente
[IA-MASTER] Módulo 03 - Análise de Sentimento
[VENDEAI-BOT] ✅ Mensagem processada com sucesso
```

### 3. Resposta Esperada no WhatsApp:

```
Olá! Seja bem-vindo(a)! 🚗

Sou a Luana, assistente virtual da Empresa Demonstração.
Estou aqui para te ajudar a encontrar o veículo perfeito!

Como posso te ajudar hoje?
- Ver veículos disponíveis
- Simular financiamento
- Agendar visita
```

---

## ⏸️ COMO PAUSAR/ATIVAR BOT

### No CRM (http://localhost:5177/)

1. Vá em "Bot WhatsApp"
2. No topo da tela, procure o toggle:
   - 🟢 **VERDE** = Bot Ativo (processando mensagens)
   - ⚪ **CINZA** = Bot Pausado (ignorando mensagens)
3. Clique para alternar

### Logs do Toggle:

**Backend Flask:**
```
[API] Bot da empresa Empresa Demonstração alterado para: ATIVO
[API] ✅ bot_ativo sincronizado com MySQL
```

**Bot Server (próxima mensagem):**
```
[VENDEAI-BOT] ▶️ Bot está ATIVO - processando mensagem
```

OU

```
[VENDEAI-BOT] ⏸️ Bot está PAUSADO - ignorando mensagem
```

---

## 🔍 TROUBLESHOOTING

### Bot não responde?

**1. Verificar se bot está ativo:**
```bash
mysql -u root -h localhost helixai_db -e "SELECT id, nome, bot_ativo FROM empresas WHERE id = 2;"
```

**Deve mostrar:** `bot_ativo = 1`

**Se não, ativar:**
```bash
mysql -u root -h localhost helixai_db -e "UPDATE empresas SET bot_ativo = 1 WHERE id = 2;"
```

**2. Verificar logs do Bot Server:**

Procure por:
```
[VENDEAI-BOT] ▶️ Bot está ATIVO
[VENDEAI-BOT] ✅ Processando com IA Master...
```

Se aparecer:
```
[VENDEAI-BOT] ⏸️ Bot está PAUSADO
```

Ative no CRM ou no banco!

**3. Verificar se IA Master está carregado:**

Deve aparecer no início:
```
[VENDEAI-INTEGRATION] ✅ Módulos VendeAI importados com sucesso
[VENDEAI-BOT] 🚗 Inicializando VendeAI Bot para empresa 2
```

Se não aparecer, o nicho não está correto ou há erro de import.

**4. Verificar nicho:**
```bash
mysql -u root -h localhost helixai_db -e "SELECT id, nome, nicho FROM empresas WHERE id = 2;"
```

**Deve mostrar:** `nicho = VEICULOS`

**Se não, corrigir:**
```bash
mysql -u root -h localhost helixai_db -e "UPDATE empresas SET nicho = 'VEICULOS' WHERE id = 2;"
```

---

## 📊 ESTRUTURA COMPLETA

```
┌────────────────────────────────────┐
│ Mensagem WhatsApp                  │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│ Integrated Session Manager         │
│ (porta 3010)                       │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│ Verificar bot_ativo no MySQL ✅    │
│ ▶️ ATIVO → Continua                │
│ ⏸️ PAUSADO → Ignora                │
└────────┬───────────────────────────┘
         │
         ▼ (Se ATIVO)
┌────────────────────────────────────┐
│ Bot Selector                       │
│ Consulta nicho no MySQL            │
│ → VEICULOS = VendeAI Bot ✅        │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│ VendeAI Bot Integration            │
│ ✅ Horário 24/7                    │
│ ✅ Verifica bot_ativo novamente    │
│ ✅ Processa com IA Master          │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│ VendeAI Bot Engine                 │
│ D:/Helix/HelixAI/VendeAI/bot_engine│
│ ✅ IA Master (6 módulos)           │
│ ✅ Análise de intenções            │
│ ✅ Recomendações inteligentes      │
│ ✅ Busca de veículos               │
│ ✅ Simulador financiamento         │
└────────────────────────────────────┘
```

---

## ⚙️ CONFIGURAÇÕES MYSQL

### Verificar configurações da empresa:

```bash
mysql -u root -h localhost helixai_db -e "
SELECT
    e.id,
    e.nome,
    e.nicho,
    e.bot_ativo,
    e.setup_completo,
    c.horario_atendimento
FROM empresas e
LEFT JOIN configuracoes_bot c ON c.empresa_id = e.id
WHERE e.id = 2;
"
```

### Resultado Esperado:

```
id | nome                  | nicho    | bot_ativo | setup_completo | horario_atendimento
2  | Empresa Demonstração  | VEICULOS | 1         | 1              | {"inicio": "00:00", "fim": "23:59"}
```

---

## ✅ CHECKLIST PRÉ-TESTE

Antes de testar, certifique-se:

- [ ] Backend Flask rodando (porta 5000)
- [ ] Bot Server rodando (porta 3010)
- [ ] CRM Cliente rodando (porta 5177)
- [ ] MySQL rodando (XAMPP)
- [ ] Login no CRM feito
- [ ] WhatsApp conectado (QR Code escaneado)
- [ ] **BOT ATIVO** (toggle verde no CRM) ✅
- [ ] Nicho = VEICULOS no MySQL
- [ ] setup_completo = 1 no MySQL

---

## 🎯 COMANDO RÁPIDO

Para reiniciar tudo de uma vez:

```bash
# Matar processos
taskkill /F /IM python.exe 2>nul
taskkill /F /IM node.exe 2>nul

# Aguardar 2 segundos
timeout /t 2

# Iniciar tudo
start "Backend" cmd /k "cd /d D:\Helix\HelixAI\backend && python -m flask run --host=0.0.0.0 --port=5000"
timeout /t 3
start "Bot Server" cmd /k "cd /d D:\Helix\HelixAI\whatsapp_service && node integrated-bot-server.js"
timeout /t 3
start "CRM Cliente" cmd /k "cd /d D:\Helix\HelixAI\CRM_Client\crm-client-app && npm run dev -- --port 5177"
```

---

**Data:** 2025-11-03 22:15
**Status:** ✅ PRONTO PARA TESTAR
**Próximo Passo:** Reiniciar Bot Server e enviar "oi" no WhatsApp
