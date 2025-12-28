"""
API Admin - Rotas JSON para o CRM Admin Frontend
Todas as rotas retornam JSON para consumo do React
"""
from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from database.models import (
    Usuario, Empresa, Lead, Conversa, Mensagem, Campanha, Disparo,
    Afiliado, Comissao, Referencia, SaqueAfiliado, ConfiguracaoAfiliados,
    LogSistema, ConfiguracaoBot, Produto, MetricaConversa, Veiculo,
    TipoUsuario, PlanoAssinatura, StatusLead, TemperaturaLead,
    StatusAfiliado, StatusComissao, TipoComissao, NichoEmpresa
)
from backend import db_manager
from datetime import datetime, timedelta
from sqlalchemy import func, desc, and_, or_
from sqlalchemy.orm import joinedload
import json

admin_api_bp = Blueprint('admin_api', __name__, url_prefix='/api/admin')


# ==================== HELPERS ====================

def admin_required(f):
    """Decorator para rotas que requerem super admin"""
    def decorated_function(*args, **kwargs):
        # Para desenvolvimento, permitir sem autenticacao
        # Em producao, descomentar as linhas abaixo
        # if not current_user.is_authenticated:
        #     return jsonify({'success': False, 'error': 'Nao autenticado'}), 401
        # if current_user.tipo != 'super_admin':
        #     return jsonify({'success': False, 'error': 'Acesso negado'}), 403
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function


def serialize_datetime(dt):
    """Converte datetime para string ISO"""
    if dt:
        return dt.isoformat()
    return None


def serialize_enum(enum_val):
    """Converte enum para string"""
    if enum_val:
        return enum_val.value if hasattr(enum_val, 'value') else str(enum_val)
    return None


# ==================== DASHBOARD ====================

