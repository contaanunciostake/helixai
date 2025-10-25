@echo off
chcp 65001 >nul
title AIra - Webhook ElevenLabs
color 0E

:: Solicita privilégios de administrador
net session >nul 2>&1
if %errorLevel% neq 0 (
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

cls
echo ╔════════════════════════════════════════════════════════════════╗
echo ║           🎙️  AIra - Webhook ElevenLabs + Ngrok                ║
echo ║              Integração de Voz com Inteligência Artificial     ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo ┌────────────────────────────────────────────────────────────────┐
echo │ 📋 INFORMAÇÕES DO WEBHOOK                                      │
echo ├────────────────────────────────────────────────────────────────┤
echo │                                                                │
echo │ 🔌 Projeto: VendeAI (Bot de Veículos)                       │
echo │                                                                │
echo │ 🌐 Endpoints Disponíveis:                                     │
echo │    • /api/webhook/elevenlabs/buscar-carros                   │
echo │    • /api/webhook/elevenlabs/detalhes-veiculo                │
echo │    • /api/webhook/elevenlabs/calcular-financiamento          │
echo │    • /api/webhook/elevenlabs/agendar-visita                  │
echo │                                                                │
echo │ 📄 Configuração: ELEVENLABS_FUNCTIONS.json                    │
echo │                                                                │
echo └────────────────────────────────────────────────────────────────┘
echo.
echo [SISTEMA] Verificando dependências...
echo.

:: Verificar se Node.js está instalado
where node >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ ERRO: Node.js não encontrado!
    echo.
    echo 📥 Instale o Node.js em: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Verificar se o projeto existe
if not exist "D:\Helix\HelixAI\VendeAI\main.js" (
    echo ❌ ERRO: Projeto AIra_Auto não encontrado!
    echo.
    echo 📂 Verifique se o caminho está correto: D:\Helix\HelixAI\AIra_Auto
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js encontrado
echo ✅ Projeto AIra_Auto encontrado
echo.

:: Limpar cache
echo [CACHE] Limpando cache do projeto...
cd /d "D:\Helix\HelixAI\AIra_Auto"
call npm cache clean --force 2>nul
echo.

:: Iniciar servidor principal (AIra_Auto) na porta padrão
echo [1/2] Iniciando servidor AIra_Auto...
echo.
start "🚗 AIra Auto - Servidor Principal" powershell -NoExit -Command "cd 'D:\Helix\HelixAI\AIra_Auto'; Write-Host '════════════════════════════════════════════════════════' -ForegroundColor Cyan; Write-Host '🚗 AIra Auto - Servidor de Webhooks ElevenLabs' -ForegroundColor Green; Write-Host '════════════════════════════════════════════════════════' -ForegroundColor Cyan; Write-Host ''; Write-Host '🔌 Iniciando servidor...' -ForegroundColor Yellow; Write-Host ''; npm start"

timeout /t 3 /nobreak >nul

:: Iniciar Ngrok (expor servidor local para internet)
echo [2/2] Iniciando Ngrok para expor webhook...
echo.
echo ┌────────────────────────────────────────────────────────────────┐
echo │ 🌍 Ngrok está criando um túnel público para seu servidor      │
echo │                                                                │
echo │ ⚠️  IMPORTANTE:                                                │
echo │    1. Copie a URL HTTPS gerada pelo Ngrok                     │
echo │    2. Atualize a URL no arquivo ELEVENLABS_FUNCTIONS.json     │
echo │    3. Configure os webhooks no painel do ElevenLabs           │
echo │                                                                │
echo │ 📝 Exemplo de URL:                                            │
echo │    https://abc123.ngrok-free.app                              │
echo │                                                                │
echo │ 🔗 URLs completas dos endpoints:                              │
echo │    https://[URL-NGROK]/api/webhook/elevenlabs/buscar-carros  │
echo │    https://[URL-NGROK]/api/webhook/elevenlabs/detalhes-...   │
echo │                                                                │
echo └────────────────────────────────────────────────────────────────┘
echo.

:: Iniciar ngrok na porta 3000 (ou a porta que o AIra_Auto usa)
:: Ajuste a porta conforme necessário
start "🌍 Ngrok - Túnel Público" powershell -NoExit -Command "Write-Host '════════════════════════════════════════════════════════' -ForegroundColor Cyan; Write-Host '🌍 Ngrok - Túnel Público para Webhook' -ForegroundColor Green; Write-Host '════════════════════════════════════════════════════════' -ForegroundColor Cyan; Write-Host ''; Write-Host '⏳ Aguarde a geração da URL pública...' -ForegroundColor Yellow; Write-Host ''; Write-Host '📋 COPIE A URL HTTPS QUE APARECERÁ ABAIXO:' -ForegroundColor Magenta; Write-Host ''; cd 'D:\Helix\HelixAI\AIra_Auto'; npx ngrok http 3000"

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║         ✅ Webhook ElevenLabs iniciado com sucesso!            ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo 📌 Próximos passos:
echo.
echo    1️⃣  Aguarde o Ngrok gerar a URL pública (janela separada)
echo    2️⃣  Copie a URL HTTPS fornecida pelo Ngrok
echo    3️⃣  Atualize ELEVENLABS_FUNCTIONS.json com a nova URL
echo    4️⃣  Configure os webhooks no painel do ElevenLabs
echo    5️⃣  Teste as funções com o agente de voz
echo.
echo ⚠️  Mantenha todas as janelas abertas para o webhook funcionar
echo ⚠️  Para parar, feche todas as janelas
echo.
echo 📚 Documentação: ELEVENLABS_FUNCTIONS.json
echo 🌐 Painel ElevenLabs: https://elevenlabs.io/
echo.
pause
