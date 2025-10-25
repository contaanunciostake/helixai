# 🚀 Quick Start - Robô Disparador

Guia rápido para colocar o sistema funcionando em 5 minutos!

## ⚡ Início Rápido

### 1. Inicializar Banco de Dados (1 min)

```bash
cd C:\Users\Victor\Documents\VendeAI
python init_robo_disparador.py
```

✅ Isso vai criar todas as tabelas necessárias!

### 2. Iniciar Servidor (1 min)

```bash
# Terminal 1: Backend VendeAI
cd C:\Users\Victor\Documents\VendeAI
python run.py
```

✅ Servidor rodando em: `http://localhost:5000`

### 3. Acessar Painel (30 seg)

Abra o navegador: **http://localhost:5000/api/robo/painel**

**Login:**
- Email: `admin@vendeai.com`
- Senha: `admin123`

### 4. Importar Leads de Teste (1 min)

1. No painel, vá em **"Importação"**
2. Clique em **"Baixar Template CSV"**
3. Ou use o arquivo: `examples/leads_teste.csv`
4. Arraste o arquivo para a zona de upload
5. Aguarde importação (10 leads)

### 5. Configurar Template (1 min)

Vá em **"Configuração"** > **Template de Mensagem**:

```
Olá {nome}! Tudo bem?

Vi que você trabalha na {empresa} em {cidade}.

Tenho uma solução incrível para você!

Podemos conversar? 😊
```

Clique em **"Salvar Configurações"**

### 6. (Opcional) Conectar WhatsApp (2 min)

```bash
# Terminal 2: WhatsApp
cd C:\Users\Victor\Documents\RoboVendedor
node disparador/whatsapp_sender.js --init
```

📱 Escaneie o QR Code com seu WhatsApp

### 7. Testar Disparo! (30 seg)

1. Vá em **"Leads"**
2. Veja os 10 leads importados
3. Clique no botão **📤** de um lead
4. Aprove o envio
5. Pronto! 🎉

---

## 📊 Principais Funcionalidades

### Dashboard
- **Stats em Tempo Real**: Total, pendentes, enviados, taxa de sucesso
- **Auto-atualização**: A cada 30 segundos

### Importação
- **Drag & Drop**: Arraste CSV para importar
- **Validação Automática**: Valida telefones, emails
- **Deduplicação**: Evita leads repetidos

### Leads
- **Filtros**: Todos, Pendentes, Enviados, Erros
- **Ações**: Testar envio, Ignorar lead
- **Disparo em Massa**: Processar múltiplos de uma vez

### Configuração
- **Rate Limiter**: Controle de taxa
- **Horários**: Define quando enviar
- **Modo Assistido**: Liga/desliga aprovação manual
- **Template**: Personaliza mensagens

### Métricas
- **Gráficos**: Envios por dia, taxa de sucesso
- **Análise**: Performance histórica

### Logs
- **Tempo Real**: Cada disparo registrado
- **Filtros**: Ver sucessos ou erros
- **Detalhes**: Mensagem, delay, resultado

---

## 🔧 Configurações Recomendadas

### Para Teste (Seguro)
```
Max/hora: 5
Delay: 300-600s
Horário: 9h-18h
Modo Assistido: ✅ SIM
Fins de semana: ❌ NÃO
```

### Para Produção (Conservador)
```
Max/hora: 15
Delay: 300-600s
Horário: 9h-18h
Modo Assistido: ✅ SIM
Fins de semana: ❌ NÃO
```

### Para Alto Volume (Atenção!)
```
Max/hora: 30
Delay: 120-300s
Horário: 8h-20h
Modo Assistido: ❌ NÃO (cuidado!)
Fins de semana: ✅ SIM
```

---

## 🎯 Casos de Uso

### Caso 1: Teste Rápido (5 leads)

```bash
1. Importar: examples/leads_teste.csv
2. Configurar: Modo assistido
3. Disparar: Para 5 leads
4. Aprovar: Cada mensagem
5. Ver logs: Acompanhar resultados
```

### Caso 2: Campanha Pequena (50 leads)

```bash
1. Preparar CSV: 50 contatos
2. Importar via painel
3. Criar template personalizado
4. Configurar: Max 15/hora
5. Iniciar disparo em massa
6. Aprovar em lote
7. Monitorar métricas
```

### Caso 3: Campanha Grande (500+ leads)

```bash
1. Preparar CSV: Segmentar por cidade
2. Importar em lotes de 100
3. Template bem testado
4. Modo automático (cuidado!)
5. Horário estendido: 8h-20h
6. Monitorar constantemente
7. Pausar se taxa de erro > 10%
```

---

## 📱 Estrutura do CSV

### Obrigatório
- `nome` - Nome do lead
- `whatsapp` - Telefone (com DDD)

### Opcional (mas recomendado)
- `email` - Email
- `empresa` - Nome da empresa
- `cidade` - Cidade
- `estado` - UF (2 letras)
- `cargo` - Cargo/função

### Campos Customizados
Qualquer coluna extra vira variável!

```csv
nome,whatsapp,empresa,veiculo_interesse,orcamento_max
João,67999111111,Auto Center,HB20,45000
```

Use no template: `{veiculo_interesse}`, `{orcamento_max}`

---

## ⚠️ Checklist Antes de Disparar

- [ ] CSV validado e importado
- [ ] Template testado com variáveis
- [ ] WhatsApp conectado
- [ ] Rate limiter configurado
- [ ] Horário comercial definido
- [ ] Modo assistido ativado (primeira vez)
- [ ] Números de telefone verificados
- [ ] Opt-out disponível na mensagem

---

## 🐛 Problemas Comuns

### Erro: "WhatsApp não conectado"
```bash
cd C:\Users\Victor\Documents\RoboVendedor
node disparador/whatsapp_sender.js --init
```

### Erro: "Rate limit atingido"
- Aguarde 1 hora
- Ou ajuste configuração (max/hora maior)

### Erro: "Importação falhou"
- Verifique encoding UTF-8
- Confira colunas obrigatórias
- Valide formato dos telefones

### Erro: "Template não personaliza"
- Verifique variáveis: `{nome}` exatamente
- Confira nomes das colunas no CSV
- Teste com 1 lead primeiro

---

## 📞 Próximos Passos

Agora que você testou:

1. ✅ Importe seus leads reais
2. ✅ Personalize o template
3. ✅ Ajuste configurações
4. ✅ Inicie campanha pequena
5. ✅ Analise resultados
6. ✅ Escale gradualmente

**Leia a documentação completa:** `ROBO_DISPARADOR_README.md`

---

**Bons disparos! 🚀**
