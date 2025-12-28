@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
title HelixAI - Limpar Sistema
color 0E

cls
echo ╔════════════════════════════════════════════════════════════════╗
echo ║          🧹 HelixAI - LIMPEZA COMPLETA DO SISTEMA              ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo [INFO] Este script vai limpar cache e arquivos temporários
echo.
pause

echo.
echo ┌────────────────────────────────────────────────────────────────┐
echo │ 📁 Limpando cache do Node.js...                                │
echo └────────────────────────────────────────────────────────────────┘
echo.

:: Landing Page
if exist "D:\Helix\HelixAI\AIra_Landing\node_modules\.cache" (
    echo [Landing Page] Limpando cache Vite...
    rd /s /q "D:\Helix\HelixAI\AIra_Landing\node_modules\.cache" 2>nul
    rd /s /q "D:\Helix\HelixAI\AIra_Landing\node_modules\.vite" 2>nul
)

:: CRM Cliente
if exist "D:\Helix\HelixAI\CRM_Client\crm-client-app\node_modules\.cache" (
    echo [CRM Cliente] Limpando cache...
    rd /s /q "D:\Helix\HelixAI\CRM_Client\crm-client-app\node_modules\.cache" 2>nul
    rd /s /q "D:\Helix\HelixAI\CRM_Client\crm-client-app\node_modules\.vite" 2>nul
)

:: CRM Admin
if exist "D:\Helix\HelixAI\CRM_Admin\crm-admin-app\node_modules\.cache" (
    echo [CRM Admin] Limpando cache...
    rd /s /q "D:\Helix\HelixAI\CRM_Admin\crm-admin-app\node_modules\.cache" 2>nul
    rd /s /q "D:\Helix\HelixAI\CRM_Admin\crm-admin-app\node_modules\.vite" 2>nul
)

:: Painel Afiliados
if exist "D:\Helix\HelixAI\Afiliados_Panel\node_modules\.cache" (
    echo [Painel Afiliados] Limpando cache...
    rd /s /q "D:\Helix\HelixAI\Afiliados_Panel\node_modules\.cache" 2>nul
    rd /s /q "D:\Helix\HelixAI\Afiliados_Panel\node_modules\.vite" 2>nul
)

:: VendeAI Bot Engine
if exist "D:\Helix\HelixAI\VendeAI\bot_engine\node_modules\.cache" (
    echo [VendeAI Bot] Limpando cache...
    rd /s /q "D:\Helix\HelixAI\VendeAI\bot_engine\node_modules\.cache" 2>nul
)

:: WhatsApp Service
if exist "D:\Helix\HelixAI\whatsapp_service_stable\node_modules\.cache" (
    echo [WhatsApp Service] Limpando cache...
    rd /s /q "D:\Helix\HelixAI\whatsapp_service_stable\node_modules\.cache" 2>nul
)

:: AIra Auto
if exist "D:\Helix\HelixAI\AIra_Auto\node_modules\.cache" (
    echo [AIra Auto] Limpando cache...
    rd /s /q "D:\Helix\HelixAI\AIra_Auto\node_modules\.cache" 2>nul
)

:: AIra Imob
if exist "D:\Helix\HelixAI\AIra_Imob\node_modules\.cache" (
    echo [AIra Imob] Limpando cache...
    rd /s /q "D:\Helix\HelixAI\AIra_Imob\node_modules\.cache" 2>nul
)

echo    ✅ Cache do Node.js limpo
echo.

echo ┌────────────────────────────────────────────────────────────────┐
echo │ 🐍 Limpando cache do Python...                                 │
echo └────────────────────────────────────────────────────────────────┘
echo.

:: Limpar __pycache__
echo [Python] Removendo arquivos __pycache__...
for /r "D:\Helix\HelixAI\Backend" %%d in (__pycache__) do (
    if exist "%%d" rd /s /q "%%d" 2>nul
)
for /r "D:\Helix\HelixAI\VendeAI" %%d in (__pycache__) do (
    if exist "%%d" rd /s /q "%%d" 2>nul
)

