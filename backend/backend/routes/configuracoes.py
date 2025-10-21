"""
Rotas de Configurações - VendeAI
Gerenciamento de configurações da empresa e do bot
"""

from flask import Blueprint, render_template, request, jsonify, flash, redirect, url_for
from flask_login import login_required, current_user
from datetime import datetime
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent.parent))
from database.models import Empresa, ConfiguracaoBot, Usuario, PlanoAssinatura
from backend import db_manager

configuracoes_bp = Blueprint('configuracoes', __name__, url_prefix='/configuracoes')


@configuracoes_bp.route('/')
@login_required
def index():
    """Página principal de configurações"""
    session = db_manager.get_session()

    try:
        # Buscar empresa do usuário
        empresa = session.query(Empresa).filter_by(
            id=current_user.empresa_id
        ).first()

        if not empresa:
            flash('Empresa não encontrada.', 'danger')
            return redirect(url_for('dashboard.index'))

        # Buscar configuração do bot (criar se não existir)
        config_bot = session.query(ConfiguracaoBot).filter_by(
            empresa_id=empresa.id
        ).first()

        if not config_bot:
            config_bot = ConfiguracaoBot(empresa_id=empresa.id)
            session.add(config_bot)
            session.commit()

        # Buscar usuários da empresa
        usuarios = session.query(Usuario).filter_by(
            empresa_id=empresa.id,
            ativo=True
        ).all()

        return render_template('configuracoes/index.html',
                             empresa=empresa,
                             config_bot=config_bot,
                             usuarios=usuarios,
                             planos=PlanoAssinatura)

    except Exception as e:
        flash(f'Erro ao carregar configurações: {str(e)}', 'danger')
        return redirect(url_for('dashboard.index'))
    finally:
        session.close()


@configuracoes_bp.route('/api/empresa', methods=['PUT'])
@login_required
def api_atualizar_empresa():
    """API para atualizar dados da empresa"""
    session = db_manager.get_session()

    try:
        data = request.get_json()

        empresa = session.query(Empresa).filter_by(
            id=current_user.empresa_id
        ).first()

        if not empresa:
            return jsonify({'success': False, 'error': 'Empresa não encontrada'}), 404

        # Atualizar campos permitidos
        campos_permitidos = [
            'nome', 'nome_fantasia', 'cnpj', 'telefone', 'email', 'website',
            'endereco', 'cidade', 'estado', 'cep'
        ]

        for campo in campos_permitidos:
            if campo in data:
                setattr(empresa, campo, data[campo])

        empresa.atualizado_em = datetime.utcnow()
        session.commit()

        return jsonify({
            'success': True,
            'message': 'Dados da empresa atualizados com sucesso!'
        })

    except Exception as e:
        session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@configuracoes_bp.route('/api/bot', methods=['PUT'])
@login_required
def api_atualizar_bot():
    """API para atualizar configurações do bot"""
    session = db_manager.get_session()

    try:
        data = request.get_json()

        config_bot = session.query(ConfiguracaoBot).filter_by(
            empresa_id=current_user.empresa_id
        ).first()

        if not config_bot:
            config_bot = ConfiguracaoBot(empresa_id=current_user.empresa_id)
            session.add(config_bot)

        # Atualizar campos permitidos
        campos_permitidos = [
            'descricao_empresa', 'produtos_servicos', 'publico_alvo', 'diferenciais',
            'horario_atendimento', 'prompt_sistema', 'tom_conversa',
            'mensagem_boas_vindas', 'mensagem_ausencia', 'mensagem_encerramento',
            'auto_resposta_ativa', 'enviar_audio', 'usar_elevenlabs',
            'tempo_resposta_segundos', 'max_tentativas_contato', 'intervalo_entre_mensagens',
            'openai_api_key', 'openai_model', 'groq_api_key',
            'elevenlabs_api_key', 'elevenlabs_voice_id', 'elevenlabs_agent_id',
            'modulo_fipe_ativo', 'modulo_financiamento_ativo', 'modulo_agendamento_ativo'
        ]

        for campo in campos_permitidos:
            if campo in data:
                setattr(config_bot, campo, data[campo])

        config_bot.atualizado_em = datetime.utcnow()
        session.commit()

        return jsonify({
            'success': True,
            'message': 'Configurações do bot atualizadas com sucesso!'
        })

    except Exception as e:
        session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@configuracoes_bp.route('/api/usuario', methods=['POST'])
