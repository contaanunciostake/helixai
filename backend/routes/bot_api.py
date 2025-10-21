"""
API para comunicação Bot <-> Backend
Endpoints usados pelo bot WhatsApp para salvar dados
"""

from flask import Blueprint, jsonify, request
from datetime import datetime
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent.parent))

from database.models import (
    Empresa, ConfiguracaoBot, Lead, Conversa, Mensagem,
    Campanha, Disparo, StatusLead, TemperaturaLead,
    TipoMensagem, StatusDisparo
)
from backend import db_manager

bp = Blueprint('bot_api', __name__, url_prefix='/api/bot')

# ==================== DEBUG ====================
print('\n========================================================')
print('=        BOT API ROUTES - MODULO CARREGADO            =')
print('========================================================')
print('[BOT API] Rotas disponiveis:')
print('[BOT API]   GET  /api/bot/config?phone=NUMERO')
print('[BOT API]   POST /api/bot/conversas')
print('[BOT API]   POST /api/bot/mensagens')
print('[BOT API]   POST /api/bot/leads')
print('[BOT API]   POST /api/bot/status')
print('[BOT API]   GET  /api/bot/leads/disparo')
print('[BOT API]   POST /api/bot/disparos')
print('========================================================\n')


@bp.route('/config', methods=['GET'])
def get_config():
    """Busca configuração da empresa pelo número WhatsApp"""
    phone = request.args.get('phone')

    print(f"\n[BOT API] ========================================")
    print(f"[BOT API] GET /api/bot/config")
    print(f"[BOT API] Telefone recebido: {phone}")

    if not phone:
        print(f"[BOT API] Telefone nao fornecido")
        return jsonify({'error': 'Phone number required'}), 400

    # Limpar número: extrair apenas os dígitos antes de @ ou :
    phone_clean = phone.split('@')[0].split(':')[0]
    print(f"[BOT API] Telefone limpo: {phone_clean}")

    session = db_manager.get_session()
    try:
        print(f"[BOT API] Buscando empresa com numero: {phone_clean}%")

        # Buscar empresa pelo número WhatsApp (usando LIKE para match parcial)
        empresa = session.query(Empresa).filter(
            Empresa.whatsapp_numero.like(f'{phone_clean}%')
        ).first()

        if not empresa:
            print(f"[BOT API] Empresa nao encontrada com filtro LIKE")
            print(f"[BOT API] Tentando buscar primeira empresa ativa...")

            # Fallback: buscar primeira empresa ativa
            empresa = session.query(Empresa).filter(
                Empresa.bot_ativo == True
            ).first()

            if not empresa:
                print(f"[BOT API] Nenhuma empresa ativa encontrada no banco!")
                print(f"[BOT API] ========================================\n")
                return jsonify({'error': 'Empresa não encontrada'}), 404

            print(f"[BOT API] Empresa encontrada (fallback): {empresa.nome} (ID: {empresa.id})")

        else:
            print(f"[BOT API] Empresa encontrada: {empresa.nome} (ID: {empresa.id})")

        # Buscar configuração
        print(f"[BOT API] Buscando configuracao do bot...")
        config = session.query(ConfiguracaoBot).filter_by(empresa_id=empresa.id).first()

        if not config:
            print(f"[BOT API] Configuracao nao encontrada, criando padrao...")
            # Criar configuração padrão
            config = ConfiguracaoBot(
                empresa_id=empresa.id,
                descricao_empresa=empresa.nome,
                mensagem_boas_vindas="Olá! Bem-vindo ao nosso atendimento.",
                auto_resposta_ativa=True,
                enviar_audio=True
            )
            session.add(config)
            session.commit()
            print(f"[BOT API] Configuracao padrao criada")

        print(f"[BOT API] Configuracao carregada:")
        print(f"[BOT API]    - Auto resposta: {config.auto_resposta_ativa}")
        print(f"[BOT API]    - Enviar audio: {config.enviar_audio}")
        print(f"[BOT API]    - OpenAI configurado: {'Sim' if config.openai_api_key else 'Nao'}")
        print(f"[BOT API]    - ElevenLabs configurado: {'Sim' if config.elevenlabs_api_key else 'Nao'}")
        print(f"[BOT API] ========================================\n")

        return jsonify({
            'empresa_id': empresa.id,
            'empresa_nome': empresa.nome,
            'whatsapp_numero': empresa.whatsapp_numero,
            'bot_ativo': empresa.bot_ativo,
            'config': {
                'descricao_empresa': config.descricao_empresa,
                'produtos_servicos': config.produtos_servicos,
                'tom_conversa': config.tom_conversa,
                'mensagem_boas_vindas': config.mensagem_boas_vindas,
                'auto_resposta_ativa': config.auto_resposta_ativa,
                'enviar_audio': config.enviar_audio,
                'openai_api_key': config.openai_api_key,
                'openai_model': config.openai_model,
                'groq_api_key': config.groq_api_key,
                'elevenlabs_api_key': config.elevenlabs_api_key,
                'elevenlabs_voice_id': config.elevenlabs_voice_id,
                'elevenlabs_agent_id': config.elevenlabs_agent_id,
                'modulo_fipe_ativo': config.modulo_fipe_ativo,
                'modulo_financiamento_ativo': config.modulo_financiamento_ativo
            }
        })

    except Exception as e:
        print(f"[BOT API] ERRO CRITICO")
        print(f"[BOT API] Erro: {str(e)}")
        print(f"[BOT API] ========================================\n")
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@bp.route('/mensagens', methods=['POST'])
def salvar_mensagem():
    """Salva mensagem no banco"""
    data = request.json
    session = db_manager.get_session()

    try:
        mensagem = Mensagem(
            conversa_id=data.get('conversa_id'),
            tipo=TipoMensagem[data.get('tipo', 'TEXTO').upper()],
            conteudo=data.get('conteudo'),
            arquivo_url=data.get('arquivo_url'),
            enviada_por_bot=data.get('enviada_por_bot', False),
            whatsapp_id=data.get('whatsapp_id')
        )

        session.add(mensagem)
        session.commit()

        return jsonify({
            'success': True,
            'mensagem_id': mensagem.id
        })

    except Exception as e:
        session.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@bp.route('/conversas', methods=['POST'])
