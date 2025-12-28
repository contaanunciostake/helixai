# -*- coding: utf-8 -*-
"""
Importador de 1000 produtos para Loja de Tintas - Versao Balanceada
Empresa ID: 27
"""

import csv
import random
import sqlite3
from datetime import datetime

EMPRESA_ID = 27
DB_PATH = 'D:/Helix/HelixAI/backend/vendeai.db'

# ============================================================================
# DADOS BASE
# ============================================================================

MARCAS_TINTAS = ["Suvinil", "Coral", "Sherwin-Williams", "Lukscolor", "Eucatex", "Dacar", "Anjo", "Renner"]
MARCAS_VERNIZES = ["Sparlack", "Sayerlack", "Montana", "Colorgin"]
MARCAS_MASSA = ["Suvinil", "Coral", "Anjo", "Eucatex"]
MARCAS_ACESSORIOS = ["Atlas", "Tigre", "Condor", "Roma", "Castor"]

CORES = ["Branco", "Branco Neve", "Branco Gelo", "Off-White", "Marfim", "Bege", "Areia", "Palha",
         "Cinza Claro", "Cinza Medio", "Cinza Escuro", "Grafite", "Preto",
         "Azul Claro", "Azul Celeste", "Azul Royal", "Azul Marinho",
         "Verde Claro", "Verde Menta", "Verde Agua", "Verde Folha",
         "Amarelo", "Amarelo Canario", "Mostarda",
         "Laranja", "Terracota", "Coral",
         "Rosa Claro", "Rosa Antigo", "Salmao",
         "Vermelho", "Vinho", "Borgonha",
         "Lilas", "Lavanda", "Roxo",
         "Marrom Claro", "Chocolate", "Tabaco"]

# Lista fixa de 1000 produtos para loja de tintas
PRODUTOS = []

# ============================================================================
# FUNCAO PARA CRIAR PRODUTOS
# ============================================================================

def adicionar_tintas_acrilicas(qtd=200):
    """Adiciona tintas acrilicas"""
    produtos = []
    tamanhos = [("900ml", 0.25), ("3.6L", 1.0), ("18L", 4.5)]

    for i in range(qtd):
        marca = random.choice(MARCAS_TINTAS)
        cor = random.choice(CORES)
        tam_nome, tam_fator = random.choice(tamanhos)
        preco_base = random.uniform(45, 85)

        produtos.append({
            "nome": f"Tinta Acrilica {marca} {cor} {tam_nome}",
            "descricao": f"Tinta acrilica de alta qualidade para paredes internas e externas. Cor {cor}, acabamento fosco. Rendimento alto.",
            "categoria": "Tintas",
            "subcategoria": "Acrilica",
            "marca": marca,
            "preco": round(preco_base * tam_fator, 2),
            "estoque": random.randint(20, 150),
            "sku": f"ACR-{marca[:3].upper()}-{cor[:3].upper()}-{tam_nome.replace('.', '')}-{i}",
            "aplicacao": "Paredes Internas e Externas"
        })
    return produtos

def adicionar_tintas_latex(qtd=80):
    """Adiciona tintas latex economicas"""
    produtos = []
    tamanhos = [("900ml", 0.25), ("3.6L", 1.0), ("18L", 4.5)]
    cores_economicas = ["Branco", "Branco Gelo", "Marfim", "Bege", "Cinza Claro"]

    for i in range(qtd):
        marca = random.choice(MARCAS_TINTAS)
        cor = random.choice(cores_economicas)
        tam_nome, tam_fator = random.choice(tamanhos)
        preco_base = random.uniform(28, 45)

        produtos.append({
            "nome": f"Tinta Latex Economica {marca} {cor} {tam_nome}",
            "descricao": f"Tinta latex economica para ambientes internos. Secagem rapida. Cor {cor}.",
            "categoria": "Tintas",
            "subcategoria": "Latex",
            "marca": marca,
            "preco": round(preco_base * tam_fator, 2),
            "estoque": random.randint(30, 200),
            "sku": f"LAT-{marca[:3].upper()}-{cor[:3].upper()}-{tam_nome.replace('.', '')}-{i}",
            "aplicacao": "Paredes Internas"
        })
    return produtos

