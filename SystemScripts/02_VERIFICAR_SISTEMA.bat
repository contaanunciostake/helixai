@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
title HelixAI - Verificar Sistema
color 0B

cls
echo ╔════════════════════════════════════════════════════════════════╗
echo ║          🔍 HelixAI - VERIFICAÇÃO DO SISTEMA                   ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo [INFO] Verificando pré-requisitos e dependências...
echo.

set ERROS=0

echo ┌────────────────────────────────────────────────────────────────┐
echo │ 1️⃣  Verificando Node.js...                                     │
echo └────────────────────────────────────────────────────────────────┘
echo.

where node >nul 2>&1
if !errorlevel! equ 0 (
    node --version > temp_node_version.txt 2>&1
    set /p NODE_VERSION=<temp_node_version.txt
    del temp_node_version.txt
    echo    ✅ Node.js instalado: !NODE_VERSION!
) else (
    echo    ❌ Node.js NÃO encontrado!
    echo       Instale em: https://nodejs.org/
    set /a ERROS+=1
)

echo.
echo ┌────────────────────────────────────────────────────────────────┐
echo │ 2️⃣  Verificando Python...                                      │
echo └────────────────────────────────────────────────────────────────┘
echo.

where python >nul 2>&1
if !errorlevel! equ 0 (
    python --version > temp_python_version.txt 2>&1
    set /p PYTHON_VERSION=<temp_python_version.txt
    del temp_python_version.txt
    echo    ✅ Python instalado: !PYTHON_VERSION!
) else (
    echo    ❌ Python NÃO encontrado!
    echo       Instale em: https://www.python.org/
    set /a ERROS+=1
)

echo.
echo ┌────────────────────────────────────────────────────────────────┐
echo │ 3️⃣  Verificando MySQL/MariaDB...                               │
echo └────────────────────────────────────────────────────────────────┘
echo.

tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I /N "mysqld.exe">NUL
if !errorlevel! equ 0 (
    echo    ✅ MySQL está rodando
) else (
    echo    ⚠️  MySQL NÃO está rodando
    echo       Inicie o MySQL no XAMPP Control Panel
    echo       (Sistema pode funcionar parcialmente sem MySQL)
)

echo.
echo ┌────────────────────────────────────────────────────────────────┐
echo │ 4️⃣  Verificando estrutura de pastas...                         │
echo └────────────────────────────────────────────────────────────────┘
echo.

set PASTAS_OK=0

if exist "D:\Helix\HelixAI\Backend" (
    echo    ✅ Backend
    set /a PASTAS_OK+=1
) else (
    echo    ❌ Backend não encontrado
    set /a ERROS+=1
)

if exist "D:\Helix\HelixAI\VendeAI" (
    echo    ✅ VendeAI
    set /a PASTAS_OK+=1
) else (
    echo    ❌ VendeAI não encontrado
    set /a ERROS+=1
)

if exist "D:\Helix\HelixAI\VendeAI\bot_engine" (
    echo    ✅ VendeAI Bot Engine
    set /a PASTAS_OK+=1
) else (
    echo    ❌ VendeAI Bot Engine não encontrado
    set /a ERROS+=1
)

if exist "D:\Helix\HelixAI\AIra_Landing" (
    echo    ✅ Landing Page
    set /a PASTAS_OK+=1
) else (
    echo    ⚠️  Landing Page não encontrada
)

if exist "D:\Helix\HelixAI\CRM_Client\crm-client-app" (
    echo    ✅ CRM Cliente
    set /a PASTAS_OK+=1
) else (
    echo    ⚠️  CRM Cliente não encontrado
)

if exist "D:\Helix\HelixAI\CRM_Admin\crm-admin-app" (
    echo    ✅ CRM Admin
    set /a PASTAS_OK+=1
) else (
    echo    ⚠️  CRM Admin não encontrado
)

if exist "D:\Helix\HelixAI\Afiliados_Panel" (
    echo    ✅ Painel Afiliados
    set /a PASTAS_OK+=1
) else (
    echo    ⚠️  Painel Afiliados não encontrado
)

if exist "D:\Helix\HelixAI\AIra_Auto" (
    echo    ✅ AIra Auto
    set /a PASTAS_OK+=1
) else (
    echo    ⚠️  AIra Auto não encontrado
)

if exist "D:\Helix\HelixAI\AIra_Imob" (
    echo    ✅ AIra Imob
    set /a PASTAS_OK+=1
) else (
    echo    ⚠️  AIra Imob não encontrado
)

if exist "D:\Helix\HelixAI\whatsapp_service_stable" (
    echo    ✅ WhatsApp Service
    set /a PASTAS_OK+=1
) else (
    echo    ⚠️  WhatsApp Service não encontrado
)

echo.
echo ┌────────────────────────────────────────────────────────────────┐
echo │ 5️⃣  Verificando dependências Node.js...                        │
echo └────────────────────────────────────────────────────────────────┘
echo.

set DEPS_OK=0

if exist "D:\Helix\HelixAI\VendeAI\bot_engine\node_modules" (
    echo    ✅ VendeAI Bot Engine - node_modules OK
    set /a DEPS_OK+=1
) else (
    echo    ⚠️  VendeAI Bot Engine - node_modules não instalado
)

