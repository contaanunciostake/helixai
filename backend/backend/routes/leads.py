"""Rotas de Leads"""
from flask import Blueprint, render_template, request, flash, redirect, url_for, jsonify
from flask_login import login_required, current_user
from sqlalchemy import desc, or_, func
from datetime import datetime
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent.parent))
from database.models import Lead, StatusLead, TemperaturaLead, Conversa, InteracaoLead, Mensagem
from backend import db_manager

bp = Blueprint('leads', __name__, url_prefix='/leads')

@bp.route('/')
@login_required
def index():
    session = db_manager.get_session()
    try:
        # Filtros
        busca = request.args.get('busca', '')
        status_filtro = request.args.get('status', '')
        temperatura_filtro = request.args.get('temperatura', '')

        # Query base
        query = session.query(Lead).filter_by(empresa_id=current_user.empresa_id)

        # Aplicar filtros
        if busca:
            query = query.filter(
                or_(
                    Lead.nome.ilike(f'%{busca}%'),
                    Lead.telefone.ilike(f'%{busca}%'),
                    Lead.email.ilike(f'%{busca}%'),
                    Lead.empresa_lead.ilike(f'%{busca}%')
                )
            )

        if status_filtro:
            try:
                status_enum = StatusLead[status_filtro.upper()]
                query = query.filter_by(status=status_enum)
            except KeyError:
                pass

        if temperatura_filtro:
            try:
                temp_enum = TemperaturaLead[temperatura_filtro.upper()]
                query = query.filter_by(temperatura=temp_enum)
            except KeyError:
                pass

        leads_list = query.order_by(desc(Lead.criado_em)).all()

        # Estatísticas
        total_leads = session.query(Lead).filter_by(empresa_id=current_user.empresa_id).count()
        leads_quentes = session.query(Lead).filter_by(
            empresa_id=current_user.empresa_id,
            temperatura=TemperaturaLead.QUENTE
        ).count()
        leads_convertidos = session.query(Lead).filter_by(
            empresa_id=current_user.empresa_id,
            vendido=True
        ).count()

        return render_template('leads/index.html',
                             leads=leads_list,
                             total_leads=total_leads,
                             leads_quentes=leads_quentes,
                             leads_convertidos=leads_convertidos)
    finally:
        session.close()

@bp.route('/<int:lead_id>')
@login_required
def detalhe(lead_id):
    session = db_manager.get_session()
    try:
        lead = session.query(Lead).filter_by(
            id=lead_id,
            empresa_id=current_user.empresa_id
        ).first()

        if not lead:
            flash('Lead não encontrado.', 'danger')
            return redirect(url_for('leads.index'))

        # Buscar conversas relacionadas
        conversas = session.query(Conversa).filter_by(
            lead_id=lead_id
        ).order_by(desc(Conversa.ultima_mensagem)).all()

        # Buscar interações
        interacoes = session.query(InteracaoLead).filter_by(
            lead_id=lead_id
        ).order_by(desc(InteracaoLead.criada_em)).all()

        return render_template('leads/detalhe.html',
                             lead=lead,
                             conversas=conversas,
                             interacoes=interacoes)
    finally:
        session.close()

@bp.route('/api/create', methods=['POST'])
@login_required
def api_create():
    """API para criar novo lead"""
    session = db_manager.get_session()
    try:
        data = request.get_json()

        # Validar dados obrigatórios
        if not data.get('telefone'):
            return jsonify({'success': False, 'error': 'Telefone é obrigatório'}), 400

        # Criar lead
        lead = Lead(
            empresa_id=current_user.empresa_id,
            nome=data.get('nome'),
            telefone=data.get('telefone'),
            email=data.get('email'),
            empresa_lead=data.get('empresa_lead'),
            cargo=data.get('cargo'),
            observacoes=data.get('observacoes'),
            status=StatusLead[data.get('status', 'NOVO').upper()],
            temperatura=TemperaturaLead[data.get('temperatura', 'FRIO').upper()],
            origem='MANUAL'
        )

        session.add(lead)
        session.commit()

        return jsonify({
            'success': True,
            'message': 'Lead criado com sucesso!',
            'lead_id': lead.id
        })
    except Exception as e:
        session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()

