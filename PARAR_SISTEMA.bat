@echo off
chcp 65001 >nul
title Parar Sistema Completo
color 0C

cls
echo ╔════════════════════════════════════════════════════════════════╗
echo ║              🛑 PARANDO SISTEMA COMPLETO                       ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo [INFO] Parando todos os serviços...
echo.

:: Parar Backend Flask (porta 5000)
echo [1/10] Parando Backend Flask (porta 5000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do taskkill /F /PID %%a 2>nul

:: Parar VendeAI WhatsApp Service (porta 3001)
echo [2/10] Parando VendeAI WhatsApp Service (porta 3001)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001') do taskkill /F /PID %%a 2>nul

:: Parar WhatsApp Service Estável (porta 3002)
echo [3/10] Parando WhatsApp Service Estável (porta 3002)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3002') do taskkill /F /PID %%a 2>nul

:: Parar AIra Auto (porta 4000)
echo [4/10] Parando AIra Auto Bot (porta 4000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :4000') do taskkill /F /PID %%a 2>nul

:: Parar AIra Imob (porta 4001)
echo [5/10] Parando AIra Imob Bot (porta 4001)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :4001') do taskkill /F /PID %%a 2>nul

:: Parar CRM Admin (porta 5175)
echo [6/10] Parando CRM Admin (porta 5175)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5175') do taskkill /F /PID %%a 2>nul

:: Parar Landing Page (porta 5176)
echo [7/10] Parando Landing Page (porta 5176)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5176') do taskkill /F /PID %%a 2>nul

:: Parar CRM Cliente (porta 5173 ou 5177)
echo [8/10] Parando CRM Cliente (porta 5173)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5177') do taskkill /F /PID %%a 2>nul

:: Parar LocalTunnel
echo [9/10] Parando LocalTunnel Webhook...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq *localtunnel*" 2>nul
taskkill /F /IM node.exe /FI "WINDOWTITLE eq *VendeAI Webhook*" 2>nul

:: Parar VendeAI Bot Engine
echo [10/10] Parando VendeAI Bot Engine...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq *VendeAI Bot Engine*" 2>nul

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║              ✅ TODOS OS SERVIÇOS PARADOS!                     ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo Serviços parados:
echo   ✓ Backend Flask (porta 5000)
echo   ✓ VendeAI WhatsApp Service (porta 3001)
echo   ✓ WhatsApp Service Estável (porta 3002)
echo   ✓ AIra Auto Bot (porta 4000)
echo   ✓ AIra Imob Bot (porta 4001)
echo   ✓ CRM Admin (porta 5175)
echo   ✓ Landing Page (porta 5176)
echo   ✓ CRM Cliente (porta 5173)
echo   ✓ LocalTunnel Webhook
echo   ✓ VendeAI Bot Engine
echo.
echo Para iniciar novamente, execute: INICIAR_SISTEMA.bat
echo.
pause
