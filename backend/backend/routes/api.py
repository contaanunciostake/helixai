"""API REST Endpoints"""
from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent.parent))
from database.models import Lead, Conversa, Campanha, Empresa
from backend import db_manager

bp = Blueprint('api', __name__, url_prefix='/api')

@bp.route('/stats')
@login_required
def stats():
    """API: Estatísticas gerais"""
    session = db_manager.get_session()
    try:
        total_leads = session.query(Lead).filter_by(empresa_id=current_user.empresa_id).count()
        total_conversas = session.query(Conversa).filter_by(empresa_id=current_user.empresa_id).count()
        return jsonify({
            'total_leads': total_leads,
            'total_conversas': total_conversas
        })
    finally:
        session.close()

@bp.route('/leads')
@login_required
def api_leads():
    """API: Lista de leads"""
    session = db_manager.get_session()
    try:
        leads = session.query(Lead).filter_by(empresa_id=current_user.empresa_id).limit(100).all()
        resultado = []
        for lead in leads:
            resultado.append({
                'id': lead.id,
                'nome': lead.nome,
                'telefone': lead.telefone,
                'status': lead.status.value,
                'temperatura': lead.temperatura.value
            })
        return jsonify(resultado)
    finally:
        session.close()

@bp.route('/whatsapp/status')
@login_required
def whatsapp_status():
    """API: Status WhatsApp"""
    # TODO: Integrar com bot engine
    return jsonify({'connected': False, 'message': 'Bot engine not connected'})


@bp.route('/empresa/nicho')
def empresa_nicho():
    """API: Busca nicho da empresa logada"""
    session = db_manager.get_session()
    try:
        # Tentar obter empresa_id do usuário autenticado ou usar ID fixo
        if current_user.is_authenticated:
            empresa_id = current_user.empresa_id
        else:
            empresa_id = 1  # ID fixo para desenvolvimento (CRM Cliente)

        empresa = session.query(Empresa).filter_by(id=empresa_id).first()

        if not empresa:
            return jsonify({'error': 'Empresa não encontrada'}), 404

        return jsonify({
            'nicho': empresa.nicho.value if empresa.nicho else None,
            'nome': empresa.nome
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@bp.route('/empresa/info')
def empresa_info():
    """API: Informações completas da empresa incluindo status do bot"""
    import requests
    session = db_manager.get_session()

    try:
        # Tentar obter empresa_id do usuário autenticado ou usar ID fixo
        if current_user.is_authenticated:
            empresa_id = current_user.empresa_id
        else:
            empresa_id = 1  # ID fixo para desenvolvimento (CRM Cliente)

        empresa = session.query(Empresa).filter_by(id=empresa_id).first()

        if not empresa:
            return jsonify({'error': 'Empresa não encontrada'}), 404

        # Verificar status real do WhatsApp Service
        whatsapp_status = 'disconnected'
        bot_ready = False

        try:
            # Verificar se whatsapp_service_stable está rodando
            resp = requests.get('http://localhost:3001/api/session/status',
                              params={'empresaId': empresa.id},
                              timeout=2)
            if resp.status_code == 200:
                data = resp.json()
                if data.get('connected'):
                    whatsapp_status = 'connected'
                elif data.get('qr'):
                    whatsapp_status = 'qr_code'
                else:
                    whatsapp_status = 'disconnected'
        except:
            whatsapp_status = 'disconnected'

        # Verificar se bot AIra Auto está pronto
        try:
            if empresa.nicho and empresa.nicho.value == 'veiculos':
                bot_resp = requests.get('http://localhost:4000/health', timeout=2)
                if bot_resp.status_code == 200:
                    bot_data = bot_resp.json()
                    bot_ready = bot_data.get('bot_pronto', False)
        except:
            bot_ready = False

        return jsonify({
            'id': empresa.id,
            'nome': empresa.nome,
            'nicho': empresa.nicho.value if empresa.nicho else None,
            'whatsapp_conectado': empresa.whatsapp_conectado,
            'whatsapp_numero': empresa.whatsapp_numero,
            'whatsapp_status': whatsapp_status,
            'bot_ativo': empresa.bot_ativo,
            'bot_ready': bot_ready
        })
    except Exception as e:
        print(f"[ERRO] /api/empresa/info: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@bp.route('/empresa/bot/toggle', methods=['POST'])
def toggle_bot():
    """API: Ativar/Desativar bot da empresa"""
    session = db_manager.get_session()

    try:
        # Tentar obter empresa_id do usuário autenticado ou usar ID fixo
        if current_user.is_authenticated:
            empresa_id = current_user.empresa_id
        else:
            empresa_id = 1  # ID fixo para desenvolvimento (CRM Cliente)

        empresa = session.query(Empresa).filter_by(id=empresa_id).first()

        if not empresa:
            return jsonify({'error': 'Empresa não encontrada'}), 404

        # Alternar estado do bot
        empresa.bot_ativo = not empresa.bot_ativo
        session.commit()

        print(f"[API] Bot da empresa {empresa.nome} alterado para: {'ATIVO' if empresa.bot_ativo else 'INATIVO'}")

        return jsonify({
            'success': True,
            'bot_ativo': empresa.bot_ativo,
            'message': f'Bot {"ativado" if empresa.bot_ativo else "desativado"} com sucesso!'
        })
    except Exception as e:
        session.rollback()
        print(f"[ERRO] /api/empresa/bot/toggle: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@bp.route('/docs')
def docs():
    """Documentação da API"""
    return jsonify({
        'version': '1.0.0',
        'endpoints': {
            '/api/stats': 'GET - Estatísticas gerais',
            '/api/leads': 'GET - Lista de leads',
            '/api/whatsapp/status': 'GET - Status WhatsApp',
            '/api/empresa/nicho': 'GET - Nicho da empresa',
            '/api/empresa/info': 'GET - Informações da empresa + bot'
        }
    })