@bp.route('/api/<int:lead_id>/update', methods=['POST'])
@login_required
def api_update(lead_id):
    """API para atualizar lead"""
    session = db_manager.get_session()
    try:
        lead = session.query(Lead).filter_by(
            id=lead_id,
            empresa_id=current_user.empresa_id
        ).first()

        if not lead:
            return jsonify({'success': False, 'error': 'Lead não encontrado'}), 404

        data = request.get_json()

        # Atualizar campos
        if 'nome' in data:
            lead.nome = data['nome']
        if 'telefone' in data:
            lead.telefone = data['telefone']
        if 'email' in data:
            lead.email = data['email']
        if 'empresa_lead' in data:
            lead.empresa_lead = data['empresa_lead']
        if 'cargo' in data:
            lead.cargo = data['cargo']
        if 'observacoes' in data:
            lead.observacoes = data['observacoes']
        if 'status' in data:
            lead.status = StatusLead[data['status'].upper()]
        if 'temperatura' in data:
            lead.temperatura = TemperaturaLead[data['temperatura'].upper()]
        if 'vendido' in data:
            lead.vendido = data['vendido']

        # Atualizar timestamp de última interação
        lead.ultima_interacao = datetime.utcnow()
        session.commit()

        return jsonify({
            'success': True,
            'message': 'Lead atualizado com sucesso!'
        })
    except Exception as e:
        session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()

@bp.route('/api/<int:lead_id>/delete', methods=['POST'])
@login_required
def api_delete(lead_id):
    """API para deletar lead"""
    session = db_manager.get_session()
    try:
        lead = session.query(Lead).filter_by(
            id=lead_id,
            empresa_id=current_user.empresa_id
        ).first()

        if not lead:
            return jsonify({'success': False, 'error': 'Lead não encontrado'}), 404

        session.delete(lead)
        session.commit()

        return jsonify({
            'success': True,
            'message': 'Lead removido com sucesso!'
        })
    except Exception as e:
        session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()

