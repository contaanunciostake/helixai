# 🛡️ CRM Admin - Painel Administrativo Completo

## 📊 Visão Geral

O **CRM Admin** é o painel de controle central do sistema AIRA, permitindo aos administradores gerenciar todas as empresas, usuários, bots, pagamentos e configurações da plataforma.

---

## 🎨 Identidade Visual

### Cores Principais
- **Primária**: Roxo/Purple (`#9333EA` - `purple-600`)
- **Secundária**: Indigo (`#4F46E5` - `indigo-600`)
- **Acento**: Violeta (`#7C3AED` - `violet-600`)

### Diferenciação do CRM Cliente
- **CRM Cliente**: Verde/Esmeralda (tema vibrante)
- **CRM Admin**: Roxo/Indigo (tema autoridade e controle)

---

## 🏗️ Estrutura de Componentes

```
CRM_Admin/crm-admin-app/
├── src/
│   ├── components/
│   │   └── layout/
│   │       └── AdminLayout.jsx          # Layout base com sidebar roxo
│   ├── pages/
│   │   ├── Dashboard/
│   │   │   └── AdminDashboard.jsx       # Dashboard principal
│   │   ├── Empresas/
│   │   │   ├── EmpresasList.jsx         # Lista de empresas
│   │   │   ├── EmpresaDetalhes.jsx      # Detalhes da empresa
│   │   │   └── EmpresaCriar.jsx         # Criar nova empresa
│   │   ├── Usuarios/
│   │   │   ├── UsuariosList.jsx         # Lista de usuários
│   │   │   └── UsuarioDetalhes.jsx      # Detalhes do usuário
│   │   ├── Assinaturas/
│   │   │   ├── AssinaturasList.jsx      # Lista de assinaturas
│   │   │   └── PagamentoDetalhes.jsx    # Detalhes de pagamento
│   │   ├── Afiliados/
│   │   │   ├── AfiliadosList.jsx        # Lista de afiliados
│   │   │   ├── AfiliadoDetalhes.jsx     # Detalhes do afiliado
│   │   │   └── ComissoesGestao.jsx      # Gestão de comissões
│   │   ├── Bots/
│   │   │   ├── BotsList.jsx             # Lista de bots ativos
│   │   │   └── BotMonitor.jsx           # Monitor de status
│   │   ├── Logs/
│   │   │   └── LogsViewer.jsx           # Visualizador de logs
│   │   ├── Database/
│   │   │   ├── DatabaseManager.jsx      # Gestão de banco
│   │   │   └── Backups.jsx              # Backups
│   │   └── Configuracoes/
│   │       └── ConfiguracoesGlobais.jsx # Configurações do sistema
│   ├── App.jsx
│   └── main.jsx
```

---

## 🚀 Funcionalidades Implementadas

### 1. Dashboard Principal ✅

**Componente:** `AdminDashboard.jsx`

**Métricas Exibidas:**
- 📈 **MRR** (Monthly Recurring Revenue)
  - Valor: R$ 142.450/mês
  - Crescimento: +12.5%
  - Gráfico de tendência

- 🏢 **Total de Empresas**
  - Ativas: 215 (87%)
  - Trial: 18 (7%)
  - Vencidas: 14 (6%)

- 👥 **Total de Usuários**
  - Ativos: 1.342
  - Crescimento: +23 este mês

- 💬 **Bots WhatsApp**
  - Ativos: 215 (87% de uptime)
  - Conversas hoje: 4.521
  - Mensagens/mês: 28.9k

**Cards de Detalhes:**
- Taxa de conversão global: 12.3%
- Custo médio por mensagem: R$ 0,08
- Distribuição por plano (Enterprise/Pro/Basic)

**Últimas Atividades:**
- Nova empresa cadastrada
- Pagamento recebido
- Bot ativado
- Churn detectado
- Upgrade de plano

**Alertas Críticos:**
- 14 empresas com pagamento vencido
- 8 trials terminando em 3 dias
- 3 bots com erro de conexão

---

### 2. Layout Base ✅

**Componente:** `AdminLayout.jsx`

**Features:**
- ✅ Sidebar responsiva e colapsável
- ✅ Menu organizado por seções:
  - Visão Geral (Dashboard, Analytics, Atividade)
  - Gestão (Empresas, Usuários, Afiliados)
  - Financeiro (Assinaturas, Pagamentos, Comissões)
  - Sistema (Bots, Logs, Database, Configurações)

- ✅ Header com:
  - Título da página atual
  - Status do sistema (online/offline)
  - Notificações
  - Avatar do admin

- ✅ Perfil do usuário admin com logout
- ✅ Animações suaves (twinkle stars, gradients)
- ✅ Background com grid pattern roxo

---

