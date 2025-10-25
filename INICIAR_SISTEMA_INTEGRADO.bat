@echo off
chcp 65001 >nul
title 🤖 Sistema Integrado Multi-Agente - HelixAI

color 0A
echo.
echo ═══════════════════════════════════════════════════════════════════
echo    🚀 INICIANDO SISTEMA INTEGRADO MULTI-AGENTE - HELIXAI
echo ═══════════════════════════════════════════════════════════════════
echo.
echo    Bots Disponíveis:
echo    ✅ VendeAI Bot (Veículos) - IA avançada
echo    🚧 AIra Imob Bot (Imóveis) - Em desenvolvimento
echo    💼 Bot Genérico (Outros nichos)
echo.
echo ═══════════════════════════════════════════════════════════════════
echo.

:: Verificar se Node.js está instalado
where node >nul 2>nul
if errorlevel 1 (
    echo ❌ ERRO: Node.js não encontrado!
    echo.
    echo Por favor, instale o Node.js 18+ antes de continuar.
    echo Download: https://nodejs.org
    echo.
    pause
    exit /b 1
)

:: Verificar se Python está instalado
where python >nul 2>nul
if errorlevel 1 (
    echo ❌ ERRO: Python não encontrado!
    echo.
    echo Por favor, instale o Python 3.10+ antes de continuar.
    echo Download: https://www.python.org
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js e Python detectados
echo.

:: Verificar se dependências estão instaladas
if not exist "whatsapp_service\node_modules" (
    echo 📦 Instalando dependências do Node.js...
    cd whatsapp_service
    call npm install
    cd ..
    echo ✅ Dependências instaladas!
    echo.
)

:: Iniciar Backend Flask (Port 5000)
echo 🐍 Iniciando Backend Flask (Port 5000)...
start "Backend Flask - Port 5000" cmd /k "color 0C && cd /d %~dp0 && python backend/app.py"
timeout /t 3 /nobreak >nul

:: Iniciar Integrated Bot Server (Port 3010)
echo 🤖 Iniciando Integrated Bot Server (Port 3010)...
start "Bot Server Multi-Agente - Port 3010" cmd /k "color 0B && cd /d %~dp0whatsapp_service && npm start"
timeout /t 3 /nobreak >nul

:: Iniciar CRM Admin (Port 5173)
echo 🖥️  Iniciando CRM Admin (Port 5173)...
if exist "CRM_Admin" (
    start "CRM Admin - Port 5173" cmd /k "color 0D && cd /d %~dp0CRM_Admin && npm run dev"
    timeout /t 2 /nobreak >nul
) else (
    echo ⚠️  CRM_Admin não encontrado, pulando...
)

echo.
echo ═══════════════════════════════════════════════════════════════════
echo    ✅ SISTEMA INICIADO COM SUCESSO!
echo ═══════════════════════════════════════════════════════════════════
echo.
echo    🌐 Serviços Rodando:
echo.
echo    📍 Backend Flask:        http://localhost:5000
echo    📍 Bot Server:           http://localhost:3010
echo    📍 CRM Admin:            http://localhost:5173
echo.
echo    📡 WebSocket:            ws://localhost:3010/ws?empresa_id=X
echo.
echo    📖 Documentação:         INTEGRACAO_BOT_MULTI_AGENTE.md
echo.
echo ═══════════════════════════════════════════════════════════════════
echo.
echo    💡 COMO USAR:
echo.
echo    1. Defina o nicho da sua empresa no banco de dados:
echo       UPDATE empresas SET nicho = 'veiculos' WHERE id = 22;
echo.
echo    2. Acesse o CRM Admin: http://localhost:5173
echo.
echo    3. Conecte o WhatsApp pelo Dashboard
echo.
echo    4. O sistema selecionará automaticamente o bot correto!
echo.
echo ═══════════════════════════════════════════════════════════════════
echo.
echo    Pressione CTRL+C em cada janela para parar os serviços
echo.
echo    Ou feche esta janela para manter tudo rodando em background
echo.
pause
