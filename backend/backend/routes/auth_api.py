"""
Rotas de Autenticação API REST
Sistema de login com JWT para React frontend
"""

from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from datetime import datetime, timedelta
import jwt
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent.parent))

from database.models import Usuario, Empresa, DatabaseManager

# Importar app e db_manager do módulo backend
try:
    from backend import app, db_manager
except:
    # Fallback se não conseguir importar
    from flask import current_app as app
    db_manager = DatabaseManager('sqlite:///vendeai.db')

bp = Blueprint('auth_api', __name__, url_prefix='/api/auth')

print("[AUTH-API] Blueprint 'auth_api' criado")


@bp.route('/test', methods=['GET'])
def test_auth():
    """Endpoint de teste da autenticação"""
    return jsonify({
        'status': 'online',
        'service': 'HelixAI CRM Authentication API',
        'timestamp': datetime.utcnow().isoformat()
    }), 200


@bp.route('/login', methods=['POST', 'OPTIONS'])
def login():
    """
    Faz login do usuário com email e senha

    Body JSON:
        email: Email do usuário
        senha: Senha

    Returns:
        JSON: {success: bool, message: str, token: str, usuario: dict}
    """
    # Handle OPTIONS for CORS
    if request.method == 'OPTIONS':
        return jsonify({'success': True}), 200

    try:
        data = request.get_json()

        email = data.get('email', '').strip()
        senha = data.get('senha', '')

        # Validações
        if not email or '@' not in email:
            return jsonify({
                'success': False,
                'message': 'Email inválido'
            }), 400

        if not senha:
            return jsonify({
                'success': False,
                'message': 'Senha é obrigatória'
            }), 400

        session = db_manager.get_session()
        try:
            # Buscar usuário
            usuario = session.query(Usuario).filter_by(email=email).first()

            if not usuario:
                return jsonify({
                    'success': False,
                    'message': 'Email ou senha incorretos'
                }), 401

            # Verificar senha
            if not usuario.check_senha(senha):
                return jsonify({
                    'success': False,
                    'message': 'Email ou senha incorretos'
                }), 401

            # Verificar se usuário está ativo
            if not usuario.ativo:
                return jsonify({
                    'success': False,
                    'message': 'Sua conta está desativada. Entre em contato com o suporte.'
                }), 403

            # Atualizar último acesso
            usuario.ultimo_acesso = datetime.utcnow()
            session.commit()

            # Gerar token JWT
            token_payload = {
                'user_id': usuario.id,
                'email': usuario.email,
                'empresa_id': usuario.empresa_id,
                'exp': datetime.utcnow() + timedelta(days=7)  # Expira em 7 dias
            }

            token = jwt.encode(
                token_payload,
                app.config['SECRET_KEY'],
                algorithm='HS256'
            )

            # Buscar informações da empresa
            empresa = session.query(Empresa).get(usuario.empresa_id)

            # Retornar dados do usuário
            return jsonify({
                'success': True,
                'message': f'Bem-vindo, {usuario.nome}!',
                'token': token,
                'usuario': {
                    'id': usuario.id,
                    'nome': usuario.nome,
                    'email': usuario.email,
                    'telefone': usuario.telefone,
                    'tipo': usuario.tipo.value,
                    'empresa_id': usuario.empresa_id,
                    'empresa': {
                        'id': empresa.id,
                        'nome': empresa.nome,
                        'nicho': empresa.nicho.value if empresa.nicho else None,
                        'plano': empresa.plano.value if empresa.plano else None
                    } if empresa else None
                }
            }), 200

        finally:
            session.close()

    except Exception as e:
        print(f"[AUTH-API] Erro ao fazer login: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': f'Erro ao fazer login: {str(e)}'
        }), 500


@bp.route('/register', methods=['POST', 'OPTIONS'])
def register():
    """
    Registra um novo usuário

    Body JSON:
        email: Email do usuário
        nome: Nome do usuário
        senha: Senha
        empresa_nome: Nome da empresa (opcional)

    Returns:
        JSON: {success: bool, message: str, usuario: dict}
    """
    # Handle OPTIONS for CORS
    if request.method == 'OPTIONS':
        return jsonify({'success': True}), 200

    try:
        data = request.get_json()

        email = data.get('email', '').strip()
        nome = data.get('nome', '').strip()
        senha = data.get('senha', '')
        empresa_nome = data.get('empresa_nome', '').strip()

        # Validações
        if not email or '@' not in email:
            return jsonify({
                'success': False,
                'message': 'Email inválido'
            }), 400

        if not nome:
            return jsonify({
                'success': False,
                'message': 'Nome é obrigatório'
            }), 400

        if not senha or len(senha) < 8:
            return jsonify({
                'success': False,
                'message': 'Senha deve ter no mínimo 8 caracteres'
            }), 400

        session = db_manager.get_session()
        try:
            # Verificar se email já existe
            usuario_existente = session.query(Usuario).filter_by(email=email).first()
            if usuario_existente:
                return jsonify({
                    'success': False,
                    'message': 'Este email já está cadastrado'
                }), 400

            # Criar ou buscar empresa
            if empresa_nome:
                empresa = session.query(Empresa).filter_by(nome=empresa_nome).first()
                if not empresa:
                    from database.models import NichoEnum, PlanoEnum
                    empresa = Empresa(
                        nome=empresa_nome,
                        nicho=NichoEnum.VENDAS,
                        plano=PlanoEnum.BASIC
                    )
                    session.add(empresa)
                    session.flush()
            else:
                # Empresa padrão
                from database.models import NichoEnum, PlanoEnum
                empresa = Empresa(
                    nome=f"Empresa de {nome}",
                    nicho=NichoEnum.VENDAS,
                    plano=PlanoEnum.BASIC
                )
                session.add(empresa)
                session.flush()

            # Criar usuário
            from database.models import TipoUsuarioEnum
            usuario = Usuario(
                nome=nome,
                email=email,
                tipo=TipoUsuarioEnum.ADMIN,
                empresa_id=empresa.id,
                ativo=True
            )
            usuario.set_senha(senha)

            session.add(usuario)
            session.commit()

            return jsonify({
                'success': True,
                'message': 'Usuário criado com sucesso!',
                'usuario': {
                    'id': usuario.id,
                    'nome': usuario.nome,
                    'email': usuario.email,
                    'empresa_id': usuario.empresa_id
                }
            }), 201

        finally:
            session.close()

    except Exception as e:
        print(f"[AUTH-API] Erro ao registrar: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': f'Erro ao registrar: {str(e)}'
        }), 500


