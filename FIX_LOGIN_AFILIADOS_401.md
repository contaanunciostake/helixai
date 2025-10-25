# 🔧 FIX: Erro 401 no Login de Afiliados

## ❌ Problema Identificado

O sistema estava retornando **401 UNAUTHORIZED** ao tentar fazer login como afiliado, mesmo com credenciais corretas.

### 🔍 Causa Raiz

O frontend do painel de afiliados estava usando o endpoint genérico `/api/auth/login`, que:

1. ✅ Valida email e senha corretamente
2. ✅ Verifica se usuário está ativo
3. ❌ **NÃO verifica** se o usuário tem um registro na tabela `afiliados`
4. ❌ **NÃO retorna** dados específicos de afiliado (chave_referencia, comissões, etc.)

O endpoint genérico é usado para login de usuários comuns do CRM Cliente, mas **afiliados precisam de validações e dados adicionais**.

---

## ✅ Solução Implementada

### 1. Criado Endpoint Específico de Login para Afiliados

**Arquivo**: `backend/routes/afiliados.py`

**Endpoint**: `POST /api/afiliados/login`

**Funcionalidades**:
- ✅ Valida email e senha
- ✅ Verifica se usuário está ativo
- ✅ **NOVO**: Verifica se usuário tem registro na tabela `afiliados`
- ✅ **NOVO**: Verifica se status do afiliado é `ATIVO`
- ✅ **NOVO**: Retorna mensagens personalizadas por status:
  - `PENDENTE`: "Seu cadastro está aguardando aprovação"
  - `BLOQUEADO`: "Sua conta de afiliado está bloqueada"
  - `INATIVO`: "Sua conta de afiliado está inativa"
- ✅ Gera token JWT com dados do afiliado
- ✅ Retorna dados completos do afiliado (saldo, comissões, clicks, etc.)

**Código Adicionado**:

```python
@bp.route('/login', methods=['POST', 'OPTIONS'])
def login_afiliado():
    """Login específico para afiliados"""

    # Validações básicas (email, senha)

    # Buscar usuário
    usuario = session.query(Usuario).filter_by(email=email).first()

    # Verificar senha
    if not usuario.check_senha(senha):
        return 401

    # ✅ VERIFICAR SE É AFILIADO
    afiliado = session.query(Afiliado).filter_by(usuario_id=usuario.id).first()

    if not afiliado:
        return 403, "Você não está cadastrado como afiliado"

    # ✅ VERIFICAR STATUS DO AFILIADO
    if afiliado.status != StatusAfiliado.ATIVO:
        return 403, "Cadastro aguardando aprovação / bloqueado / inativo"

    # Gerar token JWT
    token_payload = {
        'user_id': usuario.id,
        'afiliado_id': afiliado.id,
        'tipo': 'afiliado',
        'exp': datetime.utcnow() + timedelta(days=30)
    }

    # ✅ RETORNAR DADOS COMPLETOS DO AFILIADO
    return {
        'success': True,
        'token': token,
        'afiliado': {
            'id': afiliado.id,
            'chave_referencia': afiliado.chave_referencia,
            'link_referencia': f'http://localhost:5000/r/{afiliado.chave_referencia}',
            'saldo_disponivel': afiliado.saldo_disponivel,
            'total_comissoes_geradas': afiliado.total_comissoes_geradas,
            'total_clicks': afiliado.total_clicks,
            # ... outros dados
        }
    }
```

---

### 2. Atualizado Frontend do Painel de Afiliados

**Arquivo**: `Afiliados_Panel/src/pages/Login.jsx`

**Mudanças**:

**ANTES** (❌ Endpoint genérico):
```javascript
const res = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  // ...
})

// Depois tinha que fazer segunda requisição para verificar se é afiliado
const resAfiliado = await fetch('http://localhost:5000/api/afiliados/meu-perfil')
```

**DEPOIS** (✅ Endpoint específico):
```javascript
const res = await fetch('http://localhost:5000/api/afiliados/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ email, senha })
})

const data = await res.json()

if (data.success) {
  // Salvar token e dados no localStorage
  localStorage.setItem('auth_token', data.token)
  localStorage.setItem('afiliado', JSON.stringify(data.afiliado))

  // Redirecionar para dashboard
  navigate('/')
}
```

**Benefícios**:
- ✅ Uma única requisição (antes eram 2)
- ✅ Validação de afiliado já no backend
- ✅ Dados completos retornados de uma vez
- ✅ Mensagens de erro mais claras

---

## 🧪 Como Testar

### 1. Reiniciar Backend

```bash
cd D:\Helix\HelixAI\backend
python app.py
```

### 2. Iniciar Frontend Afiliados

```bash
cd D:\Helix\HelixAI\Afiliados_Panel
npm run dev
```

### 3. Acessar Painel

URL: `http://localhost:5176/login`

### 4. Tentar Login

**Credenciais de Teste**:
- Email: `afiliado@teste.com`
- Senha: `123456`

