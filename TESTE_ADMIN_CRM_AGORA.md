# 🚀 Teste o Admin CRM AGORA

## ⚡ Início Rápido (3 Passos)

### 1️⃣ Criar Usuário Admin

Abra o MySQL e execute:

```sql
-- Gerar hash de senha primeiro (use Python)
-- python -c "from werkzeug.security import generate_password_hash; print(generate_password_hash('admin123'))"

INSERT INTO usuarios (
    empresa_id,
    nome,
    email,
    senha_hash,
    tipo,
    ativo
) VALUES (
    1,
    'Admin Master',
    'admin@aira.com',
    'scrypt:32768:8:1$YOUR_HASH_HERE',  -- Substitua pelo hash gerado
    'super_admin',
    1
);
```

**Ou use este script Python para gerar o hash:**

```python
from werkzeug.security import generate_password_hash

senha = 'admin123'
hash_senha = generate_password_hash(senha)
print(f"\nCole este hash no SQL:")
print(hash_senha)
```

### 2️⃣ Iniciar Backend

```bash
cd D:\Helix\HelixAI\backend
python app.py
```

✅ Backend rodando em: `http://localhost:5000`

### 3️⃣ Iniciar Admin CRM

```bash
cd D:\Helix\HelixAI\CRM_Admin\crm-admin-app
npm install  # Só na primeira vez
npm run dev
```

✅ Admin CRM rodando em: `http://localhost:5175`

---

## 🔐 Login

Acesse: `http://localhost:5175`

**Credenciais:**
- Email: `admin@aira.com`
- Senha: `admin123` (ou a que você definiu)

---

## 🧪 O Que Testar

### ✅ Dashboard (Página Inicial)

Você deve ver:

1. **Cards de Métricas**
   - 💰 MRR (Receita Recorrente)
   - 🏢 Empresas Ativas
   - 👥 Usuários Ativos
   - 💬 Bots WhatsApp Ativos

2. **Métricas Secundárias**
   - Conversas Hoje
   - Mensagens/Mês
   - Taxa de Conversão

3. **Status das Empresas**
   - ✅ Ativas (com porcentagem)
   - ⏳ Trial
   - ❌ Vencidas

4. **Distribuição por Plano**
   - Free, Basic, Pro, Enterprise

5. **Atividades Recentes**
   - Últimas empresas criadas

6. **Alertas Críticos**
   - 🔴 Empresas inadimplentes
   - 🟡 Bots desconectados
   - 🟢 Trials com baixa conversão

### ✅ Gestão de Empresas

Clique em **"Empresas"** no menu lateral:

1. **Listar Empresas**
   - Ver tabela com todas as empresas
   - Colunas: Nome, Plano, Status, WhatsApp, Usuários, Leads

2. **Filtros**
   - 🔍 Buscar por nome, email ou CNPJ
   - 📋 Filtrar por plano (Free, Basic, Pro, Enterprise)
   - ✅ Filtrar por status (Ativo/Inativo)

3. **Ver Detalhes**
   - Clicar no ícone 👁️ em qualquer empresa
   - Ver modal com:
     - Informações básicas
     - Plano e status
     - Estatísticas (leads, conversas, mensagens)
     - Lista de usuários

4. **Paginação**
   - Navegar entre páginas (◀️ ▶️)
   - Ver número da página atual

---

## 🎨 Visual

O Admin CRM tem tema **ROXO/INDIGO** (diferente do verde do Cliente):

- Sidebar roxa
- Cards com glassmorphism
- Animações suaves
- Background com estrelas
- Gradientes roxos nos elementos ativos

---

## 🐛 Se Algo Não Funcionar

### Erro 401 (Não Autorizado)
```bash
# Verificar se usuário é super_admin
mysql -u root -p
USE vendeai;
SELECT tipo FROM usuarios WHERE email = 'admin@aira.com';
# Deve retornar: super_admin
```

