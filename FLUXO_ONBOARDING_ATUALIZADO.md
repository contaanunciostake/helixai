# 🎯 Fluxo de Onboarding Atualizado - HelixAI

## 📋 Resumo das Mudanças

**ANTES:** Cliente recebia email para definir senha → Clicava no link → Redirecionava para landing → Fazia login

**AGORA:** Cliente é redirecionado direto para o CRM → Define senha na mesma tela → Setup automático do nicho → Dashboard personalizado

---

## 🛣️ Fluxo Completo Detalhado

### Passo 1: Compra e Pagamento

```
1. Cliente acessa: http://localhost:5174
2. Clica em "Assinar" em qualquer plano
3. Preenche formulário de checkout:
   - Nome completo
   - Email
   - CPF
   - Telefone
   - Dados do cartão (Mercado Pago Brick)
4. Clica "Confirmar Pagamento"
```

**Backend:**
- Processa pagamento via Mercado Pago SDK
- Status: `approved` → Continua
- Chama `_criar_usuario_pendente()`

### Passo 2: Criação Automática (Backend)

```python
# mercadopago_service.py → _criar_usuario_pendente()

1. Gera token de ativação (válido 24h)
   token = secrets.token_urlsafe(32)

2. Cria empresa via TenantManager:
   - nome: "{email_usuario} - Empresa"
   - slug: "joao-empresa"
   - database_name: "tenant_joao_empresa"
   - setor: "outros" (padrão)

3. Cria banco de dados dedicado:
   CREATE DATABASE tenant_joao_empresa;

4. Cria estrutura de tabelas:
   - leads
   - conversas
   - mensagens
   - produtos_catalogo
   - configuracoes_bot

5. Cria usuário no helixai_db.usuarios:
   INSERT INTO usuarios (
     email, nome, empresa_id, plano_id,
     token_definir_senha, token_expira_em,
     ativo, senha_hash
   ) VALUES (
     'joao@email.com', 'João', 5, 2,
     'abc123...', NOW() + INTERVAL 24 HOUR,
     0, NULL
   )
```

**Retorno para Frontend:**
```json
{
  "success": true,
  "status": "approved",
  "payment_id": "123456789",
  "token_definir_senha": "abc123xyz...",
  "email": "joao@email.com",
  "message": "Pagamento aprovado com sucesso!"
}
```

### Passo 3: Redirecionamento (Checkout)

```javascript
// checkout.html → handlePayment()

if (result.success && result.status === 'approved') {
  showAlert('Pagamento aprovado! Redirecionando...', 'success');

  const token = result.token_definir_senha || '';

  setTimeout(() => {
    window.location.href = `http://localhost:5177?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}&from=payment`;
  }, 2000);
}
```

**URL Final:**
```
http://localhost:5177?email=joao@email.com&token=abc123xyz...&from=payment
```

### Passo 4: Definir Senha (CRM)

```javascript
// Login.jsx → useEffect()

// Detectar parâmetros na URL
const urlParams = new URLSearchParams(window.location.search);
const emailParam = urlParams.get('email');        // joao@email.com
const tokenParam = urlParams.get('token');        // abc123xyz...
const fromPayment = urlParams.get('from') === 'payment';

if (emailParam && tokenParam && fromPayment) {
  setIsFirstTime(true);  // Mostrar tela de "Criar Senha"
  setEmail(emailParam);
  setToken(tokenParam);
}
```

**Tela Exibida:**
- Título: "Pagamento Aprovado!"
- Subtítulo: "Agora crie sua senha de acesso"
- Campos:
  - Email (readonly)
  - Nova Senha (com indicador de força)
  - Confirmar Senha
- Requisitos:
  - Mínimo 8 caracteres
  - 1 letra maiúscula
  - 1 letra minúscula
  - 1 número
  - 1 caractere especial

### Passo 5: Validação e Ativação (Backend)

```javascript
// Login.jsx → handleCreatePassword()

