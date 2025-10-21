"""
VendeAI Backend - API Flask
"""

from flask import Flask
from flask_cors import CORS
from flask_login import LoginManager
import sys
from pathlib import Path

# Adicionar pasta raiz ao path
sys.path.append(str(Path(__file__).parent.parent))

from database.models import DatabaseManager, Usuario
from database.hybrid_db_manager import get_hybrid_db_manager
import os
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# Inicializar Flask
app = Flask(__name__,
            template_folder='templates',
            static_folder='static')

# Configurações
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'vendeai-secret-key-change-in-production')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///../vendeai.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Configurações de sessão para cross-origin (desenvolvimento)
app.config['SESSION_COOKIE_SAMESITE'] = 'None' if os.getenv('FLASK_ENV') == 'production' else 'Lax'
app.config['SESSION_COOKIE_SECURE'] = False  # True em produção com HTTPS
app.config['SESSION_COOKIE_HTTPONLY'] = True

# CORS - Configuração completa para suportar autenticação cross-origin
CORS(app,
     resources={
         r"/*": {
             "origins": [
                 "http://localhost:5173",
                 "http://localhost:5174",
                 "http://localhost:5175",
                 "http://localhost:5176",
                 "http://localhost:5177",
                 "http://localhost:3000",
                 "http://localhost:3001",
                 "http://localhost:4000"
             ],
             "supports_credentials": True,
             "allow_headers": ["Content-Type", "Authorization", "X-API-Key"],
             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
         }
     })

# Database Manager - Usar gerenciador híbrido se remoto estiver habilitado
use_remote = os.getenv('USE_REMOTE_DB', 'False').lower() == 'true'

if use_remote:
    db_manager = get_hybrid_db_manager()
    print("[INFO] Usando gerenciador híbrido de banco de dados (Local + Remoto)")
else:
    db_manager = DatabaseManager('sqlite:///vendeai.db')
    print("[INFO] Usando gerenciador de banco de dados local (SQLite)")

# Login Manager
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'auth.login'
login_manager.login_message = 'Por favor, faça login para acessar esta página.'


@login_manager.user_loader
def load_user(user_id):
    """Carrega usuário pelo ID"""
    from sqlalchemy.orm import joinedload
    session = db_manager.get_session()
    try:
        usuario = session.query(Usuario).options(
            joinedload(Usuario.empresa)
        ).get(int(user_id))

        if usuario:
            session.expunge(usuario)

        return usuario
    finally:
        session.close()


# Importar rotas
from backend.routes import auth, dashboard, leads, conversas, campanhas, admin, api, auth_api, bot_api, produtos, whatsapp, configuracoes, webhook, robo_disparador, veiculos

# Registrar blueprints
app.register_blueprint(auth.bp)
app.register_blueprint(dashboard.bp)
app.register_blueprint(leads.bp)
app.register_blueprint(conversas.bp)
app.register_blueprint(campanhas.bp)
app.register_blueprint(admin.bp)
app.register_blueprint(api.bp)
app.register_blueprint(auth_api.bp)  # ✅ API REST de autenticação
app.register_blueprint(bot_api.bp)
app.register_blueprint(produtos.produtos_bp)
app.register_blueprint(whatsapp.whatsapp_bp)
app.register_blueprint(configuracoes.configuracoes_bp)
app.register_blueprint(webhook.webhook_bp)
app.register_blueprint(robo_disparador.robo_bp)
app.register_blueprint(veiculos.veiculos_bp)
