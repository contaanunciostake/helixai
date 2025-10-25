@echo off
chcp 65001 >nul
cls

echo.
echo ======================================================================
echo          CORRIGIR FOTOS COM car_id NULL
echo ======================================================================
echo.
echo Este script vai:
echo  - Buscar fotos sem car_id na tabela car_images
echo  - Encontrar o veiculo correto (por data/hora)
echo  - Atualizar automaticamente
echo.
echo ======================================================================
echo.

echo [INFO] Executando script de correção...
echo.

cd /d "%~dp0bot_engine"
node fix-car-id.cjs

echo.
echo ======================================================================
echo.

pause
