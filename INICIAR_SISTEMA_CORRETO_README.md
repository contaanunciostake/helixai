# 🚀 INICIAR_SISTEMA_CORRETO.bat - Guia de Uso

## ✅ O Que Esse Script Faz

Este `.bat` inicia **TODA** a arquitetura integrada do sistema AIra/VendeAI na ordem correta:

### 1️⃣ **Backend Flask** (porta 5000)
- API para toggle bot ativo/inativo
- Webhooks MercadoPago
- Bridge entre CRM e Bot

### 2️⃣ **Integrated Bot Server Multi-Tenant** (porta 3010)
- Gerencia múltiplas conexões WhatsApp
- Seleciona bot automático por nicho
- **VendeAI Bot** completo com IA Master (veículos)
- WebSocket para QR Code em tempo real

### 3️⃣ **CRM Cliente** (porta 5177)
- Interface para conectar WhatsApp
- Toggle para ativar/desativar bot
- Estatísticas em tempo real
- Login: `demo@vendeai.com` / `demo123`

### 4️⃣ **Landing Page** (porta 5173)
- Página inicial do sistema

### 5️⃣ **CRM Admin** (porta 5175)
- Painel administrativo

---

## 📋 Pré-Requisitos

### 1. MySQL Rodando
O script verifica automaticamente se o MySQL está ativo. Se não estiver:
1. Abra **XAMPP Control Panel**
2. Clique em **Start** no módulo MySQL

### 2. Node.js e npm Instalados
```bash
node --version  # Deve retornar v18+ ou v20+
npm --version   # Deve retornar v9+ ou v10+
```

### 3. Python Instalado
```bash
python --version  # Deve retornar 3.10+ ou 3.11+
```

### 4. Variáveis de Ambiente (.env)
O arquivo `VendeAI/.env` deve ter:
```bash
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=sk-proj-...
ELEVENLABS_API_KEY=sk_...
```

---

## 🎯 Como Usar

### Passo 1: Execute o Script
```bash
# Opção 1: Duplo clique no arquivo
INICIAR_SISTEMA_CORRETO.bat

# Opção 2: Via terminal
cd D:\Helix\HelixAI
INICIAR_SISTEMA_CORRETO.bat
```

### Passo 2: Aguarde a Inicialização
O script vai:
1. ✅ Limpar cache do Vite
2. ✅ Verificar se MySQL está rodando
3. ✅ Instalar dependências faltantes (se necessário)
4. ✅ Iniciar 10 serviços na ordem correta
5. ✅ Aguardar cada serviço inicializar antes do próximo

**Total: ~40-50 segundos**

### Passo 3: Acessar o CRM
Quando aparecer "✅ SISTEMA INICIADO COM SUCESSO":

1. Abra navegador em: `http://localhost:5177`
2. Faça login:
   - **Email**: `demo@vendeai.com`
   - **Senha**: `demo123`
3. Vá para seção **"Bot WhatsApp"** ou **"WhatsApp"**

### Passo 4: Conectar WhatsApp
1. Clique em **"Conectar WhatsApp"**
2. Aguarde QR Code aparecer (2-5 segundos)
3. Abra WhatsApp no celular
4. Vá em **Menu (⋮) → Aparelhos conectados**
5. Toque em **"Conectar um aparelho"**
6. Escaneie o QR Code

### Passo 5: Ativar o Bot
1. Após conexão (status fica verde)
2. Clique no **toggle verde** no topo
3. Deve mudar de "Bot Pausado" para "Bot Ativo"
4. Pronto! Bot está atendendo automaticamente

---

## 🔍 O Que Acontece Quando Cliente Manda Mensagem

```
Cliente envia: "Olá, quero um carro automático"
        ↓
Baileys recebe (integrated-session-manager.js)
        ↓
Bot Selector identifica nicho = 'veiculos'
        ↓
VendeAI Bot Integration carrega IA Master
        ↓
IA Master processa:
  • Módulo 01: Analisa intenção → "interesse_compra"
  • Módulo 02: Busca veículos automáticos no banco
  • Módulo 03: Analisa sentimento → "positivo"
  • Módulo 04: Salva contexto da conversa
  • Módulo 05: Calcula probabilidade de fechamento
  • Módulo 06: Gera resposta personalizada
        ↓
Bot envia: "Olá! Encontrei ótimos carros automáticos
para você. Temos um Honda Civic 2022 automático
por R$ 89.900 e um Toyota Corolla 2023 por R$ 124.900.
Qual deles te interessa mais?"
```

---

## 🌐 URLs do Sistema

Após inicialização completa:

| Serviço | URL | Descrição |
|---------|-----|-----------|
| **Landing Page** | http://localhost:5173 | Página inicial |
| **CRM Admin** | http://localhost:5175 | Painel admin |
| **CRM Cliente** | http://localhost:5177 | Painel cliente (VendeAI) |
| **Backend Flask** | http://localhost:5000 | API Python |
| **Bot Server API** | http://localhost:3010/api/bot/* | API do bot |
| **WebSocket** | ws://localhost:3010/ws | QR Code e status |
| **AIra Auto Bot** | http://localhost:4000 | Bot veículos (legacy) |
| **AIra Imob Bot** | http://localhost:4001 | Bot imóveis (dev) |

---

## 🛠️ Serviços Iniciados (em ordem)

### [1/10] Backend Flask (5000)
- API REST
- Toggle bot ativo/inativo
- Webhook MercadoPago
- **Comando**: `python -m flask run`

