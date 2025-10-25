#!/usr/bin/env python3
"""
Script para testar a autenticação do afiliado
Execute: python3 testar_auth.py
"""

import sqlite3
from werkzeug.security import check_password_hash

# Caminho do banco de dados
DB_PATH = "vendeai.db"  # Ajuste se necessário

def testar_login(email, senha):
    """Testa se o login funciona"""
    
    print("=" * 60)
    print("TESTANDO AUTENTICAÇÃO")
    print("=" * 60)
    
    try:
        # Conectar ao banco
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Buscar usuário
        cursor.execute("""
            SELECT id, nome, email, senha_hash, tipo, ativo 
            FROM usuarios 
            WHERE email = ?
        """, (email,))
        
        resultado = cursor.fetchone()
        
        if not resultado:
            print(f"\n❌ ERRO: Usuário '{email}' não encontrado!")
            return False
        
        user_id, nome, email_db, senha_hash, tipo, ativo = resultado
        
        print(f"\n✅ Usuário encontrado no banco:")
        print(f"   ID: {user_id}")
        print(f"   Nome: {nome}")
        print(f"   Email: {email_db}")
        print(f"   Tipo: {tipo}")
        print(f"   Ativo: {ativo}")
        print(f"   Hash (primeiros 50 chars): {senha_hash[:50]}...")
        
        # Verificar se está ativo
        if not ativo:
            print(f"\n❌ ERRO: Usuário está INATIVO!")
            return False
        
        # Testar senha
        print(f"\n🔐 Testando senha: '{senha}'")
        senha_correta = check_password_hash(senha_hash, senha)
        
        if senha_correta:
            print("✅ SENHA CORRETA!")
            print("\n🎯 O problema NÃO É a senha ou o hash!")
            print("   O erro deve estar no código do backend.")
            return True
        else:
            print("❌ SENHA INCORRETA!")
            print("\n🔍 Vamos gerar um novo hash correto:")
            
            from werkzeug.security import generate_password_hash
            novo_hash = generate_password_hash(senha)
            print(f"\nNovo hash gerado: {novo_hash}")
            print("\nExecute este SQL no DBeaver:")
            print("-" * 60)
            print(f"UPDATE usuarios")
            print(f"SET senha_hash = '{novo_hash}'")
            print(f"WHERE email = '{email}';")
            print("-" * 60)
            return False
            
    except sqlite3.Error as e:
        print(f"\n❌ ERRO no banco de dados: {e}")
        return False
    finally:
        if conn:
            conn.close()
    
    print("=" * 60)

if __name__ == "__main__":
    # Testar com as credenciais
    testar_login("afiliado@teste.com", "123456")
