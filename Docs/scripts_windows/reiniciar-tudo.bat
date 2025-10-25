@echo off
echo ========================================
echo Reiniciando servicos...
echo ========================================

echo.
echo [1/3] Iniciando PostgreSQL...
net start postgresql-x64-14

echo.
echo [2/3] Iniciando MySQL...
net start MySQL80

echo.
echo [3/3] Iniciando MongoDB...
net start MongoDB

echo.
echo ========================================
echo Servicos reiniciados!
echo Agora voce pode rodar: npm run dev
echo ========================================
pause
