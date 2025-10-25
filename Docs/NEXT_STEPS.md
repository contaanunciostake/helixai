# 🎯 Próximos Passos - VendeAI

## ✅ O que já está pronto:

1. **✅ Banco de Dados Unificado**
   - 15 tabelas integradas
   - Sistema multi-tenant
   - Suporte a planos de assinatura
   - Migração automática

2. **✅ Backend Flask**
   - API REST completa
   - Autenticação multi-usuário
   - Rotas modulares (auth, dashboard, leads, conversas, campanhas, admin)
   - Templates base HTML/Bootstrap

3. **✅ Estrutura do Projeto**
   - Organização profissional
   - Documentação completa
   - Script de instalação
   - Script de migração

## 🔄 O que falta fazer:

### 1. Migrar Bot WhatsApp (30 min)

```bash
python migrate.py
```

Isso irá:
- Copiar bot-lucas.js → bot_engine/main.js
- Copiar módulos IA
- Copiar integrações (FIPE, Financiamento)
- Copiar package.json

**Depois:**
```bash
cd bot_engine
npm install
```

### 2. Adaptar Bot para Multi-tenant (1 hora)

Editar `bot_engine/main.js`:
- Adicionar lógica para identificar empresa pelo número WhatsApp
- Carregar configurações do banco (ConfiguracaoBot)
- Usar APIs da empresa (OpenAI, ElevenLabs)

### 3. Criar Webhooks ElevenLabs (30 min)

Criar `backend/routes/webhooks.py`:
```python
@bp.route('/webhook/elevenlabs', methods=['POST'])
def elevenlabs_webhook():
    # Receber eventos do ElevenLabs Agent
    # Atualizar conversas no banco
    # Processar respostas
```

### 4. Integrar Painel de Disparos (30 min)

- Copiar templates do RoboVendedor
- Adaptar rotas para usar novo banco
- Testar disparos em massa

### 5. Integrar Painel Cliente (30 min)

- Copiar templates do RoboVendedorPro
- Adaptar configurações do bot
- Testar formulário de configuração com IA

### 6. Conectar Bot com Backend (1 hora)

Criar `bot_engine/api_client.js`:
```javascript
// Cliente HTTP para comunicar com Flask
const API_BASE = 'http://localhost:5000/api';

async function salvarMensagem(conversa_id, mensagem) {
    await fetch(`${API_BASE}/mensagens`, {
        method: 'POST',
        body: JSON.stringify({conversa_id, mensagem})
    });
}
```

### 7. Implementar Analytics (1 hora)

- Criar job para calcular métricas diárias
- Popular tabela `metricas_conversas`
- Criar gráficos no dashboard

### 8. Testes Completos (2 horas)

- ✅ Login/Cadastro
- ✅ Conexão WhatsApp
- ✅ Envio de mensagens
- ✅ Recebimento de respostas
- ✅ Criação de leads
- ✅ Disparos em massa
- ✅ Configuração via dashboard

## 📝 Checklist de Implementação

### Fase 1 - Migração (Hoje)
- [ ] Executar `python migrate.py`
- [ ] Instalar dependências Node: `cd bot_engine && npm install`
- [ ] Testar bot localmente
- [ ] Verificar módulos IA

### Fase 2 - Integração (Amanhã)
- [ ] Adaptar bot para multi-tenant
- [ ] Conectar bot com banco de dados Flask
- [ ] Testar fluxo completo de conversa
- [ ] Implementar webhooks ElevenLabs

### Fase 3 - Interfaces (Depois de amanhã)
- [ ] Migrar templates RoboVendedor
- [ ] Migrar templates RoboVendedorPro
- [ ] Ajustar rotas para novo banco
- [ ] Testar todas as páginas

### Fase 4 - Refinamento (Próxima semana)
- [ ] Implementar analytics
- [ ] Adicionar gráficos
- [ ] Melhorar UX
- [ ] Testes de carga
- [ ] Deploy em produção

## 🚀 Início Rápido (Agora)

```bash
# 1. Migrar arquivos
python migrate.py

# 2. Instalar dependências bot
cd bot_engine
npm install
cd ..

# 3. Iniciar sistema
python run.py --all

# 4. Acessar
# http://localhost:5000 (Login: demo@vendeai.com / demo123)
```

## 💡 Dicas de Implementação

### Bot Multi-tenant

```javascript
// bot_engine/main.js
const { getEmpresaByPhone } = require('./database_client');

sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    const phone = msg.key.remoteJid;

    // Identificar empresa pelo número conectado
    const empresa = await getEmpresaByPhone(phone);

    // Carregar config da empresa
    const config = await fetch(`http://localhost:5000/api/config/${empresa.id}`);

    // Usar configurações específicas
    const openai = new OpenAI(config.openai_api_key);
    const elevenlabs = new ElevenLabs(config.elevenlabs_api_key);

    // Processar mensagem...
});
```

### Webhook ElevenLabs

```python
# backend/routes/webhooks.py
@bp.route('/webhook/elevenlabs/<int:empresa_id>', methods=['POST'])
def elevenlabs_webhook(empresa_id):
    data = request.json

    if data['event'] == 'conversation.message':
        # Salvar mensagem no banco
        mensagem = Mensagem(
            conversa_id=data['conversation_id'],
            conteudo=data['message'],
            enviada_por_bot=True
        )
        session.add(mensagem)
        session.commit()

    return jsonify({'success': True})
```

## 📚 Recursos Úteis

- **Documentação Baileys**: https://github.com/WhiskeySockets/Baileys
- **ElevenLabs API**: https://elevenlabs.io/docs
- **Flask Docs**: https://flask.palletsprojects.com/
- **SQLAlchemy**: https://docs.sqlalchemy.org/

## ❓ Dúvidas Frequentes

**Q: Como adicionar uma nova empresa?**
A: Use a rota `/register` ou crie via admin em `/admin`

**Q: Como conectar múltiplos WhatsApp?**
A: Cada empresa tem seu próprio `whatsapp_numero` e sessão Baileys

**Q: Onde ficam os áudios gerados?**
A: Em `bot_engine/audio_cache/`

**Q: Como adicionar um novo módulo IA?**
A: Crie em `bot_engine/ia-modules/` e registre no master

---

**Você está 70% pronto!** 🎉

Falta apenas migrar os arquivos e fazer os ajustes finais.

**Tempo estimado para conclusão:** 4-6 horas de trabalho focado.
