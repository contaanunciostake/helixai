@echo off
echo ════════════════════════════════════════════════════════════════
echo FIX COMPLETO: Adicionar TODAS as colunas necessarias
echo ════════════════════════════════════════════════════════════════
echo.

cd /d D:\Helix\HelixAI

echo [INFO] Executando SQL COMPLETO no banco helixai_db...
echo [INFO] Adicionando 21 colunas...
echo.

:: Executar SQL via MySQL
:: AJUSTE A SENHA DO ROOT SE NECESSÁRIO!
mysql -u root -p helixai_db < fix_empresas_COMPLETO.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ════════════════════════════════════════════════════════════════
    echo ✅ SQL EXECUTADO COM SUCESSO!
    echo ════════════════════════════════════════════════════════════════
    echo.
    echo 21 colunas adicionadas:
    echo [Informacoes]
    echo - nome_fantasia, cnpj, telefone, email, website
    echo.
    echo [WhatsApp/Bot]
    echo - whatsapp_numero, whatsapp_conectado, whatsapp_qr_code
    echo - whatsapp_status, bot_ativo
    echo.
    echo [Planos]
    echo - plano, plano_ativo, data_inicio_plano, data_fim_plano
    echo - limite_leads, limite_disparos_mes, limite_usuarios
    echo.
    echo [Endereco]
    echo - endereco, cidade, estado, cep
    echo.
    echo [Timestamps]
    echo - criado_em, atualizado_em
    echo.
) else (
    echo.
    echo ════════════════════════════════════════════════════════════════
    echo ❌ ERRO AO EXECUTAR SQL
    echo ════════════════════════════════════════════════════════════════
    echo.
    echo Verifique:
    echo 1. MySQL está rodando?
    echo 2. Senha do root está correta?
    echo 3. Banco helixai_db existe?
    echo.
)

pause
