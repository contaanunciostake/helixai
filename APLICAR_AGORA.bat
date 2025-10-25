@echo off
echo ════════════════════════════════════════════════════════════════
echo APLICANDO MULTI-TENANT AGORA
echo ════════════════════════════════════════════════════════════════
echo.

cd /d D:\Helix\HelixAI\VendeAI\bot_engine

echo [1/3] Deletando credenciais antigas (sessao expirada)...
if exist auth_info_baileys (
    rmdir /S /Q auth_info_baileys
    echo      ✅ Credenciais antigas deletadas
) else (
    echo      ℹ️  Pasta nao existia
)
mkdir auth_info_baileys
echo      ✅ Pasta limpa criada

echo.
echo [2/3] Fazendo backup do arquivo antigo...
if exist bot-api-server.js (
    if exist bot-api-server-OLD.js (
        del bot-api-server-OLD.js
    )
    ren bot-api-server.js bot-api-server-OLD.js
    echo      ✅ Backup criado
)

echo.
echo [3/3] Ativando versao MULTI-TENANT...
if exist bot-api-server-multi-tenant.js (
    ren bot-api-server-multi-tenant.js bot-api-server.js
    echo      ✅ Multi-tenant ATIVADO
) else (
    echo      ❌ Arquivo multi-tenant nao encontrado!
    pause
    exit /b 1
)

echo.
echo ════════════════════════════════════════════════════════════════
echo ✅ TUDO PRONTO!
echo ════════════════════════════════════════════════════════════════
echo.
echo Agora execute:
echo    node bot-api-server.js
echo.
echo Console DEVE mostrar:
echo    "BOT API SERVER - VendeAI MULTI-TENANT"
echo    "Suporte Multi-Tenant ATIVO"
echo.
echo ════════════════════════════════════════════════════════════════
pause
