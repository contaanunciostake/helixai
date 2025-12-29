"""
API REST para Varejo - CRUD de Clientes, Pedidos, Agendamentos
Endpoints JSON - Compativel com SQLite (dev) e PostgreSQL (prod)
"""

from flask import Blueprint, request, jsonify
from datetime import datetime
import sys
from pathlib import Path

# Adicionar pasta raiz ao path
sys.path.append(str(Path(__file__).parent.parent.parent))

from database.models import (
    DatabaseManager, Cliente, Pedido, ItemPedido
)

# Importar db_manager global para usar PostgreSQL em producao
try:
    from backend import db_manager
except ImportError:
    db_path = Path(__file__).parent.parent / 'vendeai.db'
    db_manager = DatabaseManager(f'sqlite:///{db_path}')

varejo_api_bp = Blueprint('varejo_api', __name__, url_prefix='/api')

print('\n============================================================')
print('         VAREJO API ROUTES - MODULO CARREGADO')
print('============================================================')
print('[VAREJO API] Rotas disponiveis:')
print('[VAREJO API]   GET  /api/clientes/listar')
print('[VAREJO API]   GET  /api/pedidos/listar')
print('[VAREJO API]   GET  /api/agendamentos/listar')
print('============================================================\n')


def get_empresa_id():
    """Obter ID da empresa do request"""
    empresa_id = request.headers.get('X-Empresa-ID') or request.args.get('empresa_id')
    return int(empresa_id) if empresa_id else None


# ===================================================================
# CLIENTES API
# ===================================================================

@varejo_api_bp.route('/clientes/listar', methods=['GET'])
def listar_clientes():
    """Lista todos os clientes de uma empresa com total de compras calculado"""
    try:
        empresa_id = get_empresa_id()
        if not empresa_id:
            return jsonify({'success': False, 'error': 'empresa_id obrigatorio'}), 400

        session = db_manager.get_session()
        try:
            # Query com cálculo de total_compras e última compra baseado nos pedidos
            from sqlalchemy import text
            result = session.execute(text('''
                SELECT
                    c.id, c.nome, c.tipo, c.cpf_cnpj, c.email, c.telefone, c.celular,
                    c.endereco, c.numero, c.complemento, c.bairro, c.cidade, c.estado, c.cep,
                    c.observacoes, c.ativo,
                    COALESCE(SUM(p.total), 0) as total_compras,
                    MAX(p.criado_em) as ultima_compra,
                    COUNT(p.id) as qtd_pedidos
                FROM clientes c
                LEFT JOIN pedidos p ON p.cliente_id = c.id
                WHERE c.empresa_id = :empresa_id
                GROUP BY c.id, c.nome, c.tipo, c.cpf_cnpj, c.email, c.telefone, c.celular,
                         c.endereco, c.numero, c.complemento, c.bairro, c.cidade, c.estado, c.cep,
                         c.observacoes, c.ativo
                ORDER BY c.nome
            '''), {'empresa_id': empresa_id})

            clientes = []
            for row in result.fetchall():
                clientes.append({
                    'id': row[0],
                    'nome': row[1],
                    'tipo': row[2] or 'PF',
                    'cpf_cnpj': row[3] or '',
                    'email': row[4] or '',
                    'telefone': row[5] or '',
                    'celular': row[6] or '',
                    'endereco': row[7] or '',
                    'numero': row[8] or '',
                    'complemento': row[9] or '',
                    'bairro': row[10] or '',
                    'cidade': row[11] or '',
                    'estado': row[12] or '',
                    'cep': row[13] or '',
                    'observacoes': row[14] or '',
                    'ativo': row[15] if row[15] is not None else True,
                    'total_compras': float(row[16] or 0),
                    'ultima_compra': row[17].isoformat() if row[17] else None,
                    'qtd_pedidos': row[18] or 0
                })

            return jsonify({
                'success': True,
                'clientes': clientes,
                'total': len(clientes)
            })
        finally:
            session.close()

    except Exception as e:
        print(f'[VAREJO-API] Erro ao listar clientes: {e}')
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500


# ===================================================================
# PEDIDOS API
# ===================================================================

@varejo_api_bp.route('/pedidos/listar', methods=['GET'])
def listar_pedidos():
    """Lista todos os pedidos de uma empresa"""
    try:
        empresa_id = get_empresa_id()
        if not empresa_id:
            return jsonify({'success': False, 'error': 'empresa_id obrigatorio'}), 400

        session = db_manager.get_session()
        try:
            pedidos = session.query(Pedido).filter(
                Pedido.empresa_id == empresa_id
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


# ===================================================================
# AGENDAMENTOS API
# ===================================================================

@varejo_api_bp.route('/agendamentos/listar', methods=['GET'])
def listar_agendamentos():
    """Lista todos os agendamentos de uma empresa usando SQLite"""
    try:
        empresa_id = get_empresa_id()
        if not empresa_id:
            return jsonify({'success': False, 'error': 'empresa_id obrigatorio'}), 400

        import sqlite3
        conn = sqlite3.connect(str(db_path))
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        # Buscar agendamentos
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
