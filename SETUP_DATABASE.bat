@echo off
chcp 65001 >nul
title Setup Database - HelixAI
color 0E

cls
echo ╔════════════════════════════════════════════════════════════════╗
echo ║           🗄️  SETUP BANCO DE DADOS - HELIXAI                   ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo [INFO] Este script irá configurar o banco de dados MySQL
echo [INFO] Certifique-se de que o XAMPP está rodando!
echo.
pause
echo.

:: Verificar se o MySQL está rodando
echo [1/3] Verificando se MySQL está ativo...
tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I /N "mysqld.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo ✅ MySQL está rodando!
) else (
    echo ❌ MySQL não está rodando!
    echo.
    echo Por favor, inicie o XAMPP e o MySQL antes de continuar.
    echo Abra o XAMPP Control Panel e clique em "Start" no MySQL.
    echo.
    pause
    exit /b 1
)

echo.
echo [2/3] Criando banco de dados helixai_db (se não existir)...
mysql -u root -e "CREATE DATABASE IF NOT EXISTS helixai_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>NUL

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Erro ao conectar no MySQL!
    echo.
    echo Possíveis soluções:
    echo 1. Verifique se o MySQL está rodando no XAMPP
    echo 2. Verifique se o usuário 'root' não tem senha
    echo 3. Verifique se o MySQL está na porta 3306
    echo.
    pause
    exit /b 1
)

echo ✅ Banco de dados helixai_db pronto!

echo.
echo [3/3] Criando tabelas essenciais...
mysql -u root helixai_db < "D:\Helix\HelixAI\Databases\setup_aira_auto_tables.sql"

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Erro ao criar tabelas!
    pause
    exit /b 1
)

echo ✅ Tabelas criadas com sucesso!

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║              ✅ BANCO DE DADOS CONFIGURADO!                     ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo 📋 Resumo:
echo   - Banco: helixai_db
echo   - Tabelas: cars, vendors
echo   - Host: localhost:3306
echo   - User: root
echo   - Password: (vazio)
echo.
echo Agora você pode iniciar o sistema com INICIAR_TUDO.bat
echo.
pause
