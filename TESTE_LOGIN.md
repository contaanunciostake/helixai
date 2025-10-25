# 🧪 Guia de Teste - Login Unificado na Landing Page

## 📋 Mudanças Implementadas

### 1. **Landing Page - Login via Popup** ✅
- **Admin** e **Cliente** agora fazem login APENAS pelo popup da landing page
- Dados são salvos no `localStorage` ANTES do redirecionamento
- Delay de 200ms garante sincronização do localStorage

### 2. **CRM Admin - Autenticação Otimizada** ✅
- `AuthContext` lê localStorage de forma **SÍNCRONA** ao inicializar
- Sem race conditions - dados são detectados imediatamente
- Redirecionamento direto para `/dashboard` após login

### 3. **CRM Cliente - Autenticação Otimizada** ✅
- **NOVA CORREÇÃO**: Leitura **SÍNCRONA** do localStorage ao inicializar
- Detecta login da landing page **IMEDIATAMENTE**
- Listener para sincronização entre abas
- Vai direto para o Dashboard (sem mostrar tela de login)

### 4. **Logs de Debug** ✅
- Console mostra todo o fluxo de autenticação
- Fácil identificar problemas de sincronização

---

## 🚀 Como Testar

### **Passo 1: Iniciar os Servidores**

```bash
# Terminal 1 - Landing Page
cd AIra_Landing
npm run dev
# Deve abrir em http://localhost:5174

# Terminal 2 - CRM Admin
cd CRM_Admin/crm-admin-app
npm run dev
# Deve abrir em http://localhost:5175

# Terminal 3 - CRM Cliente
cd CRM_Client/crm-client-app
npm run dev
# Deve abrir em http://localhost:5177
```

---

### **Passo 2: Testar Login como ADMIN**

1. Abra o navegador em `http://localhost:5174` (Landing Page)
2. Clique no botão **"Login Admin"** (canto superior direito)
3. No popup, digite:
   - Email: `admin@vendeai.com`
   - Senha: `admin123`
4. Clique em **"Entrar"**

**✅ RESULTADO ESPERADO:**
- Modal fecha
- Navegador redireciona para `http://localhost:5175/dashboard`
- **Dashboard do Admin abre DIRETAMENTE** (sem página de login)
- No console do navegador, você verá:
  ```
  [Landing Page] Salvando dados do admin: {...}
  [Landing Page] Verificação - Dados salvos: {...}
  [Landing Page] Redirecionando para CRM Admin...
  [AuthContext] ✅ Usuário já autenticado no carregamento: admin@vendeai.com
  [ProtectedRoute] ✅ Autenticado - Renderizando página protegida
  ```

---

### **Passo 3: Testar Login como CLIENTE**

1. Volte para `http://localhost:5174` (Landing Page)
2. Clique no botão **"Login Cliente"** (canto superior direito)
3. No popup, digite:
   - Email: `demo@vendeai.com`
   - Senha: `demo123`
4. Clique em **"Entrar"**

**✅ RESULTADO ESPERADO:**
- Modal fecha
- Navegador redireciona para `http://localhost:5177`
- **CRM Cliente detecta autenticação e vai para o Dashboard**
- No console do navegador:
  ```
  [Landing Page] Salvando dados do cliente: {...}
  [Landing Page] Verificação - Dados salvos: {...}
  [Landing Page] Redirecionando para CRM Cliente...
  [CRM] ✅ Usuário já logado: demo@vendeai.com
  ```

---

### **Passo 4: Testar LOGOUT do Admin**

1. No Dashboard do Admin, clique no **perfil do usuário** (canto superior direito)
2. Clique em **"Sair"** (última opção, em vermelho)

**✅ RESULTADO ESPERADO:**
- Navegador redireciona para `http://localhost:5174` (Landing Page)
- localStorage limpo
- Ao tentar acessar `http://localhost:5175`, é redirecionado para `/login`

---

## 🔍 Logs no Console (para Debug)

### **Durante Login na Landing Page:**
```javascript
[Landing Page] Salvando dados do admin: {nome: "Pauline Seitz", email: "admin@vendeai.com", ...}
[Landing Page] Verificação - Dados salvos: "{"nome":"Pauline Seitz",...}"
[Landing Page] Redirecionando para CRM Admin...
```

### **Ao Carregar CRM Admin:**
```javascript
[AuthContext] ✅ Usuário já autenticado no carregamento: admin@vendeai.com
[ProtectedRoute] Estado: {isAuthenticated: true, loading: false}
[ProtectedRoute] ✅ Autenticado - Renderizando página protegida
```

### **Ao Carregar CRM Cliente:**
```javascript
[CRM] ✅ Usuário já autenticado no carregamento: demo@vendeai.com
```

### **Ao fazer Logout:**
```javascript
[CRM Admin] 👋 Logout realizado - Redirecionando para Landing Page
// ou
[CRM] 👋 Logout realizado - Redirecionando para Landing Page
```

---

## ❌ Problemas Comuns e Soluções

### **Problema 1: Ainda redireciona para /login**
**Causa:** localStorage pode estar bloqueado ou não sincronizou
**Solução:**
1. Abra DevTools (F12) → Console
2. Execute: `localStorage.getItem('admin_user')`
3. Se retornar `null`, limpe o cache: `localStorage.clear()`
4. Tente fazer login novamente

### **Problema 2: Modal não fecha após login**
**Causa:** Erro no código ou timeout não executou
**Solução:**
1. Verifique o console por erros
2. Aumente o delay em `AIra_Landing/src/App.jsx:133` de `200` para `500`

### **Problema 3: Dados não aparecem no perfil do admin**
**Causa:** AuthContext não detectou os dados
**Solução:**
1. Verifique se o nome está correto em `AIra_Landing/src/App.jsx:114`
2. Certifique-se que o CRM Admin está rodando na porta **5175**

---

## 🎯 Arquivos Modificados

1. `AIra_Landing/src/App.jsx` - Login com salvamento no localStorage + logs de debug
2. `CRM_Admin/crm-admin-app/src/contexts/AuthContext.jsx` - Leitura síncrona do localStorage
3. `CRM_Admin/crm-admin-app/src/components/ProtectedRoute.jsx` - Logs de debug
4. **`CRM_Client/crm-client-app/src/App.jsx` - Leitura SÍNCRONA do localStorage + listener multi-tab**
5. `AIra_Landing/vite.config.js` - Porta 5174
6. `CRM_Admin/crm-admin-app/vite.config.js` - Porta 5175

---

## ✅ Checklist de Validação

- [ ] Landing Page abre em http://localhost:5174
- [ ] CRM Admin abre em http://localhost:5175
- [ ] CRM Cliente abre em http://localhost:5177
- [ ] Login Admin abre popup (não redireciona direto)
- [ ] Login Cliente abre popup (não redireciona direto)
- [ ] Após login Admin, vai direto para `/dashboard` (sem /login)
- [ ] Após login Cliente, vai direto para o Dashboard
- [ ] Logout do Admin redireciona para Landing Page
- [ ] Logout do Cliente redireciona para Landing Page
- [ ] Console mostra logs de debug
- [ ] Perfil do Admin mostra nome e função corretos

---

Se tudo funcionar conforme esperado, o sistema está 100% operacional! 🎉
