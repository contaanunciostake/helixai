# AIra CRM - Sistema de Atendimento Inteligente com IA

## Instruções para Geração de Contrato

Use este documento como base para criar um contrato de prestação de serviços de software entre a **Nexus Automações** (contratada) e o cliente (contratante).

---

## 1. DESCRIÇÃO DO SISTEMA

### 1.1 O que é o AIra CRM

O **AIra CRM** é um sistema de atendimento automatizado via WhatsApp com Inteligência Artificial, desenvolvido para empresas do segmento de **atacado e varejo** (distribuidoras, lojas de autopeças, etc.).

O sistema inclui:
- **Bot de WhatsApp com IA** (Claude da Anthropic) para atendimento 24/7
- **Painel CRM Web** para gestão de clientes, produtos, pedidos e entregas
- **Integração com catálogo de produtos** via importação de planilhas Excel/CSV
- **Respostas em áudio** geradas por IA (ElevenLabs Text-to-Speech)
- **Transcrição de áudios** recebidos dos clientes (OpenAI Whisper)

### 1.2 Nicho de Aplicação

O sistema está configurado para o nicho de **Atacado/Varejo**, especialmente:
- Distribuidoras de lubrificantes e filtros automotivos
- Lojas de autopeças
- Distribuidoras de produtos em geral

---

## 2. FUNCIONALIDADES INCLUÍDAS

### 2.1 Bot WhatsApp com IA

| Funcionalidade | Descrição |
|----------------|-----------|
| Atendimento automático | Responde clientes 24 horas por dia, 7 dias por semana |
| Linguagem natural | Entende perguntas em linguagem coloquial usando IA Claude |
| Busca de produtos | Localiza produtos no catálogo por nome, marca, categoria ou aplicação |
| Consulta de preços | Informa preços e disponibilidade em tempo real |
| Geração de orçamentos | Monta orçamentos automáticos com lista de produtos |
| Respostas em áudio | Envia mensagens de voz geradas por IA (opcional) |
| Transcrição de áudios | Ouve e transcreve áudios enviados pelos clientes |
| Memória de conversa | Lembra do contexto da conversa com cada cliente |
| Detecção de intenção | Identifica se cliente quer comprar, consultar, reclamar, etc. |
| Anti-detecção de IA | Responde como humano quando perguntado se é robô |

### 2.2 Painel CRM Web

| Módulo | Descrição |
|--------|-----------|
| Dashboard | Visão geral com estatísticas de vendas, conversas e entregas |
| Catálogo de Produtos | Gerenciamento de produtos, categorias, marcas e estoque |
| Importação Excel | Upload de planilhas para cadastro em massa de produtos |
| Pedidos | Controle de pedidos realizados via WhatsApp ou manual |
| Orçamentos | Orçamentos gerados pelo bot ou manualmente |
| Entregas | Gerenciamento de entregas com status e rastreamento |
| Clientes | Base de clientes com histórico de conversas |
| Conversas | Visualização do histórico de atendimentos do bot |
| Conexão WhatsApp | Tela para conectar/desconectar o número de WhatsApp |
| Configurações | Dados da empresa, horários de funcionamento |

### 2.3 Integrações de IA

| Serviço | Função | Custo |
|---------|--------|-------|
| Anthropic Claude | Processamento de linguagem natural e respostas | Por uso (API) |
| OpenAI Whisper | Transcrição de áudios recebidos | Por uso (API) |
| ElevenLabs | Geração de áudios de resposta | Por uso (API) |

---

## 3. REQUISITOS TÉCNICOS

### 3.1 Infraestrutura Fornecida pela Contratada

- Servidor de aplicação (backend Flask/Python)
- Servidor do bot WhatsApp (Node.js)
- Banco de dados MySQL
- Hospedagem do painel CRM (frontend React)

### 3.2 Requisitos do Contratante

- Número de telefone com WhatsApp Business ou WhatsApp normal
- Celular para escanear QR Code inicial de conexão
- Computador com navegador para acessar o painel CRM
- Conexão estável à internet
- Catálogo de produtos em formato Excel/CSV (modelo fornecido)

---

## 4. LIMITAÇÕES DO SISTEMA

### 4.1 O Bot NÃO faz

- Processamento de pagamentos (apenas informa formas de pagamento)
- Emissão de notas fiscais
- Integração com sistemas ERP (sem desenvolvimento adicional)
- Envio de boletos ou links de pagamento automáticos
- Atendimento de múltiplos números de WhatsApp simultaneamente (1 número por empresa)

### 4.2 Limitações Técnicas

- Máximo de 1.000 mensagens simultâneas por minuto
- Catálogo de até 10.000 produtos
- Histórico de conversas armazenado por 90 dias
- Áudios de resposta limitados a 60 segundos

### 4.3 Dependências de Terceiros

O sistema depende de serviços de terceiros que podem sofrer instabilidades:
- WhatsApp (Meta) - Conexão do bot
- Anthropic - IA para respostas
- OpenAI - Transcrição de áudios
- ElevenLabs - Geração de áudios

---

## 5. NÍVEIS DE SERVIÇO (SLA)

### 5.1 Disponibilidade

| Métrica | Valor |
|---------|-------|
| Disponibilidade do sistema | 99% mensal |
| Tempo máximo de indisponibilidade | 7 horas/mês |
| Horário de suporte técnico | Segunda a Sexta, 8h às 18h |