// Enviar para API
POST http://localhost:5000/api/auth/definir-senha
{
  "email": "joao@email.com",
  "senha": "MinhaSenh@123",
  "confirmar_senha": "MinhaSenh@123",
  "token": "abc123xyz..."
}
```

**Backend:**
```python
# auth_service.py → definir_senha_usuario()

1. Buscar usuário:
   SELECT * FROM usuarios
   WHERE email = %s AND token_definir_senha = %s

2. Validar token não expirado:
   IF token_expira_em < NOW() THEN
     RETURN {success: false, message: 'Token expirado'}

3. Gerar hash da senha:
   senha_hash = bcrypt.hashpw(senha.encode('utf-8'), bcrypt.gensalt())

4. Atualizar usuário:
   UPDATE usuarios SET
     senha_hash = %s,
     ativo = 1,
     senha_definida_em = NOW(),
     token_definir_senha = NULL,
     token_expira_em = NULL
   WHERE id = %s

5. Retornar sucesso:
   RETURN {success: true, message: 'Senha definida com sucesso!'}
```

### Passo 6: Login Automático

```javascript
// Login.jsx → handleCreatePassword()

if (result.success) {
  // Fazer login automático
  const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'joao@email.com',
      senha: 'MinhaSenh@123'
    })
  });

  const loginResult = await loginResponse.json();

  if (loginResult.success) {
    // Salvar no localStorage
    const userData = {
      ...loginResult.usuario,
      token: loginResult.token,
      loginTime: new Date().toISOString()
    };

    localStorage.setItem('crm_user', JSON.stringify(userData));
    localStorage.setItem('crm_token', loginResult.token);
    localStorage.setItem('crm_isLoggedIn', 'true');

    // Chamar onLogin → App.jsx assume controle
    onLogin(userData);
  }
}
```

### Passo 7: Verificação de Setup (App.jsx)

```javascript
// App.jsx → useEffect()

useEffect(() => {
  const checkSetup = async () => {
    if (!isLoggedIn || !user || !user.empresa_id) {
      return;
    }

    // Verificar se empresa já completou setup
    const response = await fetch(
      `http://localhost:5000/api/empresa/check-setup/${user.empresa_id}`
    );
    const data = await response.json();

    if (data.success && !data.setup_completo) {
      setNeedsSetup(true);  // Mostrar wizard de setup
    } else {
      setNeedsSetup(false); // Ir direto ao dashboard
    }
  };

  checkSetup();
}, [isLoggedIn, user]);
```

**Backend:**
```python
# empresa_api.py → check_setup()

SELECT * FROM empresas WHERE id = %s

empresa = cursor.fetchone()

# Parsear configuracoes_json
configuracoes = json.loads(empresa['configuracoes_json'])
setup_completo = configuracoes.get('setup_completo', False)

RETURN {
  success: true,
  setup_completo: setup_completo,  # false → precisa setup
  empresa: {...}
}
```

### Passo 8: Wizard de Setup (5 Etapas)

**Se `setup_completo = false`:**

```javascript
// App.jsx
if (needsSetup) {
  return <Setup onComplete={() => setNeedsSetup(false)} />;
}
```

**Setup.jsx - Etapas:**

#### Etapa 1: Escolha do Nicho
- Veículos ✅ (Disponível)
- Imóveis 🔜 (Em breve)
- Varejo, Serviços, Outros 🔜

#### Etapa 2: Personalização
- Nome da Empresa: "AutoPeças Premium"
- Nome do Bot: "Lara"

#### Etapa 3: WhatsApp Business
- Número: +55 11 99999-9999
- Checkbox: "Conectar agora" (futuramente QR Code)

#### Etapa 4: Catálogo
- Opção 1: Começar do zero
- Opção 2: Importar catálogo (Excel/CSV)

#### Etapa 5: Revisão
- Exibir todos os dados
- Botão: "Finalizar Configuração"

### Passo 9: Salvar Setup (Backend)

```javascript
// Setup.jsx → handleFinishSetup()

