# 🎯 Sistema de Onboarding/Setup - Guia Completo

## ✅ O que foi implementado

### 1. Página de Setup (`CRM_Client/crm-client-app/src/pages/Setup.jsx`)

Wizard multi-step com 5 etapas:

1. **Escolha do Nicho**
   - Veículos ✅ (VendeAI - Disponível)
   - Imóveis 🔜 (AIra_Imob - Em breve)
   - Varejo, Serviços, Outros 🔜 (Em breve)

2. **Personalização**
   - Nome da Empresa
   - Nome do Bot

3. **WhatsApp**
   - Número do WhatsApp Business
   - Preparação para QR Code

4. **Catálogo**
   - Opção: Começar do zero
   - Opção: Importar catálogo (Excel/CSV)

5. **Revisão**
   - Confirmação de todas as configurações
   - Botão "Finalizar"

### 2. API de Configuração (`VendeAI/backend/routes/empresa_api.py`)

Endpoints criados:

- `POST /api/empresa/setup` - Salvar configurações iniciais
- `GET /api/empresa/check-setup/<empresa_id>` - Verificar se setup foi concluído

---

## 🚀 Como Integrar no CRM Client

### Opção 1: Standalone (Página Separada) - **RECOMENDADO**

O arquivo `Setup.jsx` já está pronto para ser usado com React Router.

#### Passo 1: Instalar React Router (se ainda não tiver)

```bash
cd D:\Helix\HelixAI\CRM_Client\crm-client-app
npm install react-router-dom
```

#### Passo 2: Criar main.jsx com rotas

```javascript
// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import App from './App.jsx'
import Setup from './pages/Setup.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/setup" element={<Setup />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
```

#### Passo 3: Modificar Login para redirecionar ao setup

```javascript
// No componente Login.jsx, após login bem-sucedido:

const handleLogin = async () => {
  // ... login code ...

  if (loginSuccess) {
    // Verificar se precisa fazer setup
    const response = await fetch(
      `http://localhost:5000/api/empresa/check-setup/${userData.empresa_id}`
    );
    const data = await response.json();

    if (!data.setup_completo) {
      // Redirecionar para setup
      window.location.href = '/setup';
    } else {
      // Redirecionar para dashboard
      window.location.href = '/dashboard';
    }
  }
};
```

---

### Opção 2: Integrado (Modal no App.jsx)

Se preferir não usar React Router, pode mostrar o Setup como modal:

```javascript
// No App.jsx

import Setup from './pages/Setup'

function App() {
  const [needsSetup, setNeedsSetup] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkSetup = async () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        setUser(userData);

        // Verificar se precisa setup
        const response = await fetch(
          `http://localhost:5000/api/empresa/check-setup/${userData.empresa_id}`
        );
        const data = await response.json();

        if (!data.setup_completo) {
          setNeedsSetup(true);
        }
      }
    };

    checkSetup();
  }, []);

  // Se precisa setup, mostrar só o Setup
  if (needsSetup) {
    return <Setup onComplete={() => setNeedsSetup(false)} />;
  }

  // Caso contrário, mostrar CRM normal
  return (
    // ... resto do CRM ...
  );
}
```

---

## 📝 Fluxo Completo do Usuário

```
1. Cliente compra plano
   ↓
2. Sistema cria empresa (via TenantManager)
   - Cria empresa em helixai_db.empresas
   - setup_completo = false (padrão)
   ↓
3. Cliente recebe email para definir senha
   ↓
4. Cliente define senha
   ↓
5. Cliente faz login
   ↓
6. Sistema verifica: GET /api/empresa/check-setup/{empresa_id}
   ↓
7. Se setup_completo = false:
   - Redireciona para /setup
   - Cliente preenche wizard (5 etapas)
   - POST /api/empresa/setup
   - Atualiza empresa (nome, nicho, WhatsApp, etc)
   - setup_completo = true
   ↓
8. Redireciona para Dashboard
   ↓
9. Próximos logins vão direto ao Dashboard
```

---

## 🎨 Customizações Disponíveis

### Adicionar Novo Nicho

Edite `Setup.jsx`:

```javascript
const nichos = [
  // ... existentes ...
  {
    id: 'autopecas',
    nome: 'Auto Peças',
    descricao: 'Vendas de peças automotivas',
    icon: Wrench,
    cor: 'from-orange-500 to-red-500',
    disponivel: true,  // ← Mudar para true quando pronto
    exemploBot: 'AutoBot'
  }
];
```

### Adicionar Nova Etapa

```javascript
// No Setup.jsx, aumentar totalSteps
const totalSteps = 6; // Era 5

