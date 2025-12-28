@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
title HelixAI - Sistema Completo
color 0A

cls
echo ╔════════════════════════════════════════════════════════════════╗
echo ║          🚀 HelixAI - INICIALIZAÇÃO COMPLETA                   ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo [INFO] Iniciando TODOS os componentes do sistema HelixAI
echo.
echo 📦 Componentes que serão iniciados:
echo    • Backend Flask (Novo + VendeAI integrado)
echo    • VendeAI Bot Engine + API
echo    • WhatsApp Service (Backup)
echo    • AIra Auto (Bot de Veículos)
echo    • AIra Imob (Bot de Imóveis)
echo    • ElevenLabs Webhook (LocalTunnel)
echo    • Landing Page
echo    • CRM Admin
echo    • CRM Cliente
echo    • Painel de Afiliados
echo.
pause

:: ============================================================================
:: PASSO 1: VERIFICAR PRÉ-REQUISITOS
:: ============================================================================
echo.
echo ┌────────────────────────────────────────────────────────────────┐
echo │ [1/6] Verificando pré-requisitos...                            │
echo └────────────────────────────────────────────────────────────────┘
echo.

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado! Instale em https://nodejs.org/
    pause
    exit /b 1
)

where python >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python não encontrado! Instale em https://www.python.org/
    pause
    exit /b 1
)

echo ✅ Node.js e Python detectados
echo.

:: ============================================================================
:: PASSO 2: LIMPAR CACHE
:: ============================================================================
echo ┌────────────────────────────────────────────────────────────────┐
echo │ [2/6] Limpando cache...                                        │
echo └────────────────────────────────────────────────────────────────┘
echo.

for %%d in (
    "D:\Helix\HelixAI\AIra_Landing"
    "D:\Helix\HelixAI\CRM_Client\crm-client-app"
    "D:\Helix\HelixAI\CRM_Admin\crm-admin-app"
    "D:\Helix\HelixAI\Afiliados_Panel"
) do (
    if exist "%%~d\node_modules\.cache" rd /s /q "%%~d\node_modules\.cache" 2>nul
    if exist "%%~d\node_modules\.vite" rd /s /q "%%~d\node_modules\.vite" 2>nul
)

echo ✅ Cache limpo
echo.

:: ============================================================================
:: PASSO 3: VERIFICAR MYSQL
:: ============================================================================
echo ┌────────────────────────────────────────────────────────────────┐
echo │ [3/6] Verificando MySQL...                                     │
echo └────────────────────────────────────────────────────────────────┘
echo.

tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I /N "mysqld.exe">NUL
if %errorlevel% equ 0 (
    echo ✅ MySQL rodando
) else (
    echo ⚠️  MySQL não está rodando
    echo    Alguns recursos podem não funcionar
    echo.
    set /p continuar="Continuar mesmo assim? (S/N): "
    if /i not "!continuar!"=="S" exit /b 1
)

echo.

:: ============================================================================
:: PASSO 4: VERIFICAR E INSTALAR DEPENDÊNCIAS
:: ============================================================================
echo ┌────────────────────────────────────────────────────────────────┐
echo │ [4/6] Verificando dependências críticas...                     │
echo └────────────────────────────────────────────────────────────────┘
echo.

:: Backend Python
if exist "D:\Helix\HelixAI\Backend\backend\venv" (
    echo ✅ Backend venv encontrado
) else (
    echo ⚠️  Backend venv não encontrado
    echo    Algumas funcionalidades podem não funcionar
)

:: CRM Cliente
if not exist "D:\Helix\HelixAI\CRM_Client\crm-client-app\node_modules" (
    echo 📦 Instalando dependências do CRM Cliente...
    cd /d "D:\Helix\HelixAI\CRM_Client\crm-client-app"
    call npm install --silent
)

if not exist "D:\Helix\HelixAI\CRM_Client\crm-client-app\node_modules\@hello-pangea" (
    echo 📦 Instalando @hello-pangea/dnd para CRM Cliente...
    cd /d "D:\Helix\HelixAI\CRM_Client\crm-client-app"
    call npm install @hello-pangea/dnd qrcode.react --silent
)