POST http://localhost:5000/api/empresa/setup
{
  "empresa_id": 5,
  "nicho": "veiculos",
  "nome_empresa": "AutoPeças Premium",
  "nome_bot": "Lara",
  "numero_whatsapp": "5511999999999",
  "tem_catalogo": false
}
```

**Backend:**
```python
# empresa_api.py → setup_empresa()

UPDATE empresas
SET
  nome = 'AutoPeças Premium',
  setor = 'veiculos',
  whatsapp_numero = '5511999999999',
  configuracoes_json = JSON_OBJECT(
    'nome_bot', 'Lara',
    'tem_catalogo', false,
    'setup_completo', true,  # ← IMPORTANTE!
    'setup_em', NOW()
  ),
  atualizado_em = NOW()
WHERE id = 5
```

**Retorno:**
```json
{
  "success": true,
  "message": "Empresa configurada com sucesso!",
  "empresa": {
    "id": 5,
    "nome": "AutoPeças Premium",
    "nicho": "veiculos",
    "whatsapp": "5511999999999"
  }
}
```

### Passo 10: Dashboard Personalizado

```javascript
// Setup.jsx → handleFinishSetup()

if (data.success) {
  setSetupComplete(true);  // Mostrar tela de sucesso

  setTimeout(() => {
    onComplete();  // Chamar App.jsx → setNeedsSetup(false)
  }, 2000);
}
```

**App.jsx:**
```javascript
// needsSetup agora é false
// Renderiza dashboard normal

return (
  <ClientLayout user={user}>
    {renderPage()}
  </ClientLayout>
);
```

**Dashboard Carregado:**
- Nicho: Veículos
- Nome do Bot: "Lara" (exibido no chat)
- Interface focada em vendas de veículos
- Dados isolados do `tenant_autopecas_premium`

---

## 🔄 Fluxo de Login Subsequente

**Usuário que já completou setup:**

```
1. Cliente acessa: http://localhost:5177
2. Vê tela de login normal
3. Digita email e senha
4. POST /api/auth/login
5. App.jsx verifica setup → setup_completo = true
6. Vai direto ao Dashboard (pula Setup)
```

---

## 📊 Comparação: Antes vs Agora

| Aspecto | ANTES | AGORA |
|---------|-------|-------|
| **Definir senha** | Email com link | Direto no CRM após pagamento |
| **Etapas extras** | Clicar no email, voltar para landing | Zero - redirecionamento direto |
| **Configuração inicial** | Não existia | Wizard de 5 etapas |
| **Personalização** | Não tinha | Nicho, nome da empresa, bot customizado |
| **UX** | 4-5 cliques extras | 2 cliques (definir senha → setup) |
| **Tempo estimado** | 5-10 minutos | 2-3 minutos |

---

## ✅ Checklist de Validação

### Teste 1: Pagamento e Criação
- [ ] Cliente preenche checkout
- [ ] Pagamento é aprovado
- [ ] Cliente é redirecionado para CRM com `?email=...&token=...&from=payment`
- [ ] Tela "Definir Senha" aparece automaticamente
- [ ] Email vem preenchido (readonly)

### Teste 2: Definir Senha
- [ ] Cliente digita senha forte
- [ ] Indicador de força mostra "Muito forte"
- [ ] Confirmação de senha funciona
- [ ] Ao clicar "Criar Senha", backend valida token
- [ ] Usuário é ativado (ativo = 1)
- [ ] Login automático funciona

### Teste 3: Setup Automático
- [ ] Após login, sistema verifica setup
- [ ] `setup_completo = false` → Mostra wizard
- [ ] Cliente escolhe nicho (ex: Veículos)
- [ ] Preenche nome da empresa e bot
- [ ] Informa WhatsApp
- [ ] Escolhe opção de catálogo
- [ ] Revisa dados na etapa 5
- [ ] Clica "Finalizar Configuração"
- [ ] Backend salva `setup_completo = true`
- [ ] Tela de sucesso aparece (2 segundos)
- [ ] Redireciona para dashboard

### Teste 4: Dashboard Personalizado
- [ ] Dashboard carrega com nicho correto
- [ ] Nome do bot aparece no chat
- [ ] Dados são filtrados por empresa_id
- [ ] Interface focada no nicho escolhido

### Teste 5: Login Subsequente
- [ ] Cliente faz logout
- [ ] Faz login novamente
- [ ] Sistema verifica setup → `setup_completo = true`
- [ ] Pula wizard
- [ ] Vai direto ao dashboard

---

## 🐛 Troubleshooting

### Erro: "Token inválido ou expirado"
**Causa:** Token expirou (24h) ou já foi usado
**Solução:** Gerar novo token manualmente:
```sql
UPDATE usuarios
SET token_definir_senha = 'novo_token_aqui',
    token_expira_em = DATE_ADD(NOW(), INTERVAL 24 HOUR)
