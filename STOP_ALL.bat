@echo off
echo ========================================
echo   PARANDO SISTEMA INTEGRADO
echo ========================================
echo.

echo Parando VendeAI Backend (porta 5000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do taskkill /F /PID %%a 2>nul

echo Parando WhatsApp Service (porta 3001)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001') do taskkill /F /PID %%a 2>nul

echo Parando CRM Client (porta 5173)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do taskkill /F /PID %%a 2>nul

echo.
echo ========================================
echo   TODOS OS SERVICOS PARADOS!
echo ========================================
pause
