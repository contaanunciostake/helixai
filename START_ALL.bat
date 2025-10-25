@echo off
echo ========================================
echo   INICIANDO SISTEMA INTEGRADO
echo   CRM + VendeAI + WhatsApp
echo ========================================
echo.

echo [1/3] Iniciando VendeAI Backend...
start "VendeAI Backend" cmd /k "cd /d %~dp0VendeAI && python backend/app.py"
timeout /t 3 /nobreak >nul

echo [2/3] Iniciando WhatsApp Service...
start "WhatsApp Service" cmd /k "cd /d %~dp0VendeAI\whatsapp_service && npm start"
timeout /t 3 /nobreak >nul

echo [3/3] Iniciando CRM Client...
start "CRM Client" cmd /k "cd /d %~dp0CRM_Client\crm-client-app && npm run dev"

echo.
echo ========================================
echo   TODOS OS SERVICOS INICIADOS!
echo ========================================
echo.
echo Aguarde alguns segundos e acesse:
echo.
echo   CRM Client: http://localhost:5173
echo   VendeAI Backend: http://localhost:5000
echo.
echo Credenciais de teste:
echo   Email: demo@vendeai.com
echo   Senha: demo123
echo.
echo Para parar, feche todas as janelas do terminal.
echo ========================================
pause
