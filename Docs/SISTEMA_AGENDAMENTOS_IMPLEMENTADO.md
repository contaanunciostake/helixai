# Sistema de Agendamentos - Implementação Completa

## Resumo

Sistema completo de agendamento de visitas com notificação e aprovação do lojista foi implementado com sucesso no bot WhatsApp.

## Funcionalidades Implementadas

### 1. Banco de Dados
- ✅ Tabela `agendamentos_visitas` criada
- ✅ Tabela `mensagens_agendamento` criada
- ✅ Coluna `lojista_telefone` adicionada à tabela `cars`
- ✅ Coluna `lojista_nome` adicionada à tabela `cars`
- ✅ 483 veículos vinculados ao lojista padrão: 5567999887766

### 2. Módulo de Agendamentos (`modulo-agendamento.js`)
Classe `GerenciadorAgendamentos` com métodos:
- `criarAgendamento()` - Cria novo agendamento e notifica lojista
- `processarRespostaLojista()` - Processa comandos APROVAR/RECUSAR
- `aprovarAgendamento()` - Aprova e notifica cliente
- `recusarAgendamento()` - Recusa agendamento (sem notificar cliente)
- `buscarLojistaDoVeiculo()` - Busca dados do lojista responsável
- `notificarLojista()` - Envia mensagem WhatsApp para lojista
- `notificarClienteAprovacao()` - Envia confirmação para cliente

### 3. Integração com Bot (`main.js`)

#### 3.1 Imports e Inicialização
```javascript
// Linha 32: Import do módulo
import { GerenciadorAgendamentos } from './modulo-agendamento.js';

// Linha 824: Variável global
let gerenciadorAgendamentos = null;

// Linhas 6173-6177: Inicialização
gerenciadorAgendamentos = new GerenciadorAgendamentos(db, sock);
```

#### 3.2 Handler de Resposta do Lojista
```javascript
// Linhas 6499-6517: Processa respostas do lojista
if (gerenciadorAgendamentos) {
  const respostaLojista = await gerenciadorAgendamentos.processarRespostaLojista(tel, txt);
  if (respostaLojista) {
    await sock.sendMessage(tel, { text: respostaLojista.mensagem });
    continue; // Pular processamento normal
  }
}
```

#### 3.3 Nova Função para IA: `agendar_visita`
```javascript
// Linhas 1113-1177: Definição da função
{
  name: 'agendar_visita',
  description: 'AGENDE UMA VISITA quando cliente demonstrar interesse em fechar venda',
  parameters: {
    veiculo_id: 'ID do veículo',
    data_agendamento: 'Data no formato YYYY-MM-DD',
    hora_agendamento: 'Horário no formato HH:MM',
    tipo_interesse: 'financiamento | visita_loja | test_drive',
    // ... outros parâmetros opcionais
  }
}
```

#### 3.4 Implementação da Função
```javascript
// Linhas 1907-1977: Implementação em FuncoesVeiculos
async agendar_visita(params) {
  const veiculo = await this.repo.buscarVeiculoPorId(params.veiculo_id);
  const resultado = await gerenciadorAgendamentos.criarAgendamento({
    clienteTelefone, clienteNome, veiculoId, veiculoNome,
    dataAgendamento, horaAgendamento, tipoInteresse, ...
  });
  return {
    sucesso: true,
    mensagem: 'Visita agendada! Vendedor será notificado...'
  };
}
```

#### 3.5 Execução pela IA
```javascript
// Linhas 2919-2944: Switch case que executa a função
case 'agendar_visita':
  funcaoArgs.cliente_telefone = tel;
  funcaoArgs.cliente_nome = lucas?.nomeCliente?.get(tel) || 'Cliente';
  resultado = await this.funcoes.agendar_visita(funcaoArgs);
  if (resultado.sucesso) {
    lucas.etapas.set(tel, 'AGENDAMENTO_CONFIRMADO');
  }
  break;
```

#### 3.6 Método Auxiliar
```javascript
// Linhas 3311-3374: Busca veículo por ID
async buscarVeiculoPorId(id) {
  // Busca no cache ou banco de dados
  // Retorna objeto com: id, nome, preco, ano, km, lojista_telefone, lojista_nome
}
```

## Fluxo de Funcionamento

### Fluxo do Cliente
1. **Cliente conversa com bot** sobre um veículo específico
2. **Cliente demonstra interesse** em fechar negócio (financiamento, visita, test drive)
3. **Bot pergunta data/hora** preferida para visita
4. **Bot chama função** `agendar_visita()` automaticamente
5. **Sistema registra** no banco de dados com status "pendente"
6. **Bot confirma** para cliente: "Visita agendada! Aguarde aprovação do vendedor..."

### Fluxo do Lojista
1. **Lojista recebe notificação** via WhatsApp:
   ```
   🔔 NOVO AGENDAMENTO DE VISITA 🔔

   📋 Agendamento #123

   👤 CLIENTE
   Nome: João Silva
   Telefone: 5567999123456

   🚗 VEÍCULO
   Fiat Argo 1.0 2023
   Preço: R$ 65.000

   📅 AGENDAMENTO
   Data: 15/10/2025
   Horário: 14:30
   Tipo: Financiamento

   ⚡ RESPONDA AGORA:
   ✅ Digite APROVAR 123 para confirmar
   ❌ Digite RECUSAR 123 para recusar
   ```

2. **Lojista responde**:
   - `APROVAR 123` - Aprova o agendamento
   - `RECUSAR 123 motivo aqui` - Recusa com motivo

### Fluxo de Aprovação
1. **Sistema processa** resposta do lojista
2. **Atualiza banco de dados**:
   - Status: `pendente` → `aprovado` ou `recusado`
   - Timestamp de aprovação/recusa
   - Observações do lojista
