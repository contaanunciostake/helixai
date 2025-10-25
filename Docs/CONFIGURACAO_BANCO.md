# 🗄️ Configuração do Banco de Dados - VendeAI

## ✅ **Mudanças Realizadas**

### **Antes:**
- ❌ Bot Engine usava banco remoto via API (feiraoshowcar.com.br)
- ❌ Conexão MySQL legada
- ❌ Dependência de servidor externo

### **Agora:**
- ✅ **Banco de Dados Unificado:** `vendeai.db` (SQLite)
- ✅ **Tudo local:** Backend + Bot Engine usam o mesmo banco
- ✅ **Sem dependências externas**
- ✅ **Mais rápido e confiável**

---

## 📁 **Arquivos de Configuração Atualizados**

### **1. VendeAI/.env** (Principal)
```env
DATABASE_URL=sqlite:///vendeai.db
```

### **2. VendeAI/bot_engine/.env** (Bot WhatsApp)
```env
# ✅ Banco Local
DATABASE_URL=sqlite:///../vendeai.db

# ❌ Remoto DESABILITADO
# DB_API_URL=https://feiraoshowcar.com.br/db_api.php
# DB_API_TOKEN=bot_luana_xyz
```

---

## 🗂️ **Estrutura do Banco de Dados (vendeai.db)**

### **Tabelas Principais:**

1. **empresas** - Empresas/Clientes do sistema
2. **usuarios** - Usuários do sistema
3. **configuracoes_bot** - Configurações personalizadas do bot
4. **leads** - Leads captados
5. **conversas** - Conversas do WhatsApp
6. **mensagens** - Mensagens individuais
7. **campanhas** - Campanhas de disparo
8. **templates_mensagem** - Templates reutilizáveis
9. **disparos** - Log de disparos individuais
10. **produtos** - **NOVO!** Catálogo de produtos
11. **arquivos_importacao** - **NOVO!** Log de uploads CSV
12. **interacoes_lead** - Interações com leads
13. **integracoes** - Integrações externas configuradas
14. **metricas_conversas** - Métricas agregadas
15. **logs_sistema** - Logs de atividades

---

## 🔧 **Como o Sistema Funciona Agora**

### **Fluxo de Dados:**

```
┌─────────────────────────────────────────────┐
│         VendeAI Backend (Flask)             │
│         http://localhost:5000               │
│                                             │
│  • Dashboard                                │
│  • Gestão de Leads                          │
│  • Gestão de Produtos ← NOVO!              │
│  • Configuração do Bot ← NOVO!             │
│  • Campanhas                                │
└──────────────┬──────────────────────────────┘
               │
               │ Lê/Escreve
               ▼
         ┌─────────────┐
         │ vendeai.db  │ ← Banco Único
         │  (SQLite)   │
         └─────────────┘
               ▲
               │ Lê/Escreve
               │
┌──────────────┴──────────────────────────────┐
│      Bot Engine (WhatsApp)                  │
│      node main.js                           │
│                                             │
│  • Recebe mensagens                         │
│  • Processa com IA                          │
│  • Consulta produtos                        │
│  • Salva conversas                          │
│  • Registra leads                           │
└─────────────────────────────────────────────┘
```

---

## 🚀 **Como Usar**

### **1. Iniciar o Backend:**
```bash
cd C:\Users\Victor\Documents\VendeAI
python backend/app.py
```
- Backend já cria/atualiza o banco automaticamente
- Acesse: http://localhost:5000

### **2. Iniciar o Bot WhatsApp:**
```bash
cd C:\Users\Victor\Documents\VendeAI\bot_engine
node main.js
```
- Bot se conecta ao mesmo `vendeai.db`
- Escaneia QR Code do WhatsApp
- Começa a atender automaticamente

---

## 💾 **Backup do Banco de Dados**

### **Fazer Backup:**
```bash
# Windows
copy vendeai.db vendeai_backup_2025-10-10.db

# Ou use o script
python backup_db.py
```

### **Restaurar Backup:**
```bash
copy vendeai_backup_2025-10-10.db vendeai.db
```

---

## 🔍 **Verificar o Banco de Dados**

### **Via SQLite CLI:**
```bash
# Instalar (se não tiver)
pip install sqlite3

# Abrir banco
sqlite3 vendeai.db

# Comandos úteis:
.tables                    # Listar tabelas
.schema produtos           # Ver estrutura da tabela produtos
SELECT * FROM empresas;    # Ver empresas cadastradas
SELECT COUNT(*) FROM produtos;  # Contar produtos
.quit                      # Sair
```

### **Via Python:**
```python
from database.models import DatabaseManager, Produto

db = DatabaseManager()
session = db.get_session()

# Ver total de produtos
total = session.query(Produto).count()
print(f"Total de produtos: {total}")

# Ver produtos de uma empresa
produtos = session.query(Produto).filter_by(empresa_id=1).all()
for p in produtos:
    print(f"- {p.nome}: R$ {p.preco}")

session.close()
```

---

## ⚠️ **Importante**

### **O que NÃO fazer:**
- ❌ Não edite `vendeai.db` manualmente
- ❌ Não delete o banco enquanto o sistema estiver rodando
- ❌ Não use outro banco sem atualizar AMBOS os `.env`

### **Boas Práticas:**
- ✅ Faça backup do banco regularmente
- ✅ Use a interface web para gerenciar dados
- ✅ Teste mudanças no banco com dados de exemplo primeiro
- ✅ Mantenha os dois `.env` sincronizados

---

## 🐛 **Solução de Problemas**

### **Erro: "database is locked"**
**Causa:** Banco aberto em outro processo

**Solução:**
1. Feche todos os processos que usam o banco
2. Reinicie backend e bot

### **Erro: "no such table: produtos"**
**Causa:** Banco desatualizado

**Solução:**
```bash
python database/models.py
```

### **Bot não salva mensagens**
**Causa:** `.env` do bot_engine com configuração errada

**Solução:**
1. Verifique `bot_engine/.env`
2. Confirme: `DATABASE_URL=sqlite:///../vendeai.db`
3. Reinicie o bot

---

## 📊 **Estatísticas**

Você pode ver estatísticas do banco via:
- **Dashboard:** http://localhost:5000
- **API:** http://localhost:5000/api/stats
- **Logs:** `logs/vendeai.log`

---

## ✨ **Vantagens do Banco Unificado**

1. ✅ **Mais Rápido:** Sem latência de rede
2. ✅ **Mais Confiável:** Sem dependência de servidor externo
3. ✅ **Mais Simples:** Um único arquivo de banco
4. ✅ **Portável:** Copie `vendeai.db` para mover tudo
5. ✅ **Fácil Backup:** Apenas um arquivo para backupear
6. ✅ **Desenvolvimento:** Fácil de testar e debugar

---

**Sistema totalmente integrado e funcionando! 🚀**