:: Limpar arquivos .pyc
echo [Python] Removendo arquivos .pyc...
del /s /q "D:\Helix\HelixAI\Backend\*.pyc" 2>nul
del /s /q "D:\Helix\HelixAI\VendeAI\*.pyc" 2>nul

echo    ✅ Cache do Python limpo
echo.

echo ┌────────────────────────────────────────────────────────────────┐
echo │ 📱 Limpando sessões do WhatsApp...                             │
echo └────────────────────────────────────────────────────────────────┘
echo.

set /p limpar_whatsapp="Deseja limpar as sessões do WhatsApp? (S/N): "
if /i "%limpar_whatsapp%"=="S" (
    echo [WhatsApp] Removendo sessões antigas...

    :: VendeAI Bot Engine
    if exist "D:\Helix\HelixAI\VendeAI\bot_engine\.wwebjs_auth" (
        rd /s /q "D:\Helix\HelixAI\VendeAI\bot_engine\.wwebjs_auth" 2>nul
        echo    └─ VendeAI Bot Engine: sessão removida
    )

    :: WhatsApp Service
    if exist "D:\Helix\HelixAI\whatsapp_service_stable\.wwebjs_auth" (
        rd /s /q "D:\Helix\HelixAI\whatsapp_service_stable\.wwebjs_auth" 2>nul
        echo    └─ WhatsApp Service: sessão removida
    )

    :: AIra Auto
    if exist "D:\Helix\HelixAI\AIra_Auto\.wwebjs_auth" (
        rd /s /q "D:\Helix\HelixAI\AIra_Auto\.wwebjs_auth" 2>nul
        echo    └─ AIra Auto: sessão removida
    )

    :: AIra Imob
    if exist "D:\Helix\HelixAI\AIra_Imob\.wwebjs_auth" (
        rd /s /q "D:\Helix\HelixAI\AIra_Imob\.wwebjs_auth" 2>nul
        echo    └─ AIra Imob: sessão removida
    )

    echo    ✅ Sessões do WhatsApp removidas
    echo    ⚠️  Você precisará escanear o QR Code novamente
) else (
    echo    ⏭️  Limpeza de sessões do WhatsApp ignorada
)

echo.
echo ┌────────────────────────────────────────────────────────────────┐
echo │ 🗑️  Limpando arquivos de log...                                │
echo └────────────────────────────────────────────────────────────────┘
echo.

set /p limpar_logs="Deseja limpar os arquivos de log? (S/N): "
if /i "%limpar_logs%"=="S" (
    echo [Logs] Removendo arquivos de log antigos...

    :: Logs do Backend
    del /q "D:\Helix\HelixAI\Backend\*.log" 2>nul
    del /q "D:\Helix\HelixAI\VendeAI\*.log" 2>nul

    :: Logs do Node.js
    del /q "D:\Helix\HelixAI\VendeAI\bot_engine\*.log" 2>nul
    del /q "D:\Helix\HelixAI\whatsapp_service_stable\*.log" 2>nul

    echo    ✅ Arquivos de log removidos
) else (
    echo    ⏭️  Limpeza de logs ignorada
)

echo.
echo ┌────────────────────────────────────────────────────────────────┐
echo │ 🔄 Limpando cache NPM global...                                │
echo └────────────────────────────────────────────────────────────────┘
echo.

echo [NPM] Limpando cache global...
call npm cache clean --force >nul 2>&1

echo    ✅ Cache NPM limpo
echo.

echo ╔════════════════════════════════════════════════════════════════╗
echo ║         ✅ LIMPEZA CONCLUÍDA COM SUCESSO                       ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo 📋 Itens limpos:
echo    ✅ Cache do Node.js (Vite, etc)
echo    ✅ Cache do Python (__pycache__, .pyc)
if /i "%limpar_whatsapp%"=="S" echo    ✅ Sessões do WhatsApp
if /i "%limpar_logs%"=="S" echo    ✅ Arquivos de log
echo    ✅ Cache NPM global
echo.
echo 💡 Próximo passo: Execute 02_VERIFICAR_SISTEMA.bat
echo    ou 03_INICIAR_SISTEMA_COMPLETO.bat
echo.
pause
