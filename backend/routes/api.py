"""API REST Endpoints"""
from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent.parent))
from database.models import Lead, Conversa, Campanha, Empresa, NichoEmpresa
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

# ==================== ENDPOINTS NICHO ====================

@bp.route('/empresa/info', methods=['GET'])
def get_empresa_info():
    """API: Obter informações da empresa incluindo nicho"""
    session = db_manager.get_session()
    try:
        # Tentar obter empresa_id do usuário autenticado ou do query param (para CRM Cliente)
        if current_user.is_authenticated:
            empresa_id = current_user.empresa_id
        else:
            # Para CRM Cliente sem autenticação, usar ID fixo (temporário)
            empresa_id = 1  # TODO: Implementar autenticação apropriada

        empresa = session.query(Empresa).get(empresa_id)

        if not empresa:
            return jsonify({'success': False, 'error': 'Empresa não encontrada'}), 404

        return jsonify({
            'success': True,
            'empresa': {
                'id': empresa.id,
                'nome': empresa.nome,
                'nome_fantasia': empresa.nome_fantasia,
                'email': empresa.email,
                'nicho': empresa.nicho.value if empresa.nicho else None,
                'plano': empresa.plano.value,
                'whatsapp_conectado': empresa.whatsapp_conectado,
                'bot_ativo': empresa.bot_ativo
            }
        })
    finally:
        session.close()

@bp.route('/empresa/nicho', methods=['GET'])
def get_empresa_nicho():
    """API: Obter nicho da empresa"""
    session = db_manager.get_session()
    try:
        # Tentar obter empresa_id do usuário autenticado ou do query param (para CRM Cliente)
        if current_user.is_authenticated:
            empresa_id = current_user.empresa_id
        else:
            # Para CRM Cliente sem autenticação, usar ID fixo (temporário)
            empresa_id = 1  # TODO: Implementar autenticação apropriada

        empresa = session.query(Empresa).get(empresa_id)

        if not empresa:
            return jsonify({'success': False, 'error': 'Empresa não encontrada'}), 404

        return jsonify({
            'success': True,
            'nicho': empresa.nicho.value if empresa.nicho else None
        })
    finally:
        session.close()

@bp.route('/empresa/nicho', methods=['POST'])
@login_required
def set_empresa_nicho():
    """API: Definir nicho da empresa"""
    session = db_manager.get_session()
    try:
        data = request.get_json()
        nicho = data.get('nicho')

        # Validar nicho
        if nicho not in ['veiculos', 'imoveis']:
            return jsonify({
                'success': False,
                'error': 'Nicho inválido. Use "veiculos" ou "imoveis"'
            }), 400

        # Atualizar empresa
        empresa = session.query(Empresa).get(current_user.empresa_id)

        if not empresa:
            return jsonify({'success': False, 'error': 'Empresa não encontrada'}), 404

        # Converter string para enum
        if nicho == 'veiculos':
            empresa.nicho = NichoEmpresa.VEICULOS
        elif nicho == 'imoveis':
            empresa.nicho = NichoEmpresa.IMOVEIS

        session.commit()

        return jsonify({
            'success': True,
            'message': f'Nicho definido como {nicho}',
            'nicho': empresa.nicho.value
        })
    except Exception as e:
        session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()

@bp.route('/empresa/bot/toggle', methods=['POST'])
def toggle_bot_ativo():
    """API: Alternar status do bot (ativar/desativar)"""
    session = db_manager.get_session()
    try:
        # Tentar obter empresa_id do usuário autenticado ou do query param (para CRM Cliente)
        if current_user.is_authenticated:
            empresa_id = current_user.empresa_id
        else:
            # Para CRM Cliente sem autenticação, usar ID fixo (temporário)
            empresa_id = 1  # TODO: Implementar autenticação apropriada

        empresa = session.query(Empresa).get(empresa_id)

        if not empresa:
            return jsonify({'success': False, 'error': 'Empresa não encontrada'}), 404

        # Alternar o estado
        empresa.bot_ativo = not empresa.bot_ativo
        session.commit()

        return jsonify({
            'success': True,
            'bot_ativo': empresa.bot_ativo,
            'message': f'Bot {"ativado" if empresa.bot_ativo else "desativado"} com sucesso'
        })

    except Exception as e:
        session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()

@bp.route('/empresa/register', methods=['POST'])
def register_empresa():
    """API: Registrar nova empresa com nicho"""
    session = db_manager.get_session()
    try:
        data = request.get_json()

        # Validar dados obrigatórios
        required_fields = ['nome', 'email', 'nicho', 'plano']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Campo obrigatório faltando: {field}'
                }), 400

        # Validar nicho
        nicho = data.get('nicho')
        if nicho not in ['veiculos', 'imoveis']:
            return jsonify({
                'success': False,
                'error': 'Nicho inválido. Use "veiculos" ou "imoveis"'
            }), 400

        # Verificar se email já existe
        empresa_existente = session.query(Empresa).filter_by(email=data['email']).first()
        if empresa_existente:
            return jsonify({
                'success': False,
                'error': 'Email já cadastrado'
            }), 400

        # Criar nova empresa
        nova_empresa = Empresa(
            nome=data['nome'],
            nome_fantasia=data.get('nome_fantasia', data['nome']),
            email=data['email'],
            telefone=data.get('telefone'),
            cnpj=data.get('cnpj'),
            nicho=NichoEmpresa.VEICULOS if nicho == 'veiculos' else NichoEmpresa.IMOVEIS,
            plano=data['plano']
        )

        session.add(nova_empresa)
        session.commit()

        return jsonify({
            'success': True,
            'message': 'Empresa registrada com sucesso',
            'empresa_id': nova_empresa.id,
            'nicho': nova_empresa.nicho.value
        }), 201

    except Exception as e:
        session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
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
            '/api/empresa/info': 'GET - Informações da empresa (requer autenticação)',
            '/api/empresa/nicho': 'GET - Obter nicho da empresa (requer autenticação)',
            '/api/empresa/nicho': 'POST - Definir nicho da empresa (requer autenticação)',
            '/api/empresa/register': 'POST - Registrar nova empresa com nicho'
        }
    })