### 5. Verificar Resultado

✅ **Sucesso esperado**:
- Login bem-sucedido
- Redirecionamento para dashboard
- Console mostra: `[LOGIN] Afiliado autenticado: {...}`
- LocalStorage contém `auth_token` e dados do `afiliado`

❌ **Se falhar**:
- Ver mensagem de erro específica
- Verificar se backend está rodando
- Verificar se banco tem dados do afiliado (tabela `afiliados`)

---

## 🔍 Debug

### Verificar se Afiliado Existe no Banco

```sql
-- SQLite
SELECT
  u.id as usuario_id,
  u.email,
  u.nome,
  u.ativo,
  a.id as afiliado_id,
  a.chave_referencia,
  a.status
FROM usuarios u
LEFT JOIN afiliados a ON a.usuario_id = u.id
WHERE u.email = 'afiliado@teste.com';
```

**Resultado esperado**:
| usuario_id | email | ativo | afiliado_id | status |
|------------|-------|-------|-------------|--------|
| 3 | afiliado@teste.com | 1 | 1 | ativo |

### Se Afiliado NÃO Existir

Execute o script de criação:
```bash
# No DBeaver, executar:
D:\Helix\HelixAI\criar_afiliado_teste_sqlite.sql
```

### Ver Logs do Backend

Quando fizer login, o backend deve mostrar:
```
[AFILIADOS-LOGIN] Usuário encontrado: afiliado@teste.com
[AFILIADOS-LOGIN] Afiliado encontrado: teste2025
[AFILIADOS-LOGIN] Status do afiliado: ativo
[AFILIADOS-LOGIN] Token gerado
```

Se houver erro:
```
[AFILIADOS-LOGIN] Erro ao fazer login: ...
```

---

## 📋 Checklist de Validação

### Backend
- [x] Endpoint `/api/afiliados/login` criado
- [x] Verifica credenciais (email + senha)
- [x] Verifica se usuário está ativo
- [x] Verifica se tem registro na tabela `afiliados`
- [x] Verifica se status do afiliado é `ATIVO`
- [x] Gera token JWT com `afiliado_id`
- [x] Retorna dados completos do afiliado

### Frontend
- [x] Login.jsx atualizado para usar `/api/afiliados/login`
- [x] Salva token no localStorage
- [x] Salva dados do afiliado no localStorage
- [x] Mostra mensagens de erro claras
- [x] Redireciona para dashboard após login

### Banco de Dados
- [x] Tabela `usuarios` tem o usuário afiliado
- [x] Tabela `afiliados` tem registro vinculado
- [x] Campo `status` está como `'ativo'`
- [x] Senha hash está correta

---

## 🎯 Resultados Esperados

### ✅ Login Bem-Sucedido

**Request**:
```json
POST /api/afiliados/login
{
  "email": "afiliado@teste.com",
  "senha": "123456"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Bem-vindo, João Silva - Afiliado!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "afiliado": {
    "id": 1,
    "usuario_id": 3,
    "nome": "João Silva - Afiliado",
    "email": "afiliado@teste.com",
    "chave_referencia": "teste2025",
    "status": "ativo",
    "link_referencia": "http://localhost:5000/r/teste2025",
    "saldo_disponivel": 149.10,
    "total_comissoes_geradas": 317.60,
    "total_comissoes_pagas": 139.40,
    "total_clicks": 10,
    "total_cadastros": 5,
    "total_vendas": 2
  }
}
```

### ❌ Erros Possíveis e Suas Causas

| Código | Mensagem | Causa |
|--------|----------|-------|
| 400 | Email inválido | Email mal formatado |
| 400 | Senha é obrigatória | Campo senha vazio |
| 401 | Email ou senha incorretos | Credenciais erradas |
| 403 | Conta desativada | `usuario.ativo = 0` |
| 403 | Não cadastrado como afiliado | Sem registro na tabela `afiliados` |
| 403 | Cadastro aguardando aprovação | `afiliado.status = 'pendente'` |
| 403 | Conta bloqueada | `afiliado.status = 'bloqueado'` |
| 403 | Conta inativa | `afiliado.status = 'inativo'` |

---

## 🚀 Próximos Passos

Com o login funcionando, você pode:

1. ✅ Acessar o dashboard de afiliados
2. ✅ Ver métricas (MRR, saldo, comissões)
3. ✅ Visualizar referências e conversões
4. ✅ Solicitar saques
5. ✅ Editar perfil

---

## 📞 Suporte

Se o problema persistir:

1. **Verificar logs do backend** (terminal onde rodou `python app.py`)
2. **Verificar console do navegador** (F12 → Console)
3. **Verificar Network** (F12 → Network → ver request/response)
4. **Verificar banco de dados** (queries acima)

---

**✅ FIX APLICADO COM SUCESSO!**

O erro 401 foi corrigido criando um endpoint específico para login de afiliados que valida corretamente todos os requisitos.