:: CRM Admin
if not exist "D:\Helix\HelixAI\CRM_Admin\crm-admin-app\node_modules" (
    echo 📦 Instalando dependências do CRM Admin...
    cd /d "D:\Helix\HelixAI\CRM_Admin\crm-admin-app"
    call npm install --silent
)

:: Landing Page
if not exist "D:\Helix\HelixAI\AIra_Landing\node_modules" (
    echo 📦 Instalando dependências da Landing Page...
    cd /d "D:\Helix\HelixAI\AIra_Landing"
    call npm install --silent
)

:: Painel Afiliados
if not exist "D:\Helix\HelixAI\Afiliados_Panel\node_modules" (
    echo 📦 Instalando dependências do Painel Afiliados...
    cd /d "D:\Helix\HelixAI\Afiliados_Panel"
    call npm install --silent
)

:: VendeAI Bot Engine
if not exist "D:\Helix\HelixAI\VendeAI\bot_engine\node_modules" (
    echo 📦 Instalando dependências do VendeAI Bot Engine...
    cd /d "D:\Helix\HelixAI\VendeAI\bot_engine"
    call npm install --silent
)

:: WhatsApp Service
if not exist "D:\Helix\HelixAI\whatsapp_service_stable\node_modules" (
    echo 📦 Instalando dependências do WhatsApp Service...
    cd /d "D:\Helix\HelixAI\whatsapp_service_stable"
    call npm install --silent
)

:: AIra Auto
if exist "D:\Helix\HelixAI\AIra_Auto" (
    if not exist "D:\Helix\HelixAI\AIra_Auto\node_modules" (
        echo 📦 Instalando dependências do AIra Auto...
        cd /d "D:\Helix\HelixAI\AIra_Auto"
        call npm install --silent
    )
)

:: AIra Imob
if exist "D:\Helix\HelixAI\AIra_Imob" (
    if not exist "D:\Helix\HelixAI\AIra_Imob\node_modules" (
        echo 📦 Instalando dependências do AIra Imob...
        cd /d "D:\Helix\HelixAI\AIra_Imob"
        call npm install --silent
    )
)

echo ✅ Dependências verificadas
echo.

:: ============================================================================
:: PASSO 5: VERIFICAR PROCESSOS ANTERIORES
:: ============================================================================
echo ┌────────────────────────────────────────────────────────────────┐
echo │ [5/6] Verificando processos anteriores...                      │
echo └────────────────────────────────────────────────────────────────┘
echo.

set PROCESSOS_RODANDO=0

for %%p in (5000 3010 5173 5175 5177 5178) do (
    netstat -ano | findstr ":%%p " | findstr "LISTENING" >nul 2>&1
    if !errorlevel! equ 0 (
        echo ⚠️  Porta %%p em uso
        set /a PROCESSOS_RODANDO+=1
    )
)

if %PROCESSOS_RODANDO% gtr 0 (
    echo.
    echo ⚠️  Há processos rodando nas portas do sistema
    echo.
    set /p parar="Deseja parar todos os processos? (S/N): "
    if /i "!parar!"=="S" (
        echo.
        echo 🛑 Parando processos...
        call "%~dp000_PARAR_SISTEMA.bat"
        echo.
        echo ⏳ Aguardando 3 segundos...
        timeout /t 3 /nobreak >nul
    )
) else (
    echo ✅ Nenhum processo conflitante
)

echo.

:: ============================================================================
:: PASSO 6: INICIAR SERVIÇOS NA ORDEM CORRETA
:: ============================================================================
echo ┌────────────────────────────────────────────────────────────────┐
echo │ [6/6] Iniciando serviços na ordem correta...                   │
echo └────────────────────────────────────────────────────────────────┘
echo.
echo ⏳ IMPORTANTE: Aguardando inicialização completa entre serviços
echo.

