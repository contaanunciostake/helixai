"""
API REST para Loja de Tintas
Endpoints especificos para gestao de produtos de tintas
"""

from flask import Blueprint, request, jsonify
from sqlalchemy import text
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent.parent))

from backend import db_manager

tintas_api_bp = Blueprint('tintas_api', __name__, url_prefix='/api/tintas')

print("\n" + "="*60)
print("         TINTAS API ROUTES - MODULO CARREGADO")
print("="*60)
print("[TINTAS API] Rotas disponiveis:")
print("[TINTAS API]   GET  /api/tintas/produtos?empresa_id=X")
print("[TINTAS API]   GET  /api/tintas/produtos/:id")
print("[TINTAS API]   POST /api/tintas/produtos")
print("[TINTAS API]   PUT  /api/tintas/produtos/:id")
print("[TINTAS API]   DELETE /api/tintas/produtos/:id")
print("[TINTAS API]   GET  /api/tintas/cores")
print("[TINTAS API]   GET  /api/tintas/orcamentos")
print("[TINTAS API]   POST /api/tintas/orcamentos")
print("[TINTAS API]   GET  /api/tintas/historico-cores/:cliente_id")
print("="*60 + "\n")


# ══════════════════════════════════════════════════════════════
# CRUD DE PRODUTOS (TINTAS)
# ══════════════════════════════════════════════════════════════

