"""
API REST para Gestao de Entregas - CRM Cliente
Endpoints JSON para CRUD de entregas e entregadores
"""

from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
import json

entregas_api_bp = Blueprint('entregas_api', __name__, url_prefix='/api/entregas')

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
    """Obter conexao SQLite"""
    import sqlite3
    from pathlib import Path
    db_path = Path(__file__).parent.parent / 'vendeai.db'
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
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
    Lista entregas com filtros e paginacao (SQLite)
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

        # Query base (SQLite usa ? como placeholder)
        query = '''
            SELECT e.*
            FROM entregas e
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
        count_query = f"SELECT COUNT(*) as total FROM entregas e WHERE e.empresa_id = ?"
        count_params = [empresa_id]
        if status:
            count_query += ' AND e.status = ?'
            count_params.append(status)
        cursor.execute(count_query, count_params)
        row = cursor.fetchone()
        total = row['total'] if row else 0

        # Ordenar e paginar
        query += ' ORDER BY e.criado_em DESC LIMIT ? OFFSET ?'
        params.extend([limit, offset])

        cursor.execute(query, params)
        rows = cursor.fetchall()

        # Converter rows para lista de dicts
        entregas = []
        for row in rows:
            entrega = dict(row)
            # Formatar datas para JSON
            for key, value in entrega.items():
                if isinstance(value, datetime):
                    entrega[key] = value.isoformat()
                elif value and key.endswith('_em') and isinstance(value, str):
                    pass  # Ja e string
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
        print(f'[ENTREGAS-API] Erro ao listar entregas: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500


@entregas_api_bp.route('/<int:entrega_id>', methods=['GET'])
def obter_entrega(entrega_id):
    """
    GET /api/entregas/:id
    Obter detalhes de uma entrega (SQLite)
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
            conn.close()
            return jsonify({'success': False, 'error': 'Entrega nao encontrada'}), 404

        entrega = dict(row)
        conn.close()

        return jsonify({'success': True, 'data': entrega})

    except Exception as e:
        print(f'[ENTREGAS-API] Erro ao obter entrega: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500


@entregas_api_bp.route('/', methods=['POST'])
@entregas_api_bp.route('', methods=['POST'])
def criar_entrega():
    """
    POST /api/entregas
    Criar nova entrega (SQLite)
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
        conn.close()

        return jsonify({
            'success': True,
            'message': 'Entrega criada com sucesso',
            'entrega_id': entrega_id
        })

    except Exception as e:
        print(f'[ENTREGAS-API] Erro ao criar entrega: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500


@entregas_api_bp.route('/<int:entrega_id>', methods=['PUT'])
def atualizar_entrega(entrega_id):
    """
    PUT /api/entregas/:id
    Atualizar entrega existente (SQLite)
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
                valores.append(datetime.now().isoformat())
            elif data['status'] == 'em_transito':
                campos.append('data_saida = ?')
                valores.append(datetime.now().isoformat())
            elif data['status'] == 'entregue':
                campos.append('data_entrega = ?')
                valores.append(datetime.now().isoformat())
            elif data['status'] == 'cancelada':
                campos.append('data_cancelamento = ?')
                valores.append(datetime.now().isoformat())

        if not campos:
            conn.close()
            return jsonify({'success': False, 'error': 'Nenhum campo para atualizar'}), 400

        query = f"UPDATE entregas SET {', '.join(campos)} WHERE id = ? AND empresa_id = ?"
        valores.extend([entrega_id, empresa_id])

        cursor.execute(query, valores)
        conn.commit()
        rowcount = cursor.rowcount
        conn.close()

        if rowcount == 0:
            return jsonify({'success': False, 'error': 'Entrega nao encontrada'}), 404

        return jsonify({
            'success': True,
            'message': 'Entrega atualizada com sucesso'
        })

    except Exception as e:
        print(f'[ENTREGAS-API] Erro ao atualizar entrega: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500


@entregas_api_bp.route('/<int:entrega_id>', methods=['DELETE'])
def deletar_entrega(entrega_id):
    """
    DELETE /api/entregas/:id
    Deletar entrega (SQLite)
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
        rowcount = cursor.rowcount
        conn.close()

        if rowcount == 0:
            return jsonify({'success': False, 'error': 'Entrega nao encontrada'}), 404

        return jsonify({
            'success': True,
            'message': 'Entrega removida com sucesso'
        })

    except Exception as e:
        print(f'[ENTREGAS-API] Erro ao deletar entrega: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500


# ══════════════════════════════════════════════════════════════
# ESTATISTICAS
# ══════════════════════════════════════════════════════════════

@entregas_api_bp.route('/stats', methods=['GET'])
def estatisticas_entregas():
    """
    GET /api/entregas/stats?empresa_id=X
    Estatisticas de entregas (SQLite)
    """
    try:
        empresa_id = get_empresa_id()
        if not empresa_id:
            return jsonify({'success': False, 'error': 'Empresa nao identificada'}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        hoje = datetime.now().strftime('%Y-%m-%d')
        mes_atual = datetime.now().strftime('%Y-%m')

        # Total por status
        cursor.execute('''
            SELECT status, COUNT(*) as quantidade
            FROM entregas
            WHERE empresa_id = ?
            GROUP BY status
        ''', (empresa_id,))
        rows = cursor.fetchall()
        por_status = {row['status']: row['quantidade'] for row in rows if row['status']}

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

        # Valor total do mes (SQLite: strftime para extrair ano-mes)
        cursor.execute('''
            SELECT COALESCE(SUM(valor_pedido), 0) as total
            FROM entregas
            WHERE empresa_id = ?
            AND status = 'entregue'
            AND strftime('%Y-%m', data_entrega) = ?
        ''', (empresa_id, mes_atual))
        row = cursor.fetchone()
        valor_mes = float(row['total']) if row and row['total'] else 0.0

        conn.close()

        return jsonify({
            'success': True,
            'data': {
                'por_status': por_status,
                'hoje_total': hoje_total,
                'pendentes': pendentes,
                'em_transito': em_transito,
                'entregues_hoje': entregues_hoje,
                'valor_mes': valor_mes
            }
        })

    except Exception as e:
        print(f'[ENTREGAS-API] Erro ao obter estatisticas: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500


# ══════════════════════════════════════════════════════════════
# ENTREGADORES
# ══════════════════════════════════════════════════════════════

@entregas_api_bp.route('/entregadores', methods=['GET'])
def listar_entregadores():
    """
    GET /api/entregas/entregadores?empresa_id=X
    Lista entregadores da empresa (SQLite)
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
        entregadores = [dict(row) for row in rows]
        conn.close()

        return jsonify({
            'success': True,
            'data': entregadores
        })

    except Exception as e:
        print(f'[ENTREGAS-API] Erro ao listar entregadores: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500


@entregas_api_bp.route('/entregadores', methods=['POST'])
def criar_entregador():
    """
    POST /api/entregas/entregadores
    Criar novo entregador (SQLite)
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
        conn.close()

        return jsonify({
            'success': True,
            'message': 'Entregador cadastrado com sucesso',
            'entregador_id': entregador_id
        })

    except Exception as e:
        print(f'[ENTREGAS-API] Erro ao criar entregador: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500


@entregas_api_bp.route('/entregadores/<int:entregador_id>', methods=['PUT'])
def atualizar_entregador(entregador_id):
    """
    PUT /api/entregas/entregadores/:id
    Atualizar entregador (SQLite)
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
            conn.close()
            return jsonify({'success': False, 'error': 'Nenhum campo para atualizar'}), 400

        query = f"UPDATE entregadores SET {', '.join(campos)} WHERE id = ? AND empresa_id = ?"
        valores.extend([entregador_id, empresa_id])

        cursor.execute(query, valores)
        conn.commit()
        conn.close()

        return jsonify({
            'success': True,
            'message': 'Entregador atualizado com sucesso'
        })

    except Exception as e:
        print(f'[ENTREGAS-API] Erro ao atualizar entregador: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500


@entregas_api_bp.route('/entregadores/<int:entregador_id>', methods=['DELETE'])
def deletar_entregador(entregador_id):
    """
    DELETE /api/entregas/entregadores/:id
    Desativar entregador - soft delete (SQLite)
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
        conn.close()

        return jsonify({
            'success': True,
            'message': 'Entregador desativado com sucesso'
        })

    except Exception as e:
        print(f'[ENTREGAS-API] Erro ao deletar entregador: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500


# ══════════════════════════════════════════════════════════════
# ENDPOINT PARA BOT WHATSAPP
# ══════════════════════════════════════════════════════════════

@entregas_api_bp.route('/bot/registrar', methods=['POST'])
def registrar_entrega_bot():
    """
    POST /api/entregas/bot/registrar
    Endpoint para o bot registrar entregas automaticamente (SQLite)
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
                endereco_entrega, numero, complemento, bairro, cidade, estado, cep, ponto_referencia,
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
        conn.close()

        print(f'[ENTREGAS-API] Entrega registrada pelo bot: ID={entrega_id}, Cliente={data.get("cliente_nome")}')

        return jsonify({
            'success': True,
            'message': 'Entrega registrada pelo bot',
            'entrega_id': entrega_id
        })

    except Exception as e:
        print(f'[ENTREGAS-API] Erro ao registrar entrega do bot: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500
