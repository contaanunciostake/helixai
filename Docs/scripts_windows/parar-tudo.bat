@echo off
echo ========================================
echo Parando todos os processos...
echo ========================================

echo.
echo [1/5] Parando Node.js...
taskkill /F /IM node.exe 2>nul
if %errorlevel%==0 (echo Node.js parado com sucesso!) else (echo Nenhum processo Node.js encontrado)

echo.
echo [2/5] Parando Python...
taskkill /F /IM python.exe 2>nul
taskkill /F /IM pythonw.exe 2>nul
if %errorlevel%==0 (echo Python parado com sucesso!) else (echo Nenhum processo Python encontrado)

echo.
echo [3/5] Parando bancos de dados...
net stop postgresql-x64-14 2>nul
net stop MySQL80 2>nul
net stop MongoDB 2>nul
echo Bancos de dados verificados

echo.
echo [4/5] Parando Redis...
net stop Redis 2>nul

echo.
echo [5/5] Verificando portas em uso...
netstat -ano | findstr ":3000 :5000 :8000 :8080 :5432"

echo.
echo ========================================
echo Processo concluido!
echo Aguarde 5 segundos antes de fazer backup
echo ========================================
timeout /t 5

pause