@bp.route('/api/<int:lead_id>/conversas', methods=['GET'])
@login_required
def api_conversas(lead_id):
    """API para buscar conversas de um lead"""
    session = db_manager.get_session()
    try:
        # Verificar se o lead pertence à empresa do usuário
        lead = session.query(Lead).filter_by(
            id=lead_id,
            empresa_id=current_user.empresa_id
        ).first()

        if not lead:
            return jsonify({'success': False, 'error': 'Lead não encontrado'}), 404

        # Buscar conversas
        conversas = session.query(Conversa).filter_by(
            lead_id=lead_id
        ).order_by(desc(Conversa.ultima_mensagem)).all()

        conversas_list = []
        for conv in conversas:
            # Buscar última mensagem da conversa
            ultima_msg = session.query(Mensagem).filter_by(
                conversa_id=conv.id
            ).order_by(Mensagem.enviada_em.desc()).first()

            # Contar mensagens não lidas
            mensagens_nao_lidas = session.query(Mensagem).filter_by(
                conversa_id=conv.id,
                enviada_por_bot=False,
                lida=False
            ).count()

            conversas_list.append({
                'id': conv.id,
                'ativa': conv.ativa,
                'mensagens_nao_lidas': mensagens_nao_lidas,
                'ultima_mensagem': conv.ultima_mensagem.isoformat() if conv.ultima_mensagem else None,
                'ultima_mensagem_texto': ultima_msg.conteudo if ultima_msg else None,
                'total_mensagens': session.query(Mensagem).filter_by(conversa_id=conv.id).count()
            })

        return jsonify({
            'success': True,
            'conversas': conversas_list
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()

@bp.route('/api/conversa/<int:conversa_id>/mensagens', methods=['GET'])
@login_required
def api_mensagens(conversa_id):
    """API para buscar mensagens de uma conversa"""
    session = db_manager.get_session()
    try:
        # Verificar se a conversa pertence à empresa do usuário
        conversa = session.query(Conversa).filter_by(id=conversa_id).first()

        if not conversa:
            return jsonify({'success': False, 'error': 'Conversa não encontrada'}), 404

        # Verificar se o lead da conversa pertence à empresa
        lead = session.query(Lead).filter_by(
            id=conversa.lead_id,
            empresa_id=current_user.empresa_id
        ).first()

        if not lead:
            return jsonify({'success': False, 'error': 'Acesso negado'}), 403

        # Parâmetros de paginação
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)

        # Buscar mensagens
        mensagens = session.query(Mensagem).filter_by(
            conversa_id=conversa_id
        ).order_by(Mensagem.enviada_em.desc()).limit(limit).offset(offset).all()

        mensagens_list = []
        for msg in reversed(mensagens):  # Reverter para ordem cronológica
            mensagens_list.append({
                'id': msg.id,
                'conteudo': msg.conteudo,
                'tipo': msg.tipo.value if hasattr(msg.tipo, 'value') else msg.tipo,
                'enviada_em': msg.enviada_em.isoformat(),
                'enviada_por_bot': msg.enviada_por_bot,
                'lida': msg.lida
            })

        return jsonify({
            'success': True,
            'mensagens': mensagens_list,
            'conversa': {
                'id': conversa.id,
                'lead_nome': lead.nome,
                'lead_telefone': lead.telefone
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()

@bp.route('/api/leads-com-conversas', methods=['GET'])
@login_required
def api_leads_com_conversas():
    """API para buscar leads com suas conversas mais recentes"""
    session = db_manager.get_session()
    try:
        # Buscar todos os leads da empresa
        leads = session.query(Lead).filter_by(
            empresa_id=current_user.empresa_id
        ).order_by(desc(Lead.ultima_interacao)).all()

        leads_list = []
        for lead in leads:
            # Buscar conversa mais recente
            conversa_recente = session.query(Conversa).filter_by(
                lead_id=lead.id
            ).order_by(desc(Conversa.ultima_mensagem)).first()

            # Contar mensagens não lidas e buscar última mensagem
            mensagens_nao_lidas = 0
            ultima_mensagem_texto = None
            if conversa_recente:
                mensagens_nao_lidas = session.query(Mensagem).filter_by(
                    conversa_id=conversa_recente.id,
                    enviada_por_bot=False,
                    lida=False
                ).count()

                # Buscar última mensagem
                ultima_msg = session.query(Mensagem).filter_by(
                    conversa_id=conversa_recente.id
                ).order_by(Mensagem.enviada_em.desc()).first()
                ultima_mensagem_texto = ultima_msg.conteudo if ultima_msg else None

            leads_list.append({
                'id': lead.id,
                'nome': lead.nome or 'Sem nome',
                'telefone': lead.telefone,
                'avatar': (lead.nome or 'L')[0].upper(),
                'status': lead.status.name,
                'temperatura': lead.temperatura.name,
                'ultima_interacao': lead.ultima_interacao.isoformat() if lead.ultima_interacao else None,
                'conversa': {
                    'id': conversa_recente.id if conversa_recente else None,
                    'ultima_mensagem': ultima_mensagem_texto,
                    'ultima_mensagem_data': conversa_recente.ultima_mensagem.isoformat() if conversa_recente and conversa_recente.ultima_mensagem else None,
                    'mensagens_nao_lidas': mensagens_nao_lidas,
                    'ativa': conversa_recente.ativa if conversa_recente else False
                } if conversa_recente else None
            })

        return jsonify({
            'success': True,
            'leads': leads_list
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()
