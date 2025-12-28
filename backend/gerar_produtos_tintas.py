# -*- coding: utf-8 -*-
"""
Gerador de 1000 produtos para Loja de Tintas
Empresa ID: 27
"""

import csv
import random
import sqlite3
from datetime import datetime

EMPRESA_ID = 27

# ============================================================================
# DADOS BASE PARA GERACAO DE PRODUTOS
# ============================================================================

MARCAS_TINTAS = ["Suvinil", "Coral", "Sherwin-Williams", "Lukscolor", "Eucatex", "Dacar", "Anjo", "Renner"]
MARCAS_VERNIZES = ["Sparlack", "Sayerlack", "Montana", "Colorgin", "Brasilux"]
MARCAS_MASSA = ["Suvinil", "Coral", "Anjo", "Eucatex", "Lukscolor"]
MARCAS_ACESSORIOS = ["Atlas", "Tigre", "Condor", "Roma", "Castor"]

CORES = [
    "Branco", "Branco Neve", "Branco Gelo", "Off-White", "Marfim",
    "Bege", "Areia", "Palha", "Creme", "Camurca",
    "Cinza Claro", "Cinza Medio", "Cinza Escuro", "Grafite", "Chumbo",
    "Preto", "Preto Fosco",
    "Azul Claro", "Azul Celeste", "Azul Royal", "Azul Marinho", "Azul Petroleo",
    "Verde Claro", "Verde Menta", "Verde Agua", "Verde Folha", "Verde Musgo",
    "Amarelo Claro", "Amarelo Canario", "Amarelo Ouro", "Mostarda",
    "Laranja", "Laranja Queimado", "Terracota", "Coral",
    "Rosa Claro", "Rosa Antigo", "Rose", "Salmao",
    "Vermelho", "Vermelho Escuro", "Vinho", "Borgonha",
    "Lilas", "Lavanda", "Violeta", "Roxo",
    "Marrom Claro", "Marrom Cafe", "Chocolate", "Tabaco"
]

ACABAMENTOS = ["Fosco", "Acetinado", "Semi-Brilho", "Brilhante"]

# Tamanhos e precos
TAMANHOS_TINTA = [
    {"nome": "900ml", "litros": 0.9, "fator_preco": 0.25},
    {"nome": "3.6L", "litros": 3.6, "fator_preco": 1.0},
    {"nome": "18L", "litros": 18, "fator_preco": 4.5},
    {"nome": "20L", "litros": 20, "fator_preco": 5.0}
]

# ============================================================================
# CATEGORIAS E PRODUTOS
# ============================================================================

def gerar_tintas_acrilicas():
    """Gera tintas acrilicas para paredes internas e externas"""
    produtos = []

    # Tintas Acrilicas Standard
    for marca in MARCAS_TINTAS:
        for cor in CORES[:30]:  # Primeiras 30 cores
            for tam in TAMANHOS_TINTA:
                preco_base = random.uniform(45, 75)
                produtos.append({
                    "nome": f"Tinta Acrilica {marca} {cor} {tam['nome']}",
                    "descricao": f"Tinta acrilica de alta qualidade para paredes internas e externas. Cor {cor}, acabamento fosco. Rendimento: {int(tam['litros'] * 10)}m2/demao.",
                    "categoria": "Tintas",
                    "subcategoria": "Acrilica",
                    "marca": marca,
                    "preco": round(preco_base * tam['fator_preco'], 2),
                    "estoque": random.randint(20, 150),
                    "sku": f"ACR-{marca[:3].upper()}-{cor[:3].upper()}-{tam['nome'].replace('.', '')}",
                    "aplicacao": "Paredes Internas e Externas",
                    "disponivel": True
                })

    # Tintas Acrilicas Premium
    for marca in MARCAS_TINTAS[:4]:
        for cor in CORES[:20]:
            for acabamento in ACABAMENTOS:
                tam = random.choice(TAMANHOS_TINTA[1:3])  # 3.6L ou 18L
                preco_base = random.uniform(85, 120)
                produtos.append({
                    "nome": f"Tinta Acrilica Premium {marca} {cor} {acabamento} {tam['nome']}",
                    "descricao": f"Tinta acrilica premium lavavel. Alto poder de cobertura. Cor {cor}, acabamento {acabamento.lower()}. Rendimento: {int(tam['litros'] * 12)}m2/demao.",
                    "categoria": "Tintas",
                    "subcategoria": "Acrilica Premium",
                    "marca": marca,
                    "preco": round(preco_base * tam['fator_preco'], 2),
                    "estoque": random.randint(15, 80),
                    "sku": f"ACRP-{marca[:3].upper()}-{cor[:3].upper()}-{acabamento[:3].upper()}-{tam['nome'].replace('.', '')}",
                    "aplicacao": "Paredes Internas e Externas",
                    "disponivel": True
                })

    return produtos

