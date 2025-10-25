# 🤖 Bot de IA - Setup Completo

## ✅ O QUE ESTÁ FUNCIONANDO

O sistema VendeAI agora tem **integração completa com IA** para respostas automáticas no WhatsApp!

### Fluxo Completo:

```
WhatsApp → Baileys Service → Webhook → Bot IA → Response → WhatsApp
```

## 🔧 CONFIGURAÇÃO

### 1. Ativar o Bot

Acesse: **http://localhost:5000/configuracoes**

Na aba **"Bot & IA"**, configure:

#### **Informações do Negócio** (obrigatório):
- ✅ Descrição da Empresa
- ✅ Produtos/Serviços
- ✅ Público-Alvo
- ✅ Diferenciais
- ✅ Horário de Atendimento

#### **Mensagens Automáticas**:
- ✅ Mensagem de Boas-vindas
- ✅ Mensagem de Ausência
- ✅ Tom de Conversa (formal, casual, profissional, amigável)

#### **Comportamento do Bot**:
- ✅ Auto-resposta Ativa (marque essa opção!)
- ✅ Enviar Áudio (se tiver ElevenLabs)
- ✅ Tempo de Resposta (segundos)

### 2. Configurar API de IA

Na aba **"Integrações"**, adicione:

#### **Opção 1: OpenAI (GPT-4)**
```
API Key: sk-...
Modelo: gpt-4-turbo (recomendado)
```

#### **Opção 2: Groq (Mais Rápido e Gratuito)**
```
API Key: gsk_...
Modelo: llama-3.1-70b-versatile
```

**Como conseguir chave Groq:**
1. Acesse: https://console.groq.com/
2. Crie uma conta grátis
3. Vá em "API Keys"
4. Gere uma nova chave
5. Cole no campo da configuração

### 3. Conectar WhatsApp

1. Execute: `START_WHATSAPP.bat`
2. Acesse: http://localhost:5000/whatsapp/
3. Clique em "Gerar QR Code"
4. Escaneie com seu WhatsApp
5. Aguarde conectar

### 4. Ativar o Bot

Após conectar o WhatsApp:

1. Na página http://localhost:5000/whatsapp/
2. Ative o switch **"Bot Ativo"**
3. Pronto! 🎉

## 📱 TESTANDO

Envie uma mensagem para o WhatsApp conectado:

```
Você: Oi
Bot: Olá! Bem-vindo à [Sua Empresa]. Como posso ajudar você hoje? 😊
```

```
Você: Quais produtos vocês tem?
Bot: Temos os seguintes produtos:
- [Produto 1]: R$ 99,90
- [Produto 2]: R$ 149,90
Qual te interessa?
```

## 🎯 FUNCIONALIDADES DISPONÍVEIS

### ✅ Respostas Automáticas
- Bot responde automaticamente todas as mensagens
- Usa contexto da conversa (lembra das mensagens anteriores)
- Acesso aos produtos cadastrados
- Tom de voz configurável

### ✅ Qualificação de Leads
- Salva automaticamente contatos como leads
- Registra histórico de conversas
- Atualiza última interação

### ✅ Gestão de Conversas
- Todas as conversas ficam salvas no banco
- Acesse em: http://localhost:5000/conversas/
- Veja histórico completo
- Estatísticas de mensagens

### ✅ Integração com Produtos
- Bot conhece todos os produtos cadastrados
- Pode recomendar produtos
- Passa preços automaticamente

## 🔌 ENDPOINTS DO WEBHOOK

Os seguintes endpoints estão ativos:

### 1. Receber Mensagem
```
POST http://localhost:5000/api/webhook/whatsapp/message

Payload:
{
  "empresaId": 2,
  "from": "5567999887766@s.whatsapp.net",
  "text": "Oi, quero comprar",
  "timestamp": 1234567890,
  "messageId": "ABC123"
}
```

### 2. Evento de Conexão
```
POST http://localhost:5000/api/webhook/whatsapp/connection

Payload:
{
  "empresaId": 2,
  "event": "connected",
  "numero": "5567999887766:79@s.whatsapp.net"
}
```

