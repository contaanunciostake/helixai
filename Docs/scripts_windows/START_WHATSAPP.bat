@echo off
chcp 65001 >nul
cls

echo ======================================================================
echo VENDEAI - INICIAR SERVIÇO WHATSAPP
echo ======================================================================
echo.

cd whatsapp_service

echo [1/3] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo ❌ Node.js não está instalado!
    echo.
    echo Por favor, instale o Node.js:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)
echo ✅ Node.js encontrado

echo.
echo [2/3] Verificando dependências...
if not exist "node_modules" (
    echo ⚠️  Instalando dependências pela primeira vez...
    echo Isso pode demorar alguns minutos...
    call npm install
    if errorlevel 1 (
        echo.
        echo ❌ Erro ao instalar dependências!
        pause
        exit /b 1
    )
) else (
    echo ✅ Dependências já instaladas
)

echo.
echo [3/3] Iniciando serviço WhatsApp...
echo.
echo ======================================================================
echo SERVIÇO WHATSAPP WEB RODANDO
echo ======================================================================
echo.
echo Acesse: http://localhost:3001/health
echo.
echo Pressione Ctrl+C para parar o serviço
echo.
echo ======================================================================
echo.

npm start
