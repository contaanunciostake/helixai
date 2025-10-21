"""
Webhook para processamento de mensagens WhatsApp - VendeAI
Recebe mensagens do serviço Baileys e processa com IA
"""

from flask import Blueprint, request, jsonify
from flask_login import login_required
from datetime import datetime
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent.parent))
from database.models import Empresa, ConfiguracaoBot, Lead, Conversa, Mensagem, TipoMensagem, Produto
from backend import db_manager
import requests
import json
import hmac
import hashlib
import anthropic
import os

webhook_bp = Blueprint('webhook', __name__, url_prefix='/api/webhook')

# ========== HISTÓRICO DE CONVERSAS ELEVENLABS (GLOBAL) ==========
# Armazena histórico de conversas por conversation_id
historico_conversas_elevenlabs = {}

# ========== CONFIGURAÇÕES ELEVENLABS ==========
ELEVENLABS_WEBHOOK_SECRET = 'wsec_af7d8eef98f77d60679a19ad289a53a873a31a0f19ae33ed3173fb3e21234e82'


@webhook_bp.route('/whatsapp/message', methods=['POST'])
def receber_mensagem():
    """
    Webhook chamado pelo serviço Node.js quando uma mensagem é recebida

    Payload esperado:
    {
        "empresaId": 2,
        "from": "5567999887766@s.whatsapp.net",
        "text": "Olá, quero saber sobre produtos",
        "timestamp": 1234567890,
        "messageId": "ABC123"
    }
    """
    session = db_manager.get_session()

    try:
        data = request.get_json()
        print(f"\n📥 [WEBHOOK] Mensagem recebida: {data}")

        empresa_id = data.get('empresaId')
        telefone_completo = data.get('from')  # Ex: 5567999887766@s.whatsapp.net
        texto = data.get('text', '')
        timestamp = data.get('timestamp')
        message_id = data.get('messageId')

        # Extrair número limpo
        telefone = telefone_completo.split('@')[0] if '@' in telefone_completo else telefone_completo

        # Buscar empresa
        empresa = session.query(Empresa).filter_by(id=empresa_id).first()
        if not empresa:
            return jsonify({'success': False, 'error': 'Empresa não encontrada'}), 404

        # Verificar se bot está ativo
        if not empresa.bot_ativo:
            print(f"[WEBHOOK] Bot desativado para empresa {empresa_id}")
            return jsonify({'success': True, 'message': 'Bot desativado'}), 200

        # Ignorar mensagens de status/broadcast
        if 'status@broadcast' in telefone_completo or 'broadcast' in telefone_completo:
            print(f"[WEBHOOK] Ignorando mensagem de broadcast")
            return jsonify({'success': True, 'message': 'Broadcast ignorado'}), 200

        # Buscar ou criar lead
        lead = session.query(Lead).filter_by(
            empresa_id=empresa_id,
            telefone=telefone
        ).first()

        if not lead:
            lead = Lead(
                empresa_id=empresa_id,
                telefone=telefone,
                origem='whatsapp'
            )
            session.add(lead)
            session.flush()
            print(f"[WEBHOOK] Lead criado: {telefone}")

        # Buscar ou criar conversa
        conversa = session.query(Conversa).filter_by(
            empresa_id=empresa_id,
            lead_id=lead.id,
            ativa=True
        ).first()

        if not conversa:
            conversa = Conversa(
                empresa_id=empresa_id,
                lead_id=lead.id,
                telefone=telefone,
                ativa=True,
                bot_ativo=True
            )
            session.add(conversa)
            session.flush()
            print(f"[WEBHOOK] Conversa criada para lead {lead.id}")

        # Salvar mensagem recebida
        mensagem = Mensagem(
            conversa_id=conversa.id,
            tipo=TipoMensagem.TEXTO,
            conteudo=texto,
            enviada_por_bot=False,
            whatsapp_id=message_id
        )
        session.add(mensagem)

        # Atualizar estatísticas
        conversa.total_mensagens += 1
        conversa.mensagens_recebidas += 1
        conversa.ultima_mensagem = datetime.utcnow()
        lead.ultima_interacao = datetime.utcnow()

        session.commit()

        print(f"[WEBHOOK] Mensagem salva no banco. Processando resposta...")

        # Rotear para bot correto baseado no nicho da empresa
        resposta = rotear_para_bot_correto(
            empresa=empresa,
            lead=lead,
            conversa=conversa,
            texto=texto,
            telefone=telefone_completo,
            session=session
        )

        if resposta:
            # Enviar resposta via WhatsApp
            enviar_resposta_whatsapp(
                empresa_id=empresa_id,
                telefone=telefone_completo,
                texto=resposta['texto']
            )

            print(f"[WEBHOOK] ✅ Resposta enviada com sucesso!")

        return jsonify({
            'success': True,
            'message': 'Mensagem processada',
            'lead_id': lead.id,
            'conversa_id': conversa.id
        })

    except Exception as e:
        session.rollback()
        print(f"[WEBHOOK] ❌ Erro: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


def processar_mensagem_com_ia(empresa, lead, conversa, texto, session):
    """
    Processa mensagem com IA e gera resposta
    """
    try:
        # Buscar configuração do bot
        config_bot = session.query(ConfiguracaoBot).filter_by(
            empresa_id=empresa.id
        ).first()

        if not config_bot or not config_bot.auto_resposta_ativa:
            print("[IA] Auto-resposta desativada")
            return None

        # Buscar produtos da empresa para contexto
        produtos = session.query(Produto).filter_by(
            empresa_id=empresa.id,
            ativo=True
        ).limit(10).all()

        produtos_contexto = []
        for p in produtos:
            produtos_contexto.append({
                'nome': p.nome,
                'preco': p.preco,
                'descricao': p.descricao,
                'categoria': p.categoria
            })

        # Buscar histórico da conversa (últimas 10 mensagens)
        historico = session.query(Mensagem).filter_by(
            conversa_id=conversa.id
        ).order_by(Mensagem.enviada_em.desc()).limit(10).all()

        historico_formatado = []
        for msg in reversed(historico):
            historico_formatado.append({
                'role': 'assistant' if msg.enviada_por_bot else 'user',
                'content': msg.conteudo
            })

        # Construir prompt para IA
        prompt_sistema = construir_prompt_sistema(config_bot, produtos_contexto)

        # Chamar IA (OpenAI, Groq, ou ElevenLabs)
        resposta_ia = None

        # Tentar OpenAI primeiro
        if config_bot.openai_api_key:
            resposta_ia = chamar_openai(
                api_key=config_bot.openai_api_key,
                model=config_bot.openai_model or 'gpt-4-turbo',
                prompt_sistema=prompt_sistema,
                historico=historico_formatado,
                mensagem=texto
            )

        # Fallback para Groq
        elif config_bot.groq_api_key:
            resposta_ia = chamar_groq(
                api_key=config_bot.groq_api_key,
                prompt_sistema=prompt_sistema,
                historico=historico_formatado,
                mensagem=texto
            )

        if not resposta_ia:
            # Resposta padrão se IA não disponível
            resposta_ia = f"Olá! Recebi sua mensagem sobre: {texto[:50]}... Vou analisar e já te respondo!"

        # Salvar resposta no banco
        mensagem_bot = Mensagem(
            conversa_id=conversa.id,
            tipo=TipoMensagem.TEXTO,
            conteudo=resposta_ia,
            enviada_por_bot=True
        )
        session.add(mensagem_bot)

        # Atualizar estatísticas
        conversa.total_mensagens += 1
        conversa.mensagens_enviadas += 1

        session.commit()

        return {
            'texto': resposta_ia,
            'usar_audio': config_bot.enviar_audio and config_bot.elevenlabs_api_key
        }

    except Exception as e:
        print(f"[IA] Erro ao processar: {str(e)}")
        import traceback
        traceback.print_exc()
        return None


def rotear_para_bot_correto(empresa, lead, conversa, texto, telefone, session):
    """
    Roteia mensagem para o bot correto baseado no nicho da empresa

    - veiculos → AIra Auto (porta 4000)
    - imoveis → AIra Imob (porta 4001)
    - sem nicho → IA genérica (fallback)
    """
    print(f"\n[DEBUG-ROTEAMENTO] ========== FUNCAO CHAMADA ==========")
    print(f"[DEBUG-ROTEAMENTO] empresa.id: {empresa.id}")
    print(f"[DEBUG-ROTEAMENTO] empresa.nome: {empresa.nome}")
    print(f"[DEBUG-ROTEAMENTO] texto: {texto[:50] if len(texto) > 50 else texto}")

    try:
        print(f"[DEBUG-ROTEAMENTO] Dentro do try block...")
        print(f"[DEBUG-ROTEAMENTO] Acessando empresa.nicho...")
        print(f"[DEBUG-ROTEAMENTO] empresa.nicho RAW: {empresa.nicho}")
        print(f"[DEBUG-ROTEAMENTO] empresa.nicho TYPE: {type(empresa.nicho)}")
        nicho = empresa.nicho.value if empresa.nicho else None

        print(f"\n🎯 [ROTEAMENTO] Empresa: {empresa.nome}")
        print(f"🎯 [ROTEAMENTO] Nicho: {nicho or 'Não definido'}")

        if nicho == 'veiculos':
            print(f"🚗 [ROTEAMENTO] Chamando AIra Auto (Veículos)...")
            return chamar_bot_auto(texto, telefone, lead, conversa, session)

        elif nicho == 'imoveis':
            print(f"🏢 [ROTEAMENTO] Chamando AIra Imob (Imóveis)...")
            return chamar_bot_imob(texto, telefone, lead, conversa, session)

        else:
            print(f"⚠️ [ROTEAMENTO] Nicho não definido, usando IA genérica")
            return processar_mensagem_com_ia(empresa, lead, conversa, texto, session)

    except Exception as e:
        print(f"❌ [ROTEAMENTO] Erro: {str(e)}")
        import traceback
        traceback.print_exc()
        return processar_mensagem_com_ia(empresa, lead, conversa, texto, session)


def chamar_bot_auto(texto, telefone, lead, conversa, session):
    """
    Chama bot AIra Auto (Veículos) via HTTP
    """
    try:
        url = 'http://localhost:4000/api/processar-mensagem'
        payload = {
            'texto': texto,
            'telefone': telefone,
            'lead_id': lead.id,
            'conversa_id': conversa.id
        }

        response = requests.post(url, json=payload, timeout=30)
        response.raise_for_status()

        result = response.json()
        return {
            'texto': result.get('resposta', 'Erro ao processar mensagem'),
            'usar_audio': result.get('usar_audio', False)
        }
    except Exception as e:
        print(f"❌ [BOT-AUTO] Erro ao chamar bot: {str(e)}")
        return {
            'texto': 'Desculpe, estou com problemas técnicos. Tente novamente em instantes.',
            'usar_audio': False
        }


def chamar_bot_imob(texto, telefone, lead, conversa, session):
    """
    Chama bot AIra Imob (Imóveis) via HTTP
    """
    try:
        url = 'http://localhost:4001/api/processar-mensagem'
        payload = {
            'texto': texto,
            'telefone': telefone,
            'lead_id': lead.id,
            'conversa_id': conversa.id
        }

        response = requests.post(url, json=payload, timeout=30)
        response.raise_for_status()

        result = response.json()
        return {
            'texto': result.get('resposta', 'Erro ao processar mensagem'),
            'usar_audio': result.get('usar_audio', False)
        }
    except Exception as e:
        print(f"❌ [BOT-IMOB] Erro ao chamar bot: {str(e)}")
        return {
            'texto': 'Desculpe, estou com problemas técnicos. Tente novamente em instantes.',
            'usar_audio': False
        }


def construir_prompt_sistema(config_bot, produtos):
    """
    Constrói prompt do sistema para a IA
    """
    prompt = f"""Você é um assistente de vendas inteligente da empresa {config_bot.empresa.nome}.

INFORMAÇÕES DA EMPRESA:
{config_bot.descricao_empresa or 'Não informado'}

PRODUTOS/SERVIÇOS:
{config_bot.produtos_servicos or 'Não informado'}

PÚBLICO-ALVO:
{config_bot.publico_alvo or 'Não informado'}

DIFERENCIAIS:
{config_bot.diferenciais or 'Não informado'}

HORÁRIO DE ATENDIMENTO:
{config_bot.horario_atendimento or 'Segunda a Sexta, 9h às 18h'}

TOM DE CONVERSA:
Use um tom {config_bot.tom_conversa or 'profissional'}.

PRODUTOS DISPONÍVEIS:
"""

    if produtos:
        for p in produtos[:5]:
            prompt += f"\n- {p['nome']}: {p['descricao'][:100] if p['descricao'] else 'Sem descrição'} (R$ {p['preco']:.2f})"
    else:
        prompt += "\nNenhum produto cadastrado no momento."

    prompt += f"""

INSTRUÇÕES:
1. Seja prestativo e responda de forma objetiva
2. Se perguntarem sobre produtos, use a lista acima
3. Se precisar de informações que não tem, pergunte educadamente
4. Qualifique o lead perguntando sobre necessidades
5. Mantenha respostas curtas (máximo 2-3 linhas para WhatsApp)
6. Use emojis moderadamente para ser mais amigável
7. Se receberem uma resposta vaga como "oi" ou "opa", se apresente e pergunte como pode ajudar

MENSAGEM DE BOAS-VINDAS (use quando for o primeiro contato):
{config_bot.mensagem_boas_vindas or 'Olá! Como posso ajudar você hoje?'}
"""

    return prompt


def chamar_openai(api_key, model, prompt_sistema, historico, mensagem):
    """
    Chama API da OpenAI
    """
    try:
        url = 'https://api.openai.com/v1/chat/completions'
        headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }

        messages = [
            {'role': 'system', 'content': prompt_sistema}
        ]

        # Adicionar histórico
        if historico:
            messages.extend(historico[-5:])  # Últimas 5 mensagens

        # Adicionar mensagem atual
        messages.append({'role': 'user', 'content': mensagem})

        payload = {
            'model': model,
            'messages': messages,
            'max_tokens': 300,
            'temperature': 0.7
        }

        response = requests.post(url, headers=headers, json=payload, timeout=30)
        response.raise_for_status()

        result = response.json()
        resposta = result['choices'][0]['message']['content']

        print(f"[OPENAI] Resposta gerada: {resposta[:100]}...")
        return resposta

    except Exception as e:
        print(f"[OPENAI] Erro: {str(e)}")
        return None