def gerar_tintas_latex():
    """Gera tintas latex economicas"""
    produtos = []

    for marca in MARCAS_TINTAS:
        for cor in ["Branco", "Branco Gelo", "Marfim", "Bege", "Cinza Claro"]:
            for tam in TAMANHOS_TINTA:
                preco_base = random.uniform(28, 45)
                produtos.append({
                    "nome": f"Tinta Latex {marca} {cor} {tam['nome']}",
                    "descricao": f"Tinta latex economica para ambientes internos. Secagem rapida. Cor {cor}. Rendimento: {int(tam['litros'] * 8)}m2/demao.",
                    "categoria": "Tintas",
                    "subcategoria": "Latex",
                    "marca": marca,
                    "preco": round(preco_base * tam['fator_preco'], 2),
                    "estoque": random.randint(30, 200),
                    "sku": f"LAT-{marca[:3].upper()}-{cor[:3].upper()}-{tam['nome'].replace('.', '')}",
                    "aplicacao": "Paredes Internas",
                    "disponivel": True
                })

    return produtos

def gerar_esmaltes_sinteticos():
    """Gera esmaltes sinteticos para madeira e metal"""
    produtos = []

    cores_esmalte = ["Branco", "Preto", "Cinza", "Azul", "Verde", "Vermelho", "Amarelo", "Marrom"]
    tamanhos = [
        {"nome": "900ml", "fator": 1.0},
        {"nome": "3.6L", "fator": 3.5}
    ]

    for marca in MARCAS_TINTAS[:5]:
        for cor in cores_esmalte:
            for acabamento in ["Brilhante", "Acetinado"]:
                for tam in tamanhos:
                    preco_base = random.uniform(55, 85)
                    produtos.append({
                        "nome": f"Esmalte Sintetico {marca} {cor} {acabamento} {tam['nome']}",
                        "descricao": f"Esmalte sintetico de alta durabilidade para madeiras e metais. Cor {cor}, acabamento {acabamento.lower()}. Excelente aderencia e resistencia.",
                        "categoria": "Tintas",
                        "subcategoria": "Esmalte Sintetico",
                        "marca": marca,
                        "preco": round(preco_base * tam['fator'], 2),
                        "estoque": random.randint(20, 100),
                        "sku": f"ESM-{marca[:3].upper()}-{cor[:3].upper()}-{acabamento[:3].upper()}-{tam['nome'].replace('.', '')}",
                        "aplicacao": "Madeira e Metal",
                        "disponivel": True
                    })

    return produtos

def gerar_tintas_piso():
    """Gera tintas para piso"""
    produtos = []

    cores_piso = ["Cinza", "Verde", "Vermelho", "Amarelo", "Azul", "Concreto"]

    for marca in MARCAS_TINTAS[:4]:
        for cor in cores_piso:
            for tam in [{"nome": "3.6L", "fator": 1.0}, {"nome": "18L", "fator": 4.5}]:
                preco_base = random.uniform(65, 95)
                produtos.append({
                    "nome": f"Tinta para Piso {marca} {cor} {tam['nome']}",
                    "descricao": f"Tinta especial para pisos de alta resistencia ao trafego. Cor {cor}. Indicada para garagens, calcadas e areas industriais.",
                    "categoria": "Tintas",
                    "subcategoria": "Tinta para Piso",
                    "marca": marca,
                    "preco": round(preco_base * tam['fator'], 2),
                    "estoque": random.randint(15, 60),
                    "sku": f"PISO-{marca[:3].upper()}-{cor[:3].upper()}-{tam['nome'].replace('.', '')}",
                    "aplicacao": "Pisos",
                    "disponivel": True
                })

    return produtos

