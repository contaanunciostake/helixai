# 🔧 FASE A: Corrigir Banco de Dados

## Problema Atual

Erro no console:
```
⚠️ Erro: Unknown column 'bot_ativo' in 'field list'
```

A tabela `empresas` não tem as colunas necessárias para o sistema multi-tenant.

---

## ✅ Solução: Adicionar Colunas Faltantes

### Opção 1: Script Automático (RECOMENDADO)

**1. Execute o script:**
```cmd
D:\Helix\HelixAI\EXECUTAR_FIX_BANCO.bat
```

**2. Digite a senha do MySQL quando solicitado**
- Geralmente: (vazio - só pressione Enter)
- Ou: root
- Ou: sua senha customizada

**3. Aguarde confirmação:**
```
✅ SQL EXECUTADO COM SUCESSO!
```

---

### Opção 2: Via phpMyAdmin (Manual)

**1. Abrir phpMyAdmin:**
```
http://localhost/phpmyadmin
```

**2. Selecionar banco:** `helixai_db`

**3. Clicar na aba "SQL"**

**4. Copiar e colar este SQL:**

```sql
-- Adicionar colunas faltantes
ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS bot_ativo BOOLEAN DEFAULT true
COMMENT 'Bot WhatsApp ativo para esta empresa';

ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS whatsapp_numero VARCHAR(20) DEFAULT NULL
COMMENT 'Número WhatsApp conectado (formato: 5511999999999)';

ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS whatsapp_status
ENUM('disconnected', 'connecting', 'connected', 'error')
DEFAULT 'disconnected'
COMMENT 'Status da conexão WhatsApp';
```

**5. Clicar "Executar"**

**6. Verificar resultado:**
```
3 linhas afetadas
```

---

## ✅ Verificar se funcionou

Após executar o SQL, verifique se as colunas foram criadas:

### Via MySQL Command Line:
```bash
mysql -u root -p
```
```sql
USE helixai_db;
DESCRIBE empresas;
```

**Deve mostrar:**
```
+-------------------+-------------------------------------------------------+
| Field             | Type                                                  |
+-------------------+-------------------------------------------------------+
| id                | int(11)                                               |
| nome              | varchar(255)                                          |
| ...               | ...                                                   |
| bot_ativo         | tinyint(1)                                           |
| whatsapp_numero   | varchar(20)                                          |
| whatsapp_status   | enum('disconnected','connecting','connected','error') |
+-------------------+-------------------------------------------------------+
```

### Via phpMyAdmin:
- Banco `helixai_db`
- Tabela `empresas`
- Aba "Estrutura"
- Procurar pelas 3 novas colunas

---

## 🔄 Próximos Passos

Após executar o SQL:

**1. Reiniciar o Bot:**
```
Ctrl+C no terminal do bot
```
Depois rodar novamente:
```
D:\Helix\HelixAI\INICIAR_SISTEMA.bat
```

**2. Testar conexão WhatsApp:**
- Acessar CRM: http://localhost:5173
- Ir em "Bot WhatsApp"
- Clicar "Gerar QR Code"

**3. Verificar console do bot:**

**✅ ANTES (com erro):**
```
⚠️ Erro ao buscar de helixai_db: Unknown column 'bot_ativo' in 'field list'
```

**✅ DEPOIS (sem erro):**
```
✅ [CRM] Configuração carregada com sucesso!
   Empresa: Nome da Empresa
   Bot ativo: true
```

**4. Se tudo estiver OK:**
- A conexão WhatsApp deve ficar ESTÁVEL (sem loops de reconexão)
- Podemos prosseguir para **Fase B** (sessões isoladas)

---

## ⚠️ Se der erro

### Erro: "Access denied for user 'root'"
**Solução:** Senha incorreta. Tente:
- Senha vazia (Enter)
- "root"
- Verificar senha no XAMPP

### Erro: "Unknown database 'helixai_db'"
**Solução:** Banco não existe. Verificar:
- Nome correto do banco
- Se está usando outro banco (u161861600_feiraoshow?)

### Erro: "mysql is not recognized"
**Solução:** MySQL não está no PATH. Use phpMyAdmin (Opção 2)

---

## 📝 Resumo

**Arquivos criados:**
- `fix_bot_ativo_empresas.sql` - Script SQL
- `EXECUTAR_FIX_BANCO.bat` - Script automático
- `INSTRUCOES_FIX_BANCO.md` - Este guia

**Ação necessária:**
1. Executar o SQL (Opção 1 ou 2)
2. Reiniciar o bot
3. Testar conexão WhatsApp
4. Verificar se erros sumiram

**Depois:**
- Prosseguir para Fase B (sessões isoladas)