def adicionar_esmaltes_sinteticos(qtd=100):
    """Adiciona esmaltes sinteticos"""
    produtos = []
    cores = ["Branco", "Preto", "Cinza", "Azul", "Verde", "Vermelho", "Amarelo", "Marrom"]
    tamanhos = [("900ml", 1.0), ("3.6L", 3.5)]
    acabamentos = ["Brilhante", "Acetinado"]

    for i in range(qtd):
        marca = random.choice(MARCAS_TINTAS[:5])
        cor = random.choice(cores)
        tam_nome, tam_fator = random.choice(tamanhos)
        acabamento = random.choice(acabamentos)
        preco_base = random.uniform(55, 85)

        produtos.append({
            "nome": f"Esmalte Sintetico {marca} {cor} {acabamento} {tam_nome}",
            "descricao": f"Esmalte sintetico de alta durabilidade para madeiras e metais. Cor {cor}, acabamento {acabamento.lower()}.",
            "categoria": "Tintas",
            "subcategoria": "Esmalte Sintetico",
            "marca": marca,
            "preco": round(preco_base * tam_fator, 2),
            "estoque": random.randint(20, 100),
            "sku": f"ESM-{marca[:3].upper()}-{cor[:3].upper()}-{i}",
            "aplicacao": "Madeira e Metal"
        })
    return produtos

def adicionar_tintas_piso(qtd=50):
    """Adiciona tintas para piso"""
    produtos = []
    cores = ["Cinza", "Verde", "Vermelho", "Amarelo", "Azul", "Concreto"]
    tamanhos = [("3.6L", 1.0), ("18L", 4.5)]

    for i in range(qtd):
        marca = random.choice(MARCAS_TINTAS[:4])
        cor = random.choice(cores)
        tam_nome, tam_fator = random.choice(tamanhos)
        preco_base = random.uniform(65, 95)

        produtos.append({
            "nome": f"Tinta para Piso {marca} {cor} {tam_nome}",
            "descricao": f"Tinta especial para pisos de alta resistencia ao trafego. Cor {cor}. Para garagens e calcadas.",
            "categoria": "Tintas",
            "subcategoria": "Tinta para Piso",
            "marca": marca,
            "preco": round(preco_base * tam_fator, 2),
            "estoque": random.randint(15, 60),
            "sku": f"PISO-{marca[:3].upper()}-{cor[:3].upper()}-{i}",
            "aplicacao": "Pisos"
        })
    return produtos

def adicionar_tintas_spray(qtd=80):
    """Adiciona tintas spray"""
    produtos = []
    cores = ["Branco", "Preto", "Prata", "Dourado", "Vermelho", "Azul", "Verde", "Amarelo", "Laranja", "Rosa"]
    marcas = ["Colorgin", "Tekbond", "Chemicolor", "Lukscolor"]
    acabamentos = ["Brilhante", "Fosco", "Metalico"]

    for i in range(qtd):
        marca = random.choice(marcas)
        cor = random.choice(cores)
        acabamento = random.choice(acabamentos)
        preco = random.uniform(18, 35)

        produtos.append({
            "nome": f"Tinta Spray {marca} {cor} {acabamento} 400ml",
            "descricao": f"Tinta spray de secagem rapida. Cor {cor}, acabamento {acabamento.lower()}. Ideal para artesanato e retoques.",
            "categoria": "Tintas",
            "subcategoria": "Spray",
            "marca": marca,
            "preco": round(preco, 2),
            "estoque": random.randint(30, 150),
            "sku": f"SPR-{marca[:3].upper()}-{cor[:3].upper()}-{i}",
            "aplicacao": "Uso Geral"
        })
    return produtos

