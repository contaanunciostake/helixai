# 🚀 Sistema de Disparador VendeAI

## 📋 Visão Geral

O Sistema de Disparador foi desenvolvido com uma interface administrativa completa e moderna, permitindo enviar mensagens em massa pelo WhatsApp para todos os leads do banco de dados, além de realizar testes com números específicos.

## ✨ Funcionalidades Implementadas

### 🎨 Interface de Administração

- **Menu Lateral Escuro**: Design moderno com tema dark, seguindo a identidade visual do painel
- **Layout Responsivo**: Funciona perfeitamente em desktop e mobile
- **Navegação Intuitiva**: Menu organizado por categorias:
  - Dashboard
  - Disparos & Campanhas
  - Gestão
  - Configurações
  - Suporte

### 📱 Disparador de Mensagens

#### 1. **Disparo de Teste**
- Envia mensagem para um número específico: **+55 67 99988-3484**
- Número formatado corretamente: `5567999883484`
- Permite testar mensagens antes do envio em massa
- Feedback em tempo real do status do envio

#### 2. **Disparo em Massa**
- Envia mensagens para todos os leads conectados no banco
- **Filtros disponíveis**:
  - Por temperatura: Quente 🔥, Morno 🌡️, Frio ❄️
  - Por status: Novo, Contato Inicial, Qualificado
- **Personalização**: Use `{nome}` na mensagem para inserir o nome do lead
- **Estatísticas em tempo real**:
  - Total de disparos
  - Enviados com sucesso
  - Erros
  - Taxa de sucesso

#### 3. **Histórico de Disparos**
- Visualize todos os disparos recentes
- Status detalhado: Enviado, Erro, Pendente, Respondido
- Data e hora de cada disparo
- Mensagem enviada

## 🔧 Como Usar

### Acesso ao Sistema

1. **Login como Administrador**
   ```
   Email: admin@vendeai.com
   Senha: admin123
   ```

2. **Acessar o Disparador**
   - No menu lateral, clique em "Disparador" (seção Disparos & Campanhas)
   - URL direta: `http://localhost:5000/admin/disparador`

### Realizar Disparo de Teste

1. Acesse a página do Disparador
2. No card "Disparo de Teste":
   - O número de teste já está configurado: **5567999883484** (+55 67 99988-3484)
   - Digite a mensagem desejada
   - Clique em "Enviar Teste"
3. Aguarde a confirmação de envio

### Realizar Disparo em Massa

1. Acesse a página do Disparador
2. No card "Disparo em Massa":
   - Digite a mensagem (use `{nome}` para personalizar)
   - Selecione os filtros desejados (temperatura e/ou status)
   - Clique em "Disparar para Todos"
3. **Confirme a ação** (aparecerá um alerta de confirmação)
4. Aguarde o processamento

**Exemplo de mensagem com personalização:**
```
Olá {nome}! 👋

Temos novidades incríveis para você!

Nossa equipe está preparada para oferecer as melhores condições.

Entre em contato conosco e saiba mais!
```

## 📊 Dashboard de Estatísticas

O disparador mostra em tempo real:

- **Total de Leads**: Quantidade total no banco
- **Leads Conectados**: Leads com telefone cadastrado
- **Disparos Hoje**: Total de disparos realizados hoje
- **Taxa de Sucesso**: Porcentagem de disparos bem-sucedidos

## 🔌 Integração com WhatsApp

O sistema está preparado para integrar com sua API do WhatsApp (Baileys).

**Configuração necessária:**

1. O WhatsApp deve estar conectado (verificação automática)
2. A API deve estar rodando em `http://localhost:3000`
3. Endpoint esperado: `POST /send-message`

**Formato da requisição:**
```json
{
  "phone": "5567999883484",
  "message": "Sua mensagem aqui"
}
```

**Formato da resposta esperada:**
```json
{
  "success": true
}
```

### Adaptar para sua API

Edite a função `enviar_mensagem_whatsapp()` em `backend/routes/admin.py` (linha 345):