## 📱 Páginas a Implementar

### 3. Gestão de Empresas (TODO)

**Arquivo:** `src/pages/Empresas/EmpresasList.jsx`

```jsx
// Features:
- Lista paginada de todas as empresas
- Filtros:
  - Status (ativa, trial, vencida, cancelada)
  - Plano (free, basic, pro, enterprise)
  - Nicho (veículos, imóveis, varejo)
  - Data de cadastro
  - Busca por nome/CNPJ

- Ações por empresa:
  - Ver detalhes
  - Editar configurações
  - Suspender/Ativar
  - Acessar como cliente (impersonate)
  - Ver logs
  - Excluir

- Métricas por empresa:
  - MRR individual
  - Tempo de vida (LTV)
  - Status do bot
  - Última atividade
  - Total de usuários
  - Total de conversas
```

**Integração Backend:**
```javascript
GET /api/admin/empresas
GET /api/admin/empresas/:id
PUT /api/admin/empresas/:id
DELETE /api/admin/empresas/:id
POST /api/admin/empresas/:id/impersonate
```

---

### 4. Gestão de Usuários (TODO)

**Arquivo:** `src/pages/Usuarios/UsuariosList.jsx`

```jsx
// Features:
- Lista de todos os usuários do sistema
- Filtros:
  - Empresa
  - Tipo (super_admin, admin_empresa, usuario)
  - Status (ativo, inativo)
  - Último acesso

- Ações:
  - Ver perfil completo
  - Editar permissões
  - Resetar senha
  - Bloquear/Desbloquear
  - Ver histórico de ações

- Estatísticas:
  - Usuários por empresa
  - Média de logins/dia
  - Usuários mais ativos
```

---

### 5. Assinaturas e Pagamentos (TODO)

**Arquivo:** `src/pages/Assinaturas/AssinaturasList.jsx`

```jsx
// Features Assinaturas:
- Lista de todas as assinaturas
- Status (ativa, cancelada, vencida)
- Próxima cobrança
- Histórico de cobranças
- Ações:
  - Cancelar assinatura
  - Alterar plano
  - Aplicar desconto
  - Estender trial

// Features Pagamentos:
- Histórico completo de pagamentos
- Filtros por:
  - Status (pago, pendente, falhado, estornado)
  - Período
  - Plano
  - Empresa

- Métricas financeiras:
  - ARR (Annual Recurring Revenue)
  - MRR
  - Churn rate
  - LTV médio
  - CAC (Customer Acquisition Cost)

- Exportar relatórios (CSV, PDF)
```

---

### 6. Gestão de Afiliados (TODO)

**Arquivo:** `src/pages/Afiliados/AfiliadosList.jsx`

```jsx
// Features:
- Lista de todos os afiliados
- Status (ativo, pendente, bloqueado)
- Métricas por afiliado:
  - Total de referências
  - Taxa de conversão
  - Comissões geradas
  - Comissões pagas
  - Saldo disponível

- Ações:
  - Aprovar/Rejeitar cadastro
  - Bloquear afiliado
  - Ajustar comissões customizadas
  - Aprovar saques
  - Processar pagamento manual

- Gestão de Comissões:
  - Comissões pendentes de aprovação
  - Comissões aprovadas (não pagas)
  - Histórico de pagamentos
  - Estornar comissão
  - Adicionar bônus manual

- Gestão de Saques:
  - Saques pendentes
  - Aprovar em lote
  - Rejeitar com motivo
  - Marcar como pago
  - Anexar comprovante
```

---

### 7. Monitor de Bots (TODO)

**Arquivo:** `src/pages/Bots/BotsList.jsx`

```jsx
// Features:
- Lista de todos os bots WhatsApp
- Status em tempo real:
  - Conectado/Desconectado
  - Ativo/Pausado
  - Última mensagem
  - Uptime

- Métricas por bot:
  - Conversas hoje
  - Mensagens enviadas/recebidas
  - Taxa de resposta
  - Tempo médio de resposta
  - Custo de IA usado

- Ações:
  - Forçar reconexão
  - Pausar/Reativar bot
  - Ver logs de erros
  - Limpar sessão
  - Reiniciar processo

- Monitor de Saúde:
  - CPU/Memória do servidor
  - Fila de mensagens
  - Latência média
  - Taxa de erro
```

---

### 8. Visualizador de Logs (TODO)

**Arquivo:** `src/pages/Logs/LogsViewer.jsx`

```jsx
// Features:
- Logs do sistema em tempo real
- Filtros:
  - Nível (info, warning, error, critical)
  - Módulo (auth, bot, payment, webhook)
  - Empresa
  - Usuário
  - Período

- Busca por:
  - Texto livre
  - Erro específico
  - IP de origem

- Ações:
  - Exportar logs
  - Limpar logs antigos
  - Definir alertas

- Logs de Auditoria:
  - Quem fez o que e quando
  - Mudanças em configurações
  - Acessos administrativos
  - Operações críticas
```

