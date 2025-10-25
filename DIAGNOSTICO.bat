@echo off
chcp 65001 >nul
title Diagnóstico - HelixAI
color 0E

cls
echo ╔════════════════════════════════════════════════════════════════╗
echo ║              🔍 DIAGNÓSTICO DO SISTEMA                         ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

:: Testar Node.js
echo [1/6] Testando Node.js...
node --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%i in ('node --version') do echo ✅ Node.js: %%i
) else (
    echo ❌ Node.js NAO INSTALADO
)

:: Testar Python
echo [2/6] Testando Python...
python --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%i in ('python --version') do echo ✅ Python: %%i
) else (
    echo ❌ Python NAO INSTALADO
)

:: Testar npm
echo [3/6] Testando npm...
npm --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%i in ('npm --version') do echo ✅ npm: %%i
) else (
    echo ❌ npm NAO INSTALADO
)

:: Testar MySQL
echo [4/6] Testando MySQL...
tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I /N "mysqld.exe">NUL
if %ERRORLEVEL% EQU 0 (
    echo ✅ MySQL: Rodando
) else (
    echo ❌ MySQL: NAO esta rodando
)

:: Verificar diretórios
echo [5/6] Verificando estrutura de pastas...
if exist "D:\Helix\HelixAI\backend" (
    echo ✅ Backend: OK
) else (
    echo ❌ Backend: Pasta nao encontrada
)

if exist "D:\Helix\HelixAI\AIra_Landing" (
    echo ✅ Landing Page: OK
) else (
    echo ❌ Landing Page: Pasta nao encontrada
)

if exist "D:\Helix\HelixAI\CRM_Client\crm-client-app" (
    echo ✅ CRM Cliente: OK
) else (
    echo ❌ CRM Cliente: Pasta nao encontrada
)

if exist "D:\Helix\HelixAI\CRM_Admin\crm-admin-app" (
    echo ✅ CRM Admin: OK
) else (
    echo ❌ CRM Admin: Pasta nao encontrada
)

:: Verificar node_modules
echo [6/6] Verificando dependências...
if exist "D:\Helix\HelixAI\AIra_Landing\node_modules" (
    echo ✅ Landing Page: node_modules OK
) else (
    echo ⚠️  Landing Page: Precisa instalar dependencias
)

if exist "D:\Helix\HelixAI\CRM_Client\crm-client-app\node_modules" (
    echo ✅ CRM Cliente: node_modules OK
) else (
    echo ⚠️  CRM Cliente: Precisa instalar dependencias
)

if exist "D:\Helix\HelixAI\CRM_Admin\crm-admin-app\node_modules" (
    echo ✅ CRM Admin: node_modules OK
) else (
    echo ⚠️  CRM Admin: Precisa instalar dependencias
)

echo.
echo ════════════════════════════════════════════════════════════════
echo.
echo Diagnostico concluido!
echo.
echo Se houver erros acima, corrija-os antes de iniciar o sistema.
echo.
pause
