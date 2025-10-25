@echo off
chcp 65001 >nul
title AIra - Sistema Completo
color 0A

cls
echo ╔════════════════════════════════════════════════════════════════╗
echo ║              🤖 AIra - INICIALIZAÇÃO AUTOMÁTICA                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo [INFO] Iniciando sistema...
echo.

:: ============================================================================
:: PASSO 1: LIMPAR CACHE
:: ============================================================================
echo [1/5] Limpando cache...
echo.

cd /d "D:\Helix\HelixAI\AIra_Landing"
if exist "node_modules\.cache" rd /s /q "node_modules\.cache" 2>nul
if exist "node_modules\.vite" rd /s /q "node_modules\.vite" 2>nul

cd /d "D:\Helix\HelixAI\CRM_Client\crm-client-app"
if exist "node_modules\.cache" rd /s /q "node_modules\.cache" 2>nul
if exist "node_modules\.vite" rd /s /q "node_modules\.vite" 2>nul

cd /d "D:\Helix\HelixAI\CRM_Admin\crm-admin-app"
if exist "node_modules\.cache" rd /s /q "node_modules\.cache" 2>nul
if exist "node_modules\.vite" rd /s /q "node_modules\.vite" 2>nul

echo OK - Cache limpo
echo.

:: ============================================================================
:: PASSO 2: VERIFICAR MYSQL
:: ============================================================================
echo [2/5] Verificando MySQL...
echo.

tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I /N "mysqld.exe">NUL
if %ERRORLEVEL% EQU 0 (
    echo OK - MySQL rodando
) else (
    echo AVISO - MySQL nao esta rodando!
    echo Por favor, inicie o MySQL no XAMPP Control Panel
    echo.
    echo Pressione qualquer tecla para continuar mesmo assim...
    pause
)
echo.

:: ============================================================================
:: PASSO 3: VERIFICAR PROCESSOS ANTERIORES
:: ============================================================================
echo [3/5] Verificando processos anteriores...
echo.

tasklist /FI "WINDOWTITLE eq Backend API*" 2>NUL | find /I /N "cmd.exe">NUL
if %ERRORLEVEL% EQU 0 (
    echo AVISO - Backend ja esta rodando!
    echo Feche as janelas anteriores antes de continuar.
    echo.
    pause
)

echo OK - Nenhum processo conflitante
echo.

:: ============================================================================
:: PASSO 4: INSTALAR DEPENDENCIAS CRITICAS
:: ============================================================================
echo [4/5] Verificando dependencias criticas...
echo.

:: CRM Cliente - Verificar e instalar dependências
if not exist "D:\Helix\HelixAI\CRM_Client\crm-client-app\node_modules" (
    echo Instalando TODAS as dependencias do CRM Cliente...
    cd /d "D:\Helix\HelixAI\CRM_Client\crm-client-app"
    call npm install
) else (
    if not exist "D:\Helix\HelixAI\CRM_Client\crm-client-app\node_modules\@hello-pangea" (
        echo Instalando bibliotecas especiais do CRM Cliente...
        cd /d "D:\Helix\HelixAI\CRM_Client\crm-client-app"
        call npm install @hello-pangea/dnd qrcode.react
    )
)

:: CRM Admin - Verificar dependências
if not exist "D:\Helix\HelixAI\CRM_Admin\crm-admin-app\node_modules" (
    echo Instalando TODAS as dependencias do CRM Admin...
    cd /d "D:\Helix\HelixAI\CRM_Admin\crm-admin-app"
    call npm install
)

:: Landing Page - Verificar dependências
if not exist "D:\Helix\HelixAI\AIra_Landing\node_modules" (
    echo Instalando TODAS as dependencias da Landing Page...
    cd /d "D:\Helix\HelixAI\AIra_Landing"
    call npm install
)

:: VendeAI Bot Engine - Verificar dependências
if not exist "D:\Helix\HelixAI\VendeAI\bot_engine\node_modules" (
    echo Instalando TODAS as dependencias do VendeAI Bot Engine...
    cd /d "D:\Helix\HelixAI\VendeAI\bot_engine"
    call npm install
)

