# Guia de Teste - Webhook ElevenLabs + Claude API

## 🎯 Objetivo

Validar que a integração entre ElevenLabs e Claude API está funcionando corretamente.

---

## ⚙️ Pré-requisitos

### 1. Configurar Variáveis de Ambiente

Edite o arquivo `.env` na raiz do projeto:

```bash
# Claude API
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxx

# ElevenLabs API
ELEVENLABS_API_KEY=xi_xxxxxxxxxxxxxxxxxxxxxxxxxx

# Banco de Dados (se necessário)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=u161861600_feiraoshow
```

### 2. Instalar Dependências

```bash
pip install anthropic
```

Se já tiver `requirements.txt`:
```bash
pip install -r requirements.txt
```

### 3. Iniciar Servidor Flask

```bash
# Windows
python run.py

# Linux/Mac
python3 run.py
```

**Saída esperada:**
```
 * Running on http://127.0.0.1:5000
 * Running on http://192.168.1.100:5000
```

---

## 🧪 Testes

### Teste 1: Verificar se Webhook está Online

**Comando:**
```bash
curl http://localhost:5000/api/webhook/elevenlabs
```

**Resposta Esperada:**
```json
{
  "status": "online",
  "service": "ElevenLabs Webhook + Claude API",
  "message": "Webhook ElevenLabs pronto para receber eventos",
  "timestamp": "2025-10-14T22:51:59.123456"
}
```

**Status:** ✅ Se retornou JSON acima, está funcionando!

---

### Teste 2: Simular Evento `conversation.started`

**Comando:**
```bash
curl -X POST http://localhost:5000/api/webhook/elevenlabs \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "conversation.started",
    "conversation_id": "test_conv_123"
  }'
```

**Resposta Esperada:**
```json
{
  "success": true,
  "message": "Evento processado com sucesso",
  "timestamp": "2025-10-14T22:51:59.123456"
}
```

**Logs Esperados no Terminal:**
```
🎙️ [ELEVENLABS-WEBHOOK] Evento recebido: {
  "event_type": "conversation.started",
  "conversation_id": "test_conv_123"
}
[ELEVENLABS] 🚀 Conversa iniciada: test_conv_123
```

**Status:** ✅ Se recebeu 200 e viu logs, está OK!

---

### Teste 3: Simular Transcrição (Evento Principal)

**Comando:**
```bash
curl -X POST http://localhost:5000/api/webhook/elevenlabs \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "conversation.transcript",
    "conversation_id": "test_conv_123",
    "transcript": "Olá, quero comprar um carro SUV"
  }'
```

**Resposta Esperada:**
```json
{
  "success": true,
  "message": "Evento processado com sucesso",
  "timestamp": "2025-10-14T22:51:59.123456"
}
```

**Logs Esperados no Terminal:**
```
🎙️ [ELEVENLABS-WEBHOOK] Evento recebido: {...}
[ELEVENLABS] 💬 Usuário disse: "Olá, quero comprar um carro SUV"
[ELEVENLABS] 🆔 Conversation ID: test_conv_123

🤖 [CLAUDE-API] Processando mensagem...
[HISTÓRICO] 🆕 Nova conversa iniciada: test_conv_123
[CLAUDE-API] 📤 Enviando para Claude Sonnet 4.5...
[CLAUDE-API] 📝 Histórico: 0 mensagens
[CLAUDE-API] ✅ Resposta gerada: "Opa! Que legal! Me conta, qual é o orçamento que você tem em mente?"
[CLAUDE-API] 📊 Tokens usados: 245 in / 28 out
[HISTÓRICO] 💾 Salvo para conversa test_conv_123 (total: 2 msgs)

📤 [ELEVENLABS-API] Enviando resposta para conversa test_conv_123...
[ELEVENLABS-API] 🎯 URL: https://api.elevenlabs.io/v1/convai/conversation/test_conv_123/message
[ELEVENLABS-API] 💬 Texto: "Opa! Que legal! Me conta, qual é o orçamento que você tem em mente?"
```

**Possíveis Resultados:**

