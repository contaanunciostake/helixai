# 🧪 Como Testar o Wizard de Setup - Guia Rápido

## ⚠️ Problema Identificado

**Sintoma:** Após registrar conta nova e definir senha, o CRM abre direto no dashboard sem mostrar o wizard de setup.

**Causa:** A tabela `empresas` não estava sendo criada com `configuracoes_json = {"setup_completo": false}`.

**Solução:** Corrigido em `tenant_manager.py` (linha 65-73).

---

## 🔧 Passo 1: Corrigir Empresas Existentes

Se você já criou empresas de teste, precisa corrigir o banco de dados:

### Opção A: Via MySQL Workbench / phpMyAdmin

```sql
USE helixai_db;

-- Ver status atual das empresas
SELECT
    id,
    nome,
    slug,
    JSON_EXTRACT(configuracoes_json, '$.setup_completo') as setup_completo
FROM empresas
ORDER BY id DESC;

-- Forçar empresa específica a mostrar setup
UPDATE empresas
SET configuracoes_json = JSON_OBJECT('setup_completo', false)
WHERE id = 5;  -- Substitua pelo ID da sua empresa de teste
```

### Opção B: Executar Script Automático

```bash
# No terminal MySQL
mysql -u root -p helixai_db < D:\Helix\HelixAI\VendeAI\backend\migrations\fix_empresas_sem_setup.sql
```

---

## 🧹 Passo 2: Limpar Dados do Navegador

Para testar com o mesmo email, você precisa limpar o localStorage:

### Chrome/Edge:
1. Abra DevTools (F12)
2. Aba **Application** → **Local Storage**
3. Selecione `http://localhost:5177`
4. Clique direito → **Clear**
5. Ou execute no Console:
```javascript
localStorage.clear()
location.reload()
```

### OU Usar Modo Anônimo:
- Chrome: `Ctrl + Shift + N`
- Edge: `Ctrl + Shift + P`

---

## 🚀 Passo 3: Testar Novo Registro

### 3.1 Iniciar Servidores

```bash
# Terminal 1 - Backend
cd D:\Helix\HelixAI\VendeAI\backend
python run.py

# Terminal 2 - CRM Client
cd D:\Helix\HelixAI\CRM_Client\crm-client-app
npm run dev

# Terminal 3 - Landing Page
cd D:\Helix\HelixAI\AIra_Landing
npm run dev
```

### 3.2 Fazer Nova Compra

1. Acesse: `http://localhost:5174`
2. Clique em "Assinar" em qualquer plano
3. Preencha checkout:
   ```
   Nome: Teste Setup
   Email: testesetup@exemplo.com
   CPF: 12345678900
   Telefone: (11) 99999-9999

   Cartão: 5031 4332 1540 6351
   Validade: 12/25
   CVV: 123
   Titular: APRO
   ```
4. Clique "Confirmar Pagamento"

### 3.3 Verificar Redirecionamento

✅ **Esperado:**
```
URL: http://localhost:5177?email=testesetup@exemplo.com&token=abc123...&from=payment
```

✅ **Tela:** "Pagamento Aprovado! Agora crie sua senha de acesso"

### 3.4 Definir Senha

1. Digite senha forte:
   ```
   Senha: Teste@123
   Confirmar: Teste@123
   ```
2. Clique "Criar Senha e Acessar"

✅ **Esperado:** Loading rápido → Login automático

### 3.5 Verificar Wizard de Setup

✅ **DEVE APARECER:**
- Título: "Configure seu Bot de Vendas"
- Step 1/5: "Escolha seu Nicho"
- Cards: Veículos, Imóveis, Varejo, etc

❌ **NÃO DEVE:**
- Ir direto para dashboard
- Mostrar erro 404
- Ficar em tela branca

---

## 🔍 Passo 4: Debug (Se não funcionar)

### Console do Navegador (F12)

Procure por estas mensagens:

✅ **Esperado:**
```
[CRM Cliente] 🔍 Verificando status do setup...
[CRM Cliente] empresa_id: 5
[CRM Cliente] Resposta completa da API: {
  "success": true,
  "setup_completo": false,  ← DEVE SER FALSE!
  "empresa": {...}
}
[CRM Cliente] data.success: true
[CRM Cliente] data.setup_completo: false
[CRM Cliente] ⚠️ Setup não concluído - mostrando wizard...
```

❌ **Problema:**
```
[CRM Cliente] data.setup_completo: true  ← ERRADO!
[CRM Cliente] ✅ Setup já concluído - indo para dashboard
```

### Verificar no Banco de Dados

```sql
-- Buscar empresa pelo email do usuário
SELECT
    e.id,
    e.nome,
    e.slug,
    e.configuracoes_json,
    JSON_EXTRACT(e.configuracoes_json, '$.setup_completo') as setup_completo,
    u.email
FROM empresas e
JOIN usuarios u ON u.empresa_id = e.id
WHERE u.email = 'testesetup@exemplo.com';
```

