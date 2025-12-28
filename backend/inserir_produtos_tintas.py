# -*- coding: utf-8 -*-
import sqlite3
from datetime import datetime

conn = sqlite3.connect('vendeai.db')
cursor = conn.cursor()

EMPRESA_ID = 27

# Cores disponiveis
CORES = [
    'Branco Neve', 'Branco Gelo', 'Branco Fosco', 'Areia', 'Perola', 'Marfim',
    'Bege', 'Palha', 'Camurca', 'Cappuccino', 'Caramelo', 'Terracota',
    'Vermelho', 'Vermelho Escuro', 'Bordo', 'Vinho', 'Rosa', 'Rosa Claro',
    'Laranja', 'Amarelo', 'Amarelo Ouro', 'Verde Claro', 'Verde Folha',
    'Verde Escuro', 'Azul Celeste', 'Azul Royal', 'Azul Marinho',
    'Lilas', 'Roxo', 'Cinza Claro', 'Cinza Medio', 'Cinza Escuro',
    'Grafite', 'Preto Fosco', 'Preto Brilhante', 'Marrom', 'Chocolate'
]

# Tamanhos
TAMANHOS = [
    ('900ml', 900, 25.90),
    ('3.6L', 3600, 89.90),
    ('18L', 18000, 289.90),
    ('20L', 20000, 319.90)
]

# Marcas
MARCAS = ['Suvinil', 'Coral', 'Sherwin-Williams', 'Lukscolor', 'Eucatex']

# Tipos de tinta
TIPOS_TINTA = [
    ('Tinta Latex PVA', 'Tinta economica para ambientes internos', 'Tintas', 'Latex'),
    ('Tinta Acrilica Fosca', 'Tinta premium para paredes internas e externas', 'Tintas', 'Acrilica'),
    ('Tinta Acrilica Acetinada', 'Tinta com leve brilho acetinado, lavavel', 'Tintas', 'Acrilica'),
    ('Tinta Acrilica Semi-Brilho', 'Tinta com brilho moderado, alta lavabilidade', 'Tintas', 'Acrilica'),
    ('Tinta Esmalte Sintetico', 'Tinta para madeira e metal', 'Tintas', 'Esmalte'),
    ('Tinta Esmalte Base Agua', 'Esmalte sem cheiro para madeira e metal', 'Tintas', 'Esmalte'),
]

produtos = []
sku_counter = 1000

# Gerar tintas com variacoes
for tipo_nome, tipo_desc, categoria, subcategoria in TIPOS_TINTA:
    for marca in MARCAS:
        for cor in CORES[:15]:  # 15 cores principais por marca
            for tam_nome, tam_ml, preco_base in TAMANHOS:
                # Ajustar preco por marca
                fator_marca = {'Suvinil': 1.0, 'Coral': 0.95, 'Sherwin-Williams': 1.15, 'Lukscolor': 0.85, 'Eucatex': 0.80}
                preco = round(preco_base * fator_marca.get(marca, 1.0), 2)

                nome = f'{tipo_nome} {cor} {tam_nome} - {marca}'
                sku = f'TINTA-{sku_counter:05d}'
                sku_counter += 1

                produtos.append((
                    EMPRESA_ID, nome, tipo_desc, categoria, subcategoria,
                    preco, None, 'BRL', 50, True, sku, None, marca,
                    tam_ml/1000, f'{tam_nome}', f'{cor.lower()}, tinta, {subcategoria.lower()}, {marca.lower()}',
                    'tinta,parede,pintura', None, None, None, True, datetime.now(), datetime.now(), False, 'Paredes e Superficies'
                ))

