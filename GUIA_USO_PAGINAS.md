# 📖 Guia Rápido de Uso das Novas Páginas do CRM

Este guia explica como usar cada uma das 7 novas páginas implementadas no CRM VendeAI.

---

## 📬 1. Mensagens (`/messages`)

**Objetivo:** Gerenciar mensagens automáticas que o bot envia durante conversas.

### Como usar:
1. **Visualizar mensagens**: Lista à esquerda mostra todas as mensagens configuradas
2. **Editar mensagem**: Clique em uma mensagem para editar no painel central
3. **Inserir variáveis**: Use os botões de variáveis para inserir dados dinâmicos:
   - `{usuario_nome}` - Nome do cliente
   - `{empresa_nome}` - Nome da sua empresa
   - `{veiculo_marca}`, `{veiculo_modelo}` - Dados do veículo
   - Etc.
4. **Preview em tempo real**: Aba "Preview" mostra como a mensagem aparecerá para o cliente
5. **Testar mensagem**: Botão "Testar Mensagem" simula o envio
6. **Adicionar nova**: Botão "+" cria uma nova mensagem
7. **Duplicar**: Ícone de cópia duplica mensagem existente

### Dicas:
- Use variáveis para personalizar mensagens automaticamente
- O preview simula a conversa real (mensagens do bot em azul, cliente em verde)
- Mensagens podem incluir quebras de linha e emojis

---

## 😊 2. Personalidade (`/personality`)

**Objetivo:** Configurar a personalidade e tom de voz do bot.

### Como usar:
1. **Nome do Bot**: Digite o nome que o bot usará para se apresentar
2. **Avatar**: Emoji que representa o bot (ex: 🤖, 🚗, 🏠)
3. **Ajustar sliders de personalidade** (0-100):
   - **Formalidade**: Casual (tu, cara) ↔ Formal (você, senhor)
   - **Entusiasmo**: Neutro (ok) ↔ Animado (demais! incrível!)
   - **Objetividade**: Detalhado (explica tudo) ↔ Direto (respostas curtas)
   - **Empatia**: Direto (vai ao ponto) ↔ Empático (compreensivo)
   - **Humor**: Sério (profissional) ↔ Descontraído (usa humor)
   - **Proatividade**: Reativo (espera perguntar) ↔ Proativo (oferece opções)

4. **Preview ao vivo**: Veja como o bot responderia em 3 cenários:
   - Saudação inicial
   - Apresentação de veículo
   - Negociação

5. **Presets rápidos**: Botões com configurações pré-definidas:
   - 🎯 **Profissional**: Formal, objetivo, sério
   - 🤝 **Amigável**: Informal, empático, descontraído
   - ⚡ **Direto**: Muito objetivo, sem rodeios

### Dicas:
- Teste diferentes configurações e veja o preview
- Para concessionárias: configuração mais formal (70-80)
- Para vendedores autônomos: mais descontraído (30-50)
- O bot mistura os valores para criar respostas naturais

---

## ⏰ 3. Horários (`/schedule`)

**Objetivo:** Definir quando o bot está disponível para atendimento.

### Como usar:
1. **Configurar dias da semana**:
   - Toggle ativa/desativa cada dia
   - Defina horário de início e fim
   - Configure intervalo de almoço (opcional)
   - Botão "Aplicar para todos" copia horário para outros dias

2. **Calendário visual**:
   - Verde: dias disponíveis
   - Vermelho: feriados
   - Cinza: dias sem atendimento

3. **Gerenciar feriados**:
   - Lista de feriados nacionais pré-configurada
   - Botão "+" adiciona novo feriado
   - Toggle ativa/desativa feriado específico
   - Ícone de lixeira remove feriado

4. **Comportamento fora do horário**:
   - **Mensagem automática**: Envia resposta informando horário
   - **Gravar mensagem**: Salva mensagens recebidas fora do horário
   - **Notificar equipe**: Avisa equipe sobre contatos

5. **Mensagem personalizada**: Edite o texto enviado quando fora do expediente

### Dicas:
- Configure almoço apenas em dias úteis
- Desative feriados opcionais se sua empresa abre nesses dias
- Mensagem fora do horário deve informar quando você volta a atender

---

## 💰 4. Negócio (`/business`)

**Objetivo:** Configurar financiamento, descontos e promoções.

### Abas:

#### **Financiamento**
1. **Configurações**:
   - Taxa de juros mínima e máxima (%)
   - Parcelas mínimas e máximas
   - Entrada mínima (%)
   - Simulador mostra exemplo de cálculo

2. **Parceiros financeiros**:
   - Lista de bancos parceiros
   - Toggle ativa/desativa banco
   - Taxa e prazo de cada parceiro
   - Botão "+" adiciona novo parceiro

#### **Descontos**
1. **Desconto máximo permitido**: Limite geral para qualquer venda
2. **Desconto automático à vista**: Aplicado automaticamente
3. **Limite de aprovação automática**: Acima desse valor precisa aprovação
4. **Toggles**:
   - Desconto automático habilitado
   - Aprovação necessária do gerente

#### **Promoções**
1. **Tabela de promoções**: Lista todas as campanhas
2. **Criar promoção** (botão "+"):
   - Nome da promoção
   - Tipo: Percentual, Valor Fixo, Frete Grátis
   - Valor do desconto
   - Data início/fim
   - Produtos aplicáveis
   - Status ativo/inativo
3. **Ações**: Editar ou excluir promoções

### Dicas:
- Configure taxas realistas baseadas nos seus parceiros
- Descontos automáticos incentivam pagamento à vista
- Crie promoções sazonais (Black Friday, etc.)
- Desative promoções vencidas ao invés de deletar (histórico)

---

## 📚 5. Base de Conhecimento (`/knowledge-base`)

**Objetivo:** Gerenciar perguntas frequentes (FAQ) que o bot usa.

### Como usar:
1. **Buscar**: Campo de busca filtra perguntas em tempo real
2. **Filtrar por categoria**: Botões de categoria (Geral, Financiamento, etc.)
3. **Dois modos de visualização**:
   - **FAQ**: Accordion com perguntas agrupadas por categoria
   - **Tabela**: Visão completa em formato de tabela

4. **Ver pergunta** (modo FAQ):
   - Clique para expandir e ver resposta
   - Estatísticas: número de visualizações
   - Botão "Editar"

5. **Adicionar pergunta** (botão "+"):
   - Selecione categoria
   - Digite pergunta
   - Digite resposta detalhada
   - Salvar

6. **Estatísticas laterais** (modo FAQ):
   - **Mais Visualizadas**: Top 5 perguntas
   - **Por Categoria**: Quantas perguntas em cada

### Dicas:
- Organize perguntas por categoria lógica
- Respostas devem ser claras e completas
- Use as perguntas mais visualizadas para identificar dúvidas comuns
- Atualize respostas conforme surgem novas informações
- Adicione novas perguntas baseadas em conversas reais

---

## 🔌 6. Integrações (`/integrations`)

**Objetivo:** Conectar com CRMs externos e ferramentas.

### Integrações disponíveis:
- **Pipedrive** (CRM)
- **HubSpot** (CRM)
- **RD Station** (Marketing e Vendas)
- **Google Calendar** (Agendamentos)

### Como usar:
1. **Visualizar status**: Cards mostram se cada integração está conectada ou não
2. **Conectar integração**:
   - Clique em "Conectar"
   - Configure credenciais (API Key, URL)
   - Ajuste configurações de sincronização
   - Teste conexão
   - Ative

3. **Configurar integração** (botão "Configurar"):
   - **Credenciais**: API Key e URL da API
   - **Sincronização automática**: Liga/desliga
   - **Intervalo**: A cada quantos minutos sincronizar
   - **Criar leads automaticamente**: Novos leads são adicionados
   - **Atualizar leads**: Atualiza dados de leads existentes

4. **Sincronizar manualmente**: Botão "Sincronizar Agora"
5. **Desconectar**: Remove conexão com a ferramenta
6. **Logs**: Aba "Logs de Sincronização" mostra histórico

### Dicas:
- Configure API Keys nas configurações da ferramenta externa
- Teste conexão antes de ativar sincronização automática
- Intervalos curtos (5-15 min) mantêm dados atualizados
- Monitore logs para identificar erros de sincronização
- Cada empresa pode ter diferentes integrações ativas

---

## 👥 7. Equipe (`/team`)

**Objetivo:** Gerenciar membros da equipe, permissões e acompanhar performance.

### Abas:

#### **Membros**
1. **Tabela de membros**: Lista todos os usuários
   - Nome, cargo, função, vendas, status
   - Botões: Editar, Excluir
