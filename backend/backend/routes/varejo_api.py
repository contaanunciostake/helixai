"""
API REST para Varejo - CRUD de Produtos, Clientes, Pedidos
"""

from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from datetime import datetime
import sys
import sqlite3
from pathlib import Path

# Adicionar pasta raiz ao path
sys.path.append(str(Path(__file__).parent.parent.parent))

from database.models import (
    DatabaseManager, Produto, Cliente, Pedido, ItemPedido,
    Fornecedor, NotaFiscal
)

varejo_api_bp = Blueprint('varejo_api', __name__, url_prefix='/api')

# CORS handler para todas as rotas deste blueprint
@varejo_api_bp.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = request.headers.get('Origin', '*')
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Empresa-ID, X-API-Key'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response

# Handler para preflight OPTIONS requests
@varejo_api_bp.route('/<path:path>', methods=['OPTIONS'])
@varejo_api_bp.route('/', methods=['OPTIONS'])
def handle_options(path=''):
    return '', 204

# Database Manager - Usar o mesmo banco que o backend principal
# Path: routes/varejo_api.py -> backend/backend -> backend -> vendeai.db
db_path = Path(__file__).resolve().parent.parent.parent / 'vendeai.db'
print(f'[VAREJO-API] Database path: {db_path}')
db_manager = DatabaseManager(f'sqlite:///{db_path}')

# Função auxiliar para conexão SQLite direta
def get_sqlite_connection():
    """Retorna conexão SQLite direta para queries raw"""
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row  # Para retornar dicts
    return conn


# ═══════════════════════════════════════════════════════════════════
# PRODUTOS API
# ═══════════════════════════════════════════════════════════════════