# Produtos complementares
COMPLEMENTARES = [
    # Massas
    ('Massa Corrida PVA 25kg', 'Massa para correcao de imperfeicoes em paredes internas', 'Preparacao', 'Massa', 89.90, 'Coral'),
    ('Massa Corrida PVA 18L', 'Massa para correcao de imperfeicoes em paredes internas', 'Preparacao', 'Massa', 69.90, 'Suvinil'),
    ('Massa Acrilica 25kg', 'Massa para paredes internas e externas', 'Preparacao', 'Massa', 119.90, 'Coral'),
    ('Massa Acrilica 18L', 'Massa para paredes internas e externas', 'Preparacao', 'Massa', 99.90, 'Suvinil'),
    ('Gesso em Po 1kg', 'Gesso para pequenos reparos', 'Preparacao', 'Gesso', 8.90, 'Quartzolit'),
    ('Gesso em Po 5kg', 'Gesso para reparos em paredes', 'Preparacao', 'Gesso', 29.90, 'Quartzolit'),

    # Seladores e Primers
    ('Selador Acrilico 18L', 'Selador para paredes novas ou repinturas', 'Preparacao', 'Selador', 189.90, 'Suvinil'),
    ('Selador Acrilico 3.6L', 'Selador para paredes novas ou repinturas', 'Preparacao', 'Selador', 49.90, 'Coral'),
    ('Fundo Preparador 18L', 'Preparador para superficies caiadas ou com po', 'Preparacao', 'Fundo', 159.90, 'Suvinil'),
    ('Fundo Preparador 3.6L', 'Preparador para superficies caiadas ou com po', 'Preparacao', 'Fundo', 45.90, 'Coral'),

    # Vernizes
    ('Verniz Maritimo Brilhante 900ml', 'Verniz para madeira com alta resistencia', 'Vernizes', 'Verniz', 59.90, 'Sparlack'),
    ('Verniz Maritimo Brilhante 3.6L', 'Verniz para madeira com alta resistencia', 'Vernizes', 'Verniz', 189.90, 'Sparlack'),
    ('Verniz Copal 900ml', 'Verniz economico para madeira interna', 'Vernizes', 'Verniz', 39.90, 'Suvinil'),
    ('Verniz Copal 3.6L', 'Verniz economico para madeira interna', 'Vernizes', 'Verniz', 129.90, 'Suvinil'),
    ('Stain Impregnante 900ml', 'Stain para madeira com protecao UV', 'Vernizes', 'Stain', 69.90, 'Sparlack'),
    ('Stain Impregnante 3.6L', 'Stain para madeira com protecao UV', 'Vernizes', 'Stain', 219.90, 'Sparlack'),

    # Solventes
    ('Aguarras 900ml', 'Solvente para diluicao de esmaltes e vernizes', 'Solventes', 'Aguarras', 19.90, 'Itaqua'),
    ('Aguarras 5L', 'Solvente para diluicao de esmaltes e vernizes', 'Solventes', 'Aguarras', 69.90, 'Itaqua'),
    ('Thinner 900ml', 'Solvente para limpeza e diluicao', 'Solventes', 'Thinner', 24.90, 'Itaqua'),
    ('Thinner 5L', 'Solvente para limpeza e diluicao', 'Solventes', 'Thinner', 89.90, 'Itaqua'),

    # Ferramentas
    ('Rolo de La 23cm', 'Rolo para pintura de paredes', 'Ferramentas', 'Rolos', 29.90, 'Atlas'),
    ('Rolo de La 15cm', 'Rolo para pintura de areas menores', 'Ferramentas', 'Rolos', 19.90, 'Atlas'),
    ('Rolo de Espuma 9cm', 'Rolo para pintura de esmalte', 'Ferramentas', 'Rolos', 12.90, 'Atlas'),
    ('Rolo Textura 23cm', 'Rolo para aplicacao de texturas', 'Ferramentas', 'Rolos', 34.90, 'Atlas'),
    ('Suporte para Rolo 23cm', 'Suporte/Garfo para rolo de pintura', 'Ferramentas', 'Suportes', 18.90, 'Atlas'),
    ('Suporte para Rolo 15cm', 'Suporte/Garfo para rolo de pintura', 'Ferramentas', 'Suportes', 14.90, 'Atlas'),
    ('Bandeja para Pintura', 'Bandeja plastica para pintura', 'Ferramentas', 'Acessorios', 15.90, 'Tigre'),
    ('Pincel 1 polegada', 'Pincel para acabamento e retoques', 'Ferramentas', 'Pinceis', 8.90, 'Tigre'),
    ('Pincel 2 polegadas', 'Pincel para acabamento e retoques', 'Ferramentas', 'Pinceis', 12.90, 'Tigre'),
    ('Pincel 3 polegadas', 'Pincel para pintura de areas maiores', 'Ferramentas', 'Pinceis', 18.90, 'Tigre'),
    ('Trincha 2 polegadas', 'Trincha para pintura de esmaltes', 'Ferramentas', 'Pinceis', 15.90, 'Atlas'),
    ('Trincha 3 polegadas', 'Trincha para pintura de esmaltes', 'Ferramentas', 'Pinceis', 22.90, 'Atlas'),
    ('Escada 5 Degraus', 'Escada de aluminio para pintura', 'Ferramentas', 'Escadas', 189.90, 'Mor'),
    ('Escada 7 Degraus', 'Escada de aluminio para pintura', 'Ferramentas', 'Escadas', 289.90, 'Mor'),
    ('Fita Crepe 18mm x 50m', 'Fita para protecao em pintura', 'Ferramentas', 'Fitas', 9.90, '3M'),
    ('Fita Crepe 24mm x 50m', 'Fita para protecao em pintura', 'Ferramentas', 'Fitas', 12.90, '3M'),
    ('Fita Crepe 48mm x 50m', 'Fita para protecao em pintura', 'Ferramentas', 'Fitas', 19.90, '3M'),
    ('Lixa para Parede 120', 'Lixa para lixamento de massa', 'Ferramentas', 'Lixas', 2.90, 'Norton'),
    ('Lixa para Parede 150', 'Lixa para lixamento fino de massa', 'Ferramentas', 'Lixas', 2.90, 'Norton'),
    ('Lixa para Madeira 80', 'Lixa grossa para madeira', 'Ferramentas', 'Lixas', 3.90, 'Norton'),
    ('Lixa para Madeira 120', 'Lixa media para madeira', 'Ferramentas', 'Lixas', 3.90, 'Norton'),
    ('Lixa para Madeira 220', 'Lixa fina para acabamento', 'Ferramentas', 'Lixas', 4.90, 'Norton'),
    ('Lona Plastica 4x5m', 'Lona para protecao de pisos', 'Ferramentas', 'Protecao', 24.90, 'Plastnova'),
    ('Lona Plastica 4x10m', 'Lona para protecao de pisos e moveis', 'Ferramentas', 'Protecao', 39.90, 'Plastnova'),
    ('Espatula 8cm', 'Espatula para aplicacao de massa', 'Ferramentas', 'Espatulas', 12.90, 'Tramontina'),
    ('Espatula 12cm', 'Espatula para aplicacao de massa', 'Ferramentas', 'Espatulas', 16.90, 'Tramontina'),
    ('Espatula 20cm', 'Espatula para aplicacao de massa', 'Ferramentas', 'Espatulas', 24.90, 'Tramontina'),
    ('Desempenadeira Aco 25cm', 'Desempenadeira para massa', 'Ferramentas', 'Desempenadeiras', 39.90, 'Tramontina'),

    # Texturas
    ('Textura Acrilica Branca 25kg', 'Textura para paredes externas', 'Texturas', 'Textura', 159.90, 'Suvinil'),
    ('Textura Acrilica Branca 18L', 'Textura para paredes externas', 'Texturas', 'Textura', 139.90, 'Coral'),
    ('Grafiato 25kg', 'Textura grafiato para fachadas', 'Texturas', 'Grafiato', 179.90, 'Suvinil'),
    ('Grafiato 18L', 'Textura grafiato para fachadas', 'Texturas', 'Grafiato', 159.90, 'Coral'),

    # Impermeabilizantes
    ('Impermeabilizante 18L', 'Impermeabilizante para lajes e paredes', 'Impermeabilizantes', 'Impermeabilizante', 289.90, 'Vedacit'),
    ('Impermeabilizante 3.6L', 'Impermeabilizante para lajes e paredes', 'Impermeabilizantes', 'Impermeabilizante', 79.90, 'Vedacit'),
    ('Manta Liquida 18L', 'Manta liquida para impermeabilizacao', 'Impermeabilizantes', 'Manta', 349.90, 'Vedacit'),
    ('Manta Liquida 3.6L', 'Manta liquida para impermeabilizacao', 'Impermeabilizantes', 'Manta', 99.90, 'Vedacit'),
]