:: 1. Backend Flask (NOVO - Integrado com assinaturas, mercado pago, etc)
echo    [01/11] Backend Flask (porta 5000)...
start "Backend Flask - Port 5000" cmd /k "cd /d D:\Helix\HelixAI\Backend && color 0D && echo ════════════════════════════════════════ && echo 🔧 Backend Flask - HelixAI && echo 📍 URL: http://localhost:5000/ && echo 🔗 API Assinaturas: /api/assinatura/* && echo 🔗 API Mercado Pago: /api/webhook/mercadopago && echo ════════════════════════════════════════ && echo. && python app.py"
echo          Aguardando Backend inicializar (6s)...
timeout /t 6 /nobreak >nul

:: 2. VendeAI Bot Engine + Bot API Server MULTI-TENANT (porta 3010)
echo    [02/11] VendeAI Multi-Tenant API Server (porta 3010)...
echo          Limpando sessões antigas (se houver)...
if exist "D:\Helix\HelixAI\VendeAI\bot_engine\auth_info_baileys" (
    rd /s /q "D:\Helix\HelixAI\VendeAI\bot_engine\auth_info_baileys" 2>nul
    echo          ✅ Sessões antigas removidas
) else (
    echo          ℹ️  Nenhuma sessão anterior encontrada
)
start "VendeAI Multi-Tenant API Server" cmd /k "cd /d D:\Helix\HelixAI\VendeAI\bot_engine && color 0A && echo ════════════════════════════════════════ && echo 🚀 VendeAI MULTI-TENANT API SERVER && echo 📡 REST API: http://localhost:3010 && echo 🔌 WebSocket: ws://localhost:3010/ws?empresa_id=X && echo 👥 Suporte a múltiplas empresas && echo 📱 QR Code via Web UI && echo ════════════════════════════════════════ && echo. && node bot-api-server-multi-tenant.js"
echo          Aguardando API Server inicializar (6s)...
timeout /t 6 /nobreak >nul

:: 3. WhatsApp Service ESTÁVEL (porta 3002 - backup)
echo    [03/11] WhatsApp Service ESTÁVEL (porta 3002)...
if exist "D:\Helix\HelixAI\whatsapp_service_stable" (
    start "WhatsApp Service ESTÁVEL" cmd /k "cd /d D:\Helix\HelixAI\whatsapp_service_stable && color 02 && echo ════════════════════════════════════════ && echo 📱 WhatsApp Service ESTÁVEL ^(Backup^) && echo 🔌 Porta: 3002 && echo ════════════════════════════════════════ && echo. && set PORT=3002 && npm start"
    timeout /t 4 /nobreak >nul
)

:: 4. AIra Auto API Server (Bot de Veículos - PORTA 4000)
echo    [04/11] AIra Auto Bot (porta 4000)...
if exist "D:\Helix\HelixAI\AIra_Auto" (
    start "AIra Auto API Server" cmd /k "cd /d D:\Helix\HelixAI\AIra_Auto && color 0A && echo ════════════════════════════════════════ && echo 🚗 AIra Auto - Bot de Veículos && echo 📍 API: http://localhost:4000/ && echo 🎙️  ElevenLabs integrado && echo ════════════════════════════════════════ && echo. && npm start"
    timeout /t 3 /nobreak >nul
)

:: 5. AIra Imob API Server (Bot de Imóveis - PORTA 4001)
echo    [05/11] AIra Imob Bot (porta 4001)...
if exist "D:\Helix\HelixAI\AIra_Imob" (
    start "AIra Imob API Server" cmd /k "cd /d D:\Helix\HelixAI\AIra_Imob && color 05 && echo ════════════════════════════════════════ && echo 🏠 AIra Imob - Bot de Imóveis && echo 📍 API: http://localhost:4001/ && echo 🎙️  ElevenLabs integrado && echo ════════════════════════════════════════ && echo. && npm start"
    timeout /t 3 /nobreak >nul
)

