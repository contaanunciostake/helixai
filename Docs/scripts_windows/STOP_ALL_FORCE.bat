@echo off
echo ======================================================================
echo         MATANDO TODOS OS PROCESSOS - VENDEAI
echo ======================================================================
echo.

echo [1/6] Matando Python...
taskkill /F /IM python.exe 2>nul
taskkill /F /IM pythonw.exe 2>nul

echo [2/6] Matando Node.js...
taskkill /F /IM node.exe 2>nul

echo [3/6] Matando npm...
taskkill /F /IM npm.cmd 2>nul

echo [4/6] Matando localtunnel...
taskkill /F /FI "WINDOWTITLE eq *localtunnel*" 2>nul
taskkill /F /FI "WINDOWTITLE eq *tunnel*" 2>nul

echo [5/6] Matando MySQL/XAMPP...
taskkill /F /IM mysqld.exe 2>nul
taskkill /F /IM httpd.exe 2>nul

echo [6/6] Liberando portas...
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr ":5000 " ^| findstr "LISTENING"') DO taskkill /F /PID %%P 2>nul
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr ":3001 " ^| findstr "LISTENING"') DO taskkill /F /PID %%P 2>nul

echo.
echo ======================================================================
echo         TODOS OS PROCESSOS MORTOS!
echo ======================================================================
echo.
pause