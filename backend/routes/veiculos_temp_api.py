"""
API Temporária de Veículos - Acesso direto ao SQLite
Enquanto produtos_api não carrega, usar esta rota
"""

from flask import Blueprint, jsonify, request
import sqlite3
from pathlib import Path
import json

veiculos_temp_bp = Blueprint('veiculos_temp', __name__, url_prefix='/api/veiculos-temp')

# Print de debug
print('\n============================================================')
print('         VEICULOS TEMP API - MODULO CARREGADO')
print('============================================================')
print('[VEICULOS TEMP] Rotas disponíveis:')
print('[VEICULOS TEMP]   GET  /api/veiculos-temp')
print('[VEICULOS TEMP]   GET  /api/veiculos-temp/stats')
print('============================================================\n')

def get_db_path():
    """Retorna caminho do banco SQLite"""
    return Path(__file__).parent.parent.parent / 'vendeai.db'

@veiculos_temp_bp.route('/', methods=['GET'])
def listar_veiculos():
    """Lista todos os veículos"""
    try:
        empresa_id = request.args.get('empresa_id', 1, type=int)
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 20, type=int)

        db_path = get_db_path()
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        # Contar total
        cursor.execute('SELECT COUNT(*) as total FROM veiculos WHERE empresa_id = ?', (empresa_id,))
        total = cursor.fetchone()['total']

        # Buscar veículos
        offset = (page - 1) * limit
        cursor.execute('''
            SELECT
                id, marca, modelo, versao, ano_modelo, ano_fabricacao,
                preco, preco_anterior, quilometragem, cor, combustivel,
                cambio, motor, portas, imagem_principal, descricao,
                disponivel, destaque, oferta_especial, vendido,
                cidade, estado, codigo_interno, sku, criado_em
            FROM veiculos
            WHERE empresa_id = ?
            ORDER BY criado_em DESC
            LIMIT ? OFFSET ?
        ''', (empresa_id, limit, offset))

        rows = cursor.fetchall()

        veiculos = []
        for row in rows:
            veiculos.append({
                'id': row['id'],
                'marca': row['marca'],
                'modelo': row['modelo'],
                'versao': row['versao'],
                'ano_modelo': row['ano_modelo'],
                'ano_fabricacao': row['ano_fabricacao'],
                'preco': row['preco'],
                'preco_anterior': row['preco_anterior'],
                'quilometragem': row['quilometragem'],
                'cor': row['cor'],
                'combustivel': row['combustivel'],
                'cambio': row['cambio'],
                'motor': row['motor'],
                'portas': row['portas'],
                'imagem_principal': row['imagem_principal'],
                'descricao': row['descricao'],
                'disponivel': bool(row['disponivel']),
                'destaque': bool(row['destaque']),
                'oferta_especial': bool(row['oferta_especial']),
                'vendido': bool(row['vendido']),
                'cidade': row['cidade'],
                'estado': row['estado'],
                'codigo_interno': row['codigo_interno'],
                'sku': row['sku'],
                'criado_em': row['criado_em']
            })

        conn.close()

        return jsonify({
            'success': True,
            'data': veiculos,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total,
                'pages': (total + limit - 1) // limit
            }
        })

    except Exception as e:
        print(f"[VEICULOS TEMP] Erro: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@veiculos_temp_bp.route('/stats', methods=['GET'])
def get_stats():
    """Retorna estatísticas"""
    try:
        empresa_id = request.args.get('empresa_id', 1, type=int)

        db_path = get_db_path()
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        cursor.execute('SELECT COUNT(*) FROM veiculos WHERE empresa_id = ?', (empresa_id,))
        total = cursor.fetchone()[0]

        cursor.execute('SELECT COUNT(*) FROM veiculos WHERE empresa_id = ? AND disponivel = 1', (empresa_id,))
        disponiveis = cursor.fetchone()[0]

        cursor.execute('SELECT COUNT(*) FROM veiculos WHERE empresa_id = ? AND vendido = 1', (empresa_id,))
        vendidos = cursor.fetchone()[0]

        cursor.execute('SELECT COUNT(*) FROM veiculos WHERE empresa_id = ? AND destaque = 1', (empresa_id,))
        destaques = cursor.fetchone()[0]

        conn.close()

        return jsonify({
            'success': True,
            'stats': {
                'total': total,
                'disponiveis': disponiveis,
                'vendidos': vendidos,
                'destaques': destaques
            }
        })

    except Exception as e:
        print(f"[VEICULOS TEMP] Erro: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500