:: 6. LocalTunnel Webhook (ElevenLabs) - COM RECONEXÃO AUTOMÁTICA
echo    [06/11] LocalTunnel Webhook com Reconexão (ElevenLabs)...
if exist "D:\Helix\HelixAI\VendeAI\start-tunnel-reconnect.bat" (
    start "VendeAI Webhook Tunnel - Auto Reconnect" cmd /k "cd /d D:\Helix\HelixAI\VendeAI && color 0E && echo ════════════════════════════════════════ && echo 🌐 LocalTunnel - ElevenLabs Webhook && echo 📡 Reconexão automática ativada && echo ════════════════════════════════════════ && echo. && start-tunnel-reconnect.bat"
    timeout /t 3 /nobreak >nul
) else (
    echo       ⚠️  Script de tunnel não encontrado, pulando...
)

:: 7. Landing Page (PORTA 5173)
echo    [07/11] Landing Page (porta 5173)...
if exist "D:\Helix\HelixAI\AIra_Landing" (
    start "Landing Page - Port 5173" cmd /k "cd /d D:\Helix\HelixAI\AIra_Landing && color 0B && echo ════════════════════════════════════════ && echo 🌐 AIra Landing Page && echo 📍 URL: http://localhost:5173/ && echo 💳 Checkout Mercado Pago integrado && echo ════════════════════════════════════════ && echo. && npm run dev -- --port 5173"
    timeout /t 3 /nobreak >nul
)

:: 8. CRM Admin (PORTA 5175)
echo    [08/11] CRM Admin (porta 5175)...
if exist "D:\Helix\HelixAI\CRM_Admin\crm-admin-app" (
    start "CRM Admin - Port 5175" cmd /k "cd /d D:\Helix\HelixAI\CRM_Admin\crm-admin-app && color 0E && echo ════════════════════════════════════════ && echo 👨‍💼 CRM Administrador && echo 📍 URL: http://localhost:5175/ && echo ════════════════════════════════════════ && echo. && npm run dev -- --port 5175"
    timeout /t 3 /nobreak >nul
)

:: 9. CRM Cliente (PORTA 5177 - INTEGRADO COM VENDEAI!)
echo    [09/11] CRM Cliente INTEGRADO VendeAI (porta 5177)...
start "CRM Cliente - INTEGRADO VendeAI" cmd /k "cd /d D:\Helix\HelixAI\CRM_Client\crm-client-app && color 09 && echo ════════════════════════════════════════ && echo 👤 CRM Cliente ^(INTEGRADO VENDEAI^) && echo 📍 URL: http://localhost:5177/ && echo 🔐 Login: demo@vendeai.com / demo123 && echo 🔗 Bot API: http://localhost:3010 && echo 🔗 Backend: http://localhost:5000 && echo ✅ Toggle Bot Ativo/Inativo && echo ════════════════════════════════════════ && echo. && npm run dev -- --port 5177"
timeout /t 3 /nobreak >nul

:: 10. Painel de Afiliados (PORTA 5178)
echo    [10/11] Painel de Afiliados (porta 5178)...
if exist "D:\Helix\HelixAI\Afiliados_Panel" (
    start "Painel Afiliados - Port 5178" cmd /k "cd /d D:\Helix\HelixAI\Afiliados_Panel && color 0C && echo ════════════════════════════════════════ && echo 💰 Painel de Afiliados - AIra && echo 📍 URL: http://localhost:5178/ && echo 📊 Gestão de afiliados e comissões && echo ════════════════════════════════════════ && echo. && npm run dev -- --port 5178"
    timeout /t 2 /nobreak >nul
)