def gerar_tintas_spray():
    """Gera tintas spray"""
    produtos = []

    cores_spray = ["Branco", "Preto", "Prata", "Dourado", "Vermelho", "Azul", "Verde", "Amarelo", "Laranja", "Rosa"]
    marcas_spray = ["Colorgin", "Tekbond", "Chemicolor", "Lukscolor"]

    for marca in marcas_spray:
        for cor in cores_spray:
            for acabamento in ["Brilhante", "Fosco", "Metalico"]:
                preco = random.uniform(18, 35)
                produtos.append({
                    "nome": f"Tinta Spray {marca} {cor} {acabamento} 400ml",
                    "descricao": f"Tinta spray de secagem rapida. Cor {cor}, acabamento {acabamento.lower()}. Ideal para artesanato, reformas e retoques.",
                    "categoria": "Tintas",
                    "subcategoria": "Spray",
                    "marca": marca,
                    "preco": round(preco, 2),
                    "estoque": random.randint(30, 150),
                    "sku": f"SPR-{marca[:3].upper()}-{cor[:3].upper()}-{acabamento[:3].upper()}",
                    "aplicacao": "Uso Geral",
                    "disponivel": True
                })

    return produtos

def gerar_vernizes():
    """Gera vernizes para madeira"""
    produtos = []

    tipos = ["Maritimo", "Copal", "Poliuretano", "Acrilico"]
    cores_verniz = ["Natural", "Imbuia", "Mogno", "Cedro", "Ipe"]

    for marca in MARCAS_VERNIZES:
        for tipo in tipos:
            for cor in cores_verniz:
                for tam in [{"nome": "900ml", "fator": 1.0}, {"nome": "3.6L", "fator": 3.5}]:
                    for acabamento in ["Brilhante", "Fosco"]:
                        preco_base = random.uniform(45, 85)
                        produtos.append({
                            "nome": f"Verniz {tipo} {marca} {cor} {acabamento} {tam['nome']}",
                            "descricao": f"Verniz {tipo.lower()} para protecao de madeiras. Tonalidade {cor.lower()}, acabamento {acabamento.lower()}. Alta resistencia a intemperies.",
                            "categoria": "Vernizes",
                            "subcategoria": tipo,
                            "marca": marca,
                            "preco": round(preco_base * tam['fator'], 2),
                            "estoque": random.randint(10, 50),
                            "sku": f"VER-{marca[:3].upper()}-{tipo[:3].upper()}-{cor[:3].upper()}-{tam['nome'].replace('.', '')}",
                            "aplicacao": "Madeira",
                            "disponivel": True
                        })

    return produtos

def gerar_massa_corrida():
    """Gera massa corrida e massa acrilica"""
    produtos = []

    # Massa Corrida PVA
    for marca in MARCAS_MASSA:
        for tam in [{"nome": "1.5kg", "fator": 1.0, "kg": 1.5}, {"nome": "5.5kg", "fator": 3.0, "kg": 5.5}, {"nome": "25kg", "fator": 10.0, "kg": 25}]:
            preco_base = random.uniform(12, 22)
            produtos.append({
                "nome": f"Massa Corrida PVA {marca} {tam['nome']}",
                "descricao": f"Massa corrida para nivelamento de paredes internas. Facil aplicacao e lixamento. Rendimento: {int(tam['kg'] * 2)}m2.",
                "categoria": "Massas",
                "subcategoria": "Massa Corrida PVA",
                "marca": marca,
                "preco": round(preco_base * tam['fator'], 2),
                "estoque": random.randint(30, 150),
                "sku": f"MCPVA-{marca[:3].upper()}-{tam['kg']}KG",
                "aplicacao": "Paredes Internas",
                "disponivel": True
            })

    # Massa Acrilica
    for marca in MARCAS_MASSA:
        for tam in [{"nome": "1.5kg", "fator": 1.0, "kg": 1.5}, {"nome": "5.5kg", "fator": 3.0, "kg": 5.5}, {"nome": "25kg", "fator": 10.0, "kg": 25}]:
            preco_base = random.uniform(18, 32)
            produtos.append({
                "nome": f"Massa Acrilica {marca} {tam['nome']}",
                "descricao": f"Massa acrilica para nivelamento de paredes internas e externas. Resistente a umidade. Rendimento: {int(tam['kg'] * 1.5)}m2.",
                "categoria": "Massas",
                "subcategoria": "Massa Acrilica",
                "marca": marca,
                "preco": round(preco_base * tam['fator'], 2),
                "estoque": random.randint(25, 120),
                "sku": f"MACR-{marca[:3].upper()}-{tam['kg']}KG",
                "aplicacao": "Paredes Internas e Externas",
                "disponivel": True
            })

    return produtos

