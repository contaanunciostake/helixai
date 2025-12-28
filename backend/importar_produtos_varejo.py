#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script para importar produtos de teste para o nicho atacado/varejo
Baseado nos produtos do Grupo Comercial Mariano (lubrificantes, filtros, etc)
"""

import sys
import os
import mysql.connector
from datetime import datetime
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# ID da empresa varejo (ajustar conforme necessário)
EMPRESA_ID = 23  # Empresa configurada para atacado_varejo

# Conexão MySQL
def get_mysql_connection():
    return mysql.connector.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        user=os.getenv('DB_USER', 'root'),
        password=os.getenv('DB_PASSWORD', ''),
        database=os.getenv('DB_NAME', 'helixai_db')
    )

# Produtos de teste - Grupo Comercial Mariano
PRODUTOS_TESTE = [
    # ===== LUBRIFICANTES - IPIRANGA =====
    {
        "nome": "Óleo Motor 5W30 Semissintético 1L Ipiranga",
        "descricao": "Óleo de motor semissintético para veículos leves. Alto desempenho em todas as condições. API SN/CF.",
        "categoria": "Lubrificantes",
        "subcategoria": "Óleos de Motor",
        "marca": "Ipiranga",
        "preco": 45.90,
        "estoque": 100,
        "sku": "IPR-5W30-1L",
        "aplicacao": "Carro e SUV",
        "disponivel": True
    },
    {
        "nome": "Óleo Motor 5W40 Sintético 1L Ipiranga F1 Master",
        "descricao": "Óleo 100% sintético de alta performance. Proteção superior em altas temperaturas. API SN/CF ACEA A3/B4.",
        "categoria": "Lubrificantes",
        "subcategoria": "Óleos de Motor",
        "marca": "Ipiranga",
        "preco": 68.90,
        "estoque": 80,
        "sku": "IPR-5W40-1L",
        "aplicacao": "Carro e SUV",
        "disponivel": True
    },
    {
        "nome": "Óleo Motor 10W40 Semissintético 1L Ipiranga",
        "descricao": "Óleo semissintético multigrade para motores flex. Excelente viscosidade em várias temperaturas.",
        "categoria": "Lubrificantes",
        "subcategoria": "Óleos de Motor",
        "marca": "Ipiranga",
        "preco": 38.90,
        "estoque": 120,
        "sku": "IPR-10W40-1L",
        "aplicacao": "Carro e SUV",
        "disponivel": True
    },
    {
        "nome": "Óleo Motor 20W50 Mineral 1L Ipiranga",
        "descricao": "Óleo mineral para motores mais antigos ou com alta quilometragem. API SL/CF.",
        "categoria": "Lubrificantes",
        "subcategoria": "Óleos de Motor",
        "marca": "Ipiranga",
        "preco": 28.90,
        "estoque": 150,
        "sku": "IPR-20W50-1L",
        "aplicacao": "Carro e SUV",
        "disponivel": True
    },
    # ===== LUBRIFICANTES - TEXACO =====
    {
        "nome": "Óleo Motor 15W40 Diesel 1L Texaco Havoline",
        "descricao": "Óleo para motores diesel. Alta proteção contra desgaste. API CI-4/SL.",
        "categoria": "Lubrificantes",
        "subcategoria": "Óleos de Motor",
        "marca": "Texaco",
        "preco": 52.90,
        "estoque": 80,
        "sku": "TEX-15W40-1L",
        "aplicacao": "Caminhão",
        "disponivel": True
    },
    {
        "nome": "Óleo Motor 5W30 Sintético 1L Texaco Havoline ProDS",
        "descricao": "Óleo totalmente sintético de última geração. Máxima proteção e economia de combustível.",
        "categoria": "Lubrificantes",
        "subcategoria": "Óleos de Motor",
        "marca": "Texaco",
        "preco": 72.90,
        "estoque": 60,
        "sku": "TEX-5W30-1L",
        "aplicacao": "Carro e SUV",
        "disponivel": True
    },
    {
        "nome": "Fluido de Freio DOT 4 500ml Texaco",
        "descricao": "Fluido de freio sintético de alto desempenho. Ponto de ebulição elevado.",
        "categoria": "Lubrificantes",
        "subcategoria": "Fluidos",
        "marca": "Texaco",
        "preco": 32.90,
        "estoque": 70,
        "sku": "TEX-DOT4-500",
        "aplicacao": "Carro e SUV",
        "disponivel": True
    },
    {
        "nome": "Coolant Radiador 1L Texaco Havoline",
        "descricao": "Fluido de arrefecimento pronto para uso. Proteção anticorrosiva e anticongelante.",
        "categoria": "Lubrificantes",
        "subcategoria": "Coolants",
        "marca": "Texaco",
        "preco": 25.90,
        "estoque": 90,
        "sku": "TEX-COOL-1L",
        "aplicacao": "Carro e SUV",
        "disponivel": True
    },
    # ===== FILTROS - MANN =====
    {
        "nome": "Filtro de Óleo Mann W712/95",
        "descricao": "Filtro de óleo para VW/Audi 1.0-2.0 TSI. Original Equipment quality.",
        "categoria": "Filtros",
        "subcategoria": "Linha Leve",
        "marca": "Mann",
        "preco": 38.50,
        "estoque": 50,
        "sku": "MANN-W712",
        "aplicacao": "Carro e SUV",
        "disponivel": True
    },
    {
        "nome": "Filtro de Óleo Mann W610/3",
        "descricao": "Filtro de óleo para Honda Civic, Fit, CR-V. Alta capacidade de filtragem.",
        "categoria": "Filtros",
        "subcategoria": "Linha Leve",
        "marca": "Mann",
        "preco": 42.90,
        "estoque": 40,
        "sku": "MANN-W610",
        "aplicacao": "Carro e SUV",
        "disponivel": True
    },
    {
        "nome": "Filtro de Ar Mann C27192/1",
        "descricao": "Filtro de ar para VW Polo, Virtus, T-Cross. Filtração superior de partículas.",
        "categoria": "Filtros",
        "subcategoria": "Linha Leve",
        "marca": "Mann",
        "preco": 55.00,
        "estoque": 35,
        "sku": "MANN-C27192",
        "aplicacao": "Carro e SUV",
        "disponivel": True
    },
    # ===== FILTROS - TECFIL =====
    {
        "nome": "Filtro de Ar Tecfil ARL5811",
        "descricao": "Filtro de ar para Toyota Corolla, Hilux. Média filtrante de alta qualidade.",
        "categoria": "Filtros",
        "subcategoria": "Linha Leve",
        "marca": "Tecfil",
        "preco": 45.00,
        "estoque": 45,
        "sku": "TEC-ARL5811",
        "aplicacao": "Carro e SUV",
        "disponivel": True
    },
    {
        "nome": "Filtro de Óleo Tecfil PSL135",
        "descricao": "Filtro de óleo para GM Onix, Prisma, Cobalt. Fabricação nacional de qualidade.",
        "categoria": "Filtros",
        "subcategoria": "Linha Leve",
        "marca": "Tecfil",
        "preco": 28.90,
        "estoque": 60,
        "sku": "TEC-PSL135",
        "aplicacao": "Carro e SUV",
        "disponivel": True
    },
    {
        "nome": "Filtro de Combustível Tecfil GI03",
        "descricao": "Filtro de combustível para injeção eletrônica. Alta eficiência de filtragem.",
        "categoria": "Filtros",
        "subcategoria": "Linha Leve",
        "marca": "Tecfil",
        "preco": 35.00,
        "estoque": 55,
        "sku": "TEC-GI03",
        "aplicacao": "Carro e SUV",
        "disponivel": True
    },
    {
        "nome": "Filtro de Cabine Tecfil ACP101",
        "descricao": "Filtro de ar condicionado para VW Gol, Voyage, Saveiro. Com carvão ativado.",
        "categoria": "Filtros",
        "subcategoria": "Linha Leve",
        "marca": "Tecfil",
        "preco": 42.00,
        "estoque": 40,
        "sku": "TEC-ACP101",
        "aplicacao": "Carro e SUV",
        "disponivel": True
    },
    # ===== FILTROS - DONALDSON (Linha Pesada) =====
    {
        "nome": "Filtro de Ar Donaldson P828889",
        "descricao": "Filtro de ar primário para caminhões Scania. Alta capacidade de retenção.",
        "categoria": "Filtros",
        "subcategoria": "Linha Pesada",
        "marca": "Donaldson",
        "preco": 185.00,
        "estoque": 20,
        "sku": "DON-P828889",
        "aplicacao": "Caminhão",
        "disponivel": True
    },
    {
        "nome": "Filtro de Ar Donaldson P781039",
        "descricao": "Filtro de ar para Volvo FH. Tecnologia PowerCore de alta eficiência.",
        "categoria": "Filtros",
        "subcategoria": "Linha Pesada",
        "marca": "Donaldson",
        "preco": 195.00,
        "estoque": 18,
        "sku": "DON-P781039",
        "aplicacao": "Caminhão",
        "disponivel": True
    },
    {
        "nome": "Filtro de Óleo Donaldson P550162",
        "descricao": "Filtro de óleo para motores Cummins. Spin-on de alta capacidade.",
        "categoria": "Filtros",
        "subcategoria": "Linha Pesada",
        "marca": "Donaldson",
        "preco": 75.00,
        "estoque": 25,
        "sku": "DON-P550162",
        "aplicacao": "Caminhão",
        "disponivel": True
    },
    # ===== FILTROS - FLEETGUARD =====
    {
        "nome": "Filtro Diesel Fleetguard FF5052",
        "descricao": "Filtro de combustível diesel para Volvo/Scania. Proteção premium do sistema.",
        "categoria": "Filtros",
        "subcategoria": "Linha Pesada",
        "marca": "Fleetguard",
        "preco": 89.90,
        "estoque": 30,
        "sku": "FG-FF5052",
        "aplicacao": "Caminhão",
        "disponivel": True
    },
    {
        "nome": "Filtro de Óleo Fleetguard LF3000",
        "descricao": "Filtro de óleo para motores Cummins ISB/ISC. Mídia StrataPore de alta eficiência.",
        "categoria": "Filtros",
        "subcategoria": "Linha Pesada",
        "marca": "Fleetguard",
        "preco": 85.00,
        "estoque": 28,
        "sku": "FG-LF3000",
        "aplicacao": "Caminhão",
        "disponivel": True
    },
    {
        "nome": "Filtro Separador de Água Fleetguard FS1212",
        "descricao": "Separador de água do diesel. Proteção contra contaminação do combustível.",
        "categoria": "Filtros",
        "subcategoria": "Linha Pesada",
        "marca": "Fleetguard",
        "preco": 125.00,
        "estoque": 22,
        "sku": "FG-FS1212",
        "aplicacao": "Caminhão",
        "disponivel": True
    },
    # ===== ADITIVOS - MILITEC =====
    {
        "nome": "Militec-1 200ml Condicionador de Metais",
        "descricao": "Condicionador sintético de metais. Reduz atrito e desgaste do motor.",
        "categoria": "Aditivos",
        "subcategoria": "Condicionadores",
        "marca": "Militec",
        "preco": 89.00,
        "estoque": 60,
        "sku": "MIL-200ML",
        "aplicacao": "Carro e SUV",
        "disponivel": True
    },
    {
        "nome": "Militec-1 500ml Condicionador de Metais",
        "descricao": "Embalagem econômica do condicionador de metais Militec. Para múltiplas aplicações.",
        "categoria": "Aditivos",
        "subcategoria": "Condicionadores",
        "marca": "Militec",
        "preco": 189.00,
        "estoque": 30,
        "sku": "MIL-500ML",
        "aplicacao": "Carro e SUV",
        "disponivel": True
    },
    # ===== LIMPEZA - TECBRIL =====
    {
        "nome": "Limpador de Parabrisa Concentrado 500ml Tecbril",
        "descricao": "Limpador concentrado para reservatório. Dilua 1:10 em água.",
        "categoria": "Limpeza",
        "subcategoria": "Parabrisa",
        "marca": "Tecbril",
        "preco": 12.90,
        "estoque": 120,
        "sku": "TBR-LIMP500",
        "aplicacao": "Carro e SUV",
        "disponivel": True
    },
    {
        "nome": "Silicone Spray 300ml Tecbril",
        "descricao": "Silicone em spray multiuso. Lubrifica, protege e dá brilho.",
        "categoria": "Limpeza",
        "subcategoria": "Silicones",
        "marca": "Tecbril",
        "preco": 18.90,
        "estoque": 100,
        "sku": "TBR-SIL300",
        "aplicacao": "Carro e SUV",
        "disponivel": True
    },
    {
        "nome": "Limpa Ar Condicionado 300ml Tecbril",
        "descricao": "Higienizador para sistema de ar condicionado. Elimina odores e bactérias.",
        "categoria": "Limpeza",
        "subcategoria": "Ar Condicionado",
        "marca": "Tecbril",
        "preco": 24.90,
        "estoque": 80,
        "sku": "TBR-AC300",
        "aplicacao": "Carro e SUV",
        "disponivel": True
    },
    {
        "nome": "Descarbonizante Motor 500ml Tecbril",
        "descricao": "Remove depósitos de carbono do motor. Restaura performance.",
        "categoria": "Limpeza",
        "subcategoria": "Motor",
        "marca": "Tecbril",
        "preco": 32.90,
        "estoque": 50,
        "sku": "TBR-DESC500",
        "aplicacao": "Carro e SUV",
        "disponivel": True
    },
    # ===== CÂMARAS DE AR - LEVORIN =====
    {
        "nome": "Câmara de Ar Moto Aro 18 Levorin",
        "descricao": "Câmara de ar 90/90-18 para motos. Borracha de alta qualidade.",
        "categoria": "Câmaras de Ar",
        "subcategoria": "Moto",
        "marca": "Levorin",
        "preco": 35.00,
        "estoque": 45,
        "sku": "LEV-CAM18",
        "aplicacao": "Moto",
        "disponivel": True
    },
    {
        "nome": "Câmara de Ar Moto Aro 17 Levorin",
        "descricao": "Câmara de ar 110/80-17 para motos esportivas. Bico TR4.",
        "categoria": "Câmaras de Ar",
        "subcategoria": "Moto",
        "marca": "Levorin",
        "preco": 38.00,
        "estoque": 40,
        "sku": "LEV-CAM17",
        "aplicacao": "Moto",
        "disponivel": True
    },
    {
        "nome": "Câmara de Ar Moto Aro 21 Levorin Trail",
        "descricao": "Câmara de ar 90/90-21 para motos trail/off-road. Reforçada.",
        "categoria": "Câmaras de Ar",
        "subcategoria": "Moto",
        "marca": "Levorin",
        "preco": 42.00,
        "estoque": 30,
        "sku": "LEV-CAM21",
        "aplicacao": "Moto",
        "disponivel": True
    },
    # ===== GRAXAS =====
    {
        "nome": "Graxa Multiuso 500g Ipiranga",
        "descricao": "Graxa de uso geral para aplicações diversas. Base de lítio.",
        "categoria": "Lubrificantes",
        "subcategoria": "Graxas",
        "marca": "Ipiranga",
        "preco": 28.50,
        "estoque": 70,
        "sku": "IPR-GRX500",
        "aplicacao": "Máquinas Pesadas",
        "disponivel": True
    },
    {
        "nome": "Graxa Para Rolamentos 500g Texaco Marfak",
        "descricao": "Graxa de alta performance para rolamentos. Resistente a água e calor.",
        "categoria": "Lubrificantes",
        "subcategoria": "Graxas",
        "marca": "Texaco",
        "preco": 38.90,
        "estoque": 55,
        "sku": "TEX-MARFAK500",
        "aplicacao": "Máquinas Pesadas",
        "disponivel": True
    },
    # ===== ÓLEOS HIDRÁULICOS =====
    {
        "nome": "Óleo Hidráulico 68 1L Ipiranga",
        "descricao": "Óleo hidráulico ISO 68 para sistemas hidráulicos industriais.",
        "categoria": "Lubrificantes",
        "subcategoria": "Hidráulicos",
        "marca": "Ipiranga",
        "preco": 32.00,
        "estoque": 60,
        "sku": "IPR-HID68-1L",
        "aplicacao": "Máquinas Pesadas",
        "disponivel": True
    },
    {
        "nome": "Óleo Hidráulico ATF Dexron III 1L Texaco",
        "descricao": "Fluido para transmissões automáticas e direção hidráulica.",
        "categoria": "Lubrificantes",
        "subcategoria": "Hidráulicos",
        "marca": "Texaco",
        "preco": 42.90,
        "estoque": 50,
        "sku": "TEX-ATF-1L",
        "aplicacao": "Carro e SUV",
        "disponivel": True
    },
    # ===== ÓLEOS PARA MOTO =====
    {
        "nome": "Óleo Moto 4T 10W40 Semissintético 1L Ipiranga",
        "descricao": "Óleo para motores 4 tempos de motos. API SL JASO MA2.",
        "categoria": "Lubrificantes",
        "subcategoria": "Moto",
        "marca": "Ipiranga",
        "preco": 35.90,
        "estoque": 80,
        "sku": "IPR-MOTO-10W40",
        "aplicacao": "Moto",
        "disponivel": True
    },
    {
        "nome": "Óleo Moto 2T 500ml Ipiranga",
        "descricao": "Óleo para motores 2 tempos. Baixa emissão de fumaça. JASO FC.",
        "categoria": "Lubrificantes",
        "subcategoria": "Moto",
        "marca": "Ipiranga",
        "preco": 22.90,
        "estoque": 60,
        "sku": "IPR-2T-500",
        "aplicacao": "Moto",
        "disponivel": True
    },
    # ===== ÓLEO DE CÂMBIO =====
    {
        "nome": "Óleo Câmbio 75W90 Sintético 1L Ipiranga",
        "descricao": "Óleo para câmbio manual e diferencial. GL-5.",
        "categoria": "Lubrificantes",
        "subcategoria": "Câmbio",
        "marca": "Ipiranga",
        "preco": 58.90,
        "estoque": 45,
        "sku": "IPR-75W90-1L",
        "aplicacao": "Carro e SUV",
        "disponivel": True
    },
    {
        "nome": "Óleo Câmbio 80W90 Mineral 1L Texaco",
        "descricao": "Óleo mineral para transmissão manual. API GL-5 MT-1.",
        "categoria": "Lubrificantes",
        "subcategoria": "Câmbio",
        "marca": "Texaco",
        "preco": 38.90,
        "estoque": 50,
        "sku": "TEX-80W90-1L",
        "aplicacao": "Carro e SUV",
        "disponivel": True
    },
    # ===== FILTROS AGRÍCOLAS =====
    {
        "nome": "Filtro de Ar Donaldson P181050 Agrícola",
        "descricao": "Filtro de ar para tratores John Deere. Aplicação agrícola.",
        "categoria": "Filtros",
        "subcategoria": "Agrícola",
        "marca": "Donaldson",
        "preco": 165.00,
        "estoque": 15,
        "sku": "DON-P181050",
        "aplicacao": "Máquinas Pesadas",
        "disponivel": True
    },
    {
        "nome": "Filtro Hidráulico Donaldson P551553",
        "descricao": "Filtro hidráulico para máquinas agrícolas e de construção.",
        "categoria": "Filtros",
        "subcategoria": "Agrícola",
        "marca": "Donaldson",
        "preco": 145.00,
        "estoque": 18,
        "sku": "DON-P551553",
        "aplicacao": "Máquinas Pesadas",
        "disponivel": True
    },
]


def importar_produtos():
    """Importa os produtos de teste para o banco de dados MySQL"""
    conn = get_mysql_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Verificar se tabela produtos existe, se não criar
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS produtos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                empresa_id INT NOT NULL,
                nome VARCHAR(200) NOT NULL,
                descricao TEXT,
                categoria VARCHAR(100),
                subcategoria VARCHAR(100),
                preco DECIMAL(10,2),
                preco_promocional DECIMAL(10,2),
                moeda VARCHAR(3) DEFAULT 'BRL',
                estoque INT,
                disponivel BOOLEAN DEFAULT TRUE,
                sku VARCHAR(100),
                codigo_barras VARCHAR(100),
                marca VARCHAR(100),
                aplicacao VARCHAR(100),
                peso DECIMAL(10,3),
                dimensoes VARCHAR(100),
                palavras_chave TEXT,
                tags TEXT,
                link VARCHAR(500),
                imagem_url VARCHAR(500),
                dados_extras JSON,
                ativo BOOLEAN DEFAULT TRUE,
                criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
                atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                importado_csv BOOLEAN DEFAULT FALSE,
                INDEX idx_empresa (empresa_id),
                INDEX idx_categoria (categoria),
                INDEX idx_sku (sku)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """)
        conn.commit()
        print("[OK] Tabela produtos verificada/criada")

        # Verificar quantos produtos já existem
        cursor.execute("SELECT COUNT(*) as count FROM produtos WHERE empresa_id = %s", (EMPRESA_ID,))
        result = cursor.fetchone()
        produtos_existentes = result['count'] if result else 0
        print(f"\n[INFO] Produtos existentes para empresa {EMPRESA_ID}: {produtos_existentes}")

        # Limpar e reimportar
        if produtos_existentes > 0:
            cursor.execute("DELETE FROM produtos WHERE empresa_id = %s", (EMPRESA_ID,))
            conn.commit()
            print(f"[OK] Produtos antigos removidos")

        # Importar produtos
        count = 0
        for dados in PRODUTOS_TESTE:
            palavras_chave = f"{dados['nome']} {dados['marca']} {dados['categoria']} {dados.get('subcategoria', '')} {dados.get('aplicacao', '')}"

            cursor.execute("""
                INSERT INTO produtos (
                    empresa_id, nome, descricao, categoria, subcategoria,
                    marca, preco, estoque, sku, aplicacao, disponivel, palavras_chave, ativo
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                EMPRESA_ID,
                dados['nome'],
                dados['descricao'],
                dados['categoria'],
                dados.get('subcategoria', ''),
                dados.get('marca', ''),
                dados['preco'],
                dados['estoque'],
                dados['sku'],
                dados.get('aplicacao', ''),
                dados.get('disponivel', True),
                palavras_chave,
                True
            ))

            count += 1
            print(f"  [+] {dados['nome'][:50]}...")

        conn.commit()
        print(f"\n{'='*60}")
        print(f"[OK] {count} produtos importados com sucesso!")

        # Verificar total
        cursor.execute("SELECT COUNT(*) as count FROM produtos WHERE empresa_id = %s", (EMPRESA_ID,))
        result = cursor.fetchone()
        print(f"[INFO] Total de produtos da empresa {EMPRESA_ID}: {result['count']}")
        print(f"{'='*60}")

        # Resumo por categoria
        print("\nResumo por categoria:")
        cursor.execute("""
            SELECT categoria, COUNT(*) as qtd
            FROM produtos
            WHERE empresa_id = %s
            GROUP BY categoria
            ORDER BY categoria
        """, (EMPRESA_ID,))
        for row in cursor.fetchall():
            print(f"  - {row['categoria']}: {row['qtd']} produtos")

    except Exception as e:
        conn.rollback()
        print(f"[ERRO] Falha ao importar: {e}")
        raise
    finally:
        cursor.close()
        conn.close()


if __name__ == '__main__':
    print("="*60)
    print("IMPORTADOR DE PRODUTOS - ATACADO/VAREJO")
    print("="*60)
    print(f"\nEmpresa ID: {EMPRESA_ID}")
    print(f"Total de produtos a importar: {len(PRODUTOS_TESTE)}")
    print()

    importar_produtos()
