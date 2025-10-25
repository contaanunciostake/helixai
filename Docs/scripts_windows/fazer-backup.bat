@echo off
setlocal enabledelayedexpansion

echo ========================================
echo BACKUP AUTOMATICO - VendeAI
echo ========================================

:: 1. Parar processos
echo [Etapa 1] Parando processos...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM python.exe 2>nul
net stop postgresql-x64-14 2>nul
net stop MySQL80 2>nul
net stop MongoDB 2>nul

:: 2. Aguardar
echo [Etapa 2] Aguardando processos finalizarem...
timeout /t 3 /nobreak >nul

:: 3. Nome do arquivo com data
set "DATA=%date:~-4,4%%date:~-10,2%%date:~-7,2%"
set "HORA=%time:~0,2%%time:~3,2%"
set "HORA=%HORA: =0%"
set "BACKUP_NAME=backup-vendeai-%DATA%-%HORA%.rar"

:: 4. Criar backup
echo [Etapa 3] Criando backup: %BACKUP_NAME%
"C:\Program Files\WinRAR\WinRAR.exe" a -r -ep1 -x*node_modules* -x*.next* -x*dist* -x*build* -x*.git* -x*__pycache__* -x*.venv* "C:\Users\Victor\Documents\%BACKUP_NAME%" "C:\Users\Victor\Documents\VendeAI\*"

echo.
echo ========================================
echo Backup concluido!
echo Arquivo: %BACKUP_NAME%
echo ========================================
echo.

:: 5. Verificar se deseja reiniciar servicos
echo Deseja reiniciar os servicos? (S/N)
choice /C SN /M "Escolha"
if errorlevel 2 goto fim
if errorlevel 1 goto reiniciar

:reiniciar
echo.
echo Reiniciando servicos...
net start postgresql-x64-14 2>nul
net start MySQL80 2>nul
net start MongoDB 2>nul
echo Servicos reiniciados!

:fim
pause
