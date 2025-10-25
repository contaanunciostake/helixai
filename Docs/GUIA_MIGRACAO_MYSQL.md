# 🚀 Guia de Migração: SQLite → MySQL

## ✅ Migração Completa do VendeAI para MySQL

Este guia detalha o processo completo de migração do banco de dados SQLite para MySQL (`u161861600_feiraoshow`).

---

## 📋 Pré-requisitos

1. ✅ Acesso ao banco MySQL `u161861600_feiraoshow`
2. ✅ Credenciais de acesso (usuário e senha)
3. ✅ Python 3.8+ instalado
4. ✅ Pacotes necessários:
   ```bash
   pip install pymysql mysql-connector-python python-dotenv sqlalchemy
   ```

---

## 🔧 Passo 1: Configurar Credenciais MySQL

Edite o arquivo `.env` na pasta raiz e configure as credenciais:

```env
# ==================== BANCO DE DADOS ====================

# ✅ MySQL (Produção)
DATABASE_URL=mysql+pymysql://u161861600_feiraoshow:SUA_SENHA@localhost:3306/u161861600_feiraoshow

# Configurações MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=u161861600_feiraoshow
DB_PASSWORD=SUA_SENHA_AQUI  # ← Altere aqui!
DB_NAME=u161861600_feiraoshow
```

**IMPORTANTE:** Substitua `SUA_SENHA_AQUI` pela senha real do banco MySQL.

---

## 🗄️ Passo 2: Adicionar Tabelas do VendeAI ao MySQL

Execute o script SQL para criar as tabelas do VendeAI no banco MySQL:

### Opção A: Via phpMyAdmin (Recomendado)
1. Acesse o phpMyAdmin
2. Selecione o banco `u161861600_feiraoshow`
3. Vá em **Importar**
4. Escolha o arquivo: `adicionar_tabelas_vendeai.sql`
5. Clique em **Executar**

### Opção B: Via Linha de Comando
```bash
mysql -u u161861600_feiraoshow -p u161861600_feiraoshow < adicionar_tabelas_vendeai.sql
```

---

## 📦 Passo 3: Migrar Dados do SQLite para MySQL

Execute o script de migração:

```bash
python migrar_sqlite_para_mysql.py
```

O script irá:
- ✅ Conectar ao SQLite (`vendeai.db`)
- ✅ Conectar ao MySQL (`u161861600_feiraoshow`)
- ✅ Migrar todos os dados tabela por tabela
- ✅ Exibir estatísticas da migração

**Exemplo de saída:**
```
╔══════════════════════════════════════════════════════════════════╗
║                 MIGRAÇÃO SQLite → MySQL                          ║
║                      VendeAI System                              ║
╚══════════════════════════════════════════════════════════════════╝

[OK] Conectado ao SQLite: vendeai.db
[OK] Conectado ao MySQL: u161861600_feiraoshow

--- Migrando tabela: empresas ---
[OK] Tabela 'empresas': 2 registros migrados (0 erros)

--- Migrando tabela: usuarios ---
[OK] Tabela 'usuarios': 5 registros migrados (0 erros)

======================================================================
RESUMO DA MIGRAÇÃO
======================================================================
Tabelas migradas: 10
Total de registros: 1,247
======================================================================
```

---

## 🧪 Passo 4: Testar a Conexão MySQL

Execute o teste de conexão:

```bash
python test_mysql_connection.py
```

Ou teste manualmente:

```python
from sqlalchemy import create_engine
import os
from dotenv import load_dotenv

load_dotenv()

# Testar conexão
engine = create_engine(os.getenv('DATABASE_URL'))
conn = engine.connect()
print("✅ Conexão MySQL estabelecida com sucesso!")
conn.close()
```

---

## 🔄 Passo 5: Atualizar Aplicação

Todas as configurações já foram atualizadas para usar MySQL:

### ✅ Arquivos Atualizados:
- `.env` - Configuração principal
- `backend/__init__.py` - DatabaseManager
- `database/models.py` - Modelos SQLAlchemy

### 🔍 Verificar Funcionamento:

1. **Iniciar Backend:**
   ```bash
   python run.py
   ```

2. **Testar API:**
   ```bash
   curl http://localhost:5000/health
   ```

3. **Acessar Dashboard:**
   ```
   http://localhost:5000/admin
   ```

---

## 🎯 Estrutura do Banco de Dados

### Tabelas Existentes (Preservadas)
- `cars` - Veículos do sistema
- `vendors` - Vendedores
- `admins` - Administradores
- `users` - Usuários do portal
- (+ 70 outras tabelas do sistema)

