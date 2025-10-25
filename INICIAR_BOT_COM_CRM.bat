@echo off
CHCP 65001 > nul
echo ════════════════════════════════════════════════════════════════
echo 🤖 INICIALIZAÇÃO: VendeAI Bot + CRM Integrado
echo ════════════════════════════════════════════════════════════════
echo.

REM Verificar se já foi integrado
if not exist "VendeAI\bot_engine\bot-api-server.js" (
    echo ⚠️  ATENÇÃO: Bot API Server não encontrado!
    echo.
    echo 📋 Executando integração automática...
    echo.
    cd VendeAI\bot_engine
    node integrate-bot-api.js
    if errorlevel 1 (
        echo.
        echo ❌ ERRO na integração!
        echo 💡 Execute manualmente: cd VendeAI\bot_engine ^&^& node integrate-bot-api.js
        pause
        exit /b 1
    )
    cd ..\..
    echo.
    echo ✅ Integração concluída!
    echo.
)

REM Verificar se as dependências estão instaladas
echo 📦 Verificando dependências...
echo.

cd VendeAI\bot_engine

if not exist "node_modules\cors" (
    echo ⚠️  Instalando dependências do bot...
    call npm install cors qrcode ws express
    if errorlevel 1 (
        echo ❌ Erro ao instalar dependências!
        pause
        exit /b 1
    )
    echo ✅ Dependências instaladas!
    echo.
)

cd ..\..

echo ════════════════════════════════════════════════════════════════
echo ✅ TUDO PRONTO! Iniciando sistema...
echo ════════════════════════════════════════════════════════════════
echo.
echo 📡 O bot será iniciado e estará disponível em:
echo    - API REST: http://localhost:3010
echo    - WebSocket: ws://localhost:3010/ws
echo.
echo 🌐 Após o bot iniciar, acesse o CRM em:
echo    - CRM Cliente: http://localhost:5177
echo.
echo ════════════════════════════════════════════════════════════════
echo.

REM Iniciar o bot
echo 🚀 Iniciando VendeAI Bot...
echo.

cd VendeAI\bot_engine
node main.js

REM Se o bot parar
echo.
echo ════════════════════════════════════════════════════════════════
echo ⚠️  Bot finalizado
echo ════════════════════════════════════════════════════════════════
echo.
pause