#### ✅ SUCESSO - Se ELEVENLABS_API_KEY configurada:
```
[ELEVENLABS-API] ✅ Resposta enviada com sucesso!
[ELEVENLABS-API] 📡 Status: 200
[ELEVENLABS] ✅ Resposta enviada com sucesso
```

#### ⚠️ PARCIAL - Se ELEVENLABS_API_KEY não configurada:
```
[ELEVENLABS-API] ❌ ELEVENLABS_API_KEY não configurada!
[ELEVENLABS] ⚠️ Falha ao enviar resposta
```
**Nota:** Claude processou, mas não conseguiu enviar para ElevenLabs. **Isso é esperado se você não tiver a API key.**

#### ❌ ERRO - Se ANTHROPIC_API_KEY não configurada:
```
[CLAUDE-API] ❌ ANTHROPIC_API_KEY não configurada!
```

---

### Teste 4: Testar Contexto/Histórico

**Envie uma segunda mensagem na mesma conversa:**

```bash
curl -X POST http://localhost:5000/api/webhook/elevenlabs \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "conversation.transcript",
    "conversation_id": "test_conv_123",
    "transcript": "Meu orçamento é até 80 mil reais"
  }'
```

**Logs Esperados:**
```
🤖 [CLAUDE-API] Processando mensagem...
[HISTÓRICO] 📚 Recuperado histórico com 2 mensagens  ← IMPORTANTE!
[CLAUDE-API] 📤 Enviando para Claude Sonnet 4.5...
[CLAUDE-API] 📝 Histórico: 2 mensagens  ← CONTEXTO MANTIDO!
[CLAUDE-API] ✅ Resposta gerada: "Perfeito! Temos ótimas opções de SUV até 80 mil. Você prefere automático ou manual?"
[HISTÓRICO] 💾 Salvo para conversa test_conv_123 (total: 4 msgs)
```

**Status:** ✅ Se o histórico aumentou (2 → 4 msgs), está mantendo contexto!

---

### Teste 5: Testar Fim de Conversa

**Comando:**
```bash
curl -X POST http://localhost:5000/api/webhook/elevenlabs \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "conversation.ended",
    "conversation_id": "test_conv_123",
    "duration": 120
  }'
```

**Logs Esperados:**
```
🎙️ [ELEVENLABS-WEBHOOK] Evento recebido: {...}
[ELEVENLABS] 🏁 Conversa finalizada: test_conv_123
[ELEVENLABS] ⏱️ Duração: 120s
[ELEVENLABS] 🗑️ Histórico removido (4 mensagens)
```

**Status:** ✅ Se histórico foi removido, está OK!

---

### Teste 6: Testar Validação HMAC (Avançado)

**Sem assinatura (deve funcionar):**
```bash
curl -X POST http://localhost:5000/api/webhook/elevenlabs \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "conversation.transcript",
    "conversation_id": "test_hmac",
    "transcript": "Teste HMAC"
  }'
```

**Resultado:** ✅ Funciona (HMAC é opcional se header não enviado)

**Com assinatura inválida (deve falhar):**
```bash
curl -X POST http://localhost:5000/api/webhook/elevenlabs \
  -H "Content-Type: application/json" \
  -H "elevenlabs-signature: assinatura_invalida_123" \
  -d '{
    "event_type": "conversation.transcript",
    "conversation_id": "test_hmac",
    "transcript": "Teste HMAC"
  }'
```

**Resultado Esperado:** ❌ HTTP 401
```json
{
  "error": "Invalid signature"
}
```

**Logs:**
```
[ELEVENLABS-WEBHOOK] ⚠️ Assinatura HMAC inválida!
  Recebido: assinatura_invalida_123
  Esperado: (hash calculado)
```

**Status:** ✅ Se recebeu 401, validação HMAC está funcionando!

---

## 🔍 Verificação de Erros Comuns

### Erro: "ModuleNotFoundError: No module named 'anthropic'"

**Solução:**
```bash
pip install anthropic
```

---

### Erro: "ANTHROPIC_API_KEY não configurada"

**Solução:**
1. Verificar se `.env` tem a chave:
```bash
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxx
```

2. Reiniciar servidor Flask:
```bash
python run.py
```

