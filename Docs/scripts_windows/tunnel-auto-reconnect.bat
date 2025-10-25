@echo off
setlocal enabledelayedexpansion
set RETRY=0
cd /d "C:\Users\Victor\Documents\backupsaria\VendeAI\"
:loop
set /a RETRY+=1
echo.
echo ================================================
echo [TUNNEL] Tentativa !RETRY! - Conectando...
echo ================================================
echo.
taskkill /F /IM node.exe /FI "WINDOWTITLE eq *localtunnel*" 2>nul
timeout /t 3 /nobreak >nul
echo [TUNNEL] URL: https://meuapp.loca.lt
npx localtunnel --port 5000 --subdomain meuapp
echo.
echo [TUNNEL] Conexao perdida! Reconectando em 10s...
timeout /t 10 /nobreak >nul
goto loop