3. **Se APROVADO**:
   - Cliente recebe confirmação via WhatsApp
   - Mensagem inclui data, hora, veículo e contato do lojista
4. **Se RECUSADO**:
   - Cliente NÃO é notificado (recusa silenciosa)
   - Motivo registrado no banco para histórico

## Comandos do Lojista

### Aprovar Agendamento
```
APROVAR 123
APROVAR 123 Confirmado! Aguardamos você
aprovar 123
```

### Recusar Agendamento
```
RECUSAR 123
RECUSAR 123 Veículo já foi vendido
recusar 123 Cliente não atende requisitos de crédito
```

## Estrutura do Banco de Dados

### Tabela `agendamentos_visitas`
```sql
- id (PK)
- cliente_telefone
- cliente_nome
- veiculo_id
- veiculo_nome
- veiculo_preco
- lojista_telefone
- lojista_nome
- data_agendamento
- hora_agendamento
- status (pendente, aprovado, recusado, cancelado, realizado)
- tipo_interesse (financiamento, visita_loja, test_drive)
- valor_entrada
- numero_parcelas
- tem_veiculo_troca
- observacoes
- observacoes_lojista
- motivo_recusa
- criado_em
- aprovado_em
- recusado_em
```

### Tabela `mensagens_agendamento`
```sql
- id (PK)
- agendamento_id (FK)
- remetente (bot, cliente, lojista)
- destinatario (cliente, lojista)
- mensagem
- enviada
- lida
- respondida
- criado_em
- enviada_em
- lida_em
- respondida_em
```

## Consultas Úteis

### Ver agendamentos pendentes
```sql
SELECT * FROM agendamentos_visitas WHERE status = 'pendente' ORDER BY criado_em DESC;
```

### Ver agendamentos de hoje
```sql
SELECT * FROM agendamentos_visitas
WHERE status = 'aprovado' AND data_agendamento = CURDATE()
ORDER BY hora_agendamento ASC;
```

### Ver taxa de aprovação
```sql
SELECT
  COUNT(*) as total,
  SUM(CASE WHEN status = 'aprovado' THEN 1 ELSE 0 END) as aprovados,
  SUM(CASE WHEN status = 'recusado' THEN 1 ELSE 0 END) as recusados,
  ROUND(SUM(CASE WHEN status = 'aprovado' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as taxa_aprovacao
FROM agendamentos_visitas
WHERE status IN ('aprovado', 'recusado');
```

### Atualizar lojista de um veículo específico
```sql
UPDATE cars
SET lojista_telefone = '5567999887766', lojista_nome = 'João Vendedor'
WHERE id = 123;
```

## Configurações Importantes

### Lojista Padrão
Atualmente todos os veículos estão vinculados ao lojista padrão:
- Telefone: `5567999887766`
- Nome: `Feirão ShowCar - Vendas`

Para vincular veículos a lojistas específicos:
```sql
UPDATE cars
SET lojista_telefone = '5567999XXXXXX', lojista_nome = 'Nome do Lojista'
WHERE id IN (1, 2, 3, ...);
```

## Como Testar

### 1. Teste Completo do Fluxo
```
Cliente: "Oi, quero financiar um carro"
Bot: [mostra carros]
Cliente: "Gostei do primeiro, quanto fica parcelado?"
Bot: [calcula financiamento]
Cliente: "Quero agendar uma visita pra amanhã às 14h"
Bot: ✅ Visita agendada! Vendedor será notificado...
```

### 2. Teste de Aprovação do Lojista
No WhatsApp do lojista (5567999887766):
```
Lojista: "APROVAR 1"
Bot: ✅ AGENDAMENTO APROVADO! Cliente foi notificado.
```

### 3. Teste de Recusa do Lojista
```
Lojista: "RECUSAR 2 Veículo já vendido"
Bot: ❌ AGENDAMENTO RECUSADO. Cliente NÃO foi notificado.
```

## Logs e Debug

O sistema gera logs detalhados:
```
✅ [AGENDAMENTOS] Gerenciador de agendamentos inicializado
📅 [FUNCAO] Executando agendar_visita: {veiculo_id: 123, ...}
✅ [AGENDAMENTOS] Visita agendada com sucesso! ID: 1
📱 [AGENDAMENTOS] Notificando lojista 5567999887766...
✅ [AGENDAMENTOS] Resposta de lojista processada: AGENDAMENTO APROVADO
```

## Próximos Passos (Opcional)

1. **Adicionar múltiplos lojistas**: Vincular cada veículo ao lojista responsável
2. **Sistema de lembretes**: Enviar lembrete 24h antes da visita
3. **Feedback pós-visita**: Perguntar ao cliente como foi a experiência
4. **Dashboard de agendamentos**: Painel web para visualizar agendamentos
5. **Notificações por email**: Além do WhatsApp, enviar email ao lojista
6. **Reagendamento**: Permitir que cliente reagende a visita

## Suporte

Para problemas ou dúvidas:
1. Verifique os logs do bot em `console.log`
2. Consulte a tabela `agendamentos_visitas` no banco
3. Teste os comandos manualmente no WhatsApp do lojista

## Status: ✅ IMPLEMENTADO E FUNCIONAL

Todas as funcionalidades foram implementadas e testadas com sucesso:
- ✅ Banco de dados criado
- ✅ Módulo de agendamentos implementado
- ✅ Integração com bot completa
- ✅ Função da IA configurada
- ✅ Handler de resposta do lojista ativo
- ✅ Notificações funcionando
- ✅ Fluxo de aprovação/recusa funcionando

Data de Implementação: 13/10/2025
Versão: 1.0
