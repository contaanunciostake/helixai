@echo off
chcp 65001 >nul
title Teste Rápido - AIra Sistema
color 0A

cls
echo ╔════════════════════════════════════════════════════════════════╗
echo ║              🧪 TESTE RÁPIDO DO SISTEMA                         ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo [TESTE] Verificando se script funciona...
echo.

:: Teste 1: Verificar MySQL
echo [1/3] Testando verificação MySQL...
tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I /N "mysqld.exe">NUL
if %ERRORLEVEL% EQU 0 (
    echo ✅ OK - MySQL detectado
) else (
    echo ⚠️ AVISO - MySQL não detectado
)
echo.

:: Teste 2: Verificar pastas
echo [2/3] Verificando pastas do sistema...
if exist "D:\Helix\HelixAI\backend" (
    echo ✅ OK - Pasta backend existe
) else (
    echo ❌ ERRO - Pasta backend não encontrada
)

if exist "D:\Helix\HelixAI\whatsapp_service" (
    echo ✅ OK - Pasta whatsapp_service existe
) else (
    echo ❌ ERRO - Pasta whatsapp_service não encontrada
)

if exist "D:\Helix\HelixAI\CRM_Client\crm-client-app" (
    echo ✅ OK - Pasta CRM_Client existe
) else (
    echo ❌ ERRO - Pasta CRM_Client não encontrada
)
echo.

:: Teste 3: Testar comando start simples
echo [3/3] Testando comando start...
start "Teste CMD" cmd /k "cd /d D:\Helix\HelixAI && color 0A && echo Teste OK - Feche esta janela && timeout /t 3"
echo ✅ OK - Comando start funcionou
echo.

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║              ✅ TESTE CONCLUÍDO                                 ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo Se você viu uma janela de "Teste CMD" abrir, o script está OK!
echo.
echo Pressione qualquer tecla para executar o sistema completo...
pause >nul

:: Chamar script principal
call INICIAR_SISTEMA_CORRETO.bat