WHERE email = 'joao@email.com';
```

### Erro: "Setup não aparece após definir senha"
**Causa:** `empresa_id` null ou `configuracoes_json` sem `setup_completo`
**Solução:**
```sql
-- Verificar empresa_id
SELECT email, empresa_id FROM usuarios WHERE email = 'joao@email.com';

-- Se empresa_id for NULL, associar manualmente:
UPDATE usuarios SET empresa_id = 5 WHERE email = 'joao@email.com';

-- Verificar setup_completo
SELECT configuracoes_json FROM empresas WHERE id = 5;

-- Se não existir, resetar:
UPDATE empresas
SET configuracoes_json = JSON_OBJECT('setup_completo', false)
WHERE id = 5;
```

### Erro: "Dashboard carrega antes do setup"
**Causa:** `checkingSetup` é false antes da verificação terminar
**Solução:** Verificar console do navegador - deve mostrar:
```
[CRM Cliente] 🔍 Verificando status do setup...
[CRM Cliente] Setup status: {success: true, setup_completo: false}
[CRM Cliente] ⚠️ Setup não concluído - redirecionando...
```

---

## 🎓 Arquivos Envolvidos

### Frontend

1. **`checkout.html`**
   - Linha 1015-1019: Redirecionamento com token

2. **`Login.jsx`**
   - Linha 23-34: Detecta parâmetros URL
   - Linha 76-174: `handleCreatePassword()`
   - Linha 214-490: Tela de criar senha

3. **`App.jsx`**
   - Linha 5: Import Setup
   - Linha 98-99: Estados `needsSetup` e `checkingSetup`
   - Linha 108-138: useEffect para verificar setup
   - Linha 1829-1843: Renderização condicional (Setup vs Dashboard)

4. **`Setup.jsx`**
   - Linha 9: Aceita prop `onComplete`
   - Linha 107-151: `handleFinishSetup()`
   - Linha 137-141: Chama `onComplete()` após sucesso

### Backend

5. **`mercadopago_service.py`**
   - Linha 481-484: Cria usuário pendente
   - Linha 490: Retorna `token_definir_senha`
   - Linha 589-691: `_criar_usuario_pendente()`

6. **`auth_service.py`**
   - Linha 188-261: `definir_senha_usuario()`
   - Linha 263-326: `fazer_login()`

7. **`empresa_api.py`**
   - Linha 26-139: `setup_empresa()` (POST /api/empresa/setup)
   - Linha 141-205: `check_setup()` (GET /api/empresa/check-setup/<empresa_id>)

---

## 🎉 Resultado Final

Agora o cliente tem uma experiência **fluida e sem fricção**:

1. ✅ Paga → Redireciona direto para CRM
2. ✅ Define senha na mesma tela
3. ✅ Configura nicho e bot em 2 minutos
4. ✅ Dashboard personalizado imediatamente
5. ✅ Próximos logins vão direto ao painel

**Conversão otimizada:** Menos etapas = Mais clientes ativados! 🚀