@varejo_api_bp.route('/produtos/listar', methods=['GET'])
def listar_produtos():
    """Lista todos os produtos de uma empresa"""
    try:
        empresa_id = request.args.get('empresa_id') or request.headers.get('X-Empresa-ID')
        if not empresa_id:
            return jsonify({'success': False, 'error': 'empresa_id é obrigatório'}), 400

        session = db_manager.get_session()
        try:
            produtos = session.query(Produto).filter(
                Produto.empresa_id == int(empresa_id),
                Produto.ativo == True
            ).order_by(Produto.nome).all()

            return jsonify({
                'success': True,
                'produtos': [{
                    'id': p.id,
                    'nome': p.nome,
                    'descricao': p.descricao,
                    'categoria': p.categoria,
                    'subcategoria': p.subcategoria,
                    'marca': p.marca,
                    'preco': float(p.preco) if p.preco else 0,
                    'preco_promocional': float(p.preco_promocional) if p.preco_promocional else None,
                    'estoque': p.estoque or 0,
                    'estoque_minimo': getattr(p, 'estoque_minimo', 10),
                    'sku': p.sku,
                    'aplicacao': getattr(p, 'aplicacao', ''),
                    'palavras_chave': p.palavras_chave,
                    'disponivel': p.disponivel,
                    'imagem_url': p.imagem_url
                } for p in produtos],
                'total': len(produtos)
            })
        finally:
            session.close()

    except Exception as e:
        print(f'[VAREJO-API] Erro ao listar produtos: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500


@varejo_api_bp.route('/produtos/criar', methods=['POST'])
def criar_produto():
    """Cria um novo produto"""
    try:
        data = request.get_json()
        empresa_id = data.get('empresa_id') or request.headers.get('X-Empresa-ID')

        if not empresa_id:
            return jsonify({'success': False, 'error': 'empresa_id é obrigatório'}), 400

        session = db_manager.get_session()
        try:
            produto = Produto(
                empresa_id=int(empresa_id),
                nome=data.get('nome'),
                descricao=data.get('descricao'),
                categoria=data.get('categoria'),
                subcategoria=data.get('subcategoria'),
                marca=data.get('marca'),
                preco=float(data.get('preco', 0)),
                preco_promocional=float(data.get('preco_promocional')) if data.get('preco_promocional') else None,
                estoque=int(data.get('estoque', 0)),
                sku=data.get('sku'),
                palavras_chave=data.get('palavras_chave'),
                disponivel=data.get('disponivel', True),
                ativo=True
            )

            # Campos extras se existirem no modelo
            if hasattr(produto, 'estoque_minimo'):
                produto.estoque_minimo = int(data.get('estoque_minimo', 10))
            if hasattr(produto, 'aplicacao'):
                produto.aplicacao = data.get('aplicacao')

            session.add(produto)
            session.commit()

            return jsonify({
                'success': True,
                'message': 'Produto criado com sucesso',
                'produto': {
                    'id': produto.id,
                    'nome': produto.nome
                }
            })
        finally:
            session.close()

    except Exception as e:
        print(f'[VAREJO-API] Erro ao criar produto: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500


@varejo_api_bp.route('/produtos/atualizar/<int:produto_id>', methods=['PUT'])
def atualizar_produto(produto_id):
    """Atualiza um produto existente"""
    try:
        data = request.get_json()
        empresa_id = data.get('empresa_id') or request.headers.get('X-Empresa-ID')

        session = db_manager.get_session()
        try:
            produto = session.query(Produto).filter(
                Produto.id == produto_id,
                Produto.empresa_id == int(empresa_id)
            ).first()

            if not produto:
                return jsonify({'success': False, 'error': 'Produto não encontrado'}), 404

            # Atualizar campos
            if 'nome' in data:
                produto.nome = data['nome']
            if 'descricao' in data:
                produto.descricao = data['descricao']
            if 'categoria' in data:
                produto.categoria = data['categoria']
            if 'subcategoria' in data:
                produto.subcategoria = data['subcategoria']
            if 'marca' in data:
                produto.marca = data['marca']
            if 'preco' in data:
                produto.preco = float(data['preco'])
            if 'preco_promocional' in data:
                produto.preco_promocional = float(data['preco_promocional']) if data['preco_promocional'] else None
            if 'estoque' in data:
                produto.estoque = int(data['estoque'])
            if 'sku' in data:
                produto.sku = data['sku']
            if 'palavras_chave' in data:
                produto.palavras_chave = data['palavras_chave']
            if 'disponivel' in data:
                produto.disponivel = data['disponivel']

            session.commit()

            return jsonify({
                'success': True,
                'message': 'Produto atualizado com sucesso'
            })
        finally:
            session.close()

    except Exception as e:
        print(f'[VAREJO-API] Erro ao atualizar produto: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500


@varejo_api_bp.route('/produtos/excluir/<int:produto_id>', methods=['DELETE'])
def excluir_produto(produto_id):
    """Exclui (desativa) um produto"""
    try:
        empresa_id = request.headers.get('X-Empresa-ID')

        session = db_manager.get_session()
        try:
            produto = session.query(Produto).filter(
                Produto.id == produto_id,
                Produto.empresa_id == int(empresa_id)
            ).first()

            if not produto:
                return jsonify({'success': False, 'error': 'Produto não encontrado'}), 404

            produto.ativo = False
            produto.disponivel = False
            session.commit()

            return jsonify({
                'success': True,
                'message': 'Produto excluído com sucesso'
            })
        finally:
            session.close()

    except Exception as e:
        print(f'[VAREJO-API] Erro ao excluir produto: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500


# ═══════════════════════════════════════════════════════════════════
# MARCAS API
# ═══════════════════════════════════════════════════════════════════

@varejo_api_bp.route('/marcas/listar', methods=['GET'])
def listar_marcas():
    """Lista todas as marcas de produtos de uma empresa"""
    try:
        empresa_id = request.args.get('empresa_id') or request.headers.get('X-Empresa-ID')
        if not empresa_id:
            return jsonify({'success': False, 'error': 'empresa_id é obrigatório'}), 400

        session = db_manager.get_session()
        try:
            # Buscar marcas distintas com contagem de produtos
            from sqlalchemy import func
            marcas = session.query(
                Produto.marca,
                func.count(Produto.id).label('total_produtos'),
                func.sum(Produto.estoque).label('total_estoque')
            ).filter(
                Produto.empresa_id == int(empresa_id),
                Produto.ativo == True,
                Produto.marca.isnot(None),
                Produto.marca != ''
            ).group_by(Produto.marca).order_by(func.count(Produto.id).desc()).all()

            return jsonify({
                'success': True,
                'marcas': [{
                    'nome': m[0],
                    'total_produtos': m[1],
                    'total_estoque': int(m[2] or 0)
                } for m in marcas],
                'total': len(marcas)
            })
        finally:
            session.close()

    except Exception as e:
        print(f'[VAREJO-API] Erro ao listar marcas: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500


@varejo_api_bp.route('/categorias/listar', methods=['GET'])
def listar_categorias():
    """Lista todas as categorias de produtos de uma empresa"""
    try:
        empresa_id = request.args.get('empresa_id') or request.headers.get('X-Empresa-ID')
        if not empresa_id:
            return jsonify({'success': False, 'error': 'empresa_id é obrigatório'}), 400

        session = db_manager.get_session()
        try:
            from sqlalchemy import func
            categorias = session.query(
                Produto.categoria,
                func.count(Produto.id).label('total_produtos')
            ).filter(
                Produto.empresa_id == int(empresa_id),
                Produto.ativo == True,
                Produto.categoria.isnot(None),
                Produto.categoria != ''
            ).group_by(Produto.categoria).order_by(func.count(Produto.id).desc()).all()

            return jsonify({
                'success': True,
                'categorias': [{
                    'nome': c[0],
                    'total_produtos': c[1]
                } for c in categorias],
                'total': len(categorias)
            })
        finally:
            session.close()

    except Exception as e:
        print(f'[VAREJO-API] Erro ao listar categorias: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500


# ═══════════════════════════════════════════════════════════════════
# CLIENTES API
# ═══════════════════════════════════════════════════════════════════

@varejo_api_bp.route('/clientes/listar', methods=['GET'])
def listar_clientes():
    """Lista todos os clientes de uma empresa"""
    try:
        empresa_id = request.args.get('empresa_id') or request.headers.get('X-Empresa-ID')
        if not empresa_id:
            return jsonify({'success': False, 'error': 'empresa_id é obrigatório'}), 400

        session = db_manager.get_session()
        try:
            # Verificar se a tabela Cliente existe
            clientes = session.query(Cliente).filter(
                Cliente.empresa_id == int(empresa_id)
            ).order_by(Cliente.nome).all()

            return jsonify({
                'success': True,
                'clientes': [{
                    'id': c.id,
                    'nome': c.nome,
                    'tipo': getattr(c, 'tipo', 'PJ'),
                    'cpf_cnpj': getattr(c, 'cpf_cnpj', '') or getattr(c, 'cnpj', '') or getattr(c, 'cpf', ''),
                    'email': c.email,
                    'telefone': c.telefone,
                    'celular': getattr(c, 'celular', ''),
                    'endereco': getattr(c, 'endereco', ''),
                    'numero': getattr(c, 'numero', ''),
                    'complemento': getattr(c, 'complemento', ''),
                    'bairro': getattr(c, 'bairro', ''),
                    'cidade': getattr(c, 'cidade', ''),
                    'estado': getattr(c, 'estado', ''),
                    'cep': getattr(c, 'cep', ''),
                    'observacoes': getattr(c, 'observacoes', ''),
                    'ativo': getattr(c, 'ativo', True),
                    'total_compras': getattr(c, 'total_compras', 0),
                    'ultima_compra': str(getattr(c, 'ultima_compra', '')) if getattr(c, 'ultima_compra', None) else None
                } for c in clientes],
                'total': len(clientes)
            })
        finally:
            session.close()

    except Exception as e:
        print(f'[VAREJO-API] Erro ao listar clientes: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500


@varejo_api_bp.route('/clientes/criar', methods=['POST'])
def criar_cliente():
    """Cria um novo cliente"""
    try:
        data = request.get_json()
        empresa_id = data.get('empresa_id') or request.headers.get('X-Empresa-ID')

        if not empresa_id:
            return jsonify({'success': False, 'error': 'empresa_id é obrigatório'}), 400

        session = db_manager.get_session()
        try:
            cliente = Cliente(
                empresa_id=int(empresa_id),
                nome=data.get('nome'),
                email=data.get('email'),
                telefone=data.get('telefone')
            )

            # Campos extras
            if hasattr(cliente, 'tipo'):
                cliente.tipo = data.get('tipo', 'PJ')
            if hasattr(cliente, 'cpf_cnpj'):
                cliente.cpf_cnpj = data.get('cpf_cnpj')
            if hasattr(cliente, 'celular'):
                cliente.celular = data.get('celular')
            if hasattr(cliente, 'endereco'):
                cliente.endereco = data.get('endereco')
            if hasattr(cliente, 'numero'):
                cliente.numero = data.get('numero')
            if hasattr(cliente, 'complemento'):
                cliente.complemento = data.get('complemento')
            if hasattr(cliente, 'bairro'):
                cliente.bairro = data.get('bairro')
            if hasattr(cliente, 'cidade'):
                cliente.cidade = data.get('cidade')
            if hasattr(cliente, 'estado'):
                cliente.estado = data.get('estado')
            if hasattr(cliente, 'cep'):
                cliente.cep = data.get('cep')
            if hasattr(cliente, 'observacoes'):
                cliente.observacoes = data.get('observacoes')
            if hasattr(cliente, 'ativo'):
                cliente.ativo = data.get('ativo', True)

            session.add(cliente)
            session.commit()

            return jsonify({
                'success': True,
                'message': 'Cliente criado com sucesso',
                'cliente': {
                    'id': cliente.id,
                    'nome': cliente.nome
                }
            })
        finally:
            session.close()

    except Exception as e:
        print(f'[VAREJO-API] Erro ao criar cliente: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500


@varejo_api_bp.route('/clientes/atualizar/<int:cliente_id>', methods=['PUT'])
def atualizar_cliente(cliente_id):
    """Atualiza um cliente existente"""
    try:
        data = request.get_json()
        empresa_id = data.get('empresa_id') or request.headers.get('X-Empresa-ID')

        session = db_manager.get_session()
        try:
            cliente = session.query(Cliente).filter(
                Cliente.id == cliente_id,
                Cliente.empresa_id == int(empresa_id)
            ).first()

            if not cliente:
                return jsonify({'success': False, 'error': 'Cliente não encontrado'}), 404

            # Atualizar campos básicos
            for campo in ['nome', 'email', 'telefone']:
                if campo in data:
                    setattr(cliente, campo, data[campo])

            # Campos extras
            campos_extras = ['tipo', 'cpf_cnpj', 'celular', 'endereco', 'numero',
                           'complemento', 'bairro', 'cidade', 'estado', 'cep',
                           'observacoes', 'ativo']
            for campo in campos_extras:
                if campo in data and hasattr(cliente, campo):
                    setattr(cliente, campo, data[campo])

            session.commit()

            return jsonify({
                'success': True,
                'message': 'Cliente atualizado com sucesso'
            })
        finally:
            session.close()

    except Exception as e:
        print(f'[VAREJO-API] Erro ao atualizar cliente: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500


@varejo_api_bp.route('/clientes/excluir/<int:cliente_id>', methods=['DELETE'])
def excluir_cliente(cliente_id):
    """Exclui (desativa) um cliente"""
    try:
        empresa_id = request.headers.get('X-Empresa-ID')

        session = db_manager.get_session()
        try:
            cliente = session.query(Cliente).filter(
                Cliente.id == cliente_id,
                Cliente.empresa_id == int(empresa_id)
            ).first()

            if not cliente:
                return jsonify({'success': False, 'error': 'Cliente não encontrado'}), 404

            if hasattr(cliente, 'ativo'):
                cliente.ativo = False
                session.commit()
            else:
                session.delete(cliente)
                session.commit()

            return jsonify({
                'success': True,
                'message': 'Cliente excluído com sucesso'
            })
        finally:
            session.close()

    except Exception as e:
        print(f'[VAREJO-API] Erro ao excluir cliente: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500


# ═══════════════════════════════════════════════════════════════════
# PEDIDOS API
# ═══════════════════════════════════════════════════════════════════

@varejo_api_bp.route('/pedidos/listar', methods=['GET'])
def listar_pedidos():
    """Lista todos os pedidos de uma empresa"""
    try:
        empresa_id = request.args.get('empresa_id') or request.headers.get('X-Empresa-ID')
        if not empresa_id:
            return jsonify({'success': False, 'error': 'empresa_id é obrigatório'}), 400

        session = db_manager.get_session()
        try:
            pedidos = session.query(Pedido).filter(
                Pedido.empresa_id == int(empresa_id)
            ).order_by(Pedido.criado_em.desc()).all()

            return jsonify({
                'success': True,
                'pedidos': [{
                    'id': p.id,
                    'cliente_id': p.cliente_id,
                    'cliente_nome': p.cliente.nome if p.cliente else 'N/A',
                    'data_pedido': str(p.criado_em) if p.criado_em else None,
                    'data_entrega': str(getattr(p, 'data_entrega', '')) if getattr(p, 'data_entrega', None) else None,
                    'status': getattr(p, 'status', 'pendente'),
                    'forma_pagamento': getattr(p, 'forma_pagamento', ''),
                    'total': float(getattr(p, 'total', 0)),
                    'desconto': float(getattr(p, 'desconto', 0)),
                    'observacoes': getattr(p, 'observacoes', ''),
                    'itens': [{
                        'produto_id': i.produto_id,
                        'produto_nome': i.produto.nome if i.produto else 'N/A',
                        'sku': i.produto.sku if i.produto else '',
                        'quantidade': i.quantidade,
                        'preco_unitario': float(i.preco_unitario) if i.preco_unitario else 0,
                        'subtotal': float(i.quantidade * i.preco_unitario) if i.preco_unitario else 0
                    } for i in (p.itens or [])]
                } for p in pedidos],
                'total': len(pedidos)
            })
        finally:
            session.close()

    except Exception as e:
        print(f'[VAREJO-API] Erro ao listar pedidos: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500


@varejo_api_bp.route('/pedidos/criar', methods=['POST'])
def criar_pedido():
    """Cria um novo pedido"""
    try:
        data = request.get_json()
        empresa_id = data.get('empresa_id') or request.headers.get('X-Empresa-ID')

        if not empresa_id:
            return jsonify({'success': False, 'error': 'empresa_id é obrigatório'}), 400

        if not data.get('cliente_id'):
            return jsonify({'success': False, 'error': 'cliente_id é obrigatório'}), 400

        if not data.get('itens') or len(data['itens']) == 0:
            return jsonify({'success': False, 'error': 'Adicione pelo menos um item'}), 400

        session = db_manager.get_session()
        try:
            pedido = Pedido(
                empresa_id=int(empresa_id),
                cliente_id=int(data['cliente_id']),
                criado_em=datetime.now()
            )

            # Campos extras
            if hasattr(pedido, 'status'):
                pedido.status = data.get('status', 'pendente')
            if hasattr(pedido, 'forma_pagamento'):
                pedido.forma_pagamento = data.get('forma_pagamento')
            if hasattr(pedido, 'data_entrega') and data.get('data_entrega'):
                pedido.data_entrega = datetime.strptime(data['data_entrega'], '%Y-%m-%d')
            if hasattr(pedido, 'desconto'):
                pedido.desconto = float(data.get('desconto', 0))
            if hasattr(pedido, 'observacoes'):
                pedido.observacoes = data.get('observacoes')
            if hasattr(pedido, 'total'):
                pedido.total = float(data.get('total', 0))

            session.add(pedido)
            session.flush()  # Para obter o ID

            # Adicionar itens
            for item_data in data['itens']:
                item = ItemPedido(
                    pedido_id=pedido.id,
                    produto_id=int(item_data['produto_id']),
                    quantidade=int(item_data['quantidade']),
                    preco_unitario=float(item_data['preco_unitario'])
                )
                session.add(item)

                # Atualizar estoque
                produto = session.query(Produto).get(int(item_data['produto_id']))
                if produto and produto.estoque:
                    produto.estoque = max(0, produto.estoque - int(item_data['quantidade']))

            session.commit()

            return jsonify({
                'success': True,
                'message': 'Pedido criado com sucesso',
                'pedido': {
                    'id': pedido.id
                }
            })
        finally:
            session.close()

    except Exception as e:
        print(f'[VAREJO-API] Erro ao criar pedido: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500


@varejo_api_bp.route('/pedidos/atualizar/<int:pedido_id>', methods=['PUT'])
def atualizar_pedido(pedido_id):
    """Atualiza um pedido existente"""
    try:
        data = request.get_json()
        empresa_id = data.get('empresa_id') or request.headers.get('X-Empresa-ID')

        session = db_manager.get_session()
        try:
            pedido = session.query(Pedido).filter(
                Pedido.id == pedido_id,
                Pedido.empresa_id == int(empresa_id)
            ).first()

            if not pedido:
                return jsonify({'success': False, 'error': 'Pedido não encontrado'}), 404

            # Atualizar campos
            campos = ['status', 'forma_pagamento', 'desconto', 'observacoes', 'total']
            for campo in campos:
                if campo in data and hasattr(pedido, campo):
                    if campo in ['desconto', 'total']:
                        setattr(pedido, campo, float(data[campo]))
                    else:
                        setattr(pedido, campo, data[campo])

            if 'data_entrega' in data and data['data_entrega'] and hasattr(pedido, 'data_entrega'):
                pedido.data_entrega = datetime.strptime(data['data_entrega'], '%Y-%m-%d')

            session.commit()

            return jsonify({
                'success': True,
                'message': 'Pedido atualizado com sucesso'
            })
        finally:
            session.close()

    except Exception as e:
        print(f'[VAREJO-API] Erro ao atualizar pedido: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500


@varejo_api_bp.route('/pedidos/excluir/<int:pedido_id>', methods=['DELETE'])
def excluir_pedido(pedido_id):
    """Cancela um pedido"""
    try:
        empresa_id = request.headers.get('X-Empresa-ID')

        session = db_manager.get_session()
        try:
            pedido = session.query(Pedido).filter(
                Pedido.id == pedido_id,
                Pedido.empresa_id == int(empresa_id)
            ).first()

            if not pedido:
                return jsonify({'success': False, 'error': 'Pedido não encontrado'}), 404

            if hasattr(pedido, 'status'):
                pedido.status = 'cancelado'
                session.commit()
            else:
                session.delete(pedido)
                session.commit()

            return jsonify({
                'success': True,
                'message': 'Pedido cancelado com sucesso'
            })
        finally:
            session.close()

    except Exception as e:
        print(f'[VAREJO-API] Erro ao excluir pedido: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500


# ═══════════════════════════════════════════════════════════════════
# FORNECEDORES API
# ═══════════════════════════════════════════════════════════════════

@varejo_api_bp.route('/fornecedores/listar', methods=['GET'])
def listar_fornecedores():
    """Lista todos os fornecedores de uma empresa"""
    try:
        empresa_id = request.args.get('empresa_id') or request.headers.get('X-Empresa-ID')
        if not empresa_id:
            return jsonify({'success': False, 'error': 'empresa_id é obrigatório'}), 400

        session = db_manager.get_session()
        try:
            fornecedores = session.query(Fornecedor).filter(
                Fornecedor.empresa_id == int(empresa_id)
            ).order_by(Fornecedor.nome).all()

            return jsonify({
                'success': True,
                'fornecedores': [{
                    'id': f.id,
                    'nome': f.nome,
                    'cnpj': getattr(f, 'cnpj', ''),
                    'email': getattr(f, 'email', ''),
                    'telefone': getattr(f, 'telefone', ''),
                    'endereco': getattr(f, 'endereco', ''),
                    'cidade': getattr(f, 'cidade', ''),
                    'estado': getattr(f, 'estado', ''),
                    'contato': getattr(f, 'contato', ''),
                    'observacoes': getattr(f, 'observacoes', ''),
                    'ativo': getattr(f, 'ativo', True)
                } for f in fornecedores],
                'total': len(fornecedores)
            })
        finally:
            session.close()

    except Exception as e:
        print(f'[VAREJO-API] Erro ao listar fornecedores: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500


@varejo_api_bp.route('/fornecedores/criar', methods=['POST'])
def criar_fornecedor():
    """Cria um novo fornecedor"""
    try:
        data = request.get_json()
        empresa_id = data.get('empresa_id') or request.headers.get('X-Empresa-ID')

        if not empresa_id:
            return jsonify({'success': False, 'error': 'empresa_id é obrigatório'}), 400

        session = db_manager.get_session()
        try:
            fornecedor = Fornecedor(
                empresa_id=int(empresa_id),
                nome=data.get('nome')
            )

            campos = ['cnpj', 'email', 'telefone', 'endereco', 'cidade',
                     'estado', 'contato', 'observacoes', 'ativo']
            for campo in campos:
                if campo in data and hasattr(fornecedor, campo):
                    setattr(fornecedor, campo, data[campo])

            session.add(fornecedor)
            session.commit()

            return jsonify({
                'success': True,
                'message': 'Fornecedor criado com sucesso',
                'fornecedor': {
                    'id': fornecedor.id,
                    'nome': fornecedor.nome
                }
            })
        finally:
            session.close()

    except Exception as e:
        print(f'[VAREJO-API] Erro ao criar fornecedor: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500


# ═══════════════════════════════════════════════════════════════════
# IMPORTAÇÃO DE PRODUTOS (CSV/EXCEL)
# ═══════════════════════════════════════════════════════════════════

import csv
import io
import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

def get_mysql_connection():
    """Conectar ao MySQL"""
    return mysql.connector.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        user=os.getenv('DB_USER', 'root'),
        password=os.getenv('DB_PASSWORD', ''),
        database=os.getenv('DB_NAME', 'helixai_db')
    )


@varejo_api_bp.route('/produtos/importar', methods=['POST'])
def importar_produtos_csv():
    """Importa produtos de arquivo CSV"""
    try:
        empresa_id = request.form.get('empresa_id') or request.headers.get('X-Empresa-ID')
        if not empresa_id:
            return jsonify({'success': False, 'error': 'empresa_id é obrigatório'}), 400

        if 'arquivo' not in request.files:
            return jsonify({'success': False, 'error': 'Nenhum arquivo enviado'}), 400

        arquivo = request.files['arquivo']
        if arquivo.filename == '':
            return jsonify({'success': False, 'error': 'Nenhum arquivo selecionado'}), 400

        # Ler conteúdo do arquivo
        conteudo = arquivo.read().decode('utf-8-sig')  # utf-8-sig remove BOM
        linhas = csv.DictReader(io.StringIO(conteudo), delimiter=';')

        # Se não funcionou com ;, tentar com ,
        conteudo_io = io.StringIO(conteudo)
        primeiro_linha = conteudo_io.readline()
        conteudo_io.seek(0)

        if ';' in primeiro_linha:
            delimiter = ';'
        else:
            delimiter = ','

        linhas = csv.DictReader(io.StringIO(conteudo), delimiter=delimiter)

        # Conectar ao MySQL
        conn = get_mysql_connection()
        cursor = conn.cursor()

        importados = 0
        erros = []
        total = 0

        for linha_num, linha in enumerate(linhas, start=2):
            total += 1
            try:
                # Mapear campos do CSV para campos do banco
                nome = linha.get('nome', '').strip()
                if not nome:
                    erros.append(f"Linha {linha_num}: nome vazio")
                    continue

                # Extrair dados com fallbacks
                descricao = linha.get('descricao', linha.get('descrição', '')).strip()
                categoria = linha.get('categoria', '').strip()
                subcategoria = linha.get('subcategoria', '').strip()
                marca = linha.get('marca', '').strip()
                sku = linha.get('sku', linha.get('codigo', '')).strip()
                aplicacao = linha.get('aplicacao', linha.get('aplicação', '')).strip()

                # Preço - limpar formatação BR
                preco_str = linha.get('preco', linha.get('preço', '0'))
                preco_str = preco_str.replace('R$', '').replace(' ', '').replace('.', '').replace(',', '.')
                try:
                    preco = float(preco_str) if preco_str else 0
                except:
                    preco = 0

                # Estoque
                estoque_str = linha.get('estoque', '0')
                try:
                    estoque = int(estoque_str) if estoque_str else 0
                except:
                    estoque = 0

                # Disponível
                disponivel_str = linha.get('disponivel', linha.get('disponível', 'sim')).lower()
                disponivel = disponivel_str in ['sim', 's', '1', 'true', 'yes', 'y', 'ativo']

                # Palavras-chave para busca do bot
                palavras_chave = f"{nome} {marca} {categoria} {subcategoria} {aplicacao}"

                # Verificar se SKU já existe para esta empresa
                if sku:
                    cursor.execute(
                        "SELECT id FROM produtos WHERE empresa_id = %s AND sku = %s",
                        (empresa_id, sku)
                    )
                    existe = cursor.fetchone()
                    if existe:
                        # Atualizar produto existente
                        cursor.execute("""
                            UPDATE produtos SET
                                nome = %s, descricao = %s, categoria = %s,
                                subcategoria = %s, marca = %s, preco = %s,
                                estoque = %s, aplicacao = %s, disponivel = %s,
                                palavras_chave = %s, ativo = 1
                            WHERE empresa_id = %s AND sku = %s
                        """, (nome, descricao, categoria, subcategoria, marca,
                              preco, estoque, aplicacao, disponivel,
                              palavras_chave, empresa_id, sku))
                        importados += 1
                        continue

                # Inserir novo produto
                cursor.execute("""
                    INSERT INTO produtos (
                        empresa_id, nome, descricao, categoria, subcategoria,
                        marca, preco, estoque, sku, aplicacao, disponivel,
                        palavras_chave, ativo, importado_csv
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 1, 1)
                """, (empresa_id, nome, descricao, categoria, subcategoria,
                      marca, preco, estoque, sku, aplicacao, disponivel,
                      palavras_chave))

                importados += 1

            except Exception as e:
                erros.append(f"Linha {linha_num}: {str(e)}")

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({
            'success': True,
            'message': f'{importados} de {total} produtos importados',
            'importados': importados,
            'total': total,
            'erros': erros[:10] if erros else []  # Limitar erros retornados
        })

    except Exception as e:
        print(f'[VAREJO-API] Erro ao importar produtos: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500


@varejo_api_bp.route('/produtos/template', methods=['GET'])
def baixar_template_csv():
    """Retorna template CSV para importação de produtos"""
    template = """nome;descricao;categoria;subcategoria;marca;preco;estoque;sku;aplicacao;disponivel
Óleo Motor 5W30 1L;Óleo semissintético para veículos leves;Lubrificantes;Óleos de Motor;Ipiranga;45.90;100;IPR-5W30-1L;Carro e SUV;sim
Filtro de Óleo Mann W712;Filtro para VW/Audi 1.0-2.0;Filtros;Linha Leve;Mann;38.50;50;MANN-W712;Carro e SUV;sim
Militec-1 200ml;Condicionador de metais;Aditivos;Condicionadores;Militec;89.00;60;MIL-200ML;Carro e SUV;sim"""

    from flask import Response
    return Response(
        template,
        mimetype='text/csv',
        headers={'Content-Disposition': 'attachment; filename=template_produtos.csv'}
    )


# ═══════════════════════════════════════════════════════════════════
# CONFIGURAÇÕES DA EMPRESA (SQLite)
# ═══════════════════════════════════════════════════════════════════

import json

@varejo_api_bp.route('/empresa/config', methods=['GET'])
def obter_config_empresa():
    """Obtém configurações da empresa (SQLite)"""
    try:
        empresa_id = request.args.get('empresa_id') or request.headers.get('X-Empresa-ID')
        if not empresa_id:
            return jsonify({'success': False, 'error': 'empresa_id é obrigatório'}), 400

        conn = get_sqlite_connection()
        cursor = conn.cursor()

        # Buscar dados da empresa
        cursor.execute("""
            SELECT e.id, e.nome, e.nome_fantasia, e.cnpj, e.telefone, e.email,
                   e.endereco, e.cidade, e.estado, e.cep,
                   cb.horario_atendimento, cb.mensagem_boas_vindas, cb.mensagem_ausencia,
                   cb.descricao_empresa
            FROM empresas e
            LEFT JOIN configuracoes_bot cb ON cb.empresa_id = e.id
            WHERE e.id = ?
        """, (empresa_id,))

        row = cursor.fetchone()
        conn.close()

        if not row:
            return jsonify({'success': False, 'error': 'Empresa não encontrada'}), 404

        empresa = dict(row)

        # Montar resposta com configurações
        config = {
            'nome': empresa.get('nome') or '',
            'nome_fantasia': empresa.get('nome_fantasia') or '',
            'cnpj': empresa.get('cnpj') or '',
            'telefone': empresa.get('telefone') or '',
            'email': empresa.get('email') or '',
            'endereco': empresa.get('endereco') or '',
            'cidade': empresa.get('cidade') or '',
            'estado': empresa.get('estado') or '',
            'cep': empresa.get('cep') or '',
            'mensagem_boas_vindas': empresa.get('mensagem_boas_vindas') or '',
            'mensagem_ausencia': empresa.get('mensagem_ausencia') or '',
        }

        # Parsear horário de atendimento
        horario = empresa.get('horario_atendimento') or ''
        if horario and ' às ' in horario:
            partes = horario.replace('h', '').split(' às ')
            config['horario_abertura'] = partes[0].strip() + ':00' if len(partes[0]) <= 2 else partes[0].strip()
            config['horario_fechamento'] = partes[1].strip() + ':00' if len(partes[1]) <= 2 else partes[1].strip()
        else:
            config['horario_abertura'] = '08:00'
            config['horario_fechamento'] = '18:00'

        # Parsear configurações extras do JSON em descricao_empresa
        descricao = empresa.get('descricao_empresa') or ''
        if descricao and descricao.startswith('{'):
            try:
                extras = json.loads(descricao)
                config.update(extras)
            except:
                config['sobre_empresa'] = descricao
        else:
            config['sobre_empresa'] = descricao or ''

        return jsonify({
            'success': True,
            'config': config
        })

    except Exception as e:
        print(f'[VAREJO-API] Erro ao obter config empresa: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500


@varejo_api_bp.route('/empresa/config', methods=['POST'])
def salvar_config_empresa():
    """Salva configurações da empresa (SQLite)"""
    try:
        data = request.get_json()
        empresa_id = data.get('empresa_id') or request.headers.get('X-Empresa-ID')

        if not empresa_id:
            return jsonify({'success': False, 'error': 'empresa_id é obrigatório'}), 400

        conn = get_sqlite_connection()
        cursor = conn.cursor()

        # Atualizar dados básicos da empresa
        cursor.execute("""
            UPDATE empresas SET
                nome = ?,
                nome_fantasia = ?,
                cnpj = ?,
                telefone = ?,
                email = ?,
                endereco = ?,
                cidade = ?,
                estado = ?,
                cep = ?
            WHERE id = ?
        """, (
            data.get('nome', ''),
            data.get('nome_fantasia', ''),
            data.get('cnpj', ''),
            data.get('telefone', ''),
            data.get('email', ''),
            data.get('endereco', ''),
            data.get('cidade', ''),
            data.get('estado', ''),
            data.get('cep', ''),
            empresa_id
        ))

        # Montar horário de atendimento
        horario_abertura = data.get('horario_abertura', '08:00')
        horario_fechamento = data.get('horario_fechamento', '18:00')
        horario_atendimento = f"{horario_abertura} às {horario_fechamento}"

        # Montar configurações extras como JSON
        extras = {
            'celular': data.get('celular', ''),
            'numero': data.get('numero', ''),
            'complemento': data.get('complemento', ''),
            'bairro': data.get('bairro', ''),
            'horario_abertura': horario_abertura,
            'horario_fechamento': horario_fechamento,
            'dias_funcionamento': data.get('dias_funcionamento', []),
            'aceita_cartao': data.get('aceita_cartao', True),
            'aceita_pix': data.get('aceita_pix', True),
            'aceita_boleto': data.get('aceita_boleto', True),
            'aceita_dinheiro': data.get('aceita_dinheiro', True),
            'prazo_entrega': data.get('prazo_entrega', ''),
            'taxa_entrega': data.get('taxa_entrega', 0),
            'entrega_gratis_acima': data.get('entrega_gratis_acima', 0),
            'sobre_empresa': data.get('sobre_empresa', '')
        }
        descricao_empresa = json.dumps(extras, ensure_ascii=False)

        # Verificar se já existe configuracao_bot para esta empresa
        cursor.execute("SELECT id FROM configuracoes_bot WHERE empresa_id = ?", (empresa_id,))
        config_existe = cursor.fetchone()

        if config_existe:
            # Atualizar
            cursor.execute("""
                UPDATE configuracoes_bot SET
                    horario_atendimento = ?,
                    mensagem_boas_vindas = ?,
                    mensagem_ausencia = ?,
                    descricao_empresa = ?
                WHERE empresa_id = ?
            """, (
                horario_atendimento,
                data.get('mensagem_boas_vindas', ''),
                data.get('mensagem_ausencia', ''),
                descricao_empresa,
                empresa_id
            ))
        else:
            # Inserir
            cursor.execute("""
                INSERT INTO configuracoes_bot (
                    empresa_id, horario_atendimento, mensagem_boas_vindas,
                    mensagem_ausencia, descricao_empresa
                ) VALUES (?, ?, ?, ?, ?)
            """, (
                empresa_id,
                horario_atendimento,
                data.get('mensagem_boas_vindas', ''),
                data.get('mensagem_ausencia', ''),
                descricao_empresa
            ))

        conn.commit()
        conn.close()

        print(f'[VAREJO-API] Config empresa {empresa_id} salva com sucesso')
        return jsonify({
            'success': True,
            'message': 'Configurações salvas com sucesso'
        })

    except Exception as e:
        print(f'[VAREJO-API] Erro ao salvar config empresa: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500


# ═══════════════════════════════════════════════════════════════════
# REGISTRO AUTOMÁTICO - Para o BOT cadastrar clientes/vendas/agendamentos
# ═══════════════════════════════════════════════════════════════════

@varejo_api_bp.route('/bot/registrar-cliente', methods=['POST'])
def registrar_cliente_bot():
    """
    Registrar cliente automaticamente via bot.
    Usado quando o bot coleta informações do cliente durante a conversa.
    """
    try:
        data = request.get_json()
        empresa_id = data.get('empresa_id')
        telefone = data.get('telefone', '').strip()

        if not empresa_id or not telefone:
            return jsonify({'success': False, 'error': 'empresa_id e telefone obrigatórios'}), 400

        conn = get_mysql_connection()
        cursor = conn.cursor(dictionary=True)

        # Verificar se cliente já existe (por telefone)
        cursor.execute("""
            SELECT id, nome FROM clientes
            WHERE empresa_id = %s AND (telefone = %s OR celular = %s)
        """, (empresa_id, telefone, telefone))

        cliente_existente = cursor.fetchone()

        if cliente_existente:
            # Atualizar dados do cliente existente
            cliente_id = cliente_existente['id']
            update_fields = []
            update_values = []

            if data.get('nome'):
                update_fields.append('nome = %s')
                update_values.append(data['nome'])
            if data.get('email'):
                update_fields.append('email = %s')
                update_values.append(data['email'])
            if data.get('endereco'):
                update_fields.append('endereco = %s')
                update_values.append(data['endereco'])
            if data.get('cidade'):
                update_fields.append('cidade = %s')
                update_values.append(data['cidade'])
            if data.get('observacoes'):
                update_fields.append('observacoes = CONCAT(IFNULL(observacoes, ""), " | ", %s)')
                update_values.append(data['observacoes'])

            if update_fields:
                update_values.append(cliente_id)
                cursor.execute(f"""
                    UPDATE clientes SET {', '.join(update_fields)}, atualizado_em = NOW()
                    WHERE id = %s
                """, update_values)

            conn.commit()
            cursor.close()
            conn.close()

            return jsonify({
                'success': True,
                'cliente_id': cliente_id,
                'novo': False,
                'message': 'Cliente atualizado'
            })

        # Criar novo cliente
        cursor.execute("""
            INSERT INTO clientes (
                empresa_id, nome, telefone, celular, email, endereco, cidade,
                origem, observacoes, criado_em
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, 'whatsapp_bot', %s, NOW())
        """, (
            empresa_id,
            data.get('nome', 'Cliente WhatsApp'),
            telefone,
            telefone,
            data.get('email', ''),
            data.get('endereco', ''),
            data.get('cidade', ''),
            data.get('observacoes', '')
        ))

        cliente_id = cursor.lastrowid
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({
            'success': True,
            'cliente_id': cliente_id,
            'novo': True,
            'message': 'Cliente cadastrado com sucesso'
        })

    except Exception as e:
        print(f'[VAREJO-API] Erro ao registrar cliente via bot: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500


@varejo_api_bp.route('/bot/registrar-agendamento', methods=['POST'])
def registrar_agendamento_bot():
    """
    Registrar agendamento automaticamente via bot.
    Usado quando o cliente agenda uma visita/entrega.
    """
    try:
        data = request.get_json()
        empresa_id = data.get('empresa_id')
        cliente_id = data.get('cliente_id')
        telefone = data.get('telefone')

        if not empresa_id:
            return jsonify({'success': False, 'error': 'empresa_id obrigatório'}), 400

        conn = get_mysql_connection()
        cursor = conn.cursor(dictionary=True)

        # Se não tem cliente_id mas tem telefone, buscar ou criar cliente
        if not cliente_id and telefone:
            cursor.execute("""
                SELECT id FROM clientes
                WHERE empresa_id = %s AND (telefone = %s OR celular = %s)
            """, (empresa_id, telefone, telefone))
            cliente = cursor.fetchone()

            if cliente:
                cliente_id = cliente['id']
            else:
                # Criar cliente básico
                cursor.execute("""
                    INSERT INTO clientes (empresa_id, nome, telefone, celular, origem, criado_em)
                    VALUES (%s, %s, %s, %s, 'whatsapp_bot', NOW())
                """, (empresa_id, data.get('nome_cliente', 'Cliente WhatsApp'), telefone, telefone))
                cliente_id = cursor.lastrowid

        # Parsear data/hora do agendamento
        data_agendamento = data.get('data')  # Formato: YYYY-MM-DD
        hora_agendamento = data.get('hora')  # Formato: HH:MM

        if data_agendamento and hora_agendamento:
            data_hora = f"{data_agendamento} {hora_agendamento}:00"
        elif data_agendamento:
            data_hora = f"{data_agendamento} 09:00:00"
        else:
            # Agendar para amanhã às 9h se não especificado
            from datetime import datetime, timedelta
            amanha = datetime.now() + timedelta(days=1)
            data_hora = amanha.strftime('%Y-%m-%d 09:00:00')

        # Criar agendamento
        cursor.execute("""
            INSERT INTO agendamentos (
                empresa_id, cliente_id, data_hora, tipo, descricao,
                status, observacoes, criado_em
            ) VALUES (%s, %s, %s, %s, %s, 'pendente', %s, NOW())
        """, (
            empresa_id,
            cliente_id,
            data_hora,
            data.get('tipo', 'visita'),  # visita, entrega, retirada
            data.get('descricao', 'Agendamento via WhatsApp'),
            data.get('observacoes', '')
        ))

        agendamento_id = cursor.lastrowid
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({
            'success': True,
            'agendamento_id': agendamento_id,
            'cliente_id': cliente_id,
            'data_hora': data_hora,
            'message': 'Agendamento registrado com sucesso'
        })

    except Exception as e:
        print(f'[VAREJO-API] Erro ao registrar agendamento via bot: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500


@varejo_api_bp.route('/bot/registrar-venda', methods=['POST'])
def registrar_venda_bot():
    """
    Registrar venda/pedido automaticamente via bot.
    Usado quando o bot identifica uma venda concluída.
    """
    try:
        data = request.get_json()
        empresa_id = data.get('empresa_id')
        cliente_id = data.get('cliente_id')
        telefone = data.get('telefone')
        produtos = data.get('produtos', [])  # Lista de {produto_id, quantidade, preco}

        if not empresa_id:
            return jsonify({'success': False, 'error': 'empresa_id obrigatório'}), 400

        conn = get_mysql_connection()
        cursor = conn.cursor(dictionary=True)

        # Se não tem cliente_id mas tem telefone, buscar ou criar cliente
        if not cliente_id and telefone:
            cursor.execute("""
                SELECT id, nome FROM clientes
                WHERE empresa_id = %s AND (telefone = %s OR celular = %s)
            """, (empresa_id, telefone, telefone))
            cliente = cursor.fetchone()

            if cliente:
                cliente_id = cliente['id']
            else:
                # Criar cliente básico
                cursor.execute("""
                    INSERT INTO clientes (empresa_id, nome, telefone, celular, origem, criado_em)
                    VALUES (%s, %s, %s, %s, 'whatsapp_bot', NOW())
                """, (empresa_id, data.get('nome_cliente', 'Cliente WhatsApp'), telefone, telefone))
                cliente_id = cursor.lastrowid

        # Calcular total
        total = 0
        for item in produtos:
            preco = float(item.get('preco', 0))
            qtd = int(item.get('quantidade', 1))
            total += preco * qtd

        # Aplicar desconto se houver
        desconto = float(data.get('desconto', 0))
        total_final = total - desconto

        # Criar pedido
        cursor.execute("""
            INSERT INTO pedidos (
                empresa_id, cliente_id, data_pedido, status,
                subtotal, desconto, total, forma_pagamento,
                observacoes, origem, criado_em
            ) VALUES (%s, %s, NOW(), 'pendente', %s, %s, %s, %s, %s, 'whatsapp_bot', NOW())
        """, (
            empresa_id,
            cliente_id,
            total,
            desconto,
            total_final,
            data.get('forma_pagamento', 'a_combinar'),
            data.get('observacoes', 'Pedido via WhatsApp')
        ))

        pedido_id = cursor.lastrowid

        # Inserir itens do pedido
        for item in produtos:
            cursor.execute("""
                INSERT INTO itens_pedido (
                    pedido_id, produto_id, quantidade, preco_unitario
                ) VALUES (%s, %s, %s, %s)
            """, (
                pedido_id,
                item.get('produto_id'),
                item.get('quantidade', 1),
                item.get('preco', 0)
            ))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({
            'success': True,
            'pedido_id': pedido_id,
            'cliente_id': cliente_id,
            'total': total_final,
            'itens': len(produtos),
            'message': 'Venda registrada com sucesso'
        })

    except Exception as e:
        print(f'[VAREJO-API] Erro ao registrar venda via bot: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500


@varejo_api_bp.route('/agendamentos/listar', methods=['GET'])
def listar_agendamentos():
    """Lista todos os agendamentos de uma empresa"""
    try:
        empresa_id = request.args.get('empresa_id') or request.headers.get('X-Empresa-ID')
        if not empresa_id:
            return jsonify({'success': False, 'error': 'empresa_id obrigatório'}), 400

        import sqlite3
        conn = sqlite3.connect(str(db_path))
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        # Buscar agendamentos (dados do cliente já estão na tabela)
        cursor.execute("""
            SELECT id, empresa_id, cliente_id, nome_cliente as cliente_nome,
                   telefone_cliente as cliente_telefone, data_hora, tipo,
                   descricao, status, observacoes, criado_em
            FROM agendamentos
            WHERE empresa_id = ?
            ORDER BY data_hora DESC
            LIMIT 100
        """, (empresa_id,))

        rows = cursor.fetchall()
        conn.close()

        # Converter para lista de dicts e formatar datas
        agendamentos = []
        for row in rows:
            a = dict(row)
            if a.get('data_hora'):
                a['data_hora'] = str(a['data_hora'])
            if a.get('criado_em'):
                a['criado_em'] = str(a['criado_em'])
            agendamentos.append(a)

        return jsonify({
            'success': True,
            'agendamentos': agendamentos,
            'total': len(agendamentos)
        })

    except Exception as e:
        print(f'[VAREJO-API] Erro ao listar agendamentos: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500


print('[VAREJO-API] Modulo carregado com sucesso')
