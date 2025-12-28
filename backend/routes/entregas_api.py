"""
API REST para Gestao de Entregas - CRM Cliente
Endpoints JSON para CRUD de entregas e entregadores
Compativel com SQLite (dev) e PostgreSQL (producao)
"""

from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from sqlalchemy import text
import json
import os

# Importar db_manager do backend
try:
    from backend import db_manager
except ImportError:
    from database.models import DatabaseManager
    db_manager = DatabaseManager('sqlite:///vendeai.db')

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


def get_empresa_id():
    """Obter ID da empresa do request"""
    empresa_id = request.headers.get('X-Empresa-ID') or request.args.get('empresa_id')
    return int(empresa_id) if empresa_id else None


def row_to_dict(row, keys):
    """Converter Row para dicionario"""
    if hasattr(row, '_mapping'):
        return dict(row._mapping)
    elif hasattr(row, 'keys'):
        return dict(row)
    else:
        return dict(zip(keys, row))


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
    session = db_manager.get_session()
    try:
        empresa_id = get_empresa_id()
        if not empresa_id:
            return jsonify({'success': False, 'error': 'Empresa nao identificada'}), 400

        # Parametros de filtro
        status = request.args.get('status', '').strip()
        entregador_id = request.args.get('entregador_id')
        data_inicio = request.args.get('data_inicio')
        data_fim = request.args.get('data_fim')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        offset = (page - 1) * limit

        # Query base
        query = "SELECT * FROM entregas WHERE empresa_id = :empresa_id"
        params = {'empresa_id': empresa_id}

        # Filtros
        if status:
            query += ' AND status = :status'
            params['status'] = status

        if entregador_id:
            query += ' AND entregador_id = :entregador_id'
            params['entregador_id'] = int(entregador_id)

        if data_inicio:
            query += ' AND DATE(criado_em) >= :data_inicio'
            params['data_inicio'] = data_inicio

        if data_fim:
            query += ' AND DATE(criado_em) <= :data_fim'
            params['data_fim'] = data_fim

        # Contar total
        count_query = "SELECT COUNT(*) as total FROM entregas WHERE empresa_id = :empresa_id"
        count_params = {'empresa_id': empresa_id}
        if status:
            count_query += ' AND status = :status'
            count_params['status'] = status
        result = session.execute(text(count_query), count_params)
        total = result.fetchone()[0]

        # Ordenar e paginar
        query += ' ORDER BY criado_em DESC LIMIT :limit OFFSET :offset'
        params['limit'] = limit
        params['offset'] = offset

        result = session.execute(text(query), params)
        rows = result.fetchall()

        # Converter rows para lista de dicts
        entregas = []
        if rows:
            keys = result.keys()
            for row in rows:
                entrega = row_to_dict(row, keys)
                entregas.append(entrega)

        return jsonify({
            'success': True,
            'data': {
                'entregas': entregas,
                'pagination': {
                    'page': page,
                    'limit': limit,
                    'total': total,
                    'pages': (total + limit - 1) // limit if limit else 1
                }
            }
        })

    except Exception as e:
        print(f'[ENTREGAS-API] Erro ao listar entregas: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@entregas_api_bp.route('/<int:entrega_id>', methods=['GET'])
def obter_entrega(entrega_id):
    """
    GET /api/entregas/:id
    Obter detalhes de uma entrega
    """
    session = db_manager.get_session()
    try:
        empresa_id = get_empresa_id()
        if not empresa_id:
            return jsonify({'success': False, 'error': 'Empresa nao identificada'}), 400

        query = text('''
            SELECT e.*,
                   ent.nome as entregador_nome,
                   ent.telefone as entregador_telefone,
                   ent.tipo_veiculo as entregador_veiculo,
                   ent.placa_veiculo as entregador_placa
            FROM entregas e
            LEFT JOIN entregadores ent ON e.entregador_id = ent.id
            WHERE e.id = :entrega_id AND e.empresa_id = :empresa_id
        ''')

        result = session.execute(query, {'entrega_id': entrega_id, 'empresa_id': empresa_id})
        row = result.fetchone()

        if not row:
            return jsonify({'success': False, 'error': 'Entrega nao encontrada'}), 404

        entrega = row_to_dict(row, result.keys())

        return jsonify({'success': True, 'data': entrega})

    except Exception as e:
        print(f'[ENTREGAS-API] Erro ao obter entrega: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@entregas_api_bp.route('/', methods=['POST'])
@entregas_api_bp.route('', methods=['POST'])
def criar_entrega():
    """
    POST /api/entregas
    Criar nova entrega
    """
    session = db_manager.get_session()
    try:
        empresa_id = get_empresa_id()
        if not empresa_id:
            return jsonify({'success': False, 'error': 'Empresa nao identificada'}), 400

        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'Dados nao fornecidos'}), 400

        query = text('''
            INSERT INTO entregas (
                empresa_id, pedido_id, cliente_id, entregador_id,
                cliente_nome, cliente_telefone, cliente_whatsapp,
                endereco_entrega, numero, complemento, bairro, cidade, estado, cep, ponto_referencia,
                descricao_itens, valor_pedido, valor_frete,
                forma_pagamento, status, prioridade, data_agendada, hora_agendada,
                observacoes, origem, conversa_id
            ) VALUES (
                :empresa_id, :pedido_id, :cliente_id, :entregador_id,
                :cliente_nome, :cliente_telefone, :cliente_whatsapp,
                :endereco_entrega, :numero, :complemento, :bairro, :cidade, :estado, :cep, :ponto_referencia,
                :descricao_itens, :valor_pedido, :valor_frete,
                :forma_pagamento, :status, :prioridade, :data_agendada, :hora_agendada,
                :observacoes, :origem, :conversa_id
            )
        ''')

        session.execute(query, {
            'empresa_id': empresa_id,
            'pedido_id': data.get('pedido_id'),
            'cliente_id': data.get('cliente_id'),
            'entregador_id': data.get('entregador_id'),
            'cliente_nome': data.get('cliente_nome', ''),
            'cliente_telefone': data.get('cliente_telefone', ''),
            'cliente_whatsapp': data.get('cliente_whatsapp', ''),
            'endereco_entrega': data.get('endereco', data.get('endereco_entrega', '')),
            'numero': data.get('numero', ''),
            'complemento': data.get('complemento', ''),
            'bairro': data.get('bairro', ''),
            'cidade': data.get('cidade', ''),
            'estado': data.get('estado', ''),
            'cep': data.get('cep', ''),
            'ponto_referencia': data.get('ponto_referencia', ''),
            'descricao_itens': data.get('descricao_itens', ''),
            'valor_pedido': data.get('valor_pedido'),
            'valor_frete': data.get('valor_frete', 0),
            'forma_pagamento': data.get('forma_pagamento', 'pago'),
            'status': data.get('status', 'pendente'),
            'prioridade': data.get('prioridade', 'normal'),
            'data_agendada': data.get('data_agendada'),
            'hora_agendada': data.get('hora_agendada'),
            'observacoes': data.get('observacoes', ''),
            'origem': data.get('origem', 'manual'),
            'conversa_id': data.get('conversa_id')
        })

        session.commit()

        # Obter ID inserido (PostgreSQL e SQLite tem sintaxes diferentes)
        result = session.execute(text("SELECT lastval()")) if 'postgresql' in str(db_manager.engine.url) else session.execute(text("SELECT last_insert_rowid()"))
        entrega_id = result.fetchone()[0]

        return jsonify({
            'success': True,
            'message': 'Entrega criada com sucesso',
            'entrega_id': entrega_id
        })

    except Exception as e:
        session.rollback()
        print(f'[ENTREGAS-API] Erro ao criar entrega: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@entregas_api_bp.route('/<int:entrega_id>', methods=['PUT'])
def atualizar_entrega(entrega_id):
    """
    PUT /api/entregas/:id
    Atualizar entrega existente
    """
    session = db_manager.get_session()
    try:
        empresa_id = get_empresa_id()
        if not empresa_id:
            return jsonify({'success': False, 'error': 'Empresa nao identificada'}), 400

        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'Dados nao fornecidos'}), 400

        # Construir query dinamica
        campos = []
        params = {'entrega_id': entrega_id, 'empresa_id': empresa_id}

        campos_permitidos = [
            'entregador_id', 'cliente_nome', 'cliente_telefone', 'cliente_whatsapp',
            'endereco_entrega', 'numero', 'complemento', 'bairro', 'cidade', 'estado', 'cep',
            'ponto_referencia', 'descricao_itens',
            'valor_pedido', 'valor_frete', 'forma_pagamento',
            'status', 'prioridade', 'data_agendada', 'hora_agendada',
            'observacoes'
        ]

        for campo in campos_permitidos:
            if campo in data:
                campos.append(f'{campo} = :{campo}')
                params[campo] = data[campo]

        # Atualizar timestamps baseado no status
        if 'status' in data:
            if data['status'] == 'entregue':
                campos.append('data_entrega = :data_entrega')
                params['data_entrega'] = datetime.now()

        if not campos:
            return jsonify({'success': False, 'error': 'Nenhum campo para atualizar'}), 400

        query = text(f"UPDATE entregas SET {', '.join(campos)} WHERE id = :entrega_id AND empresa_id = :empresa_id")

        result = session.execute(query, params)
        session.commit()

        if result.rowcount == 0:
            return jsonify({'success': False, 'error': 'Entrega nao encontrada'}), 404

        return jsonify({
            'success': True,
            'message': 'Entrega atualizada com sucesso'
        })

    except Exception as e:
        session.rollback()
        print(f'[ENTREGAS-API] Erro ao atualizar entrega: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@entregas_api_bp.route('/<int:entrega_id>', methods=['DELETE'])
def deletar_entrega(entrega_id):
    """
    DELETE /api/entregas/:id
    Deletar entrega
    """
    session = db_manager.get_session()
    try:
        empresa_id = get_empresa_id()
        if not empresa_id:
            return jsonify({'success': False, 'error': 'Empresa nao identificada'}), 400

        result = session.execute(
            text('DELETE FROM entregas WHERE id = :entrega_id AND empresa_id = :empresa_id'),
            {'entrega_id': entrega_id, 'empresa_id': empresa_id}
        )
        session.commit()

        if result.rowcount == 0:
            return jsonify({'success': False, 'error': 'Entrega nao encontrada'}), 404

        return jsonify({
            'success': True,
            'message': 'Entrega removida com sucesso'
        })

    except Exception as e:
        session.rollback()
        print(f'[ENTREGAS-API] Erro ao deletar entrega: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


# ══════════════════════════════════════════════════════════════
# ESTATISTICAS
# ══════════════════════════════════════════════════════════════

@entregas_api_bp.route('/stats', methods=['GET'])
def estatisticas_entregas():
    """
    GET /api/entregas/stats?empresa_id=X
    Estatisticas de entregas
    """
    session = db_manager.get_session()
    try:
        empresa_id = get_empresa_id()
        if not empresa_id:
            return jsonify({'success': False, 'error': 'Empresa nao identificada'}), 400

        hoje = datetime.now().strftime('%Y-%m-%d')

        # Total por status
        result = session.execute(text('''
            SELECT status, COUNT(*) as quantidade
            FROM entregas
            WHERE empresa_id = :empresa_id
            GROUP BY status
        '''), {'empresa_id': empresa_id})
        rows = result.fetchall()
        por_status = {row[0]: row[1] for row in rows if row[0]}

        # Total de hoje
        result = session.execute(text('''
            SELECT COUNT(*) as total
            FROM entregas
            WHERE empresa_id = :empresa_id AND DATE(criado_em) = :hoje
        '''), {'empresa_id': empresa_id, 'hoje': hoje})
        hoje_total = result.fetchone()[0] or 0

        # Entregas pendentes
        result = session.execute(text('''
            SELECT COUNT(*) as total
            FROM entregas
            WHERE empresa_id = :empresa_id AND status IN ('pendente', 'aguardando_coleta')
        '''), {'empresa_id': empresa_id})
        pendentes = result.fetchone()[0] or 0

        # Em transito
        result = session.execute(text('''
            SELECT COUNT(*) as total
            FROM entregas
            WHERE empresa_id = :empresa_id AND status = 'em_transito'
        '''), {'empresa_id': empresa_id})
        em_transito = result.fetchone()[0] or 0

        # Entregues hoje
        result = session.execute(text('''
            SELECT COUNT(*) as total
            FROM entregas
            WHERE empresa_id = :empresa_id AND status = 'entregue' AND DATE(data_entrega) = :hoje
        '''), {'empresa_id': empresa_id, 'hoje': hoje})
        entregues_hoje = result.fetchone()[0] or 0

        return jsonify({
            'success': True,
            'data': {
                'por_status': por_status,
                'hoje_total': hoje_total,
                'pendentes': pendentes,
                'em_transito': em_transito,
                'entregues_hoje': entregues_hoje
            }
        })

    except Exception as e:
        print(f'[ENTREGAS-API] Erro ao obter estatisticas: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


# ══════════════════════════════════════════════════════════════
# ENTREGADORES
# ══════════════════════════════════════════════════════════════

@entregas_api_bp.route('/entregadores', methods=['GET'])
def listar_entregadores():
    """
    GET /api/entregas/entregadores?empresa_id=X
    Lista entregadores da empresa
    """
    session = db_manager.get_session()
    try:
        empresa_id = get_empresa_id()
        if not empresa_id:
            return jsonify({'success': False, 'error': 'Empresa nao identificada'}), 400

        result = session.execute(text('''
            SELECT * FROM entregadores
            WHERE empresa_id = :empresa_id AND ativo = TRUE
            ORDER BY nome
        '''), {'empresa_id': empresa_id})

        rows = result.fetchall()
        entregadores = [row_to_dict(row, result.keys()) for row in rows] if rows else []

        return jsonify({
            'success': True,
            'data': entregadores
        })

    except Exception as e:
        print(f'[ENTREGAS-API] Erro ao listar entregadores: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@entregas_api_bp.route('/entregadores', methods=['POST'])
def criar_entregador():
    """
    POST /api/entregas/entregadores
    Criar novo entregador
    """
    session = db_manager.get_session()
    try:
        empresa_id = get_empresa_id()
        if not empresa_id:
            return jsonify({'success': False, 'error': 'Empresa nao identificada'}), 400

        data = request.get_json()
        if not data or not data.get('nome'):
            return jsonify({'success': False, 'error': 'Nome e obrigatorio'}), 400

        session.execute(text('''
            INSERT INTO entregadores (
                empresa_id, nome, telefone, email,
                tipo_veiculo, placa_veiculo, ativo, disponivel
            ) VALUES (:empresa_id, :nome, :telefone, :email,
                     :tipo_veiculo, :placa_veiculo, TRUE, TRUE)
        '''), {
            'empresa_id': empresa_id,
            'nome': data.get('nome'),
            'telefone': data.get('telefone'),
            'email': data.get('email'),
            'tipo_veiculo': data.get('tipo_veiculo', 'moto'),
            'placa_veiculo': data.get('placa_veiculo')
        })

        session.commit()

        # Obter ID inserido
        result = session.execute(text("SELECT lastval()")) if 'postgresql' in str(db_manager.engine.url) else session.execute(text("SELECT last_insert_rowid()"))
        entregador_id = result.fetchone()[0]

        return jsonify({
            'success': True,
            'message': 'Entregador cadastrado com sucesso',
            'entregador_id': entregador_id
        })

    except Exception as e:
        session.rollback()
        print(f'[ENTREGAS-API] Erro ao criar entregador: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@entregas_api_bp.route('/entregadores/<int:entregador_id>', methods=['PUT'])
def atualizar_entregador(entregador_id):
    """
    PUT /api/entregas/entregadores/:id
    Atualizar entregador
    """
    session = db_manager.get_session()
    try:
        empresa_id = get_empresa_id()
        if not empresa_id:
            return jsonify({'success': False, 'error': 'Empresa nao identificada'}), 400

        data = request.get_json()

        campos = []
        params = {'entregador_id': entregador_id, 'empresa_id': empresa_id}

        campos_permitidos = [
            'nome', 'telefone', 'email',
            'tipo_veiculo', 'placa_veiculo', 'ativo', 'disponivel'
        ]

        for campo in campos_permitidos:
            if campo in data:
                campos.append(f'{campo} = :{campo}')
                params[campo] = data[campo]

        if not campos:
            return jsonify({'success': False, 'error': 'Nenhum campo para atualizar'}), 400

        query = text(f"UPDATE entregadores SET {', '.join(campos)} WHERE id = :entregador_id AND empresa_id = :empresa_id")

        session.execute(query, params)
        session.commit()

        return jsonify({
            'success': True,
            'message': 'Entregador atualizado com sucesso'
        })

    except Exception as e:
        session.rollback()
        print(f'[ENTREGAS-API] Erro ao atualizar entregador: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@entregas_api_bp.route('/entregadores/<int:entregador_id>', methods=['DELETE'])
def deletar_entregador(entregador_id):
    """
    DELETE /api/entregas/entregadores/:id
    Desativar entregador - soft delete
    """
    session = db_manager.get_session()
    try:
        empresa_id = get_empresa_id()
        if not empresa_id:
            return jsonify({'success': False, 'error': 'Empresa nao identificada'}), 400

        session.execute(
            text('UPDATE entregadores SET ativo = FALSE WHERE id = :entregador_id AND empresa_id = :empresa_id'),
            {'entregador_id': entregador_id, 'empresa_id': empresa_id}
        )
        session.commit()

        return jsonify({
            'success': True,
            'message': 'Entregador desativado com sucesso'
        })

    except Exception as e:
        session.rollback()
        print(f'[ENTREGAS-API] Erro ao deletar entregador: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


# ══════════════════════════════════════════════════════════════
# ENDPOINT PARA BOT WHATSAPP
# ══════════════════════════════════════════════════════════════

@entregas_api_bp.route('/bot/registrar', methods=['POST'])
def registrar_entrega_bot():
    """
    POST /api/entregas/bot/registrar
    Endpoint para o bot registrar entregas automaticamente
    """
    session = db_manager.get_session()
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'Dados nao fornecidos'}), 400

        empresa_id = data.get('empresa_id')
        if not empresa_id:
            return jsonify({'success': False, 'error': 'empresa_id obrigatorio'}), 400

        session.execute(text('''
            INSERT INTO entregas (
                empresa_id, cliente_nome, cliente_telefone, cliente_whatsapp,
                endereco_entrega, numero, complemento, bairro, cidade, estado, cep, ponto_referencia,
                descricao_itens, valor_pedido, valor_frete, forma_pagamento,
                status, prioridade, data_agendada, hora_agendada,
                observacoes, origem, conversa_id
            ) VALUES (
                :empresa_id, :cliente_nome, :cliente_telefone, :cliente_whatsapp,
                :endereco_entrega, :numero, :complemento, :bairro, :cidade, :estado, :cep, :ponto_referencia,
                :descricao_itens, :valor_pedido, :valor_frete, :forma_pagamento,
                'pendente', :prioridade, :data_agendada, :hora_agendada,
                :observacoes, 'bot_whatsapp', :conversa_id
            )
        '''), {
            'empresa_id': empresa_id,
            'cliente_nome': data.get('cliente_nome', 'Cliente WhatsApp'),
            'cliente_telefone': data.get('cliente_telefone', ''),
            'cliente_whatsapp': data.get('cliente_whatsapp', data.get('telefone', '')),
            'endereco_entrega': data.get('endereco', ''),
            'numero': data.get('numero', ''),
            'complemento': data.get('complemento', ''),
            'bairro': data.get('bairro', ''),
            'cidade': data.get('cidade', ''),
            'estado': data.get('estado', ''),
            'cep': data.get('cep', ''),
            'ponto_referencia': data.get('ponto_referencia', ''),
            'descricao_itens': data.get('descricao_itens', data.get('produtos', '')),
            'valor_pedido': data.get('valor_pedido', data.get('valor_total')),
            'valor_frete': data.get('valor_frete', 0),
            'forma_pagamento': data.get('forma_pagamento', 'a_combinar'),
            'prioridade': data.get('prioridade', 'normal'),
            'data_agendada': data.get('data_agendada'),
            'hora_agendada': data.get('hora_agendada'),
            'observacoes': data.get('observacoes', ''),
            'conversa_id': data.get('conversa_id', data.get('telefone', ''))
        })

        session.commit()

        # Obter ID inserido
        result = session.execute(text("SELECT lastval()")) if 'postgresql' in str(db_manager.engine.url) else session.execute(text("SELECT last_insert_rowid()"))
        entrega_id = result.fetchone()[0]

        print(f'[ENTREGAS-API] Entrega registrada pelo bot: ID={entrega_id}, Cliente={data.get("cliente_nome")}')

        return jsonify({
            'success': True,
            'message': 'Entrega registrada pelo bot',
            'entrega_id': entrega_id
        })

    except Exception as e:
        session.rollback()
        print(f'[ENTREGAS-API] Erro ao registrar entrega do bot: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()
