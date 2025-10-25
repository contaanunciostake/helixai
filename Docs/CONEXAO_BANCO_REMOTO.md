# 🔗 Conexão com Banco de Dados Remoto

## 📋 Configuração

O sistema VendeAI agora suporta conexão com banco de dados remoto via API, permitindo sincronizar veículos, leads e conversas entre o banco local (SQLite) e o banco remoto.

### 1. Configurar variáveis de ambiente (.env)

```env
# ==================== BANCO DE DADOS ====================

# SQLite Local (padrão)
DATABASE_URL=sqlite:///vendeai.db

# API do Banco de Dados Remoto
DB_API_URL=https://feiraoshowcar.com.br/db_api.php
DB_API_TOKEN=bot_luana_xyz
USE_REMOTE_DB=True
```

**Importante:**
- `DB_API_URL`: URL da API do banco de dados remoto
- `DB_API_TOKEN`: Token de autenticação da API
- `USE_REMOTE_DB`: `True` para habilitar, `False` para desabilitar

### 2. Estrutura de arquivos criados

```
VendeAI/
├── database/
│   ├── models.py                    # Modelos do banco (existente)
│   ├── remote_db_service.py         # ✅ Serviço de conexão com API remota
│   └── hybrid_db_manager.py         # ✅ Gerenciador híbrido (local + remoto)
├── backend/
│   └── __init__.py                  # ✅ Atualizado para usar gerenciador híbrido
├── test_remote_db.py                # ✅ Script de testes
├── sync_remote_db.py                # ✅ Script de sincronização
└── .env                             # ✅ Configurações atualizadas
```

---

## 🚀 Como usar

### 1. Testar conexão com banco remoto

```bash
python test_remote_db.py
```

Este script irá:
- Verificar configurações do .env
- Testar conexão com a API remota
- Buscar veículos do banco remoto
- Mostrar status de sincronização
- Permitir sincronização de veículos

### 2. Sincronizar dados (via script)

```bash
# Testar conexão
python sync_remote_db.py --test

# Ver status de sincronização
python sync_remote_db.py --status

# Sincronizar veículos
python sync_remote_db.py --sync-veiculos

# Sincronizar tudo
python sync_remote_db.py --all
```

### 3. Usar no código Python

```python
from database.hybrid_db_manager import get_hybrid_db_manager

# Obter gerenciador híbrido
manager = get_hybrid_db_manager()

# Buscar veículos do banco remoto
veiculos_remotos = manager.get_veiculos_from_remote()
print(f"Total de veículos remotos: {len(veiculos_remotos)}")

# Buscar veículo específico
veiculo = manager.get_veiculo_by_id_remote(123)

# Buscar veículos por termo
veiculos = manager.search_veiculos_remote("Civic")

# Sincronizar todos os veículos
stats = manager.sync_veiculos_from_remote()
print(f"Sincronizados: {stats['total']} veículos")

# Busca híbrida (local ou remoto)
veiculos = manager.get_veiculos_hybrid(
    filters={'marca': 'Honda'},
    force_remote=True  # Forçar busca no remoto
)
```

### 4. Criar leads/conversas de forma híbrida

```python
# Criar lead (salva local e remoto)
lead_id = manager.create_lead_hybrid({
    'nome': 'João Silva',
    'telefone': '11999999999',
    'interesse': 'Comprar carro',
    'empresa_id': 1
})

# Atualizar lead (atualiza local e remoto)
success = manager.update_lead_hybrid(lead_id, {
    'status': 'QUALIFICADO',
    'temperatura': 'QUENTE'
})

# Criar conversa
conversa_id = manager.create_conversa_hybrid({
    'lead_id': lead_id,
    'telefone': '11999999999',
    'empresa_id': 1
})

# Criar mensagem
mensagem_id = manager.create_mensagem_hybrid({
    'conversa_id': conversa_id,
    'conteudo': 'Olá, tudo bem?',
    'enviada_por_bot': True
})
```

---

## 📊 Funcionamento

### Gerenciador Híbrido

O `HybridDatabaseManager` combina o melhor dos dois mundos:

1. **Banco Local (SQLite)**:
   - Armazena dados localmente para acesso rápido
   - Funciona offline
   - Cache de dados sincronizados

2. **Banco Remoto (API)**:
   - Fonte de verdade para veículos
   - Sincronização de leads e conversas
   - Dados compartilhados entre sistemas

### Fluxo de sincronização

```
┌─────────────────┐         API         ┌─────────────────┐
│  Banco Remoto   │ ◄─────────────────► │  Banco Local    │
│  (MySQL/PHP)    │                      │  (SQLite)       │
└─────────────────┘                      └─────────────────┘
        │                                        │
        │                                        │
        ▼                                        ▼
   Veículos da loja                      Cache + Conversas
   (fonte principal)                     (trabalho local)
```

---

## 🔧 API Remota - Estrutura esperada

A API remota deve responder no seguinte formato:

### Requisição
```json
{
  "action": "query|get|insert|update|delete|search|ping",
  "token": "bot_luana_xyz",
  "table": "veiculos|leads|conversas|mensagens",
  "filters": {},
  "data": {}
}
```