✅ **Esperado:**
```
| id | nome | configuracoes_json | setup_completo | email |
|----|------|--------------------|----------------|-------|
| 5  | ...  | {"setup_completo": false} | false | testesetup@... |
```

### Logs do Backend (Terminal)

Procure por:

```
[TenantManager] === CRIANDO EMPRESA ===
[TenantManager] Nome: testesetup - Empresa
[TenantManager] Setor: outros
[TenantManager] Database: tenant_testesetup_empresa
[TenantManager] ✅ Empresa criada (ID: 5)
```

E depois:

```
[EMPRESA-API] Verificando setup da empresa ID: 5
[EMPRESA-API] Configurações JSON: {"setup_completo": false}
[EMPRESA-API] Setup completo: False
```

---

## ✅ Passo 5: Completar o Setup

Se tudo estiver funcionando, complete o wizard:

1. **Step 1 - Nicho:** Clique em "Veículos"
2. **Step 2 - Personalização:**
   ```
   Nome da Empresa: AutoPeças Premium
   Nome do Bot: Lara
   ```
3. **Step 3 - WhatsApp:**
   ```
   Número: 5511999999999
   ```
4. **Step 4 - Catálogo:** Selecione "Começar do zero"
5. **Step 5 - Revisão:** Clique "Finalizar Configuração"

✅ **Esperado:**
- Tela de sucesso com confete
- Aguardar 2 segundos
- Redirecionar para dashboard

### Verificar no Banco

```sql
SELECT
    id,
    nome,
    setor,
    whatsapp_numero,
    JSON_EXTRACT(configuracoes_json, '$.setup_completo') as setup_completo,
    JSON_EXTRACT(configuracoes_json, '$.nome_bot') as nome_bot
FROM empresas
WHERE id = 5;
```

✅ **Esperado:**
```
| id | nome | setor | whatsapp_numero | setup_completo | nome_bot |
|----|------|-------|-----------------|----------------|----------|
| 5  | AutoPeças Premium | veiculos | 5511999999999 | true | "Lara" |
```

---

## 🔄 Passo 6: Testar Login Subsequente

1. Faça logout
2. Acesse: `http://localhost:5177`
3. Faça login:
   ```
   Email: testesetup@exemplo.com
   Senha: Teste@123
   ```

✅ **Esperado:**
- Setup NÃO deve aparecer
- Ir direto para dashboard
- Dashboard personalizado com nicho "Veículos"

### Console Esperado:

```
[CRM Cliente] 🔍 Verificando status do setup...
[CRM Cliente] empresa_id: 5
[CRM Cliente] data.setup_completo: true  ← AGORA SIM É TRUE!
[CRM Cliente] ✅ Setup já concluído - indo para dashboard
```

---

## 🐛 Troubleshooting Comum

### Problema 1: setup_completo sempre true

**Causa:** Empresa foi criada antes da correção

**Solução:**
```sql
UPDATE empresas
SET configuracoes_json = JSON_OBJECT('setup_completo', false)
WHERE id = 5;
```

### Problema 2: empresa_id null

**Causa:** Usuário não foi associado à empresa

**Verificar:**
```sql
SELECT id, email, empresa_id FROM usuarios WHERE email = 'testesetup@exemplo.com';
```

**Solução:**
```sql
UPDATE usuarios
SET empresa_id = 5  -- ID da empresa
WHERE email = 'testesetup@exemplo.com';
```

### Problema 3: API retorna 404

**Causa:** Backend não está rodando ou blueprint não registrado

**Verificar logs do backend:**
```
[OK] Blueprint 'empresa_api' registrado em /api/empresa/*
```

**Testar API manualmente:**
```bash
curl http://localhost:5000/api/empresa/check-setup/5
```

### Problema 4: Wizard aparece mas não salva

**Causa:** Token JWT inválido ou empresa_id errado

**Console do navegador:**
```
POST http://localhost:5000/api/empresa/setup
Status: 400 Bad Request
Response: {"success": false, "error": "empresa_id obrigatório"}
```

**Verificar localStorage:**
```javascript
JSON.parse(localStorage.getItem('crm_user'))
// Deve ter: {empresa_id: 5, token: "..."}
```

---

## 📊 Checklist Final

- [ ] Backend rodando sem erros
- [ ] CRM rodando sem erros
- [ ] Nova compra cria empresa com `setup_completo: false`
- [ ] Redirecionamento para CRM funciona
- [ ] Tela de definir senha aparece
- [ ] Login automático após criar senha
- [ ] Wizard de setup aparece automaticamente
- [ ] Console mostra: `data.setup_completo: false`
- [ ] Wizard completa e salva no banco
- [ ] Dashboard carrega após setup
- [ ] Próximo login pula setup

---

## 🎉 Sucesso!

Se todos os passos funcionaram, o sistema está pronto! 🚀

Agora cada novo cliente terá uma experiência fluida:
1. Paga → Redireciona para CRM
2. Define senha → Login automático
3. Configura nicho → Dashboard personalizado
4. Usa CRM focado no seu negócio

**Qualquer problema, verifique os logs do console do navegador e do backend!**
