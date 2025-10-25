# 🤖 Robô Disparador - Sistema de Disparo em Massa WhatsApp

Sistema completo de disparo em massa integrado ao VendeAI com controle de qualidade, rate limiting e gestão avançada de leads.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Funcionalidades](#funcionalidades)
3. [Arquitetura](#arquitetura)
4. [Instalação](#instalação)
5. [Configuração](#configuração)
6. [Uso do Sistema](#uso-do-sistema)
7. [API Endpoints](#api-endpoints)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

O Robô Disparador é um sistema integrado ao VendeAI que permite:

- ✅ Importar leads via CSV
- ✅ Disparo em massa com rate limiting inteligente
- ✅ Personalização de mensagens com variáveis
- ✅ Envio de áudio (ElevenLabs)
- ✅ Controle de horário comercial
- ✅ Modo assistido (aprovação manual) e automático
- ✅ Métricas em tempo real
- ✅ Logs detalhados de cada disparo
- ✅ Painel administrativo completo

---

## ⚙️ Funcionalidades

### 1. Importação de Leads

- **Upload CSV**: Arraste e solte ou selecione arquivo
- **Auto-detecção de delimitador**: Detecta automaticamente `,`, `;`, `\t`
- **Mapeamento inteligente**: Reconhece variações de nomes de colunas
- **Validação automática**: WhatsApp, email, dados obrigatórios
- **Deduplicação**: Evita leads duplicados automaticamente

### 2. Sistema de Disparo

- **Rate Limiter**: Controla taxa de envio (padrão: 15/hora)
- **Horário Comercial**: Respeita horários de envio (9h-18h)
- **Delay Randomizado**: Entre 300-600s entre mensagens
- **Modo Assistido**: Aprova cada envio manualmente (seguro)
- **Modo Automático**: Disparo automático (use com cuidado!)
- **Tentativas Automáticas**: Até 3 tentativas em caso de erro

### 3. Personalização

- **Variáveis Dinâmicas**:
  - `{nome}` - Nome do lead
  - `{empresa}` - Empresa do lead
  - `{cidade}` - Cidade
  - `{estado}` - Estado
  - `{cargo}` - Cargo
  - Qualquer campo do CSV vira variável!

- **Templates Customizados**: Crie templates reutilizáveis
- **Áudio Personalizado**: Integração com ElevenLabs (em breve)

### 4. Monitoramento

- **Dashboard em Tempo Real**: Stats atualizadas
- **Gráficos de Performance**: Envios, taxas de sucesso
- **Logs Detalhados**: Cada disparo registrado
- **Métricas Agregadas**: Análise por dia, semana, mês

---

## 🏗️ Arquitetura

```
VendeAI/
├── database/
│   ├── models.py              # Modelos base
│   └── models_robo.py         # Modelos do robô disparador
│
├── backend/
│   ├── services/
│   │   ├── disparo_massa.py   # Serviço de disparo
│   │   └── importador_csv.py  # Importador de CSV
│   │
│   ├── routes/
│   │   └── robo_disparador.py # API do robô
│   │
│   ├── templates/
│   │   └── robo_disparador.html # Painel admin
│   │
│   └── static/js/
│       └── robo_disparador.js  # Frontend do painel
│
├── examples/
│   └── leads_teste.csv        # CSV de exemplo
│
└── RoboVendedor/              # Sistema original
    └── disparador/
        ├── whatsapp_sender.py
        └── rate_limiter.py
```

---

## 📦 Instalação

### 1. Pré-requisitos

```bash
# Python 3.8+
python --version

# Node.js (para WhatsApp)
node --version
```

### 2. Instalar Dependências

```bash
# Backend (VendeAI)
cd C:\Users\Victor\Documents\VendeAI
pip install -r requirements.txt

# WhatsApp (RoboVendedor)
cd C:\Users\Victor\Documents\RoboVendedor
npm install
```

### 3. Configurar Banco de Dados

```bash
# Criar/atualizar banco
cd C:\Users\Victor\Documents\VendeAI
python database/models.py
python database/models_robo.py
```

### 4. Iniciar Sistema

```bash
# Terminal 1: Backend VendeAI
cd C:\Users\Victor\Documents\VendeAI
python run.py

# Terminal 2: WhatsApp (se necessário)
cd C:\Users\Victor\Documents\RoboVendedor
node disparador/whatsapp_sender.js --init
```

---

## ⚙️ Configuração

### 1. Acessar Painel

Abra o navegador em: `http://localhost:5000/api/robo/painel`

### 2. Configurar Rate Limiter

**Configuração Padrão:**
- Max mensagens/hora: `15`
- Delay mín: `300s` (5 min)
- Delay máx: `600s` (10 min)
- Horário: `9h - 18h`
- Fins de semana: `Desabilitado`

**Ajustar Configuração:**

```python
# Via painel admin
Configuração > Rate Limiter > Salvar

# Ou via API
PUT /api/robo/config
{
  "max_mensagens_por_hora": 20,
  "delay_entre_mensagens_min": 180,
  "delay_entre_mensagens_max": 480
}
```

### 3. Conectar WhatsApp

```bash
# Iniciar sessão
cd C:\Users\Victor\Documents\RoboVendedor
node disparador/whatsapp_sender.js --init

# Escanear QR Code com celular
# Aguardar confirmação de conexão
```

---

## 🚀 Uso do Sistema

### Passo 1: Importar Leads

1. **Preparar CSV**
   - Use o template: [Baixar Template](http://localhost:5000/api/robo/template-csv)
   - Colunas obrigatórias: `nome`, `whatsapp`
   - Colunas opcionais: `email`, `empresa`, `cidade`, `estado`, `cargo`

2. **Fazer Upload**
   - Arraste o arquivo CSV para a zona de upload
   - Ou clique em "Selecionar Arquivo"
   - Sistema valida e importa automaticamente

3. **Verificar Resultado**
   - Total de linhas processadas
   - Leads importados com sucesso
   - Duplicados ignorados
   - Erros encontrados

### Passo 2: Configurar Template

```
Olá {nome}! Tudo bem?

Vi que você trabalha na {empresa} em {cidade}.

Tenho uma solução incrível que pode revolucionar suas vendas!

Podemos conversar rapidinho? 😊
```

**Salvar em:** Configuração > Template de Mensagem

### Passo 3: Iniciar Disparo

**Modo Assistido (Recomendado):**
```bash
# Cada mensagem será aprovada manualmente
Leads > Iniciar Disparo em Massa
- ID da Campanha: 1
- Quantidade: 100
- Modo: Assistido ✓
```

**Modo Automático (Cuidado!):**
```bash
# Disparo totalmente automático
Configuração > Modo Assistido: OFF
Leads > Iniciar Disparo em Massa
```

### Passo 4: Monitorar

1. **Dashboard**: Veja stats em tempo real
2. **Logs**: Acompanhe cada disparo
3. **Métricas**: Analise performance

---

## 🔌 API Endpoints

### Configuração

```bash
# GET - Obter configuração
GET /api/robo/config

# PUT - Atualizar configuração
PUT /api/robo/config
{
  "max_mensagens_por_hora": 15,
  "modo_assistido": true,
  ...
}
```

### Importação

```bash
# POST - Importar CSV
POST /api/robo/importar-csv
Content-Type: multipart/form-data
arquivo: [CSV file]

# GET - Listar leads
GET /api/robo/leads-importados?status=pendentes&page=1

# POST - Ignorar lead
POST /api/robo/lead/{id}/ignorar
```

### Disparo

```bash
# POST - Testar disparo
POST /api/robo/testar-disparo
{
  "lead_id": 123,
  "mensagem": "Teste..."
}

# POST - Iniciar disparo em massa
POST /api/robo/iniciar-disparo-massa
{
  "campanha_id": 1,
  "limite": 100
}
```

### Métricas e Logs

```bash
# GET - Obter métricas
GET /api/robo/metricas?dias=7

# GET - Obter logs
GET /api/robo/logs?tipo=todos&page=1

# GET - Status do sistema
GET /api/robo/status
```

### Download

```bash
# GET - Template CSV
GET /api/robo/template-csv
```

---

## 🛠️ Troubleshooting

### Problema: WhatsApp desconecta

**Solução:**
```bash
# Reiniciar sessão
cd C:\Users\Victor\Documents\RoboVendedor
rm -rf disparador/session/
node disparador/whatsapp_sender.js --init
```

### Problema: Leads duplicados

**Solução:**
- O sistema já evita duplicados por WhatsApp
- Verifique: `Leads > Filtrar > Duplicados`

### Problema: Rate limit atingido

**Solução:**
```bash
# Ajustar limites
Configuração > Rate Limiter
- Aumentar max/hora
- Reduzir delay entre mensagens

# Ou aguardar próxima janela (1 hora)
```

### Problema: Importação falha

**Solução:**
1. Verificar formato CSV
2. Validar encoding (UTF-8)
3. Conferir colunas obrigatórias
4. Ver logs de erro na tela de importação

### Problema: Disparos com erro

**Solução:**
1. Verificar conexão WhatsApp
2. Validar números de telefone
3. Checar rate limit
4. Ver logs detalhados: `Logs > Filtrar > Erros`

---

## 📊 Exemplo de Uso Completo

### Caso: Concessionária de Veículos

**1. Preparar CSV**
```csv
nome,whatsapp,email,empresa,cidade,estado,interesse
João Silva,67999111111,joao@empresa.com,Auto Center,Campo Grande,MS,carro usado
Maria Santos,67999222222,maria@loja.com,Loja da Maria,Dourados,MS,financiamento
```

**2. Criar Template**
```
Olá {nome}!

Vi que você demonstrou interesse em {interesse}.

Temos ótimas ofertas em Campo Grande!

Posso te passar mais detalhes? 🚗
```

**3. Configurar**
- Max/hora: 20
- Horário: 9h-18h
- Modo: Assistido
- Áudio: Sim

**4. Importar e Disparar**
```bash
1. Upload CSV (10 leads)
2. Verificar leads importados
3. Iniciar disparo (Campanha ID: 1)
4. Aprovar cada mensagem
5. Monitorar logs e métricas
```

**5. Resultados Esperados**
- 10 disparos em ~2 horas
- Taxa de entrega: ~95%
- Taxa de resposta: ~30%
- 3 leads qualificados

---

## 🔐 Segurança

### Boas Práticas

1. **Sempre usar modo assistido** em produção
2. **Respeitar rate limits** (risco de ban)
3. **Validar dados antes** de importar
4. **Testar com poucos leads** primeiro
5. **Monitorar logs** constantemente

### Limites Recomendados

- **Max/hora**: 15-20 (seguro)
- **Max/dia**: 150-200 (conservador)
- **Delay**: 5-10 minutos entre envios

### ⚠️ Avisos

- WhatsApp pode banir contas que enviam spam
- Sempre obter consentimento dos leads
- Incluir opção de opt-out
- Não enviar conteúdo proibido
- Usar apenas em horário comercial

---

## 📞 Suporte

**Documentação:** `ROBO_DISPARADOR_README.md`

**Logs do Sistema:**
```bash
# Backend
tail -f logs/vendeai.log

# WhatsApp
tail -f RoboVendedor/logs/whatsapp.log
```

**Contato:**
- GitHub Issues
- Email: suporte@vendeai.com

---

## 🚀 Próximos Passos

- [ ] Integração com ElevenLabs (áudio)
- [ ] Webhooks de resposta automática
- [ ] A/B Testing de templates
- [ ] Segmentação avançada
- [ ] Relatórios exportáveis
- [ ] Integração com CRM

---

**Desenvolvido com ❤️ pela equipe VendeAI**