### [2/10] Integrated Bot Server (3010)
- Servidor multi-tenant WhatsApp
- Bot Selector por nicho
- VendeAI Bot Integration
- **Comando**: `node integrated-bot-server.js`

### [3/10] WhatsApp Service Estável (3002)
- **DESATIVADO** (usando Integrated Bot Server)

### [4/10] AIra Auto Bot (4000)
- Bot legado de veículos
- **Comando**: `npm start` (AIra_Auto)

### [5/10] AIra Imob Bot (4001)
- Bot de imóveis (em desenvolvimento)
- **Comando**: `npm start` (AIra_Imob)

### [6/10] LocalTunnel Webhook
- Tunnel público para webhooks
- **Comando**: `start-tunnel-reconnect.bat`

### [7/10] CRM Admin (5175)
- Painel administrativo
- **Comando**: `npm run dev -- --port 5175`

### [8/10] CRM Cliente (5177)
- Interface do cliente integrada com VendeAI
- **Comando**: `npm run dev -- --port 5177`

### [9/10] Landing Page (5173)
- Página de apresentação
- **Comando**: `npm run dev -- --port 5173`

---

## 📊 API Endpoints Disponíveis

### Backend Flask (5000)

```bash
# Toggle bot ativo/inativo
POST /api/empresa/bot/toggle
Body: { "empresa_id": 9, "bot_ativo": true }

# Buscar configuração do bot
GET /api/bot-config/9

# Estatísticas
GET /api/stats/9
```

### Integrated Bot Server (3010)

```bash
# Status da conexão WhatsApp
GET /api/bot/status/9

# Conectar WhatsApp (gerar QR Code)
POST /api/bot/connect/9

# Desconectar WhatsApp
POST /api/bot/disconnect/9

# Listar todas as sessões ativas
GET /api/bot/sessions

# Ver nicho e tipo de bot
GET /api/bot/nicho/9

# WebSocket para QR Code em tempo real
WS ws://localhost:3010/ws?empresa_id=9
```

---

## 🐛 Troubleshooting

### Problema: MySQL não está rodando
**Erro**: "AVISO - MySQL nao esta rodando!"

**Solução**:
1. Abrir XAMPP Control Panel
2. Clicar em "Start" no MySQL
3. Pressionar qualquer tecla para continuar

---

### Problema: Porta já em uso
**Erro**: "Error: listen EADDRINUSE: address already in use :::5000"

**Solução**:
1. Fechar todas as janelas CMD abertas anteriormente
2. Abrir Task Manager (Ctrl+Shift+Esc)
3. Encerrar processos:
   - `node.exe`
   - `python.exe`
4. Executar script novamente

---

### Problema: QR Code não aparece
**Possíveis causas**:
- Bot Server (3010) não iniciou
- WebSocket não conectou
- Empresa não existe no banco

**Solução**:
1. Verificar janela "Integrated Bot Server" no terminal
2. Procurar por erros
3. Verificar console do navegador (F12)
4. Testar manualmente: `curl http://localhost:3010/api/bot/status/9`

---

### Problema: Bot não responde mensagens
**Possíveis causas**:
- Bot não está ativado (toggle)
- Empresa não tem nicho "veiculos"
- API keys não configuradas no .env

**Solução**:
1. Verificar toggle no CRM está **verde**
2. Verificar banco de dados:
   ```sql
   SELECT id, nome, nicho, bot_ativo FROM empresas WHERE id = 9;
   ```
3. Verificar logs do Bot Server (janela CMD)
4. Verificar arquivo `.env` tem as API keys

---

### Problema: Erro "Cannot find module"
**Erro**: "Error: Cannot find module '@whiskeysockets/baileys'"

**Solução**:
```bash
cd whatsapp_service
npm install
```

---

### Problema: Banco de dados não conecta
**Erro**: "Error: connect ECONNREFUSED 127.0.0.1:3306"

**Solução**:
1. Verificar MySQL está rodando
2. Verificar credenciais no `.env`:
   ```bash
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=u161861600_feiraoshow
   ```
3. Testar conexão:
   ```bash
   mysql -u root -p
   ```

---

## ✅ Checklist de Validação

Antes de testar, verificar:

- [ ] MySQL está rodando (XAMPP)
- [ ] Todas as 10 janelas CMD abriram
- [ ] Backend Flask mostra "Running on http://127.0.0.1:5000"
- [ ] Bot Server mostra "Servidor rodando na porta 3010"
- [ ] CRM Cliente acessível em http://localhost:5177
- [ ] Login funciona (demo@vendeai.com / demo123)
- [ ] Seção "Bot WhatsApp" existe no menu
- [ ] QR Code aparece ao clicar "Conectar"
- [ ] WhatsApp conecta (status verde)
- [ ] Toggle bot fica verde ao ativar
- [ ] Mensagem de teste recebe resposta do bot

---

## 📚 Documentação Adicional

Para mais detalhes técnicos:
- **INTEGRACAO_VENDEAI_CRM.md** - Arquitetura completa
- **GUIA_RAPIDO_CONEXAO_WHATSAPP.md** - Guia simplificado
- **ARQUITETURA_SISTEMA_COMPLETA.md** - Visão geral

---

## 🎉 Resumo

**Este script já faz TUDO automaticamente:**
✅ Limpa cache
✅ Verifica MySQL
✅ Instala dependências
✅ Inicia 10 serviços na ordem correta
✅ Aguarda cada serviço inicializar

**Você só precisa:**
1. Executar o `.bat`
2. Acessar http://localhost:5177
3. Conectar WhatsApp
4. Ativar o bot

**Pronto! Sistema 100% funcional com IA Master integrada! 🚀**
