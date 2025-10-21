# 🚀 Integração Mercado Pago - VendeAI

Sistema completo de assinaturas com Mercado Pago implementado no VendeAI.

## 📋 O que foi implementado

### 1. **Estrutura de Banco de Dados** ✅

Criadas 4 novas tabelas:

- **planos**: Planos de assinatura (Básico, Profissional, Empresarial)
- **assinaturas**: Assinaturas dos usuários
- **uso_mensal**: Controle de mensagens e tokens consumidos
- **pagamentos**: Histórico de pagamentos

### 2. **Backend - Service Layer** ✅

**Arquivo**: `services/mercadopago_service.py`

Métodos implementados:
- `criar_preferencia_pagamento()` - Cria checkout no Mercado Pago
- `verificar_limites_usuario()` - Verifica limites e uso atual
- `registrar_uso()` - Incrementa contadores de mensagens/tokens
- `cancelar_assinatura()` - Cancela assinatura ativa
- `processar_webhook_pagamento()` - Processa notificações do MP

### 3. **API Routes** ✅

**Arquivo**: `backend/routes/assinatura.py`

Endpoints criados:
```
GET  /api/assinatura/planos          - Lista planos disponíveis
POST /api/assinatura/assinar         - Cria assinatura
GET  /api/assinatura/status          - Verifica status e limites
POST /api/assinatura/cancelar        - Cancela assinatura
GET  /api/assinatura/historico       - Histórico de pagamentos
GET  /api/assinatura/test            - Testa integração
```

### 4. **Webhook** ✅

**Arquivo**: `backend/routes/webhook.py`

Nova rota:
```
GET/POST /api/webhook/mercadopago    - Recebe notificações do MP
```

Eventos processados:
- `payment` - Pagamento aprovado/rejeitado
- `subscription_preapproval` - Assinatura criada/cancelada
- `subscription_authorized_payment` - Cobrança recorrente

### 5. **Middleware de Validação** ✅

**Arquivo**: `middleware/subscription.py`

Decorators criados:
```python
@subscription_required                    # Exige assinatura ativa
@check_and_register_usage(msg=1, tok=100) # Verifica + registra uso
```

### 6. **Migration Script** ✅

**Arquivo**: `apply_migration.py`

Aplica a migration `004_sistema_assinaturas.sql` no banco.

---

## 🔧 Como Instalar

### 1. Instalar Dependências

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configurar Variáveis de Ambiente

O arquivo `.env` já foi criado com suas credenciais:

```env
MERCADOPAGO_ACCESS_TOKEN=TEST-8516809093490659-101823-...
MERCADOPAGO_PUBLIC_KEY=TEST-c93f534c-1b3e-4f1c-b865-21af78c5e5ef
MERCADOPAGO_WEBHOOK_SECRET=vendeai-webhook-secret-2024
FRONTEND_URL=http://localhost:5174
BACKEND_URL=https://meuapp.loca.lt
```

### 3. Aplicar Migration

```bash
cd backend
python apply_migration.py
```

Você verá:
```
==================================================
APLICANDO MIGRATION: 004_sistema_assinaturas.sql
==================================================

✅ Statement 1/X executado com sucesso
...
✅ MIGRATION APLICADA COM SUCESSO!

📋 Tabelas no banco de dados:
  - planos
  - assinaturas
  - uso_mensal
  - pagamentos
  ...
```

### 4. Iniciar Backend

```bash
python app.py
```

O backend estará rodando em `http://localhost:5000`

---

## 🧪 Testar a Integração

### 1. Verificar se está funcionando

```bash
curl http://localhost:5000/api/assinatura/test
```

Resposta esperada:
```json
{
  "success": true,
  "message": "Integração Mercado Pago funcionando!",
  "public_key": "TEST-c93f534c-1b3e-4f1c-b865-21af78c5e5ef",
  "access_token_configured": true
}
```

### 2. Listar Planos

```bash
curl http://localhost:5000/api/assinatura/planos
```

Resposta esperada:
```json
{
  "success": true,
  "planos": [
    {
      "id": 1,
      "nome": "Básico",
      "preco": 89.90,
      "limite_mensagens": 1000,
      "limite_tokens": 500000
    },
    {
      "id": 2,
      "nome": "Profissional",
      "preco": 299.90,
      "limite_mensagens": 5000,
      "limite_tokens": 2000000
    },
    {
      "id": 3,
      "nome": "Empresarial",
      "preco": 899.90,
      "limite_mensagens": 20000,
      "limite_tokens": 10000000
    }
  ]
}
```

### 3. Criar Assinatura (Teste)

```bash
curl -X POST http://localhost:5000/api/assinatura/assinar \
  -H "Content-Type: application/json" \
  -d '{
    "usuario_id": 1,
    "plano_id": 2
  }'
```

Resposta esperada:
```json
{
  "success": true,
  "init_point": "https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=...",
  "sandbox_init_point": "https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id=...",
  "preference_id": "123456789-abc123",
  "public_key": "TEST-c93f534c-1b3e-4f1c-b865-21af78c5e5ef"
}
```

---

## 📖 Como Usar no Código

### Proteger uma rota com assinatura

```python
from middleware.subscription import subscription_required

@bp.route('/processar-mensagem', methods=['POST'])
@subscription_required
def processar_mensagem():
    # Esta rota só será executada se o usuário tiver assinatura ativa
    # e não tiver excedido os limites
    ...
```