:: WhatsApp Service ESTÁVEL - Verificar dependências
if not exist "D:\Helix\HelixAI\whatsapp_service_stable\node_modules" (
    echo Instalando TODAS as dependencias do WhatsApp Service ESTAVEL...
    cd /d "D:\Helix\HelixAI\whatsapp_service_stable"
    call npm install
)

:: AIra Auto - Verificar dependências
if not exist "D:\Helix\HelixAI\AIra_Auto\node_modules" (
    echo Instalando TODAS as dependencias do AIra Auto...
    cd /d "D:\Helix\HelixAI\AIra_Auto"
    call npm install
)

:: AIra Imob - Verificar dependências
if not exist "D:\Helix\HelixAI\AIra_Imob\node_modules" (
    echo Instalando TODAS as dependencias do AIra Imob...
    cd /d "D:\Helix\HelixAI\AIra_Imob"
    call npm install
)

echo OK - Dependencias verificadas
echo.

:: ============================================================================
:: PASSO 5: INICIAR SERVICOS (ORDEM CORRETA!)
:: ============================================================================
echo [5/5] Iniciando servicos na ordem correta...
echo.
echo IMPORTANTE: Aguardando inicializacao completa entre servicos
echo.

:: 1. VendeAI Backend Flask (INTEGRADO COM CRM - porta 5000)
echo    [1/10] VendeAI Backend Flask (porta 5000)...
start "VendeAI Backend Flask" cmd /k "cd /d D:\Helix\HelixAI\VendeAI && color 0D && echo ════════════════════════════════════════ && echo 🔧 VendeAI Backend Flask && echo 📍 URL: http://localhost:5000/ && echo 🔗 CRM Bridge: /api/crm/* && echo ════════════════════════════════════════ && echo. && python backend/app.py"
echo          Aguardando VendeAI Backend inicializar completamente (6s)...
timeout /t 6 /nobreak >nul

:: 2. VendeAI Bot Engine + Bot API Server (porta 3010)
echo    [2/10] VendeAI Bot Engine + Bot API Server (porta 3010)...
start "VendeAI Bot + API Server" cmd /k "cd /d D:\Helix\HelixAI\VendeAI\bot_engine && color 0A && echo ════════════════════════════════════════ && echo 🤖 VendeAI Bot Engine + API Server && echo 📡 Bot API: http://localhost:3010 && echo 🔌 WebSocket: ws://localhost:3010/ws && echo 🧠 IA + Voz + WhatsApp + CRM && echo ════════════════════════════════════════ && echo. && node main.js"
echo          Aguardando VendeAI Bot + API inicializar (6s)...
timeout /t 6 /nobreak >nul

:: 3. WhatsApp Service ESTÁVEL (porta 3002 - backup)
echo    [3/10] WhatsApp Service ESTAVEL (porta 3002 - backup)...
if exist "D:\Helix\HelixAI\whatsapp_service_stable" (
    start "WhatsApp Service ESTÁVEL" cmd /k "cd /d D:\Helix\HelixAI\whatsapp_service_stable && color 02 && echo ════════════════════════════════════════ && echo 📱 WhatsApp Service ESTÁVEL ^(Backup^) && echo 🔌 Porta: 3002 && echo ════════════════════════════════════════ && echo. && set PORT=3002 && npm start"
    timeout /t 4 /nobreak >nul
)

:: 4. AIra Auto API Server (Bot de Veículos - PORTA 4000)
echo    [4/10] AIra Auto Bot (porta 4000)...
if exist "D:\Helix\HelixAI\AIra_Auto" (
    start "AIra Auto API Server" cmd /k "cd /d D:\Helix\HelixAI\AIra_Auto && color 0A && echo ════════════════════════════════════════ && echo 🚗 AIra Auto - Bot de Veículos && echo 📍 API: http://localhost:4000/ && echo ════════════════════════════════════════ && echo. && npm start"
    timeout /t 3 /nobreak >nul
)

