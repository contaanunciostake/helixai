@echo off
chcp 65001 >nul
title Backend Flask - Port 5000
color 0D

cd /d "D:\Helix\HelixAI\backend"

echo ════════════════════════════════════════
echo 🔧 Backend Flask API
echo 📍 URL: http://localhost:5000/
echo 📊 API: http://localhost:5000/api/
echo ════════════════════════════════════════
echo.

:: Verificar se o Python está instalado
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Python não encontrado!
    echo Por favor, instale o Python 3.9+ primeiro.
    pause
    exit /b 1
)

:: Instalar dependências se necessário
if not exist "venv" (
    echo [INFO] Criando ambiente virtual...
    python -m venv venv
)

:: Ativar ambiente virtual
call venv\Scripts\activate.bat

:: Verificar se precisa instalar dependências
echo [INFO] Verificando dependências...
pip install flask flask-cors flask-login python-dotenv sqlalchemy pymysql cryptography -q

:: Iniciar servidor
echo.
echo ✅ Iniciando servidor Flask...
echo.
python app.py
