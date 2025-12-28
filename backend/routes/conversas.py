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


# ════════════════════════════════════════════════════════════════════════════
# API REST PARA FRONTEND CRM - CONVERSAS EM TEMPO REAL
# ════════════════════════════════════════════════════════════════════════════

@bp.route('/api/conversations/<int:empresa_id>', methods=['GET'])
def api_get_conversations(empresa_id):
    """
    GET /conversas/api/conversations/:empresaId
    Retorna todas as conversas formatadas para o Kanban do CRM
    """
    session = db_manager.get_session()
    try:
        # Buscar todas as conversas da empresa
        conversas_list = session.query(Conversa).filter_by(
            empresa_id=empresa_id
        ).order_by(desc(Conversa.ultima_mensagem)).all()

        # Organizar em colunas do Kanban
        kanban = {
            'novo': [],
            'emAtendimento': [],
            'proposta': [],
            'fechado': []
        }

        for conv in conversas_list:
            # Buscar ultimas mensagens
            mensagens = session.query(Mensagem).filter_by(
                conversa_id=conv.id
            ).order_by(Mensagem.enviada_em).all()

            # Buscar lead associado
            lead = None
            if conv.lead_id:
                lead = session.query(Lead).get(conv.lead_id)

            # Formatar historico
            historico = []
            for msg in mensagens[-20:]:  # Ultimas 20 mensagens
                historico.append({
                    'tipo': 'resposta' if msg.enviada_por_bot else 'mensagem',
                    'mensagem': msg.conteudo,
                    'hora': msg.enviada_em.strftime('%d/%m %H:%M') if msg.enviada_em else ''
                })

            # Determinar temperatura baseado no lead ou interacoes
            temperatura = 'MORNO'
            if lead:
                temperatura = lead.temperatura.value if hasattr(lead.temperatura, 'value') else str(lead.temperatura)

            # Calcular hora relativa
            hora = ''
            if conv.ultima_mensagem:
                delta = datetime.utcnow() - conv.ultima_mensagem
                if delta.days == 0:
                    hora = conv.ultima_mensagem.strftime('%H:%M')
                elif delta.days == 1:
                    hora = 'Ontem'
                else:
                    hora = f'{delta.days} dias'

            # Ultima mensagem
            ultima_msg = mensagens[-1].conteudo if mensagens else ''

            # Determinar status/coluna
            status = 'novo'
            if conv.total_mensagens and conv.total_mensagens > 2:
                status = 'emAtendimento'
            if not conv.ativa:
                status = 'fechado'

            # Montar objeto da conversa
            conv_data = {
                'id': f'conv-{conv.id}',
                'db_id': conv.id,
                'nome': conv.nome_contato or conv.telefone,
                'telefone': conv.telefone,
                'email': lead.email if lead else '',
                'mensagem': ultima_msg[:100] if ultima_msg else '',
                'hora': hora,
                'origem': 'WhatsApp',
                'localizacao': '',
                'temperatura': temperatura.upper() if temperatura else 'MORNO',
                'historico': historico,
                'total_mensagens': conv.total_mensagens or len(mensagens),
                'bot_ativo': conv.bot_ativo
            }

            kanban[status].append(conv_data)

        return jsonify({
            'success': True,
            'data': kanban
        })

    except Exception as e:
        print(f'[CONVERSAS API] Erro: {str(e)}')
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
    finally:
        session.close()


