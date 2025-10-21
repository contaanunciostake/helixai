"""
Dashboard Principal
"""

from flask import Blueprint, render_template
from flask_login import login_required, current_user
from sqlalchemy import func, desc
from datetime import datetime, timedelta
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent.parent))

from database.models import Lead, Conversa, Campanha, Empresa, StatusLead, TemperaturaLead
from backend import db_manager

bp = Blueprint('dashboard', __name__)


@bp.route('/')
@bp.route('/dashboard')
@login_required
def index():
    """Dashboard principal"""
    session = db_manager.get_session()

    try:
        empresa = session.query(Empresa).get(current_user.empresa_id)

        # Métricas gerais
        total_leads = session.query(Lead).filter_by(empresa_id=empresa.id).count()
        leads_quentes = session.query(Lead).filter_by(
            empresa_id=empresa.id,
            temperatura=TemperaturaLead.QUENTE
        ).count()
        leads_convertidos = session.query(Lead).filter_by(
            empresa_id=empresa.id,
            vendido=True
        ).count()
        conversas_ativas = session.query(Conversa).filter_by(
            empresa_id=empresa.id,
            ativa=True
        ).count()

        # Leads recentes
        leads_recentes = session.query(Lead).filter_by(
            empresa_id=empresa.id
        ).order_by(desc(Lead.criado_em)).limit(10).all()

        # Conversões últimos 30 dias
        trinta_dias_atras = datetime.utcnow() - timedelta(days=30)
        conversoes_mes = session.query(Lead).filter(
            Lead.empresa_id == empresa.id,
            Lead.vendido == True,
            Lead.criado_em >= trinta_dias_atras
        ).count()

        return render_template('dashboard/index.html',
                             total_leads=total_leads,
                             leads_quentes=leads_quentes,
                             leads_convertidos=leads_convertidos,
                             conversas_ativas=conversas_ativas,
                             leads_recentes=leads_recentes,
                             conversoes_mes=conversoes_mes,
                             empresa=empresa)

    finally:
        session.close()
