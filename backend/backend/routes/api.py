"""API REST Endpoints"""
from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent.parent))
from database.models import Lead, Conversa, Campanha, Empresa, ConfiguracaoBot
from backend import db_manager

bp = Blueprint('api', __name__, url_prefix='/api')

@bp.route('/stats')
@login_required
def stats():
    """API: Estatísticas gerais"""
    session = db_manager.get_session()
    try:
        total_leads = session.query(Lead).filter_by(empresa_id=current_user.empresa_id).count()
        total_conversas = session.query(Conversa).filter_by(empresa_id=current_user.empresa_id).count()
        return jsonify({
            'total_leads': total_leads,
            'total_conversas': total_conversas
        })
    finally:
        session.close()

@bp.route('/leads')
@login_required
def api_leads():
    """API: Lista de leads"""
    session = db_manager.get_session()
    try:
        leads = session.query(Lead).filter_by(empresa_id=current_user.empresa_id).limit(100).all()
        resultado = []
        for lead in leads:
            resultado.append({
                'id': lead.id,
                'nome': lead.nome,
                'telefone': lead.telefone,
                'status': lead.status.value,
                'temperatura': lead.temperatura.value
            })
        return jsonify(resultado)
    finally:
        session.close()

@bp.route('/whatsapp/status')
@login_required
def whatsapp_status():
    """API: Status WhatsApp"""
    # TODO: Integrar com bot engine
    return jsonify({'connected': False, 'message': 'Bot engine not connected'})


