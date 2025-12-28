@echo off
title Reiniciar Servidor Flask - Limpar Cache
color 0C

echo ========================================================================
echo           REINICIAR SERVIDOR FLASK - LIMPAR CACHE COMPLETO
echo ========================================================================
echo.

REM Passo 1: Matar todos os processos Python
echo [1/5] Parando todos os processos Python...
taskkill /F /IM python.exe 2>nul
timeout /t 2 /nobreak >nul
echo       OK - Processos Python parados
echo.

REM Passo 2: Limpar cache Python
echo [2/5] Limpando cache Python...
cd /d "D:\Helix\HelixAI\backend"

REM Remover __pycache__
for /d /r . %%d in (__pycache__) do @if exist "%%d" rd /s /q "%%d" 2>nul

REM Remover .pyc
del /s /q *.pyc 2>nul

REM Remover .pyo
del /s /q *.pyo 2>nul

echo       OK - Cache Python limpo
echo.

REM Passo 3: Verificar banco de dados
echo [3/5] Verificando valores no banco...
python -c "import sqlite3; conn = sqlite3.connect('vendeai.db'); c = conn.cursor(); c.execute('SELECT DISTINCT tipo FROM usuarios'); print('       Tipos encontrados:'); [print(f'         - {row[0]}') for row in c.fetchall()]; conn.close()"
echo.

REM Passo 4: Verificar enum no codigo
echo [4/5] Verificando enum no codigo...
python -c "from database.models import TipoUsuario; print('       Enum TipoUsuario:'); [print(f'         - {e.name} = {e.value}') for e in TipoUsuario]"
echo.

REM Passo 5: Iniciar servidor Flask
echo [5/5] Iniciando servidor Flask...
echo.
echo ========================================================================
echo                   SERVIDOR FLASK - PORTA 5000
echo ========================================================================
echo.
echo   URL: http://localhost:5000/
echo   API Auth: http://localhost:5000/api/auth/login
echo.
echo   Testando login com:
echo     Email: demo@vendeai.com
echo     Senha: demo123
echo.
echo ========================================================================
echo.

cd /d "D:\Helix\HelixAI\backend"
python -m flask run --host=0.0.0.0 --port=5000