for comp in COMPLEMENTARES:
    nome, desc, cat, subcat, preco, marca = comp
    sku = f'COMP-{sku_counter:05d}'
    sku_counter += 1

    produtos.append((
        EMPRESA_ID, nome, desc, cat, subcat,
        preco, None, 'BRL', 30, True, sku, None, marca,
        None, None, f'{nome.lower()}, {cat.lower()}, {subcat.lower()}, {marca.lower()}',
        f'{cat.lower()},{subcat.lower()}', None, None, None, True, datetime.now(), datetime.now(), False, None
    ))

# Inserir produtos
cursor.executemany('''
    INSERT INTO produtos (
        empresa_id, nome, descricao, categoria, subcategoria,
        preco, preco_promocional, moeda, estoque, disponivel, sku, codigo_barras, marca,
        peso, dimensoes, palavras_chave, tags, link, imagem_url, dados_extras,
        ativo, criado_em, atualizado_em, importado_csv, aplicacao
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
''', produtos)

conn.commit()
print(f'Inseridos {len(produtos)} produtos para empresa {EMPRESA_ID}')

# Verificar
cursor.execute('SELECT COUNT(*) FROM produtos WHERE empresa_id = ?', (EMPRESA_ID,))
print(f'Total de produtos da empresa {EMPRESA_ID}: {cursor.fetchone()[0]}')

# Categorias criadas
cursor.execute('SELECT DISTINCT categoria FROM produtos WHERE empresa_id = ?', (EMPRESA_ID,))
cats = cursor.fetchall()
print(f'Categorias: {[c[0] for c in cats]}')

# Subcategorias
cursor.execute('SELECT DISTINCT subcategoria FROM produtos WHERE empresa_id = ?', (EMPRESA_ID,))
subcats = cursor.fetchall()
print(f'Subcategorias: {[s[0] for s in subcats]}')

# Marcas
cursor.execute('SELECT DISTINCT marca FROM produtos WHERE empresa_id = ?', (EMPRESA_ID,))
marcas = cursor.fetchall()
print(f'Marcas: {[m[0] for m in marcas]}')

conn.close()