---

### Erro: "ELEVENLABS_API_KEY não configurada"

**Nota:** Isso NÃO impede o funcionamento do Claude!

- ✅ Claude ainda processa mensagens
- ⚠️ Apenas não envia resposta de volta para ElevenLabs

**Se você tem a chave:**
```bash
ELEVENLABS_API_KEY=xi_xxxxxxxx
```

---

### Erro: HTTP 500 Internal Server Error

**Verificar logs no terminal para ver stack trace completo.**

**Causas comuns:**
- Banco de dados não conectado (mas não afeta webhook ElevenLabs)
- Erro de sintaxe no código
- Biblioteca faltando

---

## 📊 Checklist de Validação

Marque cada teste realizado:

- [ ] **Teste 1:** GET retorna status "online" ✅
- [ ] **Teste 2:** Evento `conversation.started` processa ✅
- [ ] **Teste 3:** Evento `conversation.transcript` processa com Claude ✅
- [ ] **Teste 4:** Histórico é mantido entre mensagens ✅
- [ ] **Teste 5:** Evento `conversation.ended` limpa histórico ✅
- [ ] **Teste 6:** Validação HMAC bloqueia assinaturas inválidas ✅

**Extras:**
- [ ] Agent tools (`/buscar-carros`, `/detalhes-veiculo`) funcionam ✅
- [ ] Logs estão claros e informativos ✅
- [ ] Erros são tratados graciosamente ✅

---

## 🎯 Teste de Integração Completo (Opcional)

Se você tem acesso ao **ElevenLabs Agent** configurado:

1. Configure o webhook URL no painel ElevenLabs:
   ```
   https://seu-dominio.com/api/webhook/elevenlabs
   ```

2. Configure o webhook secret:
   ```
   wsec_af7d8eef98f77d60679a19ad289a53a873a31a0f19ae33ed3173fb3e21234e82
   ```

3. Inicie uma chamada de teste com o agente

4. Verifique logs em tempo real:
   ```bash
   tail -f logs/flask.log
   # ou
   python run.py  # se rodando em modo debug
   ```

5. Observe o fluxo completo:
   - Usuário fala → Transcrição
   - Claude processa → Resposta
   - ElevenLabs fala resposta

---

## 🚨 Troubleshooting

### Claude responde mas ElevenLabs não fala

**Causa:** API key inválida ou conversation_id incorreto

**Verificar:**
```
[ELEVENLABS-API] ❌ Erro HTTP: ...
```

**Solução:**
- Verificar `ELEVENLABS_API_KEY`
- Verificar se `conversation_id` está correto

---

### Histórico não está sendo mantido

**Verificar logs:**
```
[HISTÓRICO] 📚 Recuperado histórico com X mensagens
```

**Se sempre mostra 0:**
- Verificar se `conversation_id` é o mesmo entre mensagens
- Reiniciar servidor pode limpar histórico (memória volátil)

---

### Validação HMAC sempre falha

**Causa:** Secret incorreto

**Verificar:**
```python
ELEVENLABS_WEBHOOK_SECRET = 'wsec_...'  # Linha 28
```

**Solução:**
- Copiar secret exato do painel ElevenLabs
- Não adicionar espaços ou quebras de linha

---

## 📈 Próximos Passos

Após validar tudo:

1. ✅ Configurar webhook no ElevenLabs Agent
2. ✅ Testar em ambiente de produção
3. ✅ Monitorar logs e performance
4. ✅ Ajustar system prompt conforme necessário
5. ✅ Implementar persistência de histórico (Redis/DB) se necessário

---

## 📞 Suporte

Se encontrar problemas:

1. Verificar logs detalhados no terminal
2. Revisar `CHANGELOG.md` para detalhes técnicos
3. Verificar `DIFF_SUMMARY.md` para entender mudanças
4. Consultar documentação oficial:
   - [Anthropic Claude API](https://docs.anthropic.com/)
   - [ElevenLabs Conversational AI](https://elevenlabs.io/docs/conversational-ai)

---

**Última atualização:** 2025-10-14
**Versão do commit:** commit_20251014_225159
