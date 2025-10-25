@echo off
chcp 65001 >nul
title Limpar Sessões WhatsApp
color 0E

echo ╔════════════════════════════════════════════════════════════════╗
echo ║         🧹 LIMPAR TODAS AS SESSÕES WHATSAPP                    ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo Este script vai limpar:
echo   - Sessões do Bot Engine (Baileys)
echo   - Sessões do WhatsApp Service (porta 3001)
echo   - Sessões do WhatsApp Service Estável (porta 3002)
echo.
pause
echo.

:: Bot Engine - Baileys
echo [1/3] Limpando sessão do Bot Engine...
if exist "D:\Helix\HelixAI\VendeAI\bot_engine\baileys_auth_info" (
    rd /s /q "D:\Helix\HelixAI\VendeAI\bot_engine\baileys_auth_info"
    echo       ✓ Sessão do Bot Engine removida
) else (
    echo       - Nenhuma sessão encontrada
)
echo.

:: WhatsApp Service (porta 3001)
echo [2/3] Limpando sessão do WhatsApp Service (porta 3001)...
if exist "D:\Helix\HelixAI\VendeAI\whatsapp_service\.wwebjs_auth" (
    rd /s /q "D:\Helix\HelixAI\VendeAI\whatsapp_service\.wwebjs_auth"
    echo       ✓ Sessão do WhatsApp Service removida
) else (
    echo       - Nenhuma sessão encontrada
)
echo.

:: WhatsApp Service Estável (porta 3002)
echo [3/3] Limpando sessão do WhatsApp Service ESTÁVEL (porta 3002)...
if exist "D:\Helix\HelixAI\whatsapp_service_stable\.wwebjs_auth" (
    rd /s /q "D:\Helix\HelixAI\whatsapp_service_stable\.wwebjs_auth"
    echo       ✓ Sessão do WhatsApp Service ESTÁVEL removida
) else (
    echo       - Nenhuma sessão encontrada
)
echo.

echo ╔════════════════════════════════════════════════════════════════╗
echo ║              ✅ LIMPEZA CONCLUÍDA                              ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo Agora você pode:
echo   1. Fechar todas as janelas do sistema
echo   2. Executar INICIAR_SISTEMA.bat novamente
echo   3. Conectar o WhatsApp pelo CRM Cliente (porta 5177)
echo.
pause
