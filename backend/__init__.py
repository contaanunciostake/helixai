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
             "allow_headers": ["Content-Type", "Authorization", "X-API-Key", "X-Empresa-ID", "X-Empresa-Id"],
             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
         }
     })

# Database Manager - Usar gerenciador híbrido se remoto estiver habilitado
use_remote = os.getenv('USE_REMOTE_DB', 'False').lower() == 'true'

# Path absoluto do banco de dados local - SEMPRE usar backend/vendeai.db (único banco multi-tenant)
LOCAL_DB_PATH = Path(__file__).resolve().parent / 'vendeai.db'

if use_remote:
    db_manager = get_hybrid_db_manager()
    print("[INFO] Usando gerenciador híbrido de banco de dados (Local + Remoto)")
else:
    db_manager = DatabaseManager(f'sqlite:///{LOCAL_DB_PATH}')
    print(f"[INFO] Usando banco de dados local: {LOCAL_DB_PATH}")

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
from backend.routes import auth, dashboard, leads, conversas, campanhas, admin, api, auth_api, bot_api, produtos, whatsapp, configuracoes, webhook, robo_disparador, veiculos, afiliados, tracking, admin_api, varejo_api, entregas_api, tintas

# Importar produtos_api separadamente para capturar erros
try:
    from backend.routes import produtos_api
    print("[INIT] OK produtos_api importado com sucesso!")
except Exception as e:
    print(f"[INIT] ERRO ao importar produtos_api: {e}")
    import traceback
    traceback.print_exc()
    produtos_api = None

# Importar bot_config_api
try:
    from backend.routes import bot_config_api
    print("[INIT] OK bot_config_api importado com sucesso!")
except Exception as e:
    print(f"[INIT] ERRO ao importar bot_config_api: {e}")
    import traceback
    traceback.print_exc()
    bot_config_api = None

# Importar API temporária de veículos
from backend.routes import veiculos_temp_api

# Importar assinatura (checkout/pagamentos)
try:
    from backend.routes import assinatura
    print("[INIT] OK assinatura importado com sucesso!")
except Exception as e:
    print(f"[INIT] ERRO ao importar assinatura: {e}")
    import traceback
    traceback.print_exc()
    assinatura = None

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
if produtos_api is not None:
    app.register_blueprint(produtos_api.produtos_api_bp)  # OK API REST de produtos
    print("[INIT] OK produtos_api_bp registrado!")
else:
    print("[INIT] AVISO produtos_api nao foi importado, blueprint nao registrado")
app.register_blueprint(whatsapp.whatsapp_bp)
app.register_blueprint(configuracoes.configuracoes_bp)
app.register_blueprint(webhook.webhook_bp)
app.register_blueprint(robo_disparador.robo_bp)
app.register_blueprint(veiculos.veiculos_bp)
app.register_blueprint(afiliados.bp)  # ✅ Sistema de afiliados
app.register_blueprint(tracking.bp)  # ✅ Rastreamento de links de afiliados
app.register_blueprint(admin_api.bp)  # ✅ API REST Admin CRM (React)
app.register_blueprint(veiculos_temp_api.veiculos_temp_bp)  # ✅ API temporária de veículos (SQLite direto)
print("[INIT] OK veiculos_temp_api_bp registrado!")

# Registrar APIs de Varejo (clientes, pedidos, agendamentos)
app.register_blueprint(varejo_api.varejo_api_bp)
print("[INIT] OK varejo_api_bp registrado!")

# Registrar API de Entregas
app.register_blueprint(entregas_api.entregas_api_bp)
print("[INIT] OK entregas_api_bp registrado!")

# Registrar bot_config_api
if bot_config_api is not None:
    app.register_blueprint(bot_config_api.bot_config_api_bp)
    print("[INIT] OK bot_config_api_bp registrado!")
else:
    print("[INIT] AVISO bot_config_api nao foi importado, blueprint nao registrado")

# Registrar módulo de Tintas (Loja de Tintas)
app.register_blueprint(tintas.tintas_bp)
print("[INIT] OK tintas_bp registrado!")

# Registrar API REST de Tintas
try:
    from backend.routes import tintas_api
    app.register_blueprint(tintas_api.tintas_api_bp)
    print("[INIT] OK tintas_api_bp registrado!")
except Exception as e:
    print(f"[INIT] ERRO ao importar tintas_api: {e}")

# Registrar assinatura (checkout/pagamentos)
if assinatura is not None:
    app.register_blueprint(assinatura.assinatura_bp)
    print("[INIT] OK assinatura_bp registrado!")
else:
    print("[INIT] AVISO assinatura nao foi importado, blueprint nao registrado")

