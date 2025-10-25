# 🚨 Resolver Erro 440 - Loop Infinito de Reconexão

## ❌ Problema Identificado

Seu bot está em loop infinito tentando reconectar com erro:
```
Stream Errored (conflict) 440
```

**O que significa**: Múltiplas sessões WhatsApp tentando conectar ao mesmo tempo.

**Causas possíveis**:
1. ✅ Múltiplas instâncias do bot rodando simultaneamente
2. ✅ Arquivo de autenticação corrompido (`auth_info_baileys`)
3. ✅ Sessão anterior não foi fechada corretamente
4. ❌ Coluna `bot_ativo` faltando no banco (já identificado)

---

## 🔧 Solução: Passo a Passo

### Passo 1: Parar TODAS as Instâncias do Bot

**Windows:**
```bash
# Abrir Task Manager (Ctrl+Shift+Esc)
# Procurar por "node" e fechar TODOS os processos node.exe
```

**Ou via terminal:**
```bash
# Listar processos node
tasklist | findstr node

# Matar todos os processos node
taskkill /F /IM node.exe
```

**Confirmar que parou:**
```bash
tasklist | findstr node
# ✅ Deve retornar vazio
```

---

### Passo 2: Executar o Fix do Banco de Dados

**Abrir MySQL Workbench ou linha de comando:**

```sql
-- 1. Conectar ao MySQL
mysql -u root -p

-- 2. Executar o fix
USE helixai_db;

-- 3. Adicionar coluna bot_ativo se não existir
ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS bot_ativo TINYINT(1) DEFAULT 1
COMMENT 'Bot WhatsApp ativo (1=sim, 0=não)';

-- 4. Setar valor padrão para empresas existentes
UPDATE empresas
SET bot_ativo = 1
WHERE bot_ativo IS NULL;

-- 5. Verificar
SELECT id, nome, bot_ativo FROM empresas LIMIT 5;
```

**Resultado esperado:**
```
+----+------------------+-----------+
| id | nome             | bot_ativo |
+----+------------------+-----------+
|  1 | Empresa Teste    |         1 |
|  2 | Outra Empresa    |         1 |
+----+------------------+-----------+
```

---

### Passo 3: Limpar Credenciais do WhatsApp

**Deletar pasta de autenticação:**

```bash
cd D:\Helix\HelixAI\VendeAI\bot_engine

# Verificar se existe
dir auth_info_baileys

# Deletar (TODAS as credenciais serão removidas)
rmdir /S /Q auth_info_baileys

# Confirmar que foi deletado
dir auth_info_baileys
# ✅ Deve retornar "O sistema não pode encontrar o arquivo especificado"
```

**⚠️ IMPORTANTE**: Após deletar, você precisará gerar um NOVO QR Code e reconectar o WhatsApp.

---

### Passo 4: Reiniciar o Bot (Uma Única Vez)

```bash
cd D:\Helix\HelixAI\VendeAI\bot_engine

# Iniciar bot-api-server
node bot-api-server.js
```

**Console esperado:**
```
🚀 Bot API Server rodando na porta 3010
📊 WebSocket Server ativo em ws://localhost:3010/ws
✅ Pool de conexões MySQL configurado
📡 Aguardando clientes...
```

**NÃO DEVE APARECER**:
```
❌ Stream Errored (conflict) 440
❌ Attempting to reconnect...
```

---

### Passo 5: Testar Conexão no CRM

**a) Abrir CRM do Cliente:**
```
http://localhost:5173/login
```

**b) Login e acessar Bot WhatsApp:**
1. Fazer login
2. Ir para "Bot WhatsApp"
3. Status deve estar: "Desconectado"

**c) Gerar QR Code:**
1. Clicar "Gerar QR Code"
2. ✅ QR Code deve aparecer em ~5 segundos
3. ❌ NÃO deve ficar em "Conectando..." infinitamente

**d) Escanear QR Code:**
1. Abrir WhatsApp no celular
2. Aparelhos Conectados → Conectar Aparelho
3. Escanear QR Code
4. ✅ Deve conectar em ~10 segundos

**Console esperado:**
```
✅ QR Code gerado
📱 Aguardando escaneamento...
✅ WhatsApp conectado!
📞 Número: 5511999999999
```

---

### Passo 6: Testar Toggle Bot (Ativar/Desativar)

**a) Desativar Bot:**
1. Clicar "Desativar Bot"
2. Aguardar 2 segundos

