@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: Rodar o diagnóstico em uma nova janela que não fecha
if "%1" neq "RUN" (
    start "Diagnóstico do Sistema" cmd /k "%~f0 RUN"
    exit /b
)

title Diagnostico do Sistema
color 0E
cls
echo ╔════════════════════════════════════════════════════════════════╗
echo ║              🔍 DIAGNÓSTICO DO SISTEMA                         ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

:: ============================================================================
:: VERIFICAR NODE.JS
:: ============================================================================
echo [1/8] Verificando Node.js...
node --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✓ Node.js instalado: !NODE_VERSION!
) else (
    echo ✗ Node.js NAO ENCONTRADO!
    echo   Instale em: https://nodejs.org/
)
echo.

:: ============================================================================
:: VERIFICAR NPM
:: ============================================================================
echo [2/8] Verificando NPM...
npm --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo ✓ NPM instalado: !NPM_VERSION!
) else (
    echo ✗ NPM NAO ENCONTRADO!
)
echo.

:: ============================================================================
:: VERIFICAR PYTHON
:: ============================================================================
echo [3/8] Verificando Python...
python --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%i in ('python --version') do set PYTHON_VERSION=%%i
    echo ✓ Python instalado: !PYTHON_VERSION!
) else (
    echo ✗ Python NAO ENCONTRADO!
)
echo.

:: ============================================================================
:: VERIFICAR MYSQL
:: ============================================================================
echo [4/8] Verificando MySQL...
tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I /N "mysqld.exe">NUL
if %ERRORLEVEL% EQU 0 (
    echo ✓ MySQL rodando
) else (
    echo ⚠ MySQL nao esta rodando
)
echo.

:: ============================================================================
:: VERIFICAR DEPENDENCIAS VENDEAI
:: ============================================================================
echo [5/8] Verificando dependencias VendeAI...

if exist "D:\Helix\HelixAI\VendeAI\whatsapp_service\node_modules" (
    echo ✓ VendeAI WhatsApp Service - node_modules OK
) else (
    echo ✗ VendeAI WhatsApp Service - node_modules FALTANDO
    echo   Execute: cd VendeAI\whatsapp_service ^&^& npm install
)

if exist "D:\Helix\HelixAI\VendeAI\bot_engine\node_modules" (
    echo ✓ VendeAI Bot Engine - node_modules OK
) else (
    echo ✗ VendeAI Bot Engine - node_modules FALTANDO
    echo   Execute: cd VendeAI\bot_engine ^&^& npm install
)
echo.

:: ============================================================================
:: VERIFICAR DEPENDENCIAS CRM
:: ============================================================================
echo [6/8] Verificando dependencias CRM...

if exist "D:\Helix\HelixAI\CRM_Client\crm-client-app\node_modules" (
    echo ✓ CRM Cliente - node_modules OK
) else (
    echo ✗ CRM Cliente - node_modules FALTANDO
    echo   Execute: cd CRM_Client\crm-client-app ^&^& npm install
)

if exist "D:\Helix\HelixAI\CRM_Admin\crm-admin-app\node_modules" (
    echo ✓ CRM Admin - node_modules OK
) else (
    echo ✗ CRM Admin - node_modules FALTANDO
    echo   Execute: cd CRM_Admin\crm-admin-app ^&^& npm install
)

if exist "D:\Helix\HelixAI\AIra_Landing\node_modules" (
    echo ✓ Landing Page - node_modules OK
) else (
    echo ✗ Landing Page - node_modules FALTANDO
    echo   Execute: cd AIra_Landing ^&^& npm install
)
echo.

:: ============================================================================
:: VERIFICAR PORTAS EM USO
:: ============================================================================
echo [7/8] Verificando portas em uso...

netstat -ano | findstr :5000 | findstr LISTENING >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ⚠ Porta 5000 EM USO
) else (
    echo ✓ Porta 5000 livre
)

netstat -ano | findstr :3001 | findstr LISTENING >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ⚠ Porta 3001 EM USO
) else (
    echo ✓ Porta 3001 livre
)

netstat -ano | findstr :5173 | findstr LISTENING >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ⚠ Porta 5173 EM USO
) else (
    echo ✓ Porta 5173 livre
)
echo.

:: ============================================================================
:: VERIFICAR BANCO DE DADOS
:: ============================================================================
echo [8/8] Verificando banco de dados VendeAI...
if exist "D:\Helix\HelixAI\VendeAI\vendeai.db" (
    echo ✓ Banco de dados VendeAI encontrado
) else (
    echo ⚠ Banco de dados VendeAI nao encontrado (sera criado automaticamente)
)
echo.

:: ============================================================================
:: RESUMO
:: ============================================================================
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║              📊 RESUMO DO DIAGNOSTICO                          ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo Se algum item acima mostrou ✗ ou ⚠, corrija antes de iniciar!
echo.
echo Proximos passos:
echo   1. Se node_modules estiver faltando, instale as dependencias
echo   2. Se portas estiverem em uso, execute LIMPAR_PORTAS.bat
echo   3. Depois execute INICIAR_SISTEMA.bat
echo.
pause