@login_required
def api_criar_usuario():
    """API para criar novo usuário"""
    session = db_manager.get_session()

    try:
        data = request.get_json()

        # Verificar limites do plano
        empresa = session.query(Empresa).filter_by(
            id=current_user.empresa_id
        ).first()

        total_usuarios = session.query(Usuario).filter_by(
            empresa_id=empresa.id,
            ativo=True
        ).count()

        if total_usuarios >= empresa.limite_usuarios:
            return jsonify({
                'success': False,
                'error': f'Limite de usuários atingido ({empresa.limite_usuarios}). Upgrade seu plano.'
            }), 400

        # Verificar se email já existe
        usuario_existe = session.query(Usuario).filter_by(
            email=data['email']
        ).first()

        if usuario_existe:
            return jsonify({
                'success': False,
                'error': 'Email já cadastrado no sistema.'
            }), 400

        # Criar usuário
        from database.models import TipoUsuario
        usuario = Usuario(
            nome=data['nome'],
            email=data['email'],
            tipo=TipoUsuario[data.get('tipo', 'USUARIO')],
            empresa_id=empresa.id,
            telefone=data.get('telefone')
        )
        usuario.set_senha(data['senha'])
        session.add(usuario)
        session.commit()

        return jsonify({
            'success': True,
            'message': 'Usuário criado com sucesso!'
        })

    except Exception as e:
        session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@configuracoes_bp.route('/api/usuario/<int:usuario_id>', methods=['PUT'])
@login_required
def api_atualizar_usuario(usuario_id):
    """API para atualizar usuário"""
    session = db_manager.get_session()

    try:
        data = request.get_json()

        usuario = session.query(Usuario).filter_by(
            id=usuario_id,
            empresa_id=current_user.empresa_id
        ).first()

        if not usuario:
            return jsonify({'success': False, 'error': 'Usuário não encontrado'}), 404

        # Atualizar campos
        if 'nome' in data:
            usuario.nome = data['nome']
        if 'telefone' in data:
            usuario.telefone = data['telefone']
        if 'tipo' in data:
            from database.models import TipoUsuario
            usuario.tipo = TipoUsuario[data['tipo']]
        if 'senha' in data and data['senha']:
            usuario.set_senha(data['senha'])

        session.commit()

        return jsonify({
            'success': True,
            'message': 'Usuário atualizado com sucesso!'
        })

    except Exception as e:
        session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@configuracoes_bp.route('/api/usuario/<int:usuario_id>', methods=['DELETE'])
@login_required
def api_deletar_usuario(usuario_id):
    """API para desativar usuário"""
    session = db_manager.get_session()

    try:
        usuario = session.query(Usuario).filter_by(
            id=usuario_id,
            empresa_id=current_user.empresa_id
        ).first()

        if not usuario:
            return jsonify({'success': False, 'error': 'Usuário não encontrado'}), 404

        if usuario.id == current_user.id:
            return jsonify({
                'success': False,
                'error': 'Você não pode desativar seu próprio usuário.'
            }), 400

        usuario.ativo = False
        session.commit()

        return jsonify({
            'success': True,
            'message': 'Usuário desativado com sucesso!'
        })

    except Exception as e:
        session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@configuracoes_bp.route('/api/alterar-senha', methods=['POST'])
@login_required
def api_alterar_senha():
    """API para alterar senha do usuário logado"""
    session = db_manager.get_session()

    try:
        data = request.get_json()

        usuario = session.query(Usuario).filter_by(
            id=current_user.id
        ).first()

        # Verificar senha atual
        if not usuario.check_senha(data['senha_atual']):
            return jsonify({
                'success': False,
                'error': 'Senha atual incorreta.'
            }), 400

        # Atualizar senha
        usuario.set_senha(data['senha_nova'])
        session.commit()

        return jsonify({
            'success': True,
            'message': 'Senha alterada com sucesso!'
        })

    except Exception as e:
        session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()