### Verificar e registrar uso automaticamente

```python
from middleware.subscription import check_and_register_usage

@bp.route('/enviar-mensagem', methods=['POST'])
@check_and_register_usage(mensagens=1, tokens=150)
def enviar_mensagem():
    # Verifica limites, executa a função, e registra o uso
    ...
```

### Verificar status manualmente

```python
from services.mercadopago_service import mp_service

# Verificar limites
limites = mp_service.verificar_limites_usuario(usuario_id=1)

if limites['tem_assinatura']:
    print(f"Plano: {limites['plano']}")
    print(f"Uso: {limites['uso']['mensagens']} / {limites['limites']['mensagens']}")
else:
    print("Usuário sem assinatura")
```

### Registrar uso manualmente

```python
from services.mercadopago_service import mp_service

# Registrar 1 mensagem e 200 tokens
mp_service.registrar_uso(
    usuario_id=1,
    mensagens=1,
    tokens=200
)
```

---

## 🌐 Configurar Webhook no Mercado Pago

1. Acesse: https://www.mercadopago.com.br/developers/panel/notifications/webhooks
2. Clique em "Criar webhook"
3. Configure:
   - **Nome**: VendeAI Webhook
   - **URL**: `https://meuapp.loca.lt/api/webhook/mercadopago`
   - **Eventos**: Selecione todos relacionados a pagamentos

4. Teste o webhook:
```bash
curl https://meuapp.loca.lt/api/webhook/mercadopago
```

Resposta esperada:
```json
{
  "status": "online",
  "service": "MercadoPago Webhook VendeAI",
  "timestamp": "2025-01-..."
}
```

---

## 📊 Planos Configurados

| Plano | Preço | Mensagens/mês | Tokens/mês | Recursos |
|-------|-------|---------------|------------|----------|
| **Básico** | R$ 89,90 | 1.000 | 500.000 | 1 bot, suporte email |
| **Profissional** | R$ 299,90 | 5.000 | 2.000.000 | 3 bots, analytics, suporte prioritário |
| **Empresarial** | R$ 899,90 | 20.000 | 10.000.000 | Bots ilimitados, white label, suporte dedicado |

---

## 🔄 Fluxo de Pagamento

1. **Usuário escolhe plano** → Frontend chama `/api/assinatura/assinar`
2. **Backend cria preferência** → Mercado Pago retorna `init_point`
3. **Usuário paga** → Mercado Pago redireciona para success/pending/failure
4. **Webhook notifica** → `/api/webhook/mercadopago` processa pagamento
5. **Assinatura ativada** → Status muda para 'active', data_inicio/fim definidas
6. **Sistema libera acesso** → Middleware `@subscription_required` permite uso

---

## 🚨 Tratamento de Erros

### Sem assinatura
```json
{
  "success": false,
  "error": "Assinatura necessária",
  "code": "SUBSCRIPTION_REQUIRED",
  "action": "subscribe"
}
```
**HTTP Status**: 402 Payment Required

### Limite excedido
```json
{
  "success": false,
  "error": "Limite excedido",
  "code": "LIMIT_EXCEEDED",
  "limites": { "mensagens": 1000, "tokens": 500000 },
  "uso": { "mensagens": 1050, "tokens": 120000 },
  "action": "upgrade"
}
```
**HTTP Status**: 402 Payment Required

---

## 📝 Próximos Passos

### Frontend (Pendente)
- [ ] Criar popup de pagamento na Landing Page
- [ ] Criar página de processamento (sucesso/pendente/falha)
- [ ] Integrar Mercado Pago SDK JS no frontend
- [ ] Mostrar limites de uso no painel do cliente

### Backend (Opcional)
- [ ] Implementar renovação automática (subscription_preapproval)
- [ ] Enviar email de boas-vindas após assinatura
- [ ] Enviar alerta quando atingir 80% dos limites
- [ ] Dashboard admin para gerenciar assinaturas

---

## 🎯 Arquivos Criados/Modificados

```
backend/
├── .env                                    ✅ CRIADO
├── requirements.txt                        ✅ CRIADO
├── apply_migration.py                      ✅ CRIADO
├── database/
│   └── migrations/
│       └── 004_sistema_assinaturas.sql     ✅ CRIADO
├── services/
│   └── mercadopago_service.py              ✅ CRIADO
├── middleware/
│   └── subscription.py                     ✅ CRIADO
├── backend/
│   ├── __init__.py                         ✅ MODIFICADO
│   └── routes/
│       ├── assinatura.py                   ✅ CRIADO
│       └── webhook.py                      ✅ MODIFICADO
```

---

## ✅ Checklist de Validação

- [x] Dependências instaladas (`pip install -r requirements.txt`)
- [x] Migration aplicada (`python apply_migration.py`)
- [x] Variáveis de ambiente configuradas (`.env`)
- [x] Backend iniciando sem erros
- [x] Endpoint `/api/assinatura/test` retorna success
- [x] Endpoint `/api/assinatura/planos` lista 3 planos
- [ ] Webhook configurado no painel do Mercado Pago
- [ ] Teste de pagamento completo (criar → pagar → webhook → ativar)

---

**Sistema de Assinaturas VendeAI - Pronto para uso! 🚀**
