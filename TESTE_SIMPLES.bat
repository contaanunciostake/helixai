@echo off
title DIAGNOSTICO - ESTA JANELA NAO FECHA
color 0E
chcp 65001 >nul

:inicio
cls
echo ╔════════════════════════════════════════════════════════════════╗
echo ║              🔍 DIAGNÓSTICO DO SISTEMA                         ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

echo [1] Node.js:
node --version 2>nul
if %ERRORLEVEL% NEQ 0 echo ✗ NAO INSTALADO
echo.

echo [2] NPM:
npm --version 2>nul
if %ERRORLEVEL% NEQ 0 echo ✗ NAO INSTALADO
echo.

echo [3] Python:
python --version 2>nul
if %ERRORLEVEL% NEQ 0 echo ✗ NAO INSTALADO
echo.

echo [4] VendeAI WhatsApp Service node_modules:
if exist "D:\Helix\HelixAI\VendeAI\whatsapp_service\node_modules" (
    echo ✓ OK
) else (
    echo ✗ FALTANDO - Execute: cd VendeAI\whatsapp_service ^&^& npm install
)
echo.

echo [5] VendeAI Bot Engine node_modules:
if exist "D:\Helix\HelixAI\VendeAI\bot_engine\node_modules" (
    echo ✓ OK
) else (
    echo ✗ FALTANDO - Execute: cd VendeAI\bot_engine ^&^& npm install
)
echo.

echo [6] CRM Cliente node_modules:
if exist "D:\Helix\HelixAI\CRM_Client\crm-client-app\node_modules" (
    echo ✓ OK
) else (
    echo ✗ FALTANDO - Execute: cd CRM_Client\crm-client-app ^&^& npm install
)
echo.

echo [7] Porta 5000 (Backend):
netstat -ano | findstr :5000 | findstr LISTENING >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ⚠ EM USO
) else (
    echo ✓ Livre
)
echo.

echo [8] Porta 3001 (WhatsApp):
netstat -ano | findstr :3001 | findstr LISTENING >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ⚠ EM USO
) else (
    echo ✓ Livre
)
echo.

echo [9] Porta 5173 (CRM Cliente):
netstat -ano | findstr :5173 | findstr LISTENING >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ⚠ EM USO
) else (
    echo ✓ Livre
)
echo.

echo ════════════════════════════════════════════════════════════════
echo.
echo Esta janela NAO vai fechar automaticamente.
echo.
echo Opcoes:
echo   [R] Atualizar diagnostico
echo   [L] Limpar portas
echo   [I] Iniciar sistema
echo   [S] Sair
echo.
set /p opcao=Escolha uma opcao:

if /i "%opcao%"=="R" goto inicio
if /i "%opcao%"=="L" (
    echo.
    echo Executando LIMPAR_PORTAS.bat...
    call LIMPAR_PORTAS.bat
    goto inicio
)
if /i "%opcao%"=="I" (
    echo.
    echo Executando INICIAR_SISTEMA.bat...
    call INICIAR_SISTEMA.bat
    goto inicio
)
if /i "%opcao%"=="S" exit

echo Opcao invalida!
timeout /t 2 >nul
goto inicio
