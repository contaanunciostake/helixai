@echo off
chcp 65001 >nul
title Diagnóstico do Sistema - MANTENHA ESTA JANELA ABERTA
color 0E

cls
echo ╔════════════════════════════════════════════════════════════════╗
echo ║              🔍 DIAGNÓSTICO DO SISTEMA                         ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo IMPORTANTE: Esta janela NAO VAI FECHAR automaticamente!
echo.

echo ════════════════════════════════════════════════════════════════
echo [1/8] Verificando Node.js...
echo ════════════════════════════════════════════════════════════════
node --version 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ Node.js instalado
) else (
    echo ✗ Node.js NAO ENCONTRADO!
    echo   Instale em: https://nodejs.org/
)
echo.
echo Pressione qualquer tecla para continuar...
pause >nul

echo ════════════════════════════════════════════════════════════════
echo [2/8] Verificando NPM...
echo ════════════════════════════════════════════════════════════════
npm --version 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ NPM instalado
) else (
    echo ✗ NPM NAO ENCONTRADO!
)
echo.
echo Pressione qualquer tecla para continuar...
pause >nul

echo ════════════════════════════════════════════════════════════════
echo [3/8] Verificando Python...
echo ════════════════════════════════════════════════════════════════
python --version 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ Python instalado
) else (
    echo ✗ Python NAO ENCONTRADO!
)
echo.
echo Pressione qualquer tecla para continuar...
pause >nul

echo ════════════════════════════════════════════════════════════════
echo [4/8] Verificando MySQL...
echo ════════════════════════════════════════════════════════════════
tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I /N "mysqld.exe">NUL
if %ERRORLEVEL% EQU 0 (
    echo ✓ MySQL rodando
) else (
    echo ⚠ MySQL nao esta rodando
)
echo.
echo Pressione qualquer tecla para continuar...
pause >nul

echo ════════════════════════════════════════════════════════════════
echo [5/8] Verificando dependencias VendeAI...
echo ════════════════════════════════════════════════════════════════
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
echo Pressione qualquer tecla para continuar...
pause >nul

echo ════════════════════════════════════════════════════════════════
echo [6/8] Verificando dependencias CRM...
echo ════════════════════════════════════════════════════════════════
if exist "D:\Helix\HelixAI\CRM_Client\crm-client-app\node_modules" (
    echo ✓ CRM Cliente - node_modules OK
) else (
    echo ✗ CRM Cliente - node_modules FALTANDO
    echo   Execute: cd CRM_Client\crm-client-app ^&^& npm install
)

if exist "D:\Helix\HelixAI\CRM_Admin\crm-admin-app\node_modules" (
    echo ✓ CRM Admin - node_modules OK
) else (
    echo ⚠ CRM Admin - node_modules FALTANDO
    echo   Execute: cd CRM_Admin\crm-admin-app ^&^& npm install
)

if exist "D:\Helix\HelixAI\AIra_Landing\node_modules" (
    echo ✓ Landing Page - node_modules OK
) else (
    echo ⚠ Landing Page - node_modules FALTANDO
    echo   Execute: cd AIra_Landing ^&^& npm install
)
echo.
echo Pressione qualquer tecla para continuar...
pause >nul

echo ════════════════════════════════════════════════════════════════
echo [7/8] Verificando portas em uso...
echo ════════════════════════════════════════════════════════════════
netstat -ano | findstr :5000 | findstr LISTENING >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ⚠ Porta 5000 (Backend) EM USO
) else (
    echo ✓ Porta 5000 (Backend) livre
)

netstat -ano | findstr :3001 | findstr LISTENING >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ⚠ Porta 3001 (WhatsApp) EM USO
) else (
    echo ✓ Porta 3001 (WhatsApp) livre
)

netstat -ano | findstr :5173 | findstr LISTENING >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ⚠ Porta 5173 (CRM Cliente) EM USO
) else (
    echo ✓ Porta 5173 (CRM Cliente) livre
)
echo.
echo Pressione qualquer tecla para continuar...
pause >nul

echo ════════════════════════════════════════════════════════════════
echo [8/8] Verificando banco de dados VendeAI...
echo ════════════════════════════════════════════════════════════════
if exist "D:\Helix\HelixAI\VendeAI\vendeai.db" (
    echo ✓ Banco de dados VendeAI encontrado
) else (
    echo ⚠ Banco de dados VendeAI nao encontrado
    echo   (Sera criado automaticamente ao iniciar o backend)
)
echo.

cls
echo ╔════════════════════════════════════════════════════════════════╗
echo ║              ✅ DIAGNÓSTICO COMPLETO                           ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo Resultados salvos acima. Verifique os itens marcados com ✗ ou ⚠
echo.
echo Proximos passos:
echo.
echo   1. Se node_modules estiver faltando:
echo      - Execute npm install nas pastas indicadas
echo.
echo   2. Se portas estiverem em uso:
echo      - Execute LIMPAR_PORTAS.bat
echo.
echo   3. Depois:
echo      - Execute INICIAR_SISTEMA.bat
echo.
echo ════════════════════════════════════════════════════════════════
echo.
echo Esta janela vai ficar aberta para voce revisar.
echo.
echo ════════════════════════════════════════════════════════════════
echo PARA FECHAR: Digite 'sair' e pressione Enter
echo ════════════════════════════════════════════════════════════════
echo.
set /p resposta=Digite 'sair' para fechar:
if /i "%resposta%"=="sair" exit
echo.
echo Janela ainda aberta. Digite 'sair' para fechar.
goto :fim

:fim
pause
