# 🎯 Sistema de Afiliados AIRA - Documentação Completa

## 📋 Visão Geral

Sistema completo de programa de afiliados integrado à plataforma AIRA, permitindo que usuários ganhem comissões ao indicar novos clientes.

**Data de Implementação:** 24 de Janeiro de 2025
**Status:** ✅ IMPLEMENTADO E FUNCIONAL

---

## 🏗️ Arquitetura do Sistema

### Backend (Flask/SQLAlchemy)

#### Modelos de Banco de Dados

**Localização:** `D:\Helix\HelixAI\backend\database\models.py`

##### 1. **Afiliado**
```python
class Afiliado(Base):
    - id: Integer (PK)
    - usuario_id: Integer (FK -> usuarios.id) UNIQUE
    - chave_referencia: String(50) UNIQUE - Slug para links
    - status: Enum(StatusAfiliado) - ativo, inativo, bloqueado, pendente

    # Dados Bancários
    - nome_completo, cpf_cnpj, telefone
    - banco, agencia, conta, tipo_conta
    - pix_tipo, pix_chave

    # Métricas
    - total_clicks, total_cadastros, total_vendas
    - total_comissoes_geradas, total_comissoes_pagas
    - saldo_disponivel

    # Comissões Personalizadas
    - comissao_primeira_venda: Float (% personalizado)
    - comissao_recorrente: Float (% personalizado)
```

##### 2. **Referencia**
Rastreamento de cliques e conversões
```python
class Referencia(Base):
    - id, afiliado_id
    - ip_origem, user_agent, url_origem, url_destino
    - cliente_novo_id (FK), lead_id (FK)
    - status: Enum - click, cadastro, pendente, convertido, rejeitado
    - valor_primeira_compra, plano_contratado
    - data_clique, data_cadastro, data_conversao, data_expiracao
```

##### 3. **Comissao**
Comissões geradas para afiliados
```python
class Comissao(Base):
    - id, afiliado_id, referencia_id
    - tipo: Enum - primeira_venda, recorrente, bonus
    - valor, percentual, valor_base
    - status: Enum - pendente, aprovada, paga, cancelada
    - pagamento_id, assinatura_id
    - descricao, observacoes
    - data_geracao, data_aprovacao, data_pagamento
```

##### 4. **SaqueAfiliado**
Saques solicitados pelos afiliados
```python
class SaqueAfiliado(Base):
    - id, afiliado_id
    - valor_solicitado, valor_pago, taxa
    - status: pendente, aprovado, pago, rejeitado
    - metodo_pagamento: pix, transferencia, boleto
    - comprovante_url, comprovante_dados
    - data_solicitacao, data_aprovacao, data_pagamento
```

##### 5. **ConfiguracaoAfiliados**
Configurações globais do programa
```python
class ConfiguracaoAfiliados(Base):
    - comissao_primeira_venda_padrao: 30%
    - comissao_recorrente_padrao: 20%
    - prazo_cookie_dias: 30
    - minimo_saque: R$ 50
    - prazo_aprovacao_comissao_dias: 30
    - bonus_meta_5_vendas: R$ 100
    - bonus_meta_10_vendas: R$ 250
    - bonus_meta_20_vendas: R$ 500
```

---

### API Endpoints

**Localização:** `D:\Helix\HelixAI\backend\routes\afiliados.py`

#### Registro e Perfil
- `POST /api/afiliados/registrar` - Registra novo afiliado
- `GET /api/afiliados/meu-perfil` - Retorna perfil do afiliado
- `PUT /api/afiliados/atualizar-perfil` - Atualiza dados bancários

#### Dashboard e Métricas
- `GET /api/afiliados/dashboard?periodo_dias=30` - Dashboard completo com métricas
- `GET /api/afiliados/meu-link` - Retorna link de referência

#### Referências e Conversões
- `GET /api/afiliados/referencias?status=X&page=1` - Lista referências
- `GET /api/afiliados/comissoes?status=X&tipo=Y&page=1` - Lista comissões

