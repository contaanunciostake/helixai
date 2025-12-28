# Correção do Enum TipoUsuario

## Problema Identificado

Erro ao fazer login no CRM Cliente:
```
'admin_empresa' is not among the defined enum values.
Enum name: tipousuario.
Possible values: SUPER_ADMIN, ADMIN_EMPRE.., USUARIO, VISUALIZADO..
```

## Causa Raiz

O banco de dados SQLite estava com valores corretos, mas o **servidor Flask em execução** tinha uma versão antiga do enum em memória cache, com valores truncados.

## Solução Aplicada

### 1. Verificação do Banco de Dados ✅
- Banco SQLite estava com valores corretos: `admin_empresa` e `super_admin`
- Script executado: `fix_tipousuario_sqlite.py`

### 2. Verificação do Código ✅
- Enum no arquivo `backend/database/models.py` está correto:
  ```python
  class TipoUsuario(enum.Enum):
      SUPER_ADMIN = "super_admin"
      ADMIN_EMPRESA = "admin_empresa"
      USUARIO = "usuario"
      VISUALIZADOR = "visualizador"
  ```

### 3. Limpeza de Cache ✅
- Removido `__pycache__` e `*.pyc`
- Cache Python limpo

### 4. Reiniciar Servidor Flask ⚠️ **NECESSÁRIO**

O servidor Flask precisa ser **reiniciado** para recarregar os enums em memória!

## Como Corrigir

### Passo 1: Parar o Servidor Flask
Feche a janela do terminal que está executando o Flask (porta 5000)

### Passo 2: Reiniciar o Sistema
Execute novamente:
```batch
INICIAR_SISTEMA_CORRETO.bat
```

OU se já estiver rodando, apenas reinicie o Flask:
```batch
cd D:\Helix\HelixAI\backend
python -m flask run --host=0.0.0.0 --port=5000
```

### Passo 3: Testar Login
Acesse: `http://localhost:5177/`
- Email: `demo@vendeai.com`
- Senha: `demo123`

## Verificações Realizadas

✅ Banco de dados: Valores corretos
✅ Código Python: Enum correto
✅ Scripts de correção: Executados com sucesso
⏳ Servidor Flask: **Precisa reiniciar**

## Scripts Criados

1. `fix_tipousuario_sqlite.py` - Corrige valores no banco SQLite
2. `check_table_schema.py` - Verifica schema da tabela
3. `check_constraints.py` - Verifica constraints e valores
4. `test_enum_load.py` - Testa carregamento de enums
5. `test_login_api.py` - Testa API de login

## Usuários no Banco

```
ID  Email                                      Tipo
--  -----------------------------------------  -------------
1   admin@vendeai.com                         super_admin
2   demo@vendeai.com                          admin_empresa
3   emailnovo@gmail.com                       admin_empresa
... (outros usuários)
```

## Próximos Passos

1. **Reinicie o servidor Flask** (feche a janela e execute o bat novamente)
2. Teste o login em `http://localhost:5177/`
3. O login deve funcionar corretamente

---

**Data da Correção:** 2025-11-03
**Scripts de Correção:** Localizados em `D:\Helix\HelixAI\backend\`