def gerar_solventes():
    """Gera solventes e diluentes"""
    produtos = []

    tipos = [
        {"tipo": "Aguarras", "preco_base": 18},
        {"tipo": "Thinner", "preco_base": 22},
        {"tipo": "Solvente para Esmalte", "preco_base": 20},
        {"tipo": "Diluente para Verniz", "preco_base": 25}
    ]

    marcas = ["Itaqua", "Natrielli", "Anjo", "Eucatex"]
    tamanhos = [{"nome": "500ml", "fator": 0.6}, {"nome": "900ml", "fator": 1.0}, {"nome": "5L", "fator": 4.5}]

    for item in tipos:
        for marca in marcas:
            for tam in tamanhos:
                produtos.append({
                    "nome": f"{item['tipo']} {marca} {tam['nome']}",
                    "descricao": f"{item['tipo']} de alta pureza para diluicao de tintas e limpeza de equipamentos. Use em local ventilado.",
                    "categoria": "Solventes",
                    "subcategoria": item['tipo'],
                    "marca": marca,
                    "preco": round(item['preco_base'] * tam['fator'], 2),
                    "estoque": random.randint(40, 200),
                    "sku": f"SOL-{item['tipo'][:3].upper()}-{marca[:3].upper()}-{tam['nome'].replace('.', '')}",
                    "aplicacao": "Diluicao e Limpeza",
                    "disponivel": True
                })

    return produtos

def gerar_pinceis():
    """Gera pinceis de pintura"""
    produtos = []

    tamanhos_pincel = ["1\"", "1.5\"", "2\"", "2.5\"", "3\"", "4\""]
    tipos = ["Trincha", "Pincel Chato", "Pincel Redondo"]

    for marca in MARCAS_ACESSORIOS:
        for tipo in tipos:
            for tam in tamanhos_pincel:
                preco = random.uniform(8, 35)
                produtos.append({
                    "nome": f"{tipo} {marca} {tam}",
                    "descricao": f"{tipo} profissional com cerdas de alta qualidade. Ideal para acabamentos perfeitos. Cabo ergonomico.",
                    "categoria": "Pinceis",
                    "subcategoria": tipo,
                    "marca": marca,
                    "preco": round(preco, 2),
                    "estoque": random.randint(20, 100),
                    "sku": f"PIN-{tipo[:3].upper()}-{marca[:3].upper()}-{tam.replace('\"', '')}",
                    "aplicacao": "Pintura",
                    "disponivel": True
                })

    return produtos

def gerar_rolos():
    """Gera rolos de pintura"""
    produtos = []

    tamanhos_rolo = ["9cm", "15cm", "23cm"]
    tipos_pelo = ["La de Carneiro", "Espuma", "Veludo", "Anti-Gota", "Textura"]

    for marca in MARCAS_ACESSORIOS:
        for pelo in tipos_pelo:
            for tam in tamanhos_rolo:
                preco = random.uniform(12, 55)
                produtos.append({
                    "nome": f"Rolo {pelo} {marca} {tam}",
                    "descricao": f"Rolo de pintura {pelo.lower()} para acabamento profissional. Largura {tam}. Nao deixa marcas.",
                    "categoria": "Rolos",
                    "subcategoria": pelo,
                    "marca": marca,
                    "preco": round(preco, 2),
                    "estoque": random.randint(25, 120),
                    "sku": f"ROL-{pelo[:3].upper()}-{marca[:3].upper()}-{tam.replace('cm', '')}",
                    "aplicacao": "Pintura",
                    "disponivel": True
                })

    # Suportes/Cabos para rolo
    for marca in MARCAS_ACESSORIOS:
        for tam in tamanhos_rolo:
            produtos.append({
                "nome": f"Suporte para Rolo {marca} {tam}",
                "descricao": f"Suporte/cabo para rolo de pintura {tam}. Encaixe universal. Cabo plastificado.",
                "categoria": "Rolos",
                "subcategoria": "Suportes",
                "marca": marca,
                "preco": round(random.uniform(8, 25), 2),
                "estoque": random.randint(30, 100),
                "sku": f"SUP-ROL-{marca[:3].upper()}-{tam.replace('cm', '')}",
                "aplicacao": "Pintura",
                "disponivel": True
            })

    return produtos

