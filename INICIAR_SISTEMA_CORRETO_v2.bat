@echo off
title AIra - Sistema Completo
color 0A

cls
echo ========================================================================
echo                   AIra - INICIALIZACAO AUTOMATICA
echo ========================================================================
echo.
echo [INFO] Iniciando sistema completo...
echo.

REM ========================================================================
REM PASSO 1: LIMPAR CACHE (VITE + PYTHON)
REM ========================================================================
echo [1/5] Limpando cache...
echo.

REM Limpar cache Vite (Frontend)
cd /d "D:\Helix\HelixAI\AIra_Landing"
if exist "node_modules\.cache" rd /s /q "node_modules\.cache" 2>nul
if exist "node_modules\.vite" rd /s /q "node_modules\.vite" 2>nul

cd /d "D:\Helix\HelixAI\CRM_Client\crm-client-app"
if exist "node_modules\.cache" rd /s /q "node_modules\.cache" 2>nul
if exist "node_modules\.vite" rd /s /q "node_modules\.vite" 2>nul

cd /d "D:\Helix\HelixAI\CRM_Admin\crm-admin-app"
if exist "node_modules\.cache" rd /s /q "node_modules\.cache" 2>nul
if exist "node_modules\.vite" rd /s /q "node_modules\.vite" 2>nul

REM Limpar cache Python (Backend) - IMPORTANTE PARA ENUMS!
echo Limpando cache Python (backend)...
cd /d "D:\Helix\HelixAI\backend"
for /d /r . %%d in (__pycache__) do @if exist "%%d" rd /s /q "%%d" 2>nul
del /s /q *.pyc 2>nul
del /s /q *.pyo 2>nul

echo OK - Cache limpo (Vite + Python)
echo.

REM ========================================================================
REM PASSO 2: VERIFICAR MYSQL
REM ========================================================================
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

REM ========================================================================
REM PASSO 3: VERIFICAR PROCESSOS ANTERIORES
REM ========================================================================
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

REM ========================================================================
REM PASSO 4: INSTALAR DEPENDENCIAS CRITICAS
REM ========================================================================
echo [4/5] Verificando dependencias criticas...
echo.

REM WhatsApp Service
if not exist "D:\Helix\HelixAI\whatsapp_service\node_modules" (
    echo Instalando dependencias do WhatsApp Service...
    cd /d "D:\Helix\HelixAI\whatsapp_service"
    call npm install
)

REM CRM Cliente
if not exist "D:\Helix\HelixAI\CRM_Client\crm-client-app\node_modules" (
    echo Instalando dependencias do CRM Cliente...
    cd /d "D:\Helix\HelixAI\CRM_Client\crm-client-app"
    call npm install
) else (
    if not exist "D:\Helix\HelixAI\CRM_Client\crm-client-app\node_modules\@hello-pangea" (
        echo Instalando bibliotecas especiais do CRM Cliente...
        cd /d "D:\Helix\HelixAI\CRM_Client\crm-client-app"
        call npm install @hello-pangea/dnd qrcode.react
    )
)

REM CRM Admin
if not exist "D:\Helix\HelixAI\CRM_Admin\crm-admin-app\node_modules" (
    echo Instalando dependencias do CRM Admin...
    cd /d "D:\Helix\HelixAI\CRM_Admin\crm-admin-app"
    call npm install
)

REM Landing Page
if not exist "D:\Helix\HelixAI\AIra_Landing\node_modules" (
    echo Instalando dependencias da Landing Page...
    cd /d "D:\Helix\HelixAI\AIra_Landing"
    call npm install
)

REM VendeAI Bot Engine
if not exist "D:\Helix\HelixAI\VendeAI\VendeAI\bot_engine\node_modules" (
    echo Instalando dependencias do VendeAI Bot Engine...
    cd /d "D:\Helix\HelixAI\VendeAI\VendeAI\bot_engine"
    call npm install
)

echo OK - Dependencias verificadas
echo.

REM ========================================================================
REM PASSO 5: INICIAR SERVICOS (ORDEM CORRETA!)
REM ========================================================================
echo [5/5] Iniciando servicos na ordem correta...
echo.
echo IMPORTANTE: Aguardando inicializacao completa entre servicos
echo.