2. **Adicionar membro** (botão "+"):
   - Nome completo
   - Email e telefone
   - Cargo (Vendedor, Gerente, etc.)
   - Função/Permissão (Administrador, Vendedor, Visualizador)
   - Status ativo/inativo
3. **Estatísticas**: Total da equipe, vendas, conversão, ticket médio

#### **Permissões**
Três níveis de acesso:

1. **👑 Administrador**:
   - Acesso total ao sistema
   - Gerenciar usuários
   - Configurar sistema
   - Ver todos os relatórios

2. **🎯 Vendedor**:
   - Atender leads
   - Criar propostas
   - Agendar visitas
   - Ver estoque

3. **🛡️ Visualizador**:
   - Ver dashboard
   - Ver relatórios
   - Ver equipe
   - Sem permissão de edição

#### **Performance**
1. **Top Performers**: Pódio com os 3 melhores vendedores do mês
   - Vendas fechadas
   - Taxa de conversão
   - Ticket médio
2. **Performance Individual**: Cards com métricas de cada vendedor
   - Leads atendidos
   - Vendas fechadas
   - Taxa de conversão

### Dicas:
- Dê permissão de Administrador apenas para gerentes
- Monitore performance para identificar treinamentos necessários
- Use status "Inativo" ao invés de deletar (mantém histórico)
- Acompanhe top performers para replicar boas práticas
- Configure comissões baseadas em taxa de conversão

---

## 🚀 Fluxo de Trabalho Recomendado

### Configuração Inicial (faça uma vez):
1. **Personalidade**: Configure o tom do bot
2. **Horários**: Defina quando o bot atende
3. **Base de Conhecimento**: Adicione FAQs principais
4. **Negócio**: Configure financiamento e descontos
5. **Equipe**: Adicione membros da equipe
6. **Mensagens**: Personalize mensagens padrão

### Uso Diário:
1. **Dashboard**: Veja métricas do dia
2. **Conversas**: Atenda leads que precisam de contato humano
3. **Agendamentos**: Confirme visitas do dia

### Manutenção Semanal:
1. **Base de Conhecimento**: Adicione novas perguntas frequentes
2. **Equipe (Performance)**: Analise performance dos vendedores
3. **Integrações (Logs)**: Verifique se sincronizações estão ok

### Manutenção Mensal:
1. **Negócio**: Crie/atualize promoções
2. **Horários**: Atualize feriados do próximo mês
3. **Relatórios**: Analise métricas do mês

---

## 🎯 Dicas Gerais

1. **Sempre salve**: Botões "Salvar" estão no topo ou rodapé de cada página
2. **Notificações**: Canto superior mostra confirmações de ações
3. **Busca**: Maioria das tabelas tem campo de busca
4. **Filtros**: Use filtros para encontrar dados específicos
5. **Mobile-friendly**: Interface responsiva funciona em tablets/celulares
6. **Darkmode**: Interface escura reduz cansaço visual

---

## ❓ Dúvidas Frequentes

**P: Posso ter diferentes configurações para cada equipe?**
R: Não ainda. As configurações são globais para a empresa. Use permissões para controlar o que cada usuário vê.

**P: As integrações sincronizam automaticamente?**
R: Sim, se você ativar "Sincronização Automática" nas configurações de cada integração.

**P: Como sei se o bot está usando as FAQs?**
R: Na Base de Conhecimento, veja o contador de "Visualizações" de cada pergunta.

**P: Posso ter horários diferentes por dia da semana?**
R: Sim! Configure cada dia individualmente. Use "Aplicar para todos" apenas se todos os dias forem iguais.

**P: O que acontece quando o bot está fora do horário?**
R: Depende da sua configuração em Horários > Comportamento Fora do Horário. Pode enviar mensagem automática, gravar contatos, etc.

**P: Como adiciono um novo banco parceiro para financiamento?**
R: Em Negócio > Financiamento > Parceiros Financeiros, clique no botão "+ Adicionar Parceiro".

---

## 📞 Suporte

Precisa de ajuda? Entre em contato:
- Email: suporte@vendeai.com.br
- WhatsApp: (11) 9999-9999
- Documentação completa: [docs.vendeai.com.br](https://docs.vendeai.com.br)

---

**Última atualização:** 30 de Outubro de 2025
**Versão do sistema:** 2.0
