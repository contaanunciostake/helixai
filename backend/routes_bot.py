"""
Rotas da API para o Bot WhatsApp
Permite o bot consultar configurações e salvar dados no banco MySQL
"""

from flask import Blueprint, request, jsonify
from database.models import DatabaseManager, Empresa, ConfiguracaoBot, Lead, Conversa, Mensagem, Usuario
from sqlalchemy import or_
import os
from dotenv import load_dotenv

load_dotenv()

# Criar blueprint
bot_bp = Blueprint('bot', __name__, url_prefix='/api/bot')

# Database Manager
db_manager = DatabaseManager(os.getenv('DATABASE_URL'))


@bot_bp.route('/health', methods=['GET'])
def health():
    """Health check para o bot"""
    return jsonify({
        'status': 'ok',
        'service': 'VendeAI Bot API',
        'database': 'connected'
    })


@bot_bp.route('/config', methods=['GET'])
def get_config():
    """
    Busca configuração da empresa pelo número WhatsApp
    GET /api/bot/config?phone=5567999999999
    """
    phone = request.args.get('phone')

    print(f"\n[BOT API] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print(f"[BOT API] 📞 Buscando config para: {phone}")

    if not phone:
        print(f"[BOT API] ❌ Telefone não fornecido")
        return jsonify({'error': 'Parâmetro phone é obrigatório'}), 400

    session = db_manager.get_session()
    try:
        # Buscar empresa pelo número WhatsApp
        empresa = session.query(Empresa).filter(
            Empresa.whatsapp_numero == phone
        ).first()

        if not empresa:
            print(f"[BOT API] ⚠️ Empresa não encontrada para o telefone {phone}")
            print(f"[BOT API]    Tentando buscar qualquer empresa ativa...")

            # Buscar primeira empresa ativa (fallback)
            empresa = session.query(Empresa).filter(
                Empresa.bot_ativo == True
            ).first()

            if not empresa:
                print(f"[BOT API] ❌ Nenhuma empresa ativa encontrada")
                return jsonify({'error': 'Empresa não encontrada'}), 404

        print(f"[BOT API] ✅ Empresa encontrada: {empresa.nome} (ID: {empresa.id})")

        # Buscar configuração do bot
        config = session.query(ConfiguracaoBot).filter(
            ConfiguracaoBot.empresa_id == empresa.id
        ).first()

        if not config:
            print(f"[BOT API] ⚠️ Configuração não encontrada, criando padrão...")
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

        print(f"[BOT API] ✅ Configuração carregada")
        print(f"[BOT API]    - Auto resposta: {config.auto_resposta_ativa}")
        print(f"[BOT API]    - Enviar áudio: {config.enviar_audio}")
        print(f"[BOT API] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")

        return jsonify({
            'success': True,
            'empresa_id': empresa.id,
            'empresa_nome': empresa.nome,
            'whatsapp_numero': empresa.whatsapp_numero,
            'bot_ativo': empresa.bot_ativo,
            'config': {
                'descricao_empresa': config.descricao_empresa,
                'produtos_servicos': config.produtos_servicos,
                'publico_alvo': config.publico_alvo,
                'mensagem_boas_vindas': config.mensagem_boas_vindas,
                'mensagem_ausencia': config.mensagem_ausencia,
                'auto_resposta_ativa': config.auto_resposta_ativa,
                'enviar_audio': config.enviar_audio,
                'usar_elevenlabs': config.usar_elevenlabs,
                'tempo_resposta_segundos': config.tempo_resposta_segundos,
                'openai_api_key': config.openai_api_key,
                'openai_model': config.openai_model,
                'elevenlabs_api_key': config.elevenlabs_api_key,
                'elevenlabs_voice_id': config.elevenlabs_voice_id,
                'elevenlabs_agent_id': config.elevenlabs_agent_id,
                'modulo_fipe_ativo': config.modulo_fipe_ativo,
                'modulo_financiamento_ativo': config.modulo_financiamento_ativo
            }
        })

    except Exception as e:
        print(f"[BOT API] ❌ Erro ao buscar config: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@bot_bp.route('/conversas', methods=['POST'])
def salvar_conversa():
    """
    Cria ou atualiza uma conversa
    POST /api/bot/conversas
    """
    data = request.json
    empresa_id = data.get('empresa_id')
    telefone = data.get('telefone')

    print(f"[BOT API] 💬 Salvando conversa - Empresa: {empresa_id}, Telefone: {telefone}")

    if not empresa_id or not telefone:
        return jsonify({'error': 'empresa_id e telefone são obrigatórios'}), 400

    session = db_manager.get_session()
    try:
        # Buscar ou criar conversa
        conversa = session.query(Conversa).filter(
            Conversa.empresa_id == empresa_id,
            Conversa.telefone == telefone,
            Conversa.ativa == True
        ).first()

        if not conversa:
            # Buscar lead associado
            lead = session.query(Lead).filter(
                Lead.empresa_id == empresa_id,
                Lead.telefone == telefone
            ).first()

            conversa = Conversa(
                empresa_id=empresa_id,
                lead_id=lead.id if lead else None,
                telefone=telefone,
                nome_contato=data.get('nome_contato'),
                ativa=True,
                bot_ativo=True
            )
            session.add(conversa)
            print(f"[BOT API]    ✅ Nova conversa criada")
        else:
            # Atualizar conversa existente
            if data.get('nome_contato'):
                conversa.nome_contato = data.get('nome_contato')
            print(f"[BOT API]    ✅ Conversa atualizada (ID: {conversa.id})")

        session.commit()

        return jsonify({
            'success': True,
            'conversa_id': conversa.id,
            'message': 'Conversa salva com sucesso'
        })

    except Exception as e:
        session.rollback()
        print(f"[BOT API] ❌ Erro ao salvar conversa: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@bot_bp.route('/mensagens', methods=['POST'])
def salvar_mensagem():
    """
    Salva uma mensagem no banco
    POST /api/bot/mensagens
    """
    data = request.json
    conversa_id = data.get('conversa_id')

    print(f"[BOT API] 💾 Salvando mensagem - Conversa ID: {conversa_id}")

    if not conversa_id:
        return jsonify({'error': 'conversa_id é obrigatório'}), 400

    session = db_manager.get_session()
    try:
        mensagem = Mensagem(
            conversa_id=conversa_id,
            tipo=data.get('tipo', 'texto'),
            conteudo=data.get('conteudo'),
            arquivo_url=data.get('arquivo_url'),
            enviada_por_bot=data.get('enviada_por_bot', False),
            whatsapp_id=data.get('whatsapp_id')
        )

        session.add(mensagem)

        # Atualizar contador da conversa
        conversa = session.query(Conversa).get(conversa_id)
        if conversa:
            conversa.total_mensagens += 1
            if data.get('enviada_por_bot'):
                conversa.mensagens_enviadas += 1
            else:
                conversa.mensagens_recebidas += 1

        session.commit()

        print(f"[BOT API]    ✅ Mensagem salva (ID: {mensagem.id})")

        return jsonify({
            'success': True,
            'mensagem_id': mensagem.id,
            'message': 'Mensagem salva com sucesso'
        })

    except Exception as e:
        session.rollback()
        print(f"[BOT API] ❌ Erro ao salvar mensagem: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@bot_bp.route('/leads', methods=['POST'])
def salvar_lead():
    """
    Cria ou atualiza um lead
    POST /api/bot/leads
    """
    data = request.json
    empresa_id = data.get('empresa_id')
    telefone = data.get('telefone')

    print(f"[BOT API] 👤 Salvando lead - Empresa: {empresa_id}, Telefone: {telefone}")

    if not empresa_id or not telefone:
        return jsonify({'error': 'empresa_id e telefone são obrigatórios'}), 400

    session = db_manager.get_session()
    try:
        # Buscar ou criar lead
        lead = session.query(Lead).filter(
            Lead.empresa_id == empresa_id,
            Lead.telefone == telefone
        ).first()

        if not lead:
            lead = Lead(
                empresa_id=empresa_id,
                telefone=telefone,
                nome=data.get('nome'),
                origem='whatsapp',
                status='novo',
                temperatura='frio'
            )
            session.add(lead)
            print(f"[BOT API]    ✅ Novo lead criado")
        else:
            # Atualizar dados do lead
            if data.get('nome'):
                lead.nome = data.get('nome')
            if data.get('email'):
                lead.email = data.get('email')
            if data.get('interesse'):
                lead.interesse = data.get('interesse')
            print(f"[BOT API]    ✅ Lead atualizado (ID: {lead.id})")

        session.commit()

        return jsonify({
            'success': True,
            'lead_id': lead.id,
            'message': 'Lead salvo com sucesso'
        })

    except Exception as e:
        session.rollback()
        print(f"[BOT API] ❌ Erro ao salvar lead: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@bot_bp.route('/status', methods=['POST'])
def atualizar_status():
    """
    Atualiza status do WhatsApp da empresa
    POST /api/bot/status
    """
    data = request.json
    empresa_id = data.get('empresa_id')
    conectado = data.get('whatsapp_conectado', False)

    print(f"[BOT API] 🔄 Atualizando status - Empresa: {empresa_id}, Conectado: {conectado}")

    if not empresa_id:
        return jsonify({'error': 'empresa_id é obrigatório'}), 400

    session = db_manager.get_session()
    try:
        empresa = session.query(Empresa).get(empresa_id)
        if not empresa:
            return jsonify({'error': 'Empresa não encontrada'}), 404

        empresa.whatsapp_conectado = conectado
        session.commit()

        print(f"[BOT API]    ✅ Status atualizado")

        return jsonify({
            'success': True,
            'message': 'Status atualizado com sucesso'
        })

    except Exception as e:
        session.rollback()
        print(f"[BOT API] ❌ Erro ao atualizar status: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


# ==================== DEBUG ====================
print('\n╔════════════════════════════════════════════════════════════╗')
print('║         BOT API ROUTES - MÓDULO CARREGADO                 ║')
print('╚════════════════════════════════════════════════════════════╝')
print('[BOT API] Rotas disponíveis:')
print('[BOT API]   GET  /api/bot/health')
print('[BOT API]   GET  /api/bot/config?phone=NUMERO')
print('[BOT API]   POST /api/bot/conversas')
print('[BOT API]   POST /api/bot/mensagens')
print('[BOT API]   POST /api/bot/leads')
print('[BOT API]   POST /api/bot/status')
print('═══════════════════════════════════════════════════════════\n')