REM 1. Backend Flask (porta 5000)
echo    [1/9] Backend Flask (porta 5000)...
start "Backend Flask" cmd /k "cd /d D:\Helix\HelixAI\backend && color 0D && echo Backend Flask API - Porta 5000 && echo URL: http://localhost:5000/ && echo. && python -m flask run --host=0.0.0.0 --port=5000"
echo          Aguardando Backend Flask inicializar (8s)...
timeout /t 8 /nobreak >nul

REM 2. Integrated Bot Server MULTI-TENANT (porta 3010)
echo    [2/9] Integrated Bot Server MULTI-TENANT (porta 3010)...
start "Integrated Bot Server" cmd /k "cd /d D:\Helix\HelixAI\whatsapp_service && color 0A && echo Integrated Bot Server - VendeAI Multi-Tenant && echo Bot API: http://localhost:3010 && echo WebSocket: ws://localhost:3010/ws && echo. && node integrated-bot-server.js"
echo          Aguardando Integrated Bot Server inicializar (8s)...
timeout /t 8 /nobreak >nul

REM 3. AIra Auto Bot (porta 4000)
echo    [3/9] AIra Auto Bot (porta 4000)...
if exist "D:\Helix\HelixAI\AIra_Auto" (
    start "AIra Auto" cmd /k "cd /d D:\Helix\HelixAI\AIra_Auto && color 0A && echo AIra Auto Bot && echo API: http://localhost:4000/ && echo. && npm start"
    timeout /t 3 /nobreak >nul
)

REM 4. AIra Imob Bot (porta 4001)
echo    [4/9] AIra Imob Bot (porta 4001)...
if exist "D:\Helix\HelixAI\AIra_Imob" (
    start "AIra Imob" cmd /k "cd /d D:\Helix\HelixAI\AIra_Imob && color 05 && echo AIra Imob Bot && echo API: http://localhost:4001/ && echo. && npm start"
    timeout /t 3 /nobreak >nul
)

REM 5. LocalTunnel Webhook (ElevenLabs)
echo    [5/9] LocalTunnel Webhook (ElevenLabs)...
if exist "D:\Helix\HelixAI\VendeAI\start-tunnel-reconnect.bat" (
    start "Webhook Tunnel" cmd /k "cd /d D:\Helix\HelixAI\VendeAI && start-tunnel-reconnect.bat"
    timeout /t 3 /nobreak >nul
)

REM 6. CRM Admin (porta 5175)
echo    [6/9] CRM Admin (porta 5175)...
if exist "D:\Helix\HelixAI\CRM_Admin\crm-admin-app" (
    start "CRM Admin" cmd /k "cd /d D:\Helix\HelixAI\CRM_Admin\crm-admin-app && color 0E && echo CRM Administrador && echo URL: http://localhost:5175/ && echo. && npm run dev -- --port 5175"
    timeout /t 3 /nobreak >nul
)

REM 7. CRM Cliente (porta 5177) - INTEGRADO COM VENDEAI BOT
echo    [7/9] CRM Cliente INTEGRADO VendeAI (porta 5177)...
start "CRM Cliente" cmd /k "cd /d D:\Helix\HelixAI\CRM_Client\crm-client-app && color 09 && echo CRM Cliente - VendeAI Integration && echo URL: http://localhost:5177/ && echo Login: demo@vendeai.com / demo123 && echo. && npm run dev -- --port 5177"
timeout /t 3 /nobreak >nul

REM 8. Landing Page (porta 5173)
echo    [8/9] Landing Page (porta 5173)...
if exist "D:\Helix\HelixAI\AIra_Landing" (
    start "Landing Page" cmd /k "cd /d D:\Helix\HelixAI\AIra_Landing && color 0B && echo AIra Landing Page && echo URL: http://localhost:5173/ && echo. && npm run dev -- --port 5173"
    timeout /t 2 /nobreak >nul
)

