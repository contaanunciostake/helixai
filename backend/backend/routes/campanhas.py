"""Rotas de Campanhas"""
from flask import Blueprint, render_template
from flask_login import login_required, current_user
from sqlalchemy import desc
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent.parent))
from database.models import Campanha
from backend import db_manager

bp = Blueprint('campanhas', __name__, url_prefix='/campanhas')

@bp.route('/')
@login_required
def index():
    session = db_manager.get_session()
    try:
        campanhas_list = session.query(Campanha).filter_by(
            empresa_id=current_user.empresa_id
        ).order_by(desc(Campanha.criada_em)).all()
        return render_template('campanhas/index.html', campanhas=campanhas_list)
    finally:
        session.close()
