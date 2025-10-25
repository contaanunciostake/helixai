"""
Script para verificar e atualizar estrutura do banco SQLite
"""

import sqlite3

# Conectar ao banco
conn = sqlite3.connect('vendeai.db')
cursor = conn.cursor()

# Verificar se tabela empresas existe
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='empresas'")
result = cursor.fetchone()

if result:
    print("Tabela 'empresas' existe!")
    print("\nColunas atuais:")
    cursor.execute("PRAGMA table_info(empresas)")
    colunas = cursor.fetchall()
    for col in colunas:
        print(f"  - {col[1]} ({col[2]})")

    # Verificar se coluna nicho existe
    colunas_nomes = [col[1] for col in colunas]

    if 'nicho' not in colunas_nomes:
        print("\n[AVISO] Coluna 'nicho' nao existe!")
        print("Adicionando coluna 'nicho'...")
        try:
            cursor.execute("ALTER TABLE empresas ADD COLUMN nicho VARCHAR(50) DEFAULT 'geral'")
            conn.commit()
            print("[OK] Coluna 'nicho' adicionada!")
        except Exception as e:
            print(f"[ERRO] {e}")
    else:
        print("\n[OK] Coluna 'nicho' ja existe!")

else:
    print("Tabela 'empresas' NAO existe!")
    print("\nCriando tabela 'empresas'...")

    cursor.execute("""
    CREATE TABLE empresas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome VARCHAR(200) NOT NULL,
        nome_fantasia VARCHAR(200),
        cnpj VARCHAR(18),
        telefone VARCHAR(20),
        email VARCHAR(120),
        website VARCHAR(200),
        whatsapp_numero VARCHAR(20),
        whatsapp_conectado BOOLEAN DEFAULT 0,
        whatsapp_qr_code TEXT,
        bot_ativo BOOLEAN DEFAULT 0,
        nicho VARCHAR(50) DEFAULT 'geral',
        plano VARCHAR(20) DEFAULT 'gratuito',
        plano_ativo BOOLEAN DEFAULT 1,
        data_inicio_plano DATETIME,
        data_fim_plano DATETIME,
        limite_leads INTEGER DEFAULT 100,
        limite_disparos_mes INTEGER DEFAULT 500,
        limite_usuarios INTEGER DEFAULT 3,
        endereco TEXT,
        cidade VARCHAR(100),
        estado VARCHAR(2),
        cep VARCHAR(10),
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        atualizado_em DATETIME
    )
    """)
    conn.commit()
    print("[OK] Tabela 'empresas' criada!")

# Verificar tabela usuarios
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='usuarios'")
result = cursor.fetchone()

if result:
    print("\nTabela 'usuarios' existe!")
    print("\nColunas atuais:")
    cursor.execute("PRAGMA table_info(usuarios)")
    colunas = cursor.fetchall()
    for col in colunas:
        print(f"  - {col[1]} ({col[2]})")
else:
    print("\nTabela 'usuarios' NAO existe!")
    print("Criando tabela 'usuarios'...")

    cursor.execute("""
    CREATE TABLE usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(120) NOT NULL UNIQUE,
        senha_hash VARCHAR(200),
        telefone VARCHAR(20),
        empresa_id INTEGER NOT NULL,
        tipo VARCHAR(20) DEFAULT 'usuario',
        ativo BOOLEAN DEFAULT 1,
        ultimo_acesso DATETIME,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        atualizado_em DATETIME,
        FOREIGN KEY (empresa_id) REFERENCES empresas(id)
    )
    """)
    conn.commit()
    print("[OK] Tabela 'usuarios' criada!")

# Verificar tabela configuracoes_bot
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='configuracoes_bot'")
result = cursor.fetchone()

if not result:
    print("\nTabela 'configuracoes_bot' NAO existe!")
    print("Criando tabela 'configuracoes_bot'...")

    cursor.execute("""
    CREATE TABLE configuracoes_bot (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        empresa_id INTEGER NOT NULL UNIQUE,
        mensagem_boas_vindas TEXT,
        mensagem_ausencia TEXT,
        auto_resposta_ativa BOOLEAN DEFAULT 0,
        horario_atendimento_inicio TIME,
        horario_atendimento_fim TIME,
        dias_atendimento VARCHAR(50),
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        atualizado_em DATETIME,
        FOREIGN KEY (empresa_id) REFERENCES empresas(id)
    )
    """)
    conn.commit()
    print("[OK] Tabela 'configuracoes_bot' criada!")

conn.close()
print("\n[OK] Verificacao concluida!")