echo.
echo.
echo ========================================================================
echo                    SISTEMA INICIADO COM SUCESSO!
echo ========================================================================
echo.
echo -----------------------------------------------------------------------
echo  TESTE O BOT AGORA:
echo -----------------------------------------------------------------------
echo.
echo  1. Acesse o CRM Cliente: http://localhost:5177/
echo     - Email VendeAI: demo@vendeai.com
echo     - Senha VendeAI: demo123
echo.
echo  2. Va em "Bot WhatsApp" e conecte (escanear QR Code)
echo.
echo  3. ATIVE O BOT usando o toggle verde no topo!
echo     (Toggle: Verde = Ativo, Cinza = Pausado)
echo.
echo  4. Envie mensagem de teste pelo WhatsApp
echo.
echo -----------------------------------------------------------------------
echo  URLs DO SISTEMA:
echo -----------------------------------------------------------------------
echo.
echo  Landing Page:            http://localhost:5173/
echo  CRM Admin:               http://localhost:5175/
echo  CRM Cliente (VendeAI):   http://localhost:5177/
echo.
echo  Backend Flask:           http://localhost:5000/
echo  Bot API:                 http://localhost:3010/api/bot/*
echo  WebSocket:               ws://localhost:3010/ws
echo  AIra Auto Bot:           http://localhost:4000/health
echo  AIra Imob Bot:           http://localhost:4001/health
echo.
echo -----------------------------------------------------------------------
echo  NOVIDADES DESTA VERSAO:
echo -----------------------------------------------------------------------
echo.
echo  - CRM Cliente: Toggle Ativar/Desativar Bot
echo  - Sincronizacao com banco de dados (bot_ativo)
echo  - Badges de status em tempo real
echo  - Notificacoes de sucesso/erro
echo.
echo -----------------------------------------------------------------------
echo  ARQUITETURA INTEGRADA - FLUXO COMPLETO:
echo -----------------------------------------------------------------------
echo.
echo  Cliente envia mensagem no WhatsApp
echo         v
echo  Baileys recebe (integrated-session-manager.js)
echo         v
echo  Bot Selector identifica nicho da empresa
echo         v
echo  VendeAI Bot Integration (se nicho = veiculos)
echo         v
echo  IA Master processa:
echo     - Modulo 01: Analise de intencoes
echo     - Modulo 02: Recomendacoes inteligentes
echo     - Modulo 03: Analise de sentimento
echo     - Modulo 04: Memoria e contexto
echo     - Modulo 05: Predicao de fechamento
echo     - Modulo 06: Geracao de resposta
echo         v
echo  Resposta personalizada enviada ao cliente
echo         v
echo  Estatisticas atualizadas no CRM (porta 5177)
echo.
echo -----------------------------------------------------------------------
echo  IMPORTANTE:
echo -----------------------------------------------------------------------
echo.
echo  - Todos os servicos ja estao rodando!
echo  - Aguarde mais 30 segundos para garantir que tudo carregou
echo  - Mantenha esta janela aberta durante os testes
echo  - ATIVE o bot usando o toggle no CRM Cliente!
echo.
echo -----------------------------------------------------------------------
echo  CHECKLIST ANTES DE TESTAR:
echo -----------------------------------------------------------------------
echo.
echo  [ ] Backend Flask iniciado (porta 5000)
echo  [ ] Integrated Bot Server rodando (porta 3010)
echo  [ ] CRM Cliente acessivel (porta 5177)
echo  [ ] Landing Page acessivel (porta 5173)
echo  [ ] Login no CRM (demo@vendeai.com / demo123)
echo  [ ] WhatsApp conectado via QR Code (secao Bot WhatsApp)
echo  [ ] Bot ATIVADO usando toggle verde no CRM
echo  [ ] WebSocket conectado (console do navegador)
echo  [ ] Empresa tem nicho 'veiculos' no banco de dados
echo.
echo -----------------------------------------------------------------------
echo  API ENDPOINTS DISPONIVEIS:
echo -----------------------------------------------------------------------
echo.
echo  BACKEND FLASK (5000):
echo    POST  /api/empresa/bot/toggle     - Toggle bot ativo/inativo
echo    GET   /api/bot-config/{id}        - Buscar config do bot
echo    GET   /api/stats/{id}             - Estatisticas
echo.
echo  INTEGRATED BOT SERVER (3010):
echo    GET   /api/bot/status/{id}        - Status da conexao
echo    POST  /api/bot/connect/{id}       - Conectar/gerar QR
echo    POST  /api/bot/disconnect/{id}    - Desconectar
echo    GET   /api/bot/sessions           - Listar sessoes ativas
echo    GET   /api/bot/nicho/{id}         - Ver nicho e bot type
echo    WS    ws://localhost:3010/ws?empresa_id={id}
echo.
pause
