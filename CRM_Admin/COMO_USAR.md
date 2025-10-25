# 🚀 Como Usar o CRM Admin

## ⚡ Início Rápido

### 1. Instalar Dependências

```bash
cd CRM_Admin/crm-admin-app
npm install
```

### 2. Iniciar o Servidor

```bash
npm run dev
```

O painel estará disponível em: **http://localhost:5175**

## 🎨 Identidade Visual

- **Cor Principal**: Roxo/Purple (#9333EA)
- **Tema**: Autoridade e Controle Administrativo
- **Diferença do Cliente**: CRM Cliente usa Verde, Admin usa Roxo

## 📱 Funcionalidades Implementadas

### ✅ Layout Base (AdminLayout.jsx)
- Sidebar responsiva com tema roxo
- Menu organizado por seções
- Header com status do sistema
- Perfil do admin com logout
- Animações suaves

### ✅ Dashboard Principal (AdminDashboard.jsx)
- **MRR**: R$ 142.450/mês (+12.5%)
- **Empresas**: 247 ativas
- **Usuários**: 1.342 ativos
- **Bots**: 215 ativos (87%)
- Distribuição por plano
- Últimas atividades
- Alertas críticos

## 📋 Menu do Sistema

### 🔍 Visão Geral
- **Dashboard**: Métricas gerais (✅ Implementado)
- **Analytics**: Análise avançada (⏳ Placeholder)
- **Atividade**: Log de atividades (⏳ Placeholder)

### 🏢 Gestão
- **Empresas**: Gerenciar todas empresas (⏳ Placeholder)
- **Usuários**: Gerenciar usuários (⏳ Placeholder)
- **Afiliados**: Gerenciar afiliados (⏳ Placeholder)

### 💰 Financeiro
- **Assinaturas**: Controle de assinaturas (⏳ Placeholder)
- **Pagamentos**: Histórico de pagamentos (⏳ Placeholder)
- **Comissões**: Gestão de comissões (⏳ Placeholder)

### ⚙️ Sistema
- **Bots**: Monitor de bots WhatsApp (⏳ Placeholder)
- **Logs**: Visualizador de logs (⏳ Placeholder)
- **Database**: Gestão de BD (⏳ Placeholder)
- **Configurações**: Config globais (⏳ Placeholder)

## 🔌 Integração com Backend

### APIs Necessárias

O CRM Admin precisa destas APIs no backend Flask:

```python
# backend/routes/admin.py

GET  /api/admin/dashboard/metrics       # Métricas do dashboard
GET  /api/admin/empresas                # Lista empresas
GET  /api/admin/empresas/:id            # Detalhes empresa
POST /api/admin/empresas                # Criar empresa
PUT  /api/admin/empresas/:id            # Editar empresa
DELETE /api/admin/empresas/:id          # Excluir empresa

GET  /api/admin/usuarios                # Lista usuários
GET  /api/admin/usuarios/:id            # Detalhes usuário
PUT  /api/admin/usuarios/:id            # Editar usuário

GET  /api/admin/assinaturas             # Lista assinaturas
GET  /api/admin/pagamentos              # Lista pagamentos

GET  /api/admin/afiliados               # Lista afiliados
PUT  /api/admin/afiliados/:id/aprovar   # Aprovar afiliado
GET  /api/admin/saques/pendentes        # Saques pendentes
PUT  /api/admin/saques/:id/aprovar      # Aprovar saque

GET  /api/admin/bots/status             # Status dos bots
POST /api/admin/bots/:id/restart        # Reiniciar bot

GET  /api/admin/logs                    # Logs do sistema
GET  /api/admin/database/backups        # Lista backups
POST /api/admin/database/backup/create  # Criar backup

GET  /api/admin/configuracoes           # Config globais
PUT  /api/admin/configuracoes           # Atualizar config
```

## 🎯 Próximos Passos

### Curto Prazo (1-2 semanas):
1. Implementar Gestão de Empresas
2. Implementar Gestão de Usuários
3. Criar APIs admin no backend
4. Implementar Assinaturas

### Médio Prazo (3-4 semanas):
5. Gestão de Afiliados completa
6. Monitor de Bots em tempo real
7. Visualizador de Logs
8. Sistema de alertas

### Longo Prazo (2-3 meses):
9. Gestão de Banco de Dados
10. Configurações Globais
11. Analytics avançado
12. Relatórios customizáveis

## 📊 Métricas do Dashboard

O dashboard mostra:

- **Financeiro**: MRR, ARR, Churn, LTV, CAC
- **Produto**: Empresas ativas, usuários, uptime bots
- **Crescimento**: Novos clientes, taxa crescimento
- **Saúde**: Conversas/dia, mensagens/mês, taxa conversão

## 🔐 Segurança

### Permissões

Apenas usuários com tipo `SUPER_ADMIN` podem acessar o CRM Admin.

```python
# Verificar no backend
if current_user.tipo != TipoUsuario.SUPER_ADMIN:
    return jsonify({'error': 'Acesso negado'}), 403
```

### Criar Admin

Execute no MySQL:

```sql
-- Criar usuário admin
INSERT INTO usuarios (
    empresa_id,
    nome,
    email,
    senha_hash,
    tipo,
    ativo
) VALUES (
    1,
    'Admin Master',
    'admin@aira.com',
    'scrypt:32768:8:1$...',  -- Hash da senha
    'super_admin',
    1
);
```

## 🎨 Customização

### Cores

O tema roxo pode ser ajustado em `AdminLayout.jsx`:

```jsx
// Gradientes roxos
from-purple-500/20 to-indigo-500/20
border-purple-500/30

// Mudar para outra cor:
from-blue-500/20 to-cyan-500/20
border-blue-500/30
```

## 🐛 Troubleshooting

### Erro: "Cannot find module AdminLayout"
```bash
# Verifique se o arquivo existe
ls src/components/layout/AdminLayout.jsx

# Se não existir, copie da documentação
```

### Erro: "API not found"
```bash
# Backend precisa estar rodando
cd backend
python app.py

# Verifique porta 5000
curl http://localhost:5000/api/admin/dashboard/metrics
```

### Sidebar não aparece
```bash
# Limpe cache e reinicie
rm -rf node_modules/.vite
npm run dev
```

## 📞 Suporte

Para dúvidas:
1. Consulte `CRM_ADMIN_COMPLETO.md`
2. Verifique logs do console (F12)
3. Entre em contato com dev team

---

**Desenvolvido para AIRA - Sistema Multi-tenant**
