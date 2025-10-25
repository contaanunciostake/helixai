@echo off
chcp 65001 >nul
title CORRIGIR WhatsApp Service
color 0C

cls
echo ╔════════════════════════════════════════════════════════════════╗
echo ║         🔧 CORREÇÃO DO WHATSAPP SERVICE - PUPPETEER           ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo Este script vai:
echo   1. Parar todos os processos Node/Chrome/Chromium
echo   2. Limpar sessões e cache
echo   3. Reinstalar dependências
echo   4. Baixar Chromium automaticamente
echo.
echo ⚠️ IMPORTANTE: Feche todas as janelas do WhatsApp Service primeiro!
echo.
pause

:: ============================================================================
:: PASSO 1: MATAR PROCESSOS
:: ============================================================================
echo.
echo [1/5] Encerrando processos Node.js, Chrome e Chromium...
echo.

taskkill /F /IM node.exe 2>nul
taskkill /F /IM chrome.exe 2>nul
taskkill /F /IM chromium.exe 2>nul

timeout /t 3 /nobreak >nul
echo OK - Processos encerrados
echo.

:: ============================================================================
:: PASSO 2: LIMPAR SESSÕES E CACHE
:: ============================================================================
echo [2/5] Limpando sessões antigas e cache...
echo.

cd /d "D:\Helix\HelixAI\whatsapp_service_stable"

if exist sessions rd /s /q sessions 2>nul
if exist .wwebjs_auth rd /s /q .wwebjs_auth 2>nul
if exist .wwebjs_cache rd /s /q .wwebjs_cache 2>nul

:: Criar pasta sessions vazia
mkdir sessions 2>nul

echo OK - Cache limpo
echo.

:: ============================================================================
:: PASSO 3: LIMPAR NODE_MODULES
:: ============================================================================
echo [3/5] Removendo node_modules antigo...
echo.

if exist node_modules (
    rd /s /q node_modules
    echo OK - node_modules removido
) else (
    echo OK - Nenhum node_modules para remover
)
echo.

:: ============================================================================
:: PASSO 4: REINSTALAR DEPENDÊNCIAS
:: ============================================================================
echo [4/5] Reinstalando dependências (pode demorar 2-5 minutos)...
echo.

call npm install

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERRO ao instalar dependências!
    echo Tente executar como Administrador.
    pause
    exit /b 1
)

echo.
echo OK - Dependências instaladas
echo.

:: ============================================================================
:: PASSO 5: VERIFICAR CHROMIUM
:: ============================================================================
echo [5/5] Verificando instalação do Chromium...
echo.

:: Criar script de verificação simples
echo const puppeteer = require('puppeteer'); > test-chrome.js
echo console.log('Testando Chromium...'); >> test-chrome.js
echo puppeteer.launch({ headless: true }).then(browser =^> { >> test-chrome.js
echo   console.log('✅ Chromium funcionando!'); >> test-chrome.js
echo   browser.close(); >> test-chrome.js
echo   process.exit(0); >> test-chrome.js
echo }).catch(err =^> { >> test-chrome.js
echo   console.error('❌ Erro:', err.message); >> test-chrome.js
echo   process.exit(1); >> test-chrome.js
echo }); >> test-chrome.js

node test-chrome.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ╔════════════════════════════════════════════════════════════════╗
    echo ║              ✅ CORREÇÃO CONCLUÍDA COM SUCESSO!                ║
    echo ╚════════════════════════════════════════════════════════════════╝
    echo.
    echo Você pode agora:
    echo   1. Executar novamente o INICIAR_SISTEMA.bat
    echo   2. Ou iniciar manualmente: npm start
    echo.
) else (
    echo.
    echo ╔════════════════════════════════════════════════════════════════╗
    echo ║              ❌ AINDA HÁ PROBLEMAS                             ║
    echo ╚════════════════════════════════════════════════════════════════╝
    echo.
    echo Tente:
    echo   1. Desativar antivírus temporariamente
    echo   2. Executar como Administrador
    echo   3. Liberar espaço em disco
    echo.
)

del test-chrome.js 2>nul

echo.
pause