def gerar_acessorios():
    """Gera acessorios de pintura"""
    produtos = []

    # Bandejas
    for marca in MARCAS_ACESSORIOS:
        for tam in ["Pequena", "Media", "Grande"]:
            produtos.append({
                "nome": f"Bandeja para Pintura {marca} {tam}",
                "descricao": f"Bandeja plastica para pintura tamanho {tam.lower()}. Superficie texturizada para distribuicao uniforme.",
                "categoria": "Acessorios",
                "subcategoria": "Bandejas",
                "marca": marca,
                "preco": round(random.uniform(8, 25), 2),
                "estoque": random.randint(30, 100),
                "sku": f"BAND-{marca[:3].upper()}-{tam[:3].upper()}",
                "aplicacao": "Pintura",
                "disponivel": True
            })

    # Extensores/Cabos Extensores
    for marca in MARCAS_ACESSORIOS:
        for tam in ["1.2m", "2m", "3m"]:
            produtos.append({
                "nome": f"Cabo Extensor para Rolo {marca} {tam}",
                "descricao": f"Cabo extensor de aluminio com {tam} para pintura em alturas. Rosca universal.",
                "categoria": "Acessorios",
                "subcategoria": "Extensores",
                "marca": marca,
                "preco": round(random.uniform(25, 65), 2),
                "estoque": random.randint(15, 50),
                "sku": f"EXT-{marca[:3].upper()}-{tam.replace('.', '').replace('m', '')}",
                "aplicacao": "Pintura",
                "disponivel": True
            })

    # Espatulas
    for marca in MARCAS_ACESSORIOS:
        for tam in ["4cm", "6cm", "8cm", "10cm", "15cm"]:
            produtos.append({
                "nome": f"Espatula de Aco {marca} {tam}",
                "descricao": f"Espatula de aco inox flexivel {tam}. Ideal para aplicacao de massa e remocao de tinta.",
                "categoria": "Acessorios",
                "subcategoria": "Espatulas",
                "marca": marca,
                "preco": round(random.uniform(12, 35), 2),
                "estoque": random.randint(25, 80),
                "sku": f"ESP-{marca[:3].upper()}-{tam.replace('cm', '')}",
                "aplicacao": "Preparacao",
                "disponivel": True
            })

    # Lixas
    granas = ["80", "100", "120", "150", "180", "220", "320", "400"]
    for grana in granas:
        produtos.append({
            "nome": f"Lixa para Massa/Parede Grana {grana}",
            "descricao": f"Lixa d'agua grana {grana} para lixamento de massa corrida e paredes. Folha A4.",
            "categoria": "Acessorios",
            "subcategoria": "Lixas",
            "marca": "Norton",
            "preco": round(random.uniform(1.50, 4.50), 2),
            "estoque": random.randint(100, 500),
            "sku": f"LIXA-{grana}",
            "aplicacao": "Preparacao",
            "disponivel": True
        })

    # Fita Crepe
    for marca in ["3M", "Adere", "Tectape"]:
        for tam in ["18mm", "24mm", "48mm"]:
            produtos.append({
                "nome": f"Fita Crepe {marca} {tam} x 50m",
                "descricao": f"Fita crepe para demarcacao e protecao. Largura {tam}, comprimento 50m. Remove sem deixar residuos.",
                "categoria": "Acessorios",
                "subcategoria": "Fitas",
                "marca": marca,
                "preco": round(random.uniform(8, 25), 2),
                "estoque": random.randint(50, 200),
                "sku": f"FCREPE-{marca[:3].upper()}-{tam.replace('mm', '')}",
                "aplicacao": "Protecao",
                "disponivel": True
            })

    # Lona Plastica
    for tam in ["3x3m", "4x4m", "4x5m", "5x6m"]:
            produtos.append({
                "nome": f"Lona Plastica para Pintura {tam}",
                "descricao": f"Lona plastica para protecao de pisos e moveis. Tamanho {tam}. Resistente e reutilizavel.",
                "categoria": "Acessorios",
                "subcategoria": "Lonas",
                "marca": "Plastilon",
                "preco": round(random.uniform(15, 45), 2),
                "estoque": random.randint(30, 100),
                "sku": f"LONA-{tam.replace('x', '').replace('m', '')}",
                "aplicacao": "Protecao",
                "disponivel": True
            })

    return produtos