def adicionar_vernizes(qtd=80):
    """Adiciona vernizes"""
    produtos = []
    tipos = ["Maritimo", "Copal", "Poliuretano", "Acrilico"]
    cores = ["Natural", "Imbuia", "Mogno", "Cedro", "Ipe"]
    tamanhos = [("900ml", 1.0), ("3.6L", 3.5)]
    acabamentos = ["Brilhante", "Fosco"]

    for i in range(qtd):
        marca = random.choice(MARCAS_VERNIZES)
        tipo = random.choice(tipos)
        cor = random.choice(cores)
        tam_nome, tam_fator = random.choice(tamanhos)
        acabamento = random.choice(acabamentos)
        preco_base = random.uniform(45, 85)

        produtos.append({
            "nome": f"Verniz {tipo} {marca} {cor} {acabamento} {tam_nome}",
            "descricao": f"Verniz {tipo.lower()} para protecao de madeiras. Tonalidade {cor.lower()}, acabamento {acabamento.lower()}.",
            "categoria": "Vernizes",
            "subcategoria": tipo,
            "marca": marca,
            "preco": round(preco_base * tam_fator, 2),
            "estoque": random.randint(10, 50),
            "sku": f"VER-{marca[:3].upper()}-{tipo[:3].upper()}-{i}",
            "aplicacao": "Madeira"
        })
    return produtos

def adicionar_massas(qtd=60):
    """Adiciona massa corrida e massa acrilica"""
    produtos = []
    tipos = [("PVA", 12, 22), ("Acrilica", 18, 32)]
    tamanhos = [("1.5kg", 1.0), ("5.5kg", 3.0), ("25kg", 10.0)]

    for i in range(qtd):
        marca = random.choice(MARCAS_MASSA)
        tipo, preco_min, preco_max = random.choice(tipos)
        tam_nome, tam_fator = random.choice(tamanhos)
        preco_base = random.uniform(preco_min, preco_max)

        produtos.append({
            "nome": f"Massa Corrida {tipo} {marca} {tam_nome}",
            "descricao": f"Massa corrida {tipo} para nivelamento de paredes. Facil aplicacao e lixamento.",
            "categoria": "Massas",
            "subcategoria": f"Massa {tipo}",
            "marca": marca,
            "preco": round(preco_base * tam_fator, 2),
            "estoque": random.randint(25, 150),
            "sku": f"MAS-{tipo[:3].upper()}-{marca[:3].upper()}-{i}",
            "aplicacao": "Paredes" if tipo == "Acrilica" else "Paredes Internas"
        })
    return produtos

def adicionar_solventes(qtd=50):
    """Adiciona solventes e diluentes"""
    produtos = []
    tipos = [("Aguarras", 18), ("Thinner", 22), ("Solvente Esmalte", 20), ("Diluente Verniz", 25)]
    marcas = ["Itaqua", "Natrielli", "Anjo", "Eucatex"]
    tamanhos = [("500ml", 0.6), ("900ml", 1.0), ("5L", 4.5)]

    for i in range(qtd):
        marca = random.choice(marcas)
        tipo, preco_base = random.choice(tipos)
        tam_nome, tam_fator = random.choice(tamanhos)

        produtos.append({
            "nome": f"{tipo} {marca} {tam_nome}",
            "descricao": f"{tipo} de alta pureza para diluicao de tintas e limpeza de equipamentos.",
            "categoria": "Solventes",
            "subcategoria": tipo,
            "marca": marca,
            "preco": round(preco_base * tam_fator, 2),
            "estoque": random.randint(40, 200),
            "sku": f"SOL-{tipo[:3].upper()}-{marca[:3].upper()}-{i}",
            "aplicacao": "Diluicao e Limpeza"
        })
    return produtos

def adicionar_pinceis(qtd=60):
    """Adiciona pinceis"""
    produtos = []
    tamanhos = ["1\"", "1.5\"", "2\"", "2.5\"", "3\"", "4\""]
    tipos = ["Trincha", "Pincel Chato", "Pincel Redondo"]

    for i in range(qtd):
        marca = random.choice(MARCAS_ACESSORIOS)
        tipo = random.choice(tipos)
        tam = random.choice(tamanhos)
        preco = random.uniform(8, 35)

        produtos.append({
            "nome": f"{tipo} {marca} {tam}",
            "descricao": f"{tipo} profissional com cerdas de alta qualidade. Ideal para acabamentos perfeitos.",
            "categoria": "Pinceis",
            "subcategoria": tipo,
            "marca": marca,
            "preco": round(preco, 2),
            "estoque": random.randint(20, 100),
            "sku": f"PIN-{tipo[:3].upper()}-{marca[:3].upper()}-{tam.replace('\"', '')}-{i}",
            "aplicacao": "Pintura"
        })
    return produtos