@bp.route('/api/conversations/<int:empresa_id>/<int:conversa_id>', methods=['GET'])
def api_get_conversation_detail(empresa_id, conversa_id):
    """
    GET /conversas/api/conversations/:empresaId/:conversaId
    Retorna detalhes de uma conversa especifica com todas as mensagens
    """
    session = db_manager.get_session()
    try:
        conversa = session.query(Conversa).filter_by(
            id=conversa_id,
            empresa_id=empresa_id
        ).first()

        if not conversa:
            return jsonify({
                'success': False,
                'error': 'Conversa nao encontrada'
            }), 404

        # Buscar todas as mensagens
        mensagens = session.query(Mensagem).filter_by(
            conversa_id=conversa_id
        ).order_by(Mensagem.enviada_em).all()

        # Buscar lead
        lead = None
        if conversa.lead_id:
            lead = session.query(Lead).get(conversa.lead_id)

        # Formatar mensagens
        mensagens_list = []
        for msg in mensagens:
            mensagens_list.append({
                'id': msg.id,
                'tipo': msg.tipo.value if hasattr(msg.tipo, 'value') else str(msg.tipo),
                'conteudo': msg.conteudo,
                'enviada_por_bot': msg.enviada_por_bot,
                'enviada_em': msg.enviada_em.isoformat() if msg.enviada_em else None,
                'lida': msg.lida
            })

        return jsonify({
            'success': True,
            'data': {
                'id': conversa.id,
                'telefone': conversa.telefone,
                'nome_contato': conversa.nome_contato,
                'ativa': conversa.ativa,
                'bot_ativo': conversa.bot_ativo,
                'total_mensagens': conversa.total_mensagens or len(mensagens),
                'iniciada_em': conversa.iniciada_em.isoformat() if conversa.iniciada_em else None,
                'ultima_mensagem': conversa.ultima_mensagem.isoformat() if conversa.ultima_mensagem else None,
                'lead': {
                    'id': lead.id,
                    'nome': lead.nome,
                    'email': lead.email,
                    'telefone': lead.telefone,
                    'temperatura': lead.temperatura.value if hasattr(lead.temperatura, 'value') else str(lead.temperatura)
                } if lead else None,
                'mensagens': mensagens_list
            }
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
    finally:
        session.close()


@bp.route('/api/conversations/<int:empresa_id>/<int:conversa_id>/status', methods=['PUT'])
def api_update_conversation_status(empresa_id, conversa_id):
    """
    PUT /conversas/api/conversations/:empresaId/:conversaId/status
    Atualiza o status da conversa (para mover no Kanban)
    """
    session = db_manager.get_session()
    try:
        data = request.json
        novo_status = data.get('status')

        conversa = session.query(Conversa).filter_by(
            id=conversa_id,
            empresa_id=empresa_id
        ).first()

        if not conversa:
            return jsonify({
                'success': False,
                'error': 'Conversa nao encontrada'
            }), 404

        # Atualizar status
        if novo_status == 'fechado':
            conversa.ativa = False
        else:
            conversa.ativa = True

        session.commit()

        return jsonify({
            'success': True,
            'message': f'Status atualizado para {novo_status}'
        })

    except Exception as e:
        session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
    finally:
        session.close()


# ════════════════════════════════════════════════════════════════════════════
# API PARA BOT REGISTRAR MENSAGENS EM TEMPO REAL
# ════════════════════════════════════════════════════════════════════════════

@bp.route('/api/registrar-mensagem', methods=['POST'])
def api_registrar_mensagem():
    """
    POST /conversas/api/registrar-mensagem
    Registra mensagem do cliente ou do bot no banco de dados

    Body: {
        "empresa_id": 28,
        "telefone": "5511999999999",
        "nome_contato": "João",
        "mensagem": "Olá, preciso de tinta",
        "tipo": "texto",
        "enviada_por_bot": false
    }
    """
    session = db_manager.get_session()
    try:
        data = request.json

        empresa_id = data.get('empresa_id')
        telefone = data.get('telefone', '').replace('@s.whatsapp.net', '')
        nome_contato = data.get('nome_contato', telefone)
        mensagem_texto = data.get('mensagem', '')
        tipo = data.get('tipo', 'texto')
        enviada_por_bot = data.get('enviada_por_bot', False)

        if not empresa_id or not telefone or not mensagem_texto:
            return jsonify({
                'success': False,
                'error': 'empresa_id, telefone e mensagem são obrigatórios'
            }), 400

        # Buscar ou criar conversa
        conversa = session.query(Conversa).filter_by(
            empresa_id=empresa_id,
            telefone=telefone
        ).first()

        if not conversa:
            # Criar nova conversa
            conversa = Conversa(
                empresa_id=empresa_id,
                telefone=telefone,
                nome_contato=nome_contato,
                ativa=True,
                bot_ativo=True,
                iniciada_em=datetime.utcnow(),
                ultima_mensagem=datetime.utcnow(),
                total_mensagens=0
            )
            session.add(conversa)
            session.flush()

        # Atualizar nome do contato se fornecido
        if nome_contato and nome_contato != telefone:
            conversa.nome_contato = nome_contato

        # Criar mensagem
        from database.models import TipoMensagem
        tipo_enum = TipoMensagem.TEXTO
        if tipo == 'audio':
            tipo_enum = TipoMensagem.AUDIO
        elif tipo == 'imagem':
            tipo_enum = TipoMensagem.IMAGEM

        nova_mensagem = Mensagem(
            conversa_id=conversa.id,
            tipo=tipo_enum,
            conteudo=mensagem_texto,
            enviada_por_bot=enviada_por_bot,
            enviada_em=datetime.utcnow(),
            lida=enviada_por_bot  # Mensagens do bot já são "lidas"
        )
        session.add(nova_mensagem)

        # Atualizar estatísticas da conversa
        conversa.ultima_mensagem = datetime.utcnow()
        conversa.total_mensagens = (conversa.total_mensagens or 0) + 1

        session.commit()

        return jsonify({
            'success': True,
            'data': {
                'conversa_id': conversa.id,
                'mensagem_id': nova_mensagem.id
            }
        })

    except Exception as e:
        session.rollback()
        print(f'[CONVERSAS API] Erro ao registrar mensagem: {str(e)}')
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
    finally:
        session.close()
