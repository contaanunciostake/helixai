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
             ],
             "supports_credentials": True,
             "allow_headers": ["Content-Type", "Authorization", "X-API-Key", "X-Empresa-ID", "X-Empresa-Id"],
             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
         }
     })

# Database Manager - Usar DATABASE_URL do ambiente (PostgreSQL em produção)
database_url = os.getenv('DATABASE_URL')

# Path absoluto do banco de dados local - fallback para desenvolvimento
LOCAL_DB_PATH = Path(__file__).resolve().parent / 'vendeai.db'

if database_url:
    # Render.com usa postgres:// mas SQLAlchemy precisa de postgresql://
    if database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql://', 1)

    # Adicionar SSL para conexões remotas PostgreSQL
    if 'postgresql://' in database_url and 'sslmode' not in database_url:
        database_url += '?sslmode=require'

    db_manager = DatabaseManager(database_url)
    print(f"[INFO] Usando banco de dados remoto: PostgreSQL")
elif os.getenv('USE_REMOTE_DB', 'False').lower() == 'true':
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


# ==================== MIGRACAO AUTOMATICA DO BANCO ====================
def run_database_migrations():
    """
    Executa migrações automáticas para criar tabelas e colunas faltantes.
    Roda apenas em produção (PostgreSQL) na inicialização.
    """
    if not database_url or 'postgresql' not in database_url:
        print("[MIGRATION] Pulando migracao - ambiente local SQLite")
        return

    print("\n" + "=" * 50)
    print("[MIGRATION] Iniciando migracoes do banco de dados...")
    print("=" * 50)

    from sqlalchemy import text
    session = db_manager.get_session()

    try:
        # 1. Adicionar colunas faltantes na tabela empresas
        colunas_empresas = [
            ("tipo_negocio", "VARCHAR(50)"),
            ("numero_gerente", "TEXT"),
            ("notificar_vendas", "INTEGER DEFAULT 1"),
            ("notificar_leads", "INTEGER DEFAULT 1"),
            ("notificar_entregas", "INTEGER DEFAULT 1"),
            ("notificar_estoque", "INTEGER DEFAULT 0"),
        ]

        for col_name, col_type in colunas_empresas:
            try:
                session.execute(text(f"ALTER TABLE empresas ADD COLUMN IF NOT EXISTS {col_name} {col_type}"))
                session.commit()
                print(f"[MIGRATION] OK coluna empresas.{col_name}")
            except Exception as e:
                session.rollback()
                if 'already exists' not in str(e).lower():
                    print(f"[MIGRATION] Aviso {col_name}: {e}")

        # 2. Criar tabela PLANOS
        session.execute(text("""
            CREATE TABLE IF NOT EXISTS planos (
                id SERIAL PRIMARY KEY,
                nome VARCHAR(50) NOT NULL UNIQUE,
                descricao TEXT,
                preco DECIMAL(10,2) NOT NULL,
                periodicidade VARCHAR(20) NOT NULL DEFAULT 'mensal',
                limite_mensagens INTEGER NOT NULL DEFAULT 1000,
                limite_tokens BIGINT NOT NULL DEFAULT 500000,
                recursos_extras TEXT,
                ativo BOOLEAN DEFAULT TRUE,
                criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """))
        session.commit()
        print("[MIGRATION] OK tabela planos")

        # 3. Criar tabela ASSINATURAS
        session.execute(text("""
            CREATE TABLE IF NOT EXISTS assinaturas (
                id SERIAL PRIMARY KEY,
                usuario_id INTEGER NOT NULL,
                plano_id INTEGER NOT NULL,
                mercadopago_subscription_id VARCHAR(100) UNIQUE,
                mercadopago_preapproval_id VARCHAR(100) UNIQUE,
                mercadopago_preference_id VARCHAR(100),
                status VARCHAR(20) DEFAULT 'pending',
                data_inicio DATE,
                data_fim DATE,
                proximo_pagamento DATE,
                valor_pago DECIMAL(10,2),
                metodo_pagamento VARCHAR(50),
                criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """))
        session.commit()
        print("[MIGRATION] OK tabela assinaturas")

        # 4. Criar tabela PAGAMENTOS
        session.execute(text("""
            CREATE TABLE IF NOT EXISTS pagamentos (
                id SERIAL PRIMARY KEY,
                usuario_id INTEGER NOT NULL,
                assinatura_id INTEGER,
                mercadopago_payment_id VARCHAR(100) UNIQUE,
                tipo VARCHAR(20) DEFAULT 'subscription',
                status VARCHAR(20) DEFAULT 'pending',
                valor DECIMAL(10,2) NOT NULL,
                metodo_pagamento VARCHAR(50),
                descricao TEXT,
                data_pagamento TIMESTAMP,
                data_expiracao TIMESTAMP,
                webhook_data TEXT,
                criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """))
        session.commit()
        print("[MIGRATION] OK tabela pagamentos")

        # 5. Criar tabela USO_MENSAL
        session.execute(text("""
            CREATE TABLE IF NOT EXISTS uso_mensal (
                id SERIAL PRIMARY KEY,
                usuario_id INTEGER NOT NULL,
                mes_referencia DATE NOT NULL,
                mensagens_usadas INTEGER DEFAULT 0,
                tokens_usados BIGINT DEFAULT 0,
                conversas_criadas INTEGER DEFAULT 0,
                ultima_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(usuario_id, mes_referencia)
            )
        """))
        session.commit()
        print("[MIGRATION] OK tabela uso_mensal")

        # 6. Criar tabela ENTREGADORES
        session.execute(text("""
            CREATE TABLE IF NOT EXISTS entregadores (
                id SERIAL PRIMARY KEY,
                empresa_id INTEGER,
                nome VARCHAR(200) NOT NULL,
                telefone VARCHAR(20),
                email VARCHAR(200),
                placa_veiculo VARCHAR(20),
                tipo_veiculo VARCHAR(50),
                disponivel BOOLEAN DEFAULT TRUE,
                ativo BOOLEAN DEFAULT TRUE,
                criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """))
        session.commit()
        print("[MIGRATION] OK tabela entregadores")

        # 7. Criar tabela ENTREGAS
        session.execute(text("""
            CREATE TABLE IF NOT EXISTS entregas (
                id SERIAL PRIMARY KEY,
                empresa_id INTEGER,
                pedido_id INTEGER,
                cliente_id INTEGER,
                entregador_id INTEGER,
                endereco_entrega TEXT,
                status VARCHAR(50) DEFAULT 'pendente',
                data_prevista TIMESTAMP,
                data_entrega TIMESTAMP,
                observacoes TEXT,
                criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                cliente_nome VARCHAR(200),
                cliente_telefone VARCHAR(20),
                cliente_whatsapp VARCHAR(20),
                numero VARCHAR(20),
                complemento VARCHAR(100),
                bairro VARCHAR(100),
                cidade VARCHAR(100),
                estado VARCHAR(2),
                cep VARCHAR(10),
                ponto_referencia TEXT,
                descricao_itens TEXT,
                valor_pedido REAL,
                valor_frete REAL,
                forma_pagamento VARCHAR(50),
                prioridade VARCHAR(20),
                data_agendada DATE,
                hora_agendada TIME,
                origem VARCHAR(50),
                conversa_id VARCHAR(50)
            )
        """))
        session.commit()
        print("[MIGRATION] OK tabela entregas")

        # 8. Criar tabela AGENDAMENTOS
        session.execute(text("""
            CREATE TABLE IF NOT EXISTS agendamentos (
                id SERIAL PRIMARY KEY,
                empresa_id INTEGER,
                cliente_id INTEGER,
                nome_cliente VARCHAR(200),
                telefone_cliente VARCHAR(20),
                data_hora TIMESTAMP,
                tipo VARCHAR(50),
                descricao TEXT,
                status VARCHAR(50) DEFAULT 'pendente',
                observacoes TEXT,
                criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """))
        session.commit()
        print("[MIGRATION] OK tabela agendamentos")

        # 9. Inserir planos padrão se não existirem
        result = session.execute(text("SELECT COUNT(*) FROM planos"))
        count = result.fetchone()[0]
        if count == 0:
            session.execute(text("""
                INSERT INTO planos (nome, descricao, preco, periodicidade, limite_mensagens, limite_tokens, ativo) VALUES
                ('Gratuito', 'Plano gratuito para teste', 0, 'mensal', 100, 50000, true),
                ('Basico', 'Plano basico para pequenos negocios', 97.00, 'mensal', 1000, 500000, true),
                ('Profissional', 'Plano profissional com recursos avancados', 197.00, 'mensal', 5000, 2000000, true),
                ('Enterprise', 'Plano enterprise para grandes empresas', 497.00, 'mensal', 20000, 10000000, true)
            """))
            session.commit()
            print("[MIGRATION] OK planos padrao inseridos")

        # 10. Criar super admin se não existir
        from werkzeug.security import generate_password_hash
        result = session.execute(text("SELECT COUNT(*) FROM usuarios WHERE tipo = 'super_admin'"))
        admin_count = result.fetchone()[0]
        if admin_count == 0:
            senha_hash = generate_password_hash('Admin@123')
            session.execute(text("""
                INSERT INTO usuarios (nome, email, senha_hash, tipo, ativo)
                VALUES ('Administrador', 'admin@aira.com', :senha_hash, 'super_admin', true)
            """), {'senha_hash': senha_hash})
            session.commit()
            print("[MIGRATION] OK super admin criado (admin@aira.com / Admin@123)")

        print("=" * 50)
        print("[MIGRATION] Migracoes concluidas com sucesso!")
        print("=" * 50 + "\n")

    except Exception as e:
        session.rollback()
        print(f"[MIGRATION] ERRO: {e}")
        import traceback
        traceback.print_exc()
    finally:
        session.close()


# Executar migrações na inicialização
run_database_migrations()


# Health check route para Render.com
@app.route('/health')
def health_check():
    """Health check endpoint para monitoramento do Render"""
    return {'status': 'healthy', 'service': 'vendefacil-backend', 'database': 'postgresql' if database_url else 'sqlite'}, 200

