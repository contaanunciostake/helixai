# 🔥 Integração PIX - Mercado Pago

## 📋 Visão Geral

Sistema completo de pagamento PIX integrado com Mercado Pago para o VendeAI, implementando:

- ✅ Geração de QR Code PIX
- ✅ Código PIX Copia e Cola
- ✅ Verificação automática de pagamento em tempo real
- ✅ Timer de expiração (10 minutos)
- ✅ Redirecionamento automático após aprovação
- ✅ Webhook para notificações do Mercado Pago

---

## 🚀 Como Funciona

### Fluxo do Pagamento PIX

```
1. Cliente escolhe PIX no checkout
   ↓
2. Backend cria pagamento PIX no Mercado Pago
   ↓
3. Mercado Pago retorna QR Code + Código Copia e Cola
   ↓
4. Frontend exibe QR Code e código
   ↓
5. Cliente paga via app do banco
   ↓
6. Sistema verifica status a cada 5 segundos
   ↓
7. Webhook do Mercado Pago notifica aprovação
   ↓
8. Sistema ativa assinatura automaticamente
   ↓
9. Cliente é redirecionado para página de sucesso
```

---

## 🔧 Configuração

### 1. Credenciais do Mercado Pago

Adicione as credenciais no arquivo `.env` do backend:

```env
# backend/VendeAI/.env
MERCADOPAGO_ACCESS_TOKEN=seu_access_token_aqui
MERCADOPAGO_PUBLIC_KEY=sua_public_key_aqui
```

**Como obter as credenciais:**

1. Acesse: https://www.mercadopago.com.br/developers
2. Vá em "Suas credenciais"
3. Copie o **Access Token** e **Public Key**
4. Use credenciais de **Produção** (não teste)

### 2. Configurar Webhook

O Mercado Pago precisa notificar seu sistema sobre pagamentos:

**URL do Webhook:**
```
https://seu-dominio.com/api/webhook/mercadopago
```

**Como configurar:**

1. Acesse: https://www.mercadopago.com.br/developers/panel/app
2. Vá em "Webhooks"
3. Adicione a URL acima
4. Selecione eventos:
   - `payment`
   - `merchant_order`

**Para desenvolvimento local (ngrok):**

```bash
ngrok http 5000
# Use a URL gerada: https://abc123.ngrok.io/api/webhook/mercadopago
```

---

## 📡 API Endpoints

### 1. Criar Pagamento PIX

**Endpoint:** `POST /api/assinatura/pagar/pix`

**Request:**
```json
{
  "plano_id": 1,
  "email": "cliente@email.com",
  "nome": "João Silva",
  "cpf": "12345678900"
}
```

**Response (Sucesso):**
```json
{
  "success": true,
  "status": "pending",
  "payment_id": "123456789",
  "qr_code": "00020126580014br.gov.bcb.pix...",
  "qr_code_base64": "iVBORw0KGgoAAAANSUh...",
  "transaction_amount": 497.00,
  "message": "Aguardando confirmação do pagamento"
}
```

**Response (Erro):**
```json
{
  "success": false,
  "error": "Plano não encontrado"
}
```

### 2. Verificar Status do Pagamento

**Endpoint:** `GET /api/assinatura/status/pagamento/<payment_id>`

**Response:**
```json
{
  "success": true,
  "payment_id": "123456789",
  "status": "approved",
  "status_detail": "accredited",
  "transaction_amount": 497.00,
  "payment_method_id": "pix",
  "date_created": "2025-01-23T10:30:00.000Z",
  "date_approved": "2025-01-23T10:32:15.000Z"
}
```

**Status Possíveis:**
- `pending`: Aguardando pagamento
- `approved`: Pagamento aprovado
- `rejected`: Pagamento rejeitado
- `cancelled`: Pagamento cancelado
- `refunded`: Pagamento estornado

### 3. Webhook do Mercado Pago

**Endpoint:** `POST /api/webhook/mercadopago`

Recebe notificações automáticas do Mercado Pago quando:
- Pagamento é aprovado
- Pagamento é rejeitado
- Pagamento é estornado