---

### 9. Gestão de Banco de Dados (TODO)

**Arquivo:** `src/pages/Database/DatabaseManager.jsx`

```jsx
// Features:
- Visão geral dos bancos:
  - Banco principal (helixai_db)
  - Bancos por tenant (tenant_*)
  - Tamanho de cada banco
  - Número de tabelas
  - Último backup

- Ações:
  - Criar backup manual
  - Restaurar backup
  - Otimizar tabelas
  - Executar query (cuidado!)
  - Ver índices
  - Analisar performance

- Backups Automáticos:
  - Agendar backups
  - Retenção de backups
  - Upload para S3/Cloud
  - Notificar em caso de falha

- Migrations:
  - Histórico de migrations
  - Aplicar nova migration
  - Rollback migration
```

---

### 10. Configurações Globais (TODO)

**Arquivo:** `src/pages/Configuracoes/ConfiguracoesGlobais.jsx`

```jsx
// Seções de Configuração:

// 1. Sistema
- Nome da plataforma
- URL base
- Email de suporte
- Manutenção programada

// 2. Afiliados
- Comissão padrão (primeira venda)
- Comissão recorrente
- Valor mínimo de saque
- Prazo de aprovação
- Bônus por meta

// 3. IA e Bot
- Provider padrão (Claude, GPT, Groq)
- Temperatura do modelo
- Max tokens
- Custo por mensagem
- Fallback em caso de erro

// 4. Pagamentos
- Mercado Pago credentials
- Webhooks URLs
- Dias de trial gratuito
- Multa por atraso

// 5. Email
- SMTP configurações
- Templates de email
- Remetente padrão

// 6. Segurança
- Força de senha mínima
- 2FA obrigatório para admins
- Tempo de sessão
- Bloqueio após tentativas
```

---

## 🔌 Integrações Backend Necessárias

### APIs Admin (Criar no Flask)

```python
# backend/routes/admin.py

@bp.route('/api/admin/dashboard/metrics')
@admin_required
def get_dashboard_metrics():
    """Retorna métricas do dashboard admin"""
    return {
        'mrr': calculate_mrr(),
        'empresas': {
            'total': count_empresas(),
            'ativas': count_empresas(status='ativa'),
            'trial': count_empresas(status='trial'),
            'vencidas': count_empresas(status='vencida'),
        },
        'usuarios': {
            'total': count_usuarios(),
            'ativos_mes': count_usuarios_ativos(30),
        },
        'bots': {
            'ativos': count_bots_ativos(),
            'conversas_hoje': count_conversas(hoje=True),
            'mensagens_mes': count_mensagens(mes=True),
        }
    }

@bp.route('/api/admin/empresas')
@admin_required
def list_empresas():
    """Lista todas as empresas"""
    pass

@bp.route('/api/admin/empresas/<int:id>')
@admin_required
def get_empresa(id):
    """Detalhes de uma empresa"""
    pass

@bp.route('/api/admin/empresas/<int:id>/impersonate')
@admin_required
def impersonate_empresa(id):
    """Acessa como se fosse a empresa (para suporte)"""
    pass

@bp.route('/api/admin/usuarios')
@admin_required
def list_usuarios():
    """Lista todos os usuários"""
    pass

@bp.route('/api/admin/assinaturas')
@admin_required
def list_assinaturas():
    """Lista todas as assinaturas"""
    pass

@bp.route('/api/admin/afiliados')
@admin_required
def list_afiliados():
    """Lista todos os afiliados"""
    pass

@bp.route('/api/admin/afiliados/<int:id>/aprovar')
@admin_required
def aprovar_afiliado(id):
    """Aprova cadastro de afiliado"""
    pass

@bp.route('/api/admin/saques/pendentes')
@admin_required
def list_saques_pendentes():
    """Lista saques pendentes de aprovação"""
    pass

@bp.route('/api/admin/saques/<int:id>/aprovar')
@admin_required
def aprovar_saque(id):
    """Aprova saque de afiliado"""
    pass

@bp.route('/api/admin/bots/status')
@admin_required
def get_bots_status():
    """Status de todos os bots"""
    pass

@bp.route('/api/admin/logs')
@admin_required
def get_logs():
    """Retorna logs do sistema"""
    pass

@bp.route('/api/admin/database/backups')
@admin_required
def list_backups():
    """Lista backups disponíveis"""
    pass

@bp.route('/api/admin/database/backup/create')
@admin_required
def create_backup():
    """Cria novo backup"""
    pass

@bp.route('/api/admin/configuracoes')
@admin_required
def get_configuracoes():
    """Retorna configurações globais"""
    pass

@bp.route('/api/admin/configuracoes')
@admin_required
def update_configuracoes():
    """Atualiza configurações globais"""
    pass
```

