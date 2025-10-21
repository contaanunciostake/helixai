"""Rotas de Conversas"""
from flask import Blueprint, render_template, request, jsonify, redirect, url_for, flash
from flask_login import login_required, current_user
from sqlalchemy import desc, or_, func
from datetime import datetime
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent.parent))
from database.models import Conversa, Mensagem, Lead
from backend import db_manager

bp = Blueprint('conversas', __name__, url_prefix='/conversas')

@bp.route('/')
@login_required
def index():
    session = db_manager.get_session()
    try:
        # Filtros
        busca = request.args.get('busca', '')
        status_filtro = request.args.get('status', '')

        # Query base
        query = session.query(Conversa).filter_by(
            empresa_id=current_user.empresa_id
        )

        # Aplicar filtros
        if busca:
            query = query.join(Lead).filter(
                or_(
                    Lead.nome.ilike(f'%{busca}%'),
                    Lead.telefone.ilike(f'%{busca}%'),
                    Conversa.telefone.ilike(f'%{busca}%')
                )
            )

        if status_filtro == 'ativa':
            query = query.filter(Conversa.ativa == True)
        elif status_filtro == 'arquivada':
            query = query.filter(Conversa.ativa == False)

        conversas_list = query.order_by(desc(Conversa.ultima_mensagem)).all()

        # Estatísticas
        total_conversas = session.query(Conversa).filter_by(
            empresa_id=current_user.empresa_id
        ).count()

        # Contar conversas com mensagens não lidas (mensagens recebidas não lidas)
        conversas_nao_lidas = session.query(Conversa.id).filter(
            Conversa.empresa_id == current_user.empresa_id
        ).join(Mensagem).filter(
            Mensagem.lida == False,
            Mensagem.enviada_por_bot == False
        ).distinct().count()

        conversas_ativas = session.query(Conversa).filter_by(
            empresa_id=current_user.empresa_id,
            ativa=True
        ).count()

        return render_template('conversas/index.html',
                             conversas=conversas_list,
                             total_conversas=total_conversas,
                             conversas_nao_lidas=conversas_nao_lidas,
                             conversas_ativas=conversas_ativas)
    finally:
        session.close()

@bp.route('/<int:conversa_id>')
@login_required
def detalhe(conversa_id):
    session = db_manager.get_session()
    try:
        conversa = session.query(Conversa).filter_by(
            id=conversa_id,
            empresa_id=current_user.empresa_id
        ).first()

        if not conversa:
            flash('Conversa não encontrada.', 'danger')
            return redirect(url_for('conversas.index'))

        # Marcar mensagens recebidas como lidas
        session.query(Mensagem).filter_by(
            conversa_id=conversa_id,
            enviada_por_bot=False,
            lida=False
        ).update({'lida': True, 'lida_em': datetime.utcnow()})
        session.commit()

        # Buscar mensagens
        mensagens = session.query(Mensagem).filter_by(
            conversa_id=conversa_id
        ).order_by(Mensagem.enviada_em).all()

        return render_template('conversas/detalhe.html',
                             conversa=conversa,
                             mensagens=mensagens)
    finally:
        session.close()

@bp.route('/api/<int:conversa_id>/marcar_lida', methods=['POST'])
@login_required
def api_marcar_lida(conversa_id):
    """API para marcar conversa como lida (marca todas mensagens recebidas como lidas)"""
    session = db_manager.get_session()
    try:
        conversa = session.query(Conversa).filter_by(
            id=conversa_id,
            empresa_id=current_user.empresa_id
        ).first()

        if not conversa:
            return jsonify({'success': False, 'error': 'Conversa não encontrada'}), 404

        # Marcar todas mensagens recebidas como lidas
        session.query(Mensagem).filter_by(
            conversa_id=conversa_id,
            enviada_por_bot=False,
            lida=False
        ).update({'lida': True, 'lida_em': datetime.utcnow()})
        session.commit()

        return jsonify({'success': True, 'message': 'Conversa marcada como lida'})
    except Exception as e:
        session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()

@bp.route('/api/<int:conversa_id>/arquivar', methods=['POST'])
@login_required
def api_arquivar(conversa_id):
    """API para arquivar conversa"""
    session = db_manager.get_session()
    try:
        conversa = session.query(Conversa).filter_by(
            id=conversa_id,
            empresa_id=current_user.empresa_id
        ).first()

        if not conversa:
            return jsonify({'success': False, 'error': 'Conversa não encontrada'}), 404

        conversa.ativa = False
        session.commit()

        return jsonify({'success': True, 'message': 'Conversa arquivada'})
    except Exception as e:
        session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()
