@echo off
chcp 65001 >nul
cls

echo.
echo ======================================================================
echo              VENDEAI - PARAR TODOS OS SERVIDORES
echo ======================================================================
echo.

:: Mata processos Python relacionados ao VendeAI
echo [1/3] Parando Backend Flask (Python)...
taskkill /FI "WINDOWTITLE eq VendeAI Backend Flask*" /T /F >nul 2>&1
if errorlevel 1 (
    echo [INFO] Backend Flask não estava rodando
) else (
    echo [OK] Backend Flask parado
)

:: Mata processos Node.js do WhatsApp Service
echo [2/3] Parando WhatsApp Service (Node.js)...
taskkill /FI "WINDOWTITLE eq VendeAI WhatsApp Service*" /T /F >nul 2>&1
if errorlevel 1 (
    echo [INFO] WhatsApp Service não estava rodando
) else (
    echo [OK] WhatsApp Service parado
)

:: Mata processos Node.js do Bot Engine
echo [3/3] Parando Bot Engine (Node.js)...
taskkill /FI "WINDOWTITLE eq VendeAI Bot Engine*" /T /F >nul 2>&1
if errorlevel 1 (
    echo [INFO] Bot Engine não estava rodando
) else (
    echo [OK] Bot Engine parado
)

echo.
echo ======================================================================
echo              TODOS OS SERVIDORES FORAM PARADOS
echo ======================================================================
echo.
echo [INFO] Sistema encerrado com sucesso
echo.
pause
