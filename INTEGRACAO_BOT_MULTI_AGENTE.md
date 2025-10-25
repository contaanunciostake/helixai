# 🤖 Integração Bot Multi-Agente - Sistema Completo

## 📋 Visão Geral

Sistema integrado que seleciona automaticamente o bot correto baseado no nicho da empresa, utilizando arquitetura multi-agente para fornecer atendimento especializado.

### Bots Disponíveis

| Nicho | Bot | Recursos |
|-------|-----|----------|
| **Veículos** | VendeAI Bot | ✅ IA Master (Claude/GPT)<br>✅ Busca inteligente de veículos<br>✅ Integração FIPE<br>✅ Simulador de financiamento<br>✅ Agendamento de visitas<br>✅ Geração de áudio (ElevenLabs)<br>✅ Análise de sentimento<br>✅ Contexto temporal |
| **Imóveis** | AIra Imob Bot | 🚧 Em desenvolvimento |
| **Outros** | Bot Genérico | ✅ Respostas automáticas básicas |

---

## 🏗️ Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND CRM (React)                     │
│              CRM_Admin / CRM_Client / Dashboard              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND API (Flask) - Port 5000                 │
│         Gerenciamento de empresas, usuários, leads           │
│              Define nicho da empresa (BD)                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│     INTEGRATED BOT SERVER (Express+WS) - Port 3010           │
│         Gerencia sessões WhatsApp multi-tenant               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              BOT SELECTOR BY NICHE                           │
│      Consulta nicho da empresa e seleciona bot               │
└───┬──────────────────┬──────────────────┬───────────────────┘
    │                  │                  │
    ▼                  ▼                  ▼
┌────────┐      ┌─────────┐      ┌──────────────┐
│VendeAI │      │AIra Imob│      │Bot Genérico  │
│  Bot   │      │   Bot   │      │              │
│(veículos)│    │(imóveis)│      │(outros)      │
└────────┘      └─────────┘      └──────────────┘
```

---

## 🚀 Instalação e Configuração

### 1. Pré-requisitos

```bash
# Node.js 18+ e Python 3.10+
node --version  # v18+
python --version  # 3.10+
```

### 2. Instalar Dependências

```bash
# Backend Python (se ainda não instalado)
cd D:\Helix\HelixAI\backend
pip install -r requirements.txt

# WhatsApp Service (Node.js)
cd D:\Helix\HelixAI\whatsapp_service
npm install
```

### 3. Configurar Variáveis de Ambiente

Crie ou atualize o arquivo `.env` em `D:\Helix\HelixAI\whatsapp_service\`:

```env
# Banco de Dados
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=helixai_db

# Servidor
WHATSAPP_PORT=3010

# APIs de IA (Opcionais - podem ser configuradas por empresa)
ANTHROPIC_API_KEY=sk-ant-xxxxx
OPENAI_API_KEY=sk-xxxxx
ELEVENLABS_API_KEY=xxxxx
```

### 4. Configurar Banco de Dados

O banco de dados principal já possui o campo `nicho` na tabela `empresas`. Para definir o nicho de uma empresa:

```sql
-- Definir empresa como de veículos
UPDATE empresas SET nicho = 'veiculos' WHERE id = 22;

-- Definir empresa como de imóveis
UPDATE empresas SET nicho = 'imoveis' WHERE id = 23;

-- Empresa sem nicho específico (usará bot genérico)
UPDATE empresas SET nicho = NULL WHERE id = 24;
```

---

## 🎯 Como Usar

### Iniciar o Sistema Completo

#### Opção 1: Iniciar tudo manualmente

```bash
# Terminal 1: Backend Flask (Port 5000)
cd D:\Helix\HelixAI
python backend/app.py

# Terminal 2: Integrated Bot Server (Port 3010)
cd D:\Helix\HelixAI\whatsapp_service
node integrated-bot-server.js

# Terminal 3: Frontend CRM (se necessário)
cd D:\Helix\HelixAI\CRM_Admin
npm run dev
```

#### Opção 2: Usar script de inicialização

Crie um arquivo `INICIAR_SISTEMA_INTEGRADO.bat`:

```bat
@echo off
title Sistema Integrado Multi-Agente

echo ========================================
echo   INICIANDO SISTEMA INTEGRADO
echo ========================================
echo.

:: Iniciar Backend Flask
start "Backend Flask" cmd /k "cd /d D:\Helix\HelixAI && python backend/app.py"
timeout /t 3 /nobreak >nul

:: Iniciar Integrated Bot Server
start "Bot Server" cmd /k "cd /d D:\Helix\HelixAI\whatsapp_service && node integrated-bot-server.js"
timeout /t 3 /nobreak >nul

:: Iniciar CRM Admin
start "CRM Admin" cmd /k "cd /d D:\Helix\HelixAI\CRM_Admin && npm run dev"

echo.
echo ========================================
echo   SISTEMA INICIADO COM SUCESSO!
echo ========================================
echo.
echo Backend Flask:    http://localhost:5000
echo Bot Server:       http://localhost:3010
echo CRM Admin:        http://localhost:5173
echo.
echo Pressione qualquer tecla para sair...
pause >nul
```

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:3010
```