### 5.2 Tempo de Resposta para Suporte

| Prioridade | Descrição | Tempo de Resposta |
|------------|-----------|-------------------|
| Crítica | Sistema totalmente inoperante | Até 2 horas |
| Alta | Funcionalidade principal comprometida | Até 4 horas |
| Média | Funcionalidade secundária com problemas | Até 24 horas |
| Baixa | Dúvidas ou melhorias | Até 48 horas |

---

## 6. PROPRIEDADE INTELECTUAL

### 6.1 Software

- O código-fonte do sistema AIra CRM é propriedade exclusiva da **Nexus Automações**
- O contratante recebe licença de uso, não de propriedade
- É vedada a cópia, modificação ou distribuição do sistema

### 6.2 Dados

- Os dados cadastrados pelo contratante (produtos, clientes, conversas) são de propriedade do contratante
- A contratada compromete-se a não utilizar os dados para fins próprios
- Em caso de rescisão, os dados serão exportados e entregues ao contratante

---

## 7. CUSTOS DE OPERAÇÃO

### 7.1 Custos Fixos (Mensalidade)

Incluir na mensalidade:
- Hospedagem dos servidores
- Manutenção e atualizações do sistema
- Suporte técnico
- Backup diário dos dados

### 7.2 Custos Variáveis (Por Uso)

Os custos de APIs de IA são cobrados por uso:

| Serviço | Custo Aproximado |
|---------|------------------|
| Claude (Anthropic) | ~$0.003 por mensagem processada |
| Whisper (OpenAI) | ~$0.006 por minuto de áudio transcrito |
| ElevenLabs | ~$0.30 por 1.000 caracteres de áudio gerado |

**Opções de cobrança:**
1. Contratante fornece suas próprias API keys
2. Contratada inclui custos de API na mensalidade (com limite)
3. Cobrança mensal baseada no consumo real

---

## 8. IMPLANTAÇÃO

### 8.1 Etapas de Implantação

1. **Configuração inicial** (1-2 dias)
   - Criação da conta no sistema
   - Configuração dos dados da empresa
   - Conexão do número de WhatsApp

2. **Cadastro de produtos** (1-3 dias)
   - Importação do catálogo via Excel
   - Configuração de categorias e marcas
   - Definição de preços e estoque

3. **Treinamento** (1 dia)
   - Treinamento do painel CRM
   - Orientações sobre o funcionamento do bot
   - Testes de atendimento

4. **Go-live** (1 dia)
   - Ativação do bot em produção
   - Acompanhamento inicial
   - Ajustes finos nas respostas

### 8.2 Prazo Total de Implantação

- **Prazo estimado:** 5 a 7 dias úteis
- **Prazo máximo:** 15 dias úteis

---

## 9. RESCISÃO E ENCERRAMENTO

### 9.1 Em Caso de Rescisão

- Aviso prévio de 30 dias
- Exportação dos dados do contratante em formato CSV/Excel
- Desativação do bot e acesso ao painel
- Exclusão dos dados dos servidores em até 30 dias após rescisão

### 9.2 Multa por Rescisão Antecipada

Se aplicável, definir multa proporcional ao período restante do contrato.

---

## 10. CLÁUSULAS SUGERIDAS PARA O CONTRATO

### 10.1 Cláusulas Essenciais

1. **Objeto do Contrato** - Licença de uso do sistema AIra CRM
2. **Vigência** - Prazo de contrato (ex: 12 meses com renovação automática)
3. **Valores e Forma de Pagamento** - Mensalidade + custos variáveis
4. **Obrigações da Contratada** - Manter sistema operacional, suporte, backups
5. **Obrigações do Contratante** - Pagamento em dia, uso adequado, fornecer dados
6. **Níveis de Serviço (SLA)** - Disponibilidade e tempo de resposta
7. **Propriedade Intelectual** - Software da contratada, dados do contratante
8. **Confidencialidade** - Sigilo das informações
9. **Limitação de Responsabilidade** - Exclusão de danos indiretos
10. **Rescisão** - Condições e procedimentos
11. **Foro** - Cidade para resolução de disputas

### 10.2 Cláusulas Recomendadas

- **Política de Uso Aceitável** - Proibir spam, conteúdo ilegal, etc.
- **Atualizações do Sistema** - Direito de atualizar sem aviso prévio
- **Suspensão por Inadimplência** - Após X dias de atraso
- **Reajuste Anual** - Índice de correção (IGPM, IPCA, etc.)

---

## 11. ANEXOS SUGERIDOS

1. **Anexo I** - Descrição detalhada das funcionalidades
2. **Anexo II** - Tabela de preços e formas de pagamento
3. **Anexo III** - SLA detalhado
4. **Anexo IV** - Política de privacidade e uso de dados
5. **Anexo V** - Termo de aceite de implantação

---

## INFORMAÇÕES PARA GERAÇÃO DO CONTRATO

Ao usar este documento no Claude para gerar o contrato, forneça também:

- **Nome completo da empresa contratante**
- **CNPJ do contratante**
- **Endereço do contratante**
- **Representante legal do contratante**
- **Valor da mensalidade acordado**
- **Prazo do contrato**
- **Data de início**
- **Forma de pagamento**
- **Cidade do foro**

O Claude já possui o modelo com os dados da Nexus Automações (CNPJ e logotipo), então basta informar os dados do cliente e solicitar a geração do contrato completo.
