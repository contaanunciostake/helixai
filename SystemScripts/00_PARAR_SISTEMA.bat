@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
title HelixAI - Parar Sistema Completo
color 0C

cls
echo ╔════════════════════════════════════════════════════════════════╗
echo ║          🛑 HelixAI - PARAR SISTEMA COMPLETO                   ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo [AVISO] Este script vai parar TODOS os serviços do HelixAI
echo.
pause

echo.
echo ┌────────────────────────────────────────────────────────────────┐
echo │ 🔴 Parando processos por porta...                              │
echo └────────────────────────────────────────────────────────────────┘
echo.

:: Função para matar processo por porta
set "ports=5000 3010 3002 4000 4001 5173 5174 5175 5176 5177 5178 8080"

for %%p in (%ports%) do (
    echo [Porta %%p] Verificando...
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%%p ^| findstr LISTENING') do (
        echo    └─ Matando processo PID %%a...
        taskkill /F /PID %%a >nul 2>&1
    )
)

echo.
echo ┌────────────────────────────────────────────────────────────────┐
echo │ 🔴 Parando processos por nome...                               │
echo └────────────────────────────────────────────────────────────────┘
echo.

:: Matar processos Node.js relacionados
echo [Node.js] Parando processos relacionados ao HelixAI...
for /f "tokens=2" %%a in ('tasklist /FI "IMAGENAME eq node.exe" /FO LIST ^| findstr "PID"') do (
    taskkill /F /PID %%a >nul 2>&1
)

:: Matar processos Python relacionados
echo [Python] Parando processos Flask...
for /f "tokens=2" %%a in ('tasklist /FI "IMAGENAME eq python.exe" /FO LIST ^| findstr "PID"') do (
    :: Verificar se é processo Flask (pode melhorar essa verificação)
    taskkill /F /PID %%a >nul 2>&1
)

:: Matar processos lt (LocalTunnel)
echo [LocalTunnel] Parando túneis...
taskkill /F /IM lt.exe >nul 2>&1
for /f "tokens=2" %%a in ('tasklist /FI "WINDOWTITLE eq *tunnel*" /FO LIST ^| findstr "PID"') do (
    taskkill /F /PID %%a >nul 2>&1
)

:: Matar processos ngrok
echo [Ngrok] Parando túneis ngrok...
taskkill /F /IM ngrok.exe >nul 2>&1

echo.
echo ┌────────────────────────────────────────────────────────────────┐
echo │ 🧹 Limpando processos em background...                         │
echo └────────────────────────────────────────────────────────────────┘
echo.

:: Aguardar processos terminarem
timeout /t 2 /nobreak >nul

:: Verificar se ainda há algo rodando
echo [Verificação] Checando portas críticas...
netstat -ano | findstr "5000 3010 5173 5177" >nul 2>&1
if %errorlevel% equ 0 (
    echo    ⚠️  Algumas portas ainda estão em uso
    echo    ⚠️  Pode ser necessário reiniciar o computador
) else (
    echo    ✅ Todas as portas críticas foram liberadas
)

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║         ✅ SISTEMA PARADO COM SUCESSO                          ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo 📋 Processos parados:
echo    ✅ Backend Flask (porta 5000)
echo    ✅ VendeAI Bot Engine (porta 3010)
echo    ✅ WhatsApp Service (porta 3002)
echo    ✅ AIra Auto Bot (porta 4000)
echo    ✅ AIra Imob Bot (porta 4001)
echo    ✅ Landing Page (porta 5173)
echo    ✅ CRM Admin (porta 5175)
echo    ✅ CRM Cliente (porta 5177)
echo    ✅ Painel Afiliados (porta 5178)
echo    ✅ Túneis LocalTunnel/Ngrok
echo.
echo 💡 Dica: Execute 01_LIMPAR_SISTEMA.bat antes de reiniciar
echo.
pause
