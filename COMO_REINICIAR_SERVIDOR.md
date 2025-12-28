# Como Reiniciar o Servidor Flask (Solução do Erro de Login)

## Problema
```
Erro ao fazer login: 'admin_empresa' is not among the defined enum values.
```

## Solução

O servidor Flask precisa ser **totalmente reiniciado** para recarregar os enums corrigidos.

---

## OPÇÃO 1: Reiniciar Tudo (Recomendado)

### Passo 1: Parar Tudo
Feche **TODAS as janelas** do sistema que foram abertas pelo `INICIAR_SISTEMA_CORRETO.bat`

OU execute:
```batch
🛑_PARAR_TUDO.bat
```

### Passo 2: Iniciar Tudo Novamente
```batch
🚀_INICIAR_TUDO.bat
```

OU

```batch
INICIAR_SISTEMA_CORRETO.bat
```

---

## OPÇÃO 2: Reiniciar Apenas o Backend

### Execute o script de restart:
```batch
cd D:\Helix\HelixAI\backend
RESTART_SERVIDOR.bat
```

Este script irá:
1. ✅ Parar todos os processos Python
2. ✅ Limpar todo o cache Python (`__pycache__`, `.pyc`, `.pyo`)
3. ✅ Verificar valores no banco de dados
4. ✅ Verificar enum no código
5. ✅ Iniciar servidor Flask na porta 5000

---

## Verificar se Funcionou

### 1. Aguarde o Flask iniciar completamente
Você verá algo como:
```
 * Running on http://0.0.0.0:5000
 * Running on http://127.0.0.1:5000
 * Running on http://192.168.x.x:5000
```

### 2. Teste a API diretamente (opcional)
```batch
cd D:\Helix\HelixAI\backend
python test_login_api.py
```

Deve retornar:
```json
{
  "success": true,
  "message": "Bem-vindo, Usuário Demo!",
  "token": "..."
}
```

### 3. Teste no navegador
Acesse: `http://localhost:5177/`

Login:
- Email: `demo@vendeai.com`
- Senha: `demo123`

**Deve funcionar sem erros!** ✅

---

## O Que Foi Corrigido

✅ Banco de dados SQLite - Valores corretos
✅ Código Python - Enum `TipoUsuario` correto
✅ Cache Python - Totalmente limpo
✅ Scripts de restart - Criados

### Valores corretos do enum:
```python
class TipoUsuario(enum.Enum):
    SUPER_ADMIN = "super_admin"        # ✅ 11 caracteres
    ADMIN_EMPRESA = "admin_empresa"    # ✅ 13 caracteres (NÃO truncado)
    USUARIO = "usuario"                # ✅ 7 caracteres
    VISUALIZADOR = "visualizador"      # ✅ 12 caracteres
```

---

## Problemas Conhecidos

### ⚠️ IMPORTANTE
Se você abrir o sistema com `INICIAR_SISTEMA_CORRETO.bat` e o backend já estava rodando em outra janela, o enum antigo continuará em memória!

**Solução:** Sempre feche TODAS as janelas antes de reiniciar.

---

## Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `RESTART_SERVIDOR.bat` | Reinicia apenas o Flask (com limpeza de cache) |
| `fix_tipousuario_sqlite.py` | Corrige valores no banco SQLite |
| `test_login_api.py` | Testa API de login |
| `test_enum_load.py` | Testa carregamento de enums |
| `check_table_schema.py` | Verifica schema da tabela |
| `check_constraints.py` | Verifica constraints |

---

## Suporte

Se ainda houver problemas após seguir estes passos:

1. Verifique se não há processos Python órfãos:
   ```batch
   tasklist | findstr python.exe
   ```

2. Mate todos manualmente:
   ```batch
   taskkill /F /IM python.exe
   ```

3. Reinicie tudo do zero com `🚀_INICIAR_TUDO.bat`

---

**Data:** 2025-11-03
**Status:** ✅ Correção Implementada - Aguardando Reinício do Servidor