:: 5. AIra Imob API Server (Bot de Imóveis - PORTA 4001)
echo    [5/10] AIra Imob Bot (porta 4001)...
if exist "D:\Helix\HelixAI\AIra_Imob" (
    start "AIra Imob API Server" cmd /k "cd /d D:\Helix\HelixAI\AIra_Imob && color 05 && echo ════════════════════════════════════════ && echo 🏠 AIra Imob - Bot de Imóveis && echo 📍 API: http://localhost:4001/ && echo ════════════════════════════════════════ && echo. && npm start"
    timeout /t 3 /nobreak >nul
)

:: 6. LocalTunnel Webhook (ElevenLabs) - COM RECONEXÃO AUTOMÁTICA
echo    [6/10] LocalTunnel Webhook com Reconexao Automatica (ElevenLabs)...
start "VendeAI Webhook Tunnel - Auto Reconnect" cmd /k "cd /d D:\Helix\HelixAI\VendeAI && start-tunnel-reconnect.bat"
timeout /t 3 /nobreak >nul

:: 7. CRM Admin (PORTA ESPECIFICADA: 5175)
echo    [7/10] CRM Admin (porta 5175)...
if exist "D:\Helix\HelixAI\CRM_Admin\crm-admin-app" (
    start "CRM Admin - Port 5175" cmd /k "cd /d D:\Helix\HelixAI\CRM_Admin\crm-admin-app && color 0E && echo ════════════════════════════════════════ && echo 👨‍💼 CRM Administrador && echo 📍 URL: http://localhost:5175/ && echo ════════════════════════════════════════ && echo. && npm run dev -- --port 5175"
    timeout /t 3 /nobreak >nul
)

:: 8. CRM Cliente (PORTA ESPECIFICADA: 5177 - INTEGRADO COM VENDEAI!)
echo    [8/10] CRM Cliente INTEGRADO VendeAI (porta 5177)...
start "CRM Cliente - INTEGRADO VendeAI" cmd /k "cd /d D:\Helix\HelixAI\CRM_Client\crm-client-app && color 09 && echo ════════════════════════════════════════ && echo 👤 CRM Cliente ^(INTEGRADO VENDEAI^) && echo 📍 URL: http://localhost:5177/ && echo 🔐 VendeAI: demo@vendeai.com / demo123 && echo 🔗 Bot API: http://localhost:3010 && echo 🔗 Backend: http://localhost:5000 && echo ✅ Toggle Bot Ativo/Inativo && echo ════════════════════════════════════════ && echo. && npm run dev -- --port 5177"
timeout /t 3 /nobreak >nul

:: 9. Landing Page (PORTA ESPECIFICADA: 5173 - COM SCROLL LIVRE!)
echo    [9/10] Landing Page (porta 5173 - SCROLL LIVRE)...
if exist "D:\Helix\HelixAI\AIra_Landing" (
    start "Landing Page - Port 5173" cmd /k "cd /d D:\Helix\HelixAI\AIra_Landing && color 0B && echo ════════════════════════════════════════ && echo 🌐 AIra Landing Page ^(SCROLL LIVRE^) && echo 📍 URL: http://localhost:5173/ && echo ✅ Sistema de Níveis REMOVIDO && echo ✅ Scroll livre em todas seções && echo ════════════════════════════════════════ && echo. && npm run dev -- --port 5173"
    timeout /t 2 /nobreak >nul
)