@bp.route('/definir-senha', methods=['POST', 'OPTIONS'])
@cross_origin(origins=['http://localhost:5177'], methods=['POST', 'OPTIONS'], allow_headers=['Content-Type', 'Authorization'], supports_credentials=True)
def definir_senha():
    """
    Define senha para usuário após pagamento

    Body JSON:
        email: Email do usuário
        senha: Nova senha
        confirmar_senha: Confirmação da senha
        token: Token de definição de senha

    Returns:
        JSON: {success: bool, message: str}
    """
    # Handle OPTIONS for CORS preflight
    if request.method == 'OPTIONS':
        response = jsonify({'success': True})
        response.headers.add('Access-Control-Allow-Origin', request.headers.get('Origin', '*'))
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        print(f"[AUTH-API] OPTIONS request from origin: {request.headers.get('Origin')}")
        return response, 200

    print(f"[AUTH-API] POST /definir-senha from origin: {request.headers.get('Origin')}")

    try:
        data = request.get_json()

        email = data.get('email', '').strip()
        senha = data.get('senha', '')
        confirmar_senha = data.get('confirmar_senha', '')
        token = data.get('token', '').strip()

        # Validações
        if not email or '@' not in email:
            return jsonify({
                'success': False,
                'message': 'Email inválido'
            }), 400

        if not senha or not confirmar_senha:
            return jsonify({
                'success': False,
                'message': 'Senha e confirmação são obrigatórias'
            }), 400

        if senha != confirmar_senha:
            return jsonify({
                'success': False,
                'message': 'As senhas não coincidem'
            }), 400

        if len(senha) < 8:
            return jsonify({
                'success': False,
                'message': 'Senha deve ter no mínimo 8 caracteres'
            }), 400

        session = db_manager.get_session()
        try:
            # Buscar usuário
            usuario = session.query(Usuario).filter_by(email=email).first()

            if not usuario:
                return jsonify({
                    'success': False,
                    'message': 'Usuário não encontrado'
                }), 404

            # Validar token (verificar se é o token de definição de senha)
            # TODO: Implementar validação de token mais robusta
            if not token or len(token) < 10:
                return jsonify({
                    'success': False,
                    'message': 'Token inválido'
                }), 400

            # Definir nova senha
            usuario.set_senha(senha)
            session.commit()

            print(f"[AUTH-API] Senha definida com sucesso para {email}")

            return jsonify({
                'success': True,
                'message': 'Senha definida com sucesso!'
            }), 200

        finally:
            session.close()

    except Exception as e:
        print(f"[AUTH-API] Erro ao definir senha: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': f'Erro ao definir senha: {str(e)}'
        }), 500


@bp.route('/verificar-token', methods=['POST', 'OPTIONS'])
def verificar_token():
    """
    Verifica se token JWT é válido

    Headers:
        Authorization: Bearer <token>

    Returns:
        JSON: {valido: bool, usuario: dict}
    """
    # Handle OPTIONS for CORS
    if request.method == 'OPTIONS':
        return jsonify({'success': True}), 200

    try:
        # Tentar pegar token do header Authorization
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
        else:
            # Tentar pegar do body
            data = request.get_json()
            token = data.get('token', '') if data else ''

        if not token:
            return jsonify({
                'valido': False,
                'message': 'Token não fornecido'
            }), 400

        # Verificar token
        try:
            payload = jwt.decode(
                token,
                app.config['SECRET_KEY'],
                algorithms=['HS256']
            )

            # Buscar dados atualizados do usuário
            session = db_manager.get_session()
            try:
                usuario = session.query(Usuario).get(payload['user_id'])

                if usuario and usuario.ativo:
                    return jsonify({
                        'valido': True,
                        'usuario': {
                            'id': usuario.id,
                            'email': usuario.email,
                            'nome': usuario.nome,
                            'empresa_id': usuario.empresa_id
                        }
                    }), 200
                else:
                    return jsonify({
                        'valido': False,
                        'message': 'Usuário não encontrado ou inativo'
                    }), 404
            finally:
                session.close()

        except jwt.ExpiredSignatureError:
            return jsonify({
                'valido': False,
                'message': 'Token expirado'
            }), 401
        except jwt.InvalidTokenError:
            return jsonify({
                'valido': False,
                'message': 'Token inválido'
            }), 401

    except Exception as e:
        print(f"[AUTH-API] Erro ao verificar token: {str(e)}")
        return jsonify({
            'valido': False,
            'message': f'Erro ao verificar token: {str(e)}'
        }), 500


print("[AUTH-API] Blueprint 'auth_api' criado")
print("[AUTH-API] [OK] Rotas registradas:")
print("[AUTH-API]   GET  /test")
print("[AUTH-API]   POST /login")
print("[AUTH-API]   POST /register")
print("[AUTH-API]   POST /definir-senha")
print("[AUTH-API]   POST /verificar-token")
