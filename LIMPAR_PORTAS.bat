@echo off
chcp 65001 >nul
title Limpando Portas - Sistema Completo
color 0C

cls
echo ╔════════════════════════════════════════════════════════════════╗
echo ║              🧹 LIMPANDO TODAS AS PORTAS                       ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo [INFO] Parando todos os processos nas portas...
echo.

:: Parar Backend Flask (porta 5000)
echo [1/10] Limpando porta 5000 (Backend Flask)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING') do (
    echo       Matando processo %%a
    taskkill /F /PID %%a 2>nul
)

:: Parar VendeAI WhatsApp Service (porta 3001)
echo [2/10] Limpando porta 3001 (VendeAI WhatsApp)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001 ^| findstr LISTENING') do (
    echo       Matando processo %%a
    taskkill /F /PID %%a 2>nul
)

:: Parar WhatsApp Service Estável (porta 3002)
echo [3/10] Limpando porta 3002 (WhatsApp Estável)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3002 ^| findstr LISTENING') do (
    echo       Matando processo %%a
    taskkill /F /PID %%a 2>nul
)

:: Parar AIra Auto (porta 4000)
echo [4/10] Limpando porta 4000 (AIra Auto)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :4000 ^| findstr LISTENING') do (
    echo       Matando processo %%a
    taskkill /F /PID %%a 2>nul
)

:: Parar AIra Imob (porta 4001)
echo [5/10] Limpando porta 4001 (AIra Imob)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :4001 ^| findstr LISTENING') do (
    echo       Matando processo %%a
    taskkill /F /PID %%a 2>nul
)

:: Parar CRM Admin (porta 5175)
echo [6/10] Limpando porta 5175 (CRM Admin)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5175 ^| findstr LISTENING') do (
    echo       Matando processo %%a
    taskkill /F /PID %%a 2>nul
)

:: Parar Landing Page (porta 5176)
echo [7/10] Limpando porta 5176 (Landing Page)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5176 ^| findstr LISTENING') do (
    echo       Matando processo %%a
    taskkill /F /PID %%a 2>nul
)

:: Parar CRM Cliente (porta 5173 ou 5177)
echo [8/10] Limpando porta 5173 (CRM Cliente)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do (
    echo       Matando processo %%a
    taskkill /F /PID %%a 2>nul
)

echo [9/10] Limpando porta 5177 (CRM Cliente alternativa)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5177 ^| findstr LISTENING') do (
    echo       Matando processo %%a
    taskkill /F /PID %%a 2>nul
)

:: Parar LocalTunnel e processos Node.js órfãos
echo [10/10] Limpando processos LocalTunnel...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq *localtunnel*" 2>nul
taskkill /F /IM node.exe /FI "WINDOWTITLE eq *VendeAI Webhook*" 2>nul

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║              ✅ TODAS AS PORTAS LIMPAS!                        ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo Portas limpas:
echo   ✓ 5000 - Backend Flask
echo   ✓ 3001 - VendeAI WhatsApp Service
echo   ✓ 3002 - WhatsApp Service Estável
echo   ✓ 4000 - AIra Auto Bot
echo   ✓ 4001 - AIra Imob Bot
echo   ✓ 5175 - CRM Admin
echo   ✓ 5176 - Landing Page
echo   ✓ 5173 - CRM Cliente
echo   ✓ 5177 - CRM Cliente (alt)
echo   ✓ LocalTunnel
echo.
echo Agora você pode rodar: INICIAR_SISTEMA.bat
echo.
pause
