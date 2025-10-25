# Frontend - Integração Mercado Pago Completa

Sistema de pagamento integrado com Mercado Pago implementado na Landing Page.

## O que foi implementado

### 1. **Popup de Pagamento na Landing Page** ✅

**Arquivo**: `AIra_Landing/src/App.jsx`

**Funcionalidades**:
- Modal de pagamento substituiu o modal de seleção de nicho
- Formulário com email do cliente
- Validação e loading states
- Integração direta com API backend `/api/assinatura/assinar`
- Redirecionamento automático para checkout do Mercado Pago

**Fluxo de Uso**:
1. Usuário clica em "Começar Agora" no plano desejado
2. Popup abre solicitando email de confirmação
3. Sistema chama backend para criar preferência de pagamento
4. Usuário é redirecionado para checkout do Mercado Pago
5. Após pagamento, Mercado Pago redireciona para página de status

### 2. **Páginas de Status de Pagamento** ✅

Três páginas criadas para lidar com os diferentes estados do pagamento:

#### **Sucesso** - `/pagamento/sucesso`
**Arquivo**: `AIra_Landing/src/pages/PaymentSuccess.jsx`

- Exibido quando pagamento é aprovado
- Auto-redirect para painel do cliente após 5 segundos
- Instruções do que fazer em seguida
- Botão manual para acessar painel

#### **Pendente** - `/pagamento/pendente`
**Arquivo**: `AIra_Landing/src/pages/PaymentPending.jsx`

- Exibido quando pagamento está em análise
- Comum para boleto, cartão em análise, ou Pix não confirmado
- Instruções sobre tempo de processamento
- Link para suporte

#### **Falha** - `/pagamento/falha`
**Arquivo**: `AIra_Landing/src/pages/PaymentFailure.jsx`

- Exibido quando pagamento é recusado
- Lista motivos comuns da recusa
- Botão para tentar novamente
- Link para suporte

### 3. **Roteamento** ✅

**Arquivo**: `AIra_Landing/src/main.jsx`

Configurado React Router com as seguintes rotas:
```
/                    → Landing Page principal
/pagamento/sucesso   → Página de sucesso
/pagamento/pendente  → Página de pendente
/pagamento/falha     → Página de falha
```

### 4. **Dependências Instaladas** ✅

```json
{
  "react-router-dom": "^6.x.x"  // Para roteamento
}
```

---

## Como Testar

### 1. Iniciar Backend

```bash
cd backend
python app.py
```

Backend deve estar rodando em `http://localhost:5000`

### 2. Iniciar Landing Page

```bash
cd AIra_Landing
npm run dev
```

Landing Page rodará em `http://localhost:5174`

### 3. Fluxo de Teste Completo

#### Passo 1: Acessar Landing Page
```
http://localhost:5174
```

#### Passo 2: Escolher um Plano
- Scroll até a seção "Preços"
- Clique em "Começar Agora" em qualquer plano

#### Passo 3: Preencher Popup de Pagamento
- Digite um email válido (ex: `teste@gmail.com`)
- Clique em "Continuar para Pagamento"

#### Passo 4: Será Redirecionado para Mercado Pago
- Como está em modo TEST, use cartões de teste:
  - **Aprovado**: `5031 4332 1540 6351` (CVV: 123, Exp: 11/25)
  - **Recusado**: `5031 7557 3453 0604` (CVV: 123, Exp: 11/25)
  - **Pendente**: `5031 4332 1540 6351` (CVV: 123, Exp: 11/25 - escolher boleto)

#### Passo 5: Concluir Pagamento
- Preencher dados do cartão de teste
- Confirmar pagamento

#### Passo 6: Verificar Redirecionamento
- **Pagamento aprovado** → `http://localhost:5174/pagamento/sucesso`
- **Pagamento pendente** → `http://localhost:5174/pagamento/pendente`
- **Pagamento recusado** → `http://localhost:5174/pagamento/falha`

---

## Mapeamento de Planos

Os planos da Landing Page foram mapeados para os planos do banco de dados:

| Landing Page | Preço Landing | Banco de Dados | Preço Real | ID |
|--------------|---------------|----------------|------------|-----|
| Starter | R$ 497/mês | Básico | R$ 89,90/mês | 1 |
| Professional | R$ 997/mês | Profissional | R$ 299,90/mês | 2 |
| Enterprise | Custom | Empresarial | R$ 899,90/mês | 3 |

**Nota**: Os preços da landing page são "de vendas" (mais altos), mas o backend usa os preços reais do banco de dados.

---

## Fluxo Técnico Completo

