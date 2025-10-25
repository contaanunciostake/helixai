@echo off
chcp 65001 >nul
cls

echo.
echo ======================================================================
echo          VENDEAI - WEBHOOK TUNNEL (ELEVENLABS)
echo ======================================================================
echo.
echo Iniciando LocalTunnel para webhook do ElevenLabs...
echo.

cd /d "%~dp0"

echo [INFO] Verificando se o Backend Flask esta rodando na porta 5000...
timeout /t 2 /nobreak > nul

echo.
echo ======================================================================
echo                 INICIANDO WEBHOOK TUNNEL
echo ======================================================================
echo.
echo   Porta local:     5000
echo   Subdominio:      meuapp
echo   URL publica:     https://meuapp.loca.lt
echo.
echo   Configure este URL no webhook do ElevenLabs:
echo   https://meuapp.loca.lt/webhook/elevenlabs
echo.
echo ======================================================================
echo.

echo [TUNNEL] Iniciando LocalTunnel...
npx localtunnel --port 5000 --subdomain meuapp

pause
