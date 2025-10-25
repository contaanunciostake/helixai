# 🔍 Debug Setup - Passo a Passo

## 📋 O que você precisa fazer AGORA

### Passo 1: Reiniciar o Backend

```bash
# Parar o backend (Ctrl+C)
# Iniciar novamente
cd D:\Helix\HelixAI\VendeAI\backend
python run.py
```

### Passo 2: Verificar no Banco de Dados

Abra MySQL Workbench ou phpMyAdmin e execute:

```sql
USE helixai_db;

-- Ver TODAS as empresas e seu status de setup
SELECT
    e.id,
    e.nome,
    e.slug,
    e.setor,
    e.configuracoes_json,
    u.email as usuario_email
FROM empresas e
LEFT JOIN usuarios u ON u.empresa_id = e.id
ORDER BY e.id DESC
LIMIT 5;
```

**Me diga o resultado dessa query!** Especialmente:
- O valor de `configuracoes_json` da última empresa criada
- Se é `{"setup_completo": false}` ou NULL ou outra coisa

### Passo 3: Forçar Setup na Última Empresa

```sql
-- Encontrar ID da última empresa
SELECT id, nome FROM empresas ORDER BY id DESC LIMIT 1;

-- FORÇAR setup_completo = false (substitua o ID)
UPDATE empresas
SET configuracoes_json = JSON_OBJECT('setup_completo', false)
WHERE id = 999;  -- ← SUBSTITUA PELO ID REAL

-- Verificar
SELECT id, nome, configuracoes_json FROM empresas WHERE id = 999;
```

### Passo 4: Limpar LocalStorage do Navegador

No navegador onde você testou (Chrome/Edge):

1. Abra DevTools (F12)
2. Aba **Console**
3. Digite e execute:
```javascript
localStorage.clear()
console.log('LocalStorage limpo!')
location.reload()
```

### Passo 5: Fazer Login Novamente

1. Acesse: `http://localhost:5177`
2. Faça login com o email de teste
3. Observe o **Console do Navegador (F12)**
4. Observe o **Terminal do Backend**

### Passo 6: Copiar Logs

**Console do Navegador (F12):**

Copie TODAS as mensagens que começam com `[CRM Cliente]` e me envie:

```
Exemplo:
[CRM Cliente] 🔍 Verificando status do setup...
[CRM Cliente] empresa_id: 5
[CRM Cliente] Resposta completa da API: {...}
[CRM Cliente] data.setup_completo: ???
```

**Terminal do Backend:**

Copie TODAS as mensagens que começam com `[EMPRESA-API]` e me envie:

```
Exemplo:
[EMPRESA-API] === VERIFICANDO SETUP ===
[EMPRESA-API] Empresa ID: 5
[EMPRESA-API] configuracoes_json raw: ???
[EMPRESA-API] setup_completo extraído: ???
```

---

## 🧪 Teste Alternativo: Criar Nova Conta

Se não quiser mexer no banco, crie uma conta completamente nova:

1. Use email diferente (ex: `teste3@email.com`)
2. Faça nova compra
3. Defina senha
4. **ANTES de fazer login**, me diga:
   - O que apareceu no **terminal do backend** quando processou o pagamento
   - Procure por: `[TenantManager] ✅ Empresa criada`

---

## ❓ O que estou procurando

Preciso saber **exatamente** o que está sendo salvo no banco quando a empresa é criada:

**Opção A - CORRETO ✅**
```json
configuracoes_json: {"setup_completo": false}
```

**Opção B - ERRADO ❌**
```json
configuracoes_json: null
```

**Opção C - ERRADO ❌**
```json
configuracoes_json: {}
```

**Opção D - ERRADO ❌**
```json
configuracoes_json: {"setup_completo": true}
```

---

## 🎯 Me envie os seguintes dados:

1. **Query do banco:**
   ```sql
   SELECT id, nome, configuracoes_json FROM empresas ORDER BY id DESC LIMIT 1;
   ```
   Resultado: ?

2. **Console do navegador** (logs do CRM Cliente)

3. **Terminal do backend** (logs do EMPRESA-API)

Com essas informações consigo identificar exatamente onde está o problema! 🔍
