# 🔄 REINICIAR BACKEND - Instruções

## ⚠️ PROBLEMA IDENTIFICADO

O erro **404 Not Found** acontece porque o backend está rodando com o código **ANTIGO**.

Quando você edita arquivos `.py` do Flask, as mudanças **NÃO são aplicadas automaticamente**.

Você precisa **parar e reiniciar** o backend.

---

## 🛑 PASSO 1: Parar o Backend

### Opção A: Terminal onde está rodando
1. Vá para o terminal onde o backend está rodando
2. Pressione **Ctrl + C** para parar

### Opção B: Forçar parada (se não encontrar o terminal)
```powershell
# Windows PowerShell
Get-Process python | Stop-Process -Force
```

Ou busque manualmente:
1. Abra **Gerenciador de Tarefas** (Ctrl+Shift+Esc)
2. Procure por **python.exe** ou **Python**
3. Clique com botão direito → **Finalizar Tarefa**

---

## ✅ PASSO 2: Verificar Código Atualizado

Antes de reiniciar, vamos garantir que o código está correto:

```powershell
cd D:\Helix\HelixAI
python verificar_rotas.py
```

Este script vai mostrar:
- ✅ Todas as rotas registradas
- ✅ Se `/api/afiliados/login` existe
- ❌ Se houver algum problema

**Resultado esperado:**
```
🎯 VERIFICAÇÃO: /api/afiliados/login
========================================
✅ Rota encontrada!
   Métodos: POST, OPTIONS
   Endpoint: afiliados.login_afiliado
```

---

## 🚀 PASSO 3: Reiniciar Backend

```powershell
cd D:\Helix\HelixAI\backend
python app.py
```

**Você deve ver no console:**
```
[INFO] Usando gerenciador de banco de dados local (SQLite)
[AUTH-API] Rotas REST de autenticação carregadas
====================================================================
VENDEAI BACKEND - SERVIDOR FLASK
====================================================================

Acesse:
  Dashboard: http://localhost:5000
  Admin: http://localhost:5000/admin
  API Docs: http://localhost:5000/api/docs

* Running on all addresses (0.0.0.0)
* Running on http://127.0.0.1:5000
* Running on http://[IP]:5000
```

**⚠️ IMPORTANTE:** Aguarde até ver "Running on..." antes de testar!

---

## 🧪 PASSO 4: Testar Novamente

Agora que o backend está rodando com o código novo:

```powershell
cd D:\Helix\HelixAI
python testar_login_afiliado.py
```

**Resultado esperado:**
```
============================================================
TESTANDO LOGIN DE AFILIADO
============================================================
[1] Enviando requisição...
[2] Status Code: 200
✅ [3] LOGIN BEM-SUCEDIDO!

DADOS DO AFILIADO
========================================
Nome: João Silva - Afiliado
Email: afiliado@teste.com
Chave: teste2025
Status: ativo
Link: http://localhost:5000/r/teste2025

💰 FINANCEIRO:
  Saldo Disponível: R$ 149.10
  Comissões Geradas: R$ 317.60
  Comissões Pagas: R$ 139.40

📊 MÉTRICAS:
  Total de Clicks: 10
  Total de Cadastros: 5
  Total de Vendas: 2
```

---

## 🔍 DIAGNÓSTICO DE PROBLEMAS

### Erro 404 ainda persiste?

**Verifique se o backend foi realmente reiniciado:**

```powershell
# Teste um endpoint simples
curl http://localhost:5000/api/docs
```

Se retornar 404, o backend não está rodando.

**Verifique se há erro ao iniciar:**

Quando você executa `python app.py`, pode haver erros de importação. Veja a saída completa do terminal.

### Erro de importação?

Se aparecer algo como:
```
ModuleNotFoundError: No module named 'jwt'
```

Instale as dependências:
```powershell
cd D:\Helix\HelixAI\backend
pip install -r requirements.txt
```

### Erro no código?

Se houver erro de sintaxe no `afiliados.py`, o backend não vai iniciar. Verifique a saída do terminal.

**Exemplo de erro:**
```
  File "backend/routes/afiliados.py", line 45
    if not afiliado
                   ^
SyntaxError: invalid syntax
```

---

## 📋 CHECKLIST COMPLETO

- [ ] **Parei o backend antigo** (Ctrl+C ou Gerenciador de Tarefas)
- [ ] **Verifiquei o código** (`python verificar_rotas.py`)
- [ ] **Reiniciei o backend** (`python backend/app.py`)
- [ ] **Aguardei aparecer "Running on..."**
- [ ] **Testei o login** (`python testar_login_afiliado.py`)
- [ ] **Login retornou 200 OK** com dados do afiliado

---

## 🎯 SOLUÇÃO RÁPIDA (Copy-Paste)

Execute estes comandos em sequência:

```powershell
# 1. Matar qualquer processo Python rodando
Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force

# 2. Ir para pasta do projeto
cd D:\Helix\HelixAI

# 3. Verificar rotas (opcional mas recomendado)
python verificar_rotas.py

# 4. Iniciar backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\Helix\HelixAI\backend; python app.py"

# 5. Aguardar 5 segundos para backend iniciar
Start-Sleep -Seconds 5

# 6. Testar login
python testar_login_afiliado.py
```

**Copie e cole tudo de uma vez no PowerShell!**

---

## ⚡ MODO DEBUG

Se quiser ver o que está acontecendo em detalhes:

### 1. Verificar se porta 5000 está em uso
```powershell
netstat -ano | findstr :5000
```

Se houver algo rodando, anote o PID e mate:
```powershell
taskkill /PID [número] /F
```

### 2. Iniciar backend com logs detalhados
```powershell
cd D:\Helix\HelixAI\backend
$env:FLASK_DEBUG="True"
python app.py
```

### 3. Testar endpoint diretamente
```powershell
# Teste GET simples
curl http://localhost:5000/api/afiliados/test

# Teste POST de login
curl -X POST http://localhost:5000/api/afiliados/login `
  -H "Content-Type: application/json" `
  -d '{"email":"afiliado@teste.com","senha":"123456"}'
```

---

## 📞 AINDA NÃO FUNCIONOU?

Se após seguir todos os passos o erro persistir, me forneça:

1. **Saída completa** ao executar `python verificar_rotas.py`
2. **Saída completa** ao iniciar backend (`python app.py`)
3. **Erro exato** ao testar login
4. **Screenshot** do terminal se possível

---

**🔄 RESUMO: O problema é que você precisa REINICIAR o backend!**