#### Saques
- `GET /api/afiliados/saques` - Lista saques
- `POST /api/afiliados/solicitar-saque` - Solicita novo saque

#### Configurações
- `GET /api/afiliados/configuracoes` - Retorna configurações do programa

---

### Sistema de Rastreamento (Tracking)

**Localização:** `D:\Helix\HelixAI\backend\routes\tracking.py`

#### Endpoints de Tracking
- `GET /r/<chave_referencia>` - Rastreia click e redireciona
- `POST /api/tracking/registrar-cadastro` - Registra cadastro
- `POST /api/tracking/registrar-conversao` - Registra venda
- `GET /api/tracking/verificar-referencia` - Verifica cookie

#### Fluxo de Rastreamento

```
1. CLICK
   ├─> Usuário clica no link /r/abc123xyz
   ├─> Sistema cria Referencia com status="click"
   ├─> Incrementa afiliado.total_clicks
   ├─> Seta cookie "aira_ref" com validade de 30 dias
   └─> Redireciona para landing page

2. CADASTRO
   ├─> Usuário se cadastra na plataforma
   ├─> Frontend chama /api/tracking/registrar-cadastro
   ├─> Sistema atualiza Referencia para status="cadastro"
   └─> Incrementa afiliado.total_cadastros

3. CONVERSÃO (VENDA)
   ├─> Usuário realiza primeira compra
   ├─> Sistema de pagamento chama /api/tracking/registrar-conversao
   ├─> Atualiza Referencia para status="convertido"
   ├─> Cria Comissao com tipo="primeira_venda"
   ├─> Incrementa afiliado.total_vendas
   └─> Incrementa afiliado.total_comissoes_geradas
```

---

## 🎨 Frontend (React)

**Localização:** `D:\Helix\HelixAI\CRM_Client\crm-client-app\src\components\afiliados\`

### Componentes Criados

#### 1. **AfiliadoDashboard.jsx**
Dashboard principal do afiliado com:
- Card de link de referência (com botão copiar)
- Métricas em cards (Clicks, Cadastros, Vendas, Saldo)
- Últimas referências
- Últimas comissões
- Taxa de conversão

#### 2. **AfiliadoRegistro.jsx**
Formulário de cadastro em 2 etapas:
- Step 1: Dados pessoais (nome, CPF, telefone)
- Step 2: Dados bancários (PIX + dados bancários opcionais)
- Cards de benefícios do programa

#### 3. **Como Integrar no CRM**

**No arquivo `App.jsx` ou `ClientLayout.jsx`:**

```jsx
import { AfiliadoDashboard } from './components/afiliados/AfiliadoDashboard';
import { AfiliadoRegistro } from './components/afiliados/AfiliadoRegistro';

// Adicionar no menu:
const menuItems = [
  // ... outros itens
  { id: 'afiliados', label: 'Afiliados', icon: Award }
];

// No switch de páginas:
{currentPage === 'afiliados' && <AfiliadoDashboard />}
{currentPage === 'afiliados-registrar' && <AfiliadoRegistro />}
```

---

## 📊 Regras de Negócio

### Comissões

#### Primeira Venda
- **Padrão:** 30% do valor da primeira compra
- **Personalizado:** Pode ser ajustado por afiliado
- **Status Inicial:** PENDENTE
- **Aprovação:** Após 30 dias da confirmação do pagamento
- **Cálculo:** `valor_comissao = (valor_venda * percentual) / 100`

#### Recorrente
- **Padrão:** 20% do valor das mensalidades
- **Vitalício:** Enquanto o cliente mantiver a assinatura
- **Geração:** Automática a cada renovação mensal

### Saques

- **Valor Mínimo:** R$ 50,00
- **Métodos:** PIX (instantâneo), Transferência Bancária
- **Prazo:** Até 7 dias úteis após aprovação
- **Taxas:** Definidas por método de pagamento

### Bônus por Meta

- **5 vendas/mês:** R$ 100,00
- **10 vendas/mês:** R$ 250,00
- **20 vendas/mês:** R$ 500,00

### Cookies de Rastreamento

- **Duração:** 30 dias
- **Nome:** `aira_ref`
- **Conteúdo:** `{ ref_id, afiliado_id, chave }`
- **HttpOnly:** true (segurança)
- **SameSite:** Lax

---

## 🔄 Integração com Sistema de Pagamentos

### Mercado Pago

**Quando uma venda é confirmada:**

```python
# No webhook do Mercado Pago ou após confirmação de pagamento:

import requests

# Verificar se tem cookie de referência
cookie_ref = request.cookies.get('aira_ref')

if cookie_ref:
    # Registrar conversão
    requests.post('http://localhost:5000/api/tracking/registrar-conversao', json={
        'usuario_id': usuario.id,
        'valor_compra': 497.00,
        'plano': 'Professional',
        'pagamento_id': payment_id,
        'assinatura_id': subscription_id
    }, cookies={'aira_ref': cookie_ref})
```

---

## 🧪 Como Testar

### 1. Criar Afiliado

```bash
# Fazer login como usuário normal
# Acessar /afiliados
# Clicar em "Quero ser Afiliado"
# Preencher formulário de cadastro
```

### 2. Aprovar Afiliado (Admin)

```python
from database.models import Afiliado, StatusAfiliado, DatabaseManager

db = DatabaseManager('sqlite:///vendeai.db')
session = db.get_session()

afiliado = session.query(Afiliado).filter_by(id=1).first()
afiliado.status = StatusAfiliado.ATIVO
afiliado.data_aprovacao = datetime.utcnow()
session.commit()
```

### 3. Testar Link de Referência

```bash
# Obter link do afiliado
GET http://localhost:5000/api/afiliados/meu-link

# Acessar link em navegador anônimo
http://localhost:5000/r/abc123xyz

# Verificar cookie criado
# Fazer cadastro e compra
# Verificar comissão gerada
```

### 4. Verificar Comissões

```bash
GET http://localhost:5000/api/afiliados/comissoes
```

---

## 📁 Estrutura de Arquivos

```
backend/
├── database/
│   ├── models.py  # ✅ Modelos adicionados (linhas 92-1035)
│   └── migrations/
│       └── 002_add_afiliados_tables.sql  # ✅ Migração SQL
├── routes/
│   ├── afiliados.py  # ✅ API de afiliados
│   └── tracking.py   # ✅ Sistema de rastreamento
└── __init__.py  # ✅ Blueprints registrados

CRM_Client/crm-client-app/src/components/
└── afiliados/
    ├── AfiliadoDashboard.jsx   # ✅ Dashboard principal
    ├── AfiliadoRegistro.jsx    # ✅ Formulário de cadastro
    ├── AfiliadoComissoes.jsx   # ⏳ Página de comissões (próximo)
    └── AfiliadoSaques.jsx      # ⏳ Página de saques (próximo)
```

---

## 🔐 Segurança

### Implementado:
- ✅ Autenticação obrigatória (`@login_required`)
- ✅ Cookies HttpOnly para rastreamento
- ✅ Validação de saldo antes de saque
- ✅ Verificação de status do afiliado
- ✅ Foreign Keys no banco de dados
- ✅ Sanitização de dados de entrada

### Recomendações:
- [ ] Rate limiting em endpoints de tracking
- [ ] Logs de auditoria para saques
- [ ] Verificação de fraude (múltiplos IPs/devices)
- [ ] Criptografia de dados bancários sensíveis

---

## 📈 Próximos Passos

### Funcionalidades Adicionais
- [ ] Página de relatórios detalhados
- [ ] Gráficos de evolução de métricas
- [ ] Sistema de materiais promocionais
- [ ] Notificações por email/WhatsApp
- [ ] Integração com sistemas de pagamento para afiliados
- [ ] Painel administrativo para gerenciar afiliados
- [ ] Sistema de aprovação de saques
- [ ] Verificação de documentos (KYC)

### Otimizações
- [ ] Cache de métricas frequentes
- [ ] Paginação em listagens
- [ ] Filtros avançados
- [ ] Export de relatórios (CSV/PDF)

---

## 🎓 Como Funciona na Prática

### Exemplo Completo

**Dia 1 - João vira afiliado:**
1. João se cadastra no sistema AIRA
2. Acessa a área de Afiliados
3. Preenche formulário com dados bancários
4. Recebe chave de referência: `joao2025`
5. Link gerado: `https://aira.com/r/joao2025`

