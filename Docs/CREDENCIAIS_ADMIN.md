# 🔐 Credenciais de Acesso - Painel Admin

## Super Admin Principal

**Email:** admin@vendeai.com
**Nome:** Administrador VendeAI
**Senha:** (verifique a senha que você configurou)

Se não lembrar a senha, execute:
```bash
python criar_admin.py
```
E crie um novo Super Admin.

---

## 🚀 Como Acessar o Painel Admin

### 1. Iniciar o Servidor
```bash
python backend/app.py
```

### 2. Fazer Login
- Acesse: `http://localhost:5000/login`
- Use: `admin@vendeai.com`
- Senha: (sua senha configurada)

### 3. Acessar Painel Admin
Após login, acesse: `http://localhost:5000/admin`

---

## 📱 URLs Disponíveis

### Páginas Admin
- Dashboard: `http://localhost:5000/admin`
- WhatsApp Config: `http://localhost:5000/admin/whatsapp-config`
- Empresas: `http://localhost:5000/admin/empresas`
- Usuários: `http://localhost:5000/admin/usuarios`
- Leads: `http://localhost:5000/admin/leads`
- Conversas: `http://localhost:5000/admin/conversas`
- Disparador: `http://localhost:5000/admin/disparador`

---

## 🛠️ Criar Novo Super Admin

Se precisar criar outro Super Admin:

```bash
python criar_admin.py
```

Ou use este script direto:

```python
from database.models import DatabaseManager, Usuario, TipoUsuario, Empresa
from werkzeug.security import generate_password_hash

db = DatabaseManager('sqlite:///vendeai.db')
session = db.get_session()

# Criar empresa se não existir
empresa = session.query(Empresa).filter_by(nome="VendeAI - Admin").first()
if not empresa:
    empresa = Empresa(
        nome="VendeAI - Admin",
        razao_social="VendeAI Administração"
    )
    session.add(empresa)
    session.flush()

# Criar super admin
admin = Usuario(
    nome="Seu Nome",
    email="seu@email.com",
    senha=generate_password_hash("suasenha"),
    tipo=TipoUsuario.SUPER_ADMIN,
    empresa_id=empresa.id,
    ativo=True
)
session.add(admin)
session.commit()
session.close()
```

---

## ✅ Verificar Acesso

Execute o teste:
```bash
python test_admin_access.py
```

Este script vai:
- Listar todos os Super Admins
- Verificar empresas cadastradas
- Testar suas credenciais
- Mostrar todas as URLs disponíveis
