"""
Script de inicialização do banco de dados VendeAI
"""

import sys
from pathlib import Path

# Adicionar pasta raiz ao path
sys.path.append(str(Path(__file__).parent.parent))

from database.models import DatabaseManager

def main():
    print("\n" + "="*70)
    print("INICIALIZANDO BANCO DE DADOS VENDEAI")
    print("="*70 + "\n")

    # Criar database manager
    db = DatabaseManager('sqlite:///vendeai.db')

    # Criar tabelas
    print("[1/3] Criando tabelas...")
    db.create_all()

    # Criar super admin
    print("\n[2/3] Criando super administrador...")
    db.criar_super_admin()

    # Criar empresa demo
    print("\n[3/3] Criando empresa de demonstração...")
    db.criar_empresa_demo()

    print("\n" + "="*70)
    print("✅ BANCO DE DADOS INICIALIZADO COM SUCESSO!")
    print("="*70)
    print("\n📋 Credenciais de Acesso:\n")
    print("Super Admin:")
    print("  Email: admin@vendeai.com")
    print("  Senha: admin123\n")
    print("Empresa Demo:")
    print("  Email: demo@vendeai.com")
    print("  Senha: demo123\n")
    print("="*70 + "\n")

if __name__ == '__main__':
    main()