**Console bot-api-server:**
```
[TOGGLE] =========================================
[TOGGLE] Empresa ID: 2
[TOGGLE] Novo status: DESATIVADO
[TOGGLE] ✅ Tabela 'empresas' atualizada (helixai_db)
[TOGGLE] ✅ Tabela 'bot_config' atualizada
[TOGGLE] ✅ Cache do CRM Adapter limpo
[TOGGLE] Bot DESATIVADO para empresa 2
[TOGGLE] ⏱️  Próxima mensagem usará configuração atualizada
[TOGGLE] =========================================
```

**b) Enviar mensagem para o WhatsApp:**
- ✅ Bot NÃO deve responder

**Console main.js (se estiver rodando):**
```
[CRM] Bot ativo: false
🔇 [MAIN] Bot desativado - mensagem ignorada
```

**c) Ativar Bot:**
1. Clicar "Ativar Bot"
2. Enviar mensagem novamente
3. ✅ Bot deve responder

---

## 🔍 Verificar se Está Tudo Funcionando

### Checklist Completo:

**✅ Banco de Dados:**
```sql
-- Verificar coluna bot_ativo existe
DESCRIBE empresas;
-- Deve mostrar linha com bot_ativo

-- Verificar valores
SELECT id, nome, bot_ativo FROM empresas;
```

**✅ Bot Único:**
```bash
tasklist | findstr node
# Deve mostrar APENAS UM processo node.exe
```

**✅ Sem Erro 440:**
```
Console do bot-api-server NÃO deve mostrar:
❌ Stream Errored (conflict) 440
❌ Attempting to reconnect...
```

**✅ QR Code Funciona:**
- Gera em ~5 segundos
- Conecta ao escanear
- Não gera quando já conectado

**✅ Toggle Funciona:**
- Desativar → Bot não responde
- Ativar → Bot responde
- Efeito em < 2 segundos

---

## 🚨 Se o Problema Persistir

### 1. Verificar Portas em Uso

```bash
# Ver quem está usando porta 3010
netstat -ano | findstr :3010

# Exemplo de saída:
TCP    0.0.0.0:3010    0.0.0.0:0    LISTENING    12345

# Matar processo pela PID (12345 no exemplo)
taskkill /F /PID 12345
```

### 2. Verificar Múltiplas Instâncias

```bash
# Listar todos os processos node com detalhes
wmic process where "name='node.exe'" get ProcessId,CommandLine

# Se aparecer mais de uma instância rodando bot-api-server.js:
taskkill /F /PID [PID_DO_PROCESSO]
```

### 3. Limpar Cache Completamente

```bash
cd D:\Helix\HelixAI\VendeAI\bot_engine

# Deletar arquivos de cache e sessão
rmdir /S /Q auth_info_baileys
rmdir /S /Q .wwebjs_auth
rmdir /S /Q .wwebjs_cache

# Reiniciar
node bot-api-server.js
```

### 4. Verificar Logs Detalhados

**Ativar debug no bot-api-server.js:**

Adicionar no início do arquivo:
```javascript
process.env.DEBUG = 'baileys:*';
```

**Reiniciar e observar logs:**
```bash
node bot-api-server.js > debug.log 2>&1
```

---

## 📊 Ordem de Execução (Resumo)

```
1. ❌ taskkill /F /IM node.exe
   ↓
2. 🗄️ mysql -u root -p
   → USE helixai_db;
   → (executar SQL fix do fix_bot_ativo_column.sql)
   ↓
3. 🗑️ rmdir /S /Q auth_info_baileys
   ↓
4. ✅ node bot-api-server.js
   ↓
5. 🌐 Abrir http://localhost:5173/login
   ↓
6. 📱 Gerar QR Code → Escanear → Conectar
   ↓
7. 🧪 Testar toggle → Desativar → Ativar
   ↓
8. 🎉 FUNCIONANDO!
```

---

## 🎯 Resultado Esperado

Depois de seguir todos os passos:

✅ Bot conecta sem erro 440
✅ QR Code gera corretamente
✅ Não gera QR quando conectado
✅ Desconectar funciona (logout do celular)
✅ Reconectar funciona
✅ Toggle ativa/desativa instantaneamente
✅ Cache limpo após toggle
✅ Bot responde quando ativo
✅ Bot ignora quando desativado

---

**Qualquer dúvida, compartilhe os logs do console!** 🚀
