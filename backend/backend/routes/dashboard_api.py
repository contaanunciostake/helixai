"""
Dashboard API - Endpoints para o dashboard Dashtrans
"""

from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from sqlalchemy import func, desc, and_, or_
from datetime import datetime, timedelta
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent.parent))

from database.models import (
    Lead, Conversa, Mensagem, Campanha, Produto,
    StatusLead, TemperaturaLead, Empresa
)
from backend import db_manager

bp = Blueprint('dashboard_api', __name__, url_prefix='/api/dashboard')

# ==================== DEBUG ====================
print('\n' + '='*60)
print('         DASHBOARD API ROUTES - MODULO CARREGADO')
print('='*60)
print('[DASHBOARD API] Rotas disponiveis:')
print('[DASHBOARD API]   GET  /api/dashboard/metrics')
print('[DASHBOARD API]   GET  /api/dashboard/charts')
print('[DASHBOARD API]   GET  /api/dashboard/top-products')
print('[DASHBOARD API]   GET  /api/dashboard/transactions')
print('[DASHBOARD API]   POST /api/dashboard/export')
print('='*60 + '\n')


def calcular_variacao(atual, anterior):
    """Calcula variacao percentual entre dois valores"""
    if anterior == 0 or anterior is None:
        return 100.0 if atual > 0 else 0.0
    return round(((atual - anterior) / anterior) * 100, 2)


def calcular_diferenca(atual, anterior):
    """Calcula diferenca absoluta formatada"""
    if anterior is None:
        anterior = 0
    diff = atual - anterior
    sinal = '+' if diff > 0 else ''
    return f"{sinal}{diff:,.0f}"


