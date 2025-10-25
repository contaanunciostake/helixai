@echo off
echo ════════════════════════════════════════════════════════════════
echo APLICAR MULTI-TENANT - VendeAI
echo ════════════════════════════════════════════════════════════════
echo.

cd /d D:\Helix\HelixAI\VendeAI\bot_engine

echo [1/4] Parando processos node...
echo      Por favor, pressione Ctrl+C no terminal do bot-api-server
pause

echo.
echo [2/4] Fazendo backup do arquivo antigo...
if exist bot-api-server.js (
    ren bot-api-server.js bot-api-server-OLD.js
    echo      ✅ Backup criado: bot-api-server-OLD.js
) else (
    echo      ⚠️ bot-api-server.js nao encontrado
)

echo.
echo [3/4] Ativando versao multi-tenant...
if exist bot-api-server-multi-tenant.js (
    ren bot-api-server-multi-tenant.js bot-api-server.js
    echo      ✅ Multi-tenant ativado: bot-api-server.js
) else (
    echo      ❌ bot-api-server-multi-tenant.js nao encontrado!
    pause
    exit /b 1
)

echo.
echo [4/4] Verificando session-manager.js...
if exist session-manager.js (
    echo      ✅ session-manager.js encontrado
) else (
    echo      ❌ session-manager.js NAO encontrado!
    echo      Por favor, verifique se o arquivo existe.
    pause
    exit /b 1
)

echo.
echo ════════════════════════════════════════════════════════════════
echo ✅ MULTI-TENANT ATIVADO COM SUCESSO!
echo ════════════════════════════════════════════════════════════════
echo.
echo Próximos passos:
echo 1. Reiniciar bot-api-server: node bot-api-server.js
echo 2. Atualizar App.jsx (veja PATCH_APP_JSX_MULTI_TENANT.md)
echo 3. Reiniciar CRM Client (npm run dev)
echo 4. Testar com 2 usuários
echo.
echo Console deve mostrar: "MULTI-TENANT ATIVO"
echo ════════════════════════════════════════════════════════════════
pause
