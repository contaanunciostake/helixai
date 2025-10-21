"""
Rotas de Autenticação
"""

from flask import Blueprint, render_template, redirect, url_for, request, flash
from flask_login import login_user, logout_user, login_required, current_user
from datetime import datetime
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent.parent))

from database.models import Usuario, Empresa, ConfiguracaoBot, TipoUsuario, PlanoAssinatura
from backend import db_manager

bp = Blueprint('auth', __name__)


@bp.route('/login', methods=['GET', 'POST'])
def login():
    """Página de login"""
    if current_user.is_authenticated:
        return redirect(url_for('dashboard.index'))

    if request.method == 'POST':
        email = request.form.get('email')
        senha = request.form.get('senha')

        session = db_manager.get_session()
        try:
            usuario = session.query(Usuario).filter_by(email=email).first()

            if usuario and usuario.check_senha(senha):
                if not usuario.ativo:
                    flash('Sua conta está desativada. Entre em contato com o suporte.', 'danger')
                    return redirect(url_for('auth.login'))

                # Atualizar último acesso
                usuario.ultimo_acesso = datetime.utcnow()
                session.commit()

                login_user(usuario)
                flash(f'Bem-vindo, {usuario.nome}!', 'success')

                next_page = request.args.get('next')

                # Redirecionar admin para painel admin
                if usuario.tipo == TipoUsuario.SUPER_ADMIN:
                    return redirect(next_page or url_for('admin.dashboard'))

                return redirect(next_page or url_for('dashboard.index'))
            else:
                flash('Email ou senha incorretos.', 'danger')

        except Exception as e:
            flash(f'Erro ao fazer login: {str(e)}', 'danger')
        finally:
            session.close()

    return render_template('auth/login.html')


@bp.route('/logout')
@login_required
def logout():
    """Logout do usuário"""
    logout_user()
    flash('Você saiu do sistema.', 'info')
    return redirect(url_for('auth.login'))


@bp.route('/register', methods=['GET', 'POST'])
def register():
    """Registro de novo usuário (self-service)"""
    if current_user.is_authenticated:
        return redirect(url_for('dashboard.index'))

    if request.method == 'POST':
        nome = request.form.get('nome')
        email = request.form.get('email')
        senha = request.form.get('senha')
        nome_empresa = request.form.get('nome_empresa')
        telefone = request.form.get('telefone')

        session = db_manager.get_session()
        try:
            # Verificar se email já existe
            if session.query(Usuario).filter_by(email=email).first():
                flash('Este email já está cadastrado.', 'danger')
                return redirect(url_for('auth.register'))

            # Criar empresa
            empresa = Empresa(
                nome=nome_empresa,
                email=email,
                telefone=telefone,
                plano=PlanoAssinatura.GRATUITO,
                plano_ativo=True
            )
            session.add(empresa)
            session.flush()

            # Criar usuário admin da empresa
            usuario = Usuario(
                nome=nome,
                email=email,
                telefone=telefone,
                empresa_id=empresa.id,
                tipo=TipoUsuario.ADMIN_EMPRESA
            )
            usuario.set_senha(senha)
            session.add(usuario)

            # Criar configuração padrão
            config = ConfiguracaoBot(
                empresa_id=empresa.id,
                mensagem_boas_vindas='Olá! Como posso ajudá-lo hoje?',
                auto_resposta_ativa=False
            )
            session.add(config)

            session.commit()

            flash('Conta criada com sucesso! Faça login para continuar.', 'success')
            return redirect(url_for('auth.login'))

        except Exception as e:
            session.rollback()
            flash(f'Erro ao criar conta: {str(e)}', 'danger')
        finally:
            session.close()

    return render_template('auth/register.html')


@bp.route('/forgot-password', methods=['GET', 'POST'])
def forgot_password():
    """Recuperação de senha"""
    if request.method == 'POST':
        email = request.form.get('email')
        # TODO: Implementar envio de email
        flash('Instruções de recuperação foram enviadas para seu email.', 'info')
        return redirect(url_for('auth.login'))

    return render_template('auth/forgot_password.html')
