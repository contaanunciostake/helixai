import sqlite3
from datetime import datetime

# Conectar ao banco de dados CORRETO (backend)
conn = sqlite3.connect(r'D:\Helix\HelixAI\backend\vendeai.db')
cursor = conn.cursor()

try:
    # Verificar se empresa 22 já existe
    cursor.execute("SELECT id, nome FROM empresas WHERE id = 22")
    empresa_existente = cursor.fetchone()

    if empresa_existente:
        print(f"\nOK - Empresa ID 22 ja existe: {empresa_existente[1]}")
    else:
        # Criar empresa 22
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

        print(f"\nSUCESSO - Empresa ID 22 criada no banco BACKEND!")
        print(f"   Nome: Empresa Teste")
        print(f"   Email: teste@empresa.com")
        print(f"   Plano: basico")

finally:
    conn.close()