**Exemplo de payload:**
```json
{
  "action": "payment.updated",
  "api_version": "v1",
  "data": {
    "id": "123456789"
  },
  "date_created": "2025-01-23T10:32:15Z",
  "id": 987654321,
  "live_mode": true,
  "type": "payment",
  "user_id": "123456"
}
```

---

## 💻 Frontend - Componente PaymentPix

### Uso

```javascript
import { useNavigate } from 'react-router-dom'

// Criar pagamento PIX
const criarPagamentoPix = async () => {
  const response = await fetch('http://localhost:5000/api/assinatura/pagar/pix', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      plano_id: 1,
      email: 'cliente@email.com',
      nome: 'João Silva',
      cpf: '12345678900'
    })
  })

  const data = await response.json()

  if (data.success) {
    // Redirecionar para página do PIX
    navigate('/pagamento/pix', {
      state: {
        pixData: {
          qr_code: data.qr_code,
          qr_code_base64: data.qr_code_base64,
          payment_id: data.payment_id,
          status: data.status,
          transaction_amount: data.transaction_amount
        }
      }
    })
  }
}
```

### Funcionalidades da Página PIX

1. **QR Code Dinâmico**
   - Exibe QR Code em imagem Base64
   - Cliente escaneia com app do banco

2. **Código Copia e Cola**
   - Campo de texto com código PIX
   - Botão para copiar
   - Feedback visual ao copiar

3. **Timer de Expiração**
   - 10 minutos para pagamento
   - Contagem regressiva em tempo real
   - Aviso de expiração

4. **Verificação Automática**
   - Verifica status a cada 5 segundos
   - Indica quando está verificando
   - Redireciona automaticamente ao aprovar

5. **Instruções Passo a Passo**
   - Guia visual de como pagar
   - Numeração clara
   - Ícones ilustrativos

---

## 🎨 Customização do Frontend

### Cores e Tema

O componente usa cores do PIX (ciano/teal):

```css
/* Gradientes principais */
from-cyan-400 via-teal-400 to-blue-400

/* Bordas */
border-cyan-500/50

/* Destaques */
text-cyan-400
```

### Timer de Expiração

Altere o tempo em `PaymentPix.jsx`:

```javascript
const [timeLeft, setTimeLeft] = useState(600) // 600 = 10 minutos
```

### Intervalo de Verificação

Altere a frequência de verificação:

```javascript
const interval = setInterval(checkPayment, 5000) // 5000 = 5 segundos
```

---

## 🔐 Segurança

### Boas Práticas Implementadas

1. **Access Token no Backend**
   - Nunca expor no frontend
   - Armazenar em variável de ambiente
   - Não commitar no Git

2. **Validação de Dados**
   - Verificar email válido
   - Validar CPF (opcional mas recomendado)
   - Sanitizar inputs

3. **Verificação de Status**
   - Sempre consultar API do Mercado Pago
   - Não confiar apenas no frontend
   - Usar webhook para confirmação

4. **HTTPS Obrigatório**
   - Webhook exige HTTPS
   - Protege dados sensíveis
   - Use certificado SSL válido

---

## 🐛 Troubleshooting

### PIX não é gerado

**Possíveis causas:**
- Credenciais incorretas
- Access Token de teste (use produção)
- Conta do Mercado Pago não ativada para PIX

**Solução:**
```bash
# Verificar credenciais
curl -H "Authorization: Bearer SEU_ACCESS_TOKEN" \
  https://api.mercadopago.com/v1/account/settings

# Deve retornar dados da conta
```

### QR Code não aparece

**Possíveis causas:**
- `qr_code_base64` não está sendo retornado
- Mercado Pago rejeitou o pagamento
- Dados do pagador incompletos

**Solução:**
1. Verificar logs do backend
2. Conferir response completa da API
3. Adicionar CPF do pagador

### Webhook não funciona

**Possíveis causas:**
- URL não acessível publicamente
- HTTPS não configurado
- Webhook não cadastrado no Mercado Pago

