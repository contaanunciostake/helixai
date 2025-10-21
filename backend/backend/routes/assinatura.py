"""
Rotas de Assinatura - VendeAI
Sistema de assinaturas com Mercado Pago
"""

from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent.parent))

from services.mercadopago_service import mp_service
from database.models import DatabaseManager
from sqlalchemy import text

assinatura_bp = Blueprint('assinatura', __name__, url_prefix='/api/assinatura')
db_manager = DatabaseManager('sqlite:///vendeai.db')


@assinatura_bp.route('/planos', methods=['GET'])
def listar_planos():
    """
    Lista todos os planos disponíveis

    Returns:
        JSON com lista de planos
    """
    session = db_manager.get_session()

    try:
        planos_query = text("SELECT * FROM planos WHERE ativo = 1 ORDER BY preco ASC")
        planos = session.execute(planos_query).fetchall()

        planos_list = []
        for plano in planos:
            planos_list.append({
                'id': plano.id,
                'nome': plano.nome,
                'descricao': plano.descricao,
                'preco': float(plano.preco),
                'periodicidade': plano.periodicidade,
                'limite_mensagens': plano.limite_mensagens,
                'limite_tokens': plano.limite_tokens,
                'recursos_extras': plano.recursos_extras
            })

        return jsonify({
            'success': True,
            'planos': planos_list
        })

    except Exception as e:
        print(f"[Assinatura] Erro ao listar planos: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@assinatura_bp.route('/assinar', methods=['POST', 'OPTIONS'])
def criar_assinatura():
    """
    Cria uma nova assinatura para o usuário

    Body JSON:
        plano_id: ID do plano escolhido
        usuario_id: ID do usuário (por enquanto passado no body, depois virá do JWT)

    Returns:
        JSON com init_point do Mercado Pago
    """
    # Handle OPTIONS request for CORS preflight
    if request.method == 'OPTIONS':
        return jsonify({'success': True}), 200

    try:
        data = request.get_json()
        plano_id = data.get('plano_id')
        usuario_id = data.get('usuario_id')  # TODO: Pegar do JWT token quando implementar auth

        if not plano_id or not usuario_id:
            return jsonify({
                'success': False,
                'error': 'plano_id e usuario_id são obrigatórios'
            }), 400

        # Criar preferência de pagamento no Mercado Pago
        result = mp_service.criar_preferencia_pagamento(usuario_id, plano_id)

        if not result.get('success'):
            return jsonify(result), 400

        return jsonify(result)

    except Exception as e:
        print(f"[Assinatura] Erro ao criar assinatura: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@assinatura_bp.route('/status', methods=['GET'])
def verificar_status():
    """
    Verifica status da assinatura do usuário e limites de uso

    Query Params:
        usuario_id: ID do usuário

    Returns:
        JSON com status e limites
    """
    try:
        usuario_id = request.args.get('usuario_id', type=int)

        if not usuario_id:
            return jsonify({
                'success': False,
                'error': 'usuario_id é obrigatório'
            }), 400

        # Verificar limites
        result = mp_service.verificar_limites_usuario(usuario_id)

        return jsonify({
            'success': True,
            **result
        })

    except Exception as e:
        print(f"[Assinatura] Erro ao verificar status: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@assinatura_bp.route('/cancelar', methods=['POST'])
def cancelar_assinatura():
    """
    Cancela a assinatura ativa do usuário

    Body JSON:
        usuario_id: ID do usuário

    Returns:
        JSON com resultado da operação
    """
    try:
        data = request.get_json()
        usuario_id = data.get('usuario_id')

        if not usuario_id:
            return jsonify({
                'success': False,
                'error': 'usuario_id é obrigatório'
            }), 400

        # Cancelar assinatura
        result = mp_service.cancelar_assinatura(usuario_id)

        return jsonify(result)

    except Exception as e:
        print(f"[Assinatura] Erro ao cancelar assinatura: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@assinatura_bp.route('/historico', methods=['GET'])
def historico_pagamentos():
    """
    Retorna histórico de pagamentos do usuário

    Query Params:
        usuario_id: ID do usuário

    Returns:
        JSON com lista de pagamentos
    """
    session = db_manager.get_session()

    try:
        usuario_id = request.args.get('usuario_id', type=int)

        if not usuario_id:
            return jsonify({
                'success': False,
                'error': 'usuario_id é obrigatório'
            }), 400

        # Buscar pagamentos
        pagamentos_query = text("""
            SELECT p.*, pl.nome as plano_nome
            FROM pagamentos p
            LEFT JOIN assinaturas a ON p.assinatura_id = a.id
            LEFT JOIN planos pl ON a.plano_id = pl.id
            WHERE p.usuario_id = :usuario_id
            ORDER BY p.criado_em DESC
            LIMIT 50
        """)

        pagamentos = session.execute(pagamentos_query, {'usuario_id': usuario_id}).fetchall()

        pagamentos_list = []
        for pag in pagamentos:
            pagamentos_list.append({
                'id': pag.id,
                'mercadopago_payment_id': pag.mercadopago_payment_id,
                'tipo': pag.tipo,
                'status': pag.status,
                'valor': float(pag.valor),
                'metodo_pagamento': pag.metodo_pagamento,
                'descricao': pag.descricao,
                'plano_nome': pag.plano_nome,
                'data_pagamento': pag.data_pagamento.isoformat() if pag.data_pagamento else None,
                'criado_em': pag.criado_em.isoformat() if pag.criado_em else None
            })

        return jsonify({
            'success': True,
            'pagamentos': pagamentos_list
        })

    except Exception as e:
        print(f"[Assinatura] Erro ao buscar histórico: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@assinatura_bp.route('/test', methods=['GET'])
def test_integracao():
    """
    Endpoint de teste da integração com Mercado Pago

    Returns:
        JSON com status do serviço
    """
    try:
        return jsonify({
            'success': True,
            'message': 'Integração Mercado Pago funcionando!',
            'public_key': mp_service.public_key,
            'access_token_configured': bool(mp_service.access_token)
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