---

## 🔐 Permissões e Segurança

### Decorator de Admin

```python
# backend/decorators.py
from functools import wraps
from flask_login import current_user

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            return jsonify({'error': 'Não autenticado'}), 401

        if current_user.tipo != TipoUsuario.SUPER_ADMIN:
            return jsonify({'error': 'Acesso negado'}), 403

        return f(*args, **kwargs)
    return decorated_function
```

### Tipos de Admin

```python
class TipoUsuario(enum.Enum):
    SUPER_ADMIN = "super_admin"      # Acesso total
    ADMIN_EMPRESA = "admin_empresa"  # Acessa só sua empresa
    USUARIO = "usuario"              # Usuário comum
    VISUALIZADOR = "visualizador"    # Apenas leitura
```

---

## 📊 Métricas e KPIs

### Dashboard Principal

**Métricas Financeiras:**
- ARR (Annual Recurring Revenue)
- MRR (Monthly Recurring Revenue)
- Churn Rate
- LTV (Lifetime Value)
- CAC (Customer Acquisition Cost)
- Margem de lucro

**Métricas de Produto:**
- Empresas ativas
- Taxa de ativação (trial → pago)
- Uptime dos bots
- Satisfação do cliente (NPS)

**Métricas de Crescimento:**
- Novos clientes/mês
- Taxa de crescimento MRR
- Expansão revenue (upgrades)
- Contração revenue (downgrades + churn)

---

## 🎨 Componentes Visuais

### Cards de Métrica

```jsx
<div className="rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 p-6">
  <div className="flex items-start justify-between mb-4">
    <div className="p-3 rounded-xl bg-purple-500/20">
      <Icon className="h-6 w-6 text-purple-400" />
    </div>
    <div className="flex items-center gap-1 text-purple-400 text-sm">
      <ArrowUpRight className="h-4 w-4" />
      <span>+12.5%</span>
    </div>
  </div>
  <p className="text-3xl font-bold text-white mb-1">R$ 142.450</p>
  <p className="text-sm text-gray-400">MRR</p>
</div>
```

### Tabela Admin

```jsx
<div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
  <table className="w-full">
    <thead className="border-b border-white/10">
      <tr>
        <th className="text-left p-4 text-sm font-semibold text-gray-400">Empresa</th>
        <th className="text-left p-4 text-sm font-semibold text-gray-400">Plano</th>
        <th className="text-left p-4 text-sm font-semibold text-gray-400">Status</th>
        <th className="text-right p-4 text-sm font-semibold text-gray-400">MRR</th>
        <th className="text-center p-4 text-sm font-semibold text-gray-400">Ações</th>
      </tr>
    </thead>
    <tbody>
      {/* Linhas da tabela */}
    </tbody>
  </table>
</div>
```

---

## 🚀 Como Usar

### 1. Instalar Dependências

```bash
cd CRM_Admin/crm-admin-app
npm install
```

### 2. Iniciar em Desenvolvimento

```bash
npm run dev
```

Acesse: **http://localhost:5175**

### 3. Login Admin

```
Email: admin@aira.com
Senha: admin123
```

*(Credenciais devem ser criadas no banco)*

---

## 📦 Próximos Passos

### Curto Prazo (1-2 semanas):
- [ ] Implementar gestão de empresas
- [ ] Implementar gestão de usuários
- [ ] Implementar assinaturas e pagamentos
- [ ] Criar APIs admin no backend

### Médio Prazo (3-4 semanas):
- [ ] Gestão de afiliados completa
- [ ] Monitor de bots em tempo real
- [ ] Visualizador de logs
- [ ] Sistema de alertas

### Longo Prazo (2-3 meses):
- [ ] Gestão de banco de dados
- [ ] Configurações globais
- [ ] Analytics avançado
- [ ] Relatórios customizáveis

---

## 🎯 Diferenças CRM Cliente vs CRM Admin

| Feature | CRM Cliente | CRM Admin |
|---------|-------------|-----------|
| **Cor** | Verde/Esmeralda | Roxo/Indigo |
| **Acesso** | Empresa específica | Todas as empresas |
| **Métricas** | Da empresa | Sistema todo |
| **Ações** | Gerenciar próprio negócio | Gerenciar plataforma |
| **Permissões** | Limitadas | Totais |

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do sistema
2. Consulte documentação técnica
3. Entre em contato com a equipe de desenvolvimento

---

**Desenvolvido para AIRA - Sistema Multi-tenant de Automação com IA**