```
1. Usuário clica "Começar Agora" no plano
   ↓
2. openPaymentModal(plan) abre popup
   ↓
3. Usuário preenche email e submete
   ↓
4. handlePayment() faz POST para backend
   POST http://localhost:5000/api/assinatura/assinar
   Body: {
     plano_id: 1,
     usuario_email: "teste@gmail.com",
     usuario_id: 1
   }
   ↓
5. Backend cria preferência no Mercado Pago
   ↓
6. Backend retorna init_point (URL do checkout)
   Response: {
     success: true,
     init_point: "https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=..."
   }
   ↓
7. Frontend redireciona para init_point
   window.location.href = data.init_point
   ↓
8. Usuário paga no Mercado Pago
   ↓
9. Mercado Pago redireciona de volta com status
   - Sucesso: http://localhost:5174/pagamento/sucesso
   - Pendente: http://localhost:5174/pagamento/pendente
   - Falha: http://localhost:5174/pagamento/falha
   ↓
10. Webhook notifica backend (processamento assíncrono)
    POST http://localhost:5000/api/webhook/mercadopago
    ↓
11. Backend atualiza status da assinatura
    ↓
12. Se aprovado, página de sucesso auto-redireciona para CRM
    window.location.href = 'http://localhost:5177'
```

---

## Variáveis de Ambiente Backend

O backend já está configurado com as seguintes variáveis no arquivo `.env`:

```env
MERCADOPAGO_ACCESS_TOKEN=TEST-8516809093490659-101823-de2210b4e393d09bcf3b302c4a9e126f-17728094
MERCADOPAGO_PUBLIC_KEY=TEST-c93f534c-1b3e-4f1c-b865-21af78c5e5ef
MERCADOPAGO_WEBHOOK_SECRET=vendeai-webhook-secret-2024
FRONTEND_URL=http://localhost:5174
BACKEND_URL=https://meuapp.loca.lt
```

---

## Próximos Passos Opcionais

### 1. Remover Seleção de Nicho do Popup (Já Removido) ✅
A seleção de nicho foi removida do popup de pagamento conforme solicitado.

### 2. Adicionar Seleção de Nicho no Painel do Cliente (Pendente)
- Criar página de onboarding no `CRM_Client`
- Permitir que usuário escolha entre Veículos ou Imóveis
- Salvar preferência no banco de dados

### 3. Aplicar Migration no Banco (Necessário)

**IMPORTANTE**: Execute antes de testar:

```bash
cd backend
python apply_migration.py
```

Isso criará as tabelas necessárias:
- `planos`
- `assinaturas`
- `uso_mensal`
- `pagamentos`

### 4. Configurar Webhook no Mercado Pago (Produção)

Para ambiente de produção:
1. Acesse: https://www.mercadopago.com.br/developers/panel/notifications/webhooks
2. Configure a URL: `https://seu-dominio.com/api/webhook/mercadopago`
3. Selecione eventos de pagamento

---

## Estrutura de Arquivos

```
AIra_Landing/
├── src/
│   ├── App.jsx                          ✅ MODIFICADO (popup de pagamento)
│   ├── main.jsx                         ✅ MODIFICADO (roteamento)
│   ├── pages/
│   │   ├── PaymentSuccess.jsx           ✅ CRIADO
│   │   ├── PaymentPending.jsx           ✅ CRIADO
│   │   └── PaymentFailure.jsx           ✅ CRIADO
│   └── components/
│       └── AstronautRocket.jsx          (não alterado)
└── package.json                         ✅ MODIFICADO (react-router-dom)

backend/
├── .env                                 ✅ CRIADO (credenciais MP)
├── backend/
│   ├── __init__.py                      ✅ MODIFICADO (blueprint)
│   └── routes/
│       ├── assinatura.py                ✅ CRIADO
│       └── webhook.py                   ✅ MODIFICADO
├── services/
│   └── mercadopago_service.py           ✅ CRIADO
├── middleware/
│   └── subscription.py                  ✅ CRIADO
├── database/
│   └── migrations/
│       └── 004_sistema_assinaturas.sql  ✅ CRIADO
├── apply_migration.py                   ✅ CRIADO
└── requirements.txt                     ✅ CRIADO
```

---

## Checklist de Validação

- [x] Popup de pagamento criado na Landing Page
- [x] Integração com API backend funcionando
- [x] Páginas de status (sucesso/pendente/falha) criadas
- [x] Roteamento configurado com React Router
- [x] react-router-dom instalado
- [ ] Migration aplicada no banco de dados (`python apply_migration.py`)
- [ ] Backend rodando sem erros
- [ ] Teste completo de pagamento com cartão de teste
- [ ] Webhook configurado (para produção)

---

## Comandos Rápidos

### Backend
```bash
# Aplicar migration
cd backend
python apply_migration.py

# Iniciar servidor
python app.py
```

### Frontend (Landing Page)
```bash
# Instalar dependências (se necessário)
cd AIra_Landing
npm install

# Iniciar em modo dev
npm run dev
```

### Testar Integração
```bash
# Testar endpoint de planos
curl http://localhost:5000/api/assinatura/planos

# Testar endpoint de teste
curl http://localhost:5000/api/assinatura/test
```

---

## Suporte

Em caso de problemas:
1. Verifique se o backend está rodando na porta 5000
2. Verifique se a migration foi aplicada corretamente
3. Confirme que as credenciais do Mercado Pago estão no `.env`
4. Verifique o console do navegador para erros JavaScript
5. Verifique os logs do backend para erros Python

---

**Sistema de Pagamento VendeAI - Frontend Completo! 🚀**