def salvar_conversa():
    """Cria ou atualiza conversa"""
    data = request.json
    session = db_manager.get_session()

    try:
        empresa_id = data.get('empresa_id')
        telefone = data.get('telefone')

        # Buscar conversa existente
        conversa = session.query(Conversa).filter_by(
            empresa_id=empresa_id,
            telefone=telefone,
            ativa=True
        ).first()

        if not conversa:
            # Criar nova conversa
            conversa = Conversa(
                empresa_id=empresa_id,
                telefone=telefone,
                nome_contato=data.get('nome_contato'),
                ativa=True,
                bot_ativo=True
            )
            session.add(conversa)
        else:
            # Atualizar última mensagem
            conversa.ultima_mensagem = datetime.utcnow()
            conversa.total_mensagens += 1

        session.commit()

        return jsonify({
            'success': True,
            'conversa_id': conversa.id
        })

    except Exception as e:
        session.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@bp.route('/leads', methods=['POST'])
def salvar_lead():
    """Cria ou atualiza lead"""
    data = request.json
    session = db_manager.get_session()

    try:
        empresa_id = data.get('empresa_id')
        telefone = data.get('telefone')

        # Buscar lead existente
        lead = session.query(Lead).filter_by(
            empresa_id=empresa_id,
            telefone=telefone
        ).first()

        if not lead:
            # Criar novo lead
            lead = Lead(
                empresa_id=empresa_id,
                nome=data.get('nome'),
                telefone=telefone,
                email=data.get('email'),
                status=StatusLead.NOVO,
                temperatura=TemperaturaLead.MORNO,
                origem='whatsapp'
            )
            session.add(lead)
        else:
            # Atualizar lead
            if data.get('nome'):
                lead.nome = data.get('nome')
            if data.get('email'):
                lead.email = data.get('email')
            if data.get('temperatura'):
                lead.temperatura = TemperaturaLead[data['temperatura'].upper()]

            lead.ultima_interacao = datetime.utcnow()

        session.commit()

        return jsonify({
            'success': True,
            'lead_id': lead.id
        })

    except Exception as e:
        session.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@bp.route('/status', methods=['POST'])
def atualizar_status():
    """Atualiza status WhatsApp da empresa"""
    data = request.json
    session = db_manager.get_session()

    try:
        empresa_id = data.get('empresa_id')
        empresa = session.query(Empresa).get(empresa_id)

        if not empresa:
            return jsonify({'error': 'Empresa não encontrada'}), 404

        empresa.whatsapp_conectado = data.get('whatsapp_conectado', False)
        session.commit()

        return jsonify({'success': True})

    except Exception as e:
        session.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@bp.route('/leads/disparo', methods=['GET'])
def buscar_leads_disparo():
    """Busca leads para disparo em massa"""
    empresa_id = request.args.get('empresa_id')
    campanha_id = request.args.get('campanha_id')

    session = db_manager.get_session()

    try:
        # Buscar leads pendentes da campanha
        query = session.query(Lead).filter_by(
            empresa_id=empresa_id
        )

        if campanha_id:
            query = query.filter_by(campanha_id=campanha_id)

        leads = query.limit(100).all()

        resultado = []
        for lead in leads:
            resultado.append({
                'id': lead.id,
                'nome': lead.nome,
                'telefone': lead.telefone,
                'status': lead.status.value
            })

        return jsonify(resultado)

    finally:
        session.close()


@bp.route('/disparos', methods=['POST'])
def registrar_disparo():
    """Registra disparo realizado"""
    data = request.json
    session = db_manager.get_session()

    try:
        disparo = Disparo(
            campanha_id=data.get('campanha_id'),
            lead_id=data.get('lead_id'),
            telefone=data.get('telefone'),
            mensagem_enviada=data.get('mensagem'),
            status=StatusDisparo[data.get('status', 'ENVIADO').upper()],
            enviado_em=datetime.utcnow()
        )

        session.add(disparo)
        session.commit()

        return jsonify({
            'success': True,
            'disparo_id': disparo.id
        })

    except Exception as e:
        session.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()