**Solução:**
1. Usar ngrok para desenvolvimento local
2. Verificar logs do webhook
3. Testar URL manualmente:

```bash
curl -X POST http://localhost:5000/api/webhook/mercadopago \
  -H "Content-Type: application/json" \
  -d '{"type":"payment","data":{"id":"123456"}}'
```

### Pagamento não é detectado

**Possíveis causas:**
- Verificação automática desativada
- Erro no endpoint de status
- Payment ID incorreto

**Solução:**
1. Verificar logs do navegador (Console)
2. Testar endpoint de status manualmente:

```bash
curl http://localhost:5000/api/assinatura/status/pagamento/123456
```

---

## 📊 Logs e Monitoramento

### Backend Logs

O sistema imprime logs detalhados:

```
[PIX] Criando pagamento PIX...
[PIX] Plano ID: 1
[PIX] Email: cliente@email.com
[MercadoPago] Processando pagamento direto...
[MercadoPago] Método de pagamento: pix
[MercadoPago] Pagamento PIX detectado - configurando...
[PIX] Pagamento criado com sucesso!
[PIX] Status: pending
[PIX] Payment ID: 123456789
```

### Frontend Logs

Verificar no Console do navegador:

```javascript
console.log('[PIX] QR Code:', qr_code)
console.log('[PIX] Payment ID:', payment_id)
console.log('[PIX] Verificando status...')
console.log('[PIX] Status atualizado:', status)
```

---

## 🧪 Testes

### Teste Manual

1. **Criar Pagamento PIX:**
```bash
curl -X POST http://localhost:5000/api/assinatura/pagar/pix \
  -H "Content-Type: application/json" \
  -d '{
    "plano_id": 1,
    "email": "test@test.com",
    "nome": "Teste Silva",
    "cpf": "12345678900"
  }'
```

2. **Verificar Status:**
```bash
curl http://localhost:5000/api/assinatura/status/pagamento/PAYMENT_ID
```

3. **Simular Webhook:**
```bash
curl -X POST http://localhost:5000/api/webhook/mercadopago \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payment",
    "data": {"id": "PAYMENT_ID"}
  }'
```

### Teste com Mercado Pago Sandbox

1. Use credenciais de teste
2. Acesse: https://www.mercadopago.com.br/developers/pt/docs/checkout-api/testing
3. Use CPF de teste: `12345678909`

---

## 📝 Checklist de Implementação

- [x] Endpoint `/api/assinatura/pagar/pix` criado
- [x] Endpoint `/api/assinatura/status/pagamento/<id>` criado
- [x] Webhook `/api/webhook/mercadopago` configurado
- [x] Página `PaymentPix.jsx` criada
- [x] Rota `/pagamento/pix` adicionada
- [x] Suporte a PIX em `processar_pagamento_direto()`
- [x] Timer de expiração implementado
- [x] Verificação automática de status
- [x] QR Code e código copia e cola
- [ ] Credenciais do Mercado Pago configuradas no .env
- [ ] Webhook cadastrado no painel do Mercado Pago
- [ ] Testes realizados

---

## 🎯 Próximos Passos

1. **Configurar Credenciais de Produção**
   - Obter Access Token e Public Key
   - Configurar no .env

2. **Ativar Webhook**
   - Cadastrar URL no painel do Mercado Pago
   - Testar notificações

3. **Integrar no Checkout**
   - Adicionar botão "Pagar com PIX"
   - Coletar dados do cliente
   - Redirecionar para página PIX

4. **Melhorias Futuras**
   - Validação de CPF no frontend
   - Suporte a boleto bancário
   - Integração com cartão de crédito
   - Dashboard de pagamentos

---

## 🆘 Suporte

**Documentação Mercado Pago:**
- PIX: https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-configuration/integrate-with-pix
- Webhooks: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
- API Reference: https://www.mercadopago.com.br/developers/pt/reference

**Contato:**
- Suporte Técnico: dev@vendeai.com
- Documentação: https://docs.vendeai.com

---

**✅ Sistema PIX configurado e pronto para uso!**

Desenvolvido por Helix AI | VendeAI © 2025