def chamar_groq(api_key, prompt_sistema, historico, mensagem):
    """
    Chama API da Groq (LLMs rápidos)
    """
    try:
        url = 'https://api.groq.com/openai/v1/chat/completions'
        headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }

        messages = [
            {'role': 'system', 'content': prompt_sistema}
        ]

        if historico:
            messages.extend(historico[-5:])

        messages.append({'role': 'user', 'content': mensagem})

        payload = {
            'model': 'llama-3.1-70b-versatile',  # Modelo rápido da Groq
            'messages': messages,
            'max_tokens': 300,
            'temperature': 0.7
        }

        response = requests.post(url, headers=headers, json=payload, timeout=30)
        response.raise_for_status()

        result = response.json()
        resposta = result['choices'][0]['message']['content']

        print(f"[GROQ] Resposta gerada: {resposta[:100]}...")
        return resposta

    except Exception as e:
        print(f"[GROQ] Erro: {str(e)}")
        return None


def enviar_resposta_whatsapp(empresa_id, telefone, texto):
    """
    Envia resposta via serviço WhatsApp (Baileys)
    """
    try:
        url = 'http://localhost:3001/api/message/send'
        payload = {
            'empresaId': empresa_id,
            'to': telefone,
            'text': texto
        }

        response = requests.post(url, json=payload, timeout=10)
        response.raise_for_status()

        print(f"[WHATSAPP] Mensagem enviada para {telefone}")
        return True

    except Exception as e:
        print(f"[WHATSAPP] Erro ao enviar: {str(e)}")
        return False


