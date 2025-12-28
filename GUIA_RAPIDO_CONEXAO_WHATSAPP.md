# Guia Rápido: Como Conectar o WhatsApp no CRM

## 🚀 Iniciar o Sistema

### 1. Iniciar Backend (Flask)
```bash
cd backend
python -m flask run
```
✅ Backend rodando em `http://localhost:5000`

### 2. Iniciar Bot Server (WhatsApp)
```bash
cd whatsapp_service
node integrated-bot-server.js
```
✅ Bot Server rodando em `http://localhost:3010`

### 3. Iniciar CRM Frontend
```bash
cd CRM_Client/crm-client-app
npm run dev
```
✅ CRM rodando em `http://localhost:5173`

---

## 📱 Conectar WhatsApp pelo CRM

### Passo 1: Acessar a Página de Conexão
1. Abra o navegador em `http://localhost:5173`
2. Faça login no CRM
3. Vá até a seção **"WhatsApp"** ou **"Conexão WhatsApp"**

### Passo 2: Gerar QR Code
1. Clique no botão **"Conectar WhatsApp"**
2. Aguarde 2-5 segundos
3. QR Code será exibido na tela

### Passo 3: Escanear QR Code
1. Pegue seu celular
2. Abra o **WhatsApp**
3. Toque em **Menu (⋮)** no canto superior direito
4. Selecione **"Aparelhos conectados"**
5. Toque em **"Conectar um aparelho"**
6. Aponte a câmera para o QR Code na tela do computador

### Passo 4: Aguardar Conexão
- A tela ficará **amarela** e mostrará "Autenticando..."
- Após 2-3 segundos, ficará **verde** com "Conectado"
- Seu número de WhatsApp será exibido

### Passo 5: Ativar o Bot
1. Verifique se o toggle **"Status do Bot"** está em **"Bot Ativo"** (verde)
2. Se estiver em **"Bot Pausado"** (cinza), clique no switch para ativar
3. Pronto! O bot já está atendendo automaticamente

---

## 🤖 Como o Bot Funciona

### Quando um cliente manda mensagem:

1. **Cliente**: Envia mensagem no WhatsApp
2. **Sistema**: Recebe e identifica a empresa
3. **IA Master**: Analisa a mensagem
   - 🎯 Identifica intenção (comprar, dúvida, negociar)
   - 🎭 Analisa sentimento (positivo, neutro, negativo)
   - 🧠 Recomenda veículos baseado no perfil
   - 📊 Calcula probabilidade de fechamento
4. **Bot**: Gera resposta personalizada
5. **Cliente**: Recebe resposta automática

### Recursos da IA:
- ✅ Análise de intenções
- ✅ Recomendações inteligentes de veículos
- ✅ Análise de sentimento
- ✅ Memória da conversa
- ✅ Simulação de financiamento
- ✅ Consulta valores FIPE
- ✅ Agendamento de visitas
- ✅ Geração de áudio (ElevenLabs)

---

## 🎛️ Controles Disponíveis

### Status da Conexão
- 🔴 **Desconectado**: WhatsApp não conectado
- 🟡 **Conectando**: Gerando QR Code ou autenticando
- 🟢 **Conectado**: WhatsApp ativo e funcionando

### Status do Bot
- 🟢 **Bot Ativo**: Responde mensagens automaticamente
- ⚪ **Bot Pausado**: Não responde (mensagens ficam pendentes)

### Estatísticas
- **Mensagens Hoje**: Total de mensagens trocadas hoje
- **Conversas Ativas**: Conversas em andamento

---

## ⚙️ Configurações Importantes

### Arquivo `.env` (VendeAI/.env)
```bash
# IA (Obrigatório para bot funcionar)
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=sk-proj-...

# Áudio (Opcional)
ELEVENLABS_API_KEY=sk_...
ELEVENLABS_VOICE_ID=r2fkFV8WAqXq2AqBpgJT

# Loja
VENDEDOR_NOME=Aira
LOJA_NOME=Feirão ShowCar
LOJA_TELEFONE=5567999887766
```

### Banco de Dados
- A empresa precisa ter `nicho = 'veiculos'` na tabela `empresas`
- Veículos disponíveis na tabela `veiculos`

---

## 🐛 Problemas Comuns

### QR Code não aparece
**Solução**:
1. Verificar se bot server está rodando (porta 3010)
2. Abrir console do navegador (F12) e verificar erros
3. Tentar clicar em "Atualizar Status"
4. Recarregar a página

### Bot não responde mensagens
**Solução**:
1. Verificar se "Bot Ativo" está **ligado** (verde)
2. Verificar se WhatsApp está **conectado** (verde)
3. Ver logs do bot server no terminal
4. Verificar se API keys estão no `.env`

### Conexão caiu
**Solução**:
1. Clicar em "Desconectar WhatsApp"
2. Aguardar 5 segundos
3. Clicar em "Conectar WhatsApp" novamente
4. Escanear novo QR Code

### Erro "empresa não encontrada"
**Solução**:
1. Verificar se `empresa_id` está correto
2. Conferir tabela `empresas` no banco
3. Verificar se empresa tem `nicho = 'veiculos'`

---

## 📊 Verificar se Está Funcionando

### 1. Via Interface CRM
- Status deve estar **verde** ("Conectado")
- Bot Ativo deve estar **ligado**
- Número do WhatsApp deve aparecer

### 2. Via API (curl)
```bash
# Verificar status
curl http://localhost:3010/api/bot/status/9

# Ver sessões ativas
curl http://localhost:3010/api/bot/sessions

# Ver nicho da empresa
curl http://localhost:3010/api/bot/nicho/9
```

### 3. Via Logs
```bash
# Logs do bot server
cd whatsapp_service
node integrated-bot-server.js

# Procurar por:
# ✅ WhatsApp conectado para empresa X
# 🤖 Bot carregado com sucesso
# 📨 Mensagem recebida...
```

### 4. Teste Real
1. Enviar mensagem de outro número para o WhatsApp conectado
2. Mensagem deve aparecer no terminal do bot server
3. Bot deve responder automaticamente
4. Resposta deve usar IA para ser contextual

---

## 📚 Documentação Completa

Para mais detalhes técnicos, consulte:
- **INTEGRACAO_VENDEAI_CRM.md** - Arquitetura completa
- **ARQUITETURA_SISTEMA_COMPLETA.md** - Visão geral do sistema

---

## 🆘 Suporte

Se precisar de ajuda:
1. Verificar logs dos 3 servidores (backend, bot server, frontend)
2. Conferir arquivo `.env` está correto
3. Verificar banco de dados tem as tabelas necessárias
4. Consultar documentação completa
