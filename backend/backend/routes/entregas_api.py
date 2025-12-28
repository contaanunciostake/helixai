"""
API REST para Gestao de Entregas - CRM Cliente
Endpoints JSON para CRUD de entregas e entregadores
"""

from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
import json

entregas_api_bp = Blueprint('entregas_api', __name__, url_prefix='/api/entregas')

# CORS handler para todas as rotas deste blueprint
@entregas_api_bp.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = request.headers.get('Origin', '*')
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Empresa-ID, X-API-Key'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response

# Handler para preflight OPTIONS requests
@entregas_api_bp.route('/<path:path>', methods=['OPTIONS'])
@entregas_api_bp.route('/', methods=['OPTIONS'])
@entregas_api_bp.route('', methods=['OPTIONS'])
def handle_options(path=''):
    return '', 204

print('\n============================================================')
print('         ENTREGAS API ROUTES - MODULO CARREGADO')
print('============================================================')
print('[ENTREGAS API] Rotas disponiveis:')
print('[ENTREGAS API]   GET  /api/entregas?empresa_id=X')
print('[ENTREGAS API]   GET  /api/entregas/:id')
print('[ENTREGAS API]   POST /api/entregas')
print('[ENTREGAS API]   PUT  /api/entregas/:id')
print('[ENTREGAS API]   DELETE /api/entregas/:id')
print('[ENTREGAS API]   GET  /api/entregas/stats')
print('[ENTREGAS API]   GET  /api/entregas/entregadores')
print('[ENTREGAS API]   POST /api/entregas/entregadores')
print('============================================================\n')


def get_db_connection():
    """Obter conexao SQLite - usando o mesmo banco do backend principal"""
    import sqlite3
    from pathlib import Path

    db_path = Path(__file__).parent.parent / 'vendeai.db'
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row  # Para retornar dicts
    return conn


def get_empresa_id():
    """Obter ID da empresa do request"""
    empresa_id = request.headers.get('X-Empresa-ID') or request.args.get('empresa_id')
    return int(empresa_id) if empresa_id else None


# ══════════════════════════════════════════════════════════════
# ENTREGAS - CRUD
# ══════════════════════════════════════════════════════════════

