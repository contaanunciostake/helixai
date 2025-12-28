"""
VendeAI Backend - API Flask
"""

from flask import Flask, request
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

# CORS - Configuração completa para suportar credentials
allowed_origins = [
    # Local development
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    "http://localhost:5177",
    "http://localhost:5178",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3010",
    "http://localhost:4000",
    # Production Render.com domains
    "https://vendefacil-landing.onrender.com",
    "https://vendefacil-admin.onrender.com",
    "https://vendefacil-client.onrender.com",
    "https://vendefacil-afiliados.onrender.com",
    "https://vendefacil-backend.onrender.com",
    "https://vendefacil-whatsapp.onrender.com",
]

CORS(app,
     resources={
         r"/*": {
             "origins": allowed_origins,
             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
             "allow_headers": ["Content-Type", "Authorization", "X-API-Key", "X-Empresa-ID", "X-Empresa-Id"],
             "supports_credentials": True
         }
     },
     supports_credentials=True)

# Database Manager - Usar DATABASE_URL do ambiente (PostgreSQL em produção)
database_url = os.getenv('DATABASE_URL')

if database_url:
    # Render.com usa postgres:// mas SQLAlchemy precisa de postgresql://
    if database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql://', 1)

    # Adicionar SSL para conexões remotas PostgreSQL
    if 'postgresql://' in database_url and 'sslmode' not in database_url:
        database_url += '?sslmode=require'

    db_manager = DatabaseManager(database_url)
    print(f"[INFO] Usando banco de dados remoto: PostgreSQL")
else:
    # Fallback para SQLite local (desenvolvimento)
    db_path = Path(__file__).resolve().parent.parent / 'vendeai.db'
    db_manager = DatabaseManager(f'sqlite:///{db_path}')
    print(f"[INFO] Usando banco de dados local: {db_path}")

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


# After request handler para garantir CORS em todas as rotas
@app.after_request
def after_request(response):
    """Adiciona headers CORS a todas as respostas"""
    origin = request.headers.get('Origin')

    # Lista de origens permitidas
    cors_origins = [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:5176',
        'http://localhost:5177',
        'http://localhost:5178',
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3010',
        'http://localhost:4000',
        'https://vendefacil-landing.onrender.com',
        'https://vendefacil-admin.onrender.com',
        'https://vendefacil-client.onrender.com',
        'https://vendefacil-afiliados.onrender.com',
        'https://vendefacil-backend.onrender.com',
        'https://vendefacil-whatsapp.onrender.com',
    ]

    if origin in cors_origins:
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-API-Key, X-Empresa-ID, X-Empresa-Id'

    return response


# Importar rotas
from backend.routes import auth, auth_api, dashboard, leads, conversas, campanhas, admin, api, bot_api, produtos, whatsapp, configuracoes, webhook, robo_disparador, veiculos, dashboard_api, assinatura, admin_api, varejo_api, entregas_api

# Registrar blueprints
app.register_blueprint(auth.bp)
app.register_blueprint(auth_api.bp)  # Auth API (JSON) - /api/auth/*
app.register_blueprint(dashboard.bp)
app.register_blueprint(dashboard_api.bp)  # Dashboard API (JSON)
app.register_blueprint(leads.bp)
app.register_blueprint(conversas.bp)
app.register_blueprint(campanhas.bp)
app.register_blueprint(admin.bp)
app.register_blueprint(api.bp)
app.register_blueprint(bot_api.bp)
app.register_blueprint(produtos.produtos_bp)
app.register_blueprint(whatsapp.whatsapp_bp)
app.register_blueprint(configuracoes.configuracoes_bp)
app.register_blueprint(webhook.webhook_bp)
app.register_blueprint(robo_disparador.robo_bp)
app.register_blueprint(veiculos.veiculos_bp)
app.register_blueprint(assinatura.assinatura_bp)  # Sistema de Assinaturas
app.register_blueprint(admin_api.admin_api_bp)  # Admin API (JSON) - /api/admin/*
app.register_blueprint(varejo_api.varejo_api_bp)  # Varejo API (JSON) - /api/produtos, /api/clientes, /api/pedidos
app.register_blueprint(entregas_api.entregas_api_bp)  # Entregas API (JSON) - /api/entregas


# Health check route para Render.com (DEPOIS dos blueprints)
@app.route('/health')
def health_check():
    """Health check endpoint para monitoramento do Render"""
    return {'status': 'healthy', 'service': 'helixai-backend'}, 200