### Métricas não aparecem
```bash
# Testar API diretamente
curl http://localhost:5000/api/admin/docs

# Ver se backend está rodando
# Deve mostrar JSON com endpoints
```

### Empresas não listam
```bash
# Verificar se há empresas no banco
mysql -u root -p
USE vendeai;
SELECT COUNT(*) FROM empresas;

# Criar empresas de teste se necessário
INSERT INTO empresas (nome, email, plano, plano_ativo)
VALUES
  ('Empresa Teste 1', 'teste1@empresa.com', 'basic', 1),
  ('Empresa Teste 2', 'teste2@empresa.com', 'pro', 1),
  ('Empresa Teste 3', 'teste3@empresa.com', 'enterprise', 1);
```

### Console do Navegador
Sempre abra o console (F12) para ver erros:

```
Network → Ver requisições
Console → Ver erros JavaScript
```

---

## 📊 Dados de Teste

Se o banco estiver vazio, você pode popular com dados de teste:

```sql
-- Empresas
INSERT INTO empresas (nome, nome_fantasia, email, plano, plano_ativo, whatsapp_conectado, bot_ativo) VALUES
('AutoPrime Veículos', 'AutoPrime', 'contato@autoprime.com', 'pro', 1, 1, 1),
('Imob Lux', 'Imob Lux Imóveis', 'vendas@imoblux.com', 'enterprise', 1, 1, 1),
('CarShop Brasil', 'CarShop', 'admin@carshop.com', 'basic', 1, 0, 0),
('Villa Realty', 'Villa', 'contato@villa.com', 'pro', 1, 1, 1),
('MegaCar', 'MegaCar Seminovos', 'vendas@megacar.com', 'basic', 1, 1, 0);

-- Usuários
INSERT INTO usuarios (empresa_id, nome, email, senha_hash, tipo, ativo) VALUES
(1, 'João Silva', 'joao@autoprime.com', 'scrypt:32768:8:1$...', 'admin_empresa', 1),
(1, 'Maria Santos', 'maria@autoprime.com', 'scrypt:32768:8:1$...', 'usuario', 1),
(2, 'Pedro Costa', 'pedro@imoblux.com', 'scrypt:32768:8:1$...', 'admin_empresa', 1);

-- Leads
INSERT INTO leads (empresa_id, nome, telefone, status, temperatura) VALUES
(1, 'Cliente 1', '11987654321', 'novo', 'quente'),
(1, 'Cliente 2', '11987654322', 'qualificado', 'morno'),
(1, 'Cliente 3', '11987654323', 'ganho', 'quente');
```

---

## ✅ Checklist de Teste

- [ ] Login funciona
- [ ] Dashboard carrega métricas
- [ ] MRR é calculado corretamente
- [ ] Total de empresas aparece
- [ ] Total de usuários aparece
- [ ] Bots ativos são contados
- [ ] Status das empresas mostra percentagens
- [ ] Clicar em "Empresas" no menu
- [ ] Tabela lista empresas
- [ ] Busca funciona
- [ ] Filtros funcionam (plano, status)
- [ ] Clicar em "Ver detalhes" (ícone olho)
- [ ] Modal abre com informações
- [ ] Estatísticas aparecem no modal
- [ ] Usuários da empresa listam no modal
- [ ] Paginação funciona (se mais de 20 empresas)
- [ ] Sidebar colapsa/expande
- [ ] Tema roxo está aplicado
- [ ] Animações funcionam

---

## 🎯 Resultado Esperado

Se tudo estiver funcionando, você verá:

✅ Dashboard com métricas reais do banco de dados
✅ Tabela de empresas com filtros e busca
✅ Modal de detalhes com dados completos
✅ Visual roxo/indigo elegante
✅ Animações suaves
✅ Sem erros no console

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique logs do backend (terminal onde rodou `python app.py`)
2. Abra console do navegador (F12)
3. Consulte `ADMIN_CRM_IMPLEMENTADO.md` para troubleshooting detalhado

---

**🎉 Tudo pronto! O Admin CRM está completo e funcional!**