### Tabelas Adicionadas (VendeAI)
- `empresas` - Empresas multi-tenant
- `usuarios` - Usuários do VendeAI
- `configuracoes_bot` - Configurações do bot IA
- `leads` - Leads capturados
- `conversas` - Conversas WhatsApp
- `mensagens` - Mensagens individuais
- `campanhas` - Campanhas de disparo
- `templates_mensagem` - Templates reutilizáveis
- `disparos` - Log de disparos
- `produtos_catalogo` - Catálogo para o bot
- `integracoes` - Integrações externas
- `metricas_conversas` - Analytics
- `logs_sistema` - Logs de atividades
- `arquivos_importacao` - Importações CSV
- `interacoes_lead` - Follow-ups

---

## 🔐 Credenciais Padrão

Após a migração, as credenciais padrão são:

### Super Admin (VendeAI)
- **Email:** admin@vendeai.com
- **Senha:** admin123

### Empresa Demo
- **Email:** demo@vendeai.com
- **Senha:** demo123

**⚠️ IMPORTANTE:** Altere essas senhas imediatamente após o primeiro acesso!

---

## ⚙️ Configurações Avançadas

### Usar MySQL Remoto

Se o MySQL estiver em outro servidor:

```env
DB_HOST=seu-servidor.com.br
DB_PORT=3306
DB_USER=u161861600_feiraoshow
DB_PASSWORD=sua_senha
DB_NAME=u161861600_feiraoshow
```

### Conexão via SSL (Produção)

```env
DATABASE_URL=mysql+pymysql://user:pass@host:3306/db?ssl_ca=/path/to/ca-cert.pem
```

### Pool de Conexões

O SQLAlchemy já está configurado com pool otimizado:
- Pool size: 10 conexões
- Max overflow: 20 conexões
- Timeout: 30 segundos

---

## 🐛 Troubleshooting

### Erro: "Access denied for user"
**Solução:** Verifique usuário e senha no arquivo `.env`

### Erro: "Unknown database"
**Solução:** Certifique-se de que o banco `u161861600_feiraoshow` existe

### Erro: "Table doesn't exist"
**Solução:** Execute o script `adicionar_tabelas_vendeai.sql` primeiro

### Erro: "pymysql not found"
**Solução:**
```bash
pip install pymysql
```

### Migração parcial
**Solução:** Execute novamente - o script ignora registros duplicados

---

## 📊 Verificar Status

### Via MySQL:
```sql
-- Ver total de tabelas
SELECT COUNT(*) FROM information_schema.tables
WHERE table_schema = 'u161861600_feiraoshow';

-- Ver dados migrados
SELECT 'empresas' as tabela, COUNT(*) as total FROM empresas
UNION ALL
SELECT 'usuarios', COUNT(*) FROM usuarios
UNION ALL
SELECT 'leads', COUNT(*) FROM leads
UNION ALL
SELECT 'conversas', COUNT(*) FROM conversas
UNION ALL
SELECT 'mensagens', COUNT(*) FROM mensagens;
```

### Via Python:
```python
from sqlalchemy import create_engine, inspect
import os
from dotenv import load_dotenv

load_dotenv()
engine = create_engine(os.getenv('DATABASE_URL'))
inspector = inspect(engine)

print("Tabelas do VendeAI:")
for table in inspector.get_table_names():
    if table in ['empresas', 'usuarios', 'leads', 'conversas', 'mensagens']:
        print(f"✅ {table}")
```

---

## ✅ Checklist Final

- [ ] Credenciais MySQL configuradas no `.env`
- [ ] Script SQL executado (tabelas criadas)
- [ ] Dados migrados do SQLite para MySQL
- [ ] Conexão MySQL testada com sucesso
- [ ] Backend iniciado sem erros
- [ ] Dashboard acessível
- [ ] API funcionando
- [ ] Senhas padrão alteradas
- [ ] Backup do SQLite mantido

---

## 🔄 Rollback (Se Necessário)

Se precisar voltar ao SQLite:

1. Editar `.env`:
   ```env
   DATABASE_URL=sqlite:///vendeai.db
   ```

2. Reiniciar aplicação:
   ```bash
   python run.py
   ```

---

## 📞 Suporte

Em caso de problemas:
1. Verifique os logs: `logs/vendeai.log`
2. Teste conexão MySQL: `python test_mysql_connection.py`
3. Verifique credenciais no `.env`

---

## 🎉 Pronto!

Seu sistema VendeAI agora está rodando com MySQL!

**Benefícios:**
- ✅ Suporte multi-tenant robusto
- ✅ Performance otimizada
- ✅ Escalabilidade ilimitada
- ✅ Backup e replicação facilitados
- ✅ Integração com sistema existente

**Próximos Passos:**
1. Configurar backup automático
2. Otimizar índices do banco
3. Monitorar performance
4. Implementar cache Redis (opcional)

---

## 📝 Notas Importantes

- O arquivo `vendeai.db` (SQLite) **NÃO** será deletado automaticamente
- Mantenha-o como backup por pelo menos 30 dias
- Todas as tabelas do sistema original foram preservadas
- Os dados foram apenas copiados, não movidos

---

**Versão:** 1.0
**Data:** 2025-10-10
**Sistema:** VendeAI Multi-Tenant Bot Platform