```python
def enviar_mensagem_whatsapp(telefone, mensagem):
    """
    Envia mensagem via API do WhatsApp
    """
    try:
        # Adapte para sua API específica
        response = requests.post('SUA_URL_AQUI',
            json={
                'phone': telefone,
                'message': mensagem
            },
            timeout=10
        )

        if response.status_code == 200:
            return {'success': True}
        else:
            return {'success': False, 'error': f'Status code: {response.status_code}'}

    except Exception as e:
        return {'success': False, 'error': str(e)}
```

## 🗂️ Estrutura de Arquivos Criados

```
backend/
├── templates/
│   └── admin/
│       ├── base_admin.html          # Template base com menu lateral
│       ├── disparador.html          # Página do disparador
│       └── em_desenvolvimento.html  # Placeholder para outras páginas
└── routes/
    └── admin.py                     # Rotas e lógica do disparador
```

## 🎯 Endpoints da API

### GET `/admin/disparador`
Exibe a página do disparador com estatísticas

### POST `/admin/api/disparo-teste`
Envia mensagem de teste

**Body:**
```json
{
  "telefone": "5567999883484",
  "mensagem": "Sua mensagem de teste"
}
```

### POST `/admin/api/disparo-massa`
Dispara mensagens para múltiplos leads

**Body:**
```json
{
  "mensagem": "Olá {nome}! Sua mensagem aqui",
  "filtro_temperatura": "QUENTE",  // TODOS, QUENTE, MORNO, FRIO
  "filtro_status": "NOVO"          // TODOS, NOVO, CONTATO_INICIAL, QUALIFICADO
}
```

### GET `/admin/api/stats-disparador`
Retorna estatísticas em tempo real

**Response:**
```json
{
  "success": true,
  "total_leads": 150,
  "leads_conectados": 120,
  "disparos_hoje": 45
}
```

## ⚙️ Configurações Adicionais

### Outras Páginas do Menu

Todas as outras opções do menu estão configuradas e mostram uma página "Em Desenvolvimento":

- Analytics
- Campanhas
- Templates
- Empresas
- Usuários
- Leads
- Conversas
- Configurações (WhatsApp, IA, Integrações, Sistema)
- Logs
- Documentação

Para implementá-las, basta criar os templates específicos e atualizar as rotas em `admin.py`.

## 🎨 Identidade Visual

O design segue a identidade visual escura do sistema:

**Cores principais:**
- Background: `#0f172a`
- Background Secondary: `#1e293b`
- Primary: `#6366f1`
- Text: `#f1f5f9`
- Borders: `#334155`

**Características:**
- Gradientes sutis
- Animações suaves
- Cards com hover effect
- Badges coloridos
- Ícones Bootstrap Icons

## 🚨 Avisos Importantes

1. **Confirmação de Disparo em Massa**: O sistema sempre pede confirmação antes de enviar para múltiplos leads
2. **Verificação WhatsApp**: Se o WhatsApp não estiver conectado, os botões ficam desabilitados
3. **Registro de Disparos**: Todos os disparos são registrados na tabela `disparos` do banco
4. **Personalização**: O sistema substitui `{nome}` pelo nome do lead automaticamente

## 📝 Próximos Passos

Para completar a implementação:

1. ✅ Conectar o WhatsApp (via página de configuração)
2. ✅ Adicionar leads ao banco de dados
3. ✅ Testar disparo individual
4. ✅ Testar disparo em massa com filtros
5. ⏳ Implementar as demais páginas do menu admin

## 🐛 Troubleshooting

### "WhatsApp não conectado"
- Verifique se o campo `whatsapp_conectado` está como `True` na tabela `empresas`
- Acesse /admin/whatsapp-config para conectar

### "Nenhum lead encontrado"
- Verifique se existem leads com telefone cadastrado
- Confira os filtros aplicados

### "Erro ao enviar mensagem"
- Verifique se a API do WhatsApp está rodando
- Confira os logs de erro na tabela `disparos`
- Verifique a função `enviar_mensagem_whatsapp()`

## 📞 Suporte

Para dúvidas ou problemas:
- Consulte os logs do sistema em `/admin/logs`
- Verifique a documentação em `/admin/documentacao`
- Revise o histórico de disparos na página do Disparador

---

**Desenvolvido com ❤️ para VendeAI**