if exist "D:\Helix\HelixAI\AIra_Landing\node_modules" (
    echo    ✅ Landing Page - node_modules OK
    set /a DEPS_OK+=1
) else (
    echo    ⚠️  Landing Page - node_modules não instalado
)

if exist "D:\Helix\HelixAI\CRM_Client\crm-client-app\node_modules" (
    echo    ✅ CRM Cliente - node_modules OK
    set /a DEPS_OK+=1
) else (
    echo    ⚠️  CRM Cliente - node_modules não instalado
)

if exist "D:\Helix\HelixAI\CRM_Admin\crm-admin-app\node_modules" (
    echo    ✅ CRM Admin - node_modules OK
    set /a DEPS_OK+=1
) else (
    echo    ⚠️  CRM Admin - node_modules não instalado
)

if exist "D:\Helix\HelixAI\Afiliados_Panel\node_modules" (
    echo    ✅ Painel Afiliados - node_modules OK
    set /a DEPS_OK+=1
) else (
    echo    ⚠️  Painel Afiliados - node_modules não instalado
)

echo.
echo ┌────────────────────────────────────────────────────────────────┐
echo │ 6️⃣  Verificando variáveis de ambiente...                       │
echo └────────────────────────────────────────────────────────────────┘
echo.

if exist "D:\Helix\HelixAI\Backend\.env" (
    echo    ✅ Backend .env encontrado
) else (
    echo    ⚠️  Backend .env não encontrado
    echo       Copie .env.example para .env e configure
)

if exist "D:\Helix\HelixAI\VendeAI\.env" (
    echo    ✅ VendeAI .env encontrado
) else (
    echo    ⚠️  VendeAI .env não encontrado
)

echo.
echo ┌────────────────────────────────────────────────────────────────┐
echo │ 7️⃣  Verificando portas em uso...                               │
echo └────────────────────────────────────────────────────────────────┘
echo.

set PORTAS_OCUPADAS=0

netstat -ano | findstr ":5000 " | findstr "LISTENING" >nul 2>&1
if !errorlevel! equ 0 (
    echo    🔴 Porta 5000 EM USO (Backend Flask)
    set /a PORTAS_OCUPADAS+=1
) else (
    echo    ✅ Porta 5000 livre
)

netstat -ano | findstr ":3010 " | findstr "LISTENING" >nul 2>&1
if !errorlevel! equ 0 (
    echo    🔴 Porta 3010 EM USO (Bot Engine)
    set /a PORTAS_OCUPADAS+=1
) else (
    echo    ✅ Porta 3010 livre
)

netstat -ano | findstr ":5173 " | findstr "LISTENING" >nul 2>&1
if !errorlevel! equ 0 (
    echo    🔴 Porta 5173 EM USO (Landing Page)
    set /a PORTAS_OCUPADAS+=1
) else (
    echo    ✅ Porta 5173 livre
)

netstat -ano | findstr ":5177 " | findstr "LISTENING" >nul 2>&1
if !errorlevel! equ 0 (
    echo    🔴 Porta 5177 EM USO (CRM Cliente)
    set /a PORTAS_OCUPADAS+=1
) else (
    echo    ✅ Porta 5177 livre
)

netstat -ano | findstr ":5175 " | findstr "LISTENING" >nul 2>&1
if !errorlevel! equ 0 (
    echo    🔴 Porta 5175 EM USO (CRM Admin)
    set /a PORTAS_OCUPADAS+=1
) else (
    echo    ✅ Porta 5175 livre
)

netstat -ano | findstr ":5178 " | findstr "LISTENING" >nul 2>&1
if !errorlevel! equ 0 (
    echo    🔴 Porta 5178 EM USO (Painel Afiliados)
    set /a PORTAS_OCUPADAS+=1
) else (
    echo    ✅ Porta 5178 livre
)

if !PORTAS_OCUPADAS! gtr 0 (
    echo.
    echo    ⚠️  Há !PORTAS_OCUPADAS! porta(s) em uso
    echo       Execute 00_PARAR_SISTEMA.bat antes de iniciar
)

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║         📊 RESUMO DA VERIFICAÇÃO                               ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

if !ERROS! equ 0 (
    if !PORTAS_OCUPADAS! equ 0 (
        echo ✅ SISTEMA PRONTO PARA INICIAR!
        echo.
        echo    • Pastas: !PASTAS_OK!/10 encontradas
        echo    • Dependências: !DEPS_OK!/5 instaladas
        echo    • Portas: Todas livres
        echo    • MySQL: Verificado
        echo.
        echo 💡 Execute 03_INICIAR_SISTEMA_COMPLETO.bat para iniciar
    ) else (
        echo ⚠️  SISTEMA PARCIALMENTE PRONTO
        echo.
        echo    • Há !PORTAS_OCUPADAS! porta(s) em uso
        echo.
        echo 💡 Execute 00_PARAR_SISTEMA.bat antes de iniciar
    )
) else (
    echo ❌ SISTEMA COM PROBLEMAS
    echo.
    echo    • !ERROS! erro(s) crítico(s) encontrado(s)
    echo    • Verifique os erros acima e corrija antes de iniciar
    echo.
)

echo.
pause