def adicionar_rolos(qtd=60):
    """Adiciona rolos de pintura"""
    produtos = []
    tamanhos = ["9cm", "15cm", "23cm"]
    tipos = ["La de Carneiro", "Espuma", "Veludo", "Anti-Gota", "Textura"]

    for i in range(qtd):
        marca = random.choice(MARCAS_ACESSORIOS)
        tipo = random.choice(tipos)
        tam = random.choice(tamanhos)
        preco = random.uniform(12, 55)

        produtos.append({
            "nome": f"Rolo {tipo} {marca} {tam}",
            "descricao": f"Rolo de pintura {tipo.lower()} para acabamento profissional. Largura {tam}.",
            "categoria": "Rolos",
            "subcategoria": tipo,
            "marca": marca,
            "preco": round(preco, 2),
            "estoque": random.randint(25, 120),
            "sku": f"ROL-{tipo[:3].upper()}-{marca[:3].upper()}-{tam.replace('cm', '')}-{i}",
            "aplicacao": "Pintura"
        })
    return produtos

def adicionar_acessorios(qtd=70):
    """Adiciona acessorios diversos"""
    produtos = []

    # Bandejas
    for i in range(qtd // 4):
        marca = random.choice(MARCAS_ACESSORIOS)
        tam = random.choice(["Pequena", "Media", "Grande"])
        produtos.append({
            "nome": f"Bandeja para Pintura {marca} {tam}",
            "descricao": f"Bandeja plastica para pintura tamanho {tam.lower()}.",
            "categoria": "Acessorios",
            "subcategoria": "Bandejas",
            "marca": marca,
            "preco": round(random.uniform(8, 25), 2),
            "estoque": random.randint(30, 100),
            "sku": f"BAND-{marca[:3].upper()}-{tam[:3].upper()}-{i}",
            "aplicacao": "Pintura"
        })

    # Extensores
    for i in range(qtd // 4):
        marca = random.choice(MARCAS_ACESSORIOS)
        tam = random.choice(["1.2m", "2m", "3m"])
        produtos.append({
            "nome": f"Cabo Extensor {marca} {tam}",
            "descricao": f"Cabo extensor de aluminio {tam} para pintura em alturas.",
            "categoria": "Acessorios",
            "subcategoria": "Extensores",
            "marca": marca,
            "preco": round(random.uniform(25, 65), 2),
            "estoque": random.randint(15, 50),
            "sku": f"EXT-{marca[:3].upper()}-{tam.replace('.', '').replace('m', '')}-{i}",
            "aplicacao": "Pintura"
        })

    # Espatulas
    for i in range(qtd // 4):
        marca = random.choice(MARCAS_ACESSORIOS)
        tam = random.choice(["4cm", "6cm", "8cm", "10cm", "15cm"])
        produtos.append({
            "nome": f"Espatula de Aco {marca} {tam}",
            "descricao": f"Espatula de aco inox flexivel {tam}. Para aplicacao de massa.",
            "categoria": "Acessorios",
            "subcategoria": "Espatulas",
            "marca": marca,
            "preco": round(random.uniform(12, 35), 2),
            "estoque": random.randint(25, 80),
            "sku": f"ESP-{marca[:3].upper()}-{tam.replace('cm', '')}-{i}",
            "aplicacao": "Preparacao"
        })

    # Lixas e Fitas
    for i in range(qtd // 4):
        if i % 2 == 0:
            grana = random.choice(["80", "100", "120", "150", "180", "220"])
            produtos.append({
                "nome": f"Lixa para Parede Grana {grana} (Pacote 10un)",
                "descricao": f"Lixa d'agua grana {grana} para lixamento de paredes.",
                "categoria": "Acessorios",
                "subcategoria": "Lixas",
                "marca": "Norton",
                "preco": round(random.uniform(12, 25), 2),
                "estoque": random.randint(50, 200),
                "sku": f"LIXA-PAC-{grana}-{i}",
                "aplicacao": "Preparacao"
            })
        else:
            marca = random.choice(["3M", "Adere", "Tectape"])
            tam = random.choice(["18mm", "24mm", "48mm"])
            produtos.append({
                "nome": f"Fita Crepe {marca} {tam} x 50m",
                "descricao": f"Fita crepe para demarcacao. Largura {tam}.",
                "categoria": "Acessorios",
                "subcategoria": "Fitas",
                "marca": marca,
                "preco": round(random.uniform(8, 25), 2),
                "estoque": random.randint(50, 200),
                "sku": f"FCREPE-{marca[:3].upper()}-{tam.replace('mm', '')}-{i}",
                "aplicacao": "Protecao"
            })

    return produtos

def adicionar_seladores_primers(qtd=60):
    """Adiciona seladores e primers"""
    produtos = []
    tamanhos = [("3.6L", 1.0), ("18L", 4.5)]

    for i in range(qtd // 2):
        marca = random.choice(MARCAS_TINTAS[:5])
        tam_nome, tam_fator = random.choice(tamanhos)
        preco_base = random.uniform(35, 55)

        produtos.append({
            "nome": f"Selador Acrilico {marca} {tam_nome}",
            "descricao": f"Selador acrilico para paredes novas e repinturas. Uniformiza absorcao.",
            "categoria": "Seladores",
            "subcategoria": "Selador Acrilico",
            "marca": marca,
            "preco": round(preco_base * tam_fator, 2),
            "estoque": random.randint(20, 80),
            "sku": f"SELAC-{marca[:3].upper()}-{tam_nome.replace('.', '')}-{i}",
            "aplicacao": "Paredes"
        })

    cores_primer = ["Cinza", "Branco", "Vermelho Oxido"]
    for i in range(qtd // 2):
        marca = random.choice(MARCAS_TINTAS[:4])
        cor = random.choice(cores_primer)
        tam_nome, tam_fator = random.choice([("900ml", 1.0), ("3.6L", 3.5)])
        preco_base = random.uniform(38, 58)

        produtos.append({
            "nome": f"Primer Anticorrosivo {marca} {cor} {tam_nome}",
            "descricao": f"Primer anticorrosivo para metais. Cor {cor.lower()}. Protege contra ferrugem.",
            "categoria": "Primers",
            "subcategoria": "Primer Anticorrosivo",
            "marca": marca,
            "preco": round(preco_base * tam_fator, 2),
            "estoque": random.randint(15, 50),
            "sku": f"PRANT-{marca[:3].upper()}-{cor[:3].upper()}-{i}",
            "aplicacao": "Metal"
        })

    return produtos

def adicionar_impermeabilizantes(qtd=40):
    """Adiciona impermeabilizantes"""
    produtos = []
    tipos = [("Manta Liquida", 85), ("Impermeabilizante Acrilico", 65), ("Veda Trinca", 45)]
    tamanhos = [("3.6L", 1.0), ("18L", 4.5)]

    for i in range(qtd):
        marca = random.choice(MARCAS_TINTAS[:4])
        tipo, preco_base = random.choice(tipos)
        tam_nome, tam_fator = random.choice(tamanhos)

        produtos.append({
            "nome": f"{tipo} {marca} {tam_nome}",
            "descricao": f"{tipo} para protecao de lajes, muros e areas umidas.",
            "categoria": "Impermeabilizantes",
            "subcategoria": tipo,
            "marca": marca,
            "preco": round(preco_base * tam_fator, 2),
            "estoque": random.randint(10, 40),
            "sku": f"IMP-{tipo[:4].upper()}-{marca[:3].upper()}-{i}",
            "aplicacao": "Lajes e Muros"
        })

    return produtos

def adicionar_texturas(qtd=40):
    """Adiciona texturas e grafiatos"""
    produtos = []
    tipos = ["Textura Lisa", "Textura Rustica", "Grafiato"]
    cores = ["Branco", "Bege", "Areia", "Palha", "Cinza"]

    for i in range(qtd):
        marca = random.choice(MARCAS_TINTAS[:4])
        tipo = random.choice(tipos)
        cor = random.choice(cores)
        preco = random.uniform(85, 140)

        produtos.append({
            "nome": f"{tipo} {marca} {cor} 25kg",
            "descricao": f"{tipo} acrilica para fachadas e paredes. Cor {cor.lower()}.",
            "categoria": "Texturas",
            "subcategoria": tipo,
            "marca": marca,
            "preco": round(preco, 2),
            "estoque": random.randint(10, 40),
            "sku": f"TEX-{tipo[:3].upper()}-{marca[:3].upper()}-{cor[:3].upper()}-{i}",
            "aplicacao": "Paredes e Fachadas"
        })

    return produtos

# ============================================================================
# FUNCAO PRINCIPAL
# ============================================================================

def gerar_todos_produtos():
    """Gera 1000 produtos com distribuicao balanceada"""
    todos = []

    print("Gerando Tintas Acrilicas (200)...")
    todos.extend(adicionar_tintas_acrilicas(200))

    print("Gerando Tintas Latex (80)...")
    todos.extend(adicionar_tintas_latex(80))

    print("Gerando Esmaltes Sinteticos (100)...")
    todos.extend(adicionar_esmaltes_sinteticos(100))

    print("Gerando Tintas para Piso (50)...")
    todos.extend(adicionar_tintas_piso(50))

    print("Gerando Tintas Spray (80)...")
    todos.extend(adicionar_tintas_spray(80))

    print("Gerando Vernizes (80)...")
    todos.extend(adicionar_vernizes(80))

    print("Gerando Massas (60)...")
    todos.extend(adicionar_massas(60))

    print("Gerando Solventes (50)...")
    todos.extend(adicionar_solventes(50))

    print("Gerando Pinceis (60)...")
    todos.extend(adicionar_pinceis(60))

    print("Gerando Rolos (60)...")
    todos.extend(adicionar_rolos(60))

    print("Gerando Acessorios (70)...")
    todos.extend(adicionar_acessorios(70))

    print("Gerando Seladores e Primers (60)...")
    todos.extend(adicionar_seladores_primers(60))

    print("Gerando Impermeabilizantes (40)...")
    todos.extend(adicionar_impermeabilizantes(40))

    print("Gerando Texturas (40)...")
    todos.extend(adicionar_texturas(40))

    # Total: 1030, vamos pegar os primeiros 1000
    return todos[:1000]

def importar_para_sqlite(produtos):
    """Importa produtos para SQLite"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Limpar produtos antigos
    cursor.execute("DELETE FROM produtos WHERE empresa_id = ?", (EMPRESA_ID,))
    conn.commit()
    print(f"[OK] Produtos antigos da empresa {EMPRESA_ID} removidos")

    # Importar novos
    count = 0
    for p in produtos:
        palavras_chave = f"{p['nome']} {p['marca']} {p['categoria']} {p.get('subcategoria', '')} {p.get('aplicacao', '')}"

        cursor.execute("""
            INSERT INTO produtos (
                empresa_id, nome, descricao, categoria, subcategoria,
                marca, preco, estoque, sku, aplicacao, disponivel, palavras_chave, ativo
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 1)
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
            palavras_chave
        ))
        count += 1

        if count % 100 == 0:
            print(f"  [+] {count} produtos importados...")

    conn.commit()
    conn.close()
    return count

def salvar_csv(produtos, arquivo):
    """Salva produtos em CSV"""
    campos = ['nome', 'descricao', 'categoria', 'subcategoria', 'marca', 'preco', 'estoque', 'sku', 'aplicacao']

    with open(arquivo, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=campos)
        writer.writeheader()
        for p in produtos:
            writer.writerow({k: p.get(k, '') for k in campos})

    print(f"[OK] CSV salvo: {arquivo}")

def mostrar_resumo(produtos):
    """Mostra resumo"""
    categorias = {}
    for p in produtos:
        cat = p['categoria']
        categorias[cat] = categorias.get(cat, 0) + 1

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
    print("#  IMPORTADOR 1000 PRODUTOS - LOJA DE TINTAS")
    print("#  Empresa ID: " + str(EMPRESA_ID))
    print("#"*70 + "\n")

    # Gerar produtos
    produtos = gerar_todos_produtos()

    # Mostrar resumo
    mostrar_resumo(produtos)

    # Salvar CSV
    csv_path = 'D:/Helix/HelixAI/backend/produtos_tintas_1000.csv'
    salvar_csv(produtos, csv_path)

    # Importar para SQLite
    print("\nImportando para banco de dados...")
    total = importar_para_sqlite(produtos)

    print("\n" + "#"*70)
    print("#  IMPORTACAO CONCLUIDA!")
    print(f"#  {total} produtos importados")
    print("#"*70 + "\n")
