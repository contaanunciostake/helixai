@echo off
chcp 65001 >nul
title AIra - Sistema Completo
color 0A

cls
echo ========================================================
echo              AIra - INICIALIZACAO AUTOMATICA
echo ========================================================
echo.
echo [INFO] Iniciando sistema...
echo.

REM ============================================================
REM PASSO 1: VERIFICAR MYSQL
REM ============================================================
echo [1/4] Verificando MySQL...
echo.

tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I /N "mysqld.exe">NUL
if %ERRORLEVEL% EQU 0 (
    echo OK - MySQL rodando
) else (
    echo AVISO - MySQL nao esta rodando!
    echo Por favor, inicie o MySQL no XAMPP Control Panel
    echo.
    pause
)
echo.

REM ============================================================
REM PASSO 2: LIMPAR CACHE
REM ============================================================
echo [2/4] Limpando cache...
echo.

if exist "D:\Helix\HelixAI\CRM_Client\crm-client-app\node_modules\.cache" (
    rd /s /q "D:\Helix\HelixAI\CRM_Client\crm-client-app\node_modules\.cache" 2>nul
)
if exist "D:\Helix\HelixAI\CRM_Client\crm-client-app\node_modules\.vite" (
    rd /s /q "D:\Helix\HelixAI\CRM_Client\crm-client-app\node_modules\.vite" 2>nul
)

echo OK - Cache limpo
echo.

REM ============================================================
REM PASSO 3: VERIFICAR NODE_MODULES
REM ============================================================
echo [3/4] Verificando dependencias...
echo.

if not exist "D:\Helix\HelixAI\whatsapp_service\node_modules" (
    echo Instalando dependencias do WhatsApp Service...
    cd /d "D:\Helix\HelixAI\whatsapp_service"
    call npm install
)

if not exist "D:\Helix\HelixAI\CRM_Client\crm-client-app\node_modules" (
    echo Instalando dependencias do CRM Cliente...
    cd /d "D:\Helix\HelixAI\CRM_Client\crm-client-app"
    call npm install
)

echo OK - Dependencias verificadas
echo.

REM ============================================================
REM PASSO 4: INICIAR SERVICOS
REM ============================================================
echo [4/4] Iniciando servicos...
echo.

REM 1. Backend Flask (porta 5000)
echo    [1/3] Backend Flask (porta 5000)...
start "Backend Flask" cmd /k "cd /d D:\Helix\HelixAI\backend && python -m flask run --host=0.0.0.0 --port=5000"
timeout /t 5 /nobreak >nul

REM 2. Integrated Bot Server (porta 3010)
echo    [2/3] Integrated Bot Server (porta 3010)...
start "Bot Server" cmd /k "cd /d D:\Helix\HelixAI\whatsapp_service && node integrated-bot-server.js"
timeout /t 5 /nobreak >nul

REM 3. CRM Cliente (porta 5177)
echo    [3/3] CRM Cliente (porta 5177)...
start "CRM Cliente" cmd /k "cd /d D:\Helix\HelixAI\CRM_Client\crm-client-app && npm run dev -- --port 5177"
timeout /t 3 /nobreak >nul

echo.
echo ========================================================
echo              SISTEMA INICIADO COM SUCESSO!
echo ========================================================
echo.
echo URLs do Sistema:
echo   CRM Cliente: http://localhost:5177/
echo   Backend API: http://localhost:5000/
echo   Bot Server:  http://localhost:3010/
echo.
echo Login CRM:
echo   Email: demo@vendeai.com
echo   Senha: demo123
echo.
echo IMPORTANTE:
echo   - Aguarde 30 segundos para tudo carregar
echo   - Va em "Bot WhatsApp" para conectar
echo   - Ative o bot usando o toggle verde
echo.
pause
