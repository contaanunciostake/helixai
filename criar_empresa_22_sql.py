import sqlite3
from datetime import datetime

# Conectar ao banco de dados
conn = sqlite3.connect(r'D:\Helix\HelixAI\vendeai.db')
cursor = conn.cursor()

try:
    # Verificar quais colunas existem na tabela empresas
    cursor.execute("PRAGMA table_info(empresas)")
    colunas = cursor.fetchall()
    print("Colunas disponíveis na tabela empresas:")
    for col in colunas:
        print(f"  - {col[1]} ({col[2]})")

    # Verificar se empresa 22 já existe
    cursor.execute("SELECT id, nome FROM empresas WHERE id = 22")
    empresa_existente = cursor.fetchone()

    if empresa_existente:
        print(f"\n✅ Empresa ID 22 já existe: {empresa_existente[1]}")
    else:
        # Criar empresa 22 com apenas as colunas que existem
        now = datetime.now().isoformat()

        cursor.execute("""
            INSERT INTO empresas (
                id, nome, nome_fantasia, email, telefone,
                whatsapp_conectado, bot_ativo, plano,
                criado_em, atualizado_em
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            22,
            'Empresa Teste',
            'Teste CRM',
            'teste@empresa.com',
            '42999999999',
            0,  # whatsapp_conectado = False
            0,  # bot_ativo = False
            'basico',  # plano
            now,
            now
        ))

        conn.commit()

        print(f"\n✅ Empresa ID 22 criada com sucesso!")
        print(f"   Nome: Empresa Teste")
        print(f"   Email: teste@empresa.com")
        print(f"   Plano: basico")

finally:
    conn.close()