def gerar_seladores_primers():
    """Gera seladores e primers"""
    produtos = []

    # Selador Acrilico
    for marca in MARCAS_TINTAS[:5]:
        for tam in [{"nome": "3.6L", "fator": 1.0}, {"nome": "18L", "fator": 4.5}]:
            preco_base = random.uniform(35, 55)
            produtos.append({
                "nome": f"Selador Acrilico {marca} {tam['nome']}",
                "descricao": f"Selador acrilico para paredes novas e repinturas. Uniformiza a absorcao da tinta. Rendimento: {int(3.6 * tam['fator'] * 15)}m2.",
                "categoria": "Seladores",
                "subcategoria": "Selador Acrilico",
                "marca": marca,
                "preco": round(preco_base * tam['fator'], 2),
                "estoque": random.randint(20, 80),
                "sku": f"SELAC-{marca[:3].upper()}-{tam['nome'].replace('.', '')}",
                "aplicacao": "Paredes",
                "disponivel": True
            })

    # Fundo Preparador
    for marca in MARCAS_TINTAS[:4]:
        for tam in [{"nome": "900ml", "fator": 0.3}, {"nome": "3.6L", "fator": 1.0}]:
            preco_base = random.uniform(45, 70)
            produtos.append({
                "nome": f"Fundo Preparador de Paredes {marca} {tam['nome']}",
                "descricao": f"Fundo preparador para superficies caiadas, pulverulentas ou com manchas. Alta penetracao.",
                "categoria": "Seladores",
                "subcategoria": "Fundo Preparador",
                "marca": marca,
                "preco": round(preco_base * tam['fator'], 2),
                "estoque": random.randint(15, 60),
                "sku": f"FPREP-{marca[:3].upper()}-{tam['nome'].replace('.', '')}",
                "aplicacao": "Paredes",
                "disponivel": True
            })

    # Primer para Metal
    for marca in MARCAS_TINTAS[:4]:
        cores = ["Cinza", "Branco", "Vermelho Oxido"]
        for cor in cores:
            for tam in [{"nome": "900ml", "fator": 1.0}, {"nome": "3.6L", "fator": 3.5}]:
                preco_base = random.uniform(38, 58)
                produtos.append({
                    "nome": f"Primer Anticorrosivo {marca} {cor} {tam['nome']}",
                    "descricao": f"Primer anticorrosivo para superficies metalicas. Cor {cor.lower()}. Protege contra ferrugem.",
                    "categoria": "Primers",
                    "subcategoria": "Primer Anticorrosivo",
                    "marca": marca,
                    "preco": round(preco_base * tam['fator'], 2),
                    "estoque": random.randint(15, 50),
                    "sku": f"PRANT-{marca[:3].upper()}-{cor[:3].upper()}-{tam['nome'].replace('.', '')}",
                    "aplicacao": "Metal",
                    "disponivel": True
                })

    return produtos

