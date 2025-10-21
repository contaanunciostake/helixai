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

webhook_bp = Blueprint('webhook', __name__, url_prefix='/api/webhook')


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
        print(f"\n[WEBHOOK] Mensagem recebida: {data}")

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

        # Processar com IA
        resposta = processar_mensagem_com_ia(
            empresa=empresa,
            lead=lead,
            conversa=conversa,
            texto=texto,
            session=session
        )

        if resposta:
            # Enviar resposta via WhatsApp
            enviar_resposta_whatsapp(
                empresa_id=empresa_id,
                telefone=telefone_completo,
                texto=resposta['texto']
            )

            print(f"[WEBHOOK] Resposta enviada com sucesso!")

        return jsonify({
            'success': True,
            'message': 'Mensagem processada',
            'lead_id': lead.id,
            'conversa_id': conversa.id
        })

    except Exception as e:
        session.rollback()
        print(f"[WEBHOOK] Erro: {str(e)}")
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
        print(f"\n[WEBHOOK] Evento de conexão: {data}")

        empresa_id = data.get('empresaId')
        event = data.get('event')  # 'connected' ou 'disconnected'
        numero = data.get('numero')

        empresa = session.query(Empresa).filter_by(id=empresa_id).first()
        if empresa:
            if event == 'connected':
                empresa.whatsapp_conectado = True
                empresa.whatsapp_numero = numero
                empresa.whatsapp_qr_code = None
                print(f"[WEBHOOK] WhatsApp conectado: {numero}")
            elif event == 'disconnected':
                empresa.whatsapp_conectado = False
                empresa.bot_ativo = False
                print(f"[WEBHOOK] WhatsApp desconectado")

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


# ==========================================
# WEBHOOK MERCADO PAGO
# ==========================================

@webhook_bp.route('/mercadopago', methods=['GET', 'POST'])
def webhook_mercadopago():
    """
    Webhook para notificações do Mercado Pago

    Eventos processados:
    - payment (pagamento aprovado/rejeitado)
    - subscription_preapproval (assinatura)
    - subscription_authorized_payment (cobrança recorrente)

    IMPORTANTE: Sempre retorna 200 para evitar reenvios
    """
    # GET = Health check
    if request.method == 'GET':
        return jsonify({
            'status': 'online',
            'service': 'MercadoPago Webhook VendeAI',
            'timestamp': datetime.utcnow().isoformat()
        }), 200

    try:
        # Importar serviço do Mercado Pago
        import sys
        from pathlib import Path
        sys.path.append(str(Path(__file__).parent.parent.parent))
        from services.mercadopago_service import mp_service

        # Pegar dados do webhook
        data = request.get_json() or {}
        query_params = request.args.to_dict()

        print(f"\n[Mercado Pago Webhook] Notificação recebida:")
        print(f"Query Params: {query_params}")
        print(f"Body: {data}")

        # Tipo de notificação
        topic = query_params.get('topic') or data.get('type')
        resource_id = query_params.get('id') or data.get('data', {}).get('id')

        print(f"[Mercado Pago Webhook] Topic: {topic}, Resource ID: {resource_id}")

        # Processar baseado no tipo
        if topic == 'payment' or topic == 'merchant_order':
            # Notificação de pagamento
            if resource_id:
                payment_data = {'id': resource_id}
                mp_service.processar_webhook_pagamento(payment_data)
                print(f"[Mercado Pago Webhook] Pagamento {resource_id} processado")

        elif topic == 'subscription_preapproval':
            # Notificação de assinatura
            print(f"[Mercado Pago Webhook] Assinatura recorrente: {resource_id}")
            # TODO: Implementar lógica de assinatura recorrente

        elif topic == 'subscription_authorized_payment':
            # Cobrança recorrente autorizada
            print(f"[Mercado Pago Webhook] Cobrança recorrente autorizada: {resource_id}")
            # TODO: Implementar lógica de renovação automática

        # SEMPRE retornar 200 (mesmo com erros internos)
        return jsonify({
            'success': True,
            'message': 'Webhook processado',
            'topic': topic,
            'resource_id': resource_id
        }), 200

    except Exception as e:
        print(f"[Mercado Pago Webhook] ERRO: {str(e)}")
        import traceback
        traceback.print_exc()

        # IMPORTANTE: Retornar 200 mesmo com erro (evita reenvios infinitos)
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Erro processado, webhook não será reenviado'
        }), 200