@bp.route('/metrics', methods=['GET'])
@login_required
def get_metrics():
    """Busca metricas principais do dashboard"""

    print(f"\n[DASHBOARD API] " + "-"*40)
    print(f"[DASHBOARD API] GET /api/dashboard/metrics")
    print(f"[DASHBOARD API] User: {current_user.email}")
    print(f"[DASHBOARD API] Empresa ID: {current_user.empresa_id}")

    # Parametros
    periodo_dias = request.args.get('periodo', 30, type=int)

    session = db_manager.get_session()
    try:
        empresa_id = current_user.empresa_id

        # Datas
        fim = datetime.utcnow()
        inicio = fim - timedelta(days=periodo_dias)
        inicio_anterior = inicio - timedelta(days=periodo_dias)

        print(f"[DASHBOARD API] Periodo: {periodo_dias} dias")
        print(f"[DASHBOARD API] De {inicio.date()} ate {fim.date()}")

        # ==================== REVENUE ====================
        revenue_atual = session.query(
            func.coalesce(func.sum(Lead.valor_venda), 0)
        ).filter(
            Lead.empresa_id == empresa_id,
            Lead.vendido == True,
            Lead.data_venda.between(inicio, fim)
        ).scalar() or 0.0

        revenue_anterior = session.query(
            func.coalesce(func.sum(Lead.valor_venda), 0)
        ).filter(
            Lead.empresa_id == empresa_id,
            Lead.vendido == True,
            Lead.data_venda.between(inicio_anterior, inicio)
        ).scalar() or 0.0

        revenue_variacao = calcular_variacao(revenue_atual, revenue_anterior)
        revenue_diff = calcular_diferenca(revenue_atual, revenue_anterior)

        # ==================== CUSTOMERS ====================
        customers_atual = session.query(func.count(Lead.id)).filter(
            Lead.empresa_id == empresa_id,
            Lead.vendido == True,
            Lead.data_venda.between(inicio, fim)
        ).scalar() or 0

        customers_anterior = session.query(func.count(Lead.id)).filter(
            Lead.empresa_id == empresa_id,
            Lead.vendido == True,
            Lead.data_venda.between(inicio_anterior, inicio)
        ).scalar() or 0

        customers_variacao = calcular_variacao(customers_atual, customers_anterior)
        customers_diff = calcular_diferenca(customers_atual, customers_anterior)

        # ==================== VISITORS ====================
        # Usar conversas como proxy de visitantes
        visitors_atual = session.query(
            func.count(func.distinct(Conversa.telefone))
        ).filter(
            Conversa.empresa_id == empresa_id,
            Conversa.iniciada_em.between(inicio, fim)
        ).scalar() or 0

        visitors_anterior = session.query(
            func.count(func.distinct(Conversa.telefone))
        ).filter(
            Conversa.empresa_id == empresa_id,
            Conversa.iniciada_em.between(inicio_anterior, inicio)
        ).scalar() or 0

        visitors_variacao = calcular_variacao(visitors_atual, visitors_anterior)
        visitors_diff = calcular_diferenca(visitors_atual, visitors_anterior)

        # ==================== BOUNCE RATE ====================
        # Conversas com apenas 1 mensagem = bounce
        total_conversas = session.query(func.count(Conversa.id)).filter(
            Conversa.empresa_id == empresa_id,
            Conversa.iniciada_em.between(inicio, fim)
        ).scalar() or 0

        conversas_bounce = session.query(func.count(Conversa.id)).filter(
            Conversa.empresa_id == empresa_id,
            Conversa.iniciada_em.between(inicio, fim),
            Conversa.total_mensagens <= 1
        ).scalar() or 0

        bounce_rate_atual = (conversas_bounce / total_conversas * 100) if total_conversas > 0 else 0.0

        # Bounce rate periodo anterior
        total_conversas_ant = session.query(func.count(Conversa.id)).filter(
            Conversa.empresa_id == empresa_id,
            Conversa.iniciada_em.between(inicio_anterior, inicio)
        ).scalar() or 0

        conversas_bounce_ant = session.query(func.count(Conversa.id)).filter(
            Conversa.empresa_id == empresa_id,
            Conversa.iniciada_em.between(inicio_anterior, inicio),
            Conversa.total_mensagens <= 1
        ).scalar() or 0

        bounce_rate_anterior = (conversas_bounce_ant / total_conversas_ant * 100) if total_conversas_ant > 0 else 0.0

        # Para bounce rate, variacao negativa e boa
        bounce_variacao = bounce_rate_atual - bounce_rate_anterior
        bounce_status = 'improved' if bounce_variacao < 0 else ('worsened' if bounce_variacao > 0 else 'stable')

        print(f"[DASHBOARD API] [OK] Revenue: R$ {revenue_atual:,.2f}")
        print(f"[DASHBOARD API] [OK] Customers: {customers_atual}")
        print(f"[DASHBOARD API] [OK] Visitors: {visitors_atual}")
        print(f"[DASHBOARD API] [OK] Bounce Rate: {bounce_rate_atual:.2f}%")
        print(f"[DASHBOARD API] " + "-"*40 + "\n")

        return jsonify({
            'periodo': {
                'dias': periodo_dias,
                'inicio': inicio.date().isoformat(),
                'fim': fim.date().isoformat()
            },
            'metricas': {
                'revenue': {
                    'valor': float(revenue_atual),
                    'variacao': revenue_variacao,
                    'comparacao_periodo_anterior': f"R$ {revenue_diff}",
                    'valor_anterior': float(revenue_anterior)
                },
                'customers': {
                    'total': customers_atual,
                    'variacao': customers_variacao,
                    'comparacao_periodo_anterior': f"{customers_diff} clientes",
                    'total_anterior': customers_anterior
                },
                'visitors': {
                    'total': visitors_atual,
                    'variacao': visitors_variacao,
                    'comparacao_periodo_anterior': f"{visitors_diff} visitantes",
                    'total_anterior': visitors_anterior
                },
                'bounce_rate': {
                    'taxa': round(bounce_rate_atual, 2),
                    'variacao': round(bounce_variacao, 2),
                    'status': bounce_status,
                    'taxa_anterior': round(bounce_rate_anterior, 2)
                }
            }
        })

    except Exception as e:
        print(f"[DASHBOARD API] [X] ERRO: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@bp.route('/charts', methods=['GET'])
@login_required
def get_charts():
    """Busca dados para os graficos do dashboard"""

    print(f"\n[DASHBOARD API] GET /api/dashboard/charts")

    periodo_dias = request.args.get('periodo', 30, type=int)
    tipos = request.args.get('tipos', 'revenue,customers,visitors').split(',')

    session = db_manager.get_session()
    try:
        empresa_id = current_user.empresa_id
        fim = datetime.utcnow()
        inicio = fim - timedelta(days=periodo_dias)

        resultado = {}

        # ==================== REVENUE CHART ====================
        if 'revenue' in tipos:
            revenue_data = session.query(
                func.date(Lead.data_venda).label('date'),
                func.sum(Lead.valor_venda).label('value')
            ).filter(
                Lead.empresa_id == empresa_id,
                Lead.vendido == True,
                Lead.data_venda.between(inicio, fim)
            ).group_by(
                func.date(Lead.data_venda)
            ).order_by('date').all()

            resultado['revenue_chart'] = [
                {
                    'date': row.date.isoformat() if row.date else None,
                    'value': float(row.value) if row.value else 0.0
                }
                for row in revenue_data
            ]

        # ==================== CUSTOMERS CHART ====================
        if 'customers' in tipos:
            customers_data = session.query(
                func.date(Lead.data_venda).label('date'),
                func.count(Lead.id).label('value')
            ).filter(
                Lead.empresa_id == empresa_id,
                Lead.vendido == True,
                Lead.data_venda.between(inicio, fim)
            ).group_by(
                func.date(Lead.data_venda)
            ).order_by('date').all()

            resultado['customers_chart'] = [
                {
                    'date': row.date.isoformat() if row.date else None,
                    'value': row.value if row.value else 0
                }
                for row in customers_data
            ]

        # ==================== VISITORS CHART ====================
        if 'visitors' in tipos:
            visitors_data = session.query(
                func.date(Conversa.iniciada_em).label('date'),
                func.count(func.distinct(Conversa.telefone)).label('value')
            ).filter(
                Conversa.empresa_id == empresa_id,
                Conversa.iniciada_em.between(inicio, fim)
            ).group_by(
                func.date(Conversa.iniciada_em)
            ).order_by('date').all()

            resultado['visitors_chart'] = [
                {
                    'date': row.date.isoformat() if row.date else None,
                    'value': row.value if row.value else 0
                }
                for row in visitors_data
            ]

        print(f"[DASHBOARD API] [OK] Charts gerados para: {', '.join(tipos)}")
        return jsonify(resultado)

    except Exception as e:
        print(f"[DASHBOARD API] [X] ERRO: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@bp.route('/top-products', methods=['GET'])
@login_required
def get_top_products():
    """Busca top 10 produtos mais vendidos"""

    print(f"\n[DASHBOARD API] GET /api/dashboard/top-products")

    limit = request.args.get('limit', 10, type=int)
    periodo_dias = request.args.get('periodo', 30, type=int)

    session = db_manager.get_session()
    try:
        empresa_id = current_user.empresa_id
        fim = datetime.utcnow()
        inicio = fim - timedelta(days=periodo_dias)

        # Total revenue para calcular percentuais
        total_revenue = session.query(
            func.coalesce(func.sum(Lead.valor_venda), 0)
        ).filter(
            Lead.empresa_id == empresa_id,
            Lead.vendido == True,
            Lead.data_venda.between(inicio, fim)
        ).scalar() or 0.0

        # Top produtos (usando produto_nome dos leads)
        produtos_data = session.query(
            Lead.produto_nome.label('name'),
            func.count(Lead.id).label('sales'),
            func.sum(Lead.valor_venda).label('revenue')
        ).filter(
            Lead.empresa_id == empresa_id,
            Lead.vendido == True,
            Lead.produto_nome.isnot(None),
            Lead.data_venda.between(inicio, fim)
        ).group_by(
            Lead.produto_nome
        ).order_by(
            desc('revenue')
        ).limit(limit).all()

        produtos = []
        for row in produtos_data:
            revenue = float(row.revenue) if row.revenue else 0.0
            percentage = (revenue / total_revenue * 100) if total_revenue > 0 else 0.0

            produtos.append({
                'name': row.name or 'Sem nome',
                'sales': row.sales or 0,
                'revenue': revenue,
                'percentage': round(percentage, 2)
            })

        print(f"[DASHBOARD API] [OK] {len(produtos)} produtos retornados")

        return jsonify({
            'products': produtos,
            'total_revenue': float(total_revenue),
            'periodo_dias': periodo_dias
        })

    except Exception as e:
        print(f"[DASHBOARD API] [X] ERRO: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@bp.route('/transactions', methods=['GET'])
@login_required
def get_transactions():
    """Busca historico de transacoes com paginacao"""

    print(f"\n[DASHBOARD API] GET /api/dashboard/transactions")

    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 10, type=int)
    status_filter = request.args.get('status', 'all')
    sort = request.args.get('sort', 'date_desc')

    session = db_manager.get_session()
    try:
        empresa_id = current_user.empresa_id

        # Query base
        query = session.query(Lead).filter(
            Lead.empresa_id == empresa_id,
            Lead.vendido == True
        )

        # Filtro de status
        if status_filter != 'all':
            try:
                status_enum = StatusLead[status_filter.upper()]
                query = query.filter(Lead.status == status_enum)
            except KeyError:
                pass

        # Ordenacao
        if sort == 'date_desc':
            query = query.order_by(desc(Lead.data_venda))
        elif sort == 'date_asc':
            query = query.order_by(Lead.data_venda)
        elif sort == 'value_desc':
            query = query.order_by(desc(Lead.valor_venda))
        elif sort == 'value_asc':
            query = query.order_by(Lead.valor_venda)

        # Total de itens
        total_items = query.count()
        total_pages = (total_items + limit - 1) // limit  # Ceiling division

        # Paginacao
        offset = (page - 1) * limit
        leads = query.limit(limit).offset(offset).all()

        # Formatar resultado
        transactions = []
        for lead in leads:
            transactions.append({
                'order_id': f"ORD-{str(lead.id).zfill(6)}",
                'date': lead.data_venda.isoformat() if lead.data_venda else lead.criado_em.isoformat(),
                'customer_name': lead.nome or 'Sem nome',
                'customer_phone': lead.telefone,
                'payment_status': lead.status_pagamento if hasattr(lead, 'status_pagamento') else 'PENDENTE',
                'total': float(lead.valor_venda) if lead.valor_venda else 0.0,
                'payment_method': getattr(lead, 'metodo_pagamento', None) or 'Nao informado',
                'status': lead.status.name if hasattr(lead.status, 'name') else str(lead.status),
                'product_name': getattr(lead, 'produto_nome', None)
            })

        print(f"[DASHBOARD API] [OK] Pagina {page}/{total_pages}, {len(transactions)} transacoes")

        return jsonify({
            'transactions': transactions,
            'pagination': {
                'current_page': page,
                'total_pages': total_pages,
                'total_items': total_items,
                'items_per_page': limit,
                'has_next': page < total_pages,
                'has_prev': page > 1
            }
        })

    except Exception as e:
        print(f"[DASHBOARD API] [X] ERRO: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@bp.route('/export', methods=['POST'])
@login_required
def export_data():
    """Exporta dados do dashboard em CSV ou PDF"""

    print(f"\n[DASHBOARD API] POST /api/dashboard/export")

    data = request.get_json()
    tipo = data.get('tipo', 'csv')  # csv ou pdf
    dados_tipo = data.get('dados', 'transactions')  # transactions, products, analytics
    filtros = data.get('filtros', {})

    # TODO: Implementar exportacao CSV/PDF
    # Por enquanto, retornar mensagem de nao implementado

    print(f"[DASHBOARD API] [!] Exportacao ainda nao implementada")

    return jsonify({
        'message': 'Exportacao em desenvolvimento',
        'tipo': tipo,
        'dados_tipo': dados_tipo
    }), 501  # Not Implemented


@bp.route('/summary', methods=['GET'])
@login_required
def get_summary():
    """Busca resumo geral do dashboard (todas metricas de uma vez)"""

    print(f"\n[DASHBOARD API] GET /api/dashboard/summary")

    periodo_dias = request.args.get('periodo', 30, type=int)

    session = db_manager.get_session()
    try:
        empresa_id = current_user.empresa_id

        # Total de leads
        total_leads = session.query(func.count(Lead.id)).filter(
            Lead.empresa_id == empresa_id
        ).scalar() or 0

        # Leads quentes
        leads_quentes = session.query(func.count(Lead.id)).filter(
            Lead.empresa_id == empresa_id,
            Lead.temperatura == TemperaturaLead.QUENTE
        ).scalar() or 0

        # Conversas ativas
        conversas_ativas = session.query(func.count(Conversa.id)).filter(
            Conversa.empresa_id == empresa_id,
            Conversa.ativa == True
        ).scalar() or 0

        # Taxa de conversao geral
        total_convertidos = session.query(func.count(Lead.id)).filter(
            Lead.empresa_id == empresa_id,
            Lead.vendido == True
        ).scalar() or 0

        taxa_conversao_geral = (total_convertidos / total_leads * 100) if total_leads > 0 else 0.0

        print(f"[DASHBOARD API] [OK] Summary gerado")

        return jsonify({
            'total_leads': total_leads,
            'leads_quentes': leads_quentes,
            'conversas_ativas': conversas_ativas,
            'total_convertidos': total_convertidos,
            'taxa_conversao_geral': round(taxa_conversao_geral, 2)
        })

    except Exception as e:
        print(f"[DASHBOARD API] [X] ERRO: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()
