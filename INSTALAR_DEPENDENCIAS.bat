@echo off
chcp 65001 >nul
title Instalando Dependências - HelixAI
color 0E
setlocal enabledelayedexpansion

cls
echo ╔════════════════════════════════════════════════════════════════╗
echo ║         📦 INSTALANDO DEPENDÊNCIAS - HELIXAI                   ║
╚════════════════════════════════════════════════════════════════╝
echo.
echo Este processo pode demorar alguns minutos...
echo.
pause

set ERRO=0

:: Backend Python
echo.
echo ════════════════════════════════════════════════════════════════
echo [1/7] Backend Flask (Python)...
echo ════════════════════════════════════════════════════════════════
cd /d "D:\Helix\HelixAI\backend"

if not exist "venv" (
    echo Criando ambiente virtual Python...
    python -m venv venv
)

echo Ativando ambiente virtual...
call venv\Scripts\activate.bat

echo Instalando dependências Python...
pip install flask flask-cors flask-login python-dotenv sqlalchemy pymysql cryptography

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Erro ao instalar dependências do Backend
    set ERRO=1
) else (
    echo ✅ Backend OK
)

:: Landing Page
echo.
echo ════════════════════════════════════════════════════════════════
echo [2/7] Landing Page (React)...
echo ════════════════════════════════════════════════════════════════
cd /d "D:\Helix\HelixAI\AIra_Landing"

if not exist "node_modules" (
    echo Instalando dependências...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Erro ao instalar dependências da Landing Page
        set ERRO=1
    ) else (
        echo ✅ Landing Page OK
    )
) else (
    echo ✅ Dependências já instaladas
)

:: CRM Cliente
echo.
echo ════════════════════════════════════════════════════════════════
echo [3/7] CRM Cliente (React)...
echo ════════════════════════════════════════════════════════════════
cd /d "D:\Helix\HelixAI\CRM_Client\crm-client-app"

if not exist "node_modules" (
    echo Instalando dependências...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Erro ao instalar dependências do CRM Cliente
        set ERRO=1
    ) else (
        echo ✅ CRM Cliente OK
    )
) else (
    echo ✅ Dependências já instaladas
)

:: CRM Admin
echo.
echo ════════════════════════════════════════════════════════════════
echo [4/7] CRM Admin (React)...
echo ════════════════════════════════════════════════════════════════
cd /d "D:\Helix\HelixAI\CRM_Admin\crm-admin-app"

if not exist "node_modules" (
    echo Instalando dependências...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Erro ao instalar dependências do CRM Admin
        set ERRO=1
    ) else (
        echo ✅ CRM Admin OK
    )
) else (
    echo ✅ Dependências já instaladas
)

:: WhatsApp Service
echo.
echo ════════════════════════════════════════════════════════════════
echo [5/7] WhatsApp Service (Node.js)...
echo ════════════════════════════════════════════════════════════════
cd /d "D:\Helix\HelixAI\whatsapp_service"

if not exist "node_modules" (
    echo Instalando dependências...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Erro ao instalar dependências do WhatsApp Service
        set ERRO=1
    ) else (
        echo ✅ WhatsApp Service OK
    )
) else (
    echo ✅ Dependências já instaladas
)

:: AIra Auto
echo.
echo ════════════════════════════════════════════════════════════════
echo [6/7] AIra Auto - Bot Veículos (Node.js)...
echo ════════════════════════════════════════════════════════════════
cd /d "D:\Helix\HelixAI\AIra_Auto"

if not exist "node_modules" (
    echo Instalando dependências...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Erro ao instalar dependências do AIra Auto
        set ERRO=1
    ) else (
        echo ✅ AIra Auto OK
    )
) else (
    echo ✅ Dependências já instaladas
)

:: AIra Imob
echo.
echo ════════════════════════════════════════════════════════════════
echo [7/7] AIra Imob - Bot Imóveis (Node.js)...
echo ════════════════════════════════════════════════════════════════
cd /d "D:\Helix\HelixAI\AIra_Imob"

if not exist "node_modules" (
    echo Instalando dependências...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Erro ao instalar dependências do AIra Imob
        set ERRO=1
    ) else (
        echo ✅ AIra Imob OK
    )
) else (
    echo ✅ Dependências já instaladas
)

echo.
echo ════════════════════════════════════════════════════════════════

if "%ERRO%"=="0" (
    echo.
    echo ╔════════════════════════════════════════════════════════════════╗
    echo ║           ✅ TODAS AS DEPENDÊNCIAS INSTALADAS!                  ║
    echo ╚════════════════════════════════════════════════════════════════╝
    echo.
    echo Agora você pode executar: INICIAR_TUDO.bat
) else (
    echo.
    echo ╔════════════════════════════════════════════════════════════════╗
    echo ║              ❌ HOUVE ERROS NA INSTALAÇÃO                       ║
    echo ╚════════════════════════════════════════════════════════════════╝
    echo.
    echo Verifique os erros acima e tente novamente.
)

echo.
pause
