@echo off
title AIRA - Painel de Afiliados
color 0A

echo.
echo ========================================
echo   AIRA - PAINEL DE AFILIADOS
echo ========================================
echo.
echo Iniciando servidor em http://localhost:5178
echo.

cd Afiliados_Panel

REM Verificar se node_modules existe
if not exist "node_modules\" (
    echo Instalando dependencias...
    call npm install
    echo.
)

echo Iniciando servidor...
npm run dev

pause
