"""
Script para criar tabela de agendamentos no MySQL
"""
import os
import mysql.connector
from dotenv import load_dotenv

load_dotenv()

def get_connection():
    return mysql.connector.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        user=os.getenv('DB_USER', 'root'),
        password=os.getenv('DB_PASSWORD', ''),
        database=os.getenv('DB_NAME', 'helixai_db')
    )

def criar_tabela_agendamentos():
    conn = get_connection()
    cursor = conn.cursor()

    # Criar tabela clientes se nao existir
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS clientes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            empresa_id INT NOT NULL,
            nome VARCHAR(200) NOT NULL,
            telefone VARCHAR(20),
            celular VARCHAR(20),
            email VARCHAR(200),
            cpf_cnpj VARCHAR(20),
            endereco TEXT,
            cidade VARCHAR(100),
            estado VARCHAR(2),
            cep VARCHAR(10),
            origem VARCHAR(50) DEFAULT 'manual',
            observacoes TEXT,
            ativo TINYINT(1) DEFAULT 1,
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
            atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

            INDEX idx_empresa (empresa_id),
            INDEX idx_telefone (telefone),
            INDEX idx_celular (celular)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """)
    print("[OK] Tabela clientes criada/verificada")

    # Criar tabela pedidos se nao existir
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS pedidos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            empresa_id INT NOT NULL,
            cliente_id INT,
            data_pedido DATETIME DEFAULT CURRENT_TIMESTAMP,
            status VARCHAR(50) DEFAULT 'pendente',
            subtotal DECIMAL(10,2) DEFAULT 0,
            desconto DECIMAL(10,2) DEFAULT 0,
            total DECIMAL(10,2) DEFAULT 0,
            forma_pagamento VARCHAR(50),
            observacoes TEXT,
            origem VARCHAR(50) DEFAULT 'manual',
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
            atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

            INDEX idx_empresa (empresa_id),
            INDEX idx_cliente (cliente_id),
            INDEX idx_status (status),
            INDEX idx_data (data_pedido)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """)
    print("[OK] Tabela pedidos criada/verificada")

    # Criar tabela itens_pedido se nao existir
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS itens_pedido (
            id INT AUTO_INCREMENT PRIMARY KEY,
            pedido_id INT NOT NULL,
            produto_id INT,
            quantidade INT DEFAULT 1,
            preco_unitario DECIMAL(10,2) DEFAULT 0,
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,

            INDEX idx_pedido (pedido_id),
            INDEX idx_produto (produto_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """)
    print("[OK] Tabela itens_pedido criada/verificada")

    # Criar tabela agendamentos
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS agendamentos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            empresa_id INT NOT NULL,
            cliente_id INT,
            data_hora DATETIME NOT NULL,
            tipo VARCHAR(50) DEFAULT 'visita',
            descricao TEXT,
            status VARCHAR(50) DEFAULT 'pendente',
            observacoes TEXT,
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
            atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

            INDEX idx_empresa (empresa_id),
            INDEX idx_cliente (cliente_id),
            INDEX idx_data (data_hora),
            INDEX idx_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """)

    print("[OK] Tabela agendamentos criada/verificada")

    conn.commit()
    cursor.close()
    conn.close()

    print("\n[OK] Todas as tabelas criadas/verificadas!")

if __name__ == '__main__':
    criar_tabela_agendamentos()