@tintas_api_bp.route('/produtos', methods=['GET'])
def listar_produtos():
    """Lista todos os produtos de tintas de uma empresa"""
    try:
        empresa_id = request.args.get('empresa_id', type=int)
        if not empresa_id:
            empresa_id = request.headers.get('X-Empresa-ID', type=int)

        session = db_manager.get_session()

        # Buscar produtos da tabela produtos_tintas ou produtos com tipo tinta
        query = text("""
            SELECT * FROM produtos
            WHERE empresa_id = :empresa_id
            ORDER BY nome ASC
        """)

        result = session.execute(query, {'empresa_id': empresa_id})
        produtos = []

        for row in result:
            produto = dict(row._mapping)
            produtos.append(produto)

        session.close()

        return jsonify({
            'success': True,
            'produtos': produtos,
            'total': len(produtos)
        })

    except Exception as e:
        print(f"[TINTAS API] Erro ao listar produtos: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@tintas_api_bp.route('/produtos/<int:produto_id>', methods=['GET'])
def obter_produto(produto_id):
    """Obtem um produto especifico"""
    try:
        session = db_manager.get_session()

        query = text("SELECT * FROM produtos WHERE id = :id")
        result = session.execute(query, {'id': produto_id}).fetchone()

        session.close()

        if not result:
            return jsonify({'success': False, 'error': 'Produto nao encontrado'}), 404

        return jsonify({
            'success': True,
            'produto': dict(result._mapping)
        })

    except Exception as e:
        print(f"[TINTAS API] Erro ao obter produto: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@tintas_api_bp.route('/produtos', methods=['POST'])
def criar_produto():
    """Cria um novo produto de tinta"""
    try:
        data = request.get_json()
        empresa_id = data.get('empresa_id') or request.headers.get('X-Empresa-ID')

        if not empresa_id:
            return jsonify({'success': False, 'error': 'empresa_id obrigatorio'}), 400

        session = db_manager.get_session()

        # Preparar dados do produto
        campos = {
            'empresa_id': empresa_id,
            'nome': data.get('nome', ''),
            'descricao': data.get('descricao', ''),
            'sku': data.get('sku', ''),
            'categoria': data.get('tipo', 'acrilica'),  # tipo da tinta como categoria
            'subcategoria': data.get('acabamento', 'fosco'),
            'marca': data.get('marca', ''),
            'preco': float(data.get('preco', 0)),
            'preco_promocional': float(data.get('preco_promocional', 0)) if data.get('preco_promocional') else None,
            'estoque': int(data.get('estoque', 0)),
            'estoque_minimo': int(data.get('estoque_minimo', 10)),
            'disponivel': data.get('disponivel', True),
            'palavras_chave': data.get('palavras_chave', ''),
            # Campos especificos de tintas (armazenados em JSON ou campos extras)
            'aplicacao': data.get('ambiente', 'interno_externo'),
        }

        # Montar query dinamica
        colunas = ', '.join(campos.keys())
        placeholders = ', '.join([f':{k}' for k in campos.keys()])

        query = text(f"INSERT INTO produtos ({colunas}) VALUES ({placeholders})")
        session.execute(query, campos)
        session.commit()

        # Obter ID do produto inserido
        result = session.execute(text("SELECT last_insert_rowid()")).fetchone()
        produto_id = result[0] if result else None

        session.close()

        return jsonify({
            'success': True,
            'message': 'Produto criado com sucesso',
            'produto_id': produto_id
        })

    except Exception as e:
        print(f"[TINTAS API] Erro ao criar produto: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500


@tintas_api_bp.route('/produtos/<int:produto_id>', methods=['PUT'])
def atualizar_produto(produto_id):
    """Atualiza um produto existente"""
    try:
        data = request.get_json()
        session = db_manager.get_session()

        # Campos para atualizar
        updates = []
        params = {'id': produto_id}

        campos_permitidos = [
            'nome', 'descricao', 'sku', 'categoria', 'subcategoria',
            'marca', 'preco', 'preco_promocional', 'estoque', 'estoque_minimo',
            'disponivel', 'palavras_chave', 'aplicacao'
        ]

        for campo in campos_permitidos:
            if campo in data:
                updates.append(f"{campo} = :{campo}")
                params[campo] = data[campo]

        if not updates:
            return jsonify({'success': False, 'error': 'Nenhum campo para atualizar'}), 400

        query = text(f"UPDATE produtos SET {', '.join(updates)} WHERE id = :id")
        session.execute(query, params)
        session.commit()
        session.close()

        return jsonify({
            'success': True,
            'message': 'Produto atualizado com sucesso'
        })

    except Exception as e:
        print(f"[TINTAS API] Erro ao atualizar produto: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@tintas_api_bp.route('/produtos/<int:produto_id>', methods=['DELETE'])
def excluir_produto(produto_id):
    """Exclui um produto"""
    try:
        session = db_manager.get_session()

        query = text("DELETE FROM produtos WHERE id = :id")
        session.execute(query, {'id': produto_id})
        session.commit()
        session.close()

        return jsonify({
            'success': True,
            'message': 'Produto excluido com sucesso'
        })

    except Exception as e:
        print(f"[TINTAS API] Erro ao excluir produto: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


# ══════════════════════════════════════════════════════════════
# CORES
# ══════════════════════════════════════════════════════════════

@tintas_api_bp.route('/cores', methods=['GET'])
def listar_cores():
    """Lista todas as cores disponiveis"""
    # Cores padrao - em producao, viria do banco
    cores = [
        {'nome': 'Branco Neve', 'hex': '#FFFFFF', 'codigo': 'W001'},
        {'nome': 'Branco Gelo', 'hex': '#F5F5F5', 'codigo': 'W002'},
        {'nome': 'Perola', 'hex': '#FAF0E6', 'codigo': 'W003'},
        {'nome': 'Palha', 'hex': '#F5DEB3', 'codigo': 'Y001'},
        {'nome': 'Camurca', 'hex': '#D2B48C', 'codigo': 'Y002'},
        {'nome': 'Areia', 'hex': '#C2B280', 'codigo': 'Y003'},
        {'nome': 'Pessego', 'hex': '#FFDAB9', 'codigo': 'O001'},
        {'nome': 'Salmao', 'hex': '#FA8072', 'codigo': 'O002'},
        {'nome': 'Terracota', 'hex': '#E2725B', 'codigo': 'O003'},
        {'nome': 'Cinza Claro', 'hex': '#D3D3D3', 'codigo': 'G001'},
        {'nome': 'Cinza Medio', 'hex': '#A9A9A9', 'codigo': 'G002'},
        {'nome': 'Cinza Escuro', 'hex': '#696969', 'codigo': 'G003'},
        {'nome': 'Azul Celeste', 'hex': '#87CEEB', 'codigo': 'B001'},
        {'nome': 'Azul Bebe', 'hex': '#89CFF0', 'codigo': 'B002'},
        {'nome': 'Azul Marinho', 'hex': '#000080', 'codigo': 'B003'},
        {'nome': 'Verde Menta', 'hex': '#98FF98', 'codigo': 'V001'},
        {'nome': 'Verde Agua', 'hex': '#00FFFF', 'codigo': 'V002'},
        {'nome': 'Verde Floresta', 'hex': '#228B22', 'codigo': 'V003'},
        {'nome': 'Rosa Claro', 'hex': '#FFB6C1', 'codigo': 'P001'},
        {'nome': 'Rosa Antigo', 'hex': '#D8A9A9', 'codigo': 'P002'},
        {'nome': 'Lilas', 'hex': '#C8A2C8', 'codigo': 'P003'},
        {'nome': 'Amarelo Sol', 'hex': '#FFD700', 'codigo': 'A001'},
        {'nome': 'Amarelo Canario', 'hex': '#FFEF00', 'codigo': 'A002'},
        {'nome': 'Laranja', 'hex': '#FFA500', 'codigo': 'L001'},
        {'nome': 'Vermelho', 'hex': '#FF0000', 'codigo': 'R001'},
        {'nome': 'Vermelho Oxido', 'hex': '#B22222', 'codigo': 'R002'},
        {'nome': 'Marrom Cafe', 'hex': '#6F4E37', 'codigo': 'M001'},
        {'nome': 'Marrom Chocolate', 'hex': '#7B3F00', 'codigo': 'M002'},
        {'nome': 'Preto', 'hex': '#000000', 'codigo': 'K001'}
    ]

    return jsonify({
        'success': True,
        'cores': cores,
        'total': len(cores)
    })


# ══════════════════════════════════════════════════════════════
# ORCAMENTOS
# ══════════════════════════════════════════════════════════════

@tintas_api_bp.route('/orcamentos', methods=['GET'])
def listar_orcamentos():
    """Lista todos os orcamentos de uma empresa"""
    try:
        empresa_id = request.args.get('empresa_id', type=int)
        if not empresa_id:
            empresa_id = request.headers.get('X-Empresa-ID', type=int)

        session = db_manager.get_session()

        # Verificar se tabela existe
        try:
            query = text("""
                SELECT * FROM orcamentos_tintas
                WHERE empresa_id = :empresa_id
                ORDER BY criado_em DESC
            """)
            result = session.execute(query, {'empresa_id': empresa_id})
            orcamentos = [dict(row._mapping) for row in result]
        except:
            # Se tabela nao existir, retornar vazio
            orcamentos = []

        session.close()

        return jsonify({
            'success': True,
            'orcamentos': orcamentos,
            'total': len(orcamentos)
        })

    except Exception as e:
        print(f"[TINTAS API] Erro ao listar orcamentos: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@tintas_api_bp.route('/orcamentos', methods=['POST'])
def criar_orcamento():
    """Cria um novo orcamento"""
    try:
        data = request.get_json()
        empresa_id = data.get('empresa_id') or request.headers.get('X-Empresa-ID')

        if not empresa_id:
            return jsonify({'success': False, 'error': 'empresa_id obrigatorio'}), 400

        session = db_manager.get_session()

        # Criar tabela se nao existir
        session.execute(text("""
            CREATE TABLE IF NOT EXISTS orcamentos_tintas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                empresa_id INTEGER NOT NULL,
                cliente_nome VARCHAR(200),
                cliente_telefone VARCHAR(20),
                cliente_email VARCHAR(200),
                obra VARCHAR(500),
                itens TEXT,
                valor_total DECIMAL(10,2),
                status VARCHAR(20) DEFAULT 'pendente',
                validade_dias INTEGER DEFAULT 7,
                observacoes TEXT,
                criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """))

        import json
        itens_json = json.dumps(data.get('itens', []))

        query = text("""
            INSERT INTO orcamentos_tintas
            (empresa_id, cliente_nome, cliente_telefone, cliente_email, obra, itens, valor_total, observacoes, validade_dias)
            VALUES (:empresa_id, :cliente_nome, :cliente_telefone, :cliente_email, :obra, :itens, :valor_total, :observacoes, :validade_dias)
        """)

        session.execute(query, {
            'empresa_id': empresa_id,
            'cliente_nome': data.get('cliente_nome', ''),
            'cliente_telefone': data.get('cliente_telefone', ''),
            'cliente_email': data.get('cliente_email', ''),
            'obra': data.get('obra', ''),
            'itens': itens_json,
            'valor_total': float(data.get('valor_total', 0)),
            'observacoes': data.get('observacoes', ''),
            'validade_dias': int(data.get('validade_dias', 7))
        })

        session.commit()

        result = session.execute(text("SELECT last_insert_rowid()")).fetchone()
        orcamento_id = result[0] if result else None

        session.close()

        return jsonify({
            'success': True,
            'message': 'Orcamento criado com sucesso',
            'orcamento_id': orcamento_id
        })

    except Exception as e:
        print(f"[TINTAS API] Erro ao criar orcamento: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500


# ══════════════════════════════════════════════════════════════
# HISTORICO DE CORES POR CLIENTE
# ══════════════════════════════════════════════════════════════

@tintas_api_bp.route('/historico-cores/<int:cliente_id>', methods=['GET'])
def historico_cores_cliente(cliente_id):
    """Retorna historico de cores compradas por um cliente"""
    try:
        session = db_manager.get_session()

        # Buscar historico (em producao, viria de tabela de vendas/pedidos)
        # Por enquanto, retornamos dados de exemplo
        historico = []

        session.close()

        return jsonify({
            'success': True,
            'historico': historico
        })

    except Exception as e:
        print(f"[TINTAS API] Erro ao buscar historico: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@tintas_api_bp.route('/historico-cores', methods=['POST'])
def registrar_cor_cliente():
    """Registra uma cor comprada por um cliente"""
    try:
        data = request.get_json()
        empresa_id = data.get('empresa_id') or request.headers.get('X-Empresa-ID')

        session = db_manager.get_session()

        # Criar tabela se nao existir
        session.execute(text("""
            CREATE TABLE IF NOT EXISTS historico_cores_clientes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                empresa_id INTEGER NOT NULL,
                cliente_id INTEGER,
                cliente_nome VARCHAR(200),
                cliente_telefone VARCHAR(20),
                cor_nome VARCHAR(100),
                cor_codigo VARCHAR(20),
                cor_hex VARCHAR(7),
                tinta_nome VARCHAR(200),
                volume VARCHAR(20),
                obra VARCHAR(500),
                data_compra DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """))

        query = text("""
            INSERT INTO historico_cores_clientes
            (empresa_id, cliente_id, cliente_nome, cliente_telefone, cor_nome, cor_codigo, cor_hex, tinta_nome, volume, obra)
            VALUES (:empresa_id, :cliente_id, :cliente_nome, :cliente_telefone, :cor_nome, :cor_codigo, :cor_hex, :tinta_nome, :volume, :obra)
        """)

        session.execute(query, {
            'empresa_id': empresa_id,
            'cliente_id': data.get('cliente_id'),
            'cliente_nome': data.get('cliente_nome', ''),
            'cliente_telefone': data.get('cliente_telefone', ''),
            'cor_nome': data.get('cor_nome', ''),
            'cor_codigo': data.get('cor_codigo', ''),
            'cor_hex': data.get('cor_hex', ''),
            'tinta_nome': data.get('tinta_nome', ''),
            'volume': data.get('volume', ''),
            'obra': data.get('obra', '')
        })

        session.commit()
        session.close()

        return jsonify({
            'success': True,
            'message': 'Cor registrada no historico do cliente'
        })

    except Exception as e:
        print(f"[TINTAS API] Erro ao registrar cor: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


# ══════════════════════════════════════════════════════════════
# CALCULADORA DE RENDIMENTO
# ══════════════════════════════════════════════════════════════

@tintas_api_bp.route('/calcular-rendimento', methods=['POST'])
def calcular_rendimento():
    """Calcula a quantidade de tinta necessaria"""
    try:
        data = request.get_json()

        largura = float(data.get('largura', 0))
        altura = float(data.get('altura', 0))
        portas = int(data.get('portas', 0))
        janelas = int(data.get('janelas', 0))
        demaos = int(data.get('demaos', 2))
        rendimento_por_litro = float(data.get('rendimento_por_litro', 10))
        volume_embalagem = float(data.get('volume_embalagem', 18))

        # Calculos
        area_total = largura * altura
        area_portas = portas * 1.6  # Porta padrao 0.8m x 2m
        area_janelas = janelas * 1.2  # Janela padrao 1m x 1.2m
        area_util = area_total - area_portas - area_janelas
        area_pintura = area_util * demaos
        litros_necessarios = area_pintura / rendimento_por_litro
        embalagens_necessarias = -(-int(litros_necessarios / volume_embalagem) // 1)  # Ceiling
        sobra_litros = (embalagens_necessarias * volume_embalagem) - litros_necessarios

        return jsonify({
            'success': True,
            'resultado': {
                'area_total': round(area_total, 2),
                'area_portas': round(area_portas, 2),
                'area_janelas': round(area_janelas, 2),
                'area_util': round(area_util, 2),
                'area_pintura': round(area_pintura, 2),
                'litros_necessarios': round(litros_necessarios, 2),
                'embalagens_necessarias': embalagens_necessarias,
                'volume_embalagem': volume_embalagem,
                'sobra_litros': round(sobra_litros, 2)
            }
        })

    except Exception as e:
        print(f"[TINTAS API] Erro no calculo: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500
