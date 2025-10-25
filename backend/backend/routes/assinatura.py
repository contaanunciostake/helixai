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


@assinatura_bp.route('/processar-pagamento', methods=['POST', 'OPTIONS'])
def processar_pagamento():
    """
    Processa pagamento (PIX ou Cartão) via Checkout Transparente

    Detecta automaticamente o método de pagamento e processa adequadamente

    Body JSON:
        plano_id: ID do plano escolhido
        usuario_email: Email do usuário
        payment_method_id: Método de pagamento (pix, credit_card, etc)
        payer: Dados do pagador (email, first_name, last_name, identification)
        token: Token do cartão (obrigatório para cartão, null para PIX)
        installments: Parcelas (padrão 1)
        issuer_id: Banco emissor (opcional para cartão, null para PIX)
        transaction_amount: Valor da transação

    Returns:
        JSON com resultado do pagamento (QR Code para PIX, status para cartão)
    """
    # Handle OPTIONS request for CORS preflight
    if request.method == 'OPTIONS':
        return jsonify({'success': True}), 200

    try:
        data = request.get_json()

        print(f"\n[PROCESSAR-PAGAMENTO] Requisição recebida")
        print(f"[PROCESSAR-PAGAMENTO] Dados: {data}")

        # Extrair dados
        plano_id = data.get('plano_id')
        email = data.get('usuario_email') or data.get('payer', {}).get('email')
        payment_method_id = data.get('payment_method_id')
        payer = data.get('payer', {})
        token = data.get('token')
        installments = data.get('installments', 1)
        issuer_id = data.get('issuer_id')

        print(f"[PROCESSAR-PAGAMENTO] Plano ID: {plano_id}")
        print(f"[PROCESSAR-PAGAMENTO] Email: {email}")
        print(f"[PROCESSAR-PAGAMENTO] Método: {payment_method_id}")

        if not plano_id or not email or not payment_method_id:
            return jsonify({
                'success': False,
                'error': 'plano_id, email e payment_method_id são obrigatórios'
            }), 400

        # Processar pagamento via serviço
        result = mp_service.processar_pagamento_direto(
            plano_id=plano_id,
            usuario_id=0,  # Temporário - será criado após aprovação
            email=email,
            payment_method_id=payment_method_id,
            token=token,
            installments=installments,
            issuer_id=issuer_id,
            payer=payer
        )

        if not result.get('success'):
            print(f"[PROCESSAR-PAGAMENTO] Erro: {result.get('error')}")
            return jsonify(result), 400

        print(f"[PROCESSAR-PAGAMENTO] Sucesso! Status: {result.get('status')}")
        print(f"[PROCESSAR-PAGAMENTO] Payment ID: {result.get('payment_id')}")

        return jsonify(result)

    except Exception as e:
        print(f"[PROCESSAR-PAGAMENTO] Exceção: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500


@assinatura_bp.route('/verificar-pagamento/<payment_id>', methods=['GET'])
def verificar_pagamento(payment_id):
    """
    Verifica o status de um pagamento (alias para /status/pagamento/<id>)

    Returns:
        JSON com status atual do pagamento
    """
    return verificar_status_pagamento(payment_id)


@assinatura_bp.route('/pagar/pix', methods=['POST', 'OPTIONS'])
def pagar_com_pix():
    """
    Cria um pagamento PIX via Checkout Transparente

    Body JSON:
        plano_id: ID do plano escolhido
        email: Email do pagador
        nome: Nome do pagador (opcional)
        cpf: CPF do pagador

    Returns:
        JSON com QR Code PIX e dados do pagamento
    """
    # Handle OPTIONS request for CORS preflight
    if request.method == 'OPTIONS':
        return jsonify({'success': True}), 200

    try:
        data = request.get_json()
        plano_id = data.get('plano_id')
        email = data.get('email')
        nome = data.get('nome', '')
        cpf = data.get('cpf', '')

        print(f"\n[PIX] Criando pagamento PIX...")
        print(f"[PIX] Plano ID: {plano_id}")
        print(f"[PIX] Email: {email}")

        if not plano_id or not email:
            return jsonify({
                'success': False,
                'error': 'plano_id e email são obrigatórios'
            }), 400

        # Processar pagamento PIX
        result = mp_service.processar_pagamento_direto(
            plano_id=plano_id,
            usuario_id=0,  # Temporário - será criado após aprovação
            email=email,
            payment_method_id='pix',
            token=None,  # PIX não precisa de token de cartão
            installments=1,
            issuer_id=None,
            payer={
                'email': email,
                'first_name': nome.split()[0] if nome else email.split('@')[0],
                'last_name': nome.split()[-1] if nome and len(nome.split()) > 1 else '',
                'identification': {
                    'type': 'CPF',
                    'number': cpf
                } if cpf else {}
            }
        )

        if not result.get('success'):
            print(f"[PIX] Erro ao criar pagamento: {result.get('error')}")
            return jsonify(result), 400

        print(f"[PIX] Pagamento criado com sucesso!")
        print(f"[PIX] Status: {result.get('status')}")
        print(f"[PIX] Payment ID: {result.get('payment_id')}")

        return jsonify(result)

    except Exception as e:
        print(f"[PIX] Erro: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500


@assinatura_bp.route('/status/pagamento/<payment_id>', methods=['GET'])
def verificar_status_pagamento(payment_id):
    """
    Verifica o status de um pagamento específico

    Returns:
        JSON com status atual do pagamento
    """
    try:
        print(f"\n[STATUS] Verificando status do pagamento: {payment_id}")

        if not mp_service.sdk:
            return jsonify({
                'success': False,
                'error': 'SDK do Mercado Pago não disponível'
            }), 503

        # Buscar informações do pagamento na API do Mercado Pago
        payment_info = mp_service.sdk.payment().get(payment_id)
        payment = payment_info.get('response', {})

        if not payment:
            return jsonify({
                'success': False,
                'error': 'Pagamento não encontrado'
            }), 404

        print(f"[STATUS] Payment ID: {payment_id}")
        print(f"[STATUS] Status: {payment.get('status')}")
        print(f"[STATUS] Status Detail: {payment.get('status_detail')}")

        return jsonify({
            'success': True,
            'payment_id': payment_id,
            'status': payment.get('status'),
            'status_detail': payment.get('status_detail'),
            'transaction_amount': payment.get('transaction_amount'),
            'payment_method_id': payment.get('payment_method_id'),
            'date_created': payment.get('date_created'),
            'date_approved': payment.get('date_approved')
        })

    except Exception as e:
        print(f"[STATUS] Erro: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


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