// Adicionar novo step
{currentStep === 6 && (
  <motion.div key="step6">
    {/* Seu conteúdo aqui */}
  </motion.div>
)}
```

### Personalizar Cores/Tema

```javascript
// Gradientes disponíveis:
from-blue-500 to-cyan-500      // Azul
from-green-500 to-emerald-500  // Verde
from-purple-500 to-pink-500    // Roxo
from-orange-500 to-red-500     // Laranja
from-yellow-500 to-amber-500   // Amarelo
```

---

## 🔧 Configurações Salvas

Quando o cliente finaliza o setup, as seguintes informações são salvas:

```sql
-- Tabela: empresas
UPDATE empresas SET
  nome = 'AutoPeças Premium',              -- Nome da empresa
  setor = 'veiculos',                      -- Nicho escolhido
  whatsapp_numero = '5511999999999',       -- WhatsApp Business
  configuracoes_json = JSON_OBJECT(
    'nome_bot', 'Lara',                    -- Nome do bot
    'tem_catalogo', false,                 -- Tem catálogo?
    'setup_completo', true,                -- Setup concluído ✅
    'setup_em', NOW()                      -- Data do setup
  )
WHERE id = 1;
```

---

## 🧪 Testando o Sistema

### Teste 1: Primeira Vez (Sem Setup)

1. Criar novo usuário via checkout
2. Fazer login
3. ✅ Deve aparecer a página de Setup
4. Preencher todas as 5 etapas
5. Clicar em "Finalizar Configuração"
6. ✅ Deve salvar e redirecionar ao Dashboard

### Teste 2: Segunda Vez (Com Setup)

1. Fazer logout
2. Fazer login novamente
3. ✅ Deve ir direto ao Dashboard (pula Setup)

### Teste 3: Verificar no Banco

```sql
-- Ver empresas e seu status de setup
SELECT
  id,
  nome,
  setor,
  whatsapp_numero,
  configuracoes_json
FROM helixai_db.empresas;

-- Resultado esperado:
-- configuracoes_json: {"nome_bot": "Lara", "setup_completo": true, ...}
```

---

## 📊 Próximos Passos (Opcional)

### 1. QR Code do WhatsApp

Após o setup, mostrar QR Code para conectar:

```javascript
// No Dashboard, verificar se WhatsApp está conectado
if (empresaData.whatsapp_conectado === false) {
  // Mostrar modal com QR Code
  <QRCodeModal />
}
```

### 2. Upload de Catálogo

Se usuário escolheu "Importar catálogo":

```javascript
// Criar página/modal para upload
<CatalogoUpload empresaId={empresa_id} />
```

### 3. Customização do Bot

Permitir editar:
- Prompt personalizado
- Tom de voz (formal/informal)
- Horário de atendimento

### 4. Preview do Bot

Mostrar chat preview durante o setup:

```javascript
// Exemplo de mensagem do bot
"Olá! Eu sou a {nome_bot} da {nome_empresa}!"
```

---

## 🎉 Resultado Final

Agora você tem:

✅ Wizard de onboarding completo
✅ 5 etapas de configuração
✅ Validação em cada passo
✅ Animações suaves
✅ Design moderno (Tailwind + Framer Motion)
✅ API para salvar configurações
✅ Verificação automática de setup
✅ Integração com sistema multi-tenant

**Cliente pode configurar seu bot em menos de 2 minutos!** 🚀

---

## 📚 Arquivos Relacionados

- `CRM_Client/crm-client-app/src/pages/Setup.jsx` - Página de setup
- `VendeAI/backend/routes/empresa_api.py` - API de configuração
- `VendeAI/backend/__init__.py` - Registro do blueprint
- `MULTITENANT_COMPLETO.md` - Documentação do sistema multi-tenant
- `ARQUITETURA_MULTITENANT.md` - Arquitetura detalhada

---

## ❓ FAQ

**P: O que acontece se o cliente fechar o navegador no meio do setup?**
R: Os dados não são salvos até clicar em "Finalizar". Na próxima vez que fizer login, verá o setup novamente desde o início.

**P: Posso pular etapas do setup?**
R: Não. Cada etapa valida os dados antes de permitir avançar.

**P: Como editar as configurações depois?**
R: Criar uma página de "Configurações" no dashboard onde o cliente pode editar tudo.

**P: O que acontece se escolher um nicho indisponível?**
R: Os nichos indisponíveis estão desabilitados (opacity-50, cursor-not-allowed) e mostram badge "Em breve".

**P: Como saber qual bot carregar baseado no nicho?**
R: No backend, ao processar mensagens WhatsApp:

```python
if empresa.setor == 'veiculos':
    bot = VendeAI()
elif empresa.setor == 'imoveis':
    bot = AIraImob()
# etc...
```

---

Qualquer dúvida, consulte a documentação ou os comentários no código! 🎯
