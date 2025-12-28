# 📚 VendeAI Database - Índice de Documentação

Guia completo de toda a estrutura do banco de dados.

## 📂 Estrutura de Arquivos

```
database_prisma/
├── 📄 README.md                    → Documentação principal
├── 📄 QUICK_START.md               → Início rápido (5 minutos)
├── 📄 INDEX.md                     → Este arquivo (índice geral)
├── 📄 package.json                 → Dependências e scripts
├── 📄 .env.example                 → Exemplo de configuração
├── 📄 .gitignore                   → Arquivos ignorados pelo Git
│
├── 📁 prisma/
│   ├── 📄 schema.prisma            → Schema completo do banco
│   └── 📄 seed.js                  → Dados de exemplo
│
└── 📁 docs/
    ├── 📄 SETUP.md                 → Guia detalhado de instalação
    ├── 📄 QUERIES.md               → Exemplos de queries complexas
    └── 📄 DIAGRAMA.md              → Diagrama de relacionamentos
```

---

## 🎯 Por Onde Começar?

### Para Iniciantes

1. **[QUICK_START.md](QUICK_START.md)** - Comece aqui! Setup em 5 minutos
2. **[README.md](README.md)** - Entenda a estrutura completa
3. **[docs/DIAGRAMA.md](docs/DIAGRAMA.md)** - Visualize os relacionamentos

### Para Desenvolvedores

1. **[docs/SETUP.md](docs/SETUP.md)** - Instalação detalhada
2. **[docs/QUERIES.md](docs/QUERIES.md)** - Exemplos práticos de código
3. **[prisma/schema.prisma](prisma/schema.prisma)** - Schema completo

### Para Arquitetos

1. **[docs/DIAGRAMA.md](docs/DIAGRAMA.md)** - Arquitetura e relacionamentos
2. **[README.md](README.md)** - Decisões de design
3. **[prisma/schema.prisma](prisma/schema.prisma)** - Definições técnicas

---

## 📖 Documentos Detalhados

### 1. README.md
**Documentação Principal**

- ✅ Visão geral completa
- ✅ Arquitetura multi-tenant
- ✅ Todas as 14 tabelas explicadas
- ✅ Relacionamentos
- ✅ Índices e otimizações
- ✅ Segurança e LGPD
- ✅ Instalação básica
- ✅ Queries de exemplo

**Quando usar:** Entender o sistema como um todo

---

### 2. QUICK_START.md
**Início Rápido (5 minutos)**

- ✅ Instalação express
- ✅ Setup com Docker
- ✅ Primeiro código
- ✅ Casos de uso comuns
- ✅ Resolução rápida de problemas

**Quando usar:** Começar a usar AGORA

---

### 3. docs/SETUP.md
**Guia Completo de Instalação**

- ✅ Pré-requisitos detalhados
- ✅ Instalação passo a passo
- ✅ Configuração avançada
- ✅ Docker & Docker Compose
- ✅ Deploy em produção
- ✅ Troubleshooting completo
- ✅ Backup e restore
- ✅ Monitoramento

**Quando usar:** Instalar em ambiente de produção

---

### 4. docs/QUERIES.md
**Exemplos de Queries Complexas**

- ✅ Busca de veículos (fulltext, filtros)
- ✅ Gestão de conversas
- ✅ Analytics e métricas
- ✅ Agendamentos
- ✅ Base de conhecimento
- ✅ Auditoria
- ✅ Transações complexas
- ✅ Dicas de performance

**Quando usar:** Implementar funcionalidades específicas

---

### 5. docs/DIAGRAMA.md
**Diagrama de Relacionamentos**

- ✅ Visão geral ASCII
- ✅ Todos os relacionamentos explicados
- ✅ Fluxo de estados
- ✅ Índices e performance
- ✅ Segurança multi-tenant
- ✅ Fluxo completo de conversa

**Quando usar:** Entender arquitetura e relacionamentos

---

### 6. prisma/schema.prisma
**Schema Completo do Banco**

14 Modelos/Tabelas:
1. `Empresa` - Multi-tenant root
2. `User` - Usuários do sistema
3. `BotConfiguration` - Configurações do bot
4. `AutomatedMessage` - Mensagens automáticas
5. `BusinessHours` - Horários de funcionamento
6. `BotBehavior` - Regras de comportamento
7. `Vehicle` - Estoque de veículos
8. `Conversation` - Conversas com clientes
9. `Message` - Mensagens individuais
10. `ConversationContext` - Contexto da conversa
11. `Appointment` - Agendamentos
12. `Integration` - Integrações externas
13. `KnowledgeBase` - Base de conhecimento
14. `AnalyticsMetric` - Métricas
15. `AuditLog` - Logs de auditoria

**Features:**
- ✅ Multi-tenancy
- ✅ Soft deletes
- ✅ JSON fields
- ✅ Fulltext search
- ✅ Índices otimizados

**Quando usar:** Referência técnica completa

---

### 7. prisma/seed.js
**Dados de Exemplo**

Cria automaticamente:
- 2 empresas (Feirão ShowCar + Imóveis Prime)
- 3 usuários (1 admin, 2 vendedores)
- 1 configuração de bot completa
- 3 mensagens automáticas
- 6 horários de funcionamento
- 2 regras de comportamento
- 5 veículos variados
- 2 conversas de exemplo
- 3 mensagens
- 1 contexto de conversa
- 1 agendamento
- 4 integrações
- 4 itens de FAQ
- 2 métricas diárias
- 3 logs de auditoria

