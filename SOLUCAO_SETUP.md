# ✅ SOLUÇÃO - Setup Não Aparece

## 🎯 Problema Identificado

**Erro:** `Unknown column 'e.configuracoes_json' in 'field list'`

**Causa:** A coluna `configuracoes_json` **não existe** na tabela `empresas`.

**Por que isso aconteceu:**
- A migration inicial (`create_empresas_table.sql`) não incluiu essa coluna
- O `tenant_manager.py` estava tentando inserir nessa coluna que não existe
- Por isso o setup nunca aparecia - o campo não existia no banco!

---

## 🔧 SOLUÇÃO (Execute AGORA)

### Opção 1: Via MySQL Workbench / phpMyAdmin

Copie e cole este SQL:

```sql
USE helixai_db;

-- Adicionar coluna configuracoes_json
ALTER TABLE empresas
ADD COLUMN configuracoes_json JSON NULL
COMMENT 'Configurações da empresa em JSON (setup_completo, nome_bot, etc)';

-- Atualizar empresas existentes
UPDATE empresas
SET configuracoes_json = JSON_OBJECT('setup_completo', false)
WHERE configuracoes_json IS NULL;

-- Verificar
SELECT
    id,
    nome,
    slug,
    configuracoes_json
FROM empresas
ORDER BY id DESC;
```

### Opção 2: Via Terminal

```bash
# Windows
mysql -u root -p helixai_db < "D:\Helix\HelixAI\VendeAI\backend\migrations\add_configuracoes_json.sql"

# Ou no terminal MySQL
mysql -u root -p
```

Depois cole:
```sql
USE helixai_db;

ALTER TABLE empresas
ADD COLUMN configuracoes_json JSON NULL;

UPDATE empresas
SET configuracoes_json = JSON_OBJECT('setup_completo', false);
```

---

## ✅ Verificar se Funcionou

Execute:

```sql
DESCRIBE empresas;
```

Deve aparecer a coluna `configuracoes_json` do tipo `json`.

E depois:

```sql
SELECT id, nome, configuracoes_json FROM empresas ORDER BY id DESC LIMIT 3;
```

Deve mostrar:
```
| id | nome | configuracoes_json |
|----|------|--------------------|
| 5  | ...  | {"setup_completo": false} |
| 4  | ...  | {"setup_completo": false} |
```

---

## 🧪 Testar o Setup

### 1. Reiniciar Backend

```bash
# Parar (Ctrl+C) e iniciar novamente
cd D:\Helix\HelixAI\VendeAI\backend
python run.py
```

### 2. Limpar LocalStorage

No navegador (F12):
```javascript
localStorage.clear()
location.reload()
```

### 3. Fazer Login

1. Acesse: `http://localhost:5177`
2. Faça login com o email de teste
3. ✅ **Wizard de setup DEVE aparecer agora!**

---

## 📊 Verificar API de Debug

Acesse:
```
http://localhost:5000/api/empresa/debug-all
```

Agora deve retornar:
```json
{
  "success": true,
  "empresas": [
    {
      "id": 5,
      "nome": "...",
      "configuracoes_json_raw": "{'setup_completo': False}",
      "setup_completo": false
    }
  ]
}
```

---

## 🎯 Próximos Passos

Depois de executar o SQL acima:

1. ✅ Coluna criada
2. ✅ Empresas existentes atualizadas com `setup_completo: false`
3. ✅ Novas empresas serão criadas com essa coluna automaticamente
4. ✅ Setup vai aparecer para todos os novos usuários

---

## 🐛 Se Ainda Não Funcionar

### Debug Console do Navegador

Após fazer login, veja no console (F12):

```
[CRM Cliente] 🔍 Verificando status do setup...
[CRM Cliente] empresa_id: 5
[CRM Cliente] Resposta completa da API: {
  "success": true,
  "setup_completo": false  ← DEVE SER FALSE!
}
[CRM Cliente] ⚠️ Setup não concluído - mostrando wizard...
```

### Debug Terminal Backend

```
[EMPRESA-API] === VERIFICANDO SETUP ===
[EMPRESA-API] Empresa ID: 5
[EMPRESA-API] configuracoes_json raw: {'setup_completo': False}
[EMPRESA-API] Config já é dict: {'setup_completo': False}
[EMPRESA-API] setup_completo extraído: False (tipo: <class 'bool'>)
```

---

## 🎉 Resultado Esperado

Após executar o SQL e fazer login:

1. ✅ Tela de loading aparece
2. ✅ Sistema verifica `setup_completo = false`
3. ✅ Wizard de 5 etapas aparece
4. ✅ Cliente configura nicho, nome, WhatsApp, catálogo
5. ✅ Dashboard personalizado carrega

**Pronto para testar!** 🚀

Execute o SQL acima e me avise se funcionou!
