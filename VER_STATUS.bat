@echo off
chcp 65001 >nul

:: Criar arquivo temporário com o diagnóstico
echo Gerando diagnóstico...

(
echo ╔════════════════════════════════════════════════════════════════╗
echo ║              🔍 DIAGNÓSTICO DO SISTEMA                         ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo [1/8] Node.js:
node --version 2^>nul ^|^| echo ✗ NAO INSTALADO
echo.
echo [2/8] NPM:
npm --version 2^>nul ^|^| echo ✗ NAO INSTALADO
echo.
echo [3/8] Python:
python --version 2^>nul ^|^| echo ✗ NAO INSTALADO
echo.
echo [4/8] MySQL:
tasklist /FI "IMAGENAME eq mysqld.exe" 2^>NUL ^| find /I "mysqld.exe" ^>NUL
if %%ERRORLEVEL%% EQU 0 ^(echo ✓ MySQL rodando^) else ^(echo ✗ MySQL NAO rodando^)
echo.
echo [5/8] Dependencias VendeAI:
if exist "D:\Helix\HelixAI\VendeAI\whatsapp_service\node_modules" ^(echo ✓ WhatsApp Service OK^) else ^(echo ✗ WhatsApp Service FALTANDO^)
if exist "D:\Helix\HelixAI\VendeAI\bot_engine\node_modules" ^(echo ✓ Bot Engine OK^) else ^(echo ✗ Bot Engine FALTANDO^)
echo.
echo [6/8] Dependencias CRM:
if exist "D:\Helix\HelixAI\CRM_Client\crm-client-app\node_modules" ^(echo ✓ CRM Cliente OK^) else ^(echo ✗ CRM Cliente FALTANDO^)
if exist "D:\Helix\HelixAI\CRM_Admin\crm-admin-app\node_modules" ^(echo ⚠ CRM Admin OK^) else ^(echo ⚠ CRM Admin FALTANDO^)
if exist "D:\Helix\HelixAI\AIra_Landing\node_modules" ^(echo ✓ Landing OK^) else ^(echo ⚠ Landing FALTANDO^)
echo.
echo [7/8] Portas:
netstat -ano ^| findstr :5000 ^| findstr LISTENING ^>nul 2^>^&1
if %%ERRORLEVEL%% EQU 0 ^(echo ⚠ Porta 5000 EM USO^) else ^(echo ✓ Porta 5000 livre^)
netstat -ano ^| findstr :3001 ^| findstr LISTENING ^>nul 2^>^&1
if %%ERRORLEVEL%% EQU 0 ^(echo ⚠ Porta 3001 EM USO^) else ^(echo ✓ Porta 3001 livre^)
netstat -ano ^| findstr :5173 ^| findstr LISTENING ^>nul 2^>^&1
if %%ERRORLEVEL%% EQU 0 ^(echo ⚠ Porta 5173 EM USO^) else ^(echo ✓ Porta 5173 livre^)
echo.
echo [8/8] Banco de dados:
if exist "D:\Helix\HelixAI\VendeAI\vendeai.db" ^(echo ✓ Banco VendeAI OK^) else ^(echo ⚠ Banco VendeAI nao encontrado^)
echo.
echo ════════════════════════════════════════════════════════════════
echo ✅ DIAGNÓSTICO COMPLETO
echo ════════════════════════════════════════════════════════════════
) > "%TEMP%\diagnostico_temp.txt"

:: Abrir em uma janela que NÃO FECHA
start "DIAGNÓSTICO - Mantenha aberta" cmd /k "type %TEMP%\diagnostico_temp.txt && echo. && echo Esta janela NAO vai fechar. Clique no X para fechar."