def gerar_impermeabilizantes():
    """Gera impermeabilizantes"""
    produtos = []

    tipos = [
        {"tipo": "Manta Liquida", "preco_base": 85},
        {"tipo": "Impermeabilizante Acrilico", "preco_base": 65},
        {"tipo": "Veda Trinca", "preco_base": 45}
    ]

    for item in tipos:
        for marca in MARCAS_TINTAS[:4]:
            for tam in [{"nome": "3.6L", "fator": 1.0}, {"nome": "18L", "fator": 4.5}]:
                produtos.append({
                    "nome": f"{item['tipo']} {marca} {tam['nome']}",
                    "descricao": f"{item['tipo']} para protecao de lajes, muros e areas umidas. Alta elasticidade e durabilidade.",
                    "categoria": "Impermeabilizantes",
                    "subcategoria": item['tipo'],
                    "marca": marca,
                    "preco": round(item['preco_base'] * tam['fator'], 2),
                    "estoque": random.randint(10, 40),
                    "sku": f"IMP-{item['tipo'][:4].upper()}-{marca[:3].upper()}-{tam['nome'].replace('.', '')}",
                    "aplicacao": "Lajes e Muros",
                    "disponivel": True
                })

    return produtos

def gerar_textura():
    """Gera texturas e grafiatos"""
    produtos = []

    tipos = ["Textura Lisa", "Textura Rustica", "Grafiato"]
    cores_textura = ["Branco", "Bege", "Areia", "Palha", "Cinza"]

    for tipo in tipos:
        for marca in MARCAS_TINTAS[:4]:
            for cor in cores_textura:
                for tam in [{"nome": "25kg", "fator": 1.0}]:
                    preco_base = random.uniform(85, 140)
                    produtos.append({
                        "nome": f"{tipo} {marca} {cor} {tam['nome']}",
                        "descricao": f"{tipo} acrilica para fachadas e paredes. Cor {cor.lower()}. Excelente acabamento e durabilidade.",
                        "categoria": "Texturas",
                        "subcategoria": tipo,
                        "marca": marca,
                        "preco": round(preco_base, 2),
                        "estoque": random.randint(10, 40),
                        "sku": f"TEX-{tipo[:3].upper()}-{marca[:3].upper()}-{cor[:3].upper()}",
                        "aplicacao": "Paredes e Fachadas",
                        "disponivel": True
                    })

    return produtos

# ============================================================================
# FUNCAO PRINCIPAL
# ============================================================================

def gerar_todos_produtos():
    """Gera todos os produtos e retorna lista"""
    todos = []

    print("Gerando Tintas Acrilicas...")
    todos.extend(gerar_tintas_acrilicas())

    print("Gerando Tintas Latex...")
    todos.extend(gerar_tintas_latex())

    print("Gerando Esmaltes Sinteticos...")
    todos.extend(gerar_esmaltes_sinteticos())

    print("Gerando Tintas para Piso...")
    todos.extend(gerar_tintas_piso())

    print("Gerando Tintas Spray...")
    todos.extend(gerar_tintas_spray())

    print("Gerando Vernizes...")
    todos.extend(gerar_vernizes())

    print("Gerando Massas...")
    todos.extend(gerar_massa_corrida())

    print("Gerando Solventes...")
    todos.extend(gerar_solventes())

    print("Gerando Pinceis...")
    todos.extend(gerar_pinceis())

    print("Gerando Rolos...")
    todos.extend(gerar_rolos())

    print("Gerando Acessorios...")
    todos.extend(gerar_acessorios())

    print("Gerando Seladores e Primers...")
    todos.extend(gerar_seladores_primers())

    print("Gerando Impermeabilizantes...")
    todos.extend(gerar_impermeabilizantes())

    print("Gerando Texturas...")
    todos.extend(gerar_textura())

    return todos

def salvar_csv(produtos, arquivo):
    """Salva produtos em arquivo CSV"""
    campos = ['nome', 'descricao', 'categoria', 'subcategoria', 'marca', 'preco', 'estoque', 'sku', 'aplicacao', 'disponivel']

    with open(arquivo, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=campos)
        writer.writeheader()
        for p in produtos:
            writer.writerow(p)

    print(f"\n[OK] CSV salvo: {arquivo}")

