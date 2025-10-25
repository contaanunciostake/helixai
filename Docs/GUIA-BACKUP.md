# Guia de Backup Completo do Sistema

## Problema
Quando fazemos backup com processos rodando, arquivos podem estar bloqueados (abertos por aplicações), causando erros ao extrair o .rar.

## Solução: Parar Todos os Processos Antes do Backup

### 1. Identificar Processos Rodando

Antes de tudo, verifique quais processos estão rodando:

```bash
# Verificar processos Node.js
tasklist | findstr node

# Verificar processos Python
tasklist | findstr python

# Verificar processos do banco de dados
tasklist | findstr postgres
tasklist | findstr mysql
tasklist | findstr mongod
```

### 2. Parar Processos de Desenvolvimento

#### A) Parar Node.js / Servidores Web
```bash
# Matar TODOS os processos Node.js
taskkill /F /IM node.exe

# Matar processos Python (se houver)
taskkill /F /IM python.exe
taskkill /F /IM pythonw.exe
```

#### B) Parar Bancos de Dados

**PostgreSQL:**
```bash
# Parar serviço PostgreSQL
net stop postgresql-x64-14
# OU
sc stop postgresql-x64-14
```

**MySQL:**
```bash
net stop MySQL80
```

**MongoDB:**
```bash
net stop MongoDB
```

**SQLite:** Não precisa parar, mas certifique-se que nenhuma aplicação está usando o arquivo.

#### C) Parar Outros Serviços Comuns

**Redis:**
```bash
net stop Redis
```

**Docker (se estiver usando):**
```bash
docker stop $(docker ps -aq)
```

### 3. Verificar Portas em Uso

Certifique-se que nenhuma porta está sendo usada:

```bash
# Verificar portas comuns
netstat -ano | findstr :3000
netstat -ano | findstr :5000
netstat -ano | findstr :8000
netstat -ano | findstr :8080
netstat -ano | findstr :5432
netstat -ano | findstr :3306
netstat -ano | findstr :27017
```

Se houver algum PID (número na última coluna), mate o processo:
```bash
taskkill /F /PID <numero_do_pid>
```

### 4. Fechar Editores e IDEs

- Feche **VS Code**
- Feche **Visual Studio**
- Feche qualquer **navegador** com DevTools aberto
- Feche **terminal/PowerShell**

### 5. Script Completo para Parar Tudo

Crie um arquivo `parar-tudo.bat`:

```batch
@echo off
echo ========================================
echo Parando todos os processos...
echo ========================================

echo.
echo [1/5] Parando Node.js...
taskkill /F /IM node.exe 2>nul
if %errorlevel%==0 (echo Node.js parado com sucesso!) else (echo Nenhum processo Node.js encontrado)

echo.
echo [2/5] Parando Python...
taskkill /F /IM python.exe 2>nul
taskkill /F /IM pythonw.exe 2>nul
if %errorlevel%==0 (echo Python parado com sucesso!) else (echo Nenhum processo Python encontrado)

echo.
echo [3/5] Parando bancos de dados...
net stop postgresql-x64-14 2>nul
net stop MySQL80 2>nul
net stop MongoDB 2>nul
echo Bancos de dados verificados

echo.
echo [4/5] Parando Redis...
net stop Redis 2>nul

echo.
echo [5/5] Verificando portas em uso...
netstat -ano | findstr ":3000 :5000 :8000 :8080 :5432"

echo.
echo ========================================
echo Processo concluido!
echo Aguarde 5 segundos antes de fazer backup
echo ========================================
timeout /t 5

pause
```

### 6. Fazer o Backup

Depois de executar o script acima:

1. Aguarde alguns segundos para garantir que tudo parou
2. **IMPORTANTE:** Exclua as pastas temporárias antes do backup:
   - `node_modules/` (pode reinstalar depois com `npm install`)
   - `.next/` ou `dist/` ou `build/` (arquivos compilados)
   - `.git/` (se você tem backup do repositório em outro lugar)
   - `__pycache__/` (Python)
   - `.venv/` ou `venv/` (ambiente virtual Python)

3. Use o WinRAR ou 7-Zip para criar o backup:

**Com WinRAR (linha de comando):**
```bash
"C:\Program Files\WinRAR\WinRAR.exe" a -r -ep1 backup-vendeai-%date:~-4,4%%date:~-10,2%%date:~-7,2%.rar "C:\Users\Victor\Documents\VendeAI\*"
```

