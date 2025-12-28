@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
title HelixAI - Reconectar WhatsApp
color 0A

cls
echo ╔════════════════════════════════════════════════════════════════╗
echo ║          📱 RECONECTAR WHATSAPP - VendeAI Bot                  ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo Este script irá:
echo   1. Parar o bot VendeAI atual (se estiver rodando)
echo   2. Limpar a sessão WhatsApp antiga
echo   3. Reiniciar o bot para gerar novo QR Code
echo.
pause

:: ============================================================================
:: PASSO 1: PARAR BOT VENDEAI
:: ============================================================================
echo.
echo [1/3] Parando bot VendeAI...
echo.

:: Verificar se a porta 3010 está em uso
netstat -ano | findstr ":3010 " | findstr "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo       Parando processo na porta 3010...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3010 " ^| findstr "LISTENING"') do (
        taskkill /F /PID %%a >nul 2>&1
    )
    echo       ✅ Processo parado
    timeout /t 2 /nobreak >nul
) else (
    echo       ℹ️  Nenhum bot rodando na porta 3010
)

:: ============================================================================
:: PASSO 2: LIMPAR SESSÃO ANTIGA
:: ============================================================================
echo.
echo [2/3] Limpando sessão WhatsApp antiga...
echo.

if exist "D:\Helix\HelixAI\VendeAI\bot_engine\auth_info_baileys" (
    rd /s /q "D:\Helix\HelixAI\VendeAI\bot_engine\auth_info_baileys" 2>nul
    echo       ✅ Sessão antiga removida
) else (
    echo       ℹ️  Nenhuma sessão anterior encontrada
)

:: Também limpar do backend se existir
if exist "D:\Helix\HelixAI\Backend\auth_info_baileys" (
    rd /s /q "D:\Helix\HelixAI\Backend\auth_info_baileys" 2>nul
    echo       ✅ Sessão do backend também removida
)

timeout /t 1 /nobreak >nul

:: ============================================================================
:: PASSO 3: REINICIAR BOT
:: ============================================================================
echo.
echo [3/3] Reiniciando bot VendeAI...
echo.

start "VendeAI Multi-Tenant API Server" cmd /k "cd /d D:\Helix\HelixAI\VendeAI\bot_engine && color 0A && echo ════════════════════════════════════════ && echo 🚀 VendeAI MULTI-TENANT API SERVER && echo 📡 REST API: http://localhost:3010 && echo 🔌 WebSocket: ws://localhost:3010/ws?empresa_id=X && echo 👥 Suporte a múltiplas empresas && echo 📱 Conecte via CRM Cliente: http://localhost:5177 && echo ════════════════════════════════════════ && echo. && node bot-api-server-multi-tenant.js"

echo       ✅ Bot iniciado em nova janela
echo.

echo ╔════════════════════════════════════════════════════════════════╗
echo ║                    ✅ PROCESSO CONCLUÍDO                        ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo 📱 PRÓXIMOS PASSOS:
echo.
echo    1. Acesse o CRM Cliente: http://localhost:5177/
echo    2. Faça login com sua conta
echo    3. Vá na página "WhatsApp"
echo    4. Clique no botão "Conectar WhatsApp"
echo    5. O QR Code aparecerá NA TELA DO CRM
echo.
echo 🌐 COMO CONECTAR:
echo    1. Abra o WhatsApp no seu celular
echo    2. Vá em: Configurações → Aparelhos Conectados
echo    3. Toque em "Conectar um aparelho"
echo    4. Escaneie o QR Code que apareceu NO CRM
echo    5. Aguarde a conexão (status mudará para "Conectado")
echo.
echo ⚠️  IMPORTANTE:
echo    • Mantenha a janela verde do servidor ABERTA
echo    • QR Code agora aparece NO NAVEGADOR, não no terminal
echo    • Sistema MULTI-TENANT: cada empresa tem sua própria sessão
echo    • Se precisar reconectar, use o botão no próprio CRM
echo.
pause