echo.
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║              ✅ SISTEMA INICIADO COM SUCESSO!                   ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo ┌────────────────────────────────────────────────────────────────┐
echo │ 🎯 TESTE O BOT AGORA:                                          │
echo ├────────────────────────────────────────────────────────────────┤
echo │                                                                │
echo │ 1. Acesse o CRM Cliente: http://localhost:5177/               │
echo │    - Email VendeAI: demo@vendeai.com                           │
echo │    - Senha VendeAI: demo123                                    │
echo │                                                                │
echo │ 2. Vá em "Bot WhatsApp" e conecte (escanear QR Code)           │
echo │                                                                │
echo │ 3. ATIVE O BOT usando o toggle verde no topo!                  │
echo │    (Toggle: Verde = Ativo, Cinza = Pausado)                    │
echo │                                                                │
echo │ 4. Envie mensagem de teste pelo WhatsApp                       │
echo │                                                                │
echo └────────────────────────────────────────────────────────────────┘
echo.
echo ┌────────────────────────────────────────────────────────────────┐
echo │ 🌐 URLs DO SISTEMA (ATUALIZADAS):                              │
echo ├────────────────────────────────────────────────────────────────┤
echo │                                                                │
echo │ Landing Page (SCROLL LIVRE): http://localhost:5173/           │
echo │ CRM Admin:                   http://localhost:5175/           │
echo │ CRM Cliente (VendeAI):       http://localhost:5177/           │
echo │                                                                │
echo │ VendeAI Backend Flask:       http://localhost:5000/           │
echo │ VendeAI Dashboard:           http://localhost:5000/           │
echo │ VendeAI CRM API:             http://localhost:5000/api/crm/*  │
echo │                                                                │
echo │ VendeAI Bot API:             http://localhost:3010/api/bot/*  │
echo │ VendeAI WebSocket:           ws://localhost:3010/ws           │
echo │ AIra Auto Bot:               http://localhost:4000/health     │
echo │ AIra Imob Bot:               http://localhost:4001/health     │
echo │                                                                │
echo │ Webhook Publico:             https://meuapp.loca.lt           │
echo │                                                                │
echo └────────────────────────────────────────────────────────────────┘
echo.
echo ⚡ NOVIDADES NESTA VERSÃO:
echo.
echo    ✅ Landing Page: Scroll LIVRE (sistema de níveis removido)
echo    ✅ CRM Cliente: Toggle Ativar/Desativar Bot
echo    ✅ Sincronização com banco de dados (bot_ativo)
echo    ✅ Badges de status em tempo real
echo    ✅ Notificações de sucesso/erro
echo.
echo ⚠️ FLUXO DE MENSAGENS (ATUALIZADO):
echo.
echo    WhatsApp (Bot Engine - porta 3010)
echo           ↓
echo    Bot API Server (porta 3010) - WebSocket + Status
echo           ↓
echo    CRM Cliente (porta 5177) - Exibe QR Code, Status e TOGGLE BOT
echo           ↓
echo    Banco de Dados - Salva bot_ativo (true/false)
echo.
echo    OU (se integrado com Backend Flask):
echo.
echo    Backend Flask (porta 5000) - Verifica se bot_ativo = true
echo           ↓
echo    AIra Auto/Imob Bot - Processa com IA + ElevenLabs
echo           ↓
echo    Bot Engine (porta 3010) - Envia resposta WhatsApp
echo.
echo.
echo ⚠️ IMPORTANTE:
echo    - Todos os serviços já estão rodando!
echo    - Aguarde mais 30 segundos para garantir que tudo carregou
echo    - Mantenha esta janela aberta durante os testes
echo    - ATIVE o bot usando o toggle no CRM Cliente!
echo.
echo 📝 CHECKLIST ANTES DE TESTAR:
echo    [ ] VendeAI Backend iniciado (porta 5000)
echo    [ ] VendeAI Bot Engine + API Server rodando (porta 3010)
echo    [ ] CRM Cliente acessível (porta 5177)
echo    [ ] Landing Page acessível (porta 5173 - scroll livre!)
echo    [ ] WhatsApp conectado via QR Code
echo    [ ] Bot ATIVADO usando toggle verde no CRM Cliente
echo    [ ] WebSocket conectado (verificar console do navegador)
echo.
echo 🆕 ENDPOINTS DA API PARA TOGGLE BOT:
echo    GET  http://localhost:5000/api/bot-config/{empresaId}
echo    PUT  http://localhost:5000/api/bot-config/{empresaId}/toggle
echo    Body: { "bot_ativo": true/false }
echo.
pause