@entregas_api_bp.route('/', methods=['GET'])
@entregas_api_bp.route('', methods=['GET'])
def listar_entregas():
    """
    GET /api/entregas?empresa_id=X&status=pendente&page=1&limit=20
    Lista entregas com filtros e paginacao
    """
    try:
        empresa_id = get_empresa_id()
        if not empresa_id:
            return jsonify({'success': False, 'error': 'Empresa nao identificada'}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        # Parametros de filtro
        status = request.args.get('status', '').strip()
        entregador_id = request.args.get('entregador_id')
        data_inicio = request.args.get('data_inicio')
        data_fim = request.args.get('data_fim')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        offset = (page - 1) * limit

        # Query base - adaptada para estrutura SQLite
        query = '''
            SELECT e.id, e.empresa_id, e.pedido_id, e.cliente_id, e.entregador_id,
                   e.endereco_entrega as endereco, e.status,
                   e.data_prevista, e.data_entrega, e.observacoes,
                   e.criado_em as data_criacao,
                   c.nome as cliente_nome, c.telefone as cliente_telefone,
                   ent.nome as entregador_nome,
                   ent.telefone as entregador_telefone,
                   ent.tipo_veiculo as entregador_veiculo,
                   ent.placa_veiculo as entregador_placa
            FROM entregas e
            LEFT JOIN clientes c ON e.cliente_id = c.id
            LEFT JOIN entregadores ent ON e.entregador_id = ent.id
            WHERE e.empresa_id = ?
        '''
        params = [empresa_id]

        # Filtros
        if status:
            query += ' AND e.status = ?'
            params.append(status)

        if entregador_id:
            query += ' AND e.entregador_id = ?'
            params.append(int(entregador_id))

        if data_inicio:
            query += ' AND DATE(e.criado_em) >= ?'
            params.append(data_inicio)

        if data_fim:
            query += ' AND DATE(e.criado_em) <= ?'
            params.append(data_fim)

        # Contar total
        count_query = f"SELECT COUNT(*) as total FROM ({query})"
        cursor.execute(count_query, params)
        row = cursor.fetchone()
        total = row['total'] if row else 0

        # Ordenar e paginar
        query += ' ORDER BY e.criado_em DESC LIMIT ? OFFSET ?'
        params.extend([limit, offset])

        cursor.execute(query, params)
        rows = cursor.fetchall()

        # Converter sqlite3.Row para dict
        entregas = []
        for row in rows:
            entrega = dict(row)
            # Formatar datas para JSON
            for key, value in entrega.items():
                if isinstance(value, datetime):
                    entrega[key] = value.isoformat()
                elif isinstance(value, timedelta):
                    entrega[key] = str(value)
            entregas.append(entrega)

        conn.close()

        return jsonify({
            'success': True,
            'data': {
                'entregas': entregas,
                'pagination': {
                    'page': page,
                    'limit': limit,
                    'total': total,
                    'pages': (total + limit - 1) // limit
                }
            }
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@entregas_api_bp.route('/<int:entrega_id>', methods=['GET'])
def obter_entrega(entrega_id):
    """
    GET /api/entregas/:id
    Obter detalhes de uma entrega
    """
    try:
        empresa_id = get_empresa_id()
        if not empresa_id:
            return jsonify({'success': False, 'error': 'Empresa nao identificada'}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute('''
            SELECT e.*,
                   ent.nome as entregador_nome,
                   ent.telefone as entregador_telefone,
                   ent.whatsapp as entregador_whatsapp,
                   ent.tipo_veiculo as entregador_veiculo,
                   ent.placa_veiculo as entregador_placa
            FROM entregas e
            LEFT JOIN entregadores ent ON e.entregador_id = ent.id
            WHERE e.id = ? AND e.empresa_id = ?
        ''', (entrega_id, empresa_id))

        row = cursor.fetchone()

        if not row:
            return jsonify({'success': False, 'error': 'Entrega nao encontrada'}), 404

        # Converter sqlite3.Row para dict
        entrega = dict(row)

        # Formatar datas
        for key, value in entrega.items():
            if isinstance(value, datetime):
                entrega[key] = value.isoformat()
            elif isinstance(value, timedelta):
                entrega[key] = str(value)

        conn.close()

        return jsonify({'success': True, 'data': entrega})

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@entregas_api_bp.route('/', methods=['POST'])
@entregas_api_bp.route('', methods=['POST'])
def criar_entrega():
    """
    POST /api/entregas
    Criar nova entrega
    """
    try:
        empresa_id = get_empresa_id()
        if not empresa_id:
            return jsonify({'success': False, 'error': 'Empresa nao identificada'}), 400

        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'Dados nao fornecidos'}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute('''
            INSERT INTO entregas (
                empresa_id, pedido_id, cliente_id, entregador_id,
                cliente_nome, cliente_telefone, cliente_whatsapp,
                endereco, numero, complemento, bairro, cidade, estado, cep, ponto_referencia,
                descricao_itens, quantidade_volumes, peso_total, valor_pedido, valor_frete,
                forma_pagamento, troco_para, status, prioridade, data_agendada, hora_agendada,
                observacoes, origem, conversa_id
            ) VALUES (
                ?, ?, ?, ?,
                ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?,
                ?, ?, ?
            )
        ''', (
            empresa_id,
            data.get('pedido_id'),
            data.get('cliente_id'),
            data.get('entregador_id'),
            data.get('cliente_nome', ''),
            data.get('cliente_telefone', ''),
            data.get('cliente_whatsapp', ''),
            data.get('endereco', ''),
            data.get('numero', ''),
            data.get('complemento', ''),
            data.get('bairro', ''),
            data.get('cidade', ''),
            data.get('estado', ''),
            data.get('cep', ''),
            data.get('ponto_referencia', ''),
            data.get('descricao_itens', ''),
            data.get('quantidade_volumes', 1),
            data.get('peso_total'),
            data.get('valor_pedido'),
            data.get('valor_frete', 0),
            data.get('forma_pagamento', 'pago'),
            data.get('troco_para'),
            data.get('status', 'pendente'),
            data.get('prioridade', 'normal'),
            data.get('data_agendada'),
            data.get('hora_agendada'),
            data.get('observacoes', ''),
            data.get('origem', 'manual'),
            data.get('conversa_id')
        ))

        conn.commit()
        entrega_id = cursor.lastrowid

        cursor.close()
        conn.close()

        return jsonify({
            'success': True,
            'message': 'Entrega criada com sucesso',
            'entrega_id': entrega_id
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@entregas_api_bp.route('/<int:entrega_id>', methods=['PUT'])
def atualizar_entrega(entrega_id):
    """
    PUT /api/entregas/:id
    Atualizar entrega existente
    """
    try:
        empresa_id = get_empresa_id()
        if not empresa_id:
            return jsonify({'success': False, 'error': 'Empresa nao identificada'}), 400

        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'Dados nao fornecidos'}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        # Construir query dinamica
        campos = []
        valores = []

        campos_permitidos = [
            'entregador_id', 'cliente_nome', 'cliente_telefone', 'cliente_whatsapp',
            'endereco', 'numero', 'complemento', 'bairro', 'cidade', 'estado', 'cep',
            'ponto_referencia', 'descricao_itens', 'quantidade_volumes', 'peso_total',
            'valor_pedido', 'valor_frete', 'forma_pagamento', 'troco_para',
            'status', 'prioridade', 'data_agendada', 'hora_agendada',
            'observacoes', 'motivo_cancelamento', 'foto_comprovante',
            'avaliacao_cliente', 'comentario_cliente'
        ]

        for campo in campos_permitidos:
            if campo in data:
                campos.append(f'{campo} = ?')
                valores.append(data[campo])

        # Atualizar timestamps baseado no status
        if 'status' in data:
            if data['status'] == 'aguardando_coleta':
                campos.append('data_coleta = ?')
                valores.append(datetime.now())
            elif data['status'] == 'em_transito':
                campos.append('data_saida = ?')
                valores.append(datetime.now())
            elif data['status'] == 'entregue':
                campos.append('data_entrega = ?')
                valores.append(datetime.now())
            elif data['status'] == 'cancelada':
                campos.append('data_cancelamento = ?')
                valores.append(datetime.now())

        if not campos:
            return jsonify({'success': False, 'error': 'Nenhum campo para atualizar'}), 400

        query = f"UPDATE entregas SET {', '.join(campos)} WHERE id = ? AND empresa_id = ?"
        valores.extend([entrega_id, empresa_id])

        cursor.execute(query, valores)
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({'success': False, 'error': 'Entrega nao encontrada'}), 404

        cursor.close()
        conn.close()

        return jsonify({
            'success': True,
            'message': 'Entrega atualizada com sucesso'
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@entregas_api_bp.route('/<int:entrega_id>', methods=['DELETE'])
def deletar_entrega(entrega_id):
    """
    DELETE /api/entregas/:id
    Deletar entrega
    """
    try:
        empresa_id = get_empresa_id()
        if not empresa_id:
            return jsonify({'success': False, 'error': 'Empresa nao identificada'}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            'DELETE FROM entregas WHERE id = ? AND empresa_id = ?',
            (entrega_id, empresa_id)
        )
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({'success': False, 'error': 'Entrega nao encontrada'}), 404

        cursor.close()
        conn.close()

        return jsonify({
            'success': True,
            'message': 'Entrega removida com sucesso'
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# ══════════════════════════════════════════════════════════════
# ESTATISTICAS
# ══════════════════════════════════════════════════════════════

@entregas_api_bp.route('/stats', methods=['GET'])
def estatisticas_entregas():
    """
    GET /api/entregas/stats?empresa_id=X
    Estatisticas de entregas
    """
    try:
        empresa_id = get_empresa_id()
        if not empresa_id:
            return jsonify({'success': False, 'error': 'Empresa nao identificada'}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        hoje = datetime.now().date()

        # Total por status
        cursor.execute('''
            SELECT status, COUNT(*) as quantidade
            FROM entregas
            WHERE empresa_id = ?
            GROUP BY status
        ''', (empresa_id,))
        por_status = {row['status']: row['quantidade'] for row in cursor.fetchall()}

        # Total de hoje
        cursor.execute('''
            SELECT COUNT(*) as total
            FROM entregas
            WHERE empresa_id = ? AND DATE(criado_em) = ?
        ''', (empresa_id, hoje))
        row = cursor.fetchone()
        hoje_total = row['total'] if row else 0

        # Entregas pendentes
        cursor.execute('''
            SELECT COUNT(*) as total
            FROM entregas
            WHERE empresa_id = ? AND status IN ('pendente', 'aguardando_coleta')
        ''', (empresa_id,))
        row = cursor.fetchone()
        pendentes = row['total'] if row else 0

        # Em transito
        cursor.execute('''
            SELECT COUNT(*) as total
            FROM entregas
            WHERE empresa_id = ? AND status = 'em_transito'
        ''', (empresa_id,))
        row = cursor.fetchone()
        em_transito = row['total'] if row else 0

        # Entregues hoje
        cursor.execute('''
            SELECT COUNT(*) as total
            FROM entregas
            WHERE empresa_id = ? AND status = 'entregue' AND DATE(data_entrega) = ?
        ''', (empresa_id, hoje))
        row = cursor.fetchone()
        entregues_hoje = row['total'] if row else 0

        # Total de entregas do mes
        cursor.execute('''
            SELECT COUNT(*) as total
            FROM entregas
            WHERE empresa_id = ?
            AND status = 'entregue'
            AND strftime('%Y-%m', data_entrega) = strftime('%Y-%m', 'now')
        ''', (empresa_id,))
        row = cursor.fetchone()
        entregas_mes = row['total'] if row else 0

        conn.close()

        return jsonify({
            'success': True,
            'data': {
                'por_status': por_status,
                'hoje_total': hoje_total,
                'pendentes': pendentes,
                'em_transito': em_transito,
                'entregues_hoje': entregues_hoje,
                'entregas_mes': entregas_mes
            }
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# ══════════════════════════════════════════════════════════════
# ENTREGADORES
# ══════════════════════════════════════════════════════════════

@entregas_api_bp.route('/entregadores', methods=['GET'])
def listar_entregadores():
    """
    GET /api/entregas/entregadores?empresa_id=X
    Lista entregadores da empresa
    """
    try:
        empresa_id = get_empresa_id()
        if not empresa_id:
            return jsonify({'success': False, 'error': 'Empresa nao identificada'}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute('''
            SELECT * FROM entregadores
            WHERE empresa_id = ? AND ativo = 1
            ORDER BY nome
        ''', (empresa_id,))

        rows = cursor.fetchall()

        # Converter sqlite3.Row para dict e formatar datas
        entregadores = []
        for row in rows:
            ent = dict(row)
            for key, value in ent.items():
                if isinstance(value, datetime):
                    ent[key] = value.isoformat()
            entregadores.append(ent)

        conn.close()

        return jsonify({
            'success': True,
            'data': entregadores
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@entregas_api_bp.route('/entregadores', methods=['POST'])
def criar_entregador():
    """
    POST /api/entregas/entregadores
    Criar novo entregador
    """
    try:
        empresa_id = get_empresa_id()
        if not empresa_id:
            return jsonify({'success': False, 'error': 'Empresa nao identificada'}), 400

        data = request.get_json()
        if not data or not data.get('nome'):
            return jsonify({'success': False, 'error': 'Nome e obrigatorio'}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute('''
            INSERT INTO entregadores (
                empresa_id, nome, telefone, whatsapp, email, documento,
                tipo_veiculo, placa_veiculo, foto_url, ativo, disponivel
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1)
        ''', (
            empresa_id,
            data.get('nome'),
            data.get('telefone'),
            data.get('whatsapp'),
            data.get('email'),
            data.get('documento'),
            data.get('tipo_veiculo', 'moto'),
            data.get('placa_veiculo'),
            data.get('foto_url')
        ))

        conn.commit()
        entregador_id = cursor.lastrowid

        cursor.close()
        conn.close()

        return jsonify({
            'success': True,
            'message': 'Entregador cadastrado com sucesso',
            'entregador_id': entregador_id
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@entregas_api_bp.route('/entregadores/<int:entregador_id>', methods=['PUT'])
def atualizar_entregador(entregador_id):
    """
    PUT /api/entregas/entregadores/:id
    Atualizar entregador
    """
    try:
        empresa_id = get_empresa_id()
        if not empresa_id:
            return jsonify({'success': False, 'error': 'Empresa nao identificada'}), 400

        data = request.get_json()

        conn = get_db_connection()
        cursor = conn.cursor()

        campos = []
        valores = []

        campos_permitidos = [
            'nome', 'telefone', 'whatsapp', 'email', 'documento',
            'tipo_veiculo', 'placa_veiculo', 'foto_url', 'ativo', 'disponivel'
        ]

        for campo in campos_permitidos:
            if campo in data:
                campos.append(f'{campo} = ?')
                valores.append(data[campo])

        if not campos:
            return jsonify({'success': False, 'error': 'Nenhum campo para atualizar'}), 400

        query = f"UPDATE entregadores SET {', '.join(campos)} WHERE id = ? AND empresa_id = ?"
        valores.extend([entregador_id, empresa_id])

        cursor.execute(query, valores)
        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({
            'success': True,
            'message': 'Entregador atualizado com sucesso'
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@entregas_api_bp.route('/entregadores/<int:entregador_id>', methods=['DELETE'])
def deletar_entregador(entregador_id):
    """
    DELETE /api/entregas/entregadores/:id
    Desativar entregador (soft delete)
    """
    try:
        empresa_id = get_empresa_id()
        if not empresa_id:
            return jsonify({'success': False, 'error': 'Empresa nao identificada'}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            'UPDATE entregadores SET ativo = 0 WHERE id = ? AND empresa_id = ?',
            (entregador_id, empresa_id)
        )
        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({
            'success': True,
            'message': 'Entregador desativado com sucesso'
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# ══════════════════════════════════════════════════════════════
# ENDPOINT PARA BOT WHATSAPP
# ══════════════════════════════════════════════════════════════

@entregas_api_bp.route('/bot/registrar', methods=['POST'])
def registrar_entrega_bot():
    """
    POST /api/entregas/bot/registrar
    Endpoint para o bot registrar entregas automaticamente
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'Dados nao fornecidos'}), 400

        empresa_id = data.get('empresa_id')
        if not empresa_id:
            return jsonify({'success': False, 'error': 'empresa_id obrigatorio'}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute('''
            INSERT INTO entregas (
                empresa_id, cliente_nome, cliente_telefone, cliente_whatsapp,
                endereco, numero, complemento, bairro, cidade, estado, cep, ponto_referencia,
                descricao_itens, valor_pedido, valor_frete, forma_pagamento,
                status, prioridade, data_agendada, hora_agendada,
                observacoes, origem, conversa_id
            ) VALUES (
                ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?, ?, ?,
                ?, 'bot_whatsapp', ?
            )
        ''', (
            empresa_id,
            data.get('cliente_nome', 'Cliente WhatsApp'),
            data.get('cliente_telefone', ''),
            data.get('cliente_whatsapp', data.get('telefone', '')),
            data.get('endereco', ''),
            data.get('numero', ''),
            data.get('complemento', ''),
            data.get('bairro', ''),
            data.get('cidade', ''),
            data.get('estado', ''),
            data.get('cep', ''),
            data.get('ponto_referencia', ''),
            data.get('descricao_itens', data.get('produtos', '')),
            data.get('valor_pedido', data.get('valor_total')),
            data.get('valor_frete', 0),
            data.get('forma_pagamento', 'a_combinar'),
            'pendente',
            data.get('prioridade', 'normal'),
            data.get('data_agendada'),
            data.get('hora_agendada'),
            data.get('observacoes', ''),
            data.get('conversa_id', data.get('telefone', ''))
        ))

        conn.commit()
        entrega_id = cursor.lastrowid

        cursor.close()
        conn.close()

        return jsonify({
            'success': True,
            'message': 'Entrega registrada pelo bot',
            'entrega_id': entrega_id
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
