@echo off
chcp 65001 >nul
title Testar API CRM Bridge
color 0E

echo ╔════════════════════════════════════════════════════════════════╗
echo ║              🔍 TESTAR API CRM BRIDGE                          ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo Testando rotas do CRM Bridge...
echo.

echo [1/3] Testando GET /api/crm/nicho
curl -X GET http://localhost:5000/api/crm/nicho
echo.
echo.

echo [2/3] Testando GET /api/crm/info
curl -X GET http://localhost:5000/api/crm/info
echo.
echo.

echo [3/3] Testando POST /api/crm/whatsapp/start
curl -X POST http://localhost:5000/api/crm/whatsapp/start -H "Content-Type: application/json"
echo.
echo.

echo ════════════════════════════════════════════════════════════════
echo.
pause
