# Commit: Integração Claude API no Webhook ElevenLabs

**Data:** 2025-10-14 22:51:59

## Alterações Planejadas

1. **Validação HMAC Signature**
   - Adicionar validação de assinatura HMAC para segurança
   - Webhook secret: `wsec_af7d8eef98f77d60679a19ad289a53a873a31a0f19ae33ed3173fb3e21234e82`

2. **Integração Claude API**
   - Substituir/adicionar processamento com Claude Sonnet 4.5
   - Model: `claude-sonnet-4-20250514`
   - Temperature: 0.7
   - Max tokens: 300

3. **Sistema de Histórico**
   - Implementar cache global de conversas
   - Manter contexto entre mensagens

4. **Envio de Resposta para ElevenLabs**
   - Implementar POST para API ElevenLabs
   - Endpoint: `/v1/convai/conversation/{id}/message`

5. **System Prompt da Aria**
   - Vendedora consultiva de veículos
   - Tom profissional e empático
   - Respostas curtas para áudio

## Arquivos Backup

- `webhook.py.backup` - Versão original antes das alterações

## Para Restaurar

```bash
cp commits/commit_20251014_225159/webhook.py.backup backend/routes/webhook.py
```