**Com 7-Zip (linha de comando):**
```bash
"C:\Program Files\7-Zip\7z.exe" a -tzip backup-vendeai-%date:~-4,4%%date:~-10,2%%date:~-7,2%.zip "C:\Users\Victor\Documents\VendeAI\*"
```

### 7. Script Completo de Backup

Crie um arquivo `fazer-backup.bat`:

```batch
@echo off
setlocal enabledelayedexpansion

echo ========================================
echo BACKUP AUTOMATICO - VendeAI
echo ========================================

:: 1. Parar processos
echo [Etapa 1] Parando processos...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM python.exe 2>nul
net stop postgresql-x64-14 2>nul
net stop MySQL80 2>nul
net stop MongoDB 2>nul

:: 2. Aguardar
echo [Etapa 2] Aguardando processos finalizarem...
timeout /t 3 /nobreak >nul

:: 3. Nome do arquivo com data
set "DATA=%date:~-4,4%%date:~-10,2%%date:~-7,2%"
set "HORA=%time:~0,2%%time:~3,2%"
set "HORA=%HORA: =0%"
set "BACKUP_NAME=backup-vendeai-%DATA%-%HORA%.rar"

:: 4. Criar backup
echo [Etapa 3] Criando backup: %BACKUP_NAME%
"C:\Program Files\WinRAR\WinRAR.exe" a -r -ep1 -x*node_modules* -x*.next* -x*dist* -x*build* -x*.git* -x*__pycache__* -x*.venv* "C:\Users\Victor\Documents\%BACKUP_NAME%" "C:\Users\Victor\Documents\VendeAI\*"

echo.
echo ========================================
echo Backup concluido!
echo Arquivo: %BACKUP_NAME%
echo ========================================
echo.

:: 5. Verificar se deseja reiniciar servicos
echo Deseja reiniciar os servicos? (S/N)
choice /C SN /M "Escolha"
if errorlevel 2 goto fim
if errorlevel 1 goto reiniciar

:reiniciar
echo.
echo Reiniciando servicos...
net start postgresql-x64-14 2>nul
net start MySQL80 2>nul
net start MongoDB 2>nul
echo Servicos reiniciados!

:fim
pause
```

### 8. Reiniciar Tudo Depois do Backup

Crie um arquivo `reiniciar-tudo.bat`:

```batch
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
```

### 9. Checklist Antes do Backup

- [ ] Salvou todos os arquivos abertos
- [ ] Fechou VS Code e outros editores
- [ ] Executou `parar-tudo.bat`
- [ ] Aguardou os processos finalizarem
- [ ] Verificou que nenhuma porta está em uso
- [ ] Criou o backup
- [ ] Testou extrair o backup em outra pasta
- [ ] Executou `reiniciar-tudo.bat` se precisar continuar trabalhando

### 10. Dicas Importantes

1. **Exclua pastas grandes desnecessárias**: `node_modules`, `.next`, `dist`, `build` podem ser recriadas
2. **Use exclusões no WinRAR**: `-x*node_modules*` para excluir automaticamente
3. **Teste o backup**: Sempre teste extrair o .rar em outra pasta para garantir que está OK
4. **Backup incremental**: Considere usar Git para versionamento em vez de .rar
5. **Nuvem**: Considere usar GitHub, GitLab ou backup na nuvem

### 11. Solução de Problemas

**Erro ao extrair mesmo após parar tudo:**
- Pode ser antivírus bloqueando. Desative temporariamente durante o backup
- Execute o CMD como Administrador
- Verifique permissões da pasta

**Backup muito grande:**
- Exclua `node_modules/`: pode reinstalar com `npm install`
- Exclua arquivos de build: `.next/`, `dist/`, `build/`
- Use compressão máxima no WinRAR

**Processo não para:**
- Use o Gerenciador de Tarefas (Ctrl+Shift+Esc)
- Procure por processos Node.js ou Python
- Finalize manualmente

---

## Comando Rápido de Emergência

Se precisar parar TUDO rapidamente:

```batch
taskkill /F /IM node.exe & taskkill /F /IM python.exe & net stop postgresql-x64-14 & net stop MySQL80 & net stop MongoDB
```