@webhook_bp.route('/whatsapp/connection', methods=['POST'])
def webhook_conexao():
    """
    Webhook chamado quando WhatsApp conecta/desconecta
    """
    session = db_manager.get_session()

    try:
        data = request.get_json()
        print(f"\n📡 [WEBHOOK] Evento de conexão: {data}")

        empresa_id = data.get('empresaId')
        event = data.get('event')  # 'connected' ou 'disconnected'
        numero = data.get('numero')

        empresa = session.query(Empresa).filter_by(id=empresa_id).first()
        if empresa:
            if event == 'connected':
                empresa.whatsapp_conectado = True
                empresa.whatsapp_numero = numero
                empresa.whatsapp_qr_code = None
                print(f"[WEBHOOK] ✅ WhatsApp conectado: {numero}")
            elif event == 'disconnected':
                empresa.whatsapp_conectado = False
                empresa.bot_ativo = False
                print(f"[WEBHOOK] ❌ WhatsApp desconectado")

            session.commit()

        return jsonify({'success': True})

    except Exception as e:
        session.rollback()
        print(f"[WEBHOOK] Erro: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@webhook_bp.route('/test', methods=['GET', 'POST'])
def test_webhook():
    """
    Endpoint de teste do webhook
    """
    return jsonify({
        'status': 'online',
        'message': 'Webhook VendeAI funcionando!',
        'timestamp': datetime.utcnow().isoformat()
    })


@webhook_bp.route('/elevenlabs', methods=['GET', 'POST'])
def webhook_elevenlabs():
    """
    Webhook para receber eventos do ElevenLabs Agent com integração Claude API

    Este endpoint recebe callbacks do agente de voz do ElevenLabs e processa
    com Claude API (Sonnet 4.5) para gerar respostas inteligentes.

    EVENTOS SUPORTADOS:
    - conversation.transcript: Quando usuário fala (processa com Claude)
    - conversation.started: Início de conversa
    - conversation.ended: Fim de conversa (limpa histórico)

    URL pública (LocalTunnel): https://meuapp.loca.lt/api/webhook/elevenlabs
    """
    try:
        # GET é usado pelo ElevenLabs para verificar se o webhook está online
        if request.method == 'GET':
            return jsonify({
                'status': 'online',
                'service': 'ElevenLabs Webhook + Claude API',
                'message': 'Webhook ElevenLabs pronto para receber eventos',
                'timestamp': datetime.utcnow().isoformat()
            })

        # ========== VALIDAÇÃO HMAC SIGNATURE ==========
        signature = request.headers.get('elevenlabs-signature')
        body = request.get_data()

        if signature:
            expected_signature = hmac.new(
                ELEVENLABS_WEBHOOK_SECRET.encode(),
                body,
                hashlib.sha256
            ).hexdigest()

            if signature != expected_signature:
                print(f"[ELEVENLABS-WEBHOOK] ⚠️ Assinatura HMAC inválida!")
                print(f"  Recebido: {signature}")
                print(f"  Esperado: {expected_signature}")
                return jsonify({'error': 'Invalid signature'}), 401

            print(f"[ELEVENLABS-WEBHOOK] ✅ Assinatura HMAC validada")

        # POST é usado para receber eventos do agente
        data = request.get_json()
        print(f"\n🎙️ [ELEVENLABS-WEBHOOK] Evento recebido: {json.dumps(data, indent=2)}")

        event_type = data.get('event_type') or data.get('type')

        # ========== PROCESSAR EVENTOS ==========

        # Evento: Transcrição de fala do usuário
        if event_type == 'conversation.transcript':
            conversation_id = data.get('conversation_id')
            texto_usuario = data.get('transcript') or data.get('text', '')

            print(f"[ELEVENLABS] 💬 Usuário disse: \"{texto_usuario}\"")
            print(f"[ELEVENLABS] 🆔 Conversation ID: {conversation_id}")

            if texto_usuario and conversation_id:
                # Processar com Claude API
                resposta_claude = processar_com_claude(texto_usuario, conversation_id)

                if resposta_claude:
                    # Enviar resposta de volta para ElevenLabs
                    sucesso = enviar_para_elevenlabs(conversation_id, resposta_claude)

                    if sucesso:
                        print(f"[ELEVENLABS] ✅ Resposta enviada com sucesso")
                    else:
                        print(f"[ELEVENLABS] ⚠️ Falha ao enviar resposta")

        # Evento: Conversa iniciada
        elif event_type == 'conversation.started':
            conversation_id = data.get('conversation_id')
            print(f"[ELEVENLABS] 🚀 Conversa iniciada: {conversation_id}")

            # Limpar histórico anterior se existir
            if conversation_id in historico_conversas_elevenlabs:
                historico_conversas_elevenlabs[conversation_id] = []
                print(f"[ELEVENLABS] 🗑️ Histórico anterior limpo")

        # Evento: Conversa finalizada
        elif event_type == 'conversation.ended':
            conversation_id = data.get('conversation_id')
            duration = data.get('duration', 0)

            print(f"[ELEVENLABS] 🏁 Conversa finalizada: {conversation_id}")
            print(f"[ELEVENLABS] ⏱️ Duração: {duration}s")

            # Limpar histórico da memória
            if conversation_id in historico_conversas_elevenlabs:
                num_mensagens = len(historico_conversas_elevenlabs[conversation_id])
                del historico_conversas_elevenlabs[conversation_id]
                print(f"[ELEVENLABS] 🗑️ Histórico removido ({num_mensagens} mensagens)")

        # Evento: Chamada finalizada (legado)
        elif event_type == 'call.ended':
            print(f"[ELEVENLABS] 📞 Chamada finalizada (evento legado)")
            call_id = data.get('call_id')
            duration = data.get('duration')
            transcript = data.get('transcript')

            print(f"  Call ID: {call_id}")
            print(f"  Duração: {duration}s")
            if transcript:
                print(f"  Transcrição: {transcript[:200]}...")

        # Evento: Chamada iniciada (legado)
        elif event_type == 'call.started':
            print(f"[ELEVENLABS] 📞 Chamada iniciada (evento legado)")

        # Evento: Mensagem do agente (legado)
        elif event_type == 'agent.message':
            print(f"[ELEVENLABS] 🤖 Mensagem do agente: {data.get('message')}")

        else:
            print(f"[ELEVENLABS] ⚠️ Evento desconhecido: {event_type}")

        # Sempre retornar sucesso para o ElevenLabs (não bloquear webhook)
        return jsonify({
            'success': True,
            'message': 'Evento processado com sucesso',
            'timestamp': datetime.utcnow().isoformat()
        }), 200

    except Exception as e:
        print(f"[ELEVENLABS-WEBHOOK] ❌ Erro: {str(e)}")
        import traceback
        traceback.print_exc()

        # Retornar erro mas com status 200 para não bloquear o ElevenLabs
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 200


# ========== FUNÇÕES AUXILIARES ELEVENLABS + CLAUDE ==========

def processar_com_claude(texto_usuario, conversation_id):
    """
    Processa mensagem do usuário com Claude API e retorna resposta

    Args:
        texto_usuario: Texto falado pelo usuário
        conversation_id: ID da conversa do ElevenLabs

    Returns:
        str: Resposta gerada pelo Claude ou None em caso de erro
    """
    try:
        print(f"\n🤖 [CLAUDE-API] Processando mensagem...")

        # Inicializar cliente Anthropic
        api_key = os.environ.get('ANTHROPIC_API_KEY')
        if not api_key:
            print(f"[CLAUDE-API] ❌ ANTHROPIC_API_KEY não configurada!")
            return "Desculpe, estou com um problema técnico no momento. Pode tentar novamente?"

        client = anthropic.Anthropic(api_key=api_key)

        # Buscar histórico da conversa
        historico = buscar_historico_conversa(conversation_id)

        # System prompt da Aria (vendedora consultiva)
        system_prompt = """Você é Aria, vendedora consultiva de veículos da Feirão ShowCar.

PERSONALIDADE:
- Profissional, empática e objetiva
- Faz perguntas estratégicas para qualificar o lead
- Tom amigável mas profissional (não robótico)
- Confiante e consultiva

FERRAMENTAS DISPONÍVEIS:
- buscar-carros: Busca veículos no estoque
- detalhes-veiculo: Busca detalhes de um veículo específico
- calcular-financiamento: Calcula parcelas de financiamento
- agendar-visita: Agenda visita do cliente na loja

REGRAS IMPORTANTES:
1. Respostas CURTAS (máximo 3 frases - é conversa por áudio!)
2. Qualifique o lead com perguntas sobre:
   - Tipo de veículo desejado
   - Orçamento disponível
   - Prazo de compra
   - Preferências (marca, modelo, ano)
3. Use as ferramentas quando apropriado
4. NÃO invente dados de veículos - use apenas informações reais das ferramentas
5. Se não souber algo, pergunte ou use a ferramenta apropriada
6. Seja natural e humana - evite linguagem robótica
7. Mantenha o foco em VENDER e AGENDAR visita

EXEMPLOS DE BOAS RESPOSTAS:
- "Opa! Que legal! Me conta, você tá procurando qual tipo de carro? SUV, sedan, hatch?"
- "Perfeito! E qual é o orçamento que você tem em mente?"
- "Deixa eu buscar as melhores opções pra você! Rapidinho..."

EVITE:
- Respostas muito longas
- Informações técnicas excessivas
- Falar demais sem perguntar
"""

        # Construir lista de mensagens com histórico
        messages = historico.copy()
        messages.append({
            'role': 'user',
            'content': texto_usuario
        })

        # Chamar Claude API
        print(f"[CLAUDE-API] 📤 Enviando para Claude Sonnet 4.5...")
        print(f"[CLAUDE-API] 📝 Histórico: {len(historico)} mensagens")

        response = client.messages.create(
            model='claude-sonnet-4-20250514',
            max_tokens=300,
            temperature=0.7,
            system=system_prompt,
            messages=messages
        )

        # Extrair resposta
        resposta_claude = response.content[0].text.strip()

        print(f"[CLAUDE-API] ✅ Resposta gerada: \"{resposta_claude}\"")
        print(f"[CLAUDE-API] 📊 Tokens usados: {response.usage.input_tokens} in / {response.usage.output_tokens} out")

        # Salvar no histórico
        salvar_historico_conversa(conversation_id, texto_usuario, resposta_claude)

        return resposta_claude

    except Exception as e:
        print(f"[CLAUDE-API] ❌ Erro: {str(e)}")
        import traceback
        traceback.print_exc()

        # Fallback genérico em caso de erro
        return "Desculpe, não entendi direito. Pode repetir?"


def enviar_para_elevenlabs(conversation_id, texto_resposta):
    """
    Envia resposta de texto para o agente ElevenLabs falar

    Args:
        conversation_id: ID da conversa do ElevenLabs
        texto_resposta: Texto da resposta para ser convertido em áudio

    Returns:
        bool: True se enviado com sucesso, False caso contrário
    """
    try:
        print(f"\n📤 [ELEVENLABS-API] Enviando resposta para conversa {conversation_id}...")

        # API Key do ElevenLabs
        api_key = os.environ.get('ELEVENLABS_API_KEY')
        if not api_key:
            print(f"[ELEVENLABS-API] ❌ ELEVENLABS_API_KEY não configurada!")
            return False

        # Endpoint da API ElevenLabs
        url = f'https://api.elevenlabs.io/v1/convai/conversation/{conversation_id}/message'

        headers = {
            'xi-api-key': api_key,
            'Content-Type': 'application/json'
        }

        payload = {
            'text': texto_resposta,
            'role': 'agent'
        }

        print(f"[ELEVENLABS-API] 🎯 URL: {url}")
        print(f"[ELEVENLABS-API] 💬 Texto: \"{texto_resposta}\"")

        # Enviar requisição
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        response.raise_for_status()

        print(f"[ELEVENLABS-API] ✅ Resposta enviada com sucesso!")
        print(f"[ELEVENLABS-API] 📡 Status: {response.status_code}")

        return True

    except requests.exceptions.Timeout:
        print(f"[ELEVENLABS-API] ⏱️ Timeout ao enviar resposta")
        return False
    except requests.exceptions.RequestException as e:
        print(f"[ELEVENLABS-API] ❌ Erro HTTP: {str(e)}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"[ELEVENLABS-API] 📄 Response body: {e.response.text}")
        return False
    except Exception as e:
        print(f"[ELEVENLABS-API] ❌ Erro inesperado: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def salvar_historico_conversa(conversation_id, mensagem_usuario, mensagem_assistente):
    """
    Salva mensagem no histórico da conversa

    Args:
        conversation_id: ID da conversa
        mensagem_usuario: Mensagem enviada pelo usuário
        mensagem_assistente: Resposta do assistente (Claude)
    """
    global historico_conversas_elevenlabs

    if conversation_id not in historico_conversas_elevenlabs:
        historico_conversas_elevenlabs[conversation_id] = []

    # Adicionar par de mensagens
    historico_conversas_elevenlabs[conversation_id].extend([
        {'role': 'user', 'content': mensagem_usuario},
        {'role': 'assistant', 'content': mensagem_assistente}
    ])

    # Limitar histórico a últimas 20 mensagens (10 pares) para não sobrecarregar
    if len(historico_conversas_elevenlabs[conversation_id]) > 20:
        historico_conversas_elevenlabs[conversation_id] = historico_conversas_elevenlabs[conversation_id][-20:]

    print(f"[HISTÓRICO] 💾 Salvo para conversa {conversation_id} (total: {len(historico_conversas_elevenlabs[conversation_id])} msgs)")


def buscar_historico_conversa(conversation_id):
    """
    Busca histórico de mensagens de uma conversa

    Args:
        conversation_id: ID da conversa

    Returns:
        list: Lista de mensagens no formato Claude API
    """
    global historico_conversas_elevenlabs

    if conversation_id not in historico_conversas_elevenlabs:
        historico_conversas_elevenlabs[conversation_id] = []
        print(f"[HISTÓRICO] 🆕 Nova conversa iniciada: {conversation_id}")
        return []

    historico = historico_conversas_elevenlabs[conversation_id]
    print(f"[HISTÓRICO] 📚 Recuperado histórico com {len(historico)} mensagens")

    return historico


# ========== FUNÇÕES PARA O AGENTE ELEVENLABS ==========

@webhook_bp.route('/elevenlabs/buscar-carros', methods=['POST'])
def buscar_carros():
    """
    API para o agente ElevenLabs buscar carros disponíveis

    Payload esperado:
    {
        "marca": "Honda",
        "modelo": "City",
        "ano_min": 2020,
        "ano_max": 2023,
        "preco_max": 100000,
        "tipo": "sedan"
    }
    """
    try:
        import mysql.connector
        from os import environ

        data = request.get_json() or {}
        print(f"\n🚗 [ELEVENLABS-BUSCAR] Parâmetros recebidos: {data}")

        # Conectar ao banco MySQL
        db = mysql.connector.connect(
            host=environ.get('DB_HOST', 'localhost'),
            port=int(environ.get('DB_PORT', 3306)),
            user=environ.get('DB_USER', 'root'),
            password=environ.get('DB_PASSWORD', ''),
            database=environ.get('DB_NAME', 'u161861600_feiraoshow')
        )
        cursor = db.cursor(dictionary=True)

        # Construir query dinâmica
        query = """
            SELECT
                c.id,
                cc.title as nome,
                b.name as marca,
                cm.name as modelo,
                c.price as preco,
                c.year as ano,
                c.mileage as km,
                c.feature_image as foto,
                bd.name as tipo_carroceria
            FROM cars c
            LEFT JOIN car_contents cc ON c.id = cc.car_id
            LEFT JOIN brands b ON cc.brand_id = b.id
            LEFT JOIN car_models cm ON cc.car_model_id = cm.id
            LEFT JOIN body_types bd ON cc.body_type_id = bd.id
            WHERE c.status = '1' AND c.price > 0
        """

        params = []

        # Filtros opcionais
        if data.get('marca'):
            query += " AND b.name LIKE %s"
            params.append(f"%{data['marca']}%")

        if data.get('modelo'):
            query += " AND cm.name LIKE %s"
            params.append(f"%{data['modelo']}%")

        if data.get('ano_min'):
            query += " AND c.year >= %s"
            params.append(data['ano_min'])

        if data.get('ano_max'):
            query += " AND c.year <= %s"
            params.append(data['ano_max'])

        if data.get('preco_max'):
            # Incluir veículos até 10% acima do preço (para oferecer opções melhores)
            preco_com_margem = float(data['preco_max']) * 1.1
            query += " AND c.price <= %s"
            params.append(preco_com_margem)

        if data.get('tipo'):
            query += " AND bd.name LIKE %s"
            params.append(f"%{data['tipo']}%")

        # Ordenar por preço DECRESCENTE (mais caro primeiro, começando pelo limite)
        # Mostra veículos próximos ao valor máximo que o cliente pode pagar
        query += " ORDER BY c.price DESC LIMIT 5"

        cursor.execute(query, params)
        veiculos = cursor.fetchall()

        # Formatar resposta
        resultado = []
        for v in veiculos:
            resultado.append({
                'id': v['id'],
                'nome': v['nome'] or 'Sem nome',
                'marca': v['marca'] or 'N/A',
                'modelo': v['modelo'] or 'N/A',
                'preco': float(v['preco'] or 0),
                'ano': v['ano'] or 'N/A',
                'km': v['km'] or '0',
                'tipo': v['tipo_carroceria'] or 'N/A',
                'foto': v['foto']  # ← CAMPO ADICIONADO!
            })

        cursor.close()
        db.close()

        print(f"[ELEVENLABS-BUSCAR] ✅ Encontrados {len(resultado)} veículos")

        return jsonify({
            'success': True,
            'total': len(resultado),
            'veiculos': resultado
        }), 200

    except Exception as e:
        print(f"[ELEVENLABS-BUSCAR] ❌ Erro: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e),
            'veiculos': []
        }), 200


@webhook_bp.route('/elevenlabs/detalhes-veiculo', methods=['POST'])
def detalhes_veiculo():
    """
    API para o agente ElevenLabs buscar detalhes de um veículo específico

    Payload esperado (ElevenLabs):
    {
        "veiculo_id": 123
    }
    """
    try:
        import mysql.connector
        from os import environ

        data = request.get_json() or {}
        # Aceitar ambos os formatos: 'veiculo_id' (ElevenLabs) e 'id' (legado)
        veiculo_id = data.get('veiculo_id') or data.get('id')

        print(f"\n🔍 [ELEVENLABS-DETALHES] Buscando veículo ID: {veiculo_id}")

        if not veiculo_id:
            return jsonify({
                'success': False,
                'error': 'ID do veículo não fornecido'
            }), 400

        # Conectar ao banco MySQL
        db = mysql.connector.connect(
            host=environ.get('DB_HOST', 'localhost'),
            port=int(environ.get('DB_PORT', 3306)),
            user=environ.get('DB_USER', 'root'),
            password=environ.get('DB_PASSWORD', ''),
            database=environ.get('DB_NAME', 'u161861600_feiraoshow')
        )
        cursor = db.cursor(dictionary=True)

        # Buscar detalhes completos
        query = """
            SELECT
                c.id,
                cc.title as nome,
                b.name as marca,
                cm.name as modelo,
                c.price as preco,
                c.year as ano,
                c.mileage as km,
                c.feature_image as foto,
                bd.name as tipo_carroceria,
                fc.name as cor,
                ft.name as tipo_combustivel,
                trans.name as transmissao,
                cc.description as descricao,
                c.doors as portas,
                c.engine_capacity as motor
            FROM cars c
            LEFT JOIN car_contents cc ON c.id = cc.car_id
            LEFT JOIN brands b ON cc.brand_id = b.id
            LEFT JOIN car_models cm ON cc.car_model_id = cm.id
            LEFT JOIN body_types bd ON cc.body_type_id = bd.id
            LEFT JOIN fuel_types ft ON cc.fuel_type_id = ft.id
            LEFT JOIN transmission_types trans ON cc.transmission_type_id = trans.id
            LEFT JOIN car_colors fc ON cc.car_color_id = fc.id
            WHERE c.id = %s AND c.status = '1'
        """

        cursor.execute(query, (veiculo_id,))
        veiculo = cursor.fetchone()

        if not veiculo:
            cursor.close()
            db.close()
            return jsonify({
                'success': False,
                'error': 'Veículo não encontrado'
            }), 404

        # Buscar fotos adicionais
        cursor.execute("SELECT image FROM car_images WHERE car_id = %s LIMIT 5", (veiculo_id,))
        fotos = [f['image'] for f in cursor.fetchall()]

        cursor.close()
        db.close()

        # Formatar resposta
        resultado = {
            'id': veiculo['id'],
            'nome': veiculo['nome'] or 'Sem nome',
            'marca': veiculo['marca'] or 'N/A',
            'modelo': veiculo['modelo'] or 'N/A',
            'preco': float(veiculo['preco'] or 0),
            'ano': veiculo['ano'] or 'N/A',
            'km': veiculo['km'] or '0',
            'tipo': veiculo['tipo_carroceria'] or 'N/A',
            'cor': veiculo['cor'] or 'N/A',
            'combustivel': veiculo['tipo_combustivel'] or 'N/A',
            'cambio': veiculo['transmissao'] or 'N/A',
            'portas': veiculo['portas'] or 'N/A',
            'motor': veiculo['motor'] or 'N/A',
            'descricao': veiculo['descricao'] or 'Sem descrição',
            'fotos': fotos
        }

        print(f"[ELEVENLABS-DETALHES] ✅ Detalhes do veículo {veiculo_id} encontrados")

        return jsonify({
            'success': True,
            'veiculo': resultado
        }), 200

    except Exception as e:
        print(f"[ELEVENLABS-DETALHES] ❌ Erro: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 200


@webhook_bp.route('/elevenlabs/calcular-financiamento', methods=['POST'])
def calcular_financiamento():
    """
    API para o agente ElevenLabs calcular financiamento

    Payload esperado (ElevenLabs):
    {
        "valor_veiculo": 50000,
        "entrada": 10000,
        "parcelas": 48,
        "taxa_juros": 1.99
    }
    """
    try:
        data = request.get_json() or {}

        # Aceitar ambos os formatos (novo ElevenLabs e antigo)
        valor_total = float(data.get('valor_veiculo') or data.get('valor', 0))
        entrada = float(data.get('entrada', 0))
        num_parcelas = int(data.get('parcelas', 48))
        taxa_juros_param = float(data.get('taxa_juros', 1.99))

        print(f"\n💰 [ELEVENLABS-FINANCIAMENTO] Calculando: Valor={valor_total}, Entrada={entrada}, Parcelas={num_parcelas}, Taxa={taxa_juros_param}%")

        if valor_total <= 0 or num_parcelas <= 0:
            return jsonify({
                'success': False,
                'error': 'Valor ou número de parcelas inválido'
            }), 400

        # Cálculo do financiamento
        valor_financiado = valor_total - entrada
        taxa_mensal = taxa_juros_param / 100  # Converter % para decimal (ex: 1.99 -> 0.0199)

        # Fórmula: PMT = PV * (i * (1+i)^n) / ((1+i)^n - 1)
        if valor_financiado > 0:
            taxa_fator = (1 + taxa_mensal) ** num_parcelas
            valor_parcela = valor_financiado * (taxa_mensal * taxa_fator) / (taxa_fator - 1)
            valor_total_pago = entrada + (valor_parcela * num_parcelas)
            juros_total = valor_total_pago - valor_total
        else:
            valor_parcela = 0
            valor_total_pago = entrada
            juros_total = 0

        resultado = {
            'valor_veiculo': valor_total,
            'entrada': entrada,
            'valor_financiado': valor_financiado,
            'num_parcelas': num_parcelas,
            'valor_parcela': round(valor_parcela, 2),
            'valor_total_pago': round(valor_total_pago, 2),
            'juros_total': round(juros_total, 2),
            'taxa_mensal': taxa_mensal * 100  # em %
        }

        print(f"[ELEVENLABS-FINANCIAMENTO] ✅ Parcela calculada: R$ {resultado['valor_parcela']:.2f}")

        return jsonify({
            'success': True,
            'financiamento': resultado
        }), 200

    except Exception as e:
        print(f"[ELEVENLABS-FINANCIAMENTO] ❌ Erro: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 200


@webhook_bp.route('/elevenlabs/agendar-visita', methods=['POST'])
def agendar_visita():
    """
    API para o agente ElevenLabs agendar visita do cliente

    Payload esperado (ElevenLabs):
    {
        "cliente_nome": "João Silva",
        "cliente_telefone": 67999887766,
        "data_preferida": "2025-10-15",
        "horario_preferido": "14:00",
        "veiculo_id": 123
    }
    """
    session = db_manager.get_session()

    try:
        data = request.get_json() or {}

        # Aceitar ambos os formatos: ElevenLabs (cliente_nome, data_preferida, etc) e legado (nome, data, etc)
        nome = data.get('cliente_nome') or data.get('nome')
        telefone = str(data.get('cliente_telefone') or data.get('telefone', ''))
        data_visita = data.get('data_preferida') or data.get('data')
        horario = data.get('horario_preferido') or data.get('horario')
        veiculo_id = data.get('veiculo_id')

        print(f"\n📅 [ELEVENLABS-AGENDAR] Agendando visita: {nome} - {data_visita} {horario}")
        print(f"[ELEVENLABS-AGENDAR] Dados recebidos: {data}")

        if not all([nome, telefone, data_visita, horario]):
            return jsonify({
                'success': False,
                'error': 'Dados incompletos para agendamento'
            }), 400

        # Buscar ou criar lead
        lead = session.query(Lead).filter_by(
            telefone=telefone
        ).first()

        if not lead:
            # Criar lead se não existir
            lead = Lead(
                empresa_id=1,  # ID da empresa padrão
                nome=nome,
                telefone=telefone,
                origem='elevenlabs'
            )
            session.add(lead)
            session.flush()
        else:
            # Atualizar nome se veio vazio
            if not lead.nome or lead.nome == 'Não informado':
                lead.nome = nome

        # Criar agendamento (você pode criar uma tabela 'agendamentos' se quiser)
        # Por enquanto, vou salvar como uma conversa especial
        conversa = Conversa(
            empresa_id=1,
            lead_id=lead.id,
            telefone=telefone,
            ativa=True,
            bot_ativo=False,  # Desativar bot após agendamento
            observacoes=f"AGENDAMENTO: {data_visita} às {horario} - Veículo ID: {veiculo_id or 'Não especificado'}"
        )
        session.add(conversa)

        # Salvar mensagem de agendamento
        mensagem = Mensagem(
            conversa_id=conversa.id,
            tipo=TipoMensagem.TEXTO,
            conteudo=f"Visita agendada para {data_visita} às {horario}",
            enviada_por_bot=True
        )
        session.add(mensagem)

        session.commit()

        resultado = {
            'agendamento_id': conversa.id,
            'nome': nome,
            'telefone': telefone,
            'data': data_visita,
            'horario': horario,
            'veiculo_id': veiculo_id,
            'mensagem': f'Visita agendada com sucesso para {data_visita} às {horario}!'
        }

        print(f"[ELEVENLABS-AGENDAR] ✅ Visita agendada ID: {conversa.id}")

        return jsonify({
            'success': True,
            'agendamento': resultado
        }), 200

    except Exception as e:
        session.rollback()
        print(f"[ELEVENLABS-AGENDAR] ❌ Erro: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 200
    finally:
        session.close()