def importar_para_sqlite(produtos):
    """Importa produtos para o banco SQLite"""
    db_path = 'D:/Helix/HelixAI/backend/vendeai.db'
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Verificar se tabela existe
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS produtos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            empresa_id INTEGER NOT NULL,
            nome TEXT NOT NULL,
            descricao TEXT,
            categoria TEXT,
            subcategoria TEXT,
            preco REAL,
            preco_promocional REAL,
            moeda TEXT DEFAULT 'BRL',
            estoque INTEGER,
            disponivel INTEGER DEFAULT 1,
            sku TEXT,
            codigo_barras TEXT,
            marca TEXT,
            aplicacao TEXT,
            peso REAL,
            dimensoes TEXT,
            palavras_chave TEXT,
            tags TEXT,
            link TEXT,
            imagem_url TEXT,
            dados_extras TEXT,
            ativo INTEGER DEFAULT 1,
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
            atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
            importado_csv INTEGER DEFAULT 0
        )
    """)
    conn.commit()
    print("[OK] Tabela produtos verificada/criada")

    # Limpar produtos antigos da empresa
    cursor.execute("DELETE FROM produtos WHERE empresa_id = ?", (EMPRESA_ID,))
    conn.commit()
    print(f"[OK] Produtos antigos da empresa {EMPRESA_ID} removidos")

    # Importar novos produtos
    count = 0
    for p in produtos:
        palavras_chave = f"{p['nome']} {p['marca']} {p['categoria']} {p.get('subcategoria', '')} {p.get('aplicacao', '')}"

        cursor.execute("""
            INSERT INTO produtos (
                empresa_id, nome, descricao, categoria, subcategoria,
                marca, preco, estoque, sku, aplicacao, disponivel, palavras_chave, ativo
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        """, (
            EMPRESA_ID,
            p['nome'],
            p['descricao'],
            p['categoria'],
            p.get('subcategoria', ''),
            p.get('marca', ''),
            p['preco'],
            p['estoque'],
            p['sku'],
            p.get('aplicacao', ''),
            1 if p.get('disponivel', True) else 0,
            palavras_chave
        ))
        count += 1

        if count % 100 == 0:
            print(f"  [+] {count} produtos importados...")

    conn.commit()
    conn.close()

    print(f"\n[OK] {count} produtos importados para SQLite")
    return count

def mostrar_resumo(produtos):
    """Mostra resumo dos produtos gerados"""
    categorias = {}
    for p in produtos:
        cat = p['categoria']
        if cat not in categorias:
            categorias[cat] = 0
        categorias[cat] += 1

    print("\n" + "="*60)
    print("RESUMO POR CATEGORIA")
    print("="*60)
    for cat, qtd in sorted(categorias.items()):
        print(f"  {cat}: {qtd} produtos")
    print("="*60)
    print(f"TOTAL: {len(produtos)} produtos")
    print("="*60)

if __name__ == "__main__":
    print("\n" + "#"*70)
    print("#  GERADOR DE PRODUTOS - LOJA DE TINTAS")
    print("#  Empresa ID: " + str(EMPRESA_ID))
    print("#"*70 + "\n")

    # Gerar produtos
    produtos = gerar_todos_produtos()

    # Se tiver menos de 1000, duplicar de TODAS as categorias proporcionalmente
    if len(produtos) < 1000:
        # Agrupar por categoria
        por_categoria = {}
        for p in produtos:
            cat = p['categoria']
            if cat not in por_categoria:
                por_categoria[cat] = []
            por_categoria[cat].append(p)

        while len(produtos) < 1000:
            # Escolher categoria aleatoria (distribui melhor)
            cat_escolhida = random.choice(list(por_categoria.keys()))
            produto_base = random.choice(por_categoria[cat_escolhida])
            novo = produto_base.copy()
            novo['nome'] = novo['nome'] + f" Ed. Especial {random.randint(1, 999)}"
            novo['sku'] = novo['sku'] + f"-ESP{random.randint(1, 999)}"
            novo['preco'] = round(novo['preco'] * random.uniform(0.85, 1.15), 2)
            produtos.append(novo)

    # Limitar a 1000
    produtos = produtos[:1000]

    # Mostrar resumo
    mostrar_resumo(produtos)

    # Salvar CSV
    csv_path = 'D:/Helix/HelixAI/backend/produtos_tintas_1000.csv'
    salvar_csv(produtos, csv_path)

    # Importar para SQLite
    print("\nImportando para banco de dados SQLite...")
    importar_para_sqlite(produtos)

    print("\n" + "#"*70)
    print("#  PROCESSO CONCLUIDO!")
    print("#  CSV: " + csv_path)
    print("#  Banco: vendeai.db")
    print("#  Empresa ID: " + str(EMPRESA_ID))
    print("#"*70 + "\n")
