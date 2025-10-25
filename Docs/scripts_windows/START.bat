@echo off
chcp 65001 >nul
cls

echo.
echo ======================================================================
echo              VENDEAI - SISTEMA INTEGRADO COMPLETO
echo ======================================================================
echo.
echo Iniciando todos os servidores simultaneamente...
echo.

cd /d "%~dp0"

:: ==== VERIFICACAO E ATUALIZACAO DE DEPENDENCIAS ====
echo [Verificacao] Checando dependencias Python...
echo.

:: Verifica se requirements.txt existe
if exist requirements.txt (
    echo Atualizando dependencias Python...
    pip install -r requirements.txt --upgrade --quiet
    if errorlevel 1 (
        echo [AVISO] Erro ao atualizar dependencias Python
        echo Continuando com dependencias atuais...
    ) else (
        echo [OK] Dependencias Python atualizadas
    )
) else (
    echo [AVISO] Arquivo requirements.txt nao encontrado
)
echo.

:: ==== LIMPEZA DE CACHE PYTHON ====
echo [Limpeza] Removendo cache Python...
for /d /r %%d in (__pycache__) do @if exist "%%d" rd /s /q "%%d" 2>nul
for /r %%f in (*.pyc) do @if exist "%%f" del /q "%%f" 2>nul
for /r %%f in (*.pyo) do @if exist "%%f" del /q "%%f" 2>nul
echo [OK] Cache Python removido
echo.

:: ==== VERIFICACAO DO BANCO DE DADOS ====
echo [Verificacao] Checando banco de dados...
if exist vendeai.db (
    echo [OK] Banco de dados encontrado: vendeai.db
) else (
    echo [INFO] Banco de dados sera criado automaticamente
)
echo.

:: ==== VERIFICACAO NODE.JS ====
echo [Verificacao] Checando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Node.js nao encontrado!
    echo Por favor, instale o Node.js: https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js instalado
echo.

:: ==== VERIFICACAO DE DEPENDENCIAS NODE.JS ====
echo [Verificacao] Checando dependencias Node.js...

if exist "whatsapp_service" (
    if not exist "whatsapp_service\node_modules" (
        echo [INFO] Instalando dependencias do WhatsApp Service...
        cd whatsapp_service
        call npm install --quiet
        cd ..
    )
    echo [OK] WhatsApp Service dependencias OK
)

if exist "bot_engine" (
    if not exist "bot_engine\node_modules" (
        echo [INFO] Instalando dependencias do Bot Engine...
        cd bot_engine
        call npm install --quiet
        cd ..
    )
    echo [OK] Bot Engine dependencias OK
)
echo.

:: ==== CRIAR SCRIPT AUTO-RECONNECT TUNNEL ====
echo [Setup] Criando script de auto-reconnect...
(
echo @echo off
echo setlocal enabledelayedexpansion
echo set RETRY=0
echo cd /d "%~dp0"
echo :loop
echo set /a RETRY+=1
echo echo.
echo echo ================================================
echo echo [TUNNEL] Tentativa !RETRY! - Conectando...
echo echo ================================================
echo echo.
echo taskkill /F /IM node.exe /FI "WINDOWTITLE eq *localtunnel*" 2^>nul
echo timeout /t 3 /nobreak ^>nul
echo echo [TUNNEL] URL: https://meuapp.loca.lt
echo npx localtunnel --port 5000 --subdomain meuapp
echo echo.
echo echo [TUNNEL] Conexao perdida! Reconectando em 10s...
echo timeout /t 10 /nobreak ^>nul
echo goto loop
) > "%~dp0tunnel-auto-reconnect.bat"
echo [OK] Script de auto-reconnect criado
echo.

:: ==== INICIANDO TODOS OS SERVIDORES ====
echo ======================================================================
echo                 INICIANDO SERVIDORES
echo ======================================================================
echo.

echo [1/4] Iniciando Backend Flask (porta 5000)...
start "VendeAI Backend Flask" cmd /k "cd /d "%~dp0" && python backend/app.py"
timeout /t 3 /nobreak > nul

echo [2/4] Iniciando WhatsApp Service (porta 3001)...
start "VendeAI WhatsApp Service" cmd /k "cd /d "%~dp0\whatsapp_service" && npm start"
timeout /t 3 /nobreak > nul

echo [3/4] Iniciando Bot Engine...
start "VendeAI Bot Engine" cmd /k "cd /d "%~dp0\bot_engine" && node main.js"
timeout /t 3 /nobreak > nul

echo [4/4] Iniciando Webhook Tunnel com Auto-Reconnect...
echo [INFO] Aguardando Backend Flask inicializar...
timeout /t 5 /nobreak > nul
start "VendeAI Webhook Tunnel [AUTO-RECONNECT]" cmd /k "%~dp0tunnel-auto-reconnect.bat"
timeout /t 5 /nobreak > nul

echo.
echo ======================================================================
echo              TODOS OS SERVIDORES RODANDO!
echo ======================================================================
echo.
echo   [Backend Flask]        http://localhost:5000
echo   [WhatsApp Service]     http://localhost:3001/health
echo   [Bot Engine]           Rodando em background
echo   [Webhook Tunnel]       https://meuapp.loca.lt [AUTO-RECONNECT]
echo.
echo   [IMPORTANTE] O Webhook Tunnel agora tem AUTO-RECONNECT!
echo                Se a conexao cair, ele reconecta automaticamente.
echo.
echo ======================================================================
echo                      CREDENCIAIS DE ACESSO
echo ======================================================================
echo.
echo   Login Demo:   demo@vendeai.com / demo123
echo   Login Admin:  admin@vendeai.com / admin123
echo.
echo ======================================================================
echo                    CONFIGURACAO DO WEBHOOK
echo ======================================================================
echo.
echo   Configure no ElevenLabs:
echo   URL: https://meuapp.loca.lt/api/webhook/elevenlabs
echo.
echo   [NOVO] URL SEMPRE A MESMA: meuapp.loca.lt
echo   [NOVO] Auto-reconnect ativado (reconecta automaticamente)
echo.
echo ======================================================================
echo                         OBSERVACOES
echo ======================================================================
echo.
echo   - 4 janelas de terminal foram abertas (uma para cada servidor)
echo   - Webhook Tunnel tem AUTO-RECONNECT (reconecta se cair)
echo   - Para parar um servidor, feche sua janela ou pressione Ctrl+C
echo   - Para parar tudo, feche todas as janelas
echo.
echo   Janelas abertas:
echo   1. VendeAI Backend Flask
echo   2. VendeAI WhatsApp Service
echo   3. VendeAI Bot Engine
echo   4. VendeAI Webhook Tunnel [AUTO-RECONNECT]
echo.
echo ======================================================================
echo.
echo [INFO] Sistema completamente inicializado!
echo [INFO] Dependencias atualizadas e cache limpo
echo [INFO] Webhook Tunnel com auto-reconnect configurado
echo.
pause