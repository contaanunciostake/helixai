"""
Script para corrigir o plano da empresa 22 no banco MySQL
"""
import pymysql
import sys

def fix_plano():
    try:
        # Conectar ao MySQL
        conn = pymysql.connect(
            host='localhost',
            port=3306,
            user='root',  # Ajuste se necessário
            password='',  # Ajuste se necessário
            database='helixai_db',
            charset='utf8mb4'
        )

        cursor = conn.cursor()

        # Verificar plano atual
        cursor.execute("SELECT id, nome, plano_assinatura FROM empresas WHERE id = 22")
        result = cursor.fetchone()

        if not result:
            print("❌ Empresa 22 não encontrada!")
            return

        print(f"Empresa encontrada: {result[1]}")
        print(f"Plano atual: {result[2]}")

        # Atualizar para GRATUITO
        cursor.execute("UPDATE empresas SET plano_assinatura = 'GRATUITO' WHERE id = 22")
        conn.commit()

        print("✅ Plano atualizado para GRATUITO com sucesso!")

        cursor.close()
        conn.close()

    except Exception as e:
        print(f"❌ Erro: {e}")
        print("\nSe o erro for de conexão, ajuste:")
        print("  - host (padrão: localhost)")
        print("  - user (padrão: root)")
        print("  - password (senha do MySQL)")

if __name__ == '__main__':
    fix_plano()