@admin_api_bp.route('/dashboard/metrics')
@admin_required
def dashboard_metrics():
    """Retorna metricas principais do dashboard"""
    session = db_manager.get_session()
    try:
        # Periodo
        dias = int(request.args.get('dias', 30))
        data_inicio = datetime.utcnow() - timedelta(days=dias)

        # Total de empresas
        total_empresas = session.query(Empresa).count()
        empresas_ativas = session.query(Empresa).filter(Empresa.plano_ativo == True).count()
        empresas_trial = session.query(Empresa).filter(Empresa.plano == PlanoAssinatura.GRATUITO).count()
        empresas_inadimplentes = session.query(Empresa).filter(
            Empresa.plano_ativo == False,
            Empresa.plano != PlanoAssinatura.GRATUITO
        ).count()

        # Total de usuarios
        total_usuarios = session.query(Usuario).count()
        usuarios_ativos = session.query(Usuario).filter(Usuario.ativo == True).count()
        usuarios_novos_mes = session.query(Usuario).filter(
            Usuario.criado_em >= data_inicio
        ).count()

        # Bots
        bots_ativos = session.query(Empresa).filter(
            Empresa.bot_ativo == True,
            Empresa.whatsapp_conectado == True
        ).count()
        total_bots = session.query(Empresa).filter(Empresa.whatsapp_conectado == True).count()
        uptime_bots = round((bots_ativos / total_bots * 100) if total_bots > 0 else 0, 1)

        # Conversas
        conversas_hoje = session.query(Conversa).filter(
            Conversa.iniciada_em >= datetime.utcnow().replace(hour=0, minute=0, second=0)
        ).count()

        mensagens_mes = session.query(Mensagem).filter(
            Mensagem.enviada_em >= data_inicio
        ).count()

        # MRR (Monthly Recurring Revenue)
        mrr = 0
        empresas_planos = session.query(Empresa).filter(Empresa.plano_ativo == True).all()
        for emp in empresas_planos:
            if emp.plano == PlanoAssinatura.BASICO:
                mrr += 97
            elif emp.plano == PlanoAssinatura.PROFISSIONAL:
                mrr += 197
            elif emp.plano == PlanoAssinatura.ENTERPRISE:
                mrr += 497

        # Taxa de conversao (leads que viraram vendas)
        total_leads = session.query(Lead).count()
        leads_convertidos = session.query(Lead).filter(Lead.vendido == True).count()
        taxa_conversao = round((leads_convertidos / total_leads * 100) if total_leads > 0 else 0, 1)

        # Distribuicao por plano
        planos = {
            'gratuito': session.query(Empresa).filter(Empresa.plano == PlanoAssinatura.GRATUITO).count(),
            'basico': session.query(Empresa).filter(Empresa.plano == PlanoAssinatura.BASICO).count(),
            'profissional': session.query(Empresa).filter(Empresa.plano == PlanoAssinatura.PROFISSIONAL).count(),
            'enterprise': session.query(Empresa).filter(Empresa.plano == PlanoAssinatura.ENTERPRISE).count()
        }

        return jsonify({
            'success': True,
            'data': {
                'total_empresas': total_empresas,
                'empresas_ativas': empresas_ativas,
                'empresas_trial': empresas_trial,
                'empresas_inadimplentes': empresas_inadimplentes,
                'total_usuarios': total_usuarios,
                'usuarios_ativos': usuarios_ativos,
                'usuarios_novos_mes': usuarios_novos_mes,
                'bots_ativos': bots_ativos,
                'total_bots': total_bots,
                'uptime_bots': uptime_bots,
                'conversas_hoje': conversas_hoje,
                'mensagens_mes': mensagens_mes,
                'mrr': mrr,
                'variacao_mrr': 12.5,  # Placeholder - calcular comparando com mes anterior
                'taxa_conversao': taxa_conversao,
                'planos': planos
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@admin_api_bp.route('/dashboard/recent-activity')
@admin_required
def recent_activity():
    """Retorna atividades recentes do sistema"""
    session = db_manager.get_session()
    try:
        limit = int(request.args.get('limit', 20))

        # Buscar logs recentes
        logs = session.query(LogSistema).order_by(
            LogSistema.criado_em.desc()
        ).limit(limit).all()

        atividades = []
        for log in logs:
            atividades.append({
                'id': log.id,
                'tipo': log.tipo,
                'acao': log.acao,
                'descricao': log.descricao,
                'usuario_id': log.usuario_id,
                'empresa_id': log.empresa_id,
                'ip_address': log.ip_address,
                'criado_em': serialize_datetime(log.criado_em)
            })

        # Se nao houver logs, criar dados de exemplo
        if not atividades:
            atividades = [
                {'id': 1, 'tipo': 'new_company', 'acao': 'Nova empresa cadastrada', 'descricao': 'AutoShow Premium se cadastrou', 'criado_em': datetime.utcnow().isoformat()},
                {'id': 2, 'tipo': 'payment', 'acao': 'Pagamento recebido', 'descricao': 'Imobiliaria Prime - Plano Pro', 'criado_em': (datetime.utcnow() - timedelta(minutes=15)).isoformat()},
                {'id': 3, 'tipo': 'bot_activated', 'acao': 'Bot ativado', 'descricao': 'MegaVeiculos conectou WhatsApp', 'criado_em': (datetime.utcnow() - timedelta(hours=1)).isoformat()},
            ]

        return jsonify({
            'success': True,
            'data': atividades
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


# ==================== ANALYTICS ====================

@admin_api_bp.route('/analytics/overview')
@admin_required
def analytics_overview():
    """Retorna dados de analytics"""
    session = db_manager.get_session()
    try:
        dias = int(request.args.get('dias', 30))

        # Dados para graficos
        dados_diarios = []
        for i in range(dias, -1, -1):
            data = datetime.utcnow().date() - timedelta(days=i)
            data_inicio = datetime.combine(data, datetime.min.time())
            data_fim = datetime.combine(data, datetime.max.time())

            conversas = session.query(Conversa).filter(
                Conversa.iniciada_em >= data_inicio,
                Conversa.iniciada_em <= data_fim
            ).count()

            leads = session.query(Lead).filter(
                Lead.criado_em >= data_inicio,
                Lead.criado_em <= data_fim
            ).count()

            mensagens = session.query(Mensagem).filter(
                Mensagem.enviada_em >= data_inicio,
                Mensagem.enviada_em <= data_fim
            ).count()

            dados_diarios.append({
                'data': data.isoformat(),
                'conversas': conversas,
                'leads': leads,
                'mensagens': mensagens
            })

        # Top empresas por leads
        top_empresas = session.query(
            Empresa.id,
            Empresa.nome,
            func.count(Lead.id).label('total_leads')
        ).outerjoin(Lead).group_by(Empresa.id).order_by(
            desc('total_leads')
        ).limit(10).all()

        top_empresas_data = [
            {'id': e.id, 'nome': e.nome, 'total_leads': e.total_leads or 0}
            for e in top_empresas
        ]

        # Distribuicao de leads por temperatura
        leads_temperatura = {
            'quente': session.query(Lead).filter(Lead.temperatura == TemperaturaLead.QUENTE).count(),
            'morno': session.query(Lead).filter(Lead.temperatura == TemperaturaLead.MORNO).count(),
            'frio': session.query(Lead).filter(Lead.temperatura == TemperaturaLead.FRIO).count()
        }

        # Distribuicao de leads por status
        leads_status = {}
        for status in StatusLead:
            leads_status[status.value] = session.query(Lead).filter(Lead.status == status).count()

        return jsonify({
            'success': True,
            'data': {
                'dados_diarios': dados_diarios,
                'top_empresas': top_empresas_data,
                'leads_temperatura': leads_temperatura,
                'leads_status': leads_status
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


# ==================== EMPRESAS ====================

@admin_api_bp.route('/empresas')
@admin_required
def listar_empresas():
    """Lista todas as empresas"""
    session = db_manager.get_session()
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        search = request.args.get('search', '')
        plano_filter = request.args.get('plano', '')
        status_filter = request.args.get('status', '')

        query = session.query(Empresa)

        if search:
            query = query.filter(
                or_(
                    Empresa.nome.ilike(f'%{search}%'),
                    Empresa.email.ilike(f'%{search}%'),
                    Empresa.cnpj.ilike(f'%{search}%')
                )
            )

        if plano_filter:
            query = query.filter(Empresa.plano == PlanoAssinatura(plano_filter))

        if status_filter == 'ativo':
            query = query.filter(Empresa.plano_ativo == True)
        elif status_filter == 'inativo':
            query = query.filter(Empresa.plano_ativo == False)

        total = query.count()
        empresas = query.order_by(Empresa.criado_em.desc()).offset(
            (page - 1) * per_page
        ).limit(per_page).all()

        empresas_data = []
        for emp in empresas:
            # Contar usuarios da empresa
            total_usuarios = session.query(Usuario).filter(
                Usuario.empresa_id == emp.id
            ).count()

            # Contar leads da empresa
            total_leads = session.query(Lead).filter(
                Lead.empresa_id == emp.id
            ).count()

            empresas_data.append({
                'id': emp.id,
                'nome': emp.nome,
                'nome_fantasia': emp.nome_fantasia,
                'cnpj': emp.cnpj,
                'email': emp.email,
                'telefone': emp.telefone,
                'plano': serialize_enum(emp.plano),
                'plano_ativo': emp.plano_ativo,
                'nicho': serialize_enum(emp.nicho),
                'whatsapp_conectado': emp.whatsapp_conectado,
                'whatsapp_numero': emp.whatsapp_numero,
                'bot_ativo': emp.bot_ativo,
                'setup_completo': emp.setup_completo,
                'cidade': emp.cidade,
                'estado': emp.estado,
                'criado_em': serialize_datetime(emp.criado_em),
                'data_inicio_plano': serialize_datetime(emp.data_inicio_plano),
                'data_fim_plano': serialize_datetime(emp.data_fim_plano),
                'total_usuarios': total_usuarios,
                'total_leads': total_leads
            })

        return jsonify({
            'success': True,
            'data': {
                'empresas': empresas_data,
                'total': total,
                'page': page,
                'per_page': per_page,
                'total_pages': (total + per_page - 1) // per_page
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@admin_api_bp.route('/empresas/<int:empresa_id>')
@admin_required
def get_empresa(empresa_id):
    """Retorna detalhes de uma empresa"""
    session = db_manager.get_session()
    try:
        empresa = session.query(Empresa).filter_by(id=empresa_id).first()

        if not empresa:
            return jsonify({'success': False, 'error': 'Empresa nao encontrada'}), 404

        # Buscar configuracoes do bot
        config = session.query(ConfiguracaoBot).filter_by(empresa_id=empresa_id).first()

        # Estatisticas
        total_usuarios = session.query(Usuario).filter(Usuario.empresa_id == empresa_id).count()
        total_leads = session.query(Lead).filter(Lead.empresa_id == empresa_id).count()
        total_conversas = session.query(Conversa).filter(Conversa.empresa_id == empresa_id).count()

        return jsonify({
            'success': True,
            'data': {
                'empresa': {
                    'id': empresa.id,
                    'nome': empresa.nome,
                    'nome_fantasia': empresa.nome_fantasia,
                    'cnpj': empresa.cnpj,
                    'email': empresa.email,
                    'telefone': empresa.telefone,
                    'website': empresa.website,
                    'plano': serialize_enum(empresa.plano),
                    'plano_ativo': empresa.plano_ativo,
                    'nicho': serialize_enum(empresa.nicho),
                    'nome_bot': empresa.nome_bot,
                    'whatsapp_conectado': empresa.whatsapp_conectado,
                    'whatsapp_numero': empresa.whatsapp_numero,
                    'bot_ativo': empresa.bot_ativo,
                    'setup_completo': empresa.setup_completo,
                    'tem_catalogo': empresa.tem_catalogo,
                    'endereco': empresa.endereco,
                    'cidade': empresa.cidade,
                    'estado': empresa.estado,
                    'cep': empresa.cep,
                    'limite_leads': empresa.limite_leads,
                    'limite_disparos_mes': empresa.limite_disparos_mes,
                    'limite_usuarios': empresa.limite_usuarios,
                    'criado_em': serialize_datetime(empresa.criado_em),
                    'data_inicio_plano': serialize_datetime(empresa.data_inicio_plano),
                    'data_fim_plano': serialize_datetime(empresa.data_fim_plano)
                },
                'config_bot': {
                    'descricao_empresa': config.descricao_empresa if config else None,
                    'tom_conversa': config.tom_conversa if config else None,
                    'mensagem_boas_vindas': config.mensagem_boas_vindas if config else None,
                    'auto_resposta_ativa': config.auto_resposta_ativa if config else False,
                    'enviar_audio': config.enviar_audio if config else False
                } if config else None,
                'estatisticas': {
                    'total_usuarios': total_usuarios,
                    'total_leads': total_leads,
                    'total_conversas': total_conversas
                }
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@admin_api_bp.route('/empresas', methods=['POST'])
@admin_required
def criar_empresa():
    """Cria uma nova empresa"""
    session = db_manager.get_session()
    try:
        data = request.get_json()

        # Verificar se email ja existe
        if session.query(Empresa).filter_by(email=data.get('email')).first():
            return jsonify({'success': False, 'error': 'Email ja cadastrado'}), 400

        empresa = Empresa(
            nome=data.get('nome'),
            nome_fantasia=data.get('nome_fantasia'),
            cnpj=data.get('cnpj'),
            email=data.get('email'),
            telefone=data.get('telefone'),
            website=data.get('website'),
            plano=PlanoAssinatura(data.get('plano', 'free')),
            plano_ativo=data.get('plano_ativo', True),
            nicho=NichoEmpresa(data.get('nicho')) if data.get('nicho') else None,
            endereco=data.get('endereco'),
            cidade=data.get('cidade'),
            estado=data.get('estado'),
            cep=data.get('cep')
        )

        session.add(empresa)
        session.commit()

        # Criar configuracao padrao do bot
        config = ConfiguracaoBot(
            empresa_id=empresa.id,
            auto_resposta_ativa=True,
            enviar_audio=True
        )
        session.add(config)
        session.commit()

        return jsonify({
            'success': True,
            'message': 'Empresa criada com sucesso',
            'data': {'id': empresa.id}
        })
    except Exception as e:
        session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@admin_api_bp.route('/empresas/<int:empresa_id>', methods=['PUT'])
@admin_required
def atualizar_empresa(empresa_id):
    """Atualiza uma empresa"""
    session = db_manager.get_session()
    try:
        empresa = session.query(Empresa).filter_by(id=empresa_id).first()

        if not empresa:
            return jsonify({'success': False, 'error': 'Empresa nao encontrada'}), 404

        data = request.get_json()

        # Atualizar campos
        for campo in ['nome', 'nome_fantasia', 'cnpj', 'email', 'telefone', 'website',
                      'endereco', 'cidade', 'estado', 'cep', 'plano_ativo',
                      'limite_leads', 'limite_disparos_mes', 'limite_usuarios']:
            if campo in data:
                setattr(empresa, campo, data[campo])

        if 'plano' in data:
            empresa.plano = PlanoAssinatura(data['plano'])

        if 'nicho' in data:
            empresa.nicho = NichoEmpresa(data['nicho']) if data['nicho'] else None

        session.commit()

        return jsonify({
            'success': True,
            'message': 'Empresa atualizada com sucesso'
        })
    except Exception as e:
        session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@admin_api_bp.route('/empresas/<int:empresa_id>', methods=['DELETE'])
@admin_required
def deletar_empresa(empresa_id):
    """Deleta uma empresa"""
    session = db_manager.get_session()
    try:
        empresa = session.query(Empresa).filter_by(id=empresa_id).first()

        if not empresa:
            return jsonify({'success': False, 'error': 'Empresa nao encontrada'}), 404

        # Deletar registros relacionados primeiro
        session.query(ConfiguracaoBot).filter_by(empresa_id=empresa_id).delete()
        session.query(Lead).filter_by(empresa_id=empresa_id).delete()
        session.query(Usuario).filter_by(empresa_id=empresa_id).delete()

        session.delete(empresa)
        session.commit()

        return jsonify({
            'success': True,
            'message': 'Empresa deletada com sucesso'
        })
    except Exception as e:
        session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


# ==================== USUARIOS ====================

@admin_api_bp.route('/usuarios')
@admin_required
def listar_usuarios():
    """Lista todos os usuarios"""
    session = db_manager.get_session()
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        search = request.args.get('search', '')
        tipo_filter = request.args.get('tipo', '')

        query = session.query(Usuario).options(joinedload(Usuario.empresa))

        if search:
            query = query.filter(
                or_(
                    Usuario.nome.ilike(f'%{search}%'),
                    Usuario.email.ilike(f'%{search}%')
                )
            )

        if tipo_filter:
            query = query.filter(Usuario.tipo == tipo_filter)

        total = query.count()
        usuarios = query.order_by(Usuario.criado_em.desc()).offset(
            (page - 1) * per_page
        ).limit(per_page).all()

        usuarios_data = []
        for user in usuarios:
            usuarios_data.append({
                'id': user.id,
                'nome': user.nome,
                'email': user.email,
                'tipo': user.tipo,
                'ativo': user.ativo,
                'telefone': user.telefone,
                'empresa_id': user.empresa_id,
                'empresa_nome': user.empresa.nome if user.empresa else None,
                'criado_em': serialize_datetime(user.criado_em),
                'ultimo_acesso': serialize_datetime(user.ultimo_acesso)
            })

        return jsonify({
            'success': True,
            'data': {
                'usuarios': usuarios_data,
                'total': total,
                'page': page,
                'per_page': per_page,
                'total_pages': (total + per_page - 1) // per_page
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@admin_api_bp.route('/usuarios', methods=['POST'])
@admin_required
def criar_usuario():
    """Cria um novo usuario"""
    session = db_manager.get_session()
    try:
        data = request.get_json()

        # Verificar se email ja existe
        if session.query(Usuario).filter_by(email=data.get('email')).first():
            return jsonify({'success': False, 'error': 'Email ja cadastrado'}), 400

        usuario = Usuario(
            nome=data.get('nome'),
            email=data.get('email'),
            tipo=data.get('tipo', 'usuario'),
            ativo=data.get('ativo', True),
            telefone=data.get('telefone'),
            empresa_id=data.get('empresa_id')
        )
        usuario.set_senha(data.get('senha', '123456'))

        session.add(usuario)
        session.commit()

        return jsonify({
            'success': True,
            'message': 'Usuario criado com sucesso',
            'data': {'id': usuario.id}
        })
    except Exception as e:
        session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@admin_api_bp.route('/usuarios/<int:usuario_id>', methods=['PUT'])
@admin_required
def atualizar_usuario(usuario_id):
    """Atualiza um usuario"""
    session = db_manager.get_session()
    try:
        usuario = session.query(Usuario).filter_by(id=usuario_id).first()

        if not usuario:
            return jsonify({'success': False, 'error': 'Usuario nao encontrado'}), 404

        data = request.get_json()

        for campo in ['nome', 'email', 'tipo', 'ativo', 'telefone', 'empresa_id']:
            if campo in data:
                setattr(usuario, campo, data[campo])

        if 'senha' in data and data['senha']:
            usuario.set_senha(data['senha'])

        session.commit()

        return jsonify({
            'success': True,
            'message': 'Usuario atualizado com sucesso'
        })
    except Exception as e:
        session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@admin_api_bp.route('/usuarios/<int:usuario_id>', methods=['DELETE'])
@admin_required
def deletar_usuario(usuario_id):
    """Deleta um usuario"""
    session = db_manager.get_session()
    try:
        usuario = session.query(Usuario).filter_by(id=usuario_id).first()

        if not usuario:
            return jsonify({'success': False, 'error': 'Usuario nao encontrado'}), 404

        session.delete(usuario)
        session.commit()

        return jsonify({
            'success': True,
            'message': 'Usuario deletado com sucesso'
        })
    except Exception as e:
        session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


# ==================== AFILIADOS ====================

@admin_api_bp.route('/afiliados')
@admin_required
def listar_afiliados():
    """Lista todos os afiliados"""
    session = db_manager.get_session()
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        status_filter = request.args.get('status', '')

        query = session.query(Afiliado).options(joinedload(Afiliado.usuario))

        if status_filter:
            query = query.filter(Afiliado.status == StatusAfiliado(status_filter))

        total = query.count()
        afiliados = query.order_by(Afiliado.criado_em.desc()).offset(
            (page - 1) * per_page
        ).limit(per_page).all()

        afiliados_data = []
        for af in afiliados:
            afiliados_data.append({
                'id': af.id,
                'usuario_id': af.usuario_id,
                'usuario_nome': af.usuario.nome if af.usuario else None,
                'usuario_email': af.usuario.email if af.usuario else None,
                'chave_referencia': af.chave_referencia,
                'status': serialize_enum(af.status),
                'nome_completo': af.nome_completo,
                'cpf_cnpj': af.cpf_cnpj,
                'telefone': af.telefone,
                'pix_tipo': af.pix_tipo,
                'pix_chave': af.pix_chave,
                'total_clicks': af.total_clicks,
                'total_cadastros': af.total_cadastros,
                'total_vendas': af.total_vendas,
                'total_comissoes_geradas': af.total_comissoes_geradas,
                'total_comissoes_pagas': af.total_comissoes_pagas,
                'saldo_disponivel': af.saldo_disponivel,
                'data_inscricao': serialize_datetime(af.data_inscricao),
                'data_aprovacao': serialize_datetime(af.data_aprovacao)
            })

        return jsonify({
            'success': True,
            'data': {
                'afiliados': afiliados_data,
                'total': total,
                'page': page,
                'per_page': per_page,
                'total_pages': (total + per_page - 1) // per_page
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@admin_api_bp.route('/afiliados/<int:afiliado_id>/aprovar', methods=['POST'])
@admin_required
def aprovar_afiliado(afiliado_id):
    """Aprova um afiliado"""
    session = db_manager.get_session()
    try:
        afiliado = session.query(Afiliado).filter_by(id=afiliado_id).first()

        if not afiliado:
            return jsonify({'success': False, 'error': 'Afiliado nao encontrado'}), 404

        afiliado.status = StatusAfiliado.ATIVO
        afiliado.data_aprovacao = datetime.utcnow()
        session.commit()

        return jsonify({
            'success': True,
            'message': 'Afiliado aprovado com sucesso'
        })
    except Exception as e:
        session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


# ==================== ASSINATURAS ====================

@admin_api_bp.route('/assinaturas')
@admin_required
def listar_assinaturas():
    """Lista assinaturas (empresas com planos)"""
    session = db_manager.get_session()
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        plano_filter = request.args.get('plano', '')

        query = session.query(Empresa).filter(Empresa.plano != PlanoAssinatura.GRATUITO)

        if plano_filter:
            query = query.filter(Empresa.plano == PlanoAssinatura(plano_filter))

        total = query.count()
        empresas = query.order_by(Empresa.data_inicio_plano.desc()).offset(
            (page - 1) * per_page
        ).limit(per_page).all()

        assinaturas_data = []
        for emp in empresas:
            valor_plano = 0
            if emp.plano == PlanoAssinatura.BASICO:
                valor_plano = 97
            elif emp.plano == PlanoAssinatura.PROFISSIONAL:
                valor_plano = 197
            elif emp.plano == PlanoAssinatura.ENTERPRISE:
                valor_plano = 497

            assinaturas_data.append({
                'id': emp.id,
                'empresa_nome': emp.nome,
                'empresa_email': emp.email,
                'plano': serialize_enum(emp.plano),
                'plano_ativo': emp.plano_ativo,
                'valor': valor_plano,
                'data_inicio': serialize_datetime(emp.data_inicio_plano),
                'data_fim': serialize_datetime(emp.data_fim_plano),
                'dias_restantes': (emp.data_fim_plano - datetime.utcnow()).days if emp.data_fim_plano else None
            })

        return jsonify({
            'success': True,
            'data': {
                'assinaturas': assinaturas_data,
                'total': total,
                'page': page,
                'per_page': per_page,
                'total_pages': (total + per_page - 1) // per_page
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


# ==================== PAGAMENTOS ====================

@admin_api_bp.route('/pagamentos')
@admin_required
def listar_pagamentos():
    """Lista pagamentos (placeholder - integrar com Mercado Pago)"""
    # Placeholder - em producao, buscar do Mercado Pago
    pagamentos_mock = [
        {
            'id': 1,
            'empresa_nome': 'AutoShow Premium',
            'valor': 197,
            'status': 'approved',
            'metodo': 'credit_card',
            'data': (datetime.utcnow() - timedelta(days=1)).isoformat()
        },
        {
            'id': 2,
            'empresa_nome': 'Imobiliaria Prime',
            'valor': 497,
            'status': 'approved',
            'metodo': 'pix',
            'data': (datetime.utcnow() - timedelta(days=3)).isoformat()
        },
        {
            'id': 3,
            'empresa_nome': 'MegaVeiculos',
            'valor': 97,
            'status': 'pending',
            'metodo': 'boleto',
            'data': (datetime.utcnow() - timedelta(days=5)).isoformat()
        }
    ]

    return jsonify({
        'success': True,
        'data': {
            'pagamentos': pagamentos_mock,
            'total': len(pagamentos_mock)
        }
    })


# ==================== COMISSOES ====================

@admin_api_bp.route('/comissoes')
@admin_required
def listar_comissoes():
    """Lista todas as comissoes"""
    session = db_manager.get_session()
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        status_filter = request.args.get('status', '')

        query = session.query(Comissao).options(joinedload(Comissao.afiliado))

        if status_filter:
            query = query.filter(Comissao.status == StatusComissao(status_filter))

        total = query.count()
        comissoes = query.order_by(Comissao.data_geracao.desc()).offset(
            (page - 1) * per_page
        ).limit(per_page).all()

        comissoes_data = []
        for com in comissoes:
            comissoes_data.append({
                'id': com.id,
                'afiliado_id': com.afiliado_id,
                'afiliado_nome': com.afiliado.nome_completo if com.afiliado else None,
                'tipo': serialize_enum(com.tipo),
                'valor': com.valor,
                'percentual': com.percentual,
                'valor_base': com.valor_base,
                'status': serialize_enum(com.status),
                'descricao': com.descricao,
                'data_geracao': serialize_datetime(com.data_geracao),
                'data_aprovacao': serialize_datetime(com.data_aprovacao),
                'data_pagamento': serialize_datetime(com.data_pagamento)
            })

        # Totais
        total_pendente = session.query(func.sum(Comissao.valor)).filter(
            Comissao.status == StatusComissao.PENDENTE
        ).scalar() or 0

        total_aprovado = session.query(func.sum(Comissao.valor)).filter(
            Comissao.status == StatusComissao.APROVADA
        ).scalar() or 0

        total_pago = session.query(func.sum(Comissao.valor)).filter(
            Comissao.status == StatusComissao.PAGA
        ).scalar() or 0

        return jsonify({
            'success': True,
            'data': {
                'comissoes': comissoes_data,
                'total': total,
                'page': page,
                'per_page': per_page,
                'total_pages': (total + per_page - 1) // per_page,
                'totais': {
                    'pendente': total_pendente,
                    'aprovado': total_aprovado,
                    'pago': total_pago
                }
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@admin_api_bp.route('/comissoes/<int:comissao_id>/aprovar', methods=['POST'])
@admin_required
def aprovar_comissao(comissao_id):
    """Aprova uma comissao"""
    session = db_manager.get_session()
    try:
        comissao = session.query(Comissao).filter_by(id=comissao_id).first()

        if not comissao:
            return jsonify({'success': False, 'error': 'Comissao nao encontrada'}), 404

        comissao.status = StatusComissao.APROVADA
        comissao.data_aprovacao = datetime.utcnow()

        # Atualizar saldo do afiliado
        if comissao.afiliado:
            comissao.afiliado.saldo_disponivel += comissao.valor

        session.commit()

        return jsonify({
            'success': True,
            'message': 'Comissao aprovada com sucesso'
        })
    except Exception as e:
        session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


# ==================== BOTS WHATSAPP ====================

@admin_api_bp.route('/bots')
@admin_required
def listar_bots():
    """Lista todos os bots WhatsApp"""
    session = db_manager.get_session()
    try:
        empresas = session.query(Empresa).all()

        bots_data = []
        for emp in empresas:
            bots_data.append({
                'id': emp.id,
                'empresa_nome': emp.nome,
                'empresa_email': emp.email,
                'nicho': serialize_enum(emp.nicho),
                'nome_bot': emp.nome_bot,
                'whatsapp_conectado': emp.whatsapp_conectado,
                'whatsapp_numero': emp.whatsapp_numero,
                'bot_ativo': emp.bot_ativo,
                'setup_completo': emp.setup_completo,
                'plano': serialize_enum(emp.plano)
            })

        # Estatisticas
        total_bots = len(bots_data)
        bots_conectados = sum(1 for b in bots_data if b['whatsapp_conectado'])
        bots_ativos = sum(1 for b in bots_data if b['bot_ativo'])

        return jsonify({
            'success': True,
            'data': {
                'bots': bots_data,
                'estatisticas': {
                    'total': total_bots,
                    'conectados': bots_conectados,
                    'ativos': bots_ativos,
                    'uptime': round((bots_ativos / bots_conectados * 100) if bots_conectados > 0 else 0, 1)
                }
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@admin_api_bp.route('/bots/<int:empresa_id>/toggle', methods=['POST'])
@admin_required
def toggle_bot(empresa_id):
    """Liga/desliga o bot de uma empresa"""
    session = db_manager.get_session()
    try:
        empresa = session.query(Empresa).filter_by(id=empresa_id).first()

        if not empresa:
            return jsonify({'success': False, 'error': 'Empresa nao encontrada'}), 404

        empresa.bot_ativo = not empresa.bot_ativo
        session.commit()

        return jsonify({
            'success': True,
            'message': f'Bot {"ativado" if empresa.bot_ativo else "desativado"} com sucesso',
            'bot_ativo': empresa.bot_ativo
        })
    except Exception as e:
        session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


# ==================== LOGS ====================

@admin_api_bp.route('/logs')
@admin_required
def listar_logs():
    """Lista logs do sistema"""
    session = db_manager.get_session()
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 50))
        tipo_filter = request.args.get('tipo', '')

        query = session.query(LogSistema)

        if tipo_filter:
            query = query.filter(LogSistema.tipo == tipo_filter)

        total = query.count()
        logs = query.order_by(LogSistema.criado_em.desc()).offset(
            (page - 1) * per_page
        ).limit(per_page).all()

        logs_data = []
        for log in logs:
            logs_data.append({
                'id': log.id,
                'tipo': log.tipo,
                'acao': log.acao,
                'descricao': log.descricao,
                'usuario_id': log.usuario_id,
                'empresa_id': log.empresa_id,
                'ip_address': log.ip_address,
                'user_agent': log.user_agent,
                'dados_adicionais': log.dados_adicionais,
                'criado_em': serialize_datetime(log.criado_em)
            })

        # Tipos de log disponíveis
        tipos = session.query(LogSistema.tipo).distinct().all()
        tipos_list = [t[0] for t in tipos if t[0]]

        return jsonify({
            'success': True,
            'data': {
                'logs': logs_data,
                'total': total,
                'page': page,
                'per_page': per_page,
                'total_pages': (total + per_page - 1) // per_page,
                'tipos_disponiveis': tipos_list
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


# ==================== BANCO DE DADOS ====================

@admin_api_bp.route('/database/stats')
@admin_required
def database_stats():
    """Retorna estatisticas do banco de dados"""
    session = db_manager.get_session()
    try:
        stats = {
            'tabelas': [
                {'nome': 'usuarios', 'registros': session.query(Usuario).count()},
                {'nome': 'empresas', 'registros': session.query(Empresa).count()},
                {'nome': 'leads', 'registros': session.query(Lead).count()},
                {'nome': 'conversas', 'registros': session.query(Conversa).count()},
                {'nome': 'mensagens', 'registros': session.query(Mensagem).count()},
                {'nome': 'campanhas', 'registros': session.query(Campanha).count()},
                {'nome': 'disparos', 'registros': session.query(Disparo).count()},
                {'nome': 'afiliados', 'registros': session.query(Afiliado).count()},
                {'nome': 'comissoes', 'registros': session.query(Comissao).count()},
                {'nome': 'logs_sistema', 'registros': session.query(LogSistema).count()},
                {'nome': 'produtos', 'registros': session.query(Produto).count()},
                {'nome': 'veiculos', 'registros': session.query(Veiculo).count()},
            ],
            'total_registros': 0,
            'ultimo_backup': None,
            'tamanho_db': 'N/A'
        }

        stats['total_registros'] = sum(t['registros'] for t in stats['tabelas'])

        return jsonify({
            'success': True,
            'data': stats
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


# ==================== CONFIGURACOES ====================

@admin_api_bp.route('/configuracoes')
@admin_required
def get_configuracoes():
    """Retorna configuracoes do sistema"""
    session = db_manager.get_session()
    try:
        # Buscar configuracoes de afiliados
        config_afiliados = session.query(ConfiguracaoAfiliados).first()

        config = {
            'afiliados': {
                'comissao_primeira_venda': config_afiliados.comissao_primeira_venda_padrao if config_afiliados else 30.0,
                'comissao_recorrente': config_afiliados.comissao_recorrente_padrao if config_afiliados else 20.0,
                'prazo_cookie_dias': config_afiliados.prazo_cookie_dias if config_afiliados else 30,
                'minimo_saque': config_afiliados.minimo_saque if config_afiliados else 50.0,
                'programa_ativo': config_afiliados.programa_ativo if config_afiliados else True
            },
            'planos': {
                'basico': {'nome': 'Basico', 'valor': 97, 'limite_leads': 100, 'limite_usuarios': 3},
                'profissional': {'nome': 'Profissional', 'valor': 197, 'limite_leads': 500, 'limite_usuarios': 10},
                'enterprise': {'nome': 'Enterprise', 'valor': 497, 'limite_leads': -1, 'limite_usuarios': -1}
            },
            'sistema': {
                'versao': '1.0.0',
                'ambiente': 'development',
                'database': 'SQLite'
            }
        }

        return jsonify({
            'success': True,
            'data': config
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@admin_api_bp.route('/configuracoes', methods=['PUT'])
@admin_required
def atualizar_configuracoes():
    """Atualiza configuracoes do sistema"""
    session = db_manager.get_session()
    try:
        data = request.get_json()

        # Atualizar configuracoes de afiliados
        if 'afiliados' in data:
            config = session.query(ConfiguracaoAfiliados).first()
            if not config:
                config = ConfiguracaoAfiliados()
                session.add(config)

            af_data = data['afiliados']
            if 'comissao_primeira_venda' in af_data:
                config.comissao_primeira_venda_padrao = af_data['comissao_primeira_venda']
            if 'comissao_recorrente' in af_data:
                config.comissao_recorrente_padrao = af_data['comissao_recorrente']
            if 'prazo_cookie_dias' in af_data:
                config.prazo_cookie_dias = af_data['prazo_cookie_dias']
            if 'minimo_saque' in af_data:
                config.minimo_saque = af_data['minimo_saque']
            if 'programa_ativo' in af_data:
                config.programa_ativo = af_data['programa_ativo']

        session.commit()

        return jsonify({
            'success': True,
            'message': 'Configuracoes atualizadas com sucesso'
        })
    except Exception as e:
        session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()
