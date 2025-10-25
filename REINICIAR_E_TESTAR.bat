@echo off
echo ============================================================
echo REINICIAR BACKEND E TESTAR LOGIN DE AFILIADO
echo ============================================================
echo.

echo [1/5] Parando processos Python antigos...
taskkill /F /IM python.exe /T >nul 2>&1
timeout /t 2 >nul
echo      Processos parados!
echo.

echo [2/5] Verificando codigo atualizado...
python verificar_rotas.py
echo.
pause
echo.

echo [3/5] Iniciando backend...
start "Backend AIRA" cmd /k "cd backend && python app.py"
echo      Aguardando backend iniciar (10 segundos)...
timeout /t 10
echo.

echo [4/5] Testando endpoint de login...
python testar_login_afiliado.py
echo.

echo [5/5] Processo concluido!
echo.
echo Se o login funcionou (Status 200), o problema esta resolvido!
echo Se ainda da erro 404, o backend nao iniciou corretamente.
echo.
pause