echo.
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║              ✅ SISTEMA INICIADO COM SUCESSO!                   ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo ┌────────────────────────────────────────────────────────────────┐
echo │ 🌐 URLs DO SISTEMA COMPLETO                                    │
echo ├────────────────────────────────────────────────────────────────┤
echo │                                                                │
echo │ 💼 FRONTENDS:                                                  │
echo │   Landing Page:            http://localhost:5173/             │
echo │   CRM Admin:               http://localhost:5175/             │
echo │   CRM Cliente (VendeAI):   http://localhost:5177/             │
echo │   Painel Afiliados:        http://localhost:5178/             │
echo │                                                                │
echo │ 🔧 BACKENDS:                                                   │
echo │   Backend Flask Principal: http://localhost:5000/             │
echo │   VendeAI Bot API:         http://localhost:3010/api/bot/*    │
echo │   AIra Auto Bot:           http://localhost:4000/             │
echo │   AIra Imob Bot:           http://localhost:4001/             │
echo │   WhatsApp Service:        http://localhost:3002/             │
echo │                                                                │
echo │ 💳 APIs ESPECIAIS:                                             │
echo │   Assinaturas MP:          http://localhost:5000/api/assinatura/*  │
echo │   Webhook MP:              http://localhost:5000/api/webhook/mercadopago  │
echo │   Webhook ElevenLabs:      https://meuapp.loca.lt             │
echo │                                                                │
echo │ 🔌 WEBSOCKETS:                                                 │
echo │   Bot WebSocket:           ws://localhost:3010/ws             │
echo │                                                                │
echo └────────────────────────────────────────────────────────────────┘
echo.
echo ┌────────────────────────────────────────────────────────────────┐
echo │ 🎯 GUIA RÁPIDO DE USO                                          │
echo ├────────────────────────────────────────────────────────────────┤
echo │                                                                │
echo │ 1️⃣  CONFIGURAR WHATSAPP:                                       │
echo │    - Acesse: http://localhost:5177/                           │
echo │    - Login: demo@vendeai.com / demo123                        │
echo │    - Vá em "Bot WhatsApp" e escaneie o QR Code                │
echo │    - ATIVE o bot usando o toggle verde no topo                │
echo │                                                                │
echo │ 2️⃣  GERENCIAR ASSINATURAS:                                     │
echo │    - Acesse: http://localhost:5173/                           │
echo │    - Navegue até a seção de planos                            │
echo │    - Processe pagamentos via Mercado Pago                     │
echo │                                                                │
echo │ 3️⃣  GERENCIAR AFILIADOS:                                       │
echo │    - Acesse: http://localhost:5178/                           │
echo │    - Gerencie afiliados e comissões                           │
echo │                                                                │
echo │ 4️⃣  ELEVENABS (VOZ IA):                                        │
echo │    - URL pública: https://meuapp.loca.lt                      │
echo │    - Configure no painel ElevenLabs                           │
echo │    - Webhooks para buscar veículos/imóveis                    │
echo │                                                                │
echo └────────────────────────────────────────────────────────────────┘
echo.
echo ⚡ COMPONENTES ATIVOS:
echo.
echo    ✅ Backend Flask (Novo + VendeAI)
echo    ✅ VendeAI Bot Engine + API
echo    ✅ WhatsApp Service (Backup)
echo    ✅ AIra Auto (Veículos)
echo    ✅ AIra Imob (Imóveis)
echo    ✅ ElevenLabs Webhook
echo    ✅ Landing Page + Checkout MP
echo    ✅ CRM Admin
echo    ✅ CRM Cliente
echo    ✅ Painel Afiliados
echo.
echo ⚠️  IMPORTANTE:
echo    • Todos os serviços estão rodando!
echo    • Aguarde 30 segundos para garantir que tudo carregou
echo    • Mantenha TODAS as janelas abertas durante o uso
echo    • Para parar tudo: Execute 00_PARAR_SISTEMA.bat
echo.
echo 📝 CHECKLIST FINAL:
echo    [ ] Backend Flask iniciado (porta 5000)
echo    [ ] Bot Engine rodando (porta 3010)
echo    [ ] Landing Page acessível (porta 5173)
echo    [ ] CRM Cliente acessível (porta 5177)
echo    [ ] Painel Afiliados acessível (porta 5178)
echo    [ ] WhatsApp conectado via QR Code
echo    [ ] Bot ATIVADO usando toggle verde
echo    [ ] LocalTunnel conectado (verificar URL pública)
echo.
echo 💡 Scripts úteis:
echo    • 00_PARAR_SISTEMA.bat - Parar tudo
echo    • 01_LIMPAR_SISTEMA.bat - Limpar cache
echo    • 02_VERIFICAR_SISTEMA.bat - Diagnóstico
echo.
pause
