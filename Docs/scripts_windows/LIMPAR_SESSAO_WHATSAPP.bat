@echo off
chcp 65001 >nul
cls

echo ======================================================================
echo VENDEAI - LIMPAR SESSÃO WHATSAPP
echo ======================================================================
echo.
echo Este script remove sessões antigas do WhatsApp para forçar novo QR Code
echo.
echo ⚠️  Use isso quando:
echo    - O QR Code não está sendo gerado
echo    - O WhatsApp desconectou e não reconecta
echo    - Quer trocar o número conectado
echo.

set /p confirma="Deseja continuar? (S/N): "
if /i not "%confirma%"=="S" (
    echo.
    echo Operação cancelada.
    pause
    exit /b 0
)

echo.
echo Limpando sessões antigas...

cd whatsapp_service

if exist "sessions" (
    rmdir /s /q sessions
    echo ✅ Sessões removidas com sucesso!
) else (
    echo ℹ️  Nenhuma sessão encontrada.
)

echo.
echo ======================================================================
echo PRÓXIMOS PASSOS:
echo ======================================================================
echo.
echo 1. Reinicie o serviço WhatsApp (START_WHATSAPP.bat)
echo 2. Acesse http://localhost:5000/whatsapp/
echo 3. Clique em "Gerar QR Code"
echo 4. Escaneie com seu WhatsApp
echo.
echo ======================================================================
echo.

pause
