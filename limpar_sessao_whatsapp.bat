@echo off
echo ========================================
echo LIMPANDO SESSAO WHATSAPP - EMPRESA 22
echo ========================================
echo.

REM Parar o bot se estiver rodando
echo [1/3] Parando bot...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

REM Limpar pasta de autenticação da empresa 22
echo [2/3] Removendo sessao antiga...
if exist "whatsapp_service\auth_info_baileys\empresa_22" (
    rmdir /S /Q "whatsapp_service\auth_info_baileys\empresa_22"
    echo    OK - Pasta removida
) else (
    echo    OK - Pasta nao existe
)

REM Limpar cache do navegador
echo [3/3] Limpando cache do navegador...
if exist "whatsapp_service\.wwebjs_auth\session-empresa_22" (
    rmdir /S /Q "whatsapp_service\.wwebjs_auth\session-empresa_22"
    echo    OK - Cache removido
) else (
    echo    OK - Cache nao existe
)

echo.
echo ========================================
echo LIMPEZA CONCLUIDA!
echo ========================================
echo.
echo Agora voce pode:
echo 1. Iniciar o bot novamente
echo 2. Acessar o CRM Cliente
echo 3. Ir em WhatsApp Connection
echo 4. Clicar em "Conectar WhatsApp"
echo 5. Escanear o novo QR Code
echo.
pause