**Quando usar:** Popular banco para desenvolvimento/teste

---

## 🚀 Comandos Essenciais

### Setup Inicial

```bash
# 1. Instalar dependências
npm install

# 2. Configurar .env
cp .env.example .env
# Editar .env com suas configurações

# 3. Aplicar migrations
npm run prisma:migrate

# 4. Popular com dados
npm run prisma:seed

# 5. Abrir interface visual
npm run prisma:studio
```

### Desenvolvimento

```bash
# Gerar Prisma Client após alterar schema
npm run prisma:generate

# Criar nova migration
npx prisma migrate dev --name nome_da_migration

# Ver SQL das migrations
cat prisma/migrations/*/migration.sql

# Resetar banco (CUIDADO!)
npm run prisma:reset
```

### Produção

```bash
# Aplicar migrations em produção
npm run prisma:deploy

# Gerar cliente de produção
npm run prisma:generate
```

---

## 📊 Estatísticas do Banco

### Tabelas: 15
- Core: 3 (Empresa, User, BotConfiguration)
- Conversação: 3 (Conversation, Message, ConversationContext)
- Negócio: 2 (Vehicle, Appointment)
- Automação: 3 (AutomatedMessage, BusinessHours, BotBehavior)
- Sistema: 4 (Integration, KnowledgeBase, AnalyticsMetric, AuditLog)

### Relacionamentos: 25+
- 1:1 → 2 (Empresa-BotConfig, Conversation-Context)
- 1:N → 20+ (Empresa para todas, Conversation para Messages, etc)
- N:1 → Inversos dos 1:N

### Índices: 40+
- Simples: 25+
- Compostos: 8+
- Fulltext: 3
- Unique: 6

### Campos JSON: 10+
- `BotConfiguration.funcionalidades`
- `User.permissoes`
- `AutomatedMessage.variaveis`
- `Vehicle.caracteristicas`
- `Vehicle.fotos_urls`
- `Message.entidades_extraidas`
- `ConversationContext.preferencias`
- `Integration.config` (criptografado)
- E mais...

---

## 🎓 Recursos de Aprendizado

### Tutoriais em Ordem

1. **Básico:**
   - [QUICK_START.md](QUICK_START.md) → Setup inicial
   - [README.md](README.md) → Entender estrutura
   - Prisma Studio → Explorar visualmente

2. **Intermediário:**
   - [docs/QUERIES.md](docs/QUERIES.md) → Queries práticas
   - [docs/DIAGRAMA.md](docs/DIAGRAMA.md) → Relacionamentos
   - Implementar CRUD básico

3. **Avançado:**
   - [docs/SETUP.md](docs/SETUP.md) → Deploy produção
   - Transactions complexas
   - Otimização de queries

### Links Externos

- **Prisma Docs**: https://www.prisma.io/docs
- **PostgreSQL Tutorial**: https://www.postgresqltutorial.com
- **Prisma Examples**: https://github.com/prisma/prisma-examples

---

## ✅ Checklist de Validação

Após ler a documentação, você deve saber:

**Conceitos:**
- [ ] O que é multi-tenancy e como é implementado
- [ ] Como funcionam os soft deletes
- [ ] Quais tabelas têm fulltext search
- [ ] Como os relacionamentos funcionam
- [ ] O que cada tabela representa

**Prática:**
- [ ] Instalar e configurar o banco
- [ ] Executar migrations
- [ ] Popular com seed
- [ ] Fazer queries básicas
- [ ] Usar Prisma Studio

**Avançado:**
- [ ] Criar migrations customizadas
- [ ] Implementar queries complexas
- [ ] Configurar backup
- [ ] Deploy em produção
- [ ] Monitorar performance

---

## 🆘 Suporte

### Problemas Comuns

1. **Erro de conexão**
   - Ver: [docs/SETUP.md](docs/SETUP.md) → Troubleshooting

2. **Migration falhou**
   - Ver: [docs/SETUP.md](docs/SETUP.md) → Migrations

3. **Query lenta**
   - Ver: [docs/QUERIES.md](docs/QUERIES.md) → Dicas de Performance

4. **Dúvida sobre relacionamento**
   - Ver: [docs/DIAGRAMA.md](docs/DIAGRAMA.md)

### Onde Buscar Ajuda

1. **Esta documentação** (você está aqui!)
2. **Prisma Docs**: https://www.prisma.io/docs
3. **PostgreSQL Docs**: https://www.postgresql.org/docs
4. **Prisma Discord**: https://discord.gg/prisma

---

## 🔄 Atualizações

**Versão 1.0.0** - 2024-01-30
- ✅ Schema inicial completo
- ✅ 15 tabelas implementadas
- ✅ Seed funcional
- ✅ Documentação completa

**Próximas versões:**
- [ ] Views materializadas para analytics
- [ ] Particionamento de Messages por data
- [ ] Full-text search avançado
- [ ] Replicação read-only

---

## 📝 Contribuindo

Se você encontrar erros ou tiver sugestões:

1. Documente o problema claramente
2. Sugira uma solução (se possível)
3. Abra uma issue ou PR

---

## 📄 Licença

MIT License - VendeAI Bot System © 2024

---

**VendeAI Database** - Estrutura Completa de Banco de Dados
Desenvolvido com ❤️ usando Prisma ORM + PostgreSQL