### Endpoints Disponíveis

#### 1. Health Check
```http
GET /health
```

**Resposta:**
```json
{
  "status": "ok",
  "uptime": 123.45,
  "timestamp": "2025-01-25T10:30:00.000Z"
}
```

---

#### 2. Status da Conexão
```http
GET /api/bot/status/:empresaId
```

**Exemplo:**
```bash
curl http://localhost:3010/api/bot/status/22
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "connected": true,
    "connectionStatus": "connected",
    "phoneNumber": "5511999999999",
    "qrCode": null,
    "error": null,
    "nicho": "veiculos",
    "botType": "vendeai"
  }
}
```

---

#### 3. Conectar Bot (Gerar QR Code)
```http
POST /api/bot/connect/:empresaId
```

**Exemplo:**
```bash
curl -X POST http://localhost:3010/api/bot/connect/22
```

**Resposta:**
```json
{
  "success": true,
  "message": "Sessão iniciada. QR Code será enviado via WebSocket.",
  "data": {
    "connectionStatus": "connecting",
    "empresaId": 22
  }
}
```

**Nota:** O QR Code será enviado via WebSocket (veja seção WebSocket abaixo).

---

#### 4. Desconectar Bot
```http
POST /api/bot/disconnect/:empresaId
```

**Body (opcional):**
```json
{
  "keepAuth": true  // true = manter credenciais, false = apagar tudo
}
```

**Exemplo:**
```bash
curl -X POST http://localhost:3010/api/bot/disconnect/22 \
  -H "Content-Type: application/json" \
  -d '{"keepAuth": true}'
```

---

#### 5. Listar Todas as Sessões
```http
GET /api/bot/sessions
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "total": 3,
    "sessions": [
      {
        "empresaId": 22,
        "connected": true,
        "phoneNumber": "5511999999999",
        "connectionStatus": "connected",
        "nicho": "veiculos",
        "botType": "vendeai"
      },
      {
        "empresaId": 23,
        "connected": false,
        "phoneNumber": null,
        "connectionStatus": "disconnected",
        "nicho": "imoveis",
        "botType": null
      }
    ]
  }
}
```

---

#### 6. Ver Nicho e Tipo de Bot
```http
GET /api/bot/nicho/:empresaId
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "empresaId": 22,
    "nicho": "veiculos",
    "botType": "vendeai",
    "connected": true,
    "description": "VendeAI Bot - Assistente inteligente para venda de veículos com IA avançada, integração FIPE, simulador de financiamento e agendamento de visitas"
  }
}
```

---

#### 7. Enviar Mensagem Manual
```http
POST /api/bot/send-message
```

**Body:**
```json
{
  "empresaId": 22,
  "telefone": "5511999999999",
  "mensagem": "Olá! Temos novos veículos disponíveis."
}
```

---

#### 8. Limpar Cache de Nicho
```http
POST /api/bot/clear-cache/:empresaId
```

Útil quando você muda o nicho de uma empresa e quer forçar a atualização.

---

## 🔌 WebSocket

### Conectar ao WebSocket

```javascript
const empresaId = 22;
const ws = new WebSocket(`ws://localhost:3010/ws?empresa_id=${empresaId}`);

ws.onopen = () => {
  console.log('✅ Conectado ao WebSocket');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === 'qr') {
    // QR Code recebido (base64)
    console.log('📱 QR Code:', data.data.qrCode);
    // Exibir QR code no frontend
    document.getElementById('qr-img').src = data.data.qrCode;
  }

  if (data.type === 'connected') {
    console.log('✅ WhatsApp conectado!');
    console.log('📞 Número:', data.data.phoneNumber);
    console.log('🤖 Bot:', data.data.botType);
  }

  if (data.type === 'disconnected') {
    console.log('❌ WhatsApp desconectado');
  }

  if (data.type === 'status') {
    console.log('📊 Status:', data.data);
  }
};

ws.onerror = (error) => {
  console.error('❌ Erro WebSocket:', error);
};

