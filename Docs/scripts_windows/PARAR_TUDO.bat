@echo off
echo.
echo ======================================================================
echo              PARANDO TODOS OS PROCESSOS
echo ======================================================================
echo.

echo Parando processos Python...
taskkill /F /IM python.exe 2>nul
echo.

echo Parando processos Node...
taskkill /F /IM node.exe 2>nul
echo.

echo ======================================================================
echo              TODOS OS PROCESSOS PARADOS
echo ======================================================================
echo.

pause
