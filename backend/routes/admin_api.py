"""
Backend Admin API - Routes para Painel Administrativo React
Sistema AIRA Multi-tenant
"""

from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from functools import wraps
from datetime import datetime, timedelta
from sqlalchemy import func, desc, and_, or_
from sqlalchemy.orm import joinedload
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent.parent))
from database.models import (
    Usuario, Empresa, Lead, Conversa, Mensagem, Campanha,
    TipoUsuario, PlanoAssinatura, StatusLead, NichoEmpresa
)
from backend import db_manager

bp = Blueprint('admin_api', __name__, url_prefix='/api/admin')


# ==================== DECORATORS ====================

def admin_required(f):
    """Decorator para garantir que apenas SUPER_ADMIN pode acessar"""
    @wraps(f)
    @login_required
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            return jsonify({'success': False, 'error': 'Autenticação necessária'}), 401

        if current_user.tipo != TipoUsuario.SUPER_ADMIN:
            return jsonify({'success': False, 'error': 'Acesso negado - apenas Super Admin'}), 403

        return f(*args, **kwargs)
    return decorated_function


# ==================== DASHBOARD METRICS ====================

@bp.route('/dashboard/metrics', methods=['GET'])
@admin_required
def get_dashboard_metrics():
    """
    API: Métricas principais do dashboard admin
    Retorna: MRR, empresas ativas, usuários, bots, distribuição por plano
    """
    session = db_manager.get_session()
    try:
        # Data de referência
        hoje = datetime.now()
        mes_passado = hoje - timedelta(days=30)

        # ========== EMPRESAS ==========
        total_empresas = session.query(Empresa).count()
        empresas_ativas = session.query(Empresa).filter(
            Empresa.plano_ativo == True
        ).count()
        empresas_trial = session.query(Empresa).filter(
            Empresa.plano == PlanoAssinatura.GRATUITO
        ).count()
        empresas_inadimplentes = session.query(Empresa).filter(
            and_(
                Empresa.plano != PlanoAssinatura.GRATUITO,
                Empresa.plano_ativo == False
            )
        ).count()

        # ========== USUÁRIOS ==========
        total_usuarios = session.query(Usuario).filter(Usuario.ativo == True).count()
        usuarios_mes_passado = session.query(Usuario).filter(
            and_(
                Usuario.ativo == True,
                Usuario.criado_em >= mes_passado
            )
        ).count()

        # ========== BOTS WHATSAPP ==========
        bots_ativos = session.query(Empresa).filter(
            and_(
                Empresa.whatsapp_conectado == True,
                Empresa.bot_ativo == True
            )
        ).count()
        total_bots_conectados = session.query(Empresa).filter(
            Empresa.whatsapp_conectado == True
        ).count()
        uptime_bots = (bots_ativos / total_bots_conectados * 100) if total_bots_conectados > 0 else 0

        # ========== FINANCEIRO - MRR ==========
        # Calcular MRR baseado nos planos ativos
        planos_valores = {
            PlanoAssinatura.GRATUITO: 0,
            PlanoAssinatura.BASICO: 97.00,
            PlanoAssinatura.PROFISSIONAL: 197.00,
            PlanoAssinatura.ENTERPRISE: 497.00
        }

        empresas_por_plano = session.query(
            Empresa.plano, func.count(Empresa.id)
        ).filter(
            Empresa.plano_ativo == True
        ).group_by(Empresa.plano).all()

        mrr = 0
        distribuicao_planos = {}
        for plano, count in empresas_por_plano:
            valor = planos_valores.get(plano, 0)
            mrr += valor * count
            distribuicao_planos[plano.value] = {
                'count': count,
                'valor': valor,
                'total': valor * count
            }

        # Calcular variação de MRR (simulado - idealmente buscar histórico)
        variacao_mrr = 12.5  # TODO: Calcular baseado em histórico real

        # ARR (Annual Recurring Revenue)
        arr = mrr * 12

        # ========== CONVERSAS & MENSAGENS ==========
        conversas_hoje = session.query(Conversa).filter(
            func.date(Conversa.criado_em) == hoje.date()
        ).count()

        mensagens_mes = session.query(Mensagem).filter(
            Mensagem.criado_em >= mes_passado
        ).count()

        # ========== LEADS ==========
        total_leads = session.query(Lead).count()
        leads_mes = session.query(Lead).filter(
            Lead.criado_em >= mes_passado
        ).count()
        leads_convertidos = session.query(Lead).filter(
            Lead.status == StatusLead.GANHO
        ).count()
        taxa_conversao = (leads_convertidos / total_leads * 100) if total_leads > 0 else 0

        # ========== ATIVIDADES RECENTES ==========
        # Últimas 10 empresas criadas
        empresas_recentes = session.query(Empresa).order_by(
            desc(Empresa.criado_em)
        ).limit(10).all()

        atividades_recentes = []
        for empresa in empresas_recentes:
            atividades_recentes.append({
                'tipo': 'nova_empresa',
                'descricao': f'Nova empresa: {empresa.nome}',
                'plano': empresa.plano.value,
                'data': empresa.criado_em.isoformat() if empresa.criado_em else None
            })

        # ========== ALERTAS CRÍTICOS ==========
        alertas = []

        # Alerta: Empresas inadimplentes
        if empresas_inadimplentes > 0:
            alertas.append({
                'tipo': 'inadimplencia',
                'severidade': 'alta',
                'mensagem': f'{empresas_inadimplentes} empresas inadimplentes',
                'count': empresas_inadimplentes
            })

        # Alerta: Bots desconectados
        bots_desconectados = total_empresas - total_bots_conectados
        if bots_desconectados > 5:
            alertas.append({
                'tipo': 'bots_offline',
                'severidade': 'media',
                'mensagem': f'{bots_desconectados} bots desconectados',
                'count': bots_desconectados
            })

        # Alerta: Muitas empresas em trial
        if empresas_trial > total_empresas * 0.3:
            alertas.append({
                'tipo': 'trials',
                'severidade': 'baixa',
                'mensagem': f'{empresas_trial} empresas em trial (conversão baixa)',
                'count': empresas_trial
            })

        # ========== RETORNO ==========
        return jsonify({
            'success': True,
            'data': {
                # Financeiro
                'mrr': mrr,
                'arr': arr,
                'variacao_mrr': variacao_mrr,

                # Empresas
                'total_empresas': total_empresas,
                'empresas_ativas': empresas_ativas,
                'empresas_trial': empresas_trial,
                'empresas_inadimplentes': empresas_inadimplentes,

                # Usuários
                'total_usuarios': total_usuarios,
                'usuarios_novos_mes': usuarios_mes_passado,

                # Bots
                'bots_ativos': bots_ativos,
                'total_bots_conectados': total_bots_conectados,
                'uptime_bots': round(uptime_bots, 1),

                # Conversas & Mensagens
                'conversas_hoje': conversas_hoje,
                'mensagens_mes': mensagens_mes,

                # Leads
                'total_leads': total_leads,
                'leads_mes': leads_mes,
                'taxa_conversao': round(taxa_conversao, 1),

                # Distribuição por plano
                'distribuicao_planos': distribuicao_planos,

                # Atividades recentes
                'atividades_recentes': atividades_recentes[:5],  # Retornar apenas 5

                # Alertas
                'alertas': alertas
            }
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


# ==================== GESTÃO DE EMPRESAS ====================

@bp.route('/empresas', methods=['GET'])
@admin_required
def get_empresas():
    """
    API: Listar todas as empresas com filtros e paginação
    Query params: page, limit, plano, status, search
    """
    session = db_manager.get_session()
    try:
        # Parâmetros de query
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 20, type=int)
        plano_filtro = request.args.get('plano', None)
        status_filtro = request.args.get('status', None)
        search = request.args.get('search', None)

        # Query base
        query = session.query(Empresa)

        # Filtros
        if plano_filtro:
            try:
                query = query.filter(Empresa.plano == PlanoAssinatura[plano_filtro.upper()])
            except KeyError:
                pass

        if status_filtro == 'ativo':
            query = query.filter(Empresa.plano_ativo == True)
        elif status_filtro == 'inativo':
            query = query.filter(Empresa.plano_ativo == False)

        if search:
            search_pattern = f'%{search}%'
            query = query.filter(
                or_(
                    Empresa.nome.ilike(search_pattern),
                    Empresa.email.ilike(search_pattern),
                    Empresa.cnpj.ilike(search_pattern)
                )
            )

        # Total
        total = query.count()

        # Paginação
        offset = (page - 1) * limit
        empresas = query.order_by(desc(Empresa.criado_em)).offset(offset).limit(limit).all()

        # Serializar empresas
        empresas_list = []
        for empresa in empresas:
            # Contar usuários
            num_usuarios = session.query(Usuario).filter(
                Usuario.empresa_id == empresa.id,
                Usuario.ativo == True
            ).count()

            # Contar leads
            num_leads = session.query(Lead).filter(Lead.empresa_id == empresa.id).count()

            # Contar conversas ativas
            num_conversas = session.query(Conversa).filter(
                Conversa.empresa_id == empresa.id
            ).count()

            empresas_list.append({
                'id': empresa.id,
                'nome': empresa.nome,
                'nome_fantasia': empresa.nome_fantasia,
                'email': empresa.email,
                'cnpj': empresa.cnpj,
                'telefone': empresa.telefone,
                'nicho': empresa.nicho.value if empresa.nicho else None,
                'plano': empresa.plano.value,
                'plano_ativo': empresa.plano_ativo,
                'whatsapp_conectado': empresa.whatsapp_conectado,
                'whatsapp_numero': empresa.whatsapp_numero,
                'bot_ativo': empresa.bot_ativo,
                'criado_em': empresa.criado_em.isoformat() if empresa.criado_em else None,
                'num_usuarios': num_usuarios,
                'num_leads': num_leads,
                'num_conversas': num_conversas
            })

        return jsonify({
            'success': True,
            'data': {
                'empresas': empresas_list,
                'total': total,
                'page': page,
                'limit': limit,
                'total_pages': (total + limit - 1) // limit
            }
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@bp.route('/empresas/<int:empresa_id>', methods=['GET'])
@admin_required
def get_empresa_detalhes(empresa_id):
    """API: Obter detalhes completos de uma empresa"""
    session = db_manager.get_session()
    try:
        empresa = session.query(Empresa).options(
            joinedload(Empresa.usuarios),
            joinedload(Empresa.configuracao)
        ).get(empresa_id)

        if not empresa:
            return jsonify({'success': False, 'error': 'Empresa não encontrada'}), 404

        # Estatísticas da empresa
        total_leads = session.query(Lead).filter(Lead.empresa_id == empresa_id).count()
        total_conversas = session.query(Conversa).filter(Conversa.empresa_id == empresa_id).count()
        total_mensagens = session.query(Mensagem).join(Conversa).filter(
            Conversa.empresa_id == empresa_id
        ).count()
        total_campanhas = session.query(Campanha).filter(Campanha.empresa_id == empresa_id).count()

        # Usuários da empresa
        usuarios_list = []
        for usuario in empresa.usuarios:
            usuarios_list.append({
                'id': usuario.id,
                'nome': usuario.nome,
                'email': usuario.email,
                'tipo': usuario.tipo.value,
                'ativo': usuario.ativo,
                'ultimo_acesso': usuario.ultimo_acesso.isoformat() if usuario.ultimo_acesso else None
            })

        return jsonify({
            'success': True,
            'data': {
                'id': empresa.id,
                'nome': empresa.nome,
                'nome_fantasia': empresa.nome_fantasia,
                'cnpj': empresa.cnpj,
                'email': empresa.email,
                'telefone': empresa.telefone,
                'website': empresa.website,
                'endereco': empresa.endereco,
                'cidade': empresa.cidade,
                'estado': empresa.estado,
                'cep': empresa.cep,
                'nicho': empresa.nicho.value if empresa.nicho else None,
                'plano': empresa.plano.value,
                'plano_ativo': empresa.plano_ativo,
                'data_inicio_plano': empresa.data_inicio_plano.isoformat() if empresa.data_inicio_plano else None,
                'data_fim_plano': empresa.data_fim_plano.isoformat() if empresa.data_fim_plano else None,
                'whatsapp_numero': empresa.whatsapp_numero,
                'whatsapp_conectado': empresa.whatsapp_conectado,
                'bot_ativo': empresa.bot_ativo,
                'limite_leads': empresa.limite_leads,
                'limite_disparos_mes': empresa.limite_disparos_mes,
                'limite_usuarios': empresa.limite_usuarios,
                'criado_em': empresa.criado_em.isoformat() if empresa.criado_em else None,
                'usuarios': usuarios_list,
                'estatisticas': {
                    'total_leads': total_leads,
                    'total_conversas': total_conversas,
                    'total_mensagens': total_mensagens,
                    'total_campanhas': total_campanhas
                }
            }
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@bp.route('/empresas/<int:empresa_id>', methods=['PUT'])
@admin_required
def update_empresa(empresa_id):
    """API: Atualizar dados de uma empresa"""
    session = db_manager.get_session()
    try:
        empresa = session.query(Empresa).get(empresa_id)

        if not empresa:
            return jsonify({'success': False, 'error': 'Empresa não encontrada'}), 404

        data = request.get_json()

        # Atualizar campos permitidos
        campos_permitidos = [
            'nome', 'nome_fantasia', 'email', 'telefone', 'cnpj', 'website',
            'endereco', 'cidade', 'estado', 'cep',
            'plano_ativo', 'bot_ativo',
            'limite_leads', 'limite_disparos_mes', 'limite_usuarios'
        ]

        for campo in campos_permitidos:
            if campo in data:
                setattr(empresa, campo, data[campo])

        # Atualizar plano (enum)
        if 'plano' in data:
            try:
                empresa.plano = PlanoAssinatura[data['plano'].upper()]
            except KeyError:
                return jsonify({'success': False, 'error': 'Plano inválido'}), 400

        # Atualizar nicho (enum)
        if 'nicho' in data:
            try:
                empresa.nicho = NichoEmpresa[data['nicho'].upper()]
            except KeyError:
                return jsonify({'success': False, 'error': 'Nicho inválido'}), 400

        empresa.atualizado_em = datetime.utcnow()
        session.commit()

        return jsonify({
            'success': True,
            'message': 'Empresa atualizada com sucesso',
            'data': {
                'id': empresa.id,
                'nome': empresa.nome,
                'plano': empresa.plano.value,
                'plano_ativo': empresa.plano_ativo
            }
        })

    except Exception as e:
        session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@bp.route('/empresas', methods=['POST'])
@admin_required
def create_empresa():
    """API: Criar nova empresa"""
    session = db_manager.get_session()
    try:
        data = request.get_json()

        # Validar campos obrigatórios
        if 'nome' not in data or 'email' not in data:
            return jsonify({'success': False, 'error': 'Nome e email são obrigatórios'}), 400

        # Verificar se email já existe
        empresa_existente = session.query(Empresa).filter(Empresa.email == data['email']).first()
        if empresa_existente:
            return jsonify({'success': False, 'error': 'Email já cadastrado'}), 400

        # Criar empresa
        nova_empresa = Empresa(
            nome=data['nome'],
            nome_fantasia=data.get('nome_fantasia', data['nome']),
            email=data['email'],
            telefone=data.get('telefone'),
            cnpj=data.get('cnpj'),
            plano=PlanoAssinatura[data.get('plano', 'GRATUITO').upper()],
            plano_ativo=True
        )

        # Nicho (opcional)
        if 'nicho' in data:
            try:
                nova_empresa.nicho = NichoEmpresa[data['nicho'].upper()]
            except KeyError:
                pass

        session.add(nova_empresa)
        session.commit()

        return jsonify({
            'success': True,
            'message': 'Empresa criada com sucesso',
            'data': {
                'id': nova_empresa.id,
                'nome': nova_empresa.nome,
                'email': nova_empresa.email
            }
        }), 201

    except Exception as e:
        session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@bp.route('/empresas/<int:empresa_id>', methods=['DELETE'])
@admin_required
def delete_empresa(empresa_id):
    """API: Desativar empresa (soft delete)"""
    session = db_manager.get_session()
    try:
        empresa = session.query(Empresa).get(empresa_id)

        if not empresa:
            return jsonify({'success': False, 'error': 'Empresa não encontrada'}), 404

        # Soft delete: apenas desativa
        empresa.plano_ativo = False
        empresa.bot_ativo = False
        empresa.whatsapp_conectado = False

        # Desativar todos os usuários
        session.query(Usuario).filter(Usuario.empresa_id == empresa_id).update({'ativo': False})

        session.commit()

        return jsonify({
            'success': True,
            'message': 'Empresa desativada com sucesso'
        })

    except Exception as e:
        session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


# ==================== GESTÃO DE USUÁRIOS ====================

@bp.route('/usuarios', methods=['GET'])
@admin_required
def get_usuarios():
    """API: Listar todos os usuários com filtros"""
    session = db_manager.get_session()
    try:
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 20, type=int)
        tipo_filtro = request.args.get('tipo', None)
        empresa_id = request.args.get('empresa_id', None, type=int)
        search = request.args.get('search', None)

        query = session.query(Usuario).options(joinedload(Usuario.empresa))

        # Filtros
        if tipo_filtro:
            try:
                query = query.filter(Usuario.tipo == TipoUsuario[tipo_filtro.upper()])
            except KeyError:
                pass

        if empresa_id:
            query = query.filter(Usuario.empresa_id == empresa_id)

        if search:
            search_pattern = f'%{search}%'
            query = query.filter(
                or_(
                    Usuario.nome.ilike(search_pattern),
                    Usuario.email.ilike(search_pattern)
                )
            )

        total = query.count()
        offset = (page - 1) * limit
        usuarios = query.order_by(desc(Usuario.criado_em)).offset(offset).limit(limit).all()

        usuarios_list = []
        for usuario in usuarios:
            usuarios_list.append({
                'id': usuario.id,
                'nome': usuario.nome,
                'email': usuario.email,
                'tipo': usuario.tipo.value,
                'ativo': usuario.ativo,
                'telefone': usuario.telefone,
                'empresa_id': usuario.empresa_id,
                'empresa_nome': usuario.empresa.nome if usuario.empresa else None,
                'criado_em': usuario.criado_em.isoformat() if usuario.criado_em else None,
                'ultimo_acesso': usuario.ultimo_acesso.isoformat() if usuario.ultimo_acesso else None
            })

        return jsonify({
            'success': True,
            'data': {
                'usuarios': usuarios_list,
                'total': total,
                'page': page,
                'limit': limit,
                'total_pages': (total + limit - 1) // limit
            }
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@bp.route('/usuarios/<int:usuario_id>', methods=['GET'])
@admin_required
def get_usuario_detalhes(usuario_id):
    """API: Obter detalhes de um usuário"""
    session = db_manager.get_session()
    try:
        usuario = session.query(Usuario).options(joinedload(Usuario.empresa)).get(usuario_id)

        if not usuario:
            return jsonify({'success': False, 'error': 'Usuário não encontrado'}), 404

        return jsonify({
            'success': True,
            'data': {
                'id': usuario.id,
                'nome': usuario.nome,
                'email': usuario.email,
                'tipo': usuario.tipo.value,
                'ativo': usuario.ativo,
                'telefone': usuario.telefone,
                'avatar_url': usuario.avatar_url,
                'timezone': usuario.timezone,
                'empresa_id': usuario.empresa_id,
                'empresa_nome': usuario.empresa.nome if usuario.empresa else None,
                'criado_em': usuario.criado_em.isoformat() if usuario.criado_em else None,
                'ultimo_acesso': usuario.ultimo_acesso.isoformat() if usuario.ultimo_acesso else None
            }
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@bp.route('/usuarios/<int:usuario_id>', methods=['PUT'])
@admin_required
def update_usuario(usuario_id):
    """API: Atualizar dados de um usuário"""
    session = db_manager.get_session()
    try:
        usuario = session.query(Usuario).get(usuario_id)

        if not usuario:
            return jsonify({'success': False, 'error': 'Usuário não encontrado'}), 404

        data = request.get_json()

        # Campos permitidos
        campos_permitidos = ['nome', 'email', 'telefone', 'ativo', 'avatar_url', 'timezone']

        for campo in campos_permitidos:
            if campo in data:
                setattr(usuario, campo, data[campo])

        # Atualizar tipo (enum)
        if 'tipo' in data:
            try:
                usuario.tipo = TipoUsuario[data['tipo'].upper()]
            except KeyError:
                return jsonify({'success': False, 'error': 'Tipo de usuário inválido'}), 400

        session.commit()

        return jsonify({
            'success': True,
            'message': 'Usuário atualizado com sucesso'
        })

    except Exception as e:
        session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


# ==================== DOCS ====================

@bp.route('/docs', methods=['GET'])
def admin_docs():
    """Documentação das APIs Admin"""
    return jsonify({
        'version': '1.0.0',
        'description': 'APIs administrativas do sistema AIRA Multi-tenant',
        'endpoints': {
            'Dashboard': {
                'GET /api/admin/dashboard/metrics': 'Métricas principais do dashboard (MRR, empresas, usuários, bots)'
            },
            'Empresas': {
                'GET /api/admin/empresas': 'Listar empresas (filtros: page, limit, plano, status, search)',
                'GET /api/admin/empresas/<id>': 'Detalhes de uma empresa',
                'POST /api/admin/empresas': 'Criar nova empresa',
                'PUT /api/admin/empresas/<id>': 'Atualizar empresa',
                'DELETE /api/admin/empresas/<id>': 'Desativar empresa'
            },
            'Usuários': {
                'GET /api/admin/usuarios': 'Listar usuários (filtros: page, limit, tipo, empresa_id, search)',
                'GET /api/admin/usuarios/<id>': 'Detalhes de um usuário',
                'PUT /api/admin/usuarios/<id>': 'Atualizar usuário'
            }
        },
        'authentication': 'Requer autenticação e tipo SUPER_ADMIN'
    })