@bp.route('/empresa/nicho')
def empresa_nicho():
    """API: Busca nicho da empresa logada"""
    session = db_manager.get_session()
    try:
        # Tentar obter empresa_id do usuário autenticado ou usar ID fixo
        if current_user.is_authenticated:
            empresa_id = current_user.empresa_id
        else:
            empresa_id = 1  # ID fixo para desenvolvimento (CRM Cliente)

        empresa = session.query(Empresa).filter_by(id=empresa_id).first()

        if not empresa:
            return jsonify({'error': 'Empresa não encontrada'}), 404

        return jsonify({
            'nicho': empresa.nicho.value if empresa.nicho else None,
            'nome': empresa.nome
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@bp.route('/empresa/info')
def empresa_info():
    """API: Informações completas da empresa incluindo status do bot"""
    import requests
    session = db_manager.get_session()

    try:
        # Tentar obter empresa_id do usuário autenticado ou usar ID fixo
        if current_user.is_authenticated:
            empresa_id = current_user.empresa_id
        else:
            empresa_id = 1  # ID fixo para desenvolvimento (CRM Cliente)

        empresa = session.query(Empresa).filter_by(id=empresa_id).first()

        if not empresa:
            return jsonify({'error': 'Empresa não encontrada'}), 404

        # Verificar status real do WhatsApp Service
        whatsapp_status = 'disconnected'
        bot_ready = False

        try:
            # Verificar se whatsapp_service_stable está rodando
            resp = requests.get('http://localhost:3001/api/session/status',
                              params={'empresaId': empresa.id},
                              timeout=2)
            if resp.status_code == 200:
                data = resp.json()
                if data.get('connected'):
                    whatsapp_status = 'connected'
                elif data.get('qr'):
                    whatsapp_status = 'qr_code'
                else:
                    whatsapp_status = 'disconnected'
        except:
            whatsapp_status = 'disconnected'

        # Verificar se bot AIra Auto está pronto
        try:
            if empresa.nicho and empresa.nicho.value == 'veiculos':
                bot_resp = requests.get('http://localhost:4000/health', timeout=2)
                if bot_resp.status_code == 200:
                    bot_data = bot_resp.json()
                    bot_ready = bot_data.get('bot_pronto', False)
        except:
            bot_ready = False

        # Buscar configuração do bot para horário de atendimento
        config_bot = session.query(ConfiguracaoBot).filter_by(empresa_id=empresa.id).first()
        horario_atendimento = config_bot.horario_atendimento if config_bot and config_bot.horario_atendimento else None

        # Montar endereço completo
        endereco_partes = []
        if empresa.endereco:
            endereco_partes.append(empresa.endereco)
        if empresa.cidade:
            endereco_partes.append(empresa.cidade)
        if empresa.estado:
            endereco_partes.append(empresa.estado)
        endereco_completo = ' - '.join(endereco_partes) if endereco_partes else None

        return jsonify({
            'id': empresa.id,
            'nome': empresa.nome,
            'nome_fantasia': empresa.nome_fantasia,
            'nicho': empresa.nicho.value if empresa.nicho else None,
            'telefone': empresa.telefone,
            'email': empresa.email,
            'website': empresa.website,
            'endereco': endereco_completo,
            'endereco_rua': empresa.endereco,
            'cidade': empresa.cidade,
            'estado': empresa.estado,
            'cep': empresa.cep,
            'horario_atendimento': horario_atendimento,
            'whatsapp_conectado': empresa.whatsapp_conectado,
            'whatsapp_numero': empresa.whatsapp_numero,
            'whatsapp_status': whatsapp_status,
            'bot_ativo': empresa.bot_ativo,
            'bot_ready': bot_ready
        })
    except Exception as e:
        print(f"[ERRO] /api/empresa/info: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@bp.route('/empresa/bot/toggle', methods=['POST'])
def toggle_bot():
    """API: Ativar/Desativar bot da empresa"""
    session = db_manager.get_session()

    try:
        data = request.get_json() or {}

        # Tentar obter empresa_id do usuário autenticado, do body ou usar ID fixo
        if current_user.is_authenticated:
            empresa_id = current_user.empresa_id
        elif 'empresa_id' in data:
            empresa_id = data['empresa_id']
        else:
            empresa_id = 1  # ID fixo para desenvolvimento (CRM Cliente)

        empresa = session.query(Empresa).filter_by(id=empresa_id).first()

        if not empresa:
            return jsonify({'error': 'Empresa não encontrada'}), 404

        # Se bot_ativo foi enviado no body, usar esse valor; caso contrário, alternar
        if 'bot_ativo' in data:
            empresa.bot_ativo = data['bot_ativo']
        else:
            # Alternar estado do bot
            empresa.bot_ativo = not empresa.bot_ativo

        session.commit()

        print(f"[API] Bot da empresa {empresa.nome} alterado para: {'ATIVO' if empresa.bot_ativo else 'INATIVO'}")

        # ========================================================================
        # SINCRONIZAR COM MYSQL
        # ========================================================================
        try:
            import mysql.connector
            import os
            from dotenv import load_dotenv
            load_dotenv()

            mysql_conn = mysql.connector.connect(
                host=os.getenv('DB_HOST', 'localhost'),
                user=os.getenv('DB_USER', 'root'),
                password=os.getenv('DB_PASSWORD', ''),
                database=os.getenv('DB_NAME', 'helixai_db')
            )
            mysql_cursor = mysql_conn.cursor()

            mysql_cursor.execute(
                "UPDATE empresas SET bot_ativo = %s WHERE id = %s",
                (empresa.bot_ativo, empresa.id)
            )
            mysql_conn.commit()
            mysql_conn.close()
            print(f"[API] ✅ bot_ativo sincronizado com MySQL")

        except Exception as sync_error:
            print(f"[API] ⚠️ Erro ao sincronizar toggle: {sync_error}")
        # ========================================================================

        return jsonify({
            'success': True,
            'bot_ativo': empresa.bot_ativo,
            'message': f'Bot {"ativado" if empresa.bot_ativo else "desativado"} com sucesso!'
        })
    except Exception as e:
        session.rollback()
        print(f"[ERRO] /api/empresa/bot/toggle: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@bp.route('/stats/<int:empresa_id>')
def stats_by_empresa(empresa_id):
    """API: Estatísticas por empresa (sem autenticação)"""
    session = db_manager.get_session()
    try:
        total_leads = session.query(Lead).filter_by(empresa_id=empresa_id).count()
        total_conversas = session.query(Conversa).filter_by(empresa_id=empresa_id).count()

        return jsonify({
            'success': True,
            'data': {
                'total_leads': total_leads,
                'total_conversas': total_conversas,
                'clientes': {'total': total_leads},
                'conversas': {'ativas': total_conversas},
                'mensagens': {'hoje': 0}  # TODO: Implementar contagem de mensagens
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@bp.route('/bot-config/<int:empresa_id>')
def get_bot_config(empresa_id):
    """API: Obter configuração do bot da empresa"""
    session = db_manager.get_session()
    try:
        empresa = session.query(Empresa).get(empresa_id)

        if not empresa:
            return jsonify({'success': False, 'message': 'Empresa não encontrada'}), 404

        return jsonify({
            'success': True,
            'data': {
                'bot_ativo': empresa.bot_ativo,
                'whatsapp_conectado': empresa.whatsapp_conectado
            }
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


# ════════════════════════════════════════════════════════════════════
# NOTIFICAÇÕES DO GERENTE VIA WHATSAPP
# ════════════════════════════════════════════════════════════════════

@bp.route('/empresa/notificacoes/<int:empresa_id>', methods=['GET'])
def get_notificacoes_gerente(empresa_id):
    """API: Obter configurações de notificações do gerente"""
    import sqlite3
    from pathlib import Path

    try:
        db_path = Path(__file__).resolve().parent.parent.parent / 'vendeai.db'
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        cursor.execute('''
            SELECT numero_gerente, notificar_vendas, notificar_leads,
                   notificar_entregas, notificar_estoque
            FROM empresas WHERE id = ?
        ''', (empresa_id,))

        row = cursor.fetchone()
        conn.close()

        if not row:
            return jsonify({'success': False, 'message': 'Empresa não encontrada'}), 404

        return jsonify({
            'success': True,
            'data': {
                'numero_gerente': row[0] or '',
                'notificar_vendas': bool(row[1]) if row[1] is not None else True,
                'notificar_leads': bool(row[2]) if row[2] is not None else True,
                'notificar_entregas': bool(row[3]) if row[3] is not None else True,
                'notificar_estoque': bool(row[4]) if row[4] is not None else False
            }
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/empresa/notificacoes/<int:empresa_id>', methods=['POST'])
def salvar_notificacoes_gerente(empresa_id):
    """API: Salvar configurações de notificações do gerente"""
    import sqlite3
    from pathlib import Path

    try:
        data = request.get_json() or {}
        db_path = Path(__file__).resolve().parent.parent.parent / 'vendeai.db'
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Verificar se empresa existe
        cursor.execute('SELECT id FROM empresas WHERE id = ?', (empresa_id,))
        if not cursor.fetchone():
            conn.close()
            return jsonify({'success': False, 'message': 'Empresa não encontrada'}), 404

        # Construir update dinâmico
        updates = []
        values = []

        if 'numero_gerente' in data:
            numero = data['numero_gerente'].replace(' ', '').replace('-', '').replace('(', '').replace(')', '')
            if numero and not numero.startswith('55'):
                numero = '55' + numero
            updates.append('numero_gerente = ?')
            values.append(numero)

        if 'notificar_vendas' in data:
            updates.append('notificar_vendas = ?')
            values.append(1 if data['notificar_vendas'] else 0)
        if 'notificar_leads' in data:
            updates.append('notificar_leads = ?')
            values.append(1 if data['notificar_leads'] else 0)
        if 'notificar_entregas' in data:
            updates.append('notificar_entregas = ?')
            values.append(1 if data['notificar_entregas'] else 0)
        if 'notificar_estoque' in data:
            updates.append('notificar_estoque = ?')
            values.append(1 if data['notificar_estoque'] else 0)

        if updates:
            values.append(empresa_id)
            cursor.execute(f"UPDATE empresas SET {', '.join(updates)} WHERE id = ?", values)
            conn.commit()

        # Buscar dados atualizados
        cursor.execute('''
            SELECT numero_gerente, notificar_vendas, notificar_leads, notificar_entregas, notificar_estoque
            FROM empresas WHERE id = ?
        ''', (empresa_id,))
        row = cursor.fetchone()
        conn.close()

        print(f"[API] Notificações salvas para empresa {empresa_id}: gerente={row[0]}")

        return jsonify({
            'success': True,
            'message': 'Configurações de notificação salvas com sucesso!',
            'data': {
                'numero_gerente': row[0] or '',
                'notificar_vendas': bool(row[1]) if row[1] is not None else True,
                'notificar_leads': bool(row[2]) if row[2] is not None else True,
                'notificar_entregas': bool(row[3]) if row[3] is not None else True,
                'notificar_estoque': bool(row[4]) if row[4] is not None else False
            }
        })

    except Exception as e:
        print(f"[ERRO] Salvar notificações: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/empresa/notificacoes/enviar', methods=['POST'])
def enviar_notificacao_gerente():
    """API: Enviar notificação para o gerente via WhatsApp"""
    import sqlite3
    import requests
    from pathlib import Path
    from datetime import datetime

    try:
        data = request.get_json() or {}
        empresa_id = data.get('empresa_id')
        tipo = data.get('tipo')  # venda, lead, entrega, estoque
        dados = data.get('dados', {})

        if not empresa_id or not tipo:
            return jsonify({'success': False, 'error': 'empresa_id e tipo são obrigatórios'}), 400

        # Buscar dados da empresa via SQLite
        db_path = Path(__file__).resolve().parent.parent.parent / 'vendeai.db'
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        cursor.execute('''
            SELECT nome, numero_gerente, notificar_vendas, notificar_leads,
                   notificar_entregas, notificar_estoque
            FROM empresas WHERE id = ?
        ''', (empresa_id,))

        row = cursor.fetchone()
        conn.close()

        if not row:
            return jsonify({'success': False, 'message': 'Empresa não encontrada'}), 404

        empresa_nome = row[0]
        numero_gerente = row[1]
        notificar_vendas = bool(row[2]) if row[2] is not None else True
        notificar_leads = bool(row[3]) if row[3] is not None else True
        notificar_entregas = bool(row[4]) if row[4] is not None else True
        notificar_estoque = bool(row[5]) if row[5] is not None else False

        if not numero_gerente:
            return jsonify({'success': False, 'message': 'Número do gerente não configurado'}), 400

        # Verificar se o tipo de notificação está ativado
        if tipo == 'venda' and not notificar_vendas:
            return jsonify({'success': False, 'message': 'Notificações de vendas desativadas'}), 200
        if tipo == 'lead' and not notificar_leads:
            return jsonify({'success': False, 'message': 'Notificações de leads desativadas'}), 200
        if tipo == 'entrega' and not notificar_entregas:
            return jsonify({'success': False, 'message': 'Notificações de entregas desativadas'}), 200
        if tipo == 'estoque' and not notificar_estoque:
            return jsonify({'success': False, 'message': 'Notificações de estoque desativadas'}), 200

        agora = datetime.now().strftime('%d/%m/%Y às %H:%M')

        if tipo == 'venda':
            mensagem = f"""🛒 *NOVA VENDA REALIZADA!*

📅 {agora}

👤 *Cliente:* {dados.get('cliente_nome', 'Não identificado')}
📱 *Telefone:* {dados.get('cliente_telefone', 'N/A')}

📦 *Produtos:*
{dados.get('produtos_texto', 'Sem detalhes')}

💰 *Valor Total:* R$ {dados.get('valor_total', '0,00')}
💳 *Pagamento:* {dados.get('forma_pagamento', 'A definir')}

📍 *Entrega:* {dados.get('tipo_entrega', 'Retirada na loja')}

_Notificação automática - {empresa_nome}_"""

        elif tipo == 'lead':
            mensagem = f"""🔔 *NOVO LEAD RECEBIDO!*

📅 {agora}

👤 *Nome:* {dados.get('nome', 'Não informado')}
📱 *WhatsApp:* {dados.get('telefone', 'N/A')}

💬 *Primeira mensagem:*
"{dados.get('mensagem', 'Olá')}"

🏷️ *Interesse:* {dados.get('interesse', 'A identificar')}

_Notificação automática - {empresa_nome}_"""

        elif tipo == 'entrega':
            status_emoji = {'pendente': '⏳', 'em_transito': '🚚', 'entregue': '✅', 'cancelada': '❌'}
            mensagem = f"""📦 *ATUALIZAÇÃO DE ENTREGA*

📅 {agora}

{status_emoji.get(dados.get('status', 'pendente'), '📦')} *Status:* {dados.get('status_texto', 'Pendente')}

👤 *Cliente:* {dados.get('cliente_nome', 'N/A')}
📍 *Endereço:* {dados.get('endereco', 'N/A')}

📦 *Pedido:* #{dados.get('pedido_id', 'N/A')}
💰 *Valor:* R$ {dados.get('valor', '0,00')}

_Notificação automática - {empresa_nome}_"""

        elif tipo == 'estoque':
            mensagem = f"""⚠️ *ALERTA DE ESTOQUE BAIXO!*

📅 {agora}

📦 *Produto:* {dados.get('produto_nome', 'N/A')}
🏷️ *SKU:* {dados.get('sku', 'N/A')}

📊 *Quantidade atual:* {dados.get('quantidade_atual', 0)} unidades
📉 *Mínimo recomendado:* {dados.get('quantidade_minima', 10)} unidades

_Notificação automática - {empresa_nome}_"""

        else:
            mensagem = f"""📢 *NOTIFICAÇÃO DO SISTEMA*

📅 {agora}

{dados.get('mensagem', 'Sem detalhes')}

_Notificação automática - {empresa_nome}_"""

        # Chamar o bot para enviar a mensagem
        try:
            bot_response = requests.post(
                'http://localhost:3010/api/bot/send-notification',
                json={
                    'empresaId': empresa_id,
                    'telefone': numero_gerente,
                    'mensagem': mensagem
                },
                timeout=30
            )

            if bot_response.status_code == 200:
                result = bot_response.json()
                if result.get('success'):
                    print(f"[NOTIFICACAO] Enviada para gerente {numero_gerente}")
                    return jsonify({'success': True, 'message': 'Notificação enviada com sucesso!'})
                else:
                    return jsonify({'success': False, 'error': result.get('error', 'Erro ao enviar')}), 500
            else:
                return jsonify({'success': False, 'error': 'Erro ao comunicar com o bot'}), 500

        except requests.exceptions.RequestException as e:
            print(f"[ERRO] Enviar notificação: {str(e)}")
            return jsonify({'success': False, 'error': 'Bot não disponível'}), 503

    except Exception as e:
        print(f"[ERRO] Notificação gerente: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


# ============================================================================
# REGISTRO COMPLETO DE VENDA (Bot -> Pedido -> Estoque -> Entrega -> Notificacao)
# ============================================================================
@bp.route('/venda/registrar', methods=['POST'])
def registrar_venda_completa():
    """
    Registra uma venda completa no sistema:
    1. Cria/busca cliente pelo telefone
    2. Cria pedido com itens
    3. Atualiza estoque dos produtos
    4. Cria entrega (se aplicavel)
    5. Envia notificacoes para gerente

    Body: {
        "empresa_id": 27,
        "cliente": {
            "nome": "Joao Silva",
            "telefone": "5542999999999",
            "endereco": "Rua X, 123" (opcional)
        },
        "itens": [
            {"produto_id": 1, "quantidade": 2, "preco_unitario": 150.00},
            {"produto_id": 5, "quantidade": 1, "preco_unitario": 89.90}
        ],
        "forma_pagamento": "PIX",
        "tipo_entrega": "entrega" ou "retirada",
        "endereco_entrega": "Rua X, 123" (se tipo_entrega = entrega),
        "observacoes": "Entregar de manha"
    }
    """
    import sqlite3
    import requests
    from pathlib import Path
    from datetime import datetime

    try:
        data = request.get_json() or {}
        empresa_id = data.get('empresa_id')
        cliente_data = data.get('cliente', {})
        itens = data.get('itens', [])
        forma_pagamento = data.get('forma_pagamento', 'Dinheiro')
        tipo_entrega = data.get('tipo_entrega', 'retirada')
        endereco_entrega = data.get('endereco_entrega', '')
        observacoes = data.get('observacoes', '')

        if not empresa_id:
            return jsonify({'success': False, 'error': 'empresa_id e obrigatorio'}), 400

        if not cliente_data.get('telefone'):
            return jsonify({'success': False, 'error': 'telefone do cliente e obrigatorio'}), 400

        if not itens or len(itens) == 0:
            return jsonify({'success': False, 'error': 'Adicione pelo menos um item'}), 400

        db_path = Path(__file__).resolve().parent.parent.parent / 'vendeai.db'
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()

        agora = datetime.now()
        agora_str = agora.strftime('%Y-%m-%d %H:%M:%S')
        agora_display = agora.strftime('%d/%m/%Y %H:%M')

        # =====================================================================
        # 1. CRIAR OU BUSCAR CLIENTE
        # =====================================================================
        telefone_cliente = cliente_data.get('telefone', '').strip()
        nome_cliente = cliente_data.get('nome', 'Cliente')

        cursor.execute('''
            SELECT id, nome FROM clientes
            WHERE empresa_id = ? AND telefone = ?
        ''', (empresa_id, telefone_cliente))
        cliente_row = cursor.fetchone()

        if cliente_row:
            cliente_id = cliente_row[0]
            if not nome_cliente or nome_cliente == 'Cliente':
                nome_cliente = cliente_row[1]
            print(f"[VENDA] Cliente existente: #{cliente_id} - {nome_cliente}")
        else:
            # Criar novo cliente
            cursor.execute('''
                INSERT INTO clientes (empresa_id, nome, telefone, celular, origem, ativo, criado_em)
                VALUES (?, ?, ?, ?, ?, 1, ?)
            ''', (empresa_id, nome_cliente, telefone_cliente, telefone_cliente, 'bot_whatsapp', agora_str))
            conn.commit()
            cliente_id = cursor.lastrowid
            print(f"[VENDA] Novo cliente criado: #{cliente_id} - {nome_cliente}")

        # =====================================================================
        # 2. CALCULAR TOTAIS E VALIDAR PRODUTOS
        # =====================================================================
        subtotal = 0
        itens_texto = []
        itens_validos = []

        for item in itens:
            produto_id = item.get('produto_id')
            quantidade = int(item.get('quantidade', 1))
            preco_unitario = float(item.get('preco_unitario', 0))

            # Buscar produto para validar e pegar nome
            cursor.execute('''
                SELECT id, nome, preco, estoque FROM produtos
                WHERE id = ? AND empresa_id = ?
            ''', (produto_id, empresa_id))
            produto_row = cursor.fetchone()

            if produto_row:
                produto_nome = produto_row[1]
                # Se preco nao foi informado, usar do banco
                if preco_unitario == 0:
                    preco_unitario = float(produto_row[2] or 0)

                valor_item = preco_unitario * quantidade
                subtotal += valor_item

                itens_validos.append({
                    'produto_id': produto_id,
                    'produto_nome': produto_nome,
                    'quantidade': quantidade,
                    'preco_unitario': preco_unitario,
                    'valor_total': valor_item,
                    'estoque_atual': produto_row[3] or 0
                })

                itens_texto.append(f"{quantidade}x {produto_nome} - R$ {valor_item:.2f}")
            else:
                print(f"[VENDA] AVISO: Produto #{produto_id} nao encontrado")

        if len(itens_validos) == 0:
            conn.close()
            return jsonify({'success': False, 'error': 'Nenhum produto valido encontrado'}), 400

        # =====================================================================
        # 3. CRIAR PEDIDO
        # =====================================================================
        cursor.execute('''
            INSERT INTO pedidos (
                empresa_id, cliente_id, data_pedido, status,
                forma_pagamento, subtotal, desconto, total,
                observacoes, origem, criado_em
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            empresa_id, cliente_id, agora_str, 'confirmado',
            forma_pagamento, subtotal, 0, subtotal,
            observacoes, 'bot_whatsapp', agora_str
        ))
        conn.commit()
        pedido_id = cursor.lastrowid
        print(f"[VENDA] Pedido criado: #{pedido_id} - Total: R$ {subtotal:.2f}")

        # =====================================================================
        # 4. ADICIONAR ITENS DO PEDIDO E ATUALIZAR ESTOQUE
        # =====================================================================
        for item in itens_validos:
            # Inserir item do pedido
            cursor.execute('''
                INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario)
                VALUES (?, ?, ?, ?)
            ''', (pedido_id, item['produto_id'], item['quantidade'], item['preco_unitario']))

            # Atualizar estoque
            novo_estoque = max(0, item['estoque_atual'] - item['quantidade'])
            cursor.execute('''
                UPDATE produtos SET estoque = ? WHERE id = ?
            ''', (novo_estoque, item['produto_id']))

            print(f"[VENDA] Item: {item['produto_nome']} | Qtd: {item['quantidade']} | Estoque: {item['estoque_atual']} -> {novo_estoque}")

        conn.commit()

        # =====================================================================
        # 5. CRIAR ENTREGA (SE APLICAVEL)
        # =====================================================================
        entrega_id = None
        if tipo_entrega.lower() == 'entrega' and endereco_entrega:
            cursor.execute('''
                INSERT INTO entregas (
                    empresa_id, pedido_id, cliente_id,
                    cliente_nome, cliente_telefone, cliente_whatsapp,
                    endereco_entrega, descricao_itens, valor_pedido,
                    forma_pagamento, status, origem, criado_em
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                empresa_id, pedido_id, cliente_id,
                nome_cliente, telefone_cliente, telefone_cliente,
                endereco_entrega, '\n'.join(itens_texto), subtotal,
                forma_pagamento, 'pendente', 'bot_whatsapp', agora_str
            ))
            conn.commit()
            entrega_id = cursor.lastrowid
            print(f"[VENDA] Entrega criada: #{entrega_id}")

        # =====================================================================
        # 6. BUSCAR NUMERO DO GERENTE PARA NOTIFICACAO
        # =====================================================================
        cursor.execute('SELECT nome, numero_gerente FROM empresas WHERE id = ?', (empresa_id,))
        empresa_row = cursor.fetchone()
        empresa_nome = empresa_row[0] if empresa_row else 'Empresa'
        numero_gerente = empresa_row[1] if empresa_row else None

        conn.close()

        # =====================================================================
        # 7. ENVIAR NOTIFICACAO PARA GERENTE
        # =====================================================================
        gerente_notificado = False
        if numero_gerente:
            try:
                mensagem_gerente = f"""🛒 *NOVA VENDA REGISTRADA!*

📅 {agora_display}

📋 *Pedido:* #{pedido_id}

👤 *Cliente:* {nome_cliente}
📱 *Telefone:* {telefone_cliente}

📦 *Itens:*
{chr(10).join(itens_texto)}

💰 *Total:* R$ {subtotal:.2f}
💳 *Pagamento:* {forma_pagamento}
📍 *Entrega:* {'Delivery - ' + endereco_entrega if entrega_id else 'Retirada na loja'}

✅ *Estoque atualizado automaticamente*

_Venda registrada via Bot - {empresa_nome}_"""

                bot_response = requests.post(
                    'http://localhost:3010/api/bot/send-notification',
                    json={
                        'empresaId': empresa_id,
                        'telefone': numero_gerente,
                        'mensagem': mensagem_gerente
                    },
                    timeout=30
                )
                if bot_response.status_code == 200:
                    gerente_notificado = True
                    print(f"[VENDA] Gerente notificado: {numero_gerente}")
            except Exception as notif_error:
                print(f"[VENDA] Erro ao notificar gerente: {notif_error}")

        return jsonify({
            'success': True,
            'message': 'Venda registrada com sucesso!',
            'data': {
                'pedido_id': pedido_id,
                'cliente_id': cliente_id,
                'cliente_nome': nome_cliente,
                'total': subtotal,
                'itens_count': len(itens_validos),
                'entrega_id': entrega_id,
                'tipo_entrega': tipo_entrega,
                'gerente_notificado': gerente_notificado,
                'estoque_atualizado': True
            }
        })

    except Exception as e:
        print(f"[VENDA] ERRO: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/empresa/check-setup/<int:empresa_id>')
def check_setup(empresa_id):
    """API: Verificar status de setup da empresa"""
    session = db_manager.get_session()
    try:
        empresa = session.query(Empresa).get(empresa_id)

        if not empresa:
            return jsonify({'success': False, 'message': 'Empresa não encontrada'}), 404

        # Verificar se o setup está completo (campo direto do banco)
        setup_completo = empresa.setup_completo if hasattr(empresa, 'setup_completo') else False

        print(f"[API] Verificando setup da empresa {empresa.id} ({empresa.nome})")
        print(f"[API]   - setup_completo: {setup_completo}")
        print(f"[API]   - nicho: {empresa.nicho.value if empresa.nicho else 'Não configurado'}")
        print(f"[API]   - nome_bot: {empresa.nome_bot if hasattr(empresa, 'nome_bot') else 'Não configurado'}")

        # ========================================================================
        # AUTO-SYNC: Se setup estiver completo no SQLite, sincronizar com MySQL
        # ========================================================================
        if setup_completo and empresa.nicho:
            try:
                import mysql.connector
                import os
                from dotenv import load_dotenv
                load_dotenv()

                mysql_conn = mysql.connector.connect(
                    host=os.getenv('DB_HOST', 'localhost'),
                    user=os.getenv('DB_USER', 'root'),
                    password=os.getenv('DB_PASSWORD', ''),
                    database=os.getenv('DB_NAME', 'helixai_db')
                )
                mysql_cursor = mysql_conn.cursor()

                # Verificar se precisa sincronizar
                mysql_cursor.execute(
                    "SELECT setup_completo, nicho FROM empresas WHERE id = %s",
                    (empresa.id,)
                )
                result = mysql_cursor.fetchone()

                if not result or not result[0] or result[1] != empresa.nicho.value:
                    # Precisa sincronizar
                    nicho_str = empresa.nicho.value if empresa.nicho else None

                    if result:
                        # Atualizar
                        mysql_cursor.execute("""
                            UPDATE empresas SET
                                nome = %s, nome_bot = %s, nicho = %s,
                                setup_completo = %s
                            WHERE id = %s
                        """, (empresa.nome, empresa.nome_bot, nicho_str,
                              empresa.setup_completo, empresa.id))
                        print(f"[API] 🔄 Auto-sync: Empresa {empresa.id} atualizada no MySQL")
                    else:
                        # Inserir
                        mysql_cursor.execute("""
                            INSERT INTO empresas (id, nome, nome_bot, nicho, setup_completo,
                                                 email, plano, plano_ativo)
                            VALUES (%s, %s, %s, %s, %s, %s, 'GRATUITO', 1)
                        """, (empresa.id, empresa.nome, empresa.nome_bot, nicho_str,
                              empresa.setup_completo, empresa.email))
                        print(f"[API] ➕ Auto-sync: Empresa {empresa.id} inserida no MySQL")

                    mysql_conn.commit()

                mysql_conn.close()

            except Exception as sync_error:
                print(f"[API] ⚠️ Auto-sync falhou: {sync_error}")
        # ========================================================================

        return jsonify({
            'success': True,
            'setup_completo': setup_completo,
            'empresa': {
                'id': empresa.id,
                'nome': empresa.nome,
                'nome_bot': empresa.nome_bot if hasattr(empresa, 'nome_bot') else None,
                'nicho': empresa.nicho.value if empresa.nicho else None,
                'whatsapp_numero': empresa.whatsapp_numero,
                'tem_catalogo': empresa.tem_catalogo if hasattr(empresa, 'tem_catalogo') else False
            }
        })

    except Exception as e:
        print(f"[API] ❌ Erro ao verificar setup: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@bp.route('/empresa/setup', methods=['POST'])
def setup_empresa():
    """API: Configurar empresa (wizard de setup inicial)"""
    session = db_manager.get_session()
    try:
        data = request.get_json()

        print(f"[API] Dados recebidos no setup: {data}")

        # Validar dados obrigatórios
        empresa_id = data.get('empresa_id')
        nicho = data.get('nicho')
        nome_empresa = data.get('nome_empresa')
        nome_bot = data.get('nome_bot')

        if not empresa_id:
            return jsonify({'success': False, 'error': 'empresa_id é obrigatório'}), 400

        if not nicho or nicho not in ['veiculos', 'imoveis', 'atacado_varejo']:
            return jsonify({'success': False, 'error': 'Nicho inválido. Use "veiculos", "imoveis" ou "atacado_varejo"'}), 400

        # Buscar empresa
        empresa = session.query(Empresa).get(empresa_id)

        if not empresa:
            return jsonify({'success': False, 'error': 'Empresa não encontrada'}), 404

        # Importar enum do nicho
        from database.models import NichoEmpresa

        # Salvar dados do wizard
        if nome_empresa:
            empresa.nome = nome_empresa

        if nome_bot:
            empresa.nome_bot = nome_bot

        # Converter string do nicho para enum (aceita maiúsculas e minúsculas)
        if nicho and nicho.upper() == 'VEICULOS':
            empresa.nicho = NichoEmpresa.VEICULOS
        elif nicho and nicho.upper() == 'IMOVEIS':
            empresa.nicho = NichoEmpresa.IMOVEIS
        elif nicho and nicho.upper() == 'ATACADO_VAREJO':
            empresa.nicho = NichoEmpresa.ATACADO_VAREJO

        # Salvar número do WhatsApp
        if 'numero_whatsapp' in data:
            empresa.whatsapp_numero = data['numero_whatsapp']

        # Salvar flag de catálogo
        if 'tem_catalogo' in data:
            empresa.tem_catalogo = data['tem_catalogo']

        # Marcar setup como completo
        empresa.setup_completo = True

        session.commit()

        print(f"[API] ✅ Setup concluído para empresa {empresa.nome} (ID: {empresa.id})")
        print(f"[API]    - Nicho: {empresa.nicho.value if empresa.nicho else None}")
        print(f"[API]    - Nome Bot: {empresa.nome_bot}")
        print(f"[API]    - WhatsApp: {empresa.whatsapp_numero}")
        print(f"[API]    - Setup Completo: {empresa.setup_completo}")

        # ========================================================================
        # SINCRONIZAR COM MYSQL AUTOMATICAMENTE
        # ========================================================================
        try:
            import mysql.connector
            import os
            from dotenv import load_dotenv
            load_dotenv()

            mysql_conn = mysql.connector.connect(
                host=os.getenv('DB_HOST', 'localhost'),
                user=os.getenv('DB_USER', 'root'),
                password=os.getenv('DB_PASSWORD', ''),
                database=os.getenv('DB_NAME', 'helixai_db')
            )
            mysql_cursor = mysql_conn.cursor()

            # Verificar se empresa já existe no MySQL
            mysql_cursor.execute("SELECT id FROM empresas WHERE id = %s", (empresa.id,))
            existe = mysql_cursor.fetchone()

            nicho_str = empresa.nicho.value if empresa.nicho else None

            if existe:
                # Atualizar empresa no MySQL
                mysql_cursor.execute("""
                    UPDATE empresas SET
                        nome = %s,
                        nome_bot = %s,
                        nicho = %s,
                        whatsapp_numero = %s,
                        tem_catalogo = %s,
                        setup_completo = %s
                    WHERE id = %s
                """, (empresa.nome, empresa.nome_bot, nicho_str,
                      empresa.whatsapp_numero, empresa.tem_catalogo,
                      empresa.setup_completo, empresa.id))
                print(f"[API] 🔄 Empresa {empresa.id} atualizada no MySQL")
            else:
                # Inserir empresa no MySQL
                mysql_cursor.execute("""
                    INSERT INTO empresas (id, nome, nome_bot, nicho, whatsapp_numero,
                                         tem_catalogo, setup_completo, email, plano, plano_ativo)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'GRATUITO', 1)
                """, (empresa.id, empresa.nome, empresa.nome_bot, nicho_str,
                      empresa.whatsapp_numero, empresa.tem_catalogo,
                      empresa.setup_completo, empresa.email))
                print(f"[API] ➕ Empresa {empresa.id} inserida no MySQL")

            mysql_conn.commit()
            mysql_conn.close()
            print(f"[API] ✅ Sincronização com MySQL concluída")

        except Exception as sync_error:
            print(f"[API] ⚠️ Erro ao sincronizar com MySQL: {sync_error}")
            # Não falhar o setup se a sincronização falhar
            pass
        # ========================================================================

        return jsonify({
            'success': True,
            'message': 'Setup concluído com sucesso!',
            'empresa': {
                'id': empresa.id,
                'nome': empresa.nome,
                'nome_bot': empresa.nome_bot,
                'nicho': empresa.nicho.value if empresa.nicho else None,
                'whatsapp_numero': empresa.whatsapp_numero,
                'tem_catalogo': empresa.tem_catalogo,
                'setup_completo': empresa.setup_completo
            }
        })

    except Exception as e:
        session.rollback()
        print(f"[API] ❌ Erro no setup: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


# ==================== ENDPOINTS VEICULOS ====================
print("\n[API] Registrando rotas de veiculos...")

@bp.route('/veiculos', methods=['GET'])
def listar_veiculos():
    """API: Listar veículos com paginação"""
    import sqlite3
    import json

    try:
        empresa_id = request.args.get('empresa_id', 1, type=int)
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 20, type=int)

        db_path = Path(__file__).parent.parent.parent.parent / 'vendeai.db'
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
        print(f"[API] Erro ao listar veículos: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/veiculos/stats', methods=['GET'])
def get_veiculos_stats():
    """API: Estatísticas de veículos"""
    import sqlite3

    try:
        empresa_id = request.args.get('empresa_id', 1, type=int)

        db_path = Path(__file__).parent.parent.parent.parent / 'vendeai.db'
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
        print(f"[API] Erro ao obter stats: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/veiculos/template-csv', methods=['GET'])
def download_template_csv():
    """API: Download do template CSV de veículos"""
    from flask import send_file

    try:
        template_path = Path(__file__).parent.parent.parent.parent / 'uploads' / 'produtos' / 'template_veiculos.csv'

        if not template_path.exists():
            return jsonify({'success': False, 'error': 'Template não encontrado'}), 404

        return send_file(
            template_path,
            mimetype='text/csv',
            as_attachment=True,
            download_name='template_veiculos.csv'
        )
    except Exception as e:
        print(f"[API] Erro ao enviar template: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


# ══════════════════════════════════════════════════════════════════════════════
# SISTEMA DE STATUS DE ENTREGA COM DISPARO PARA CLIENTE
# ══════════════════════════════════════════════════════════════════════════════

@bp.route('/entrega/status/atualizar', methods=['POST'])
def atualizar_status_entrega():
    """
    Atualiza status de entrega e dispara mensagem para o cliente via WhatsApp

    Body: {
        "entrega_id": 123,
        "empresa_id": 27,
        "novo_status": "saiu_entrega",  # pendente, em_preparacao, saiu_entrega, entregue
        "observacao": "Opcional"
    }
    """
    import sqlite3
    import requests
    from pathlib import Path

    try:
        dados = request.get_json()
        entrega_id = dados.get('entrega_id')
        empresa_id = dados.get('empresa_id')
        novo_status = dados.get('novo_status')
        observacao = dados.get('observacao', '')

        if not all([entrega_id, empresa_id, novo_status]):
            return jsonify({
                'success': False,
                'error': 'entrega_id, empresa_id e novo_status são obrigatórios'
            }), 400

        # Status válidos
        status_validos = ['pendente', 'em_preparacao', 'saiu_entrega', 'entregue', 'cancelado']
        if novo_status not in status_validos:
            return jsonify({
                'success': False,
                'error': f'Status inválido. Use: {", ".join(status_validos)}'
            }), 400

        # Conectar ao banco
        db_path = Path(__file__).resolve().parent.parent.parent / 'vendeai.db'
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Buscar entrega e dados do cliente
        cursor.execute('''
            SELECT id, cliente_nome, cliente_telefone, cliente_whatsapp,
                   endereco_entrega, descricao_itens, status, empresa_id
            FROM entregas
            WHERE id = ? AND empresa_id = ?
        ''', (entrega_id, empresa_id))

        entrega = cursor.fetchone()

        if not entrega:
            conn.close()
            return jsonify({
                'success': False,
                'error': 'Entrega não encontrada'
            }), 404

        cliente_nome = entrega[1] or 'Cliente'
        cliente_whatsapp = entrega[3] or entrega[2]  # Preferir WhatsApp, fallback para telefone
        endereco = entrega[4] or ''
        itens = entrega[5] or ''
        status_anterior = entrega[6]

        # Atualizar status no banco
        cursor.execute('''
            UPDATE entregas
            SET status = ?
            WHERE id = ? AND empresa_id = ?
        ''', (novo_status, entrega_id, empresa_id))

        conn.commit()
        conn.close()

        # Mensagens por status - Mesmo padrão das notificações do gerente
        from datetime import datetime
        agora = datetime.now().strftime('%d/%m/%Y %H:%M')

        itens_limpo = itens.strip() if itens else 'Itens do pedido'
        endereco_limpo = endereco.strip() if endereco else 'Endereco a confirmar'

        mensagens_status = {
            'pendente': f"""📦 *PEDIDO CONFIRMADO!*

📅 {agora}

👤 *Cliente:* {cliente_nome}

🛒 *Itens:*
{itens_limpo}

⏳ *Status:* Aguardando preparacao

_Voce recebera atualizacoes por aqui!_""",

            'em_preparacao': f"""🔧 *PEDIDO EM PREPARACAO!*

📅 {agora}

👤 *Cliente:* {cliente_nome}

🛒 *Itens:*
{itens_limpo}

⏳ *Status:* Separando seus produtos

_Em breve sai pra entrega!_""",

            'saiu_entrega': f"""🚚 *PEDIDO A CAMINHO!*

📅 {agora}

👤 *Cliente:* {cliente_nome}

📍 *Endereco:*
{endereco_limpo}

🛒 *Itens:*
{itens_limpo}

✅ *Status:* Saiu para entrega

_Nosso entregador esta indo ate voce!_""",

            'entregue': f"""✅ *PEDIDO ENTREGUE!*

📅 {agora}

👤 *Cliente:* {cliente_nome}

📍 *Local:*
{endereco_limpo}

🛒 *Itens:*
{itens_limpo}

🎉 *Status:* Entregue com sucesso

_Obrigado pela preferencia!_""",

            'cancelado': f"""❌ *PEDIDO CANCELADO*

📅 {agora}

👤 *Cliente:* {cliente_nome}

🛒 *Itens:*
{itens_limpo}

{('📋 *Motivo:* ' + observacao) if observacao else ''}

_Entre em contato se tiver duvidas._"""
        }

        mensagem = mensagens_status.get(novo_status, f"Seu pedido teve o status atualizado para: {novo_status}")

        # Enviar mensagem para o cliente via WhatsApp
        cliente_notificado = False
        gerente_notificado = False
        bot_url = 'http://localhost:3010'

        if cliente_whatsapp:
            try:
                response = requests.post(
                    f'{bot_url}/api/bot/send-notification',
                    json={
                        'empresaId': empresa_id,
                        'telefone': cliente_whatsapp,
                        'mensagem': mensagem
                    },
                    timeout=30
                )
                if response.status_code == 200:
                    cliente_notificado = True
                    print(f"[STATUS-ENTREGA] OK Cliente {cliente_whatsapp} notificado sobre status: {novo_status}")
            except Exception as notif_error:
                print(f"[STATUS-ENTREGA] AVISO Erro ao notificar cliente: {notif_error}")

        # Notificar GERENTE tambem sobre mudanca de status
        try:
            # Buscar WhatsApp do gerente na configuracao da empresa
            db_path = Path(__file__).resolve().parent.parent.parent / 'vendeai.db'
            conn_gerente = sqlite3.connect(db_path)
            cursor_gerente = conn_gerente.cursor()
            cursor_gerente.execute('''
                SELECT numero_gerente FROM empresas WHERE id = ?
            ''', (empresa_id,))
            result_gerente = cursor_gerente.fetchone()
            conn_gerente.close()

            telefone_gerente = result_gerente[0] if result_gerente else None

            if telefone_gerente:
                # Mensagem para o gerente - inclui info que eh status de entrega
                status_emoji = {
                    'pendente': '📦',
                    'em_preparacao': '🔧',
                    'saiu_entrega': '🚚',
                    'entregue': '✅',
                    'cancelado': '❌'
                }

                status_texto = {
                    'pendente': 'Pedido Confirmado',
                    'em_preparacao': 'Em Preparacao',
                    'saiu_entrega': 'Saiu para Entrega',
                    'entregue': 'Entregue',
                    'cancelado': 'Cancelado'
                }

                emoji = status_emoji.get(novo_status, '📋')
                texto_status = status_texto.get(novo_status, novo_status)

                mensagem_gerente = f"""{emoji} *STATUS DE ENTREGA*

📅 {agora}

📋 *Entrega #{entrega_id}*

👤 *Cliente:* {cliente_nome}
📱 *Telefone:* {cliente_whatsapp or 'N/A'}

📍 *Endereco:*
{endereco_limpo}

🛒 *Itens:*
{itens_limpo}

🔄 *Status:* {texto_status}

{'✅ Cliente notificado' if cliente_notificado else '⚠️ Cliente nao notificado'}"""

                response_gerente = requests.post(
                    f'{bot_url}/api/bot/send-notification',
                    json={
                        'empresaId': empresa_id,
                        'telefone': telefone_gerente,
                        'mensagem': mensagem_gerente
                    },
                    timeout=30
                )
                if response_gerente.status_code == 200:
                    gerente_notificado = True
                    print(f"[STATUS-ENTREGA] OK Gerente {telefone_gerente} notificado sobre status: {novo_status}")
        except Exception as gerente_error:
            print(f"[STATUS-ENTREGA] AVISO Erro ao notificar gerente: {gerente_error}")

        return jsonify({
            'success': True,
            'message': 'Status atualizado com sucesso',
            'data': {
                'entrega_id': entrega_id,
                'status_anterior': status_anterior,
                'novo_status': novo_status,
                'cliente_notificado': cliente_notificado,
                'gerente_notificado': gerente_notificado,
                'cliente_whatsapp': cliente_whatsapp
            }
        })

    except Exception as e:
        print(f"[STATUS-ENTREGA] ERRO: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@bp.route('/entrega/status/<int:entrega_id>', methods=['GET'])
def get_status_entrega(entrega_id):
    """Obtém status atual de uma entrega"""
    import sqlite3
    from pathlib import Path

    try:
        empresa_id = request.args.get('empresa_id')

        db_path = Path(__file__).resolve().parent.parent.parent / 'vendeai.db'
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        query = 'SELECT id, cliente_nome, cliente_telefone, status, endereco_entrega, descricao_itens, criado_em FROM entregas WHERE id = ?'
        params = [entrega_id]

        if empresa_id:
            query += ' AND empresa_id = ?'
            params.append(empresa_id)

        cursor.execute(query, params)
        entrega = cursor.fetchone()
        conn.close()

        if not entrega:
            return jsonify({'success': False, 'error': 'Entrega não encontrada'}), 404

        return jsonify({
            'success': True,
            'data': {
                'id': entrega[0],
                'cliente_nome': entrega[1],
                'cliente_telefone': entrega[2],
                'status': entrega[3],
                'endereco': entrega[4],
                'itens': entrega[5],
                'criado_em': entrega[6]
            }
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/entregas/empresa/<int:empresa_id>', methods=['GET'])
def listar_entregas_empresa(empresa_id):
    """Lista todas as entregas de uma empresa"""
    import sqlite3
    from pathlib import Path

    try:
        status_filtro = request.args.get('status')

        db_path = Path(__file__).resolve().parent.parent.parent / 'vendeai.db'
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        query = '''
            SELECT id, cliente_nome, cliente_telefone, cliente_whatsapp,
                   status, endereco_entrega, descricao_itens, valor_pedido,
                   data_agendada, hora_agendada, criado_em
            FROM entregas
            WHERE empresa_id = ?
        '''
        params = [empresa_id]

        if status_filtro:
            query += ' AND status = ?'
            params.append(status_filtro)

        query += ' ORDER BY created_at DESC LIMIT 100'

        cursor.execute(query, params)
        entregas = cursor.fetchall()
        conn.close()

        resultado = []
        for e in entregas:
            resultado.append({
                'id': e[0],
                'cliente_nome': e[1],
                'cliente_telefone': e[2],
                'cliente_whatsapp': e[3],
                'status': e[4],
                'endereco': e[5],
                'itens': e[6],
                'valor': e[7],
                'data_agendada': e[8],
                'hora_agendada': e[9],
                'criado_em': e[10]
            })

        return jsonify({
            'success': True,
            'total': len(resultado),
            'entregas': resultado
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/docs')
def docs():
    """Documentação da API"""
    return jsonify({
        'version': '1.0.0',
        'endpoints': {
            '/api/stats': 'GET - Estatísticas gerais (requer autenticação)',
            '/api/stats/<empresa_id>': 'GET - Estatísticas por empresa',
            '/api/bot-config/<empresa_id>': 'GET - Configuração do bot',
            '/api/empresa/check-setup/<empresa_id>': 'GET - Status de setup da empresa',
            '/api/empresa/bot/toggle': 'POST - Ativar/Desativar bot (Body: {"empresa_id": 5, "bot_ativo": true})',
            '/api/leads': 'GET - Lista de leads',
            '/api/whatsapp/status': 'GET - Status WhatsApp',
            '/api/empresa/nicho': 'GET - Nicho da empresa',
            '/api/empresa/info': 'GET - Informações da empresa + bot',
            '/api/entrega/status/atualizar': 'POST - Atualiza status e notifica cliente',
            '/api/entrega/status/<id>': 'GET - Status de uma entrega',
            '/api/entregas/empresa/<id>': 'GET - Lista entregas da empresa'
        }
    })
