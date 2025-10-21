"""
Middleware de Validação de Assinatura
VendeAI - Controle de Acesso e Limites
"""

from functools import wraps
from flask import jsonify, request
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent.parent))

from services.mercadopago_service import mp_service


def subscription_required(f):
    """
    Decorator para proteger rotas que exigem assinatura ativa

    Verifica:
    - Se usuário tem assinatura ativa
    - Se não excedeu limites do plano

    Uso:
        @subscription_required
        def minha_rota():
            ...

    Returns:
        402 Payment Required se não tiver assinatura ou excedeu limites
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            # Pegar usuario_id dos query params ou body
            usuario_id = request.args.get('usuario_id', type=int)

            if not usuario_id:
                data = request.get_json() or {}
                usuario_id = data.get('usuario_id')

            if not usuario_id:
                return jsonify({
                    'success': False,
                    'error': 'usuario_id não fornecido',
                    'code': 'USER_ID_REQUIRED'
                }), 400

            # Verificar status da assinatura
            limites = mp_service.verificar_limites_usuario(usuario_id)

            # Se não tem assinatura
            if not limites.get('tem_assinatura'):
                return jsonify({
                    'success': False,
                    'error': 'Assinatura necessária',
                    'message': limites.get('mensagem', 'Você precisa assinar um plano para usar o sistema'),
                    'code': 'SUBSCRIPTION_REQUIRED',
                    'action': 'subscribe'
                }), 402  # Payment Required

            # Se excedeu limites
            if limites.get('excedeu_limites'):
                limite_type = 'mensagens' if limites.get('mensagens_excedidas') else 'tokens'

                return jsonify({
                    'success': False,
                    'error': 'Limite excedido',
                    'message': f'Você excedeu o limite de {limite_type} do seu plano',
                    'code': 'LIMIT_EXCEEDED',
                    'limites': limites.get('limites'),
                    'uso': limites.get('uso'),
                    'action': 'upgrade'
                }), 402  # Payment Required

            # Se tudo OK, executar a função original
            return f(*args, **kwargs)

        except Exception as e:
            print(f"[Subscription Middleware] Erro: {str(e)}")
            return jsonify({
                'success': False,
                'error': 'Erro ao verificar assinatura',
                'details': str(e)
            }), 500

    return decorated_function


def check_and_register_usage(mensagens=1, tokens=0):
    """
    Decorator para verificar limites E registrar uso automaticamente

    Args:
        mensagens: Número de mensagens que serão consumidas (default: 1)
        tokens: Número de tokens que serão consumidos (default: 0)

    Uso:
        @check_and_register_usage(mensagens=1, tokens=100)
        def processar_mensagem():
            ...
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                # Pegar usuario_id
                usuario_id = request.args.get('usuario_id', type=int)

                if not usuario_id:
                    data = request.get_json() or {}
                    usuario_id = data.get('usuario_id')

                if not usuario_id:
                    return jsonify({
                        'success': False,
                        'error': 'usuario_id não fornecido'
                    }), 400

                # Verificar limites ANTES de executar
                limites = mp_service.verificar_limites_usuario(usuario_id)

                if not limites.get('tem_assinatura'):
                    return jsonify({
                        'success': False,
                        'error': 'Assinatura necessária',
                        'code': 'SUBSCRIPTION_REQUIRED'
                    }), 402

                if limites.get('excedeu_limites'):
                    return jsonify({
                        'success': False,
                        'error': 'Limite excedido',
                        'code': 'LIMIT_EXCEEDED',
                        'limites': limites.get('limites'),
                        'uso': limites.get('uso')
                    }), 402

                # Executar a função original
                result = f(*args, **kwargs)

                # Registrar uso DEPOIS de executar com sucesso
                mp_service.registrar_uso(usuario_id, mensagens=mensagens, tokens=tokens)

                return result

            except Exception as e:
                print(f"[Usage Middleware] Erro: {str(e)}")
                return jsonify({
                    'success': False,
                    'error': str(e)
                }), 500

        return decorated_function
    return decorator


def get_subscription_info(usuario_id: int):
    """
    Helper function para obter informações de assinatura

    Args:
        usuario_id: ID do usuário

    Returns:
        dict com informações da assinatura
    """
    try:
        return mp_service.verificar_limites_usuario(usuario_id)
    except Exception as e:
        print(f"[Subscription Helper] Erro: {str(e)}")
        return {
            'tem_assinatura': False,
            'error': str(e)
        }
