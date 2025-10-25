# 🎙️ Webhook ElevenLabs - Configuração

## 📋 Informações do Webhook

### URL do Webhook (Fixa)
```
https://meuapp.loca.lt/api/webhook/elevenlabs
```

### Como funciona:

1. **LocalTunnel** cria um túnel seguro da porta 5000 (local) para a URL pública
2. O subdomínio `meuapp` é **fixo** e sempre será o mesmo
3. O Backend Flask recebe os eventos na rota `/api/webhook/elevenlabs`

---

## 🚀 Como Iniciar o Sistema Completo

### Opção 1: Iniciar TUDO de uma vez (Recomendado)

Execute o arquivo `START.bat`:

```bash
START.bat
```

Isso iniciará automaticamente:
1. ✅ Backend Flask (porta 5000)
2. ✅ WhatsApp Service (porta 3001)
3. ✅ Bot Engine (processamento)
4. ✅ LocalTunnel Webhook (https://meuapp.loca.lt)

### Opção 2: Iniciar apenas o Webhook

Se os outros serviços já estão rodando e você só precisa do webhook:

```bash
START_WEBHOOK.bat
```

---

## 🔧 Configurar no ElevenLabs

### 1. Acesse o Dashboard do ElevenLabs
   - URL: https://elevenlabs.io/app/conversational-ai

### 2. Selecione seu Agent
   - Agent ID (do .env): `agent_i601k732nwryf069paehrd6j47e2`

### 3. Configure o Webhook
   - Vá em **Settings** → **Webhooks**
   - Cole a URL: `https://meuapp.loca.lt/api/webhook/elevenlabs`
   - Selecione os eventos que deseja receber:
     - ✅ `call.started` - Quando uma chamada inicia
     - ✅ `call.ended` - Quando uma chamada termina
     - ✅ `agent.message` - Mensagens do agente

### 4. Teste o Webhook
   - O ElevenLabs fará uma requisição GET para verificar
   - Se retornar "online", está funcionando! ✅

---

## 📊 Eventos Recebidos

### 1. `call.started`
Quando uma chamada de voz inicia:
```json
{
  "event_type": "call.started",
  "call_id": "abc123",
  "timestamp": "2025-10-11T10:30:00Z"
}
```

### 2. `call.ended`
Quando uma chamada termina (com transcrição):
```json
{
  "event_type": "call.ended",
  "call_id": "abc123",
  "duration": 120,
  "transcript": "Cliente: Olá, quero saber sobre carros...",
  "timestamp": "2025-10-11T10:32:00Z"
}
```

### 3. `agent.message`
Mensagens do agente durante a conversa:
```json
{
  "event_type": "agent.message",
  "call_id": "abc123",
  "message": "Claro! Temos ótimas opções de veículos...",
  "timestamp": "2025-10-11T10:31:00Z"
}
```

---

## 🧪 Testar o Webhook Manualmente

### Teste 1: Verificar se está online (GET)
```bash
curl https://meuapp.loca.lt/api/webhook/elevenlabs
```

**Resposta esperada:**
```json
{
  "status": "online",
  "service": "ElevenLabs Webhook",
  "message": "Webhook ElevenLabs pronto para receber eventos",
  "timestamp": "2025-10-11T12:30:45.123456"
}
```

### Teste 2: Simular evento (POST)
```bash
curl -X POST https://meuapp.loca.lt/api/webhook/elevenlabs \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "call.ended",
    "call_id": "test123",
    "duration": 60,
    "transcript": "Teste de conversa"
  }'
```

---

## 📝 Logs do Webhook

Quando um evento chega, você verá no console:

```
🎙️ [ELEVENLABS-WEBHOOK] Evento recebido: {
  "event_type": "call.ended",
  "call_id": "abc123",
  "duration": 120,
  "transcript": "Cliente perguntou sobre sedan..."
}

[ELEVENLABS] Chamada finalizada
  Call ID: abc123
  Duração: 120s
  Transcrição: Cliente perguntou sobre sedan...
```

---

## ⚠️ Troubleshooting

### Problema: "Este site não pode ser acessado"
**Solução:**
- Verifique se o Backend Flask está rodando na porta 5000
- Verifique se o LocalTunnel está rodando (janela "VendeAI Webhook Tunnel")

### Problema: LocalTunnel pede senha
**Solução:**
- Isso é normal na primeira vez
- Acesse o link que aparece no browser
- Clique em "Click to Continue"
- A senha é temporária e só precisa fazer uma vez

### Problema: Subdomínio 'meuapp' já está em uso
**Solução:**
- Isso significa que você já tem outro LocalTunnel rodando
- Feche todas as janelas do LocalTunnel
- Execute novamente o START.bat

### Problema: ElevenLabs não envia eventos
**Solução:**
1. Verifique se a URL está correta no dashboard
2. Teste a URL manualmente com curl (GET)
3. Verifique se o webhook está habilitado no ElevenLabs
4. Verifique os logs do Flask para ver se chegou algo

---

## 🔒 Segurança

O webhook aceita requisições de qualquer origem para facilitar o desenvolvimento.

**Para produção**, adicione validação:
- Token de autenticação do ElevenLabs
- Verificação de IP de origem
- HTTPS obrigatório

---

## 📚 Referências

- **LocalTunnel Docs:** https://github.com/localtunnel/localtunnel
- **ElevenLabs Webhooks:** https://elevenlabs.io/docs/api-reference/webhooks
- **Agent ID:** `agent_i601k732nwryf069paehrd6j47e2`

---

## ✅ Checklist de Configuração

- [ ] Backend Flask rodando (porta 5000)
- [ ] LocalTunnel rodando (https://meuapp.loca.lt)
- [ ] Webhook configurado no ElevenLabs
- [ ] URL testada com curl (GET retorna "online")
- [ ] Eventos selecionados no ElevenLabs
- [ ] Teste de chamada realizado

**Tudo pronto! 🎉**