### Resposta de sucesso
```json
{
  "success": true,
  "data": [...],
  "insert_id": 123
}
```

### Resposta de erro
```json
{
  "success": false,
  "error": "Descrição do erro"
}
```

### Endpoints disponíveis

1. **Ping** - Testar conexão
   ```json
   {"action": "ping", "token": "..."}
   ```

2. **Query** - Buscar dados
   ```json
   {
     "action": "query",
     "token": "...",
     "table": "veiculos",
     "filters": {"disponivel": true}
   }
   ```

3. **Search** - Buscar por termo
   ```json
   {
     "action": "search",
     "token": "...",
     "table": "veiculos",
     "search": "Civic"
   }
   ```

4. **Insert** - Inserir dados
   ```json
   {
     "action": "insert",
     "token": "...",
     "table": "leads",
     "data": {"nome": "João", "telefone": "..."}
   }
   ```

5. **Update** - Atualizar dados
   ```json
   {
     "action": "update",
     "token": "...",
     "table": "leads",
     "id": 123,
     "data": {"status": "QUALIFICADO"}
   }
   ```

---

## ⚙️ Configuração do Backend Flask

O backend agora detecta automaticamente se deve usar o gerenciador híbrido:

```python
# backend/__init__.py

use_remote = os.getenv('USE_REMOTE_DB', 'False').lower() == 'true'

if use_remote:
    db_manager = get_hybrid_db_manager()
    print("[INFO] Usando gerenciador híbrido (Local + Remoto)")
else:
    db_manager = DatabaseManager('sqlite:///vendeai.db')
    print("[INFO] Usando gerenciador local (SQLite)")
```

---

## 🐛 Troubleshooting

### Erro: "Remote DB not enabled"
**Solução:** Verifique se `USE_REMOTE_DB=True` no arquivo `.env`

### Erro: "DB_API_URL e DB_API_TOKEN devem estar configurados"
**Solução:** Adicione as variáveis no `.env`:
```env
DB_API_URL=https://feiraoshowcar.com.br/db_api.php
DB_API_TOKEN=bot_luana_xyz
```

### Erro: "520 Server Error"
**Solução:**
- Verifique se a API remota está online
- Verifique se o token está correto
- Verifique se há bloqueio de firewall/Cloudflare

### Erro: "HTTPSConnectionPool"
**Solução:**
- Verifique sua conexão com a internet
- Tente acessar a URL da API no navegador
- Verifique se há proxy/VPN bloqueando

---

## 📝 Exemplos práticos

### Exemplo 1: Bot buscando veículos para cliente

```python
from database.hybrid_db_manager import get_hybrid_db_manager

manager = get_hybrid_db_manager()

# Cliente pergunta: "Tem Honda Civic?"
veiculos = manager.search_veiculos_remote("Honda Civic")

if veiculos:
    for v in veiculos:
        print(f"✅ {v['marca']} {v['modelo']} {v['ano']} - R$ {v['preco']}")
else:
    print("❌ Nenhum veículo encontrado")
```

### Exemplo 2: Sincronizar ao iniciar o sistema

```python
# No inicio do bot/sistema
from database.hybrid_db_manager import get_hybrid_db_manager

manager = get_hybrid_db_manager()

# Sincronizar veículos
print("Sincronizando veículos...")
stats = manager.sync_veiculos_from_remote()

print(f"✅ {stats['novos']} novos veículos")
print(f"🔄 {stats['atualizados']} atualizados")
```

### Exemplo 3: Registrar lead de conversa

```python
# Quando cliente demonstra interesse
lead_data = {
    'nome': nome_cliente,
    'telefone': telefone,
    'interesse': 'Honda Civic 2020',
    'temperatura': 'QUENTE',
    'origem': 'whatsapp',
    'empresa_id': 1
}

lead_id = manager.create_lead_hybrid(lead_data)
print(f"Lead criado: {lead_id}")

# Criar conversa associada
conversa_id = manager.create_conversa_hybrid({
    'lead_id': lead_id,
    'telefone': telefone,
    'empresa_id': 1
})
```

---

## ✅ Checklist de implementação

- [x] Criar serviço de conexão com API remota (`remote_db_service.py`)
- [x] Criar gerenciador híbrido (`hybrid_db_manager.py`)
- [x] Atualizar backend para usar gerenciador híbrido
- [x] Adicionar configurações no .env
- [x] Criar script de testes (`test_remote_db.py`)
- [x] Criar script de sincronização (`sync_remote_db.py`)
- [x] Criar documentação de uso

---

## 🔄 Próximos passos

1. **Validar API remota**: Verificar se `db_api.php` está respondendo corretamente
2. **Testar sincronização**: Executar `python sync_remote_db.py --sync-veiculos`
3. **Integrar com bot**: Atualizar bot para usar dados remotos
4. **Agendar sincronização**: Criar cron job para sincronizar periodicamente
5. **Logs e monitoramento**: Adicionar logs detalhados das sincronizações

---

## 📞 Suporte

Se encontrar problemas:
1. Execute: `python test_remote_db.py` para diagnóstico
2. Verifique os logs em `logs/vendeai.log`
3. Confirme que a API remota está respondendo corretamente

---

**Desenvolvido para VendeAI** 🚀