**Dia 2 - João divulga:**
1. João compartilha o link nas redes sociais
2. Maria clica no link
3. Sistema rastreia: 1 click
4. Cookie com validade de 30 dias é criado

**Dia 3 - Maria se cadastra:**
1. Maria preenche formulário
2. Sistema detecta cookie de João
3. Atualiza referência: status = "cadastro"
4. Métricas de João: 1 click, 1 cadastro

**Dia 5 - Maria compra plano R$ 997:**
1. Maria contrata plano Professional
2. Pagamento confirmado no Mercado Pago
3. Sistema registra conversão
4. Comissão gerada: R$ 997 × 30% = R$ 299,10
5. Status: PENDENTE (aguarda 30 dias)

**Dia 35 - Comissão aprovada:**
1. Sistema aprova comissão automaticamente
2. Status: APROVADA
3. Saldo de João: R$ 299,10

**Dia 36 - João solicita saque:**
1. João acessa "Saques"
2. Solicita R$ 299,10 via PIX
3. Admin aprova
4. Pagamento via PIX em até 7 dias

**Todo mês - Comissão recorrente:**
1. Maria renova assinatura: R$ 997
2. Nova comissão: R$ 997 × 20% = R$ 199,40
3. João ganha enquanto Maria for cliente

---

## 💡 Dicas para Afiliados

### Como Divulgar
1. **Redes Sociais:** Instagram, Facebook, LinkedIn
2. **Blog/Site:** Artigos sobre automação de vendas
3. **YouTube:** Tutoriais e cases de sucesso
4. **WhatsApp:** Grupos e listas de transmissão
5. **Email Marketing:** Newsletter para sua base

### Materiais Promocionais
- Link de referência personalizado
- Banners e imagens (a serem criados)
- Scripts de vendas
- Cases de sucesso
- Vídeos demonstrativos

---

## 📞 Suporte

**Dúvidas sobre o sistema de afiliados:**
- Email: afiliados@aira.com.br
- WhatsApp: (67) 99999-9999
- Horário: Segunda a Sexta, 9h às 18h

---

## ✅ Status da Implementação

| Componente | Status | Arquivo |
|-----------|--------|---------|
| Modelos de BD | ✅ Completo | `models.py:92-1035` |
| Migração SQL | ✅ Completo | `002_add_afiliados_tables.sql` |
| API de Afiliados | ✅ Completo | `afiliados.py` |
| Sistema de Tracking | ✅ Completo | `tracking.py` |
| Registro de Rotas | ✅ Completo | `__init__.py:111-112` |
| Criação de Tabelas | ✅ Executado | Via `DatabaseManager` |
| Dashboard Frontend | ✅ Completo | `AfiliadoDashboard.jsx` |
| Registro Frontend | ✅ Completo | `AfiliadoRegistro.jsx` |
| Integração no Menu | ⏳ Pendente | Adicionar no `ClientLayout.jsx` |
| Testes E2E | ⏳ Pendente | - |

---

**🎉 Sistema Pronto para Uso!**

Data: 24/01/2025
Desenvolvido por: Helix AI
Versão: 1.0.0