### 3. Teste do Webhook
```
GET http://localhost:5000/api/webhook/test
```

## 🛠️ COMO FUNCIONA (TÉCNICO)

### 1. Mensagem Recebida
1. WhatsApp → Baileys detecta mensagem
2. Baileys → Chama webhook do Flask
3. Flask → Salva mensagem no banco
4. Flask → Busca configuração do bot
5. Flask → Monta contexto (histórico + produtos)
6. Flask → Chama OpenAI/Groq
7. Flask → Salva resposta no banco
8. Flask → Retorna resposta
9. Baileys → Envia resposta pro WhatsApp

### 2. Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                      WHATSAPP WEB                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│            BAILEYS SERVICE (Node.js - Port 3001)            │
│  - Gerencia conexão WhatsApp                                │
│  - Recebe mensagens                                         │
│  - Envia mensagens                                          │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP POST
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         WEBHOOK (Flask - Port 5000/api/webhook)             │
│  - Recebe evento de mensagem                                │
│  - Salva no banco de dados                                  │
│  - Processa com IA                                          │
│  - Retorna resposta                                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  BOT IA PROCESSOR                           │
│  - Busca configuração da empresa                            │
│  - Busca histórico de conversa                              │
│  - Busca produtos cadastrados                               │
│  - Monta prompt para IA                                     │
│  - Chama OpenAI ou Groq                                     │
│  - Retorna resposta processada                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│               OPENAI / GROQ API                             │
│  - Gera resposta inteligente                                │
│  - Baseado no contexto fornecido                            │
└─────────────────────────────────────────────────────────────┘
```

## 🔍 TROUBLESHOOTING

### Bot não responde?

**1. Verificar se bot está ativo:**
- http://localhost:5000/whatsapp/
- O switch "Bot Ativo" deve estar VERDE

**2. Verificar configuração:**
- http://localhost:5000/configuracoes/
- Aba "Bot & IA" → "Auto-resposta Ativa" deve estar marcado

**3. Verificar API Key:**
- http://localhost:5000/configuracoes/
- Aba "Integrações" → Deve ter OpenAI ou Groq configurado

**4. Verificar logs do serviço WhatsApp:**
```bash
# No terminal onde rodou START_WHATSAPP.bat
# Deve aparecer:
[Backend] Enviando evento message_received para http://localhost:5000/api/webhook/whatsapp/message
[Backend] ✅ Resposta: OK
```

**5. Verificar logs do Flask:**
```bash
# No terminal do backend
# Deve aparecer:
📥 [WEBHOOK] Mensagem recebida: {...}
[IA] Resposta gerada: ...
[WHATSAPP] Mensagem enviada para ...
```

### Mensagem não chega no webhook?

**Certifique-se que:**
1. Serviço WhatsApp está rodando (`START_WHATSAPP.bat`)
2. Backend Flask está rodando
3. WhatsApp está conectado
4. Não é mensagem de broadcast (status@broadcast é ignorado)

### IA não responde corretamente?

**Melhore o prompt:**
1. Preencha TODAS as informações na aba "Bot & IA"
2. Cadastre produtos em http://localhost:5000/produtos/
3. Seja específico na descrição da empresa
4. Configure o tom de conversa adequado

## 📊 PRÓXIMOS PASSOS

- [ ] Implementar áudio com ElevenLabs
- [ ] Adicionar webhooks personalizados (como o do FeiraoShowCar)
- [ ] Implementar remarketing automático
- [ ] Adicionar botões interativos no WhatsApp
- [ ] Integrar com calendário para agendamentos

## 🎉 ESTÁ PRONTO!

Agora você tem um **robô de vendas completo** funcionando!

O bot vai:
- ✅ Responder automaticamente todas as mensagens
- ✅ Usar IA para dar respostas inteligentes
- ✅ Salvar todos os leads e conversas
- ✅ Recomendar seus produtos
- ✅ Manter contexto da conversa

**Teste agora enviando uma mensagem pro WhatsApp conectado!** 🚀
