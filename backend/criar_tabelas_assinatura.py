"""
Script para criar tabelas de assinatura e planos no banco de dados
VendeAI - Sistema de Assinaturas MercadoPago
"""

import sqlite3
from datetime import datetime

# Conectar ao banco de dados
conn = sqlite3.connect('vendeai.db')
cursor = conn.cursor()

print("[INFO] Criando tabelas de assinatura...")

# ==================== TABELA PLANOS ====================
cursor.execute("""
CREATE TABLE IF NOT EXISTS planos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10, 2) NOT NULL,
    periodicidade VARCHAR(20) DEFAULT 'mensal',
    limite_mensagens INTEGER,
    limite_tokens INTEGER,
    recursos_extras TEXT,
    ativo BOOLEAN DEFAULT 1,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")

print("[OK] Tabela 'planos' criada")

# ==================== TABELA ASSINATURAS ====================
cursor.execute("""
CREATE TABLE IF NOT EXISTS assinaturas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    plano_id INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'ativa',
    data_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_fim TIMESTAMP,
    mercadopago_subscription_id VARCHAR(100),
    valor_mensal DECIMAL(10, 2),
    ativa BOOLEAN DEFAULT 1,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (plano_id) REFERENCES planos(id)
)
""")

print("[OK] Tabela 'assinaturas' criada")

# ==================== TABELA PAGAMENTOS ====================
cursor.execute("""
CREATE TABLE IF NOT EXISTS pagamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    assinatura_id INTEGER,
    mercadopago_payment_id VARCHAR(100),
    tipo VARCHAR(20) DEFAULT 'assinatura',
    status VARCHAR(20) DEFAULT 'pendente',
    valor DECIMAL(10, 2) NOT NULL,
    metodo_pagamento VARCHAR(50),
    descricao TEXT,
    data_pagamento TIMESTAMP,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (assinatura_id) REFERENCES assinaturas(id)
)
""")

print("[OK] Tabela 'pagamentos' criada")

# ==================== INSERIR PLANOS ====================
print("\n[INFO] Inserindo planos de exemplo...")

# Verificar se já existem planos
cursor.execute("SELECT COUNT(*) FROM planos")
count = cursor.fetchone()[0]

if count == 0:
    planos = [
        (
            'Free',
            'Plano gratuito com funcionalidades básicas',
            0.00,
            'mensal',
            100,
            10000,
            '{"bot_simples": true, "ia_basica": true}',
            1
        ),
        (
            'Professional',
            'Plano profissional com IA avançada e automações',
            997.00,
            'mensal',
            5000,
            500000,
            '{"bot_avancado": true, "ia_avancada": true, "elevenlabs": true, "multiagente": true, "crm_completo": true}',
            1
        ),
        (
            'Enterprise',
            'Plano empresarial com recursos ilimitados',
            1997.00,
            'mensal',
            999999,
            999999999,
            '{"tudo_liberado": true, "suporte_prioritario": true, "multiagente": true, "white_label": true}',
            1
        )
    ]

    cursor.executemany("""
        INSERT INTO planos (nome, descricao, preco, periodicidade, limite_mensagens, limite_tokens, recursos_extras, ativo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, planos)

    print(f"[OK] {len(planos)} planos inseridos")
else:
    print(f"[INFO] Já existem {count} planos no banco")

# Commit e fechar
conn.commit()
conn.close()

print("\n" + "="*60)
print("✅ TABELAS CRIADAS COM SUCESSO!")
print("="*60)
print("\nTabelas criadas:")
print("  - planos")
print("  - assinaturas")
print("  - pagamentos")
print("\nPlanos disponíveis:")
print("  1. Free - R$ 0,00/mês")
print("  2. Professional - R$ 997,00/mês")
print("  3. Enterprise - R$ 1.997,00/mês")
print("="*60)
