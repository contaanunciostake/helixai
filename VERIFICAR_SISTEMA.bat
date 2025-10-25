@echo off
chcp 65001 >nul
title Verificação do Sistema - HelixAI
color 0B
setlocal enabledelayedexpansion

cls
echo ╔════════════════════════════════════════════════════════════════╗
echo ║           🔍 VERIFICAÇÃO DO SISTEMA - HELIXAI                  ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

set "ERRO=0"

:: Verificar Node.js
echo [1/4] Verificando Node.js...
node --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js instalado: !NODE_VERSION!
) else (
    echo ❌ Node.js NÃO instalado
    echo    Baixe em: https://nodejs.org/
    set "ERRO=1"
)

echo.

:: Verificar Python
echo [2/4] Verificando Python...
python --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%i in ('python --version') do set PYTHON_VERSION=%%i
    echo ✅ Python instalado: !PYTHON_VERSION!
) else (
    echo ❌ Python NÃO instalado
    echo    Baixe em: https://www.python.org/downloads/
    set "ERRO=1"
)

echo.

:: Verificar MySQL/XAMPP
echo [3/4] Verificando MySQL...
tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I /N "mysqld.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo ✅ MySQL está RODANDO
) else (
    echo ⚠️  MySQL NÃO está rodando
    echo    Abra o XAMPP Control Panel e inicie o MySQL
    set "ERRO=1"
)

echo.

:: Verificar banco de dados
echo [4/4] Verificando banco de dados helixai_db...
mysql -u root -e "USE helixai_db; SELECT COUNT(*) FROM cars;" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Banco de dados helixai_db configurado
    echo ✅ Tabela cars existe
) else (
    echo ❌ Banco de dados ou tabela NÃO configurados
    echo    Execute: SETUP_DATABASE.bat
    set "ERRO=1"
)

echo.
echo ════════════════════════════════════════════════════════════════

if "%ERRO%"=="0" (
    echo.
    echo ╔════════════════════════════════════════════════════════════════╗
    echo ║              ✅ SISTEMA PRONTO PARA INICIAR!                    ║
    echo ╚════════════════════════════════════════════════════════════════╝
    echo.
    echo Execute: INICIAR_TUDO.bat
) else (
    echo.
    echo ╔════════════════════════════════════════════════════════════════╗
    echo ║              ❌ CORRIJA OS PROBLEMAS ACIMA                      ║
    echo ╚════════════════════════════════════════════════════════════════╝
    echo.
    echo Soluções:
    echo 1. Instale Node.js e Python se necessário
    echo 2. Inicie o MySQL no XAMPP
    echo 3. Execute SETUP_DATABASE.bat para criar as tabelas
)

echo.
pause