ws.onclose = () => {
  console.log('🔌 WebSocket fechado');
};
```

### Eventos WebSocket

| Tipo | Descrição | Dados |
|------|-----------|-------|
| `qr` | QR Code gerado | `{ qrCode: "data:image/png;base64,..." }` |
| `connected` | WhatsApp conectado | `{ phoneNumber, nicho, botType }` |
| `disconnected` | WhatsApp desconectado | `{ shouldReconnect }` |
| `status` | Status atual | `{ connected, connectionStatus, ... }` |

---

## 🤖 Fluxo de Atendimento por Nicho

### VendeAI Bot (Veículos)

1. **Cliente envia mensagem** → "Oi, queria um carro até 50 mil"
2. **IA Master analisa intenção** → Detecta interesse em compra + filtro de preço
3. **Busca veículos** → Consulta banco de dados com filtros
4. **Consulta FIPE** (opcional) → Compara preços com tabela
5. **Gera resposta personalizada** → IA cria resposta persuasiva
6. **Envia mensagens:**
   - Texto com apresentação
   - Lista de 3 melhores veículos
   - Opcionalmente, áudio (ElevenLabs)
7. **Aguarda resposta** → Mantém contexto da conversa
8. **Possíveis ações:**
   - Simular financiamento
   - Agendar test drive
   - Enviar mais detalhes de um veículo específico

### Bot Genérico (Outros Nichos)

1. **Cliente envia mensagem**
2. **Resposta automática** → "Obrigado por entrar em contato! Em breve retornaremos."
3. **Registra lead** → Salva no CRM para follow-up manual

---

## 🔧 Configuração Avançada

### Personalizar Bot VendeAI por Empresa

O VendeAI Bot usa as configurações da tabela `configuracoes_bot` para cada empresa:

```sql
-- Exemplo de configuração completa
UPDATE configuracoes_bot SET
  auto_resposta_ativa = 1,
  enviar_audio = 1,
  usar_elevenlabs = 1,
  openai_api_key = 'sk-xxxxx',
  elevenlabs_api_key = 'xxxxx',
  elevenlabs_voice_id = 'Rachel',
  modulo_fipe_ativo = 1,
  modulo_financiamento_ativo = 1,
  modulo_agendamento_ativo = 1,
  mensagem_boas_vindas = 'Olá! Bem-vindo à nossa concessionária. Como posso ajudar você hoje?'
WHERE empresa_id = 22;
```

### Adicionar Veículos

```sql
-- Importar veículos para a empresa
INSERT INTO veiculos (empresa_id, marca, modelo, versao, ano_modelo, preco, disponivel, destaque)
VALUES
  (22, 'Volkswagen', 'Gol', '1.0 Flex', '2023', 45000, 1, 1),
  (22, 'Fiat', 'Argo', 'Drive 1.0', '2024', 62000, 1, 1),
  (22, 'Chevrolet', 'Onix', 'LT 1.0 Turbo', '2024', 78000, 1, 0);
```

---

## 📊 Monitoramento

### Logs do Sistema

O sistema gera logs detalhados no console:

```
✅ [INTEGRATED-SESSION-MANAGER] Inicializado
🔌 [SESSION-MANAGER] Criando sessão para empresa 22...
📊 [BOT-SELECTOR] Empresa 22 → Nicho: veiculos
🤖 [BOT-SELECTOR] Carregando VendeAI Bot (Veículos)...
✅ [SESSION-MANAGER] Bot carregado com sucesso para empresa 22
📱 [SESSION-MANAGER] QR Code gerado para empresa 22
✅ [SESSION-MANAGER] WhatsApp conectado para empresa 22
✅ [VENDEAI-WRAPPER] Bot inicializado para empresa 22

[VENDEAI] 📨 Mensagem de 5511999999999: oi, queria um carro até 50 mil
[VENDEAI] 🧠 Intenção detectada: interesse_compra
[VENDEAI] 🎭 Sentimento: positivo
[VEICULOS-REPO] 🚗 3 veículos encontrados
[SESSION-MANAGER] ✅ Resposta enviada
```

### Verificar Sessões Ativas

```bash
curl http://localhost:3010/api/bot/sessions
```

---

## 🐛 Troubleshooting

### Problema: QR Code não aparece

**Solução:**
1. Verificar se WebSocket está conectado
2. Limpar autenticação antiga:
```bash
curl -X POST http://localhost:3010/api/bot/disconnect/22 \
  -H "Content-Type: application/json" \
  -d '{"keepAuth": false}'
```
3. Reconectar:
```bash
curl -X POST http://localhost:3010/api/bot/connect/22
```

---

### Problema: Bot não responde

**Soluções:**
1. Verificar se bot está ativo:
```sql
SELECT id, nome, nicho, bot_ativo FROM empresas WHERE id = 22;
```

2. Ativar bot:
```sql
UPDATE empresas SET bot_ativo = 1 WHERE id = 22;
```

3. Limpar cache de nicho:
```bash
curl -X POST http://localhost:3010/api/bot/clear-cache/22
```

---

### Problema: Erro ao conectar banco de dados

**Solução:**
Verificar credenciais no `.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=SUA_SENHA
DB_NAME=helixai_db
```

---

## 📝 Próximos Passos

### Implementar AIra Imob Bot (Imóveis)

1. Criar `aira-imob-bot-wrapper.js`
2. Adicionar repositório de imóveis
3. Integrar com APIs de imóveis
4. Atualizar bot-selector para carregar AIra Imob Bot

### Adicionar Mais Nichos

1. Restaurantes
2. Clínicas/Consultórios
3. E-commerce
4. Serviços

---

## 📞 Suporte

Para dúvidas ou problemas:
- Verificar logs do sistema
- Consultar esta documentação
- Abrir issue no repositório (se aplicável)

---

## ✅ Checklist de Implementação

- [x] Bot Selector by Niche
- [x] VendeAI Bot Wrapper
- [x] Integrated Session Manager
- [x] Integrated Bot Server (API + WebSocket)
- [x] Documentação completa
- [ ] AIra Imob Bot (Imóveis)
- [ ] Testes automatizados
- [ ] Deploy em produção

---

**Sistema desenvolvido para HelixAI - Janeiro 2025**
